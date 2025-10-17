# Production Build Guide - SMASHER v1.0.0

## ✅ **Remote Configuration Verified**

Your app is configured to run **100% remotely** without any local dependencies:

- ✅ **API**: `https://smasher-api.fly.dev` (remote server)
- ✅ **Updates**: `https://u.expo.dev/edef8952-a01b-408f-abeb-e3922973df75` (OTA updates)
- ✅ **Media**: Cloudflare R2 (cloud storage)
- ✅ **Database**: PostgreSQL on Fly.io
- ✅ **Builds**: EAS Build (cloud-based, no local Android Studio needed)

---

## 🚀 **Quick Build (Recommended)**

### **Option 1: Automated Script**

```powershell
cd c:\DevProjects\smasher\app-rn
.\build-production-eas.ps1
```

This will:
1. Check EAS CLI
2. Authenticate
3. Build AAB (for Play Store)
4. Build APK (for direct distribution)

### **Option 2: Manual Commands**

```powershell
cd c:\DevProjects\smasher\app-rn

# Build AAB for Google Play Store
eas build --profile production --platform android

# Build APK for direct distribution
eas build --profile production-apk --platform android
```

---

## 📦 **Build Profiles**

### **1. Production AAB** (for Google Play)
```powershell
eas build --profile production --platform android
```

- **Output**: `.aab` file
- **Use**: Upload to Google Play Console
- **Distribution**: Store (billions of users)
- **Size**: Optimized (Google generates APKs per device)

### **2. Production APK** (for direct install)
```powershell
eas build --profile production-apk --platform android
```

- **Output**: `.apk` file
- **Use**: Direct distribution, testing, sideloading
- **Distribution**: Internal (share file directly)
- **Size**: Larger (includes all architectures)

### **3. Preview APK** (for testing)
```powershell
eas build --profile preview --platform android
```

- **Output**: `.apk` file
- **Use**: Quick testing before production
- **Distribution**: Internal testing

---

## ⏱️ **Build Timeline**

| Step | Time | Location |
|------|------|----------|
| Queue build | 1-2 min | EAS servers |
| Install dependencies | 2-3 min | Cloud |
| Compile native code | 5-8 min | Cloud |
| Package & sign | 1-2 min | Cloud |
| **Total** | **10-15 min** | **100% cloud** |

---

## 📊 **Track Build Progress**

### **List All Builds**
```powershell
eas build:list
```

### **Watch Specific Build**
```powershell
eas build:view [BUILD_ID]
```

### **Web Dashboard**
Visit: https://expo.dev/accounts/[your-account]/projects/smasher-app/builds

---

## 📥 **Download Built Files**

### **Download Latest**
```powershell
# Download latest AAB
eas build:download --platform android --latest

# Download specific build
eas build:download --id [BUILD_ID]
```

### **Files Location**
Downloads save to current directory:
- `build-[id].aab` - For Google Play
- `build-[id].apk` - For direct install

---

## 🎯 **What Gets Built**

### **App Configuration**
- **Name**: SMASHER
- **Package**: com.smasher.app
- **Version**: 1.0.0
- **Version Code**: 1

### **Features Included**
- ✅ Location-based user discovery
- ✅ Real-time chat (Socket.IO)
- ✅ Photo/video profiles
- ✅ OTA updates (expo-updates)
- ✅ Remote API (Fly.io)
- ✅ Cloud storage (Cloudflare R2)

### **Permissions**
- Location (fine & coarse)
- Camera
- Photo library
- Internet

### **Architectures**
- arm64-v8a (64-bit ARM)
- armeabi-v7a (32-bit ARM)

---

## 🔐 **App Signing**

EAS Build automatically handles signing:

### **Debug Builds**
- Signed with Expo's debug keystore
- For testing only

### **Production Builds**
- Signed with your production keystore
- Managed by EAS
- Stored securely in Expo's infrastructure

### **First Production Build**
EAS will prompt you to generate a keystore:
```
? Generate a new Android Keystore? Yes
```

**Important**: Once generated, EAS stores this keystore. All future builds use the same keystore (required for Play Store updates).

