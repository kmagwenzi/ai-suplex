---
type: ai-suplex-command
command: "Artifact Capture"
pattern_file: "📄 Pattern - Artifact Capture.md"
role: "Builder"
date: 2026-07-25
---

# ⚡ AI-Suplex: Artifact Capture — Command

## 🎯 Trigger
```
AI-Suplex: Artifact Capture
CONTENT
  - <Source type>: <value>

ADDITIONAL: <instructions>
```

## 📋 Usage

```
AI-Suplex: Artifact Capture
CONTENT
  - Chat Reference: Previous conversation about Paynow integration

ADDITIONAL: Save to Artifacts/<Period>/Cycle 1/Week 5/


AI-Suplex: Artifact Capture
CONTENT
  - Chat Reference: The Paynow blueprint discussion

ADDITIONAL: Skip memory loop


AI-Suplex: Artifact Capture
CONTENT
  - Chat Reference: Executive Overview finalization
  - File Reference: [[EcoCash PRD]]

ADDITIONAL: Save to Artifacts/<Period>/Cycle 1/Week 5/
```

## 🤖 What the AI Does

1. Reads `📄 Pattern - Artifact Capture.md`
2. Uses the CONTENT source to generate a structured artifact
3. Fills frontmatter (tags, focus, cycle, week, date, time, key_insights, next_actions)
4. Creates the file at the specified location
5. Runs `3lm add-lessons --source artifact --ref <title> --list "..."` → `3lm index` (memory loop)
6. Reports: saved file path + lessons extracted

## 📄 Output
```
Artifacts/<Period>/Cycle X/Week Y/YYYY-MM-DD-HHMM-{title}-{focus}.md
```
