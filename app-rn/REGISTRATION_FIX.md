# App Registration Fix Applied

## 🐛 Problem

The app was showing this error:
```
ERROR [Invariant Violation: "SMASHER" has not been registered.]
```

## 🔍 Root Cause

**Mismatch between Android native code and JavaScript registration:**

- **Android MainActivity**: Was looking for component named `"SMASHER"`
- **Expo registerRootComponent**: Registers component as `"main"`

This is a common issue when converting from bare React Native to Expo.

## ✅ Fixes Applied

### 1. **Fixed MainActivity.kt**
Changed the main component name to match Expo's convention:

**File**: `android/app/src/main/java/com/smasher/app/MainActivity.kt`

```kotlin
// BEFORE
override fun getMainComponentName(): String = "SMASHER"

// AFTER
override fun getMainComponentName(): String = "main"
```

### 2. **Replaced Deprecated expo-av**
The warning showed `expo-av` is deprecated in SDK 54.

**Removed**: `expo-av@~16.0.7`  
**Added**: `expo-video@latest`

**Updated files**:
- `app.json` - Changed plugin from `expo-av` to `expo-video`
- `src/screens/GalleryScreen.tsx` - Simplified video thumbnail display

### 3. **Rebuilt Native Code**
Ran `npx expo prebuild --clean` to regenerate Android native code with correct configuration.

## 📱 How Expo Registration Works

Expo uses a standard registration pattern:

```javascript
// index.js
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

This internally calls:
```javascript
AppRegistry.registerComponent('main', () => App);
```

The native code must match this by requesting component name `"main"`.

## 🔧 Why This Happened

When you initially set up the project, it may have been:
1. Created as bare React Native (custom app name)
2. Later converted to Expo
3. Native code wasn't updated to match Expo's conventions

## ✅ Verification

After the rebuild completes, the app should:
- ✅ Launch without registration errors
- ✅ Show no expo-av deprecation warnings
- ✅ Load the main App component correctly

## 🚀 Next Steps

1. **Wait for build to complete** (currently running)
2. **Test the app** on device/emulator
3. **Verify all features work**:
   - Location services
   - Image picker
   - Video upload (now using expo-video)
   - Chat functionality

## 📝 Additional Notes

### **expo-av Deprecation**
- `expo-av` is being split into `expo-audio` and `expo-video`
- For video playback: Use `expo-video`
- For audio playback: Use `expo-audio`
- Both are more performant and better maintained

### **Video Thumbnails**
Currently using Image component for video thumbnails in gallery.
If you need actual video playback, implement like this:

```tsx
import { VideoView, useVideoPlayer } from 'expo-video';

function VideoPlayer({ uri }) {
  const player = useVideoPlayer(uri, player => {
    player.loop = false;
    player.play();
  });

  return (
    <VideoView
      player={player}
      style={{ width: 300, height: 300 }}
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}
```

## 🐛 If Issues Persist

### **"Component not registered" error**
```powershell
# Clean everything
rm -rf android ios node_modules
npm install
npx expo prebuild --clean
npx expo run:android
```

### **Metro bundler issues**
```powershell
# Kill all Node processes
Get-Process -Name "node" | Stop-Process -Force

# Clear cache
npx expo start --clear
```

### **Build failures**
```powershell
# Clean Gradle cache
cd android
.\gradlew clean
cd ..

# Rebuild
npx expo run:android
```

## 📚 References

- [Expo registerRootComponent](https://docs.expo.dev/versions/latest/sdk/register-root-component/)
- [expo-video Documentation](https://docs.expo.dev/versions/latest/sdk/video/)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)

---

## ✨ Status

- ✅ MainActivity fixed
- ✅ expo-av replaced with expo-video
- ✅ Native code rebuilt
- 🔄 Build in progress
- ⏳ Testing pending
