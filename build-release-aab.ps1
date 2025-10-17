# Build Release AAB for Google Play Store

Write-Host "================================"
Write-Host "  Build Release AAB"
Write-Host "================================"
Write-Host ""

# Check if keystore exists
$keystorePath = "app-rn\android\app\smasher-release-key.keystore"

if (-not (Test-Path $keystorePath)) {
    Write-Host "[INFO] Release keystore not found. We need to create it first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "IMPORTANT: You'll be asked for passwords. SAVE THEM SECURELY!" -ForegroundColor Red
    Write-Host "If you lose these passwords, you can NEVER update your app!" -ForegroundColor Red
    Write-Host ""
    
    $continue = Read-Host "Ready to create keystore? (y/n)"
    
    if ($continue -ne "y") {
        Write-Host "Cancelled. Run this script again when ready." -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Write-Host "Creating release keystore..." -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location app-rn\android\app
    
    keytool -genkeypair -v -storetype PKCS12 -keystore smasher-release-key.keystore -alias smasher-key-alias -keyalg RSA -keysize 2048 -validity 10000
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERROR] Failed to create keystore!" -ForegroundColor Red
        Set-Location ..\..\..
        exit 1
    }
    
    Set-Location ..\..\..
    
    Write-Host ""
    Write-Host "[OK] Keystore created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "SAVE THESE DETAILS SECURELY:" -ForegroundColor Red
    Write-Host "  Keystore file: app-rn\android\app\smasher-release-key.keystore" -ForegroundColor Yellow
    Write-Host "  Alias: smasher-key-alias" -ForegroundColor Yellow
    Write-Host "  Passwords: (the ones you just entered)" -ForegroundColor Yellow
    Write-Host ""
    
    # Prompt for passwords to configure gradle.properties
    Write-Host "Now we need to configure gradle.properties with your passwords." -ForegroundColor Yellow
    Write-Host ""
    
    $keystorePassword = Read-Host "Enter keystore password (the one you just created)" -AsSecureString
    $keystorePasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keystorePassword))
    
    $keyPassword = Read-Host "Enter key password (same as keystore password if you used the same)" -AsSecureString
    $keyPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassword))
    
    # Create gradle.properties
    $gradlePropsPath = "app-rn\android\gradle.properties"
    $gradlePropsContent = @"
SMASHER_UPLOAD_STORE_FILE=smasher-release-key.keystore
SMASHER_UPLOAD_STORE_PASSWORD=$keystorePasswordPlain
SMASHER_UPLOAD_KEY_ALIAS=smasher-key-alias
SMASHER_UPLOAD_KEY_PASSWORD=$keyPasswordPlain
"@
    
    $gradlePropsContent | Out-File -FilePath $gradlePropsPath -Encoding UTF8
    
    Write-Host "[OK] gradle.properties configured" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host "[OK] Keystore found: $keystorePath" -ForegroundColor Green
    Write-Host ""
    
    # Check if gradle.properties exists
    $gradlePropsPath = "app-rn\android\gradle.properties"
    
    if (-not (Test-Path $gradlePropsPath)) {
        Write-Host "[INFO] gradle.properties not found. Creating it now..." -ForegroundColor Yellow
        Write-Host ""
        
        $keystorePassword = Read-Host "Enter keystore password" -AsSecureString
        $keystorePasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keystorePassword))
        
        $keyPassword = Read-Host "Enter key password" -AsSecureString
        $keyPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassword))
        
        $gradlePropsContent = @"
SMASHER_UPLOAD_STORE_FILE=smasher-release-key.keystore
SMASHER_UPLOAD_STORE_PASSWORD=$keystorePasswordPlain
SMASHER_UPLOAD_KEY_ALIAS=smasher-key-alias
SMASHER_UPLOAD_KEY_PASSWORD=$keyPasswordPlain
"@
        
        $gradlePropsContent | Out-File -FilePath $gradlePropsPath -Encoding UTF8
        
        Write-Host "[OK] gradle.properties configured" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "[OK] gradle.properties found" -ForegroundColor Green
        Write-Host ""
    }
}

# Build release AAB
Write-Host "================================"
Write-Host "  Building Release AAB"
Write-Host "================================"
Write-Host ""

Write-Host "This will take 2-5 minutes..." -ForegroundColor Cyan
Write-Host ""

Set-Location app-rn\android

Write-Host "Step 1: Cleaning..." -ForegroundColor Yellow
.\gradlew clean

Write-Host ""
Write-Host "Step 2: Building release AAB..." -ForegroundColor Yellow
.\gradlew bundleRelease

$buildResult = $LASTEXITCODE

Set-Location ..\..

if ($buildResult -eq 0) {
    Write-Host ""
    Write-Host "[OK] Build successful!" -ForegroundColor Green
    Write-Host ""
    
    $aabPath = "app-rn\android\app\build\outputs\bundle\release\app-release.aab"
    
    if (Test-Path $aabPath) {
        $fullPath = Resolve-Path $aabPath
        $size = (Get-Item $aabPath).Length / 1MB
        
        Write-Host "AAB created:" -ForegroundColor Yellow
        Write-Host "  Location: $fullPath" -ForegroundColor Green
        Write-Host "  Size: $([math]::Round($size, 2)) MB" -ForegroundColor Green
        Write-Host ""
        
        # Copy to root for easy access
        Copy-Item $aabPath "SmasherApp-Release.aab" -Force
        Write-Host "Copied to: SmasherApp-Release.aab (in root directory)" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "================================"
        Write-Host "  Next Steps"
        Write-Host "================================"
        Write-Host ""
        Write-Host "1. Go to Google Play Console:" -ForegroundColor Yellow
        Write-Host "   https://play.google.com/console" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Create your app (if not done)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "3. Upload this AAB file:" -ForegroundColor Yellow
        Write-Host "   SmasherApp-Release.aab" -ForegroundColor Green
        Write-Host ""
        Write-Host "4. Complete store listing" -ForegroundColor Yellow
        Write-Host "   - App icon (512x512)" -ForegroundColor Gray
        Write-Host "   - Screenshots (2-8)" -ForegroundColor Gray
        Write-Host "   - Descriptions" -ForegroundColor Gray
        Write-Host "   - Privacy policy URL" -ForegroundColor Gray
        Write-Host ""
        Write-Host "5. Submit for review" -ForegroundColor Yellow
        Write-Host ""
        
    } else {
        Write-Host "[ERROR] AAB file not found at expected location!" -ForegroundColor Red
        Write-Host "Expected: $aabPath" -ForegroundColor Yellow
    }
    
} else {
    Write-Host ""
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above for details." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "Build complete!" -ForegroundColor Green
Write-Host ""
