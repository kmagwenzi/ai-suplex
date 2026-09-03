---
alias: ["AI-Suplex Pipeline", "Assembly Line", "Full Cycle Walkthrough"]
tags: [workflow-pipeline, guide, macros, prompt-patterns, full-cycle, 3-layer-memory, 3lm]
created: 2026-04-16
updated: 2026-06-08
version: 4.0
status: active
---

# 🔁 AI-Suplex Full Workflow Guide

> *From raw thought to self-improving system. Every step has a macro, a prompt pattern, or a 3lm CLI command.*

**TWABAM ⚡!** This guide walks you through the complete AI-Suplex pipeline — using **Commander button macros** (inside Obsidian), **Prompt Patterns** (copy-paste into AI chat), and the **3lm CLI** (terminal) for the self-improving memory loop. By the end, you'll know which tool to reach for at every stage.

---

## 🎯 The Three Tools

|                  | Macros (Commander Buttons)                            | Prompt Patterns                                       | 3lm CLI                                    |
| ---------------- | ----------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------ |
| **Where**        | Obsidian — click a button                             | Any AI chat — copy and paste                          | Terminal — inside the vault                |
| **What they do** | Create files, capture data, organize vault            | Generate content, structure tasks, produce reports    | Manage the self-improving memory loop      |
| **Best for**     | Session tracking, artifact capture, folder management | Tasklist generation, session planning, weekly reviews | Memory: end sessions, learn, promote rules |
| **Example**      | 🚀 Start, 📄 Artifact, 🏁 End                         | `📄 Pattern - Tasklist Generation`                    | `3lm end`, `3lm learn`, `3lm promote`      |

> **Rule of thumb:** Macros handle the *container* (files, folders, metadata). Prompt Patterns handle the *content* (plans, tasks, reviews). 3lm handles the *memory* — learning from every session so the next one starts smarter.

---

## 🔁 The Full Cycle (Step by Step)

Planning happens at three levels — strategic, tactical, and operational. Then the daily execution loop takes over. After every session, the 3-layer memory stack extracts lessons and improves the system.

```
CYCLE PLAN  →  WEEKLY PLAN  →  TASKLIST  →  START  →  EXECUTE  →  CAPTURE  →  PROMOTE  →  END  →  MEMORY LOOP  →  CONTEXT SWITCH  →  REVIEW
                                                                                                     ├─ 3lm end                    ├─ Save to Active
                                                                                                     ├─ 3lm learn                   ├─ Archive old
                                                                                                     ├─ 3lm promote                 └─ Next session loads
                                                                                                     └─ 3lm index
```

---

### STEP 0a — CYCLE PLAN: Map the 7 Weeks (Every Cycle)

**Tool:** Prompt Pattern  
**Pattern:** `📄 Pattern - Cycle Plan Generation`  
**Saves to:** `Plans/7 Week/Cycle X/Cycle X Plan.md`

1. Run 📁 **Ensure (Cycle)** to create `Plans/7 Week/Cycle X/` and all 7 weekly plan folders
2. Copy `Prompt Patterns/📄 Pattern - Cycle Plan Generation.md`
3. Paste into AI chat with your cycle goals and context
4. The AI returns a 7-week breakdown with milestones per week, focus area allocation, and success metrics
5. Save to `Plans/7 Week/Cycle 1/Cycle 1 Plan.md`

> 💡 Run this once per cycle (every 7 weeks). The cycle plan is your strategic compass — all weekly plans flow from it.

---

### STEP 0b — WEEKLY PLAN: Scope the Week (Every Tuesday)

**Tool:** Prompt Pattern  
**Pattern:** `📄 Pattern - Weekly Plan Generation`  
**Saves to:** `Plans/Weekly/Cycle X/Week Y/`

1. Copy `Prompt Patterns/📄 Pattern - Weekly Plan Generation.md`
2. Paste into AI chat with context from your cycle plan + last week's review
3. The AI returns a scoped weekly plan with task IDs, daily targets, and success metrics
4. Save to `Plans/Weekly/Cycle 1/Week 3/`

> 💡 The weekly plan bridges your cycle strategy and daily execution. Run it every Tuesday.

---

### STEP 1 — TASKLIST: Generate a Session Tasklist

**Tool:** Prompt Pattern  
**Pattern:** `📄 Pattern - Tasklist Generation`

1. Open `Prompt Patterns/📄 Pattern - Tasklist Generation.md`
2. Copy the entire file
3. Paste into Claude / ChatGPT / DeepSeek
4. Replace the `[Source]` section with tasks pulled from your weekly plan
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

> **AI-assisted:** Use `📄 Pattern - Session Start Prompt Generation` to have the AI generate a complete start prompt from a Task ID.

---

### STEP 3 — EXECUTE: Do the Work

Work happens here. Code, write, design, research — whatever the mission demands. While you work:

| When you... | Click... | What happens |
|---|---|---|
| Produce something worth saving | 📄 **Artifact** | Saves work-in-progress to `Artifacts/Cycle X/Week Y/` |
| Learn something important | 💡 **Insight** | Appends a callout to `Insights/Cycle X/Week Y.md` |

> **AI-assisted capture:** Use `📄 Pattern - Artifact Capture` to have the AI structure your raw work into a properly formatted artifact.

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

3. File saved to `Artifacts/Cycle X/Week Y/<timestamp>-<title>.md`

---

### STEP 5 — PROMOTE: Create a B-Bomb

**Tool:** Macro (or Prompt Pattern for AI-assisted promotion)  
**Button:** 💣 B-Bomb

Not every artifact becomes a B-Bomb. Promote when something is **reusable, reference-worthy, or sellable**.

**Manual promotion:**
1. Click 💣 **B-Bomb**
2. Fill the prompts: title, description, content, product potential rating (1-10)

**AI-assisted promotion:**
1. Copy `📄 Pattern - B-Bomb Promotion` into AI chat
2. Point it at your artifact: *"Scan Artifacts/Cycle 1/Week 2/ for B-Bomb candidates"*
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

> **AI-assisted:** Use `📄 Pattern - Session End Report` to generate a comprehensive report from your session notes.

---

### STEP 7 — MEMORY LOOP: Feed the 3-Layer Stack

**Tool:** 3lm CLI  
**Command:** Terminal — run inside the AI-Suplex vault

After every session end report is written, run the memory loop to extract lessons and improve the system:

```bash
# Step A — Write the episode to episodic memory
node scripts/3lm/3lm.js end

# Step B — Extract lessons from the episode
node scripts/3lm/3lm.js learn

# Step C — Refresh the memory index
node scripts/3lm/3lm.js index
```

**Every week (Saturday B-Bomb Day):**
```bash
# Score all lessons on the 100-point rubric. Promote those scoring 70+ to semantic/procedural memory
node scripts/3lm/3lm.js promote --min 70

# Check for contradictions between lessons and semantic truths
node scripts/3lm/3lm.js revise
```

**How the 3-Layer Memory Stack works:**

```
Session End Report
     │
     ▼
┌─────────────────────────────────┐
│  EPISODIC MEMORY                │   ← "What happened" — 3lm end writes here
│  Memory/episodic/Cycle-X/Week-Y/│
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

### STEP 9 — CONTEXT SWITCH: Preserve Knowledge Between Sessions

**Tool:** Prompt Pattern  
**Pattern:** `📄 Pattern - Context Switching`

When switching between chat windows, sessions, or taking a break, run the Context Switch protocol to ensure no knowledge is lost:

1. Copy `Prompt Patterns/📄 Pattern - Context Switching.md`
2. Paste into AI chat with your current session context
3. The AI generates a context summary and saves it
4. Previous context is archived automatically

**What happens:**
- Context saved to `AI-Suplex Kick-start/Context Kick-start/Active/YYYY-MM-DD-cycle-x-week-y-mission-title.md`
- Previous context moved to `Archived/`
- Next session loads via `3lm start` — AI knows exactly where you left off

> 💡 **Key Principle:** A Weekly Tasklist is a plan. A Daily Tasklist is a session. Context switching ensures each daily session compounds into the next.

---

## 🗓️ The Full Rhythm

```
Monday    — Closed
Tuesday   — 📁 Ensure Structure + 🎯 Focus Manager check + generate weekly plan (Pattern) + tasklist (Pattern)
Wed-Fri   — 🚀 Start → work → 📄 Artifact → 💡 Insight → 🏁 End → 3lm end → learn → index → Context Switch (daily loop)
Saturday  — 💣 B-Bomb promotion + 3lm promote + 3lm revise + 📊 Enhance + 📊 Aggregate + 🔄 Weekly Review
Sunday    — Rest or light work
```

**Start of Cycle (every 7 weeks):**
- 📁 **Ensure (Cycle)** — creates all cycle + weekly plan folders
- `📄 Pattern - Cycle Plan Generation` — map the 7 weeks ahead → `Plans/7 Week/Cycle X/Cycle X Plan.md`

**End of Cycle (every 7 weeks):**
- 🔄 **Generate Cycle Review** — aggregates all cycle data
- `📄 Pattern - Cycle Review Generation` — AI-powered analysis of the full cycle
- Run `3lm promote --min 70` — promote all remaining high-scoring lessons
- `3lm index` — final memory refresh before Cycle 2

---

## 🧭 Which Tool When?

| I want to... | Use this |
|---|---|
| Map a 7-week cycle | `📄 Pattern - Cycle Plan Generation` → `Plans/7 Week/Cycle X/Cycle X Plan.md` |
| Plan this week's work | `📄 Pattern - Weekly Plan Generation` → `Plans/Weekly/Cycle X/Week Y/` |
| Generate a session tasklist | `📄 Pattern - Tasklist Generation` → `Tasklists/` |
| Start a focused session | 🚀 **Start** (macro) or `📄 Pattern - Session Start Prompt Generation` |
| Save work-in-progress | 📄 **Artifact** (macro) or `📄 Pattern - Artifact Capture` |
| Log a quick learning | 💡 **Insight** (macro) |
| Mark work as reusable/sellable | 💣 **B-Bomb** (macro) or `📄 Pattern - B-Bomb Promotion` |
| End a session | 🏁 **End** (macro) or `📄 Pattern - Session End Report` |
| Switch context / save progress | `📄 Pattern - Context Switching` |
| Write session to episodic memory | `3lm end` (CLI) |
| Extract lessons from a session | `3lm learn` (CLI) |
| Promote winning patterns (score 70+) | `3lm promote --min 70` (CLI) |
| Check for memory contradictions | `3lm revise` (CLI) |
| Refresh the memory lookup manifest | `3lm index` (CLI) |
| See memory stack health | `3lm status` (CLI) |
| Update dashboards | 📊 **Enhance MOCs/Trackers** (macro) |
| Prepare data for AI review | 📊 **Aggregate Weekly Data** (macro) |
| Generate a weekly report | 🔄 **Weekly Review** (macro) + `Orchestrator – Weekly Review` (skill) |
| Set up folders for a new cycle | 📁 **Ensure (Cycle)** (macro) |
| Review a completed cycle | 🔄 **Generate Review** (macro) + `📄 Pattern - Cycle Review Generation` |

---

## 📁 Where Everything Lives

```
AI-Suplex-777/
├── Sessions/Active/Start/     ← 🚀 Start creates these
├── Sessions/Active/End/       ← 🏁 End creates these
├── Sessions/Archive/          ← 🧹 Sweeper archives here
├── Artifacts/Cycle X/Week Y/  ← 📄 Artifact saves here
├── B-Bombs/Cycle X/Week Y/    ← 💣 B-Bomb saves here
├── Insights/Cycle X/Week Y.md ← 💡 Insight appends here
├── memory/                    ← 🧠 3-Layer Memory Stack
│   ├── episodic/Cycle-X/Week-Y/ ← 3lm end writes episodes
│   ├── semantic/              ← Stable facts, rules, preferences
│   ├── procedural/            ← Reusable workflows, prompts, macros
│   └── lessons.md             ← Candidate learnings (staging area)
├── MOCs/                      ← 🗺️ Create MOC generates these
├── Trackers/                  ← 📊 Create Tracker generates these
├── Plans/7 Week/Cycle X/      ← Cycle-level strategic plans
├── Plans/Weekly/Cycle X/Week Y/ ← Weekly tactical plans
├── Tasklists/                 ← AI-generated tasklists from patterns
├── Reviews/Weekly/            ← 🔄 Weekly Review output
├── Skills/                    ← AI agent blueprints
├── Prompt Patterns/           ← Copy-paste templates for AI chat
├── scripts/3lm/               ← 3lm CLI — memory loop tool
└── Guides/                    ← You are here
```

---

## 💡 Key Principles

1. **Macros for containers, Patterns for content, 3lm for memory.** Don't mix them up — macros handle files and folders; patterns handle thinking and structuring; 3lm handles learning from every session.
2. **Every session produces at least one artifact.** If you worked for 90 minutes and have nothing to show, you weren't working on the right thing.
3. **B-Bombs are the goal.** The pipeline exists to turn raw work into reusable, sellable assets. Everything feeds the B-Bomb machine.
4. **The memory loop is non-negotiable.** 3lm end → learn → index after every session. 3lm promote → revise every Saturday. Without it, the system never gets smarter.
5. **Review or repeat mistakes.** The weekly review isn't optional — it's where insights become strategy and lessons get promoted to permanent memory.

> **North Star:** "Each new session starts smarter than the last."

---

**TWABAM ⚡!** You now know every step of the pipeline — from raw thought to self-improving system. Start with a tasklist pattern, click 🚀, run the memory loop, and let the system compound.

*The AI-Suplex Workflow Pipeline — v4.0*
