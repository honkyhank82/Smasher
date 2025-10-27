#!/usr/bin/env pwsh
# Build both APK and AAB for release

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Smasher App - Version 1.0.15" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "app-rn\android")) {
    Write-Host "[ERROR] app-rn/android directory not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the smasher root directory" -ForegroundColor Yellow
    exit 1
}

Set-Location app-rn\android

# Step 1: Clean
Write-Host "Step 1: Cleaning previous builds..." -ForegroundColor Yellow
Write-Host "This may take a moment..." -ForegroundColor Cyan
.\gradlew clean --no-daemon

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Clean failed!" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}

Write-Host "[OK] Clean complete" -ForegroundColor Green
Write-Host ""

# Step 2: Build Release AAB
Write-Host "Step 2: Building Release AAB..." -ForegroundColor Yellow
Write-Host "This will take 2-5 minutes. Status updates every 45 seconds..." -ForegroundColor Cyan
Write-Host ""

$aabStartTime = Get-Date
$aabProcess = Start-Process -FilePath ".\gradlew.bat" -ArgumentList "bundleRelease","--no-daemon" -NoNewWindow -PassThru -RedirectStandardOutput "..\..\aab-build.log" -RedirectStandardError "..\..\aab-error.log"

while (!$aabProcess.HasExited) {
    $elapsed = (Get-Date) - $aabStartTime
    if ($elapsed.TotalSeconds % 45 -lt 1 -and $elapsed.TotalSeconds -gt 1) {
        Write-Host "[STATUS] AAB build running... ($([math]::Round($elapsed.TotalMinutes, 1)) minutes elapsed)" -ForegroundColor Cyan
    }
    Start-Sleep -Seconds 1
}

$aabProcess.WaitForExit()
$aabResult = $aabProcess.ExitCode

if ($aabResult -eq 0) {
    Write-Host "[OK] AAB build successful!" -ForegroundColor Green
    Write-Host ""
    
    $aabPath = "app\build\outputs\bundle\release\app-release.aab"
    if (Test-Path $aabPath) {
        $size = (Get-Item $aabPath).Length / 1MB
        Write-Host "AAB created: $([math]::Round($size, 2)) MB" -ForegroundColor Green
        Copy-Item $aabPath "..\..\SmasherApp-v1.0.15-Release.aab" -Force
        Write-Host "Copied to: SmasherApp-v1.0.15-Release.aab" -ForegroundColor Cyan
    }
} else {
    Write-Host "[ERROR] AAB build failed! Check aab-error.log for details" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}

Write-Host ""

# Step 3: Build Release APK
Write-Host "Step 3: Building Release APK..." -ForegroundColor Yellow
Write-Host "This will take 2-5 minutes. Status updates every 45 seconds..." -ForegroundColor Cyan
Write-Host ""

$apkStartTime = Get-Date
$apkProcess = Start-Process -FilePath ".\gradlew.bat" -ArgumentList "assembleRelease","--no-daemon" -NoNewWindow -PassThru -RedirectStandardOutput "..\..\apk-build.log" -RedirectStandardError "..\..\apk-error.log"

while (!$apkProcess.HasExited) {
    $elapsed = (Get-Date) - $apkStartTime
    if ($elapsed.TotalSeconds % 45 -lt 1 -and $elapsed.TotalSeconds -gt 1) {
        Write-Host "[STATUS] APK build running... ($([math]::Round($elapsed.TotalMinutes, 1)) minutes elapsed)" -ForegroundColor Cyan
    }
    Start-Sleep -Seconds 1
}

$apkProcess.WaitForExit()
$apkResult = $apkProcess.ExitCode

if ($apkResult -eq 0) {
    Write-Host "[OK] APK build successful!" -ForegroundColor Green
    Write-Host ""
    
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        $size = (Get-Item $apkPath).Length / 1MB
        Write-Host "APK created: $([math]::Round($size, 2)) MB" -ForegroundColor Green
        Copy-Item $apkPath "..\..\SmasherApp-v1.0.15-Release.apk" -Force
        Write-Host "Copied to: SmasherApp-v1.0.15-Release.apk" -ForegroundColor Cyan
    }
} else {
    Write-Host "[ERROR] APK build failed! Check apk-error.log for details" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}

Set-Location ..\..

Write-Host ""
Write-Host "================================"
Write-Host "  All Builds Complete!"
Write-Host "================================"
Write-Host ""
Write-Host "Files created:" -ForegroundColor Green
Write-Host "  - SmasherApp-v1.0.15-Release.aab (for Google Play)" -ForegroundColor Cyan
Write-Host "  - SmasherApp-v1.0.15-Release.apk (for direct install)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Build logs saved to:" -ForegroundColor Yellow
Write-Host "  - aab-build.log / aab-error.log" -ForegroundColor Gray
Write-Host "  - apk-build.log / apk-error.log" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Upload AAB to Google Play Console" -ForegroundColor White
Write-Host "2. Test APK on device before distribution" -ForegroundColor White
Write-Host ""
