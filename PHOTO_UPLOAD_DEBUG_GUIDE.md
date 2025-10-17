# Photo Upload Network Error - Debugging Guide

## Current Error
"Network request failed" when trying to upload photos

## Enhanced Logging Added
The code now includes detailed step-by-step logging to identify exactly where the failure occurs.

## Step-by-Step Debugging Process

### 1. Check Logs
Run the app and monitor logs:
```powershell
cd C:\DevProjects\smasher\app-rn
npx react-native log-android
```

Look for the upload sequence:
```
=== UPLOAD START ===
File: [filename]
Type: [mime type]
URI: [file uri]
File size: [bytes]
Step 1: Requesting signed URL from server...
✓ Got signed URL
Upload URL domain: [domain]
File key: [key]
Step 2: Converting file to blob...
File fetch status: [status]
✓ File converted to blob
Blob size: [bytes]
Blob type: [type]
Step 3: Uploading to R2 storage...
Upload timeout: 60 seconds
Upload response status: [status]
✓ Upload successful
Step 4: Confirming upload with server...
✓ Upload confirmed, media record created
=== UPLOAD COMPLETE ===
```

### 2. Identify Failure Point

#### If it fails at "Step 1: Requesting signed URL"
**Problem**: Cannot reach your backend server
**Solutions**:
- Check if server is running: `curl https://smasher-api.fly.dev/health`
- Verify API_BASE_URL in `app-rn/src/config/api.ts`
- Check authentication token is valid
- Verify network connectivity on device

#### If it fails at "Step 2: Converting file to blob"
**Problem**: Cannot read file from device
**Solutions**:
- Check file permissions
- Verify the image picker returned a valid URI
- Try with a smaller image
- Check if the file exists at the URI

#### If it fails at "Step 3: Uploading to R2 storage"
**Problem**: Cannot upload to Cloudflare R2
**Solutions**:
- Check CORS configuration in R2
- Verify R2 credentials in server .env
- Check if signed URL is valid (expires in 5 minutes)
- Verify network can reach R2 endpoint
- Check if file size exceeds limits

#### If it fails at "Step 4: Confirming upload"
**Problem**: Upload succeeded but server confirmation failed
**Solutions**:
- Check server logs for errors
- Verify database connection
- Check if media record creation is working

### 3. Common Issues & Fixes

#### Issue: "Network request failed" immediately
**Cause**: Device has no internet connection or cannot reach server
**Fix**:
```powershell
# Test server connectivity from your computer
curl https://smasher-api.fly.dev/health

# If server is down, start it
cd C:\DevProjects\smasher\server
npm run start:dev
```

#### Issue: "Network request failed" during R2 upload
**Cause**: CORS or R2 configuration issue
**Fix**:
1. Check R2 CORS settings in Cloudflare dashboard
2. Add CORS rules:
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

#### Issue: "Upload timeout"
**Cause**: File too large or connection too slow
**Fix**:
- Reduce image quality in GalleryScreen.tsx (currently 0.8)
- Reduce maxWidth/maxHeight (currently 1024x1024)
- Increase timeout (currently 60 seconds)

#### Issue: "Upload failed with status 403"
**Cause**: Invalid R2 credentials or expired signed URL
**Fix**:
1. Check server .env file:
```env
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=smasher-media
```
2. Verify credentials in Cloudflare R2 dashboard
3. Check if signed URL expired (5 minute limit)

#### Issue: "Upload failed with status 500"
**Cause**: Server error
**Fix**:
- Check server logs
- Verify database connection
- Check R2 service is accessible from server

### 4. Test Connectivity

#### Test Backend Server
```powershell
# Health check
curl https://smasher-api.fly.dev/health

# Test auth (replace TOKEN with your actual token)
curl -H "Authorization: Bearer TOKEN" https://smasher-api.fly.dev/media/my-media
```

#### Test from Device
1. Open Chrome on your computer
2. Navigate to: `chrome://inspect`
3. Select your device
4. Open Console
5. Try uploading and watch for errors

### 5. Alternative Upload Method

If the issue persists, we can try using XMLHttpRequest instead of fetch:

```typescript
// Alternative upload method (can be added if fetch fails)
const uploadWithXHR = (url: string, blob: Blob, contentType: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Network request failed'));
    });
    
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timeout'));
    });
    
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.timeout = 60000;
    xhr.send(blob);
  });
};
```

### 6. Quick Fixes to Try

#### Fix 1: Clear App Cache
```powershell
cd app-rn/android
.\gradlew clean
cd ..
npx react-native start --reset-cache
```

#### Fix 2: Reinstall App
```powershell
adb uninstall com.smasherapp
cd app-rn
npx react-native run-android
```

#### Fix 3: Check Permissions
Verify in `app-rn/android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
```

#### Fix 4: Test with Small Image
- Try uploading a very small image (< 100KB)
- If it works, the issue is file size related

### 7. What to Report

When reporting the issue, include:

1. **Exact error message** from the alert
2. **Console logs** showing which step failed
3. **Device info**: Android version, device model
4. **Network**: WiFi or mobile data?
5. **File info**: Size, type of image
6. **Server status**: Is it reachable?

### 8. Next Steps

Run the app with the enhanced logging and share:
1. The complete console output from upload attempt
2. Which step shows the ❌ error marker
3. Any additional error details shown

This will help identify the exact root cause.
