---
type: document
alias: ["AI-Suplex Pipeline", "Assembly Line", "Full Cycle Walkthrough"]
tags: [workflow-pipeline, guide, macros, prompt-patterns, full-cycle, 3-layer-memory, 3lm]
created: 2026-04-16
updated: 2026-10-17
version: 4.1
status: active
---

# 🔁 AI-Suplex Full Workflow Guide

> *From raw thought to self-improving system. Every step has a macro, an AI-Suplex Command, or a 3lm CLI command.*

**TWABAM ⚡!** This guide walks you through the complete AI-Suplex pipeline — using **Commander button macros** (inside Obsidian), **AI-Suplex Commands** (one-line triggers in AI chat — they wrap the Prompt Patterns), and the **3lm CLI** (terminal) for the self-improving memory loop. By the end, you'll know which tool to reach for at every stage.

---

## 🎯 The Three Tools

|                  | Macros (Commander Buttons)                            | AI-Suplex Commands                                    | 3lm CLI                                    |
| ---------------- | ----------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------ |
| **Where**        | Obsidian — click a button                             | Any AI chat — type a command                          | Terminal — inside the vault                |
| **What they do** | Create files, capture data, organize vault            | Generate content, structure tasks, produce reports    | Manage the self-improving memory loop      |
| **Best for**     | Session tracking, artifact capture, folder management | Tasklist generation, session planning, weekly reviews | Memory: end sessions, learn, promote rules |
| **Example**      | 🚀 Start, 📄 Artifact, 🏁 End                         | `AI-Suplex: Tasklist Generation`                      | `3lm end`, `3lm learn`, `3lm promote`      |

> **Rule of thumb:** Macros handle the *container* (files, folders, metadata). Commands handle the *content* (plans, tasks, reviews) — they wrap the patterns. 3lm handles the *memory* — learning from every session so the next one starts smarter.

### Two runtimes, one loop

The same pipeline runs in two places — pick the one that matches how you work:

| Runtime | What runs the loop | Best for |
|---|---|---|
| **Vault-native** | Commander macros + AI-Suplex Commands + `node Tools/3lm.js` | Obsidian users; the shipped 7-7-7 Edition |
| **dsh plugin** | `dsh-ai-suplex` — nine `ai_suplex_*` tools on the dsh agent harness | Agent-first users; the same vault driven headlessly |

The dsh plugin exposes `ai_suplex_init` · `context` · `tasklist` · `capture` · `session_end` · `learn` · `promote` · `approvals` · `status`. It reads the **same** markdown vault and writes the **same** paths — the memory is shared, not forked. `ai_suplex_promote` is approval-gated (`approved: true`), so the Hustler gate holds in both runtimes. Package: `dsh-ai-suplex` on npm (`0.4.0`).

---

## 🔁 The Full Cycle (Step by Step)

Planning happens at three levels — strategic, tactical, and operational. Then the daily execution loop takes over. After every session, the 3-layer memory stack extracts lessons and improves the system.

```
CYCLE PLAN  →  WEEKLY PLAN  →  TASKLIST  →  START  →  EXECUTE  →  CAPTURE  →  PROMOTE  →  END  →  MEMORY LOOP  →  REVIEW
                                                                                                     ├─ 3lm end
                                                                                                     ├─ 3lm learn
                                                                                                     ├─ 3lm promote
                                                                                                     └─ 3lm index
```

---

### STEP 0a — CYCLE PLAN: Map the 7 Weeks (Every Cycle)

**Tool:** Prompt Pattern  
**Pattern:** `📄 Pattern - Cycle Plan Generation` *(pattern-only)*  
**Saves to:** `Plans/<Period>/Cycle X/Cycle X Plan.md`

