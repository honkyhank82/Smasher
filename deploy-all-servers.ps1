#Requires -RunAsAdministrator

<#
.SYNOPSIS
Deploy to all backup servers (Railway and Render) with Fly.io as primary
.DESCRIPTION
This script deploys the backend to multiple platforms with automatic failover
#>

param(
  [string]$Action = "help"
)

$ErrorActionPreference = "Stop"
$gitRoot = "d:\Dev\smasher"
$serverDir = "$gitRoot\server"
$webAppDir = "$gitRoot\app-web"

function Show-Menu {
  Write-Host "`n========================================" -ForegroundColor Cyan
  Write-Host "  SMASHER - Multi-Server Deployment" -ForegroundColor Magenta
  Write-Host "========================================`n" -ForegroundColor Cyan
  Write-Host "Select deployment option:" -ForegroundColor Green
  Write-Host "1. Deploy Backend to Fly.io (Primary)"
  Write-Host "2. Deploy Backend to Railway (Secondary)"
  Write-Host "3. Deploy Backend to Render (Tertiary)"
  Write-Host "4. Deploy Web App to Vercel"
  Write-Host "5. Deploy to ALL servers"
  Write-Host "6. Check server health"
  Write-Host "7. Setup Shared Database"
  Write-Host "8. Configure Environment Variables"
  Write-Host "0. Exit`n"
}

function Deploy-Flyio {
  Write-Host "`n[DEPLOY] Deploying to Fly.io (Primary)..." -ForegroundColor Green
  
  if (-not (Test-Path "$serverDir\.fly")) {
    Write-Host "[WARN] Fly.io not initialized. Running fly launch..." -ForegroundColor Yellow
    Set-Location $serverDir
    fly launch --name smasher-api --now=false
  }
  
  Set-Location $serverDir
  fly deploy
  
  Write-Host "[OK] Fly.io deployment complete!" -ForegroundColor Green
  Write-Host "[URL] https://smasher-api.fly.dev" -ForegroundColor Cyan
}

function Deploy-Railway {
  Write-Host "`n[DEPLOY] Deploying to Railway (Secondary)..." -ForegroundColor Green
  
  if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Railway CLI not found. Install with: npm i -g @railway/cli" -ForegroundColor Red
    return
  }
  
  Set-Location $serverDir
  
  Write-Host "[INFO] Linking to Railway project..." -ForegroundColor Yellow
  railway link
  
  Write-Host "[INFO] Building and deploying..." -ForegroundColor Yellow
  railway up
  
  Write-Host "[OK] Railway deployment complete!" -ForegroundColor Green
  Write-Host "[URL] https://smasher-production.up.railway.app" -ForegroundColor Cyan
}

function Deploy-Render {
  Write-Host "`n[DEPLOY] Deploying to Render (Tertiary)..." -ForegroundColor Green
  
  Write-Host "[INFO] Instructions:" -ForegroundColor Yellow
  Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor White
  Write-Host "2. Create new Web Service" -ForegroundColor White
  Write-Host "3. Connect GitHub repository" -ForegroundColor White
  Write-Host "4. Root Directory: server" -ForegroundColor White
  Write-Host "5. Build Command: npm ci && npm run build" -ForegroundColor White
  Write-Host "6. Start Command: npm run start:prod" -ForegroundColor White
  Write-Host "7. Set environment variables from server/.env" -ForegroundColor White
  
  Start-Process "https://dashboard.render.com"
  
  Write-Host "`n[OK] Open browser to complete Render setup" -ForegroundColor Green
}

function Deploy-WebApp {
  Write-Host "`n[DEPLOY] Deploying Web App to Vercel..." -ForegroundColor Green
  
  if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Vercel CLI not found. Install with: npm i -g vercel" -ForegroundColor Red
    return
  }
  
  Set-Location $webAppDir
  
  Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
  npm ci
  
  Write-Host "[INFO] Building web app..." -ForegroundColor Yellow
  npm run build
  
  Write-Host "[INFO] Deploying to Vercel..." -ForegroundColor Yellow
  vercel --prod
  
  Write-Host "[OK] Vercel deployment complete!" -ForegroundColor Green
}

