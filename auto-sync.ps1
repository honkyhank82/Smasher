# Auto-sync changes to GitHub
# This script watches for file changes and automatically commits and pushes to GitHub
# Run this in the background: powershell -ExecutionPolicy Bypass -NoProfile -File auto-sync.ps1

param(
    [string]$RepoPath = "d:\Dev\smasher",
    [int]$CheckIntervalSeconds = 5
)

Set-Location $RepoPath

Write-Host "Auto-sync watcher started at $(Get-Date)" -ForegroundColor Green
Write-Host "Monitoring: $RepoPath" -ForegroundColor Green
Write-Host "Check interval: $CheckIntervalSeconds seconds" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

$lastCommitTime = Get-Date

while ($true) {
    try {
        # Check git status
        $gitStatus = & git status --porcelain
        
        if ($gitStatus) {
            # There are uncommitted changes
            $currentTime = Get-Date
            
            # Stage all changes
            & git add -A
            
            # Create commit with timestamp
            $timestamp = $currentTime.ToString("yyyy-MM-dd HH:mm:ss")
            $commitMessage = "Auto-sync: $timestamp"
            
            # Commit changes
            & git commit -m $commitMessage
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Committed: $commitMessage" -ForegroundColor Cyan
                
                # Push to remote
                & git push origin master
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Pushed to GitHub" -ForegroundColor Green
                    Write-Host "GitHub Actions will now trigger workflows..." -ForegroundColor Magenta
                } else {
                    Write-Host "Error pushing to GitHub" -ForegroundColor Red
                }
            }
        }
        
        Start-Sleep -Seconds $CheckIntervalSeconds
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        Start-Sleep -Seconds $CheckIntervalSeconds
    }
}