# Backend Repository Separation - Setup Guide

**Date**: 2025
**Purpose**: Separate backend (NestJS server) into its own GitHub repository
**New Backend Repo**: https://github.com/honkyhank82/smasher-backend

## Overview

Migrating the backend server from the monorepo to a separate repository to improve:
- Deployment flexibility with Render
- Independent scaling
- Cleaner separation of concerns
- Easier backend-only updates

---

## Phase 1: Push Backend to New Repo

```powershell
# 1. Navigate to current monorepo
Set-Location "d:\Dev\smasher"

# 2. Add new backend repo as remote
git remote add backend-repo https://github.com/honkyhank82/smasher-backend.git

# 3. Push server folder as root to new repo (using git subtree)
git subtree push --prefix=server backend-repo main
```

**What this does**: 
- Takes the `server/` folder from the monorepo
- Pushes it as the root of the new repository
- Preserves all git history
- Makes the new repo a standalone copy

---

## Phase 2: Clone & Set Up New Backend Repo Locally

```powershell
# 1. Clone the new backend repo
git clone https://github.com/honkyhank82/smasher-backend.git d:\Dev\smasher-backend

# 2. Navigate to it
Set-Location "d:\Dev\smasher-backend"

# 3. Install dependencies
npm install

# 4. Test locally (optional)
npm run start:dev

# 5. Verify it works
# Open http://localhost:3001/health
```

---

## Phase 3: Configure Render Deployment

### Option A: Using render.yaml (Recommended)

1. Copy the updated `render.yaml` to the new backend repo root
2. Go to https://render.com
3. Click **New → Blueprint**
4. Connect GitHub account if not already connected
5. Select repository: `honkyhank82/smasher-backend`
6. Render will auto-detect `render.yaml`
7. Click **Apply**

### Option B: Manual Setup

1. Go to https://render.com
2. Click **New → Web Service**
3. Connect GitHub and select `honkyhank82/smasher-backend`
4. Configure:
   - **Name**: `smasher-api-backend`
   - **Runtime**: Docker
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Health Check Path**: `/health`

### Environment Variables (Add These):

```
NODE_ENV = production
PORT = 3001
```

### Add Secrets:

```
jwt_secret = <your-jwt-secret>
resend_api_key = <your-resend-api-key>
r2_account_id = <your-r2-account-id>
r2_access_key_id = <your-r2-access-key>
r2_secret_access_key = <your-r2-secret-key>
```

### Other Env Vars:

```
FROM_EMAIL = noreply@smasher.app
R2_BUCKET_NAME = smasher-media
R2_PUBLIC_URL = https://r2.smasher.app
```

### Database:

Render will provision PostgreSQL automatically via render.yaml:
- **Database Name**: smasher
- **PostgreSQL Version**: 14
- **Plan**: Standard

---

## Phase 4: Update Frontend URLs

Once the backend is deployed on Render, update your frontend apps to use the new backend URL:

### For React Web App:
Edit `d:\Dev\smasher\app-web\src\config\api.ts`
```typescript
export const BACKEND_SERVICES = [
  {
    name: 'Primary Server',
    apiUrl: 'https://<render-backend-url>.onrender.com',
    priority: 1,
  },
]
```

### For React Native App:
Edit `d:\Dev\smasher\app-rn\src\config\api.ts`
```typescript
// Same format as web app
```

---

## Phase 5: Future Workflow

### Making Changes to Backend

**Option 1: Direct Changes in Separate Repo** (Recommended going forward)

```powershell
# Work directly in the separate backend repo
Set-Location "d:\Dev\smasher-backend"

# Make changes
# Commit and push
git add .
git commit -m "Backend changes - version 1.0.37"
git push origin main

# Render auto-deploys
```

**Option 2: Keep Syncing from Monorepo** (Temporary)

```powershell
# Make changes in monorepo server folder
Set-Location "d:\Dev\smasher"
# ... make changes to server/

# Push to backend repo using git subtree
git subtree push --prefix=server backend-repo main

# Render auto-deploys
```

**Choose Option 1 once everything is working** - it's cleaner and faster.

---

## Version Management

**Current Versions:**
- Backend: 1.0.36
- Web App: TBD
- Mobile App: TBD

**Before Each Rebuild:**
1. Update `server/package.json` version
2. Commit and push
3. Tag release: `git tag v1.0.36`

---

## Key Files in New Backend Repo

After `git subtree push`:
```
smasher-backend/
├── src/                    # Source code
├── test/                   # Tests
├── migrations/             # Database migrations
├── package.json            # v1.0.36+
├── Dockerfile              # Docker config
├── render.yaml             # Render deployment config
├── tsconfig.json           # TypeScript config
└── nest-cli.json           # NestJS config
```

---

## Troubleshooting

### "fatal: subtree push failed"
- Ensure remote URL is correct: `git remote -v`
- Ensure branch exists in remote: `git branch -r backend-repo/main`
- Try: `git push backend-repo $(git subtree split --prefix=server):main`

### Render build failing
1. Check build logs in Render dashboard
2. Verify `Dockerfile` is correct
3. Ensure all env variables are set
4. Try: `npm run build` locally first

### Backend endpoint not responding
1. Check Render service status
2. Check PostgreSQL is provisioned
3. Verify environment variables in Render dashboard
4. Check logs: Render → Service → Logs

### Database connection error
1. Verify `DATABASE_URL` is set in Render
2. Run migrations: `npm run migration:run`
3. Check PostgreSQL is ready (takes ~2 mins after creation)

---

## Important URLs

- **New Backend Repo**: https://github.com/honkyhank82/smasher-backend
- **Render Dashboard**: https://render.com/dashboard
- **Deployed Backend**: Will be shown after Render deployment completes
  - Example: `https://smasher-api-backend.onrender.com`

---

## Next Steps

1. ✅ Run Phase 1 commands to push to GitHub
2. ✅ Run Phase 2 commands to clone locally
3. ✅ Configure Render (Phase 3)
4. ✅ Update frontend URLs (Phase 4)
5. ✅ Test backend endpoints
6. ✅ Delete old backend deployment (from original Render/Railway)
7. ✅ Update frontend apps to use new backend URL

---

## Commands Quick Reference

```powershell
# Initial setup
git remote add backend-repo https://github.com/honkyhank82/smasher-backend.git
git subtree push --prefix=server backend-repo main

# Clone new repo
git clone https://github.com/honkyhank82/smasher-backend.git d:\Dev\smasher-backend

# Future syncs (if keeping monorepo in sync)
git subtree push --prefix=server backend-repo main

# Version updates
# Edit server/package.json version
git add server/package.json
git commit -m "Bump version to 1.0.37"
git subtree push --prefix=server backend-repo main
```

---

**Last Updated**: Current Session
**Status**: Ready for Phase 1 execution