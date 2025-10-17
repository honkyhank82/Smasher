# Automatic App Updates Setup Guide

This guide covers two approaches for implementing automatic app updates in the Smasher app:
1. **React Native CodePush** (Microsoft AppCenter) - Recommended for production
2. **Expo Updates** - Simpler alternative for Expo-based apps

## Option 1: React Native CodePush (Recommended)

CodePush allows you to push JavaScript and asset updates directly to users without going through the app store.

### Step 1: Install CodePush

```powershell
cd app-rn
npm install --save react-native-code-push
```

### Step 2: Create AppCenter Account

1. Go to https://appcenter.ms/
2. Sign up for a free account
3. Create a new app for Android: `Smasher-Android`
4. Create a new app for iOS: `Smasher-iOS` (if needed)

### Step 3: Get Deployment Keys

In AppCenter:
1. Go to your app → Distribute → CodePush
2. You'll see two deployment keys:
   - **Staging** - for testing updates
   - **Production** - for live users

### Step 4: Configure Android

**File: `android/app/build.gradle`**

Add at the top:
```gradle
apply from: "../../node_modules/react-native-code-push/android/codepush.gradle"
```

Add in `defaultConfig`:
```gradle
android {
    defaultConfig {
        // ... existing config
        resValue "string", "CodePushDeploymentKey", '""'
    }
    
    buildTypes {
        debug {
            // Use staging key for debug builds
            resValue "string", "CodePushDeploymentKey", '"YOUR-STAGING-KEY-HERE"'
        }
        release {
            // Use production key for release builds
            resValue "string", "CodePushDeploymentKey", '"YOUR-PRODUCTION-KEY-HERE"'
        }
    }
}
```

**File: `android/app/src/main/java/com/smasher/app/MainApplication.java`**

Add imports:
```java
import com.microsoft.codepush.react.CodePush;
```

Override `getJSBundleFile`:
```java
@Override
protected String getJSBundleFile() {
    return CodePush.getJSBundleFile();
}
```

### Step 5: Configure iOS (if applicable)

**File: `ios/Podfile`**
```ruby
pod 'CodePush', :path => '../node_modules/react-native-code-push'
```

Run:
```bash
cd ios && pod install
```

**File: `ios/SmasherApp/Info.plist`**
```xml
<key>CodePushDeploymentKey</key>
<string>YOUR-IOS-PRODUCTION-KEY</string>
```

### Step 6: Integrate CodePush in App

Update `App.tsx`:

```typescript
import React, { useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CodePush from 'react-native-code-push';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

function App() {
  useEffect(() => {
    // Check for updates on app start
    CodePush.sync({
      updateDialog: {
        title: 'Update Available',
        optionalUpdateMessage: 'A new version is available. Would you like to update?',
        optionalInstallButtonLabel: 'Update',
        optionalIgnoreButtonLabel: 'Later',
      },
      installMode: CodePush.InstallMode.IMMEDIATE,
    });
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

// Wrap App with CodePush
const codePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
  installMode: CodePush.InstallMode.ON_NEXT_RESUME,
  minimumBackgroundDuration: 60 * 10, // 10 minutes
};

export default CodePush(codePushOptions)(App);
```

### Step 7: Deploy Updates

Install AppCenter CLI:
```powershell
npm install -g appcenter-cli
```

Login:
```powershell
appcenter login
```

Release an update:
```powershell
# For Android
appcenter codepush release-react -a YOUR_USERNAME/Smasher-Android -d Production

# For iOS
appcenter codepush release-react -a YOUR_USERNAME/Smasher-iOS -d Production

# With specific description
appcenter codepush release-react -a YOUR_USERNAME/Smasher-Android -d Production --description "Bug fixes and performance improvements"

# Mandatory update (forces users to update)
appcenter codepush release-react -a YOUR_USERNAME/Smasher-Android -d Production -m
```

### Step 8: Test Updates

1. Build and install the app on your device
2. Make a small change (e.g., change a text string)
3. Release update: `appcenter codepush release-react -a YOUR_USERNAME/Smasher-Android -d Staging`
4. Close and reopen the app
5. You should see the update dialog

---

## Option 2: Expo Updates (Simpler Alternative)

If you're using Expo or want a simpler solution, use Expo Updates.

### Step 1: Install Expo Updates

```powershell
cd app-rn
npm install expo-updates
```

### Step 2: Configure

