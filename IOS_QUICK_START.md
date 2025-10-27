# 🚀 iOS Quick Start Guide

## ✅ Your App is iPhone-Ready!

Your Smasher app is fully compatible with iPhone. Here's how to build and deploy it.

---

## 🎯 Quick Build Commands

### Build for iOS (Cloud - No Mac Required)

```bash
# Install EAS CLI (one-time)
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
cd app-rn
eas build --profile production --platform ios
```

**Build time:** ~15-20 minutes  
**Cost:** Free (with Expo account)

---

## 📱 Test on iPhone

### Option 1: TestFlight (Recommended)

After building:
1. Build completes → Download `.ipa`
2. Upload to App Store Connect
3. Add testers in TestFlight
4. Testers install via TestFlight app

### Option 2: Expo Go (Development Only)

```bash
cd app-rn
npx expo start
```

Scan QR code with iPhone camera → Opens in Expo Go

---

## 🏪 Publish to App Store

### Prerequisites

1. **Apple Developer Account** - $99/year
   - Sign up: https://developer.apple.com/programs/

2. **App Store Connect** - Create app listing
   - Go to: https://appstoreconnect.apple.com

### Steps

1. **Update eas.json** with your Apple IDs:
   ```json
   "ios": {
     "appleId": "your-email@example.com",
     "ascAppId": "1234567890",
     "appleTeamId": "ABCD123456"
   }
   ```

2. **Build production version:**
   ```bash
   eas build --profile production --platform ios
   ```

3. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```

4. **Fill out App Store listing** in App Store Connect

5. **Submit for review** (1-3 days)

---

## 🔑 What's Already Configured

✅ **Bundle ID:** `com.smasher.app`  
✅ **Version:** 1.0.12  
✅ **Build Number:** 12  
✅ **Permissions:** Camera, Photos, Location, Microphone  
✅ **Push Notifications:** Ready (needs APNs key)  
✅ **All dependencies:** iOS-compatible  
✅ **Platform-specific code:** Already handled  

---

## ⚠️ Important Notes

### 1. Push Notifications

Configure APNs key:
```bash
eas credentials
# Select: Push Notifications Key
```

### 2. Background Location

Apple requires explanation for "Always" location permission.

**Add to App Review notes:**
```
SMASHER uses background location to update user's location 
for accurate nearby user matching and real-time distance 
calculations. Users can choose "While Using" instead.
```

### 3. In-App Purchases

Your app uses Stripe. Apple may require:
- Also offer Apple IAP for iOS subscriptions
- Or use Stripe only for web purchases

**Consider implementing:**
```bash
npm install react-native-iap
```

### 4. Content Moderation

Apple requires moderation for user-generated content:
- Add report/block functionality
- Implement photo moderation
- Add terms of service in-app

---

## 🐛 Troubleshooting

### "No provisioning profiles found"
```bash
eas credentials
# Select: Set up new credentials
```

### "Build failed"
Check build logs in EAS dashboard for specific error.

### "App rejected by Apple"
Common reasons:
- Missing content moderation
- Background location not justified
- IAP required for subscriptions
- Privacy policy not accessible

---

## 📚 Full Documentation

See **IOS_COMPATIBILITY_SETUP.md** for:
- Detailed build instructions
- Local build with Xcode
- App Store submission guide
- Testing checklist
- iOS-specific considerations

---

## 🎉 Summary

Your app is **iPhone-compatible** right now!

**Next steps:**
1. Sign up for Apple Developer ($99/year)
2. Run: `eas build --profile production --platform ios`
3. Test on iPhone via TestFlight
4. Submit to App Store

**Questions?** Check IOS_COMPATIBILITY_SETUP.md

**Ready to build? Let's go! 🚀**
