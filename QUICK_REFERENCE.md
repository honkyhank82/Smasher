# Quick Reference Guide

## Daily Development Commands

### Start Development Environment
```powershell
# From project root
./start-all.ps1
```

This automatically:
- Detects your IP
- Updates mobile app config
- Starts backend server
- Starts Metro bundler
- Builds and deploys to Android

### Manual Start (if script fails)
```powershell
# Terminal 1: Backend
cd server
npm run start:dev

# Terminal 2: Metro
cd app-rn
npm start

# Terminal 3: Deploy to device
cd app-rn
npx react-native run-android
```

### Update IP Address
```powershell
cd app-rn
./update-ip.ps1
# Then reload app (press 'r' in Metro)
```

### Reload App
- Press `r` in Metro bundler terminal
- OR shake device → Reload
- OR `adb shell input keyevent 82` → Reload

### Clear Cache
```powershell
cd app-rn
npx react-native start --reset-cache
```

### Clean Build
```powershell
cd app-rn/android
./gradlew clean
cd ../..
npx react-native run-android
```

---

## Database Commands

### Access Database
```powershell
cd server
npm run typeorm -- -d src/config/typeorm.config.ts
```

### Create Migration
```powershell
cd server
npm run typeorm migration:create src/migrations/YourMigrationName
```

### Run Migrations
```powershell
cd server
npm run typeorm migration:run
```

### Revert Migration
```powershell
cd server
npm run typeorm migration:revert
```

### Reset Database (DANGER!)
```powershell
# Drop all tables
psql -U postgres -d smasher -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Run migrations
cd server
npm run typeorm migration:run
```

---

## Debugging

### View Server Logs
Already visible in the terminal where you ran `npm run start:dev`

### View Metro Logs
Already visible in the terminal where you ran `npm start`

### View Android Logs
```powershell
adb logcat | findstr "ReactNative"
```

### View All Android Logs
```powershell
adb logcat
```

### Check Connected Devices
```powershell
adb devices
```

### Restart ADB
```powershell
adb kill-server
adb start-server
```

---

## Testing

### Test API Endpoint
```powershell
# Test server is running
curl http://localhost:3001

# Test registration
curl -X POST http://localhost:3001/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","birthdate":"1990-01-01"}'
```

### Check Server Port
```powershell
netstat -ano | findstr :3001
```

### Kill Process on Port
```powershell
# Find PID
netstat -ano | findstr :3001

# Kill it
Stop-Process -Id <PID> -Force
```

---

## Common Issues & Fixes

### "Network Error" in App
1. Check server is running: `netstat -ano | findstr :3001`
2. Check IP in `app-rn/src/config/api.ts` matches your computer's IP
3. Run `./update-ip.ps1` to auto-fix
4. Reload app

### "Metro bundler not running"
1. Start Metro: `cd app-rn && npm start`
2. Wait for "Metro is ready"
3. Then deploy: `npx react-native run-android`

### "Build failed"
1. Clean: `cd app-rn/android && ./gradlew clean`
2. Clear cache: `npx react-native start --reset-cache`
3. Reinstall: `rm -rf node_modules && npm install`
4. Rebuild: `npx react-native run-android`

### "Database connection failed"
1. Check PostgreSQL is running
2. Verify DATABASE_URL in `server/.env`
3. Test connection: `psql -U postgres -d smasher`

### "Port already in use"
```powershell
# Kill all node processes
Get-Process -Name node | Stop-Process -Force

# Or kill specific port
netstat -ano | findstr :3001
Stop-Process -Id <PID> -Force
```

### App crashes on startup
1. Check Android logs: `adb logcat`
2. Uninstall and reinstall: `npx react-native run-android`
3. Check for JavaScript errors in Metro logs

---

## Environment Variables

### Server (.env)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/smasher
JWT_SECRET=your-secret-key
RESEND_API_KEY=re_xxx
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=smasher-media
```

### Mobile (hardcoded in api.ts)
```typescript
// Development
'http://192.168.68.61:3001'

// Production
'https://smasher-api.fly.dev'
```

---

## Git Workflow

### Commit Changes
```bash
git add .
git commit -m "Description of changes"
git push
```

### Create Branch
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push -u origin feature/new-feature
```

### Merge to Main
```bash
git checkout main
git merge feature/new-feature
git push
```

---

## Deployment

### Deploy Backend
```bash
cd server
flyctl deploy
```

### Build Release APK
```bash
cd app-rn
npx react-native build-android --mode=release
```

### Build Release AAB (for Play Store)
```bash
cd app-rn/android
./gradlew bundleRelease
```

### Install Release APK
```bash
adb install app-rn/android/app/build/outputs/apk/release/app-release.apk
```

---

## Useful Shortcuts

### Metro Bundler
- `r` - Reload app
- `d` - Open Dev Menu
- `j` - Open DevTools
- `Ctrl+C` - Stop Metro

### Android Device
- Shake device - Open Dev Menu
- `adb shell input keyevent 82` - Open Dev Menu
- `adb shell input text "Hello"` - Type text
- `adb shell input keyevent 66` - Press Enter

---

## File Locations

### Important Files
```
server/.env                          # Backend config
app-rn/src/config/api.ts            # API URL
app-rn/android/app/build.gradle     # App version, signing
server/src/main.ts                  # Server entry point
app-rn/index.js                     # App entry point
```

### Logs
```
server/                             # Console output
app-rn/                             # Metro console
adb logcat                          # Android system logs
```

### Build Outputs
```
app-rn/android/app/build/outputs/apk/release/app-release.apk
app-rn/android/app/build/outputs/bundle/release/app-release.aab
```

---

## Performance Tips

### Speed Up Development
1. Use physical device instead of emulator
2. Enable Fast Refresh (enabled by default)
3. Use `--reset-cache` only when needed
4. Keep Metro running between builds

### Optimize Build Time
1. Increase Gradle memory: `org.gradle.jvmargs=-Xmx4096m`
2. Enable Gradle daemon
3. Use incremental builds
4. Don't clean unless necessary

---

## Keyboard Shortcuts

### VS Code
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+P` - Command palette
- `Ctrl+`` - Toggle terminal
- `F5` - Start debugging

### Metro
- `r` - Reload
- `d` - Dev menu
- `j` - DevTools

---

## Resources

### Documentation
- [README.md](./README.md) - Project overview
- [SETUP.md](./SETUP.md) - Setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [STATUS.md](./STATUS.md) - Current status

### External Docs
- React Native: https://reactnative.dev
- NestJS: https://docs.nestjs.com
- TypeORM: https://typeorm.io
- Fly.io: https://fly.io/docs

### Getting Help
- Check STATUS.md for known issues
- Search error messages
- Check React Native docs
- Ask in Discord/Stack Overflow

---

*Keep this file handy for quick reference during development!*
