---
type: ai-suplex-command
pattern: Artifact Capture (YouTube)
pattern_file: 📄 Pattern - Artifact Capture.md
role: Builder
date: 2026-08-15
---

# ⚡ AI-Suplex: Artifact Capture (YouTube) — Executable

## 🎯 Trigger (two accepted forms)

**Form A — one-liner:**
```
AI-Suplex: Artifact Capture(youtube) - https://youtu.be/VIDEO_ID
```

**Form B — full block:**
```
AI-Suplex: Artifact Capture(youtube)
CONTENT
  - Source
    - File Reference: https://youtu.be/VIDEO_ID

ADDITIONAL INSTRUCTIONS
  - Save file in: Artifacts/<Period>/Cycle 1/Week 6
```

## 📋 Usage
Capture a YouTube video as a structured AI-Suplex **study-notes artifact** in the
**IBM note-taking format** (same as the IBM RAG / LangChain study notes): Overview,
Key Concepts with callouts + mermaid diagrams where apt, Connections to AI-Suplex,
Key Takeaways, and Source.

## 🤖 What the AI Does
1. Reads `📄 Pattern - Artifact Capture.md` (the source of truth)
2. Extracts the YouTube URL from CONTENT
3. Transcribes the video: `youtube_transcript_api <video_id> --format text` → `Attachments/`
4. Reads the transcript + generates the IBM-format study-notes artifact (callouts + mermaid + AI-Suplex mapping)
5. Applies ADDITIONAL instructions (save path; `Skip memory loop` if specified)
6. Runs the memory loop by default: `node Tools/3lm.js add-lessons --source artifact --ref <title> --list "..." && node Tools/3lm.js index`
7. Reports: output file path + MEMORY LOOP (stable decisions / workflows / lessons / deprecations / index)

## 🧠 Memory Loop (default)
- Stable decisions → semantic memory
- Reusable workflows → procedural memory
- Useful but unproven → `Memory/lessons.md` (`## Current Lessons`)
- Reversals/superseded → `## Deprecation Watch`
- Index refreshed

## 📁 File naming
`YYYY-MM-DD-HHMM-<video-topic>-<focus>.md`

---
*TWABAM ⚡! One line → transcript → IBM-format study notes → memory loop.*
