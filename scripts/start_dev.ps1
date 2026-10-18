# ResumeRadar - start backend (FastAPI) + frontend (Vite) together
#
#   powershell -ExecutionPolicy Bypass -File scripts\start_dev.ps1
#
# Backend  -> http://localhost:8000  (Swagger docs at /docs)
# Frontend -> http://localhost:5173
#
# NOTE: keep this file ASCII-only. Windows PowerShell 5.1 reads BOM-less files as
# ANSI, where multi-byte UTF-8 glyphs turn into smart quotes and break parsing.

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

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
    Write-Host "[!] backend\.env missing - copying .env.example (change SECRET_KEY before deploying)."
    Copy-Item (Join-Path $backend ".env.example") (Join-Path $backend ".env")
}

# Optional: bring up the local AI layer if Ollama is installed.
$ollamaScript = Join-Path $PSScriptRoot "start_ollama.ps1"
if (Test-Path $ollamaScript) {
    try { & $ollamaScript | Out-Null } catch { Write-Host "[!] Ollama not started - AI features will use fallbacks." }
}

Write-Host "[..] Starting the FastAPI backend on http://localhost:8000 ..."
Start-Process -WorkingDirectory $backend `
    -FilePath (Join-Path $backend ".venv\Scripts\uvicorn.exe") `
    -ArgumentList "app.main:app", "--reload", "--port", "8000"

Write-Host "[..] Starting the Vite dev server on http://localhost:5173 ..."
Start-Process -WorkingDirectory $frontend -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev"

Start-Sleep -Seconds 4
Write-Host ""
Write-Host "[ok] ResumeRadar is starting:"
Write-Host "       App:     http://localhost:5173"
Write-Host "       API docs: http://localhost:8000/docs"
Write-Host "       AI status: http://localhost:8000/api/health"
