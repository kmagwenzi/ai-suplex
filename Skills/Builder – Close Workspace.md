---
type: skill
skill_name: "Builder – Close Workspace"
role: "Builder"
version: "1.0"
date: 2026-11-24
tags: [skill, builder, close-workspace, archive, close-packet, workspace-lifecycle]
description: "Close a finished workspace — file the brief, deposit a close packet in Inbox, archive the tasklist + context file, and name the next step. Close files; it never runs."
triggers: [close workspace, close, archive workspace, finish workspace]
depends_on: ["Builder – Save Context"]
uses_tools: [3lm]
quality: 0.9
status: active
---

# Builder Skill: Close Workspace

## 🎯 Purpose

When a workspace has met its definition of done, this skill **files it away cleanly** so the board tells the truth and the next window starts fresh. It is the third verb in the workspace lifecycle — **Define creates, Kickstart runs, Close files.**

**Canonical:** `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.5 — R1 · R2 · R4 · R11 · R12) + `Prompt Patterns/📄 Pattern - Close Workspace.md` (v1.0).

## 📥 Input

- `AI-Suplex: Close Workspace` with a workspace type + title/slug/ref, or
- A direct request to close a named workspace.

## 📤 Output

1. Brief → `status: closed` + `closed: <ISO>`, then archived.
2. Close packet → `Context Kick-start/Inbox/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md`.
3. Tasklist → `status: completed` → `Tasklists/Archive/`.
4. Context file → `Archived/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md`.
5. Next-step suggestion.

## 🧠 Workflow Instructions

### Step 1 — Resolve the workspace

Type → lane; instance by slug or ref. One open → it; many → ask. Never guess.

### Step 2 — Close the brief

In the brief's frontmatter: `status: closed` + `closed: <ISO>`. If the `outcome` drifted from what actually shipped, correct it so the archived record reads true.

### Step 3 — Deposit the close packet (R12)

`Inbox/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md`, four parts:

- **TERMINAL** — what finished, in terminal-state words (`PUBLISHED` · `SENT` · `SHIPPED` · `PROVEN`).
- **ARTIFACTS** — the durable artifacts by name, so the packet can be pruned without orphaning them.
- **AMC DELTA** (proposal) — threads open, next actions, blockers. **The packet proposes; it never writes the AMC** (R2).
- **OPEN** — what still needs a hand, and who owns it.

### Step 4 — Archive tasklist + context file

- tasklist `status: completed` → `Tasklists/Archive/`
- context file → `Archived/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md`
- **Only THIS workspace's files** (R1/R4). Record any deviation (e.g. archiving the tasklist directly instead of leaving it for the R11 sweep) inside the packet.

### Step 5 — Suggest next steps

The next open workspace on the board, the packet's `OPEN` items, and who owns each.

## 🛡️ Guardrails (non-negotiable)

- **Close files; it never runs** — never executes a task.
- **Never write the AMC** — the packet proposes; the daily thread reconciles and consumes (R2, R12).
- **Never run `3lm sync`** — a committer serializes it, one at a time (R6).
- **Never archive another workspace's file** (R1).
- **Memory loop: none at close** — lessons were captured while the work ran (`3lm add-lessons`); run `3lm index` only if lessons were added this session.

## ✅ Quality Checklist

- [ ] Brief carries `status: closed` + `closed: <ISO>`
- [ ] Packet exists in `Inbox/` with `TERMINAL` · `ARTIFACTS` · `AMC DELTA` · `OPEN`
- [ ] Packet's `AMC DELTA` is a proposal, not a paste
- [ ] Tasklist `status: completed` and archived
- [ ] Context file archived with the dated name
- [ ] Only this workspace's files touched
- [ ] Next step named, with an owner

## 🔗 Integration

- **Define Workspace** — the create-side (`⚡ Command — Define Workspace`)
- **Kickstart Workspace** — the run-side (`⚡ Command — Kickstart Workspace`)
- **Save Context** — the underlying instance/packet mechanics (`Builder – Save Context`, v4)
- **3lm** — `index` if lessons were added; `sync` only by a committer

---

*Skill v1.0 via AI-Suplex on 2026-11-24 — Cycle 3, Week 5. TWABAM ⚡*
