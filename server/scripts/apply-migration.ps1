# Apply Account Status Migration
# This script helps you apply the database migration for account management features

Write-Host "=== Account Status Migration ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the server directory
$currentDir = Get-Location
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the server directory" -ForegroundColor Red
    Write-Host "Usage: cd server && .\scripts\apply-migration.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "This migration adds account management features:" -ForegroundColor Yellow
Write-Host "  - Account deactivation" -ForegroundColor White
Write-Host "  - Account deletion with 30-day grace period" -ForegroundColor White
Write-Host ""

# Check environment
$env = Read-Host "Which environment? (dev/production)"

if ($env -eq "dev") {
    Write-Host ""
    Write-Host "=== Development Migration ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "For development, TypeORM will automatically create the new columns!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Just restart your server:" -ForegroundColor Yellow
    Write-Host "  npm run start:dev" -ForegroundColor White
    Write-Host ""
    Write-Host "TypeORM will detect the new fields in User entity and add them automatically." -ForegroundColor Gray
    Write-Host ""
    
    $restart = Read-Host "Would you like to restart the server now? (y/n)"
    if ($restart -eq "y") {
        Write-Host ""
        Write-Host "Starting server..." -ForegroundColor Green
        npm run start:dev
    }
    
} elseif ($env -eq "production") {
    Write-Host ""
    Write-Host "=== Production Migration ===" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For production, you have 3 options:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Use Neon Dashboard SQL Editor (Easiest)" -ForegroundColor White
    Write-Host "   - Go to https://console.neon.tech/" -ForegroundColor Gray
    Write-Host "   - Select your project" -ForegroundColor Gray
    Write-Host "   - Open SQL Editor" -ForegroundColor Gray
    Write-Host "   - Run the migration SQL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Use Fly.io Postgres Console" -ForegroundColor White
    Write-Host "   - Run: fly postgres connect -a smasher-db" -ForegroundColor Gray
    Write-Host "   - Paste the migration SQL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Temporarily enable TypeORM sync" -ForegroundColor White
    Write-Host "   - Edit app.module.ts: synchronize: true" -ForegroundColor Gray
    Write-Host "   - Deploy: fly deploy" -ForegroundColor Gray
    Write-Host "   - Revert: synchronize: false" -ForegroundColor Gray
    Write-Host "   - Deploy again: fly deploy" -ForegroundColor Gray
    Write-Host ""
    
    $choice = Read-Host "Which option? (1/2/3)"
    
    if ($choice -eq "1") {
        Write-Host ""
        Write-Host "Opening migration SQL file..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Copy this SQL and paste it in Neon Dashboard:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "----------------------------------------" -ForegroundColor Gray
        Get-Content "migrations/003_add_account_status.sql"
        Write-Host "----------------------------------------" -ForegroundColor Gray
        Write-Host ""
        Write-Host "After running the SQL in Neon Dashboard, press Enter to continue..." -ForegroundColor Yellow
        Read-Host
        
    } elseif ($choice -eq "2") {
        Write-Host ""
        Write-Host "Opening Fly.io Postgres console..." -ForegroundColor Green
        Write-Host ""
        Write-Host "After connecting, paste this SQL:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "----------------------------------------" -ForegroundColor Gray
        Get-Content "migrations/003_add_account_status.sql"
        Write-Host "----------------------------------------" -ForegroundColor Gray
        Write-Host ""
        $confirm = Read-Host "Ready to connect? (y/n)"
        if ($confirm -eq "y") {
            fly postgres connect -a smasher-db
        }
        
    } elseif ($choice -eq "3") {
        Write-Host ""
        Write-Host "WARNING: This will temporarily enable auto-sync in production!" -ForegroundColor Red
        Write-Host "Make sure you revert it after the migration." -ForegroundColor Yellow
        Write-Host ""
        $confirm = Read-Host "Are you sure? (yes/no)"
        if ($confirm -eq "yes") {
            Write-Host ""
            Write-Host "Steps to follow:" -ForegroundColor Cyan
            Write-Host "1. Edit src/app.module.ts" -ForegroundColor White
            Write-Host "2. Change: synchronize: true" -ForegroundColor White
            Write-Host "3. Run: fly deploy" -ForegroundColor White
            Write-Host "4. Wait for deployment to complete" -ForegroundColor White
            Write-Host "5. Revert: synchronize: process.env.NODE_ENV !== 'production'" -ForegroundColor White
            Write-Host "6. Run: fly deploy again" -ForegroundColor White
            Write-Host ""
        }
    }
    
    Write-Host ""
    Write-Host "After migration, deploy your updated backend:" -ForegroundColor Cyan
    Write-Host "  fly deploy" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "Invalid environment. Please choose 'dev' or 'production'" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Migration Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify the migration worked" -ForegroundColor White
Write-Host "2. Test the account management features in the app" -ForegroundColor White
Write-Host "3. Check Settings > Danger Zone" -ForegroundColor White
Write-Host ""
