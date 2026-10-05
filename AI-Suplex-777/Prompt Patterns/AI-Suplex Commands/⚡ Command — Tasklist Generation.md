---
type: ai-suplex-command
command: "Tasklist Generation"
pattern_file: "📄 Pattern - Tasklist Generation.md"
role: "Orchestrator"
date: 2026-07-28
---

# ⚡ AI-Suplex: Tasklist Generation — Command

## 🎯 Trigger
```
AI-Suplex: Tasklist Generation
CONTENT
  - Raw Content: [task list]

ADDITIONAL: <instructions>
```

## 📋 Usage

### Minimal — Just a To-Do List
```
AI-Suplex: Tasklist Generation
CONTENT
  - Raw Content: fix Oracle block, test Paynow webhook, update Freelance MOC
```

### With File Reference
```
AI-Suplex: Tasklist Generation
CONTENT
  - Raw Content: Tailwind, Python, Paynow strategy, Bible School
  - File Reference: [[Week 6 Plan]]
```

### With Custom Save Location
```
AI-Suplex: Tasklist Generation
CONTENT
  - Raw Content: Google AI Lab application draft, Gemini integration
  - File Reference: [[Week 6 Plan]]

ADDITIONAL: Save to AI-Suplex-777/Tasklists/Active/
```

### Full — With All Options
```
AI-Suplex: Tasklist Generation
CONTENT
  - Raw Content: Tailwind CSS, Python fundamentals, Paynow strategy calls, Google AI Studio setup, Bible School
  - File Reference: [[Week 6 Plan]]
  - Chat Reference: Previously discussed bank visit moved to Wednesday

ADDITIONAL: 
 - Save to AI-Suplex-777/Tasklists/Active
 - Use file naming convention: YYYY-MM-DD-${mission-title}-tasklist.md
 - Run node Tools/3lm.js learn && node Tools/3lm.js index
```

## 🤖 What the AI Does

1. Reads `📄 Pattern - Tasklist Generation.md`
2. Uses the CONTENT source (raw tasks, file references, chat context) 
3. Generates a complete AI-Suplex tasklist with:
   - YAML frontmatter (date, status, cycle, week, focus, tags)
   - TWABAM ⚡! title with mission name
   - Sessions broken down by time blocks
   - Task IDs (T001-H, T002-H, etc.) with roles, durations, and nature
   - Success checkboxes per session
   - Task distribution summary table
   - Execution command block
4. Saves to the specified location (default: `Tasklists/Active/`)
5. Uses file naming: `YYYY-MM-DD-${mission-title}-tasklist.md`
6. Runs 3lm learn → index (memory loop) unless `Skip memory loop` is in ADDITIONAL
7. Reports: saved file path + task count + lessons extracted

## 📄 Output
```
Tasklists/Active/YYYY-MM-DD-{mission-title}-tasklist.md
```

## 🧠 Tasklist Structure

```markdown
---
title: "Date: YYYY-MM-DD — Mission Title"
date: YYYY-MM-DD
status: active
cycle: 1
week: 6
focus: ai-engineering
tags: [tasklist, daily, ...]
---

# 🦸 TWABAM ⚡! Daily Tasklist — Day, Date

**Mission:** One-line mission summary.

## ⏰ Session 1 — Title (Time Block)
| ID | Role | Duration | Task | Nature |
|----|------|----------|------|--------|
| T001 | Hustler | 1h | Task description | Learning/Execution/Planning |

**Success Check:**
- [ ] Criteria

## 📊 Task Distribution
| Role | Task IDs | Count | Total Est. Hours |

## ✅ Completion Command
node Tools/3lm.js learn && node Tools/3lm.js index
```

## 🔧 Rules

1. **Daily tasklists are the execution unit** — never try to hold a full week in one tasklist
2. **15-20 tasks per day** — fits within model context window
3. **Time-blocked sessions** — AM (08:00-10:00), BUILD (10:00-17:00), PM (18:00-21:00)
4. **Role assignment** — Hustler for all user tasks, Builder for AI-assisted execution
5. **Respect locked days** — Monday = Hustle Day, Sunday = Rest
6. **Nature tagging** — Learning, Execution, Planning, Setup, Study
7. **Success checks per session** — verifiable, unambiguous

## ⚡ Examples

### From Raw Content Only
```
AI-Suplex: Tasklist Generation
CONTENT
  - Raw Content:
  - Tailwind CSS basics
  - Python fundamentals
  - Paynow paperwork
  - Bible School
```
→ Generates full tasklist with sessions, IDs, durations, and success checks.

### From Raw Content + File Reference (Recommended)
```
AI-Suplex: Tasklist Generation
CONTENT
  - Raw Content: Tailwind, Python, WQR strategy, Bible School
  - File Reference: [[Week 6 Plan]]
```
→ Generates tasklist aligned with Weekly Plan structure.
