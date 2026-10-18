# n8n — AI-Suplex Rituals (T008)

Wire the ritual executor into n8n so the recurring maintenance runs hands-free.

## Prerequisites
- n8n instance with terminal access to the vault host (same machine, or a shared volume).
- `node` + `python3` on the n8n host (already present for the WQR stack).

## How it works
Each workflow = **Schedule Trigger** → **Execute Command** calling `Tools/rituals.sh`.
The script resolves the vault from its own path, so the command only needs the
script's absolute path.

### 1. Daily maintenance
- **Schedule Trigger** — Cron expression: `30 21 * * *`
- **Execute Command** — Command: `bash "/path/to/your/ai-suplex-vault/Tools/rituals.sh" daily`

### 2. Saturday pre-hunt
- **Schedule Trigger** — Cron expression: `0 6 * * 6`
- **Execute Command** — Command: `bash "…/Tools/rituals.sh" saturday`

### 3. Tuesday reset
- **Schedule Trigger** — Cron expression: `0 6 * * 2`
- **Execute Command** — Command: `bash "…/Tools/rituals.sh" tuesday`

## Notes
- Saturday's `bbomb_hunter.py` needs `DEEPSEEK_API_KEY` (or `GEMINI_API_KEY`)
  in the n8n host environment — the same keys already in the vault's `.env`.
  Pass them via an n8n credential or an env file on the host.
- Capture the Execute Command output to an audit trail (e.g. a `Memory/ritual-log.md`
  field or a DB row) if you want a persistent log.
- `rituals.sh` is `set -euo pipefail` — it fails loudly (non-zero exit) if any
  ritual command errors, so n8n's error workflow can alert you.
