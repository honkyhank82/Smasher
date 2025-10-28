<#
Smasher Development Startup Script
Remote-ready: updates mobile API to current host IP, starts backend on 0.0.0.0:3001 (SQLite), Metro bundler, and optional Android run.
#>

param(
  [switch]$SkipAndroid,
  [int]$ApiPort = 3001,
  [switch]$Remote
)

Write-Host "🚀 Starting Smasher Development Environment..." -ForegroundColor Cyan
Write-Host ""

if (-not $Remote) {
  Write-Host "📡 Detecting IP address..." -ForegroundColor Yellow
  $ip = (
    Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*" } |
    Where-Object { -not $_.IPAddress.StartsWith("169.254") } |
    Select-Object -First 1
  ).IPAddress

  if (-not $ip) {
    Write-Host "❌ Could not detect IP address. Please check your network connection." -ForegroundColor Red
    exit 1
  }

  Write-Host "✅ Detected IP: $ip" -ForegroundColor Green
  Write-Host ""
}

# Update mobile app API configuration
if (-not $Remote) {
  Write-Host "📝 Updating mobile app configuration..." -ForegroundColor Yellow
  $apiFile = Join-Path $PSScriptRoot "app-rn/src/config/api.ts"
  if (Test-Path $apiFile) {
    $content = Get-Content $apiFile -Raw
    $content = $content -replace "http://\d+\.\d+\.\d+\.\d+:$ApiPort", "http://${ip}:$ApiPort"
    Set-Content $apiFile $content
    Write-Host "✅ Updated API_BASE_URL to http://${ip}:$ApiPort" -ForegroundColor Green
  } else {
    Write-Host "⚠️  Could not find $apiFile" -ForegroundColor Yellow
  }
  Write-Host ""
} else {
  Write-Host "🌐 Remote mode: skipping local IP rewrite for mobile API" -ForegroundColor Yellow
}

# Start the backend server (force SQLite by clearing DATABASE_URL)
if (-not $Remote) {
  Write-Host "🖥️  Starting backend server..." -ForegroundColor Yellow
  Start-Process powershell -ArgumentList "-NoExit","-Command",
    "cd '$PSScriptRoot/server'; $env:PORT=$ApiPort; $env:DATABASE_URL=''; npm run start:dev" -WindowStyle Normal
  Write-Host "✅ Backend server starting in new window..." -ForegroundColor Green
  Write-Host ""
} else {
  Write-Host "🖥️  Remote mode: skipping local backend. Using https://smasher-api.fly.dev" -ForegroundColor Cyan
}

# Wait a moment for server to start
Write-Host "⏳ Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host ""

# Start Metro bundler
Write-Host "📱 Starting Metro bundler..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit","-Command",
  "cd '$PSScriptRoot/app-rn'; npm start" -WindowStyle Normal
Write-Host "✅ Metro bundler starting in new window..." -ForegroundColor Green
Write-Host ""

if (-not $SkipAndroid) {
  Write-Host "📲 Launching Android app..." -ForegroundColor Yellow
  Start-Process powershell -ArgumentList "-NoExit","-Command",
    "cd '$PSScriptRoot/app-rn'; npx react-native run-android" -WindowStyle Normal
}

Write-Host "🎉 Development environment is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Wait for Metro bundler to finish loading"
Write-Host "   2. Make sure your Android device is connected"
Write-Host "   3. Use: cd app-rn && npx react-native run-android (if not auto launched)"
Write-Host ""
if (-not $Remote) { Write-Host "🌐 Server URL: http://${ip}:$ApiPort" -ForegroundColor Cyan } else { Write-Host "🌐 Remote API: https://smasher-api.fly.dev" -ForegroundColor Cyan }
Write-Host "📱 Metro bundler: http://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window (servers will keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
