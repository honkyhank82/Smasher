# Google Play Publishing Guide

## Prerequisites
- ✅ $25 Google Play Developer fee paid
- Google Play Console account active
- App built and tested

## Step 1: Generate Release Signing Key

```powershell
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore smasher-release-key.keystore -alias smasher-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Save these securely (you'll need them):**
- Keystore password
- Key alias: `smasher-key-alias`
- Key password

**⚠️ CRITICAL**: Back up this keystore file! If you lose it, you can never update your app.

## Step 2: Configure Gradle Signing

Create `android/gradle.properties` (or add to existing):

```properties
SMASHER_UPLOAD_STORE_FILE=smasher-release-key.keystore
SMASHER_UPLOAD_STORE_PASSWORD=your_keystore_password
SMASHER_UPLOAD_KEY_ALIAS=smasher-key-alias
SMASHER_UPLOAD_KEY_PASSWORD=your_key_password
```

**⚠️ Add to .gitignore**: Never commit passwords to git!

## Step 3: Build Release AAB (Android App Bundle)

```powershell
# Clean build
cd android
./gradlew clean
cd ..

# Build release AAB (preferred by Google Play)
cd android
./gradlew bundleRelease
cd ..
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Step 4: Google Play Console Setup

### A. Create App Listing
1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in:
   - **App name**: SMASHER - Dating & Meetup
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Accept all required declarations

### B. Store Listing
Navigate to: **Grow → Store presence → Main store listing**

**Required fields:**
- **App name**: SMASHER - Dating & Meetup
- **Short description**: Location-based dating app for meeting people nearby. 18+ only.
- **Full description**: (Use content from STORE_LISTING.md)
- **App icon**: 512x512 PNG (need to create from your current icon)
- **Feature graphic**: 1024x500 PNG (need to create)
- **Phone screenshots**: Minimum 2, maximum 8
- **Category**: Dating
- **Email**: support@smasherapp.com

### C. Content Rating
Navigate to: **Policy → App content → Content rating**

1. Click "Start questionnaire"
2. Select category: **Social, communication, or user-generated content**
3. Answer questions:
   - Violence: No
   - Sexual content: Dating app (select appropriate options)
   - Profanity: No
   - User-generated content: Yes
   - Location sharing: Yes
4. Complete and get rating (likely Mature 17+)

### D. Target Audience
Navigate to: **Policy → App content → Target audience**

- **Target age group**: 18+
- **Appeal to children**: No

### E. Data Safety
Navigate to: **Policy → App content → Data safety**

**Data collected:**
- ✅ Location (approximate) - Required for matching
- ✅ Personal info (email, name, photos)
- ✅ Photos and videos
- ✅ Messages

**Data sharing:**
- ❌ No data shared with third parties
- ❌ No data sold

**Security:**
- ✅ Data encrypted in transit
- ✅ Data encrypted at rest
- ✅ Users can request deletion

### F. Privacy Policy
Navigate to: **Policy → App content → Privacy policy**

**Required**: Must have a publicly accessible privacy policy URL
- Create privacy policy page (see LEGAL_TEMPLATES.md)
- Host at: https://yourdomain.com/privacy
- Enter URL in console

### G. App Access
Navigate to: **Policy → App content → App access**

- Select: "All functionality is available without restrictions"
- Or provide test credentials if needed

## Step 5: Upload Release

### A. Internal Testing (Recommended First)
Navigate to: **Release → Testing → Internal testing**

1. Click "Create new release"
2. Upload `app-release.aab`
3. Add release notes:
   ```
   Initial release - v1.0.0
   - Location-based user discovery
   - Real-time chat
   - Photo profiles
   - Privacy controls
   ```
4. Click "Save" then "Review release"
5. Click "Start rollout to Internal testing"

**Add testers:**
- Create email list of testers
- Share internal testing link
- Get feedback

### B. Production Release (After Testing)
Navigate to: **Release → Production**

1. Click "Create new release"
2. Upload `app-release.aab`
3. Add release notes
4. Set rollout percentage (start with 20%)
5. Review and submit

## Step 6: Required Assets

### App Icon (512x512)
```powershell
# Generate from existing icon
cd app-rn
python -c "from PIL import Image; img = Image.open('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png'); img = img.resize((512, 512), Image.Resampling.LANCZOS); img.save('app-icon-512.png')"
```

### Feature Graphic (1024x500)
Need to create a banner with:
- Black background
- Red "S" logo
- App name "SMASHER"
- Tagline: "Connect Nearby"

### Screenshots
Take screenshots of:
1. Welcome screen
2. User discovery/nearby screen
3. Profile view
4. Chat screen
5. Settings/privacy screen

**Tools:**
- Android Studio emulator
- `adb shell screencap -p /sdcard/screenshot.png`
- Or use physical device

## Step 7: Pre-Launch Checklist

- [ ] Release AAB built and signed
- [ ] App icon 512x512 ready
- [ ] Feature graphic 1024x500 ready
- [ ] 2-8 screenshots ready
- [ ] Privacy policy published online
- [ ] Terms of service published online
- [ ] Support email active (support@smasherapp.com)
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] Target audience set (18+)
- [ ] Store listing complete
- [ ] Internal testing completed
- [ ] All critical bugs fixed

## Step 8: Submit for Review

1. Complete all sections in Play Console
2. Submit to Internal Testing first
3. Test with 10-20 users for 1-2 weeks
4. Fix any issues
5. Submit to Production
6. Wait 1-7 days for review

## Common Issues

### 1. Missing Privacy Policy
**Error**: "Privacy policy URL required"
**Fix**: Create and host privacy policy, add URL to console

### 2. Content Rating Incomplete
**Error**: "Complete content rating questionnaire"
**Fix**: Go to App content → Content rating → Complete form

### 3. Target Audience Not Set
**Error**: "Target audience required"
**Fix**: Go to App content → Target audience → Select 18+

### 4. Data Safety Incomplete
**Error**: "Data safety form required"
**Fix**: Go to App content → Data safety → Fill out form

### 5. Screenshots Missing
**Error**: "At least 2 screenshots required"
**Fix**: Upload phone screenshots to Store listing

## Version Updates

When updating your app:

1. Update version in `android/app/build.gradle`:
   ```gradle
   versionCode 2  // Increment by 1
   versionName "1.0.1"  // Update version string
   ```

2. Build new AAB:
   ```powershell
   cd android
   ./gradlew clean bundleRelease
   cd ..
   ```

3. Upload to Play Console
4. Add release notes describing changes
5. Submit for review

## Useful Commands

```powershell
# Build release AAB
cd android && ./gradlew bundleRelease && cd ..

# Build release APK (for testing)
cd android && ./gradlew assembleRelease && cd ..

# Check signing
keytool -list -v -keystore android/app/smasher-release-key.keystore

# Test release build on device
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Support Resources

- [Google Play Console](https://play.google.com/console)
- [Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [Store Listing Guide](https://support.google.com/googleplay/android-developer/answer/9866151)

## Timeline

- **Internal Testing**: 1-2 weeks
- **Closed Testing** (optional): 2-4 weeks
- **Production Review**: 1-7 days
- **Total**: 3-6 weeks for full launch

## Next Steps

1. ✅ Generate signing key
2. ✅ Configure gradle
3. ✅ Build release AAB
4. ⏳ Create marketing assets (icon, feature graphic, screenshots)
5. ⏳ Write and publish privacy policy
6. ⏳ Complete Play Console setup
7. ⏳ Upload to Internal Testing
8. ⏳ Test and iterate
9. ⏳ Submit to Production
