# Start the auto-sync watcher in the background
# This script starts the auto-sync.ps1 process that watches for changes and auto-commits/pushes

$repoPath = "d:\Dev\smasher"
$scriptPath = "$repoPath\auto-sync.ps1"

Write-Host "Starting auto-sync watcher..." -ForegroundColor Green

# Start the process in a new PowerShell window that stays open
$processArgs = @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-NoProfile",
    "-File", $scriptPath
)

Start-Process -FilePath "powershell.exe" -ArgumentList $processArgs -WindowStyle Normal

Write-Host "Auto-sync watcher started in a new window" -ForegroundColor Green
Write-Host "The watcher will now automatically commit and push changes to GitHub" -ForegroundColor Cyan