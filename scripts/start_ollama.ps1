# ResumeRadar - start the local Ollama server if it is not already running.
#
# Used by the optional Windows "Startup" shortcut so the private AI layer is
# available automatically after login. Safe to run repeatedly.
#
#   powershell -ExecutionPolicy Bypass -File scripts\start_ollama.ps1

$ollama = Join-Path $env:LOCALAPPDATA "Programs\Ollama\ollama.exe"
if (-not (Test-Path $ollama)) {
    $cmd = Get-Command ollama -ErrorAction SilentlyContinue
    if ($cmd) { $ollama = $cmd.Source }
    else { Write-Host "Ollama not found - run scripts\setup_ollama.ps1 first."; exit 1 }
}

# Already serving? Nothing to do.
try {
    $null = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 3
    Write-Host "Ollama is already running."
    exit 0
} catch { }

Write-Host "Starting the Ollama server ..."
Start-Process -FilePath $ollama -ArgumentList "serve" -WindowStyle Hidden

for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $null = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 2
        Write-Host "Ollama is up on http://127.0.0.1:11434"
        exit 0
    } catch { }
}

Write-Host "Ollama did not respond in time. Try running '$ollama serve' manually."
exit 1
