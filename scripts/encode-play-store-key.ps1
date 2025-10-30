$jsonPath = "app-rn/google-play-service-account.json"
if (-not (Test-Path $jsonPath)) {
    Write-Host "Error: $jsonPath not found!" -ForegroundColor Red
    Write-Host "Please place your Google Play service account JSON file at: $jsonPath" -ForegroundColor Yellow
    exit 1
}

$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path $jsonPath)))
Write-Host "Your base64-encoded Google Play service account JSON:" -ForegroundColor Green
Write-Host $base64 -ForegroundColor Cyan
Write-Host "`nAdd this as a secret named 'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON' in your GitHub repository:" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com/honkyhank82/Smasher/settings/secrets/actions" -ForegroundColor White
Write-Host "2. Click 'New repository secret'" -ForegroundColor White
Write-Host "3. Name: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON" -ForegroundColor White
Write-Host "4. Value: (paste the base64 string above)" -ForegroundColor White