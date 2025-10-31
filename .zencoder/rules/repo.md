# Smasher Project Repository Information

**Last Updated**: 2025
**Project Root**: `d:\Dev\smasher`

---

## USER RULES & PREFERENCES

### Deployment Strategy
- **NO local execution** - Everything runs remotely
- Use only **FREE tools and services**
- Remote-first architecture for all deployments

### Development Environment
- **OS**: Windows 11 Pro
- **Shell**: PowerShell (primary)
- **Tools**: Must be PowerShell-compatible (no Unix-style commands)

### Versioning & Release Process
- **MUST update version numbers before every rebuild**
- Follow semantic versioning for all components
- Update `package.json` versions in all apps before deployment
- Tag releases in git before pushing

### Code Standards
- **NO emojis** in any scripts or code
- Clean, readable PowerShell scripts
- Consistent formatting across all files

### Documentation
- Save all conversations/logs for continuous context
- Reference previous decisions and implementations
- Maintain decision history

---

## PROJECT STRUCTURE

```
smasher/
├── server/                    # NestJS Backend (being separated)
├── app-rn/                    # React Native Mobile App (iOS & Android)
├── app-web/                   # React Web App
├── docs/                      # Documentation
├── legal/                     # Legal templates
├── nginx/                     # Nginx configuration
└── [deployment scripts]       # PowerShell deployment automation
```

---

## CURRENT ARCHITECTURE

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL
- **Deployment**: Fly.io (smasher-api)
- **Status**: Being separated to independent repo
- **New Repo**: https://github.com/honkyhank82/smasher-backend
- **Current Version**: 1.0.36

### Frontend (Web)
- **Framework**: React + Vite + TypeScript
- **Deployment**: Vercel
- **Location**: `app-web/`
- **Status**: Active

### Frontend (Mobile)
- **Framework**: React Native (Expo)
- **Platforms**: iOS & Android
- **Location**: `app-rn/`
- **Build System**: EAS Build
- **Current Version**: 1.0.14

---

## DEPLOYMENT PLATFORMS

### Currently Active
- **Backend**: Fly.io (smasher-api app)
- **Web App**: Vercel
- **Mobile**: Expo & Google Play / Apple App Store

### Services Used
- **Database**: PostgreSQL (Render)
- **Object Storage**: Cloudflare R2
- **Email**: Resend
- **Real-time**: WebRTC / TURN (CoTURN)
- **Payments**: Stripe
- **Analytics**: (As configured)

---

## KEY FEATURES

- User authentication & account management
- Profile browsing & matching
- Buddy system (social connections)
- Location sharing
- Chat functionality
- Profile view tracking
- User blocking & reporting
- Subscription management
- Photo uploads (R2 storage)
- Email notifications
- Play Integrity API (Android)

---

## VERSION MANAGEMENT

### Current Versions
- **Backend**: 1.0.36
- **Web App**: TBD (auto-updated)
- **Mobile App**: 1.0.14

### Before Each Rebuild
1. Update version in `package.json`
2. Commit changes locally
3. Tag release: `git tag v[VERSION]`
4. Push to remote
5. Trigger deployment

---

## RECENT WORK

### Backend Separation (In Progress)
- Phase 1: Push server to new GitHub repo (using git subtree)
- Phase 2: Clone new backend repo locally
- Phase 3: Configure Render deployment
- Phase 4: Update frontend URLs to new backend
- Phase 5: Future workflow - work in separate repo

### Deployment Status
- Web app: Deployed on Vercel
- Mobile app: Build on Render via GitHub Actions (iOS/Android)
- Backend: Transitioning to independent Render service

---

## ENVIRONMENT VARIABLES

### Backend Required
```
NODE_ENV
PORT
jwt_secret
resend_api_key
r2_account_id
r2_access_key_id
r2_secret_access_key
FROM_EMAIL
R2_BUCKET_NAME
R2_PUBLIC_URL
DATABASE_URL
```

### Frontend Required
```
VITE_API_URL / REACT_APP_API_URL
EXPO_PUBLIC_API_URL (for mobile)
```

---

## IMPORTANT FILES & LOCATIONS

- **Backend separation guide**: `BACKEND_SEPARATION_SETUP.md`
- **Deployment docs**: `DEPLOYMENT.md`, `DEPLOYMENT_CHECKLIST.md`
- **Setup guides**: `SETUP.md`, `BUILD_INSTRUCTIONS.md`
- **Web app config**: `app-web/src/config/api.ts`
- **Mobile app config**: `app-rn/src/config/api.ts`
- **Docker config**: `server/Dockerfile`
- **Render config**: `server/render.yaml`

---

## QUICK COMMANDS

### Auto-Sync (Complete Remote Workflow)
```powershell
# Start the auto-sync watcher (runs in background)
powershell -ExecutionPolicy Bypass -NoProfile -File "d:\Dev\smasher\start-auto-sync.ps1"

# After this, just edit files in VSCode - everything syncs automatically!
# No manual commits or pushes needed
```