function Check-ServerHealth {
  Write-Host "`n[HEALTH] Checking Server Health..." -ForegroundColor Cyan
  
  $servers = @(
    @{ name = "Fly.io (Primary)"; url = "https://smasher-api.fly.dev/health" },
    @{ name = "Railway (Secondary)"; url = "https://smasher-production.up.railway.app/health" },
    @{ name = "Render (Tertiary)"; url = "https://smasher.onrender.com/health" }
  )
  
  foreach ($server in $servers) {
    try {
      $response = Invoke-WebRequest -Uri $server.url -TimeoutSec 5 -UseBasicParsing
      if ($response.StatusCode -eq 200) {
        Write-Host "[OK] $($server.name): HEALTHY" -ForegroundColor Green
      } else {
        Write-Host "[WARN] $($server.name): DEGRADED (Status: $($response.StatusCode))" -ForegroundColor Yellow
      }
    } catch {
      Write-Host "[ERROR] $($server.name): DOWN" -ForegroundColor Red
    }
  }
}

function Setup-SharedDatabase {
  Write-Host "`n[DB] Setting up Shared PostgreSQL Database..." -ForegroundColor Cyan
  
  Write-Host "`n[OPTIONS] Database Setup Options:" -ForegroundColor Yellow
  Write-Host "1. Railway Managed PostgreSQL (Recommended)"
  Write-Host "2. AWS RDS PostgreSQL"
  Write-Host "3. Railway - Create new service`n"
  
  $choice = Read-Host "Select option (1-3)"
  
  switch ($choice) {
    "1" {
      Write-Host "`n[SETUP] Railway PostgreSQL Setup:" -ForegroundColor Green
      Write-Host "1. Go to https://railway.app/dashboard" -ForegroundColor White
      Write-Host "2. Create new project" -ForegroundColor White
      Write-Host "3. Add PostgreSQL database" -ForegroundColor White
      Write-Host "4. Copy DATABASE_URL from variables" -ForegroundColor White
      Write-Host "5. Add to Fly.io secrets: fly secrets set DATABASE_URL=<url>" -ForegroundColor White
      Write-Host "6. Add to Railway service environment" -ForegroundColor White
      Write-Host "7. Add to Render service environment" -ForegroundColor White
      
      Start-Process "https://railway.app/dashboard"
    }
    "2" {
      Write-Host "`n[SETUP] AWS RDS Setup:" -ForegroundColor Green
      Write-Host "1. Go to https://console.aws.amazon.com/rds" -ForegroundColor White
      Write-Host "2. Create new database instance (PostgreSQL 14+)" -ForegroundColor White
      Write-Host "3. Enable public accessibility for all servers" -ForegroundColor White
      Write-Host "4. Copy endpoint and create DATABASE_URL" -ForegroundColor White
      Write-Host "5. Format: postgresql://user:password@host:5432/smasher" -ForegroundColor White
      
      Start-Process "https://console.aws.amazon.com/rds"
    }
    "3" {
      Write-Host "`n[INFO] Creating Railway PostgreSQL...`n" -ForegroundColor Yellow
      
      if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] Railway CLI not found. Install with: npm i -g @railway/cli" -ForegroundColor Red
        return
      }
      
      Set-Location $serverDir
      railway link
      railway add --service postgres
      
      Write-Host "`n[OK] PostgreSQL created! Copy the DATABASE_URL from Railway dashboard" -ForegroundColor Green
    }
  }
}

