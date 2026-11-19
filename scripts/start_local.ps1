param(
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$fastApiDir = Join-Path $root "fastapi-ai-server"
$springDir = Join-Path $root "backend-spring"
$frontendDir = Join-Path $root "frontend-react"
$pythonExe = Join-Path $fastApiDir ".venv\Scripts\python.exe"
$logsDir = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null
$localSecretsFile = Join-Path $PSScriptRoot "local-secrets.ps1"

if (-not (Test-Path -LiteralPath $localSecretsFile)) {
    throw "Missing scripts/local-secrets.ps1. Copy local-secrets.example.ps1 and set local-only values."
}
. $localSecretsFile

function Wait-ForUrl([string]$Url, [int]$Seconds) {
    for ($i = 0; $i -lt ($Seconds * 2); $i++) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return $true
            }
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }
    return $false
}

if (-not (Test-Path $pythonExe)) {
    Write-Host "Preparing the Python environment (first run only)..." -ForegroundColor Cyan
    & py -3.10 -m venv (Join-Path $fastApiDir ".venv")
    & $pythonExe -m pip install --upgrade pip
    & $pythonExe -m pip install -r (Join-Path $fastApiDir "requirements.txt")
}

if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Host "Installing frontend packages (first run only)..." -ForegroundColor Cyan
    Push-Location $frontendDir
    try { & npm.cmd ci } finally { Pop-Location }
}

$env:DATABASE_URL = "sqlite:///./local-fastapi.db"
$env:SPRING_PROFILES_ACTIVE = "local"
$env:FASTAPI_BASE_URL = "http://127.0.0.1:8000"

if (-not $env:OPENAI_API_KEY) {
    Write-Warning "OPENAI_API_KEY is missing. The UI will work, but audio transcription will not."
}

$processes = @()
try {
    Write-Host "Starting FastAPI on port 8000..." -ForegroundColor Cyan
    $processes += Start-Process -FilePath $pythonExe `
        -ArgumentList @("-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000") `
        -WorkingDirectory $fastApiDir `
        -RedirectStandardOutput (Join-Path $logsDir "fastapi.out.log") `
        -RedirectStandardError (Join-Path $logsDir "fastapi.err.log") `
        -PassThru

    if (-not (Wait-ForUrl "http://127.0.0.1:8000/health" 30)) {
        throw "FastAPI did not become ready."
    }

    Write-Host "Starting Spring API on port 8080..." -ForegroundColor Cyan
    $processes += Start-Process -FilePath (Join-Path $springDir "gradlew.bat") `
        -ArgumentList @("bootRun", "--no-daemon") `
        -WorkingDirectory $springDir `
        -RedirectStandardOutput (Join-Path $logsDir "spring.out.log") `
        -RedirectStandardError (Join-Path $logsDir "spring.err.log") `
        -PassThru

    if (-not (Wait-ForUrl "http://127.0.0.1:8080/api/health" 120)) {
        throw "Spring API did not become ready."
    }

    Write-Host "Starting React on port 5173..." -ForegroundColor Cyan
    $processes += Start-Process -FilePath "npm.cmd" `
        -ArgumentList @("run", "dev", "--", "--host", "127.0.0.1", "--port", "5173", "--strictPort") `
        -WorkingDirectory $frontendDir `
        -RedirectStandardOutput (Join-Path $logsDir "frontend.out.log") `
        -RedirectStandardError (Join-Path $logsDir "frontend.err.log") `
        -PassThru

    if (-not (Wait-ForUrl "http://127.0.0.1:5173" 30)) {
        throw "React did not become ready."
    }

    Write-Host "All services are ready: http://127.0.0.1:5173" -ForegroundColor Green
    Write-Host "Local admin: $env:LOCAL_ADMIN_EMAIL" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop all services."
    if (-not $NoBrowser) {
        Start-Process "http://127.0.0.1:5173"
    }

    $consecutiveHealthFailures = 0
    while ($true) {
        Start-Sleep -Seconds 5
        $allHealthy = $true
        foreach ($url in @(
            "http://127.0.0.1:8000/health",
            "http://127.0.0.1:8080/api/health",
            "http://127.0.0.1:5173"
        )) {
            try {
                $check = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 3
                if ($check.StatusCode -lt 200 -or $check.StatusCode -ge 500) {
                    $allHealthy = $false
                }
            } catch {
                $allHealthy = $false
            }
        }
        if (-not $allHealthy) {
            $consecutiveHealthFailures++
            if ($consecutiveHealthFailures -ge 120) {
                throw "A local service was unavailable for 10 minutes. See the logs folder for details."
            }
        } else {
            $consecutiveHealthFailures = 0
        }
    }
} finally {
    Write-Host "Stopping local services..." -ForegroundColor Yellow
    foreach ($process in $processes) {
        if ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }
    $listeners = Get-NetTCPConnection -State Listen -LocalPort 8000, 8080, 5173 -ErrorAction SilentlyContinue
    foreach ($listener in $listeners) {
        Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}
