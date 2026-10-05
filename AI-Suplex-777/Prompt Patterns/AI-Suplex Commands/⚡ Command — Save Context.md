---
type: ai-suplex-command
command: "Save Context"
pattern_file: "📄 Pattern - Save Context.md"
spec_file: "AI-Suplex Kick-start/Spec — Context & Threads.md"
role: "Builder"
date: 2026-09-23
---

# ⚡ AI-Suplex: Save Context — Command

Summarize the **current thread's** session and persist it as a thread-owned context file — then hand off cleanly.

## 🎯 Trigger
```
AI-Suplex: Save Context
CONTENT
  - Thread: <daily-tasks | long-running-tasks | random-task | realist>

ADDITIONAL: <instructions>
```

> **The thread is load-bearing** (`Spec — Context & Threads`, R3). It sets the filename **prefix** and the file's **ownership**. Never guess it — if the thread is unstated, ask before writing.

## ⚡ Shorthand
`AI-Suplex: Save Context(long-running-tasks)` = the same command with `Thread` set — the one-liner form for the frequent case.

## 📋 Usage

```
AI-Suplex: Save Context
CONTENT
  - Thread: long-running-tasks

ADDITIONAL: Save before switching to the deploy build
```

```
AI-Suplex: Save Context(daily-tasks)

ADDITIONAL: Refresh the AGENTS.md Active Mission Context too (daily-tasks is the sole writer)
```

## 🤖 What the AI Does

1. **Reads** the Pattern: [[📄 Pattern - Save Context]] (v2, thread-aware) + the Spec (`R1–R7`).
2. **Confirms the thread** — `daily-tasks` · `long-running-tasks` · `random-task` · `realist`.
3. **Writes** `Context Kick-start/Active/{prefix}cycle-{X}-week-{Y}-{mission-slug}.md` with the contract frontmatter:
   ```yaml
   title: "Context — Cycle {X} Week {Y} · {THREAD}"
   thread: {thread}
   date / cycle / week / mission / status: active
   ```
4. **Archives only THIS thread's** predecessor → `Context Kick-start/Archived/{same-name}.md` (**R1/R4** — never another thread's file).
5. **States** `"AGENTS.md unchanged (not the daily-tasks thread)."` — unless the thread **is** `daily-tasks` (**R2**).
6. **Memory loop** — only at session end (**R6**): `3lm end → 3lm learn → 3lm index`; then **one** `3lm sync` closes the session.

## 📋 Required Sections
What Was Accomplished · Current State · What the AI Needs to Know Next Session · Quick Links · Next Actions.

**Two content rules** (Spec §4): **name terminal states explicitly** — `PUBLISHED` · `SENT` · `SUBMITTED` · `CLAIMED` · `PAID` (*"ready" is not a state*) — and **cite task IDs**.

## 🔗 Related

| What | Where |
|---|---|
| Spec (rules R1–R7) | `AI-Suplex Kick-start/Spec — Context & Threads.md` |
| Pattern (the mechanism) | `Prompt Patterns/📄 Pattern - Save Context.md` (v2) |
| Skill (role guidance) | `Skills/Builder – Save Context.md` |
| Guide (practical) | `Guides/Guide — Context & Threads.md` |

---
*TWABAM ⚡! Save Context — one thread, one file, one memory.*
