---
skill_name: "Builder – B‑Bomb Promotion"
role: "Builder"
version: "1.0"
date: 2026-04-18
tags: [skill, builder, b-bomb, promotion, macro, ai-suplex]
---

# Builder Skill: B‑Bomb Promotion

## 🎯 Purpose

Promote a **polished artifact** (or other substantial work) to a **B‑Bomb** – a product‑ready, reusable asset that can be added to your portfolio, shared with clients, or used across projects. The B‑Bomb includes enhanced frontmatter (product potential, innovation quotient, strategic insights) and structured sections (Applications, Quality Assessment, Integration Points).

This skill is implemented as a **QuickAdd script macro** (`B‑Bomb.js`). The Builder (Hustler or AI) runs the macro, selects or provides the artifact content, and the script creates the B‑Bomb file in the appropriate `B‑Bombs/Cycle X/Week Y/` folder.

---

## 📥 When to Use

- **After an artifact is refined** – when a work‑in‑progress asset has been polished, tested, and documented.
- **When you have a standalone product‑ready deliverable** – e.g., a completed script, a documented workflow, a design system, a marketing template.
- **Before portfolio presentation** – B‑Bombs are the final, showcase‑worthy version of your work.
- **When you want to track reusable assets** – B‑Bombs are counted in weekly reviews and can be linked from MOCs and the Command Center.

---

## 📤 What the Macro Does

The script macro (`B‑Bomb.js`) performs the following steps:

1. **Prompts the user** (via QuickAdd) for:
   - `Focus` – dropdown (from `Focuses.md` or default list)
   - `Cycle` – dropdown (1–7) (7‑7‑7 Edition only; Core Edition skips)
   - `Week` – dropdown (1–7) (7‑7‑7 Edition only; Core Edition skips)
   - `Title` – text input
   - `Description` – brief overview of the B‑Bomb
   - `Product Potential` – assessment (Low, Medium, High, Very High) with optional explanation
   - `Innovation Quotient` – rating (1–10)
   - `Completeness` – rating (1–10)
   - `Reusability` – rating (1–10)
   - `Documentation` – rating (1–10)
   - `Key Insights` – one or more strategic learnings
   - `Next Actions` – concrete follow‑up steps
   - `B‑Bomb Content` – multiline text (paste the polished content, code, diagrams, etc.)
   - `Insights` – bullet‑point learnings derived from the work
   - `Applications` – where this B‑Bomb can be applied
   - `Integration Points` – links to related files (Command Center, Trackers, etc.)

2. **Generates a filename** in the format:  
   `YYYY‑MM‑DD‑HHMM‑title‑focus.md` (e.g., `2026‑04‑18‑2021‑deep‑ultra‑model‑orchestration‑b‑bomb‑digital‑products.md`)

3. **Creates the folder structure** if missing:
   - Core Edition: `AI‑Suplex‑777/B‑Bombs/`
   - 7‑7‑7 Edition: `AI‑Suplex‑777/B‑Bombs/Cycle X/Week Y/`

4. **Writes the file** with:
   - YAML frontmatter (tags, focus, cycle, week, product_potential, innovation_quotient, completeness, reusability, documentation, date, time, key_insights, next_actions)
   - Headings: `# 💣 B‑BOMB: Title`, `**Author:**`, `**Status:**`, `## Description`, `## 💣 B‑Bomb content`, `## Insights`, `## Applications`, `## Quality Assessment`, `## Integration Points`, `## Next Steps`, `## Version History`
   - External resource links: `[[focus MOC]]` and `[[focus Tracker]]` (7‑7‑7 Edition)

5. **Opens the file** in a new Obsidian tab for immediate editing.

6. **Shows a notice** confirming creation.

---

## 📝 Example Output File (7‑7‑7 Edition)

