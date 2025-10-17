# Photo Upload Testing Script
# This script helps rebuild the app and monitor logs for photo upload debugging

Write-Host "=== Photo Upload Debug Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "app-rn")) {
    Write-Host "Error: Please run this script from the smasher project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Checking if server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://smasher-api.fly.dev/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] Server is reachable (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Server is not reachable!" -ForegroundColor Red
    Write-Host "  Make sure your server is running at https://smasher-api.fly.dev" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "Step 2: Cleaning and rebuilding the app..." -ForegroundColor Yellow
Set-Location app-rn

# Clean build
Write-Host "  Cleaning Android build..." -ForegroundColor Gray
Set-Location android
& .\gradlew.bat clean | Out-Null
Set-Location ..

# Note: Metro bundler should already be running in a separate terminal
# If not, open a new terminal and run: npx react-native start

Write-Host ""
Write-Host "Step 3: Installing app on device..." -ForegroundColor Yellow
Write-Host "  (Make sure Metro bundler is running in another terminal)" -ForegroundColor Gray
npx react-native run-android

Write-Host ""
Write-Host "=== App installed! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Now monitoring logs for photo upload..." -ForegroundColor Cyan
Write-Host "Try uploading a photo in the app and watch for detailed logs below:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Look for these markers:" -ForegroundColor Yellow
Write-Host "  === UPLOAD START ===" -ForegroundColor Gray
Write-Host "  [OK] Got signed URL" -ForegroundColor Gray
Write-Host "  [OK] File converted to blob" -ForegroundColor Gray
Write-Host "  [OK] Upload successful" -ForegroundColor Gray
Write-Host "  [OK] Upload confirmed" -ForegroundColor Gray
Write-Host "  === UPLOAD COMPLETE ===" -ForegroundColor Gray
Write-Host ""
Write-Host "Or error markers:" -ForegroundColor Red
Write-Host "  [FAILED] UPLOAD FAILED" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop monitoring logs" -ForegroundColor Yellow
Write-Host ""

# Monitor logs
npx react-native log-android

# Cleanup
Set-Location ..
