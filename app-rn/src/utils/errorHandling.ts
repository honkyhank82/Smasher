import { Alert, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { captureException } from '@sentry/react-native';
import { isAxiosError } from 'axios';

type ErrorContext = {
  context?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
  level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
};

export class AppError extends Error {
  public readonly context?: string;
  public readonly extra?: Record<string, unknown>;
  public readonly tags?: Record<string, string>;
  public readonly isOperational: boolean;
  public readonly statusCode?: number;

  constructor(
    message: string,
    {
      context,
      extra,
      tags,
      isOperational = true,
      statusCode,
    }: ErrorContext & { isOperational?: boolean; statusCode?: number } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    this.extra = extra;
    this.tags = tags;
    this.isOperational = isOperational;
    this.statusCode = statusCode;

    // Capture stack trace, excluding constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Error codes
export enum ErrorCode {
  // Network errors (1000-1099)
  NETWORK_ERROR = 1000,
  TIMEOUT_ERROR = 1001,
  SERVER_ERROR = 1002,
  
  // Authentication errors (1100-1199)
  UNAUTHORIZED = 1100,
  INVALID_CREDENTIALS = 1101,
  TOKEN_EXPIRED = 1102,
  
  // Validation errors (1200-1299)
  VALIDATION_ERROR = 1200,
  INVALID_INPUT = 1201,
  
  // Resource errors (1300-1399)
  NOT_FOUND = 1300,
  DUPLICATE_ENTRY = 1301,
  
  // Permission errors (1400-1499)
  PERMISSION_DENIED = 1400,
  RATE_LIMIT_EXCEEDED = 1401,
  
  // Application errors (1500-1599)
  UNKNOWN_ERROR = 1500,
  NOT_IMPLEMENTED = 1501,
  MAINTENANCE_MODE = 1502,
  
  // Third-party service errors (1600-1699)
  THIRD_PARTY_ERROR = 1600,
  PAYMENT_ERROR = 1601,
}

// Error messages
export const ErrorMessages = {
  [ErrorCode.NETWORK_ERROR]: 'Network error occurred. Please check your internet connection.',
  [ErrorCode.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ErrorCode.SERVER_ERROR]: 'Server error occurred. Please try again later.',
  [ErrorCode.UNAUTHORIZED]: 'You need to be logged in to perform this action.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed. Please check your input.',
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided.',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.DUPLICATE_ENTRY]: 'This item already exists.',
  [ErrorCode.PERMISSION_DENIED]: 'You do not have permission to perform this action.',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred.',
  [ErrorCode.NOT_IMPLEMENTED]: 'This feature is not implemented yet.',
  [ErrorCode.MAINTENANCE_MODE]: 'The app is currently under maintenance. Please try again later.',
  [ErrorCode.THIRD_PARTY_ERROR]: 'A third-party service error occurred.',
  [ErrorCode.PAYMENT_ERROR]: 'Payment processing failed. Please try again or contact support.',
};

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private isInitialized = false;
  
  private constructor() {}
  
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  public initialize() {
    if (this.isInitialized) return;
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
    this.isInitialized = true;
  }
  
  private setupGlobalErrorHandlers() {
    // Global error handler for uncaught exceptions
    const defaultErrorHandler = ErrorUtils.getGlobalHandler();
    
    const errorHandler = (error: Error, isFatal?: boolean) => {
      // Log the error
      this.handleError(error, {
        context: 'global',
        level: isFatal ? 'fatal' : 'error',
      });
      
      // Call the default handler
      defaultErrorHandler(error, isFatal);
    };
    
    // Set the global error handler
    ErrorUtils.setGlobalHandler(errorHandler);
    
    // Handle unhandled promise rejections
    if (Platform.OS === 'ios') {
      // @ts-ignore - RN doesn't have this type
      const originalHandler = global.ErrorUtils.getGlobalHandler();
      
      // @ts-ignore
      global.ErrorUtils.setGlobalHandler((error, isFatal) => {
        if (error instanceof Error) {
          errorHandler(error, isFatal);
        } else if (typeof error === 'string') {
          errorHandler(new Error(error), isFatal);
        } else {
          errorHandler(new Error('Unknown error occurred'), isFatal);
        }
        
        // Call the original handler
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }
  }
  
  public handleError(error: unknown, context: ErrorContext = {}): void {
    // Log to console in development
    if (__DEV__) {
      console.error('Error:', error);
      if (context.context) {
        console.error('Context:', context.context);
      }
      if (context.extra) {
        console.error('Extra:', context.extra);
      }
    }
    
    // Handle different types of errors
    if (error instanceof AppError) {
      this.handleAppError(error, context);
    } else if (isAxiosError(error)) {
      this.handleAxiosError(error, context);
    } else if (error instanceof Error) {
      this.handleGenericError(error, context);
    } else if (typeof error === 'string') {
      this.handleGenericError(new Error(error), context);
    } else {
      this.handleGenericError(new Error('An unknown error occurred'), context);
    }
  }
  
  private handleAppError(error: AppError, context: ErrorContext): void {
    const { level = 'error', tags = {}, extra = {} } = context;
    
    // Add error context to Sentry
    if (!__DEV__) {
      Sentry.withScope(scope => {
        // Set the error level
        scope.setLevel(level as any);
        
        // Add tags
        scope.setTags({
          ...error.tags,
          ...tags,
          isOperational: String(error.isOperational),
          errorName: error.name,
        });
        
        // Add extra data
        scope.setExtras({
          ...error.extra,
          ...extra,
          context: error.context || context.context || 'unknown',
          statusCode: error.statusCode,
          stack: error.stack,
        });
        
        // Capture the exception
        Sentry.captureException(error);
      });
    }
    
    // Show user-friendly error message if needed
    if (error.isOperational) {
      this.showUserFriendlyError(error);
    } else {
      // For non-operational errors, show a generic error message
      this.showUserFriendlyError(new AppError(ErrorMessages[ErrorCode.UNKNOWN_ERROR], {
        isOperational: false,
      }));
    }
  }
  
  private handleAxiosError(error: any, context: ErrorContext): void {
    const { response, request, message } = error;
    let errorMessage = message;
    let statusCode: number | undefined;
    let errorCode: ErrorCode = ErrorCode.UNKNOWN_ERROR;
    
    if (response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = response;
      statusCode = status;
      
      // Map HTTP status codes to error codes
      switch (status) {
        case 400:
          errorCode = ErrorCode.VALIDATION_ERROR;
          errorMessage = data?.message || ErrorMessages[ErrorCode.VALIDATION_ERROR];
          break;
        case 401:
          errorCode = ErrorCode.UNAUTHORIZED;
          errorMessage = ErrorMessages[ErrorCode.UNAUTHORIZED];
          break;
        case 403:
          errorCode = ErrorCode.PERMISSION_DENIED;
          errorMessage = ErrorMessages[ErrorCode.PERMISSION_DENIED];
          break;
        case 404:
          errorCode = ErrorCode.NOT_FOUND;
          errorMessage = ErrorMessages[ErrorCode.NOT_FOUND];
          break;
        case 429:
          errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
          errorMessage = ErrorMessages[ErrorCode.RATE_LIMIT_EXCEEDED];
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorCode = ErrorCode.SERVER_ERROR;
          errorMessage = ErrorMessages[ErrorCode.SERVER_ERROR];
          break;
        default:
          errorCode = ErrorCode.UNKNOWN_ERROR;
          errorMessage = data?.message || ErrorMessages[ErrorCode.UNKNOWN_ERROR];
      }
    } else if (request) {
      // The request was made but no response was received
      errorCode = ErrorCode.NETWORK_ERROR;
      errorMessage = ErrorMessages[ErrorCode.NETWORK_ERROR];
    } else if (message?.includes('timeout')) {
      // Handle timeout errors
      errorCode = ErrorCode.TIMEOUT_ERROR;
      errorMessage = ErrorMessages[ErrorCode.TIMEOUT_ERROR];
    }
    
    // Create an AppError instance
    const appError = new AppError(errorMessage, {
      context: context.context || 'axios',
      extra: {
        ...context.extra,
        statusCode,
        response: response?.data,
        request: {
          url: request?.responseURL,
          method: request?._method,
        },
      },
      tags: {
        ...context.tags,
        errorCode: String(errorCode),
        statusCode: statusCode ? String(statusCode) : 'unknown',
      },
      isOperational: errorCode !== ErrorCode.UNKNOWN_ERROR,
      statusCode,
    });
    
    // Handle the error
    this.handleAppError(appError, context);
  }
  
  private handleGenericError(error: Error, context: ErrorContext): void {
    const appError = new AppError(error.message, {
      context: context.context || 'generic',
      extra: {
        ...context.extra,
        originalError: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      },
      tags: {
        ...context.tags,
        errorName: error.name,
      },
      isOperational: false,
    });
    
    this.handleAppError(appError, context);
  }
  
  private showUserFriendlyError(error: AppError): void {
    // Skip showing alerts in development for non-fatal errors
    if (__DEV__ && !error.isOperational) {
      console.warn('Non-operational error in development:', error.message);
      return;
    }
    
    // Don't show alerts for certain error types
    if (error.statusCode === 401) {
      // Handle unauthorized errors (e.g., redirect to login)
      return;
    }
    
    // Show an alert with the error message
    Alert.alert(
      'Error',
      error.message || 'An unexpected error occurred',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ],
      { cancelable: true }
    );
  }
}

// Export a singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Helper function to handle errors
export const handleError = (error: unknown, context?: ErrorContext) => {
  errorHandler.handleError(error, context);
};

// Helper function to create an AppError
export const createError = (
  message: string,
  code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
  options: ErrorContext & { isOperational?: boolean; statusCode?: number } = {}
): AppError => {
  return new AppError(message || ErrorMessages[code], {
    ...options,
    isOperational: options.isOperational ?? true,
    extra: {
      errorCode: code,
      errorName: ErrorCode[code],
      ...options.extra,
    },
    tags: {
      errorCode: String(code),
      ...options.tags,
    },
  });
};
