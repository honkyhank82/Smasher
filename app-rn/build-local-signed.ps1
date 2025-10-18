# Build Android App Bundle Locally with Correct Signing
# This builds the AAB on your machine instead of using EAS Build

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Production AAB Locally" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Export for Android
Write-Host "Step 1: Exporting app for Android..." -ForegroundColor Yellow
npx expo export --platform android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Export failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Building AAB with Gradle..." -ForegroundColor Yellow
cd android

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Gray
.\gradlew clean

# Build the App Bundle
Write-Host "Building release AAB (this may take 5-10 minutes)..." -ForegroundColor Gray
.\gradlew bundleRelease

cd ..

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Build Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "AAB Location:" -ForegroundColor Cyan
    Write-Host "  android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Go to Google Play Console" -ForegroundColor White
    Write-Host "  2. Navigate to: Production > Create new release" -ForegroundColor White
    Write-Host "  3. Upload: android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor White
    Write-Host "  4. The AAB is signed with the correct key!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Build failed! Check the error above." -ForegroundColor Red
    exit 1
}