1. Run 📁 **Ensure (Cycle)** to create `Plans/<Period>/Cycle X/` and all 7 weekly plan folders
2. Use `📄 Pattern - Cycle Plan Generation` *(pattern-only — no command yet)*
3. Paste into AI chat with your cycle goals and context
4. The AI returns a 7-week breakdown with milestones per week, focus area allocation, and success metrics
5. Save to `Plans/<Period>/Cycle X/Cycle X Plan.md`

> 💡 Run this once per cycle (every 7 weeks). The cycle plan is your strategic compass — all weekly plans flow from it.

---

### STEP 0b — WEEKLY PLAN: Scope the Week (Every Tuesday)

**Tool:** AI-Suplex Command  
**Command:** `AI-Suplex: Weekly Plan`  
**Saves to:** `Plans/<Period>/Cycle X/Week Y/`

1. Type `AI-Suplex: Weekly Plan`
2. Supply context from your cycle plan + last week's review as CONTENT
3. The AI returns a scoped weekly plan with task IDs, daily targets, and success metrics
4. Save to `Plans/<Period>/Cycle X/Week Y/`

> 💡 The weekly plan bridges your cycle strategy and daily execution. Run it every Tuesday.

---

### STEP 1 — TASKLIST: Generate a Session Tasklist

**Tool:** AI-Suplex Command  
**Command:** `AI-Suplex: Tasklist Generation`

1. Type `AI-Suplex: Tasklist Generation`
2. Supply tasks pulled from your weekly plan as CONTENT
5. Execute — the AI returns a structured tasklist with:
   - Task IDs (T001-H, T002-B, etc.)
   - Role assignments (Hustler, Architect, Builder)
   - Duration estimates
   - Success metrics
6. Save the output to `Tasklists/`

> 💡 The tasklist is your session-level plan. Each task ID feeds directly into 🚀 Session Start.

---

### STEP 2 — START: Begin a Session

**Tool:** Macro  
**Button:** 🚀 Start

1. Click 🚀 **Start** in the left ribbon (or run `Session Start` from Command Palette)
2. Fill the prompts:
   - **Focus:** Select your focus area (e.g., `ai-engineering`, `digital-products`)
   - **Cycle:** Current cycle number
   - **Week:** Current week number
   - **Mission:** What you're doing this session (e.g., "Fix webhook timeout")
   - **Tasks:** Pull from your tasklist (e.g., `T001-H: Fix webhook timeout`)
   - **Success Metrics:** How you'll know you're done
   - **Energy Level:** ⚡⚡⚡⚡⚡ (1-5)

3. A session start file is created in `Sessions/Active/Start/`

> **AI-assisted:** Type `AI-Suplex: Session Start` to have the AI generate a complete start prompt from a Task ID.

---

### STEP 3 — EXECUTE: Do the Work

Work happens here. Code, write, design, research — whatever the mission demands. While you work:

| When you... | Click... | What happens |
|---|---|---|
| Produce something worth saving | 📄 **Artifact** | Saves work-in-progress to `Artifacts/<Period>/Cycle X/Week Y/` |
| Learn something important | 💡 **Insight** | Appends a callout to `Insights/<Period>/Cycle X/Week Y.md` |

> **AI-assisted capture:** Type `AI-Suplex: Artifact Capture` to have the AI structure your raw work into a properly formatted artifact.

---

### STEP 4 — CAPTURE: Save an Artifact

**Tool:** Macro  
**Button:** 📄 Artifact

1. Click 📄 **Artifact**
2. Fill the prompts:
   - **Focus, Cycle, Week** — auto-suggests from your session
   - **Artifact content** — paste your work (code, design, research, notes)
   - **Key insights** — what you learned producing this
   - **Next actions** — what follows from this work

3. File saved to `Artifacts/<Period>/Cycle X/Week Y/<timestamp>-<title>.md`

---

### STEP 5 — PROMOTE: Create a B-Bomb

**Tool:** Macro (or `AI-Suplex: B-Bomb Promotion` for AI-assisted promotion)  
**Button:** 💣 B-Bomb

