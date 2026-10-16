---
type: ai-suplex-command
command: "Kickstart"
pattern_file: "📄 Pattern - Kickstart.md"
spec_file: "AI-Suplex Kick-start/Spec — Context & Threads.md"
role: "Builder"
date: 2026-10-16
---

# ⚡ AI-Suplex: Kickstart — Command

Load the **instance's** context before assisting — the context-awareness order, instance-aware.

## 🎯 Trigger

```
AI-Suplex: Kickstart
```

> **Bare `Kickstart` ≡ `Kickstart(Random Tasks)`** — random-task is the default lane (catch-all / misc).

## ⚡ Shorthand (thread + instance variants)

`AI-Suplex: Kickstart(Daily Tasks)` · `AI-Suplex: Kickstart(Long Running Tasks)` · `AI-Suplex: Kickstart(Random Tasks)` · `AI-Suplex: Kickstart(Realist)` — the same command with `THREAD` set. **Realist is special:** no context file, no session — it loads the Realist persona + the latest `Reviews/Realist/` log + the Active Mission Context.

**Instance selection (N lanes only):**
- `Kickstart(Long Running Tasks)` — list open instances · **one** → load it · **many** → ask
- `Kickstart(Random Tasks: vault-migration)` — select by **slug**
- `Kickstart(Random Tasks: 2)` — select by **ref**

| Variant | THREAD | Instances | Loads |
|---|---|---|---|
| `AI-Suplex: Kickstart` | `random-task` (default) | N | instance brief(s) |
| `AI-Suplex: Kickstart(Daily Tasks)` | `daily-tasks` | 1 | singleton brief |
| `AI-Suplex: Kickstart(Long Running Tasks)` | `long-running-tasks` | N | instance brief(s) |
| `AI-Suplex: Kickstart(Random Tasks)` | `random-task` | N | instance brief(s) |
| `AI-Suplex: Kickstart(Realist)` | `realist` | 1 | persona + latest `Reviews/Realist/` log |

## 🤖 What the AI Does

1. **Reads** the Pattern: [[📄 Pattern - Kickstart]] + `Spec — Context & Threads`.
2. **Resolves the THREAD + INSTANCE** — default `random-task`; never guess if the source is ambiguous. N lanes: list open instances; one → load it; many → ask which.
3. **Fast Path** — reads the Active Mission Context + the instance's context file (brief for daily / long-running / random; persona + latest `Reviews/Realist/` log for realist) → runs `node Tools/3lm.js start --context`.
4. **Full Path** (per task) — the deep context order from the Pattern.
5. **Reports** — the resolved THREAD + INSTANCE, the context file loaded, and the staleness-guard verdict.

## 🧠 Memory Loop

**None.** Kickstart *loads* context; it captures nothing.

## 🔗 Related

| What | Where |
|---|---|
| Pattern | `Prompt Patterns/📄 Pattern - Kickstart.md` |
| Spec (instances) | `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.0) |
| Write-side counterpart | `Prompt Patterns/📄 Pattern - Save Context.md` (v3) |

---

*TWABAM ⚡! Kickstart — one thread, one instance, one load.*