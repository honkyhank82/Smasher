# Smasher Backend Deployment (Fly.io)

This document describes how to deploy and scale the Smasher backend (`server/`) on Fly.io. Everything runs remotely; your local machine is only used to push new versions.

---

## 1. Prerequisites

- Fly.io account and Fly CLI installed (`fly auth login`).
- App created on Fly.io named `smasher-api` (already configured via `server/fly.toml`).
- Postgres/Redis or other external services reachable from Fly (e.g. `DATABASE_URL` already set to `smasher-db.flycast`).

> **Version rule:** In every rebuild/deploy, bump `version` in `server/package.json` (e.g. `1.0.49` → `1.0.50`).

---

## 2. Environment secrets

Run from any folder (Windows PowerShell):

```powershell
fly secrets set `
  DATABASE_URL="postgresql://user:password@host:5432/smasher_api" `
  JWT_SECRET=B!rd!$th3w0rd `
  VERIFICATION_CODE_PEPPER=4c9e8c78c2c54a9f983f7b5b6a1e3d2c7f4b1234567890abcdef1234567890ab `
  RESEND_API_KEY=re_L45VjVkS_SrnNDbngzxdA4suSccrbCjFj`
  FROM_EMAIL=smashermain@gmail.com `
  R2_ACCOUNT_ID="<optional>" `
  R2_ACCESS_KEY_ID="<optional>" `
  R2_SECRET_ACCESS_KEY="<optional>" `
  R2_BUCKET_NAME="<optional>" `
  S3_ENDPOINT=https://d106b8f0544da6022da7de38fb440af4.r2.cloudflarestorage.com `
S3_REGION=auto `
S3_ACCESS_KEY_ID=4ff5856f77d90eb13b221dad23b6e608 `
S3_SECRET_ACCESS_KEY=3c854fb36c661ea38add80e2148496e0d2672ea529b2e46bac0b364d75ae40ce `
S3_BUCKET=smasher-media `
PUBLIC_MEDIA_BASE_URL=https://r2.smasher.app `
  -a smasher-api
```

Notes:
- Adjust values for your real infrastructure.
- Missing `JWT_SECRET` will cause the app to crash on startup.
- Email and R2-related vars are optional but recommended for full functionality.

---

## 3. Build and deploy

From the `server/` directory:

```powershell
cd d:\Dev\smasher\server

# Install deps (first time or after dependency changes)
npm install

# Bump version in package.json before rebuild (see rule above).

# Build and deploy using Fly
npm run deploy
# (equivalent to: npm run build && fly deploy)
```

The app image is built using `server/Dockerfile` and deployed according to `server/fly.toml`.

---

## 4. Scaling & load balancing

Fly.io acts as the HTTPS load balancer in front of the app:

- Public URL: `https://smasher-api.fly.dev`
- Internal port: `3001` (see `fly.toml` and `dist/main.js`).
- Health check: `GET /health/live`

To ensure redundancy and load balancing:

```powershell
# Scale to 2 or more machines
fly scale count 2 -a smasher-api

# (Optional) add extra regions for geo distribution
fly regions add ord sjc -a smasher-api
```

Fly will automatically:
- Start/monitor machines.
- Route traffic across healthy machines.
- Use `/health/live` to remove unhealthy machines from rotation.

---

## 5. Health checks & verification

After deploy and scaling:

```powershell
# Check overall app status
fly status -a smasher-api

# List machines and their health
fly machine list -a smasher-api

# Stream logs (useful after deploy)
fly logs -a smasher-api
```

Test health endpoint from PowerShell or any HTTP client:

```powershell
Invoke-WebRequest "https://smasher-api.fly.dev/health/live" -UseBasicParsing
```

A healthy app returns HTTP 200 with a JSON body like:

```json
{"status":"alive", ...}
```

If you see `502 Bad Gateway`, check `fly logs -a smasher-api` for startup errors (common cause: missing `JWT_SECRET`).

---

## 6. React Native client configuration

The mobile app (`app-rn`) should point to the Fly.io URL as its primary backend. Current config (in `app-rn/src/config/api.ts`) already does this:

- Primary: `https://smasher-api.fly.dev`
- Secondary: `https://smasher-api-backup.fly.dev`
- Tertiary: `https://smasher.onrender.com`

The app performs its own health-based failover between these services. With Fly.io now running multiple healthy machines, the primary URL is a fully remote, load-balanced entrypoint.

---

## 7. Quick checklist for each deploy

1. Bump `version` in `server/package.json`.
2. Ensure Fly secrets are set/updated (especially `JWT_SECRET`).
3. From `server/`:
   - `npm install` (if deps changed)
   - `npm run deploy`
4. Verify:
   - `fly status -a smasher-api`
   - `Invoke-WebRequest "https://smasher-api.fly.dev/health/live" -UseBasicParsing`
5. Confirm mobile app points to `https://smasher-api.fly.dev` as primary backend.
