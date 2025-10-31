import React, { useEffect, useCallback, useRef, ComponentType, ErrorInfo, ReactNode } from 'react';
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
  TextStyle
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import * as SystemUI from 'expo-system-ui';
import * as Sentry from '@sentry/react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PremiumProvider } from './src/contexts/PremiumContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import api from './src/services/api';
import './src/config/i18n'; // Initialize i18n
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import NetInfo from '@react-native-community/netinfo';

// Environment variables with fallbacks
const ENV = {
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  API_CONFIG: process.env.API_CONFIG || '{}',
  NODE_ENV: process.env.NODE_ENV || 'development'
} as const;

// Types
type AppError = Error & {
  isOperational?: boolean;
  statusCode?: number;
  code?: string | number;
  extra?: Record<string, unknown>;
};

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent: ComponentType<{ error: AppError; resetError: () => void }>;
  onError?: (error: Error, componentStack: string) => void;
}

interface ErrorFallbackProps {
  error: AppError;
  resetError: () => void;
}

interface Styles {
  errorContainer: StyleProp<ViewStyle>;
  errorTitle: StyleProp<TextStyle>;
  errorText: StyleProp<TextStyle>;
  buttonContainer: StyleProp<ViewStyle>;
  reportButton: StyleProp<ViewStyle>;
}

// Initialize Sentry
if (!__DEV__) {
  Sentry.init({
    dsn: SENTRY_DSN,
    enableInExpoDevelopment: false,
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    release: `smasher@${require('./package.json').version}`,
    tracesSampleRate: 0.2,
  });
}

// Custom error fallback component
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
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
      <Text style={styles.errorText}>
        {error.message || 'An unexpected error occurred'}
      </Text>
      <View style={styles.buttonContainer}>
        <Button onPress={resetError} title="Try again" />
        {!__DEV__ && (
          <View style={styles.reportButton}>
            <Button onPress={handleReportPress} title="Report Error" color="#ff3b30" />
          </View>
        )}
      </View>
    </View>
  );
};

// App initialization function
const initializeApp = async (): Promise<void> => {
  try {
    // Initialize API service health checks
    await api.checkServiceHealth();
    
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
    
    const errorHandler = (error, isFatal) => {
      if (!__DEV__) {
        Sentry.captureException(error, {
          level: isFatal ? 'fatal' : 'error',
        });
      }
      
      if (isFatal) {
        // Show error UI or log to analytics
      }
      
      defaultErrorHandler(error, isFatal);
    };
    
    ErrorUtils.setGlobalHandler(errorHandler);
    
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
      onError={(error, componentStack) => {
        if (!__DEV__) {
          Sentry.withScope(scope => {
            scope.setExtras({ componentStack });
            Sentry.captureException(error);
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

const styles = StyleSheet.create<Styles>({
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
