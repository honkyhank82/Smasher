# Smasher - External Services Setup Script
# Simple version without special characters

Write-Host "================================"
Write-Host "  SMASHER - Services Setup"
Write-Host "================================"
Write-Host ""

# Check if server/.env exists
$envPath = "server\.env"
$envExamplePath = "server\.env.example"

if (-not (Test-Path $envPath)) {
    Write-Host "Creating server/.env from template..."
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Write-Host "[OK] Created server/.env"
    } else {
        Write-Host "[ERROR] server/.env.example not found!"
        exit 1
    }
}

Write-Host ""
Write-Host "This script will help you configure:"
Write-Host "  1. Cloudflare R2 (media storage)"
Write-Host "  2. Resend (email service)"
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

# CLOUDFLARE R2 SETUP
Write-Host "================================"
Write-Host "  CLOUDFLARE R2 SETUP"
Write-Host "================================"
Write-Host ""

Write-Host "Step 1: Create Cloudflare Account"
Write-Host "  Go to: https://dash.cloudflare.com/sign-up"
Write-Host "  Sign up and verify your email"
Write-Host ""

Write-Host "Step 2: Create R2 Bucket"
Write-Host "  Go to: https://dash.cloudflare.com"
Write-Host "  Click R2 in the sidebar"
Write-Host "  Click Create bucket"
Write-Host "  Name: smasher-media"
Write-Host "  Location: Automatic"
Write-Host ""

Write-Host "Step 3: Configure CORS"
Write-Host "  Click on your bucket, then Settings tab"
Write-Host "  Scroll to CORS Policy, click Add CORS policy"
Write-Host "  Paste this JSON:"
Write-Host ""
Write-Host '['
Write-Host '  {'
Write-Host '    "AllowedOrigins": ["*"],'
Write-Host '    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],'
Write-Host '    "AllowedHeaders": ["*"],'
Write-Host '    "ExposeHeaders": ["ETag"],'
Write-Host '    "MaxAgeSeconds": 3600'
Write-Host '  }'
Write-Host ']'
Write-Host ""

Write-Host "Step 4: Create API Token"
Write-Host "  Click Manage R2 API Tokens (top right)"
Write-Host "  Click Create API Token"
Write-Host "  Name: smasher-app-token"
Write-Host "  Permissions: Object Read and Write"
Write-Host "  Apply to: smasher-media bucket only"
Write-Host "  Click Create API Token"
Write-Host ""

$r2Setup = Read-Host "Have you completed the R2 setup? (y/n)"

if ($r2Setup -eq "y") {
    Write-Host ""
    Write-Host "Great! Now enter your R2 credentials:"
    Write-Host ""
    
    $accountId = Read-Host "Account ID"
    $accessKeyId = Read-Host "Access Key ID"
    $secretAccessKey = Read-Host "Secret Access Key"
    
    # Calculate endpoint
    $endpoint = "https://$accountId.r2.cloudflarestorage.com"
    
    Write-Host ""
    Write-Host "Updating server/.env..."
    
    Update-EnvFile "S3_ENDPOINT" $endpoint
    Update-EnvFile "S3_ACCESS_KEY_ID" $accessKeyId
    Update-EnvFile "S3_SECRET_ACCESS_KEY" $secretAccessKey
    Update-EnvFile "S3_BUCKET" "smasher-media"
    Update-EnvFile "S3_REGION" "auto"
    Update-EnvFile "S3_FORCE_PATH_STYLE" "true"
    
    Write-Host "[OK] R2 credentials saved to server/.env"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[WARNING] Skipping R2 setup. Photo uploads will not work until configured."
    Write-Host "  Run this script again when ready."
    Write-Host ""
}

# RESEND EMAIL SETUP
Write-Host "================================"
Write-Host "  RESEND EMAIL SETUP"
Write-Host "================================"
Write-Host ""

Write-Host "Step 1: Create Resend Account"
Write-Host "  Go to: https://resend.com"
Write-Host "  Click Sign Up (free!)"
Write-Host "  Verify your email"
Write-Host ""

Write-Host "Step 2: Get API Key"
Write-Host "  In Resend dashboard, go to API Keys"
Write-Host "  Click Create API Key"
Write-Host "  Name: smasher-production"
Write-Host "  Copy the key (starts with re_)"
Write-Host ""

$resendSetup = Read-Host "Have you created your Resend account and API key? (y/n)"

if ($resendSetup -eq "y") {
    Write-Host ""
    Write-Host "Great! Now enter your Resend credentials:"
    Write-Host ""
    
    $apiKey = Read-Host "Resend API Key (starts with re_)"
    
    Write-Host ""
    Write-Host "Choose sender email:"
    Write-Host "  1. Use Resend test domain (onboarding@resend.dev) - Quick, 100 emails/day"
    Write-Host "  2. Use your own domain (requires DNS setup)"
    $senderChoice = Read-Host "Choice (1 or 2)"
    
    if ($senderChoice -eq "1") {
        $fromEmail = "onboarding@resend.dev"
    } else {
        $fromEmail = Read-Host "Your verified email (e.g., noreply@yourdomain.com)"
    }
    
    Write-Host ""
    Write-Host "Updating server/.env..."
    
    Update-EnvFile "RESEND_API_KEY" $apiKey
    Update-EnvFile "RESEND_FROM" $fromEmail
    
    Write-Host "[OK] Resend credentials saved to server/.env"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[WARNING] Skipping Resend setup. Email verification will not work until configured."
    Write-Host "  Verification codes will be printed to server logs as a workaround."
    Write-Host ""
}

# SUMMARY
Write-Host "================================"
Write-Host "  SETUP COMPLETE!"
Write-Host "================================"
Write-Host ""

Write-Host "Configuration saved to: server/.env"
Write-Host ""

Write-Host "Next steps:"
Write-Host "  1. Start your server:"
Write-Host "     cd server"
Write-Host "     npm run start:dev"
Write-Host ""
Write-Host "  2. Start your app:"
Write-Host "     cd app-rn"
Write-Host "     npm start"
Write-Host ""
Write-Host "  3. Test photo upload in the Gallery screen"
Write-Host "  4. Test email verification during signup"
Write-Host ""

Write-Host "For production deployment (Fly.io):"
Write-Host "  Run: .\deploy-with-secrets.ps1"
Write-Host ""

Write-Host "Documentation:"
Write-Host "  - Cloudflare R2: CLOUDFLARE_R2_SETUP.md"
Write-Host "  - Resend Email: EMAIL_SETUP_GUIDE.md"
Write-Host ""

Write-Host "All done! Your services are configured."
Write-Host ""
