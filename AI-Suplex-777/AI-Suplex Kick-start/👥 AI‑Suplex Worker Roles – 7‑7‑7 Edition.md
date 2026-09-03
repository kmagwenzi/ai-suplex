---
title: AI‑Suplex Worker Roles – 7‑7‑7 Edition
version: 1.0
date: 2026-04-10
tags: [roles, full, ai-suplex]
---

# 👥 AI‑Suplex Worker Roles – 7‑7‑7 Edition

**TWABAM ⚡!** AI‑Suplex divides work into **roles** – not job titles, but **hats you wear** during different tasks. In the 7‑7‑7 Edition, we have five roles, each with clear responsibilities.

---

## 🎯 The Big Picture
### 👥 AI‑SUPLEX WORKFORCE (The 5 Roles)

| Role             | Who               | Mission                                                                                                                                | Example Task                                                                      |
| ---------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Hustler**      | Human             | Strategy, energy, offline work, cultural validation                                                                                    | “Build a landing page for Client Project”                                                    |
| **Orchestrator** | AI                | Organizes the plan – turns messy input into structured tasklist or generates a  timed execution plan (1 week, 7 weeks, 3 months, etc ) | Converts “Build landing page” → Task ID `LP-01` with subtasks, roles, durations   |
| **Architect**    | AI                | Generates or enhances prompts; quality‑checks Builder outputs                                                                          | “Write a session start prompt for Task LP-01” or “Review this B‑Bomb for quality” |
| **Builder**      | AI                | Generates artifacts and B‑Bombs (code, prompts, docs, designs)                                                                         | Executes the prompt, produces the landing page code                               |
| **Sweeper**      | AI agent + Macros | Vault manipulation – special operations on Obsidian files/folders                                                                      | `Sweeper – Archive Session.js`, `Sweeper – Create MOC.js`                         |

**Simple memory aid:**  
_Hustler drives. Orchestrator maps. Architect designs. Builder builds. Sweeper cleans._

**Output by every role** - _Easy key to remember roles_

Hustler -> Instructions
Ocahstrator -> Plans
Architect -> Prompts
Builder -> Artifacts or B-Bombs
Sweeper -> Vault Operations

---

### 🔄 THE WORKFLOW (One Sentence per Step)

1. **Hustler** provides a **to‑do list** (raw, messy).
2. **Orchestrator** converts it into a structured **AI‑Suplex Tasklist** (Session Number, Task IDs, roles, durations).
3. **Architect** takes a Session Number,  Task ID and generates a **Session Start Prompt** (mission, tasks, success metrics).
4. **Hustler** starts an **AI‑Suplex Session** (works, may invoke Builder during session).
5. **Builder** captures **Artifacts, B‑Bombs, and Insights** as work progresses.
6. **Hustler** requests a **Session End Prompt** (blank template).
7. **Architect** generates the **Session End Prompt** (YAML + questions).
8. **Hustler** fills in the prompt (ratings, insights, next actions).
9. **Builder** generates a formatted **Session End Report** (saved to vault).
    
**Visual (linear):**

```text
To‑do list → Tasklist → Session Start Prompt → Session Start → Artifacts/B‑Bombs/Insights → Session End Prompt → Session End Report
```

> [!note] **Script‑based Sweeper tasks (file and folder operations) are preferred** – They prevent long API calls .

---

## 🦸 Hustler (You – The Human)

**The Hustler is always you.** No AI can replace you.

### Responsibilities
- **Strategic direction** – deciding what to work on, setting goals
- **Offline tasks** – phone calls, bank visits, client meetings, installations
- **Cultural validation** – ensuring content is appropriate for your audience
- **Energy management** – knowing when to push and when to rest
- **Final approval** – signing off on deliverables
- **Running macros** – clicking buttons to execute scripts

### When You Wear This Hat
- Planning your week
- Calling a client
- Reviewing a B‑Bomb before sending to a client
- Running Sweeper macros (Create MOC, Create Tracker, Archive, Enhance)
- Deciding to start a new cycle

> [!quote] **The Hustler's motto**  
> *“AI assists. I decide. And I press the buttons.”*

---

## 🎼 Orchestrator (AI)

The **Orchestrator** is the strategic AI role. It helps you plan, break down tasks, and review progress.

### Responsibilities
- Converting raw to‑do lists into structured AI‑Suplex tasklists (with roles, durations, nature of work)
- Aggregating tasks from multiple sources into a Combined Tasklist
- Producing weekly reviews (analysing session data, recommending improvements)
- High‑level resource allocation (e.g., “focus on Client Project this week”)

### How to Use the Orchestrator
Open one of the Orchestrator skill files in `Skills/` (e.g., `Orchestrator – AI‑Suplex Tasklist Generator.md`), copy the content, paste into an AI chat (Claude, ChatGPT, DeepSeek), and say:

> *“Act as an AI‑Suplex Orchestrator.”*

Then give your input (e.g., a to‑do list, a request for a weekly review).

### When You Call the Orchestrator
- At the start of the week – to generate a tasklist from your goals
- Before a weekly review – to analyse session data
- When you have too many tasks and need prioritisation

---

## 🏛️ Architect (AI)

The **Architect** is the quality and prompt‑generation AI role. It helps you write better session prompts and reviews outputs.

