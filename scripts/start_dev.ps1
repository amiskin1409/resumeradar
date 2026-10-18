# ResumeRadar — start backend (FastAPI) + frontend (Vite) together
#
#   powershell -ExecutionPolicy Bypass -File scripts\start_dev.ps1
#
# Backend  → http://localhost:8000  (Swagger docs at /docs)
# Frontend → http://localhost:5173

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

if (-not (Test-Path (Join-Path $backend ".venv"))) {
    Write-Host "✗ backend\.venv not found. First run:"
    Write-Host "    cd backend; python -m venv .venv; .\.venv\Scripts\pip install -r requirements.txt"
    exit 1
}
if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "✗ frontend\node_modules not found. First run:  cd frontend; npm install"
    exit 1
}

Write-Host "→ Starting FastAPI backend on http://localhost:8000 ..."
Start-Process -WorkingDirectory $backend `
    -FilePath (Join-Path $backend ".venv\Scripts\uvicorn.exe") `
    -ArgumentList "app.main:app", "--reload", "--port", "8000"

Write-Host "→ Starting Vite dev server on http://localhost:5173 ..."
Start-Process -WorkingDirectory $frontend -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev"

Start-Sleep -Seconds 4
Write-Host ""
Write-Host "✓ ResumeRadar is starting:"
Write-Host "    App:  http://localhost:5173"
Write-Host "  API docs:  http://localhost:8000/docs"
Write-Host "  AI status: http://localhost:8000/api/health"
