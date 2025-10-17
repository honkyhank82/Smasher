# 📱 APK Distribution Guide

**Date**: October 8, 2025  
**App**: Smasher Dating App  
**Version**: Debug Build

---

## 📦 APK Location

**Debug APK (For Testing)**:
```
c:\DevProjects\smasher\SmasherApp-Debug.apk
```

**Size**: ~103 MB  
**Type**: Debug Build (includes development tools)

---

## 📤 How to Share the APK

### Option 1: Direct File Transfer
1. **Copy the APK** from `c:\DevProjects\smasher\SmasherApp-Debug.apk`
2. **Send via**:
   - Email (if under size limit)
   - Google Drive / Dropbox
   - WeTransfer
   - USB transfer
   - Messaging apps (WhatsApp, Telegram, etc.)

### Option 2: Cloud Storage (Recommended)
1. Upload `SmasherApp-Debug.apk` to Google Drive or Dropbox
2. Get shareable link
3. Send link to testers

---

## 📲 Installation Instructions for Testers

### Step 1: Enable Unknown Sources
1. Open **Settings** on Android phone
2. Go to **Security** or **Privacy**
3. Enable **Install from Unknown Sources** or **Allow from this source**
   - On newer Android: Settings → Apps → Special Access → Install unknown apps → Enable for your browser/file manager

### Step 2: Download APK
1. Download the APK file from the link you provided
2. File will be in **Downloads** folder

### Step 3: Install
1. Open **Files** or **Downloads** app
2. Tap on **SmasherApp-Debug.apk**
3. Tap **Install**
4. Wait for installation to complete
5. Tap **Open** or find "Smasher" in app drawer

### Step 4: Grant Permissions
The app will request:
- **Location** - Required for finding nearby users
- **Camera** - Optional for profile photos
- **Storage** - Optional for uploading photos

---

## ⚠️ Important Notes for Testers

### Security Warning
- Testers will see a warning: "This type of file can harm your device"
- This is normal for apps not from Google Play Store
- The app is safe - it's just not signed by Google Play yet

### Debug Build Limitations
- Larger file size (~103 MB vs ~50 MB for release)
- Includes development tools
- May have debug logs
- **Not suitable for production/public release**

### App Functionality
✅ **Works**:
- On mobile data (4G/5G)
- On any WiFi network
- Anywhere in the world
- Connects to: https://smasher-api.fly.dev

⚠️ **Limited** (requires additional setup):
- Email authentication (needs Resend API)
- Photo uploads (needs Cloudflare R2)

---

## 🧪 Testing Checklist

Ask testers to verify:
- [ ] App installs successfully
- [ ] App opens without crashing
- [ ] Can create account
- [ ] Can view nearby users
- [ ] Can send messages
- [ ] Location services work
- [ ] UI looks good on their device
- [ ] Performance is acceptable

---

## 🔄 Updating the APK

### Rebuild Debug APK
```powershell
cd c:\DevProjects\smasher\app-rn\android
.\gradlew.bat assembleDebug
Copy-Item "app\build\outputs\apk\debug\app-debug.apk" "..\..\SmasherApp-Debug.apk"
```

### After Code Changes
1. Make your changes
2. Rebuild APK (command above)
3. Send new APK to testers
4. Testers must **uninstall old version** first (or install over it)

---

## 🚀 Building Release APK (For Production)

### Prerequisites
1. **Generate Keystore** (one-time setup):
```powershell
cd c:\DevProjects\smasher\app-rn\android\app
keytool -genkeypair -v -storetype PKCS12 -keystore smasher-release.keystore -alias smasher-key -keyalg RSA -keysize 2048 -validity 10000
```

2. **Create gradle.properties**:
```
# android/gradle.properties
SMASHER_UPLOAD_STORE_FILE=smasher-release.keystore
SMASHER_UPLOAD_KEY_ALIAS=smasher-key
SMASHER_UPLOAD_STORE_PASSWORD=your_password_here
SMASHER_UPLOAD_KEY_PASSWORD=your_password_here
```

