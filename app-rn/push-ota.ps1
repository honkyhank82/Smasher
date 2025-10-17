# Push OTA Update to Production
Write-Host "🚀 Pushing OTA update to production..." -ForegroundColor Cyan

npx eas update --branch production --message "Navigation fixes, error logging, and privacy settings endpoints"

Write-Host "✅ OTA update complete!" -ForegroundColor Green
