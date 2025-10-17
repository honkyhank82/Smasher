# Account Management & Auto-Update Features

## Overview

This document describes the newly implemented account management features (deactivate/delete account) and automatic app update system for the Smasher app.

---

## 🔐 Account Management Features

### Features Implemented

1. **Account Deactivation**
   - Temporarily hides user profile
   - Stops all notifications
   - Can be reactivated anytime by logging in
   - User data is preserved

2. **Account Deletion**
   - 30-day grace period before permanent deletion
   - User can cancel deletion within 30 days
   - After 30 days, all data is permanently deleted
   - Includes: messages, media, matches, profile data

### Database Changes

**New Migration**: `server/migrations/003_add_account_status.sql`

Added columns to `users` table:
- `account_status` - Current status: 'active', 'deactivated', or 'deleted'
- `deactivated_at` - Timestamp when account was deactivated
- `deleted_at` - Timestamp when account will be permanently deleted
- `deletion_scheduled_at` - Timestamp when deletion was requested

### Backend API Endpoints

**Base URL**: `/users`

#### 1. Deactivate Account
```
POST /users/deactivate
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Account deactivated successfully. You can reactivate it anytime by logging in."
}
```

#### 2. Reactivate Account
```
POST /users/reactivate
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Account reactivated successfully."
}
```

#### 3. Schedule Account Deletion
```
POST /users/delete
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Account deletion scheduled. Your account will be permanently deleted in 30 days.",
  "deletionDate": "2025-11-12T21:00:00.000Z"
}
```

#### 4. Cancel Account Deletion
```
POST /users/cancel-deletion
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Account deletion cancelled. Your account is now active."
}
```

#### 5. Get Account Status
```
GET /users/account-status
Authorization: Bearer <token>
```

Response:
```json
{
  "status": "active",
  "deletionDate": null
}
```

### Frontend Implementation

**Location**: `app-rn/src/screens/SettingsScreen.tsx`

#### UI Components

1. **Danger Zone Section**
   - Located at the bottom of settings
   - Contains deactivate and delete buttons
   - Clear visual distinction (orange for deactivate, red for delete)

2. **Deactivate Account Button**
   - Shows confirmation dialog
   - Explains what deactivation means
   - Logs user out after deactivation

3. **Delete Account Button**
   - Two-step confirmation process
   - First confirmation explains 30-day grace period
   - Second confirmation requires explicit acknowledgment
   - Shows deletion date after scheduling
   - Logs user out after scheduling deletion

#### User Flow

**Deactivation Flow:**
1. User taps "Deactivate Account"
2. Confirmation dialog appears
3. User confirms
4. API call to `/users/deactivate`
5. Success message shown
6. User is logged out

**Deletion Flow:**
1. User taps "Delete Account"
2. First confirmation dialog appears
3. User confirms
4. Second confirmation dialog appears
5. User confirms again
6. API call to `/users/delete`
7. Deletion scheduled message with date shown
8. User is logged out

### Code Examples

**Deactivate Account:**
```typescript
const handleDeactivateAccount = () => {
  Alert.alert(
    'Deactivate Account',
    'Your profile will be hidden and you won\'t receive any notifications. You can reactivate anytime by logging in.\n\nAre you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          const response = await api.post('/users/deactivate');
          Alert.alert('Account Deactivated', response.data.message, [
            { text: 'OK', onPress: logout },
          ]);
        },
      },
    ]
  );
};
```

**Delete Account:**
```typescript
const handleDeleteAccount = () => {
  Alert.alert(
    'Delete Account',
    'This will permanently delete your account and all your data after 30 days...',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // Second confirmation
          Alert.alert(
            'Final Confirmation',
            'This action cannot be undone after 30 days...',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'I Understand, Delete My Account',
                style: 'destructive',
                onPress: async () => {
                  const response = await api.post('/users/delete');
                  Alert.alert('Deletion Scheduled', response.data.message);
                },
              },
            ]
          );
        },
      },
    ]
  );
};
```

---

