---
skill_name: "Orchestrator – Combined Tasklist Generator"
role: "Orchestrator"
version: "1.0"
date: 2026-04-10
tags: [skill, orchestrator, combined-tasklist, ai-suplex]
---
# Orchestrator Skill: Combined Tasklist Generator

## 🎯 Purpose

Aggregate **next actions**, **blockers**, and **emerging tasks** from multiple sources within the AI‑Suplex vault:

- **Session End reports** (`next_actions` frontmatter and/or markdown sections)
- **Artifacts** (`next_actions` frontmatter)
- **B‑Bombs** (`next_actions` frontmatter – optional)
- **Insights** (if they contain actionable items)
- **Manual captures** (from `Next Steps/` folder or `RawTasks/` files)

Produce a **Combined Tasklist** – a single markdown file (or table) that the Hustler can use for daily and weekly planning. The output format follows the style of `COMBINED TASKLIST(2026-03-28).md` with sections: Immediate Priorities (next 24‑48 hours), Upcoming Tasks (this week), and optionally a Blockers section.

The skill can be invoked after the Sweeper has run `Sweeper – Enhance MOCs & Trackers` or as a standalone analysis.

---

## 📥 Input

The Hustler provides either:

- **File paths** to session end reports, artifacts, insights, or raw task folders.
- **Or a general request** (e.g., “Generate combined tasklist from last 7 days”).

If no specific files are given, the Orchestrator should assume:

- Scan all session end files in `AI-Suplex-777/Sessions/Active/End/` (and optionally `Archive/End/` if within last 7 days).
- Scan `next_actions` frontmatter in all artifacts and B‑Bombs (if any).
- Scan `Next Steps/` folder (if using the 7‑7‑7 edition) for manual entries.
- Scan `Tasklists/RawTasks/` for raw task files.

**Optional filters:**  
- By focus area (e.g., “only WQR tasks”)
- By date range (e.g., “since last Monday”)
- By status (e.g., “exclude completed tasks”)

---

## 📤 Output

A markdown file (displayed in the chat, or saved if the user requests) with the following structure:

```markdown
**TWABAM ⚡! COMBINED TASKLIST – {{date}}**

**Generated:** {{timestamp}}  
**Source scope:** {{description of sources}}  
**Cycle:** (inferred)  
**Week:** (inferred)

---

## 🚀 IMMEDIATE PRIORITIES (Next 24–48 hours)

| ID | Task | Source | Focus | Priority | Status |
|----|------|--------|-------|----------|--------|
| T001 | Fix Oracle block | Session end 2026-04-10 | wqr | 🔴 High | ⬜ |
| T002 | Test Paynow webhook | Artifact `webhook-config.md` | wqr | 🔴 High | ⬜ |
| T003 | Update Freelance MOC | Insight 2026-04-09 | freelance | 🟡 Medium | ⬜ |

---

## 📅 UPCOMING TASKS (This Week)

| ID | Task | Source | Focus | Priority | Status |
|----|------|--------|-------|----------|--------|
| T004 | Design welcome message | Session end 2026-04-08 | wqr | 🟡 Medium | ⬜ |
| T005 | Research Blender basics | Insight 2026-04-07 | content-creation | 🟢 Low | ⬜ |

---

## ⚠️ Blockers

| Blocker | Source | Focus | Suggested Next Action |
|---------|--------|-------|------------------------|
| Waiting for Oracle support | Session end 2026-04-10 | wqr | Follow up tomorrow |

---

## 🔄 HOW TO USE THIS TASKLIST

- Copy this list into your `Tasklists/Combined/` folder.
- Update statuses as you complete tasks.
- Use the `Tasks` plugin to embed actionable items.
- Reference Task IDs when asking the Architect for session start prompts.
```

If the user wants to save the file, suggest a filename like `Combined-Tasklist-YYYY-MM-DD.md` and place it in `AI-Suplex-777/Tasklists/Combined/`.

---

## 🧠 Workflow Instructions (for the AI)

When invoked, follow these steps:

### 1. Identify sources
- **Session End files** – look in `AI-Suplex-777/Sessions/Active/End/` (and optionally `Archive/End/` if within last 7 days).  
  Extract `next_actions` from frontmatter and/or from the markdown section `## Next Actions`.
- **Artifacts** – scan `AI-Suplex-777/Artifacts/` (including nested `Cycle X/Week Y` folders).  
  Extract `next_actions` from frontmatter.
- **B‑Bombs** – scan `AI-Suplex-777/B-Bombs/` similarly, but usually B‑Bombs are finished products; `next_actions` there are rare. Still, include them if present.
- **Insights** – scan `AI-Suplex-777/Insights/` (weekly files). Look for lines that contain actionable language (e.g., “next”, “todo”, “action”).
- **Raw tasks** – scan `AI-Suplex-777/Tasklists/RawTasks/` (if the user uses the manual capture macro) and `AI-Suplex-777/Next Steps/` (if using the 7‑7‑7 Next Steps folder).

### 2. Parse and deduplicate
- For each extracted task, record:
  - Task text
  - Source (file path)
  - Focus area (from frontmatter or inferred)
  - Date (file modification time or frontmatter date)
- Remove exact duplicates (same task text from same source).

### 3. Prioritise
- **High priority (🔴)**: Tasks marked as urgent in source, or tasks related to blockers, or tasks that appear in multiple sources, or tasks with imminent deadlines.
- **Medium priority (🟡)**: Routine tasks, tasks with no urgency.
- **Low priority (🟢)**: Nice‑to‑have, long‑term, or research tasks.
- If no priority indicated, default to Medium.

### 4. Assign Task IDs
- Generate sequential IDs (T001, T002, …) for each unique task in the combined list.

### 5. Group into sections
- **Immediate Priorities**: Tasks due in the next 24‑48 hours (or based on Hustler's stated urgency). If no due date, use high priority tasks.
- **Upcoming Tasks**: Other tasks (medium/low priority, or with later due dates).
- **Blockers**: Extract any blockers from session ends (e.g., “Waiting for Oracle support”) and suggest a next action.

### 6. Output the markdown
- Use the template above.
- Include a footer note about how to use the tasklist.

### 7. Offer to save
- Ask the user if they want to save the tasklist to `Tasklists/Combined/`. If yes, write the file and confirm.

---

## 📝 Example

**User:** “Orchestrator, generate combined tasklist from last 7 days.”

**AI (after scanning):** (produces markdown as shown in the template, with actual tasks extracted from the user's vault).

---

## 🔗 Integration

- The **Architect – Session Start Prompt Generator** skill can take a Task ID from this combined tasklist and generate a session start prompt.
- The **Sweeper – Enhance MOCs & Trackers** script can be run before this skill to ensure that all next actions are up‑to‑date.

---

## ✅ Quality Checklist

- [ ] All tasks are deduplicated (no identical entries).
- [ ] Sources are clearly cited (file path or session date).
- [ ] Priorities are assigned logically.
- [ ] Blockers are separated from actionable tasks.
- [ ] The output is ready to copy or save.

---

**TWABAM ⚡!** This skill turns scattered next actions into a single, actionable plan. Use it daily or weekly to stay on top of your tasks. 🦸💣
