param()

$ErrorActionPreference = 'Stop'

# Paths
$appJsonPath = Join-Path $PSScriptRoot 'app.json'
$buildGradlePath = Join-Path $PSScriptRoot 'android\app\build.gradle'
$packageJsonPath = Join-Path $PSScriptRoot 'package.json'

# Load app.json
$appJsonRaw = Get-Content $appJsonPath -Raw
$app = $appJsonRaw | ConvertFrom-Json

# Determine current version and code
$currentVersion = $app.expo.version
if (-not $currentVersion) {
    $currentVersion = '1.0.0'
}

$currentCode = $app.expo.android.versionCode
if (-not $currentCode) {
    $currentCode = 1
}

# Bump patch version
$parts = $currentVersion.Split('.')
if ($parts.Length -lt 3) {
    $parts = @($parts + (0..(2 - $parts.Length)))
}
$major = [int]$parts[0]
$minor = [int]$parts[1]
$patch = [int]$parts[2] + 1
$newVersion = "$major.$minor.$patch"

$newCode = [int]$currentCode + 1

# Update app.json structure
$app.expo.version = $newVersion
if (-not $app.expo.android) {
    $app.expo | Add-Member -MemberType NoteProperty -Name android -Value (@{}) -Force
}
$app.expo.android.versionCode = $newCode

# Write app.json back (UTF-8 without BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($appJsonPath, ($app | ConvertTo-Json -Depth 10), $utf8NoBom)

# Update app-rn/package.json version
if (Test-Path $packageJsonPath) {
    $packageJsonRaw = Get-Content $packageJsonPath -Raw
    $package = $packageJsonRaw | ConvertFrom-Json
    $package.version = $newVersion
    # Write package.json without UTF-8 BOM to avoid JSON parse issues in CI
    [System.IO.File]::WriteAllText($packageJsonPath, ($package | ConvertTo-Json -Depth 10), $utf8NoBom)
}

# Update android/app/build.gradle
$buildGradle = Get-Content $buildGradlePath -Raw

# Replace versionName with newVersion
$buildGradle = [regex]::Replace(
    $buildGradle,
    'versionName\s+"[^"]+"',
    "versionName `"$newVersion`""
)

# Replace versionCode with newCode
$buildGradle = [regex]::Replace(
    $buildGradle,
    'versionCode\s+\d+',
    "versionCode $newCode"
)

[System.IO.File]::WriteAllText($buildGradlePath, $buildGradle, $utf8NoBom)

Write-Host "Updated version to $newVersion ($newCode)" -ForegroundColor Green
