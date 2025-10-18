# Fix Android Signing Key Mismatch - CRITICAL

## Problem
Your Android App Bundle is signed with the **debug keystore** instead of the production signing key that Google Play expects.

**Expected fingerprint:** `SHA1: 46:62:C9:05:BC:40:6B:48:08:FC:55:A7:A2:10:88:E5:A1:5B:B8:0D`  
**Your upload fingerprint:** `SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` (debug key)

## Root Cause
The `android/app/build.gradle` was configured to use `signingConfig signingConfigs.debug` for release builds, which is incorrect for production.

## Solution Applied

### ✅ Step 1: Fixed build.gradle (COMPLETED)
Removed the debug signing configuration from release builds. EAS Build will now handle signing properly.

### 🔧 Step 2: Configure EAS Credentials

You have **TWO OPTIONS**:

---

## OPTION A: Use Existing Google Play Signing Key (RECOMMENDED if app is already published)

If your app is already on Google Play, you MUST use the existing signing key. Follow these steps:

### 1. Download the Upload Key from Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (SMASHER)
3. Navigate to **Setup** → **App signing**
4. Under "Upload key certificate", click **Download upload key certificate** (PEM format)
5. Save it as `upload-cert.pem`

### 2. Check if you have the original keystore

If you previously uploaded to Play Store, you should have a keystore file. Look for:
- `smasher-release.keystore`
- `upload-keystore.jks`
- Any `.keystore` or `.jks` file

**If you have the keystore:**

```powershell
# Navigate to project
cd c:\DevProjects\smasher\app-rn

# Configure EAS to use your existing keystore
npx eas-cli credentials
```

Then select:
1. **Android**
2. **production**
3. **Set up a new keystore**
4. **Upload an existing keystore**
5. Provide the path to your keystore file
6. Enter the keystore password
7. Enter the key alias (usually `upload` or `smasher-key`)
8. Enter the key password

**If you DON'T have the keystore but have the PEM certificate:**

You'll need to contact Google Play support to reset your upload key. This is a complex process.

---

## OPTION B: Reset Everything (ONLY if app is NOT yet published)

⚠️ **WARNING:** Only use this if your app has NEVER been successfully uploaded to Google Play Store!

### 1. Clear EAS Credentials

```powershell
cd c:\DevProjects\smasher\app-rn

# Open credentials manager
npx eas-cli credentials
```

Select:
1. **Android**
2. **production**
3. **Remove all credentials**

### 2. Let Google Play Manage App Signing

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to **Setup** → **App signing**
4. If prompted, choose **"Let Google manage and protect your app signing key"**
5. This will allow Google to generate a new signing key

### 3. Build New AAB with EAS

```powershell
# Build production AAB
npx eas-cli build --platform android --profile production

# Wait for build to complete (10-20 minutes)
# EAS will automatically generate new credentials
```

### 4. Download and Upload to Play Store

```powershell
# Download the AAB when build completes
# The build URL will be shown in the terminal

# Or download from: https://expo.dev/accounts/[your-account]/projects/smasher-app/builds
```

Then upload the new AAB to Google Play Console.

---

## OPTION C: Use App Signing by Google Play (RECOMMENDED for new apps)

This is the modern approach recommended by Google:

### 1. Enable App Signing in Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (SMASHER)
3. Navigate to **Setup** → **App signing**
4. If not already enabled, click **"Continue"** to let Google manage your app signing key

### 2. Clear Old EAS Credentials

```powershell
cd c:\DevProjects\smasher\app-rn

npx eas-cli credentials
```

Select:
1. **Android**
2. **production**
3. **Keystore: Manage everything needed to build your project**
4. **Remove keystore**

### 3. Build with EAS (it will generate new upload key)

```powershell
# Build production AAB
npx eas-cli build --platform android --profile production
```

EAS will:
- Detect you don't have credentials
- Generate a new upload keystore
- Sign the AAB with it
- Store credentials securely

### 4. Upload to Play Console

1. Download the AAB from the EAS build
2. Upload to Google Play Console
3. Google will re-sign it with their app signing key
4. The upload key fingerprint will be registered

---

## Verification Steps

After building with the correct signing:

### 1. Check the AAB signature

```powershell
# Extract the signing certificate from AAB
# First, unzip the AAB
Expand-Archive -Path app-release.aab -DestinationPath aab-contents

# Check the certificate
keytool -printcert -file aab-contents/META-INF/CERT.RSA
```

### 2. Verify fingerprint matches

The SHA1 fingerprint should match what Google Play expects:
`SHA1: 46:62:C9:05:BC:40:6B:48:08:FC:55:A7:A2:10:88:E5:A1:5B:B8:0D`

---

## Quick Commands Reference

```powershell
# Navigate to project
cd c:\DevProjects\smasher\app-rn

# Manage credentials
npx eas-cli credentials

# Build production AAB
npx eas-cli build --platform android --profile production

# Check build status
npx eas-cli build:list

# View credentials
npx eas-cli credentials -p android
```

---

## Important Notes

1. **Never lose your keystore!** If you lose it and your app is published, you cannot update your app.

2. **Google Play App Signing** is the safest option - Google keeps your signing key secure.

3. **Upload key vs Signing key:**
   - **Upload key:** Used to sign AABs you upload to Play Console
   - **Signing key:** Used by Google to sign the final APK distributed to users
   - With App Signing by Google Play, these are different keys

4. **First-time setup:** If this is your first upload, Google will automatically set up App Signing.

5. **Existing app:** If you've already uploaded a version, you MUST use the same signing key.

---

## Next Steps

1. **Determine which option applies to you:**
   - Has the app been successfully uploaded to Play Store before? → Use OPTION A
   - Is this the first upload? → Use OPTION C
   - Need to start fresh? → Use OPTION B (with caution)

2. **Follow the steps for your chosen option**

3. **Build new AAB with EAS**

4. **Upload to Google Play Console**

5. **Verify the upload succeeds**

---

## Troubleshooting

### "App Bundle is signed with the wrong key" (again)
- You're still using the wrong keystore
- Clear EAS credentials and rebuild
- Make sure you're using `npx eas-cli build`, not local gradle builds

### "Upload key certificate doesn't match"
- The upload key in EAS doesn't match what Play Console expects
- Download the upload certificate from Play Console
- Configure EAS to use the matching keystore

### "Cannot find keystore"
- If you lost your original keystore and app is published, contact Google Play support
- They can help you reset your upload key (but not the signing key)

---

## Files Modified

- ✅ `android/app/build.gradle` - Removed debug signing from release builds

## Files to Check

- `android/gradle.properties` - Should NOT contain signing passwords
- `.gitignore` - Should include `*.keystore`, `*.jks`, `google-play-service-account.json`

---

**Last Updated:** 2025-01-17  
**Status:** Ready to rebuild with proper signing
