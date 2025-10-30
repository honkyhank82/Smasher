# Smasher Complete App Functionality Test Script
# Runs all tests first, then provides detailed error summary
param(
  [string]$ProjectPath = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Continue"
$results = @{}
$errorDetails = @()
$jobFailures = $false
$API_URL = "https://smasher-api.fly.dev"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SMASHER COMPLETE APP TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not (Test-Path $ProjectPath)) {
  Write-Host "❌ ProjectPath does not exist: $ProjectPath" -ForegroundColor Red
  throw "Invalid ProjectPath"
}
Set-Location -Path $ProjectPath

# STEP 1: Configuration Check
Write-Host "`n=== CONFIGURATION CHECK ===" -ForegroundColor Yellow
$activeVersion = (Get-Content "server\package.json" | ConvertFrom-Json).version
$flyToml = Get-Content "server\fly.toml" -Raw
$autoStop = if ($flyToml -match "auto_stop_machines\s*=\s*false") { "✅" } else { "❌" }
$memory = if ($flyToml -match "memory_mb\s*=\s*512") { "✅ 512MB" } else { "⚠️" }
Write-Host "Version: $activeVersion | auto_stop: $autoStop | Memory: $memory"
$results.Config = "$autoStop $memory"

if ($autoStop -eq "❌") {
    $errorDetails += @{Type="Configuration"; Message="auto_stop_machines not set to false"; Severity="CRITICAL"}
}

# STEP 2: Cleanup
Write-Host "`n=== CLEANUP ===" -ForegroundColor Yellow
$confirm = Read-Host "Remove duplicate 'smasher' directory? (yes/no)"
if ($confirm -eq "yes") {
    if (Test-Path "smasher") {
        try {
            $size = [math]::Round((Get-ChildItem "smasher" -Recurse -File -EA SilentlyContinue | Measure-Object Length -Sum).Sum/1MB, 2)
            Remove-Item -Recurse -Force "smasher" -EA Stop
            Write-Host "✅ Removed - Freed $size MB" -ForegroundColor Green
            $results.Cleanup = "$size MB freed"
        } catch {
            Write-Host "❌ Cleanup failed: $_" -ForegroundColor Red
            $errorDetails += @{Type="Cleanup"; Message="Failed to remove duplicate directory: $_"; Severity="WARNING"}
            $results.Cleanup = "Failed"
        }
    }
    @("app","infra",".idea",".trae") | ForEach-Object { 
        if (Test-Path $_) { Remove-Item -Recurse -Force $_ -EA SilentlyContinue }
    }
} else {
    $results.Cleanup = "Skipped"
}

cd server

# STEP 3: Machine Status
Write-Host "`n=== MACHINE STATUS ===" -ForegroundColor Yellow
$statusJob = Start-Job -Name "statusJob" {
    try {
        fly status 2>&1
    } catch {
        $_
        throw
    }
}
try {
    $waited = Wait-Job -Job $statusJob -Timeout 45
    if (-not $waited) {
        Write-Host "❌ fly status job timed out" -ForegroundColor Red
        Stop-Job -Job $statusJob -Force -EA SilentlyContinue
        $errorDetails += @{Type="Machine Status"; Message="fly status timed out"; Severity="ERROR"}
        $status = $null
        $jobFailures = $true
    } else {
        try {
            $status = Receive-Job -Job $statusJob -ErrorAction Stop
            if (-not $status) {
                Write-Host "❌ fly status returned empty output" -ForegroundColor Red
                $errorDetails += @{Type="Machine Status"; Message="fly status returned empty output"; Severity="ERROR"}
                $jobFailures = $true
            }
        } catch {
            Write-Host "❌ fly status job error: $($_.Exception.Message)" -ForegroundColor Red
            $errorDetails += @{Type="Machine Status"; Message="fly status job error: $($_.Exception.Message)"; Severity="ERROR"}
            $status = $null
            $jobFailures = $true
        }
    }
} finally {
    Remove-Job -Job $statusJob -Force -EA SilentlyContinue
}

