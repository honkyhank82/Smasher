#!/usr/bin/env pwsh

<#
.SYNOPSIS
Fast repository audit script for Smasher: scans for conflicts, secrets, build/lint errors, and misconfigurations.

.DESCRIPTION
Optimized audit across the monorepo with parallel scanning:
- Detects git merge conflict markers
- Finds potential secrets committed in source
- Flags build logs/artifacts tracked by git
- Checks for synchronous file logging usage
- Verifies throttling decorators on verification endpoints
- Verifies ScheduleModule and cleanup cron
- Optionally runs lints/audits (skips heavy operations by default)

.PARAMETER SkipStaticChecks
Skips security & code pattern scanning (conflict markers, secrets, etc).

.PARAMETER SkipTests
Skips running test commands.

.PARAMETER SkipLint
Skips ESLint checks.

.PARAMETER SkipTypeCheck
Skips TypeScript compilation checks.

.PARAMETER SkipE2E
Skips E2E tests.

.PARAMETER SkipAudits
Skips npm security audit checks.

.PARAMETER SkipAndroid
Skips Android-specific checks.

.PARAMETER RunSmoke
Enables API smoke tests (disabled by default; they are slow).

.PARAMETER RunBuilds
Runs full builds (npm ci + build; disabled by default).

.PARAMETER Json
Outputs findings as JSON.

.PARAMETER Output
Output path for report (default: audit-report.txt).

.EXAMPLE
pwsh ./audit-repo.ps1
pwsh ./audit-repo.ps1 -RunBuilds -RunSmoke
pwsh ./audit-repo.ps1 -SkipTests -Json -Output report.json

.NOTES
Heuristic audit; does not replace full security reviews or integration tests.
#>

param(
  [switch]$SkipStaticChecks,
  [switch]$SkipTests,
  [switch]$SkipLint,
  [switch]$SkipTypeCheck,
  [switch]$SkipE2E,
  [switch]$SkipAudits,
  [switch]$SkipAndroid,
  [switch]$RunSmoke,
  [switch]$RunBuilds,
  [switch]$Json,
  [string]$Output = "audit-report.txt"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSCommandPath
$Findings = New-Object System.Collections.ArrayList
$sw = [System.Diagnostics.Stopwatch]::StartNew()

# ==================== HELPERS ====================

function Add-Finding {
  param([string]$Area, [string]$Severity, [string]$Message, [string]$Fix, [string]$Path, [hashtable]$Details)
  $null = $Findings.Add([ordered]@{ Area=$Area; Severity=$Severity; Message=$Message; Fix=$Fix; Path=$Path; Details=$Details })
}

function Invoke-CommandSafe {
  param([string]$Cmd, [string[]]$Args, [string]$Dir)
  $old = Get-Location
  try {
    if ($Dir) { Set-Location $Dir }
    $output = & $Cmd @Args 2>&1 | Out-String
    $code = $LASTEXITCODE
    return @{ ExitCode = $code; Output = $output }
  } catch {
    return @{ ExitCode = 1; Output = $_ | Out-String }
  } finally {
    Set-Location $old
  }
}

function Test-GitAvailable { return [bool](Get-Command git -ErrorAction SilentlyContinue) }
function Test-NodeAvailable { return [bool](Get-Command node -ErrorAction SilentlyContinue) }
function Test-NpmAvailable { return [bool](Get-Command npm -ErrorAction SilentlyContinue) }

function Test-GitTracked {
  param([string]$Path)
  if (-not (Test-GitAvailable)) { return $null }
  try {
    git ls-files --error-unmatch $Path *> $null
    return $true
  } catch { return $false }
}

function Test-PortOpen {
  param([int]$Port, [string]$Host = '127.0.0.1')
  if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
    try {
      $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop
      if ($conn) { return $true }
    } catch {}
  }
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $async = $client.BeginConnect($Host, $Port, $null, $null)
    $completed = $async.AsyncWaitHandle.WaitOne(200)
    $isOpen = $completed -and $client.Connected
    $client.Close()
    return [bool]$isOpen
  } catch { return $false }
}

function Wait-ForHttp {
  param([string]$Url, [int]$TimeoutSec = 30)
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      $resp = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
      if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) { return $true }
    } catch {}
    Start-Sleep -Seconds 1
  }
  return $false
}

