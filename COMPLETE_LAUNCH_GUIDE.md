# Complete App Launch Guide - Step by Step

This is your comprehensive guide to finish and publish the Smasher dating app.

## 📋 Table of Contents

1. [Backend Completion](#1-backend-completion)
2. [Frontend Completion](#2-frontend-completion)
3. [Testing](#3-testing)
4. [Production Deployment](#4-production-deployment)
5. [App Store Preparation](#5-app-store-preparation)
6. [Google Play Submission](#6-google-play-submission)
7. [Post-Launch](#7-post-launch)

---

## 1. Backend Completion

### 1.1 Database Migration for Buddies Feature

**Create migration for buddies table:**

```bash
cd server
npm run typeorm migration:create -- -n CreateBuddiesTable
```

**Edit the migration file** (in `server/src/migrations/`):

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBuddiesTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'buddies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'buddyId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'buddies',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'buddies',
      new TableForeignKey({
        columnNames: ['buddyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add unique constraint
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_USER_BUDDY" ON "buddies" ("userId", "buddyId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('buddies');
  }
}
```

**Run migration:**
```bash
npm run typeorm migration:run
```

### 1.2 Environment Variables Setup

**Production `.env` file:**

```env
# Database
DATABASE_URL=postgresql://user:password@your-db-host:5432/smasher

# JWT Secret (generate new one for production)
JWT_SECRET=your-super-secret-production-jwt-key

# Email Service (Resend.com)
RESEND_API_KEY=re_your_actual_resend_api_key
RESEND_FROM=noreply@yourdomain.com

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=smasher-media
R2_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Origins (your production domains)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 1.3 Backend Testing

**Test all endpoints:**

```bash
# Start backend
cd server
npm run start:dev

# Test endpoints with curl or Postman:
# - POST /auth/register
# - POST /auth/login
# - GET /profiles/:id
# - POST /buddies/:buddyId
# - GET /buddies
# - POST /messages
# - GET /messages/:userId
```

### 1.4 Deploy Backend

**Option A: Fly.io (Recommended)**

```bash
cd server

# Login to Fly.io
fly auth login

# Create app
fly launch

# Set secrets
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set JWT_SECRET="your-secret"
fly secrets set RESEND_API_KEY="re_..."
fly secrets set R2_ACCESS_KEY_ID="..."
fly secrets set R2_SECRET_ACCESS_KEY="..."

# Deploy
fly deploy

# Get your backend URL
fly info
# Note: https://your-app.fly.dev
```

**Option B: Render/Heroku**

See `DEPLOYMENT.md` for detailed instructions.

---

## 2. Frontend Completion

### 2.1 Update API Base URL

**Edit `app-rn/src/config/api.ts`:**

```typescript
// Development
// export const API_BASE_URL = 'http://10.0.2.2:3001';

// Production
export const API_BASE_URL = 'https://your-backend.fly.dev';
```

### 2.2 Add App Icons

**Generate icons:**
1. Create a 1024x1024 PNG logo
2. Use https://icon.kitchen or https://appicon.co
3. Download Android icon set

**Replace icons:**
```
app-rn/android/app/src/main/res/
├── mipmap-hdpi/ic_launcher.png (72x72)
├── mipmap-mdpi/ic_launcher.png (48x48)
├── mipmap-xhdpi/ic_launcher.png (96x96)
├── mipmap-xxhdpi/ic_launcher.png (144x144)
└── mipmap-xxxhdpi/ic_launcher.png (192x192)
```

### 2.3 Update App Name and Package

**Edit `app-rn/android/app/src/main/res/values/strings.xml`:**

```xml
<resources>
    <string name="app_name">Smasher</string>
</resources>
```

**Verify package name in `app-rn/android/app/build.gradle`:**

```gradle
defaultConfig {
    applicationId "com.smasherapp"  // Your unique package name
    minSdkVersion 24
    targetSdkVersion 34
    versionCode 1
    versionName "1.0.0"
}
```

### 2.4 Configure Signing

**Generate keystore:**

```bash
cd app-rn/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore smasher-release.keystore -alias smasher-key -keyalg RSA -keysize 2048 -validity 10000
```

**Save the passwords securely!**

**Edit `app-rn/android/gradle.properties`:**

```properties
SMASHER_RELEASE_STORE_FILE=smasher-release.keystore
SMASHER_RELEASE_KEY_ALIAS=smasher-key
SMASHER_RELEASE_STORE_PASSWORD=your_store_password
SMASHER_RELEASE_KEY_PASSWORD=your_key_password
```

**Edit `app-rn/android/app/build.gradle`:**

```gradle
android {
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
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 2.5 Build Production APK/AAB

**Build signed APK:**
```bash
cd app-rn
npm install invariant --save-dev
cd android
.\gradlew assembleRelease
```

**Build AAB for Play Store:**
```bash
cd app-rn/android
.\gradlew bundleRelease
```

**Output locations:**
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 3. Testing

### 3.1 Functional Testing Checklist

**User Authentication:**
- [ ] Age gate works (blocks under 18)
- [ ] Registration with email/password
- [ ] Email verification (if implemented)
- [ ] Login with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Logout works

**Profile:**
- [ ] Create profile with display name and bio
- [ ] Upload photos to gallery
- [ ] Upload videos to gallery
- [ ] Edit profile information
- [ ] Delete photos/videos
- [ ] View own profile

**Discovery:**
- [ ] Home screen shows nearby users
- [ ] Distance calculation works
- [ ] Can view other user profiles
- [ ] Profiles show correct information

**Favorites:**
- [ ] Add user to favorites (star button)
- [ ] Remove user from favorites
- [ ] Favorites screen shows all favorited users
- [ ] Tap favorite to view profile
- [ ] Pull to refresh works

**Chat:**
- [ ] Send message to user
- [ ] Receive messages in real-time
- [ ] Messages show correct timestamp
- [ ] Read receipts work (premium)
- [ ] Chat list shows recent conversations
- [ ] Unread message indicators

**Blocking/Reporting:**
- [ ] Block user works
- [ ] Blocked users don't appear in discovery
- [ ] Report user works
- [ ] Report reasons are selectable

**Premium Features:**
- [ ] Read receipts visible for premium users
- [ ] Premium badge shows (if implemented)

### 3.2 Device Testing

**Test on multiple devices:**
- [ ] Low-end Android (Android 7.0)
- [ ] Mid-range Android (Android 10)
- [ ] High-end Android (Android 14)
- [ ] Different screen sizes (small, medium, large)
- [ ] Tablet (if supporting)

### 3.3 Performance Testing

**Check:**
- [ ] App launches in < 3 seconds
- [ ] Smooth scrolling in lists
- [ ] Images load quickly
- [ ] No memory leaks (use Android Profiler)
- [ ] Battery usage is reasonable
- [ ] Network usage is reasonable

### 3.4 Security Testing

**Verify:**
- [ ] Passwords are hashed (never stored plain text)
- [ ] JWT tokens expire properly
- [ ] API endpoints require authentication
- [ ] User can only edit their own profile
- [ ] Blocked users can't message you
- [ ] SQL injection protection (TypeORM handles this)
- [ ] XSS protection

---

## 4. Production Deployment

### 4.1 Backend Deployment Checklist

**Before deploying:**
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] SSL/TLS enabled (HTTPS)
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Error logging configured (Sentry, LogRocket, etc.)
- [ ] Health check endpoint works
- [ ] Database backups configured

**Deploy backend:**
```bash
cd server
fly deploy  # or your chosen platform
```

**Verify deployment:**
```bash
curl https://your-backend.fly.dev/health
```

### 4.2 Database Setup

**Production database options:**
1. **Fly.io Postgres** (included with Fly.io)
2. **Supabase** (free tier available)
4. **Neon** (serverless Postgres)

**Run migrations on production:**
```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migrations
npm run typeorm migration:run
```

### 4.3 Media Storage Setup

**Cloudflare R2:**
1. Create R2 bucket at https://dash.cloudflare.com/
2. Set CORS policy:
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"]
  }
]
```
3. Create API token with R2 permissions
4. Add credentials to backend `.env`

### 4.4 Email Service Setup

**Resend.com:**
1. Sign up at https://resend.com
2. Verify your domain
3. Create API key
4. Add to backend `.env`
5. Test email sending

---

## 5. App Store Preparation

### 5.1 Google Play Console Setup

**Create account:**
1. Go to https://play.google.com/console
2. Pay $25 one-time registration fee
3. Complete account setup

### 5.2 Create App Listing

**App details:**
- **App name:** Smasher
- **Short description:** (80 chars) "Meet new people nearby. Chat, connect, and find your match."
- **Full description:** (4000 chars)

```
Smasher is a modern dating app that helps you meet new people in your area.

FEATURES:
• Location-based matching - Find people nearby
• Real-time chat - Connect instantly
• Photo & video galleries - Show your personality
• Favorites - Save profiles you like
• Privacy controls - Block and report users
• Premium features - Enhanced experience

HOW IT WORKS:
1. Create your profile with photos
2. Browse nearby users
3. Add favorites and start chatting
4. Meet new people!

SAFETY & PRIVACY:
• Age verification (18+)
• Block unwanted users
• Report inappropriate behavior
• Your location is never shared exactly

PREMIUM FEATURES:
• Read receipts
• Priority support
• More features coming soon!

Download Smasher today and start meeting new people!
```

### 5.3 Graphics Assets

**Required screenshots (minimum 2, maximum 8):**
- Phone: 1080x1920 or 1440x2560
- Tablet (optional): 1200x1920 or 1600x2560

**Feature graphic:**
- Size: 1024x500
- Format: PNG or JPEG

**App icon:**
- Size: 512x512
- Format: PNG
- 32-bit with alpha

**Create screenshots:**
1. Run app on device/emulator
2. Navigate to key screens (Home, Chat, Profile, Favorites)
3. Take screenshots
4. Optionally add device frames using https://mockuphone.com

### 5.4 Content Rating

**Complete questionnaire:**
1. Go to "Content rating" in Play Console
2. Answer questions honestly
3. Likely rating: **Mature 17+** (dating app)

### 5.5 Privacy Policy

**Required for Play Store. Create at:**
- https://www.privacypolicygenerator.info/
- https://app-privacy-policy-generator.firebaseapp.com/

**Host it:**
- On your website
- On GitHub Pages
- Use https://www.freeprivacypolicy.com/

**Key points to include:**
- What data you collect (email, location, photos)
- How you use it (matching, chat)
- Third-party services (Cloudflare R2, Resend)
- User rights (delete account, data export)
- Contact information

**Add URL to Play Console**

### 5.6 Terms of Service

**Create ToS covering:**
- Age requirement (18+)
- Acceptable use policy
- Content guidelines
- Account termination
- Liability limitations
- Dispute resolution

**Template available in `LEGAL_TEMPLATES.md`**

---

## 6. Google Play Submission

### 6.1 Pre-Submission Checklist

**App Bundle:**
- [ ] AAB file built and signed
- [ ] Version code incremented
- [ ] Version name set (e.g., 1.0.0)
- [ ] ProGuard enabled for optimization
- [ ] Tested on multiple devices

**Store Listing:**
- [ ] App name set
- [ ] Short description (80 chars)
- [ ] Full description (up to 4000 chars)
- [ ] Screenshots uploaded (2-8)
- [ ] Feature graphic uploaded
- [ ] App icon uploaded (512x512)
- [ ] Category selected (Social/Dating)
- [ ] Content rating completed
- [ ] Privacy policy URL added
- [ ] Contact email set

**App Content:**
- [ ] Target audience set (18+)
- [ ] Ads declaration (if using ads)
- [ ] Data safety form completed
- [ ] Government apps declaration

### 6.2 Upload App Bundle

**In Play Console:**

1. **Go to "Production" → "Create new release"**

2. **Upload AAB:**
```bash
# Build AAB
cd app-rn/android
.\gradlew bundleRelease

# Upload file:
# android/app/build/outputs/bundle/release/app-release.aab
```

3. **Release notes:**
```
Initial release of Smasher!

Features:
• Location-based user discovery
• Real-time chat messaging
• Photo and video galleries
• Favorites system
• User blocking and reporting
• Premium subscriptions

We're excited to help you meet new people!
```

4. **Review and roll out**

### 6.3 Data Safety Form

**Complete in Play Console:**

**Data collected:**
- ✅ Location (approximate)
- ✅ Personal info (email, name)
- ✅ Photos and videos
- ✅ Messages

**Data usage:**
- App functionality
- Personalization
- Account management

**Data sharing:**
- No data shared with third parties

**Security practices:**
- Data encrypted in transit
- Users can request deletion
- Committed to Google Play Families Policy

### 6.4 Review Process

**Timeline:**
- Initial review: 1-7 days
- Updates: 1-3 days

**Common rejection reasons:**
1. **Inappropriate content** - Ensure age gate works
2. **Privacy policy missing** - Must be accessible
3. **Permissions not justified** - Explain in description
4. **Crashes** - Test thoroughly
5. **Misleading content** - Accurate screenshots

**If rejected:**
1. Read rejection reason carefully
2. Fix the issue
3. Resubmit with explanation

---

## 7. Post-Launch

### 7.1 Monitoring

**Set up monitoring:**

**Backend:**
```bash
# Install Sentry for error tracking
npm install @sentry/node

# Configure in server/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
});
```

**Analytics:**
- Google Analytics for Firebase
- Mixpanel
- Amplitude

**Server monitoring:**
- Uptime monitoring (UptimeRobot, Pingdom)
- Performance monitoring (New Relic, Datadog)

### 7.2 User Feedback

**Collect feedback:**
- In-app feedback form
- Play Store reviews
- Email support
- Social media

**Respond to reviews:**
- Reply to Play Store reviews
- Address issues quickly
- Thank users for positive feedback

### 7.3 Updates

**Regular updates:**
- Bug fixes
- Performance improvements
- New features
- Security patches

**Update process:**
1. Increment version code and name
2. Build new AAB
3. Upload to Play Console
4. Write release notes
5. Roll out gradually (10% → 50% → 100%)

### 7.4 Marketing

**Launch strategy:**
1. **Social media:**
   - Create Instagram, TikTok, Twitter accounts
   - Post regularly
   - Use relevant hashtags (#dating #meetpeople)

2. **App Store Optimization (ASO):**
   - Use keywords in title and description
   - Encourage positive reviews
   - Update screenshots regularly

3. **Content marketing:**
   - Blog posts about dating tips
   - Success stories
   - Safety guides

4. **Paid advertising:**
   - Google Ads
   - Facebook/Instagram Ads
   - TikTok Ads

5. **Partnerships:**
   - Collaborate with influencers
   - Partner with local events
   - Cross-promote with complementary apps

### 7.5 Growth Metrics

**Track key metrics:**
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Retention rate (Day 1, Day 7, Day 30)
- Conversion rate (free to premium)
- Average session duration
- Messages sent per user
- Matches made

**Tools:**
- Google Analytics
- Firebase Analytics
- Mixpanel
- Custom dashboard

### 7.6 Monetization

**Current: Premium subscriptions**

**Additional revenue streams:**
1. **In-app purchases:**
   - Boost profile visibility
   - Super likes
   - Unlimited swipes

2. **Advertising:**
   - Banner ads (Google AdMob)
   - Interstitial ads
   - Rewarded video ads

3. **Virtual gifts:**
   - Send gifts in chat
   - Premium stickers/emojis

4. **Events:**
   - Sponsored local events
   - Virtual speed dating

---

## Quick Reference Checklist

### Backend
- [ ] Buddies migration created and run
- [ ] All environment variables set
- [ ] Backend deployed to production
- [ ] Database configured and migrated
- [ ] R2 storage configured
- [ ] Email service configured
- [ ] SSL/HTTPS enabled
- [ ] Error logging set up

### Frontend
- [ ] API URL updated to production
- [ ] App icons replaced
- [ ] App name configured
- [ ] Keystore generated
- [ ] Signing configured
- [ ] Production APK/AAB built
- [ ] Tested on multiple devices

### Play Store
- [ ] Developer account created ($25)
- [ ] App listing created
- [ ] Screenshots uploaded (2-8)
- [ ] Feature graphic uploaded
- [ ] App icon uploaded
- [ ] Privacy policy created and hosted
- [ ] Terms of service created
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] AAB uploaded
- [ ] Release notes written
- [ ] App submitted for review

### Post-Launch
- [ ] Monitoring set up (Sentry, analytics)
- [ ] Support email configured
- [ ] Social media accounts created
- [ ] Marketing plan in place
- [ ] Metrics tracking configured

---

## Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Backend Completion** | 1-2 days | Migrations, deployment, testing |
| **Frontend Completion** | 1-2 days | Icons, signing, building |
| **Testing** | 2-3 days | Functional, device, performance |
| **Store Preparation** | 2-3 days | Listing, graphics, policies |
| **Review** | 1-7 days | Google Play review process |
| **Total** | **7-17 days** | From now to launch |

---

## Support Resources

- **React Native Docs:** https://reactnative.dev/
- **NestJS Docs:** https://docs.nestjs.com/
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **Fly.io Docs:** https://fly.io/docs/
- **Cloudflare R2 Docs:** https://developers.cloudflare.com/r2/

---

## Next Immediate Steps

1. **Wait for current build to complete**
2. **Test the APK on a physical device**
3. **Create buddies database migration**
4. **Deploy backend to production**
5. **Update frontend API URL**
6. **Generate signing keystore**
7. **Build signed AAB**
8. **Create Play Store listing**
9. **Submit for review**

**You're almost there! 🚀**
