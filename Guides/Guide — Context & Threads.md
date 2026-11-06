---
type: guide
title: "Guide — Context & Threads"
version: 3.0
date: 2026-11-06
edition: 7-7-7
status: active
cycle: 2
week: 7
focus: ai-engineering
tags: [guide, context, threads, instances, how-to, workflow, save-context, hustler, memory-loop, producer-committer]
key_insights: "Pick a thread and an instance. Do the work. Save the instance context. Close it with a commit. The filename is the ownership. The commit is the closure. A cloud agent is a producer, never a committer."
next_actions: "Use during the Weekly Reset and at every instance close; pair with Spec — Context & Threads.md (v2.3, R12) for the rules. Cheap close = leave a packet in Inbox/."
---

# 🧵 Guide — Context & Threads

**Practical level.** Follow it top to bottom; you do not need the theory.

**Rules:** `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.3, R12)
**Canonical:** `AGENTS.md` → *Execution Threads (4)*

---

## 🧭 The short version

> **Pick a thread and an instance. Do the work. Save the instance context. Close it with a commit.**
> The filename is the ownership. The commit is the closure.

| Thread | Use it for | Instances | Your context file |
|---|---|---|---|
| **Daily tasks** | the day's execution — the main one | 1 | `daily-tasks.md` |
| **Project tasks** | a build that spans sessions (site, AS MC) | **N** | `project-tasks-{ref}-{slug}.md` |
| **Random tasks** | one-off jobs — config, tooling, docs, PRDs | **N** | `random-tasks-{ref}-{slug}.md` |
| **Realist** | the twice-weekly execution audit | 1 | *(5-line log to `Reviews/Realist/` — no context file)* |

---

## 1️⃣ Opening an instance

1. **Decide the thread + instance.** Ask: *is this the day's work (daily), a build that will outlive the day (long-running), a one-off (random), or the audit (realist)?* For a new window, open a **new instance** — never re-open someone else's.
2. **Load context.**
   ```
   AI-Suplex: Kickstart(Random Tasks: vault-migration)
   ```
   Or the fast path: `node Tools/3lm.js start --context`. N lanes: list → one loads · many ask.
3. **Point at a tasklist.** Long-running work uses a **long-running tasklist** (`Tasklists/Active/`); daily work uses that day's tasklist.
4. **Open the session** (daily-tasks only):
   ```
   AI-Suplex: Session Start
   ```

> **One instance per window.** If you need a second, open a second chat window with its own instance.

---

## 2️⃣ During work

**Capture as you go.** An uncaptured session is invisible to every future session. If it is not written, it did not happen.

**The memory-loop rule — run it after EVERY capture. No asking.**
```bash
node Tools/3lm.js add-lessons --source artifact --ref "<title>" --list "lesson 1" "lesson 2" "lesson 3" && node Tools/3lm.js index
```
- **Max 3 lessons**, transferable insights only — not a summary of the document.
- Skip only if you explicitly say `Skip memory loop`.

**Writer class — obey it every step:**
- **producer** (cloud agent · research window): writes only its own instance file + artifacts. Never `Memory/`, `AGENTS.md`, `B-Bombs/`, or `3lm sync`.
- **committer** (laptop · AS MC): lands the work — writes `Memory/`, runs the sync.

**Capture types available:** `AI-Suplex: Artifact Capture` (bare · `(Scratch Pad)` · `(Markdown)` · `(file)` · `(youtube)`) · `AI-Suplex: B-Bomb Promotion` · `AI-Suplex: Batch Insight`.

---

## 3️⃣ Saving context

When you switch windows, change instance, or hit a natural break:

```
AI-Suplex: Save Context
CONTENT
  - Thread: daily-tasks | project-tasks | random-tasks | realist
  - Instance: <ref or slug>     ← N lanes only
  - Writer: committer | producer
