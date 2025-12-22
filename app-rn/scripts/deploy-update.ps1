# Deploy CodePush Update Script
# Usage: .\scripts\deploy-update.ps1 -message "Your update message" [-mandatory] [-production]

param(
    [Parameter(Mandatory=$true)]
    [string]$message,
    
    [switch]$mandatory = $false,
    [switch]$production = $false,
    [string]$appName = "YOUR_USERNAME/Smasher-Android"
)

Write-Host "=== CodePush Update Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Validate message
if ([string]::IsNullOrWhiteSpace($message)) {
    Write-Host "Error: Update message is required" -ForegroundColor Red
    Write-Host "Usage: .\scripts\deploy-update.ps1 -message 'Your update message'" -ForegroundColor Yellow
    exit 1
}

# Determine deployment target
$deployment = if ($production) { "Production" } else { "Staging" }
$mandatoryFlag = if ($mandatory) { "-m" } else { "" }

Write-Host "Deployment Target: $deployment" -ForegroundColor Yellow
Write-Host "Message: $message" -ForegroundColor Yellow
Write-Host "Mandatory: $(if ($mandatory) { 'Yes' } else { 'No' })" -ForegroundColor Yellow
Write-Host ""

# Confirm deployment
if ($production) {
    Write-Host "WARNING: You are about to deploy to PRODUCTION!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure you want to continue? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "Deployment cancelled" -ForegroundColor Yellow
        exit 0
    }
}

# Deploy update
Write-Host "Deploying update..." -ForegroundColor Green
Write-Host ""

try {
    $command = "appcenter codepush release-react -a $appName -d $deployment --description `"$message`" $mandatoryFlag"
    Write-Host "Running: $command" -ForegroundColor Gray
    Invoke-Expression $command
    
    Write-Host ""
    Write-Host "Update deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Users will receive the update:" -ForegroundColor Cyan
    if ($mandatory) {
        Write-Host "- Immediately on next app launch (mandatory update)" -ForegroundColor Yellow
    } else {
        Write-Host "- After 5 minutes in background (silent update)" -ForegroundColor Yellow
    }
    Write-Host ""
    
    # Show deployment history
    Write-Host "Recent deployments:" -ForegroundColor Cyan
    appcenter codepush deployment history -a $appName $deployment
    
} catch {
    Write-Host "Error deploying update: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
