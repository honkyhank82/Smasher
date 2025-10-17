# Smasher Development Startup Script
Write-Host "🚀 Starting Smasher Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Get current IP address
Write-Host "📡 Detecting IP address..." -ForegroundColor Yellow
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"} | Select-Object -First 1).IPAddress

if (-not $ip) {
    Write-Host "❌ Could not detect IP address. Please check your network connection." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Detected IP: $ip" -ForegroundColor Green
Write-Host ""

# Update mobile app API configuration
Write-Host "📝 Updating mobile app configuration..." -ForegroundColor Yellow
$apiFile = "app-rn/src/config/api.ts"
if (Test-Path $apiFile) {
    $content = Get-Content $apiFile -Raw
    $content = $content -replace "http://\d+\.\d+\.\d+\.\d+:3001", "http://${ip}:3001"
    Set-Content $apiFile $content
    Write-Host "✅ Updated API_BASE_URL to http://${ip}:3001" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not find $apiFile" -ForegroundColor Yellow
}
Write-Host ""

# Start the backend server
Write-Host "🖥️  Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/server'; npm run start:dev" -WindowStyle Normal
Write-Host "✅ Backend server starting in new window..." -ForegroundColor Green
Write-Host ""

# Wait a moment for server to start
Write-Host "⏳ Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host ""

# Start Metro bundler
Write-Host "📱 Starting Metro bundler..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/app-rn'; npm start" -WindowStyle Normal
Write-Host "✅ Metro bundler starting in new window..." -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Development environment is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Wait for Metro bundler to finish loading"
Write-Host "   2. Make sure your Android device is connected"
Write-Host "   3. Run: cd app-rn && npx react-native run-android"
Write-Host "   4. Or press 'a' in the Metro bundler window"
Write-Host ""
Write-Host "🌐 Server URL: http://${ip}:3001" -ForegroundColor Cyan
Write-Host "📱 Metro bundler: http://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window (servers will keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
