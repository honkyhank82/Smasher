#!/usr/bin/env pwsh

<#
.SYNOPSIS
Enforce a repository/project working directory size cap by deleting old heavy artifacts until under cap.

.DESCRIPTION
Targets non-source, generated, and binary artifacts likely to bloat size:
- Android build outputs and C++ intermediates
- APK/AAB packages
- Heap dumps (*.hprof)
- Logs (*.log)
- Generic dist/build directories and common caches (.expo, .gradle, .cache)

Deletes oldest items first (by LastWriteTime) within target sets until total size is under the cap.
Supports DryRun and age thresholding.

.PARAMETER Root
Root path to enforce cap (default: repo root of this script).

.PARAMETER CapGB
Target size cap in gigabytes (default: 5).

.PARAMETER AgeDays
Only delete items older than this many days (default: 7).

.PARAMETER DryRun
Show actions but do not delete.

.PARAMETER Verbose
Print extra info per deletion.

.EXAMPLE
pwsh ./enforce-size-cap.ps1 -CapGB 5 -AgeDays 7 -DryRun

.NOTES
Intended for local/development environments. Use with care.
#>

param(
  [string]$Root = (Split-Path -Parent $PSCommandPath),
  [double]$CapGB = 5,
  [int]$AgeDays = 7,
  [switch]$DryRun,
  [switch]$Verbose
)

Set-Location $Root
Write-Host "📦 Enforcing size cap at $Root" -ForegroundColor Cyan

function Get-TotalBytes {
  return (Get-ChildItem -Force -Recurse -File | Measure-Object -Property Length -Sum).Sum
}

function Format-MB([long]$bytes) { return [math]::Round($bytes/1MB,2) }

function Should-Remove([System.IO.FileSystemInfo]$item) {
  if ($AgeDays -le 0) { return $true }
  $cutoff = (Get-Date).AddDays(-$AgeDays)
  return ($item.LastWriteTime -lt $cutoff)
}

# Build candidate sets
$candidates = @()

# Patterns by extension
$candidates += Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue -Filter '*.hprof'
$candidates += Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue -Filter '*.apk'
$candidates += Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue -Filter '*.aab'
$candidates += Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue -Filter '*.log'

# Directories (dist/build, caches, Android intermediates)
$heavyDirs = @(
  'app-rn/android/app/build',
  'app-rn/android/.cxx',
  '.\.expo',
  '.\.gradle',
  '.\.cache'
)
foreach ($d in $heavyDirs) {
  if (Test-Path $d) {
    $candidates += Get-ChildItem -Path $d -Recurse -File -ErrorAction SilentlyContinue
  }
}

# Filter by age if set
$candidates = $candidates | Where-Object { Should-Remove $_ }

# Sort oldest first, then largest
$candidates = $candidates | Sort-Object LastWriteTime, Length

$capBytes = [long]($CapGB * 1GB)
$startBytes = Get-TotalBytes
Write-Host ("Current size: {0} MB; Cap: {1} MB" -f (Format-MB $startBytes), (Format-MB $capBytes)) -ForegroundColor Cyan

if ($startBytes -le $capBytes) {
  Write-Host "✅ Under cap; no deletions needed." -ForegroundColor Green
  return
}

$deletedBytes = 0
foreach ($f in $candidates) {
  if (($startBytes - $deletedBytes) -le $capBytes) { break }
  if ($DryRun) {
    Write-Host ("DRY-RUN: Would delete {0} ({1} MB, {2})" -f $f.FullName, (Format-MB $f.Length), $f.LastWriteTime) -ForegroundColor Yellow
  } else {
    try {
      $size = $f.Length
      Remove-Item -Path $f.FullName -Force -ErrorAction Stop
      $deletedBytes += $size
      if ($Verbose) { Write-Host ("Deleted {0} ({1} MB)" -f $f.FullName, (Format-MB $size)) -ForegroundColor DarkGray }
    } catch {
      Write-Host ("⚠️ Failed to delete {0}: {1}" -f $f.FullName, $_.Exception.Message) -ForegroundColor Yellow
    }
  }
}

$endBytes = (Get-TotalBytes) - $deletedBytes
Write-Host ("Summary: Removed ~{0} MB; New size: ~{1} MB" -f (Format-MB $deletedBytes), (Format-MB $endBytes)) -ForegroundColor Green
if (($startBytes - $deletedBytes) -gt $capBytes) {
  Write-Host "⚠️ Still above cap. Consider expanding patterns or manual review." -ForegroundColor Yellow
}