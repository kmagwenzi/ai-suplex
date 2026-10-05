---
type: skill
skill_name: "Builder – Multimodal Analysis"
role: "Builder"
version: "1.0"
date: 2026-06-21
tags: [skill, builder, multimodal, video, audio, image, mimo, ai-suplex]
description: "Analyze images, diagrams, or screenshots and extract structured insight."
triggers: [image, screenshot, multimodal, diagram]
depends_on: []
uses_tools: []
quality: 0.5
status: active
---

# Builder Skill: Multimodal Analysis

## 🎯 Purpose

Analyze **video, audio, and image files** using Xiaomi MiMo-V2.5-Pro's native omnimodal capabilities. The skill handles modality detection, API formatting, chunking for large files, structured output, and integration with the AI-Suplex artifact and memory systems.

MiMo-V2.5-Pro is a **native omnimodal model** — it has a 729M Vision Transformer for images/video and a 261M Audio Transformer for audio, all within a unified 1T-parameter architecture.

---

## 📥 When to Use

- **Demo video review** — Analyze product demos, screencasts, or walkthroughs
- **Meeting recordings** — Extract key decisions, action items, and insights from audio/video
- **Design review** — Analyze UI mockups, logos, marketing materials
- **Document scanning** — Read handwritten notes, printed documents, whiteboards
- **Content audit** — Verify marketing videos match product descriptions
- **Artifact inspection** — Review B-Bombs, session reports, or dashboards visually
- **Debugging** — Analyze error screenshots, stack traces, terminal output

---

## 🔧 Modality Detection

Auto-detect the file type and select the correct API format:

| File Extension | Modality | API Content Type |
|----------------|----------|------------------|
| `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm` | **Video** | `video_url` with `data:video/mp4;base64,...` |
| `.mp3`, `.wav`, `.ogg`, `.m4a`, `.flac` | **Audio** | `input_audio` with `data:audio/wav;base64,...` |
| `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp` | **Image** | `image_url` with `data:image/png;base64,...` |

---

## 📤 API Request Format

### Single Modality

```json
{
  "model": "mimo-v2.5-pro",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "YOUR_PROMPT_HERE"},
      {"type": "MODALITY_TYPE", "MODALITY_TYPE": {"url": "data:FORMAT;base64,BASE64_DATA"}}
    ]
  }],
  "max_tokens": 2000
}
```

Where `MODALITY_TYPE` is one of:
- `image_url` → `{"url": "data:image/png;base64,..."}`
- `video_url` → `{"url": "data:video/mp4;base64,..."}`
- `input_audio` → `{"data": "...", "format": "wav"}`

### Multimodal (Multiple Files)

```json
{
  "model": "mimo-v2.5-pro",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "Compare these two images"},
      {"type": "image_url", "image_url": {"url": "data:image/png;base64,FILE1_B64"}},
      {"type": "image_url", "image_url": {"url": "data:image/png;base64,FILE2_B64"}}
    ]
  }],
  "max_tokens": 2000
}
```

---

## ✂️ Chunking Strategy for Large Files

Large videos/audio files must be chunked to avoid API limits.

### Video Chunking

| Original Size | Strategy | Chunk Size |
|---------------|----------|------------|
| < 5MB | Send full | N/A |
| 5-20MB | Extract key frames | 3-second clips |
| > 20MB | Extract key frames + summarize | 5-second clips |

**Chunking command (ffmpeg):**
```bash
# Extract 3-second clip starting at 10 seconds
ffmpeg -i input.mp4 -ss 10 -t 3 -c copy chunk_10.mp4

# Extract key frames every 5 seconds
ffmpeg -i input.mp4 -vf "fps=1/5" -c copy frame_%03d.mp4
```

### Audio Chunking

| Original Size | Strategy | Chunk Size |
|---------------|----------|------------|
| < 5MB | Send full | N/A |
| 5-20MB | Split into segments | 30-second chunks |
| > 20MB | Transcribe in segments | 60-second chunks |

**Chunking command (ffmpeg):**
```bash
# Extract 30-second chunk starting at 60 seconds
ffmpeg -i input.mp4 -ss 60 -t 30 -c copy chunk_60.wav
```

---

## 📋 Output Templates

### Video Analysis Output

