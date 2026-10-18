---
type: ai-suplex-command
command: "Artifact Capture (Markdown)"
pattern_file: "📄 Pattern - Artifact Capture.md"
role: "Builder"
date: 2026-09-07
---

# ⚡ AI-Suplex: Artifact Capture (Markdown) — Command

Capture any markdown (`.md`) file as an artifact — wrap it, no conversion.

## 🎯 Trigger
```
AI-Suplex: Artifact Capture(Markdown)
CONTENT
  - File Reference: <file.md>

ADDITIONAL: <save path, skip memory loop>
```

> **Sibling commands:** `(Scratch Pad)` = `prompt.md` shortcut · `(file)` = non-markdown conversion · `(youtube)` = video transcript.

## 📋 Usage

```
AI-Suplex: Artifact Capture(Markdown)
CONTENT
  - File Reference: Projects/Agents Terminal/Web Console — Design Spec.md

ADDITIONAL: Save to Artifacts/<Period>/Cycle 2/Week 2/
```

## 🤖 What the AI Does

1. **Reads** the markdown file.
2. **Wraps** it as an artifact — no conversion (it is already markdown).
3. **Fills** frontmatter (title, focus, cycle, week, date, time, tags).
4. **Preserves** the original (moves/copies to `Attachments/`).
5. **Runs** `3lm add-lessons --source artifact --ref <title> --list "..."` → `3lm index` (memory loop).
6. **Reports** the saved artifact path + lessons extracted.

## 🔗 Variations

| Command                        | Source               | Use When                                |
| ------------------------------ | -------------------- | --------------------------------------- |
| `Artifact Capture`             | Chat reference       | Capturing from conversation             |
| `Artifact Capture(Scratch Pad)` | `prompt.md` (default) | The frequent scratch-pad capture        |
| `Artifact Capture(Markdown)`   | Any `.md` file       | Capturing a markdown file               |
| `Artifact Capture(file)`       | Non-markdown file    | Converting docx/pdf/mp4/etc to artifact |
| `Artifact Capture(youtube)`    | YouTube URL          | Transcript → study-notes                |
