# Setup Expo EAS Build for iOS on Windows
# This allows building iOS apps without a Mac

Write-Host "================================"
Write-Host "  Expo EAS Build Setup"
Write-Host "================================"
Write-Host ""

Write-Host "This will set up Expo EAS Build to create iOS apps from Windows." -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host "Install from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Install EAS CLI globally
Write-Host "Installing EAS CLI..." -ForegroundColor Yellow
npm install -g eas-cli

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] EAS CLI installed" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to install EAS CLI" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check if already logged in
Write-Host "Checking Expo account..." -ForegroundColor Yellow
$whoami = eas whoami 2>&1

if ($whoami -match "Not logged in") {
    Write-Host "You need to log in to Expo." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "  1. I have an Expo account" -ForegroundColor White
    Write-Host "  2. I need to create an account" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Choose (1 or 2)"
    
    if ($choice -eq "2") {
        Write-Host ""
        Write-Host "Creating Expo account..." -ForegroundColor Yellow
        Write-Host "Opening browser to: https://expo.dev/signup" -ForegroundColor Cyan
        Start-Process "https://expo.dev/signup"
        Write-Host ""
        Write-Host "After creating your account, come back here and press Enter" -ForegroundColor Yellow
        Read-Host "Press Enter when ready"
    }
    
    Write-Host ""
    Write-Host "Logging in to Expo..." -ForegroundColor Yellow
    eas login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Login failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] Logged in as: $whoami" -ForegroundColor Green
}
Write-Host ""

# Navigate to app directory
Set-Location app-rn

# Check if app.json exists
if (-not (Test-Path "app.json")) {
    Write-Host "[ERROR] app.json not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the smasher directory" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

# Initialize EAS
Write-Host "Initializing EAS Build..." -ForegroundColor Yellow
Write-Host ""

# Check if already initialized
if (Test-Path "eas.json") {
    Write-Host "EAS already initialized" -ForegroundColor Cyan
    $reinit = Read-Host "Reinitialize? (y/n)"
    if ($reinit -ne "y") {
        Write-Host "Skipping initialization" -ForegroundColor Yellow
        Set-Location ..
        exit 0
    }
}

eas init

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] EAS initialization failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "[OK] EAS initialized" -ForegroundColor Green
Write-Host ""

Set-Location ..

Write-Host "================================"
Write-Host "  Setup Complete!"
Write-Host "================================"
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure EAS Build:" -ForegroundColor White
Write-Host "   We need to create eas.json configuration" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Build iOS app:" -ForegroundColor White
Write-Host "   eas build --platform ios --profile development" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Download and test" -ForegroundColor White
Write-Host ""

Write-Host "Ready to configure EAS Build!" -ForegroundColor Green
Write-Host ""
