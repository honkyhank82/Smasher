# SMASHER Icon Generator - PowerShell Script
# This script opens the HTML icon generator in your default browser

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           SMASHER APP - ICON GENERATOR                       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$htmlFile = Join-Path $PSScriptRoot "icon-generator.html"

if (Test-Path $htmlFile) {
    Write-Host "✓ Found icon-generator.html" -ForegroundColor Green
    Write-Host ""
    Write-Host "Opening icon generator in your browser..." -ForegroundColor Yellow
    Write-Host ""
    
    # Open in default browser
    Start-Process $htmlFile
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Click 'Download' under each icon in the browser" -ForegroundColor White
    Write-Host "2. Save the files to the assets/ folder:" -ForegroundColor White
    Write-Host "   - icon.png" -ForegroundColor Gray
    Write-Host "   - adaptive-icon.png" -ForegroundColor Gray
    Write-Host "   - favicon.png" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Rebuild your app:" -ForegroundColor White
    Write-Host "   npx expo prebuild --clean" -ForegroundColor Gray
    Write-Host "   npx expo run:ios    (or run:android)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✨ Icon generator opened successfully!" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host "❌ Error: icon-generator.html not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you're running this script from the app-rn directory." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