```markdown
---
tags:
  - b‑bomb
  - digital‑products
  - 7/1/1
date: 2026‑04‑18
time: 2026‑04‑18T20:21:00
focus: digital‑products
cycle: 1
week: 1
product_potential: "High – reusable framework for multi‑model AI orchestration across product launches"
innovation_quotient: 9
completeness: 8
reusability: 9
documentation: 8
key_insights: "Multi‑model AI orchestration creates a weapon system where each model's superpower is strategically deployed for maximum impact"
next_actions: "Implement the Deep Ultra orchestration script to automate model‑specific task execution"
---

# 💣 B‑BOMB: Deep Ultra Model Orchestration Framework

**Author:** Kudakwashe Magwenzi  
**Status:** Ready for use

## Description
Strategic mapping of four AI models (DeepSeek, MiniMax, GLM, Qwen) to prelaunch and launch tasks, creating an "Avengers of AI" deployment where each model's unique superpower is leveraged for specific execution phases. This B‑Bomb provides a complete orchestration framework for multi‑model AI deployment across testing, content creation, legal review, and marketing blitz.

## 💣 B‑Bomb content
---

[Polished content goes here – e.g., the refined artifact, code snippets, diagrams, etc.]

---

## Insights
- Strategic model assignment eliminates overlap and maximizes each AI's unique capabilities
- Multi‑model orchestration transforms individual tools into a cohesive "weapon system" for product launches

## Applications
*Where can this B‑Bomb be applied?*
- Product Launch Orchestration: Framework for deploying multiple AI models across prelaunch and launch phases
- AI Team Management: Model selection guide for complex projects requiring diverse AI capabilities

## Quality Assessment
**Innovation Quotient:** 9/10  
**Completeness:** 8/10  
**Reusability:** 9/10  
**Documentation:** 8/10

## Integration Points
- **[[Command Center]]** – Add to AI‑Suplex orchestration dashboard
- **[[Trackers]]** – Track progress on prelaunch checklist
- **Created during session:** Artifact capture session 2026‑04‑18T19:58:55
- **Template used:** B‑Bomb.md

## Next Steps
*How can this B‑Bomb be improved or expanded?*
1. Create the `launch_prep.sh` orchestration script to automate model‑specific task execution
2. Test each model's assigned tasks in their respective environments

## Version History
- **v1.0** – 2026‑04‑18 – Initial creation from artifact promotion

---
_B‑Bomb added to arsenal via AI‑Suplex on 2026‑04‑18_
```

---

## 🧠 How to Invoke the Skill

### **For the Human (Hustler)**
- Run the QuickAdd macro named **“B‑Bomb”** (or whatever you named it).
- Fill in the prompts.
- The file is created and opened.

### **For the AI (when acting as Builder)**
- If you have access to Obsidian and QuickAdd, you can trigger the macro programmatically (if supported).
- Alternatively, you can **simulate** the promotion by generating the B‑Bomb markdown content and asking the Hustler to save it (or using a script to write the file).

In most workflows, the **Hustler** runs the macro manually; the AI **guides** the process by reviewing the artifact and recommending promotion.

---

## 🔗 Integration with Other Skills

| Skill                            | How It Uses B‑Bombs                                                              |
| -------------------------------- | -------------------------------------------------------------------------------- |
| **Architect – Quality Review**   | Reviews the B‑Bomb for completeness, innovation quotient, and product potential. |
| **Orchestrator – Weekly Review** | Counts B‑Bombs produced during the week and highlights high‑impact assets.       |
| **Sweeper – Folder Maintenance** | Ensures the `B‑Bombs/` folder structure exists and archives old cycles.          |
| **Command Center Dashboard**     | Displays recent B‑Bombs and their product potential scores.                      |

---

## ✅ Quality Checklist for Using This Skill

- [ ] **Focus, cycle, week** are correctly selected (affects MOC and tracker queries).
- [ ] **Title** is descriptive and concise, prefixed with "B‑BOMB:" in the file.
- [ ] **Description** clearly explains what the B‑Bomb is and its value.
- [ ] **Product Potential** is realistically assessed (Low, Medium, High, Very High).
- [ ] **Quality ratings** (Innovation, Completeness, Reusability, Documentation) are honest and justified.
- [ ] **B‑Bomb Content** is polished, well‑structured, and ready for reuse.
- [ ] **Insights** capture strategic learnings from the work.
- [ ] **Applications** list concrete use cases for the B‑Bomb.
- [ ] **Integration Points** link to relevant system files (Command Center, Trackers, etc.).
- [ ] The file is saved in the correct folder (the macro does this automatically).

---

## 🚀 Next Steps After Promotion

1. **Share** – Add the B‑Bomb to your portfolio, share with clients, or publish as a template.
2. **Integrate** – Update the Command Center dashboard to highlight the new B‑Bomb.
3. **Reuse** – Apply the B‑Bomb in relevant projects or sessions.
4. **Iterate** – Use the version history to track improvements and expansions.

---

**TWABAM ⚡!** This skill transforms polished work into product‑ready assets that amplify your impact. Use it when you have something worth showcasing. 🦸💣