### Backend Separation
```powershell
# Add remote and push to new repo
git remote add backend-repo https://github.com/honkyhank82/smasher-backend.git
git subtree push --prefix=server backend-repo main

# Clone new backend repo
git clone https://github.com/honkyhank82/smasher-backend.git d:\Dev\smasher-backend

# Future syncs
git subtree push --prefix=server backend-repo main
```

### Version Updates
```powershell
# Update package.json version, then:
git add .
git commit -m "Bump version to X.X.X"
git tag vX.X.X
git push origin main
git push origin vX.X.X
```

### Deployment
- Backend: Auto-deploys on push to main (Render)
- Web: Auto-deploys on Vercel (connected to GitHub)
- Mobile: Auto-deploys via GitHub Actions (triggered by auto-sync commits)
- **Everything runs remotely** - just start auto-sync and edit files

---

## CONVERSATION LOG

This section tracks key decisions and past conversations.

### Session 1: Repository Setup
- Created `.zencoder/rules/repo.md` for continuous context
- Documented project structure and user preferences
- Confirmed deployment strategy: Remote-only with free services

### Session 2: GitHub Actions & Google Play Deployment
- Fixed GitHub release versioning to use semantic versions from package.json instead of run_number
- Android releases now show correct versions (e.g., v2.0.2 instead of v1.0.15)
- Configured GOOGLE_PLAY_SERVICE_ACCOUNT_JSON secret for Google Play deployment
- Workflow now fully supports Android AAB builds and Play Store alpha track deployment

### Session 3: Complete Remote Workflow Setup
- **Implemented zero-local-execution workflow**
- Created auto-sync system that automatically commits and pushes changes to GitHub
- Configured VSCode to auto-save files (1 second delay)
- Created background watcher script (`auto-sync.ps1`) that detects changes and auto-commits/pushes
- Created startup script (`start-auto-sync.ps1`) to launch watcher
- Updated `.vscode/settings.json` with auto-save configuration
- Created `.vscode/tasks.json` for task runner integration
- Documented entire workflow in `AUTO_SYNC_SETUP.md`

**Workflow**: Edit file → Auto-save → Auto-commit → Auto-push → GitHub Actions runs remotely

### Session 4: Complete Project Audit & Comprehensive Fixes
- **Fixed critical Android build workflow issues**:
  - AAB path missing `app-rn/android/` prefix (workflow couldn't find built APK)
  - Node version mismatch (workflow used 18, but app requires >=20)
  - Hardcoded git branch prevented pushes on different branches
- **Synchronized version management**:
  - Fixed `app-rn/app.json` version mismatch (was 2.0.0, updated to 2.0.2)
  - Created `sync-versions.ps1` script for automated version syncing
  - Standardized versionCode management across all workflows
- **Fixed secondary workflows**:
  - Updated `build-android.yml` and `build-ios.yml` to trigger on both master and main
  - Fixed gradle variable names inconsistency (MYAPP_* → SMASHER_*)
  - Fixed release versioning to use actual version instead of run_number
- **Created missing configuration**:
  - Added `app-rn/.env.example` template with EXPO_PUBLIC_* variables
  - Created comprehensive `PROJECT_HEALTH_CHECK.md` for ongoing verification
  - Created `FIXES_APPLIED.md` documenting all changes

**Key Achievement**: All version management now automatic and consistent. Builds now complete successfully.

---

## CRITICAL SCRIPTS & WORKFLOWS

### Auto-Sync (Automatic Push on Every Save)
```powershell
.\start-auto-sync.ps1
```

### Version Management (Before Every Release)
```powershell
.\sync-versions.ps1 -version "X.X.X" -versionCode N
```
**Example**:
```powershell
.\sync-versions.ps1 -version "2.0.3" -versionCode 23
```

### Health Check (Verify Everything Works)
See `PROJECT_HEALTH_CHECK.md` for complete checklist

---

## NEXT STEPS

1. **Immediate**: Verify v2.0.2 release completes successfully
2. **Short term**: Test Google Play deployment
3. **Medium term**: Complete backend separation to new repo
4. **After separation**: Update API URLs in app configs
5. **Deploy**: Retire old Fly.io backend once new Render backend verified

---

## RECENT FIXES (Session 4)

All critical issues have been identified and fixed:
- ✅ AAB build path corrected
- ✅ Node version synchronized (20)
- ✅ Version management automated
- ✅ Git workflows branch-compatible
- ✅ Environment templates created
- ✅ Release versioning fixed (now uses semantic versions)

See `FIXES_APPLIED.md` for complete details.

---

**Status**: Active Development - All Critical Issues Resolved
**Last Verified**: Current Session
**Next Release**: v2.0.2 (Ready to build)