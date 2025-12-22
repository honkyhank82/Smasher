# Smasher - Step-by-Step Deployment Script
# Sets secrets one at a time to avoid timeouts

Write-Host "================================"
Write-Host "  SMASHER - Deploy Step by Step"
Write-Host "================================"
Write-Host ""

# Check if flyctl is installed
$flyctl = Get-Command flyctl -ErrorAction SilentlyContinue
if (-not $flyctl) {
    Write-Host "[ERROR] Fly.io CLI not found!" -ForegroundColor Red
    Write-Host "Install: iwr https://fly.io/install.ps1 -useb | iex"
    exit 1
}

Write-Host "[OK] Fly.io CLI found" -ForegroundColor Green
Write-Host ""

# Load existing .env values
$envPath = "server\.env"
$envVars = @{}

if (Test-Path $envPath) {
    Write-Host "Loading values from server/.env..." -ForegroundColor Yellow
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $envVars[$key] = $value
        }
    }
    Write-Host "[OK] Loaded configuration" -ForegroundColor Green
    Write-Host ""
}

Write-Host "================================"
Write-Host "  STEP 1: Attach Database"
Write-Host "================================"
Write-Host ""

Write-Host "Attaching PostgreSQL database..." -ForegroundColor Yellow
flyctl postgres attach smasher-db --app smasher-api --database-user smasher_prod 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Database attached" -ForegroundColor Green
} else {
    Write-Host "[INFO] Database may already be attached (this is OK)" -ForegroundColor Cyan
}

Write-Host ""
Start-Sleep -Seconds 2

Write-Host "================================"
Write-Host "  STEP 2: Set JWT Secret"
Write-Host "================================"
Write-Host ""

Write-Host "Setting JWT_SECRET..." -ForegroundColor Yellow

if ($envVars.ContainsKey("JWT_SECRET") -and $envVars["JWT_SECRET"]) {
    $jwtSecret = $envVars["JWT_SECRET"]
    Write-Host "Using JWT_SECRET from .env file" -ForegroundColor Cyan
} else {
    Write-Host "Generating new JWT_SECRET..." -ForegroundColor Cyan
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
}

flyctl secrets set JWT_SECRET="$jwtSecret" --app smasher-api --stage
Write-Host "[OK] JWT_SECRET set" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "================================"
Write-Host "  STEP 3: Set Resend Email"
Write-Host "================================"
Write-Host ""

if ($envVars.ContainsKey("RESEND_API_KEY") -and $envVars["RESEND_API_KEY"]) {
    Write-Host "Found RESEND_API_KEY in .env" -ForegroundColor Cyan
    $useResend = Read-Host "Use existing Resend credentials? (y/n)"
    
    if ($useResend -eq "y") {
        $resendKey = $envVars["RESEND_API_KEY"]
        $resendFrom = $envVars["RESEND_FROM"]
    } else {
        $resendKey = Read-Host "Enter Resend API Key (or press Enter to skip)"
        if ($resendKey) {
            $resendFrom = Read-Host "Enter sender email (default: onboarding@resend.dev)"
            if (-not $resendFrom) { $resendFrom = "onboarding@resend.dev" }
        }
    }
} else {
    $resendKey = Read-Host "Enter Resend API Key (or press Enter to skip)"
    if ($resendKey) {
        $resendFrom = Read-Host "Enter sender email (default: onboarding@resend.dev)"
        if (-not $resendFrom) { $resendFrom = "onboarding@resend.dev" }
    }
}

if ($resendKey) {
    Write-Host "Setting Resend credentials..." -ForegroundColor Yellow
    flyctl secrets set RESEND_API_KEY="$resendKey" --app smasher-api --stage
    flyctl secrets set RESEND_FROM="$resendFrom" --app smasher-api --stage
    Write-Host "[OK] Resend configured" -ForegroundColor Green
} else {
    Write-Host "[SKIP] Resend not configured (emails will be logged)" -ForegroundColor Yellow
}

Write-Host ""
Start-Sleep -Seconds 2

Write-Host "================================"
Write-Host "  STEP 4: Set Cloudflare R2"
Write-Host "================================"
Write-Host ""

