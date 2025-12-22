# Setup CodePush for Smasher App
# This script helps configure CodePush for automatic updates

Write-Host "=== CodePush Setup for Smasher ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "Step 1: Installing react-native-code-push..." -ForegroundColor Yellow
npm install --save react-native-code-push

Write-Host ""
Write-Host "Step 2: Install AppCenter CLI (if not already installed)..." -ForegroundColor Yellow
$appcenterInstalled = Get-Command appcenter -ErrorAction SilentlyContinue
if (-not $appcenterInstalled) {
    npm install -g appcenter-cli
    Write-Host "AppCenter CLI installed successfully!" -ForegroundColor Green
} else {
    Write-Host "AppCenter CLI already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create an AppCenter account at https://appcenter.ms/" -ForegroundColor White
Write-Host ""
Write-Host "2. Login to AppCenter:" -ForegroundColor White
Write-Host "   appcenter login" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Create your app in AppCenter:" -ForegroundColor White
Write-Host "   appcenter apps create -d Smasher-Android -o Android -p React-Native" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Get your deployment keys:" -ForegroundColor White
Write-Host "   appcenter codepush deployment list -a YOUR_USERNAME/Smasher-Android -k" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Add deployment keys to android/app/build.gradle:" -ForegroundColor White
Write-Host "   - Add Staging key for debug builds" -ForegroundColor Gray
Write-Host "   - Add Production key for release builds" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Configure MainApplication.java (see AUTO_UPDATE_SETUP.md)" -ForegroundColor White
Write-Host ""
Write-Host "7. Test with:" -ForegroundColor White
Write-Host "   npx react-native run-android" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed instructions, see AUTO_UPDATE_SETUP.md" -ForegroundColor Cyan
Write-Host ""
