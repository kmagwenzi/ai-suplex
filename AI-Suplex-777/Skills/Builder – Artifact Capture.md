---
skill_name: "Builder – Artifact Capture"
role: "Builder"
version: "1.0"
date: 2026-04-10
tags: [skill, builder, artifact, capture, macro, ai-suplex]
---

# Builder Skill: Artifact Capture

## 🎯 Purpose

Capture a **work‑in‑progress artifact** (code snippet, diagram, prompt pattern, research note, design mockup, etc.) and save it as a structured markdown file in the appropriate folder – flat `Artifacts/` for Core Edition, or nested `Artifacts/Cycle X/Week Y/` for 7‑7‑7 Edition. The artifact includes frontmatter (focus, cycle, week, key insights, next actions) and placeholders for learnings and next steps.

This skill is implemented as a **QuickAdd script macro** (`Artifact.js`). The Builder (Hustler or AI) runs the macro, fills the prompts, and the script automatically creates the file and opens it for editing.

---

## 📥 When to Use

- **During or after a session** – when you have created something valuable that is not yet polished (e.g., a prompt you tested, a workflow diagram, a piece of code, a draft document).
- **Before promoting to a B‑Bomb** – artifacts are the raw material; B‑Bombs are the polished, reusable versions.
- **When you want to track progress** – artifacts are counted in weekly reviews and MOCs.

---

## 📤 What the Macro Does

The script macro (`Artifact.js`) performs the following steps:

1. **Prompts the user** (via QuickAdd) for:
   - `Focus` – dropdown (from `Focuses.md` or default list)
   - `Cycle` – dropdown (1–7) (7‑7‑7 Edition only; Core Edition skips)
   - `Week` – dropdown (1–7) (7‑7‑7 Edition only; Core Edition skips)
   - `Title` – text input
   - `Overview` – brief description
   - `Primary Objective` – what this artifact aims to achieve
   - `Success Criteria` – how to know it’s complete
   - `Intended Use` – who will use it and how
   - `Artifact Content` – multiline text (paste code, diagrams, notes)
   - `Key Insight` – one sentence (optional, expand later)
   - `Next Action` – one sentence (optional, expand later)

2. **Generates a filename** in the format:  
   `YYYY-MM-DD-HHMM-focus-title.md` (e.g., `2026-04-10-1430-wqr-webhook-config.md`)

3. **Creates the folder structure** if missing:
   - Core Edition: `AI-Suplex-777/Artifacts/`
   - 7‑7‑7 Edition: `AI-Suplex-777/Artifacts/Cycle X/Week Y/`

4. **Writes the file** with:
   - YAML frontmatter (tags, focus, cycle, week, key_insights, next_actions, date, time)
   - Headings: `# Title`, `## 📋 Overview`, `## 🎯 Purpose & Goals`, `## 📦 Artifact Content`, `## 🧠 Learnings & Insights`, `## 🔄 Next Steps`
   - External resource links: `[[focus MOC]]` and `[[focus Tracker]]` (7‑7‑7 Edition)

5. **Opens the file** in a new Obsidian tab for immediate editing.

6. **Shows a notice** confirming creation.

---

## 📝 Example Output File (7‑7‑7 Edition)

```markdown
---
tags:
  - artifact
  - work-in-progress
  - #wqr
  - #7/1/1
date: 2026-04-10
time: 2026-04-10T14:30:00
focus: wqr
cycle: 1
week: 1
key_insights: "Webhook fixed by removing prefix"
next_actions: "Test payment flow"
---

# WQR Webhook Configuration

## 📋 Overview
n8n webhook setup for Paynow integration.

## 🎯 Purpose & Goals
- **Primary Objective:** Receive payment confirmations.
- **Success Criteria:** Webhook receives POST requests.
- **Intended Use:** Automate order status updates.

## 📦 Artifact Content
{
  "webhook": "https://wqr.co.zw/paynow",
  "method": "POST"
}


### External Resources
- [[wqr MOC]]
- [[wqr Tracker]]

## 🧠 Learnings & Insights
*What did you learn while creating this artifact?*
1. 
2. 
3.

## 🔄 Next Steps
1. 
2. 
3.

---
*Artifact captured via QuickAdd on 2026-04-10*
```

---

## 🧠 How to Invoke the Skill

### **For the Human (Hustler)**
- Run the QuickAdd macro named **“Artifact”** (or whatever you named it).
- Fill in the prompts.
- The file is created and opened.

### **For the AI (when acting as Builder)**
- If you have access to Obsidian and QuickAdd, you can trigger the macro programmatically (if supported).
- Alternatively, you can **simulate** the capture by generating the markdown content and asking the Hustler to save it (or using a script to write the file).

In most workflows, the **Hustler** runs the macro manually; the AI **guides** the process by reminding the user to capture artifacts.

---

## 🔗 Integration with Other Skills

| Skill                                | How It Uses Artifacts                                                |
| ------------------------------------ | -------------------------------------------------------------------- |
| **Architect – Quality Review**       | Reviews the artifact for completeness and suggests improvements.     |
| **Architect – Promotion Suggestion** | Scans artifacts and recommends which are ready to become B‑Bombs.    |
| **Builder – B‑Bomb Promotion**       | Converts a polished artifact into a B‑Bomb (using the B‑Bomb macro). |
| **Sweeper – Folder Maintenance**     | Ensures the `Artifacts/` folder structure exists.                    |
| **Orchestrator – Weekly Review**     | Counts artifacts produced during the week.                           |

---

## ✅ Quality Checklist for Using This Skill

- [ ] **Focus, cycle, week** are correctly selected (affects MOC and tracker queries).
- [ ] **Title** is descriptive and concise.
- [ ] **Overview** explains what the artifact is in one or two sentences.
- [ ] **Primary Objective** is specific and actionable.
- [ ] **Artifact Content** is not left as “*(Content to be added)*” – paste or write something substantive.
- [ ] **Key insights and next actions** are filled (or will be filled later).
- [ ] The file is saved in the correct folder (the macro does this automatically).

---

## 🚀 Next Steps After Capture

1. **Refine** – Open the file and expand the insights, next steps, and content.
2. **Request Quality Review** – Ask the Architect to review it.
3. **Promote to B‑Bomb** – When ready, use the **Builder – B‑Bomb Promotion** skill/macro.

---

**TWABAM ⚡!** This skill turns raw outputs into structured, trackable assets. Use it after every meaningful piece of work. 🦸💣
