---
type: ai-suplex-command
command: "Artifact Capture (Scratch Pad)"
pattern_file: "📄 Pattern - Artifact Capture.md"
role: "Builder"
date: 2026-09-07
---

# ⚡ AI-Suplex: Artifact Capture (Scratch Pad) — Command

Shortcut for capturing the scratch pad (`prompt.md`) — the most frequent capture. **No CONTENT needed**: it defaults to `File Reference: prompt.md`.

## 🎯 Trigger
```
AI-Suplex: Artifact Capture(Scratch Pad)

ADDITIONAL: <instructions>
```

> `(Scratch Pad)` ≡ `Artifact Capture` with `File Reference: prompt.md`. Optionally point at a different scratch file:
> ```
> AI-Suplex: Artifact Capture(Scratch Pad)
> CONTENT
>   - File Reference: scratch/draft.md
> ```

## 📋 Usage

```
AI-Suplex: Artifact Capture(Scratch Pad)

ADDITIONAL: Save to Artifacts/<Period>/Cycle X/Week Y/
```

## 🤖 What the AI Does

1. **Loads** the scratch pad (`prompt.md` by default, or the given file).
2. **Reads** the Pattern: [[📄 Pattern - Artifact Capture]].
3. **Extracts** the title from the first heading (or infers it).
4. **Analyzes** content to determine focus area.
5. **Fills** artifact frontmatter (tags, focus, cycle, week, date, time).
6. **Structures** scratch content into artifact format:
   - H1 → artifact title
   - Sections → content blocks
   - Key conclusions → `key_insights`
   - Action items → `next_actions`
7. **Saves** to `Artifacts/<Period>/Cycle X/Week Y/YYYY-MM-DD-HHMM-{title}-{focus}.md`.
8. **Runs** `3lm add-lessons --source artifact --ref <title> --list "..."` → `3lm index` (memory loop).
9. **Reports** saved file path + lessons extracted.

## 📄 Output Mapping

| Scratch Pad | Artifact |
|-------------|----------|
| File heading | `# Title` |
| Section H2s | `## 📦 Artifact Content` subsections |
| Bullet points | Preserved in content |
| Key conclusions | `key_insights` frontmatter |
| Next steps | `next_actions` frontmatter |

## 🔗 Variations

| Command                        | Source               | Use When                                |
| ------------------------------ | -------------------- | --------------------------------------- |
| `Artifact Capture`             | Chat reference       | Capturing from conversation             |
| `Artifact Capture(Scratch Pad)` | `prompt.md` (default) | The frequent scratch-pad capture        |
| `Artifact Capture(Markdown)`   | Any `.md` file       | Capturing a markdown file               |
| `Artifact Capture(file)`       | Non-markdown file    | Converting docx/pdf/mp4/etc to artifact |
| `Artifact Capture(youtube)`    | YouTube URL          | Transcript → study-notes                |
