import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import * as SystemUI from 'expo-system-ui';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import './src/config/i18n'; // Initialize i18n

function App() {
  useEffect(() => {
    // Set navigation bar to transparent for edge-to-edge display
    SystemUI.setBackgroundColorAsync('transparent');
    
    // Check for updates when app starts
    async function checkForUpdates() {
      if (!__DEV__) {
        try {
          console.log('🔍 Checking for updates...');
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            console.log('📥 Update available, downloading...');
            // Download update
            await Updates.fetchUpdateAsync();
            console.log('✅ Update downloaded, reloading app...');
            // Immediately reload the app to apply the update
            await Updates.reloadAsync();
          } else {
            console.log('✅ App is up to date');
          }
        } catch (error) {
          console.log('❌ Error checking for updates:', error);
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
