---
type: ai-suplex-command
command: "Weekly Review"
pattern_file: "📄 Pattern - Weekly Review Generation.md"
role: "Orchestrator"
date: 2026-11-05
---

# ⚡ AI-Suplex: Weekly Review — Command

## 🎯 Trigger
```
AI-Suplex: Weekly Review
CONTENT
  - this week's sessions + artifacts + trackers

ADDITIONAL: <instructions>
```

## 📋 Usage

### Minimal
```
AI-Suplex: Weekly Review
CONTENT
  - Raw Content: <your input>
```

### With File Reference
```
AI-Suplex: Weekly Review
CONTENT
  - File Reference: [[<relevant plan / review>]]
  - Raw Content: <your input>
```

### With Save Location
```
AI-Suplex: Weekly Review
CONTENT
  - File Reference: [[<relevant plan / review>]]
  - Raw Content: <your input>

ADDITIONAL: Save to Reviews/<Period>/Weekly/Cycle X/Week Y.md
```

## 🤖 What the AI Does

1. Reads `📄 Pattern - Weekly Review Generation.md` + the corresponding Orchestrator skill
2. Uses CONTENT (raw input + file references + chat context)
3. Generates a strategic weekly review: executive summary, key achievements, lessons learned, blockers, recommendations, next week's focus
4. Saturday: run `3lm promote --min 70 && 3lm revise && 3lm index`
4. Outputs for Hustler review, then saves to `Reviews/<Period>/Weekly/Cycle X/Week Y.md`
5. Runs the memory loop unless `Skip memory loop` is in ADDITIONAL
6. Reports: saved file path + extracted lessons

## 📄 Output
```
Reviews/<Period>/Weekly/Cycle X/Week Y.md
```

## 🔧 Rules

1. **Review or repeat mistakes** — the weekly review is where insights become strategy
2. **Saturday ritual** — promote + revise + index after generating
3. **Feed from real data** — sessions, artifacts, trackers, not memory

## ⚡ Examples

### Minimal
```
AI-Suplex: Weekly Review
CONTENT
  - Raw Content: <short input>
```

### Full — With Reference + Save
```
AI-Suplex: Weekly Review
CONTENT
  - File Reference: [[<relevant plan / review>]]
  - Raw Content: <full input>

ADDITIONAL: Save to Reviews/<Period>/Weekly/Cycle X/Week Y.md
```
