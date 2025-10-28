#!/usr/bin/env pwsh

<#
.SYNOPSIS
Repository audit script for Smasher: scans for conflicts, secrets, build/lint errors, and common misconfigurations.

.DESCRIPTION
This script performs a best-effort audit across the monorepo:
- Detects git merge conflict markers
- Finds potential secrets committed in source
- Flags build logs/artifacts tracked by git
- Checks for synchronous file logging usage
- Verifies throttling decorators on verification endpoints
- Verifies presence of ScheduleModule and cleanup cron
- Optionally runs builds/lints/audits for server, web, and React Native

Outputs a detailed list of findings with suggested fixes.

.PARAMETER SkipBuilds
Skips running builds (use if CI dependencies are not available).

.PARAMETER SkipAudits
Skips npm audit steps (security advisory checks).

.PARAMETER SkipAndroid
Skips Android checks.

.PARAMETER SkipTests
Skips running test commands.

.PARAMETER Json
Outputs findings as JSON to the specified output path.

.PARAMETER Output
Output path for the report (default audit-report.txt).

.EXAMPLE
pwsh ./audit-repo.ps1

.EXAMPLE
pwsh ./audit-repo.ps1 -Json -Output audit-report.json

.NOTES
This is a heuristic audit; it does not replace full security reviews or integration tests.
#>