3. **Update build.gradle**:
```gradle
// android/app/build.gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('SMASHER_UPLOAD_STORE_FILE')) {
                storeFile file(SMASHER_UPLOAD_STORE_FILE)
                storePassword SMASHER_UPLOAD_STORE_PASSWORD
                keyAlias SMASHER_UPLOAD_KEY_ALIAS
                keyPassword SMASHER_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

4. **Build Release APK**:
```powershell
cd c:\DevProjects\smasher\app-rn\android
.\gradlew.bat assembleRelease
```

5. **Release APK Location**:
```
app\build\outputs\apk\release\app-release.apk
```

### Release APK Benefits
- ✅ Smaller size (~50 MB vs ~103 MB)
- ✅ Better performance
- ✅ No debug tools
- ✅ Optimized code
- ✅ Ready for Google Play Store

---

## 📊 APK Comparison

| Feature | Debug APK | Release APK |
|---------|-----------|-------------|
| **Size** | ~103 MB | ~50 MB |
| **Performance** | Slower | Faster |
| **Debug Tools** | Included | Removed |
| **Signing** | Debug key | Release key |
| **Use Case** | Testing | Production |
| **Google Play** | ❌ No | ✅ Yes |

---

## 🔐 Security Best Practices

### For Debug APK
- ✅ Share only with trusted testers
- ✅ Use private links (not public)
- ✅ Set expiration on shared links
- ✅ Track who has access

### For Release APK
- ✅ Keep keystore file secure
- ✅ Never commit keystore to git
- ✅ Use strong passwords
- ✅ Backup keystore safely
- ⚠️ If you lose keystore, you can't update the app!

---

## 📱 Distribution Platforms

### For Testing (Current)
- Direct APK sharing (what you're doing now)
- Google Play Internal Testing
- Firebase App Distribution
- TestFlight (iOS)

### For Production (Future)
- Google Play Store (Android)
- Apple App Store (iOS)
- Amazon Appstore
- Samsung Galaxy Store

---

## 🆘 Troubleshooting

### Testers Can't Install
**Problem**: "App not installed" error  
**Solution**: 
- Uninstall old version first
- Check if device has enough storage (~200 MB free)
- Ensure "Install from Unknown Sources" is enabled

### App Crashes on Launch
**Problem**: App opens then immediately closes  
**Solution**:
- Check Android version (requires Android 6.0+)
- Clear app data: Settings → Apps → Smasher → Clear Data
- Reinstall the app

### Can't Connect to Server
**Problem**: App shows connection errors  
**Solution**:
- Check internet connection
- Verify server is running: https://smasher-api.fly.dev
- Check if server is sleeping (first request takes ~10 seconds)

### Permission Issues
**Problem**: Location not working  
**Solution**:
- Settings → Apps → Smasher → Permissions
- Enable Location permission
- Set to "Allow all the time" or "Allow only while using"

---

## 📞 Support for Testers

### What to Tell Testers
"This is a beta version of the Smasher dating app. Please test all features and report any bugs or issues you encounter. The app connects to a live server, so your data is real but may be reset during testing."

### Feedback Form
Ask testers to provide:
1. Device model and Android version
2. What works well
3. What doesn't work
4. Any crashes or errors
5. UI/UX suggestions
6. Performance issues

---

## ✅ Quick Start for You

### Share APK Now
1. **Locate**: `c:\DevProjects\smasher\SmasherApp-Debug.apk`
2. **Upload**: To Google Drive or Dropbox
3. **Share**: Send link to testers
4. **Instruct**: Send them the installation steps above

### Example Message to Testers
```
Hey! I'd love for you to test my new dating app "Smasher".

Download APK: [your link here]

Installation:
1. Enable "Install from Unknown Sources" in Settings
2. Download and tap the APK file
3. Install and open the app
4. Grant location permission when asked

Let me know what you think!
```

---

## 🎯 Next Steps

### For Beta Testing (Now)
- [x] Debug APK built ✅
- [ ] Upload to cloud storage
- [ ] Send to 5-10 testers
- [ ] Collect feedback
- [ ] Fix critical bugs

### For Production (Later)
- [ ] Generate release keystore
- [ ] Build release APK
- [ ] Test release build
- [ ] Create Google Play listing
- [ ] Submit to Play Store

---

**🎉 Your APK is ready to share!**

Location: `c:\DevProjects\smasher\SmasherApp-Debug.apk`

*Last Updated: October 8, 2025*