## 🔄 Automatic App Updates

### Implementation: React Native CodePush

CodePush allows pushing JavaScript and asset updates directly to users without going through the app store.

### Features

- **Silent Updates**: Updates download in background and apply on next app resume
- **Immediate Updates**: Critical updates can be forced immediately
- **Rollback**: Easy rollback to previous versions
- **Staged Rollout**: Test updates with a percentage of users first
- **Analytics**: Track update adoption and success rates

### Setup Required

1. **Install Dependencies**
   ```powershell
   cd app-rn
   npm install --save react-native-code-push
   ```

2. **Create AppCenter Account**
   - Sign up at https://appcenter.ms/
   - Create app: `Smasher-Android`
   - Get deployment keys (Staging & Production)

3. **Configure Android**
   - Update `android/app/build.gradle`
   - Add deployment keys
   - Update `MainApplication.java`

4. **Deploy Updates**
   ```powershell
   # Install CLI
   npm install -g appcenter-cli
   
   # Login
   appcenter login
   
   # Deploy update
   appcenter codepush release-react -a YOUR_USERNAME/Smasher-Android -d Production
   ```

### App Integration

**File**: `app-rn/App.tsx`

```typescript
import CodePush from 'react-native-code-push';

function App() {
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    if (!__DEV__) {
      const update = await CodePush.checkForUpdate();
      if (update) {
        CodePush.sync({
          installMode: CodePush.InstallMode.ON_NEXT_RESUME,
          minimumBackgroundDuration: 60 * 5, // 5 minutes
        });
      }
    }
  };

  return (/* ... */);
}

const codePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
  installMode: CodePush.InstallMode.ON_NEXT_RESUME,
  minimumBackgroundDuration: 60 * 5,
};

export default CodePush(codePushOptions)(App);
```

### Update Strategy

**Silent Updates (Default)**
- Updates download in background
- Applied after app is in background for 5+ minutes
- No user interruption
- Best for: Bug fixes, minor improvements

**Immediate Updates (Critical)**
```powershell
appcenter codepush release-react -a YOUR_USERNAME/Smasher-Android -d Production -m
```
- Forces immediate update
- Shows update dialog
- Best for: Security fixes, critical bugs

### Deployment Scripts

**Setup Script**: `app-rn/scripts/setup-codepush.ps1`
```powershell
.\scripts\setup-codepush.ps1
```

**Deploy Script**: `app-rn/scripts/deploy-update.ps1`
```powershell
# Deploy to staging
.\scripts\deploy-update.ps1 -message "Fixed photo upload bug"

# Deploy to production
.\scripts\deploy-update.ps1 -message "Fixed photo upload bug" -production

# Mandatory update
.\scripts\deploy-update.ps1 -message "Critical security fix" -production -mandatory
```

### Best Practices

1. **Always test in Staging first**
   ```powershell
   appcenter codepush release-react -a YOUR_USERNAME/Smasher-Android -d Staging
   ```

2. **Use descriptive messages**
   ```powershell
   appcenter codepush release-react -a YOUR_USERNAME/Smasher-Android -d Production --description "Fixed photo upload timeout issue"
   ```

3. **Monitor adoption**
   ```powershell
   appcenter codepush deployment history -a YOUR_USERNAME/Smasher-Android Production
   ```

4. **Rollback if needed**
   ```powershell
   appcenter codepush rollback -a YOUR_USERNAME/Smasher-Android Production
   ```

---

## 📋 Testing Checklist

### Account Management Testing

- [ ] Deactivate account from settings
- [ ] Verify profile is hidden after deactivation
- [ ] Reactivate by logging in again
- [ ] Schedule account deletion
- [ ] Verify 30-day grace period message
- [ ] Cancel account deletion
- [ ] Verify account is active after cancellation
- [ ] Test deletion after 30 days (manual database update for testing)

### Auto-Update Testing

