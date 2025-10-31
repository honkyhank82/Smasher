import React, { useEffect, useCallback } from 'react';
import { StatusBar, View, Text, Button, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import * as SystemUI from 'expo-system-ui';
import * as Sentry from '@sentry/react-native';
import { AuthProvider } from './src/context/AuthContext';
import { PremiumProvider } from './src/contexts/PremiumContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import './src/config/i18n'; // Initialize i18n

// Import environment variables
import { SENTRY_DSN } from '@env';

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
const ErrorFallback = ({ error, resetError }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorText}>{error.message}</Text>
    <Button onPress={resetError} title="Try again" />
  </View>
);

function App() {
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

  return (
    <ErrorBoundary fallback={ErrorFallback}>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
});

export default App;
