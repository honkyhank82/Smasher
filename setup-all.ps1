#Requires -RunAsAdministrator

<#
.SYNOPSIS
Complete setup for SMASHER with all servers and failover
.DESCRIPTION
Sets up the mobile app, web app, and backend with failover on multiple servers
#>

$ErrorActionPreference = "Stop"
$gitRoot = "d:\Dev\smasher"
$appRnDir = "$gitRoot\app-rn"
$appWebDir = "$gitRoot\app-web"
$serverDir = "$gitRoot\server"

function Show-Header {
  param([string]$Title)
  Write-Host "`n========================================" -ForegroundColor Cyan
  Write-Host "  $Title" -ForegroundColor Magenta
  Write-Host "========================================`n" -ForegroundColor Cyan
}

function Setup-Backend {
  Show-Header "Setting up Backend (NestJS)"
  
  Set-Location $serverDir
  
  Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
  npm ci
  
  Write-Host "[INFO] Building backend..." -ForegroundColor Yellow
  npm run build
  
  Write-Host "`n[OK] Backend setup complete!" -ForegroundColor Green
  Write-Host "[NEXT] Configure .env file with database and API keys" -ForegroundColor Green
}

function Setup-MobileApp {
  Show-Header "Setting up Mobile App (React Native)"
  
  Set-Location $appRnDir
  
  Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
  npm ci
  
  Write-Host "`n[OK] Mobile app setup complete!" -ForegroundColor Green
  Write-Host "[NEXT] Run 'npm start' to launch dev server" -ForegroundColor Green
}

function Setup-WebApp {
  Show-Header "Setting up Web App (React)"
  
  Set-Location $appWebDir
  
  Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
  npm ci
  
  Write-Host "[INFO] Building web app..." -ForegroundColor Yellow
  npm run build
  
  Write-Host "`n[OK] Web app setup complete!" -ForegroundColor Green
  Write-Host "[NEXT] Deploy with 'vercel --prod'" -ForegroundColor Green
}

function Setup-Environment {
  Show-Header "Setting up Environment Variables"
  
  $envFile = "$serverDir\.env"
  
  if (Test-Path $envFile) {
    Write-Host "[WARN] .env file already exists" -ForegroundColor Yellow
    $overwrite = Read-Host "Overwrite? (y/n)"
    if ($overwrite -ne "y") {
      Write-Host "[INFO] Skipping .env creation" -ForegroundColor Yellow
      return
    }
  }
  
  Write-Host "[PROMPT] Please provide the following information:" -ForegroundColor Yellow
  
  $dbUrl = Read-Host "Database URL (postgresql://user:pass@host:5432/smasher)"
  $jwtSecret = Read-Host "JWT Secret (or press Enter to generate)" 
  if ([string]::IsNullOrEmpty($jwtSecret)) {
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
  }
  
  $resendKey = Read-Host "Resend API Key (re_xxxxx)"
  $fromEmail = Read-Host "From Email Address (noreply@smasher.app)"
  
  $r2AccountId = Read-Host "Cloudflare R2 Account ID"
  $r2AccessKey = Read-Host "R2 Access Key ID"
  $r2SecretKey = Read-Host "R2 Secret Access Key"
  
  $envContent = @"
# Database
DATABASE_URL=$dbUrl

# Authentication
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=7d

# Email (Resend)
RESEND_API_KEY=$resendKey
FROM_EMAIL=$fromEmail

# Cloudflare R2
R2_ACCOUNT_ID=$r2AccountId
R2_ACCESS_KEY_ID=$r2AccessKey
R2_SECRET_ACCESS_KEY=$r2SecretKey
R2_BUCKET_NAME=smasher-media
R2_PUBLIC_URL=https://r2.smasher.app

# App
PORT=3001
NODE_ENV=development
"@
  
  Set-Content -Path $envFile -Value $envContent
  Write-Host "[OK] .env file created at $envFile" -ForegroundColor Green
}

function Install-CLIs {
  Show-Header "Installing CLI Tools"
  
  $tools = @(
    @{ name = "Fly CLI"; cmd = "fly"; install = "npm install -g flyctl" },
    @{ name = "Railway CLI"; cmd = "railway"; install = "npm install -g @railway/cli" },
    @{ name = "Vercel CLI"; cmd = "vercel"; install = "npm install -g vercel" }
  )
  
  foreach ($tool in $tools) {
    if (Get-Command $tool.cmd -ErrorAction SilentlyContinue) {
      Write-Host "[OK] $($tool.name) already installed" -ForegroundColor Green
    } else {
      Write-Host "[INFO] Installing $($tool.name)..." -ForegroundColor Yellow
      Invoke-Expression $tool.install
    }
  }
  
  Write-Host "`n[OK] All CLI tools installed!" -ForegroundColor Green
}

function Show-Menu {
  Write-Host "`n========================================" -ForegroundColor Cyan
  Write-Host "  SMASHER Complete Setup" -ForegroundColor Magenta
  Write-Host "========================================`n" -ForegroundColor Cyan
  Write-Host "Select what to setup:" -ForegroundColor Green
  Write-Host "1. Install CLI tools (Fly, Railway, Vercel)"
  Write-Host "2. Setup environment variables"
  Write-Host "3. Setup backend only"
  Write-Host "4. Setup mobile app only"
  Write-Host "5. Setup web app only"
  Write-Host "6. Setup ALL (recommended)"
  Write-Host "7. View deployment guide"
  Write-Host "0. Exit`n"
}

# Main menu loop
while ($true) {
  Show-Menu
  $choice = Read-Host "Enter choice"
  
  switch ($choice) {
    "1" { Install-CLIs }
    "2" { Setup-Environment }
    "3" { Setup-Backend }
    "4" { Setup-MobileApp }
    "5" { Setup-WebApp }
    "6" {
      Show-Header "Complete Setup in Progress"
      Install-CLIs
      Setup-Environment
      Setup-Backend
      Setup-MobileApp
      Setup-WebApp
      
      Write-Host "`n========================================" -ForegroundColor Cyan
      Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
      Write-Host "========================================`n" -ForegroundColor Cyan
      Write-Host "Next steps:" -ForegroundColor Green
      Write-Host "1. Backend: npm run start:dev" -ForegroundColor White
      Write-Host "2. Mobile: npm start (then select android/ios)" -ForegroundColor White
      Write-Host "3. Web: npm run dev" -ForegroundColor White
      Write-Host "`nDeploy with:" -ForegroundColor Green
      Write-Host "   .\deploy-all-servers.ps1" -ForegroundColor White
    }
    "7" {
      Write-Host "[INFO] Opening deployment guide..." -ForegroundColor Yellow
      & "notepad" "$gitRoot\MULTI_SERVER_DEPLOYMENT.md"
    }
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