# ==================== STATIC CHECKS ====================

if (-not $SkipStaticChecks) {
  Write-Host "[Audit] Building file cache..." -ForegroundColor Cyan
  
  # Cache source files (limit to src, config, and root app files)
  $exclusions = @('node_modules', '.git', '.next', 'dist', 'build', '.bundle', '.gradle', '.idea', 'android/build', 'android/.gradle')
  $codeFiles = @()
  
  # Scan specific directories
  foreach ($dir in @("$RepoRoot/server/src", "$RepoRoot/app-web/src", "$RepoRoot/app-rn/src", "$RepoRoot")) {
    if (Test-Path $dir) {
      $codeFiles += Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue | 
        Where-Object { $_.Extension -in @('.ts','.js','.tsx','.jsx','.json','.yml','.yaml','.md','.gradle','.ps1','.mjs','.cjs') -or $_.Name -in @('Dockerfile','fly.toml','render.yaml') } |
        Where-Object { $fullPath = $_.FullName; -not ($exclusions | Where-Object { $fullPath -match $_ }) }
    }
  }
  
  $codeFilePaths = @($codeFiles.FullName)
  Write-Host "[Audit] Found $($codeFilePaths.Count) source files (cached)" -ForegroundColor Green

  # 1) Merge conflict markers
  Write-Host "[Audit] Scanning for merge conflicts..." -ForegroundColor Cyan
  $mergeHits = @()
  foreach ($path in $codeFilePaths) {
    $matches = Select-String -Path $path -Pattern '<<<<<<<|=======|>>>>>>>' -AllMatches -ErrorAction SilentlyContinue
    if ($matches) {
      $mergeHits += [PSCustomObject]@{ File = $path; Matches = $matches }
    }
  }
  $mergeHits | ForEach-Object {
    Add-Finding -Area 'Git' -Severity 'High' -Message 'Merge conflict markers found' -Fix 'Resolve conflicts and remove markers' -Path $_.File -Details @{ Lines = ($_.Matches | ForEach-Object { $_.LineNumber }) }
  }

  # 2) Secrets
  Write-Host "[Audit] Scanning for secrets..." -ForegroundColor Cyan
  $secretPatterns = @(
    'BEGIN PRIVATE KEY', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'RESEND_API_KEY',
    'keystorePassword', 'keyPassword'
  )
  
  $secretHits = @()
  foreach ($path in $codeFilePaths) {
    foreach ($pat in $secretPatterns) {
      $hits = Select-String -Path $path -Pattern $pat -AllMatches -ErrorAction SilentlyContinue
      if ($hits) {
        foreach ($h in $hits) {
          $secretHits += [PSCustomObject]@{ Path = $path; Pattern = $pat; LineNumber = $h.LineNumber; Line = $h.Line.Trim() }
        }
      }
    }
  }
  $secretHits | ForEach-Object {
    Add-Finding -Area 'Secrets' -Severity 'High' -Message "Potential secret: $($_.Pattern)" -Fix 'Remove from repo; use env vars' -Path $_.Path -Details @{ Line = $_.LineNumber; Text = $_.Line }
  }

  # 3) Build logs in VCS (cached search)
  Write-Host "[Audit] Checking for build artifacts..." -ForegroundColor Cyan
  $logFiles = Get-ChildItem -Path "$RepoRoot/app-rn/android" -Filter "*.log" -File -ErrorAction SilentlyContinue
  foreach ($lf in $logFiles) {
    $tracked = Test-GitTracked -Path $lf.FullName
    if ($tracked -eq $true) {
      Add-Finding -Area 'VCS' -Severity 'Medium' -Message 'Build log tracked in git' -Fix 'Add to .gitignore; run: git rm --cached' -Path $lf.FullName -Details @{ SizeBytes = $lf.Length }
    }
  }

  # 4) Synchronous logging
  Write-Host "[Audit] Checking for sync logging..." -ForegroundColor Cyan
  $syncHits = Select-String -Path $codeFilePaths -Pattern 'appendFileSync' -AllMatches -ErrorAction SilentlyContinue
  $syncHits | ForEach-Object {
    Add-Finding -Area 'Logging' -Severity 'Medium' -Message 'Synchronous file logging (appendFileSync)' -Fix 'Use async fs.promises or Pino/Winston' -Path $_.Path -Details @{ Line = $_.LineNumber }
  }

  # 5) Verification endpoints throttling
  Write-Host "[Audit] Checking auth throttling..." -ForegroundColor Cyan
  $authController = Join-Path $RepoRoot 'server/src/auth/auth.controller.ts'
  if (Test-Path $authController) {
    $text = Get-Content $authController -Raw
    if ($text -notmatch '@Throttle\(') {
      Add-Finding -Area 'Auth' -Severity 'Medium' -Message 'Missing @Throttle decorators' -Fix 'Add @Throttle(3, 3600) to verification routes' -Path $authController -Details @{ }
    }
  }

  # 6) ScheduleModule and cron
  Write-Host "[Audit] Checking cron setup..." -ForegroundColor Cyan
  $appModule = Join-Path $RepoRoot 'server/src/app.module.ts'
  if (Test-Path $appModule -and (Get-Content $appModule -Raw) -notmatch 'ScheduleModule\.forRoot\(') {
    Add-Finding -Area 'Cron' -Severity 'Low' -Message 'ScheduleModule not registered' -Fix 'Import ScheduleModule.forRoot()' -Path $appModule -Details @{ }
  }

  $authService = Join-Path $RepoRoot 'server/src/auth/auth.service.ts'
  if (Test-Path $authService -and (Get-Content $authService -Raw) -notmatch '@Cron\(') {
    Add-Finding -Area 'Cron' -Severity 'Low' -Message 'No cleanup cron in AuthService' -Fix 'Add @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)' -Path $authService -Details @{ }
  }

  # 7) Verification code storage
  Write-Host "[Audit] Checking code storage..." -ForegroundColor Cyan
  $entityPath = Join-Path $RepoRoot 'server/src/auth/verification-code.entity.ts'
  if (Test-Path $entityPath) {
    $text = Get-Content $entityPath -Raw
    if (($text -match 'code!:\s*string') -and -not ($text -match 'codeHash')) {
      Add-Finding -Area 'Auth' -Severity 'High' -Message 'Codes stored in plaintext' -Fix 'Store only hashed codes (HMAC-SHA256)' -Path $entityPath -Details @{ }
    }
  }

  # 8) Android keystores
  if (-not $SkipAndroid) {
    Write-Host "[Audit] Checking Android keystores..." -ForegroundColor Cyan
    $keystores = Get-ChildItem -Path "$RepoRoot/app-rn/android" -Filter '*.keystore' -File -Recurse -ErrorAction SilentlyContinue
    foreach ($ks in $keystores) {
      if ((Test-GitTracked -Path $ks.FullName) -eq $true) {
        Add-Finding -Area 'Android' -Severity 'High' -Message 'Keystore tracked in git' -Fix 'Remove from VCS; rotate credentials' -Path $ks.FullName -Details @{ }
      }
    }
  }
}