Not every artifact becomes a B-Bomb. Promote when something is **reusable, reference-worthy, or sellable**.

**Manual promotion:**
1. Click 💣 **B-Bomb**
2. Fill the prompts: title, description, content, product potential rating (1-10)

**AI-assisted promotion:**
1. Type `AI-Suplex: B-Bomb Promotion`
2. Point it at your artifact: *"Scan Artifacts/<Period>/Cycle X/Week Y/ for B-Bomb candidates"*
3. The AI identifies candidates, ranks by innovation quotient, and drafts promotion content

**After promoting:** Run 🔄 **Refresh B-Bomb Index** to re-index.

---

### STEP 6 — END: Close the Session

**Tool:** Macro  
**Button:** 🏁 End

1. Click 🏁 **End**
2. Fill the prompts:
   - **Session Rating:** 1-5
   - **Energy End:** Current energy level
   - **Focus Quality:** How well you stayed on task
   - **Key Insights:** What you learned
   - **Next Actions:** What follows
   - **Blockers:** Anything in your way

3. A session end report is created in `Sessions/Active/End/`

> **AI-assisted:** Type `AI-Suplex: Session End Report` to generate a comprehensive report from your session notes.

---

### STEP 7 — MEMORY LOOP: Feed the 3-Layer Stack

**Tool:** 3lm CLI  
**Command:** Terminal — run inside the AI-Suplex vault

After every session end report is written, run the memory loop to extract lessons and improve the system:

```bash
# Step A — Write the episode to episodic memory
node Tools/3lm.js end

# Step B — Extract lessons from the episode
node Tools/3lm.js learn

# Step C — Refresh the memory index
node Tools/3lm.js index
```

**Every week (Saturday B-Bomb Day):**
```bash
# Score all lessons on the 100-point rubric. Promote those scoring 70+ to semantic/procedural memory
node Tools/3lm.js promote --min 70

# Check for contradictions between lessons and semantic truths
node Tools/3lm.js revise
```

**How the 3-Layer Memory Stack works:**

```
Session End Report
     │
     ▼
┌─────────────────────────────────┐
│  EPISODIC MEMORY                │   ← "What happened" — 3lm end writes here
│  Memory/episodic/<Period>/Cycle-X/Week-Y/│
└─────────────┬───────────────────┘
              │ 3lm learn extracts
              ▼
┌─────────────────────────────────┐
│  Lessons Staging                │   ← Candidate learnings waiting for proof
│  Memory/lessons.md              │
└─────────────┬───────────────────┘
              │ 3lm promote --min 70 scores and routes
              ▼
┌─────────────────────────────────┐
│  SEMANTIC MEMORY                │   ← "What is true" — stable rules, preferences
│  Memory/semantic/               │
│  PROCEDURAL MEMORY              │   ← "How to do it" — winning workflows
│  Memory/procedural/             │
└─────────────────────────────────┘
```

> **North Star:** "Each new session starts smarter than the last."

---

### STEP 7b — CONTEXT & THREADS: Keep Parallel Work Honest

**Tool:** `AI-Suplex: Save Context` + 3lm CLI

A **thread is a lane; an instance is a window.** When more than one chat window is open — or a cloud agent is working alongside you — each window owns its **own** context file.

| Thread | Use it for | Instances | Context file |
|---|---|---|---|
| **Daily tasks** | the day's execution — the main one | 1 | `daily-tasks.md` |
| **Project tasks** | a build that spans sessions | N | `project-tasks-{ref}-{slug}.md` |
| **Random tasks** | one-off jobs — config, docs, PRDs | N | `random-tasks-{ref}-{slug}.md` |
| **Realist** | the twice-weekly execution audit | 1 | *(5-line log to `Reviews/Realist/`)* |

**The rules that matter:**

