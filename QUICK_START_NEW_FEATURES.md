# Quick Start: New Features

## 🎯 What's New

1. **Account Deactivation** - Users can temporarily hide their profile
2. **Account Deletion** - Users can permanently delete their account (30-day grace period)
3. **Automatic Updates** - Push updates to users without app store submission

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Database Migration

Run the SQL migration:

```powershell
# Connect to your database and run:
psql -U your_user -d smasher -f server/migrations/003_add_account_status.sql
```

Or if using your migration system:
```bash
cd server
npm run migrate
```

### Step 2: Install Dependencies

```powershell
cd app-rn
npm install
```

This will install `react-native-code-push` (already added to package.json).

### Step 3: Deploy Backend

```powershell
# If using Fly.io
cd server
fly deploy

# If using Docker
docker-compose up -d --build
```

### Step 4: Test Account Management

1. Build and run the app:
   ```powershell
   cd app-rn
   npx react-native run-android
   ```

2. Navigate to Settings
3. Scroll to "Danger Zone" section
4. Test deactivate/delete buttons

---

## 📱 Using Account Management

### Deactivate Account

**User Flow:**
1. Settings → Danger Zone → "Deactivate Account"
2. Confirm in dialog
3. Account is deactivated, user is logged out
4. Profile is hidden from other users
5. Can reactivate by logging in again

**What Happens:**
- Profile hidden from discovery
- No notifications sent
- Data preserved
- Can reactivate anytime

### Delete Account

**User Flow:**
1. Settings → Danger Zone → "Delete Account"
2. First confirmation dialog
3. Second confirmation dialog
4. Deletion scheduled for 30 days
5. User is logged out

**What Happens:**
- 30-day grace period starts
- User can cancel within 30 days
- After 30 days, all data permanently deleted
- Includes: messages, media, matches, profile

**Cancel Deletion:**
- Log back in within 30 days
- Call `/users/cancel-deletion` endpoint
- Account returns to active status

---

## 🔄 Setting Up Automatic Updates (Optional)

### Quick Setup

```powershell
cd app-rn
.\scripts\setup-codepush.ps1
```

Follow the prompts to:
1. Install CodePush CLI
2. Get instructions for AppCenter setup

### Full Setup (15 minutes)

1. **Create AppCenter Account**
   - Go to https://appcenter.ms/
   - Sign up (free)

2. **Create App**
   ```powershell
   appcenter login
   appcenter apps create -d Smasher-Android -o Android -p React-Native
   ```

3. **Get Deployment Keys**
   ```powershell
   appcenter codepush deployment list -a YOUR_USERNAME/Smasher-Android -k
   ```

4. **Add Keys to Android**
   
   Edit `android/app/build.gradle`:
   ```gradle
   android {
       buildTypes {
           debug {
               resValue "string", "CodePushDeploymentKey", '"YOUR-STAGING-KEY"'
           }
           release {
               resValue "string", "CodePushDeploymentKey", '"YOUR-PRODUCTION-KEY"'
           }
       }
   }
   ```

5. **Configure MainApplication.java**
   
   Edit `android/app/src/main/java/com/smasher/app/MainApplication.java`:
   
   Add import:
   ```java
   import com.microsoft.codepush.react.CodePush;
   ```
   
   Override method:
   ```java
   @Override
   protected String getJSBundleFile() {
       return CodePush.getJSBundleFile();
   }
   ```

6. **Build and Test**
   ```powershell
   npx react-native run-android
   ```

### Deploy Your First Update

1. Make a small change (e.g., change a text string)

2. Deploy to staging:
   ```powershell
   .\scripts\deploy-update.ps1 -message "Testing CodePush"
   ```

3. Close and reopen app - update should apply!

4. Deploy to production:
   ```powershell
   .\scripts\deploy-update.ps1 -message "Bug fixes" -production
   ```

---

## 🧪 Testing

### Test Account Deactivation

```powershell
# 1. Start the app
npx react-native run-android

# 2. In the app:
# - Login
# - Go to Settings
# - Tap "Deactivate Account"
# - Confirm
# - Should be logged out

# 3. Login again
# - Account should be reactivated automatically
```

