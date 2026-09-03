# AI-Suplex Achieved-State Architecture Spec

TWABAM ⚡! This page defines the target state for the AI-Suplex operating system: a prompt-driven execution stack with a self-improving markdown memory loop and an optional cortexmem bridge layer.

## Purpose

AI-Suplex exists to convert raw work into structured execution, reusable assets, and durable memory. Its achieved state is a system where every Tasklist execution improves the next one.

## Core Principle

The system is built on five layers: Input and Planning, Execution, Memory Capture, Memory Management, and Reuse and Injection. A sixth support layer, cortexmem, may be used as a fast capture and sync bridge. Graphify is not part of the architecture.

## System Flow

Raw input → Tasklist Generation → Tasklist file → Session Start → Execution → Artifacts/Insights/B-Bombs → Session End Report → Episodic memory → Lesson extraction → Promotion or deprecation → Index refresh → Next session starts with better context.

Optional bridge: selected decisions/constraints/preferences → cortexmem save_context → later promotion into markdown vault files.

## Layer Definitions

1. **Input and Planning** — Converts unstructured goals into execution plans (Tasklists/, Prompt Patterns/)
2. **Execution** — Runs the Tasklist as an active session (Sessions/Active/Start/, Sessions/Active/End/)
3. **Memory Capture** — Compresses execution into durable memory (memory/episodic/, memory/lessons.md)
4. **Memory Management** — Decides what stays and what changes (promotion rules, contradiction handling, review cadence)
5. **Reuse and Injection** — Loads the right memory into the next task (memory/index.md, memory/semantic/, memory/procedural/)

## File Roles

- **Tasklists** — Source of intent
- **Sessions** — Execution container
- **Episodic Memory** — What happened, by Cycle and Week
- **Semantic Memory** — Stable truths, rules, preferences
- **Procedural Memory** — Reusable workflows, macros, patterns
- **Lessons** — Staging area for candidate learnings
- **Index** — Lookup manifest for fast loading
- **CortexMem** — Optional bridge for selected high-value context

## CortexMem Rules

Use cortexmem only for: major decisions, explicit constraints, explicit preferences, compact session summaries, bridge-state continuity. Do not use as replacement for the markdown vault. If cortexmem and vault disagree, the reviewed markdown vault wins.

## Promotion Rules

- Promote to semantic if a fact is repeatedly true
- Promote to procedural if a workflow is repeatedly successful
- Keep in lessons if useful but not yet stable
- Deprecate if a newer rule replaces an older one
- Archive if no longer relevant

## Contradiction Rules

When memories conflict: keep both temporarily, prefer stronger evidence, mark older as deprecated, remove or compress during review.

## 3lm CLI Tool

Located at `Tools/3lm.js`. Run from inside `AI-Suplex-777/`.

### Session Start
```
node Tools/3lm.js start    # Load all context
node Tools/3lm.js learn    # Extract pending lessons
node Tools/3lm.js index    # Refresh lookup manifest
```

### During Session (Quick Capture)
After every Artifact/B-Bomb/Insight capture:
```
node Tools/3lm.js learn    # Extract lesson from capture
node Tools/3lm.js index    # Refresh lookup
```

### Session End
```
node Tools/3lm.js capture  # Scan for uncaptured lessons
node Tools/3lm.js end      # Write episode to episodic memory
node Tools/3lm.js learn    # Extract lessons from episode
node Tools/3lm.js index    # Refresh lookup manifest
```

### Saturday B-Bomb Day
```
node Tools/3lm.js promote --min 70   # Score + promote lessons
node Tools/3lm.js revise             # Check contradictions
node Tools/3lm.js index              # Refresh lookup
```

## Review Cadence

- **Per Session:** 3lm start (load context) → 3lm learn + index (quick capture after each artifact/B-Bomb/insight) → 3lm capture (check missed) → 3lm end (write episode) → 3lm learn + index (final extraction)
- **Weekly:** Promote repeated lessons, refresh files, update index, check contradictions
- **Cycle Review:** Consolidate truths, retire stale procedures, rebuild workflows

## Achieved State

When complete, AI-Suplex behaves as a self-improving execution OS: raw input becomes Tasklists, Tasklists become sessions, sessions become reports, reports become episodes, episodes become lessons, lessons become memory, memory improves the next run.

## Implementation Rule

Keep the system file-first, markdown-first, and human-readable. Use cortexmem as a bridge, not as the source of truth. Do not reintroduce Graphify into the core architecture.