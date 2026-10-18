#!/usr/bin/env bash
# operator-brief.sh — the deterministic morning brief (T011).
# Emits the asmc open brief for the hermes cron agent to summarize + deliver to Discord (D9).
# Resolves the vault from its own path (no cwd assumption) — safe from cron / hermes.
set -euo pipefail
VAULT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec node "$VAULT/Tools/asmc.js" open
