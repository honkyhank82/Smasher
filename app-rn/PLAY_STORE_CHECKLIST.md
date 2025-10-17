# Google Play Store Submission Checklist

## 🎯 Current Status: Initial Setup Required

Before you can submit builds via EAS, you need to complete your Play Console setup.

---

## ✅ **Pre-Submission Checklist**

### **1. Store Listing** (REQUIRED)

Go to: **Dashboard → Store Listing**

- [ ] **App name**: SMASHER
- [ ] **Short description** (80 chars max)
  ```
  Meet nearby people. Chat, connect, and explore your local scene.
  ```
- [ ] **Full description** (4000 chars max)
  ```
  SMASHER is a location-based social app that helps you discover and connect 
  with people nearby. Whether you're looking to make new friends, find dates, 
  or explore your local community, SMASHER makes it easy.

  Features:
  • Location-based discovery - Find people near you
  • Real-time chat - Connect instantly with matches
  • Photo & video profiles - Show your authentic self
  • Privacy controls - You're in control of who sees what
  • Safe & secure - Report and block features

  How it works:
  1. Create your profile with photos
  2. Browse nearby users
  3. Connect with people you're interested in
  4. Start chatting and meet up!

  SMASHER respects your privacy. Your exact location is never shared - 
  only approximate distance. All chats are private and secure.
  ```

- [ ] **App icon** (512x512 PNG)
  - Use: `c:\DevProjects\smasher\app-rn\assets\icon.png` (resize to 512x512)

- [ ] **Feature graphic** (1024x500 PNG)
  - Use: `c:\DevProjects\smasher\feature-graphic-1024x500.png`

- [ ] **Screenshots** (at least 2)
  - Take screenshots from your app
  - Recommended: 4-8 screenshots showing key features
  - Dimensions: 1080x1920 (portrait) or 1920x1080 (landscape)

### **2. Content Rating** (REQUIRED)

Go to: **Dashboard → Content Rating**

- [ ] Complete questionnaire
- [ ] Answer honestly about:
  - Violence
  - Sexual content
  - Profanity
  - Controlled substances
  - User interaction (YES - chat/user-generated content)
  - Location sharing (YES)
- [ ] Submit for rating

**Expected Rating**: Mature 17+ (due to user interaction and dating features)

### **3. App Access** (REQUIRED)

Go to: **Dashboard → App Access**

- [ ] Select: **"All or some functionality is restricted"**
- [ ] Provide test account credentials:
  ```
  Email: test@smasher.app
  Password: [your test password]
  ```
- [ ] Explain what requires login: "All features require account creation"

### **4. Ads** (REQUIRED)

Go to: **Dashboard → Ads**

- [ ] Select: **"No, my app does not contain ads"** (or "Yes" if you have ads)

### **5. Data Safety** (REQUIRED)

Go to: **Dashboard → Data Safety**

Declare what data you collect:

- [ ] **Location**: Approximate location (YES)
  - Purpose: App functionality (finding nearby users)
  - Shared with third parties: NO
  - Optional: NO

- [ ] **Personal info**: Name, Email, User ID (YES)
  - Purpose: Account management
  - Shared with third parties: NO
  - Optional: NO

- [ ] **Photos and videos**: Photos, Videos (YES)
  - Purpose: App functionality (profile pictures)
  - Shared with third parties: NO
  - Optional: YES

- [ ] **Messages**: Other in-app messages (YES)
  - Purpose: App functionality (chat)
  - Shared with third parties: NO
  - Optional: NO

- [ ] **Privacy policy URL**: 
  ```
  https://your-domain.com/privacy-policy
  ```
  (Use the one from `c:\DevProjects\smasher\PRIVACY_POLICY.md`)

### **6. Target Audience** (REQUIRED)

Go to: **Dashboard → Target Audience**

- [ ] **Target age group**: 18+ (Adults only)
- [ ] **Appeal to children**: NO
- [ ] Confirm app complies with policies

### **7. News App** (if prompted)

- [ ] Select: **"No, my app is not a news app"**

### **8. COVID-19 Contact Tracing** (if prompted)

- [ ] Select: **"No"**

### **9. Data Security** (if prompted)

- [ ] Encryption in transit: YES
- [ ] Users can request data deletion: YES
- [ ] Committed to Play Families Policy: NO (not a kids app)

---

## 🚀 **After Completing Setup**

Once all sections show ✅ in Dashboard:

### **Step 1: Build with EAS**

```powershell
cd c:\DevProjects\smasher\app-rn
eas build --profile production --platform android
```

### **Step 2: Manual Upload (First Time)**

For your **first release**, upload manually:

1. Download AAB from EAS build
2. Go to **Internal testing** → **Create new release**
3. Upload AAB file
4. Add release notes
5. Review and rollout

### **Step 3: Add Testers**

1. Go to **Internal testing** → **Testers**
2. Create email list with your testers
3. Save and get testing link

### **Step 4: Test for 14 Days**

- Need at least 12 testers
- Run for at least 14 days
- Then you can apply for Production access

### **Step 5: Use EAS Submit (After First Manual Upload)**

Once your app is in Play Console, you can use automated submission:

```powershell
# Make sure google-play-service-account.json is in place
eas submit --platform android --latest
```

---

## 📱 **Quick Assets Checklist**

### **Required Assets**

- [ ] App icon (512x512 PNG) - Already have: `assets/icon.png`
- [ ] Feature graphic (1024x500 PNG) - Already have: `feature-graphic-1024x500.png`
- [ ] Screenshots (2-8 images)
  - [ ] Home screen with nearby users
  - [ ] Profile screen
  - [ ] Chat screen
  - [ ] Settings screen

### **Generate Screenshots**

Run your app and take screenshots:

```powershell
# Start app
npx expo start

# Press 'a' for Android
# Navigate through app and take screenshots
# Screenshots save to device
```

Or use emulator:
- Android Studio → Running Devices → Camera icon

---

## 🎨 **Store Listing Tips**

### **Short Description** (80 chars)
Keep it punchy and clear:
```
Meet nearby people. Chat, connect, and explore your local scene.
```

### **Keywords to Include**
- Location-based
- Social
- Dating
- Chat
- Meet people
- Nearby
- Local
- Connect

### **Categories**
- Primary: **Social**
- Secondary: **Dating** (if applicable)

---

## 🔒 **Privacy Policy Required**

You MUST have a privacy policy URL. Options:

1. **Host on your domain**: Upload `PRIVACY_POLICY.md` to your website
2. **Use GitHub Pages**: Create a repo and enable GitHub Pages
3. **Use privacy policy generator**: https://www.privacypolicygenerator.info/

Example URL format:
```
https://smasher-app.com/privacy-policy
https://yourusername.github.io/smasher-privacy/
```

---

## ⚠️ **Common Mistakes to Avoid**

- ❌ Skipping content rating
- ❌ Not providing test credentials
- ❌ Missing privacy policy URL
- ❌ Insufficient screenshots
- ❌ Not declaring data collection accurately
- ❌ Wrong target age group

---

## 📞 **Need Help?**

- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Content Policies](https://play.google.com/about/developer-content-policy/)
- [Data Safety Form](https://support.google.com/googleplay/android-developer/answer/10787469)

---

## ✅ **Ready to Submit?**

Once Dashboard shows all sections complete:

1. ✅ Store listing
2. ✅ Content rating
3. ✅ App access
4. ✅ Ads
5. ✅ Data safety
6. ✅ Target audience

Then proceed with building and uploading your app!
