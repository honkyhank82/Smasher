#!/usr/bin/env pwsh
# Build production APK and AAB using EAS Build (cloud-based, no local dependencies)

Write-Host "=== SMASHER Production Build (EAS Cloud Build) ===" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Check if we're in the right directory
if (-not (Test-Path "app.json")) {
    Write-Host "Error: app.json not found. Run this from app-rn directory." -ForegroundColor Red
    exit 1
}

Write-Host "Building SMASHER v1.0.0 for production..." -ForegroundColor Yellow
Write-Host ""

# Verify EAS CLI is available
Write-Host "[1/4] Checking EAS CLI..." -ForegroundColor Yellow
try {
    $easVersion = eas --version 2>$null
    Write-Host "   EAS CLI version: $easVersion" -ForegroundColor Green
} catch {
    Write-Host "   EAS CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g eas-cli
}

# Login to EAS (if not already logged in)
Write-Host ""
Write-Host "[2/4] Checking EAS authentication..." -ForegroundColor Yellow
$whoami = eas whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Not logged in. Please log in to EAS..." -ForegroundColor Yellow
    eas login
} else {
    Write-Host "   Logged in as: $whoami" -ForegroundColor Green
}

# Build AAB (for Google Play Store)
Write-Host ""
Write-Host "[3/4] Building AAB (Android App Bundle) for Google Play..." -ForegroundColor Yellow
Write-Host "   This will build on EAS servers (cloud build)" -ForegroundColor Gray
Write-Host "   Build time: ~10-15 minutes" -ForegroundColor Gray
Write-Host ""

eas build --profile production --platform android --non-interactive

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "AAB build failed. Check the error above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "AAB build started successfully!" -ForegroundColor Green

# Build APK (for direct distribution/testing)
Write-Host ""
Write-Host "[4/4] Building APK for direct distribution..." -ForegroundColor Yellow
Write-Host "   This will build on EAS servers (cloud build)" -ForegroundColor Gray
Write-Host "   Build time: ~10-15 minutes" -ForegroundColor Gray
Write-Host ""

eas build --profile production-apk --platform android --non-interactive

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "APK build failed. Check the error above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Build Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both builds have been queued on EAS servers!" -ForegroundColor Green
Write-Host ""
Write-Host "Track build progress:" -ForegroundColor Yellow
Write-Host "  eas build:list" -ForegroundColor White
Write-Host ""
Write-Host "Or visit:" -ForegroundColor Yellow
Write-Host "  https://expo.dev/accounts/[your-account]/projects/smasher-app/builds" -ForegroundColor White
Write-Host ""
Write-Host "When builds complete, download with:" -ForegroundColor Yellow
Write-Host "  eas build:download --platform android --latest" -ForegroundColor White
Write-Host ""
Write-Host "Files will be named:" -ForegroundColor Gray
Write-Host "  - build-[id].aab (for Play Store)" -ForegroundColor White
Write-Host "  - build-[id].apk (for direct install)" -ForegroundColor White
Write-Host ""
