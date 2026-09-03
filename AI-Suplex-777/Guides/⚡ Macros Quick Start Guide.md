---
alias: [Macros Guide, QuickAdd Reference, Commander Buttons Guide]
tags: [macros, quick-start, reference, 7-7-7]
created: 2026-05-14
status: active
---

# ⚡ AI-Suplex Macros – Quick Start Guide

 > **23 macros. 4 rhythms. One pipeline.**  
> This guide tells you what to click, when to click it, and why.

---

## 🗺️ THE FOUR RHYTHMS

| Rhythm            | Frequency                | Macros                                                            | Purpose                |
| ----------------- | ------------------------ | ----------------------------------------------------------------- | ---------------------- |
| **Setup**         | Once (per vault / cycle) | Focus Manager, Create MOC, Create Tracker, Ensure Structure       | Build your workspace   |
| **Daily Session** | Every time you work      | Start, Artifact, Insight, B-Bomb, Feed 3LM, End, To Do List             | Execute and capture    |
| **Weekly**        | End of each week         | Enhance MOCs, Aggregate Weekly, Extract Next Steps, Weekly Review | Reflect and update     |
| **End of Cycle**  | Every 7 weeks            | Generate Cycle Review, Start New Cycle                            | Strategize and inherit |

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
Output: 14 folders (7 weeks × [Artifacts + B-Bombs]) + Insights/Cycle X + Next Steps/Cycle X
When: Start of each new cycle
```

### 4. 📁 Ensure Folder Structure (Single Week)
```
What: Creates folders for one specific cycle + week
Prompts: Cycle number, Week number
Output: Artifacts/Cycle X/Week Y, B-Bombs/Cycle X/Week Y, Plans/Cycle X/Week Y, Insights/Cycle X/WeekY 
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
Output: Artifacts/Cycle X/Week Y/<timestamp>-<title>.md
When: You've produced something worth saving mid-session
```

### 9. 💡 Insight
```
What: Log a learning or observation
Prompts: Focus, Cycle, Week, Insight text, Source (session/artifact/b-bomb/report/external)
Output: Appends a callout block to Insights/Cycle X/Week Y.md
When: You realize something worth remembering
```

### 10. 🧠 Feed 3LM
```
What: Feed context directly into the AI's persistent memory
Prompts: Focus, Insight text
Output: Saved to .cortexmem/store.db as type "insight"
When: You want the AI to remember something across future sessions
Differs from Insight: Insight stays in your vault for dashboards;
                     Feed 3LM goes to the AI's memory layer
```

### 11. 💣 B-Bomb
```
What: Promote a polished artifact to a reusable, productizable asset
Prompts: Focus, Cycle, Week, Title, Description, B-Bomb content, Product potential rating
Output: B-Bombs/Cycle X/Week Y/<timestamp>-b-bomb-<title>.md
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
Output: Reviews/Weekly/Cycle X/Week Y Source.md (opens automatically)
When: Before running the AI Weekly Review skill — gives the AI a single data file to analyze
```

### 15. 📊 Sweeper – Extract Next Steps
```
What: Scans all files for next_actions frontmatter and appends to a weekly Next Steps file
Prompts: None (uses last_processed timestamp to find new files)
Output: Next Steps/Cycle X/Week Y.md (appends dated entries)
When: Weekly, to collect all outstanding actions in one place
```

### 16. 🔄 Sweeper – Weekly Review
```
What: Generates a structured weekly review from all session data
Prompts: Cycle, Week
Output: Reviews/Weekly/Week X Review.md — executive summary, achievements, lessons, blockers, focus progress table, recommendations
When: Every weekend
```

---

## 🔄 END OF CYCLE (Every 7 Weeks)

### 17. 🔄 Sweeper – Generate Cycle Review
```
What: Aggregates all CortexMem decisions and B-Bombs for a cycle into a review file
Prompts: Cycle number
Output: Reviews/Cycle-X-review-<date>.md
When: End of week 7 of any cycle
```

### 18. 🔄 Sweeper – Start New Cycle
```
What: Inherits key decisions from the previous cycle's CortexMem into the new cycle
Prompts: Previous cycle, New cycle
Output: Up to 20 inherited decisions seeded into new cycle's CortexMem
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

## 🧠 CORTEXMEM SYNC (As Needed)

### 21. 🔄 Sweeper – Sync Focuses to CortexMem
```
What: Pushes each focus area's MOC summary into CortexMem as "state" context
Prompts: None
Output: Each focus gets a cortexmem entry: state: "MOC: <focus> — <summary>"
When: After editing focus definitions or MOC descriptions
```

### 22. 🔄 Sweeper – Refresh B-Bomb Index
```
What: Scans all B-Bombs and indexes them in CortexMem (title, focus, tags, summary, link)
Prompts: None
Output: Each B-Bomb gets a cortexmem entry: b-bomb: "TITLE: ... FOCUS: ... SUMMARY: ..."
When: After creating new B-Bombs, or if CortexMem falls out of sync
```

---

## 🎯 COMMANDER BUTTON LAYOUT

### Left Ribbon (always visible)
```
🚀 Start    🏁 End    📄 Artifact    💣 B-Bomb    💡 Insight
```

### Page Header Toolbar (top of editor)
```
Row 1: 🚀 Start  🏁 End  📄 Artifact  💣 B-Bomb  💡 Insight  🧠 Feed 3LM  📝 To Do List
Row 2: 🎯 Focus Manager  🗺️ Create MOC  📊 Create Tracker  📁 Ensure  📁(Cycle)  📁(Week)
Row 3: 📦 Archive  📦 Archive All  📊 Enhance MOCs  📊 Aggregate  📊 Extract Next
Row 4: 🔄 Generate Review  🔄 Start Cycle  🔄 Refresh B-Bombs  🔄 Weekly Review  🔄 Sync CortexMem
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
| Make AI aware of my focus areas | 🔄 Sync to CortexMem |
| Make AI aware of my B-Bombs | 🔄 Refresh B-Bomb Index |

---

**TWABAM ⚡!** You now know every macro in the arsenal. Start with 🚀 and the rest will follow.

---
*Macros Quick Start Guide — AI-Suplex 7-7-7 Edition*
