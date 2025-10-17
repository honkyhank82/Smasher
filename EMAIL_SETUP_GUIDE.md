# 📧 Email Setup Guide - Verification Codes

**Issue**: Not receiving verification emails  
**Reason**: Resend API key not configured

---

## 🚀 Quick Solution (For Testing Now)

### Option 1: Get Code from Server Logs

The server logs the verification code even when email isn't configured!

**Steps**:
1. Try to sign up/login in the app
2. Run this command to see the code:
   ```powershell
   flyctl logs --app smasher-api
   ```
3. Look for a line like:
   ```
   📧 VERIFICATION CODE for your@email.com: 123456
   ```
4. Enter that code in the app

**OR use this PowerShell command to filter for codes**:
```powershell
flyctl logs --app smasher-api | Select-String -Pattern "VERIFICATION CODE"
```

---

## 🔧 Permanent Solution: Set Up Resend

### Step 1: Create Resend Account

1. Go to **https://resend.com**
2. Click **Sign Up** (it's free!)
3. Verify your email
4. Log in to dashboard

### Step 2: Get API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it: `smasher-production`
4. Copy the API key (starts with `re_`)
   - ⚠️ **Save it now!** You can't see it again

### Step 3: Verify Domain (Optional but Recommended)

**Option A: Use Resend's Test Domain** (Quick)
- Use `onboarding@resend.dev` as sender
- Limited to 100 emails/day
- Good for testing

**Option B: Verify Your Own Domain** (Production)
1. In Resend, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `smasherapp.com`)
4. Add the DNS records they provide
5. Wait for verification (usually 5-10 minutes)
6. Use `noreply@yourdomain.com` as sender

### Step 4: Configure Fly.io Secrets

```powershell
# Set the API key
flyctl secrets set RESEND_API_KEY=re_your_api_key_here --app smasher-api

# Set the sender email
# Option A: Using Resend test domain
flyctl secrets set RESEND_FROM=onboarding@resend.dev --app smasher-api

# Option B: Using your own domain
flyctl secrets set RESEND_FROM=noreply@yourdomain.com --app smasher-api
```

### Step 5: Restart App

The app will automatically restart when you set secrets, but you can force it:
```powershell
flyctl apps restart smasher-api
```

### Step 6: Test

1. Open the Smasher app
2. Try to sign up with a real email
3. Check your inbox for the verification code
4. Also check spam folder

---

## 📊 Resend Pricing

### Free Tier
- ✅ 3,000 emails per month
- ✅ 100 emails per day
- ✅ Perfect for testing and small user base

### Paid Plans
- **$20/month**: 50,000 emails
- **$80/month**: 100,000 emails
- Only needed when you have many users

---

## 🧪 Testing Without Email (Current Workaround)

### Method 1: Check Server Logs
```powershell
# Watch logs in real-time
flyctl logs --app smasher-api

# Filter for verification codes
flyctl logs --app smasher-api | Select-String "VERIFICATION CODE"
```

### Method 2: SSH into Server
```powershell
flyctl ssh console --app smasher-api
# Then check logs inside the container
```

---

## 🔍 Troubleshooting

### Email Not Sending (After Setup)

**Check 1: Verify API Key is Set**
```powershell
flyctl secrets list --app smasher-api
```
Should show `RESEND_API_KEY` in the list.

**Check 2: Check Server Logs for Errors**
```powershell
flyctl logs --app smasher-api
```
Look for errors like:
- `Failed to send verification code email`
- `Invalid API key`
- `Domain not verified`

**Check 3: Verify Sender Email**
- If using your domain, make sure DNS records are set up
- If using `resend.dev`, use exactly: `onboarding@resend.dev`

**Check 4: Check Resend Dashboard**
1. Go to https://resend.com
2. Click **Logs**
3. See if emails are being sent
4. Check for any errors

### Email Goes to Spam

**Solutions**:
1. Verify your domain (adds SPF, DKIM records)
2. Use a professional sender name
3. Add unsubscribe link
4. Don't send too many emails too fast

### Rate Limiting

Free tier limits:
- 100 emails per day
- 3,000 emails per month

If you hit limits:
- Upgrade to paid plan
- Or wait until next day/month

---

## 📝 Quick Setup Commands

### Complete Setup (Copy & Paste)

```powershell
# 1. Set your Resend API key (get from https://resend.com)
flyctl secrets set RESEND_API_KEY=re_YOUR_KEY_HERE --app smasher-api

# 2. Set sender email (choose one)
# Option A: Test domain
flyctl secrets set RESEND_FROM=onboarding@resend.dev --app smasher-api

# Option B: Your domain (after verification)
flyctl secrets set RESEND_FROM=noreply@yourdomain.com --app smasher-api

# 3. Restart (optional, happens automatically)
flyctl apps restart smasher-api

# 4. Test by checking logs
flyctl logs --app smasher-api
```

---

## 🎯 Recommended Approach

### For Testing (Right Now)
1. ✅ Use server logs to get verification codes
2. ✅ Share codes manually with testers
3. ✅ No setup required

### For Beta Testing (Next Week)
1. Create free Resend account
2. Use `onboarding@resend.dev` sender
3. Set up API key (5 minutes)
4. Test with real emails

### For Production (Before Launch)
1. Buy your domain (e.g., `smasherapp.com`)
2. Verify domain in Resend
3. Use `noreply@smasherapp.com`
4. Monitor email delivery rates

---

## 💡 Alternative Email Services

If you don't want to use Resend:

### SendGrid
- Free: 100 emails/day
- Setup: Similar to Resend
- Code changes: Minimal

### Mailgun
- Free: 5,000 emails/month (first 3 months)
- Setup: More complex
- Code changes: Moderate

### AWS SES
- Free: 62,000 emails/month (if on AWS)
- Setup: Complex
- Code changes: Moderate

**Recommendation**: Stick with Resend - it's the easiest and has the best free tier.

---

## 🆘 Need Help?

### Get Verification Code Now
```powershell
# Try to sign up in the app, then run:
flyctl logs --app smasher-api | Select-String "VERIFICATION CODE" | Select-Object -Last 5
```

### Check if Email Service is Working
```powershell
# Check secrets
flyctl secrets list --app smasher-api

# Check logs for email attempts
flyctl logs --app smasher-api | Select-String "EmailService"
```

---

## ✅ Summary

**Current Status**: 
- ❌ Emails not being sent
- ✅ Codes logged to server (workaround available)

**To Fix**:
1. Sign up at https://resend.com (free)
2. Get API key
3. Run: `flyctl secrets set RESEND_API_KEY=re_xxx --app smasher-api`
4. Run: `flyctl secrets set RESEND_FROM=onboarding@resend.dev --app smasher-api`
5. Done! Emails will work

**Time Required**: 5-10 minutes

---

*Last Updated: October 8, 2025*
