# Smasher - React Native App

Hookup app for 18+ gay men. Android-first, Play Store-ready.

## Tech Stack

- **React Native 0.81.4** - Cross-platform mobile framework
- **React Navigation** - Navigation library
- **Axios** - HTTP client for API calls
- **Socket.io** - WebSocket client for real-time chat
- **AsyncStorage** - Local data persistence
- **React Native Geolocation** - Location services
- **React Native Image Picker** - Photo/video upload

## Backend Integration

The app connects to the NestJS backend at:
- **Development**: `http://localhost:3000`
- **Production**: Update `src/config/api.ts` with your Fly.io URL

## Setup Instructions

### Prerequisites

1. **Node.js** (v18+)
2. **Android Studio** with Android SDK
3. **JDK 11** or higher
4. **React Native CLI**: `npm install -g react-native-cli`

### Installation

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android (in a new terminal)
npm run android
```

## Project Structure

```
src/
├── config/
│   ├── api.ts          # API client configuration
│   └── theme.ts        # App theme (black, silver, red)
├── context/
│   └── AuthContext.tsx # Authentication state management
├── navigation/
│   └── AppNavigator.tsx # Navigation setup
└── screens/
    ├── AgeGateScreen.tsx      # 18+ age verification
    ├── RegisterScreen.tsx     # Email registration
    ├── VerifyCodeScreen.tsx   # Email code verification
    └── HomeScreen.tsx         # Nearby users discovery
```

## Features Implemented

✅ **Age Gate (18+)** - Birthdate verification with Terms/Privacy consent  
✅ **Email Authentication** - Registration and verification code flow  
✅ **JWT Token Management** - Secure token storage with AsyncStorage  
✅ **Nearby Users Screen** - UI ready for geo-based discovery  
✅ **Dark Theme** - Black, silver, deep red branding  

## Features To Implement

🔲 **Profile Creation** - Display name, bio, photos, preferences  
🔲 **Geolocation** - Request permissions and send location to backend  
🔲 **Photo/Video Upload** - Gallery and profile picture management  
🔲 **Chat Interface** - WebSocket-based real-time messaging  
🔲 **Blocking & Reporting** - User safety features  
🔲 **Google Play Billing** - Subscription integration ($10/mo, 3-day trial)  
🔲 **Push Notifications** - In-app notifications  

## Android Configuration

### Permissions (AndroidManifest.xml)

- `INTERNET` - API and WebSocket communication
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` - Nearby users
- `CAMERA` - Take photos
- `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` - Gallery access

### Build Configuration

- **minSdkVersion**: 21 (Android 5.0+)
- **targetSdkVersion**: 34 (Android 14)
- **Application ID**: `com.smasherapp`

## Building for Release

### 1. Generate Release Keystore

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore smasher-release.keystore -alias smasher-key -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Signing

Edit `android/gradle.properties`:

```properties
SMASHER_RELEASE_STORE_FILE=smasher-release.keystore
SMASHER_RELEASE_KEY_ALIAS=smasher-key
SMASHER_RELEASE_STORE_PASSWORD=your_store_password
SMASHER_RELEASE_KEY_PASSWORD=your_key_password
```

Update `android/app/build.gradle`:

```gradle
signingConfigs {
    release {
        storeFile file(SMASHER_RELEASE_STORE_FILE)
        storePassword SMASHER_RELEASE_STORE_PASSWORD
        keyAlias SMASHER_RELEASE_KEY_ALIAS
        keyPassword SMASHER_RELEASE_KEY_PASSWORD
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

### 3. Build Release APK/AAB

```bash
# Build APK
cd android
./gradlew assembleRelease

# Build AAB (for Play Store)
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Google Play Store Checklist

### Required Assets

- [ ] **App Icon** (512x512 PNG) - Double male symbol with gradient
- [ ] **Feature Graphic** (1024x500 PNG)
- [ ] **Screenshots** (minimum 2, recommend 8)
- [ ] **Privacy Policy** (hosted URL)
- [ ] **Terms of Service** (hosted URL)

### Content Rating

- [ ] Complete questionnaire (18+ rating expected)
- [ ] Declare NSFW content allowed in app (not in store listing)

### Data Safety

- [ ] Location data collection (for nearby users)
- [ ] Photos/videos (user-generated content)
- [ ] Email address (authentication)
- [ ] Account deletion available
- [ ] Data export available

### Subscription Details

- [ ] $10/month subscription
- [ ] 3-day free trial
- [ ] Clear cancellation policy
- [ ] One trial per account enforcement

## Development Commands

```bash
# Start Metro
npm start

# Run on Android
npm run android

# Run tests
npm test

# Lint code
npm run lint

# Clean build
cd android && ./gradlew clean
```

## Troubleshooting

**Metro bundler issues:**
```bash
npm start -- --reset-cache
```

**Android build errors:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**Permission errors on Windows:**
Use `npm.cmd` instead of `npm` if PowerShell execution policy blocks scripts.

## Backend Server

Make sure the NestJS backend is running:
```bash
cd ../server
npm run start:dev
```

Backend should be accessible at `http://localhost:3000`

## Next Steps

1. **Complete backend endpoints** (geo, chat, subscriptions)
2. **Implement remaining screens** (profile, chat, settings)
3. **Add Google Play Billing** integration
4. **Create app icon and branding assets**
5. **Write Privacy Policy and Terms of Service**
6. **Test on real Android devices**
7. **Submit to Google Play Console**
