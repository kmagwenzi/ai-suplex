# AI-Suplex 777 - Core installer (Windows / PowerShell)
# Bootstraps a working AI-Suplex vault from this repo.
# Requires Node 22+. Python 3 is optional (richer --context).
#Requires -Version 5.1
[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string]$Target = (Join-Path (Get-Location) "ai-suplex-vault")
)

$ErrorActionPreference = "Stop"

function Say  { param([string]$m) Write-Host "[install] $m" -ForegroundColor Cyan }
function Warn { param([string]$m) Write-Host "[install] WARN: $m" -ForegroundColor Yellow }
function Die  { param([string]$m) Write-Host "[install] ERROR: $m" -ForegroundColor Red; exit 1 }

Say "AI-Suplex 777 - Core installer (Windows)"

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$Template  = Join-Path $ScriptDir "AI-Suplex-777"

# 1. Node 22+ (the knowledge graph uses node:sqlite)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Die "Node is required. Install Node 22+ from https://nodejs.org"
}
$major = [int](& node -p "process.versions.node.split(String.fromCharCode(46))[0]")
if ($major -lt 22) {
  Die ("Node 22+ required (found " + (& node --version) + "); the knowledge graph needs node:sqlite.")
}
Say ("Node " + (& node --version) + " OK")

# 2. Template present
if (-not (Test-Path $Template)) {
  Die ("Template not found at " + $Template + ". Run this from the repo root.")
}
Say ("Template: " + $Template)

# 3. Target guard (never overwrite a non-empty directory)
if ((Test-Path $Target) -and (Get-ChildItem -Force $Target | Select-Object -First 1)) {
  Die ("Target already exists and is not empty: " + $Target + " (choose another path)")
}
Say ("Target:   " + $Target)

# 4. Copy the sanitised template (including dotfiles)
New-Item -ItemType Directory -Force -Path $Target | Out-Null
Get-ChildItem -Force -Path $Template | Copy-Item -Destination $Target -Recurse -Force
Say "Copied the vault template."

# 5. Initialise (period + structure), then the index + graph
Push-Location $Target
try {
  Say "Initialising the vault (period + cycle structure)..."
  & node Tools/initialise-vault.js | Out-Null
  Say "Building the file index..."
  & node Tools/vault-index.js --current | Out-Null
  Say "Building the knowledge graph..."
  & node Tools/knowledge-graph.js --build-current | Out-Null
} finally {
  Pop-Location
}

# 6. Python is optional - --context degrades gracefully without it
$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) { $py = Get-Command python3 -ErrorAction SilentlyContinue }
if ($py) {
  Say "Python found - full context generation available."
} else {
  Warn "Python not found - 3lm start --context skips the generated brief; everything else works."
}

# 7. Smoke test
Push-Location $Target
try {
  Say "Smoke test..."
  & node Tools/3lm.js status | Out-Null
} finally {
  Pop-Location
}
Say "Install complete."

Write-Host ""
Write-Host ("  Your vault: " + $Target)
Write-Host ""
Write-Host "  Next:"
Write-Host ("    cd " + $Target)
Write-Host "    node Tools/3lm.js start --context"
Write-Host ""
Write-Host "  Docs: AGENTS.md | Guides/ | AI-Suplex Kick-start/"