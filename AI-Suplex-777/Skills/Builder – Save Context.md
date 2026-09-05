---
type: skill
skill_name: "Builder – Save Context"
role: "Builder"
version: "1.0"
date: 2026-06-22
tags: [skill, builder, save-context, memory, session-continuity]
---

# Builder Skill: Save Context

## 🎯 Purpose

When switching between chat windows, sessions, or work blocks, this skill ensures **no context is lost**. It defines the protocol for summarizing the current session, saving the context summary, and enabling the next session to pick up seamlessly.

This skill is the bridge between **sessions** — it ensures the "North Star" is achieved: *"Each new session starts smarter than the last."*

---

## 📥 Input

The Hustler provides either:

- **"Switch context"** — indicates they're about to change chat windows or sessions
- **"Summarize session"** — requests a summary of current progress
- **"End session"** — triggers the full session end protocol

---

## 📤 Output

A **Context Summary** saved to:
- **Active:** `AI-Suplex Kick-start/Context Kick-start/Active/`
- **Filename format:** `YYYY-MM-DD-cycle-x-week-y-mission-title.md`
- **Archive:** Previous Active context moved to `AI-Suplex Kick-start/Context Kick-start/Archived/`

---

## 🧠 Workflow Instructions

When the Hustler says *"Switch context"* or *"Summarize session"*, follow these steps:

### Step 1: Generate Context Summary

Create a markdown file with the following structure:

```markdown
---
title: "Context Kickstart — Cycle X Week Y"
date: YYYY-MM-DD
cycle: X
week: Y
mission: "Mission Title"
status: active
tags: [context, kickstart, cycle-X, week-Y]
---

# 🦸 Context Kickstart — Cycle X Week Y

> **Generated:** [Date Time]
> **Session:** [Session description]

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
| Session Phase | [current phase] |
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
| Tasklist | `Tasklists/Active/[filename].md` |
| Session Start | `Sessions/Active/Start/[filename].md` |
| Artifacts | `Artifacts/Cycle X/Week Y/` |

---

## 🎯 Next Actions

1. [Immediate next task]
2. [Upcoming tasks]
3. [Blockers to resolve]

---

*Context generated via AI-Suplex on YYYY-MM-DD*
```

### Step 2: Save to Active Location

Save the context summary to:
```
AI-Suplex Kick-start/Context Kick-start/Active/YYYY-MM-DD-cycle-x-week-y-mission-title.md
```

**Filename rules:**
- Use the date of the session
- Use the current cycle and week numbers
- Use a short, descriptive mission title
- Separate words with hyphens
- All lowercase

**Examples:**
- `2026-06-22-cycle-1-week-1-pipeline-docs-and-foundation.md`
- `2026-06-25-cycle-1-week-1-ibm-module-3-selar-audit.md`
- `2026-06-27-cycle-1-week-1-launch-day.md`

### Step 3: Archive Previous Context

Before saving the new context summary:

1. Check if there's an existing file in `Active/`
2. If yes, move it to `Archived/`
3. Keep the same filename (don't rename archived files)

```bash
# Move old context to Archived
mv "AI-Suplex Kick-start/Context Kick-start/Active/old-file.md" \
   "AI-Suplex Kick-start/Context Kick-start/Archived/"
```

### Step 4: Run 3lm End (if ending session)

If the context save is also a session end:

```bash
node Tools/3lm.js end
node Tools/3lm.js learn
```

This writes the episode and extracts lessons before the context save.

### Step 5: Verify

After saving, verify:
- [ ] New context file exists in `Active/`
- [ ] Old context file moved to `Archived/`
- [ ] Context summary includes all key points
- [ ] Next actions are clear

---

## 📋 Context Summary Checklist

Before finalizing the context summary, ensure:

- [ ] **What was accomplished** — all completed tasks listed
- [ ] **Current state** — progress metrics included
- [ ] **What AI needs to know** — key context for next session
- [ ] **Quick links** — file paths to relevant resources
- [ ] **Next actions** — immediate next steps defined
- [ ] **Filename correct** — `YYYY-MM-DD-cycle-x-week-y-mission-title.md`

---

## 🔗 Integration

This skill integrates with:
- **Session End** — Context summary is part of session end protocol
- **3lm end** — Episode written before the context save
- **3lm start** — New session loads context from Active
- **Effective Pipeline** — Save Context is Step 6

---

## ✅ Quality Checklist

- [ ] Context summary follows template format
- [ ] Filename follows naming convention
- [ ] Old context moved to Archived
- [ ] All key points captured
- [ ] Next actions are actionable
- [ ] Quick links are correct

---

**TWABAM ⚡!** This skill ensures no context is ever lost between sessions. The North Star is achieved: each new session starts smarter than the last.

---

*Skill created via AI-Suplex on 2026-06-22*
