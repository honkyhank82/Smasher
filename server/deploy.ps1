# PowerShell Deployment script for Smasher Backend

Write-Host "🚀 Deploying Smasher Backend to Fly.io" -ForegroundColor Cyan

# Check if fly CLI is installed
try {
    fly version | Out-Null
} catch {
    Write-Host "❌ Fly CLI not found. Install from: https://fly.io/docs/hands-on/install-flyctl/" -ForegroundColor Red
    exit 1
}

# Check if logged in
try {
    fly auth whoami | Out-Null
} catch {
    Write-Host "❌ Not logged in to Fly.io. Run: fly auth login" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Building application..." -ForegroundColor Yellow
npm install
npm run build

Write-Host "🔍 Database migrations..." -ForegroundColor Yellow
Write-Host "⚠️  Make sure DATABASE_URL is set in Fly.io secrets" -ForegroundColor Yellow
Write-Host "   Run: fly secrets set DATABASE_URL='postgresql://...'" -ForegroundColor Gray

Write-Host "🚢 Deploying to Fly.io..." -ForegroundColor Yellow
fly deploy

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Check status: fly status" -ForegroundColor Cyan
Write-Host "📝 View logs: fly logs" -ForegroundColor Cyan
Write-Host "🌐 Open app: fly open" -ForegroundColor Cyan
Write-Host "🔧 SSH into app: fly ssh console" -ForegroundColor Cyan
