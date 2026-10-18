# ResumeRadar — one-command local AI setup (no admin rights required)
#
#   powershell -ExecutionPolicy Bypass -File scripts\setup_ollama.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\setup_ollama.ps1 -Model qwen2.5:1.5b
#
# Downloads the portable Ollama build, starts the server, and pulls a model.

param(
    [string]$Model = "qwen2.5:3b",
    [string]$InstallDir = "$env:LOCALAPPDATA\Programs\Ollama"
)

$ErrorActionPreference = "Stop"
$exe = Join-Path $InstallDir "ollama.exe"
$zip = "$env:TEMP\ollama-windows-amd64.zip"

# 1. Find or install ollama.exe -------------------------------------------------
$existing = Get-Command ollama -ErrorAction SilentlyContinue
if ($existing) {
    $exe = $existing.Source
    Write-Host "✓ Found installed Ollama: $exe"
} elseif (Test-Path $exe) {
    Write-Host "✓ Found portable Ollama: $exe"
} else {
    Write-Host "→ Downloading portable Ollama (~1.4 GB) ..."
    if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) {
        throw "curl.exe not found. Windows 10+ ships it by default."
    }
    if (Test-Path $zip) {
        Write-Host ("  Found a partial download ({0:N0} MB) — resuming." -f ((Get-Item $zip).Length / 1MB))
    }
    # -C - resumes a partial download; --speed-limit/--speed-time abort a stalled
    # connection instead of hanging forever, then --retry picks it back up.
    & curl.exe -L -C - --retry 20 --retry-delay 10 --retry-all-errors `
        --speed-limit 10240 --speed-time 90 --progress-bar -o $zip `
        "https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.zip"
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $zip)) {
        throw "Download failed (curl exit $LASTEXITCODE). Just re-run this script — it resumes from where it stopped."
    }

    Write-Host "→ Extracting to $InstallDir ..."
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
    Expand-Archive -Path $zip -DestinationPath $InstallDir -Force
    Remove-Item $zip -Force
    if (-not (Test-Path $exe)) { throw "Extraction failed — ollama.exe not found." }
    Write-Host "✓ Installed to $InstallDir"
}

# 2. Start the server if it is not already responding ---------------------------
$running = $false
try {
    $null = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 2
    $running = $true
} catch { }
if (-not $running) {
    Write-Host "→ Starting Ollama server (background) ..."
    Start-Process -FilePath $exe -ArgumentList "serve" -WindowStyle Hidden
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        try { $null = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 2; $running = $true; break } catch {}
    }
}
if (-not $running) { throw "Ollama server did not start. Try running '$exe serve' manually." }
Write-Host "✓ Ollama server is up on http://localhost:11434"

# 3. Pull the model -------------------------------------------------------------
$models = & $exe list 2>$null
if ($LASTEXITCODE -eq 0 -and ($models -match [regex]::Escape($Model))) {
    Write-Host "✓ Model '$Model' already present"
} else {
    Write-Host "→ Pulling model '$Model' (this can take a few minutes) ..."
    & $exe pull $Model
}

Write-Host ""
Write-Host "✅ Local AI ready.  Model: $Model"
Write-Host "   ResumeRadar will detect it automatically — check http://localhost:8000/api/health"
Write-Host "   Tip: keep 'ollama serve' running (add it to Startup if you want it always on)."
