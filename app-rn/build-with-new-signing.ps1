# Build Production AAB with New Signing
# This script builds a production Android App Bundle with EAS Build
# EAS will automatically generate new upload credentials

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Production AAB with EAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to Expo
Write-Host "Checking Expo authentication..." -ForegroundColor Yellow
npx eas-cli whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Expo. Please login first:" -ForegroundColor Red
    Write-Host "  npx eas-cli login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting production build..." -ForegroundColor Green
Write-Host "This will:" -ForegroundColor White
Write-Host "  1. Generate new upload keystore (if needed)" -ForegroundColor White
Write-Host "  2. Build production Android App Bundle" -ForegroundColor White
Write-Host "  3. Sign with the new keystore" -ForegroundColor White
Write-Host "  4. Upload to EAS servers" -ForegroundColor White
Write-Host ""
Write-Host "Build time: ~10-20 minutes" -ForegroundColor Yellow
Write-Host ""

# Start the build
npx eas-cli build --platform android --profile production

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Build submitted successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Wait for build to complete (~10-20 min)" -ForegroundColor White
    Write-Host "  2. Download the AAB from the build URL shown above" -ForegroundColor White
    Write-Host "  3. Go to Google Play Console" -ForegroundColor White
    Write-Host "  4. Navigate to: Production > Create new release" -ForegroundColor White
    Write-Host "  5. Upload the AAB file" -ForegroundColor White
    Write-Host "  6. Google will handle app signing automatically" -ForegroundColor White
    Write-Host ""
    Write-Host "Check build status:" -ForegroundColor Yellow
    Write-Host "  npx eas-cli build:list" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Build failed! Check the error above." -ForegroundColor Red
    Write-Host ""
    exit 1
}
