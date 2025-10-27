# 🚀 SMASHER Deployment Checklist

## Pre-Deployment (Do First)

### Infrastructure Setup
- [ ] Create Cloudflare R2 account and bucket
- [ ] Create Resend account and get API key
- [ ] Create Railway account
- [ ] Create Render account
- [ ] Create Vercel account
- [ ] Have GitHub repo ready (for deployments)

### Database Setup (FIRST - All servers depend on this)
- [ ] Choose database provider:
  - [ ] Railway Managed PostgreSQL (recommended)
  - [ ] AWS RDS PostgreSQL
  - [ ] DigitalOcean Database
- [ ] Create PostgreSQL 14+ instance
- [ ] Get DATABASE_URL connection string
- [ ] Test connection locally
- [ ] Create `smasher` database
- [ ] Grant permissions to admin user

### Environment Variables
- [ ] Generate JWT_SECRET (random 32+ chars)
- [ ] Get Resend API key (re_xxxxx)
- [ ] Get R2 Account ID
- [ ] Get R2 Access Key ID
- [ ] Get R2 Secret Access Key
- [ ] Prepare all values in text file (for quick copy-paste)

---

## Installation

### 1. Install CLI Tools
```powershell
.\setup-all.ps1
# Choose option 1
```
- [ ] Fly CLI installed
- [ ] Railway CLI installed
- [ ] Vercel CLI installed

### 2. Setup Backend
```powershell
.\setup-all.ps1
# Choose option 2 or 6
```
- [ ] .env file created in `server/`
- [ ] DATABASE_URL is correct
- [ ] All required variables set
- [ ] `npm install` completed
- [ ] `npm run build` succeeds locally

### 3. Setup Web App
```powershell
.\setup-all.ps1
# Choose option 5 or 6
```
- [ ] `npm install` completed in `app-web/`
- [ ] `npm run build` succeeds
- [ ] Test with `npm run dev` works

### 4. Setup Mobile App (Already Done)
- [ ] `npm install` completed in `app-rn/`
- [ ] `npm run start` can launch

---

## Deployment (In Order)

### Phase 1: Fly.io (Primary Server)

**Authenticate**:
```bash
fly auth login
```
- [ ] Fly CLI authenticated

**First Time Setup**:
```bash
cd server
fly launch --name smasher-api --now=false
```
- [ ] Fly.io app created
- [ ] `fly.toml` generated in `server/`

**Set Secrets**:
```bash
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set JWT_SECRET="your-secret"
fly secrets set RESEND_API_KEY="re_xxxxx"
fly secrets set R2_ACCOUNT_ID="..."
fly secrets set R2_ACCESS_KEY_ID="..."
fly secrets set R2_SECRET_ACCESS_KEY="..."
fly secrets set FROM_EMAIL="noreply@smasher.app"
```
- [ ] All secrets set on Fly.io

**Deploy**:
```bash
cd server
fly deploy
```
- [ ] Build succeeds
- [ ] Deployment completes
- [ ] App is running

**Test**:
```bash
curl https://smasher-api.fly.dev/health
```
- [ ] Health endpoint returns 200
- [ ] Shows server info
- [ ] Database connected

---

### Phase 2: Railway (Secondary Server)

**Authenticate**:
```bash
railway login
```
- [ ] Railway CLI authenticated

**Create Project**:
```bash
cd server
railway link
railway add --service postgres
```
- [ ] Project linked
- [ ] PostgreSQL service created
- [ ] DATABASE_URL available in Railway dashboard

**Set Environment Variables**:

```bash
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="your-secret"
railway variables set RESEND_API_KEY="re_xxxxx"
railway variables set R2_ACCOUNT_ID="..."
railway variables set R2_ACCESS_KEY_ID="..."
railway variables set R2_SECRET_ACCESS_KEY="..."
railway variables set FROM_EMAIL="noreply@smasher.app"
railway variables set NODE_ENV=production
railway variables set PORT=3001
```
- [ ] All environment variables set

**Deploy**:
```bash
railway up
```
- [ ] Build succeeds
- [ ] Deployment completes
- [ ] App is running

**Test**:
```bash
curl https://smasher-production.up.railway.app/health
```
- [ ] Health endpoint returns 200
- [ ] Database connected

---

### Phase 3: Render (Tertiary Server - Optional)

**Setup via Dashboard**:
1. Go to https://dashboard.render.com
2. Create new Web Service
3. Connect GitHub repository
4. Settings:
   - [ ] Root Directory: `server`
   - [ ] Build Command: `npm ci && npm run build`
   - [ ] Start Command: `npm run start:prod`

**Set Environment Variables**:

In Render dashboard → Environment:
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] RESEND_API_KEY
- [ ] R2_ACCOUNT_ID
- [ ] R2_ACCESS_KEY_ID
- [ ] R2_SECRET_ACCESS_KEY
- [ ] FROM_EMAIL
- [ ] NODE_ENV=production
- [ ] PORT=3001

**Deploy**:
- [ ] Click Deploy
- [ ] Build succeeds
- [ ] App is running on https://smasher.onrender.com

**Test**:
```bash
curl https://smasher.onrender.com/health
```
- [ ] Health endpoint returns 200
- [ ] Database connected

---

### Phase 4: Web App (Vercel)

**Authenticate**:
```bash
vercel login
```
- [ ] Vercel CLI authenticated

**Create Project**:
```bash
cd app-web
vercel
```
- [ ] Project created on Vercel
- [ ] Connected to GitHub

**Set Environment Variables** (optional):

In Vercel dashboard → Settings → Environment Variables:
```env
VITE_API_URL=https://smasher-api.fly.dev
```
- [ ] Environment variable set (optional, has fallback)

