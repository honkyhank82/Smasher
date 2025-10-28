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
- **Backend**: Render (formerly Railway)
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
- Mobile: Manual EAS build or GitHub Actions

---

## CONVERSATION LOG

This section tracks key decisions and past conversations.

### Session 1: Repository Setup
- Created `.zencoder/rules/repo.md` for continuous context
- Documented project structure and user preferences
- Confirmed deployment strategy: Remote-only with free services

---

## NEXT STEPS

1. Complete backend separation (Phase 1-4 in BACKEND_SEPARATION_SETUP.md)
2. Test separated backend on Render
3. Update frontend apps to use new backend URL
4. Deploy and verify all endpoints work
5. Retire old backend deployment

---

**Status**: Active Development
**Last Verified**: Current Session