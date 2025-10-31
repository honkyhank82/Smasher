# Sync version across all files (app-rn only, since backend is separate)
# Usage: .\sync-versions.ps1 -version "2.0.2" -versionCode 22

param(
    [string]$version,
    [int]$versionCode
)

if (-not $version -or -not $versionCode) {
    Write-Host "Usage: .\sync-versions.ps1 -version '2.0.2' -versionCode 22" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This will update:"
    Write-Host "  - app-rn/package.json (version)"
    Write-Host "  - app-rn/app.json (version and versionCode)"
    exit 1
}

$files = @(
    @{ path = "app-rn\package.json"; type = "json"; field = "version" },
    @{ path = "app-rn\app.json"; type = "json"; field = "version" }
)

Write-Host "Syncing version to $version (versionCode: $versionCode)..." -ForegroundColor Cyan

# Update app-rn/package.json
$packagePath = "app-rn\package.json"
$packageJson = Get-Content $packagePath -Raw | ConvertFrom-Json
$packageJson.version = $version
$packageJson | ConvertTo-Json -Depth 10 | Set-Content $packagePath
Write-Host "✓ Updated $packagePath" -ForegroundColor Green

# Update app-rn/app.json
$appPath = "app-rn\app.json"
$appJson = Get-Content $appPath -Raw | ConvertFrom-Json
$appJson.expo.version = $version
$appJson.expo.android.versionCode = $versionCode
$appJson | ConvertTo-Json -Depth 10 | Set-Content $appPath
Write-Host "✓ Updated $appPath" -ForegroundColor Green

Write-Host ""
Write-Host "Version sync complete!" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1. Review the changes"
Write-Host "  2. git add ."
Write-Host "  3. git commit -m 'bump: version to $version'"
Write-Host "  4. git push"