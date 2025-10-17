# Debugging Improvements - Nearby Users & Settings Tabs

## Summary

This document outlines the improvements made to help diagnose and fix issues with:
1. **Nearby users not showing** on the Home screen
2. **Settings tabs showing "features coming soon"** messages

## Changes Made

### 1. Enhanced Error Logging (Frontend)

Added comprehensive error logging to all screens to help diagnose API issues:

#### Screens Updated:
- **HomeScreen.tsx** - Nearby users loading
- **BuddiesScreen.tsx** - Favorites loading
- **ChatsListScreen.tsx** - Conversations loading
- **PrivacySettingsScreen.tsx** - Privacy settings loading/updating
- **BlockedUsersScreen.tsx** - Blocked users loading

#### What Was Added:
- ✅ Detailed console logs with emojis for easy identification
- ✅ Error details including status codes, messages, and URLs
- ✅ User-friendly error alerts with retry options
- ✅ Structured error objects for debugging

#### Example Log Output:
```
🔍 Loading nearby users...
✅ Nearby users loaded: 5 users
```

Or on error:
```
❌ Failed to load nearby users: {
  message: "Network Error",
  status: 500,
  data: { error: "Database connection failed" },
  url: "/geo/nearby"
}
```

### 2. Mock Data Fallbacks (Frontend)

Created a mock data system for testing UI without backend:

#### New File:
- **`src/utils/mockData.ts`** - Contains mock data for all features

#### How to Enable:
Set `USE_MOCK_DATA = true` in `src/utils/mockData.ts`

#### Mock Data Available:
- ✅ Nearby users (5 sample users)
- ✅ Buddies/Favorites (2 sample buddies)
- ✅ Chats (2 sample conversations)
- ✅ Privacy settings (default values)
- ✅ Blocked users (1 sample blocked user)

#### Benefits:
- Test UI without backend running
- Develop frontend independently
- Simulate network delays
- Test empty states and error handling

### 3. Backend API Endpoints (Backend)

Added missing API endpoints to the backend:

#### New Endpoints Added to `users.controller.ts`:

1. **GET `/users/privacy-settings`**
   - Returns user's privacy settings
   - Currently returns default values

2. **PATCH `/users/privacy-settings`**
   - Updates privacy settings
   - Currently only updates `showDistance` → `isDistanceHidden`

3. **GET `/users/blocked`**
   - Returns list of blocked users
   - Currently returns empty array (TODO: implement blocked users table)

4. **POST `/users/block/:targetUserId`**
   - Blocks a user
   - Currently logs action (TODO: implement blocked users table)

5. **POST `/users/unblock/:targetUserId`**
   - Unblocks a user
   - Currently logs action (TODO: implement blocked users table)

6. **POST `/users/change-email`**
   - Changes user's email address
   - Verifies password before changing
   - Checks if new email is already in use

#### Service Methods Added to `users.service.ts`:
- `getPrivacySettings(userId)`
- `updatePrivacySettings(userId, settings)`
- `getBlockedUsers(userId)`
- `blockUser(userId, targetUserId)`
- `unblockUser(userId, targetUserId)`
- `changeEmail(userId, newEmail, password)`

## Diagnosis Steps

### Step 1: Check Console Logs

Open the Expo dev tools or Metro bundler console and look for:

1. **Location Issues:**
   ```
   ❌ Failed to initialize location: { message: "..." }
   ```

2. **API Errors:**
   ```
   ❌ Failed to load nearby users: { status: 404, message: "..." }
   ```

3. **Network Issues:**
   ```
   ❌ Failed to load nearby users: { message: "Network Error" }
   ```

### Step 2: Test with Mock Data

1. Open `src/utils/mockData.ts`
2. Change `USE_MOCK_DATA = false` to `USE_MOCK_DATA = true`
3. Restart the app
4. If UI works with mock data, the issue is backend-related

### Step 3: Check Backend Status

Verify these endpoints are working:

```bash
# Test nearby users endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://YOUR_API/geo/nearby

# Test privacy settings endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://YOUR_API/users/privacy-settings

# Test blocked users endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://YOUR_API/users/blocked

# Test buddies endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://YOUR_API/buddies

# Test chats endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://YOUR_API/chat/conversations
```

### Step 4: Check Location Permissions

The app needs location permissions to show nearby users:

1. Go to device Settings → Apps → SMASHER
2. Check if Location permission is granted
3. If not, grant "Allow all the time" or "Allow while using the app"

## Known Issues & TODOs

### Backend TODOs:

1. **Blocked Users Table** - Need to create a database table for blocked users
   - Currently returns empty array
   - Block/unblock actions only log to console

2. **Privacy Settings Fields** - Need to add fields to Profile entity:
   - `showOnlineStatus`
   - `showLastSeen`
   - `showReadReceipts`
   - `allowProfileViewing`
   - `discoverableInSearch`

3. **Email Verification** - Change email endpoint needs to send verification email

### Frontend Findings:

✅ All screens are fully implemented (no "coming soon" placeholders)
✅ All navigation is properly configured
✅ Error handling is now comprehensive

## Common Issues & Solutions

### Issue: "No users nearby"

**Possible Causes:**
1. Location permission not granted
2. User's location not set in database (lat/lng is null)
3. No other users within 15-mile radius
4. Backend `/geo/nearby` endpoint failing

**Solutions:**
1. Check location permissions
2. Check console logs for errors
3. Enable mock data to test UI
4. Verify backend is running and accessible

### Issue: Settings tabs not working

**Possible Causes:**
1. Backend endpoints missing (NOW FIXED)
2. Network connectivity issues
3. Authentication token expired

**Solutions:**
1. Backend endpoints now added
2. Check console logs for specific errors
3. Try logging out and back in

### Issue: Empty favorites/chats

**Possible Causes:**
1. No data in database yet
2. Backend endpoints failing
3. User hasn't added favorites or started chats

**Solutions:**
1. This is expected for new users
2. Check console logs for errors
3. Add some favorites or start a chat

## Testing Checklist

- [ ] Check console logs when opening Home screen
- [ ] Check console logs when opening Settings tabs
- [ ] Test with mock data enabled
- [ ] Verify location permissions are granted
- [ ] Test backend endpoints with curl/Postman
- [ ] Check if user has lat/lng in database
- [ ] Verify authentication token is valid
- [ ] Test on both iOS and Android

## Next Steps

1. **Run the app** and check console logs
2. **Enable mock data** if backend issues persist
3. **Implement blocked users table** in backend
4. **Add privacy settings fields** to Profile entity
5. **Test all endpoints** with real data

## Support

If issues persist after these improvements:

1. Share console logs from the app
2. Share backend logs from the server
3. Confirm which specific feature is not working
4. Test with mock data to isolate frontend vs backend issues
