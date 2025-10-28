#!/usr/bin/env pwsh

# Build Release APK Script for Smasher App
# This script builds a signed release APK locally

Write-Host "🔨 Building Smasher App Release APK..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "app-rn\android\gradlew.bat")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "   Expected to find: app-rn\android\gradlew.bat" -ForegroundColor Red
    exit 1
}

# Check if keystore exists
$keystorePath = "app-rn\android\app\smasher-release.keystore"
if (-not (Test-Path $keystorePath)) {
    Write-Host "❌ Error: Release keystore not found at $keystorePath" -ForegroundColor Red
    Write-Host "   Please create a release keystore first or use the AAB build script" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found release keystore: $keystorePath" -ForegroundColor Green

# Navigate to Android directory
Set-Location "app-rn\android"

Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
& .\gradlew.bat clean

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Clean failed" -ForegroundColor Red
    Set-Location "..\..\"
    exit 1
}

Write-Host "🔨 Building release APK..." -ForegroundColor Yellow
& .\gradlew.bat assembleRelease

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Release APK build failed" -ForegroundColor Red
    Set-Location "..\..\"
    exit 1
}

# Navigate back to root
Set-Location "..\..\"

# Check if APK was created
$apkPath = "app-rn\android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    $apkInfo = Get-Item $apkPath
    $apkSizeMB = [math]::Round($apkInfo.Length / 1MB, 2)
    
    # Extract version from build.gradle (best-effort)
    $buildGradlePath = "app-rn\android\app\build.gradle"
    $versionCode = $null
    $versionName = $null
    if (Test-Path $buildGradlePath) {
        try {
            $versionCode = (Select-String -Path $buildGradlePath -Pattern "versionCode\s+(\d+)" | ForEach-Object { $_.Matches.Groups[1].Value } | Select-Object -First 1)
            $versionName = (Select-String -Path $buildGradlePath -Pattern 'versionName\s+"([^"]+)"' | ForEach-Object { $_.Matches.Groups[1].Value } | Select-Object -First 1)
        } catch {
            Write-Host "⚠️  Unable to parse version from build.gradle: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  build.gradle not found at $buildGradlePath; version will be shown as unknown" -ForegroundColor Yellow
    }
    if (-not $versionCode) { $versionCode = "unknown" }
    if (-not $versionName) { $versionName = "unknown" }
    
    # Copy to root with a friendly name
    Copy-Item $apkPath "SmasherApp-Release.apk" -Force
    
    Write-Host ""
    Write-Host "🎉 SUCCESS! Release APK built successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 APK Details:" -ForegroundColor Cyan
    Write-Host "   Location: $apkPath" -ForegroundColor White
    Write-Host "   Copy: SmasherApp-Release.apk" -ForegroundColor White
    Write-Host "   Size: $apkSizeMB MB" -ForegroundColor White
    Write-Host "   Version: $versionName (Build $versionCode)" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Installation Options:" -ForegroundColor Cyan
    Write-Host "   1. ADB: adb install SmasherApp-Release.apk" -ForegroundColor White
    Write-Host "   2. Transfer to device and install manually" -ForegroundColor White
    Write-Host "   3. Email to yourself and install on device" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Note: This is a SIGNED RELEASE APK suitable for distribution" -ForegroundColor Yellow
    Write-Host "   It can be installed on any Android device or distributed" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "❌ APK not found at expected location: $apkPath" -ForegroundColor Red
    exit 1
}