### Test Account Deletion

```powershell
# 1. In the app:
# - Login
# - Go to Settings
# - Tap "Delete Account"
# - Confirm twice
# - Note the deletion date
# - Should be logged out

# 2. Check database:
psql -U your_user -d smasher -c "SELECT email, account_status, deleted_at FROM users WHERE account_status = 'deleted';"

# 3. Cancel deletion:
# - Login again
# - Call cancel endpoint or implement UI button
```

### Test CodePush Updates

```powershell
# 1. Build and install app
npx react-native run-android

# 2. Make a change
# Edit any text in the app

# 3. Deploy update
.\scripts\deploy-update.ps1 -message "Test update"

# 4. Close app completely
# 5. Wait 5 minutes (or change minimumBackgroundDuration in App.tsx)
# 6. Reopen app
# 7. Change should be visible!
```

---

## 📊 Monitoring

### Check Account Statuses

```sql
-- Active accounts
SELECT COUNT(*) FROM users WHERE account_status = 'active';

-- Deactivated accounts
SELECT COUNT(*) FROM users WHERE account_status = 'deactivated';

-- Scheduled deletions
SELECT email, deleted_at FROM users 
WHERE account_status = 'deleted' 
AND deleted_at > NOW();

-- Ready for permanent deletion
SELECT email, deleted_at FROM users 
WHERE account_status = 'deleted' 
AND deleted_at <= NOW();
```

### Check CodePush Deployments

```powershell
# View deployment history
appcenter codepush deployment history -a YOUR_USERNAME/Smasher-Android Production

# View current deployments
appcenter codepush deployment list -a YOUR_USERNAME/Smasher-Android
```

---

## 🐛 Troubleshooting

### Account Management Not Working

**Issue**: API calls fail
```powershell
# Check server logs
docker logs -f smasher-server

# Or if using Fly.io
fly logs
```

**Issue**: Database errors
```powershell
# Verify migration ran
psql -U your_user -d smasher -c "\d users"

# Should see new columns: account_status, deactivated_at, deleted_at, deletion_scheduled_at
```

### CodePush Not Working

**Issue**: Module not found error
```powershell
# Install dependencies
cd app-rn
npm install

# Clear cache
npx react-native start --reset-cache

# Rebuild
npx react-native run-android
```

**Issue**: Updates not appearing
```powershell
# Check deployment key
# Verify in android/app/build.gradle

# Check app version
# CodePush only works for same app version

# View logs
npx react-native log-android
# Look for CodePush messages
```

---

## 📚 Documentation

- **Full Setup Guide**: [AUTO_UPDATE_SETUP.md](./AUTO_UPDATE_SETUP.md)
- **Feature Details**: [ACCOUNT_MANAGEMENT_FEATURES.md](./ACCOUNT_MANAGEMENT_FEATURES.md)
- **Network Fix**: [NETWORK_UPLOAD_FIX.md](./NETWORK_UPLOAD_FIX.md)

---

## ✅ Checklist

### Before Deploying to Production

- [ ] Database migration applied
- [ ] Backend deployed with new endpoints
- [ ] Tested account deactivation
- [ ] Tested account deletion
- [ ] Tested deletion cancellation
- [ ] CodePush configured (if using)
- [ ] Deployment keys added to build.gradle
- [ ] MainApplication.java updated
- [ ] Tested CodePush update flow
- [ ] Updated app version in build.gradle
- [ ] Created release build
- [ ] Tested on physical device

### Post-Deployment

- [ ] Monitor error logs
- [ ] Check account status metrics
- [ ] Monitor CodePush adoption (if using)
- [ ] Set up automated cleanup job for expired deletions
- [ ] Update user documentation
- [ ] Notify users of new features

---

## 🎉 You're Done!

Your app now has:
- ✅ Account deactivation
- ✅ Account deletion with grace period
- ✅ Automatic updates (if CodePush configured)

**Need Help?**
- Check the detailed guides in the documentation folder
- Review server logs for errors
- Test in staging environment first
