# Smasher - External Services Setup Script
# This script helps you configure Cloudflare R2 and Resend

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  SMASHER - Services Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if server/.env exists
$envPath = "server\.env"
$envExamplePath = "server\.env.example"

if (-not (Test-Path $envPath)) {
    Write-Host "Creating server/.env from template..." -ForegroundColor Yellow
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Write-Host "✓ Created server/.env" -ForegroundColor Green
    } else {
        Write-Host "✗ Error: server/.env.example not found!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "This script will help you configure:" -ForegroundColor White
Write-Host "  1. Cloudflare R2 (media storage)" -ForegroundColor White
Write-Host "  2. Resend (email service)" -ForegroundColor White
Write-Host ""

# Function to update .env file
function Update-EnvFile {
    param(
        [string]$Key,
        [string]$Value
    )
    
    $content = Get-Content $envPath
    $updated = $false
    
    for ($i = 0; $i -lt $content.Length; $i++) {
        if ($content[$i] -match "^$Key=") {
            $content[$i] = "$Key=$Value"
            $updated = $true
            break
        }
    }
    
    if (-not $updated) {
        $content += "$Key=$Value"
    }
    
    $content | Set-Content $envPath
}

# ============================================
# CLOUDFLARE R2 SETUP
# ============================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  CLOUDFLARE R2 SETUP" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Create Cloudflare Account" -ForegroundColor Yellow
Write-Host "  > Go to: https://dash.cloudflare.com/sign-up" -ForegroundColor White
Write-Host "  > Sign up and verify your email" -ForegroundColor White
Write-Host ""

Write-Host "Step 2: Create R2 Bucket" -ForegroundColor Yellow
Write-Host "  > Go to: https://dash.cloudflare.com" -ForegroundColor White
Write-Host "  > Click 'R2' in the sidebar" -ForegroundColor White
Write-Host "  > Click 'Create bucket'" -ForegroundColor White
Write-Host "  > Name: smasher-media" -ForegroundColor Green
Write-Host "  > Location: Automatic" -ForegroundColor White
Write-Host ""

Write-Host "Step 3: Configure CORS" -ForegroundColor Yellow
Write-Host "  > Click on your bucket > Settings tab" -ForegroundColor White
Write-Host "  > Scroll to 'CORS Policy' > Add CORS policy" -ForegroundColor White
Write-Host "  > Paste this JSON:" -ForegroundColor White
Write-Host ""
Write-Host '[' -ForegroundColor Gray
Write-Host '  {' -ForegroundColor Gray
Write-Host '    "AllowedOrigins": ["*"],' -ForegroundColor Gray
Write-Host '    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],' -ForegroundColor Gray
Write-Host '    "AllowedHeaders": ["*"],' -ForegroundColor Gray
Write-Host '    "ExposeHeaders": ["ETag"],' -ForegroundColor Gray
Write-Host '    "MaxAgeSeconds": 3600' -ForegroundColor Gray
Write-Host '  }' -ForegroundColor Gray
Write-Host ']' -ForegroundColor Gray
Write-Host ""

Write-Host "Step 4: Create API Token" -ForegroundColor Yellow
Write-Host "  > Click 'Manage R2 API Tokens' (top right)" -ForegroundColor White
Write-Host "  > Click 'Create API Token'" -ForegroundColor White
Write-Host "  > Name: smasher-app-token" -ForegroundColor White
Write-Host "  > Permissions: Object Read and Write" -ForegroundColor White
Write-Host "  > Apply to: smasher-media bucket only" -ForegroundColor White
Write-Host "  > Click 'Create API Token'" -ForegroundColor White
Write-Host ""

$r2Setup = Read-Host "Have you completed the R2 setup? (y/n)"

if ($r2Setup -eq "y") {
    Write-Host ""
    Write-Host "Great! Now enter your R2 credentials:" -ForegroundColor Green
    Write-Host ""
    
    $accountId = Read-Host "Account ID"
    $accessKeyId = Read-Host "Access Key ID"
    $secretAccessKey = Read-Host "Secret Access Key"
    
    # Calculate endpoint
    $endpoint = "https://$accountId.r2.cloudflarestorage.com"
    
    Write-Host ""
    Write-Host "Updating server/.env..." -ForegroundColor Yellow
    
    Update-EnvFile "S3_ENDPOINT" $endpoint
    Update-EnvFile "S3_ACCESS_KEY_ID" $accessKeyId
    Update-EnvFile "S3_SECRET_ACCESS_KEY" $secretAccessKey
    Update-EnvFile "S3_BUCKET" "smasher-media"
    Update-EnvFile "S3_REGION" "auto"
    Update-EnvFile "S3_FORCE_PATH_STYLE" "true"
    
    Write-Host "[OK] R2 credentials saved to server/.env" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[WARNING] Skipping R2 setup. Photo uploads will not work until configured." -ForegroundColor Yellow
    Write-Host "  Run this script again when ready." -ForegroundColor Yellow
    Write-Host ""
}

# ============================================
# RESEND EMAIL SETUP
# ============================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  RESEND EMAIL SETUP" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Create Resend Account" -ForegroundColor Yellow
Write-Host "  > Go to: https://resend.com" -ForegroundColor White
Write-Host "  > Click 'Sign Up' (free!)" -ForegroundColor White
Write-Host "  > Verify your email" -ForegroundColor White
Write-Host ""

Write-Host "Step 2: Get API Key" -ForegroundColor Yellow
Write-Host "  > In Resend dashboard, go to 'API Keys'" -ForegroundColor White
Write-Host "  > Click 'Create API Key'" -ForegroundColor White
Write-Host "  > Name: smasher-production" -ForegroundColor White
Write-Host "  > Copy the key (starts with 're_')" -ForegroundColor White
Write-Host ""

$resendSetup = Read-Host "Have you created your Resend account and API key? (y/n)"

if ($resendSetup -eq "y") {
    Write-Host ""
    Write-Host "Great! Now enter your Resend credentials:" -ForegroundColor Green
    Write-Host ""
    
    $apiKey = Read-Host "Resend API Key (starts with re_)"
    
    Write-Host ""
    Write-Host "Choose sender email:" -ForegroundColor Yellow
    Write-Host "  1. Use Resend test domain (onboarding@resend.dev) - Quick, 100 emails/day" -ForegroundColor White
    Write-Host "  2. Use your own domain (requires DNS setup)" -ForegroundColor White
    $senderChoice = Read-Host "Choice (1 or 2)"
    
    if ($senderChoice -eq "1") {
        $fromEmail = "onboarding@resend.dev"
    } else {
        $fromEmail = Read-Host "Your verified email (e.g., noreply@yourdomain.com)"
    }
    
    Write-Host ""
    Write-Host "Updating server/.env..." -ForegroundColor Yellow
    
    Update-EnvFile "RESEND_API_KEY" $apiKey
    Update-EnvFile "RESEND_FROM" $fromEmail
    
    Write-Host "[OK] Resend credentials saved to server/.env" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[WARNING] Skipping Resend setup. Email verification will not work until configured." -ForegroundColor Yellow
    Write-Host "  Verification codes will be printed to server logs as a workaround." -ForegroundColor Yellow
    Write-Host ""
}

# ============================================
# SUMMARY
# ============================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuration saved to: server/.env" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start your server:" -ForegroundColor White
Write-Host "     cd server" -ForegroundColor Gray
Write-Host "     npm run start:dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Start your app:" -ForegroundColor White
Write-Host "     cd app-rn" -ForegroundColor Gray
Write-Host "     npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Test photo upload in the Gallery screen" -ForegroundColor White
Write-Host "  4. Test email verification during signup" -ForegroundColor White
Write-Host ""

Write-Host "For production deployment (Fly.io):" -ForegroundColor Yellow
Write-Host "  Run: ./deploy-with-secrets.ps1" -ForegroundColor Gray
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - Cloudflare R2: CLOUDFLARE_R2_SETUP.md" -ForegroundColor Gray
Write-Host "  - Resend Email: EMAIL_SETUP_GUIDE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "All done! Your services are configured." -ForegroundColor Green
Write-Host ""
