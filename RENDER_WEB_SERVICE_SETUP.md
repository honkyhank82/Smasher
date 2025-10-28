# Render Web Service Setup (Smasher Backend)

This guide walks you through deploying the Smasher backend (NestJS) to Render as the backup server, alongside Fly.io as primary. It uses the existing `server` directory and supports both Blueprint (render.yaml) and Manual setup.

## Prerequisites
- GitHub repository connected to this project
- The backend lives at `server/`
- Required secrets and credentials available
  - `DATABASE_URL` (Render Managed PostgreSQL recommended)
  - `JWT_SECRET`
  - `RESEND_API_KEY`
  - `FROM_EMAIL`
  - Cloudflare R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

## Option A: Blueprint (render.yaml) — Recommended
1. Ensure `server/render.yaml` is present and up to date in your repo
2. Go to https://render.com
3. Click New → Blueprint
4. Connect your GitHub repository
5. Select the repo containing the `server/` folder
6. Render auto-detects `render.yaml` and proposes services
7. Click Apply to create the services (Web Service + Managed PostgreSQL if defined)
8. Wait for provisioning to complete

Once created, verify:
- Web Service uses `Root Directory: server`
- Health Check path is `/health`
- Environment variables are present (see list below)

## Option B: Manual Web Service Setup
1. Go to https://render.com
2. Click New → Web Service
3. Connect GitHub and select the repo
4. Set the following:
   - Name: `smasher-backup`
   - Runtime: Node
   - Root Directory: `server`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm run start:prod`
   - Health Check Path: `/health`
5. Click Create Web Service

## Managed PostgreSQL on Render
1. In Render dashboard, New → PostgreSQL
2. Name: `smasher-db`
3. Plan: Standard (or Starter for testing)
4. Create database and wait until ready
5. Go to database → Connections → copy `Internal Database URL`
6. Add `DATABASE_URL` to your Web Service environment variables

Run database migrations after first deploy:
```bash
# In Render shell or locally (with production DATABASE_URL)
cd server
npm run typeorm migration:run
```

## Required Environment Variables
Add the following to your Render Web Service (Settings → Environment):
```
NODE_ENV=production
PORT=3001

DATABASE_URL=postgresql://...  # from Render PostgreSQL
JWT_SECRET=your-32-char-secret
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@smasher.app

R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=smasher-media
R2_PUBLIC_URL=https://r2.smasher.app
```

## Health Checks & Logs
- Health endpoint: `GET /health`
- Detailed health: `GET /health/detailed`
- Logs: Render → your Web Service → Logs

## Scaling & Resources
- Instance Type: Start with Starter; upgrade as needed
- Autoscaling: Enable based on traffic
- Scale up CPU/RAM if build or runtime needs increase

## Deploys & CI/CD
- Auto-deploys on `main` pushes (default)
- Manual deploy: Render → Web Service → Deploy
- PR previews: enable if desired

## Integration with Fly.io (Primary)
- Primary URL: `https://smasher-api.fly.dev`
- Backup URL (Render): shown on the Web Service page (e.g., `https://smasher.onrender.com`)
- Clients perform health checks and automatically fail over to Render if Fly.io is down

## Verification Checklist
- Web Service created and healthy
- `/health` returns 200
- Environment variables set
- Database connected and migrations run
- Media uploads to Cloudflare R2 succeed

## Troubleshooting
- Build failures: check build logs and ensure `Root Directory: server`
- 500 errors: verify env vars and database URL; run migrations
- Health check failing: confirm `PORT=3001` and `Start Command` correctness
- Database connection errors: ensure database is provisioned and URL is correct

## Useful Links
- Render Dashboard: https://render.com/dashboard
- Render Docs: https://render.com/docs
- Fly.io Docs: https://fly.io/docs