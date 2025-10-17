#!/usr/bin/env pwsh
# Helper script to set up Google Play credentials

Write-Host "=== Google Play Credentials Setup ===" -ForegroundColor Cyan
Write-Host ""

$targetPath = "c:\DevProjects\smasher\app-rn\google-play-service-account.json"
$downloadsPath = "$env:USERPROFILE\Downloads"

# Check if file already exists
if (Test-Path $targetPath) {
    Write-Host "Found existing credentials file." -ForegroundColor Green
    Write-Host "Location: $targetPath" -ForegroundColor Gray
    Write-Host ""
    
    $overwrite = Read-Host "Do you want to replace it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Keeping existing file. Exiting." -ForegroundColor Yellow
        exit 0
    }
}

# Look for JSON files in Downloads
Write-Host "Looking for service account JSON files in Downloads..." -ForegroundColor Yellow
$jsonFiles = Get-ChildItem -Path $downloadsPath -Filter "*.json" | 
    Where-Object { $_.Name -match "^\w+-[a-f0-9]+\.json$" } |
    Sort-Object LastWriteTime -Descending

if ($jsonFiles.Count -eq 0) {
    Write-Host ""
    Write-Host "No service account JSON files found in Downloads." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Go to https://play.google.com/console" -ForegroundColor White
    Write-Host "2. Setup -> API access -> Create service account" -ForegroundColor White
    Write-Host "3. Download the JSON key file" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "See GOOGLE_PLAY_SETUP.md for detailed instructions." -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "Found $($jsonFiles.Count) potential service account file(s):" -ForegroundColor Green
Write-Host ""

for ($i = 0; $i -lt $jsonFiles.Count; $i++) {
    $file = $jsonFiles[$i]
    Write-Host "[$($i + 1)] $($file.Name)" -ForegroundColor White
    Write-Host "    Modified: $($file.LastWriteTime)" -ForegroundColor Gray
}

Write-Host ""
$selection = Read-Host "Select file number (1-$($jsonFiles.Count)) or press Enter for most recent"

if ([string]::IsNullOrWhiteSpace($selection)) {
    $selectedFile = $jsonFiles[0]
} else {
    $index = [int]$selection - 1
    if ($index -lt 0 -or $index -ge $jsonFiles.Count) {
        Write-Host "Invalid selection. Exiting." -ForegroundColor Red
        exit 1
    }
    $selectedFile = $jsonFiles[$index]
}

Write-Host ""
Write-Host "Selected: $($selectedFile.Name)" -ForegroundColor Cyan

# Copy the file
try {
    Copy-Item -Path $selectedFile.FullName -Destination $targetPath -Force
    Write-Host ""
    Write-Host "Success! Credentials file copied to:" -ForegroundColor Green
    Write-Host "  $targetPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Verify permissions in Google Play Console" -ForegroundColor White
    Write-Host "2. Build your app: eas build --profile production --platform android" -ForegroundColor White
    Write-Host "3. Submit to Play Store: eas submit --platform android --latest" -ForegroundColor White
    Write-Host ""
    Write-Host "See GOOGLE_PLAY_SETUP.md for complete instructions." -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "Error copying file: $_" -ForegroundColor Red
    exit 1
}
