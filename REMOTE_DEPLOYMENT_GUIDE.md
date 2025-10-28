# 🚀 Remote Deployment Guide - SMASHER v1.0.13

**Complete guide for deploying SMASHER as a fully remote, production-ready application with failsafes and automatic recovery.**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment Options](#cloud-deployment-options)
- [GitHub Actions Build System](#github-actions-build-system)
- [Failover & High Availability](#failover--high-availability)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This deployment setup ensures:
- ✅ **100% Remote** - No local dependencies required
- ✅ **High Availability** - Primary + backup server instances
- ✅ **Auto-Recovery** - Automatic health monitoring and failover
- ✅ **Free Build Fallback** - GitHub Actions as EAS alternative
- ✅ **Load Balancing** - Nginx with health checks
- ✅ **Zero Downtime** - Rolling updates and instant recovery

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (Expo)                       │
│              Automatic Backend Failover                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Load Balancer                      │
│              Health Checks + Rate Limiting                  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  API Primary     │  │  API Backup      │
        │  (Port 3001)     │  │  (Port 3002)     │
        └──────────────────┘  └──────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
        ┌──────────────────────────────────────┐
        │  PostgreSQL + PostGIS  │  Redis Cache │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │      Auto-Heal Monitor Service       │
        │    (Restarts unhealthy containers)   │
        └──────────────────────────────────────┘
```

---

## 📦 Prerequisites

### Required Services

1. **Cloud Provider** (choose one or more for redundancy):
   - Fly.io (Primary - recommended)
   - Render.com (Backup)
   - Vercel (Backup)

2. **External Services**:
   - PostgreSQL Database (Supabase, Neon, or self-hosted)
   - Redis Cache (Upstash, Redis Cloud, or self-hosted)
   - Cloudflare R2 (Media storage)
   - Resend.com (Email service)

3. **Build Services**:
   - Expo EAS (Primary)
   - GitHub Actions (Free fallback)

### Required Secrets

Create these secrets in your deployment platform:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/smasher
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Email
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com

# Storage
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=smasher-media
R2_PUBLIC_URL=https://your-r2-domain.com
```

---

## 🐳 Docker Deployment

### Option 1: Docker Compose (Self-Hosted)

**Best for**: VPS, dedicated servers, or local testing

1. **Clone and configure**:
```bash
cd d:\Dev\smasher
cp .env.example .env
# Edit .env with your credentials
```

2. **Start all services**:
```bash
docker-compose up -d
```

3. **Check health**:
```bash
# Check all containers
docker-compose ps

# View logs
docker-compose logs -f

# Check API health
curl http://localhost/health
```

4. **Scale services**:
```bash
# Add more API instances
docker-compose up -d --scale api-primary=2 --scale api-backup=2
```

### Option 2: Individual Container Deployment

Deploy to any cloud provider supporting Docker:

```bash
# Build and push
docker build -t smasher-api:1.0.13 ./server
docker tag smasher-api:1.0.13 your-registry/smasher-api:1.0.13
docker push your-registry/smasher-api:1.0.13

# Deploy
docker run -d \
  --name smasher-api \
  -p 3001:3001 \
  -e DATABASE_URL=$DATABASE_URL \
  -e REDIS_URL=$REDIS_URL \
  -e JWT_SECRET=$JWT_SECRET \
  your-registry/smasher-api:1.0.13
```

---

## ☁️ Cloud Deployment Options

### Primary: Fly.io

**Advantages**: Global edge network, auto-scaling, built-in health checks

```bash
cd server

# Login
fly auth login

# Deploy (first time)
fly launch

# Deploy updates
fly deploy

# Set secrets
fly secrets set JWT_SECRET=your-secret
fly secrets set DATABASE_URL=your-db-url
fly secrets set RESEND_API_KEY=your-key
fly secrets set R2_ACCOUNT_ID=your-id
fly secrets set R2_ACCESS_KEY_ID=your-key
fly secrets set R2_SECRET_ACCESS_KEY=your-secret
fly secrets set R2_BUCKET_NAME=smasher-media
fly secrets set R2_PUBLIC_URL=https://your-domain.com

# Scale
fly scale count 2  # Run 2 instances
fly scale vm shared-cpu-1x --memory 512  # Upgrade resources

# Monitor
fly status
fly logs
```

### Backup: Render.com

**Advantages**: Free tier, automatic deploys, managed database

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd server && npm install && npm run build`
4. Set start command: `cd server && npm run start:prod`
5. Add environment variables
6. Deploy

<!-- Railway removed: we now standardize on Fly.io + Render only -->

### Backup: Vercel

**Advantages**: Free tier, global CDN, instant deployments

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd server
vercel

# Set secrets
vercel env add JWT_SECRET
vercel env add DATABASE_URL
```

---

## 🔨 GitHub Actions Build System

**Free alternative to Expo EAS** - Unlimited builds on GitHub Actions

### Setup

1. **Add secrets to GitHub**:
   - Go to Settings → Secrets and variables → Actions
   - Add these secrets:
     - `ANDROID_KEYSTORE_BASE64` - Your keystore encoded in base64
     - `ANDROID_KEY_ALIAS` - Keystore alias
     - `ANDROID_STORE_PASSWORD` - Keystore password
     - `ANDROID_KEY_PASSWORD` - Key password
     - `GOOGLE_SERVICES_JSON` - Firebase config
     - `IOS_DIST_CERT_BASE64` - iOS distribution certificate
     - `IOS_DIST_CERT_PASSWORD` - Certificate password
     - `IOS_PROVISIONING_PROFILE_BASE64` - Provisioning profile

2. **Trigger builds**:

**Manual trigger**:
- Go to Actions → Build Android APK/AAB
- Click "Run workflow"
- Select build type (apk/aab) and environment

**Automatic trigger**:
- Push to `main` branch
- Builds trigger automatically

3. **Download builds**:
- Go to Actions → Select workflow run
- Download artifacts from the bottom of the page

### Build Commands

```bash
# Encode keystore for GitHub
base64 -w 0 release.keystore > keystore.base64

# Encode iOS certificate
base64 -w 0 distribution.p12 > cert.base64

# Encode provisioning profile
base64 -w 0 profile.mobileprovision > profile.base64
```

---

## 🔄 Failover & High Availability

### Backend Failover

The app automatically switches between backend services:

1. **Priority Order**:
   - Fly.io (Primary)
   - Render (Backup)
   - Vercel (Backup 2)

2. **Health Checks**:
   - Runs every 60 seconds
   - 5-second timeout
   - Automatic failover on failure

3. **Manual Failover**:
```typescript
// In app code
import { getHealthyService, updateServiceUrls } from './config/api';

const service = await getHealthyService();
updateServiceUrls(service);
```

### Database Redundancy

**Option 1: Supabase** (Recommended)
- Built-in replication
- Automatic backups
- Point-in-time recovery

**Option 2: Neon**
- Serverless Postgres
- Auto-scaling
- Branch databases

**Option 3: Self-hosted with Replication**
```bash
# Primary-replica setup
docker-compose -f docker-compose.yml -f docker-compose.replica.yml up -d
```

---

## 📊 Monitoring & Health Checks

### Health Endpoints

```bash
# Basic health check
curl https://your-api.com/health

# Detailed health (includes DB, memory, CPU)
curl https://your-api.com/health/detailed

# Readiness check (is service ready for traffic?)
curl https://your-api.com/health/ready

# Liveness check (is service alive?)
curl https://your-api.com/health/live
```

### Auto-Heal Service

The Docker Compose includes an auto-heal container that:
- Monitors all container health checks
- Automatically restarts unhealthy containers
- Checks every 30 seconds
- Logs all recovery actions

### Monitoring Tools

**Recommended**:
- **Uptime monitoring**: UptimeRobot (free)
- **Error tracking**: Sentry (free tier)
- **Logs**: Better Stack (free tier)
- **Metrics**: Grafana Cloud (free tier)

**Setup UptimeRobot**:
1. Create account at uptimerobot.com
2. Add monitor for `https://your-api.com/health`
3. Set check interval to 5 minutes
4. Add alert contacts (email, SMS, Slack)

---

## 🔧 Troubleshooting

### All Services Down

If all backend services fail health checks:

1. **Check service status**:
```bash
# Fly.io
fly status

# Render
# Check dashboard
```

2. **Check logs**:
```bash
fly logs
```

3. **Manual restart**:
```bash
fly apps restart smasher-api
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check PostGIS extension
psql $DATABASE_URL -c "SELECT PostGIS_version()"
```

### Build Failures

**EAS Build fails**:
- Use GitHub Actions fallback
- Check build logs: `eas build:list`

**GitHub Actions fails**:
- Check secrets are set correctly
- Verify keystore is valid
- Check workflow logs

### App Can't Connect

1. Check backend health: `curl https://your-api.com/health`
2. Check DNS: `nslookup your-api.com`
3. Check SSL: `curl -v https://your-api.com`
4. Force app to use backup: Update `BACKEND_SERVICES` priority

---

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables set
- [ ] SSL certificates configured
- [ ] Database backups enabled
- [ ] Health monitoring configured
- [ ] Error tracking enabled
- [ ] Rate limiting tested
- [ ] Load testing completed
- [ ] Failover tested
- [ ] Backup services deployed
- [ ] Documentation updated

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: Check health endpoints first
- **Logs**: Use `docker-compose logs` or cloud provider logs
- **Emergency**: Failover to backup service manually

---

**Version**: 1.0.13  
**Last Updated**: October 2025  
**Deployment Type**: Fully Remote with Failsafes
