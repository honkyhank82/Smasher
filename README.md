# 🔥 SMASHER

<div align="center">

**Location-based social networking app for the 18+ community**

[![Version](https://img.shields.io/badge/version-1.0.12-blue.svg)](https://github.com/yourusername/smasher)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-green.svg)](https://expo.dev)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment)

</div>

---

## 📱 Overview

SMASHER is a modern, location-based social networking application designed for adults 18+. Built with React Native and Expo, it offers real-time chat, location sharing, photo galleries, and proximity-based user discovery.

### ✨ Key Highlights

- 🔐 **Passwordless Authentication** - Secure email-based verification
- 📍 **Location-Based Discovery** - Find users within customizable distance
- 💬 **Real-Time Chat** - WebSocket-powered instant messaging
- 📸 **Photo Galleries** - Upload up to 6 photos with built-in editing
- 🗺️ **Live Location Sharing** - Share your real-time location in chats
- 🔔 **Push Notifications** - Stay connected with Expo notifications
- 🌐 **Multi-Language Support** - i18n ready with English and Spanish
- 🔄 **OTA Updates** - Deploy updates instantly via Expo Updates

---

## 🎯 Features

### Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Authentication** | ✅ | Passwordless email verification with 6-digit codes |
| **User Profiles** | ✅ | Name, bio, age, photos, and preferences |
| **Photo Gallery** | ✅ | Upload up to 6 photos with filters and editing tools |
| **Location Discovery** | ✅ | Find nearby users with distance filtering (5-100 miles) |
| **Real-Time Chat** | ✅ | WebSocket-powered messaging with typing indicators |
| **Location Sharing** | ✅ | Share live location on interactive maps |
| **Buddies/Favorites** | ✅ | Save and manage favorite users |
| **Block & Report** | ✅ | User safety and moderation tools |
| **Profile Viewers** | ✅ | See who viewed your profile |
| **Privacy Settings** | ✅ | Control visibility and location sharing |
| **Account Management** | ✅ | Email change, account deletion, data export |
| **Push Notifications** | ✅ | Message alerts and app updates |
| **Video Messages** | ✅ | Send and receive video content |

### Photo Editing Suite

- 8 filter presets (Bright, Vivid, Warm, Cool, B&W, Vintage, Sharp)
- Transform tools (Rotate, Flip Horizontal/Vertical)
- Adjustments (Brightness, Contrast, Saturation)
- Real-time preview

### Upcoming Features

- 💳 Google Play Billing integration
- ✅ Profile verification badges
- 🔍 Advanced search filters
- 🎁 In-app rewards system

---

## 🛠️ Tech Stack

### Mobile App (Expo/React Native)

```
Frontend Framework:    React Native 0.81.4
Build System:          Expo 54.0.13
Navigation:            React Navigation 7.x
State Management:      React Hooks + Context
Real-Time:             Socket.IO Client 4.8.1
Maps:                  React Native Maps 1.26.17
Media:                 Expo Image Picker, Expo AV, Expo Video
Notifications:         Expo Notifications 0.32.12
OTA Updates:           Expo Updates 29.0.12
Internationalization:  i18next 25.6.0
```

### Backend (NestJS)

```
Framework:             NestJS 11.0.1
Language:              TypeScript 5.7.3
Database:              PostgreSQL 14+ with PostGIS
ORM:                   TypeORM 0.3.27
Authentication:        JWT + Passport
Real-Time:             Socket.IO 4.8.1
Email:                 Resend API
Media Storage:         Cloudflare R2 (S3-compatible)
Caching:               Redis (ioredis)
Rate Limiting:         @nestjs/throttler
```

### Infrastructure

- **Hosting**: Fly.io (Backend), Expo EAS (Mobile)
- **Database**: PostgreSQL with PostGIS extension
- **Storage**: Cloudflare R2
- **Email**: Resend.com
- **Push**: Expo Push Notifications
- **Updates**: Expo OTA Updates

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ (required)
- **PostgreSQL** 14+ with PostGIS extension
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Expo CLI** (`npm install -g expo-cli`)
- **EAS CLI** (`npm install -g eas-cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smasher.git
   cd smasher
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Mobile app
   cd ../app-rn
   npm install
   ```

3. **Configure environment variables**
   
   Create `server/.env`:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/smasher
   
   # JWT
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=7d
   
   # Email (Resend)
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   FROM_EMAIL=noreply@yourdomain.com
   
   # Cloudflare R2
   R2_ACCOUNT_ID=your-account-id
   R2_ACCESS_KEY_ID=your-access-key
   R2_SECRET_ACCESS_KEY=your-secret-key
   R2_BUCKET_NAME=smasher-media
   R2_PUBLIC_URL=https://your-r2-domain.com
   
   # App
   PORT=3000
   NODE_ENV=development
   ```
   
   Create `app-rn/.env`:
   ```env
   API_URL=http://your-local-ip:3000
   ```

4. **Set up the database**
   ```bash
   cd server
   npm run migration:run
   npm run seed  # Optional: Add test data
   ```

5. **Start development servers**
   
   **Option A: Automated (Windows)**
   ```powershell
   ./start-all.ps1
   ```
   
   **Option B: Manual**
   ```bash
   # Terminal 1: Backend
   cd server
   npm run start:dev
   
   # Terminal 2: Mobile app
   cd app-rn
   npm start
   
   # Terminal 3: Run on device
   cd app-rn
   npm run android  # or npm run ios
   ```

6. **Access the app**
   - Scan QR code with Expo Go app (development)
   - Or run on emulator/physical device

---

## 📂 Project Structure

```
smasher/
├── app-rn/                      # React Native mobile app (Expo)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── screens/             # App screens (24 screens)
│   │   ├── navigation/          # Navigation configuration
│   │   ├── services/            # API and WebSocket services
│   │   ├── contexts/            # React contexts (Auth, Theme)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Utility functions
│   │   └── locales/             # i18n translations
│   ├── assets/                  # Images, fonts, icons
│   ├── android/                 # Android native code
│   ├── ios/                     # iOS native code
│   ├── app.json                 # Expo configuration
│   ├── eas.json                 # EAS Build configuration
│   └── package.json
│
├── server/                      # NestJS backend API
│   ├── src/
│   │   ├── auth/                # Authentication module
│   │   ├── users/               # User management
│   │   ├── messages/            # Chat messaging
│   │   ├── media/               # File uploads
│   │   ├── location/            # Location services
│   │   ├── notifications/       # Push notifications
│   │   └── database/            # TypeORM entities
│   ├── migrations/              # Database migrations
│   ├── Dockerfile               # Production container
│   ├── fly.toml                 # Fly.io configuration
│   └── package.json
│
├── docs/                        # Documentation
├── scripts/                     # Automation scripts
├── store-listing/               # App store assets
└── README.md
```

---

## 📖 Documentation

Comprehensive guides available in the repository:

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)** - Building release APK/AAB
- **[GOOGLE_PLAY_PUBLISH.md](./GOOGLE_PLAY_PUBLISH.md)** - Google Play Store submission
- **[IOS_SETUP_GUIDE.md](./IOS_SETUP_GUIDE.md)** - iOS build and App Store
- **[AUTO_UPDATE_SETUP.md](./AUTO_UPDATE_SETUP.md)** - OTA updates configuration
- **[CLOUDFLARE_R2_SETUP.md](./CLOUDFLARE_R2_SETUP.md)** - Media storage setup
- **[EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)** - Email service configuration

---

## 🚢 Deployment

### Backend (Fly.io)

```bash
cd server

# First time setup
fly launch

# Deploy updates
fly deploy

# Set secrets
fly secrets set JWT_SECRET=your-secret
fly secrets set DATABASE_URL=your-db-url
fly secrets set RESEND_API_KEY=your-key
```

### Mobile App (Expo EAS)

```bash
cd app-rn

# Configure EAS
eas login
eas build:configure

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production

# Publish OTA update
eas update --branch production --message "Bug fixes"
```

### OTA Updates

The app supports over-the-air updates for instant deployments:

```bash
# Update production
cd app-rn
eas update --branch production --message "Your update message"

# Update preview/staging
eas update --branch preview --message "Testing new features"
```

**Note**: OTA updates work for JavaScript/React changes only. Native code changes require a full rebuild.

---

## 🔧 Development

### Available Scripts

**Mobile App (`app-rn/`)**
```bash
npm start              # Start Expo dev server
npm run android        # Run on Android device/emulator
npm run ios            # Run on iOS device/simulator
npm run lint           # Run ESLint
npm run test           # Run Jest tests
npm run build:apk      # Build Android APK
npm run build:aab      # Build Android App Bundle
```

**Backend (`server/`)**
```bash
npm run start:dev      # Start with hot-reload
npm run start:prod     # Start production build
npm run build          # Build TypeScript
npm run lint           # Run ESLint
npm run test           # Run Jest tests
npm run migration:run  # Run database migrations
npm run seed           # Seed test data
```

### Environment Modes

The app supports multiple environments:

- **Development**: Local development with hot reload
- **Preview**: Staging environment for testing
- **Production**: Live production environment

Switch environments:
```bash
cd app-rn
npm run set:dev   # Development
npm run set:prod  # Production
```

---

## 🎨 Design & Branding

### Color Palette

- **Primary**: `#000000` (Black)
- **Secondary**: `#C0C0C0` (Silver)
- **Accent**: `#8B0000` (Deep Red)
- **Background**: `#1A1A1A` (Dark Gray)
- **Text**: `#FFFFFF` (White)

### Typography

- **Headers**: System Bold
- **Body**: System Regular
- **Accent**: System Medium

### App Icon & Splash

- Icon: Double male symbol with gradient (512x512)
- Splash: Black background with centered logo
- Adaptive icon: Foreground + black background

---

## 🔒 Privacy & Compliance

### Age Verification
- Hard age gate at 18+
- Age verified during registration
- Cannot be bypassed

### Data Protection
- GDPR compliant
- User data export available
- Account deletion with data purge
- Privacy policy and terms of service

### Permissions
- **Location**: For proximity-based discovery
- **Camera**: For profile photos
- **Photo Library**: For gallery uploads
- **Notifications**: For message alerts

### Content Moderation
- User blocking and reporting
- NSFW content allowed in gallery (18+)
- Profile pictures moderated
- Automated and manual review

---

## 🐛 Troubleshooting

### Common Issues

**Metro bundler won't start**
```bash
cd app-rn
npx react-native start --reset-cache
```

**Android build fails**
```bash
cd app-rn/android
./gradlew clean
cd ..
npm run android
```

**Database connection errors**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify PostGIS extension
psql -U postgres -d smasher -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

**OTA updates not applying**
- Ensure runtime version matches between app and update
- Force close and reopen app
- Check update logs in Settings → About

See [QUICK_FIX_REFERENCE.md](./QUICK_FIX_REFERENCE.md) for more solutions.

---

## 🤝 Contributing

This is a proprietary project. Contributions are not currently accepted.

---

## 📄 License

**Proprietary - All Rights Reserved**

This software and associated documentation files are proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 📞 Support

For issues, questions, or support:
- **Email**: support@smasherapp.com
- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues (if applicable)

---

## 🙏 Acknowledgments

Built with:
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [Socket.IO](https://socket.io/)
- [Cloudflare R2](https://www.cloudflare.com/products/r2/)

---

<div align="center">

**Made with ❤️ for the 18+ community**

[⬆ Back to Top](#-smasher)

</div>

