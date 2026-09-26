---
title: "Pattern - Save Context"
date: 2026-06-22
revised: 2026-09-23
version: 2.0
tags: [pattern, save-context, builder, memory, multi-thread, context]
---

# AI-Suplex Prompt Pattern — Save Context (v2 · multi-thread)

> **v2 (2026-09-23):** context files are now **per-thread**. Four threads run in parallel (daily ·
> long-running · random · realist), and each owns **one** prefixed file. This pattern takes a
> `THREAD` parameter so writes never collide.

---

## 🧵 The four threads

| Thread | Prefix | What it owns | Writes AGENTS.md? |
|---|---|---|---|
| **Daily tasks** | `daily-tasks-` | the day's execution (the primary thread) | ✅ **yes — sole writer** |
| **Long-running tasks** | `long-running-tasks-` | a multi-session build (site, Web Console) | ❌ no |
| **Random tasks** | `random-task-` | one-off / misc jobs | ❌ no |
| **Realist** | `realist-` | the execution audit (persona: The Realist) | ❌ no |

### The three hard rules

1. **One thread = one file.** Each thread writes **its own** prefixed file and archives **only its own**
   predecessor. **Never archive or overwrite another thread's context.**
2. **`AGENTS.md` has one Active Mission Context, and only the daily-tasks thread refreshes it.**
   Single writer, or four threads will fight over one section.
3. **Ending a session ⇒ run `3lm sync`.** A session is closed by the commit, not the file.

### Filenames

```
Context Kick-start/Active/
├── daily-tasks-cycle-2-week-4.md
├── long-running-tasks-cycle-2-week-4-site-build.md
├── random-task-cycle-2-week-4-save-context-v2.md
└── realist-cycle-2-week-4.md
```

Format: **`{prefix}cycle-{X}-week-{Y}-{mission-slug}.md`**
Archive → `Context Kick-start/Archived/{same-name}.md`

---

## ⌨️ The command

```
AI-Suplex: Save Context
CONTENT
  - Thread: daily-tasks | long-running-tasks | random-task | realist
  - File Reference: [[current tasklist or session]]
ADDITIONAL: <optional>
```

**Bare invocation** → ask ONE question: *"Which thread is this context for?"* Then wait.

---

## 📋 The Prompt Pattern

```text
<prompt-pattern>
  <meta>
    <name>Save Context</name>
    <version>2.0</version>
    <author>AI-Suplex</author>
    <role>Builder</role>
    <skill>Builder – Save Context</skill>
  </meta>

  <description>
    Summarize THIS thread's context, save it to a thread-prefixed file, and archive only this
    thread's previous file. Prevents context collisions when four threads run in parallel.
  </description>

  <task>
    Generate a thread-scoped Context Summary following the AI-Suplex Save Context protocol.

    0. RESOLVE THE THREAD. Use the THREAD supplied. If missing, ask ONE question and stop.
       Valid values: daily-tasks | long-running-tasks | random-task | realist
    1. WRITE the summary to:
       `AI-Suplex Kick-start/Context Kick-start/Active/{thread}-cycle-{X}-week-{Y}-{mission-slug}.md`
    2. ARCHIVE only THIS thread's previous file:
       Active/{thread}-*.md  →  Archived/{same-name}.md
       ⚠️ NEVER touch a file whose prefix is a different thread.
    3. AGENTS.md — ONLY if thread = daily-tasks:
       refresh the "Active Mission Context" section (date, cycle/week, status, next actions).
       For any other thread: state "AGENTS.md unchanged (not the daily-tasks thread)."
    4. CONFIRM: the file written · the file archived · whether AGENTS.md changed.

    Use this template:

    ```markdown
    ---
    title: "Context — Cycle X Week Y · {THREAD}"
    thread: {thread}
    date: YYYY-MM-DD
    cycle: X
    week: Y
    mission: "Mission Title"
    status: active
    ---

    # 🦸 Context — Cycle X Week Y · {THREAD}

    > **Generated:** [date time]
    > **Thread:** `{thread}`
    > **Session:** [session id / description]

    ---

    ## 🎯 What Was Accomplished
    [Completed work with task IDs — terminal states called out explicitly: PUBLISHED · SENT ·
     SUBMITTED · CLAIMED · PAID]

    ---

    ## 📊 Current State
    | Metric | Status |
    |--------|--------|
    | Tasks Completed | X/Y |
    | Thread Phase | [current phase] |
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
    | Tasklist | `Tasklists/Active/[file].md` |
    | Session Start/End | `Sessions/Active/...` |

    ---

    ## 🎯 Next Actions
    1. [the next terminal action]
    2. [following]

    ---

    *Context generated via AI-Suplex on YYYY-MM-DD — thread: {thread}*
    ```
  </task>

  <memory-loop>
    - If this save closes a session: `node Tools/3lm.js end && node Tools/3lm.js learn && node Tools/3lm.js index`
    - Then `node Tools/3lm.js sync "Session End — <session_id> — <focus>"`  ← the commit closes the session
    - Run the loop after EVERY capture; skip only on an explicit `Skip memory loop`
  </memory-loop>

  <additional-instructions>
    - The filename MUST carry the thread prefix — that is what prevents collisions
    - Archive ONLY your own thread's previous file
    - Only daily-tasks touches AGENTS.md
    - Always include task IDs for traceability
    - Name terminal states explicitly — "ready" is not a state
    - The Realist writes its 5-line log to `Reviews/Realist/`; it does NOT write a context file
  </additional-instructions>
</prompt-pattern>
```

---

## ✅ Example

**Input:**
```
Thread: long-running-tasks
Cycle: 2 · Week: 4
Mission: AI-Suplex Labs site build
Done: Build 0 (design system + shell) · 6 submit pages
State: deployed to Netlify, domain pointing, awaiting SSL
Blocker: ZISPA (resolved) → now DNS records at WebZim
Next: submit Meta verification
```

**Output:**
- Written → `Active/long-running-tasks-cycle-2-week-4-site-build.md`
- Archived → previous `long-running-tasks-*` file only
- `AGENTS.md unchanged (not the daily-tasks thread).`

---

## 🌍 Why this is better than one shared brief

With one shared file, **four threads overwrite each other** — and the collision is invisible until
someone reads stale context and acts on it. (This happened on 2026-09-23: a brief written for the
Sep 18 session was still being surfaced after the week had moved on.)

Per-thread files make ownership explicit: **whoever owns the thread owns the file.**

---

## 🔗 Related

- `Prompt Patterns/📄 Pattern - Session End Report.md` — run `3lm sync` after
- `Prompt Patterns/📄 Pattern - Realist Thread (Execution Audit).md` — the `realist` thread
- `AI-Suplex Kick-start/The Realist Persona/The Realist Persona.md`
- `AI-Suplex Kick-start/Context Kick-start/` — the Active / Archived folders

---
*Pattern v2 captured via AI-Suplex on 2026-09-23 (Cycle 2, Week 4) — multi-thread Save Context.*