### Responsibilities
- Generating session start prompts from a task ID (or from a description)
- Generating session end prompts (blank forms for you to fill)
- Transforming a filled session end prompt into a formatted Session End Report (using `Session End - Report Template.md`)
- Reviewing artifacts and B‑Bombs for quality, suggesting improvements
- Estimating Innovation Quotient (IQ)

### How to Use the Architect
Open one of the Architect skill files (e.g., `Architect – Session Start Prompt Generator.md`), copy, paste into an AI chat, and say:

> *“Act as an AI‑Suplex Architect.”*

Then give your input (e.g., “Generate a session start prompt for Task ID T001”).

### When You Call the Architect
- Before a session – to generate a structured start prompt
- After a session – to generate an end prompt or a full report
- When reviewing an artifact – to check if it's ready to become a B‑Bomb

---

## 🛠️ Builder (AI or You)

The **Builder** is the execution role. It runs macros and captures outputs. In practice, you (the Hustler) often act as Builder by clicking the Commander buttons. But an AI can also guide you or (if integrated) run macros.

### Responsibilities
- Running `Session Start`, `Session End`, `Artifact`, `BBomb`, `Insight` macros
- Capturing work‑in‑progress as artifacts
- Promoting polished artifacts to B‑Bombs
- Logging insights during sessions
- Following the session plan

### Who Can Be the Builder?
- **You** – click the Commander buttons; the macros guide you through prompts.
- **An AI assistant** – if you give it permission and the right context (see `AGENTS.md`), it could theoretically trigger macros via Obsidian API (advanced). For most users, you are the Builder.

### When You Wear This Hat
- Clicking 🚀 Start, 🏁 End, 📄 Artifact, 💣 B‑Bomb, 💡 Insight
- Filling in the prompts (mission, tasks, insights, etc.)

> [!note] **Builder is not a separate person**  
> It's a role you or an AI can take. The macros make it easy.

---

## 🧹 Sweeper (Scripts – Not AI)

The **Sweeper** is a collection of JavaScript macros that automate file operations, folder creation, and dashboard generation. The AI never acts as Sweeper – you run the macros.

### Sweeper Scripts (in `Scripts/`)

| Script                                     | What It Does                                      | When to Run                                      |
| ------------------------------------------ | ------------------------------------------------- | ------------------------------------------------ |
| `Focus Manager.js`                         | Add/edit/delete focus areas                       | At setup, or when your projects change           |
| `Sweeper – Create MOC.js`                  | Generate Maps of Content for all focuses          | After defining focuses, or when a focus is added |
| `Sweeper – Create Tracker.js`              | Generate progress trackers for the current cycle  | At the start of a new cycle                      |
| `Sweeper – Archive Session.js`             | Move a single session to archive                  | After a session is fully reviewed                |
| `Sweeper – Archive All Active Sessions.js` | Bulk archive all active sessions                  | At the end of a cycle                            |
| `Sweeper – Enhance MOCs & Trackers.js`     | Inject recent session data into MOCs and Trackers | Before a weekly review                           |

### How to Use Sweeper
- Click the corresponding Commander button (e.g., 🗺️ MOC, 📊 Tracker, 📦 Archive, 🔄 Enhance).
- Or run from Command Palette: `Sweeper – Create MOC`, etc.
- No AI involvement – just one click.

---

## 🔄 How Roles Work Together (Example)

**Scenario:** You want to fix an Oracle cloud block for Client Project, then review your week.

1. **You (Hustler)** decide this is the priority.
2. You ask **Orchestrator** (AI) to break down your to‑do list into a tasklist.
3. **Orchestrator** returns a structured tasklist with Task ID T001.
4. You ask **Architect** (AI) to generate a session start prompt for T001.
5. **Architect** returns a prompt.
6. **You (Builder)** click 🚀 Start, paste the prompt, and fill in details.
7. During the session, you (Builder) capture an artifact (📄 Artifact) and an insight (💡 Insight).
8. You end the session (🏁 End) and fill the end prompt.
9. You ask **Architect** to generate a session end report from the filled prompt.
10. **Architect** returns a formatted report.
11. At the end of the week, you run **Sweeper – Enhance MOCs & Trackers** (click 🔄 Enhance).
12. You ask **Orchestrator** to run a weekly review, feeding it the enhanced dashboards.
13. **Orchestrator** returns a strategic summary with recommendations.

**No role is redundant.** Each serves a clear purpose.

---

## 🧠 Quick Reference Table

| Role             | Human or AI? | How to Activate     | Typical Action                          |
| ---------------- | ------------ | ------------------- | --------------------------------------- |
| **Hustler**      | Human (you)  | Always              | “I'll call the bank.”                   |
| **Orchestrator** | AI           | Paste skill file    | “Generate a tasklist from these items.” |
| **Architect**    | AI           | Paste skill file    | “Review this artifact.”                 |
| **Builder**      | AI or you    | Click macro buttons | Click 🚀 Start, fill prompts.           |
| **Sweeper**      | Scripts      | Click button        | Click 🗺️ MOC, 📊 Tracker, etc.         |

---

## 📚 Related Documents

- `AI-Suplex Methodology.md` – explains the overall philosophy
- `AGENTS.md` – full AI context for all roles
- `AI-Suplex Glossary.md` – definitions of B‑Bomb, Twabam, etc.
- `Session End - Report Template.md` – used by Architect

---

**TWABAM ⚡!**  
Now you know who does what in the 7‑7‑7 Edition. Wear the right hat, and watch your productivity explode.

**– The AI‑Suplex Team**