# ==================== PARALLEL NPM OPERATIONS ====================

Write-Host "[Audit] Setting up parallel checks..." -ForegroundColor Cyan

$jobs = @()
$serverDir = Join-Path $RepoRoot 'server'
$webDir = Join-Path $RepoRoot 'app-web'
$rnDir = Join-Path $RepoRoot 'app-rn'

# Tests (optional, fast)
if (-not $SkipTests -and (Test-NpmAvailable)) {
  foreach ($proj in @(@{Dir=$serverDir; Name='Server'}, @{Dir=$webDir; Name='Web'}, @{Dir=$rnDir; Name='Mobile'})) {
    if (Test-Path "$($proj.Dir)/package.json") {
      $jobs += @{
        Type = 'test'; Dir = $proj.Dir; Name = $proj.Name
        ScriptBlock = { param($Dir, $Name); Invoke-CommandSafe -Cmd npm -Args @('test','--silent','--','--runInBand','--passWithNoTests') -Dir $Dir }
      }
    }
  }
}

# Lint checks (optional, fast)
if (-not $SkipLint -and (Test-NpmAvailable)) {
  foreach ($proj in @(@{Dir=$serverDir; Name='Server'}, @{Dir=$webDir; Name='Web'}, @{Dir=$rnDir; Name='Mobile'})) {
    if (Test-Path "$($proj.Dir)/package.json") {
      $jobs += @{
        Type = 'lint'; Dir = $proj.Dir; Name = $proj.Name
        ScriptBlock = { param($Dir, $Name); Invoke-CommandSafe -Cmd npm -Args @('run','lint','--silent') -Dir $Dir }
      }
    }
  }
}

