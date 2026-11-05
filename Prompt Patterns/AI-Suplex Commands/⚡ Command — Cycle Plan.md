---
type: ai-suplex-command
command: "Cycle Plan"
pattern_file: "📄 Pattern - Cycle Plan Generation.md"
role: "Orchestrator"
date: 2026-11-05
---

# ⚡ AI-Suplex: Cycle Plan — Command

## 🎯 Trigger
```
AI-Suplex: Cycle Plan
CONTENT
  - strategic goals + focus priorities + previous cycle data

ADDITIONAL: <instructions>
```

## 📋 Usage

### Minimal
```
AI-Suplex: Cycle Plan
CONTENT
  - Raw Content: <your input>
```

### With File Reference
```
AI-Suplex: Cycle Plan
CONTENT
  - File Reference: [[<relevant plan / review>]]
  - Raw Content: <your input>
```

### With Save Location
```
AI-Suplex: Cycle Plan
CONTENT
  - File Reference: [[<relevant plan / review>]]
  - Raw Content: <your input>

ADDITIONAL: Save to Plans/<Period>/Cycle X/Cycle X Plan.md
```

## 🤖 What the AI Does

1. Reads `📄 Pattern - Cycle Plan Generation.md` + the corresponding Orchestrator skill
2. Uses CONTENT (raw input + file references + chat context)
3. Generates a 7-week cycle plan: 4 phases, week-by-week breakdown (Weeks 1, 2–3, 4–5, 6–7), financial forecast, critical success factors
4. Outputs for Hustler review, then saves to `Plans/<Period>/Cycle X/Cycle X Plan.md`
5. Runs the memory loop unless `Skip memory loop` is in ADDITIONAL
6. Reports: saved file path + extracted lessons

## 📄 Output
```
Plans/<Period>/Cycle X/Cycle X Plan.md
```

## 🔧 Rules

1. **Once per 7 weeks** — the cycle plan is the strategic compass
2. **Review the previous cycle first** — run `AI-Suplex: Cycle Review` if available
3. **Define goals before planning** — the plan maps goals to weeks

## ⚡ Examples

### Minimal
```
AI-Suplex: Cycle Plan
CONTENT
  - Raw Content: <short input>
```

### Full — With Reference + Save
```
AI-Suplex: Cycle Plan
CONTENT
  - File Reference: [[<relevant plan / review>]]
  - Raw Content: <full input>

ADDITIONAL: Save to Plans/<Period>/Cycle X/Cycle X Plan.md
```
