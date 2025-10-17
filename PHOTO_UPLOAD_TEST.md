# Photo Upload Testing Guide

## How to Test Photo Upload

### 1. Open the App
- App should be installing on your device now
- Wait for installation to complete

### 2. Navigate to Gallery
- Login to the app
- Go to your profile
- Tap on "Gallery" or photo management section

### 3. Try Uploading a Photo
- Tap "Add Photo" button
- Select a photo from your device
- Watch for any error messages

### 4. Check Console Logs

Open a new PowerShell window and run:
```powershell
cd C:\DevProjects\smasher\app-rn
npx react-native log-android
```

This will show all console logs including:
- "Starting upload for: [filename]"
- "Got signed URL, uploading to storage..."
- "Upload successful, confirming..."
- "Upload confirmed, media record created"
- Or any error messages

### 5. Common Error Messages

**"Failed to upload photo"**
- Check server logs for the actual error
- Verify R2 credentials are set correctly

**"Network request failed"**
- Server might not be running
- Check if server is accessible

**"Upload failed with status 403"**
- R2 credentials issue
- CORS configuration problem

**"Upload failed with status 500"**
- Server error
- Check server logs

### 6. Check Server Logs

In another terminal:
```powershell
# If using Docker
docker logs -f smasher-server

# Or check your server console
```

Look for errors in:
- `/media/signed-upload` endpoint
- `/media/confirm-upload` endpoint
- R2/S3 connection errors

### 7. Verify R2 Configuration

Check your `.env` file has:
```env
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=smasher-media
PUBLIC_MEDIA_BASE_URL=https://your-domain.com
```

### 8. Test R2 Connection

You can test if R2 is working by checking the server startup logs:
- Should see "MediaService initialized"
- No errors about S3/R2 connection

### 9. Enhanced Error Messages

The latest version includes detailed error logging:
- Error message will show in the Alert
- Console will show full error details
- In development mode, Alert shows JSON error details

### 10. What to Share

If upload still fails, share:
1. **Error message** from the Alert dialog
2. **Console logs** from `npx react-native log-android`
3. **Server logs** from your server console
4. **When it fails**: During signed URL request, upload, or confirmation?

---

## Quick Fixes

### Fix 1: Restart ADB
```powershell
adb kill-server
adb start-server
adb devices
```

### Fix 2: Restart Metro Bundler
```powershell
cd app-rn
npx react-native start --reset-cache
```

### Fix 3: Rebuild App
```powershell
cd app-rn/android
.\gradlew clean
cd ..
npx react-native run-android
```

### Fix 4: Check Server is Running
```powershell
curl http://localhost:3000/health
```

---

**Once the app installs, try uploading a photo and check the logs!**
