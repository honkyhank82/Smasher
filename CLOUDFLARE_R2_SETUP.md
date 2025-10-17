# Cloudflare R2 Setup Guide for Smasher

Complete step-by-step guide to set up Cloudflare R2 for media storage.

---

## Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Enter your email and create a password
3. Verify your email address
4. **You don't need a domain** - R2 works without one

---

## Step 2: Access R2

1. Log in to https://dash.cloudflare.com
2. In the left sidebar, click **"R2"** (under "Storage")
3. If prompted, click **"Purchase R2 Plan"** or **"Get Started"**
   - **Don't worry** - there's a free tier, you won't be charged initially
4. Accept the terms and conditions

---

## Step 3: Create R2 Bucket

1. Click **"Create bucket"** button
2. Enter bucket name: `smasher-media`
   - Must be lowercase, no spaces
   - Can use: letters, numbers, hyphens
3. Select location: **Automatic** (recommended)
4. Click **"Create bucket"**

✅ Your bucket is now created!

---

## Step 4: Configure CORS (Important!)

This allows your app to upload files directly to R2.

1. Click on your `smasher-media` bucket
2. Go to **"Settings"** tab
3. Scroll down to **"CORS Policy"**
4. Click **"Add CORS policy"** or **"Edit"**
5. Paste this configuration:

```json 
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

6. Click **"Save"**

✅ CORS is now configured!

---

## Step 5: Create API Token

1. Go back to R2 overview (click "R2" in sidebar)
2. Click **"Manage R2 API Tokens"** (top right)
3. Click **"Create API Token"**
4. Configure the token:
   - **Token name:** `smasher-app-token`
   - **Permissions:** Select **"Object Read & Write"**
   - **TTL (Time to Live):** Leave as "Forever" or set expiration
   - **Bucket:** Select **"Apply to specific buckets only"**
     - Choose: `smasher-media`
5. Click **"Create API Token"**

---

## Step 6: Save Your Credentials

⚠️ **IMPORTANT:** You'll only see these once! Copy them immediately.

You'll see:
```
Account ID: abc123def456...
Access Key ID: 1234567890abcdef...
Secret Access Key: abcdefghijklmnopqrstuvwxyz1234567890...
```

**Copy all three values** and save them securely!

---

## Step 7: Get Your R2 Endpoint URL

Your endpoint URL format is:
```
https://[ACCOUNT_ID].r2.cloudflarestorage.com
```

Replace `[ACCOUNT_ID]` with your Account ID from Step 6.

Example:
```
https://abc123def456.r2.cloudflarestorage.com
```

---

## Step 8: Configure Your Server

### Option A: Local Development

Edit `server/.env` file:

```env
# Cloudflare R2 Configuration
S3_ENDPOINT=https://[YOUR_ACCOUNT_ID].r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your_access_key_from_step_6
S3_SECRET_ACCESS_KEY=your_secret_access_key_from_step_6
S3_BUCKET=smasher-media
S3_REGION=auto
S3_FORCE_PATH_STYLE=true

# Optional: Public URL (if you set up custom domain later)
# PUBLIC_MEDIA_BASE_URL=https://media.yourdomain.com
```

### Option B: Production (Fly.io)

Set secrets:
```bash
cd server

fly secrets set S3_ENDPOINT="https://[YOUR_ACCOUNT_ID].r2.cloudflarestorage.com"
fly secrets set S3_ACCESS_KEY_ID="your_access_key"
fly secrets set S3_SECRET_ACCESS_KEY="your_secret_access_key"
fly secrets set S3_BUCKET="smasher-media"
fly secrets set S3_REGION="auto"
fly secrets set S3_FORCE_PATH_STYLE="true"
```

---

## Step 9: Test the Setup

### Test 1: Start Your Server

```bash
cd server
npm run start:dev
```

Check the logs - you should NOT see any R2/S3 errors.

### Test 2: Test Upload from App

1. Start your React Native app
2. Go to Gallery screen
3. Try uploading a photo
4. Check if it appears in the gallery

### Test 3: Verify in R2 Dashboard

1. Go to Cloudflare dashboard
2. Click R2 → `smasher-media` bucket
3. You should see uploaded files in the format:
   ```
   users/[user-id]/photos/[timestamp]-[filename]
   ```

---

## Step 10: (Optional) Set Up Public Access

By default, files are private and require signed URLs. For better performance, you can make the bucket public:

### Option 1: R2 Custom Domain (Recommended)

1. In your bucket settings, click **"Connect Domain"**
2. Enter a subdomain: `media.yourdomain.com`
3. Follow DNS setup instructions
4. Update your `.env`:
   ```env
   PUBLIC_MEDIA_BASE_URL=https://media.yourdomain.com
   ```

### Option 2: R2.dev Subdomain (Quick & Free)

1. In bucket settings, enable **"Public Access"**
2. Click **"Allow Access"**
3. You'll get a URL like: `https://pub-abc123.r2.dev`
4. Update your `.env`:
   ```env
   PUBLIC_MEDIA_BASE_URL=https://pub-abc123.r2.dev
   ```

