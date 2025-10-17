# Fix Build Issues Script
# Resolves common React Native build problems

Write-Host "🔧 Fixing build issues..." -ForegroundColor Cyan

# Install missing dependencies
Write-Host "📦 Installing missing dependencies..." -ForegroundColor Yellow
npm install invariant --save-dev

# Clear caches
Write-Host "🧹 Clearing caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
npm cache clean --force

# Reinstall dependencies
Write-Host "📦 Reinstalling dependencies..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install

# Clean Android build
Write-Host "🧹 Cleaning Android build..." -ForegroundColor Yellow
Set-Location android
.\gradlew clean
Set-Location ..

Write-Host ""
Write-Host "Build issues fixed!" -ForegroundColor Green
Write-Host "Now run: .\build-apk.ps1" -ForegroundColor Cyan
