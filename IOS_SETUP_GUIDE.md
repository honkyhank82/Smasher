# iOS Setup Guide for Smasher App

**Prerequisites:** You need a Mac computer to build iOS apps. Windows cannot build iOS apps directly.

---

## ⚠️ IMPORTANT: Mac Required

iOS apps can only be built on macOS due to Apple's requirements. You have two options:

### Option 1: Use a Mac
- Your own Mac
- Borrowed Mac
- Mac in the cloud (MacStadium, AWS EC2 Mac, etc.)

### Option 2: Use Expo EAS Build (Recommended for Windows users)
- Build iOS apps from Windows
- Requires Expo account (free tier available)
- We'll need to migrate to Expo (takes 1-2 hours)

---

## If You Have a Mac - Setup Steps

### 1. Install Prerequisites

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Watchman
brew install watchman

# Install CocoaPods
sudo gem install cocoapods

# Install Xcode from App Store (required)
# Download from: https://apps.apple.com/us/app/xcode/id497799835
```

### 2. Clone/Copy Project to Mac

```bash
# If using Git
git clone <your-repo-url>
cd smasher/app-rn

# Or copy the entire app-rn folder to your Mac
```

### 3. Install Dependencies

```bash
cd app-rn

# Install npm packages
npm install

# Install iOS pods
cd ios
pod install
cd ..
```

### 4. Configure iOS Project

#### Update Bundle Identifier

1. Open `ios/SmasherApp.xcworkspace` in Xcode (NOT .xcodeproj)
2. Select "SmasherApp" project in left sidebar
3. Select "SmasherApp" target
4. Go to "Signing & Capabilities" tab
5. Change Bundle Identifier to: `com.yourdomain.smasher`
6. Select your Apple Developer team

#### Add Required Permissions

Edit `ios/SmasherApp/Info.plist` and add:

```xml
<key>NSCameraUsageDescription</key>
<string>Smasher needs access to your camera to take profile photos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Smasher needs access to your photo library to upload photos</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Smasher uses your location to show nearby users</string>

<key>NSLocationAlwaysUsageDescription</key>
<string>Smasher uses your location to show nearby users even when the app is in the background</string>

<key>NSMicrophoneUsageDescription</key>
<string>Smasher needs access to your microphone for video messages</string>
```

### 5. Build and Run

#### Option A: Run on Simulator

```bash
npm run ios
```

Or specify a simulator:
```bash
npx react-native run-ios --simulator="iPhone 15 Pro"
```

#### Option B: Run on Physical Device

1. Connect iPhone via USB
2. Trust the computer on iPhone
3. In Xcode, select your device from the device dropdown
4. Click the "Play" button or:
   ```bash
   npx react-native run-ios --device
   ```

### 6. Build for TestFlight/App Store

#### Create Archive

1. Open `ios/SmasherApp.xcworkspace` in Xcode
2. Select "Any iOS Device" or your connected device
3. Product → Archive
4. Wait for archive to complete
5. Click "Distribute App"
6. Choose "App Store Connect"
7. Follow the wizard

---

## If You're on Windows - Use Expo EAS Build

### Why Expo EAS?
- Build iOS apps from Windows
- No Mac required
- Free tier available (limited builds/month)
- Handles code signing automatically

### Migration Steps

#### 1. Install Expo CLI

```powershell
npm install -g expo-cli eas-cli
```

#### 2. Create Expo Account

```powershell
npx expo login
```

Or sign up at: https://expo.dev

#### 3. Initialize EAS

```powershell
cd app-rn
eas init
```

#### 4. Configure EAS Build

Create `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

#### 5. Build iOS App

```powershell
# Build for simulator (free)
eas build --platform ios --profile development

# Build for device (requires Apple Developer account - $99/year)
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

#### 6. Download and Install

After build completes:
- Simulator build: Download .tar.gz, extract, drag to simulator
- Device build: Download .ipa, install via Apple Configurator or TestFlight
- Production: Automatically uploaded to App Store Connect

---

## iOS-Specific Configuration Needed

### 1. Update Info.plist

File: `ios/SmasherApp/Info.plist`

Add all permission descriptions (see above).

### 2. Configure App Icons

iOS requires multiple icon sizes:

```
ios/SmasherApp/Images.xcassets/AppIcon.appiconset/
  - Icon-20@2x.png (40x40)
  - Icon-20@3x.png (60x60)
  - Icon-29@2x.png (58x58)
  - Icon-29@3x.png (87x87)
  - Icon-40@2x.png (80x80)
  - Icon-40@3x.png (120x120)
  - Icon-60@2x.png (120x120)
  - Icon-60@3x.png (180x180)
  - Icon-1024.png (1024x1024)
