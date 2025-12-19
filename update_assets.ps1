$sourceDir = "C:\Users\honky\OneDrive\Pictures"
$rnAssets = "e:\Dev\smasher\app-rn\assets"
$webAssets = "e:\Dev\smasher\app-web\public"

Write-Host "Copying assets from $sourceDir..."

Copy-Item "$sourceDir\smasher icon.png" "$rnAssets\icon.png" -Force -Verbose
Copy-Item "$sourceDir\smasher icon.png" "$rnAssets\adaptive-icon.png" -Force -Verbose
Copy-Item "$sourceDir\smasher logo.png" "$rnAssets\logo.png" -Force -Verbose
Copy-Item "$sourceDir\Smasher App Visual Identity Suite.png" "$rnAssets\splash.png" -Force -Verbose
Copy-Item "$sourceDir\Smasher App Visual Identity Suite.png" "$rnAssets\welcome-image.png" -Force -Verbose

Copy-Item "$sourceDir\smasher icon.png" "$webAssets\icon.png" -Force -Verbose
Copy-Item "$sourceDir\smasher icon.png" "$webAssets\favicon.png" -Force -Verbose
Copy-Item "$sourceDir\smasher logo.png" "$webAssets\logo.png" -Force -Verbose

Write-Host "Assets updated successfully"
