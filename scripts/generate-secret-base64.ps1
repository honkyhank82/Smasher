<#
.SYNOPSIS
  Encode a file to base64 for use as a GitHub Actions secret.

USAGE
  .\generate-secret-base64.ps1 -InputPath .\smasher-release.keystore
  # The script will also search for filenames containing "smasher" or "masher" if the path isn't found.

OUTPUT
  Prints a single-line base64 string to STDOUT and copies it to the clipboard (when available).
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$InputPath,
  [string]$OutFile
)

$resolvedPath = $null
if (Test-Path $InputPath) {
  $resolvedPath = (Resolve-Path $InputPath).Path
} else {
  Write-Output "Input path '$InputPath' not found. Searching for likely keystore files..."
  $candidates = Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'masher|smasher' -and $_.Name -match 'keystore|key' }
  if ($candidates.Count -eq 0) {
    Write-Error "No candidate keystore files found. Please provide a valid -InputPath."
    exit 1
  } elseif ($candidates.Count -gt 1) {
    Write-Output "Multiple candidate files found. Please re-run the script with the exact path."
    $candidates | ForEach-Object { Write-Output $_.FullName }
    exit 2
  } else {
    $resolvedPath = $candidates[0].FullName
    Write-Output "Using discovered file: $resolvedPath"
  }
}

$bytes = [IO.File]::ReadAllBytes($resolvedPath)
$base64 = [Convert]::ToBase64String($bytes)

if ($PSVersionTable.PSVersion.Major -ge 5 -and (Get-Command Set-Clipboard -ErrorAction SilentlyContinue)) {
  try {
    $base64 | Set-Clipboard
    Write-Output "Base64 string copied to clipboard."
  } catch {
    Write-Output "Unable to copy to clipboard."
  }
}

if ($OutFile) {
  $base64 | Out-File -FilePath $OutFile -Encoding ascii
  Write-Output "Wrote base64 to $OutFile"
} else {
  Write-Output $base64
}
