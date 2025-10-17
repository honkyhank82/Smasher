# Build Production APK/AAB for Smasher App

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('apk', 'aab', 'both')]
    [string]$BuildType = 'both'
)

Write-Host "🏗️  Building Smasher for Production" -ForegroundColor Cyan
Write-Host ""

# Set production environment
Write-Host "🔧 Setting production environment..." -ForegroundColor Yellow
node scripts/set-env.js production

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
npm install invariant --save-dev

# Clean build
Write-Host "🧹 Cleaning build directories..." -ForegroundColor Yellow
Set-Location android
.\gradlew clean
Set-Location ..

# Increment version
Write-Host "📊 Current version info:" -ForegroundColor Yellow
$buildGradle = Get-Content "android\app\build.gradle" -Raw
if ($buildGradle -match 'versionCode\s+(\d+)') {
    $currentVersionCode = $matches[1]
    Write-Host "   Version Code: $currentVersionCode" -ForegroundColor Gray
}
if ($buildGradle -match 'versionName\s+"([^"]+)"') {
    $currentVersionName = $matches[1]
    Write-Host "   Version Name: $currentVersionName" -ForegroundColor Gray
}

# Build
Set-Location android

if ($BuildType -eq 'apk' -or $BuildType -eq 'both') {
    Write-Host ""
    Write-Host "🔨 Building Release APK..." -ForegroundColor Yellow
    .\gradlew assembleRelease
    
    if (Test-Path "app\build\outputs\apk\release\app-release.apk") {
        $apkSize = (Get-Item "app\build\outputs\apk\release\app-release.apk").Length / 1MB
        Write-Host "✅ APK built successfully!" -ForegroundColor Green
        Write-Host "   Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Gray
        Write-Host "   Location: android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Gray
    }
}

if ($BuildType -eq 'aab' -or $BuildType -eq 'both') {
    Write-Host ""
    Write-Host "🔨 Building Release AAB (for Play Store)..." -ForegroundColor Yellow
    .\gradlew bundleRelease
    
    if (Test-Path "app\build\outputs\bundle\release\app-release.aab") {
        $aabSize = (Get-Item "app\build\outputs\bundle\release\app-release.aab").Length / 1MB
        Write-Host "✅ AAB built successfully!" -ForegroundColor Green
        Write-Host "   Size: $([math]::Round($aabSize, 2)) MB" -ForegroundColor Gray
        Write-Host "   Location: android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Gray
    }
}

Set-Location ..

Write-Host ""
Write-Host "🎉 Production build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test the APK on a physical device" -ForegroundColor Gray
Write-Host "   2. Upload AAB to Google Play Console" -ForegroundColor Gray
Write-Host "   3. Complete store listing" -ForegroundColor Gray
Write-Host "   4. Submit for review" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - APK for direct distribution/testing" -ForegroundColor Gray
Write-Host "   - AAB for Google Play Store submission" -ForegroundColor Gray
Write-Host "   - Always test before submitting!" -ForegroundColor Gray
