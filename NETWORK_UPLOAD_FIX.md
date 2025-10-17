# Network Upload Fix - Photo Upload Error Resolution

## Problem
Users were experiencing "Network request failed" errors when trying to upload photos to the app. This error occurred during the upload process to Cloudflare R2 storage.

## Root Causes Identified

1. **No timeout on R2 upload fetch calls**: The direct `fetch()` calls to upload files to R2 had no timeout, causing indefinite hangs on slow/unstable connections
2. **Insufficient API timeout**: The axios API timeout was only 10 seconds, which was too short for file uploads
3. **Poor error handling**: Generic error messages didn't help users understand what went wrong
4. **No retry mechanism**: Network failures required users to manually restart the entire upload process

## Fixes Applied

### 1. Increased API Timeout
**File**: `app-rn/src/config/api.ts`
- Changed timeout from 10 seconds to 30 seconds
- This gives more time for the initial signed URL request and confirmation steps

### 2. Added Upload Timeout to R2 Fetch Calls
**Files**: 
- `app-rn/src/screens/GalleryScreen.tsx`
- `app-rn/src/screens/EditProfileScreen.tsx`
- `app-rn/src/screens/CreateProfileScreen.tsx`

Added a 60-second timeout wrapper using `Promise.race()`:
```typescript
const uploadResponse = await Promise.race([
  fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType },
  }),
  new Promise<Response>((_, reject) =>
    setTimeout(() => reject(new Error('Upload timeout')), 60000)
  ),
]);
```

### 3. Enhanced Error Handling
**File**: `app-rn/src/screens/GalleryScreen.tsx`

- Added specific error detection for "Network request failed" and timeout errors
- Improved error messages to be more user-friendly
- Added blob conversion error handling with detailed messages
- Check response status and provide meaningful feedback

### 4. Implemented Retry Logic
**File**: `app-rn/src/screens/GalleryScreen.tsx`

- Automatic retry offer for network failures (up to 2 retries)
- Automatic retry offer for timeout errors (up to 1 retry)
- User-friendly retry dialog with clear messaging

### 5. Better Blob Conversion Handling
All upload screens now:
- Check if file fetch was successful before converting to blob
- Log blob size for debugging
- Provide specific error messages if file reading fails

## Testing Recommendations

1. **Test on slow network**: Enable network throttling to simulate slow connections
2. **Test with large files**: Upload photos/videos near the size limit
3. **Test network interruption**: Toggle airplane mode during upload
4. **Check error messages**: Verify users get helpful, actionable error messages
5. **Test retry functionality**: Ensure retry works correctly after network failures

## How to Test

```powershell
# 1. Rebuild the app
cd app-rn
npx react-native run-android

# 2. Monitor logs
npx react-native log-android

# 3. Try uploading photos in different scenarios:
# - Normal network
# - Slow network (enable throttling in Chrome DevTools)
# - Interrupted network (toggle airplane mode)
# - Large photos (>5MB)
```

## Expected Behavior After Fix

1. **Network failures**: User sees "Network connection failed. Please check your internet connection." with retry option
2. **Timeouts**: User sees "Upload timed out. The file may be too large or your connection is slow." with retry option
3. **Other errors**: User sees specific error message from server or generic fallback
4. **Successful uploads**: User sees "Success" message and photo appears in gallery
5. **Retry**: User can retry failed uploads without re-selecting the photo

## Additional Notes

- The 60-second timeout for R2 uploads should be sufficient for most photos/videos
- The retry mechanism prevents users from having to restart the entire flow
- All upload screens (Gallery, Create Profile, Edit Profile) now have consistent error handling
- Development mode shows detailed error information for debugging

## Files Modified

1. `app-rn/src/config/api.ts` - Increased timeout
2. `app-rn/src/screens/GalleryScreen.tsx` - Added timeout, retry, and enhanced error handling
3. `app-rn/src/screens/EditProfileScreen.tsx` - Added timeout and better error messages
4. `app-rn/src/screens/CreateProfileScreen.tsx` - Added timeout and better error messages
