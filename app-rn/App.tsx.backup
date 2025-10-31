import React, { 
  useEffect, 
  useCallback, 
  useRef, 
  ComponentType, 
  ErrorInfo, 
  ReactNode,
  useMemo
} from 'react';
import { 
  StatusBar, 
  View, 
  Text, 
  Button, 
  StyleSheet, 
  AppState, 
  AppStateStatus, 
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
  Alert,
  LogBox
} from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import * as SystemUI from 'expo-system-ui';
import * as Sentry from '@sentry/react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ErrorBoundary as ErrorBoundaryComponent } from './src/components/ErrorBoundary';

// Define ErrorFallbackProps interface
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

// Define ErrorBoundary props interface
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, componentStack: string) => void;
}
import { AppError } from './src/utils/errorHandling';
import { PremiumProvider } from './src/contexts/PremiumContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import api from './src/services/api';
import './src/config/i18n'; // Initialize i18n
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import NetInfo from '@react-native-community/netinfo';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SENTRY_DSN: string;
      API_CONFIG: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

// Environment configuration
const ENV = {
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  API_CONFIG: process.env.API_CONFIG || '{}',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEV: __DEV__,
  IS_PRODUCTION: !__DEV__,
} as const;

// App-specific types
interface AppStateType {
  current: AppStateStatus;
  previous: AppStateStatus | null;
  isInForeground: boolean;
}

interface UpdateCheckResult {
  isAvailable: boolean;
  isDownloaded?: boolean;
  version?: string;
  lastChecked?: Date;
}

// Performance metrics
interface AppPerformanceMetrics {
  appStartTime: number;
  jsBundleLoadedTime: number | null;
  timeToInteractive: number | null;
  errors: AppError[];
  networkRequests: {
    url: string;
    startTime: number;
    endTime: number | null;
    status: 'pending' | 'success' | 'error';
  }[];
}

// Feature flags
interface FeatureFlags {
  enableNewOnboarding: boolean;
  enableDarkMode: boolean;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
}

// App configuration
interface AppConfig {
  name: string;
  version: string;
  buildNumber: string;
  environment: 'development' | 'staging' | 'production';
  sentryDsn: string;
  apiBaseUrl: string;
  featureFlags: FeatureFlags;
  isEmulator: boolean;
  isTablet: boolean;
  hasNotch: boolean;
}

