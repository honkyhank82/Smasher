# Smasher Development Status

**Last Updated**: October 5, 2025

## Project Overview

Smasher is a hookup app for 18+ gay men, targeting Android via Google Play Store. The project consists of a NestJS backend and a React Native mobile app.

---

## ✅ Completed

### Backend (NestJS)
- ✅ Server running on `http://localhost:3000`
- ✅ Authentication endpoints (`/auth/register`, `/auth/login`, `/auth/verify`)
- ✅ Profile endpoints (`/profiles/me`)
- ✅ Media endpoints (signed upload/download, profile picture)
- ✅ TypeORM + PostgreSQL configuration
- ✅ JWT authentication middleware
- ✅ Email service integration
- ✅ Module structure (auth, users, profiles, media, geo, chat, subscriptions, blocks, buddies, reports)

### React Native App - **ALL CORE FEATURES IMPLEMENTED!** ✅
- ✅ **Project initialized** with React Native 0.81.4
- ✅ **Navigation setup** with React Navigation (stack navigator)
- ✅ **Authentication flow**:
  - Age gate screen (18+ verification with birthdate)
  - Terms & Privacy consent checkbox
  - Email registration screen
  - Verification code screen
  - JWT token management with AsyncStorage
- ✅ **Profile creation screen**:
  - Display name input
  - Bio text area (200 char limit)
  - Profile picture upload
  - Photo upload to Cloudflare R2 via signed URLs
- ✅ **Home screen**:
  - Nearby users list
  - Geolocation integration
  - Location permission requests
  - Background location tracking
  - Distance display
- ✅ **Profile view screen**:
  - View other users' profiles
  - Photo gallery display
  - Message button
  - Block button
  - Report button (with reason selection)
- ✅ **Chat screen**:
  - Real-time messaging with Socket.io
  - Message history
  - Send/receive messages
  - Keyboard handling
  - Auto-scroll to latest message
- ✅ **Location service**:
  - Permission handling (Android)
  - Get current location
  - Background location tracking
  - Update server with location
- ✅ **Blocking & Reporting**:
  - Block user functionality
  - Report user with reasons (inappropriate, harassment, spam, other)
- ✅ **Dark theme** (black, silver, deep red branding)
- ✅ **Android configuration**:
  - Permissions added (location, camera, storage, media)
  - minSdk: 21, targetSdk: 34
  - Application ID: `com.smasherapp`
  - App name: "Smasher"
- ✅ **Metro bundler** running successfully
- ✅ **All dependencies installed**

---

## 🔲 To Do (High Priority)

### Backend Implementation
1. **Complete Geo Module** (`/geo/nearby`)
   - Implement PostGIS queries for location-based user discovery
   - Add distance filtering (15 miles for free users)
   - Return user profiles with distance

2. **Complete Chat Module** (WebSocket)
   - Implement Socket.io gateway for real-time messaging
   - Message persistence
   - Buddy list functionality
   - Typing indicators

3. **Complete Subscriptions Module**
   - Google Play Billing integration
   - Subscription status tracking
   - Trial period enforcement (3 days, one per account)
   - Premium feature unlocks

4. **Complete Blocks/Reports Module**
   - Block user functionality
   - Report user with reasons
   - Moderation queue

### React Native App
1. **Profile Creation Screen**
   - Display name, bio, age
   - Photo upload (profile picture + gallery)
   - Preferences (looking for, body type, etc.)

2. **Geolocation Integration**
   - Request location permissions
   - Send current location to backend
   - Update location periodically

3. **Photo/Video Upload**
   - Image picker integration
   - Upload to Cloudflare R2 via signed URLs
   - Gallery management
   - Profile picture selection

4. **Chat Screen**
   - WebSocket connection to backend
   - Message list UI
   - Send/receive messages
   - Buddy list

5. **User Profile View**
   - View other users' profiles
   - Photo gallery
   - Block/Report buttons
   - Message button

6. **Settings Screen**
   - Account management
   - Subscription status
   - Account deletion
   - Data export
   - Privacy settings

---

## 🔲 To Do (Medium Priority)

### Android Release Configuration
1. **Generate Release Keystore**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore smasher-release.keystore -alias smasher-key -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing in build.gradle**
   - Add release signing config
   - Enable ProGuard/R8 minification