# TypeScript checks (optional, medium speed)
if (-not $SkipTypeCheck -and (Test-NpmAvailable)) {
  foreach ($proj in @(@{Dir=$serverDir; Name='Server'}, @{Dir=$webDir; Name='Web'}, @{Dir=$rnDir; Name='Mobile'})) {
    if (Test-Path "$($proj.Dir)/package.json") {
      $jobs += @{
        Type = 'tsc'; Dir = $proj.Dir; Name = $proj.Name
        ScriptBlock = { param($Dir, $Name); Invoke-CommandSafe -Cmd npx -Args @('tsc','--noEmit') -Dir $Dir }
      }
    }
  }
}

# E2E tests (optional, slower)
if (-not $SkipE2E -and (Test-NpmAvailable) -and (Test-Path "$serverDir/package.json")) {
  $jobs += @{
    Type = 'e2e'; Dir = $serverDir; Name = 'Server'
    ScriptBlock = { param($Dir, $Name); Invoke-CommandSafe -Cmd npm -Args @('run','test:e2e','--silent') -Dir $Dir }
  }
}

# npm audit (optional, fast)
if (-not $SkipAudits -and (Test-NpmAvailable)) {
  foreach ($proj in @(@{Dir=$serverDir; Name='Server'}, @{Dir=$webDir; Name='Web'})) {
    if (Test-Path "$($proj.Dir)/package.json") {
      $jobs += @{
        Type = 'audit'; Dir = $proj.Dir; Name = $proj.Name
        ScriptBlock = { param($Dir, $Name); Invoke-CommandSafe -Cmd npm -Args @('audit','--json') -Dir $Dir }
      }
    }
  }
}

# Run jobs in parallel (limit concurrency)
Write-Host "[Audit] Running $($jobs.Count) checks in parallel..." -ForegroundColor Cyan
$results = @()
foreach ($job in $jobs) {
  $results += Start-Job -ScriptBlock {
    param($Job, $RepoRoot)
    $result = & $Job.ScriptBlock -Dir $Job.Dir -Name $Job.Name
    [PSCustomObject]@{ Type=$Job.Type; Name=$Job.Name; Dir=$Job.Dir; ExitCode=$result.ExitCode; Output=$result.Output }
  } -ArgumentList $job, $RepoRoot
}

# Collect results
$completed = @()
foreach ($result in $results) {
  $r = Receive-Job -Job $result -Wait
  $completed += $r
  Remove-Job -Job $result
}

# Process results
foreach ($r in $completed) {
  $severity = if ($r.ExitCode -eq 0) { 'Info' } else { 'High' }
  $areaMap = @{'test'='Test'; 'lint'='Lint'; 'tsc'='TypeScript'; 'e2e'='E2E'; 'audit'='Security'}
  $area = $areaMap[$r.Type]
  
  if ($r.ExitCode -eq 0) {
    Add-Finding -Area $area -Severity 'Info' -Message "$($r.Name) $($r.Type) passed" -Fix '' -Path $r.Dir -Details @{ }
  } else {
    Add-Finding -Area $area -Severity $severity -Message "$($r.Name) $($r.Type) failed" -Fix 'Review output and fix errors' -Path $r.Dir -Details @{ Output = $r.Output }
    
    # Parse audit results
    if ($r.Type -eq 'audit') {
      try {
        $audit = $r.Output | ConvertFrom-Json
        if ($audit.vulnerabilities) {
          foreach ($v in $audit.vulnerabilities.psobject.Properties) {
            Add-Finding -Area 'Security' -Severity $v.Name -Message "Vulnerability in $($r.Name)" -Fix 'Update dependency' -Path $r.Dir -Details @{ Count = $v.Value.Count }
          }
        }
      } catch { }
    }
  }
}

# ==================== OPTIONAL: BUILDS & SMOKE ====================

