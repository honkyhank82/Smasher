# Setup Release Signing for Google Play
# This script helps you generate a signing key and configure gradle

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SMASHER App - Release Signing Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if keystore already exists
$keystorePath = "android\app\smasher-release-key.keystore"
if (Test-Path $keystorePath) {
    Write-Host "⚠️  Keystore already exists at: $keystorePath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to create a new one? (yes/no)"
    if ($overwrite -ne "yes") {
        Write-Host "Exiting without changes." -ForegroundColor Yellow
        exit
    }
}

Write-Host "Step 1: Generate Release Keystore" -ForegroundColor Green
Write-Host "You will be prompted for:" -ForegroundColor White
Write-Host "  - Keystore password (remember this!)" -ForegroundColor White
Write-Host "  - Key password (can be same as keystore password)" -ForegroundColor White
Write-Host "  - Your name, organization, etc." -ForegroundColor White
Write-Host ""

# Generate keystore
$keytoolCmd = "keytool -genkeypair -v -storetype PKCS12 -keystore android\app\smasher-release-key.keystore -alias smasher-key-alias -keyalg RSA -keysize 2048 -validity 10000"

Write-Host "Running: $keytoolCmd" -ForegroundColor Gray
Write-Host ""

Invoke-Expression $keytoolCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate keystore" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Keystore generated successfully!" -ForegroundColor Green
Write-Host ""

# Prompt for passwords to add to gradle.properties
Write-Host "Step 2: Configure gradle.properties" -ForegroundColor Green
Write-Host ""

$keystorePassword = Read-Host "Enter your keystore password" -AsSecureString
$keystorePasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keystorePassword))

$keyPassword = Read-Host "Enter your key password" -AsSecureString
$keyPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassword))

# Add to gradle.properties
$gradlePropsPath = "android\gradle.properties"
$signingConfig = @"


# ============================================
# RELEASE SIGNING CONFIGURATION
# ============================================
SMASHER_UPLOAD_STORE_FILE=smasher-release-key.keystore
SMASHER_UPLOAD_STORE_PASSWORD=$keystorePasswordPlain
SMASHER_UPLOAD_KEY_ALIAS=smasher-key-alias
SMASHER_UPLOAD_KEY_PASSWORD=$keyPasswordPlain
"@

Add-Content -Path $gradlePropsPath -Value $signingConfig

Write-Host "✅ gradle.properties updated!" -ForegroundColor Green
Write-Host ""

# Verify keystore
Write-Host "Step 3: Verify Keystore" -ForegroundColor Green
Write-Host ""
keytool -list -v -keystore android\app\smasher-release-key.keystore -alias smasher-key-alias

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor Yellow
Write-Host "1. Back up your keystore file: android\app\smasher-release-key.keystore" -ForegroundColor White
Write-Host "2. Save your passwords securely (password manager recommended)" -ForegroundColor White
Write-Host "3. NEVER commit gradle.properties with passwords to git" -ForegroundColor White
Write-Host "4. If you lose the keystore, you cannot update your app on Google Play" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Build release AAB: cd android && ./gradlew bundleRelease" -ForegroundColor White
Write-Host "2. Find AAB at: android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor White
Write-Host "3. Upload to Google Play Console" -ForegroundColor White
Write-Host ""
Write-Host "See GOOGLE_PLAY_PUBLISH.md for complete guide" -ForegroundColor Cyan
