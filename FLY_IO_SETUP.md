# Fly.io Deployment Setup - SMASHER v1.0.13

## ✅ Deployment Status

**Build**: ✅ Successful  
**Health Module**: ✅ Fixed and integrated  
**Secrets**: ⚠️ Needs configuration

---

## 🔧 Required Secrets

The server is currently crashing because required environment variables are not set. You need to configure these secrets:

### 1. Set Database URL

You need a PostgreSQL database. Choose one:

**Option A: Fly.io Postgres (Recommended)**
```bash
# Create Fly Postgres
fly postgres create --name smasher-db --region iad

# Attach to your app
fly postgres attach smasher-db --app smasher-api
```

**Option B: External Database (Supabase, Neon, etc.)**
```bash
fly secrets set DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### 2. Set Email Service (Resend)

```bash
fly secrets set RESEND_API_KEY="re_your_api_key_here"
fly secrets set FROM_EMAIL="noreply@yourdomain.com"
```

Get your API key from: https://resend.com/api-keys

### 3. Set Cloudflare R2 (Media Storage)

```bash
fly secrets set R2_ACCOUNT_ID="your-account-id"
fly secrets set R2_ACCESS_KEY_ID="your-access-key"
fly secrets set R2_SECRET_ACCESS_KEY="your-secret-key"
fly secrets set R2_BUCKET_NAME="smasher-media"
fly secrets set R2_PUBLIC_URL="https://your-r2-domain.com"
```

Setup guide: https://developers.cloudflare.com/r2/

### 4. Optional: Redis Cache

```bash
# Option A: Upstash Redis (Free tier)
fly secrets set REDIS_URL="redis://default:password@host:port"

# Option B: Skip Redis (app will work without it)
# No action needed
```

### 5. Optional: Stripe (Premium Features)

```bash
fly secrets set STRIPE_SECRET_KEY="sk_live_your_key"
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_your_secret"
```

---

## 🚀 Quick Start (Minimal Setup)

If you want to get the server running quickly for testing:

### Step 1: Create Fly Postgres

```bash
cd d:\Dev\smasher\server

# Create database
fly postgres create --name smasher-db --region iad --vm-size shared-cpu-1x --volume-size 1

# Attach to app (this automatically sets DATABASE_URL)
fly postgres attach smasher-db --app smasher-api
```

### Step 2: Set Minimal Secrets

```bash
# Email (use Resend free tier)
fly secrets set RESEND_API_KEY="re_get_from_resend_com"
fly secrets set FROM_EMAIL="noreply@yourdomain.com"

# Storage (use Cloudflare R2 free tier)
fly secrets set R2_ACCOUNT_ID="your-id"
fly secrets set R2_ACCESS_KEY_ID="your-key"
fly secrets set R2_SECRET_ACCESS_KEY="your-secret"
fly secrets set R2_BUCKET_NAME="smasher-media"
fly secrets set R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

### Step 3: Verify Deployment

```bash
# Check app status
fly status

# View logs
fly logs

# Test health endpoint
curl https://smasher-api.fly.dev/health
```

---

## 📊 Health Endpoints

Once deployed successfully, these endpoints will be available:

```bash
# Basic health check
curl https://smasher-api.fly.dev/health

# Detailed health (includes DB, memory, CPU)
curl https://smasher-api.fly.dev/health/detailed

# Readiness check
curl https://smasher-api.fly.dev/health/ready

# Liveness check
curl https://smasher-api.fly.dev/health/live
```

---

## 🔍 Troubleshooting

### Server Keeps Restarting

**Check logs:**
```bash
fly logs
```

**Common issues:**
- Missing DATABASE_URL → Attach Postgres database
- Missing JWT_SECRET → Already set ✅
- Missing RESEND_API_KEY → Set email secrets
- Missing R2 credentials → Set storage secrets

### Database Connection Errors

```bash
# Check database status
fly postgres db list --app smasher-db

# Connect to database
fly postgres connect --app smasher-db

# Inside psql:
\l                          # List databases
\c smasher                  # Connect to smasher database
CREATE EXTENSION postgis;   # Enable PostGIS
\dx                         # List extensions
```

### View All Secrets

```bash
fly secrets list
```

### Remove a Secret

```bash
fly secrets unset SECRET_NAME
```

---

## 📈 Scaling

Once everything is working:

```bash
# Scale to 2 instances for redundancy
fly scale count 2

# Upgrade VM size
fly scale vm shared-cpu-1x --memory 512

# Scale to multiple regions
fly regions add lax ord
```

---

## 💰 Cost Estimate

**Free Tier Limits:**
- 3 shared-cpu-1x VMs (256MB RAM each)
- 3GB persistent volume storage
- 160GB outbound data transfer

**Recommended Setup (Stays in Free Tier):**
- 1x API server (shared-cpu-1x, 256MB)
- 1x Postgres (shared-cpu-1x, 1GB volume)
- External services on free tiers:
  - Resend (3,000 emails/month free)
  - Cloudflare R2 (10GB storage free)
  - Upstash Redis (10,000 commands/day free)

**Total: $0/month** ✅

---

## 🎯 Next Steps

1. **Set up database** (see Step 1 above)
2. **Configure email service** (Resend.com)
3. **Configure storage** (Cloudflare R2)
4. **Test health endpoints**
5. **Update mobile app** with production API URL
6. **Deploy to additional regions** for redundancy

---

## 📞 Support

- **Fly.io Docs**: https://fly.io/docs/
- **Community**: https://community.fly.io/
- **Status**: https://status.fly.io/

---

**Current Status**: Build successful, awaiting secret configuration  
**Version**: 1.0.13  
**Last Updated**: October 26, 2025
