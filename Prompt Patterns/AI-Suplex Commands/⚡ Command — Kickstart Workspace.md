---
type: ai-suplex-command
command: "Kickstart Workspace"
pattern_file: "📄 Pattern - Kickstart Workspace.md"
spec_file: "AI-Suplex Kick-start/Spec — Context & Threads.md"
role: "Builder"
date: 2026-11-11
---

# ⚡ AI-Suplex: Kickstart Workspace — Command

Load and run a defined **workspace** — the client-facing name for `Kickstart`. `Kickstart Workspace` **executes**; it never creates.

## 🎯 Trigger

```
AI-Suplex: Kickstart Workspace

WORKSPACE:
  - Type: Project
  - Title: workspaces-lean-ui
```

## ⚡ Shorthand (workspace type)

`Kickstart Workspace(Daily Work)` · `Kickstart Workspace(Project)` · `Kickstart Workspace(Quick Task)` · `Kickstart Workspace(Review)` — the same command with the type set. **The legacy `Kickstart` command remains** and maps to the same lanes.

**Instance selection (N lanes):**
- `Kickstart Workspace(Project)` — list open workspaces · **one** → load it · **many** → ask
- `Kickstart Workspace(Project: workspaces-lean-ui)` — select by **slug**
- `Kickstart Workspace(Project: 10)` — select by **ref**

## 🔤 Workspace type → internal lane

| Workspace type | Internal lane | Instances |
|---|---|---|
| Daily Work | `daily-tasks` | 1 (singleton) |
| Project | `project-tasks` | Many |
| Quick Task | `random-tasks` | Many |
| Review | `realist` | 1 (singleton) |

## 🤖 What the AI Does

1. **Reads** the Pattern + Spec.
2. **Resolves the workspace** — type → lane, then instance (slug or ref). One open → load it; many → ask.
3. **Loads context** — the Current mission brief (`Active Mission Context.md`) + the workspace brief + `node Tools/3lm.js start --context` (staleness guard + memory load + generated context).
4. **Executes the workspace's tasklist** if one exists; otherwise the tasks in the brief.

## 🛡️ The guardrail

**Kickstart runs; Define creates.** `Kickstart Workspace` never creates a brief, never allocates a ref, never writes a new file. It only loads and executes what already exists.

## 🧠 Memory Loop

**None** at kickstart — it loads context, captures nothing.

## 🔗 Related

| What | Where |
|---|---|
| Pattern | `Prompt Patterns/📄 Pattern - Kickstart Workspace.md` |
| Create-side | `Prompt Patterns/AI-Suplex Commands/⚡ Command — Define Workspace.md` |
| Spec | `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.3) |

---

*TWABAM ⚡! Kickstart Workspace — run the workspace, never create it.*
