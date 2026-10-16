---
title: "Pattern - Kickstart"
date: 2026-10-12
revised: 2026-10-16
version: 2.0
tags: [pattern, kickstart, context, startup, instance-aware, builder, orchestration]
---

# AI-Suplex Prompt Pattern — Kickstart (Context Awareness Order)

Load context when the Hustler asks for help. **Human + AI**: the rituals (Tuesday / Saturday) keep human judgment in the loop; the tools generate, guard, verify. **The Hustler always decides.**

## 🧵 Thread & instance resolution (load-bearing)

Kickstart is **instance-aware**. The THREAD selects the lane; the INSTANCE selects which context file is authoritative — and whether a *session* is even possible:

| THREAD | Instances | Context file | Runs a session? |
|---|---|---|---|
| **daily-tasks** | 1 (singleton) | `Context Kick-start/Active/daily-tasks.md` | ✅ yes — the only one |
| **long-running-tasks** | N | `Context Kick-start/Active/long-running-tasks-{ref}-{slug}.md` | ❌ no — artifacts + Save Context |
| **random-task** | N | `Context Kick-start/Active/random-task-{ref}-{slug}.md` | ❌ no — artifacts + Save Context |
| **realist** | 1 (singleton) | *(5-line log to `Reviews/Realist/` — not a context file)* | ❌ no |

**Default:** bare `AI-Suplex: Kickstart` ≡ `Kickstart(Random Tasks)` — random-task is the catch-all / misc lane. `Kickstart(Realist)` loads the Realist persona + the latest `Reviews/Realist/` log (no context file, no session).

**Instance resolution (N lanes):** list open instances · **one** → load it · **many** → ask. Select by slug (`Kickstart(Random Tasks: vault-migration)`) or by ref (`Kickstart(Random Tasks: 2)`).

## ⚡ Fast Path — One Command (the context core)

1. **Active Mission Context** — read `Context Kick-start/Active Mission Context.md` (the live state: date, tasklist, status, blockers, decisions, next actions).
2. **Instance brief** — read the selected instance file `Context Kick-start/Active/{THREAD}-{ref}-{slug}.md` (or `{THREAD}.md` for a singleton). N lanes: list first, then load the chosen instance.
3. **Vault Awareness** — `Memory/vault-context.md` (current cycle/week) + `Memory/vault-index.md` (last 14 days).
4. **Run `node Tools/3lm.js start --context`** — three things at once:
   - **Staleness guard** — verifies the Active Mission Context `**Date:**`, vault-context, knowledge-graph.db, index, lessons are fresh — and the **oldest `status: open` instance**.
   - **Memory load** — semantic, lessons, recent episodes, procedural, active tasklists.
   - **Generated session context** — `session_context.py` (Graph RAG Impl 2): last 3 sessions · blockers · pending B-Bombs · insights · cross-focus connections.

## 📋 Full Path — Deep Context (per task)

1. **AGENTS.md** — the standing instructions.
2. **Active Mission Context** — `Context Kick-start/Active Mission Context.md`.
3. **Profile** — `Context Kick-start/Profile.md`.
4. **7-Week Plan** — latest cycle plan.
5. **Triple Assault Plan** — the revenue architecture.
6. **Workflow Pipeline** — the AI-Suplex pipeline doc.
7. **Useful Tools** — `Context Kick-start/Useful Tools.md`.
8. **Project Index** — `Context Kick-start/Project Index.md`.
9. **Tasklists/Active/** — the referenced tasklist.
10. **Sessions/Active/Start/** — the active mission.
11. **Vault Awareness** — vault-context + vault-index + the weekly rollup + `knowledge-graph.js --query`.
12. **OKF Compatibility** — root `index.md` declares `okf_version`.

## 🧘 The Ritual — Human + AI

- **Tuesday (Reset):** archive → structure → new tasklist → `3lm start --context` → refresh the Active Mission Context → git.
- **Saturday (B-Bomb + Study):** `bbomb_hunter.py` → promote 2–3 → weekly review → git → study mileage.
- **The split:** the AI generates & guards; the Hustler decides & validates.

## 🧠 Memory Loop

**None.** Kickstart *loads* context — it captures nothing. No `3lm add-lessons`, no episode. The staleness guard inside `3lm start --context` is the loop's guard rail.

## 🔗 Related

- `Prompt Patterns/AI-Suplex Commands/⚡ Command — Kickstart.md` (the invocation + thread/instance shorthands)
- `Prompt Patterns/📄 Pattern - Save Context.md` (v3 — the write-side counterpart)
- `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.0 — the instance rules)

---

*Pattern v2.0 captured via AI-Suplex on 2026-10-16 — Cycle 2, Week 7. TWABAM ⚡*