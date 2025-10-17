# Android Launch Checklist

**Goal:** Get Smasher app live on Google Play Store

---

## ✅ COMPLETED

- [x] Backend deployed to Fly.io
- [x] Database configured
- [x] Cloudflare R2 configured
- [x] Resend email configured
- [x] Debug APK built (`SmasherApp-Debug.apk`)
- [x] App pointing to production API

---

## 🔄 TODO - IN ORDER

### 1. Test Debug APK (TODAY - 30 minutes)

**Install on your Android device:**

```powershell
# Option A: Via ADB (if device connected)
adb install SmasherApp-Debug.apk

# Option B: Transfer to phone
# Copy SmasherApp-Debug.apk to your phone and install
```

**Test these features:**
- [ ] Register with email
- [ ] Receive verification code
- [ ] Create profile
- [ ] Upload profile picture
- [ ] Upload 2-3 gallery photos
- [ ] Browse nearby users (may be empty)
- [ ] View a profile
- [ ] Send a message (need 2 devices)
- [ ] Update settings
- [ ] Logout and login again

**Check for issues:**
- Network errors?
- Photo upload working?
- Email verification working?
- Any crashes?

---

### 2. Generate Release Keystore (TODAY - 5 minutes)

**⚠️ CRITICAL:** Keep this keystore safe! If you lose it, you can NEVER update your app.

