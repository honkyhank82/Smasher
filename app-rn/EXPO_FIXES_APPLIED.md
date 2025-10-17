# Expo Compatibility Fixes Applied

## 🎯 Overview
Converted app from bare React Native modules to **Expo-managed workflow** for production readiness, automatic updates, and remote deployment.

## ✅ Changes Made

### 1. **Package Dependencies Updated**
Replaced incompatible bare React Native modules with Expo equivalents:

| ❌ Removed (Bare RN) | ✅ Added (Expo) | Purpose |
|---------------------|-----------------|---------|
| `react-native-geolocation-service` | `expo-location` | Location services |
| `react-native-permissions` | `expo-location` (built-in) | Permissions |
| `react-native-image-picker` | `expo-image-picker` | Image/media selection |
| `react-native-video` | `expo-av` | Video playback |

### 2. **Service Files Rewritten**
- **`src/services/LocationService.ts`**: Now uses `expo-location` API
- **`src/services/PermissionsService.ts`**: Now uses Expo permissions system

### 3. **Screen Components Updated**
- **`CreateProfileScreen.tsx`**: Uses `expo-image-picker`
- **`EditProfileScreen.tsx`**: Uses `expo-image-picker`
- **`GalleryScreen.tsx`**: Uses `expo-image-picker` + `expo-av` for video

### 4. **Configuration Files**
- **`tsconfig.json`**: Now extends `expo/tsconfig.base` instead of `@react-native/typescript-config`
- **`app.json`**: Added Expo plugins for location, image-picker, and AV with proper permission messages

### 5. **Expo Updates (OTA) Already Configured** ✅
- Project ID: `edef8952-a01b-408f-abeb-e3922973df75`
- Updates URL: `https://u.expo.dev/edef8952-a01b-408f-abeb-e3922973df75`
- Runtime version: `appVersion` policy
- Check on launch: `ALWAYS`
- App.tsx already has update check logic

## 🚀 Next Steps Required

### **CRITICAL: Install New Dependencies**
```powershell
cd c:\DevProjects\smasher\app-rn
npm install
```

This will install:
- `expo-location@~17.0.1`
- `expo-image-picker@~15.0.7`
- `expo-av@~14.0.7`

### **Rebuild Native Code**
Since we changed native modules, you MUST rebuild:

```powershell
# For Android
npx expo prebuild --clean
npx expo run:android

# Or build with EAS
eas build --profile preview --platform android
```

### **Test Locally**
```powershell
# Start Metro bundler
npx expo start

# Then press 'a' for Android or 'i' for iOS
```

## 📱 Production Deployment

### **Build for Production**
```powershell
# Build production AAB for Google Play
eas build --profile production --platform android

# Build for iOS App Store
eas build --profile production --platform ios
```

### **Publish OTA Update (After Initial Release)**
```powershell
# Publish update to production channel
eas update --branch production --message "Bug fixes and improvements"
```

## 🔧 Configuration Status

### ✅ **Already Configured**
- [x] Expo project setup
- [x] EAS Build configuration (`eas.json`)
- [x] Expo Updates (OTA) enabled
- [x] Android manifest with proper permissions
- [x] App signing configuration
- [x] API endpoints configured

### ⚠️ **Needs Attention**
- [ ] **EAS Submit placeholders** in `eas.json` (lines 43-49):
  - iOS: Update `appleId`, `ascAppId`, `appleTeamId`
  - Android: Add `google-play-service-account.json`
- [ ] **Install new npm packages** (see above)
- [ ] **Rebuild native code** after package installation
- [ ] **Test all features** (location, image upload, video)

## 🐛 Troubleshooting

### "Unable to load script" Error
This happens when Metro bundler isn't running or can't connect:

```powershell
# Clear Metro cache and restart
npx expo start --clear

# Or reset everything
rm -rf node_modules
npm install
npx expo start --clear
```

### TypeScript Errors About Missing Modules
These will resolve after running `npm install`. The errors appear because the packages aren't installed yet.

### Location Not Working
Ensure location permissions are granted:
- Android: Check Settings > Apps > SMASHER > Permissions
- iOS: Check Settings > SMASHER > Location

### Image Upload Fails
1. Check photo library permissions
2. Verify backend API is accessible
3. Check Cloudflare R2 signed URL generation

## 📚 Key Expo Commands

```powershell
# Start development server
npx expo start

# Build preview (internal testing)
eas build --profile preview --platform android

# Build production
eas build --profile production --platform all

# Publish OTA update
eas update --branch production

# Check build status
eas build:list

# View update history
eas update:list
```

## 🎯 Production Checklist

Before publishing to stores:

- [ ] Run `npm install` to get new Expo packages
- [ ] Rebuild app with `eas build --profile production`
- [ ] Test location services on physical device
- [ ] Test image/video upload
- [ ] Test OTA updates work correctly
- [ ] Update `eas.json` with real Apple/Google credentials
- [ ] Increment version in `app.json` and `android/app/build.gradle`
- [ ] Generate signed release build
- [ ] Test on multiple devices/OS versions

## 🔐 Security Notes

- API endpoint: `https://smasher-api.fly.dev` (production)
- All media uploads go through signed URLs (Cloudflare R2)
- Location data only shows approximate distance, never exact coordinates
- Auth tokens stored in AsyncStorage
- Network security config enforces HTTPS

## 📖 Documentation References

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [expo-location](https://docs.expo.dev/versions/latest/sdk/location/)
- [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [expo-av](https://docs.expo.dev/versions/latest/sdk/av/)