```

Use a tool like https://appicon.co to generate all sizes.

### 3. Configure Launch Screen

Edit `ios/SmasherApp/LaunchScreen.storyboard` in Xcode.

### 4. Update App Display Name

In `ios/SmasherApp/Info.plist`:

```xml
<key>CFBundleDisplayName</key>
<string>SMASHER</string>
```

---

## Apple Developer Account Requirements

### For Testing on Your Own Device (Free)
- Free Apple ID
- Can install on your own devices only
- Apps expire after 7 days

### For TestFlight & App Store ($99/year)
- Apple Developer Program membership
- Sign up at: https://developer.apple.com/programs/
- Required for:
  - TestFlight distribution
  - App Store submission
  - Push notifications
  - In-app purchases

---

## iOS-Specific Dependencies to Configure

### 1. React Native Geolocation

Already in package.json, but needs iOS permissions (added above).

### 2. React Native Image Picker

Already in package.json, needs camera/photo permissions (added above).

### 3. Socket.io Client

Works on iOS, no additional config needed.

### 4. React Native Video

May need additional pods. If build fails, add to Podfile:

```ruby
pod 'react-native-video', :path => '../node_modules/react-native-video'
```

---

## Common iOS Build Issues

### Issue: "Command PhaseScriptExecution failed"

**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Issue: "No bundle URL present"

**Solution:**
```bash
# Make sure Metro bundler is running
npm start

# In another terminal
npm run ios
```

### Issue: "Could not find iPhone simulator"

**Solution:**
```bash
# List available simulators
xcrun simctl list devices

# Run on specific simulator
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Issue: "Signing for 'SmasherApp' requires a development team"

**Solution:**
1. Open Xcode
2. Select project → Signing & Capabilities
3. Select your team or "Add Account" to add Apple ID

---

## Testing iOS App

### Simulator Testing

```bash
# Run on default simulator
npm run ios

# Run on specific device
npx react-native run-ios --simulator="iPhone 15 Pro"
npx react-native run-ios --simulator="iPad Pro (12.9-inch)"
```

### Physical Device Testing

1. Connect iPhone via USB
2. Trust computer on device
3. Run:
   ```bash
   npx react-native run-ios --device="Your iPhone Name"
   ```

### TestFlight Testing (Requires Apple Developer Account)

1. Archive app in Xcode
2. Upload to App Store Connect
3. Add internal/external testers
4. Testers install via TestFlight app

---

## iOS vs Android Differences to Handle

### 1. Status Bar

iOS has a notch/dynamic island. Make sure to use:
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
```

### 2. Navigation

iOS uses swipe-back gesture. Already handled by React Navigation.

### 3. Permissions

iOS requires runtime permission requests. Already implemented in code.

### 4. Push Notifications

iOS requires:
- APNs certificate
- Push notification capability in Xcode
- Device token registration

### 5. In-App Purchases

iOS uses Apple's IAP system (different from Google Play Billing).

---

## Next Steps After Android Build

1. **If you have a Mac:**
   - Follow "If You Have a Mac" section above
   - Install dependencies
   - Run on simulator
   - Test all features
   - Build for TestFlight

2. **If you're on Windows:**
   - Decide if you want to use Expo EAS Build
   - Or find a Mac to borrow/rent
   - Or use a cloud Mac service

3. **App Store Submission:**
   - Create App Store Connect listing
   - Prepare screenshots (iPhone required)
   - Submit for review

---

## Cost Summary

### Free Option:
- Test on your own device (7-day limit)
- Use Expo EAS free tier (limited builds)

### Paid Option:
- Apple Developer Program: $99/year
- Required for App Store submission
- Unlimited device testing
- TestFlight distribution

---

## Resources

- **React Native iOS Setup:** https://reactnative.dev/docs/environment-setup
- **Xcode Download:** https://apps.apple.com/us/app/xcode/id497799835
- **Apple Developer:** https://developer.apple.com
- **Expo EAS Build:** https://docs.expo.dev/build/introduction/
- **App Store Connect:** https://appstoreconnect.apple.com

---

**Note:** iOS development requires macOS. If you don't have a Mac, I recommend using Expo EAS Build to build iOS apps from Windows.

Would you like me to help you set up Expo EAS Build, or do you have access to a Mac?
