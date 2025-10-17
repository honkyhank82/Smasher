#!/usr/bin/env pwsh
# Build both APK and AAB for release

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Smasher App - Version 1.0.1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Navigate to android directory
Set-Location -Path "$PSScriptRoot\app-rn\android"

Write-Host "Step 1: Building Release AAB..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray
Write-Host ""

# Build AAB
.\gradlew bundleRelease

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AAB build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ AAB build successful!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Building Release APK..." -ForegroundColor Yellow
Write-Host ""

# Build APK
.\gradlew assembleRelease

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ APK build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ APK build successful!" -ForegroundColor Green
Write-Host ""

# Show output files
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$aabPath = "app\build\outputs\bundle\release\app-release.aab"
$apkPath = "app\build\outputs\apk\release\app-release.apk"

if (Test-Path $aabPath) {
    $aabSize = (Get-Item $aabPath).Length / 1MB
    Write-Host "📦 AAB: $aabPath" -ForegroundColor Green
    Write-Host "   Size: $([math]::Round($aabSize, 2)) MB" -ForegroundColor Gray
    Write-Host ""
}

if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "📦 APK: $apkPath" -ForegroundColor Green
    Write-Host "   Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Upload AAB to Google Play Console" -ForegroundColor White
Write-Host "2. Use release notes from RELEASE_NOTES_PLAY_CONSOLE.md" -ForegroundColor White
Write-Host ""

Set-Location -Path $PSScriptRoot
