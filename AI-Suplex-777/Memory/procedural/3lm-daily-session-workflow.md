---
title: "3lm Daily Session Workflow"
date: 2026-06-21
type: procedural
tags: [3lm, memory, workflow, daily-session, continuity]
---

# 🧠 3lm Daily Session Workflow

## Problem

3lm runs at end of session. A single chat window cannot hold a week's work. How does memory maintain continuity across multiple sessions over a week?

## Solution

**Each day = one tasklist = one session = one 3lm cycle**

The weekly tasklist is the plan. Daily tasklists are the execution units. Each daily tasklist becomes its own session with its own 3lm cycle.

## The Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    WEEKLY TASKLIST                           │
│            (The Plan — 75 tasks, 22 phases)                 │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  DAILY       │    │  DAILY       │    │  DAILY       │
│  TASKLIST    │    │  TASKLIST    │    │  TASKLIST    │
│  (Sat 21)    │    │  (Sun 22)    │    │  (Mon 23)    │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
   3lm start            3lm start            3lm start
   (loads memory)       (loads memory)       (loads memory)
        │                   │                   │
        ▼                   ▼                   ▼
   Execute Phase         Execute Phase         Execute Phase
   1-3                   4-7                   8
        │                   │                   │
        ▼                   ▼                   ▼
   3lm end               3lm end               3lm end
   (write episode)       (write episode)       (write episode)
        │                   │                   │
        ▼                   ▼                   ▼
   3lm learn             3lm learn             3lm learn
   (extract lessons)     (extract lessons)     (extract lessons)
```

## Memory Compounding

```
Saturday night:  3lm end → writes episode "Sat 21: Prelaunch"
Sunday morning:  3lm start → loads Sat episode → "I remember yesterday"
Sunday night:    3lm end → writes episode "Sun 22: IBM + WQR"
Monday morning:  3lm start → loads Sat+Sun episodes → "I remember the weekend"
...
Saturday morning: 3lm start → loads ALL WEEK → "I remember everything"
```

## Session Protocol

### At Session START
```bash
node Tools/3lm.js start
```
Loads: semantic + lessons + recent episodic + procedural context

### During Session
- Execute phases from daily tasklist
- Capture artifacts, insights, B-Bombs
- Mark tasks as complete

### At Session END
```bash
node Tools/3lm.js end
node Tools/3lm.js learn
```
Writes: episode file to `Memory/episodic/Cycle-X/Week-Y/`
Extracts: lessons to `Memory/lessons.md`

### Weekly Promotion (Saturday)
```bash
node Tools/3lm.js promote --min 70
node Tools/3lm.js revise
node Tools/3lm.js index
```

## Key Rules

1. **Each daily tasklist = one session** — never try to hold a full week in one chat
2. **3lm start at beginning of each day** — loads accumulated memory
3. **3lm end at end of each day** — captures what happened
4. **3lm learn after each end** — extracts lessons
5. **Weekly tasklist is the plan** — daily tasklists are execution units

## File Structure

```
Tasklists/Active/
├── 2026-06-21-launch-week-tasklist.md      ← Weekly plan
├── 2026-06-21-prelaunch-execution-tasklist.md  ← Daily (Sat)
├── 2026-06-22-ibm-wqr-tasklist.md          ← Daily (Sun)
├── 2026-06-23-family-business-tasklist.md   ← Daily (Mon)
└── ...

Sessions/Active/Start/
├── 2026-06-21-launch-week-session.md       ← Weekly session
├── 2026-06-21-prelaunch-execution.md       ← Daily session (Sat)
├── 2026-06-22-ibm-wqr-session.md           ← Daily session (Sun)
└── ...

Memory/episodic/Cycle-1/Week-1/
├── 2026-06-21-prelaunch.md                 ← Episode (Sat)
├── 2026-06-22-ibm-wqr.md                   ← Episode (Sun)
└── ...
```

## North Star

**"Each new session starts smarter than the last."**

This is achieved by:
1. Daily 3lm cycles (not weekly)
2. Episodic memory accumulation
3. Lesson extraction after each session
4. Promotion of stable patterns to semantic/procedural

---
*Procedural memory captured via AI-Suplex on 2026-06-21*