**File: `app.json`**
```json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/YOUR_PROJECT_ID"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

### Step 3: Update App.tsx

```typescript
import React, { useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

function App() {
  useEffect(() => {
    async function checkForUpdates() {
      if (!__DEV__) {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            Alert.alert(
              'Update Available',
              'A new version has been downloaded. Restart the app to apply updates.',
              [
                { text: 'Later', style: 'cancel' },
                { text: 'Restart', onPress: () => Updates.reloadAsync() },
              ]
            );
          }
        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      }
    }

    checkForUpdates();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### Step 4: Publish Updates

```powershell
# Build and publish update
eas update --branch production --message "Bug fixes"
```

---

## Comparison

| Feature | CodePush | Expo Updates |
|---------|----------|--------------|
| Setup Complexity | Medium | Easy |
| Update Size | Smaller | Larger |
| Platform Support | RN only | Expo/RN |
| Free Tier | Yes | Yes |
| Analytics | Built-in | Limited |
| Rollback | Easy | Possible |
| Best For | Production apps | Expo-based apps |

---

## Best Practices

### 1. Update Frequency
- **Don't spam users** - Only push critical updates
- **Test thoroughly** - Always test in staging first
- **Bundle updates** - Group multiple fixes into one update

### 2. Update Strategy
```typescript
// Silent updates (background)
CodePush.sync({
  installMode: CodePush.InstallMode.ON_NEXT_RESUME,
  minimumBackgroundDuration: 60 * 10, // 10 minutes
});

// Mandatory updates (critical fixes)
CodePush.sync({
  updateDialog: {
    mandatoryUpdateMessage: 'A critical update is required.',
    mandatoryContinueButtonLabel: 'Update Now',
  },
  installMode: CodePush.InstallMode.IMMEDIATE,
});
```

### 3. Version Management
- Increment `versionCode` in `build.gradle` for native changes
- Use CodePush for JS/asset changes only
- Keep track of what's deployed to each environment

### 4. Monitoring
```typescript
CodePush.sync(
  {
    updateDialog: true,
    installMode: CodePush.InstallMode.IMMEDIATE,
  },
  (status) => {
    switch (status) {
      case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
        console.log('Downloading update...');
        break;
      case CodePush.SyncStatus.INSTALLING_UPDATE:
        console.log('Installing update...');
        break;
      case CodePush.SyncStatus.UPDATE_INSTALLED:
        console.log('Update installed!');
        break;
    }
  },
  ({ receivedBytes, totalBytes }) => {
    console.log(`Downloaded ${receivedBytes} of ${totalBytes} bytes`);
  }
);
```

### 5. Rollback Plan
```powershell
# Rollback to previous version
appcenter codepush rollback -a YOUR_USERNAME/Smasher-Android Production

# Promote staging to production
appcenter codepush promote -a YOUR_USERNAME/Smasher-Android -s Staging -d Production
```

---

## Automated Update Workflow

Create a script for easy updates:

**File: `scripts/deploy-update.ps1`**
```powershell
param(
    [string]$message = "Bug fixes and improvements",
    [switch]$mandatory = $false
)

Write-Host "Deploying CodePush update..." -ForegroundColor Green

$mandatoryFlag = if ($mandatory) { "-m" } else { "" }

# Deploy to staging first
Write-Host "Deploying to Staging..." -ForegroundColor Yellow
appcenter codepush release-react -a YOUR_USERNAME/Smasher-Android -d Staging --description $message $mandatoryFlag

# Ask for confirmation before production
$confirm = Read-Host "Deploy to Production? (y/n)"
if ($confirm -eq "y") {
    Write-Host "Deploying to Production..." -ForegroundColor Yellow
    appcenter codepush release-react -a YOUR_USERNAME/Smasher-Android -d Production --description $message $mandatoryFlag
    Write-Host "Update deployed successfully!" -ForegroundColor Green
}
```

Usage:
```powershell
.\scripts\deploy-update.ps1 -message "Fixed photo upload bug"
.\scripts\deploy-update.ps1 -message "Critical security fix" -mandatory
```

---

## Troubleshooting

### Updates Not Appearing
1. Check deployment key is correct
2. Verify app version matches
3. Check network connectivity
4. Look at AppCenter logs

### Build Errors
1. Clear cache: `npx react-native start --reset-cache`
2. Clean build: `cd android && .\gradlew clean`
3. Reinstall dependencies: `npm install`

### Rollback Not Working
1. Check AppCenter dashboard
2. Verify deployment name
3. Use `--target-binary-version` flag

---

## Next Steps

1. Choose CodePush or Expo Updates based on your needs
2. Set up AppCenter account and get deployment keys
3. Integrate into your app
4. Test with staging deployment
5. Set up automated deployment scripts
6. Monitor update adoption in AppCenter analytics

**Recommendation**: For Smasher, use **React Native CodePush** as it provides better control, analytics, and is production-ready for pure React Native apps.
