<#
Smasher Complete Startup Script
Starts backend API, mobile Metro bundler, optional Android run, and web app.
Remote-ready: binds API on 0.0.0.0:3001 and updates mobile API base URL to current host IP.
#>

param(
  [switch]$SkipAndroid,
  [switch]$SkipWeb,
  [int]$ApiPort = 3001,
  [int]$WebPort = 3000,
  [switch]$Remote
)

Write-Host "Starting Smasher..." -ForegroundColor Cyan

# Enforce 5GB working directory cap before starting (separate from audit script)
$capScript = Join-Path $PSScriptRoot 'enforce-size-cap.ps1'
if (Test-Path $capScript) {
  Write-Host "Preflight: enforcing 5GB cap (AgeDays=7)..." -ForegroundColor Yellow
  & $capScript -CapGB 5 -AgeDays 7
} else {
  Write-Host "Preflight: enforce-size-cap.ps1 not found; skipping size enforcement" -ForegroundColor Yellow
}

if (-not $Remote) {
  # Detect IP (prefer active Wi-Fi/Ethernet, exclude APIPA 169.254.x.x)
  $ip = (
    Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
      ($_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*") -and
      -not $_.IPAddress.StartsWith("169.254")
    } |
    Sort-Object -Property SkipAsSource |
    Select-Object -First 1
  ).IPAddress

  if (-not $ip) {
    Write-Host "ERROR: No valid IP found. Check your network connection." -ForegroundColor Red
    exit 1
  }
  Write-Host "IP: $ip" -ForegroundColor Green
}

if (-not $Remote) {
  # Update mobile app API config
  $apiFile = Join-Path $PSScriptRoot "app-rn/src/config/api.ts"
  if (Test-Path $apiFile) {
    $content = Get-Content $apiFile -Raw
    $pattern = "http://\d+\.\d+\.\d+\.\d+:$ApiPort"
    $replacement = "http://${ip}:$ApiPort"
    $updated = $content -replace $pattern, $replacement
    if ($updated -ne $content) {
      Set-Content $apiFile $updated
      Write-Host "Config updated: API_BASE_URL -> http://${ip}:$ApiPort" -ForegroundColor Green
    } else {
      Write-Host "Config already points to http://${ip}:$ApiPort" -ForegroundColor Yellow
    }
  } else {
    Write-Host "Warning: Mobile API config not found at $apiFile" -ForegroundColor Yellow
  }
} else {
  Write-Host "Remote mode: skipping mobile API IP rewrite" -ForegroundColor Yellow
}

# Cleanup occupied ports
Write-Host "Cleaning up occupied ports (API:$ApiPort, Metro:8081)..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort $ApiPort,8081 -ErrorAction SilentlyContinue | ForEach-Object {
  try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop } catch {}
}

if (-not $Remote) {
  # Start backend server (force local SQLite by clearing DATABASE_URL)
  Write-Host "Starting backend server..." -ForegroundColor Yellow
  Start-Process powershell -ArgumentList "-NoExit","-Command",
    "cd '$PSScriptRoot\server'; $env:PORT=$ApiPort; $env:DATABASE_URL=''; npm run start:dev" -WindowStyle Normal
  Start-Sleep -Seconds 5
} else {
  Write-Host "Remote mode: skipping local backend start. Using https://smasher-api.fly.dev" -ForegroundColor Cyan
}

# Start Metro bundler for React Native
Write-Host "Starting Metro bundler..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit","-Command",
  "cd '$PSScriptRoot\app-rn'; npm start" -WindowStyle Normal
Start-Sleep -Seconds 5

if (-not $SkipAndroid) {
  Write-Host "Launching Android app (react-native run-android)..." -ForegroundColor Yellow
  Start-Process powershell -ArgumentList "-NoExit","-Command",
    "cd '$PSScriptRoot\app-rn'; npx react-native run-android" -WindowStyle Normal
}

if (-not $SkipWeb) {
  $viteCfg = Join-Path $PSScriptRoot "app-web/vite.config.ts"
  if (Test-Path $viteCfg) {
    Write-Host "Starting web app (Vite dev server on :$WebPort)..." -ForegroundColor Yellow
    if ($Remote) {
      Start-Process powershell -ArgumentList "-NoExit","-Command",
        "cd '$PSScriptRoot\app-web'; $env:PORT=$WebPort; $env:VITE_API_URL='https://smasher-api.fly.dev'; npm run dev" -WindowStyle Normal
    } else {
      Start-Process powershell -ArgumentList "-NoExit","-Command",
        "cd '$PSScriptRoot\app-web'; $env:PORT=$WebPort; npm run dev" -WindowStyle Normal
    }
  }
}

Write-Host ""; Write-Host "Done!" -ForegroundColor Green
if (-not $Remote) { Write-Host "Server: http://${ip}:$ApiPort" -ForegroundColor Cyan } else { Write-Host "Remote API: https://smasher-api.fly.dev" -ForegroundColor Cyan }
Write-Host "Metro bundler: http://localhost:8081" -ForegroundColor Cyan
if (-not $SkipWeb) { Write-Host "Web app: http://localhost:$WebPort" -ForegroundColor Cyan }
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
