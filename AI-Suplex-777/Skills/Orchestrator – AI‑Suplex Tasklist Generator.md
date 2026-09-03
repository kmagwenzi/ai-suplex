---
skill_name: "Orchestrator – AI‑Suplex Tasklist Generator"
role: "Orchestrator"
version: "1.0"
date: 2026-04-10
tags: [skill, orchestrator, tasklist, ai-suplex]
---
# Orchestrator Skill: AI‑Suplex Tasklist Generator
## 🎯 Purpose
Convert a Hustler's raw to‑do list (or natural language goals) into a **structured AI‑Suplex Tasklist** with:
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

text

---
## 🧠 Workflow Instructions
When the Hustler gives a raw to‑do list:
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
- [ ] Mission is a single sentence.
- [ ] Each task starts with a verb and is actionable.
- [ ] Success metrics are measurable (not vague).
- [ ] Duration is realistic.
- [ ] Nature matches the work type.
- [ ] YAML is correctly formatted.
---
**TWABAM ⚡!** This skill turns chaos into structured tasks. The Hustler can then use the Architect skill to generate session start prompts from any Task ID.

---