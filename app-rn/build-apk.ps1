# Build APK Script for Smasher App
# This script cleans, installs dependencies, and builds a release APK

Write-Host "🧹 Cleaning build directories..." -ForegroundColor Cyan

# Clean Android build
Set-Location android
.\gradlew clean
Set-Location ..

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "🔧 Ensuring required dev dependencies..." -ForegroundColor Cyan
npm install invariant --save-dev

Write-Host "🔨 Building release APK..." -ForegroundColor Cyan
Set-Location android
.\gradlew assembleRelease
Set-Location ..

Write-Host ""
Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 APK Location:" -ForegroundColor Yellow
Write-Host "   android\app\build\outputs\apk\release\app-release.apk"
Write-Host ""
Write-Host "📊 APK Info:" -ForegroundColor Yellow

$apkPath = "android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "   Size: $([math]::Round($apkSize, 2)) MB"
    Write-Host ""
    Write-Host "🎉 Ready to install or distribute!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  APK not found. Check build logs for errors." -ForegroundColor Red
}