1. **One instance = one file = one writer.** A new window is a new file — never append to another instance's file.
2. **Save Context is instance-scoped.** Write to `Context Kick-start/Active/{thread}-{ref}-{slug}.md`; append only to the **same** instance on a later save; archive **only your own** file on close (`Archived/{YYYY-MM-DD}-…`).
3. **Only `daily-tasks` writes the Active Mission Context** (`AGENTS.md`). Every other thread reports *"AGENTS.md unchanged (not the daily-tasks thread)."*
4. **A session is closed by the commit, not the file.** A committer runs `3lm sync`; a producer (cloud agent) never writes `Memory/` or syncs.
5. **The Realist prescribes, it does not produce.** It audits execution twice a week and writes a 5-line log — it does not generate tasklists.

```bash
node Tools/3lm.js threads --list --write   # open instances → _instances.md (generated projection)
```

> 📖 Practical walkthrough: `Guides/Guide — Context & Threads.md` · Rules: `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.0) · Command: `AI-Suplex: Save Context`.

---

### STEP 8 — REVIEW: Close the Week

At the end of each week, run these in order:

| Step | Tool | What |
|---|---|---|
| 1 | 📊 **Enhance MOCs/Trackers** | Injects recent sessions into dashboards |
| 2 | 📊 **Aggregate Weekly Data** | Compiles all week's data into one source file |
| 3 | `3lm promote --min 70` + `3lm revise` | Promote winning patterns, reconcile contradictions |
| 4 | 🔄 **Weekly Review** | Generates structured weekly review |
| 5 | *Optional:* `Orchestrator – Weekly Review` skill | AI-powered analysis of the aggregated data |

**For the AI-assisted weekly review:**
1. Run 📊 **Aggregate Weekly Data** — a source file opens automatically
2. Copy that file's content
3. Open `Skills/Orchestrator – Weekly Review.md`, copy the skill
4. Paste both into AI chat — the AI produces a strategic review with recommendations

---

## 🗓️ The Full Rhythm

```
Monday    — Closed
Tuesday   — 📁 Ensure Structure + 🎯 Focus Manager check + generate weekly plan (command) + tasklist (command)
Wed-Fri   — 🚀 Start → work → 📄 Artifact → 💡 Insight → 🏁 End → 3lm end → learn → index (daily loop)
Saturday  — 💣 B-Bomb promotion + 3lm promote + 3lm revise + 3lm clean + 📊 Enhance + 📊 Aggregate + 🔄 Weekly Review
Sunday    — Rest or light work
```

**Start of Cycle (every 7 weeks):**
- 📁 **Ensure (Cycle)** — creates all cycle + weekly plan folders
- `📄 Pattern - Cycle Plan Generation` *(pattern-only)* — map the 7 weeks ahead → `Plans/<Period>/Cycle X/Cycle X Plan.md`

**End of Cycle (every 7 weeks):**
- 🔄 **Generate Cycle Review** — aggregates all cycle data
- `📄 Pattern - Cycle Review Generation` *(pattern-only)* — AI-powered analysis of the full cycle
- Run `3lm promote --min 70` — promote all remaining high-scoring lessons
- `3lm index` — final memory refresh before the next cycle

---

## 🧭 Which Tool When?

| I want to... | Use this |
|---|---|
| Map a 7-week cycle | `📄 Pattern - Cycle Plan Generation` *(pattern-only)* → `Plans/<Period>/Cycle X/Cycle X Plan.md` |
| Plan this week's work | `AI-Suplex: Weekly Plan` → `Plans/<Period>/Cycle X/Week Y/` |
| Generate a session tasklist | `AI-Suplex: Tasklist Generation` → `Tasklists/` |
| Start a focused session | 🚀 **Start** (macro) or `AI-Suplex: Session Start` |
| Save work-in-progress | 📄 **Artifact** (macro) or `AI-Suplex: Artifact Capture` |
| Log a quick learning | 💡 **Insight** (macro) |
| Mark work as reusable/sellable | 💣 **B-Bomb** (macro) or `AI-Suplex: B-Bomb Promotion` |
| End a session | 🏁 **End** (macro) or `AI-Suplex: Session End Report` |
| Write session to episodic memory | `3lm end` (CLI) |
| Extract lessons from a session | `3lm learn` (CLI) |
| Promote winning patterns (score 70+) | `3lm promote --min 70` (CLI) |
| Check for memory contradictions | `3lm revise` (CLI) |
| Refresh the memory lookup manifest | `3lm index` (CLI) |
| See memory stack health | `3lm status` (CLI) |
| List open context instances | `3lm threads --list` (CLI) |
| Save context / switch windows | `AI-Suplex: Save Context` |
| Update dashboards | 📊 **Enhance MOCs/Trackers** (macro) |
| Prepare data for AI review | 📊 **Aggregate Weekly Data** (macro) |
| Generate a weekly report | 🔄 **Weekly Review** (macro) + `Orchestrator – Weekly Review` (skill) |
| Set up folders for a new cycle | 📁 **Ensure (Cycle)** (macro) |
| Review a completed cycle | 🔄 **Generate Review** (macro) + `📄 Pattern - Cycle Review Generation` *(pattern-only)* |

---

## 📁 Where Everything Lives

```
AI-Suplex-777/
├── Sessions/Active/Start/     ← 🚀 Start creates these
├── Sessions/Active/End/       ← 🏁 End creates these
├── Sessions/Archive/          ← 🧹 Sweeper archives here
├── Context Kick-start/        ← 🧵 instance-scoped context (Active/ · Archived/)
├── Artifacts/<Period>/Cycle X/Week Y/  ← 📄 Artifact saves here
├── B-Bombs/<Period>/Cycle X/Week Y/    ← 💣 B-Bomb saves here
├── Insights/<Period>/Cycle X/Week Y.md ← 💡 Insight appends here
├── memory/                    ← 🧠 3-Layer Memory Stack
│   ├── episodic/<Period>/Cycle-X/Week-Y/ ← 3lm end writes episodes
│   ├── semantic/              ← Stable facts, rules, preferences
│   ├── procedural/            ← Reusable workflows, prompts, macros
│   └── lessons.md             ← Candidate learnings (staging area)
├── MOCs/                      ← 🗺️ Create MOC generates these
├── Trackers/                  ← 📊 Create Tracker generates these
├── Plans/<Period>/Cycle X/      ← Cycle-level strategic plans
├── Plans/<Period>/Cycle X/Week Y/ ← Weekly tactical plans
├── Tasklists/                 ← AI-generated tasklists from patterns
├── Reviews/<Period>/Weekly/            ← 🔄 Weekly Review output
├── Skills/                    ← AI agent blueprints
├── Prompt Patterns/           ← patterns + AI-Suplex Commands/ (one-line triggers)
├── Tools/              ← 3lm CLI · vault-index · session context
└── Guides/                    ← You are here
```

---

## 💡 Key Principles

1. **Macros for containers, Commands for content, 3lm for memory.** Don't mix them up — macros handle files and folders; commands (wrapping the patterns) handle thinking and structuring; 3lm handles learning from every session.
2. **Every session produces at least one artifact.** If you worked for 90 minutes and have nothing to show, you weren't working on the right thing.
3. **B-Bombs are the goal.** The pipeline exists to turn raw work into reusable, sellable assets. Everything feeds the B-Bomb machine.
4. **The memory loop is non-negotiable.** 3lm end → learn → index after every session. 3lm promote → revise every Saturday. Without it, the system never gets smarter.
5. **Review or repeat mistakes.** The weekly review isn't optional — it's where insights become strategy and lessons get promoted to permanent memory.

> **North Star:** "Each new session starts smarter than the last."

---

**TWABAM ⚡!** You now know every step of the pipeline — from raw thought to self-improving system. Start with a tasklist pattern, click 🚀, run the memory loop, and let the system compound.

*The AI-Suplex Workflow Pipeline — v4.1*
