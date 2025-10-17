import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import * as SystemUI from 'expo-system-ui';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

function App() {
  useEffect(() => {
    // Set navigation bar to transparent for edge-to-edge display
    SystemUI.setBackgroundColorAsync('transparent');
    
    // Check for updates when app starts
    async function checkForUpdates() {
      if (!__DEV__) {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            // Reload the app to apply the update
            await Updates.reloadAsync();
          }
        } catch (error) {
          console.log('Error checking for updates:', error);
        }
      }
    }
    
    checkForUpdates();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="transparent" 
          translucent={true}
        />
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
