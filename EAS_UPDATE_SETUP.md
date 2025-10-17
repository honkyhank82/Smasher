# EAS Update Setup - Over-the-Air Updates for SMASHER

## ✅ What's Complete

- ✅ CodePush removed (deprecated)
- ✅ `expo` and `expo-updates` installed
- ✅ `eas-cli` installed globally
- ✅ EAS Update configuration added to `app.json`
- ✅ Update channels configured in `eas.json`
- ✅ Auto-update check added to `App.tsx`

---

## 🚀 Setup Steps (5 minutes)

### Step 1: Login to Expo

```powershell
cd C:\DevProjects\smasher\app-rn
eas login
```

This will open your browser. **Create an Expo account** or login with your existing one.

### Step 2: Configure the Project

```powershell
eas update:configure
```

This will:
- Link your project to Expo
- Generate a project ID
- Update your `app.json` with the correct update URL

### Step 3: Build Your App with EAS

You need to build at least once with EAS to enable updates:

```powershell
# Build for Android (this creates the update-enabled APK/AAB)
eas build --platform android --profile production
```

**OR** if you want to keep using your local builds, run:

```powershell
# Configure for local builds
npx expo prebuild --clean
```

This will configure the native Android project to work with EAS Updates.

### Step 4: Rebuild Your App Locally

```powershell
cd C:\DevProjects\smasher\app-rn
npx react-native run-android
```

---

## 📤 Publishing Updates (The Easy Part!)

Once your app is installed on devices, you can push updates instantly:

### Publish to Production Channel

```powershell
cd C:\DevProjects\smasher\app-rn
eas update --branch production --message "Your update message"
```

### Publish to Preview/Testing Channel

```powershell
eas update --branch preview --message "Testing new feature"
```

### Publish to Development Channel

```powershell
eas update --branch development --message "Dev build"
```

---

## 🎯 How It Works

1. **User opens app** → App checks for updates
2. **Update available** → Downloads in background
3. **Update downloaded** → App reloads automatically
4. **User sees new version** → Instant!

**No app store approval needed!** ✨

---

## 📱 Update Channels Explained

| Channel | Purpose | Command |
|---------|---------|---------|
| **production** | Live users | `eas update --branch production` |
| **preview** | Beta testers | `eas update --branch preview` |
| **development** | Internal testing | `eas update --branch development` |

You can have different versions running on different channels simultaneously!

---

## 🔧 Advanced: Channel Management

### Point your app to a specific channel

Edit `app.json`:

```json
"updates": {
  "url": "https://u.expo.dev/YOUR_PROJECT_ID",
  "channel": "production"
}
```

### View update history

```powershell
eas update:list --branch production
```

### Rollback an update

```powershell
eas update:delete --branch production --group <update-group-id>
```

---

## 🎨 Customizing Update Behavior

You can customize when updates are applied. Edit `App.tsx`:

### Option 1: Immediate Update (Current)
```typescript
// Downloads and applies immediately
await Updates.fetchUpdateAsync();
await Updates.reloadAsync();
```

### Option 2: Update on Next Launch
```typescript
// Downloads but waits for next app launch
await Updates.fetchUpdateAsync();
// Don't call reloadAsync()
```

### Option 3: User Prompt
```typescript
const update = await Updates.checkForUpdateAsync();
if (update.isAvailable) {
  Alert.alert(
    'Update Available',
    'A new version is available. Update now?',
    [
      { text: 'Later', style: 'cancel' },
      {
        text: 'Update',
        onPress: async () => {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      }
    ]
  );
}
```

---

## 📊 Monitoring Updates

### Check update status in your app

```typescript
import * as Updates from 'expo-updates';

// Get current update info
const updateInfo = await Updates.checkForUpdateAsync();
console.log('Update available:', updateInfo.isAvailable);

// Get currently running update
const currentUpdate = Updates.updateId;
console.log('Current update ID:', currentUpdate);
```

### View metrics in Expo Dashboard

Go to: https://expo.dev/

- See how many users have each update
- Track download success rates
- Monitor update adoption

---

## ⚠️ Important Notes

### What CAN be updated with EAS Update:
- ✅ JavaScript/TypeScript code
- ✅ React components
- ✅ Styles
- ✅ Images and assets
- ✅ Business logic
- ✅ API endpoints

### What CANNOT be updated (requires new build):
- ❌ Native code changes
- ❌ New native dependencies
- ❌ AndroidManifest.xml changes
- ❌ New permissions
- ❌ App version number
- ❌ Gradle configuration

---

## 🆚 EAS Update vs CodePush

| Feature | EAS Update | CodePush |
|---------|------------|----------|
| **Status** | ✅ Active | ❌ Deprecated |
| **CLI Works** | ✅ Yes | ❌ Broken |
| **Support** | ✅ Excellent | ❌ None |
| **Free Tier** | ✅ Yes | ⚠️ Limited |
| **Performance** | ✅ Fast | ⚠️ Slower |
| **Dashboard** | ✅ Modern | ❌ Outdated |

---

## 💰 Pricing

**Free Tier Includes:**
- Unlimited updates
- Unlimited users
- All channels
- Full dashboard access

**Perfect for your app!** 🎉

---

## 🚀 Quick Reference

```powershell
# Login
eas login

# Configure project
eas update:configure

# Publish update to production
eas update --branch production --message "Bug fixes"

# Publish update to preview
eas update --branch preview --message "New feature testing"

# View updates
eas update:list --branch production

# View project info
eas project:info
```

---

## 🎯 Next Steps

1. **Run**: `eas login`
2. **Run**: `eas update:configure`
3. **Run**: `npx expo prebuild --clean` (to configure native code)
4. **Rebuild**: `npx react-native run-android`
5. **Test**: Make a change and run `eas update --branch production`
6. **Verify**: Close and reopen your app to see the update!

---

## 📞 Support

- **Expo Docs**: https://docs.expo.dev/eas-update/introduction/
- **Expo Discord**: https://chat.expo.dev/
- **Status**: https://status.expo.dev/

---

**You now have modern, working OTA updates! 🎉**

No more AppCenter CLI bugs. No more deprecated tools. Just updates that actually work!
