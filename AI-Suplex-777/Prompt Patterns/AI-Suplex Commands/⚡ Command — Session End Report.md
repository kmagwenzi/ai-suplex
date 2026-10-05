---
type: ai-suplex-command
command: "Session End Report"
pattern_file: "📄 Pattern - Session End Report.md"
role: "Architect"
date: 2026-07-25
---

# ⚡ AI-Suplex: Session End Report — Command

## 🎯 Trigger
```
AI-Suplex: Session End Report
CONTENT
  - Raw Content: Session completed. Rating X/5. Y artifacts.

ADDITIONAL: Run 3lm end → learn → index
```

## 📋 Usage

```
AI-Suplex: Session End Report
CONTENT
  - Raw Content: Session completed. Rating 5/5. 8 artifacts. 4 breakthroughs.

ADDITIONAL: Run 3lm end → learn → index


AI-Suplex: Session End Report
CONTENT
  - Chat Reference: Full session summary from above

ADDITIONAL: Save to Sessions/Active/End/


AI-Suplex: Session End Report
CONTENT
  - Raw Content: Session completed. Rating 4/5. Energy 5→4. Focus maintained.
  - Chat Reference: Session work summary

ADDITIONAL: Skip memory loop
```

## 🤖 What the AI Does

1. **Reads** `📄 Pattern - Session End Report.md`
2. **Extracts** session metadata from the full conversation context
3. **Generates** complete report with frontmatter (session_id, focus, cycle, week, duration, energy, productivity, insights, blockers, next_actions)
4. **Saves** to `Sessions/Active/End/YYYY-MM-DD-HHMM-session-end-report-{focus}.md`
5. **Runs** `3lm end && 3lm learn && 3lm index` (memory loop)
6. **Saves context** — writes the Context Kickstart to `AI-Suplex Kick-start/Context Kick-start/Active/YYYY-MM-DD-cycle-X-week-Y-mission-title.md` (per the Save Context pattern), archiving the previous Active context first — so the next session starts clean
7. **Reports** session closed, episode written, lessons extracted, context brief saved

## 📄 Output
```
Sessions/Active/End/YYYY-MM-DD-HHMM-session-end-report-{focus}.md
```
