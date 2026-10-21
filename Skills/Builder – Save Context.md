---
type: skill
skill_name: "Builder – Save Context"
role: "Builder"
version: "3.0"
date: 2026-10-16
tags: [skill, builder, save-context, memory, session-continuity, instances, writer-class]
description: "Summarize an instance’s context, save to an instance-scoped file, archive on close — one writer per file."
triggers: [save context, context, switch, handoff]
depends_on: []
uses_tools: [3lm]
quality: 0.9
status: active
---

# Builder Skill: Save Context

## 🎯 Purpose

When switching between chat windows, sessions, or work blocks, this skill ensures **no context is lost**. It defines the protocol for summarizing the current **instance**, saving the summary to an **instance-scoped** file, and enabling the next session to pick up seamlessly.

This skill is the bridge between **instances** — it ensures the "North Star" is achieved: *"Each new session starts smarter than the last."*

**Canonical:** `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.0) + `Prompt Patterns/📄 Pattern - Save Context.md` (v3).

---

## 📥 Input

The Hustler provides either:

- **"Switch context"** — indicates they’re about to change chat windows or sessions
- **"Summarize session"** — requests a summary of current progress
- **"End session"** — triggers the full session end protocol

---

## 📤 Output

A **Context Summary** saved to:
- **Active (N lanes):** `AI-Suplex Kick-start/Context Kick-start/Active/{thread}-{ref}-{slug}.md`
- **Active (singletons):** `…/Active/{thread}.md`
- **Archive (on close):** `…/Archived/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md`
- **Append vs archive is instance-scoped:** a new window = a new file; the same instance appends in place; close archives.

---

## 🧠 Workflow Instructions

When the Hustler says *"Switch context"* or *"Summarize session"*, follow these steps:

### Step 1: Generate Context Summary

Create a markdown file with the following structure:

```markdown
---
thread: random-tasks          # daily-tasks | project-tasks | random-tasks | realist
instance: 1                  # the ref (omit for singletons)
mission: "Vault migration"   # the CURRENT mission; may change
slug: vault-migration        # matches the filename; never changes
status: open                 # open | closed
writer: committer            # committer | producer
agent: local                 # local | cloudroom
opened: 2026-10-16T10:48
cycle: 2
week: 7
parent: null                 # prior instance file when resumed
---

# 🦸 Context — Cycle X Week Y · {thread}/{slug}

> **Generated:** [Date Time] · **Instance:** `{thread}-{ref}-{slug}`
> **Writer:** committer | producer

---

## 🎯 What Was Accomplished

- [List completed tasks with task IDs]
- [List artifacts created]
- [List insights captured]

---

## 📊 Current State

### Progress
| Metric | Status |
|--------|--------|
| Tasks Completed | X/Y |
| Instance Phase | [current phase] |
| Blockers | [any blockers] |

---

## 🧠 What the AI Needs to Know Next Session

1. [Key context point 1]
2. [Key context point 2]
3. [Key context point 3]

---

## 🔗 Quick Links

| Resource | Location |
|----------|----------|
| Tasklist / Spec | `Tasklists/Active/[filename].md` · `Projects/…/Spec.md` |
| Artifacts | `Artifacts/<Period>/Cycle X/Week Y/` |

---

## 🎯 Next Actions

1. [Immediate next task — linked to the durable layer]
2. [Upcoming tasks]
3. [Blockers to resolve]

---

*Context generated via AI-Suplex on YYYY-MM-DD — instance: {thread}-{ref}-{slug}*
```

### Step 2: Save to Active Location

```
AI-Suplex Kick-start/Context Kick-start/Active/{thread}-{ref}-{slug}.md   (N lanes)
AI-Suplex Kick-start/Context Kick-start/Active/{thread}.md               (singletons)
```

**Filename rules:**
- **Thread prefix + instance ref** — `daily-tasks` · `project-tasks` · `random-tasks` · `realist`
- `{ref}` — per-thread ordinal, **reset per day**, allocated by the **AS MC** (Hustler fallback)
- `{slug}` — stable kebab mission slug, **all lowercase**, hyphens; never renamed mid-life
- Singletons omit `ref` and `slug`

**Examples:**
- `random-tasks-1-vault-migration.md`
- `project-tasks-1-777-production-push.md`
- `daily-tasks.md`

### Step 3: Append vs Archive — INSTANCE-SCOPED

**Archive only your own instance’s file, and only on close.**

1. **OPEN window** → create the file (allocating `{ref}` for the day) with `status: open`.
2. **Same instance, later save** → **APPEND/UPDATE in place**. Do NOT create a second file.
3. **CLOSE window** → `status: closed` → move to `Archived/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md`.
4. ⚠️ Never touch another instance’s file — even within the same thread.

```bash
# Close: archive this instance only, dated
mv "AI-Suplex Kick-start/Context Kick-start/Active/random-tasks-1-vault-migration.md" \
   "AI-Suplex Kick-start/Context Kick-start/Archived/2026-10-16-random-tasks-1-vault-migration.md"
```

### Step 4: Writer class — obey it

- **producer** (cloud agent · research window): writes only its own instance file + artifacts. NEVER `Memory/`, `AGENTS.md`, `B-Bombs/`, or `3lm sync`.
- **committer** (laptop · AS MC): may write `Memory/` and run `3lm sync` — **serialized, one at a time**.

### Step 5: Run 3lm End (if ending session — committer only)

```bash
node Tools/3lm.js end
node Tools/3lm.js learn
```

### Step 6: Verify

After saving, verify:
- [ ] New instance file exists in `Active/`
- [ ] On close, the dated archive exists in `Archived/`
- [ ] Context summary includes all key points
- [ ] Next actions are clear and linked to the durable layer

---

## 📋 Context Summary Checklist

Before finalizing the context summary, ensure:

- [ ] **What was accomplished** — all completed tasks listed
- [ ] **Current state** — progress metrics included
- [ ] **What AI needs to know** — key context for next session
- [ ] **Quick links** — file paths to relevant resources
- [ ] **Next actions** — immediate next steps defined
- [ ] **Filename correct** — `{thread}-{ref}-{slug}.md` (or `{thread}.md` singleton)
- [ ] **Writer class** — recorded and obeyed (producer never commits)

---

## 🔗 Integration

This skill integrates with:
- **Session End** — Context summary is part of session end protocol
- **3lm end** — Episode written before the context save (committer)
- **3lm start** — New session loads context from `Active/`
- **Effective Pipeline** — Save Context is Step 6

---

## ✅ Quality Checklist

- [ ] Context summary follows template format
- [ ] Filename follows instance-scoped naming convention
- [ ] Only this instance’s file archived, on close
- [ ] All key points captured
- [ ] Next actions are actionable
- [ ] Quick links are correct

---

**TWABAM ⚡!** This skill ensures no context is ever lost between instances. The North Star is achieved: each new session starts smarter than the last.

---

*Skill v3.0 — instance-scoped, created via AI-Suplex on 2026-10-16 (Cycle 2, Week 7).*