---
alias: ["3-Layer Memory", "AI-Suplex Memory Stack", "Self-Improving Memory"]
tags: [memory, 3-layer, episodic, semantic, procedural, specification]
created: 2026-06-06
version: 1.0
status: active
---

# 🧠 AI-Suplex 3-Layer Memory System — Specification

**TWABAM ⚡!** This document defines the complete **3-Layer Memory System** — the self-improving memory architecture that turns AI-Suplex from a static workflow tool into a learning operating system. Every Tasklist execution feeds the memory stack, and every session starts smarter than the last.

---

## 🎯 WHAT THE MEMORY SYSTEM DOES

The memory stack preserves context across sessions, converts experience into durable knowledge, and keeps the vault organized around real execution. Four stores, one purpose: compounding usefulness over time.

```
Session Start → 3lm start (load context) → 3lm learn (extract lessons) → 3lm index (refresh lookup)
During Session → Capture Artifact/B-Bomb/Insight → 3lm learn (quick capture) → 3lm index
Session End → 3lm capture (check for missed lessons) → 3lm end (write episode) → 3lm learn (extract lessons) → 3lm index
Saturday B-Bomb Day → 3lm promote --min 70 (score + promote) → 3lm revise (check contradictions) → 3lm index
→ Next session starts smarter
```

---

## 🧱 THE FOUR MEMORY STORES

| Store | Location | Type | What It Holds |
|-------|----------|------|--------------|
| **Episodic** | `memory/episodic/Cycle-X/Week-Y/` | What happened | Compressed session records — actions, outcomes, scores, lessons |
| **Semantic** | `memory/semantic/` | What is true | Stable facts, preferences, project rules, glossary, entities |
| **Procedural** | `memory/procedural/` | How to do it | Reusable workflows, macros, prompt patterns, execution playbooks |
| **Lessons** | `memory/lessons.md` | What might be useful | Candidate learnings — staging area before promotion or deprecation |

### Episodic Memory

**One file per session.** Stored by the 7-7-7 rhythm: `Cycle-X/Week-Y/`. Contains:

- Linked Tasklist ID and session metadata
- What was executed and what was produced
- Score (1-100), problems encountered, lessons learned
- Promotion candidates for semantic and procedural memory

**Format:** YAML frontmatter with `type: episode`, `cycle`, `week`, `score`, `source_files`. Body contains structured sections: Objective, What Happened, Outputs, Lessons, Promotion Candidates.

### Semantic Memory

**Stable, durable truths.** Updated only when evidence is strong and repeated across 3+ sessions. Contains:

- `preferences.md` — How we prefer to work (file-first, vault canonical, local-first)
- `project_rules.md` — What governs the system (architecture, operational, product rules)
- `glossary.md` — What every term means (AI-Suplex, B-Bomb, CortexMem, etc.)
- `entities.md` — Who and what exists in the system (roles, tools, concepts)

**Loaded at every session start** to provide consistent context. Rarely changes — facts graduate here only after proving stable across multiple episodes.

### Procedural Memory

**Reusable methods and workflows.** Derived from repeated successful behavior. Updated when a better method is found. Contains:

- `tasklist_generation.md` — Raw input → Structured Tasklist
- `session_start.md` — Tasklist → Active Execution
- `session_end.md` — Execution → Report + Episode
- `weekly_review.md` — Week → Patterns + Promotion
- `cycle_review.md` — Cycle → Consolidation + Retirement
- `promotion_rules.md` — Lessons → Durable Memory
- `lesson_to_procedure.md` — Learning → Automation

### Lessons

**Staging area.** Holds candidate learnings that are useful but not yet proven. Three sections:

- **Current Lessons** — Insights from recent sessions
- **Candidate Learnings to Review** — Open questions needing more evidence
- **Deprecation Watch** — Items flagged for potential removal

---

## 🔄 THE SELF-IMPROVING LOOP

### Phase 1: Capture (During Session)
- Execute the Tasklist
- Capture artifacts, insights, B-Bombs
- Write Session End report with score and lessons

### Phase 2: Store (After Session)
```bash
node Tools/3lm.js start    # Load all context
node Tools/3lm.js capture  # Scan for uncaptured lessons
node Tools/3lm.js end      # Write episodic file
node Tools/3lm.js learn    # Extract lessons → lessons.md
node Tools/3lm.js index    # Refresh lookup manifest
```

### Phase 3: Promote (Weekly Review)
```bash
node Tools/3lm.js promote --min 70   # Score + promote
node Tools/3lm.js revise             # Check contradictions
node Tools/3lm.js index              # Refresh lookup
```

### Phase 4: Compounding (Session Start)
```bash
node Tools/3lm.js start    # Load all context
```

---

