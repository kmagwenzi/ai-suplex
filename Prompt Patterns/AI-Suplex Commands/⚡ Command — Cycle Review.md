---
type: ai-suplex-command
command: "Cycle Review"
pattern_file: "📄 Pattern - Cycle Review Generation.md"
role: "Orchestrator"
date: 2026-11-05
---

# ⚡ AI-Suplex: Cycle Review — Command

## 🎯 Trigger
```
AI-Suplex: Cycle Review
CONTENT
  - 7 weeks of sessions + artifacts + trackers

ADDITIONAL: <instructions>
```

## 📋 Usage

### Minimal
```
AI-Suplex: Cycle Review
CONTENT
  - Raw Content: <your input>
```

### With File Reference
```
AI-Suplex: Cycle Review
CONTENT
  - File Reference: [[<relevant plan / review>]]
  - Raw Content: <your input>
```

### With Save Location
```
AI-Suplex: Cycle Review
CONTENT
  - File Reference: [[<relevant plan / review>]]
  - Raw Content: <your input>

ADDITIONAL: Save to Reviews/<Period>/Weekly/Cycle X/
```

## 🤖 What the AI Does

1. Reads `📄 Pattern - Cycle Review Generation.md` + the corresponding Orchestrator skill
2. Uses CONTENT (raw input + file references + chat context)
3. Generates a 7-week cycle review: executive summary, focus area performance, achievements, lessons learned, recommendations, next cycle goals
4. Run `3lm promote --min 70 && 3lm index`
4. Outputs for Hustler review, then saves to `Reviews/<Period>/Weekly/Cycle X/`
5. Runs the memory loop unless `Skip memory loop` is in ADDITIONAL
6. Reports: saved file path + extracted lessons

## 📄 Output
```
Reviews/<Period>/Weekly/Cycle X/
```

## 🔧 Rules

1. **End of cycle** — closes the 7-week arc before the next cycle plan
2. **Feed the next cycle** — recommendations become the next cycle's goals
3. **Promote what earned it** — score lessons 70+ to semantic/procedural

## ⚡ Examples

### Minimal
```
AI-Suplex: Cycle Review
CONTENT
  - Raw Content: <short input>
```

### Full — With Reference + Save
```
AI-Suplex: Cycle Review
CONTENT
  - File Reference: [[<relevant plan / review>]]
  - Raw Content: <full input>

ADDITIONAL: Save to Reviews/<Period>/Weekly/Cycle X/
```
