param(
  [string]$Root,
  [switch]$DryRun,
  [int]$AgeDays = 0,
  [switch]$IncludeNodeModules,
  [switch]$Verbose
)

if (-not $PSBoundParameters.ContainsKey('Root') -or [string]::IsNullOrWhiteSpace($Root)) {
  $Root = $PSScriptRoot
  if (-not $Root) {
    $Root = Split-Path -Parent $MyInvocation.MyCommand.Definition
  }
}

Set-Location $Root

Write-Host "🧹 Cleanup starting at $Root" -ForegroundColor Green

function Remove-Target {
  param([string]$Path, [switch]$IsDirectory)
  if (Test-Path $Path) {
    if ($DryRun) {
      Write-Host "DRY-RUN: Would remove $Path" -ForegroundColor Yellow
    } else {
      if ($IsDirectory) {
        Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
      } else {
        Remove-Item -Path $Path -Force -ErrorAction SilentlyContinue
      }
      if ($Verbose) { Write-Host "Removed $Path" -ForegroundColor DarkGray }
    }
  }
}

function Should-Remove {
  param([System.IO.FileSystemInfo]$Item)
  if ($AgeDays -le 0) { return $true }
  $cutoff = (Get-Date).AddDays(-$AgeDays)
  return ($Item.LastWriteTime -lt $cutoff)
}

# Build artifacts (dist/build)
Get-ChildItem -Path . -Recurse -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -in @('dist','build') } | ForEach-Object {
  if (Should-Remove $_) { Remove-Target -Path $_.FullName -IsDirectory }
}
Write-Host "✅ Build artifacts cleaned (dist/build)" -ForegroundColor Green

# Logs
Get-ChildItem -Path . -Recurse -File -Filter '*.log' -ErrorAction SilentlyContinue | Where-Object { Should-Remove $_ } | ForEach-Object { Remove-Target -Path $_.FullName }
Write-Host "✅ Log files cleaned (*.log)" -ForegroundColor Green

# Caches
@('.\.cache','.\.gradle','.\.expo','app-rn\\android\\app\\build','app-rn\\android\\.cxx') | ForEach-Object { Remove-Target -Path $_ -IsDirectory }
Write-Host "✅ Cache folders cleaned (.cache/.gradle/.expo, Android build/.cxx)" -ForegroundColor Green

# APK/AAB
Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -in @('.apk','.aab') -and (Should-Remove $_) } | ForEach-Object { Remove-Target -Path $_.FullName }
Write-Host "✅ APK/AAB files cleaned" -ForegroundColor Green

# HPROF (Android heap dumps)
Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue -Filter '*.hprof' | Where-Object { Should-Remove $_ } | ForEach-Object { Remove-Target -Path $_.FullName }
Write-Host "✅ HPROF dumps cleaned" -ForegroundColor Green

# Optional: node_modules
if ($IncludeNodeModules) {
  Get-ChildItem -Path . -Recurse -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'node_modules' -and (Should-Remove $_) } | ForEach-Object { Remove-Target -Path $_.FullName -IsDirectory }
  Write-Host "✅ node_modules removed (opt-in)" -ForegroundColor Green
} else {
  Write-Host "ℹ️ Skipped node_modules (use -IncludeNodeModules to remove)" -ForegroundColor Yellow
}

# Report summary
$totalBytes = (Get-ChildItem -Force -Recurse -File | Measure-Object -Property Length -Sum).Sum
$totalMB = [math]::Round($totalBytes/1MB,2)
Write-Host "✨ Cleanup complete. Current working directory size: ${totalMB} MB" -ForegroundColor Green
Write-Host "Run 'npm install' in app folders if node_modules were removed."
