# Android App Signing Setup Guide

## Step 1: Generate Release Keystore

Open PowerShell and run:

```powershell
cd app-rn\android\app

# Generate keystore
keytool -genkeypair -v -storetype PKCS12 -keystore smasher-release.keystore -alias smasher-key -keyalg RSA -keysize 2048 -validity 10000
```

**You will be prompted for:**
- Keystore password (choose a strong password)
- Key password (can be same as keystore password)
- Your name
- Organization unit
- Organization name
- City
- State
- Country code

**IMPORTANT:** Save these passwords securely! You'll need them for every release.

## Step 2: Store Keystore Securely

**Move keystore to safe location:**
```powershell
# Keep it in android/app/ directory (already in .gitignore)
# OR move to a secure location outside the project
```

**⚠️ NEVER commit the keystore to Git!**

## Step 3: Configure Gradle Properties

Edit `android/gradle.properties` and add:

```properties
# Signing Configuration
SMASHER_RELEASE_STORE_FILE=smasher-release.keystore
SMASHER_RELEASE_KEY_ALIAS=smasher-key
SMASHER_RELEASE_STORE_PASSWORD=your_keystore_password_here
SMASHER_RELEASE_KEY_PASSWORD=your_key_password_here
```

**⚠️ NEVER commit gradle.properties with real passwords!**

## Step 4: Update build.gradle

The signing configuration is already set up in `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('SMASHER_RELEASE_STORE_FILE')) {
                storeFile file(SMASHER_RELEASE_STORE_FILE)
                storePassword SMASHER_RELEASE_STORE_PASSWORD
                keyAlias SMASHER_RELEASE_KEY_ALIAS
                keyPassword SMASHER_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Step 5: Verify Signing

Build a signed APK:

```powershell
cd android
.\gradlew assembleRelease
```

Verify the APK is signed:

```powershell
# Check signature
keytool -printcert -jarfile app\build\outputs\apk\release\app-release.apk
```

## Step 6: Build App Bundle for Play Store

```powershell
cd android
.\gradlew bundleRelease
```

Output: `app/build/outputs/bundle/release/app-release.aab`

## Security Best Practices

### DO:
✅ Use strong passwords (16+ characters)
✅ Store keystore in a secure location
✅ Back up keystore in multiple secure locations
✅ Use environment variables for CI/CD
✅ Keep passwords in a password manager

### DON'T:
❌ Commit keystore to Git
❌ Commit passwords to Git
❌ Share keystore publicly
❌ Use weak passwords
❌ Lose the keystore (you can't recover it!)

## Backup Your Keystore

**Create backups:**
```powershell
# Copy to secure cloud storage (encrypted)
# Copy to external drive
# Store in password manager
```

**⚠️ If you lose your keystore, you cannot update your app on Play Store!**

## For CI/CD (GitHub Actions, etc.)

Store keystore as base64:

```powershell
# Encode keystore
[Convert]::ToBase64String([IO.File]::ReadAllBytes("smasher-release.keystore")) | Out-File keystore.txt
```

Add to GitHub Secrets:
- `KEYSTORE_BASE64` - The base64 encoded keystore
- `KEYSTORE_PASSWORD` - Keystore password
- `KEY_ALIAS` - Key alias (smasher-key)
- `KEY_PASSWORD` - Key password

## Troubleshooting

### "keystore was tampered with, or password was incorrect"
- Check your passwords in gradle.properties
- Ensure keystore file path is correct

### "Could not find or load main class"
- Ensure Java is installed and in PATH
- Try using full path to keytool

### "Failed to read key"
- Key alias might be wrong
- Try listing keys: `keytool -list -keystore smasher-release.keystore`

## Keystore Information

To view keystore details:

```powershell
keytool -list -v -keystore smasher-release.keystore
```

To change keystore password:

```powershell
keytool -storepasswd -keystore smasher-release.keystore
```

To change key password:

```powershell
keytool -keypasswd -alias smasher-key -keystore smasher-release.keystore
```

## Play Store Upload Key

Google Play now uses App Signing. You can:

1. **Let Google manage signing** (recommended)
   - Upload your AAB
   - Google generates and manages the signing key
   - You keep your upload key

2. **Use your own signing key**
   - More control but more responsibility
   - You must never lose the keystore

## Quick Reference

| File | Location | Commit to Git? |
|------|----------|----------------|
| `smasher-release.keystore` | `android/app/` | ❌ NO |
| `gradle.properties` (with passwords) | `android/` | ❌ NO |
| `build.gradle` | `android/app/` | ✅ YES |
| `proguard-rules.pro` | `android/app/` | ✅ YES |

## Next Steps

1. ✅ Generate keystore
2. ✅ Configure gradle.properties
3. ✅ Build signed APK/AAB
4. ✅ Test installation
5. ✅ Back up keystore
6. ✅ Upload to Play Store

---

**Remember: Losing your keystore means you cannot update your app!**
