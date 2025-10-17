# Smasher - Deploy to Fly.io with Secrets
# This script deploys your backend and configures all secrets

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  SMASHER - Deploy to Fly.io" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if flyctl is installed
$flyctl = Get-Command flyctl -ErrorAction SilentlyContinue
if (-not $flyctl) {
    Write-Host "[ERROR] Fly.io CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install it with:" -ForegroundColor Yellow
    Write-Host '  iwr https://fly.io/install.ps1 -useb | iex' -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "[OK] Fly.io CLI found" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Fly.io authentication..." -ForegroundColor Yellow
$authCheck = flyctl auth whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Not logged in to Fly.io" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login first:" -ForegroundColor Yellow
    Write-Host "  flyctl auth login" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "[OK] Logged in as: $authCheck" -ForegroundColor Green
Write-Host ""

# Check if app exists
Write-Host "Checking if app exists..." -ForegroundColor Yellow
$appCheck = flyctl apps list 2>&1 | Select-String "smasher-api"

if (-not $appCheck) {
    Write-Host "App 'smasher-api' not found. Creating it..." -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location server
    flyctl launch --name smasher-api --no-deploy
    Set-Location ..
    
    Write-Host ""
    Write-Host "[OK] App created" -ForegroundColor Green
} else {
    Write-Host "[OK] App 'smasher-api' exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  CONFIGURE SECRETS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Load from .env if exists
$envPath = "server\.env"
$secrets = @{}

if (Test-Path $envPath) {
    Write-Host "Loading values from server/.env..." -ForegroundColor Yellow
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $secrets[$key] = $value
        }
    }
    Write-Host "[OK] Loaded existing configuration" -ForegroundColor Green
    Write-Host ""
}

# Function to get or prompt for secret
function Get-Secret {
    param(
        [string]$Name,
        [string]$Description,
        [string]$Default = "",
        [bool]$Required = $true
    )
    
    if ($secrets.ContainsKey($Name) -and $secrets[$Name]) {
        $current = $secrets[$Name]
        if ($current.Length -gt 20) {
            $display = $current.Substring(0, 20) + "..."
        } else {
            $display = $current
        }
        
        Write-Host "$Description" -ForegroundColor White
        Write-Host "  Current: $display" -ForegroundColor Gray
        $useExisting = Read-Host "  Use existing value? (y/n)"
        
        if ($useExisting -eq "y") {
            return $current
        }
    }
    
    if ($Required) {
        $value = Read-Host "Enter $Description"
    } else {
        $prompt = "Enter $Description (optional, press Enter to skip)"
        $value = Read-Host $prompt
    }
    
    if (-not $value -and $Default) {
        return $Default
    }
    
    return $value
}

Write-Host "Enter your production secrets:" -ForegroundColor Yellow
Write-Host "(Press Ctrl+C to cancel at any time)" -ForegroundColor Gray
Write-Host ""

# Database
Write-Host "1. DATABASE" -ForegroundColor Cyan
$dbUrl = Get-Secret "DATABASE_URL" "PostgreSQL connection string" "postgresql://user:pass@host:5432/smasher"

# JWT
Write-Host ""
Write-Host "2. JWT SECRET" -ForegroundColor Cyan
Write-Host "  (Generate with: openssl rand -base64 32)" -ForegroundColor Gray
$jwtSecret = Get-Secret "JWT_SECRET" "JWT secret key"

# Resend
Write-Host ""
Write-Host "3. RESEND (Email)" -ForegroundColor Cyan
$resendKey = Get-Secret "RESEND_API_KEY" "Resend API key (starts with re_)" "" $false
$resendFrom = Get-Secret "RESEND_FROM" "Sender email" "onboarding@resend.dev" $false

# Cloudflare R2
Write-Host ""
Write-Host "4. CLOUDFLARE R2 (Media Storage)" -ForegroundColor Cyan
$s3Endpoint = Get-Secret "S3_ENDPOINT" "R2 endpoint (https://[account-id].r2.cloudflarestorage.com)" "" $false
$s3AccessKey = Get-Secret "S3_ACCESS_KEY_ID" "R2 Access Key ID" "" $false
$s3SecretKey = Get-Secret "S3_SECRET_ACCESS_KEY" "R2 Secret Access Key" "" $false
$s3Bucket = Get-Secret "S3_BUCKET" "R2 bucket name" "smasher-media" $false

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  SETTING SECRETS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Set secrets
Write-Host "Setting secrets on Fly.io..." -ForegroundColor Yellow

$secretsToSet = @(
    "DATABASE_URL=$dbUrl",
    "JWT_SECRET=$jwtSecret",
    "NODE_ENV=production"
)

if ($resendKey) {
    $secretsToSet += "RESEND_API_KEY=$resendKey"
    $secretsToSet += "RESEND_FROM=$resendFrom"
}

if ($s3Endpoint) {
    $secretsToSet += "S3_ENDPOINT=$s3Endpoint"
    $secretsToSet += "S3_ACCESS_KEY_ID=$s3AccessKey"
    $secretsToSet += "S3_SECRET_ACCESS_KEY=$s3SecretKey"
    $secretsToSet += "S3_BUCKET=$s3Bucket"
    $secretsToSet += "S3_REGION=auto"
    $secretsToSet += "S3_FORCE_PATH_STYLE=true"
}

flyctl secrets set $secretsToSet --app smasher-api

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Secrets configured" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to set secrets" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  DEPLOYING" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Set-Location server
flyctl deploy
$deployResult = $LASTEXITCODE
Set-Location ..

if ($deployResult -eq 0) {
    Write-Host ""
    Write-Host "[OK] Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your API is live at:" -ForegroundColor Yellow
    Write-Host "  https://smasher-api.fly.dev" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test it:" -ForegroundColor Yellow
    Write-Host '  curl https://smasher-api.fly.dev/health' -ForegroundColor Gray
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Yellow
    Write-Host '  flyctl logs --app smasher-api' -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[ERROR] Deployment failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check logs:" -ForegroundColor Yellow
    Write-Host '  flyctl logs --app smasher-api' -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Update mobile app API URL:" -ForegroundColor Yellow
Write-Host "   Edit: app-rn/src/config/api.ts" -ForegroundColor Gray
Write-Host "   Change API_BASE_URL to: https://smasher-api.fly.dev" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Test the app:" -ForegroundColor Yellow
Write-Host "   - Register a new account" -ForegroundColor Gray
Write-Host "   - Upload a photo" -ForegroundColor Gray
Write-Host "   - Send a message" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Monitor:" -ForegroundColor Yellow
Write-Host "   flyctl logs --app smasher-api" -ForegroundColor Gray
Write-Host "   flyctl status --app smasher-api" -ForegroundColor Gray
Write-Host ""

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
