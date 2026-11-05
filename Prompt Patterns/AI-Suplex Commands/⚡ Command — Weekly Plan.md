---
type: ai-suplex-command
command: "Weekly Plan"
pattern_file: "📄 Pattern - Weekly Plan Generation.md"
role: "Orchestrator"
date: 2026-11-05
---

# ⚡ AI-Suplex: Weekly Plan — Command

## 🎯 Trigger
```
AI-Suplex: Weekly Plan
CONTENT
  - cycle goals + pending tasks + constraints

ADDITIONAL: <instructions>
```

## 📋 Usage

### Minimal
```
AI-Suplex: Weekly Plan
CONTENT
  - Raw Content: <your input>
```

### With File Reference
```
AI-Suplex: Weekly Plan
CONTENT
  - File Reference: [[<relevant plan / review>]]
  - Raw Content: <your input>
```

### With Save Location
```
AI-Suplex: Weekly Plan
CONTENT
  - File Reference: [[<relevant plan / review>]]
  - Raw Content: <your input>

ADDITIONAL: Save to Plans/<Period>/Cycle X/Week Y/
```

## 🤖 What the AI Does

1. Reads `📄 Pattern - Weekly Plan Generation.md` + the corresponding Orchestrator skill
2. Uses CONTENT (raw input + file references + chat context)
3. Generates a tactical weekly plan: mission, priority tasks by focus, Mon–Sun breakdown, energy map, success metrics
4. Outputs for Hustler review, then saves to `Plans/<Period>/Cycle X/Week Y/`
5. Runs the memory loop unless `Skip memory loop` is in ADDITIONAL
6. Reports: saved file path + extracted lessons

## 📄 Output
```
Plans/<Period>/Cycle X/Week Y/
```

## 🔧 Rules

1. **Feed from the cycle plan** — a weekly plan without its cycle plan is a guess
2. **Respect locked days** — Monday = Hustle Day · Sunday = Rest
3. **Pull next actions** from last week's session ends + review

## ⚡ Examples

### Minimal
```
AI-Suplex: Weekly Plan
CONTENT
  - Raw Content: <short input>
```

### Full — With Reference + Save
```
AI-Suplex: Weekly Plan
CONTENT
  - File Reference: [[<relevant plan / review>]]
  - Raw Content: <full input>

ADDITIONAL: Save to Plans/<Period>/Cycle X/Week Y/
```
