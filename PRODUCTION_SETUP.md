# Production Setup Guide

Complete guide to set up Smasher for production deployment.

## 🎯 Overview

This guide walks you through:
1. Backend production deployment
2. Frontend production build
3. Database setup and migrations
4. Third-party service configuration
5. App signing and release

## 📋 Prerequisites

### Required Accounts
- [ ] Fly.io account (backend hosting)
- [ ] Cloudflare account (R2 storage)
- [ ] Resend account (email service)
- [ ] Google Play Developer account ($25)

### Required Tools
- [ ] Node.js 20+
- [ ] PostgreSQL (for local testing)
- [ ] Android Studio / Android SDK
- [ ] Git
- [ ] Fly CLI

## 🖥️ Backend Setup

### 1. Install Fly CLI

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Mac/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Login to Fly.io

```bash
fly auth login
```

### 3. Create Fly.io App

```bash
cd server
fly launch

# Follow prompts:
# - App name: smasher-api (or your choice)
# - Region: Choose closest to your users
# - PostgreSQL: Yes (create database)
# - Redis: No (not needed yet)
```

### 4. Set Environment Variables

```bash
# Generate JWT secret
$JWT_SECRET = openssl rand -base64 64

# Set secrets in Fly.io
fly secrets set JWT_SECRET="$JWT_SECRET"
fly secrets set NODE_ENV="production"
fly secrets set RESEND_API_KEY="re_your_key"
fly secrets set RESEND_FROM="noreply@yourdomain.com"
fly secrets set R2_ACCOUNT_ID="your_account_id"
fly secrets set R2_ACCESS_KEY_ID="your_access_key"
fly secrets set R2_SECRET_ACCESS_KEY="your_secret_key"
fly secrets set R2_BUCKET_NAME="smasher-media"
fly secrets set R2_PUBLIC_URL="https://your-bucket.r2.dev"
fly secrets set CORS_ORIGINS="https://yourdomain.com"
```

### 5. Get Database URL

```bash
# Get connection string
fly postgres connect -a smasher-api-db

# Or get the DATABASE_URL
fly secrets list
```

### 6. Run Database Migrations

```bash
# Set DATABASE_URL locally for migration
$env:DATABASE_URL="postgresql://..."

# Run migrations
npm run migration:run

# Verify tables created
fly postgres connect -a smasher-api-db
\dt  # List tables
\q   # Quit
```

### 7. Deploy Backend

```bash
# Build and deploy
npm run deploy

# Or manually
npm run build
fly deploy

# Check status
fly status

# View logs
fly logs

# Open in browser
fly open
```

### 8. Verify Deployment

```bash
# Test health endpoint
curl https://smasher-api.fly.dev/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}
```

## ☁️ Cloudflare R2 Setup

### 1. Create R2 Bucket

1. Go to https://dash.cloudflare.com/
2. Navigate to R2
3. Click "Create bucket"
4. Name: `smasher-media`
5. Location: Automatic
6. Click "Create bucket"

### 2. Configure CORS

In bucket settings, add CORS policy:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 3. Create API Token

1. Go to R2 → Manage R2 API Tokens
2. Click "Create API Token"
3. Name: "Smasher Backend"
4. Permissions: Object Read & Write
5. Copy the credentials:
   - Access Key ID
   - Secret Access Key
   - Account ID

### 4. Get Public URL

1. In bucket settings, enable "Public Access"
2. Copy the public URL (e.g., `https://pub-xxx.r2.dev`)
3. Or set up custom domain

## 📧 Resend Email Setup

### 1. Create Account

1. Go to https://resend.com
2. Sign up for free account
3. Verify your email

### 2. Add Domain

1. Go to Domains → Add Domain
2. Enter your domain (e.g., `yourdomain.com`)
3. Add DNS records to your domain:
   - TXT record for verification
   - MX records for receiving
   - DKIM records for authentication

### 3. Create API Key

1. Go to API Keys → Create API Key
2. Name: "Smasher Production"
3. Permission: Full Access
4. Copy the API key (starts with `re_`)

### 4. Test Email

```bash
# Test from backend
curl -X POST https://smasher-api.fly.dev/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your@email.com"}'
```

## 📱 Frontend Setup

### 1. Update API Configuration

Create `app-rn/src/config/api.production.ts`:

```typescript
export const API_BASE_URL = 'https://smasher-api.fly.dev';
export const WS_URL = 'https://smasher-api.fly.dev';
```

### 2. Set Production Environment

```bash
cd app-rn
npm run set:prod
```

### 3. Update App Icons

Replace icons in `android/app/src/main/res/`:
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

Use https://icon.kitchen to generate.

### 4. Generate Signing Keystore

```powershell
cd app-rn\android\app

keytool -genkeypair -v -storetype PKCS12 `
  -keystore smasher-release.keystore `
  -alias smasher-key `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000

# Save the passwords!
```

### 5. Configure Signing

Edit `android/gradle.properties`:

```properties
SMASHER_RELEASE_STORE_FILE=smasher-release.keystore
SMASHER_RELEASE_KEY_ALIAS=smasher-key
SMASHER_RELEASE_STORE_PASSWORD=your_store_password
SMASHER_RELEASE_KEY_PASSWORD=your_key_password
```

### 6. Update Version

Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 1
    versionName "1.0.0"
}
```

