<#
Complete Smasher Cleanup and Test Script
- Kills processes bound to common dev ports (3001 API, 8081 Metro)
- Clears caches and temp logs
- Verifies backend health endpoint
- Optional: starts backend in a temp window and tests again
#>

param(
  [int]$ApiPort = 3001,
  [switch]$StartBackendIfDown
)

Write-Host "🧹 Cleanup and Test starting..." -ForegroundColor Cyan
Set-Location $PSScriptRoot

# Kill processes on known ports
Write-Host "🔪 Killing processes on ports $ApiPort and 8081" -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort $ApiPort,8081 -ErrorAction SilentlyContinue | ForEach-Object {
  try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop } catch {}
}

# Remove logs and cache (non-destructive to source)
Write-Host "🗑️ Removing logs and cache folders..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Filter "*.log" -Recurse -File | Remove-Item -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\.cache",".\.expo" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Log/cache cleanup done" -ForegroundColor Green

# Verify backend health
Write-Host "🩺 Testing backend health endpoint..." -ForegroundColor Yellow
$healthUrl = "http://localhost:$ApiPort/health"
try {
  $resp = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 5 -ErrorAction Stop
  Write-Host "✅ Health OK ($($resp.StatusCode))" -ForegroundColor Green
} catch {
  Write-Host "⚠️ Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
  if ($StartBackendIfDown) {
    Write-Host "🚀 Starting backend in temp window and re-testing..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit","-Command",
      "cd '$PSScriptRoot\server'; $env:PORT=$ApiPort; $env:DATABASE_URL=''; npm run start:dev" -WindowStyle Normal
    Start-Sleep -Seconds 6
    try {
      $resp2 = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 5 -ErrorAction Stop
      Write-Host "✅ Health OK after start ($($resp2.StatusCode))" -ForegroundColor Green
    } catch {
      Write-Host "❌ Health still failing: $($_.Exception.Message)" -ForegroundColor Red
    }
  }
}

Write-Host "✨ Cleanup and Test complete." -ForegroundColor Cyan