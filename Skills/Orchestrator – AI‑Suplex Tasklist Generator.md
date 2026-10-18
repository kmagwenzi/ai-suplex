---
type: skill
skill_name: "Orchestrator – AI‑Suplex Tasklist Generator"
role: "Orchestrator"
version: "1.0"
date: 2026-04-10
tags: [skill, orchestrator, tasklist, ai-suplex]
description: "Convert a raw to-do list into a structured AI-Suplex tasklist with IDs, roles, durations, phases."
triggers: [tasklist, task, to-do, plan]
depends_on: []
uses_tools: []
quality: 0.9
status: active
---
# Orchestrator Skill: AI‑Suplex Tasklist Generator
## 🎯 Purpose
Convert a Hustler's raw to‑do list (or natural language goals) into a **structured AI‑Suplex Tasklist** with:
- **Phase 0 — Context Core** (every daily tasklist starts with `node Tools/3lm.js start --context`)
- **Mission** (one sentence)
- **Tasks** (atomic actions, each with a checkbox)
- **Success metrics** (measurable outcomes)
- **Duration** (in minutes)
- **Nature** (planning/creative/execution/review)
- **Primary role** (Builder, Architect, Hustler, etc.)
The output follows the format used in the `Tasklists/` folder and can be directly used to generate session start prompts.
---
## 📥 Input
The Hustler will provide a raw to‑do list. Example:

- Fix Oracle block for WQR
- Test Paynow webhook
- Update Freelance MOC
- Write weekly review
    

text


## 📤 Output

A YAML‑formatted tasklist block (or multiple blocks if tasks are unrelated). Example:

## PRIMARY: Builder
```yaml
Mission: "Restore WQR server — Oracle Cloud Unblock Protocol"
Tasks:
  - [ ] Log into Oracle Cloud Console — assess block status
  - [ ] Submit support ticket with full explanation
  - [ ] Document server config for rebuild if needed
Success_Metrics:
  - Oracle ticket: SUBMITTED
  - Server config: DOCUMENTED

**Duration:** 120 min  
**Nature:** execution
```

**Every generated tasklist MUST also start with the Context Core phase (add before any other phase):**

```
## ⚡ Phase 0 — Context Core (Session Start)
| ID | Role | Duration | Task | Nature |
|----|------|----------|------|--------|
| T000 | Hustler | 5 min | Run `node Tools/3lm.js start --context` — staleness guard + generated session context (Graph RAG Impl 2) | Execution |

**Success:**
- [ ] `✅ Context fresh.` (staleness guard green)
- [ ] Generated 5-section session context loaded (last sessions · blockers · B-Bombs · insights · cross-focus)
```

---
## 🧠 Workflow Instructions
When the Hustler gives a raw to‑do list:
0. **Add Phase 0 — Context Core first:** every generated daily tasklist opens with T000: run `node Tools/3lm.js start --context` (staleness guard + generated session context). This primes the mission brief before execution.
1. **Group related tasks** into a single mission if they belong together.
2. **Break each mission into atomic tasks** (max 5‑7 per block). Each task should start with a verb.
3. **Define success metrics** – concrete, verifiable outcomes.
4. **Estimate duration** – realistic time block (15‑240 min). Default 60 min.
5. **Assign nature** – planning, creative, execution, or review.
6. **Assign primary role** – usually `Builder` for technical tasks, `Hustler` for human‑only actions (calls, logins, emails). Use `Architect` for quality reviews, `Orchestrator` for planning tasks.
7. **Output as YAML** inside a markdown code block. Use the exact format above.
8. **If tasks are for different roles**, create separate blocks (e.g., one for Builder, one for Hustler).
---
## ✅ Quality Checklist
- [ ] Phase 0 — Context Core included as the first phase (`node Tools/3lm.js start --context`).
- [ ] Mission is a single sentence.
- [ ] Each task starts with a verb and is actionable.
- [ ] Success metrics are measurable (not vague).
- [ ] Duration is realistic.
- [ ] Nature matches the work type.
- [ ] YAML is correctly formatted.
---
**TWABAM ⚡!** This skill turns chaos into structured tasks. The Hustler can then use the Architect skill to generate session start prompts from any Task ID.

---