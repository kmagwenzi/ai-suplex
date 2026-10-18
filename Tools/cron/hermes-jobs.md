# Hermes cron — the agent-shaped rituals (T008)

The LLM-in-loop half of the cron executor. Deterministic maintenance stays in
`rituals.sh` + `Tools/cron/crontab.example`; these jobs carry the LLM or a gateway
delivery. **D5 — one job, one owner.**

## The partition

| Owner | Runs | LLM? | Gateway? |
|---|---|---|---|
| `rituals.sh` (crontab / n8n) | `3lm index` · `vault-index` · `knowledge-graph --build` | ❌ | ❌ |
| `hermes cron` (this file) | operator brief · weekly review · outreach audit · B-Bomb ranking | ✅ | ✅ (D9) |

The rule: `rituals.sh` never calls the LLM; `hermes cron` never re-implements the
index/graph math. The Saturday B-Bomb ranking (`bbomb_hunter.py`, an LLM scorer) was
moved OUT of `rituals.sh` into job 4 below (2026-10-17).

## Gating — apply ONLY after

1. the `ai-suplex` profile exists (T009): `hermes profile create ai-suplex --clone-from default`
2. the gateway runs + the Discord surface is wired (T011): `hermes gateway install`

`hermes cron create` has no `--profile` flag — run it from inside the `ai-suplex`
profile so the jobs attach to the right operator seat.

## The scripts (one-liners in ~/.hermes/scripts/)

- `operator-brief.sh` → `node /path/to/vault/Tools/asmc.js open` — prints the deterministic brief
- `bbomb-hunter.sh` → `python3 /path/to/vault/Tools/bbomb_hunter.py` — LLM ranking (needs DEEPSEEK_API_KEY / GEMINI_API_KEY)

## The jobs

### 1 · Daily morning — the operator brief → Discord (D9)

```bash
hermes cron create "0 7 * * *" \
  --name "operator-brief" \
  --deliver discord \
  --script operator-brief.sh \
  --skill save-context \
  "The script printed today's operator brief. Summarize it into a short morning dispatch — date, open instances, each tasklist's next task, any stale context — and deliver it to Discord. Read-only: never edit the vault."
```

### 2 · Weekly (Sat) — Weekly Review draft

```bash
hermes cron create "0 7 * * 6" \
  --name "weekly-review-draft" \
  --skill weekly-review \
  "Generate the Weekly Review draft into Reviews/, then run 3lm promote --min 70, revise, and index. Surface contradictions for the Hustler before promoting."
```

### 3 · Weekly (Sat) — outreach audit (terminal states only)

```bash
hermes cron create "30 6 * * 6" \
  --name "outreach-audit" \
  --skill realist \
  "Count ONLY terminal-state outreach (SENT / SUBMITTED / CLAIMED / PAID) from the outreach board. Report the count and any row stuck at a non-terminal state. Read-only."
```

### 4 · Sat — B-Bomb ranking (bbomb_hunter.py, LLM)

```bash
hermes cron create "0 6 * * 6" \
  --name "bbomb-ranking" \
  --no-agent \
  --script bbomb-hunter.sh \
  --deliver local
```

### 5 · Sat 2 AM — encrypted vault backup (EXISTS)

Owned by `Scripts/ai-suplex-backup.sh` → Google Drive + Dropbox. Scheduled independently;
not re-created here (one owner, unchanged).