**Deploy to Production**:
```bash
vercel --prod
```
- [ ] Build succeeds
- [ ] Production URL generated
- [ ] Web app is live

**Test**:
- [ ] Open web app URL
- [ ] Can load login page
- [ ] Can input email (don't submit yet)

---

## Post-Deployment Testing

### 1. Backend Health Checks

```powershell
.\deploy-all-servers.ps1
# Select option 6: Check server health
```

- [ ] Fly.io: HEALTHY ✅
- [ ] Railway: HEALTHY ✅
- [ ] Render: HEALTHY ✅ (if deployed)

### 2. Test Authentication

**Test on Web App**:
1. Open https://smasher-web.vercel.app
2. Enter your test email
3. Check email for verification code
4. Enter code

- [ ] Login successful
- [ ] Dashboard displays
- [ ] Can navigate to Discover

### 3. Test User Discovery

**On Web App**:
1. Go to Discover tab
2. Adjust distance slider
3. Should show "No users found" (if first user) or nearby users

- [ ] Discover page loads
- [ ] API call succeeds
- [ ] Distance filter works

### 4. Test Profile Management

**On Web App**:
1. Go to Profile tab
2. Click Edit
3. Change name/bio
4. Save

- [ ] Profile page loads
- [ ] Can edit profile
- [ ] Changes saved to database

### 5. Test Mobile App Connection

**On Mobile/Emulator**:
1. Start mobile app
2. Login with same email (if configured)
3. Navigate around

- [ ] Mobile app connects to API
- [ ] Shows same data as web
- [ ] No errors in console

### 6. Test Automatic Failover

**Stop Primary (Fly.io)**:
```bash
fly scale count 0
```

**On Web App**:
- [ ] Browser shows "Checking connection..."
- [ ] Within 60 seconds: "Connected to Railway"
- [ ] No data loss
- [ ] Can still use app

**On Mobile App**:
- [ ] App continues working
- [ ] Seamless transition
- [ ] No logout/re-auth needed

**Restart Primary**:
```bash
fly scale count 1
```

**Verify Failback**:
- [ ] Browser shows "Connected to Fly.io"
- [ ] Still no data loss

---

## Production Monitoring

### 1. Setup Server Monitoring

**UptimeRobot** (Free):
1. Go to https://uptimerobot.com
2. Create monitor for each endpoint:
   - [ ] https://smasher-api.fly.dev/health
   - [ ] https://smasher-production.up.railway.app/health
   - [ ] https://smasher.onrender.com/health (if deployed)
3. Set email alerts

### 2. Setup Error Tracking (Optional)

**Sentry for Frontend**:
1. Go to https://sentry.io
2. Create new project
3. Get DSN
4. Add to web app... (advanced)

### 3. Monitor Database

**Check Database Size**:
```bash
# Connect to PostgreSQL
psql postgresql://user:password@host:5432/smasher

# List tables
\dt

# Count users
SELECT COUNT(*) FROM "user";

# Check indexes
\d "user"
```

- [ ] Database has tables
- [ ] Can query data
- [ ] No connection errors

---

## Configure Mobile App (Optional)

If using different backend configuration:

**File**: `app-rn/src/config/api.ts`

```typescript
export const BACKEND_SERVICES = [
  {
    name: 'Fly.io Primary',
    apiUrl: 'https://smasher-api.fly.dev',
    // ... etc
  },
  // Make sure URLs match your deployments
]
```

- [ ] Primary URL matches Fly.io
- [ ] Secondary URL matches Railway
- [ ] Tertiary URL matches Render

**Rebuild and Deploy**:
```bash
cd app-rn
eas build --platform android --profile production
```

---

## Share with Users

### URLs to Distribute

- [ ] **Web App**: https://smasher-web.vercel.app
- [ ] **Download Mobile**: 
  - [ ] Google Play: [link to store]
  - [ ] Apple App Store: [link to store]
  - [ ] Or APK download link

### Documentation to Share

- [ ] Send `WEB_APP_SETUP.md` to tech users
- [ ] Create user guide for sign-up process
- [ ] Share support contact info

---

## Maintenance

### Weekly
- [ ] Check uptime monitoring (any downtime?)
- [ ] Monitor error tracking (any errors?)
- [ ] Review database size

### Monthly
- [ ] Update dependencies:
  ```bash
  npm update
  npm audit fix
  ```
- [ ] Check security advisories
- [ ] Review scaling needs
- [ ] Review costs

### As Needed
- [ ] Deploy updates:
  ```bash
  cd server
  fly deploy
  railway up
  ```
- [ ] Deploy web app:
  ```bash
  cd app-web
  vercel --prod
  ```
- [ ] Scale databases if hitting limits
- [ ] Add more servers if needed

---

## Rollback Plan

If something breaks:

### Rollback Web App
```bash
vercel rollback
```

### Rollback Backend
```bash
fly releases
fly releases rollback [VERSION]
```

### Rollback Railway
```bash
railway rollback
```

---

## Success! 🎉

- [x] All servers deployed and healthy
- [x] Automatic failover working
- [x] Web app accessible
- [x] Mobile app connected
- [x] Database synced
- [x] Monitoring in place

**Your production setup is complete and ready for users!**

---

## Quick Reference

### Deployment Commands

```bash
# Deploy all
.\deploy-all-servers.ps1
# Choose option 5

# Deploy specific
fly deploy                    # Fly.io
railway up                   # Railway
vercel --prod                # Web App

# Check health
.\deploy-all-servers.ps1
# Choose option 6
```

### Emergency Commands

```bash
# Stop all servers (emergency)
fly scale count 0
railway service list (then pause)

# View logs
fly logs --follow
railway logs

# Connect to database
psql postgresql://...
```

---

Last Updated: 2024
Version: 1.0.15