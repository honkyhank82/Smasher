# Smasher App - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Android Studio (for Android development)
- Physical Android device or emulator
- Cloudflare account (for R2 storage)
- Resend account (for email)

## Quick Start

### 1. Clone and Install

```bash
cd c:/DevProjects/smasher

# Install server dependencies
cd server
npm install

# Install mobile app dependencies
cd ../app-rn
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb smasher

# Or using psql
psql -U postgres
CREATE DATABASE smasher;
\q
```

### 3. Configure Environment Variables

```bash
cd server
cp .env.example .env
```

Edit `.env` and fill in:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `RESEND_API_KEY` - Get from https://resend.com
- `R2_*` - Get from Cloudflare R2 dashboard

### 4. Run Database Migrations

```bash
cd server
npm run typeorm migration:run
```

### 5. Start Development

From the root directory:

```powershell
./start-all.ps1
```

This will:
- Auto-detect your IP address
- Update mobile app configuration
- Start backend server
- Start Metro bundler
- Build and deploy to Android device

## Manual Start (Alternative)

### Terminal 1: Backend Server
```bash
cd server
npm run start:dev
```

### Terminal 2: Metro Bundler
```bash
cd app-rn
npm start
```

### Terminal 3: Deploy to Device
```bash
cd app-rn
npx react-native run-android
```

## Configuration

### Update IP Address

If your computer's IP changes:

```powershell
cd app-rn
./update-ip.ps1
```

Then reload the app (press 'r' in Metro bundler).

### Email Testing

Without Resend API key, verification codes will be printed in the server console.

### Media Upload Testing

Without Cloudflare R2, media uploads will fail gracefully. Profile creation works without photos.

## Production Deployment

### Backend (Fly.io recommended)

1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Login: `flyctl auth login`
3. Deploy: `cd server && flyctl launch`

### Mobile App

1. Generate release keystore
2. Update `android/app/build.gradle` with signing config
3. Build release APK: `cd app-rn && npx react-native build-android --mode=release`
4. Upload to Google Play Console

## Troubleshooting

### Network Errors

- Ensure server is running on port 3001
- Check firewall allows connections
- Verify IP address in `app-rn/src/config/api.ts`
- Check Android network security config

### Database Connection

- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### Build Errors

- Clean build: `cd app-rn/android && ./gradlew clean`
- Clear Metro cache: `npx react-native start --reset-cache`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Support

For issues, check:
- Server logs in terminal
- Metro bundler logs
- Android logcat: `adb logcat`