// Initialize Sentry with proper configuration
const initializeSentry = () => {
  if (ENV.IS_DEV) {
    console.log('[Sentry] Running in development mode - Sentry is disabled');
    return;
  }

  try {
    const sentryConfig: Sentry.ReactNativeOptions = {
      dsn: ENV.SENTRY_DSN,
      debug: false,
      environment: ENV.NODE_ENV,
      release: `smasher@${require('./package.json').version}`,
      dist: require('./app.json').expo.version,
      enableAutoSessionTracking: true,
      tracesSampleRate: ENV.IS_PRODUCTION ? 0.2 : 1.0,
      attachStacktrace: true,
      maxBreadcrumbs: 50,
      beforeSend: (event, hint) => {
        // Filter out specific errors if needed
        if (hint?.originalException instanceof Error) {
          // Example: Filter out specific error messages
          if (hint.originalException.message.includes('Network request failed')) {
            return null;
          }
        }
        return event;
      },
      integrations: [
        new Sentry.ReactNativeTracing({
          tracingOrigins: ['localhost', /^\//, /^https:\/\/api\.smasher\.app/],
        }),
      ],
    };

    Sentry.init(sentryConfig);
    
    // Configure scope
    Sentry.configureScope(scope => {
      scope.setTag('app_version', require('./app.json').expo.version);
      scope.setTag('build_number', require('./app.json').expo.ios.buildNumber || require('./app.json').expo.android.versionCode);
      scope.setTag('device_id', Device.osInternalBuildId || 'unknown');
    });
    
    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
};

// Initialize Sentry when the app starts
initializeSentry();

// Custom error fallback component with improved error handling and UI
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const [showDetails, setShowDetails] = React.useState(false);
  
  const handleReportError = useCallback(async () => {
    if (ENV.IS_DEV) {
      Alert.alert('Error Report', 'In development mode - error would be reported in production');
      return;
    }
    
    try {
      const eventId = Sentry.captureException(error);
      Alert.alert(
        'Error Reported',
        `Error ID: ${eventId}\n\nThank you for helping us improve the app.`,
        [{ text: 'OK', onPress: resetError }]
      );
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
      Alert.alert(
        'Error',
        'Failed to send error report. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  }, [error, resetError]);
  
  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);
  
  const handleReportPress = async () => {
    if (!__DEV__) {
      const eventId = Sentry.captureException(error);
      alert(`Error reported with ID: ${eventId}`);
    } else {
      alert('In development mode - error would be reported in production');
    }
    resetError();
  };

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorText}>{error.message}</Text>
      <View style={styles.buttonContainer}>
        <Button 
          title="Report Error" 
          onPress={handleReportError} 
          accessibilityLabel="Report this error"
        />
        <Button 
          title="Try Again" 
          onPress={resetError} 
          accessibilityLabel="Try to restart the app"
        />
        <Button 
          onPress={handleReportPress} 
          title="Report Error" 
          color="#FF3B30"
          accessibilityLabel="Report this error to the developers"
        />
      </View>
      <Button
        onPress={toggleDetails}
        title={showDetails ? 'Hide Details' : 'Show Details'}
        color="#8E8E93"
      />
      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Error Details:</Text>
          <Text style={styles.detailsText}>
            {JSON.stringify({
              name: error.name,
              message: error.message,
              code: error.code,
              statusCode: error.statusCode,
              isOperational: error.isOperational,
              stack: error.stack
            }, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );
};

// Custom error boundary component with proper TypeScript types
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback: FallbackComponent,
  onError
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<React.ErrorInfo | null>(null);

  const resetError = useCallback(() => {
    setError(null);
    setErrorInfo(null);
  }, []);

  if (error && errorInfo) {
    return <FallbackComponent error={error} resetError={resetError} />;
  }

  return (
    <ErrorBoundaryComponent
      onError={(err, errorInfo) => {
        setError(err);
        setErrorInfo(errorInfo);
        onError?.(err, errorInfo.componentStack);
      }}
    >
      {children}
    </ErrorBoundaryComponent>
  );
};

// App initialization function
const initializeApp = async (): Promise<void> => {
  try {
    // Initialize API service health checks
    const checkApiHealth = useCallback(async (): Promise<boolean> => {
      try {
        const response = await api.get('/health');
        if (!response.ok) {
          throw new Error('API service is not healthy');
        }
        return true;
      } catch (error) {
        console.error('API health check failed:', error);
        throw error;
      }
    }, []);

    await checkApiHealth();
    
    // Set up network monitoring
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      console.log('Connection type:', state.type);
      console.log('Is connected?', state.isConnected);
      
      if (state.isConnected) {
        // Re-check service health when connection is restored
        api.checkServiceHealth().catch(console.error);
      }
    });

    return () => {
      unsubscribeNetInfo();
      api.cleanup();
    };
  } catch (error) {
    console.error('App initialization error:', error);
    Sentry.captureException(error);
  }
};

const App: React.FC = () => {
  const appState = useRef(AppState.currentState);
  const { isAuthenticated } = useAuth();
  
  // Initialize app
  useEffect(() => {
    const init = async () => {
      const cleanup = await initializeApp();
      return cleanup;
    };
    
    let cleanup: (() => void) | undefined;
    
    init().then(cb => {
      cleanup = cb;
    });
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);
  
  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        console.log('App has come to the foreground');
        await checkForUpdates();
        if (isAuthenticated) {
          // Refresh user data or perform other foreground tasks
        }
      }
      
      appState.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);
  
  const checkForUpdates = useCallback(async () => {
    if (__DEV__) return;
    
    try {
      Sentry.addBreadcrumb({
        category: 'update',
        message: 'Checking for updates',
        level: 'info',
      });
      
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        Sentry.addBreadcrumb({
          category: 'update',
          message: 'Update available, downloading...',
          level: 'info',
        });
        
        await Updates.fetchUpdateAsync();
        
        Sentry.addBreadcrumb({
          category: 'update',
          message: 'Update downloaded, reloading app',
          level: 'info',
        });
        
        await Updates.reloadAsync();
      } else {
        Sentry.addBreadcrumb({
          category: 'update',
          message: 'App is up to date',
          level: 'info',
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      Sentry.captureException(error, {
        tags: { update: 'check-failed' },
      });
    }
  }, []);
  
  useEffect(() => {
    // Set navigation bar to transparent for edge-to-edge display
    SystemUI.setBackgroundColorAsync('transparent');
    
    // Set up global error handler
    const defaultErrorHandler = ErrorUtils.getGlobalHandler();
    
    const handleError = (error: Error, isFatal: boolean = false): void => {
      handleGlobalError(error, isFatal);
      defaultErrorHandler(error, isFatal);
    };
    
    ErrorUtils.setGlobalHandler(handleError);
    
    // Check for updates
    checkForUpdates();
    
    // Set up periodic update checks (every 12 hours)
    const updateInterval = setInterval(checkForUpdates, 12 * 60 * 60 * 1000);
    
    return () => clearInterval(updateInterval);
  }, [checkForUpdates]);

  // Global error handler
  const handleGlobalError = useCallback((error: Error, isFatal?: boolean) => {
    console.error('Global error handler:', error);
    
    // Skip non-fatal errors in development
    if (__DEV__ && !isFatal) return;
    
    // Capture error in Sentry
    if (!__DEV__) {
      Sentry.captureException(error, {
        level: isFatal ? 'fatal' : 'error',
        tags: { component: 'App' }
      });
    }
    
    // Handle specific error types
    if (error.name === 'NetworkError') {
      // Show network error UI
      console.warn('Network error occurred');
    }
  }, []);
  
  // Set up global error handler
  useEffect(() => {
    const defaultErrorHandler = ErrorUtils.getGlobalHandler();
    
    const errorHandler = (error: Error, isFatal?: boolean) => {
      handleGlobalError(error, isFatal);
      defaultErrorHandler(error, isFatal);
    };
    
    ErrorUtils.setGlobalHandler(errorHandler);
    
    return () => {
      ErrorUtils.setGlobalHandler(defaultErrorHandler);
    };
  }, [handleGlobalError]);

  return (
    <ErrorBoundary 
      fallback={ErrorFallback}
      onError={(error: Error, componentStack: string) => {
        if (Sentry) {
          Sentry.captureException(error, {
            extra: { componentStack }
          });
        }
      }}
    >
      <Sentry.TouchEventBoundary>
        <SafeAreaProvider>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="transparent" 
            translucent={true}
          />
          <AuthProvider>
            <PremiumProvider>
              <AppNavigator />
            </PremiumProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </Sentry.TouchEventBoundary>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  // Base styles
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Error boundary styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F7',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1C1C1E',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#3A3A3C',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  errorCode: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    paddingHorizontal: 20,
  },
  reportButton: {
    marginTop: 12,
    marginBottom: 12,
  },
  detailsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
    width: '90%',
    maxWidth: 400,
  },
  detailsTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  detailsText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#3A3A3C',
    lineHeight: 16,
  },
  
  // App container styles
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  
  // Status bar safe area
  statusBarSpacer: {
    height: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight,
    backgroundColor: 'transparent',
  },
  
  // Network status indicator
  offlineContainer: {
    backgroundColor: '#FF3B30',
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 12,
  }
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 25,
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '80%',
    maxWidth: 300,
  },
  reportButton: {
    marginTop: 15,
  },
});

export default App;