param(
  [switch]$SkipBuilds,
  [switch]$SkipAudits,
  [switch]$SkipAndroid,
  [switch]$SkipTests,
  [switch]$SkipSmoke,
  [switch]$Json,
  [string]$Output = "audit-report.txt"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSCommandPath

$Findings = New-Object System.Collections.ArrayList

function Add-Finding {
  param(
    [string]$Area,
    [string]$Severity,
    [string]$Message,
    [string]$Fix,
    [string]$Path,
    [hashtable]$Details
  )
  $null = $Findings.Add([ordered]@{
    Area=$Area; Severity=$Severity; Message=$Message; Fix=$Fix; Path=$Path; Details=$Details
  })
}

function Invoke-CommandSafe {
  param(
    [string]$Cmd,
    [string[]]$Args,
    [string]$Dir
  )
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
function Test-PortOpen {
  param([int]$Port)
  try {
    $conn = (Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop)
    return $true
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

function Test-GitTracked {
  param([string]$Path)
  if (-not (Test-GitAvailable)) { return $null }
  try {
    git ls-files --error-unmatch $Path *> $null
    return $true
  } catch { return $false }
}

# 1) Detect merge conflict markers across source files
Write-Host "[Audit] Scanning for merge conflict markers..." -ForegroundColor Cyan
$extensions = @('.ts','.js','.tsx','.json','.yml','.yaml','.md','.gradle','.ps1','.sh','.mjs','.cjs','.html','.css')
$codeFiles = Get-ChildItem -Path $RepoRoot -Recurse -File | Where-Object { $_.Extension -in $extensions -or $_.Name -in @('Dockerfile','fly.toml','render.yaml') }
foreach ($f in $codeFiles) {
  $matches = Select-String -Path $f.FullName -Pattern '<<<<<<<|=======|>>>>>>>' -AllMatches
  if ($matches) {
    Add-Finding -Area 'Git' -Severity 'High' -Message 'Merge conflict markers found' -Fix 'Resolve conflicts and remove markers before committing' -Path $f.FullName -Details @{ Lines = ($matches | ForEach-Object { $_.LineNumber }) }
  }
}

# 2) Detect secrets patterns
Write-Host "[Audit] Scanning for potential secrets..." -ForegroundColor Cyan
$secretPatterns = @(
  @{ Pattern='BEGIN PRIVATE KEY'; Fix='Remove from repo and rotate credentials; store in secrets manager'; },
  @{ Pattern='AWS_ACCESS_KEY_ID'; Fix='Remove from repo; use secrets manager/env vars and rotate keys'; },
  @{ Pattern='AWS_SECRET_ACCESS_KEY'; Fix='Remove from repo; use secrets manager/env vars and rotate keys'; },
  @{ Pattern='RESEND_API_KEY'; Fix='Use env vars/secrets in CI; rotate exposed keys'; },
  @{ Pattern='DATABASE_URL\s*=\s*[^\n]*://[^\n]*:[^\n]*@'; Fix='Do not commit credentials in URLs; move to env vars'; },
  @{ Pattern='keystorePassword'; Fix='Do not hardcode signing passwords; use env vars/gradle properties ignored by VCS'; },
  @{ Pattern='keyPassword'; Fix='Do not hardcode signing passwords; use env vars/gradle properties ignored by VCS'; },
  @{ Pattern='keyAlias\s*=\s*\S+'; Fix='Avoid committing aliases alongside secrets; move to env vars'; }
)
foreach ($pat in $secretPatterns) {
  $hits = Select-String -Path ($codeFiles | ForEach-Object FullName) -Pattern $pat.Pattern -AllMatches
  foreach ($h in $hits) {
    Add-Finding -Area 'Secrets' -Severity 'High' -Message "Potential secret in source: '${pat.Pattern}'" -Fix $pat.Fix -Path $h.Path -Details @{ Line = $h.LineNumber; LineText = $h.Line.Trim() }
  }
}

# 3) Build logs or artifacts tracked by git
Write-Host "[Audit] Checking for build logs/artifacts in VCS..." -ForegroundColor Cyan
$logCandidates = @(
  Join-Path $RepoRoot 'app-rn/android/build-log.txt'),
  Get-ChildItem -Path $RepoRoot -Recurse -File -Include *.log
$logCandidates = $logCandidates | Where-Object { $_ }
foreach ($lf in $logCandidates) {
  $tracked = Test-GitTracked -Path $lf.FullName
  if ($tracked -eq $true) {
    Add-Finding -Area 'VCS' -Severity 'Medium' -Message 'Build log tracked in git' -Fix 'Add to .gitignore and remove from VCS (git rm --cached)' -Path $lf.FullName -Details @{ SizeBytes = $lf.Length }
  } elseif ($tracked -eq $null) {
    # Git not available; still flag presence
    Add-Finding -Area 'VCS' -Severity 'Low' -Message 'Build log present; ensure .gitignore excludes it' -Fix 'Add pattern (e.g., app-rn/android/*.log) to .gitignore' -Path $lf.FullName -Details @{ SizeBytes = $lf.Length }
  }
}

# 4) Synchronous file logging usage
Write-Host "[Audit] Checking for synchronous file logging..." -ForegroundColor Cyan
$syncLogHits = Select-String -Path ($codeFiles | ForEach-Object FullName) -Pattern 'appendFileSync' -AllMatches
foreach ($h in $syncLogHits) {
  Add-Finding -Area 'Logging' -Severity 'Medium' -Message 'Synchronous file logging detected (appendFileSync)' -Fix 'Use async fs.promises.appendFile or a logger (Pino/Winston) with rotation' -Path $h.Path -Details @{ Line = $h.LineNumber; LineText = $h.Line.Trim() }
}

# 5) Verification endpoints throttling
Write-Host "[Audit] Verifying endpoint throttling..." -ForegroundColor Cyan
$authController = Join-Path $RepoRoot 'server/src/auth/auth.controller.ts'
if (Test-Path $authController) {
  $controllerText = Get-Content $authController -Raw
  if ($controllerText -notmatch '@Throttle\(') {
    Add-Finding -Area 'Auth' -Severity 'Medium' -Message 'Verification endpoints lack per-route throttling' -Fix 'Add @Throttle decorators to send-verification and verify routes' -Path $authController -Details @{ Suggestion = '@Throttle(3, 3600) and @Throttle(10, 900)' }
  }
}

# 6) ScheduleModule and cleanup cron presence
Write-Host "[Audit] Verifying schedule module and cleanup cron..." -ForegroundColor Cyan
$appModule = Join-Path $RepoRoot 'server/src/app.module.ts'
if (Test-Path $appModule) {
  $modText = Get-Content $appModule -Raw
  if ($modText -notmatch 'ScheduleModule\.forRoot\(') {
    Add-Finding -Area 'Cron' -Severity 'Low' -Message 'ScheduleModule not registered' -Fix 'Import ScheduleModule.forRoot() in AppModule for cron tasks' -Path $appModule -Details @{ }
  }
}
$authService = Join-Path $RepoRoot 'server/src/auth/auth.service.ts'
if (Test-Path $authService) {
  $svcText = Get-Content $authService -Raw
  if ($svcText -notmatch '@Cron\(') {
    Add-Finding -Area 'Cron' -Severity 'Low' -Message 'No cleanup cron found in AuthService' -Fix 'Add @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) to delete expired codes' -Path $authService -Details @{ }
  }
}

# 7) Verification code storage security
Write-Host "[Audit] Checking verification code storage..." -ForegroundColor Cyan
$entityPath = Join-Path $RepoRoot 'server/src/auth/verification-code.entity.ts'
if (Test-Path $entityPath) {
  $entityText = Get-Content $entityPath -Raw
  $hasPlain = ($entityText -match 'code!:\s*string')
  $hasHash = ($entityText -match 'codeHash')
  if ($hasPlain -and -not $hasHash) {
    Add-Finding -Area 'Auth' -Severity 'High' -Message 'Verification codes stored in plaintext' -Fix 'Store only hashed code (e.g., HMAC-SHA256 with a server-side pepper) and match on hash during verification' -Path $entityPath -Details @{ }
  } elseif ($hasPlain -and $hasHash) {
    Add-Finding -Area 'Auth' -Severity 'Info' -Message 'Plaintext and hashed code columns present' -Fix 'Plan migration to drop plaintext column after rollout' -Path $entityPath -Details @{ }
  }
}

# 8) Optional tests (run first)
if (-not $SkipTests) {
  Write-Host "[Audit] Running tests..." -ForegroundColor Cyan
  if (Test-NpmAvailable) {
    $serverDir = Join-Path $RepoRoot 'server'
    if (Test-Path (Join-Path $serverDir 'package.json')) {
      $resTestServer = Invoke-CommandSafe -Cmd 'npm' -Args @('test','--silent','--','--runInBand') -Dir $serverDir
      if ($resTestServer.ExitCode -ne 0) {
        Add-Finding -Area 'Server' -Severity 'High' -Message 'Server tests failed' -Fix 'Review failing specs and fix regressions' -Path $serverDir -Details @{ Output = $resTestServer.Output }
      } else {
        Add-Finding -Area 'Server' -Severity 'Info' -Message 'Server tests passed' -Fix '' -Path $serverDir -Details @{ }
      }
    }
    $rnDir = Join-Path $RepoRoot 'app-rn'
    if (Test-Path (Join-Path $rnDir 'package.json')) {
      $resTestRn = Invoke-CommandSafe -Cmd 'npm' -Args @('test','--silent','--','--runInBand') -Dir $rnDir
      if ($resTestRn.ExitCode -ne 0) {
        Add-Finding -Area 'Mobile' -Severity 'High' -Message 'React Native tests failed' -Fix 'Review failing tests in app-rn' -Path $rnDir -Details @{ Output = $resTestRn.Output }
      } else {
        Add-Finding -Area 'Mobile' -Severity 'Info' -Message 'React Native tests passed' -Fix '' -Path $rnDir -Details @{ }
      }
    }
  } else {
    Add-Finding -Area 'Env' -Severity 'Info' -Message 'npm not available; tests skipped' -Fix 'Install Node.js/npm to run tests' -Path $RepoRoot -Details @{ }
  }
}

# 9) Optional builds/lints/audits
if (-not $SkipBuilds) {
  Write-Host "[Audit] Running server build..." -ForegroundColor Cyan
  if (Test-NpmAvailable) {
    $serverDir = Join-Path $RepoRoot 'server'
    $res1 = Invoke-CommandSafe -Cmd 'npm' -Args @('ci') -Dir $serverDir
    if ($res1.ExitCode -ne 0) {
      Add-Finding -Area 'Server' -Severity 'High' -Message 'npm ci failed' -Fix 'Inspect output; ensure network access and lockfile integrity' -Path $serverDir -Details @{ Output = $res1.Output }
    }
    $res2 = Invoke-CommandSafe -Cmd 'npm' -Args @('run','build','--silent') -Dir $serverDir
    if ($res2.ExitCode -ne 0) {
      Add-Finding -Area 'Server' -Severity 'High' -Message 'Server build failed' -Fix 'Fix TypeScript errors and missing imports' -Path $serverDir -Details @{ Output = $res2.Output }
    }
    # Lint (server)
    $resLintSrv = Invoke-CommandSafe -Cmd 'npm' -Args @('run','lint','--silent') -Dir $serverDir
    if ($resLintSrv.ExitCode -ne 0) {
      Add-Finding -Area 'Server' -Severity 'Medium' -Message 'ESLint failed' -Fix 'Fix lint errors; ensure eslint config aligns with codebase' -Path $serverDir -Details @{ Output = $resLintSrv.Output }
    } else {
      Add-Finding -Area 'Server' -Severity 'Info' -Message 'ESLint passed' -Fix '' -Path $serverDir -Details @{ }
    }

    # TypeScript compile (server, no emit)
    $resTscSrv = Invoke-CommandSafe -Cmd 'npx' -Args @('tsc','--noEmit') -Dir $serverDir
    if ($resTscSrv.ExitCode -ne 0) {
      Add-Finding -Area 'Server' -Severity 'High' -Message 'TypeScript compile errors' -Fix 'Run npx tsc --noEmit and fix TS errors' -Path $serverDir -Details @{ Output = $resTscSrv.Output }
    } else {
      Add-Finding -Area 'Server' -Severity 'Info' -Message 'TypeScript compile passed' -Fix '' -Path $serverDir -Details @{ }
    }

    # E2E tests (server)
    $resE2E = Invoke-CommandSafe -Cmd 'npm' -Args @('run','test:e2e','--silent') -Dir $serverDir
    if ($resE2E.ExitCode -ne 0) {
      Add-Finding -Area 'Server' -Severity 'High' -Message 'E2E tests failed' -Fix 'Review e2e specs and fix API regressions' -Path $serverDir -Details @{ Output = $resE2E.Output }
    } else {
      Add-Finding -Area 'Server' -Severity 'Info' -Message 'E2E tests passed' -Fix '' -Path $serverDir -Details @{ }
    }

    if (-not $SkipAudits) {
      $resAudit = Invoke-CommandSafe -Cmd 'npm' -Args @('audit','--json') -Dir $serverDir
      if ($resAudit.ExitCode -eq 0 -and $resAudit.Output) {
        try {
          $auditJson = $resAudit.Output | ConvertFrom-Json -ErrorAction Stop
          if ($auditJson.vulnerabilities) {
            foreach ($entry in $auditJson.vulnerabilities.psobject.Properties) {
              $sev = $entry.Name
              foreach ($pkg in $entry.Value) {
                Add-Finding -Area 'Server' -Severity $sev -Message "Vulnerability: $($pkg.name) $($pkg.range)" -Fix 'Update dependency or apply advisory resolution' -Path $serverDir -Details @{ Advisory = $pkg.advisoryId; Via = $pkg.via }
              }
            }
          }
        } catch {
          Add-Finding -Area 'Server' -Severity 'Info' -Message 'npm audit parsing failed' -Fix 'Run npm audit manually and review JSON' -Path $serverDir -Details @{ Output = $resAudit.Output }
        }
      }
    }
  } else {
    Add-Finding -Area 'Env' -Severity 'Info' -Message 'npm not available; build/audit skipped' -Fix 'Install Node.js/npm to run builds and audits' -Path $RepoRoot -Details @{ }
  }

  Write-Host "[Audit] Running web build..." -ForegroundColor Cyan
  $webDir = Join-Path $RepoRoot 'app-web'
  if (Test-Path (Join-Path $webDir 'package.json')) {
    $res3 = Invoke-CommandSafe -Cmd 'npm' -Args @('ci') -Dir $webDir
    if ($res3.ExitCode -ne 0) {
      Add-Finding -Area 'Web' -Severity 'High' -Message 'npm ci failed' -Fix 'Inspect output; ensure network access and lockfile integrity' -Path $webDir -Details @{ Output = $res3.Output }
    }
    $res4 = Invoke-CommandSafe -Cmd 'npm' -Args @('run','build','--silent') -Dir $webDir
    if ($res4.ExitCode -ne 0) {
      Add-Finding -Area 'Web' -Severity 'High' -Message 'Web build failed' -Fix 'Fix TypeScript/Vite errors and missing imports' -Path $webDir -Details @{ Output = $res4.Output }
    }
    # Lint (web)
    $resLintWeb = Invoke-CommandSafe -Cmd 'npm' -Args @('run','lint','--silent') -Dir $webDir
    if ($resLintWeb.ExitCode -ne 0) {
      Add-Finding -Area 'Web' -Severity 'Medium' -Message 'ESLint failed' -Fix 'Fix lint errors; adjust rules if needed' -Path $webDir -Details @{ Output = $resLintWeb.Output }
    } else {
      Add-Finding -Area 'Web' -Severity 'Info' -Message 'ESLint passed' -Fix '' -Path $webDir -Details @{ }
    }
    # TypeScript compile (web)
    $resTscWeb = Invoke-CommandSafe -Cmd 'npx' -Args @('tsc','--noEmit') -Dir $webDir
    if ($resTscWeb.ExitCode -ne 0) {
      Add-Finding -Area 'Web' -Severity 'High' -Message 'TypeScript compile errors' -Fix 'Run npx tsc --noEmit and fix TS errors' -Path $webDir -Details @{ Output = $resTscWeb.Output }
    } else {
      Add-Finding -Area 'Web' -Severity 'Info' -Message 'TypeScript compile passed' -Fix '' -Path $webDir -Details @{ }
    }
  }

  if (-not $SkipAndroid) {
    Write-Host "[Audit] Checking Android project..." -ForegroundColor Cyan
    $androidDir = Join-Path $RepoRoot 'app-rn/android'
    $keystores = Get-ChildItem -Path (Join-Path $androidDir 'app') -Filter '*.keystore' -File -ErrorAction SilentlyContinue
    foreach ($ks in $keystores) {
      $tracked = Test-GitTracked -Path $ks.FullName
      if ($tracked -eq $true) {
        Add-Finding -Area 'Android' -Severity 'High' -Message 'Keystore file tracked in git' -Fix 'Remove keystore from VCS and rotate signing credentials' -Path $ks.FullName -Details @{ }
      }
    }
    # Lint (React Native)
    $rnDir = Join-Path $RepoRoot 'app-rn'
    if (Test-Path (Join-Path $rnDir 'package.json')) {
      $resLintRn = Invoke-CommandSafe -Cmd 'npm' -Args @('run','lint','--silent') -Dir $rnDir
      if ($resLintRn.ExitCode -ne 0) {
        Add-Finding -Area 'Mobile' -Severity 'Medium' -Message 'ESLint failed (RN)' -Fix 'Fix lint errors in app-rn' -Path $rnDir -Details @{ Output = $resLintRn.Output }
      } else {
        Add-Finding -Area 'Mobile' -Severity 'Info' -Message 'ESLint passed (RN)' -Fix '' -Path $rnDir -Details @{ }
      }
      # TypeScript compile (RN)
      $resTscRn = Invoke-CommandSafe -Cmd 'npx' -Args @('tsc','--noEmit') -Dir $rnDir
      if ($resTscRn.ExitCode -ne 0) {
        Add-Finding -Area 'Mobile' -Severity 'High' -Message 'TypeScript compile errors (RN)' -Fix 'Run npx tsc --noEmit in app-rn and fix TS errors' -Path $rnDir -Details @{ Output = $resTscRn.Output }
      } else {
        Add-Finding -Area 'Mobile' -Severity 'Info' -Message 'TypeScript compile passed (RN)' -Fix '' -Path $rnDir -Details @{ }
      }
    }
  }
}

# 9.5) API Smoke Checks (start server, probe health, verify auth gates)
if (-not $SkipSmoke) {
  Write-Host "[Audit] Running API smoke checks..." -ForegroundColor Cyan
  $serverDir = Join-Path $RepoRoot 'server'
  if (Test-Path (Join-Path $serverDir 'package.json')) {
    # Ensure build exists when start:prod is used
    $distDir = Join-Path $serverDir 'dist'
    if (-not (Test-Path $distDir) -and (Test-NpmAvailable) -and (-not $SkipBuilds)) {
      $resBuild = Invoke-CommandSafe -Cmd 'npm' -Args @('run','build','--silent') -Dir $serverDir
      if ($resBuild.ExitCode -ne 0) {
        Add-Finding -Area 'Smoke' -Severity 'High' -Message 'Server build missing and build failed; cannot run start:prod' -Fix 'Fix build errors so start:prod can run' -Path $serverDir -Details @{ Output = $resBuild.Output }
      }
    }

    # Start server in background on a non-default port to avoid collisions
    $smokePort = 3101
    $startCmd = "cd '$serverDir'; $env:PORT=$smokePort; $env:DATABASE_URL=''; npm run start:prod"
    $proc = Start-Process powershell -ArgumentList '-NoProfile','-Command', $startCmd -PassThru -WindowStyle Hidden
    try {
      # Wait until health endpoint responds
      $ok = Wait-ForHttp -Url ("http://localhost:{0}/health" -f $smokePort) -TimeoutSec 45
      if (-not $ok) {
        Add-Finding -Area 'Smoke' -Severity 'High' -Message 'Health endpoint did not become ready' -Fix 'Check bootstrap logs; ensure no DB/env failures block startup' -Path $serverDir -Details @{ Port = $smokePort }
      } else {
        # Probe health endpoints
        $urls = @('/health','/health/live','/health/ready','/health/detailed') | ForEach-Object { "http://localhost:$smokePort$_" }
        foreach ($u in $urls) {
          try {
            $resp = Invoke-WebRequest -Uri $u -Method GET -TimeoutSec 10 -ErrorAction Stop
            if ($resp.StatusCode -ne 200) {
              Add-Finding -Area 'Smoke' -Severity 'Medium' -Message "Unexpected status code on $u: $($resp.StatusCode)" -Fix 'Investigate endpoint mapping and readiness/liveness implementations' -Path $serverDir -Details @{ Url = $u; Status = $resp.StatusCode }
            } else {
              Add-Finding -Area 'Smoke' -Severity 'Info' -Message "OK: $u" -Fix '' -Path $serverDir -Details @{ }
            }
          } catch {
            Add-Finding -Area 'Smoke' -Severity 'High' -Message "Failed to GET $u" -Fix 'Review server logs; confirm route/controller registration' -Path $serverDir -Details @{ Error = $_.Exception.Message }
          }
        }

        # Auth-gated routes should reject without JWT (401/403 acceptable)
        $protected = @('/profiles/me','/subscriptions/status')
        foreach ($p in $protected) {
          $url = "http://localhost:$smokePort$p"
          try {
            $resp = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -ErrorAction Stop
            # If we got a 200, this is a problem (should be protected)
            Add-Finding -Area 'Smoke' -Severity 'High' -Message "Protected route returned 200 without JWT: $p" -Fix 'Ensure @UseGuards(JwtAuthGuard) or AuthGuard("jwt") is applied' -Path $serverDir -Details @{ Url = $url; Status = $resp.StatusCode }
          } catch {
            $msg = $_.Exception.Message
            if ($msg -match '401' -or $msg -match '403') {
              Add-Finding -Area 'Smoke' -Severity 'Info' -Message "Auth gate OK: $p rejected without JWT" -Fix '' -Path $serverDir -Details @{ }
            } else {
              Add-Finding -Area 'Smoke' -Severity 'Medium' -Message "Protected route check ambiguous for $p" -Fix 'Verify route protection and server error handling' -Path $serverDir -Details @{ Error = $msg }
            }
          }
        }
      }
    } finally {
      # Stop the server process
      try { if ($proc -and !$proc.HasExited) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } } catch {}
    }
  } else {
    Add-Finding -Area 'Smoke' -Severity 'Info' -Message 'Server package.json not found; skipping API smoke checks' -Fix '' -Path $serverDir -Details @{ }
  }
}

# 10) Summaries and output
Write-Host "[Audit] Generating report..." -ForegroundColor Cyan
function Format-FindingText {
  param($f)
  return "[${($f.Area)}] (${($f.Severity)}) ${($f.Message)}`n  Path: ${($f.Path)}" +
         (if ($f.Fix) { "`n  Fix: ${($f.Fix)}" } else { '' }) +
         (if ($f.Details) { "`n  Details: " + ($f.Details | ConvertTo-Json -Compress) } else { '' }) + "`n"
}

if ($Json) {
  $json = $Findings | ConvertTo-Json -Depth 5
  Set-Content -Path (Join-Path $RepoRoot $Output) -Value $json -Encoding UTF8
  Write-Host "[Audit] JSON report written to $Output" -ForegroundColor Green
} else {
  $text = "Smasher Repository Audit Report`nGenerated: $(Get-Date -Format o)`n`n" +
          ("Total findings: " + $Findings.Count) + "`n" +
          ($Findings | ForEach-Object { Format-FindingText $_ })
  Set-Content -Path (Join-Path $RepoRoot $Output) -Value $text -Encoding UTF8
  Write-Host "[Audit] Text report written to $Output" -ForegroundColor Green
  Write-Host "`n====== AUDIT FINDINGS ======`" -ForegroundColor Cyan
  Write-Host $text
}

Write-Host "[Audit] Done." -ForegroundColor Green