---
skill_name: "Architect – Session End Prompt Generator"
role: "Architect"
version: "1.0"
date: 2026-04-10
tags: [skill, architect, session-end, prompt-generator, ai-suplex]
---

# Architect Skill: Session End Prompt Generator

## 🎯 Purpose

Generate a **blank Session End Prompt** that the Hustler can fill after completing a session. The prompt follows the structure defined in `Session End Template.yaml` and includes all necessary fields:

- **Session_Rating** (1–5)
- **Completion_Status** (completed, partial, blocked)
- **Key_Insights** (list of learnings)
- **Next_Actions** (list of immediate follow‑ups)
- **Blockers** (list of obstacles, if any)
- **Session_Narrative** (optional free‑text summary)

The Hustler can copy the prompt into an AI chat (or fill it directly) and then use the `Architect – Session End Report Generator` skill to transform the filled prompt into a formatted session end report.

---

## 📥 Input

The Hustler can request a blank prompt with:

- **No parameters** – the Architect outputs a generic template.
- **Pre‑filled values** – e.g., “Generate a session end prompt for a WQR session with rating 4 and status partial” – the Architect will embed those values.
- **Focus, cycle, week** – if provided, the Architect can include them as context (though the end report will later read them from the session start file).

If the Hustler has just finished a session, they may also provide the **session start focus, cycle, week** to include in the prompt's optional metadata.

---

## 📤 Output

A **Session End Prompt** in the following format (YAML‑style, easy to copy and fill):

```yaml
AI-Suplex: Session End
  - Session_Rating: [1-5]
  - Completion_Status: [completed/partial/blocked]
  - Key_Insights:
      - [insight 1]
      - [insight 2]
  - Next_Actions:
      - [action 1]
      - [action 2]
  - Blockers:
      - [blocker, if any]
  - Session_Narrative: [optional free text]

Response_Protocol:
  - Generate a session end report in AI-Suplex-777/Sessions/Active/End/
  - Include frontmatter with date, time, rating, status, insights, next actions, blockers
  - Append key insights and next actions to the report body
  - Open the file for editing
```

The prompt is presented in a code block for easy copying. The Architect will **not** generate the actual report – that is the job of the `Architect – Session End Report Generator` skill. This skill only produces the blank form.

---

## 🧠 Workflow Instructions (for the AI)

When the Hustler says *“Architect, generate a session end prompt”*, follow these steps:

### 1. Determine if pre‑filled values are given
- If the Hustler provides specific values (e.g., “rating 4, status partial”), embed them in the prompt.
- Otherwise, use placeholders (`[1-5]`, `[insight 1]`, etc.).

### 2. Optionally include focus, cycle, week
- If the Hustler mentions the session’s focus, cycle, week, add a comment at the top (e.g., `# Session: wqr, Cycle 1, Week 3`). This helps when generating the report later.

### 3. Output the prompt
- Use the exact format above.
- Ensure the `Response_Protocol` is included verbatim (it tells the AI what to do when the Hustler submits the filled prompt).

### 4. Instruct the Hustler
- After outputting the prompt, remind the Hustler to:
  - Fill the placeholders with actual session data.
  - Send the filled prompt back to the AI (or use it in a new chat).
  - Then invoke the `Architect – Session End Report Generator` skill to create the report.

---

## 📝 Example

**User:** “Architect, generate a session end prompt for my WQR session (Cycle 1, Week 3).”

**AI output:**

```yaml
# Session: wqr, Cycle 1, Week 3

AI-Suplex: Session End
  - Session_Rating: [1-5]
  - Completion_Status: [completed/partial/blocked]
  - Key_Insights:
      - [insight 1]
      - [insight 2]
  - Next_Actions:
      - [action 1]
      - [action 2]
  - Blockers:
      - [blocker, if any]
  - Session_Narrative: [optional free text]

Response_Protocol:
  - Generate a session end report in AI-Suplex-777/Sessions/Active/End/
  - Include frontmatter with date, time, rating, status, insights, next actions, blockers
  - Append key insights and next actions to the report body
  - Open the file for editing
```

> [!tip] **Next step:** Fill the placeholders, then send this prompt back to the AI (or paste it into a new chat) and say “Generate a session end report from this filled prompt.”

---

## 🔗 Integration

- After the Hustler fills the prompt, they invoke **Architect – Session End Report Generator** to produce the final report.
- The report will be saved in `Sessions/Active/End/` and will appear in the Command Center.

---

## ✅ Quality Checklist

- [ ] The prompt uses the exact fields from `Session End Template.yaml`.
- [ ] Placeholders are clear and easy to replace.
- [ ] The `Response_Protocol` is included.
- [ ] The Hustler is instructed on next steps.

---

**TWABAM ⚡!** This skill gives the Hustler a consistent, fill‑in‑the‑blanks form to end every session. Use it immediately after completing a session. 🦸💣
