# Build Android APK for Smasher App
# This creates a debug APK you can install and test

Write-Host "================================"
Write-Host "  Building Android APK"
Write-Host "================================"
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "app-rn\android")) {
    Write-Host "[ERROR] app-rn/android directory not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the smasher root directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Cleaning previous builds..." -ForegroundColor Yellow
Set-Location app-rn\android
.\gradlew clean
Write-Host "[OK] Clean complete" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Building debug APK..." -ForegroundColor Yellow
Write-Host "This may take 2-5 minutes..." -ForegroundColor Cyan
Write-Host ""

.\gradlew assembleDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Build successful!" -ForegroundColor Green
    Write-Host ""
    
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    $fullPath = Resolve-Path $apkPath
    $size = (Get-Item $apkPath).Length / 1MB
    
    Write-Host "APK created:" -ForegroundColor Yellow
    Write-Host "  Location: $fullPath" -ForegroundColor Green
    Write-Host "  Size: $([math]::Round($size, 2)) MB" -ForegroundColor Green
    Write-Host ""
    
    # Copy to root for easy access
    Copy-Item $apkPath "..\..\SmasherApp-Debug.apk" -Force
    Write-Host "Copied to: SmasherApp-Debug.apk (in root directory)" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "================================"
    Write-Host "  How to Install"
    Write-Host "================================"
    Write-Host ""
    Write-Host "Option 1: Install via ADB (if device connected)"
    Write-Host "  adb install SmasherApp-Debug.apk" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2: Transfer to phone"
    Write-Host "  1. Copy SmasherApp-Debug.apk to your phone" -ForegroundColor Gray
    Write-Host "  2. Open the file on your phone" -ForegroundColor Gray
    Write-Host "  3. Allow installation from unknown sources if prompted" -ForegroundColor Gray
    Write-Host "  4. Install and open" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 3: Email/Cloud"
    Write-Host "  1. Email the APK to yourself" -ForegroundColor Gray
    Write-Host "  2. Open email on phone and download" -ForegroundColor Gray
    Write-Host "  3. Install" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above for details." -ForegroundColor Yellow
    Set-Location ..\..
    exit 1
}

Set-Location ..\..

Write-Host "================================"
Write-Host "  Next Steps"
Write-Host "================================"
Write-Host ""
Write-Host "1. Install the APK on your Android device" -ForegroundColor Yellow
Write-Host "2. Test all features" -ForegroundColor Yellow
Write-Host "3. Report any issues" -ForegroundColor Yellow
Write-Host ""
Write-Host "Build complete!" -ForegroundColor Green
Write-Host ""
