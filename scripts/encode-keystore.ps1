$keystorePath = "app-rn/android/app/smasher-release.keystore"
if (-not (Test-Path $keystorePath)) {
    Write-Host "Error: $keystorePath not found!" -ForegroundColor Red
    Write-Host "Please ensure the keystore exists at: $keystorePath" -ForegroundColor Yellow
    exit 1
}

$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path $keystorePath)))
Write-Host "Your base64-encoded keystore:" -ForegroundColor Green
Write-Host $base64 -ForegroundColor Cyan
Write-Host "`nAdd this as a secret named 'KEYSTORE_BASE64' in your GitHub repository:" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com/honkyhank82/Smasher/settings/secrets/actions" -ForegroundColor White
Write-Host "2. Click 'New repository secret'" -ForegroundColor White
Write-Host "3. Name: KEYSTORE_BASE64" -ForegroundColor White
Write-Host "4. Value: (paste the base64 string above)" -ForegroundColor White