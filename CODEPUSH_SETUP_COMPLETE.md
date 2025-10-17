# CodePush Setup - Complete Guide

## ✅ What's Been Done

### 1. Package Installation
- ✅ `react-native-code-push` installed
- ✅ Added to `package.json` dependencies

### 2. Native Integration (Android)
- ✅ CodePush imported in `MainApplication.kt`
- ✅ `getJSBundleFile()` override enabled
- ✅ CodePush added to `settings.gradle`
- ✅ CodePush dependency added to `app/build.gradle`

### 3. React Native Integration
- ✅ CodePush configured in `App.tsx`
- ✅ Auto-update on app resume enabled
- ✅ 5-minute background check configured

### 4. Deployment Script
- ✅ `deploy-update.ps1` script ready
- ✅ Supports staging and production deployments
- ✅ Mandatory update flag support

---

## 🎯 What You Need to Do Next

### Step 1: Install AppCenter CLI (One-time setup)

```powershell
npm install -g appcenter-cli
```

### Step 2: Login to AppCenter

```powershell
appcenter login
```

This will open your browser. Login with your Microsoft/GitHub account.

### Step 3: Create Your App in AppCenter

```powershell
# Create the app
appcenter apps create -d Smasher-Android -o Android -p React-Native

# This will give you an app name like: YOUR_USERNAME/Smasher-Android
```

**Important:** Note down your app name (format: `YOUR_USERNAME/Smasher-Android`)

### Step 4: Create CodePush Deployments

```powershell
# Create Staging deployment
appcenter codepush deployment add -a YOUR_USERNAME/Smasher-Android Staging

# Create Production deployment
appcenter codepush deployment add -a YOUR_USERNAME/Smasher-Android Production
```

### Step 5: Get Your Deployment Keys

```powershell
appcenter codepush deployment list -a YOUR_USERNAME/Smasher-Android -k
```

You'll see output like:
```
┌────────────┬──────────────────────────────────────────────────────────┐
│ Name       │ Key                                                      │
├────────────┼──────────────────────────────────────────────────────────┤
│ Staging    │ abc123-your-staging-key-here                             │
├────────────┼──────────────────────────────────────────────────────────┤
│ Production │ xyz789-your-production-key-here                          │
└────────────┴──────────────────────────────────────────────────────────┘
```

**Copy both keys!**

### Step 6: Add Keys to build.gradle

Edit: `app-rn\android\app\build.gradle`

Find lines 48 and 55, replace the empty strings with your keys:

```gradle
buildTypes {
    debug {
        signingConfig signingConfigs.debug
        resValue "string", "CodePushDeploymentKey", '"YOUR-STAGING-KEY-HERE"'
    }
    release {
        signingConfig signingConfigs.release
        minifyEnabled enableProguardInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        resValue "string", "CodePushDeploymentKey", '"YOUR-PRODUCTION-KEY-HERE"'
    }
}
```

**Critical:** Keep the double quotes! Format: `'"key-here"'`

### Step 7: Update Deployment Script

Edit: `app-rn\scripts\deploy-update.ps1`

Line 10, replace `YOUR_USERNAME` with your actual AppCenter username:

```powershell
[string]$appName = "YOUR_USERNAME/Smasher-Android"
```

### Step 8: Rebuild the App

```powershell
cd C:\DevProjects\smasher\app-rn
npx react-native run-android
```

---

## 🧪 Testing CodePush

### Test 1: Make a Simple Change

Edit any screen, for example `app-rn\src\screens\SettingsScreen.tsx`:

```typescript
<Text style={styles.title}>Settings v2.0</Text>
```

### Test 2: Deploy to Staging

```powershell
cd C:\DevProjects\smasher\app-rn
.\scripts\deploy-update.ps1 -message "Testing CodePush"
```

### Test 3: Verify Update

1. **Close your app completely** (swipe away from recent apps)
2. **Wait 5 minutes** (or put app in background for 5 min)
3. **Reopen the app**
4. Your change should appear! 🎉

### Test 4: Check Deployment Status

```powershell
appcenter codepush deployment list -a YOUR_USERNAME/Smasher-Android
```

You should see:
- Number of active users
- Install metrics
- Rollout percentage

---

## 📦 Daily Usage

### Deploy to Staging (Testing)
```powershell
.\scripts\deploy-update.ps1 -message "Fixed login bug"
```

### Deploy to Production (Live Users)
```powershell
.\scripts\deploy-update.ps1 -message "Fixed login bug" -production
```

### Deploy Critical Fix (Immediate Update)
```powershell
.\scripts\deploy-update.ps1 -message "Critical security fix" -production -mandatory
```

---

## 📊 Monitoring

### View Deployment History
```powershell
appcenter codepush deployment history -a YOUR_USERNAME/Smasher-Android Production
```

### Check Current Status
```powershell
appcenter codepush deployment list -a YOUR_USERNAME/Smasher-Android
```

### Rollback if Needed
```powershell
appcenter codepush rollback -a YOUR_USERNAME/Smasher-Android Production
```

---

## ⚠️ Important Notes

### CodePush CAN Update:
- ✅ JavaScript/TypeScript code
- ✅ React components
- ✅ Styles and CSS
- ✅ Images and assets
- ✅ Business logic

### CodePush CANNOT Update:
- ❌ Native code (Java/Kotlin)
- ❌ New permissions in AndroidManifest.xml
- ❌ Version number changes
- ❌ New native dependencies
- ❌ Gradle configuration changes

For these changes, you must publish a new version to Google Play Store.

---

## 🔒 Security Best Practices

1. **Never commit deployment keys** to git
2. **Use Staging for testing** before Production
3. **Test mandatory updates carefully** (they force immediate restart)
4. **Monitor rollout metrics** after each deployment
5. **Keep rollback ready** for critical issues

---

## 🎯 Quick Reference

| Action | Command |
|--------|---------|
| Deploy to Staging | `.\scripts\deploy-update.ps1 -message "msg"` |
| Deploy to Production | `.\scripts\deploy-update.ps1 -message "msg" -production` |
| Mandatory Update | Add `-mandatory` flag |
| View History | `appcenter codepush deployment history -a YOUR_USERNAME/Smasher-Android Production` |
| Rollback | `appcenter codepush rollback -a YOUR_USERNAME/Smasher-Android Production` |

---

## ✅ Checklist

Before going live, ensure:

- [ ] AppCenter CLI installed
- [ ] Logged into AppCenter
- [ ] App created in AppCenter
- [ ] Staging and Production deployments created
- [ ] Deployment keys added to build.gradle
- [ ] App name updated in deploy-update.ps1
- [ ] App rebuilt with new keys
- [ ] Test deployment successful
- [ ] Update received on device

---

## 🚀 You're Ready!

Once you complete the steps above, your app will have:
- **Instant updates** without Play Store approval
- **Staged rollouts** for safe deployments
- **Rollback capability** for emergencies
- **Update metrics** and monitoring

Users will receive updates automatically within 5 minutes of backgrounding the app!
