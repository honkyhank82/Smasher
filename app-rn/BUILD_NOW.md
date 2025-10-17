# 🚀 Build Production APK & AAB - Quick Start

## ✅ **Everything is Ready!**

Your app is configured for **100% remote operation**:
- ✅ API: `https://smasher-api.fly.dev`
- ✅ Updates: Expo OTA configured
- ✅ Build system: EAS Build (cloud)

---

## 📦 **Build Commands (Run These)**

Open a **new PowerShell terminal** and run:

### **Step 1: Navigate to Project**
```powershell
cd c:\DevProjects\smasher\app-rn
```

### **Step 2: Login to EAS (First Time Only)**
```powershell
npx eas-cli login
```

Enter your Expo account credentials.

### **Step 3: Build AAB (for Google Play Store)**
```powershell
npx eas-cli build --profile production --platform android
```

When prompted:
- **"Generate a new Android Keystore?"** → Type `Y` and press Enter
- Wait ~10-15 minutes for cloud build to complete

### **Step 4: Build APK (for Direct Distribution)**
```powershell
npx eas-cli build --profile production-apk --platform android
```

This will reuse the keystore from step 3.
Wait ~10-15 minutes for cloud build to complete.

---

## 📥 **Download Built Files**

After builds complete:

```powershell
# Download latest AAB
npx eas-cli build:download --platform android --latest

# Or download specific build
npx eas-cli build:download --id [BUILD_ID]
```

Files will be saved to your current directory:
- `build-[id].aab` - Upload to Google Play Console
- `build-[id].apk` - Share directly with users

---

## 🎯 **What Happens During Build**

1. **Upload code** to EAS servers (1-2 min)
2. **Install dependencies** on cloud (2-3 min)
3. **Compile native code** on cloud (5-8 min)
4. **Package & sign** the app (1-2 min)
5. **Upload artifacts** back to you (1 min)

**Total: ~10-15 minutes per build**

---

## 📊 **Track Build Progress**

### **In Terminal**
The build command will show progress and provide a URL to track the build.

### **In Browser**
Visit: https://expo.dev/accounts/[your-account]/projects/smasher-app/builds

### **List All Builds**
```powershell
npx eas-cli build:list
```

---

## 🔐 **About the Keystore**

When you build for the first time, EAS will:
1. Generate a production keystore
2. Store it securely on Expo's servers
3. Use it for all future builds automatically

**Important**: This keystore is required for:
- Uploading to Google Play Store
- Publishing updates to existing users
- All future app versions

EAS manages this for you - you don't need to download or store it locally!

---

## ✨ **After Build Completes**

### **For AAB (Google Play)**
1. Download the `.aab` file
2. Go to Google Play Console
3. Create new release
4. Upload the AAB
5. Submit for review

### **For APK (Direct Install)**
1. Download the `.apk` file
2. Share via email, Dropbox, Google Drive, etc.
3. Users can install directly
4. Requires "Install from unknown sources" enabled

---

## 🔄 **Future Updates (OTA)**

After users install your app, you can push updates **without rebuilding**:

```powershell
npx eas-cli update --branch production --message "Bug fixes"
```

This updates:
- JavaScript code
- React components
- Styling
- Assets

**No rebuild needed!** Updates deploy in seconds.

---

## 🐛 **Troubleshooting**

### **"Not logged in"**
```powershell
npx eas-cli login
```

### **"Build failed"**
Check the build logs in the terminal or on the Expo dashboard.

### **"Keystore already exists"**
That's fine! EAS will use the existing keystore automatically.

### **Build stuck**
- Free tier: 1 concurrent build
- Wait for other builds to finish
- Or cancel with: `npx eas-cli build:cancel [BUILD_ID]`

---

## 💡 **Pro Tips**

1. **Build both at once**: Run AAB build, then immediately run APK build. They'll queue and build sequentially.

2. **Check status anytime**:
   ```powershell
   npx eas-cli build:list
   ```

3. **Download from anywhere**: You can download builds from any computer once they're complete.

4. **Keep the keystore**: EAS stores it, but you can download a backup:
   ```powershell
   npx eas-cli credentials
   ```

---

## 📋 **Quick Reference**

```powershell
# Login
npx eas-cli login

# Build AAB (Play Store)
npx eas-cli build --profile production --platform android

# Build APK (Direct install)
npx eas-cli build --profile production-apk --platform android

# List builds
npx eas-cli build:list

# Download latest
npx eas-cli build:download --platform android --latest

# Publish OTA update
npx eas-cli update --branch production --message "Update message"
```

---

## 🎉 **Ready to Build!**

Open a **new PowerShell terminal** and run:

```powershell
cd c:\DevProjects\smasher\app-rn
npx eas-cli login
npx eas-cli build --profile production --platform android
```

**Build time**: ~10-15 minutes  
**Location**: EAS cloud servers  
**Output**: Production-ready AAB

Then build the APK:

```powershell
npx eas-cli build --profile production-apk --platform android
```

---

**That's it! Your app will be built on EAS servers with zero local dependencies.** 🚀