- [ ] Install CodePush package
- [ ] Configure AppCenter account
- [ ] Add deployment keys to build.gradle
- [ ] Build and install app on device
- [ ] Make a small change (e.g., text update)
- [ ] Deploy to Staging
- [ ] Close and reopen app
- [ ] Verify update is applied
- [ ] Deploy to Production
- [ ] Monitor update adoption

---

## 🚀 Deployment Steps

### 1. Database Migration

Run the migration on your database:
```sql
-- Run this on your PostgreSQL database
\i server/migrations/003_add_account_status.sql
```

Or if using the migration system:
```bash
# Apply migration
npm run migrate:up
```

### 2. Backend Deployment

Deploy the updated backend with new endpoints:
```powershell
# If using Docker
docker-compose up -d --build

# If using Fly.io
fly deploy
```

### 3. Frontend Deployment

**Option A: CodePush (Recommended)**
```powershell
cd app-rn
.\scripts\setup-codepush.ps1
# Follow setup instructions
.\scripts\deploy-update.ps1 -message "Added account management features" -production
```

**Option B: New App Build**
```powershell
cd app-rn
npm run build:aab
# Upload to Google Play Console
```

---

## 📊 Monitoring

### Account Management Metrics

Monitor these in your database:
```sql
-- Count deactivated accounts
SELECT COUNT(*) FROM users WHERE account_status = 'deactivated';

-- Count scheduled deletions
SELECT COUNT(*) FROM users WHERE account_status = 'deleted' AND deleted_at > NOW();

-- Find accounts ready for permanent deletion
SELECT * FROM users WHERE deleted_at <= NOW() AND account_status = 'deleted';
```

### CodePush Metrics

View in AppCenter dashboard:
- Update adoption rate
- Failed installations
- Active users per version
- Rollout progress

---

## 🔧 Troubleshooting

### Account Management Issues

**Issue**: Deactivation API call fails
- Check authentication token
- Verify user is logged in
- Check server logs

**Issue**: Deletion not scheduled
- Verify database migration ran successfully
- Check for database errors
- Ensure user has active session

### CodePush Issues

**Issue**: Updates not appearing
- Verify deployment key is correct
- Check app version matches
- Ensure network connectivity
- Review AppCenter logs

**Issue**: Build errors after CodePush integration
- Clear cache: `npx react-native start --reset-cache`
- Clean build: `cd android && .\gradlew clean`
- Reinstall dependencies: `npm install`

---

## 📚 Additional Resources

- [AUTO_UPDATE_SETUP.md](./AUTO_UPDATE_SETUP.md) - Detailed CodePush setup guide
- [CodePush Documentation](https://docs.microsoft.com/en-us/appcenter/distribution/codepush/)
- [AppCenter Documentation](https://docs.microsoft.com/en-us/appcenter/)

---

## ✅ Summary

### What Was Added

1. **Account Deactivation**
   - Backend API endpoints
   - Database schema updates
   - UI in settings screen
   - Two-step confirmation

2. **Account Deletion**
   - 30-day grace period
   - Cancellation option
   - Backend API endpoints
   - Database schema updates
   - UI in settings screen
   - Multi-step confirmation

3. **Automatic Updates**
   - CodePush integration
   - Silent background updates
   - Deployment scripts
   - Setup documentation

### Files Modified

**Backend:**
- `server/migrations/003_add_account_status.sql` (new)
- `server/src/users/user.entity.ts`
- `server/src/users/users.service.ts`
- `server/src/users/users.controller.ts`

**Frontend:**
- `app-rn/src/screens/SettingsScreen.tsx`
- `app-rn/App.tsx`
- `app-rn/package.json`

**Documentation:**
- `AUTO_UPDATE_SETUP.md` (new)
- `ACCOUNT_MANAGEMENT_FEATURES.md` (new)

**Scripts:**
- `app-rn/scripts/setup-codepush.ps1` (new)
- `app-rn/scripts/deploy-update.ps1` (new)

### Next Steps

1. Run database migration
2. Deploy backend changes
3. Set up AppCenter account
4. Configure CodePush
5. Test account management features
6. Deploy frontend update via CodePush
