---
type: ai-suplex-command
command: "Save Context"
pattern_file: "📄 Pattern - Save Context.md"
spec_file: "AI-Suplex Kick-start/Spec — Context & Threads.md"
role: "Builder"
date: 2026-11-06
---

# ⚡ AI-Suplex: Save Context — Command

Summarize the **instance's** context and persist it — either as an instance-scoped context file (archived on close) or as a close packet the daily-tasks thread reconciles.

## 🎯 Trigger

```
AI-Suplex: Save Context
CONTENT
  - Thread: <daily-tasks | project-tasks | random-tasks | realist>
  - Instance: <ref or slug>   ← required for N lanes; omit for singletons
  - Writer: <committer | producer>

ADDITIONAL: <instructions>
```

> **The thread + instance are load-bearing** (`Spec — Context & Threads`, R3). They set the filename and the ownership. Never guess — if unstated, ask before writing.

## ⚡ Shorthand

`AI-Suplex: Save Context(random-tasks)` = the same command with `Thread` set.

## 🤖 What the AI Does

1. **Reads** the Pattern: [[📄 Pattern - Save Context]] (v4) + the Spec (R1–R12).
2. **Resolves the instance** — thread + ref/slug. One open instance → load it; many → ask.
3. **Writes one of two shapes:**
   - **Full close** — `Context Kick-start/Active/{thread}-{ref}-{slug}.md` (or `{thread}.md` for a singleton), then archive on close → `Archived/{YYYY-MM-DD}-…`.
   - **Cheap close** — a **close packet** at `Context Kick-start/Inbox/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md`. The daily thread reconciles it into the AMC and moves it to `Consumed/`.
4. **Archives only THIS instance's** predecessor → `Context Kick-start/Archived/…` (R1/R4 — never another instance's file).
5. **States** `"AGENTS.md unchanged (not the daily-tasks thread)."` — unless the thread **is** `daily-tasks` (R2).
6. **Memory loop** — only at session end (R6): `3lm end → 3lm learn → 3lm index`; then **one** `3lm sync` closes the session.

## 📋 Required sections (full close only)

What Was Accomplished · Current State · What the AI Needs to Know Next Session · Quick Links · Next Actions.

**Two content rules** (Spec §4): **name terminal states explicitly** — `PUBLISHED` · `SENT` · `SUBMITTED` · `CLAIMED` · `PAID` (*"ready" is not a state*) — and **cite task IDs**.

A close packet has no sections: it is twelve lines — `TERMINAL` · `ARTIFACTS` · `AMC DELTA` · `OPEN` (Spec R12).

## 🔗 Related

| What | Where |
|---|---|
| Spec (rules R1–R12) | `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.3) |
| Pattern (the mechanism) | `Prompt Patterns/📄 Pattern - Save Context.md` (v4) |
| Skill (role guidance) | `Skills/Builder – Save Context.md` |
| Guide (practical) | `Guides/Guide — Context & Threads.md` |

---

*TWABAM ⚡! Save Context — one instance, one file (or one packet), one memory.*