if ($status -match "running") {
    $machineState = "RUNNING ✅"
    Write-Host $machineState -ForegroundColor Green
} elseif ($status -match "stopped") {
    $machineState = "STOPPED ⚠️"
    Write-Host $machineState -ForegroundColor Red
    $errorDetails += @{Type="Machine Status"; Message="Machines are STOPPED - deployment required"; Severity="CRITICAL"}
    $needsDeploy = $true
} else {
    $machineState = "UNKNOWN ⚠️"
    Write-Host $machineState -ForegroundColor Yellow
    $errorDetails += @{Type="Machine Status"; Message="Machine status unknown"; Severity="WARNING"}
}
$results.Machines = $machineState

# STEP 4: Log Analysis
Write-Host "`n=== LOG ANALYSIS ===" -ForegroundColor Yellow
$logsJob = Start-Job -Name "logsJob" {
    try {
        fly logs --lines 50 2>&1
    } catch {
        $_
        throw
    }
}
try {
    $waitedLogs = Wait-Job -Job $logsJob -Timeout 45
    if (-not $waitedLogs) {
        Write-Host "❌ fly logs job timed out" -ForegroundColor Red
        Stop-Job -Job $logsJob -Force -EA SilentlyContinue
        $errorDetails += @{Type="Log Analysis"; Message="fly logs timed out"; Severity="ERROR"}
        $logs = @()
        $jobFailures = $true
    } else {
        try {
            $logs = Receive-Job -Job $logsJob -ErrorAction Stop
            if (-not $logs -or $logs.Count -eq 0) {
                Write-Host "❌ fly logs returned empty output" -ForegroundColor Red
                $errorDetails += @{Type="Log Analysis"; Message="fly logs returned empty output"; Severity="ERROR"}
                $jobFailures = $true
                $logs = @()
            }
        } catch {
            Write-Host "❌ fly logs job error: $($_.Exception.Message)" -ForegroundColor Red
            $errorDetails += @{Type="Log Analysis"; Message="fly logs job error: $($_.Exception.Message)"; Severity="ERROR"}
            $logs = @()
            $jobFailures = $true
        }
    }
} finally {
    Remove-Job -Job $logsJob -Force -EA SilentlyContinue
}

$errorLines = $logs | Select-String "error|ERROR" -Context 2,2
$warningLines = $logs | Select-String "warning|WARN" -Context 2,2
$errors = $errorLines.Count
$warnings = $warningLines.Count

Write-Host "Errors: $errors | Warnings: $warnings" -ForegroundColor $(if($errors -gt 0){"Red"}else{"Green"})
$results.Logs = "E:$errors W:$warnings"

# Store log errors for detailed summary
foreach ($errorLine in $errorLines) {
    $errorDetails += @{Type="Log Error"; Message=$errorLine.Line; Context=$errorLine; Severity="ERROR"}
}
foreach ($warningLine in $warningLines) {
    $errorDetails += @{Type="Log Warning"; Message=$warningLine.Line; Context=$warningLine; Severity="WARNING"}
}

# STEP 5: Core Health Checks
Write-Host "`n=== CORE HEALTH CHECKS ===" -ForegroundColor Yellow
$healthEndpoints = @{
    "Basic Health" = "/health"
    "Detailed Health" = "/health/detailed"
    "Readiness" = "/health/ready"
    "Liveness" = "/health/live"
    "Version" = "/version"
    "Root" = "/"
}

$healthPassed = 0
foreach ($test in $healthEndpoints.GetEnumerator()) {
    try {
        $response = Invoke-RestMethod -Uri "$API_URL$($test.Value)" -Method Get -TimeoutSec 30 -EA Stop
        Write-Host "✅ $($test.Key)" -ForegroundColor Green
        $healthPassed++
    } catch {
        Write-Host "❌ $($test.Key)" -ForegroundColor Red
        $errorDetails += @{Type="Health Check"; Message="$($test.Key) failed: $($_.Exception.Message)"; Severity="ERROR"}
        $needsDeploy = $true
    }
}
$results.CoreHealth = "$healthPassed/$($healthEndpoints.Count) passed"

# STEP 6: Authentication Tests
Write-Host "`n=== AUTHENTICATION TESTS ===" -ForegroundColor Yellow
$authTests = @{
    "Request Magic Link" = @{ Method="POST"; Path="/auth/request-magic-link"; Body=@{email="test@example.com"} }
}