if ($RunBuilds -and (Test-NpmAvailable)) {
  Write-Host "[Audit] Running builds (this is slower)..." -ForegroundColor Cyan
  foreach ($proj in @(@{Dir=$serverDir; Name='Server'}, @{Dir=$webDir; Name='Web'})) {
    if (Test-Path "$($proj.Dir)/package.json") {
      Write-Host "  Building $($proj.Name)..." -ForegroundColor Yellow
      $res = Invoke-CommandSafe -Cmd npm -Args @('run','build','--silent') -Dir $proj.Dir
      if ($res.ExitCode -ne 0) {
        Add-Finding -Area 'Build' -Severity 'High' -Message "$($proj.Name) build failed" -Fix 'Fix errors' -Path $proj.Dir -Details @{ Output = $res.Output }
      } else {
        Add-Finding -Area 'Build' -Severity 'Info' -Message "$($proj.Name) build passed" -Fix '' -Path $proj.Dir -Details @{ }
      }
    }
  }
}

if ($RunSmoke) {
  Write-Host "[Audit] Running API smoke tests (this is slower)..." -ForegroundColor Cyan
  if (Test-Path "$serverDir/package.json") {
    if ([string]::IsNullOrWhiteSpace($env:DATABASE_URL)) {
      Add-Finding -Area 'Smoke' -Severity 'Info' -Message 'DATABASE_URL not set; skipping smoke tests' -Fix 'Set DATABASE_URL to enable' -Path $serverDir -Details @{ }
    } else {
      $smokePort = 3101
      if (Test-PortOpen -Port $smokePort) {
        Add-Finding -Area 'Smoke' -Severity 'Warning' -Message "Port $smokePort in use; skipping smoke tests" -Fix 'Free the port' -Path $serverDir -Details @{ }
      } else {
        $env:PORT = $smokePort
        $proc = Start-Process -FilePath 'node' -ArgumentList @('dist/src/main.js') -WorkingDirectory $serverDir -PassThru -WindowStyle Hidden -ErrorAction SilentlyContinue
        try {
          $ok = Wait-ForHttp -Url "http://localhost:$smokePort/health" -TimeoutSec 30
          if ($ok) {
            Add-Finding -Area 'Smoke' -Severity 'Info' -Message 'Health endpoint ok' -Fix '' -Path $serverDir -Details @{ }
          } else {
            Add-Finding -Area 'Smoke' -Severity 'High' -Message 'Health endpoint unreachable' -Fix 'Check server logs' -Path $serverDir -Details @{ }
          }
        } finally {
          if ($proc) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue }
        }
      }
    }
  }
}

# ==================== REPORT ====================

$sw.Stop()
Write-Host "`n[Audit] Complete in $($sw.ElapsedMilliseconds)ms" -ForegroundColor Cyan

$summary = @{
  Total = $Findings.Count
  High = ($Findings | Where-Object { $_.Severity -eq 'High' }).Count
  Medium = ($Findings | Where-Object { $_.Severity -eq 'Medium' }).Count
  Low = ($Findings | Where-Object { $_.Severity -eq 'Low' }).Count
  Info = ($Findings | Where-Object { $_.Severity -eq 'Info' }).Count
}

Write-Host "Findings: High=$($summary.High) Medium=$($summary.Medium) Low=$($summary.Low) Info=$($summary.Info)" -ForegroundColor Yellow

if ($Json) {
  $output_obj = @{ Summary = $summary; Findings = $Findings; ExecutedAt = (Get-Date -Format 'o'); DurationMs = $sw.ElapsedMilliseconds }
  $output_obj | ConvertTo-Json -Depth 5 | Out-File -Path $Output -Encoding UTF8
  Write-Host "JSON report: $Output" -ForegroundColor Green
} else {
  $report = @()
  $report += "=== AUDIT REPORT ==="
  $report += "Time: $(Get-Date)"
  $report += "Summary: High=$($summary.High) Medium=$($summary.Medium) Low=$($summary.Low) Info=$($summary.Info)"
  $report += ""
  
  foreach ($severity in @('High', 'Medium', 'Low', 'Info')) {
    $items = $Findings | Where-Object { $_.Severity -eq $severity }
    if ($items) {
      $report += "=== $severity ($($items.Count)) ==="
      foreach ($f in $items) {
        $report += "[$($f.Area)] $($f.Message)"
        $report += "  Path: $($f.Path)"
        if ($f.Fix) { $report += "  Fix: $($f.Fix)" }
        $report += ""
      }
    }
  }
  
  $report | Out-File -Path $Output -Encoding UTF8
  Write-Host "Report: $Output" -ForegroundColor Green
  $report | Out-Host
}
