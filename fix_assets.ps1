$ErrorActionPreference = "Stop"

$sourceDir = "C:\Users\honky\OneDrive\Pictures"
$rnAssets = "e:\Dev\smasher\app-rn\assets"
$webAssets = "e:\Dev\smasher\app-web"

Write-Host "Starting asset update..."

# Function to copy with logging
function Copy-Asset {
    param($Source, $Dest)
    Write-Host "Copying '$Source' to '$Dest'..."
    if (Test-Path $Source) {
        Copy-Item -Path $Source -Destination $Dest -Force
        Write-Host "Success."
    } else {
        Write-Error "Source file not found: $Source"
    }
}

# React Native Assets
Copy-Asset -Source "$sourceDir\smasher icon.png" -Dest "$rnAssets\icon.png"
Copy-Asset -Source "$sourceDir\smasher icon.png" -Dest "$rnAssets\adaptive-icon.png"
Copy-Asset -Source "$sourceDir\smasher logo.png" -Dest "$rnAssets\logo.png"
Copy-Asset -Source "$sourceDir\Smasher App Visual Identity Suite.png" -Dest "$rnAssets\splash.png"
Copy-Asset -Source "$sourceDir\Smasher App Visual Identity Suite.png" -Dest "$rnAssets\welcome-image.png"

# Web Assets
Copy-Asset -Source "$sourceDir\smasher icon.png" -Dest "$webAssets\icon.png"
Copy-Asset -Source "$sourceDir\smasher icon.png" -Dest "$webAssets\favicon.png"
Copy-Asset -Source "$sourceDir\smasher logo.png" -Dest "$webAssets\logo.png"

Write-Host "All assets updated successfully."
