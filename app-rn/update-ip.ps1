# Get current IP address
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"} | Select-Object -First 1).IPAddress

if ($ip) {
    Write-Host "Current IP: $ip"
    
    # Update api.ts
    $apiFile = "src/config/api.ts"
    $content = Get-Content $apiFile -Raw
    $content = $content -replace "http://\d+\.\d+\.\d+\.\d+:3001", "http://${ip}:3001"
    Set-Content $apiFile $content
    
    Write-Host "✅ Updated API_BASE_URL to http://${ip}:3001"
    Write-Host ""
    Write-Host "Now reload your React Native app (press 'r' in Metro bundler)"
} else {
    Write-Host "❌ Could not detect IP address"
}