---

## 📱 **After Build Completes**

### **For AAB (Google Play Store)**

1. **Download the AAB**:
   ```powershell
   eas build:download --platform android --latest
   ```

2. **Upload to Play Console**:
   - Go to Google Play Console
   - Select your app
   - Production → Create new release
   - Upload the `.aab` file
   - Add release notes
   - Review and rollout

3. **Or use automated submission**:
   ```powershell
   eas submit --platform android --latest
   ```

### **For APK (Direct Distribution)**

1. **Download the APK**:
   ```powershell
   eas build:download --platform android --latest
   ```

2. **Share the file**:
   - Email, Dropbox, Google Drive, etc.
   - Users install by opening the file
   - Requires "Install from unknown sources" enabled

3. **Or host on your website**:
   - Upload to your server
   - Share download link
   - Users download and install

---

## 🔄 **OTA Updates (After Initial Release)**

Once users have installed your app, you can push updates **without rebuilding**:

```powershell
# Publish update to production
eas update --branch production --message "Bug fixes and improvements"
```

**What can be updated via OTA:**
- ✅ JavaScript code
- ✅ React components
- ✅ App logic
- ✅ Styling
- ✅ Assets (images, etc.)

**What requires a new build:**
- ❌ Native code changes
- ❌ New native modules
- ❌ Permission changes
- ❌ Version number changes

---

## 🐛 **Troubleshooting**

### **Build Fails**

**Check build logs:**
```powershell
eas build:view [BUILD_ID]
```

**Common issues:**
- Missing credentials → Run `eas credentials`
- Invalid config → Check `app.json` and `eas.json`
- Dependency errors → Run `npm install` locally first

### **"EAS CLI not found"**

```powershell
npm install -g eas-cli
```

### **"Not authenticated"**

```powershell
eas login
```

### **Build stuck in queue**

- EAS has limited concurrent builds
- Free tier: 1 concurrent build
- Wait for other builds to complete
- Or upgrade to paid tier

---

## 💰 **EAS Build Pricing**

### **Free Tier**
- 30 builds/month
- 1 concurrent build
- Perfect for getting started

### **Production Tier** ($29/month)
- Unlimited builds
- 2 concurrent builds
- Priority queue
- Faster builds

### **Enterprise** (Custom)
- Unlimited everything
- Dedicated infrastructure

**For SMASHER**: Free tier is fine for now. Upgrade when you need faster/more builds.

---

## 📋 **Pre-Build Checklist**

Before building for production:

- [ ] Test app thoroughly on device
- [ ] Verify all features work
- [ ] Check API endpoints are correct
- [ ] Update version in `app.json`
- [ ] Update version code in `app.json`
- [ ] Test OTA updates work
- [ ] Prepare store listing (if publishing)
- [ ] Have screenshots ready
- [ ] Privacy policy URL ready

---

## 🎯 **Build Commands Reference**

```powershell
# Production AAB (Play Store)
eas build --profile production --platform android

# Production APK (Direct distribution)
eas build --profile production-apk --platform android

# Preview APK (Testing)
eas build --profile preview --platform android

# List all builds
eas build:list

# Download latest
eas build:download --platform android --latest

# Submit to Play Store
eas submit --platform android --latest

# Publish OTA update
eas update --branch production --message "Your message"

# Check update status
eas update:list
```

---

## ✨ **Summary**

Your app is **100% cloud-ready**:

1. **API**: Remote server (Fly.io)
2. **Storage**: Cloud (Cloudflare R2)
3. **Builds**: Cloud (EAS Build)
4. **Updates**: Cloud (Expo Updates)
5. **Distribution**: Cloud (Google Play / direct)

**No local dependencies required!**

---

## 🚀 **Ready to Build?**

```powershell
cd c:\DevProjects\smasher\app-rn
.\build-production-eas.ps1
```

Or manually:

```powershell
# Build both AAB and APK
eas build --profile production --platform android
eas build --profile production-apk --platform android
```

**Build time**: ~10-15 minutes each  
**Location**: EAS cloud servers  
**Output**: Production-ready files

---

**Let's build! 🎉**
