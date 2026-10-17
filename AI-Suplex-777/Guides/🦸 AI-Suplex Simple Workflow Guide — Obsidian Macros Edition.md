# AI-Suplex Simple Workflow Guide

**TWABAM ⚡!** This guide takes you from unzipping to your first completed session in 10 minutes. Follow each step in order.

---

## Step 1: Unzip & Open

Unzip the file. You'll see:
```
7-7-7 Edition/
├── .obsidian/         ← Plugin configs
└── AI-Suplex-777/     ← Your product vault
```

**Open the outer folder** (`7-7-7 Edition/`) in Obsidian. Trust the plugins (Commander + Dataview + the vault's macros) when prompted.

---

## Step 2: Add Your First Focus

A Focus is a work domain you want to track (e.g., Freelance, AI Engineering).

1. Open Command Palette (`Ctrl/Cmd+P`)
2. Type: `Focus Manager`
3. Add a focus — give it a name, display name, and description
4. Repeat for each area of your work

Your focuses appear in `Focuses.md`.

---

## Step 3: Generate MOCs & Trackers

MOCs (Maps of Content) and Trackers are auto-populated dashboards that show your progress.

1. `Ctrl/Cmd+P` → Type:  `Create MOC` — generates a dashboard per focus
2. `Ctrl/Cmd+P` → Type:  `Create Tracker` — generates a progress tracker per focus

Open `MOCs/` and `Trackers/` to see them. They update automatically as you work.

---

## Step 4: Start a Session

1. Click the 🚀 **Start** button in the left ribbon
2. Choose your **focus area**
3. Select **session type** (execution, planning, review, creative)
4. Pick **cycle** and **week**
5. Set your **energy level**
6. Write your **mission** and **tasks**

A session start file is created in `Sessions/Active/Start/`.

---

## Step 5: Work & Capture

During your session, capture everything:

| Macro                 | Button  | What it saves                                          |
| --------------------- | ------- | ------------------------------------------------------ |
| 📄 **Artifact**       | Ribbon  | Work-in-progress with metadata                         |
| 💡 **Insight**        | Ribbon  | Quick learnings (appends to weekly file)               |
| 💣 **B-Bomb**         | Ribbon  | Polished, reusable assets                              |
| 🧠 **Feed 3LM** | Toolbar | Insights into persistent memory - _see Insights after_ |

Files are saved in `Artifacts/<Period>/Cycle X/Week Y/` and `B-Bombs/<Period>/Cycle X/Week Y/`.

---

## Step 6: End the Session

1. Click 🏁 **End** in the left ribbon
2. Rate your session (1-5)
3. Note key insights and next actions
4. The report is saved in `Sessions/Active/End/`

---

## Step 7: Review Your Progress

Open `Command Center.md` — your live dashboard shows:
- Recent sessions with ratings
- Focus area health
- Latest B-Bombs and Artifacts
- Pending next actions

Run `Enhance MOCs & Trackers` before your weekly review to inject fresh data.

---

## Working in More Than One Window

Macros are vault-side, so they stay thread-agnostic. **When you add an AI agent or a second chat window**, follow the threads model:

- **One instance = one context file.** Pick a thread (`daily-tasks` · `long-running-tasks` · `random-task` · `realist`) and keep its context separate.
- **Save Context** with `AI-Suplex: Save Context`; the file lands in `Context Kick-start/Active/{thread}-{ref}-{slug}.md`.
- **Only the daily-tasks thread** refreshes the Active Mission Context (`AGENTS.md`).
- **Close with a commit** (`node Tools/3lm.js sync`), not with the file alone.

> 📖 Read `Guides/Guide — Context & Threads.md` before running parallel windows.

---

## What's Next?

- **Weekly Review:** Run `Sweeper – Weekly Review` every Saturday
- **Cycle Review:** Run `Sweeper – Generate Cycle Review` at the end of Week 7
- **Deep Dive:** Read `AI-Suplex Kick-start/The AI-Suplex Workflow Pipeline.md` for the full strategic pipeline and `Guides/🦸 AI-Suplex Full Workflow Guide.md` for the full workflow
- _Try the Prompt Patterns approach — it is often quicker and easier for completing steps_

---

**You're now running the 7-7-7 rhythm.** Go capture your first session. 🦸⚡
