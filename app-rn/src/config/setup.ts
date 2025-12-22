import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { errorHandler } from '../utils/errorHandling';
import { AppState } from 'react-native';

// Types
type AppConfig = {
  /**
   * The name of the app
   */
  appName: string;
  
  /**
   * The current environment (development, staging, production)
   */
  environment: 'development' | 'staging' | 'production';
  
  /**
   * The app version (e.g., '1.0.0')
   */
  version: string;
  
  /**
   * The build number (e.g., '1')
   */
  buildNumber: string;
  
  /**
   * Whether the app is running in development mode
   */
  isDev: boolean;
  
  /**
   * Whether the app is running in production mode
   */
  isProduction: boolean;
  
  /**
   * The platform the app is running on (ios, android, web)
   */
  platform: 'ios' | 'android' | 'web';
  
  /**
   * The base URL for API requests
   */
  apiUrl: string;
  
  /**
   * Sentry DSN for error tracking
   */
  sentryDsn?: string;
  
  /**
   * Whether analytics are enabled
   */
  analyticsEnabled: boolean;
  
  /**
   * Whether debug mode is enabled
   */
  debug: boolean;
};

// Default configuration
const defaultConfig: AppConfig = {
  appName: 'Smasher',
  environment: 'development',
  version: '1.0.0',
  buildNumber: '1',
  isDev: true,
  isProduction: false,
  platform: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
  apiUrl: 'http://localhost:3000',
  analyticsEnabled: false,
  debug: true,
};

// Initialize the app configuration
let appConfig: AppConfig = { ...defaultConfig };

/**
 * Initialize the app configuration
 * @param overrides - Optional configuration overrides
 */
export const initializeApp = (overrides: Partial<AppConfig> = {}): AppConfig => {
  // Apply overrides
  appConfig = {
    ...defaultConfig,
    ...overrides,
  };
  
  // Set up environment-specific configuration
  setupEnvironment();
  
  // Initialize error handling
  initializeErrorHandling();
  
  // Set up app state listeners
  setupAppStateListeners();
  
  return appConfig;
};

/**
 * Get the current app configuration
 */
export const getConfig = (): AppConfig => appConfig;

/**
 * Set up environment-specific configuration
 */
const setupEnvironment = () => {
  // Set up environment variables from .env file if using react-native-dotenv
  // This requires the babel plugin to be properly configured
  if (process.env.NODE_ENV === 'production') {
    appConfig.environment = 'production';
    appConfig.isDev = false;
    appConfig.isProduction = true;
    appConfig.debug = false;
    appConfig.analyticsEnabled = true;
  } else if (process.env.NODE_ENV === 'staging') {
    appConfig.environment = 'staging';
    appConfig.isDev = false;
    appConfig.isProduction = false;
    appConfig.debug = true;
    appConfig.analyticsEnabled = true;
  }
  
  // Set up API URL based on environment
  if (appConfig.environment === 'production') {
    appConfig.apiUrl = 'https://api.smasher.app';
  } else if (appConfig.environment === 'staging') {
    appConfig.apiUrl = 'https://staging.api.smasher.app';
  }
  
  // Set Sentry DSN based on environment
  if (appConfig.environment === 'production') {
    appConfig.sentryDsn = 'YOUR_PRODUCTION_SENTRY_DSN';
  } else if (appConfig.environment === 'staging') {
    appConfig.sentryDsn = 'YOUR_STAGING_SENTRY_DSN';
  }
};

/**
 * Initialize error handling with Sentry
 */
const initializeErrorHandling = () => {
  // Initialize error handler
  errorHandler.initialize();
  
  // Initialize Sentry if DSN is provided
  if (appConfig.sentryDsn && !appConfig.isDev) {
    try {
      const SentryAny = Sentry as any;
      SentryAny.init({
        dsn: appConfig.sentryDsn,
        environment: appConfig.environment,
        release: `${appConfig.appName}@${appConfig.version}+${appConfig.buildNumber}`,
        enableAutoSessionTracking: true,
        tracesSampleRate: appConfig.environment === 'production' ? 0.1 : 1.0,
        enabled: !appConfig.isDev,
        debug: appConfig.debug,
        defaultIntegrations: false,
        integrations: [
          new SentryAny.ReactNativeTracing({
            routingInstrumentation: new SentryAny.ReactNavigationInstrumentation(),
            enableAppStartTracking: appConfig.environment === 'production',
            enableAutoPerformanceTracking: !appConfig.isDev,
          }),
          new SentryAny.ReactNativeErrorHandlers({
            onerror: false,
            onunhandledrejection: true,
          }),
        ],
      });
      
      // Set user context if available
      // This would typically be set after user logs in
      // Sentry.setUser({ id: 'user123', email: 'user@example.com' });
      
      console.log('Sentry initialized');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }
};

/**
 * Set up app state listeners
 */
const setupAppStateListeners = () => {
  let appState = AppState.currentState;
  
  const handleAppStateChange = (nextAppState: any) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      console.log('App has come to the foreground');
      
      // Refresh data or perform other actions when app comes to foreground
      // For example: check for updates, refresh auth tokens, etc.
    } else if (nextAppState.match(/inactive|background/)) {
      // App has gone to the background
      console.log('App has gone to the background');
      
      // Save state or perform cleanup
    }
    
    appState = nextAppState;
  };
  
  // Subscribe to app state changes
  const subscription = AppState.addEventListener('change', handleAppStateChange);
  
  // Return cleanup function
  return () => {
    subscription.remove();
  };
};

/**
 * Get the current environment
 */
export const getEnvironment = (): string => appConfig.environment;

/**
 * Check if the app is running in development mode
 */
export const isDev = (): boolean => appConfig.isDev;

/**
 * Check if the app is running in production mode
 */
export const isProduction = (): boolean => appConfig.isProduction;

/**
 * Get the API base URL
 */
export const getApiUrl = (): string => appConfig.apiUrl;

/**
 * Get the app version
 */
export const getVersion = (): string => appConfig.version;

/**
 * Get the build number
 */
export const getBuildNumber = (): string => appConfig.buildNumber;

// Export default configuration
export default appConfig;
