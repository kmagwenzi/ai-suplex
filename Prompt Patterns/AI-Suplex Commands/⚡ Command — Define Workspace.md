---
type: ai-suplex-command
command: "Define Workspace"
pattern_file: "📄 Pattern - Define Workspace.md"
spec_file: "AI-Suplex Kick-start/Spec — Context & Threads.md"
role: "Builder"
date: 2026-11-11
---

# ⚡ AI-Suplex: Define Workspace — Command

Create a **workspace** — the client-facing word for a thread instance. `Define Workspace` **creates** the workspace brief; it never loads it, never runs a session, never executes a task.

## 🎯 Trigger

```
AI-Suplex: Define Workspace

WORKSPACE:
  - Type: Quick Task
  - Title: quick-wins
  - Mission: Check off quick wins from the daily hustle
  - Outcome: All selected quick wins are completed or explicitly blocked with a next action.

TASKS:
1. Publish LinkedIn post
2. Add Google Cloud API key for kmagwenzi@ai-suplex
3. Call Mr Evans
4. Send Mr Evans the links:
   - https://app.wqr.co.zw
   - https://ai-suplex.co.zw

SETTINGS:
  - Create tasklist: NO
  - Agent: Codex
  - Mode: Trusted local agent
  - Priority: High
  - Due date: Optional
```

## 🔤 Workspace type → internal lane

| Workspace type | Internal lane | Instances | Create tasklist (default) |
|---|---|---|---|
| Daily Work | `daily-tasks` | 1 (singleton) | Yes |
| Project | `project-tasks` | Many | Yes |
| Quick Task | `random-tasks` | Many | No |
| Review | `realist` | 1 (singleton) | No |

## 🤖 What the AI Does

1. **Reads** the Pattern + the Spec (R1–R12).
2. **Resolves the type → lane**, allocates the next `{ref}` (per thread, reset per day — R9), and slugs the title.
3. **Writes the workspace brief** — `Context Kick-start/Active/{lane}-{ref}-{slug}.md` (singletons: `{lane}.md`) — with the **Outcome** as the definition of done, and a tasklist **only if** `Create tasklist: YES`.
4. **States the Outcome explicitly** — the mission is the intent; the Outcome is the acceptance test.

## 🛡️ The guardrail

**Define creates. Kickstart runs.** `Define Workspace` never loads, never executes, never opens a session. To run it, use `AI-Suplex: Kickstart Workspace`.

## 🧠 Memory Loop

**None** at define time — a workspace that has not run has produced nothing to remember.

## 🔗 Related

| What | Where |
|---|---|
| Pattern | `Prompt Patterns/📄 Pattern - Define Workspace.md` |
| Run-side | `Prompt Patterns/AI-Suplex Commands/⚡ Command — Kickstart Workspace.md` |
| Spec | `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.3) |

---

*TWABAM ⚡! Define Workspace — create the workspace, never run it.*