ADDITIONAL: <optional>
```

**What happens:**

| Step | Result |
|---|---|
| Write | `Context Kick-start/Active/{thread}-{ref}-{slug}.md` (or `{thread}.md` singleton) |
| Append | **same instance** later save → append in place — no new file |
| Archive | **on close** — only this instance's file → `Archived/{YYYY-MM-DD}-…` |
| `AGENTS.md` | **only if `Thread: daily-tasks`** — otherwise unchanged |
| Packet | **cheap close** — leave `Inbox/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md`; the daily thread reconciles → `Consumed/` |

**Bare invocation** → the assistant asks one question — *"Which instance is this context for?"* — and waits. Answer it; do not let it guess.

> ⚠️ **`AGENTS.md` is refreshed by the daily-tasks thread alone.** If you are in any other thread, expect the line *"AGENTS.md unchanged (not the daily-tasks thread)."* That is correct behaviour, not a failure.

**Cheap close — the close packet (Spec R12).** A lane that closed with terminal states and no open questions can leave a twelve-line **packet** instead of a full context file:

1. **Leave** `Context Kick-start/Inbox/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md` — fixed fields `TERMINAL` · `ARTIFACTS` · `AMC DELTA` · `OPEN`, no prose.
2. The **daily thread reconciles** it at its next session start — applies the AMC delta *only after checking cross-lane truth* — and **consumes** it by moving it to `Consumed/`.
3. The **Saturday review prunes** `Consumed/` packets older than the cycle.

**Consume by move, never delete-on-read.** Two windows can read the same packet; only a move records that it was taken. A packet **proposes** the AMC delta — it never writes the AMC itself (R2).

---

## 4️⃣ Closing an instance

**Writing the context file does not close the session. The commit does.**

A lane that left a **close packet** (cheap close) has nothing more to do here — the daily thread files it. A lane that wrote a full context file still closes with the commit.

```
AI-Suplex: Session End          ← writes the report (daily-tasks only)
node Tools/3lm.js end           ← writes the episode
node Tools/3lm.js learn         ← extracts lessons
node Tools/3lm.js index         ← refreshes the index
node Tools/3lm.js sync "Session End — <thread>/<instance> — <focus>"   ← CLOSES IT
```

**Only one thread syncs at a time.** If another window is mid-sync, wait. **Producers never sync** — a committer lands it.

**Done means:** both remotes at the same commit, working tree clean, and the episode exists in `Memory/episodic/`.

---

## 5️⃣ A worked example — three instances, one week, no collision

**Tuesday, Cycle 2 Week 4. Three windows open.**

**Window A — `daily-tasks`** *(singleton)*
- Runs the Weekly Reset, refreshes `AGENTS.md` → *Active Mission Context*
- Works the day: outreach + Meta submission
- `Save Context` → `daily-tasks.md`
- `Session End` → `3lm end` → `learn` → `index` → **`3lm sync`**

**Window B — `project-tasks` #1** *(the site build)*
- Loads context, works Build 3 → Build 4
- `Save Context` → `project-tasks-1-site-build.md`
- Archives **only its own** predecessor — Window A's file is untouched
- Reports: **"AGENTS.md unchanged (not the daily-tasks thread)."**

**Window C — `project-tasks` #2** *(the Web Console)*
- A **separate instance** → its own file `project-tasks-2-web-console.md`
- Window B and Window C never write each other's file — even though they share the thread

**What did not happen:**
- No instance wrote another's context file
- `AGENTS.md` was written once, by the daily thread
- The vault stayed on one branch — all three instances compounded into the **same** `Memory/` and graph
- Each session closed with a commit

---

## 6️⃣ Common mistakes

| Mistake | Why it hurts | Do this instead |
|---|---|---|
| **Writing to another instance's context file** | You delete live context you cannot see the consequences of | Touch **only** files whose thread + instance is yours |
| **Two threads syncing at once** | Interleaved commits; confusing history; possible push races | One sync at a time — check before firing |
| **A producer committing to `Memory/`** | A cloud agent forks the one memory | Producer returns a file; the committer lands it |
| **Appending a new workstream to an old instance** | The four-missions-one-file defect returns | New workstream = new instance = new file |
| **Marking "ready" as done** | "Ready" is not a state. Nothing shipped | Use real terminal states: `SENT` · `SUBMITTED` · `PAID` · `PUBLISHED` |
| **Expecting `AGENTS.md` to change from a non-daily thread** | It should not; that is the rule working | Non-daily threads leave it alone |
| **Treating the context file as closure** | The session stays open; the week never lands | Close with `3lm sync` |
| **Letting the Realist produce a tasklist** | It becomes a fourth content factory, not an audit | It **prescribes**; the Orchestrator produces |
| **Branching the vault per instance** | Forks memory, the graph and the index into N partial truths | Partition **write-scope**, not the memory |
| **Skipping the memory loop after a capture** | The learning never reaches memory — it stays in one file | Run `add-lessons` + `index` every time |
| **Deleting a packet after reading it** | No trace of consumption; a later start re-applies it | Consume by **move** to `Consumed/`; prune only Saturday |
| **A non-daily lane writing the AMC** | Two writers, one mission — the average is not a mission | A packet **proposes**; the daily thread reconciles |

---

## 🚀 Quick reference

```bash
node Tools/3lm.js start --context                    # open
node Tools/3lm.js threads --list                     # list open instances
node Tools/3lm.js add-lessons --source artifact ...  # capture + memory loop
node Tools/3lm.js index
# AI-Suplex: Save Context  → Thread + Instance       # switch windows
# …or cheap close → leave a packet in Inbox/           # R12 — the daily thread reconciles
node Tools/3lm.js end && node Tools/3lm.js learn && node Tools/3lm.js index
node Tools/3lm.js sync "Session End — <thread>/<instance>"   # close
```

---

## 🔗 Related

- `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.3) — the rules (R12 = the close packet)
- `AGENTS.md` → *Execution Threads (4)* — canonical
- `AI-Suplex: Save Context` (the command)
- `AI-Suplex Kick-start/The Realist Persona/The Realist Persona.md`
- `Guides/🦸 AI-Suplex Full Workflow Guide.md` — the broader workflow

---
*Guide v2.0 captured via AI-Suplex on 2026-10-16 (Cycle 2, Week 7). TWABAM ⚡*
*Guide v3.0 (close-packet delta) via AI-Suplex on 2026-11-06 — Cycle 3, Week 3.*