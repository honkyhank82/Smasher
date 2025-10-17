# Script to customize legal documents with your information

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$true)]
    [string]$CompanyName,
    
    [Parameter(Mandatory=$false)]
    [string]$Address = ""
)

Write-Host "🔧 Customizing legal documents..." -ForegroundColor Cyan

# Read files
$privacyContent = Get-Content "PRIVACY_POLICY.md" -Raw
$termsContent = Get-Content "TERMS_OF_SERVICE.md" -Raw

# Replace placeholders
$privacyContent = $privacyContent -replace 'privacy@smasherapp\.com', $Email
$privacyContent = $privacyContent -replace 'support@smasherapp\.com', $Email
$privacyContent = $privacyContent -replace 'dpo@smasherapp\.com', $Email
$privacyContent = $privacyContent -replace 'legal@smasherapp\.com', $Email
$privacyContent = $privacyContent -replace '\[Your Company Address\]', $Address

$termsContent = $termsContent -replace 'legal@smasherapp\.com', $Email
$termsContent = $termsContent -replace 'support@smasherapp\.com', $Email
$termsContent = $termsContent -replace '\[Your Company Address\]', $Address

# Save updated files
$privacyContent | Out-File "PRIVACY_POLICY.md" -Encoding UTF8
$termsContent | Out-File "TERMS_OF_SERVICE.md" -Encoding UTF8

Write-Host "✅ Legal documents customized!" -ForegroundColor Green
Write-Host ""
Write-Host "Updated with:" -ForegroundColor Yellow
Write-Host "  Email: $Email" -ForegroundColor Gray
Write-Host "  Company: $CompanyName" -ForegroundColor Gray
if ($Address) {
    Write-Host "  Address: $Address" -ForegroundColor Gray
}
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review the documents" -ForegroundColor Gray
Write-Host "  2. Host them online (GitHub Pages, etc.)" -ForegroundColor Gray
Write-Host "  3. Add URLs to Play Store listing" -ForegroundColor Gray