## 📋 PROMOTION RULES

| Path | Threshold | Criteria |
|------|-----------|----------|
| **Episodic → Semantic** | 3+ sessions | Fact appears in 3+ episodes and has not changed |
| **Episodic → Procedural** | 3 successes | Workflow succeeds 3 times with similar steps |
| **Lessons → Procedural** | Score ≥ 70 | 100-point rubric: repeated (30), actionable (20), impact (20), no conflict (15), relevant (15) |
| **Keep in lessons** | Score 40-69 | Useful but not yet stable |
| **Deprecate** | Superseded | Newer, stronger evidence exists; keep visible for one review cycle |
| **Archive** | No longer relevant | Historical only; should not influence execution |

---

## ⚡ CORTEXMEM BRIDGE (Optional)

CortexMem is an optional fast-capture bridge for selected high-value context. **Not required** — the markdown vault is the canonical memory store.

| Use Case | When to Use |
|----------|------------|
| Major decisions | Quick capture during fast-moving work |
| Explicit constraints | Hard rules that shouldn't be violated |
| Explicit preferences | Style choices, naming conventions |
| Compact session summaries | Bridge-state for tool portability |
| Bridge-state continuity | Between sessions when vault isn't loaded |

**Rule:** When CortexMem and the vault disagree, the **reviewed markdown vault wins**. CortexMem is a convenience layer, not a second source of truth.

---

## 🛠️ THE 3lm CLI TOOL

Located at `Tools/3lm.js`. Run from inside `AI-Suplex-777/`.

| Command | Action |
|---------|--------|
| `start` | Load semantic + lessons + recent episodic + procedural — generate mission brief |
| `end` | Read Session End report → write episodic file to `memory/episodic/Cycle-X/Week-Y/` |
| `learn` | Extract lessons from latest episode → append to `memory/lessons.md` |
| `promote --min N` | Score lessons → promote ≥N to semantic/procedural (default: 70) |
| `revise` | Check lessons against semantic truths for contradictions — surface deprecation watch |
| `index` | Refresh `memory/index.md` with all active memory files |
| `status` | Show counts: governance, semantic, procedural, episodic |

---

## 📂 MEMORY FOLDER STRUCTURE

```
memory/
├── index.md                     # Quick lookup map
├── memory-lifecycle.md          # Six-step lifecycle specification
├── promotion-rules.md           # What gets promoted and when
├── contradiction-rules.md       # How conflicts are handled
├── review-cadence.md            # When reviews happen (per session, weekly, cycle)
├── lessons.md                   # Candidate learnings staging area
├── semantic/
│   ├── preferences.md           # How we prefer to work
│   ├── project_rules.md         # What governs the system
│   ├── glossary.md              # What every term means
│   └── entities.md              # Who and what exists
├── procedural/
│   ├── tasklist_generation.md   # Plan → Tasklist
│   ├── session_start.md         # Tasklist → Execution
│   ├── session_end.md           # Execution → Report
│   ├── weekly_review.md         # Week → Patterns + Promotion
│   ├── cycle_review.md          # Cycle → Consolidation
│   ├── promotion_rules.md       # Lessons → Memory
│   └── lesson_to_procedure.md   # Learning → Automation
└── episodic/
    └── Cycle-1/
        └── Week-1/              # Session episodes accumulate here
```

---

## 📐 KEY DESIGN PRINCIPLES

1. **File-First, Markdown-First, Human-Readable** — Every memory file is a plain markdown document. No database required. No opaque storage.
2. **Vault Is Canonical** — The Obsidian vault is the single source of truth. All other stores are derivatives or bridges.
3. **Promote Only With Evidence** — Never promote a single observation. Require 3+ repetitions for semantic, 3+ successes for procedural.
4. **Deprecate, Don't Delete** — Outdated rules are marked deprecated and kept visible for one review cycle before removal.
5. **Load What's Needed, Not Everything** — Session start loads only the index + semantic + last 3 episodes + relevant procedures. Context stays small.
6. **Short Feedback Loops** — Review every session (capture), every week (promote), and every cycle (consolidate). Short loops create better memory than large, delayed cleanups.

---

## 🌟 NORTH STAR

> **"Each new session starts smarter than the last."**

Every Tasklist execution should leave the system better than it found it. The memory stack makes this automatic — capture what happened, promote what mattered, reuse what worked. Over time, the system accumulates proven methods and becomes a better operator, not just a better archive.

---

**TWABAM ⚡!** This specification defines the complete 3-Layer Memory System — the self-improving architecture that separates AI-Suplex from every other productivity tool. The memory stack is live. Every session feeds the engine.

**Memory Status:** ACTIVE | **Version:** 1.0 | **Last Updated:** 2026-06-06