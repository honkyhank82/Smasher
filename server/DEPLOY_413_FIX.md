# Deploy 413 Error Fix to Fly.io

## 🔧 Fix Applied

Added body size limit configuration to `src/main.ts`:
- JSON body limit: 50MB
- URL-encoded body limit: 50MB

This allows the server to accept larger file uploads.

## 🚀 Deploy to Fly.io

```powershell
cd c:\DevProjects\smasher\server

# Deploy to Fly.io
fly deploy
```

## ⏱️ Deployment Time

- Build: ~2-3 minutes
- Deploy: ~1 minute
- **Total: ~3-4 minutes**

## ✅ Verify Deployment

After deployment completes:

```powershell
# Check if server is running
curl https://smasher-api.fly.dev/health

# Should return: {"status":"ok"}
```

## 📱 Test in App

Once deployed:
1. Reload the app on your device
2. Try uploading a photo
3. Should work without 413 error

## 🔍 If Still Getting 413

The error might be from Fly.io's proxy, not the server. Add to `fly.toml`:

```toml
[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 1
  processes = ['app']
  
  # Add this:
  [http_service.http_options]
    response_timeout = 60000  # 60 seconds
    read_timeout = 60000
    write_timeout = 60000
```

Then redeploy: `fly deploy`

## 📊 Alternative: Use Signed URLs (Recommended)

The app is already using signed URLs to upload directly to Cloudflare R2, bypassing the server. The 413 error shouldn't happen with this flow.

**Current flow:**
1. App → Server: "Give me upload URL" (tiny request)
2. Server → App: "Here's the signed URL"
3. App → R2: Upload file directly (bypasses server)

If getting 413 on step 1, something is wrong with the request.

## 🐛 Debug: Check What's Being Sent

The `/media/signed-upload` endpoint only expects:
```json
{
  "fileName": "profile_123456.jpg",
  "fileType": "image/jpeg"
}
```

This is < 1KB. If getting 413, check if the app is accidentally sending the image data in this request.

---

**Deploy now:** `fly deploy`