```markdown
## 🎬 Video Analysis

**File:** [filename]
**Duration:** [duration]
**Modality:** Video

### Scene Breakdown
1. [Timestamp] — [Description]
2. [Timestamp] — [Description]

### Key Elements
- **Text on screen:** [List any visible text]
- **Products/Brands:** [Identify any products]
- **Actions:** [Describe key actions]
- **Audio cues:** [Note any music, speech, effects]

### Summary
[2-3 sentence summary of the video]

### Insights
- [Key insight 1]
- [Key insight 2]

### Token Usage
| Type | Count |
|------|-------|
| Video tokens | [N] |
| Prompt tokens | [N] |
| Completion tokens | [N] |
```

### Audio Analysis Output

```markdown
## 🎧 Audio Analysis

**File:** [filename]
**Duration:** [duration]
**Modality:** Audio

### Transcript
[Full transcript or summary]

### Key Points
1. [Point 1]
2. [Point 2]

### Action Items
- [ ] [Action 1]
- [ ] [Action 2]

### Sentiment
[Overall tone/sentiment]

### Token Usage
| Type | Count |
|------|-------|
| Audio tokens | [N] |
| Prompt tokens | [N] |
| Completion tokens | [N] |
```

### Image Analysis Output

```markdown
## 🖼️ Image Analysis

**File:** [filename]
**Dimensions:** [WxH]
**Modality:** Image

### Description
[Detailed description of the image]

### Key Elements
- **Text:** [Any visible text]
- **Objects:** [Identified objects]
- **Colors:** [Dominant colors]
- **Layout:** [Composition description]

### Insights
- [Insight 1]
- [Insight 2]

### Token Usage
| Type | Count |
|------|-------|
| Image tokens | [N] |
| Prompt tokens | [N] |
| Completion tokens | [N] |
```

---

## 🧠 How to Invoke the Skill

### **For the Human (Hustler)**

**Option A: Run the Script (Recommended)**
1. Run the QuickAdd macro **"Multimodal Analysis"**
2. Select the file to analyze
3. Choose the analysis type (video/audio/image)
4. Enter your analysis prompt
5. The script handles encoding, API call, and saves the result

**Option B: Manual (No Script)**
1. Provide the file path to the AI
2. Ask the AI to analyze it using MiMo-V2.5-Pro
3. The AI will encode and send via API

### **For the AI (when acting as Builder)**

When the user provides a file for analysis:

1. **Detect modality** from file extension
2. **Check file size** — if > 5MB, chunk it
3. **Encode** the file (or chunks) to base64
4. **Construct API request** with correct content type
5. **Send to MiMo-V2.5-Pro** via `api.xiaomimimo.com/v1`
6. **Parse response** and format using the output template
7. **Save as Artifact** in `Artifacts/<Period>/Cycle X/Week Y/`
8. **Extract lessons** for 3lm memory stack

---

## 🔗 Integration with Other Skills

| Skill | How It Uses Multimodal Analysis |
|-------|--------------------------------|
| **Builder – Artifact Capture** | Saves analysis results as structured artifacts |
| **Builder – B-Bomb Promotion** | Promotes polished analyses to B-Bombs |
| **Orchestrator – Weekly Review** | Counts multimodal analyses in weekly metrics |
| **3lm end** | Feeds analysis insights to episodic memory |
| **3lm learn** | Extracts reusable patterns from analysis workflows |

---

## ✅ Quality Checklist

- [ ] **File type** correctly detected (video/audio/image)
- [ ] **File size** checked — chunked if > 5MB
- [ ] **Base64 encoding** successful (no truncation)
- [ ] **API request** uses correct content type format
- [ ] **Response** parsed and formatted using template
- [ ] **Token usage** recorded
- [ ] **Artifact** saved in correct location
- [ ] **Lessons** extracted for 3lm memory

---

## ⚠️ Known Limitations

| Limitation | Workaround |
|------------|------------|
| Zed has no native video/audio upload | Use script or manual base64 encoding |
| API cannot fetch URLs | Always send base64, never URLs |
| Large files cause "Argument list too long" | Write JSON to file, use `curl -d @file` |
| 1x1 pixel images fail | Ensure minimum 100x100 resolution |
| Silent audio may confuse model | Add context about expected audio content |

---

## 🚀 Next Steps After Analysis

1. **Review** — Open the artifact and refine insights
2. **Promote** — If quality is high, promote to B-Bomb
3. **Learn** — Run `3lm learn` to extract lessons
4. **Share** — Add to project collection or MOC

---

**TWABAM ⚡!** This skill turns any media file into structured, actionable intelligence. One file in, artifact out. 🦸💣
