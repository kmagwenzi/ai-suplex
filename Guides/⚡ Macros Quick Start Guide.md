---
type: document
alias: [Macros Guide, Commander Buttons Guide]
tags: [macros, quick-start, reference, 7-7-7]
created: 2026-05-14
status: active
---

# ⚡ AI-Suplex Macros – Quick Start Guide

> **25 macros. 5 rhythms. One pipeline.**  
> This guide tells you what to click, when to click it, and why.
>
> **Running agents in parallel?** Macros are vault-side; threads and instance-scoped context are covered in `Guides/Guide — Context & Threads.md`.

---

## 🗺️ THE FIVE RHYTHMS

| Rhythm            | Frequency                | Macros                                                                                    | Purpose                |
| ----------------- | ------------------------ | ----------------------------------------------------------------------------------------- | ---------------------- |
| **Setup**         | Once (per vault / cycle) | Focus Manager, Create MOC, Create Tracker, Ensure Structure                               | Build your workspace   |
| **Daily Session** | Every time you work      | To Do List, Start, Artifact, Insight, B-Bomb, Feed 3LM, End                               | Execute and capture    |
| **Weekly**        | End of each week         | Enhance MOCs, Aggregate Weekly, Extract Next Steps, Weekly Review, Refresh B-Bomb Index, Refresh Outreach Board | Reflect and update |
| **End of Cycle**  | Every 7 weeks            | Generate Cycle Review, Start New Cycle                                                    | Strategize and inherit |
| **As needed**     | Anytime                  | Outreach, Archive                                                                          | Capture + sync         |

---

## 🏗️ SETUP (Run Once)

### 1. 🎯 Focus Manager
```
What: Define your focus areas (e.g., "AI Engineering", "Freelance")
Prompts: Add, edit, or delete focus names
Output: Updates Focuses.md with your areas
When: Day 1, or whenever your priorities shift
```

### 2. 📁 Ensure Folder Structure
```
What: Creates the full vault folder hierarchy
Prompts: None (runs immediately)
Output: All base folders (Sessions, Artifacts, B-Bombs, MOCs, Trackers, etc.)
When: First time opening the vault
```

### 3. 📁 Ensure Folder Structure (Current Cycle)
```
What: Creates Cycle X / Week 1-7 subfolders for Artifacts, B-Bombs, Insights, Next Steps, Plans
Prompts: Cycle number (1-7)
Output: 14 folders (7 weeks × [Artifacts + B-Bombs]) + Insights/<Period>/Cycle X + Next Steps/<Period>/Cycle X
When: Start of each new cycle
```

### 4. 📁 Ensure Folder Structure (Single Week)
```
What: Creates folders for one specific cycle + week
Prompts: Cycle number, Week number
Output: Artifacts/<Period>/Cycle X/Week Y, B-Bombs/<Period>/Cycle X/Week Y, Plans/<Period>/Cycle X/Week Y, Insights/<Period>/Cycle X/WeekY 
When: Mid-cycle, if a week's folders are missing
```

### 5. 🗺️ Sweeper – Create MOC
```
What: Generates a Map of Content for each focus area
Prompts: None (reads Focuses.md)
Output: MOCs/<Focus>.md — Dataview-powered dashboard per focus
When: After defining focuses, or after adding a new focus
```

### 6. 📊 Sweeper – Create Tracker
```
What: Generates a progress tracker for each focus area
Prompts: Current cycle number
Output: Trackers/<Focus> Tracker.md — weekly progress table per focus
When: After creating MOCs, at the start of each cycle
```

---

## 🚀 DAILY SESSION LOOP

```
🚀 Start  →  📄 Artifact  →  💡 Insight  →  🧠 Feed 3LM  →  💣 B-Bomb  →  🏁 End
```

### 7. 🚀 Session Start
```
What: Begin a focused work session
Prompts: Focus, Cycle, Week, Mission, Tasks, Success Metrics, Energy Level
Output: Sessions/Active/Start/<timestamp>-session-start.md
When: Every time you sit down to work
```

### 8. 📄 Artifact
```
What: Save work-in-progress as a structured asset
Prompts: Focus, Cycle, Week, Artifact content (multiline), Key insights, Next actions
Output: Artifacts/<Period>/Cycle X/Week Y/<timestamp>-<title>.md
When: You've produced something worth saving mid-session
```

