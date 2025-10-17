# Google Play Publishing Checklist

## ✅ Quick Start Guide

### 1. Generate Signing Key (One-time setup)
```powershell
cd app-rn
./setup-release-signing.ps1
```
**⚠️ CRITICAL**: Back up `android/app/smasher-release-key.keystore` - you can never recover this!

### 2. Generate Marketing Assets
```powershell
cd app-rn
python generate_play_store_assets.py
```
This creates:
- `play-store-assets/app-icon-512.png`
- `play-store-assets/feature-graphic-1024x500.png`

### 3. Build Release AAB
```powershell
cd app-rn/android
./gradlew clean
./gradlew bundleRelease
cd ../..
```
Output: `app-rn/android/app/build/outputs/bundle/release/app-release.aab`

### 4. Complete Google Play Console Setup

## 📋 Pre-Launch Checklist

### Technical Requirements
- [ ] Signing key generated and backed up
- [ ] Release AAB built successfully
- [ ] App tested on multiple devices
- [ ] All features working correctly
- [ ] No critical bugs

### Marketing Assets
- [ ] App icon 512x512 (generated)
- [ ] Feature graphic 1024x500 (generated)
- [ ] Phone screenshots (2-8 required)
  - [ ] Welcome/Login screen
  - [ ] User discovery screen
  - [ ] Profile view
  - [ ] Chat screen
  - [ ] Settings screen

### Legal & Compliance
- [ ] Privacy policy written and published
- [ ] Terms of service written and published
- [ ] Support email active (support@smasherapp.com)
- [ ] Website created (optional but recommended)

### Google Play Console
- [ ] App created in console
- [ ] Store listing completed
  - [ ] App name: SMASHER - Dating & Meetup
  - [ ] Short description (80 chars)
  - [ ] Full description
  - [ ] App icon uploaded
  - [ ] Feature graphic uploaded
  - [ ] Screenshots uploaded
  - [ ] Category: Dating
  - [ ] Contact email
- [ ] Content rating completed (Mature 17+)
- [ ] Target audience set (18+)
- [ ] Data safety form completed
- [ ] Privacy policy URL added
- [ ] App access configured

### Testing
- [ ] Internal testing track created
- [ ] AAB uploaded to internal testing
- [ ] Test users added (10-20 recommended)
- [ ] Testing period (1-2 weeks)
- [ ] Critical bugs fixed
- [ ] User feedback addressed

### Production Release
- [ ] All above items completed
- [ ] Release notes written
- [ ] AAB uploaded to production
- [ ] Rollout percentage set (start with 20%)
- [ ] Submitted for review

## 🚀 Quick Commands Reference

### Build Commands
```powershell
# Clean build
cd app-rn/android && ./gradlew clean && cd ../..

# Build release AAB (for Play Store)
cd app-rn/android && ./gradlew bundleRelease && cd ../..

# Build release APK (for testing)
cd app-rn/android && ./gradlew assembleRelease && cd ../..

# Install release APK on device
adb install app-rn/android/app/build/outputs/apk/release/app-release.apk
```

### Verification Commands
```powershell
# Check keystore
keytool -list -v -keystore app-rn/android/app/smasher-release-key.keystore

# Check AAB
cd app-rn/android/app/build/outputs/bundle/release
dir app-release.aab
```

## 📱 Taking Screenshots

### Using Android Emulator
1. Start emulator in Android Studio
2. Run app: `npx react-native run-android`
3. Navigate to each screen
4. Take screenshots (Ctrl+S in emulator)

### Using Physical Device
```powershell
# Take screenshot
adb shell screencap -p /sdcard/screenshot.png

# Pull to computer
adb pull /sdcard/screenshot.png
```

### Required Screenshots (Minimum 2)
1. **Welcome Screen** - First impression
2. **User Discovery** - Main feature
3. **Profile View** - User profiles
4. **Chat Screen** - Messaging
5. **Settings** - Privacy controls

## 🔄 Update Process (Future Versions)

### 1. Update Version
Edit `app-rn/android/app/build.gradle`:
```gradle
versionCode 2  // Increment by 1
versionName "1.0.1"  // Update version
```

### 2. Build New AAB
```powershell
cd app-rn/android
./gradlew clean bundleRelease
cd ../..
```

### 3. Upload to Play Console
- Go to Production → Create new release
- Upload new AAB
- Add release notes
- Submit for review

## ⚠️ Important Notes

### DO NOT LOSE
- Keystore file: `android/app/smasher-release-key.keystore`
- Keystore password
- Key alias password
- If lost, you can NEVER update your app

### DO NOT COMMIT
- `gradle.properties` with passwords
- Keystore files (except debug.keystore)
- API keys or secrets

### BACKUP LOCATIONS
1. External hard drive
2. Cloud storage (encrypted)
3. Password manager for credentials

## 📚 Resources

- **Complete Guide**: See `GOOGLE_PLAY_PUBLISH.md`
- **Store Listing Content**: See `STORE_LISTING.md`
- **Legal Templates**: See `LEGAL_TEMPLATES.md`
- [Google Play Console](https://play.google.com/console)
- [Android Developer Docs](https://developer.android.com/distribute)

## 🆘 Common Issues

### "No signing config"
**Fix**: Run `setup-release-signing.ps1` to configure signing

### "Privacy policy required"
**Fix**: Create privacy policy page and add URL to Play Console

### "Content rating incomplete"
**Fix**: Complete content rating questionnaire in Play Console

### "Screenshots required"
**Fix**: Upload at least 2 phone screenshots to store listing

### "Target audience not set"
**Fix**: Set target audience to 18+ in App content section

## ⏱️ Timeline

- **Setup & Build**: 1-2 hours
- **Marketing Assets**: 2-4 hours
- **Play Console Setup**: 2-3 hours
- **Internal Testing**: 1-2 weeks
- **Production Review**: 1-7 days
- **Total**: 2-3 weeks for first release

## 🎯 Next Steps

1. ✅ Run `setup-release-signing.ps1`
2. ✅ Run `generate_play_store_assets.py`
3. ✅ Build release AAB
4. ⏳ Take app screenshots
5. ⏳ Write privacy policy
6. ⏳ Complete Play Console setup
7. ⏳ Upload to Internal Testing
8. ⏳ Test with users
9. ⏳ Submit to Production

---

**Ready to publish?** Follow the steps above and refer to `GOOGLE_PLAY_PUBLISH.md` for detailed instructions.
