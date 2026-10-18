# ResumeRadar - one-command local AI setup (no admin rights required)
#
#   powershell -ExecutionPolicy Bypass -File scripts\setup_ollama.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\setup_ollama.ps1 -Model qwen2.5:1.5b
#
# Downloads the portable Ollama build, starts the server, and pulls a model.
#
# NOTE: keep this file ASCII-only. Windows PowerShell 5.1 reads BOM-less files as
# ANSI, where multi-byte UTF-8 glyphs turn into smart quotes and break parsing.

param(
    [string]$Model = "qwen2.5:3b",
    [string]$InstallDir = "$env:LOCALAPPDATA\Programs\Ollama"
)

$ErrorActionPreference = "Stop"
$exe = Join-Path $InstallDir "ollama.exe"
$zip = Join-Path $env:TEMP "ollama-windows-amd64.zip"

# 1. Use an existing install, or fetch the portable build
if (Test-Path $exe) {
    Write-Host "[ok] Using the existing Ollama at $exe"
} else {
    $fromPath = Get-Command ollama -ErrorAction SilentlyContinue
    if ($fromPath) {
        $exe = $fromPath.Source
        Write-Host "[ok] Using Ollama from PATH: $exe"
    } else {
        Write-Host "[..] Downloading the portable Ollama build (~1.4 GB) ..."
        if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) {
            throw "curl.exe not found. Windows 10+ ships it by default."
        }
        if (Test-Path $zip) {
            Write-Host ("[..] Resuming a partial download ({0:N1} MB already fetched)" -f ((Get-Item $zip).Length / 1MB))
        }
        # -C - resumes; --speed-limit/--speed-time abort stalled connections so the
        # download can never hang forever, and --retry picks it back up.
        & curl.exe -L -C - --retry 20 --retry-delay 10 --retry-all-errors `
            --speed-limit 10240 --speed-time 90 --progress-bar -o $zip `
            "https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.zip"
        if ($LASTEXITCODE -ne 0 -or -not (Test-Path $zip)) {
            throw "Download failed (curl exit $LASTEXITCODE). Re-run this script - it resumes where it stopped."
        }

        Write-Host "[..] Extracting to $InstallDir ..."
        New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
        Expand-Archive -Path $zip -DestinationPath $InstallDir -Force
        Remove-Item $zip -Force
        if (-not (Test-Path $exe)) { throw "Extraction failed - ollama.exe not found." }
        Write-Host "[ok] Installed to $InstallDir"
    }
}

# 2. Start the server if it is not already responding
$running = $false
try {
    $null = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 2
    $running = $true
} catch { }
if (-not $running) {
    Write-Host "[..] Starting the Ollama server in the background ..."
    Start-Process -FilePath $exe -ArgumentList "serve" -WindowStyle Hidden
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        try { $null = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 2; $running = $true; break } catch { }
    }
}
if (-not $running) { throw "The Ollama server did not start. Try running '$exe serve' manually." }
Write-Host "[ok] Ollama server is up on http://127.0.0.1:11434"

# 3. Pull the model
$models = & $exe list 2>$null
if ($LASTEXITCODE -eq 0 -and ($models -match [regex]::Escape($Model))) {
    Write-Host "[ok] Model '$Model' is already present"
} else {
    Write-Host "[..] Pulling model '$Model' (this can take a few minutes) ..."
    & $exe pull $Model
}

# 4. Make it start automatically at login (optional, reversible)
Write-Host ""
Write-Host "[done] Local AI ready.  Model: $Model"
Write-Host "       ResumeRadar detects it automatically - check http://localhost:8000/api/health"
Write-Host "       Tip: add scripts\start_ollama.ps1 to your Startup folder to keep it always on."
