---
title: "Pattern - Close Workspace"
date: 2026-11-24
version: 1.0
tags: [pattern, close-workspace, workspace, close, archive, close-packet, terminology, builder]
---

# AI-Suplex Prompt Pattern — Close Workspace

Close a finished **workspace** — the client-facing word for `Close`. A workspace is **one lane, one brief, one writer**; closing it files the brief, deposits a close packet for the daily thread to reconcile, archives both halves, and names the next step. **Close files; it never runs.**

## 🎯 How to Use

1. Copy the `<prompt-pattern>` block below.
2. Replace `WORKSPACE`.
3. Paste into your AI chat. The AI closes and archives the workspace — it does **not** execute it.

## 📋 The Prompt Pattern

```yaml
<prompt-pattern>
CONTEXT: Close a finished AI-Suplex workspace (a thread instance; client-facing: "workspace").
- External Source 1: AI-Suplex Kick-start/Spec — Context & Threads.md (v2.5 — R1 · R2 · R4 · R11 · R12)
- External Source 2: Prompt Patterns/📄 Pattern - Save Context.md (v4 — the close-packet template)
- Inline Source: "Workspace" replaces "thread" client-facing; the internal lane token stays.

TASK: Act as Builder. Resolve the workspace to its internal lane and instance (slug or ref —
one open → close it, many → ask). Then, in order:
1. CLOSE the brief — set status: closed + closed: <ISO> in frontmatter; correct a drifted outcome.
2. DRAIN a close packet into Inbox/ — TERMINAL · ARTIFACTS · AMC DELTA (proposal) · OPEN. The
   packet PROPOSES the AMC delta; it never writes the AMC (the daily-tasks thread reconciles and
   consumes — R2, R12).
3. ARCHIVE the tasklist + the context file — tasklist status: completed → Tasklists/Archive/ ·
   context file → Archived/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md. Only THIS workspace's files (R1/R4).
4. SUGGEST next steps — the next open workspace + the packet's OPEN items + who owns each.

Do NOT execute a task, write the AMC, run 3lm sync, or touch another workspace's file.

MEMORY LOOP: none at close (lessons were captured during the work via 3lm add-lessons);
run 3lm index if lessons were added this session.

ADDITIONAL INSTRUCTIONS: NONE

CONTENT:
WORKSPACE:
  - Type: <Daily Work | Project | Quick Task | Review>
  - Title: <title, slug, or ref>
</prompt-pattern>
```

## 🔤 Workspace type → internal lane

| Workspace type | Internal lane | Instances |
|---|---|---|
| Daily Work | `daily-tasks` | 1 (singleton) |
| Project | `project-tasks` | Many |
| Quick Task | `random-tasks` | Many |
| Review | `realist` | 1 (singleton) |

## 📄 The close packet (what the AI deposits in Inbox/)

```markdown
---
lane: project-tasks/23
slug: execution-console
writer: committer
closed: 2026-11-24T12:46
tasklist: Tasklists/Active/2026-11-19-project-tasks-execution-console-tasklist.md → completed
archived: AI-Suplex Kick-start/Context Kick-start/Archived/2026-11-24-project-tasks-23-execution-console.md
---

TERMINAL: SHIPPED — <what finished, in terminal-state words>
ARTIFACTS: <the durable artifacts, by name — never orphaned>

AMC DELTA (proposal — the daily thread reconciles, it does not paste)
- Threads open: 5 → 4
- Next actions: add "<the handoff>"
- Blockers: <removed / added / unchanged>

OPEN: <what still needs a hand, and who owns it>
```

**Rules (R12):** the packet **proposes** — the AMC keeps its single writer (R2). Consumption is a **move** to `Consumed/`, never a delete; prune only at the Saturday review. The packet is disposable; its `ARTIFACTS` lines name the durable layer so nothing is orphaned.

## 🛡️ The guardrail

**Define creates. Kickstart runs. Close files.** `Close Workspace` never executes, never writes the AMC (the packet proposes — R2), never runs `3lm sync` (a committer serializes — R6), and never archives another workspace's file (R1).

## 🧠 Memory Loop

**None.** A workspace that has already run was captured while it ran (`3lm add-lessons`). Close files; it does not extract new lessons.

## 🔗 Related

- `Prompt Patterns/AI-Suplex Commands/⚡ Command — Close Workspace.md` (the invocation)
- `Prompt Patterns/AI-Suplex Commands/⚡ Command — Define Workspace.md` (the create-side)
- `Prompt Patterns/AI-Suplex Commands/⚡ Command — Kickstart Workspace.md` (the run-side)
- `Prompt Patterns/📄 Pattern - Save Context.md` (v4 — the close-packet template)
- `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.5 — R1 · R2 · R4 · R11 · R12)

---

*Pattern v1.0 captured via AI-Suplex on 2026-11-24 — Cycle 3, Week 5. TWABAM ⚡*