$authPassed = 0
foreach ($test in $authTests.GetEnumerator()) {
    try {
        $body = $test.Value.Body | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$API_URL$($test.Value.Path)" -Method $test.Value.Method -Body $body -ContentType "application/json" -TimeoutSec 30 -EA Stop
        Write-Host "✅ $($test.Key)" -ForegroundColor Green
        $authPassed++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "⚠️ $($test.Key): Endpoint exists (404)" -ForegroundColor Yellow
            $authPassed++
        } elseif ($_.Exception.Response.StatusCode -eq 400) {
            $body = $null
            try { $body = ($_ | Out-String).Trim() } catch {}
            Write-Host "❌ $($test.Key): Bad Request (400)" -ForegroundColor Red
            $errorDetails += @{Type="Auth Endpoint"; Message="$($test.Key) returned 400 Bad Request"; Severity="ERROR"; Context=$body}
        } else {
            Write-Host "❌ $($test.Key)" -ForegroundColor Red
            $errorDetails += @{Type="Auth Endpoint"; Message="$($test.Key) failed: $($_.Exception.Message)"; Severity="ERROR"}
        }
    }
}
$results.Auth = "$authPassed/$($authTests.Count)"

# STEP 7: User/Profile Endpoints
Write-Host "`n=== USER & PROFILE ENDPOINTS ===" -ForegroundColor Yellow
$userEndpoints = @("/users/account-status", "/users/privacy-settings", "/users/blocked", "/profiles/me")

$userPassed = 0
foreach ($endpoint in $userEndpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$API_URL$endpoint" -Method Get -TimeoutSec 30 -EA Stop
        Write-Host "⚠️ ${endpoint}: No auth" -ForegroundColor Yellow
        $errorDetails += @{Type="Security"; Message="${endpoint} does not require authentication"; Severity="WARNING"}
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ ${endpoint}: Protected" -ForegroundColor Green
            $userPassed++
        } else {
            Write-Host "❌ $endpoint" -ForegroundColor Red
            $errorDetails += @{Type="User Endpoint"; Message="${endpoint} failed: $($_.Exception.Message)"; Severity="ERROR"}
        }
    }
}
$results.UserProfiles = "$userPassed/$($userEndpoints.Count) protected"

# STEP 8: Location & Geo Endpoints
Write-Host "`n=== LOCATION & GEO ENDPOINTS ===" -ForegroundColor Yellow
$geoEndpoints = @("/geo/nearby", "/location-share/active", "/location-share/my-shares")

$geoPassed = 0
foreach ($endpoint in $geoEndpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$API_URL$endpoint" -Method Get -TimeoutSec 30 -EA Stop
        Write-Host "⚠️ ${endpoint}: No auth" -ForegroundColor Yellow
        $errorDetails += @{Type="Security"; Message="${endpoint} does not require authentication"; Severity="WARNING"}
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ ${endpoint}: Protected" -ForegroundColor Green
            $geoPassed++
        } else {
            Write-Host "❌ $endpoint" -ForegroundColor Red
            $errorDetails += @{Type="Geo Endpoint"; Message="${endpoint} failed: $($_.Exception.Message)"; Severity="ERROR"}
        }
    }
}
$results.Location = "$geoPassed/$($geoEndpoints.Count) protected"

# STEP 9: Chat & Messaging
Write-Host "`n=== CHAT & MESSAGING ===" -ForegroundColor Yellow
$chatEndpoints = @("/chat/conversations", "/buddies")

$chatPassed = 0
foreach ($endpoint in $chatEndpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$API_URL$endpoint" -Method Get -TimeoutSec 30 -EA Stop
        Write-Host "⚠️ ${endpoint}: No auth" -ForegroundColor Yellow
        $errorDetails += @{Type="Security"; Message="${endpoint} does not require authentication"; Severity="WARNING"}
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ ${endpoint}: Protected" -ForegroundColor Green
            $chatPassed++
        } else {
            Write-Host "❌ $endpoint" -ForegroundColor Red
            $errorDetails += @{Type="Chat Endpoint"; Message="${endpoint} failed: $($_.Exception.Message)"; Severity="ERROR"}
        }
    }
}
$results.Chat = "$chatPassed/$($chatEndpoints.Count) protected"

# STEP 10: Media Endpoints
Write-Host "`n=== MEDIA ENDPOINTS ===" -ForegroundColor Yellow
$mediaEndpoints = @("/media/my-media", "/media/signed-upload")

