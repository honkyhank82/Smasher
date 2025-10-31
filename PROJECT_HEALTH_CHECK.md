# Smasher Project Health Check

Complete checklist for ensuring all systems are working correctly.

## Version Management

### Quick Sync Command
```powershell
.\sync-versions.ps1 -version "X.X.X" -versionCode N
```

### Manual Verification
- [ ] `app-rn/package.json` version matches `app-rn/app.json` version
- [ ] `app-rn/app.json` versionCode is incremented
- [ ] `server/package.json` version is appropriate (backend is separate)

### Files that Control Versions
| File | Purpose | Must Match |
|------|---------|-----------|
| `app-rn/package.json` | NPM dependencies & version | `app-rn/app.json` |
| `app-rn/app.json` | Expo config & Android versionCode | `app-rn/package.json` |
| `server/package.json` | Backend NestJS version | Independent (separate repo) |
| `app-web/package.json` | Web app version | Independent (auto-deployed) |

## Build & Deployment Pipeline

### GitHub Actions Workflows
- [ ] `.github/workflows/android-build-and-deploy.yml` 
  - Node version: `20` (matches `app-rn` requirement >=20)
  - AAB path: `app-rn/android/app/build/outputs/bundle/release/app-release.aab` ✓
  - Git push: Uses `${{ github.ref_name }}` (dynamic branch) ✓
  
### Android Build Process
1. [ ] Keystore secret exists: `KEYSTORE_BASE64`
2. [ ] Google Play credentials exist: `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
3. [ ] Gradle signing variables configured:
   - `SMASHER_UPLOAD_STORE_PASSWORD`
   - `SMASHER_UPLOAD_KEY_ALIAS`
   - `SMASHER_UPLOAD_KEY_PASSWORD`
4. [ ] Build outputs:
   - AAB generated at: `app-rn/android/app/build/outputs/bundle/release/app-release.aab`
   - Gradle build log: `app-rn/android/gradle-build.log`

## Backend Configuration

### API URLs (from `app-rn/src/config/api.ts`)
- Primary: `https://smasher-api.fly.dev` (Fly.io)
- Secondary: `https://smasher-api-backup.fly.dev` (Fly.io)
- Fallback: `https://smasher.onrender.com` (Render)

**Note**: Backend is being migrated to separate repo. Update URLs as follows:
```typescript
// After backend is fully separated:
export const BACKEND_SERVICES = [
  {
    name: 'Render Primary',
    apiUrl: 'https://smasher-api.onrender.com', // NEW endpoint
    wsUrl: 'wss://smasher-api.onrender.com',
    priority: 1,
    healthCheck: '/health'
  }
];
```

### Environment Variables

#### Backend (server/)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
RESEND_API_KEY=...
R2_*=...
STRIPE_*=...
```

#### Mobile (app-rn/)
- Create `.env` from `.env.example`
- `EXPO_PUBLIC_API_URL=https://smasher-api.fly.dev`

#### Web (app-web/)
- `VITE_API_URL=https://smasher-api.fly.dev`

## Feature Flags

All apps have consistent feature flags in `src/config/api.ts`:

```javascript
PREMIUM_ENABLED: true
VIDEO_UPLOAD_ENABLED: true
CHAT_ENABLED: true
LOCATION_ENABLED: true
PUSH_NOTIFICATIONS_ENABLED: false // Not implemented yet
```

## Dependency Health

### Node Versions
| Component | Required | Current |
|-----------|----------|---------|
| Backend | 18.x | Check `server/package.json` |
| Mobile | >=20 | ✓ Updated in workflow |
| Web | Any | ✓ Flexible |

### Critical Dependencies
- [ ] React: Same major version across web and mobile (19.1.0) ✓
- [ ] TypeScript: >=5.3 across all projects ✓
- [ ] NestJS: 11.x in backend ✓
- [ ] Expo: 54.x in mobile ✓

## Auto-Sync Configuration

### Running Auto-Sync
```powershell
powershell -ExecutionPolicy Bypass -NoProfile -File "d:\Dev\smasher\start-auto-sync.ps1"
```

This will:
- Monitor file changes every 2 seconds
- Auto-commit to git
- Auto-push to GitHub
- Trigger GitHub Actions automatically

### What Auto-Sync Does NOT Do
- ❌ Does NOT run builds locally
- ❌ Does NOT deploy services
- ❌ Does NOT validate code

All deployments happen on GitHub Actions runners.

## Pre-Release Checklist

Before creating a release:

1. [ ] All versions synced: `.\sync-versions.ps1 -version "X.X.X" -versionCode N`
2. [ ] Code changes committed and pushed
3. [ ] Wait for auto-sync to push changes
4. [ ] GitHub Actions workflow completes successfully
5. [ ] New release appears in GitHub Releases
6. [ ] AAB is attached to release
7. [ ] Google Play deployment was successful (check Fastlane output)

## Troubleshooting

### Release Not Created
**Symptoms**: Workflow shows green ✓ but no new release
**Check**:
1. Is the AAB actually built? Look at `gradle-build.log` artifact
2. Is version extracted correctly? Check workflow logs
3. Are versions in sync? Run: `.\sync-versions.ps1 -version "X.X.X" -versionCode N`

### AAB Build Fails
**Check**:
1. Node version correct (20.x)
2. Keystore secret present
3. Gradle has required env vars
4. Check `gradle-build.log` artifact

### Google Play Deployment Fails
**Check**:
1. `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret exists
2. Service account JSON is valid base64
3. Google Play app exists
4. Check Fastlane logs in workflow output

### Version Code Mismatch
**Problem**: Google Play rejects AAB because versionCode is too low
**Solution**: Always increment `versionCode` in `app.json` before build

### Auto-Sync Not Working
**Check**:
1. Is the watcher running? (check PowerShell window)
2. File changes being made? (VSCode should auto-save)
3. Git configured? (check: `git config user.name`)

## Health Indicators

### Everything Working When:
- ✅ Local file changes auto-commit within 5 seconds
- ✅ GitHub Actions workflows trigger automatically
- ✅ Android builds complete in <20 minutes
- ✅ New releases appear within an hour of code push
- ✅ AAB uploads to Google Play successfully
- ✅ No red errors in GitHub Actions (only warnings ok)

### Red Flags:
- 🚩 Versions not in sync
- 🚩 Node version mismatch (workflow vs requirement)
- 🚩 AAB not found after build
- 🚩 Git push fails in workflow
- 🚩 Secrets missing in GitHub

---

**Last Updated**: Current Session
**Status**: All systems checked and fixed