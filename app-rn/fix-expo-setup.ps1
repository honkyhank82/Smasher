#!/usr/bin/env pwsh
# Expo Setup Fix Script - Installs new dependencies and validates configuration

Write-Host "=== SMASHER Expo Setup Fix ===" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$appDir = $PSScriptRoot

# Check if we're in the right directory
if (-not (Test-Path "$appDir\package.json")) {
    Write-Host "❌ Error: package.json not found. Run this script from app-rn directory." -ForegroundColor Red
    exit 1
}

Write-Host "📍 Working directory: $appDir" -ForegroundColor Gray
Write-Host ""

# Step 1: Check Node version
Write-Host "[1/6] Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "   Node version: $nodeVersion" -ForegroundColor Gray

if ($nodeVersion -match 'v([0-9]+)\.') {
    $majorVersion = [int]$Matches[1]
    if ($majorVersion -lt 20) {
        Write-Host "   ⚠️  Warning: Node 20+ recommended (you have v$majorVersion)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Node version OK" -ForegroundColor Green
    }
}

# Step 2: Check if Expo CLI is available
Write-Host ""
Write-Host "[2/6] Checking Expo CLI..." -ForegroundColor Yellow
try {
    $expoVersion = npx expo --version 2>$null
    Write-Host "   ✅ Expo CLI available: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Expo CLI not found, will be installed with dependencies" -ForegroundColor Yellow
}

# Step 3: Remove old incompatible packages
Write-Host ""
Write-Host "[3/6] Removing incompatible bare React Native packages..." -ForegroundColor Yellow
$packagesToRemove = @(
    "react-native-geolocation-service",
    "react-native-permissions",
    "react-native-image-picker",
    "react-native-video",
    "@react-native/new-app-screen"
)

foreach ($pkg in $packagesToRemove) {
    Write-Host "   Removing $pkg..." -ForegroundColor Gray
    npm uninstall $pkg 2>$null
}
Write-Host "   ✅ Old packages removed" -ForegroundColor Green

# Step 4: Install new Expo packages
Write-Host ""
Write-Host "[4/6] Installing Expo packages..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray

$packagesToInstall = @(
    "expo-location@~18.0.6",
    "expo-image-picker@~16.0.5",
    "expo-av@~15.0.3"
)

try {
    npm install $packagesToInstall --save
    Write-Host "   ✅ Expo packages installed successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to install packages. Try running: npm install" -ForegroundColor Red
    exit 1
}

# Step 5: Verify package.json
Write-Host ""
Write-Host "[5/6] Verifying configuration..." -ForegroundColor Yellow

$packageJson = Get-Content "$appDir\package.json" | ConvertFrom-Json

$requiredPackages = @{
    "expo" = $true
    "expo-location" = $true
    "expo-image-picker" = $true
    "expo-av" = $true
    "expo-updates" = $true
}

$allPresent = $true
foreach ($pkg in $requiredPackages.Keys) {
    if ($packageJson.dependencies.PSObject.Properties.Name -contains $pkg) {
        Write-Host "   ✅ $pkg" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $pkg MISSING" -ForegroundColor Red
        $allPresent = $false
    }
}

# Step 6: Check for old imports in code
Write-Host ""
Write-Host "[6/6] Checking for old imports in source files..." -ForegroundColor Yellow

$oldImports = @(
    "react-native-geolocation-service",
    "react-native-permissions",
    "react-native-image-picker",
    "from 'react-native-video'"
)

$foundIssues = $false
foreach ($pattern in $oldImports) {
    $results = Get-ChildItem -Path "$appDir\src" -Recurse -Include *.ts,*.tsx | 
        Select-String -Pattern $pattern -SimpleMatch

    if ($results) {
        Write-Host "   ⚠️  Found old import: $pattern" -ForegroundColor Yellow
        $foundIssues = $true
        foreach ($result in $results) {
            Write-Host "      $($result.Path):$($result.LineNumber)" -ForegroundColor Gray
        }
    }
}

if (-not $foundIssues) {
    Write-Host "   ✅ No old imports found" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""

if ($allPresent -and -not $foundIssues) {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Clear Metro cache: npx expo start --clear" -ForegroundColor White
    Write-Host "2. Rebuild native code: npx expo prebuild --clean" -ForegroundColor White
    Write-Host "3. Run on device: npx expo run:android" -ForegroundColor White
    Write-Host ""
    Write-Host "For production build:" -ForegroundColor Cyan
    Write-Host "  eas build --profile production --platform android" -ForegroundColor White
} else {
    Write-Host "⚠️  Some issues detected. Please review the output above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual fix:" -ForegroundColor Cyan
    Write-Host "  npm install" -ForegroundColor White
    Write-Host "  npx expo start --clear" -ForegroundColor White
}

Write-Host ""
Write-Host "📖 See EXPO_FIXES_APPLIED.md for detailed documentation" -ForegroundColor Gray
