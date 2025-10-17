# Smasher Complete Startup Script
Write-Host "Starting Smasher..." -ForegroundColor Cyan

# Get IP (exclude APIPA addresses 169.254.x.x)
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    ($_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*") -and
    $_.PrefixOrigin -eq 'Dhcp' -and
    -not $_.IPAddress.StartsWith("169.254")
} | Select-Object -First 1).IPAddress

if (-not $ip) {
    Write-Host "ERROR: No valid IP found. Check your network connection." -ForegroundColor Red
    exit 1
}
Write-Host "IP: $ip" -ForegroundColor Green

# Update config
$apiFile = "app-rn/src/config/api.ts"
$content = Get-Content $apiFile -Raw
$pattern = "http://[\d\.]+:3001"
$replacement = "http://${ip}:3001"
$content = $content -replace $pattern, $replacement
Set-Content $apiFile $content
Write-Host "Config updated" -ForegroundColor Green

# Cleanup
Write-Host "Cleaning up..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3001,8081 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

# Start servers
Write-Host "Starting servers..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm run start:dev"
Start-Sleep -Seconds 5

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\app-rn'; npm start"
Start-Sleep -Seconds 8

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\app-rn'; npx react-native run-android"

Write-Host ""
Write-Host "Done! Server: http://${ip}:3001" -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
