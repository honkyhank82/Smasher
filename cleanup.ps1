# Navigate to project root
Set-Location "d:\Dev\smasher"

Write-Host "🧹 Cleaning up project..." -ForegroundColor Green

# Remove node_modules (can be reinstalled with npm install)
Get-ChildItem -Path "." -Filter "node_modules" -Recurse -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Removed node_modules"

# Remove build artifacts
Get-ChildItem -Path "." -Filter "dist" -Recurse -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path "." -Filter "build" -Recurse -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Removed dist and build folders"

# Remove log files
Get-ChildItem -Path "." -Filter "*.log" -Recurse -File | Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host "✅ Removed log files"

# Remove cache folders
Remove-Item -Path ".\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\.expo" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Removed cache folders"

# Remove APK/AAB build files
Get-ChildItem -Path "." -Filter "*.apk" -Recurse -File | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path "." -Filter "*.aab" -Recurse -File | Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host "✅ Removed APK/AAB files"

# Remove lock files (optional - comment out if you want to keep)
# Remove-Item -Path ".\package-lock.json" -Force -ErrorAction SilentlyContinue
# Get-ChildItem -Path "." -Filter "package-lock.json" -Recurse -File | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "`n✨ Cleanup complete!" -ForegroundColor Green
Write-Host "Project size reduced. Run 'npm install' to reinstall dependencies if needed."