### 9. 💡 Insight
```
What: Log a learning or observation
Prompts: Focus, Cycle, Week, Insight text, Source (session/artifact/b-bomb/report/external)
Output: Appends a callout block to Insights/<Period>/Cycle X/Week Y.md
When: You realize something worth remembering
```

### 10. 🧠 Feed 3LM
```
What: Feed a lesson directly into the persistent memory stack
Prompts: Focus, Insight text
Output: Appends to Memory/lessons.md (scored by `3lm promote`) + Insights/<Period>/Cycle X/Week Y.md
When: You want the agent to remember something across future sessions
Differs from Insight: Insight stays in your vault for dashboards;
                     Feed 3LM feeds the 3-layer memory loop
```

### 11. 💣 B-Bomb
```
What: Promote a polished artifact to a reusable, productizable asset
Prompts: Focus, Cycle, Week, Title, Description, B-Bomb content, Product potential rating
Output: B-Bombs/<Period>/Cycle X/Week Y/<timestamp>-b-bomb-<title>.md
When: An artifact is polished enough to be reused, shared, or sold
```

### 12. 🏁 Session End
```
What: Close a session with a structured report
Prompts: Rating (1-5), Energy end, Focus quality, Key insights, Next actions, Blockers
Output: Sessions/Active/End/<timestamp>-session-end.md
When: You're done working
```

---

## 📊 WEEKLY MAINTENANCE (End of Each Week)

### 13. 📊 Sweeper – Enhance MOCs & Trackers
```
What: Injects recent session highlights into MOCs and updates Tracker progress
Prompts: Current cycle, Current week
Output: MOCs get "Recent Highlights" section updated; Trackers get weekly progress text
When: End of each week, before your weekly review
```

### 14. 📊 Sweeper – Aggregate Weekly Data
```
What: Scans all sessions, artifacts, B-Bombs for a given cycle/week and compiles a single source file
Prompts: Cycle, Week
Output: Reviews/<Period>/Weekly/Cycle X/Week Y Source.md (opens automatically)
When: Before running the AI Weekly Review skill — gives the AI a single data file to analyze
```

### 15. 📊 Sweeper – Extract Next Steps
```
What: Scans all files for next_actions frontmatter and appends to a weekly Next Steps file
Prompts: None (uses last_processed timestamp to find new files)
Output: Next Steps/<Period>/Cycle X/Week Y.md (appends dated entries)
When: Weekly, to collect all outstanding actions in one place
```

### 16. 🔄 Sweeper – Weekly Review
```
What: Generates a structured weekly review from all session data
Prompts: Cycle, Week
Output: Reviews/<Period>/Weekly/Cycle X/Week Y/Week Y Review.md — executive summary, achievements, lessons, blockers, focus progress table, recommendations
When: Every weekend
```

---

## 🔄 END OF CYCLE (Every 7 Weeks)

### 17. 🔄 Sweeper – Generate Cycle Review
```
What: Aggregates all cycle decisions and B-Bombs into a review file
Prompts: Cycle number
Output: Reviews/<Period>/Weekly/Cycle X/Cycle-X-review-<date>.md
When: End of week 7 of any cycle
```

### 18. 🔄 Sweeper – Start New Cycle
```
What: Inherits key decisions from the previous cycle into the new one
Prompts: Previous cycle, New cycle
Output: Up to 20 inherited decisions seeded into the new cycle
When: Start of a new 7-week cycle
```

---

## 📦 ARCHIVE (As Needed)

### 19. 📦 Sweeper – Archive Session
```
What: Moves a single session (start + end) from Active to Archive
Prompts: Cycle, Week, then pick from list of sessions
Output: Session files moved to Sessions/Archive/
When: A session is complete and you want to declutter Active
```

### 20. 📦 Sweeper – Archive All Active Sessions
```
What: Bulk-archives all sessions in Active
Prompts: Confirmation
Output: All active sessions moved to Archive
When: End of cycle cleanup, or major declutter
```

---

## 🧠 3LM SYNC (As Needed)

### 21. 🔄 Sweeper – Sync Focuses to 3lm
```
What: Pushes each focus area's MOC summary into the 3LM stack as "state" context
Prompts: None
Output: Each focus gets a 3lm entry: state: "MOC: <focus> — <summary>"
When: After editing focus definitions or MOC descriptions
```