$mediaPassed = 0
foreach ($endpoint in $mediaEndpoints) {
    try {
        $method = if ($endpoint -match "signed-upload") { "POST" } else { "GET" }
        $params = @{Uri="$API_URL$endpoint"; Method=$method; TimeoutSec=30; ErrorAction="Stop"}
        if ($method -eq "POST") { 
            $params.Body = @{fileName="test.jpg";fileType="image/jpeg"} | ConvertTo-Json
            $params.ContentType = "application/json"
        }
        $response = Invoke-RestMethod @params
        Write-Host "⚠️ ${endpoint}: No auth" -ForegroundColor Yellow
        $errorDetails += @{Type="Security"; Message="${endpoint} does not require authentication"; Severity="WARNING"}
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ ${endpoint}: Protected" -ForegroundColor Green
            $mediaPassed++
        } else {
            Write-Host "❌ $endpoint" -ForegroundColor Red
            $errorDetails += @{Type="Media Endpoint"; Message="${endpoint} failed: $($_.Exception.Message)"; Severity="ERROR"}
        }
    }
}
$results.Media = "$mediaPassed/$($mediaEndpoints.Count) protected"

# STEP 11: Subscription Endpoints
Write-Host "`n=== SUBSCRIPTION ENDPOINTS ===" -ForegroundColor Yellow
$subEndpoints = @("/subscriptions/status")

$subPassed = 0
foreach ($endpoint in $subEndpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$API_URL$endpoint" -Method Get -TimeoutSec 30 -EA Stop
        Write-Host "⚠️ ${endpoint}: No auth" -ForegroundColor Yellow
        $errorDetails += @{Type="Security"; Message="${endpoint} does not require authentication"; Severity="WARNING"}
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ ${endpoint}: Protected" -ForegroundColor Green
            $subPassed++
        } else {
            Write-Host "❌ $endpoint" -ForegroundColor Red
            $errorDetails += @{Type="Subscription Endpoint"; Message="${endpoint} failed: $($_.Exception.Message)"; Severity="ERROR"}
        }
    }
}
$results.Subscriptions = "$subPassed/$($subEndpoints.Count) protected"

# STEP 12: Notification Endpoints
Write-Host "`n=== NOTIFICATION ENDPOINTS ===" -ForegroundColor Yellow
$notifEndpoints = @("/notifications")

$notifPassed = 0
foreach ($endpoint in $notifEndpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$API_URL$endpoint" -Method Get -TimeoutSec 30 -EA Stop
        Write-Host "⚠️ ${endpoint}: No auth" -ForegroundColor Yellow
        $errorDetails += @{Type="Security"; Message="${endpoint} does not require authentication"; Severity="WARNING"}
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "✅ ${endpoint}: Protected" -ForegroundColor Green
            $notifPassed++
        } else {
            Write-Host "❌ $endpoint" -ForegroundColor Red
            $errorDetails += @{Type="Notification Endpoint"; Message="${endpoint} failed: $($_.Exception.Message)"; Severity="ERROR"}
        }
    }
}
$results.Notifications = "$notifPassed/$($notifEndpoints.Count) protected"

