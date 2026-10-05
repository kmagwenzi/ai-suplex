---
type: ai-suplex-command
command: "Artifact Capture (file)"
pattern_file: "📄 Pattern - Artifact Capture.md"
role: "Builder"
date: 2026-09-07
---

# ⚡ AI-Suplex: Artifact Capture (file)

Convert a non-markdown file into a searchable AI-Suplex artifact.

## 🎯 Trigger
```
AI-Suplex: Artifact Capture(file)
CONTENT
  - File Reference: <file.docx|file.pdf|file.pptx|file.xlsx|file.html|file.mp4|file.png|...>

ADDITIONAL: <save path, skip memory loop, run script>
```

> **⚠️ Distinct trigger** — `(file)` = non-markdown conversion (this command).
> - `(Scratch Pad)` = `prompt.md` shortcut → `⚡ Command — Artifact Capture(Scratch Pad).md`
> - `(Markdown)` = any `.md` file → `⚡ Command — Artifact Capture(Markdown).md`
> - `(file)` = non-markdown → convert → artifact (this command)

## 🔧 Environment Prerequisites

- **Filesystem + terminal access** — runs on an agent with disk access (Zed agent / OMP), not a browser-only chat.
- **`markitdown`** at `~/.local/bin/markitdown` (Python 0.1.6) — verified installed.
- **Fallback stack** (see `Context Kick-start/Useful Tools.md`): `file2md` (alias), `mammoth`, `pandoc`, `pdf`, `libreoffice`, `yt-dlp`, `youtube_transcript_api`.
- **If `markitdown` missing:** run `pip install markitdown` then retry; if still unavailable, report the exact command and ask the Hustler.

## 📋 Usage

```
AI-Suplex: Artifact Capture(file)
CONTENT
  - File Reference: [[Executive Overview(Screen).docx]]

ADDITIONAL:
  - Save to Artifacts/<Period>/Cycle X/Week Y/
  - Move original to Artifacts/<Period>/Cycle X/Week Y/Attachments/


AI-Suplex: Artifact Capture(file)
CONTENT
  - File Reference: Agents Terminal V3 Architecture.html

ADDITIONAL: tag as architecture-diagram


AI-Suplex: Artifact Capture(file)
CONTENT
  - File Reference: demo-call.mp4

ADDITIONAL: Transcribe, save to Artifacts/<Period>/Cycle 2/Week 2/
```

## 🤖 What the AI Does

1. **Detect** the file type (extension → modality).
2. **Convert** using the decision tree below (default: `markitdown <file> > out.md`).
3. **Verify** the conversion is non-empty and faithful — skip garbage (see guardrails).
4. **Derive** cycle/week from `Memory/vault-context.md` (never guess).
5. **Save** as `Artifacts/<Period>/Cycle X/Week Y/YYYY-MM-DD-HHmm-{title}.md` with full frontmatter (tags, focus, cycle, week, date, time).
6. **Move** the original to `Artifacts/<Period>/Cycle X/Week Y/Attachments/`.
7. **Run** the memory loop: `3lm add-lessons --source artifact --ref <title> --list "..."` → `3lm index` (unless `Skip memory loop`).
8. **Report** converted path + archived original.

## 🧭 Modality Decision Tree

The framework's job = get ANY file into the model's readable window. Past that, the model decides.

| Modality        | Extensions                                           | Conversion path                                                       | Notes                                         |
| --------------- | ---------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------- |
| Office / text   | `.docx` `.pdf` `.pptx` `.xlsx` `.html` `.epub` `.md` | `markitdown <file>` (or `file2md`)                                    | Headings, tables, bold/italic preserved       |
| Image           | `.png` `.jpg` `.webp` `.gif`                         | Model reads directly (vision) · fallback `markitdown` caption         | Diagrams → screenshot for the model           |
| Audio / video   | `.mp4` `.mp3` `.wav` `.mov`                          | Transcribe first: extract audio (`yt-dlp`/`ffmpeg`) → whisper → `.md` | Local mp4 = extract audio then transcribe     |
| YouTube         | URL                                                  | `markitdown <url>` · or `youtube_transcript_api <id> --format text`   | Proven (Cycle 1 Wk 7 capture)                 |
| Compressed      | `.zip`                                               | `markitdown <file>`                                                   | EPUB/ZIP → markdown                           |
| Binary / vector | `.odg` `.ai` `.svg`                                  | `libreoffice --convert-to pdf` → `markitdown`                         | Or screenshot if a diagram                    |
| Scanned PDF     | `.pdf` (no text layer)                               | OCR first (`pdf`/`pandoc` stack) → `markitdown`                       | Detect empty output → OCR, don't save garbage |

## 📂 File Layout

```
Artifacts/<Period>/Cycle X/Week Y/
├── YYYY-MM-DD-HHmm-{title}.md        ← Converted markdown artifact
└── Attachments/
    ├── original.docx                  ← Preserved original
    ├── original.html
    └── original.pdf
```

## 🛡️ Quality Guardrails

1. **Verify before saving** — empty/garbled output (e.g. scanned PDF) → OCR or skip; never save garbage.
2. **Size guard** — converted markdown over ~4,000 tokens → save a structured *summary* artifact and keep the full text as an attachment.
3. **Derive, don't guess** — cycle/week always from `Memory/vault-context.md`.
4. **No overwrite** — title collision → append `-2`, `-3`; keep the original byte-for-byte in `Attachments/`.
5. **Memory loop by default** — `3lm add-lessons --source artifact --ref <title> --list "..."` → `3lm index`, unless `Skip memory loop`.

## 🔗 Variations

| Command                        | Source               | Use When                                |
| ------------------------------ | -------------------- | --------------------------------------- |
| `Artifact Capture`             | Chat reference       | Capturing from conversation             |
| `Artifact Capture(Scratch Pad)` | `prompt.md` (default) | The frequent scratch-pad capture        |
| `Artifact Capture(Markdown)`   | Any `.md` file       | Capturing a markdown file               |
| `Artifact Capture(file)`       | Non-markdown file    | Converting docx/pdf/mp4/etc to artifact |
| `Artifact Capture(youtube)`    | YouTube URL          | Transcript → study-notes                |
