#!/usr/bin/env bash
#
# rituals.sh — AI-Suplex cron executor (T008)
#
# Runs the recurring maintenance rituals hands-free, in the correct order.
# The script locates the vault from its own path (no cwd assumption), so it
# works from cron, n8n, or an interactive shell even on an emoji/spaces path.
#
# Usage:
#   bash Tools/rituals.sh daily     # light daily maintenance (memory index + quick scan)
#   bash Tools/rituals.sh saturday  # Saturday pre-hunt (full scan)
#   bash Tools/rituals.sh tuesday   # Tuesday reset (full scan)
#   bash Tools/rituals.sh           # print the schedule + usage
#
# 777 is graph-free: the knowledge graph is an Ultra faculty and lives in the
# harness, not the free lane. This script builds the file index only.
set -euo pipefail

VAULT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$VAULT"

log() { printf '\033[1;36m[ritual:%s]\033[0m %s\n' "$1" "$2"; }
header() { printf '\n\033[1;33m── %s ──\033[0m\n' "$1"; }

daily() {
  header "DAILY MAINTENANCE"
  log daily "refresh memory index" && node Tools/3lm.js index
  log daily "quick vault scan (Tier 1 graph source)" && node Tools/vault-index.js --quick
}

saturday() {
  header "SATURDAY PRE-HUNT"
  log saturday "full vault scan (fresh artifacts for the hunt)" && node Tools/vault-index.js
  # B-Bomb ranking (bbomb_hunter.py) is an LLM step — it lives in hermes cron (D5: one job, one owner).
}

tuesday() {
  header "TUESDAY RESET — FULL REBUILD"
  log tuesday "full vault scan (all artifacts, all tiers)" && node Tools/vault-index.js
}

case "${1:-}" in
  daily) daily ;;
  saturday) saturday ;;
  tuesday) tuesday ;;
  *) cat <<'EOF'
AI-Suplex ritual executor — hands-free maintenance (T008)

Usage: bash Tools/rituals.sh <daily|saturday|tuesday>

  daily     node Tools/3lm.js index  +  node Tools/vault-index.js --quick
  saturday  vault-index (full)  (B-Bomb ranking = hermes cron)
  tuesday   vault-index (full)

Schedule it:
  cron → see Tools/cron/crontab.example
  n8n  → see Tools/n8n/README.md
EOF
  ;;
esac
