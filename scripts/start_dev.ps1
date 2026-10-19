#!/usr/bin/env pwsh
# ResumeRadar - start backend (FastAPI) + frontend (Vite) together
#
#   powershell -ExecutionPolicy Bypass -File scripts\start_dev.ps1
#
# Backend  -> http://localhost:8000  (Swagger docs at /docs)
# Frontend -> http://localhost:5173
#
# NOTE: keep this file ASCII-only. Windows PowerShell 5.1 reads BOM-less files as
# ANSI, where multi-byte UTF-8 glyphs turn into smart quotes and break parsing.

$ErrorActionPreference = "Stop"

$root      = Split-Path -Parent $PSScriptRoot
$backend   = Join-Path $root "backend"
$frontend  = Join-Path $root "frontend"
$ollamaExe = Join-Path $env:LOCALAPPDATA "Programs\Ollama\ollama.exe"

# --- Preflight checks ------------------------------------------------------
if (-not (Test-Path (Join-Path $backend ".venv"))) {
    Write-Host "[x] backend\.venv not found. First run:"
    Write-Host "    cd backend; python -m venv .venv; .\.venv\Scripts\pip install -r requirements.txt"
    exit 1
}
if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "[x] frontend\node_modules not found. First run:  cd frontend; npm install"
    exit 1
}
if (-not (Test-Path (Join-Path $backend ".env"))) {
    Write-Host "[!] backend\.env missing - copying .env.example"
    Copy-Item (Join-Path $backend ".env.example") (Join-Path $backend ".env")
}

# --- 1. Start Ollama (if installed) ---------------------------------------
if (Test-Path $ollamaExe) {
    $already = $false
    try {
        $null = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 2
        $already = $true
    } catch { }
    if (-not $already) {
        $env:OLLAMA_MODELS = Join-Path $env:LOCALAPPDATA "Ollama\models"
        Start-Process -FilePath $ollamaExe -ArgumentList "serve" -WindowStyle Hidden
        for ($i = 0; $i -lt 30; $i++) {
            Start-Sleep -Seconds 1
            try { $null = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 2; $already = $true; break } catch { }
        }
    }
    if ($already) { Write-Host "[ok] Ollama is running on http://127.0.0.1:11434" }
    else          { Write-Host "[!] Ollama did not start. AI features will use fallback templates." }
} else {
    Write-Host "[!] Ollama not installed - AI features will use fallback templates."
}

# --- 2. Start FastAPI backend ----------------------------------------------
$uvicorn = Join-Path $backend ".venv\Scripts\uvicorn.exe"
Start-Process -WorkingDirectory $backend `
    -FilePath $uvicorn `
    -ArgumentList "app.main:app", "--port", "8000"

# --- 3. Start Vite frontend -------------------------------------------------
# npm is a .cmd shim on Windows - it must be launched through cmd.exe.
$npmShim = "npm.cmd"
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodePath) {
    Write-Host "[x] Node.js not found on PATH. Install from https://nodejs.org"
    exit 1
}
Start-Process -WorkingDirectory $frontend `
    -FilePath "cmd.exe" `
    -ArgumentList "/c", "npm", "run", "dev" `
    -WindowStyle Hidden

# --- 4. Wait for both services ---------------------------------------------
Write-Host "[..] Waiting for backend on http://127.0.0.1:8000 ..."
$backendOk = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $null = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -TimeoutSec 2
        $backendOk = $true; break
    } catch { }
}
if ($backendOk) { Write-Host "[ok] Backend ready" } else { Write-Host "[x] Backend did not respond in 30 s" }

Write-Host "[..] Waiting for frontend on http://localhost:5173 ..."
$frontOk = $false
for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:5173/" -TimeoutSec 2 -UseBasicParsing
        if ($r.StatusCode -eq 200) { $frontOk = $true; break }
    } catch { }
}
if ($frontOk) { Write-Host "[ok] Frontend ready" } else { Write-Host "[x] Frontend did not respond in 60 s" }

# --- 5. Summary --------------------------------------------------------------
Write-Host ""
Write-Host "ResumeRadar is running:"
if ($backendOk) { Write-Host "  API docs  :  http://localhost:8000/docs" }
if ($frontOk)   { Write-Host "  App       :  http://localhost:5173" }
if ($frontOk)   { Write-Host "  AI health :  http://localhost:5173/api/health" }
Write-Host "Press Ctrl+C in each server window to stop."