3. **Test Release Build**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

### Branding Assets
1. **App Icon** (512x512 PNG)
   - Design: Double male symbol with gradient
   - Colors: Black background, silver/red gradient

2. **Feature Graphic** (1024x500 PNG)
   - For Play Store listing

3. **Screenshots** (minimum 2, recommend 8)
   - Age gate screen
   - Login screen
   - Home/nearby users
   - Profile view
   - Chat interface
   - Settings

### Google Play Billing
1. **Install react-native-iap**
   ```bash
   npm install react-native-iap
   ```

2. **Configure subscription products** in Google Play Console
   - Product ID: `smasher_premium_monthly`
   - Price: $10/month
   - Trial: 3 days

3. **Implement subscription flow**
   - Purchase screen
   - Trial status display
   - Subscription management

---

## 🔲 To Do (Low Priority)

### Legal & Compliance
1. **Privacy Policy** (must be hosted)
   - Data collection disclosure (location, photos, email)
   - Third-party services (Cloudflare R2, email provider)
   - User rights (deletion, export)
   - NSFW content policy

2. **Terms of Service**
   - Age requirement (18+)
   - Acceptable use policy
   - Content moderation rules
   - Subscription terms
   - Account termination conditions

3. **Data Safety Form** (Google Play Console)
   - Location data: Collected for nearby users feature
   - Photos/videos: User-generated content
   - Email: Authentication
   - Account deletion: Available in settings
   - Data export: Available in settings

### Play Store Listing
1. **App Description** (short & full)
2. **Content Rating Questionnaire**
   - Expect 18+ rating
   - Declare NSFW content allowed in app
3. **Store Listing Screenshots**
4. **Promotional Video** (optional)

---

## Project Structure

```
smasher/
├── server/              # NestJS backend
│   ├── src/
│   │   ├── auth/        # Authentication (email, JWT)
│   │   ├── users/       # User management
│   │   ├── profiles/    # User profiles
│   │   ├── media/       # Photo/video upload
│   │   ├── geo/         # Location-based discovery (TO DO)
│   │   ├── chat/        # WebSocket chat (TO DO)
│   │   ├── subscriptions/ # Google Play Billing (TO DO)
│   │   ├── blocks/      # Block users (TO DO)
│   │   ├── buddies/     # Buddy list (TO DO)
│   │   └── reports/     # Report users (TO DO)
│   └── package.json
├── app-rn/              # React Native app
│   ├── src/
│   │   ├── config/      # API client, theme
│   │   ├── context/     # Auth context
│   │   ├── navigation/  # App navigator
│   │   └── screens/     # UI screens
│   ├── android/         # Android native code
│   └── package.json
├── app/                 # Old Flutter app (can be deleted)
├── docs/                # Documentation
└── infra/               # Deployment configs
```

---

## Running the App

### Backend
```bash
cd server
npm install
npm run start:dev
```
Backend runs on `http://localhost:3000`

### React Native App
```bash
cd app-rn
npm install
npm start              # Start Metro bundler
npm run android        # Run on Android (in new terminal)
```

---

## Estimated Timeline to Play Store

Assuming 1 developer working full-time:

- **Week 1-2**: Complete backend endpoints (geo, chat, subscriptions)
- **Week 3-4**: Implement remaining React Native screens
- **Week 5**: Google Play Billing integration
- **Week 6**: Testing, bug fixes, branding assets
- **Week 7**: Legal documents, Play Store listing preparation
- **Week 8**: Internal testing, final polish, submission

**Total**: ~8 weeks to first submission

---

## Key Dependencies

### Backend
- NestJS 11.x
- TypeORM 0.3.x
- PostgreSQL + PostGIS
- Redis (for sessions)
- AWS SDK (S3 for Cloudflare R2)
- Socket.io

### React Native
- React Native 0.81.4
- React Navigation 6.x
- Axios
- Socket.io-client
- AsyncStorage
- react-native-geolocation-service
- react-native-image-picker
- react-native-iap (to be added)

---

## Notes

- **Android-first**: iOS support possible but not priority
- **No Firebase**: Using email auth + in-app notifications for MVP
- **NSFW content**: Allowed in gallery, not as profile picture
- **Moderation**: Manual review queue for reported content
- **Monetization**: Google Play Billing only (no web payments to avoid 30% cut)
