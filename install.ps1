# AI-Suplex 777 - Core installer (Windows / PowerShell)
# Bootstraps a working AI-Suplex vault from this repo.
# Requires Node 20+ LTS. Python 3 is optional (richer --context).
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
# Flat layout: the repo root IS the vault. Copy an explicit allowlist.
$VaultItems = @(
  "AGENTS.md", "Focuses.md", "WELCOME.md", "LICENSE", "package.json",
  "AI-Suplex Kick-start", "Guides", "Memory", "Prompt Patterns",
  "Scripts", "Skills", "Templates", "Tests", "Tools"
)

# 1. Node 20+ LTS (777 is graph-free — the knowledge graph is an Ultra faculty)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Die "Node is required. Install Node 20+ LTS from https://nodejs.org"
}
$major = [int](& node -p "process.versions.node.split(String.fromCharCode(46))[0]")
if ($major -lt 20) {
  Die ("Node 20+ LTS required (found " + (& node --version) + ").")
}
Say ("Node " + (& node --version) + " OK")

# 2. Template present (the repo root IS the vault after the flat layout)
if (-not (Test-Path (Join-Path $ScriptDir "Tools/3lm.js"))) {
  Die "Tools/3lm.js not found. Run this from the repo root."
}
foreach ($item in $VaultItems) {
  if (-not (Test-Path (Join-Path $ScriptDir $item))) {
    Die ("Missing vault item: " + $item + " (run this from the repo root)")
  }
}
Say ("Template: " + $ScriptDir + " (vault items copied explicitly)")

# 3. Target guard (never overwrite a non-empty directory)
if ((Test-Path $Target) -and (Get-ChildItem -Force $Target | Select-Object -First 1)) {
  Die ("Target already exists and is not empty: " + $Target + " (choose another path)")
}
Say ("Target:   " + $Target)

# 4. Copy the vault items (explicit allowlist)
New-Item -ItemType Directory -Force -Path $Target | Out-Null
foreach ($item in $VaultItems) {
  Copy-Item -Path (Join-Path $ScriptDir $item) -Destination $Target -Recurse -Force
}
Say "Copied the vault template."

# 5. Initialise (period + structure), then build the file index
Push-Location $Target
try {
  Say "Initialising the vault (period + cycle structure)..."
  & node Tools/initialise-vault.js | Out-Null
  Say "Building the file index..."
  & node Tools/vault-index.js --current | Out-Null
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