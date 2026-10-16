---
title: "Pattern - Save Context"
date: 2026-06-22
revised: 2026-10-16
version: 3.0
tags: [pattern, save-context, builder, memory, multi-thread, instances, writer-class, producer-committer, context]
---

# AI-Suplex Prompt Pattern — Save Context (v3 · instance-scoped)

> **v2 (2026-09-23):** context files became **per-thread** — four threads, four prefixed files.
>
> **v2.1 (2026-10-06):** saves became **day-scoped** — first save archives, later saves append.
>
> **v3 (2026-10-16):** threads became **lanes**, and the context file became an **instance** — one
> file per open window/session, **ephemeral**, archived on **close**. The v2.1 "later saves append"
> rule is **retired**: it assumed one workstream per thread per day, and produced multi-mission files.
> Now **append is scoped to the instance** — a new window is a new file. Adds a **writer class**
> (producer/committer) so cloud agents (Cloudroom) never fork the one memory.
>
> **Canonical:** `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.0).

---

## 🧵 Threads and instances

| Thread | Prefix | Instances | Writes AGENTS.md? |
|---|---|---|---|
| **Daily tasks** | `daily-tasks` | **1 (singleton)** | ✅ **yes — sole writer** |
| **Long-running tasks** | `long-running-tasks` | **N** | ❌ no |
| **Random tasks** | `random-task` | **N** | ❌ no |
| **Realist** | `realist` | **1 (singleton)** | ❌ no |

**A thread is a lane; an instance is a window.** Each instance owns **exactly one** context file.

### The three hard rules

1. **One instance = one file — one writer per file.** An instance writes its own file and archives
   **only itself, on close**. A **new window is a new file**, never an append to another instance’s
   file. **Never archive, overwrite, or edit another instance’s context file** — not even another
   instance of the same thread.
2. **The Active Mission Context has one writer — the daily-tasks thread** (`AI-Suplex Kick-start/Context Kick-start/Active Mission Context.md`). Every other thread states *"AGENTS.md unchanged."*
3. **A session is closed by the commit, not the file.** Only **committers** run `3lm sync` (one at a time).

### Filenames

```
Context Kick-start/Active/{thread}-{ref}-{slug}.md            ← instances (N lanes)
Context Kick-start/Active/{thread}.md                        ← singletons
Context Kick-start/Archived/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md
```

```
Context Kick-start/Active/
├── daily-tasks.md                              ← singleton: no ref, no slug
├── realist.md
├── random-task-1-vault-migration.md
├── random-task-2-cloudroom-spike.md
├── long-running-tasks-1-777-production-push.md
└── long-running-tasks-2-ultra-mvp.md
```

- `{ref}` — short ordinal, **per thread, reset per day** (first instance of the day = `1`).
  Allocated by the **AS MC**; the **Hustler** allocates in 777-Edition without an AS MC. Never reused
  within the same day.
- `{slug}` — kebab, **stable for the instance’s life**. The *current* mission lives in frontmatter —
  never rename the file to follow the mission.
- `{YYYY-MM-DD}` in the archive name is what makes cross-day names globally unique.

---

## ⌨️ The command

```
AI-Suplex: Save Context
CONTENT
  - Thread: daily-tasks | long-running-tasks | random-task | realist
  - Instance: <ref or slug>     ← required for N lanes; omit for singletons
  - Writer: committer | producer
  - File Reference: [[current tasklist or instance]]
