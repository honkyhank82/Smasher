# CodePush Final Setup Steps

✅ **Already Done:**
- CodePush package installed
- App.tsx configured
- build.gradle updated
- MainApplication.kt updated

## 🎯 Next Steps (5 minutes):

### Step 1: Get Your Deployment Keys

In AppCenter, run this command:

```powershell
appcenter codepush deployment list -a YOUR_USERNAME/Smasher-Android -k
```

Replace `YOUR_USERNAME` with your AppCenter username.

You'll get output like:
```
┌────────────┬──────────────────────────────────────┐
│ Name       │ Key                                  │
├────────────┼──────────────────────────────────────┤
│ Staging    │ abc123-staging-key-here              │
├────────────┼──────────────────────────────────────┤
│ Production │ xyz789-production-key-here           │
└────────────┴──────────────────────────────────────┘
```

### Step 2: Add Keys to build.gradle

Edit: `app-rn\android\app\build.gradle`

Find these lines (around line 44-54):

```gradle
buildTypes {
    debug {
        signingConfig signingConfigs.debug
        // CodePush Staging key for testing updates
        resValue "string", "CodePushDeploymentKey", '""'
    }
    release {
        signingConfig signingConfigs.release
        minifyEnabled enableProguardInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        // CodePush Production key
        resValue "string", "CodePushDeploymentKey", '""'
    }
}
```

**Replace the empty strings with your keys:**

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

**Important:** Keep the double quotes! It should look like: `'"key-here"'`

### Step 3: Rebuild the App

```powershell
cd C:\DevProjects\smasher\app-rn
npx react-native run-android
```

### Step 4: Test It!

**Make a test change:**

Edit `app-rn\src\screens\SettingsScreen.tsx` - change any text, like:

```typescript
<Text style={styles.title}>Settings v2</Text>
```

**Deploy the update:**

```powershell
.\scripts\deploy-update.ps1 -message "Testing CodePush"
```

**See the update:**

1. Close your app completely (swipe away from recent apps)
2. Wait 5 minutes
3. Reopen the app
4. Your change should be there! 🎉

## 🚀 Daily Usage:

**Every time you make changes:**

```powershell
# For testing (Staging)
.\scripts\deploy-update.ps1 -message "Your change description"

# For live users (Production)
.\scripts\deploy-update.ps1 -message "Your change description" -production

# For critical fixes (forces immediate update)
.\scripts\deploy-update.ps1 -message "Critical fix" -production -mandatory
```

## 📊 Monitor Updates:

```powershell
# View deployment history
appcenter codepush deployment history -a YOUR_USERNAME/Smasher-Android Production

# Check current deployments
appcenter codepush deployment list -a YOUR_USERNAME/Smasher-Android
```

## 🔄 Rollback if Needed:

```powershell
appcenter codepush rollback -a YOUR_USERNAME/Smasher-Android Production
```

## ⚠️ Remember:

**CodePush works for:**
- ✅ JavaScript/TypeScript changes
- ✅ React components
- ✅ Styles
- ✅ Images and assets

**Still need Play Store for:**
- ❌ Native code changes
- ❌ New permissions
- ❌ Version number changes
- ❌ New native dependencies

## 🎯 Summary:

1. Get deployment keys from AppCenter
2. Add keys to build.gradle
3. Rebuild app
4. Make changes and deploy with the script
5. Users get updates automatically!

---

**That's it! Your app now has instant updates! 🚀**
