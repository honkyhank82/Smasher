# Mock Data Configuration

**Status:** ✅ Mock data is now ENABLED  
**Date:** October 17, 2025

## Issue Resolution

**Problem:** No data showing in the app  
**Root Cause:** Database is empty - no users or profiles exist yet

## Current Configuration

### Mock Data Status
- **File:** `app-rn/src/utils/mockData.ts`
- **Setting:** `USE_MOCK_DATA = true`
- **Status:** Mock data is ENABLED

### What You'll See Now

With mock data enabled, the app will display:

1. **Home Screen (Nearby Users):**
   - 8 mock users with profiles
   - Names: Alex, Jordan, Sam, Taylor, Morgan, Riley, Casey, Avery
   - Distances ranging from 0.5 to 8.1 km
   - Profile pictures from pravatar.cc

2. **Buddies Screen:**
   - 4 mock buddies
   - Names: Chris, Jamie, Dakota, Quinn

3. **Chats Screen:**
   - 5 mock conversations
   - Recent messages with timestamps
   - Unread message counts

4. **Privacy Settings:**
   - Mock privacy settings pre-configured

5. **Blocked Users:**
   - Mock blocked users list

## OTA Update Published

**Update Group ID:** `8c3cbbeb-ca81-4012-9f05-4def8e2179ba`  
**Message:** "Re-enable mock data for testing - database is empty"  
**Branch:** production  
**Runtime Version:** 1.0.3

**Dashboard:** https://expo.dev/accounts/smashermain/projects/smasher-app/updates/8c3cbbeb-ca81-4012-9f05-4def8e2179ba

## How to Switch to Real Backend Data

When you're ready to use real data from the backend, you have two options:

### Option 1: Populate the Database with Test Data

I've created a seed script for you:

```bash
cd server
npm run seed
```

This will create 8 test users:
- **Emails:** alex@test.com, jordan@test.com, sam@test.com, taylor@test.com, morgan@test.com, riley@test.com, casey@test.com, avery@test.com
- **Password:** password123 (for all test users)

Then disable mock data:
1. Edit `app-rn/src/utils/mockData.ts`
2. Change `USE_MOCK_DATA = true` to `USE_MOCK_DATA = false`
3. Push OTA update: `npx eas-cli update --branch production --message "Use real backend data"`

### Option 2: Keep Using Mock Data

If you want to continue testing the UI without worrying about the backend, just leave mock data enabled. It's perfect for:
- UI/UX testing
- Demo purposes
- Development without backend dependency

## Files Modified

- `app-rn/src/utils/mockData.ts` - Re-enabled mock data
- `server/src/scripts/seed-test-data.ts` - Created seed script (ready to use)
- `server/package.json` - Added `npm run seed` command

## Backend Status

✅ **Backend is operational:** https://smasher-api.fly.dev  
✅ **Database schema synced**  
⚠️ **Database is empty** - no users yet

## Next Steps

Choose one:

1. **Continue with mock data** (current setup)
   - No action needed
   - App will show mock data immediately after restart

2. **Switch to real data**
   - Run `npm run seed` in the server directory
   - Disable mock data in `mockData.ts`
   - Push OTA update

## User Experience

- Users will see mock data after restarting the app
- The update will be applied automatically via OTA
- No app store approval needed
- All screens will show populated data

## Mock Data Details

### Nearby Users (8 users)
- Alex (28, 0.5 km) - Coffee enthusiast
- Jordan (25, 1.2 km) - Fitness trainer
- Sam (30, 2.3 km) - Software engineer
- Taylor (27, 3.8 km) - Artist
- Morgan (26, 4.5 km) - Musician
- Riley (29, 5.2 km) - Travel blogger
- Casey (24, 6.7 km) - Chef
- Avery (31, 8.1 km) - Bookworm

### Buddies (4 users)
- Chris - Tech enthusiast and gamer
- Jamie - Travel blogger
- Dakota - Musician
- Quinn - Bookworm

### Chats (5 conversations)
- Alex - "That sounds amazing! Count me in 🎉" (3 unread)
- Jordan - "Just sent you the photos!" (1 unread)
- Chris - "See you at 7!" (0 unread)
- Sam - "The yoga class was incredible!" (0 unread)
- Taylor - "Let's grab coffee this weekend" (0 unread)

## Notes

- Mock data is client-side only - no backend calls are made
- Perfect for testing UI without backend dependency
- Can be toggled on/off at any time
- Seed script is ready when you want real data
