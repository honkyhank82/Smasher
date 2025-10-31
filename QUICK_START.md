# Quick Start Reference

## For Every Release

### 1. Update Version
```powershell
.\sync-versions.ps1 -version "2.0.3" -versionCode 23
```
Changes:
- `app-rn/package.json` → version
- `app-rn/app.json` → version + versionCode

### 2. Review & Push
```powershell
git add .
git commit -m "bump: version to 2.0.3"
git push
```

### 3. Watch It Build
- GitHub Actions automatically triggers
- Wait ~15-20 minutes for build
- Check Actions tab for status
- Release will appear when complete

---

## Daily Development

### Start Auto-Sync (Run Once Per Session)
```powershell
.\start-auto-sync.ps1
```
Now just edit files in VSCode - everything syncs automatically!

---

## If Something Goes Wrong

### Build Failed?
1. Check GitHub Actions logs (click the red X)
2. Look at `gradle-build.log` artifact
3. Common issues:
   - Keystore secret missing
   - Google Play credentials expired
   - Version code didn't increment

### Release Not Created?
1. AAB not built? Check `gradle-build.log` 
2. Version not extracted? Check workflow step "Extract version"
3. Permission issues? Check GitHub token

### Version Mismatch?
1. Run: `.\sync-versions.ps1 -version "X.X.X" -versionCode N`
2. Verify both files changed: `git status`
3. Push changes

---

## File Locations

| What | Where |
|------|-------|
| Mobile version | `app-rn/package.json` (line 3) |
| Mobile Expo config | `app-rn/app.json` (line 5 & 20) |
| Backend version | `server/package.json` (independent) |
| Web version | `app-web/package.json` (auto-deployed) |
| Build logs | GitHub Actions artifacts |
| API config | `app-rn/src/config/api.ts` |
| Environment vars | `.env.example` files |

---

## Key Numbers

| Item | Current | Next Release |
|------|---------|--------------|
| Mobile Version | 2.0.2 | 2.0.3 |
| Version Code | 22 | 23 |
| Backend Version | 1.0.36 | (independent) |
| Web Version | 1.0.16 | (auto) |

---

## Critical Checklist Before Release

- [ ] Run `.\sync-versions.ps1` with new version
- [ ] Verify `package.json` and `app.json` both updated
- [ ] Git push complete
- [ ] GitHub Actions workflow running
- [ ] AAB successfully built (check artifacts)
- [ ] Release created with correct version tag
- [ ] AAB attached to release
- [ ] Google Play deployment started (check Fastlane logs)

---

## Useful Commands

```powershell
# Check current versions
Get-Content app-rn/package.json | Select-String '"version"'
Get-Content app-rn/app.json | Select-String '"version"' | head -1

# Force push (DANGER - only if necessary)
git push --force-with-lease origin master

# Check git status
git status

# View recent commits
git log --oneline -5

# See what's staged
git diff --staged
```

---

## Need Help?

1. Read: `PROJECT_HEALTH_CHECK.md` - Complete verification guide
2. Review: `FIXES_APPLIED.md` - What was fixed and why
3. Check: `repo.md` - Full project documentation
4. GitHub Actions logs - Most detailed error info

---

## One-Minute Workflow

1. Make code changes in VSCode
2. Auto-sync detects and pushes
3. GitHub Actions triggers
4. In 15-20 min, new release appears
5. You're done! Nothing else to do.

That's it! Everything runs remotely.

---

**Last Updated**: Current Session
**Status**: All Systems Ready