---
skill_name: "Builder – Session End Report Generator"
role: "Builder"
version: "1.0"
date: 2026-04-10
tags: [skill, builder, session-end, report-generator, ai-suplex]
---

# Builder Skill: Session End Report Generator

## 🎯 Purpose

Transform a **filled Session End Prompt** (provided by the Hustler after a session) into a **complete, formatted Session End Report** markdown file. The report follows the structure of `Session End - Report Template.md` (or the simpler version used in Core/7‑7‑7 editions) and is saved to `AI-Suplex-777/Sessions/Active/End/`.

This skill is the **Builder’s execution step** after the Architect has generated the blank prompt and the Hustler has filled it.

---

## 📥 Input

The Hustler provides the **filled Session End Prompt** – a YAML‑style block containing:

- `Session_Rating` (1–5)
- `Completion_Status` (completed, partial, blocked)
- `Key_Insights` (list of insights)
- `Next_Actions` (list of follow‑ups)
- `Blockers` (list of obstacles, optional)
- `Session_Narrative` (optional free text)

Optionally, the Hustler may also provide:

- **Focus, cycle, week** – if not already in the prompt, the Builder should ask or infer from the most recent session start file.
- **Session start file path** – to inherit focus, cycle, week, and duration.

If the Hustler does not provide focus, cycle, week, the Builder will attempt to read them from the most recent session start file (matching by date). If that fails, the Builder will ask the Hustler for the missing fields.

---

## 📤 Output

A markdown file saved to `AI-Suplex-777/Sessions/Active/End/` with a filename like:

`YYYY-MM-DD-HHMM-focus-session-end.md`

The file contains:

- **YAML frontmatter** with all session metadata (date, time, focus, cycle, week, rating, completion status, insights, next actions, blockers, etc.)
- **Human‑readable sections** for narrative, insights, next actions, blockers, and quality assessment (if applicable)
- **Quick links** to Insights, B‑Bombs, Artifacts

The Builder will display the report content in the chat (for review) and then, with the Hustler’s permission, write it to the vault.

---

## 🧠 Workflow Instructions (for the AI)

When the Hustler says *“Builder, generate a session end report from this filled prompt”*, follow these steps:

### 1. Parse the filled prompt
Extract the fields:
- `Session_Rating`
- `Completion_Status`
- `Key_Insights` (list)
- `Next_Actions` (list)
- `Blockers` (list)
- `Session_Narrative` (string)

If any field is missing, ask the Hustler to provide it.

### 2. Determine focus, cycle, week
- If the prompt includes them (e.g., as a comment `# Session: wqr, Cycle 1, Week 3`), use those.
- Otherwise, look for the most recent session start file in `AI-Suplex-777/Sessions/Active/Start/` (by modification time). Read its frontmatter to get `focus`, `cycle`, `week`, and `duration_minutes`.
- If no start file exists, ask the Hustler to provide focus, cycle, week.

### 3. Calculate additional fields
- `date` and `time` – use current date and time.
- `duration_minutes` – from session start file, or ask Hustler.
- `energy_start`, `energy_end` – if not provided, leave blank or use placeholders. (In Core/7‑7‑7, these are optional.)
- `focus_quality` – can be left blank or inferred from rating (optional).

### 4. Generate the frontmatter
Use the template:

```yaml
---
date: {{current date YYYY-MM-DD}}
time: {{current time HH:MM}}
focus: {{focus}}
cycle: {{cycle}}
week: {{week}}
session_rating: {{rating}}
completion_status: {{status}}
key_insights: "{{insights joined by ; }}"
next_actions: "{{actions joined by ; }}"
blockers: "{{blockers joined by ; }}"
duration_minutes: {{duration}}
---
```

### 5. Generate the report body
Use the following structure:

```markdown
# AI-Suplex: Session End

## Session Narrative
{{narrative}}

## Key Insights
- {{insight1}}
- {{insight2}}

## Next Actions
- [ ] {{action1}}
- [ ] {{action2}}

## Blockers
- {{blocker1}} (if any)

## Quick Links
- [[Insights]]
- [[B-Bombs]]
- [[Artifacts]]
```

For the 7‑7‑7 Edition, you may also include a `## Quality Assessment` section (optional, can be filled later).

### 6. Create the filename
Format: `{{YYYY-MM-DD}}-{{HHMM}}-{{focus}}-session-end.md`

### 7. Save the file
- Ask the Hustler for confirmation: “Ready to save the report to `Sessions/Active/End/`?”
- If yes, write the file using `vault.create()` (if you have API access) or instruct the Hustler to save it manually (if in a chat without file access).
- If you can write directly, do so and confirm with a notice.

### 8. Notify the Hustler
- Tell the Hustler the file has been saved and will appear in the Command Center.

---

## 📝 Example

**User:** “Builder, generate a session end report from this filled prompt:

```
AI-Suplex: Session End
  - Session_Rating: 4
  - Completion_Status: partial
  - Key_Insights:
      - Webhook worked after removing 'whatsapp:' prefix
  - Next_Actions:
      - Test payment flow tomorrow
  - Blockers:
      - Waiting for Oracle support
  - Session_Narrative: Spent most of the time troubleshooting the webhook.
```
(Also, the session was for WQR, Cycle 1, Week 3.)”

**AI (Builder):** (Parses, creates frontmatter and body, then outputs the file content and saves it.)

---

## 🔗 Integration

- This skill is used **after** the `Architect – Session End Prompt Generator` and the Hustler has filled the prompt.
- The resulting report is picked up by the `Command Center` (Dataview queries) and by the `Orchestrator – Combined Tasklist Generator` (next actions).

---

## ✅ Quality Checklist

- [ ] Focus, cycle, week are correctly set.
- [ ] Frontmatter includes all required fields.
- [ ] Insights and next actions are captured as lists.
- [ ] The report is saved in the correct folder with a proper filename.
- [ ] The Hustler is notified of the save location.

---

**TWABAM ⚡!** This skill turns raw session data into a permanent, trackable report. Use it after every session to close the loop. 🦸💣
```

---

**TWABAM ⚡!** The skill file is ready. Save it in `AI-Suplex-777/Skills/`. Let me know if you need the next skill (e.g., `Builder – Artifact Capture.md`). 🦸💣