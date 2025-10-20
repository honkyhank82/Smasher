# OTA Update Troubleshooting Guide

## Latest Update Published
- **Update Group ID**: `8f90ab36-a2b5-4c73-b202-72d4748e9d2b`
- **Runtime Version**: `1.0.3`
- **Branch**: production
- **Dashboard**: https://expo.dev/accounts/smashermain/projects/smasher-app/updates/8f90ab36-a2b5-4c73-b202-72d4748e9d2b

## What Changed
1. **Immediate Update Reload**: Updates now automatically reload the app after downloading (no manual restart needed)
2. **Manual Update Check**: Added "Check for Updates" button in Settings → About
3. **Better Logging**: Console logs show update status for debugging

## How to Get the Update

### Method 1: Automatic (Recommended)
1. **Force close** the app completely (swipe away from recent apps)
2. **Reopen** the app
3. The app will check for updates on launch
4. If an update is found, it will download and reload automatically
5. Check console logs for: `🔍 Checking for updates...` and `✅ Update downloaded, reloading app...`

### Method 2: Manual Check
1. Open the app
2. Go to **Settings** (gear icon in bottom nav)
3. Scroll to **About** section
4. Tap **"Check for Updates"**
4. If update is available, tap "Update Now"
5. App will download and reload automatically

## Troubleshooting

### Updates Not Showing Up?

#### 1. Check Runtime Version
The installed app must have runtime version `1.0.3`. To verify:
```bash
# Check what runtime version your installed app has
# This should match the runtime version in app.json
```

If your installed app has a different runtime version, you need to:
- **Rebuild the app** with `eas build`
- **Install the new build** on your devices
- Then OTA updates will work

#### 2. Verify Update Configuration
Check `app.json`:
```json
"updates": {
  "url": "https://u.expo.dev/edef8952-a01b-408f-abeb-e3922973df75"
},
"runtimeVersion": "1.0.3"
```

#### 3. Check Network Connection
- Ensure devices have internet connection
- OTA updates require network access
- Check firewall/proxy settings

#### 4. Clear App Data (Last Resort)
- Uninstall and reinstall the app
- This will force a fresh install with latest updates

### Console Logs to Look For

**Update Check Started:**
```
🔍 Checking for updates...
```

**Update Available:**
```
📥 Update available, downloading...
✅ Update downloaded, reloading app...
```

**No Update Available:**
```
✅ App is up to date
```

**Update Error:**
```
❌ Error checking for updates: [error message]
```

## Key Changes in Latest Update

### Version 1.0.11 (Current)
- ✅ Fixed OTA update reload mechanism
- ✅ Added manual "Check for Updates" button
- ✅ Improved update logging

### Version 1.0.10 (Previous)
- ✅ Fixed critical gender filter bug blocking all nearby users
- ✅ Added pull-to-refresh to all list screens
- ✅ Enabled real-time data (mock data disabled)

## When to Rebuild vs OTA Update

### Use OTA Update (Fast) ✅
- JavaScript/TypeScript code changes
- React component updates
- API endpoint changes
- UI/UX improvements
- Bug fixes in app logic

### Requires Full Rebuild (Slow) ⚠️
- Native dependency changes
- `app.json` configuration changes (except version)
- Runtime version changes
- New permissions
- Plugin additions/changes

## Current Status
- ✅ Backend deployed: https://smasher-api.fly.dev
- ✅ OTA update published to production branch
- ✅ Runtime version: 1.0.3
- ✅ Update mechanism: Automatic on app launch + Manual button in Settings

## Next Steps
1. Force close and reopen app on both devices
2. Check console logs for update messages
3. If no update detected, use "Check for Updates" button in Settings
4. Verify nearby users now appear (gender filter bug is fixed)
5. Test pull-to-refresh on all list screens