### 22. 🔄 Sweeper – Refresh B-Bomb Index
```
What: Scans all B-Bombs and indexes them in the vault index + knowledge graph (title, focus, tags, summary, link)
Prompts: None
Output: Each B-Bomb gets an index entry: b-bomb: "TITLE: ... FOCUS: ... SUMMARY: ..."
When: After creating new B-Bombs, or if the index falls out of sync
```

---

## 🧰 CAPTURE, OUTREACH & SYNC

### 23. 📝 To Do List
```
What: Creates a raw to-do list with checkboxes and opens it in a new tab
Prompts: Your raw to-dos
Output: Tasklists/RawTasks/YYYY-MM-DD-HHMM To Do List.md
When: Before planning — the raw input for the Tasklist Generation pattern
```

### 24. 📣 Outreach
```
What: Captures one outreach record (the Outreach entity)
Prompts: Status, channel, focus, counterparty, the exchange, next action, due date
Output: Outreach/<Period>/YYYY-MM-DD-HHMM-<counterparty>-<focus>.md (default status: drafted)
When: Every touch — a sent message, a reply, or a call
Note: the board is a projection — never hand-edit MOCs/Outreach Board.md
```

### 25. 📊 Sweeper – Refresh Outreach Board
```
What: Generates the Outreach board from the Outreach records
Prompts: None
Output: MOCs/Outreach Board.md — overdue → sent → replied → dormant → closed, + the Movement block
When: After any outreach capture, or before the weekly review
```

---

## 🎯 COMMANDER BUTTON LAYOUT

### Left Ribbon (always visible)
```
🚀 Start    🏁 End    📄 Artifact    💣 B-Bomb    💡 Insight
```

### Page Header Toolbar (top of editor)
```
Row 1: 🚀 Start  🏁 End  📄 Artifact  💣 B-Bomb  💡 Insight  🧠 Feed 3LM
Row 2: 🎯 Focus Manager  🗺️ Create MOC  📊 Create Tracker  📁 Ensure  📁(Cycle)  📁(Week)
Row 3: 📦 Archive  📦 Archive All  📊 Enhance MOCs  📊 Aggregate  📊 Extract Next
Row 4: 🔄 Generate Review  🔄 Start Cycle  🔄 Refresh B-Bombs  🔄 Weekly Review  🔄 Sync 3lm
Row 5: 📝 To Do List  📣 Outreach  📊 Refresh Outreach
```

---

## 🧭 QUICK DECISION: WHICH MACRO DO I NEED?

| I want to... | Click |
|---|---|
| Start working | 🚀 Start |
| Save what I just made | 📄 Artifact |
| Remember something I learned | 💡 Insight |
| Teach the AI something for later | 🧠 Feed 3LM |
| Mark something as reusable/sellable | 💣 B-Bomb |
| Finish my session | 🏁 End |
| Define my work areas | 🎯 Focus Manager |
| See all my sessions for a focus | 🗺️ Create MOC (then open MOCs/<Focus>.md) |
| Track progress over weeks | 📊 Create Tracker |
| Set up folders for a new cycle | 📁 Ensure (Cycle) |
| Update dashboards with new data | 📊 Enhance MOCs/Trackers |
| Prepare data for AI weekly review | 📊 Aggregate Weekly |
| Collect all next actions | 📊 Extract Next Steps |
| Generate a weekly report | 🔄 Weekly Review |
| Close out a 7-week cycle | 🔄 Generate Review |
| Begin a new 7-week cycle | 🔄 Start New Cycle |
| Clean up old sessions | 📦 Archive |
| Make AI aware of my focus areas | 🔄 Sync to 3lm |
| Make AI aware of my B-Bombs | 🔄 Refresh B-Bomb Index |
| Plan my day from raw to-dos | 📝 To Do List |
| Log an outreach touch | 📣 Outreach |
| See the outreach pipeline | 📊 Refresh Outreach Board |

---

**TWABAM ⚡!** You now know every macro in the arsenal. Start with 🚀 and the rest will follow.

---
*Macros Quick Start Guide — AI-Suplex 7-7-7 Edition*