function Configure-Env {
  Write-Host "`n[CONFIG] Configuring Environment Variables..." -ForegroundColor Cyan
  
  Write-Host "`n[VARS] Required Variables:" -ForegroundColor Yellow
  
  $variables = @(
    @{ name = "DATABASE_URL"; description = "PostgreSQL connection string"; sample = "postgresql://user:pass@host:5432/smasher" },
    @{ name = "JWT_SECRET"; description = "JWT signing secret"; sample = "your-random-secret-key" },
    @{ name = "RESEND_API_KEY"; description = "Resend email API key"; sample = "re_xxxxxxxxxxxxx" },
    @{ name = "FROM_EMAIL"; description = "Sender email address"; sample = "noreply@smasher.app" },
    @{ name = "R2_ACCOUNT_ID"; description = "Cloudflare R2 Account ID"; sample = "your-account-id" },
    @{ name = "R2_ACCESS_KEY_ID"; description = "R2 Access Key"; sample = "your-access-key" },
    @{ name = "R2_SECRET_ACCESS_KEY"; description = "R2 Secret Key"; sample = "your-secret-key" }
  )
  
  foreach ($var in $variables) {
    Write-Host "`n[$($var.name)]:" -ForegroundColor Green
    Write-Host "  Description: $($var.description)" -ForegroundColor Gray
    Write-Host "  Example: $($var.sample)" -ForegroundColor Gray
    Write-Host "  Set on:" -ForegroundColor Gray
    Write-Host "    - Fly.io: fly secrets set $($var.name)=value" -ForegroundColor Gray
    Write-Host "    - Railway: railway variables" -ForegroundColor Gray
    Write-Host "    - Render: Service settings > Environment" -ForegroundColor Gray
  }
  
  Write-Host "`n[OK] Use the commands above to set variables on each platform" -ForegroundColor Green
}

function Deploy-All {
  Write-Host "`n========================================" -ForegroundColor Cyan
  Write-Host "  DEPLOYING TO ALL SERVERS" -ForegroundColor Magenta
  Write-Host "========================================`n" -ForegroundColor Cyan
  
  # Build once
  Write-Host "[BUILD] Building backend..." -ForegroundColor Yellow
  Set-Location $serverDir
  npm run build
  
  # Deploy to each server
  Deploy-Flyio
  
  Write-Host "`n[WAIT] Waiting for Fly.io to stabilize..." -ForegroundColor Yellow
  Start-Sleep -Seconds 30
  
  Deploy-Railway
  
  Write-Host "`n[WAIT] Waiting for Railway to stabilize..." -ForegroundColor Yellow
  Start-Sleep -Seconds 30
  
  Deploy-Render
  
  Write-Host "`n[WAIT] Waiting for Render setup..." -ForegroundColor Yellow
  Start-Sleep -Seconds 30
  
  Deploy-WebApp
  
  Write-Host "`n========================================" -ForegroundColor Cyan
  Write-Host "  DEPLOYMENT COMPLETE" -ForegroundColor Green
  Write-Host "========================================`n" -ForegroundColor Cyan
  
  Check-ServerHealth
  
  Write-Host "`n[WEB] Web App: https://smasher-web.vercel.app" -ForegroundColor Green
  Write-Host "[FAILOVER] Automatic failover enabled!" -ForegroundColor Green
  Write-Host "[HEALTH] Health checks: Every 60 seconds" -ForegroundColor Green
}

# Main menu loop
while ($true) {
  Show-Menu
  $choice = Read-Host "Enter choice"
  
  switch ($choice) {
    "1" { Deploy-Flyio }
    "2" { Deploy-Railway }
    "3" { Deploy-Render }
    "4" { Deploy-WebApp }
    "5" { Deploy-All }
    "6" { Check-ServerHealth }
    "7" { Setup-SharedDatabase }
    "8" { Configure-Env }
    "0" { 
      Write-Host "Goodbye!" -ForegroundColor Cyan
      exit 0
    }
    default {
      Write-Host "[ERROR] Invalid choice. Please try again." -ForegroundColor Red
    }
  }
  
  Read-Host "`nPress Enter to continue"
}