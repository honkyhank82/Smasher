# PowerShell Deployment script for Smasher Backend

Write-Host "[DEPLOY] Deploying Smasher Backend to Fly.io" -ForegroundColor Cyan

# Get the git root directory
$gitRoot = git rev-parse --show-toplevel 2>$null
if (-not $gitRoot) {
    Write-Host "[ERROR] Not in a git repository" -ForegroundColor Red
    exit 1
}

$serverDir = Join-Path $gitRoot "server"

# Check if fly CLI is installed
try {
    fly version | Out-Null
} catch {
    Write-Host "[ERROR] Fly CLI not found. Install from: https://fly.io/docs/hands-on/install-flyctl/" -ForegroundColor Red
    exit 1
}

# Check if logged in
try {
    fly auth whoami | Out-Null
} catch {
    Write-Host "[ERROR] Not logged in to Fly.io. Run: fly auth login" -ForegroundColor Red
    exit 1
}

Write-Host "[BUILD] Building application..." -ForegroundColor Yellow
Set-Location $serverDir

$packageJsonPath = Join-Path $serverDir "package.json"
if (Test-Path $packageJsonPath) {
    try {
        $package = Get-Content $packageJsonPath | ConvertFrom-Json
        $version = $package.version
        Write-Host "[VERSION] Current server version: $version" -ForegroundColor Yellow
        Write-Host "[VERSION] Remember to bump version in server/package.json before deploying." -ForegroundColor Yellow
    } catch {
        Write-Host "[WARN] Could not read server/package.json to determine version." -ForegroundColor Yellow
    }
}

npm install
npm run build

Write-Host "[DB] Database migrations..." -ForegroundColor Yellow
Write-Host "[WARN] Make sure DATABASE_URL is set in Fly.io secrets" -ForegroundColor Yellow
Write-Host "       Run: fly secrets set DATABASE_URL='postgresql://...'" -ForegroundColor Gray

Write-Host "[DEPLOY] Deploying to Fly.io..." -ForegroundColor Yellow
Write-Host "[INFO] Git root: $gitRoot" -ForegroundColor Yellow
Write-Host "[INFO] Server dir: $serverDir" -ForegroundColor Yellow

# Deploy from server directory using server/fly.toml
Set-Location $serverDir
Write-Host "[DEPLOY] Running: fly deploy -a smasher-api" -ForegroundColor Gray
fly deploy -a smasher-api

Write-Host "[SCALE] Ensuring at least 2 machines are running..." -ForegroundColor Yellow
try {
    fly scale count 2 -a smasher-api | Out-Null
} catch {
    Write-Host "[WARN] Failed to scale machines automatically. You may need to run 'fly scale count 2 -a smasher-api' manually." -ForegroundColor Yellow
}

Write-Host "[HEALTH] Checking /health/live endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest "https://smasher-api.fly.dev/health/live" -UseBasicParsing -TimeoutSec 10
    Write-Host "[HEALTH] Status: $($healthResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "[HEALTH] Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "[OK] Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] Check status: fly status -a smasher-api" -ForegroundColor Cyan
Write-Host "[INFO] View logs: fly logs -a smasher-api" -ForegroundColor Cyan
Write-Host "[INFO] Open app: fly open -a smasher-api" -ForegroundColor Cyan
Write-Host "[INFO] SSH into app: fly ssh console -a smasher-api" -ForegroundColor Cyan
