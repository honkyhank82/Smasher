# Multi-Server Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Users (Web & Mobile)                      │
└────────┬────────────────────────────────────────────┬────────┘
         │                                            │
    ┌────▼────────┐                          ┌───────▼──────┐
    │ Mobile App  │                          │   Web App    │
    │  (React RN) │                          │  (React TS)  │
    └────┬────────┘                          └───────┬──────┘
         │                                            │
         └────────────────┬──────────────────────────┘
                          │
                    ┌─────▼──────────────────────────────┐
                    │   Automatic Health Check & Failover │
                    │  (Every 60 seconds, instant on error)│
                    └─────┬──────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼────┐                 ┌───▼───────┐
    │  Fly.io  │                 │  Render   │
    │(Primary) │                 │(Secondary)│
    └─────┬────┘                 └───┬───────┘
          │                           │
          └───────────────┬───────────┘
                          │
                    ┌─────▼──────────────┐
                    │ Shared PostgreSQL  │
                    │  (Render/AWS RDS)  │
                    └────────────────────┘
```

## Server Setup

### 1. Fly.io (Primary Server)

Already configured. Current deployment:
- **URL**: https://smasher-api.fly.dev
- **Region**: iad (recommended for US East)
- **Database**: Shared PostgreSQL

Deploy updates:
```powershell
cd server
fly deploy
```

### 2. Render (Secondary Server)

Setup first time:
1. Go to https://dashboard.render.com
2. Create new Web Service
3. Connect your GitHub repository
4. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Environment**: Add all variables (same as Fly.io)
5. Deploy

**URL**: https://smasher.onrender.com

### 4. Shared PostgreSQL Database

**Option A: Render PostgreSQL (Recommended)**
```
1. Create new service on Render
2. Add Managed PostgreSQL
3. Copy DATABASE_URL
4. Use same URL for both servers
```

**Option B: AWS RDS**
```
1. Create RDS instance (PostgreSQL 14+)
2. Enable public accessibility
3. Security Group: Allow ports 5432 from anywhere
4. Create endpoint URL
```

Format:
```
postgresql://username:password@host:5432/smasher
```

## Automatic Failover

### How It Works

1. **Health Check**: Every 60 seconds, clients check all servers
2. **Priority Order**:
   - Fly.io (Primary)
   - Render (Secondary)
3. **On Server Down**:
   - Automatic connection to next available server
   - No user action needed
   - Session persisted via shared database

### Health Check Endpoints

```bash
# Check server health
curl https://smasher-api.fly.dev/health
curl https://smasher.onrender.com/health

# Detailed health check
curl https://smasher-api.fly.dev/health/detailed
```

## Web App Deployment

The web app is hosted on **Vercel** with automatic failover:

### Deploy Web App

```powershell
cd app-web
npm install
npm run build
vercel --prod
```

### Features

- **Auto-failover**: Automatically switches between backend servers
- **Health monitoring**: Shows which server is active
- **Same features**: As mobile app (Discover, Chat, Profile, etc.)

**URL**: https://smasher-web.vercel.app

## Environment Variables

### Create .env file: `server/.env`

```env
# Database (SHARED across all servers)
DATABASE_URL=postgresql://user:password@host:5432/smasher

# Authentication
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@smasher.app

# Cloudflare R2 (same for all)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=smasher-media
R2_PUBLIC_URL=https://r2.smasher.app

# App
PORT=3001
NODE_ENV=production
```

### Set Secrets on Each Platform

**Fly.io**:
```bash
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set JWT_SECRET="your-secret"
# ... repeat for others
```

**Render**:
1. Go to Service → Environment
2. Add each variable manually
3. Click Deploy

## Deployment Script

Run the interactive deployment:

```powershell
.\deploy-all-servers.ps1
```

Menu options:
- 1: Deploy to Fly.io
- 2: Deploy to Render
- 3: Deploy Web App
- 4: Deploy ALL (builds once, deploys to all)
- 5: Check server health
- 6: Setup shared database
- 7: Configure environment variables

## Monitoring & Debugging

### Check Health Status

```bash
# In browser
https://smasher-api.fly.dev/health/detailed
https://smasher.onrender.com/health/detailed
```

### View Logs

**Fly.io**:
```bash
fly logs
fly logs --follow
```

**Render**:
1. Go to https://dashboard.render.com
2. Select service
3. View Logs tab

### Database Connectivity

```sql
-- Connect to shared database
psql postgresql://user:password@host:5432/smasher

-- Check if migrations ran
\dt  -- List tables

-- Verify user table
SELECT COUNT(*) FROM "user";
```

## Failover Testing

### Test Automatic Failover

1. **Stop primary (Fly.io)**:
   ```bash
   fly scale count 0
   ```

2. **Check client behavior**:
   - Web app should show "Connecting to Render"
   - Mobile app will auto-switch
   - No errors to user

3. **Restart primary**:
   ```bash
   fly scale count 1
   ```

### Test Manual Failover

Edit `app-rn/src/config/api.ts` to change priority order:
```typescript
export const BACKEND_SERVICES = [
  // ... adjust priority numbers
  { priority: 1, name: 'Render', ... },    // Temporarily primary
  { priority: 2, name: 'Fly.io', ... },
]
```

## Costs

### Monthly Estimates (US-based)

| Service | Price | Notes |
|---------|-------|-------|
| Fly.io API | $5-30/mo | Shared VM, auto-scales |
| Render API | $7/mo | Shared tier |
| Vercel Web | Free-20/mo | Serverless hosting |
| **Total** | **~$50-150/mo** | Scales with usage |

### Cost Optimization

1. Use a managed PostgreSQL (e.g., Render) shared across all
2. Use Fly.io + Render
3. Monitor usage on dashboard
4. Set scaling limits to prevent surprise bills

## Troubleshooting

### Server won't start

1. Check DATABASE_URL is accessible
2. Verify JWT_SECRET is set
3. Check Resend API key
4. Review logs: `fly logs`

### Database connection errors

1. Verify DATABASE_URL format
2. Check security groups allow port 5432
3. Test with psql tool
4. Confirm migrations ran: `npm run migration:run`

### Failover not working

1. Check health endpoints responding
2. Verify BACKEND_SERVICES in config/api.ts
3. Check browser console for errors
4. Verify all servers have same database

## Next Steps

1. **Setup shared PostgreSQL**
2. **Deploy to Fly.io**
3. **Deploy to Render** (for redundancy)
4. **Deploy web app to Vercel**
5. **Test failover** by stopping each server
6. **Monitor health** dashboards

All done! 🎉 Your app now has automatic multi-server failover with zero downtime. Users won't even know if a server goes down.