if ($envVars.ContainsKey("S3_ENDPOINT") -and $envVars["S3_ENDPOINT"]) {
    Write-Host "Found R2 credentials in .env" -ForegroundColor Cyan
    $useR2 = Read-Host "Use existing R2 credentials? (y/n)"
    
    if ($useR2 -eq "y") {
        $s3Endpoint = $envVars["S3_ENDPOINT"]
        $s3AccessKey = $envVars["S3_ACCESS_KEY_ID"]
        $s3SecretKey = $envVars["S3_SECRET_ACCESS_KEY"]
        $s3Bucket = $envVars["S3_BUCKET"]
    } else {
        $s3Endpoint = Read-Host "Enter R2 endpoint (or press Enter to skip)"
        if ($s3Endpoint) {
            $s3AccessKey = Read-Host "Enter R2 Access Key ID"
            $s3SecretKey = Read-Host "Enter R2 Secret Access Key"
            $s3Bucket = Read-Host "Enter bucket name (default: smasher-media)"
            if (-not $s3Bucket) { $s3Bucket = "smasher-media" }
        }
    }
} else {
    $s3Endpoint = Read-Host "Enter R2 endpoint (or press Enter to skip)"
    if ($s3Endpoint) {
        $s3AccessKey = Read-Host "Enter R2 Access Key ID"
        $s3SecretKey = Read-Host "Enter R2 Secret Access Key"
        $s3Bucket = Read-Host "Enter bucket name (default: smasher-media)"
        if (-not $s3Bucket) { $s3Bucket = "smasher-media" }
    }
}

if ($s3Endpoint) {
    Write-Host "Setting R2 credentials..." -ForegroundColor Yellow
    flyctl secrets set S3_ENDPOINT="$s3Endpoint" --app smasher-api --stage
    flyctl secrets set S3_ACCESS_KEY_ID="$s3AccessKey" --app smasher-api --stage
    flyctl secrets set S3_SECRET_ACCESS_KEY="$s3SecretKey" --app smasher-api --stage
    flyctl secrets set S3_BUCKET="$s3Bucket" --app smasher-api --stage
    flyctl secrets set S3_REGION="auto" --app smasher-api --stage
    flyctl secrets set S3_FORCE_PATH_STYLE="true" --app smasher-api --stage
    Write-Host "[OK] R2 configured" -ForegroundColor Green
} else {
    Write-Host "[SKIP] R2 not configured (photo uploads will fail)" -ForegroundColor Yellow
}

Write-Host ""
Start-Sleep -Seconds 2

Write-Host "================================"
Write-Host "  STEP 5: Set NODE_ENV"
Write-Host "================================"
Write-Host ""

Write-Host "Setting NODE_ENV=production..." -ForegroundColor Yellow
flyctl secrets set NODE_ENV="production" --app smasher-api --stage
Write-Host "[OK] NODE_ENV set" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "================================"
Write-Host "  STEP 6: Deploy Secrets"
Write-Host "================================"
Write-Host ""

Write-Host "Deploying all staged secrets..." -ForegroundColor Yellow
Write-Host "This will restart the app with new configuration." -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Ready to deploy? (y/n)"

if ($confirm -eq "y") {
    flyctl secrets deploy --app smasher-api
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Secrets deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to deploy secrets" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[SKIP] Secrets staged but not deployed" -ForegroundColor Yellow
    Write-Host "Run: flyctl secrets deploy --app smasher-api" -ForegroundColor Gray
    exit 0
}

Write-Host ""
Start-Sleep -Seconds 3

Write-Host "================================"
Write-Host "  STEP 7: Deploy Application"
Write-Host "================================"
Write-Host ""

Write-Host "Deploying application code..." -ForegroundColor Yellow
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
    Write-Host "  curl https://smasher-api.fly.dev/health" -ForegroundColor Gray
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Yellow
    Write-Host "  flyctl logs --app smasher-api" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[ERROR] Deployment failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check logs:" -ForegroundColor Yellow
    Write-Host "  flyctl logs --app smasher-api" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "================================"
Write-Host "  NEXT STEPS"
Write-Host "================================"
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
