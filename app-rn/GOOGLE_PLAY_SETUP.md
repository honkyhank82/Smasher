# Google Play Credentials Setup for EAS

## 📋 Quick Reference

Your `eas.json` is configured to look for: `./google-play-service-account.json`

---

## 🔐 Step-by-Step: Get Your Service Account JSON

### **1. Create Service Account in Google Cloud**

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to: **Setup → API access**
4. Click **"Create new service account"** (redirects to Google Cloud Console)
5. In Google Cloud Console:
   - Click **"+ CREATE SERVICE ACCOUNT"**
   - Name: `eas-submit` (or any name)
   - Role: **"Service Account User"**
   - Click **"CREATE AND CONTINUE"** → **"DONE"**

### **2. Download JSON Key**

1. Find your service account in the list
2. Click **⋮** (three dots) → **"Manage keys"**
3. Click **"ADD KEY"** → **"Create new key"**
4. Select **JSON** format
5. Click **"CREATE"**
6. File downloads automatically (e.g., `your-project-123456-abc123.json`)

### **3. Grant Permissions in Play Console**

1. Back in **Google Play Console → API access**
2. Find your service account
3. Click **"Grant access"**
4. Enable these permissions:
   - ✅ **View app information**
   - ✅ **Create and edit draft apps**
   - ✅ **Manage production releases**
   - ✅ **Manage testing track releases**
5. Click **"Invite user"** → **"Send invite"**

---

## 📁 Add to Your Project

### **Move the Downloaded File**

```powershell
# Replace with your actual downloaded filename
Move-Item "C:\Users\YourName\Downloads\your-project-*.json" "c:\DevProjects\smasher\app-rn\google-play-service-account.json"
```

### **Verify File Location**

```powershell
# Should show the file
ls c:\DevProjects\smasher\app-rn\google-play-service-account.json
```

---

## 🚀 Using the Credentials

### **Option 1: Submit via EAS (Recommended)**

```powershell
# Build first
eas build --profile production --platform android

# Then submit
eas submit --platform android --latest
```

EAS will automatically use the JSON file specified in `eas.json`.

### **Option 2: Submit Specific Build**

```powershell
# Submit a specific build ID
eas submit --platform android --id YOUR_BUILD_ID
```

### **Option 3: Interactive Submit**

```powershell
# EAS will prompt you for the path
eas submit --platform android
```

---

## 📝 Current Configuration

Your `eas.json` submit settings:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal",
        "releaseStatus": "draft"
      }
    }
  }
}
```

### **Track Options**

- `"internal"` - Internal testing (up to 100 testers)
- `"alpha"` - Closed testing (alpha track)
- `"beta"` - Open/closed testing (beta track)
- `"production"` - Production release

### **Release Status Options**

- `"draft"` - Creates draft (you review before publishing)
- `"completed"` - Publishes immediately
- `"halted"` - Creates but doesn't publish

---

## 🔒 Security Best Practices

### ✅ **DO**
- Keep JSON file in `.gitignore` (already added)
- Store backup in secure password manager
- Rotate keys periodically
- Use minimum required permissions

### ❌ **DON'T**
- Commit JSON to Git
- Share JSON file publicly
- Use same key for multiple apps
- Give excessive permissions

---

## 🐛 Troubleshooting

### **Error: "Service account not found"**
- Verify you granted access in Play Console
- Wait 5-10 minutes after creating (propagation delay)
- Check service account email matches

### **Error: "Insufficient permissions"**
- Go to Play Console → API access
- Click your service account → "App permissions"
- Enable required permissions (see step 3 above)

### **Error: "File not found"**
```powershell
# Verify file exists
Test-Path "c:\DevProjects\smasher\app-rn\google-play-service-account.json"

# Should return: True
```

### **Error: "Invalid JSON"**
- Re-download the JSON key
- Don't edit the file manually
- Ensure file isn't corrupted

---

## 📦 First-Time App Submission

If this is your **first submission** to Google Play:

1. **Create app listing** in Play Console first
2. Fill in required store listing info:
   - App name, description
   - Screenshots (at least 2)
   - Feature graphic (1024x500)
   - App icon
   - Privacy policy URL
3. Complete **Content rating** questionnaire
4. Set up **Pricing & distribution**
5. Then use EAS submit

---

## 🎯 Complete Workflow

```powershell
# 1. Build production AAB
eas build --profile production --platform android

# 2. Wait for build to complete (check status)
eas build:list

# 3. Submit to Play Console
eas submit --platform android --latest

# 4. Go to Play Console to review and publish
```

---

## 📚 Additional Resources

- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Google Play Console](https://play.google.com/console)
- [Service Account Setup](https://docs.expo.dev/submit/android/#google-service-account)
- [Play Console Help](https://support.google.com/googleplay/android-developer)

---

## ✅ Checklist

Before first submit:

- [ ] Service account created in Google Cloud
- [ ] JSON key downloaded
- [ ] Permissions granted in Play Console
- [ ] JSON file saved as `google-play-service-account.json`
- [ ] File added to `.gitignore`
- [ ] App listing created in Play Console
- [ ] Store listing completed
- [ ] Content rating completed
- [ ] Production build created with EAS

---

## 🆘 Need Help?

If you encounter issues:

1. Check [EAS Submit docs](https://docs.expo.dev/submit/android/)
2. Verify service account has correct permissions
3. Ensure JSON file path is correct in `eas.json`
4. Try `eas submit --platform android` (interactive mode)
