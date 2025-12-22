#!/usr/bin/env pwsh
# Quick reference for Play Console setup

Write-Host ""
Write-Host "=== Google Play Console Setup - Quick Start ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Your app is in PRE-PRODUCTION mode. Complete these steps:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. STORE LISTING" -ForegroundColor Green
Write-Host "   Go to: Dashboard -> Store Listing" -ForegroundColor Gray
Write-Host "   - App name: SMASHER" -ForegroundColor White
Write-Host "   - Short description (80 chars)" -ForegroundColor White
Write-Host "   - Full description" -ForegroundColor White
Write-Host "   - App icon (512x512): Use assets/icon.png" -ForegroundColor White
Write-Host "   - Feature graphic (1024x500): Use feature-graphic-1024x500.png" -ForegroundColor White
Write-Host "   - Screenshots (2-8 images)" -ForegroundColor White
Write-Host ""

Write-Host "2. CONTENT RATING" -ForegroundColor Green
Write-Host "   Go to: Dashboard -> Content Rating" -ForegroundColor Gray
Write-Host "   - Complete questionnaire" -ForegroundColor White
Write-Host "   - Mark YES for: User interaction, Location sharing" -ForegroundColor White
Write-Host "   - Expected rating: Mature 17+" -ForegroundColor White
Write-Host ""

Write-Host "3. APP ACCESS" -ForegroundColor Green
Write-Host "   Go to: Dashboard -> App Access" -ForegroundColor Gray
Write-Host "   - Select: All functionality is restricted" -ForegroundColor White
Write-Host "   - Provide test account credentials" -ForegroundColor White
Write-Host ""

Write-Host "4. DATA SAFETY" -ForegroundColor Green
Write-Host "   Go to: Dashboard -> Data Safety" -ForegroundColor Gray
Write-Host "   - Declare: Location, Personal info, Photos, Messages" -ForegroundColor White
Write-Host "   - Privacy policy URL REQUIRED" -ForegroundColor White
Write-Host ""

Write-Host "5. TARGET AUDIENCE" -ForegroundColor Green
Write-Host "   Go to: Dashboard -> Target Audience" -ForegroundColor Gray
Write-Host "   - Age group: 18+ (Adults only)" -ForegroundColor White
Write-Host ""

Write-Host "THEN BUILD AND UPLOAD:" -ForegroundColor Cyan
Write-Host "  eas build --profile production --platform android" -ForegroundColor White
Write-Host "  (Then manually upload to Internal Testing)" -ForegroundColor Gray
Write-Host ""

Write-Host "See PLAY_STORE_CHECKLIST.md for complete details" -ForegroundColor Yellow
Write-Host ""
