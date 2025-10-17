# Build Troubleshooting Guide

## Common Build Errors and Solutions

### Error: "Cannot find module 'invariant'"

**Problem:** Missing `invariant` dependency required by React Native codegen.

**Solution:**
```powershell
cd app-rn
npm install invariant --save-dev
.\build-apk.ps1
```

**Or use the fix script:**
```powershell
cd app-rn
.\fix-build.ps1
.\build-apk.ps1
```

### Error: "Daemon will expire after running out of JVM Metaspace"

**Problem:** Gradle doesn't have enough memory allocated.

**Solution:** Already fixed in `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

If still having issues, increase further:
```properties
org.gradle.jvmargs=-Xmx8192m -XX:MaxMetaspaceSize=2048m
```

### Error: "BUILD FAILED" with no specific error

**Solution 1 - Clean everything:**
```powershell
cd app-rn

# Remove build artifacts
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force android\app\build
Remove-Item -Recurse -Force android\.gradle

# Reinstall
npm install
npm install invariant --save-dev

# Rebuild
cd android
.\gradlew clean
.\gradlew assembleRelease
```

**Solution 2 - Use fix script:**
```powershell
cd app-rn
.\fix-build.ps1
.\build-apk.ps1
```

### Error: "Task failed with an exception"

**Check the specific task that failed** and look for:

1. **Missing dependencies:**
   ```powershell
   npm install
   ```

2. **Corrupted cache:**
   ```powershell
   npm cache clean --force
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

3. **Gradle cache:**
   ```powershell
   cd android
   .\gradlew clean --no-daemon
   .\gradlew assembleRelease --no-daemon
   ```

### Error: "INSTALL_FAILED" when installing APK

**Problem:** Previous version conflicts or signature mismatch.

**Solution:**
```powershell
# Uninstall old version from device first
adb uninstall com.smasherapp

# Then install new version
cd app-rn\android
.\gradlew installRelease
```

### Error: "Unable to load script" when running app

**Problem:** Metro bundler not running or cache issues.

**Solution:**
```powershell
# Terminal 1 - Start Metro with cache reset
cd app-rn
npm start -- --reset-cache

# Terminal 2 - Run app
npm run android
```

### Error: "Could not resolve all files for configuration"

**Problem:** Gradle dependency resolution issues.

**Solution:**
```powershell
cd app-rn\android

# Stop all Gradle daemons
.\gradlew --stop

# Clean and rebuild
.\gradlew clean
.\gradlew assembleRelease --refresh-dependencies
```

## Quick Fixes

### Fix Script (Recommended)

Run this when encountering build issues:
```powershell
cd app-rn
.\fix-build.ps1
```

This will:
- Install missing dependencies
- Clear caches
- Reinstall node_modules
- Clean Android build

### Manual Quick Fix

```powershell
cd app-rn

# 1. Clean
Remove-Item -Recurse -Force node_modules
cd android
.\gradlew clean
cd ..

# 2. Install
npm install
npm install invariant --save-dev

# 3. Build
cd android
.\gradlew assembleRelease
```

## Build Scripts

### build-apk.ps1
Automated build script that:
- Cleans build directories
- Installs dependencies
- Ensures required dev dependencies
- Builds release APK
- Shows APK location and size

### fix-build.ps1
Fixes common build issues:
- Installs missing dependencies
- Clears caches
- Reinstalls node_modules
- Cleans Android build

## Gradle Memory Issues

### Symptoms
- "Out of memory" errors
- "Metaspace" warnings
- Build freezes or crashes

### Solutions

**1. Increase Gradle memory** (already done):
Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

**2. Use Gradle daemon:**
```powershell
# Check daemon status
cd android
.\gradlew --status

# Stop all daemons
.\gradlew --stop

# Build with fresh daemon
.\gradlew assembleRelease
```

**3. Disable parallel builds** (if needed):
Edit `android/gradle.properties`:
```properties
org.gradle.parallel=false
```

## Node/NPM Issues

### Wrong Node version

Check version:
```powershell
node --version  # Should be >= 20
```

If wrong version, install Node 20 or higher from nodejs.org

### NPM cache corrupted

```powershell
npm cache clean --force
npm cache verify
```

### Package-lock conflicts

```powershell
Remove-Item package-lock.json
Remove-Item -Recurse -Force node_modules
npm install
```

## Android SDK Issues

### SDK not found

Set ANDROID_HOME environment variable:
```powershell
$env:ANDROID_HOME = "C:\Users\YourName\AppData\Local\Android\Sdk"
```

Add to PATH:
```powershell
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
$env:PATH += ";$env:ANDROID_HOME\tools"
```

### Build tools version mismatch

Check `android/build.gradle`:
```gradle
buildToolsVersion = "34.0.0"  // Should match your installed version
```

## React Native Issues

### Metro bundler won't start

```powershell
# Kill any existing Metro processes
taskkill /F /IM node.exe

# Start fresh
cd app-rn
npm start -- --reset-cache
```

### Native module linking issues

```powershell
# Clean and reinstall
cd app-rn
Remove-Item -Recurse -Force node_modules
npm install

# Clean Android
cd android
.\gradlew clean
```

## Verification Steps

After fixing issues, verify:

### 1. Dependencies installed
```powershell
cd app-rn
npm list invariant  # Should show installed
```

### 2. Gradle can build
```powershell
cd app-rn\android
.\gradlew tasks  # Should list all tasks
```

### 3. APK builds successfully
```powershell
cd app-rn
.\build-apk.ps1
```

### 4. APK exists
```powershell
Test-Path app-rn\android\app\build\outputs\apk\release\app-release.apk
```

## Getting Help

### Check build logs
```powershell
cd app-rn\android
.\gradlew assembleRelease --stacktrace
.\gradlew assembleRelease --info
.\gradlew assembleRelease --debug
```

### Common log locations
- Gradle: `android/build/reports/`
- NPM: Check console output
- Metro: Check Metro bundler terminal

### Report format
When asking for help, include:
1. Full error message
2. Build command used
3. Node version (`node --version`)
4. NPM version (`npm --version`)
5. Gradle version (`cd android && .\gradlew --version`)
6. Operating system

## Prevention

### Before each build
1. Ensure dependencies are up to date: `npm install`
2. Clean build if making major changes: `.\gradlew clean`
3. Use the build script: `.\build-apk.ps1`

### Regular maintenance
1. Update dependencies monthly
2. Clear caches periodically
3. Keep Node.js updated
4. Keep Android SDK updated

## Quick Reference

| Issue | Command |
|-------|---------|
| Missing dependencies | `npm install invariant --save-dev` |
| Build fails | `.\fix-build.ps1` |
| Out of memory | Edit `gradle.properties` |
| Cache issues | `npm cache clean --force` |
| Clean build | `.\gradlew clean` |
| Full rebuild | `.\build-apk.ps1` |
| Check APK | `Test-Path android\app\build\outputs\apk\release\app-release.apk` |

---

**Most Common Solution:** Run `.\fix-build.ps1` then `.\build-apk.ps1`
