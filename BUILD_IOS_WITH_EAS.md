# Build iOS App with Expo EAS (from Windows)

**No Mac required!** Build iOS apps from Windows using Expo's cloud build service.

---

## Step 1: Install EAS CLI & Login

Run the setup script:

```powershell
.\setup-expo-eas.ps1
```

This will:
1. Install EAS CLI globally
2. Help you create an Expo account (if needed)
3. Log you in
4. Initialize EAS in your project

**Or manually:**

```powershell
# Install EAS CLI
npm install -g eas-cli

# Login (or sign up at https://expo.dev/signup)
eas login

# Initialize
cd app-rn
eas init
```

---

## Step 2: Build iOS App

### Option A: Simulator Build (Free, No Apple Account Needed)

Perfect for testing on a Mac simulator:

```powershell
cd app-rn
eas build --platform ios --profile development
```

**What you get:**
- `.tar.gz` file
- Can run on iOS Simulator (requires Mac to run)
- Free unlimited builds

### Option B: Device Build (Requires Apple Developer Account - $99/year)

For testing on real iPhone:

```powershell
cd app-rn
eas build --platform ios --profile preview
```

**What you get:**
- `.ipa` file
- Can install on real devices via TestFlight or Apple Configurator
- Requires Apple Developer account

### Option C: App Store Build (Requires Apple Developer Account)

For submitting to App Store:

```powershell
cd app-rn
eas build --platform ios --profile production
```

**What you get:**
- `.ipa` file ready for App Store
- Automatically uploaded to App Store Connect (if configured)

---

## Step 3: Monitor Build Progress

After running the build command:

1. EAS will upload your code to Expo's servers
2. Build will start in the cloud
3. You'll get a URL to monitor progress
4. Build takes 10-20 minutes

**Check build status:**
```powershell
eas build:list
```

**View build logs:**
```powershell
eas build:view
```

---

## Step 4: Download & Install

### For Simulator Build:

1. Download the `.tar.gz` file from the build URL
2. Extract it
3. On a Mac, drag the `.app` to the simulator

### For Device Build:

**Option A: TestFlight (Recommended)**
1. Build will be uploaded to App Store Connect
2. Add testers in App Store Connect
3. Testers install via TestFlight app

**Option B: Direct Install**
1. Download the `.ipa` file
2. Use Apple Configurator 2 (Mac) to install
3. Or use a service like Diawi.com

---

## Apple Developer Account Setup

### Do You Need It?

- **Simulator builds:** No ❌
- **Device testing:** Yes ✅ ($99/year)
- **TestFlight:** Yes ✅ ($99/year)
- **App Store:** Yes ✅ ($99/year)

### How to Get It:

1. Go to https://developer.apple.com/programs/
2. Click "Enroll"
3. Pay $99/year
4. Wait for approval (1-2 days)

### Configure in EAS:

```powershell
cd app-rn
eas credentials
```

Follow prompts to:
- Add Apple ID
- Select team
- Generate certificates
- Create provisioning profiles

---

## Build Profiles Explained

### `development` (Simulator)
- **Cost:** Free
- **Output:** `.tar.gz` with `.app`
- **Use:** Testing on iOS Simulator
- **Requires:** Nothing

### `preview` (Device Testing)
- **Cost:** Free builds, but needs Apple Developer ($99/year)
- **Output:** `.ipa` file
- **Use:** Testing on real iPhones
- **Requires:** Apple Developer account

### `production` (App Store)
- **Cost:** Free builds, but needs Apple Developer ($99/year)
- **Output:** `.ipa` file
- **Use:** App Store submission
- **Requires:** Apple Developer account + App Store Connect setup

---

## Troubleshooting

### "No credentials found"

**Solution:**
```powershell
cd app-rn
eas credentials
```

Select "iOS" and follow prompts to set up credentials.

### "Bundle identifier already in use"

**Solution:**
Change bundle identifier in `app.json`:
```json
"ios": {
  "bundleIdentifier": "com.yourname.smasher"
}
```

### "Build failed: Missing permissions"

**Solution:**
All permissions are already configured in `app.json`. If you see this error, check the build logs for specific missing permissions.

### "Expo account limit reached"

**Free tier limits:**
- 30 builds/month for iOS
- Unlimited Android builds

**Solution:**
- Wait for next month
- Or upgrade to paid plan ($29/month)

---

## Cost Breakdown

### Expo EAS Build:

**Free Tier:**
- 30 iOS builds/month
- Unlimited Android builds
- Good for development

**Paid Plans:**
- **Production:** $29/month (unlimited builds)
- **Enterprise:** $99/month (priority builds, more features)

### Apple:

- **Developer Account:** $99/year (required for device testing & App Store)

### Total to Launch:

- **Development/Testing:** $0 (use simulator)
- **Device Testing:** $99/year (Apple Developer)
- **Production:** $99/year (Apple) + $0-29/month (Expo)

---

## Quick Commands Reference

```powershell
# Login
eas login

# Build for simulator (free)
cd app-rn
eas build --platform ios --profile development

# Build for device (needs Apple account)
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production

# Check build status
eas build:list

# View build details
eas build:view

# Configure credentials
eas credentials

# Submit to App Store (after production build)
eas submit --platform ios
```

---

## Next Steps

1. **Run setup script:**
   ```powershell
   .\setup-expo-eas.ps1
   ```

2. **Start a simulator build (free):**
   ```powershell
   cd app-rn
   eas build --platform ios --profile development
   ```

3. **Wait for build** (10-20 minutes)

4. **Download and test** on a Mac simulator

5. **If you want device testing:**
   - Get Apple Developer account ($99/year)
   - Run: `eas credentials` to set up
   - Build with: `eas build --platform ios --profile preview`

---

## Resources

- **Expo EAS Docs:** https://docs.expo.dev/build/introduction/
- **EAS Build Pricing:** https://expo.dev/pricing
- **Apple Developer:** https://developer.apple.com/programs/
- **TestFlight:** https://developer.apple.com/testflight/

---

**Ready to build?** Run `.\setup-expo-eas.ps1` to get started!
