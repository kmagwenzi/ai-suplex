#!/usr/bin/env bash
# AI-Suplex 777 - Core installer
# Bootstraps a working AI-Suplex vault from this repo in under 10 minutes.
# Requires Node 22+ (node:sqlite). Python 3 is optional (richer --context).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Flat layout: the repo root IS the vault. Copy an explicit allowlist — never
# .git / install scripts / README — and never recurse into the default target.
VAULT_ITEMS=(
  "AGENTS.md" "Focuses.md" "WELCOME.md" "LICENSE" "package.json"
  "AI-Suplex Kick-start" "Guides" "Memory" "Prompt Patterns"
  "Scripts" "Skills" "Templates" "Tests" "Tools"
)
TARGET="${1:-$PWD/ai-suplex-vault}"

say()  { echo "[install] $1"; }
warn() { echo "[install] WARN: $1"; }
die()  { echo "[install] ERROR: $1" >&2; exit 1; }

say "AI-Suplex 777 - Core installer"

# 1. Node 22+ (the knowledge graph uses node:sqlite)
command -v node >/dev/null 2>&1 || die "Node is required. Install Node 22+ from https://nodejs.org"
if ! node -e "process.exit(Number(process.versions.node.split(String.fromCharCode(46))[0]) >= 22 ? 0 : 1)"; then
  die "Node 22+ required (found $(node --version)); the knowledge graph needs node:sqlite."
fi
say "Node $(node --version) OK"

# 2. Template present (the repo root IS the vault after the flat layout)
[ -f "$SCRIPT_DIR/Tools/3lm.js" ] || die "Tools/3lm.js not found. Run this from the repo root."
for item in "${VAULT_ITEMS[@]}"; do
  [ -e "$SCRIPT_DIR/$item" ] || die "Missing vault item: $item (run this from the repo root)"
done
say "Template: $SCRIPT_DIR (vault items copied explicitly)"

# 3. Target guard (never overwrite a non-empty directory)
if [ -e "$TARGET" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null || true)" ]; then
  die "Target already exists and is not empty: $TARGET (choose another path)"
fi
say "Target:   $TARGET"

# 4. Copy the vault items (explicit allowlist)
mkdir -p "$TARGET"
for item in "${VAULT_ITEMS[@]}"; do
  cp -R "$SCRIPT_DIR/$item" "$TARGET/"
done
say "Copied the vault template."

# 5. Initialise (period + structure), then build the index + graph
cd "$TARGET"
say "Initialising the vault (period + cycle structure)..."
node Tools/initialise-vault.js >/dev/null
say "Building the file index..."
node Tools/vault-index.js --current >/dev/null
say "Building the knowledge graph..."
node Tools/knowledge-graph.js --build-current >/dev/null

# 6. Python is optional - --context degrades gracefully without it
if command -v python3 >/dev/null 2>&1; then
  say "Python 3 found - full context generation available."
else
  warn "Python 3 not found - 3lm start --context skips the generated brief; everything else works."
fi

# 7. Smoke test
say "Smoke test..."
node Tools/3lm.js status >/dev/null
say "Install complete."

echo
echo "  Your vault: $TARGET"
echo
echo "  Next:"
echo "    cd $TARGET"
echo "    node Tools/3lm.js start --context"
echo
echo "  Docs: AGENTS.md | Guides/ | AI-Suplex Kick-start/"