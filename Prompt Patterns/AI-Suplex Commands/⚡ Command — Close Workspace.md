---
type: ai-suplex-command
command: "Close Workspace"
pattern_file: "📄 Pattern - Close Workspace.md"
spec_file: "AI-Suplex Kick-start/Spec — Context & Threads.md"
role: "Builder"
date: 2026-11-24
---

# ⚡ AI-Suplex: Close Workspace — Command

Close a finished **workspace** — the client-facing name for `Close`. **Close files; it never runs.** Four moves: close the brief, deposit a close packet, archive tasklist + context file, and name the next step.

## 🎯 Trigger

```
AI-Suplex: Close Workspace

WORKSPACE:
  - Type: <Daily Work | Project | Quick Task | Review>
  - Title: <title, slug, or ref>
```

## ⚡ Shorthand (workspace type / instance)

`Close Workspace(Project)` · `Close Workspace(Project: execution-console)` · `Close Workspace(Project: 23)` — the same command with the type or instance set. **The legacy `Close` command remains** and maps to the same lanes.

**Instance selection (N lanes):**
- `Close Workspace(Project)` — list open workspaces · **one** → close it · **many** → ask
- `Close Workspace(Project: execution-console)` — select by **slug**
- `Close Workspace(Project: 23)` — select by **ref**

## 🔤 Workspace type → internal lane

| Workspace type | Internal lane | Instances |
|---|---|---|
| Daily Work | `daily-tasks` | 1 (singleton) |
| Project | `project-tasks` | Many |
| Quick Task | `random-tasks` | Many |
| Review | `realist` | 1 (singleton) |

## 🤖 What the AI Does

1. **Reads** the Pattern + the Spec (R1–R12).
2. **Resolves the workspace** — type → lane, then instance (slug or ref). One open → it; many → ask. Never guess.
3. **Close Workspace** — set `status: closed` + `closed: <ISO>` in the brief's frontmatter; correct a drifted `outcome` so the archived record reads true.
4. **Drain the packet into Inbox** — write a **close packet** at `Context Kick-start/Inbox/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md` with `TERMINAL` · `ARTIFACTS` · `AMC DELTA` · `OPEN` lines. The packet **proposes** the AMC delta; it never writes the AMC — the daily-tasks thread is the one that *drains* it (reconcile → move to `Consumed/`) (R2, R12).
5. **Archive the tasklist + the context file** — tasklist `status: completed` → `Tasklists/Archive/` · context file → `Archived/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md`. **Only THIS workspace's files** — never another instance's (R1/R4). Record any deviation (e.g. archiving the tasklist directly instead of leaving it for the R11 sweep) inside the packet.
6. **Suggest next steps** — the next open workspace on the board, the packet's `OPEN` items, and who owns each.

## 🛡️ The guardrail

**Close files; it never runs.** `Close Workspace` never executes a task, never writes the Active Mission Context (the packet proposes — R2), never runs `3lm sync` (a committer serializes — R6), and never archives another workspace's file (R1).

## 🧠 Memory Loop

**None at close.** Lessons were captured during the work (`3lm add-lessons`). If lessons were added this session, run `3lm index`. A **committer** closes the session with one `3lm sync` — serialized, one at a time.

## 🔗 Related

| What | Where |
|---|---|
| Pattern | `Prompt Patterns/📄 Pattern - Close Workspace.md` |
| Create-side | `Prompt Patterns/AI-Suplex Commands/⚡ Command — Define Workspace.md` |
| Run-side | `Prompt Patterns/AI-Suplex Commands/⚡ Command — Kickstart Workspace.md` |
| Packet mechanics | `Prompt Patterns/📄 Pattern - Save Context.md` (v4) · Spec R12 |
| Spec | `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.5) |

---

*TWABAM ⚡! Close Workspace — file it, propose it, archive it, name the next one.*