⚠️ **Note:** R2.dev URLs are rate-limited. Use custom domain for production.

---

## Troubleshooting

### Error: "Access Denied"
- Check your API token has "Object Read & Write" permissions
- Verify the token is applied to the correct bucket
- Make sure credentials are correctly copied (no extra spaces)

### Error: "Bucket not found"
- Verify bucket name is exactly `smasher-media`
- Check S3_BUCKET environment variable matches bucket name

### Error: "CORS policy"
- Make sure you added the CORS policy in Step 4
- Verify AllowedOrigins includes "*" or your domain

### Files not appearing in app
- Check browser/app console for errors
- Verify signed URLs are being generated
- Check file was actually uploaded to R2 (check dashboard)

### Upload fails silently
- Check network tab for failed requests
- Verify Content-Type header is set correctly
- Make sure file size isn't too large (R2 max: 5TB per object)

---

## Cost Breakdown

### Free Tier (First 10GB)
- Storage: **FREE** for first 10GB
- Operations: 1 million Class A (write) operations/month
- Operations: 10 million Class B (read) operations/month
- Egress: **FREE** (unlimited bandwidth)

### After Free Tier
- Storage: **$0.015/GB/month**
- Class A operations: $4.50 per million (uploads)
- Class B operations: $0.36 per million (downloads)
- Egress: **$0** (FREE - this is the big savings!)

### Example Costs

**100 users, 5 photos each:**
- Storage: ~500 photos × 2MB = 1GB = **FREE**
- Monthly cost: **$0**

**1,000 users, 5 photos each:**
- Storage: ~5,000 photos × 2MB = 10GB = **FREE**
- Monthly cost: **$0**

**10,000 users, 5 photos each:**
- Storage: ~50,000 photos × 2MB = 100GB
- Monthly cost: 90GB × $0.015 = **$1.35/month**

**100,000 users, 5 photos each:**
- Storage: ~500,000 photos × 2MB = 1TB
- Monthly cost: 990GB × $0.015 = **$14.85/month**

Compare to AWS S3 with same usage:
- Storage: $23/month
- Bandwidth (1TB egress): $90/month
- **Total: $113/month** vs R2's **$14.85/month**

---

## Security Best Practices

1. **Never commit credentials to Git**
   - Keep `.env` in `.gitignore`
   - Use environment variables

2. **Rotate API tokens periodically**
   - Create new token every 6-12 months
   - Delete old tokens

3. **Use separate tokens for dev/prod**
   - Development token for local testing
   - Production token for deployed app

4. **Monitor usage**
   - Check R2 dashboard monthly
   - Set up billing alerts in Cloudflare

5. **Implement file validation**
   - Check file types before upload
   - Limit file sizes (already done in app)
   - Scan for malware if handling user content at scale

---

## Next Steps

✅ R2 is now set up!

1. **Test locally:**
   ```bash
   cd server && npm run start:dev
   cd app-rn && npm start
   ```

2. **Try uploading a photo** in the app

3. **Check R2 dashboard** to verify file appears

4. **Deploy to production** when ready:
   ```bash
   cd server
   fly secrets set S3_ENDPOINT="..." S3_ACCESS_KEY_ID="..." S3_SECRET_ACCESS_KEY="..."
   fly deploy
   ```

---

## Support

- **Cloudflare R2 Docs:** https://developers.cloudflare.com/r2/
- **R2 Discord:** https://discord.gg/cloudflaredev
- **Pricing:** https://developers.cloudflare.com/r2/pricing/

---

**You're all set! Your app can now handle photo and video uploads.** 🎉
