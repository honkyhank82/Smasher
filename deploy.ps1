# SMASHER Production Deployment Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SMASHER Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if flyctl is installed
if (-not (Get-Command flyctl -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: flyctl is not installed" -ForegroundColor Red
    Write-Host "Install from: https://fly.io/docs/hands-on/install-flyctl/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Deploy Backend to Fly.io" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

cd server

# Check if app exists
$appExists = flyctl apps list 2>&1 | Select-String "smasher-api"

if (-not $appExists) {
    Write-Host "Creating new Fly.io app..." -ForegroundColor Yellow
    flyctl launch --name smasher-api --region iad --no-deploy
    
    Write-Host ""
    Write-Host "Setting up PostgreSQL database..." -ForegroundColor Yellow
    flyctl postgres create --name smasher-db --region iad
    flyctl postgres attach smasher-db
}

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Yellow

# Prompt for secrets if not set
Write-Host "Enter your secrets (press Enter to skip if already set):" -ForegroundColor Cyan

$jwtSecret = Read-Host "JWT_SECRET (leave empty to generate)"
if (-not $jwtSecret) {
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
}

$resendKey = Read-Host "RESEND_API_KEY (optional)"
$r2AccountId = Read-Host "R2_ACCOUNT_ID (optional)"
$r2AccessKey = Read-Host "R2_ACCESS_KEY_ID (optional)"
$r2SecretKey = Read-Host "R2_SECRET_ACCESS_KEY (optional)"

# Set secrets
flyctl secrets set JWT_SECRET=$jwtSecret

if ($resendKey) {
    flyctl secrets set RESEND_API_KEY=$resendKey
    flyctl secrets set RESEND_FROM="noreply@smasherapp.com"
}

if ($r2AccountId -and $r2AccessKey -and $r2SecretKey) {
    flyctl secrets set R2_ACCOUNT_ID=$r2AccountId
    flyctl secrets set R2_ACCESS_KEY_ID=$r2AccessKey
    flyctl secrets set R2_SECRET_ACCESS_KEY=$r2SecretKey
    flyctl secrets set R2_BUCKET_NAME="smasher-media"
}

Write-Host ""
Write-Host "Deploying to Fly.io..." -ForegroundColor Yellow
flyctl deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Backend deployed successfully!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Running database migrations..." -ForegroundColor Yellow
    flyctl ssh console -C "npm run typeorm migration:run"
    
    Write-Host ""
    Write-Host "Getting app info..." -ForegroundColor Yellow
    $appInfo = flyctl info
    Write-Host $appInfo
    
    # Extract hostname
    $hostname = ($appInfo | Select-String "Hostname.*=.*(.+)").Matches.Groups[1].Value.Trim()
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Backend Deployment Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "API URL: https://$hostname" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Update app-rn/src/config/api.ts with production URL" -ForegroundColor White
    Write-Host "2. Test API: curl https://$hostname" -ForegroundColor White
    Write-Host "3. Build mobile app: cd ../app-rn && npx react-native build-android --mode=release" -ForegroundColor White
    Write-Host ""
    
    # Save URL to file
    "https://$hostname" | Out-File -FilePath "../PRODUCTION_API_URL.txt"
    Write-Host "API URL saved to PRODUCTION_API_URL.txt" -ForegroundColor Green
    
} else {
    Write-Host ""
    Write-Host "Deployment failed!" -ForegroundColor Red
    Write-Host "Check the errors above and try again" -ForegroundColor Yellow
    exit 1
}

cd ..

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
