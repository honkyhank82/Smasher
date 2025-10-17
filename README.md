# SMASHER

Location-based dating app for 18+ users. Android-first, production-ready.

## Tech Stack

- **Backend**: NestJS (TypeScript) + PostgreSQL + PostGIS
- **Mobile**: React Native (Android)
- **Media**: Cloudflare R2 storage
- **Auth**: Passwordless email verification
- **Real-time**: WebSockets for chat
- **Email**: Resend.com

## Features

### ✅ Implemented
- Passwordless authentication (email + verification code)
- Age verification (18+)
- User profiles (name, bio, photos)
- Photo gallery (up to 6 photos)
- Location-based discovery
- Distance filtering (15 miles default)
- Settings and preferences
- Bottom tab navigation

### 🚧 Backend Ready (Needs Frontend)
- Real-time chat (WebSocket)
- User blocking and reporting
- Buddy/favorites list
- Media upload to Cloudflare R2

### 📋 Planned
- Google Play Billing integration
- Push notifications
- Advanced filters
- Profile verification

## Quick Start

See [SETUP.md](./SETUP.md) for detailed instructions.

```powershell
# One-command startup (auto-detects IP, starts everything)
./start-all.ps1
```

## Project Structure

```
smasher/
├── app-rn/          # React Native mobile app
├── server/          # NestJS backend API
├── start-all.ps1    # Development startup script
├── SETUP.md         # Setup instructions
└── README.md        # This file
```

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Android Studio
- Physical Android device or emulator

### Environment Variables

Copy `.env.example` to `.env` in the `server/` directory and configure:
- Database connection
- JWT secret
- Email service (Resend)
- Media storage (Cloudflare R2)

### Running Locally

```powershell
# Automatic (recommended)
./start-all.ps1

# Manual
# Terminal 1: Backend
cd server && npm run start:dev

# Terminal 2: Metro
cd app-rn && npm start

# Terminal 3: Deploy
cd app-rn && npx react-native run-android
```

## Deployment

### Backend (Fly.io)
```bash
cd server
flyctl launch
flyctl deploy
```

### Mobile (Google Play)
1. Generate release keystore
2. Configure signing in `android/app/build.gradle`
3. Build release: `cd app-rn && npx react-native build-android --mode=release`
4. Upload to Google Play Console

## Branding

- **Colors**: Black, silver, deep red accent
- **Logo**: Double male symbol with gradient
- **Target**: 18+ dating/hookup app

## Compliance

- ✅ Age gate (18+)
- ✅ Terms/Privacy consent
- ✅ Location permissions
- ✅ Data safety disclosures
- ✅ Account deletion
- 🚧 Content moderation (NSFW allowed in gallery, not profile picture)

## License

Proprietary - All rights reserved