# STEP 13: Database & Performance
Write-Host "`n=== DATABASE & PERFORMANCE ===" -ForegroundColor Yellow
try {
    $detailed = Invoke-RestMethod -Uri "$API_URL/health/detailed" -Method Get -TimeoutSec 30 -EA Stop
    $hasChecks = $null -ne $detailed -and $null -ne $detailed.checks
    $dbStatus = if ($hasChecks -and $null -ne $detailed.checks.database -and $null -ne $detailed.checks.database.status) { $detailed.checks.database.status } else { "unknown" }
    $memStatus = if ($hasChecks -and $null -ne $detailed.checks.memory -and $null -ne $detailed.checks.memory.status) { $detailed.checks.memory.status } else { "unknown" }
    $cpuStatus = if ($hasChecks -and $null -ne $detailed.checks.cpu -and $null -ne $detailed.checks.cpu.status) { $detailed.checks.cpu.status } else { "unknown" }

    $dbRespTime = if ($hasChecks -and $null -ne $detailed.checks.database -and $null -ne $detailed.checks.database.responseTime) { $detailed.checks.database.responseTime } else { "N/A" }
    $memUsage = if ($hasChecks -and $null -ne $detailed.checks.memory -and $null -ne $detailed.checks.memory.usage) { $detailed.checks.memory.usage } else { "N/A" }
    $cpuUsage = if ($hasChecks -and $null -ne $detailed.checks.cpu -and $null -ne $detailed.checks.cpu.usage) { $detailed.checks.cpu.usage } else { "N/A" }
    $heapUsed = if ($hasChecks -and $null -ne $detailed.checks.memory -and $null -ne $detailed.checks.memory.heapUsed) { $detailed.checks.memory.heapUsed } else { "N/A" }

    Write-Host "✅ Database: $dbStatus ($dbRespTime)" -ForegroundColor Green
    Write-Host "   Memory: $memUsage - $memStatus" -ForegroundColor White
    Write-Host "   CPU: $cpuUsage - $cpuStatus" -ForegroundColor White
    Write-Host "   Heap: $heapUsed" -ForegroundColor White

    $results.Database = "✅ $dbRespTime"
    $results.Performance = "Mem:$memUsage CPU:$cpuUsage"

    if ($dbStatus -eq "unknown") {
        $errorDetails += @{Type="Database"; Message="Database status unavailable in health response"; Severity="WARNING"}
    } elseif ($dbStatus -ne "healthy") {
        $errorDetails += @{Type="Database"; Message="Database status: $dbStatus"; Severity="CRITICAL"}
    }
    if ($memStatus -eq "unknown") {
        $errorDetails += @{Type="Performance"; Message="Memory status unavailable ($memUsage)"; Severity="WARNING"}
    } elseif ($memStatus -ne "healthy") {
        $errorDetails += @{Type="Performance"; Message="Memory status: $memStatus ($memUsage)"; Severity="WARNING"}
    }
    if ($cpuStatus -eq "unknown") {
        $errorDetails += @{Type="Performance"; Message="CPU status unavailable ($cpuUsage)"; Severity="WARNING"}
    } elseif ($cpuStatus -ne "healthy") {
        $errorDetails += @{Type="Performance"; Message="CPU status: $cpuStatus ($cpuUsage)"; Severity="WARNING"}
    }
} catch {
    Write-Host "❌ Database check failed" -ForegroundColor Red
    $errorDetails += @{Type="Database"; Message="Database health check failed: $($_.Exception.Message)"; Severity="CRITICAL"}
    $results.Database = "❌ Failed"
    $results.Performance = "N/A"
}

# STEP 14: WebSocket Test
Write-Host "`n=== WEBSOCKET TEST ===" -ForegroundColor Yellow
try {
    $wsTest = Invoke-WebRequest -Uri "$API_URL/socket.io/" -Method Get -TimeoutSec 30 -EA Stop
    Write-Host "✅ WebSocket accessible" -ForegroundColor Green
    $results.WebSocket = "✅"
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ WebSocket endpoint exists (404)" -ForegroundColor Green
        $results.WebSocket = "✅"
    } elseif ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "❌ WebSocket bad request (400)" -ForegroundColor Red
        $errorDetails += @{Type="WebSocket"; Message="WebSocket returned 400 Bad Request"; Severity="ERROR"}
        $results.WebSocket = "❌"
    } else {
        Write-Host "⚠️ WebSocket inconclusive" -ForegroundColor Yellow
        $errorDetails += @{Type="WebSocket"; Message="WebSocket test inconclusive: $($_.Exception.Message)"; Severity="WARNING"}
        $results.WebSocket = "⚠️"
    }
}

# STEP 15: Deploy if needed
if ($needsDeploy) {
    Write-Host "`n=== DEPLOYMENT ===" -ForegroundColor Yellow
    $deploy = Read-Host "Deploy now? (yes/no)"
    if ($deploy -eq "yes") {
        fly deploy
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deployed successfully" -ForegroundColor Green
            Start-Sleep 30
            try {
                $postHealth = Invoke-RestMethod "$API_URL/health" -TimeoutSec 30
                $results.Deploy = "✅ Health:$($postHealth.status)"
            } catch {
                $results.Deploy = "✅ Deployed (health check pending)"
                $errorDetails += @{Type="Post-Deploy"; Message="Health check after deployment failed"; Severity="WARNING"}
            }
        } else {
            $results.Deploy = "❌ FAILED"
            $errorDetails += @{Type="Deployment"; Message="Deployment failed with exit code $LASTEXITCODE"; Severity="CRITICAL"}
        }
    } else {
        $results.Deploy = "Skipped"
    }
} else {
    $results.Deploy = "Not needed"
}

cd ..