ADDITIONAL: <optional>
```

**Bare invocation** → ask ONE question: *"Which instance is this context for?"* Then wait.

---

## 📋 The Prompt Pattern

```text
<prompt-pattern>
  <meta>
    <name>Save Context</name>
    <version>3.0</version>
    <author>AI-Suplex</author>
    <role>Builder</role>
    <skill>Builder – Save Context</skill>
  </meta>

  <description>
    Summarize THIS instance’s context, write it to an instance-scoped file, and archive only this
    instance’s file on close. Prevents collisions when N windows run in parallel across threads.
  </description>

  <task>
    Generate an instance-scoped Context Summary following the AI-Suplex Save Context protocol.

    0. RESOLVE THE INSTANCE. Use THREAD + INSTANCE supplied. If missing, ask ONE question and stop.
       Threads: daily-tasks | long-running-tasks | random-task | realist
       Instances: ref (ordinal) or slug — N lanes only; singletons omit.
    1. WRITE the summary to:
       - N lanes:  `Context Kick-start/Active/{thread}-{ref}-{slug}.md`
       - singleton: `Context Kick-start/Active/{thread}.md`
    2. APPEND vs ARCHIVE — instance-scoped:
       - OPEN window → create the file (allocating {ref} per the day) with status: open.
       - SAME instance, later save → APPEND/UPDATE in place. Do NOT create a second file.
       - CLOSE window → set status: closed, move to `Archived/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md`.
       ⚠️ NEVER touch another instance’s file — even within the same thread.
    3. WRITER CLASS — record it, and obey it:
       - producer: writes only this instance file + artifacts; NEVER Memory/, AGENTS.md, B-Bombs/, sync.
       - committer: may write Memory/ and run `3lm sync` — serialized, one at a time.
    4. AGENTS.md — ONLY if thread = daily-tasks: refresh the Active Mission Context.
       For any other thread: state "AGENTS.md unchanged (not the daily-tasks thread)."
    5. CONFIRM: the file written · the file archived (if close) · whether AGENTS.md changed.

    Use this template:

    ```markdown
    ---
    thread: random-task          # the lane
    instance: 1                  # the ref (omit for singletons)
    mission: "Vault migration"   # the CURRENT mission; may change
    slug: vault-migration        # matches the filename; never changes
    status: open                 # open | closed
    writer: committer            # committer | producer
    agent: local                 # local | cloudroom
    opened: 2026-10-16T10:48
    cycle: 2
    week: 7
    parent: null                 # prior instance file when resumed
    ---

    # 🦸 Context — Cycle X Week Y · {thread}/{slug}

    > **Generated:** [date time] · **Instance:** `{thread}-{ref}-{slug}`
    > **Writer:** committer | producer

    ---

    ## 🎯 What Was Accomplished
    [Completed work with task IDs — terminal states called out explicitly: PUBLISHED · SENT ·
     SUBMITTED · CLAIMED · PAID]

    ---

    ## 📊 Current State
    | Metric | Status |
    |--------|--------|
    | Tasks Completed | X/Y |
    | Instance Phase | [current phase] |
    | Blockers | [blockers or None] |

    ---

    ## 🧠 What the AI Needs to Know Next Session
    1. [key context]
    2. [key context]
    3. [key context]

    ---

    ## 🔗 Quick Links
    | Resource | Location |
    |----------|----------|
    | Tasklist / Spec | `Tasklists/Active/[file].md` · `Projects/…/Spec.md` |
    | Artifacts | `Artifacts/<Period>/Cycle X/Week Y/` |

    ---

    ## 🎯 Next Actions
    1. [the next terminal action — linked to the durable layer]
    2. [following]

    ---

    *Context generated via AI-Suplex on YYYY-MM-DD — instance: {thread}-{ref}-{slug}*
    ```
  </task>

  <memory-loop>
    - If this save closes a session: `node Tools/3lm.js end && node Tools/3lm.js learn && node Tools/3lm.js index`
    - Then a COMMITTER runs `node Tools/3lm.js sync "Session End — <session_id> — <focus>"`  ← the commit closes the session
    - Run the loop after EVERY capture; skip only on an explicit `Skip memory loop`
  </memory-loop>

  <additional-instructions>
    - The filename MUST carry the thread prefix + instance — that is what prevents collisions
    - Archive ONLY your own instance’s file, on close
    - A producer never writes Memory/, AGENTS.md, or B-Bombs/ — a committer lands it
    - Only daily-tasks touches AGENTS.md
    - Always include task IDs for traceability
    - Name terminal states explicitly — "ready" is not a state
    - Point Next Actions at the durable layer (spec / tasklist / artifact) — the brief is disposable
    - The Realist writes its 5-line log to `Reviews/Realist/`; it does NOT write a context file
  </additional-instructions>
</prompt-pattern>
```

---

## ✅ Example

**Input:**
```
Thread: long-running-tasks · Instance: 777-production-push · Writer: committer
Cycle: 2 · Week: 7
Mission: 777 production-grade + AS MC
Done: CI badge ✅ · homepage set ✅ · README discipline rebuild ✅
State: Phase 4 AS MC — gate cleared (migration closed)
Next: create the ai-suplex Hermes profile
```

**Output:**
- Written → `Active/long-running-tasks-1-777-production-push.md`
- Archived → **this instance’s** previous file only (on close, dated)
- `AGENTS.md unchanged (not the daily-tasks thread).`

---

## 🌍 Why this is better than one shared brief

With one shared file, **N writers overwrite each other** — and the collision is invisible until
someone reads stale context and acts on it. (Happened 2026-09-23: a brief written for the Sep 18
session was still surfacing after the week moved on. Happened again 2026-10-14: one `random-task`
brief carried four missions because day-scope did workstream-scope’s job.)

**Instance files make ownership exact: whoever owns the instance owns the file — and a cloud agent
owns only its own file, never the memory.**

---

## 🔗 Related

- `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.0) — the canonical rules
- `Prompt Patterns/📄 Pattern - Kickstart.md` — the loader (instance resolution)
- `Prompt Patterns/📄 Pattern - Session End Report.md` — run `3lm sync` after
- `Prompt Patterns/📄 Pattern - Realist Thread (Execution Audit).md` — the `realist` thread
- `AI-Suplex Kick-start/Context Kick-start/` — the Active / Archived folders

---
*Pattern v3 captured via AI-Suplex on 2026-10-16 (Cycle 2, Week 7) — instance-scoped Save Context.*