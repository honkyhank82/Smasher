# Fix Google Play Console Upload Errors

## Current Issues

```
❌ You need to upload an APK or Android App Bundle for this app
❌ You can't rollout this release because it doesn't allow any existing users to upgrade
❌ This release does not add or remove any app bundles
```

## Root Cause

Your app's **versionCode** is still `1`, which is the same as your previous release. Google Play requires each new release to have a higher versionCode than all previous releases.

## Solution

### Step 1: Update Version Code

Edit `app-rn/android/app/build.gradle`:

**Current:**
```gradle
versionCode 1
versionName "1.0.0"
```

**Change to:**
```gradle
versionCode 2
versionName "1.0.1"
```

### Step 2: Rebuild the App Bundle

Run the build script:

```powershell
cd c:\DevProjects\smasher
.\build-release-aab.ps1
```

Or manually:

```powershell
cd app-rn\android
.\gradlew bundleRelease
```

The new AAB will be at:
```
app-rn\android\app\build\outputs\bundle\release\app-release.aab
```

### Step 3: Upload to Play Console

1. Go to [Play Console](https://play.google.com/console)
2. Select your app
3. Go to **Release > Production** (or your target track)
4. Click **Create new release**
5. Upload the new `app-release.aab` file
6. Add release notes (use `RELEASE_NOTES_PLAY_CONSOLE.md`)
7. Review and rollout

## Version Code Guidelines

### Current Status
- **versionCode:** 1 (needs increment)
- **versionName:** "1.0.0"

### Recommended Update
- **versionCode:** 2
- **versionName:** "1.0.1" (security patch)

### Future Updates
Each release must have a **higher versionCode**:
- Minor update: `versionCode 3`, `versionName "1.0.2"`
- Feature update: `versionCode 4`, `versionName "1.1.0"`
- Major update: `versionCode 5`, `versionName "2.0.0"`

## Version Naming Convention

```
versionName: "MAJOR.MINOR.PATCH"
```

- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes, security updates (1.0.0 → 1.0.1)

For this Play Integrity security update: **1.0.0 → 1.0.1**

## Quick Fix Commands

```powershell
# 1. Update version in build.gradle (manual edit required)
# Change versionCode from 1 to 2
# Change versionName from "1.0.0" to "1.0.1"

# 2. Clean previous builds
cd c:\DevProjects\smasher\app-rn\android
.\gradlew clean

# 3. Build new release
.\gradlew bundleRelease

# 4. Verify the build
ls app\build\outputs\bundle\release\
```

## Verification Checklist

Before uploading:

- [ ] versionCode incremented (1 → 2)
- [ ] versionName updated (1.0.0 → 1.0.1)
- [ ] New AAB file built successfully
- [ ] AAB file size is reasonable (check for bloat)
- [ ] Release notes prepared
- [ ] Signing configuration correct

## Common Errors & Solutions

### "This release does not add or remove any app bundles"
**Cause:** Trying to create a release without uploading a new AAB  
**Solution:** Upload the newly built AAB file with incremented versionCode

### "Can't rollout - no upgrade path"
**Cause:** versionCode is same or lower than previous release  
**Solution:** Increment versionCode to a higher number

### "APK or App Bundle required"
**Cause:** No file uploaded to the release  
**Solution:** Upload the AAB file from the build output

### "Version code already exists"
**Cause:** This versionCode was used in a previous release (even if unpublished)  
**Solution:** Use a higher versionCode (skip the conflicting number)

## Testing Before Upload

### Internal Testing Track (Recommended)

1. Create release in **Internal Testing** track first
2. Add test users
3. Test the integrity features
4. Verify no crashes or issues
5. Then promote to Production

### Commands for Internal Testing Build

```powershell
# Same build process, just upload to Internal Testing track
cd c:\DevProjects\smasher\app-rn\android
.\gradlew bundleRelease
```

## After Upload

### Monitor for Issues

1. Check Play Console for:
   - Pre-launch reports
   - Crash reports
   - ANR (App Not Responding) reports

2. Monitor server logs for:
   - Integrity verification success rate
   - Failed verification attempts
   - Replay attack attempts

### Rollout Strategy

**Option 1: Staged Rollout (Recommended)**
- Start with 10% of users
- Monitor for 24 hours
- Increase to 25%, 50%, 100% gradually

**Option 2: Full Rollout**
- Release to 100% immediately
- Higher risk but faster deployment

## Troubleshooting

### Build Fails

```powershell
# Clean and retry
cd app-rn\android
.\gradlew clean
.\gradlew bundleRelease --stacktrace
```

### Signing Issues

Check `gradle.properties`:
```properties
SMASHER_UPLOAD_STORE_FILE=smasher-release-key.keystore
SMASHER_UPLOAD_STORE_PASSWORD=your_password
SMASHER_UPLOAD_KEY_ALIAS=smasher-key
SMASHER_UPLOAD_KEY_PASSWORD=your_password
```

### Upload Fails

- Check file size (max 150MB for AAB)
- Verify signing certificate matches previous releases
- Ensure versionCode is higher than all previous versions

## Need Help?

1. Check Play Console error messages (they're usually specific)
2. Review build logs for errors
3. Verify signing configuration
4. Test with Internal Testing track first

---

**Next Steps:**
1. ✅ Update versionCode to 2
2. ✅ Update versionName to "1.0.1"
3. ✅ Build new AAB
4. ✅ Upload to Play Console
5. ✅ Add release notes
6. ✅ Review and publish