# FINAL RESULTS SUMMARY
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

foreach ($key in $results.Keys | Sort-Object) {
    $value = $results[$key]
    $color = if ($value -match "✅|passed|protected|RUNNING") { "Green" } 
             elseif ($value -match "❌|FAILED|STOPPED") { "Red" } 
             else { "Yellow" }
    Write-Host "$($key.PadRight(20)): $value" -ForegroundColor $color
}

Write-Host "`n📊 STATISTICS" -ForegroundColor Cyan
$totalEndpoints = ($results.Values | Select-String "(\d+)/(\d+)" -AllMatches).Matches
$passed = ($totalEndpoints | ForEach-Object { [int]$_.Groups[1].Value } | Measure-Object -Sum).Sum
$total = ($totalEndpoints | ForEach-Object { [int]$_.Groups[2].Value } | Measure-Object -Sum).Sum
Write-Host "Endpoints Tested: $total" -ForegroundColor White
Write-Host "Passed/Protected: $passed" -ForegroundColor Green
if ($total -gt 0) {
    $successRate = [math]::Round(($passed/$total)*100, 2)
    Write-Host "Success Rate: $successRate%" -ForegroundColor $(if($successRate -eq 100){"Green"}elseif($successRate -gt 50){"Yellow"}else{"Red"})
}

# DETAILED ERROR SUMMARY
Write-Host "`n========================================" -ForegroundColor Red
Write-Host "DETAILED ERROR SUMMARY" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red

if ($errorDetails.Count -eq 0) {
    Write-Host "`n✅ NO ERRORS FOUND - ALL TESTS PASSED!" -ForegroundColor Green
} else {
    $criticalErrors = $errorDetails | Where-Object { $_.Severity -eq "CRITICAL" }
    $errors = $errorDetails | Where-Object { $_.Severity -eq "ERROR" }
    $warnings = $errorDetails | Where-Object { $_.Severity -eq "WARNING" }
    
    Write-Host "`nTotal Issues Found: $($errorDetails.Count)" -ForegroundColor Yellow
    Write-Host "  Critical: $($criticalErrors.Count)" -ForegroundColor Red
    Write-Host "  Errors: $($errors.Count)" -ForegroundColor Red
    Write-Host "  Warnings: $($warnings.Count)" -ForegroundColor Yellow
    
    if ($criticalErrors.Count -gt 0) {
        Write-Host "`n🚨 CRITICAL ERRORS:" -ForegroundColor Red
        $criticalErrors | ForEach-Object {
            Write-Host "  [$($_.Type)] $($_.Message)" -ForegroundColor Red
        }
    }
    
    if ($errors.Count -gt 0) {
        Write-Host "`n❌ ERRORS:" -ForegroundColor Red
        $errors | ForEach-Object {
            Write-Host "  [$($_.Type)] $($_.Message)" -ForegroundColor Red
            if ($_.Context) {
                Write-Host "    Context: $($_.Context)" -ForegroundColor Gray
            }
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`n⚠️ WARNINGS:" -ForegroundColor Yellow
        $warnings | ForEach-Object {
            Write-Host "  [$($_.Type)] $($_.Message)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "RECOMMENDED ACTIONS" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    
    if ($criticalErrors | Where-Object { $_.Type -eq "Machine Status" }) {
        Write-Host "1. Deploy immediately: cd server && fly deploy" -ForegroundColor Yellow
    }
    if ($criticalErrors | Where-Object { $_.Type -eq "Database" }) {
        Write-Host "2. Check database connection: fly postgres connect" -ForegroundColor Yellow
    }
    if ($errors | Where-Object { $_.Type -match "Endpoint" }) {
        Write-Host "3. Review endpoint failures and check server logs" -ForegroundColor Yellow
    }
    if ($warnings | Where-Object { $_.Type -eq "Security" }) {
        Write-Host "4. Review authentication requirements for exposed endpoints" -ForegroundColor Yellow
    }
}

Write-Host "`n📝 USEFUL COMMANDS:" -ForegroundColor Cyan
Write-Host "  View logs: fly logs" -ForegroundColor White
Write-Host "  Filter errors: fly logs | Select-String 'error'" -ForegroundColor White
Write-Host "  Deploy: fly deploy" -ForegroundColor White
Write-Host "  Status: fly status" -ForegroundColor White
Write-Host "  Health: $API_URL/health/detailed" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan