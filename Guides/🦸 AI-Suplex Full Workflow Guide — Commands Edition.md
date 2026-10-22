---
type: document
alias: ["Full Cycle — Commands Edition", "Commands Pipeline", "Command-Only Workflow"]
tags: [workflow-pipeline, guide, ai-suplex-commands, full-cycle, 3-layer-memory, 3lm]
created: 2026-10-21
updated: 2026-10-21
version: 1.0
status: active
---

# 🔁 AI-Suplex Full Workflow Guide — Commands Edition

> *From raw thought to self-improving system — run entirely on `AI-Suplex: <Command>` triggers + the `3lm` CLI. No Obsidian macros required.*

**TWABAM ⚡!** This is the **commands-only** edition of the full pipeline. Every step is a one-line command; the `3lm` CLI closes the memory loop. The same steps exist as Commander buttons in Obsidian (see `🦸 AI-Suplex Full Workflow Guide.md` for the macro-native version) — but you can run this entire cycle in any AI chat with nothing but a folder.

---

## ⚡ The Command Chain

```
AI-Suplex: Kickstart → Weekly Plan → Tasklist Generation → Session Start
  → Artifact Capture / Batch Insight → B-Bomb Promotion → Session End Report
  → 3lm end → learn → index → Save Context → Weekly Review
```

One line per stage. The command loads the pattern and runs it; `CONTENT` carries your input; `ADDITIONAL` carries post-generation instructions (save path, memory loop).

---

## 🧭 The Full Cycle (Step by Step)

### STEP 0 — KICKSTART: Load Context

**Command:** `AI-Suplex: Kickstart`

Before you work, load the lane's context so the AI knows where you left off.

```
AI-Suplex: Kickstart
```

- Bare `Kickstart` ≡ `Kickstart(Random Tasks)`. Shorthands: `Kickstart(Daily Tasks)` · `Kickstart(Project Tasks)` · `Kickstart(Realist)`.
- Fast Path reads the Active Mission Context + your instance brief, then runs `3lm start --context`.

**Output:** the AI reports the resolved thread + instance, the context file loaded, and the staleness-guard verdict.

---

### STEP 0a — CYCLE PLAN: Map the 7 Weeks *(once per cycle)*

**Command:** *pending — cycle planning is pattern-only for now.*

```
📄 Pattern - Cycle Plan Generation   ← until a command ships, use the pattern
CONTENT
  - Raw Content: <your 7-week goals and focus areas>
```

**Output:** a 7-week roadmap — milestones per week, focus allocation, success metrics → save to `Plans/<Period>/Cycle X/Cycle X Plan.md`.

---

### STEP 0b — WEEKLY PLAN: Scope the Week *(every Tuesday)*

**Command:** `AI-Suplex: Weekly Plan`

```
AI-Suplex: Weekly Plan
CONTENT
  - Raw Content: <context from your cycle plan + last week's review>

ADDITIONAL: Save to Plans/<Period>/Cycle X/Week Y/
```

**Output:** a scoped weekly plan — task IDs, daily targets, success metrics.

---

### STEP 1 — TASKLIST: Generate a Session Tasklist

**Command:** `AI-Suplex: Tasklist Generation`

```
AI-Suplex: Tasklist Generation
CONTENT
  - Raw Content: <tasks pulled from your weekly plan>

ADDITIONAL: Save to Tasklists/
```

**Output:** a structured tasklist — Task IDs (`T001-H`, `T002-B`), role assignments, durations, success checks.

---

### STEP 2 — START: Begin a Session

**Command:** `AI-Suplex: Session Start`

```
AI-Suplex: Session Start
CONTENT
  - Raw Content: T003-H — <the task you're starting>
  - File Reference: [[<your tasklist>]]
```

**Output:** a ready-to-use session-start prompt — mission, tasks, success metrics, energy level → save to `Sessions/Active/Start/`.

---

### STEP 3 — EXECUTE: Do the Work

Work happens here — code, write, design, research. While you work, capture with commands:

| When you... | Command |
|---|---|
| Produce something worth saving | `AI-Suplex: Artifact Capture` |
| Learn something important | `AI-Suplex: Batch Insight` |
| Capture a study note / article | `AI-Suplex: Note Capture` |

---

### STEP 4 — CAPTURE: Save an Artifact

**Command:** `AI-Suplex: Artifact Capture`

```
AI-Suplex: Artifact Capture
CONTENT
  - Raw Content: <paste your work — code, design, research, notes>

ADDITIONAL: Save to Artifacts/<Period>/Cycle X/Week Y/
```

**Variants:** `Artifact Capture(Scratch Pad)` · `Artifact Capture(Markdown)` · `Artifact Capture(file)` · `Artifact Capture(youtube)`.

**Output:** a structured artifact with frontmatter (focus, cycle, week, key insights, next actions).

---

### STEP 5 — PROMOTE: Create a B-Bomb

**Command:** `AI-Suplex: B-Bomb Promotion` (or `AI-Suplex: B-Bomb Hunt` to rank candidates first)

```
AI-Suplex: B-Bomb Promotion
CONTENT
  - Raw Content: <point at your artifact — "Scan Artifacts/<Period>/Cycle X/Week Y/ for B-Bomb candidates">
```

Not every artifact becomes a B-Bomb. Promote when something is **reusable, reference-worthy, or sellable**. `B-Bomb Hunt` ranks cross-focus candidates and stops for you to pick 2–3.

**Output:** a polished B-Bomb with product potential + innovation quotient.

---

### STEP 6 — END: Close the Session

**Command:** `AI-Suplex: Session End Report`

```
AI-Suplex: Session End Report
CONTENT
  - Raw Content: Session completed. Rating 4/5. 5 artifacts. 2 insights. Blockers: none.

ADDITIONAL: Run 3lm end → learn → index
```

**Output:** a formatted session-end report → save to `Sessions/Active/End/`, then the memory loop runs.

---

### STEP 7 — MEMORY LOOP: Feed the 3-Layer Stack

**Tool:** `3lm` CLI — terminal, run inside the vault.

After every session-end report, run:

```bash
node Tools/3lm.js end      # write the episode to episodic memory
node Tools/3lm.js learn    # extract lessons from the episode
node Tools/3lm.js index    # refresh the memory lookup
```

**Every Saturday (B-Bomb Day):**

```bash
node Tools/3lm.js promote --min 70   # score + promote lessons ≥70 to semantic/procedural
node Tools/3lm.js revise             # check for contradictions
```

> The memory loop is what makes `AI-Suplex` compound. Without it, the commands just produce files.

---

### STEP 7b — SAVE CONTEXT: Keep Parallel Work Honest

**Command:** `AI-Suplex: Save Context`

```
AI-Suplex: Save Context
CONTENT
  - Thread: random-tasks | project-tasks | daily-tasks | realist
  - Instance: <ref or slug>
  - Writer: committer | producer
```

A **thread is a lane; an instance is a window.** Save Context writes your instance's summary to `Context Kick-start/Active/{thread}-{ref}-{slug}.md` and archives **only your own** file on close. It's how the next window picks up where you left off.

---

### STEP 8 — REVIEW: Close the Week

**Command:** `AI-Suplex: Weekly Review`

```
AI-Suplex: Weekly Review
CONTENT
  - Raw Content: <this week's sessions + artifacts + insights>
```

**Output:** a strategic weekly review with recommendations.

> The Sweeper macros that refresh MOCs/Trackers and aggregate data are still the Obsidian-native path — they have no command yet (they're file operations, not content generation).

---

## 🧭 Which Command When?

| I want to... | Command |
|---|---|
| Load my context before working | `AI-Suplex: Kickstart` |
| Map a 7-week cycle | *pattern-only — command pending* |
| Plan this week's work | `AI-Suplex: Weekly Plan` |
| Generate a session tasklist | `AI-Suplex: Tasklist Generation` |
| Start a focused session | `AI-Suplex: Session Start` |
| Save work-in-progress | `AI-Suplex: Artifact Capture` |
| Log a batch of learnings | `AI-Suplex: Batch Insight` |
| Capture a study note | `AI-Suplex: Note Capture` |
| Rank B-Bomb candidates | `AI-Suplex: B-Bomb Hunt` |
| Promote an artifact to a B-Bomb | `AI-Suplex: B-Bomb Promotion` |
| End a session + report | `AI-Suplex: Session End Report` |
| Switch windows / save progress | `AI-Suplex: Save Context` |
| Close the week | `AI-Suplex: Weekly Review` |
| Write the episode to memory | `3lm end` (CLI) |
| Extract lessons | `3lm learn` (CLI) |
| Promote winning patterns (70+) | `3lm promote --min 70` (CLI) |
| Check for contradictions | `3lm revise` (CLI) |
| Refresh memory lookup | `3lm index` (CLI) |

---

## 💡 Key Principles

1. **Commands for content, 3lm for memory.** Commands generate plans, tasks, artifacts, reports; `3lm` learns from every session. Macros (in the full guide) handle the Obsidian-native *container* — files, folders, metadata.
2. **Every session produces at least one artifact.** 90 minutes with nothing captured means you weren't on the right thing.
3. **B-Bombs are the goal.** The pipeline turns raw work into reusable, sellable assets.
4. **The memory loop is non-negotiable.** `3lm end → learn → index` after every session; `promote → revise` every Saturday.
5. **Save Context before switching windows.** The next window starts smarter only if you left it a brief.

> **North Star:** "Each new session starts smarter than the last."

---

**TWABAM ⚡!** You now know the full cycle — run entirely on `AI-Suplex: <Command>` + `3lm`. Type the first command, capture the work, close the loop, and let the system compound.

*The AI-Suplex Workflow Pipeline — Commands Edition · v1.0*
