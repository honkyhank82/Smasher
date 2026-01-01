# PowerShell script for building APK
Write-Host "Starting APK build process..."

# Navigate to app-rn
Set-Location app-rn

Write-Host "Installing app dependencies..."
npm install

Write-Host "Environment check:"
node -v
npm -v

Write-Host "Building APK locally to bypass cloud limits..."
# Check if running on Windows - PowerShell detection
if ($env:OS -eq "Windows_NT") {
    Write-Host "WARNING: EAS local builds require macOS or Linux. Skipping APK build on Windows."
    Write-Host "To build APK on Windows, you need:"
    Write-Host "1. Android Studio with SDK and emulator"
    Write-Host "2. JDK (not just JRE) installed"
    Write-Host "3. Proper environment variables set"
    Write-Host "Creating placeholder build directory..."
    New-Item -ItemType Directory -Force -Path ../build
    "APK build skipped on Windows - requires macOS/Linux environment" | Out-File -FilePath ../build/build-info.txt
} else {
    # Run EAS build locally using npx to ensure CLI availability
    New-Item -ItemType Directory -Force -Path ../build
    npx eas-cli build --local --platform android --profile production-apk --non-interactive --output ../build/app.apk
}

Write-Host "Build completed."
if (Test-Path ../build/app.apk) {
    Get-ChildItem ../build/app.apk | Format-List
} else {
    Write-Host "APK file not found - build was skipped or failed"
    Get-ChildItem ../build/ | Format-List
}
