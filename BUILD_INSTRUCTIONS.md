# Build Instructions for Smasher App

## Quick Build

### Build APK (Automated)

```powershell
cd app-rn
.\build-apk.ps1
```

This script will:
1. Clean Android build directories
2. Install dependencies
3. Build release APK
4. Show APK location and size

### Manual Build Steps

If you prefer manual control:

```powershell
# 1. Navigate to app directory
cd app-rn

# 2. Install dependencies
npm install

# 3. Clean Android build
cd android
.\gradlew clean

# 4. Build release APK
.\gradlew assembleRelease

# 5. APK will be at:
# android\app\build\outputs\apk\release\app-release.apk
```

## Build Variants

### Debug APK (for testing)

```powershell
cd app-rn\android
.\gradlew assembleDebug
```

Output: `android\app\build\outputs\apk\debug\app-debug.apk`

### Release APK (for distribution)

```powershell
cd app-rn\android
.\gradlew assembleRelease
```

Output: `android\app\build\outputs\apk\release\app-release.apk`

### Android App Bundle (for Google Play)

```powershell
cd app-rn\android
.\gradlew bundleRelease
```

Output: `android\app\build\outputs\bundle\release\app-release.aab`

## Run on Device/Emulator

### Android

```powershell
# Start Metro bundler
cd app-rn
npm start

# In another terminal, run on Android
npm run android
```

### iOS (Mac only)

```bash
# Install pods
cd app-rn/ios
pod install

# Run on iOS
cd ..
npm run ios
```

## Clean Build

If you encounter build issues:

```powershell
# Clean everything
cd app-rn
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force android\app\build
Remove-Item -Recurse -Force android\.gradle

# Reinstall and rebuild
npm install
cd android
.\gradlew clean
.\gradlew assembleRelease
```

## Troubleshooting

### "Command not found: gradlew"

Make sure you're in the `android` directory:
```powershell
cd app-rn\android
.\gradlew assembleRelease
```

### "npm install" fails

Clear npm cache:
```powershell
npm cache clean --force
npm install
```

### Build fails with "Out of memory"

Increase Gradle memory in `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

### Metro bundler issues

Reset Metro cache:
```powershell
npm start -- --reset-cache
```

## APK Installation

### Install on connected device

```powershell
cd app-rn\android
.\gradlew installRelease
```

### Manual installation

1. Copy APK to device
2. Enable "Install from unknown sources" in device settings
3. Open APK file on device
4. Follow installation prompts

## Version Management

Update version in `app-rn/android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 2        // Increment for each release
        versionName "1.0.1"  // Semantic versioning
    }
}
```

## Signing Configuration

For production releases, configure signing in `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'password'
            keyAlias 'my-key-alias'
            keyPassword 'password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## Build Optimization

### Reduce APK size

Enable ProGuard in `android/app/build.gradle`:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### Enable separate APKs per architecture

```gradle
android {
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk false
        }
    }
}
```

## CI/CD Integration

### GitHub Actions example

```yaml
name: Build APK

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd app-rn && npm install
      - name: Build APK
        run: cd app-rn/android && ./gradlew assembleRelease
      - name: Upload APK
        uses: actions/upload-artifact@v2
        with:
          name: app-release
          path: app-rn/android/app/build/outputs/apk/release/app-release.apk
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm start` | Start Metro bundler |
| `npm run android` | Run on Android device/emulator |
| `.\gradlew clean` | Clean build |
| `.\gradlew assembleDebug` | Build debug APK |
| `.\gradlew assembleRelease` | Build release APK |
| `.\gradlew bundleRelease` | Build AAB for Play Store |
| `.\gradlew installRelease` | Install release APK on device |

## Next Steps

After building:
1. Test APK on physical device
2. Check app size and performance
3. Run through all features
4. Prepare for distribution (see `GOOGLE_PLAY_PUBLISH.md`)