### 7. Build Production APK/AAB

```powershell
cd app-rn

# Build APK (for testing)
npm run build:apk

# Build AAB (for Play Store)
npm run build:aab

# Or use the production script
.\build-production.ps1
```

### 8. Test APK

```powershell
# Install on connected device
cd android
.\gradlew installRelease

# Or manually install the APK
adb install app\build\outputs\apk\release\app-release.apk
```

## 🏪 Google Play Console Setup

### 1. Create Developer Account

1. Go to https://play.google.com/console
2. Pay $25 registration fee
3. Complete account setup
4. Agree to terms

### 2. Create App

1. Click "Create app"
2. App name: "Smasher"
3. Default language: English (US)
4. App or game: App
5. Free or paid: Free
6. Declarations: Check all boxes
7. Click "Create app"

### 3. Complete Store Listing

**App details:**
- Short description: Copy from `STORE_LISTING_CONTENT.md`
- Full description: Copy from `STORE_LISTING_CONTENT.md`
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Screenshots: 2-8 images (1080x1920 or higher)

**Categorization:**
- App category: Social or Dating
- Tags: dating, social, meet people, chat

**Contact details:**
- Email: smashermain@gmail.com
- Website: https://www.smasherapp.com (optional)
- Privacy policy: https://www.smasherapp.com/privacy

### 4. Content Rating

1. Go to "Content rating"
2. Start questionnaire
3. Answer questions honestly:
   - Violence: None
   - Sexual content: Dating app (select appropriate)
   - Language: None
   - Controlled substances: None
   - Gambling: None
4. Submit and get rating (likely Mature 17+)

### 5. Data Safety

1. Go to "Data safety"
2. Complete form:
   - Data collected: Location, Personal info, Photos, Messages
   - Data usage: App functionality, Personalization
   - Data sharing: None
   - Security: Encrypted in transit, Can request deletion
3. Submit

### 6. App Content

1. Target audience: 18+
2. News app: No
3. COVID-19 contact tracing: No
4. Data safety: Complete form
5. Government app: No
6. Financial features: No (unless you add payments)

### 7. Upload AAB

1. Go to "Production" → "Create new release"
2. Upload `app-release.aab`
3. Release name: "1.0.0"
4. Release notes:
```
Initial release of Smasher!

Features:
• Location-based user discovery
• Real-time chat messaging
• Photo and video galleries
• Favorites system
• User blocking and reporting

We're excited to help you meet new people!
```
5. Review and roll out

### 8. Submit for Review

1. Review all sections (must be complete)
2. Click "Send for review"
3. Wait for approval (1-7 days)

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] All passwords are secure
- [ ] Keystore is backed up securely
- [ ] Environment variables not in Git
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (TypeORM)
- [ ] XSS protection

## 📊 Monitoring Setup

### Backend Monitoring

**Fly.io built-in:**
```bash
# View metrics
fly dashboard

# View logs
fly logs

# Check status
fly status
```

**Optional: Sentry for errors**
```bash
npm install @sentry/node
```

Add to `main.ts`:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});
```

### Frontend Monitoring

**Google Analytics for Firebase:**
1. Create Firebase project
2. Add Android app
3. Download `google-services.json`
4. Add to `android/app/`
5. Install Firebase SDK

## 🚀 Deployment Checklist

### Backend
- [ ] Fly.io app created
- [ ] Database created and migrated
- [ ] All environment variables set
- [ ] R2 bucket configured
- [ ] Resend configured
- [ ] Health check works
- [ ] HTTPS enabled
- [ ] Deployed successfully

### Frontend
- [ ] API URL updated to production
- [ ] App icons replaced
- [ ] Signing keystore generated
- [ ] Signing configured
- [ ] Version updated
- [ ] Production build tested
- [ ] AAB built successfully

### Play Store
- [ ] Developer account created
- [ ] App listing complete
- [ ] Screenshots uploaded
- [ ] Content rating received
- [ ] Data safety submitted
- [ ] Privacy policy accessible
- [ ] AAB uploaded
- [ ] Submitted for review

## 🆘 Troubleshooting

### Backend won't deploy
```bash
# Check logs
fly logs

# SSH into instance
fly ssh console

# Check environment
fly secrets list
```

### Database connection fails
```bash
# Verify DATABASE_URL
fly secrets list

# Test connection
fly postgres connect -a smasher-api-db
```

### Frontend build fails
```bash
# Clean and rebuild
cd app-rn
Remove-Item -Recurse -Force node_modules
npm install
npm install invariant --save-dev
cd android
.\gradlew clean
.\gradlew assembleRelease
```

### Play Store rejection
- Read rejection reason carefully
- Fix the issue
- Respond to reviewer
- Resubmit

## 📞 Support

- **Email Support:** smashermain@gmail.com
- **Backend issues:** Check Fly.io logs
- **Frontend issues:** Check Android logcat
- **Play Store:** https://support.google.com/googleplay/android-developer

## ✅ Success Criteria

Your app is ready when:
- ✅ Backend is deployed and accessible
- ✅ Database is set up with all tables
- ✅ All third-party services work
- ✅ Frontend connects to production backend
- ✅ APK installs and runs on device
- ✅ All features work as expected
- ✅ AAB uploaded to Play Store
- ✅ App submitted for review

**Congratulations! You're ready to launch! 🎉**
