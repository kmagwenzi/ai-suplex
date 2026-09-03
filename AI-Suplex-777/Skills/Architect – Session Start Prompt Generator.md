---
skill_name: "Architect – Session Start Prompt Generator"
role: "Architect"
version: "1.0"
date: 2026-04-10
tags: [skill, architect, session-start, prompt-generator, ai-suplex]
---

# Architect Skill: Session Start Prompt Generator

## 🎯 Purpose

Take a **Task ID** (from an AI‑Suplex Tasklist or Combined Tasklist) or a **direct task description** and generate a complete **AI‑Suplex Session Start Prompt** that the Hustler can copy into the `Session Start` macro. The prompt follows the official specification: compact header (or expanded YAML), mission, tasks (with role tags and Task IDs), success metrics, and optional fields (context, constraints, references).

This skill is the bridge between the **Orchestrator’s tasklist** and the **Builder’s execution**.

---

## 📥 Input

The Hustler provides either:

- **A Task ID** (e.g., “Generate start prompt for T003”) – the Architect should then ask for the tasklist file or assume the most recent tasklist in `AI-Suplex-777/Tasklists/`.
- **A direct description** (e.g., “Generate start prompt for fixing Oracle block for WQR”).
- **Or a partial prompt** to be completed.

Optionally, the Hustler may specify:

- **Focus** (if not inferable)
- **Cycle / Week** (default to current cycle/week from the tasklist or ask)
- **Energy level** (default ⚡⚡⚡)
- **Duration** (default from tasklist or 60 min)

---

## 📤 Output

A ready‑to‑use session start prompt in **expanded YAML format** (recommended for clarity) or **compact header format** (optional). The output includes:

- **Activation phrase:** `AI-Suplex: Session Start`
- **Fields:** `Focus`, `Session_Type`, `Mission_Title`, `Expected_Duration`, `Energy_Level`
- **Mission_Description:** One sentence
- **Tasks:** Bulleted list with `[ROLE TAG]` and `[Task ID]` (if available)
- **Success Metrics:** Bulleted list
- **Context:** (if relevant)
- **Constraints:** (optional, e.g., time cap, out‑of‑scope)

The prompt is presented in a code block for easy copying.

---

## 🧠 Workflow Instructions (for the AI)

When the Hustler says *“Architect, generate a session start prompt for Task ID T001”*, follow these steps:

### 1. Locate the task
- If a Task ID is given, ask the Hustler for the tasklist file path (or assume the most recent in `Tasklists/`). Read the tasklist and extract the corresponding block.
- If a direct description is given, use that as the basis.

### 2. Extract or infer fields

| Field                 | Source / Inference                                                                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Focus**             | From tasklist (if present) or infer from description (e.g., “WQR” → `wqr`). If unsure, ask.                                                                                                               |
| **Session_Type**      | Use `execution` unless task clearly involves planning, review, creative, or analytical work.                                                                                                              |
| **Mission**           | Short, punchy identifier (e.g., “Oracle Block Resolution”). Use the task’s mission or create from description.                                                                                            |
| **Expected_Duration** | From tasklist (e.g., `**Duration:** 90 min`). If missing, default to 60 min or ask.                                                                                                                       |
| **Energy_Level**      | Default ⚡⚡⚡ unless Hustler specifies.                                                                                                                                                                     |
| **Objective**         | The mission statement from the tasklist (or a one‑sentence goal).                                                                                                                                         |
| **Tasks**             | From the tasklist’s `Tasks` list. Add role tags (`[HUSTLER]` for human‑only actions, `[BUILDER]` for AI‑assisted, etc.). If no role tags, infer. Also prepend Task ID (e.g., `[ ] T001-B: Backup files`). |
| **Success Metrics**   | From tasklist’s `Success_Metrics`. If missing, generate reasonable metrics based on the mission.                                                                                                          |
| **Context**           | From tasklist’s `Context` (if any).                                                                                                                                                                       |
| **Constraints**       | Optional. Add if the Hustler mentions a hard stop, out‑of‑scope items, or blocker protocol.                                                                                                               |

### 3. Format the prompt
Use the **expanded YAML format** (clearer). Example:

```yaml
AI-Suplex: Session Start
  - Focus: wqr
  - Session_Type: execution
  - Mission_Title: "Oracle Block Resolution"
  - Expected_Duration: "120 minutes"
  - Energy_Level: ⚡⚡⚡⚡

Mission_Description: Restore WQR server access by resolving Oracle Cloud block and documenting contingency.

Tasks:
  [HUSTLER] - [ ] T001-A: Log into Oracle Cloud Console and assess block status
  [HUSTLER] - [ ] T001-B: Submit support ticket with full explanation
  [BUILDER] - [ ] T001-C: Document server config for rebuild if needed

Success Metrics:
  - Oracle ticket: SUBMITTED
  - Server config: DOCUMENTED

Context: Oracle suspended the server due to suspected suspicious activity.
Constraints:
  - Time_Cap: "Hard stop at 11:00"
  - Good_Enough_At_Cap: "Ticket submitted and config documented"
```

Alternatively, the compact header format (for experienced users):

```
AI-Suplex: Session Start wqr execution "Oracle Block Resolution" 120 minutes ⚡⚡⚡⚡
```

Include both formats (expanded as primary, compact as alternative) or ask the Hustler which they prefer.

### 4. Present the prompt
- Output the prompt in a markdown code block (````yaml ... ````).
- Remind the Hustler to copy it into the `Session Start` macro or use it directly.

---

## 📝 Example

**User:** “Architect, generate start prompt for Task ID T003 from today’s tasklist.”

**Assumed tasklist entry:**

```yaml
## PRIMARY: Builder

```yaml
Mission: "Deploy PMI ICT Solutions website to Netlify"
Tasks:
  - [ ] Log into Netlify (Hustler)
  - [ ] Connect GitHub repo
  - [ ] Configure build settings
  - [ ] Set custom URL
  - [ ] Verify all pages load correctly
Success_Metrics:
  - PMI site live on Netlify (custom URL)
  - No broken links or images
```

**Duration:** 45 min
**Nature:** execution
```

**AI output:**

```yaml
AI-Suplex: Session Start
  - Focus: freelance
  - Session_Type: execution
  - Mission: "PMI Netlify Deployment"
  - Expected_Duration: "45 minutes"
  - Energy_Level: ⚡⚡⚡⚡

Mission: Deploy PMI ICT Solutions website to Netlify.

Tasks:
  [HUSTLER] - [ ] T003-A: Log into Netlify
  [BUILDER] - [ ] T003-B: Connect GitHub repo
  [BUILDER] - [ ] T003-C: Configure build settings
  [BUILDER] - [ ] T003-D: Set custom URL
  [BUILDER] - [ ] T003-E: Verify all pages load correctly

Success Metrics:
  - PMI site live on Netlify (custom URL)
  - No broken links or images

Context: First portfolio project deployment for freelance launch. Local files ready.
```

---

## 🔗 Integration

- The generated prompt is used with the `Session Start` macro (Builder role).
- After the session, the `Session End` macro and `Architect – Session End Report Generator` skill close the loop.

---

## ✅ Quality Checklist

- [ ] Focus is correctly mapped (from tasklist or inference).
- [ ] Mission_Title is short and descriptive.
- [ ] Duration matches the tasklist (or sensible default).
- [ ] Tasks include role tags (`[HUSTLER]`, `[BUILDER]`, etc.) and Task IDs.
- [ ] Success metrics are verifiable.
- [ ] Context and constraints are included if available.
