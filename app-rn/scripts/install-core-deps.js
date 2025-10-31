const { execSync } = require('child_process');

console.log('Installing core dependencies...');

// Core dependencies to install first
const coreDependencies = [
  // Core React Native
  'react@18.2.0',
  'react-native@0.73.4',
  'react-dom@18.2.0',
  'react-native-web@~0.19.6',
  
  // Navigation
  '@react-navigation/native@6.1.9',
  '@react-navigation/stack@6.3.20',
  'react-native-gesture-handler@~2.14.0',
  'react-native-reanimated@~3.6.0',
  'react-native-screens@~3.29.0',
  'react-native-safe-area-context@4.8.2',
  
  // Expo
  'expo@~50.0.0',
  'expo-constants@~15.0.0',
  'expo-device@~5.9.0',
  'expo-application@~5.9.0',
  
  // Networking
  'axios@1.6.2',
  
  // TypeScript
  'typescript@5.3.2',
  '@types/node@20.10.5',
  '@types/react@18.2.45',
  '@types/react-native@0.72.8',
  
  // Sentry
  '@sentry/react-native@5.15.0',
  'sentry-expo@~7.0.0',
];

// Install dependencies
function installDependencies() {
  try {
    console.log('Installing core dependencies with npm...');
    
    // Install each dependency one by one to avoid conflicts
    for (const dep of coreDependencies) {
      console.log(`Installing ${dep}...`);
      execSync(`npm install --legacy-peer-deps ${dep}`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    }
    
    console.log('Core dependencies installed successfully!');
  } catch (error) {
    console.error('Failed to install dependencies:', error);
    process.exit(1);
  }
}

// Run the installation
installDependencies();
