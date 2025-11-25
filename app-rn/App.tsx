import React, { 
  useEffect, 
  useCallback, 
  useRef, 
  ComponentType, 
  ErrorInfo, 
  ReactNode,
  useMemo,
  useState
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
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import * as SystemUI from 'expo-system-ui';
import * as Sentry from '@sentry/react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ErrorBoundary as ErrorBoundaryComponent } from './src/components/ErrorBoundary';
import { AppError } from './src/utils/errorHandling';
import { PremiumProvider } from './src/contexts/PremiumContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import api from './src/services/api';
import './src/config/i18n';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import NetInfo from '@react-native-community/netinfo';

declare const ErrorUtils: any;

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SENTRY_DSN: string;
      API_CONFIG: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

const ENV = {
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  API_CONFIG: process.env.API_CONFIG || '{}',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEV: __DEV__,
  IS_PRODUCTION: !__DEV__,
} as const;

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

interface FeatureFlags {
  enableNewOnboarding: boolean;
  enableDarkMode: boolean;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
}

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

const initializeSentry = () => {
  if (ENV.IS_DEV) {
    console.log('[Sentry] Running in development mode - Sentry is disabled');
    return;
  }

  try {
    const sentryConfig: any = {
      dsn: ENV.SENTRY_DSN,
      debug: false,
      environment: ENV.NODE_ENV,
      release: `smasher@${require('./package.json').version}`,
      dist: require('./app.json').expo.version,
      enableAutoSessionTracking: true,
      tracesSampleRate: ENV.IS_PRODUCTION ? 0.2 : 1.0,
      attachStacktrace: true,
      maxBreadcrumbs: 50,
      beforeSend: (event: any, hint: any) => {
        if (hint?.originalException instanceof Error) {
          if (hint.originalException.message.includes('Network request failed')) {
            return null;
          }
        }
        return event;
      },
      integrations: [
        new (Sentry as any).ReactNativeTracing({
          tracingOrigins: ['localhost', /^\//, /^https:\/\/api\.smasher\.app/],
        }),
      ],
    };

    Sentry.init(sentryConfig);
    Sentry.configureScope((scope) => {
      scope.setTag('app_version', require('./app.json').expo.version);
      const appJson = require('./app.json');
      const androidVersion = appJson.expo?.android?.versionCode;
      const iosBuild = appJson.expo?.ios?.buildNumber;
      scope.setTag('build_number', iosBuild || androidVersion || 'unknown');
      scope.setTag('device_id', Device.osInternalBuildId || 'unknown');
    });
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
};

initializeSentry();

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
    setShowDetails((prev) => !prev);
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
            {JSON.stringify(
              {
                name: error.name,
                message: error.message,
                stack: error.stack,
              },
              null,
              2,
            )}
          </Text>
        </View>
      )}
    </View>
  );
};

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, componentStack: string) => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback: FallbackComponent,
  onError,
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
      onError={(err: Error, errorInfo: React.ErrorInfo) => {
        setError(err);
        setErrorInfo(errorInfo);
        onError?.(err, errorInfo.componentStack);
      }}
    >
      {children}
    </ErrorBoundaryComponent>
  );
};

const initializeApp = async (): Promise<void> => {
  try {
    const checkApiHealth = useCallback(async (): Promise<boolean> => {
      try {
        const response = await api.get('/health');
        if (response.status >= 400) {
          throw new Error('API service is not healthy');
        }
        return true;
      } catch (error) {
        console.error('API health check failed:', error);
        throw error;
      }
    }, []);

    await checkApiHealth();

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log('Connection type:', state.type);
      console.log('Is connected?', state.isConnected);

      if (state.isConnected) {
        checkApiHealth().catch(console.error);
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

// Main App component that wraps the entire application
const AppContent: React.FC = () => {
  const appState = useRef(AppState.currentState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      cleanup = await initializeApp();
    };

    init();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

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
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground');
        await checkForUpdates();
        if (isAuthenticated) {
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, checkForUpdates]);

  const handleGlobalError = useCallback((error: Error, isFatal?: boolean) => {
    console.error('Global error handler:', error);

    if (__DEV__ && !isFatal) return;

    if (!__DEV__) {
      Sentry.captureException(error, {
        level: isFatal ? 'fatal' : 'error',
        tags: { component: 'App' },
      });
    }

    if (error.name === 'NetworkError') {
      console.warn('Network error occurred');
    }
  }, []);

  useEffect(() => {
    const defaultErrorHandler = ErrorUtils.getGlobalHandler();

    const errorHandler = (error: Error, isFatal?: boolean) => {
      handleGlobalError(error, isFatal);
      defaultErrorHandler(error, isFatal);
    };

    ErrorUtils.setGlobalHandler(errorHandler);

    checkForUpdates();

    const updateInterval = setInterval(checkForUpdates, 12 * 60 * 60 * 1000);

    return () => {
      clearInterval(updateInterval);
      ErrorUtils.setGlobalHandler(defaultErrorHandler);
    };
  }, [handleGlobalError, checkForUpdates]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync('transparent');
  }, []);

  return (
    <ErrorBoundary
      fallback={ErrorFallback}
      onError={(error: Error, componentStack: string) => {
        if (Sentry) {
          Sentry.captureException(error, {
            extra: { componentStack },
          });
    </ErrorBoundary>
  );
};

// Root App component that provides the Auth context to the entire app
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  statusBarSpacer: {
    height: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight,
    backgroundColor: 'transparent',
  },
  offlineContainer: {
    backgroundColor: '#FF3B30',
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default App;

