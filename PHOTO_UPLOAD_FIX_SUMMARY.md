# Photo Upload Network Error - Fix Summary

## Problem
Users experiencing "Network request failed" error when trying to upload photos.

## Changes Made

### 1. Enhanced Logging in GalleryScreen.tsx
Added comprehensive step-by-step logging to identify exactly where the upload fails:

- **Step 1**: Request signed URL from server
- **Step 2**: Convert file to blob
- **Step 3**: Upload to R2 storage
- **Step 4**: Confirm upload with server

Each step now logs:
- Success markers (✓)
- Failure markers (❌)
- Detailed information (file size, URLs, status codes, etc.)

### 2. Improved Error Handling
Enhanced error messages to identify:
- Which step failed
- Specific error codes (401, 403, 500)
- Network vs timeout vs server errors
- Detailed debug info in development mode

### 3. Better Error Messages
User-friendly messages for common scenarios:
- Network connectivity issues
- Upload timeouts
- Authentication failures
- Server errors
- Permission denied (CORS/R2 issues)

## How to Test

### Quick Test
```powershell
cd C:\DevProjects\smasher
.\test-photo-upload.ps1
```

This script will:
1. Check if server is running
2. Clean and rebuild the app
3. Install on device
4. Monitor logs automatically

### Manual Test
```powershell
# Terminal 1: Start Metro bundler
cd C:\DevProjects\smasher\app-rn
npx react-native start --reset-cache

# Terminal 2: Install app
cd C:\DevProjects\smasher\app-rn
npx react-native run-android

# Terminal 3: Monitor logs
cd C:\DevProjects\smasher\app-rn
npx react-native log-android
```

Then:
1. Open the app on your device
2. Navigate to Gallery
3. Try uploading a photo
4. Watch the logs in Terminal 3

## What to Look For

### Success Pattern
```
=== UPLOAD START ===
File: IMG_1234.jpg
Type: image/jpeg
URI: file:///...
File size: 123456
Step 1: Requesting signed URL from server...
✓ Got signed URL
Upload URL domain: [account-id].r2.cloudflarestorage.com
File key: users/[userId]/photos/[timestamp]-IMG_1234.jpg
Step 2: Converting file to blob...
File fetch status: 200
✓ File converted to blob
Blob size: 123456 bytes
Blob type: image/jpeg
Step 3: Uploading to R2 storage...
Upload timeout: 60 seconds
Upload response status: 200
✓ Upload successful
Step 4: Confirming upload with server...
✓ Upload confirmed, media record created
Media ID: [uuid]
=== UPLOAD COMPLETE ===
```

### Failure Pattern
```
=== UPLOAD START ===
...
❌ UPLOAD FAILED ❌
Error: Network request failed
Error name: Error
Error message: Network request failed
Error details: {...}
Failed at: Step 3 (R2 upload)
Error summary: Network connectivity issue
```

## Common Issues & Solutions

### Issue 1: Fails at Step 1 (Get signed URL)
**Symptom**: `Failed at: Step 1 (Get signed URL)`
**Cause**: Cannot reach backend server
**Solution**:
- Verify server is running: `curl https://smasher-api.fly.dev/health`
- Check API_BASE_URL in `app-rn/src/config/api.ts`
- Verify authentication token is valid

### Issue 2: Fails at Step 2 (File conversion)
**Symptom**: `Failed at: Step 2 (File conversion)`
**Cause**: Cannot read file from device
**Solution**:
- Check file permissions in AndroidManifest.xml
- Try with a different image
- Verify the image picker returned a valid URI

### Issue 3: Fails at Step 3 (R2 upload)
**Symptom**: `Failed at: Step 3 (R2 upload)` or `HTTP 403`
**Cause**: CORS or R2 configuration issue
**Solution**:
1. Check R2 CORS settings in Cloudflare dashboard
2. Verify R2 credentials in server `.env`:
   ```env
   S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
   S3_ACCESS_KEY_ID=your-access-key
   S3_SECRET_ACCESS_KEY=your-secret-key
   S3_BUCKET=smasher-media
   ```
3. Add CORS rules to R2 bucket:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

### Issue 4: Upload Timeout
**Symptom**: `Upload timeout (60s limit exceeded)`
**Cause**: File too large or connection too slow
**Solution**:
- Try a smaller image
- Reduce quality setting in GalleryScreen.tsx (line 78: `quality: 0.8`)
- Reduce max dimensions (line 79-80: `maxWidth: 1024, maxHeight: 1024`)
- Check internet connection speed

### Issue 5: Fails at Step 4 (Confirm upload)
**Symptom**: `Failed at: Step 4 (Confirm upload)`
**Cause**: Upload succeeded but server confirmation failed
**Solution**:
- Check server logs for errors
- Verify database connection
- Check if media table exists

## Next Steps

1. **Run the test**: Execute `.\test-photo-upload.ps1`
2. **Try uploading**: Attempt to upload a photo in the app
3. **Check logs**: Look for the failure step and error details
4. **Report findings**: Share:
   - Which step failed (1, 2, 3, or 4)
   - The error message
   - The complete log output
   - Device and network info

## Additional Resources

- **Detailed debugging guide**: See `PHOTO_UPLOAD_DEBUG_GUIDE.md`
- **Original fix documentation**: See `NETWORK_UPLOAD_FIX.md`
- **Testing guide**: See `PHOTO_UPLOAD_TEST.md`

## Files Modified

1. `app-rn/src/screens/GalleryScreen.tsx` - Enhanced logging and error handling
2. `PHOTO_UPLOAD_DEBUG_GUIDE.md` - Comprehensive debugging guide (NEW)
3. `test-photo-upload.ps1` - Automated test script (NEW)
4. `PHOTO_UPLOAD_FIX_SUMMARY.md` - This file (NEW)

## Previous Fixes (Already Applied)

- ✓ Increased API timeout from 10s to 30s
- ✓ Added 60s timeout to R2 uploads
- ✓ Implemented retry logic for network failures
- ✓ Enhanced error messages
- ✓ Added blob conversion error handling

## New Fixes (Just Applied)

- ✓ Step-by-step logging with visual markers
- ✓ Detailed error categorization
- ✓ Failure step identification
- ✓ Enhanced debug information in dev mode
- ✓ Better error context (HTTP codes, error types)
