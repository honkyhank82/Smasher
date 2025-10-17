# Google Play Console - Test Account Instructions

## 📱 **Instructions for Google Play Reviewers**

When you submit your app to Google Play Console, you need to provide test account credentials so reviewers can access all features.

---

## 🔐 **Test Account Credentials**

### **For Google Play Console "App Access" Section:**

Copy and paste this into the Play Console:

```
SMASHER Test Account Instructions

SMASHER requires account creation to access all features.

Test Account Credentials:
Email: test@smasher.app
Password: TestPass123!

How to Test the App:

1. Launch SMASHER
2. On the welcome screen, tap "Sign Up" (or "Log In" if you've already created the account)
3. Enter the test credentials above:
   - Email: test@smasher.app
   - Password: TestPass123!
4. Grant location permissions when prompted (required for core functionality)
5. You will see the main screen with nearby users

Features to Test:
- Browse nearby users (sample data will be shown)
- View user profiles
- Send messages (chat functionality)
- Edit your own profile
- Upload photos (optional)
- Adjust privacy settings

Note: The app uses real-time location to show nearby users. For testing purposes, the test account will display sample users regardless of your actual location.

Important: Location permission is required for the app to function. Please grant "Allow all the time" or "Allow while using the app" when prompted.

If you encounter any issues, please contact: smashermain@gmail.com
```

---

## 📝 **Where to Add This**

### **In Google Play Console:**

1. Go to **Dashboard → App access**
2. Select: **"All or some functionality is restricted"**
3. Click **"Add new instructions"**
4. Paste the instructions above
5. Click **"Save"**

---

## 🧪 **Creating the Test Account**

You need to actually create this test account in your app before submitting:

### **Option 1: Create via Your App**

1. Open your app on your device
2. Tap "Sign Up"
3. Enter:
   - Email: `test@smasher.app`
   - Password: `TestPass123!`
   - Display name: `Test User`
4. Complete profile setup
5. This account is now ready for Google reviewers

### **Option 2: Create via API/Database**

If you have direct database access, you can create the account manually:

```sql
-- Example SQL (adjust for your schema)
INSERT INTO users (email, password_hash, display_name, created_at)
VALUES ('test@smasher.app', 'hashed_password', 'Test User', NOW());
```

---

## ⚠️ **Important Notes**

### **Account Requirements:**

- ✅ Account must be **active and working**
- ✅ Account must have **full access** to all features
- ✅ Password must be **simple** for reviewers to type
- ✅ Account should have **sample data** (profile, photos, etc.)
- ✅ Account must **not expire** during review period

### **What Reviewers Will Test:**

- Login functionality
- Core features (browsing users, chat, etc.)
- Location permissions
- Profile editing
- Photo uploads
- Privacy settings
- User blocking/reporting

### **Common Rejection Reasons:**

❌ Test account doesn't work  
❌ Test account expired  
❌ Password is incorrect  
❌ Account has restricted access  
❌ Features don't work as described  

---

## 🔄 **Alternative: Demo Mode**

If you don't want to provide a test account, you can implement a demo mode:

### **In Your App:**

Add a special login bypass:

```typescript
// In your login screen
if (email === 'demo@smasher.app' && password === 'demo') {
  // Skip authentication, show demo data
  setDemoMode(true);
  navigateToHome();
}
```

Then in Play Console, provide:
```
Demo Account:
Email: demo@smasher.app
Password: demo

This is a demo account that bypasses authentication and shows sample data.
```

---

## 📋 **Complete Checklist**

Before submitting to Google Play:

- [ ] Test account created and verified
- [ ] Test account has a complete profile
- [ ] Test account can access all features
- [ ] Instructions are clear and detailed
- [ ] Email and password are correct
- [ ] Account won't expire during review
- [ ] You've tested the account yourself
- [ ] Instructions added to Play Console

---

## 🎯 **Quick Copy-Paste Version**

**For Play Console "App Access" field:**

```
Test Account:
Email: test@smasher.app
Password: TestPass123!

Instructions:
1. Open app and tap "Sign Up"
2. Enter credentials above
3. Grant location permissions
4. Browse nearby users and test features

Note: Sample data shown for testing. Location permission required.
Contact: smashermain@gmail.com
```

---

## 🆘 **If Reviewers Can't Login**

Google will email you if they have issues. Common fixes:

1. **Verify account exists** in your database
2. **Test login yourself** with exact credentials
3. **Check server is running** and accessible
4. **Verify email format** (no typos)
5. **Ensure password works** (case-sensitive)
6. **Check account isn't locked** or disabled

---

## 📞 **Support Contact**

Always provide a support email in your instructions:

```
If you encounter any issues accessing the app, please contact:
smashermain@gmail.com

We typically respond within 24 hours.
```

---

**Create your test account now and add these instructions to Play Console!** 🚀