```powershell
cd app-rn\android\app

keytool -genkeypair -v -storetype PKCS12 -keystore smasher-release-key.keystore -alias smasher-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**You'll be asked:**
- Keystore password: (choose a strong password - SAVE IT!)
- Key password: (can be same as keystore password - SAVE IT!)
- First and last name: (your name)
- Organization: (your company or "Independent")
- City, State, Country: (your location)

**SAVE THESE CREDENTIALS SECURELY:**
```
Keystore password: ___________________
Key password: ___________________
Alias: smasher-key-alias
File location: app-rn/android/app/smasher-release-key.keystore
```

**Backup the keystore file** to multiple locations (USB drive, cloud, etc.)

---

### 3. Configure Gradle for Signing (TODAY - 2 minutes)

Create `app-rn\android\gradle.properties`:

```properties
SMASHER_UPLOAD_STORE_FILE=smasher-release-key.keystore
SMASHER_UPLOAD_STORE_PASSWORD=your_keystore_password_here
SMASHER_UPLOAD_KEY_ALIAS=smasher-key-alias
SMASHER_UPLOAD_KEY_PASSWORD=your_key_password_here
```

**⚠️ IMPORTANT:** Add to `.gitignore`:
```
android/gradle.properties
android/app/*.keystore
```

Never commit passwords to Git!

---

### 4. Build Release AAB (TODAY - 10 minutes)

```powershell
cd app-rn\android
.\gradlew clean
.\gradlew bundleRelease
```

**Output location:**
```
app-rn\android\app\build\outputs\bundle\release\app-release.aab
```

**Verify the build:**
- File size should be ~30-50 MB
- File should exist at the path above

---

### 5. Create App Store Assets (1-2 days)

#### A. App Icon (512x512 PNG)

**Requirements:**
- Size: 512x512 pixels
- Format: 32-bit PNG
- No transparency (solid background)

**Design:**
- Double male symbol (♂♂)
- Black background
- Silver/red gradient on symbols

**Tools:**
- Canva (free): https://canva.com
- Figma (free): https://figma.com
- Or hire on Fiverr ($5-20)

**Save as:** `docs/branding/app-icon-512.png`

#### B. Feature Graphic (1024x500 PNG)

**Requirements:**
- Size: 1024x500 pixels
- Format: PNG or JPG

**Content:**
- Logo/icon on left
- "SMASHER" text
- Tagline: "Connect Nearby" or "Meet Local"

**Save as:** `docs/branding/feature-graphic.png`

#### C. Screenshots (Minimum 2, Recommended 4-8)

**Required screens to capture:**
1. Welcome/Login screen
2. Home screen with nearby users
3. Profile view
4. Chat screen
5. Settings screen
6. Gallery screen

**How to capture:**

```powershell
# Connect device via USB
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshot-1.png

# Repeat for each screen
```

**Or:** Use your phone's screenshot function (Power + Volume Down)

**Requirements:**
- Minimum 320px shortest side
- Maximum 3840px longest side
- PNG or JPG format

**Save in:** `docs/branding/screenshots/`

---

### 6. Write Legal Documents (1-2 hours)

#### Privacy Policy

**Template exists in:** `LEGAL_TEMPLATES.md`

**Customize with:**
- Your name/company name
- Contact email
- Effective date

**Host it publicly:**

**Option A: GitHub Pages (Free)**
1. Create repo: `smasher-legal`
2. Add `privacy.html`
3. Enable GitHub Pages
4. URL: `https://yourusername.github.io/smasher-legal/privacy.html`

**Option B: Netlify (Free)**
1. Go to https://netlify.com
2. Drag and drop HTML file
3. Get URL

**Option C: Simple text file**
1. Create a Gist: https://gist.github.com
2. Paste privacy policy
3. Get raw URL

**Save the URL:** ___________________

#### Terms of Service (Optional but Recommended)

Same process as Privacy Policy.

**Save the URL:** ___________________

---

### 7. Google Play Console Setup (2-3 hours)

#### Prerequisites:
- [ ] $25 Google Play Developer fee (one-time)
- [ ] Google account
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] 2+ screenshots
- [ ] Privacy Policy URL
- [ ] Release AAB file

#### Steps:

**A. Create Developer Account**

1. Go to https://play.google.com/console
2. Click "Sign up"
3. Pay $25 fee
4. Complete verification
5. Accept agreements

**B. Create App**

1. Click "Create app"
2. Fill in:
   - App name: **SMASHER**
   - Default language: **English (United States)**
   - App or game: **App**
   - Free or paid: **Free**
3. Accept declarations
4. Click "Create app"

**C. Store Listing**

1. Go to "Store listing" in left menu
2. Fill in:

**App name:** SMASHER

**Short description (80 chars):**
```
Location-based dating app for meeting people nearby. 18+ only.
```

**Full description (4000 chars max):**
```
SMASHER is a location-based dating and meetup app designed for adults 18+.

FEATURES:
• Location-based discovery - Find people nearby
• Real-time chat - Connect instantly
• Photo gallery - Share up to 6 photos
• Privacy controls - Block and report users
• Age verification - 18+ only

HOW IT WORKS:
1. Sign up with your email
2. Create your profile
3. Upload photos
4. Discover nearby users
5. Start chatting

PRIVACY & SAFETY:
• Your location is never shared publicly
• Block and report features
• Age verification required
• Secure messaging

Download SMASHER today and start connecting with people nearby!
```

**App icon:** Upload 512x512 PNG

**Feature graphic:** Upload 1024x500 PNG

**Screenshots:** Upload 2-8 screenshots

**App category:** Dating

**Contact email:** your-email@example.com

**Privacy Policy URL:** (your hosted URL)

**D. Content Rating**

1. Go to "Content rating"
2. Click "Start questionnaire"
3. Select category: **Dating**
4. Answer questions:
   - Does app contain user-generated content? **Yes**
   - Does app share location? **Yes**
   - Is app for adults only? **Yes** (18+)
5. Submit

Expected rating: **Mature 17+** or **18+**

**E. Target Audience**

1. Go to "Target audience"
2. Select age group: **18 and over**
3. Not designed for children: **Yes**

**F. Data Safety**

1. Go to "Data safety"
2. Fill in what data you collect:

**Data collected:**
- Location (approximate)
- Email address
- Name
- Photos
- Messages

**Data shared:** None

**Data sold:** No

**Encryption:** Yes (in transit and at rest)

**User can request deletion:** Yes (in settings)

**G. App Access**

1. Go to "App access"
2. Select: **All functionality is available without special access**

**H. Ads**

1. Go to "Ads"
2. Select: **No, my app does not contain ads**

---

### 8. Upload to Internal Testing (TODAY - 30 minutes)

1. Go to "Testing" → "Internal testing"
2. Click "Create new release"
3. Upload your AAB file
4. Add release notes:
   ```
   Initial release
   - User authentication
   - Profile creation
   - Photo gallery
   - Location-based discovery
   - Real-time chat
   - Block and report features
   ```
5. Click "Review release"
6. Click "Start rollout to Internal testing"

**Add testers:**
1. Create email list (up to 100 testers)
2. Share testing link with them
3. They opt-in and download

---

### 9. Test with Internal Testers (1-3 days)

**What to test:**
- [ ] Installation works
- [ ] Registration works
- [ ] Email verification works
- [ ] Profile creation works
- [ ] Photo upload works
- [ ] Discovery works
- [ ] Chat works
- [ ] No crashes
- [ ] Performance is good

**Fix any critical bugs** before production release.

---

### 10. Production Release (1 hour)

1. Go to "Testing" → "Closed testing" or "Production"
2. Create new release
3. Upload same AAB (or new version if you fixed bugs)
4. Add release notes
5. Set rollout percentage (start with 20%, then 50%, then 100%)
6. Click "Review release"
7. Click "Start rollout to Production"

**Google Review:**
- Takes 1-7 days (usually 1-3 days)
- You'll get email when approved or rejected
- If rejected, fix issues and resubmit

---

## 📊 Timeline to Launch

| Task | Duration | Status |
|------|----------|--------|
| Test debug APK | 30 min | ⬜ Pending |
| Generate keystore | 5 min | ⬜ Pending |
| Configure signing | 2 min | ⬜ Pending |
| Build release AAB | 10 min | ⬜ Pending |
| Create app icon | 2-4 hours | ⬜ Pending |
| Create screenshots | 1-2 hours | ⬜ Pending |
| Write/host legal docs | 1-2 hours | ⬜ Pending |
| Set up Play Console | 2-3 hours | ⬜ Pending |
| Internal testing | 1-3 days | ⬜ Pending |
| Production release | 1 hour | ⬜ Pending |
| Google review | 1-7 days | ⬜ Pending |
| **TOTAL** | **5-14 days** | |

---

## 💰 Costs

- **Google Play Developer:** $25 (one-time)
- **Domain for legal docs:** $10-15/year (optional)
- **App icon design:** $0-20 (DIY or Fiverr)
- **Total:** $25-60

---

## 🎯 Quick Start (Do This Now)

1. **Test the debug APK:**
   ```powershell
   adb install SmasherApp-Debug.apk
   ```

2. **Generate keystore:**
   ```powershell
   cd app-rn\android\app
   keytool -genkeypair -v -storetype PKCS12 -keystore smasher-release-key.keystore -alias smasher-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Build release AAB:**
   ```powershell
   cd app-rn\android
   .\gradlew bundleRelease
   ```

4. **Create app icon** (use Canva or hire on Fiverr)

5. **Take screenshots** (from your phone)

6. **Set up Google Play Console** ($25)

7. **Upload to internal testing**

8. **Test with friends**

9. **Release to production**

10. **Wait for Google approval**

---

## 📞 Need Help?

- **Keystore issues:** See `SIGNING_SETUP.md`
- **Build errors:** Check `build-log.txt`
- **Play Console:** https://support.google.com/googleplay/android-developer

---

**Let's get this done! Start with testing the debug APK, then generate the keystore.** 🚀
