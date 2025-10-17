# Deployment Guide

## Backend Deployment (Fly.io)

### 1. Prerequisites

```bash
# Install Fly CLI
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Login
flyctl auth login
```

### 2. Create Fly App

```bash
cd server
flyctl launch
```

Answer the prompts:
- App name: `smasher-api` (or your choice)
- Region: Choose closest to your users
- PostgreSQL: Yes (creates managed Postgres)
- Redis: Optional (for future caching)

### 3. Set Environment Variables

```bash
# Set secrets
flyctl secrets set JWT_SECRET=$(openssl rand -base64 32)
flyctl secrets set RESEND_API_KEY=your_resend_key
flyctl secrets set R2_ACCESS_KEY_ID=your_r2_key
flyctl secrets set R2_SECRET_ACCESS_KEY=your_r2_secret
flyctl secrets set R2_ACCOUNT_ID=your_account_id
flyctl secrets set R2_BUCKET_NAME=smasher-media
```

### 4. Deploy

```bash
flyctl deploy
```

### 5. Run Migrations

```bash
flyctl ssh console
npm run typeorm migration:run
exit
```

### 6. Get Your API URL

```bash
flyctl info
```

Note the hostname (e.g., `smasher-api.fly.dev`)

## Mobile App Deployment (Google Play)

### 1. Generate Release Keystore

```bash
cd app-rn/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore smasher-release.keystore -alias smasher -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANT**: Save the keystore password securely!

### 2. Configure Signing

Create `android/gradle.properties`:

```properties
SMASHER_RELEASE_STORE_FILE=smasher-release.keystore
SMASHER_RELEASE_KEY_ALIAS=smasher
SMASHER_RELEASE_STORE_PASSWORD=your_keystore_password
SMASHER_RELEASE_KEY_PASSWORD=your_key_password
```

Update `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('SMASHER_RELEASE_STORE_FILE')) {
                storeFile file(SMASHER_RELEASE_STORE_FILE)
                storePassword SMASHER_RELEASE_STORE_PASSWORD
                keyAlias SMASHER_RELEASE_KEY_ALIAS
                keyPassword SMASHER_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

### 3. Update Production API URL

Edit `app-rn/src/config/api.ts`:

```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.68.61:3001' 
  : 'https://smasher-api.fly.dev'; // Your Fly.io URL
```

### 4. Build Release APK/AAB

```bash
cd app-rn

# For APK (testing)
npx react-native build-android --mode=release

# For AAB (Play Store)
cd android
./gradlew bundleRelease
```

Output:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### 5. Test Release Build

```bash
# Install APK on device
adb install android/app/build/outputs/apk/release/app-release.apk
```

### 6. Upload to Google Play Console

1. Go to https://play.google.com/console
2. Create new app
3. Fill in store listing:
   - Title: SMASHER
   - Short description: Location-based dating for 18+
   - Full description: (See STORE_LISTING.md)
   - Screenshots: Minimum 2 required
   - Feature graphic: 1024x500px
   - App icon: 512x512px
4. Content rating: Complete questionnaire (18+)
5. Upload AAB to Internal Testing track
6. Submit for review

## Environment Setup

### Development
- Local PostgreSQL
- Local IP for mobile app
- Verification codes in console

### Production
- Fly.io PostgreSQL
- Cloudflare R2 for media
- Resend for emails
- HTTPS API endpoint

## Monitoring

### Backend Logs
```bash
flyctl logs
```

### Database Access
```bash
flyctl postgres connect -a smasher-db
```

### Metrics
```bash
flyctl dashboard
```

## Rollback

```bash
# List releases
flyctl releases

# Rollback to previous
flyctl releases rollback <version>
```

## Scaling

```bash
# Scale VMs
flyctl scale count 2

# Scale VM size
flyctl scale vm shared-cpu-2x
```

## Backup

### Database
```bash
flyctl postgres backup create -a smasher-db
flyctl postgres backup list -a smasher-db
```

### Media (Cloudflare R2)
- R2 has built-in durability
- Consider lifecycle policies for old media

## Security Checklist

- [ ] JWT_SECRET is strong and secret
- [ ] Database credentials are secure
- [ ] API keys are in secrets, not code
- [ ] HTTPS only in production
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Keystore backed up securely
- [ ] Environment variables documented

## Post-Deployment

1. Test registration flow
2. Test login flow
3. Test profile creation
4. Test photo upload (if R2 configured)
5. Test nearby users
6. Monitor error logs
7. Set up alerts

## Support

- Fly.io: https://fly.io/docs
- Google Play: https://support.google.com/googleplay/android-developer
- React Native: https://reactnative.dev/docs/signed-apk-android
