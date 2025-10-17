# Setup Resend Email Service for Smasher App
# Run this script after getting your Resend API key

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SMASHER - Email Service Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if flyctl is available
if (-not (Get-Command flyctl -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: flyctl is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Get your Resend API Key" -ForegroundColor Yellow
Write-Host "1. Go to https://resend.com" -ForegroundColor White
Write-Host "2. Sign up (free)" -ForegroundColor White
Write-Host "3. Go to API Keys section" -ForegroundColor White
Write-Host "4. Create new API key" -ForegroundColor White
Write-Host "5. Copy the key (starts with 're_')" -ForegroundColor White
Write-Host ""

$apiKey = Read-Host "Enter your Resend API Key (or press Enter to skip)"

if ($apiKey) {
    Write-Host ""
    Write-Host "Step 2: Choose sender email" -ForegroundColor Yellow
    Write-Host "1. Test domain: onboarding@resend.dev (recommended for now)" -ForegroundColor White
    Write-Host "2. Your domain: noreply@yourdomain.com (requires domain verification)" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter 1 or 2"
    
    if ($choice -eq "1") {
        $fromEmail = "onboarding@resend.dev"
    } else {
        $fromEmail = Read-Host "Enter your sender email (e.g., noreply@smasherapp.com)"
    }
    
    Write-Host ""
    Write-Host "Setting secrets on Fly.io..." -ForegroundColor Yellow
    
    # Set the API key
    flyctl secrets set RESEND_API_KEY=$apiKey --app smasher-api
    
    # Set the from email
    flyctl secrets set RESEND_FROM=$fromEmail --app smasher-api
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Email Service Configured!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "API Key: Set ✓" -ForegroundColor Green
    Write-Host "From Email: $fromEmail ✓" -ForegroundColor Green
    Write-Host ""
    Write-Host "The app will restart automatically." -ForegroundColor Cyan
    Write-Host "Verification emails will now be sent!" -ForegroundColor Cyan
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "Skipped. To set up later, run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For now, get verification codes from server logs:" -ForegroundColor Cyan
    Write-Host "  flyctl logs --app smasher-api | Select-String 'VERIFICATION CODE'" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
