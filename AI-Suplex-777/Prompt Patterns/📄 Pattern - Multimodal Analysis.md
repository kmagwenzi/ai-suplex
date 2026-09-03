# AI-Suplex Prompt Pattern: Multimodal Analysis

**TWABAM ⚡!** Copy-paste this into Claude, ChatGPT, DeepSeek, MiMo, or any other AI chat to analyze video, audio, and image files using MiMo-V2.5-Pro's native omnimodal capabilities — then route extracted learnings to the 3-layer memory stack.

---

## 🎯 How to Use

1. **Copy** the entire `<prompt-pattern>` block below
2. **Paste** into your AI chat (works best with MiMo-V2.5-Pro via API)
3. **Replace** the `CONTENT:` section with your file path and analysis prompt
4. **Execute** — the AI generates the analysis **and** saves memory (or gives you the exact commands to run)

---

## 📋 The Prompt Pattern

````yaml
<prompt-pattern>
CONTEXT: Analyze a video, audio, or image file using Xiaomi MiMo-V2.5-Pro's native omnimodal capabilities. The model has a 729M Vision Transformer for images/video and a 261M Audio Transformer for audio.
- External Source 1: AI-Suplex-777/Skills/Builder – Multimodal Analysis
- External Source 2: AI-Suplex-777/Scripts/Multimodal Analysis.js
- Inline Source: MiMo-V2.5-Pro omnimodal API (api.xiaomimimo.com/v1)

TEMPLATE: AI-Suplex-777/Skills/Builder – Multimodal Analysis (Output Templates section)

TASK: Act as Builder. Analyze the provided media file using MiMo-V2.5-Pro's multimodal API. Follow these steps:

1. DETECT MODALITY from file extension:
   - Video: .mp4, .mov, .avi, .mkv, .webm → use video_url content type
   - Audio: .mp3, .wav, .ogg, .m4a, .flac → use input_audio content type
   - Image: .png, .jpg, .jpeg, .gif, .webp, .bmp → use image_url content type

2. CHECK FILE SIZE — if > 5MB, chunk into segments:
   - Video: 3-second clips via ffmpeg
   - Audio: 30-second segments via ffmpeg

3. ENCODE to base64 (use `base64 -w0` for single-line output)

4. CONSTRUCT API REQUEST with correct content type:
   - Image: {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}
   - Video: {"type": "video_url", "video_url": {"url": "data:video/mp4;base64,..."}}
   - Audio: {"type": "input_audio", "input_audio": {"data": "...", "format": "wav"}}

5. SEND to MiMo API: POST https://api.xiaomimimo.com/v1/chat/completions
   - Model: mimo-v2.5-pro
   - Authorization: Bearer $MIMO_API_KEY

6. FORMAT output using the template:
   - Video: Scene Breakdown, Key Elements, Summary, Insights
   - Audio: Transcript, Key Points, Action Items, Sentiment
   - Image: Description, Key Elements, Colors, Layout, Insights

7. SAVE as Artifact in AI-Suplex-777/Artifacts/ with frontmatter

MEMORY LOOP:
After generating the Analysis, extract and report:
- Stable decisions that should go to semantic memory.
- Reusable workflow patterns that should go to procedural memory.
- Useful but unproven ideas that should go to lessons.md.
- Any contradictions, reversals, or superseded assumptions that should be marked deprecated.
- Any index updates required.

▶️ 3LM COMMAND:
   If you have filesystem access (Claude Code, Cursor, Zed):
   → Append each extracted lesson to Memory/lessons.md under ## Current Lessons
   
   If you are web-based (ChatGPT, DeepSeek web):
   → Print these lessons so the user can paste them into Memory/lessons.md
   
   Lessons are scored on Saturday's 3lm promote --min 70.
   To close the session and run the full loop: click 🏁 End in Obsidian.

MEMORY RULES:
- Promote only stable, repeated truths to semantic memory.
- Promote only repeatable workflows to procedural memory.
- Keep uncertain or one-off ideas in lessons.md.
- Mark superseded items as deprecated instead of deleting them immediately.
- Do not invent memory updates not supported by the input.
- Do not reference Graphify.
- Memory is managed via 3lm CLI. The vault is canonical.
- The markdown vault remains canonical.
ADDITIONAL INSTRUCTIONS: NONE
# Specify post-generation tasks: remove the `#` for instructions you want activated post-generation
# - Save file in AI-Suplex-777/Artifacts/Cycle 1/Week 1/
# - File naming: YYYY-MM-DD-HHMM-multimodal-${modality}-analysis.md
# - Open saved file in new tab

CONTENT:
<content>

Source — use one or more (at least one required):
--- Replace with your actual source ---
- File Path: [/path/to/your/file.mp4]
- Analysis Prompt: [What do you want to know about this file?]
- Analysis Type: [video / audio / image / auto]
--- Replace with your actual source ---

</content>
</prompt-pattern>
````

> **Note:** The MiMo API requires base64-encoded media data. If you're using a web-based AI, you may need to encode the file first using `base64 -w0 yourfile.mp4 > encoded.txt` and paste the output.

---

## 💡 Example Usage

````yaml
<prompt-pattern>
CONTEXT: Analyze a video file using Xiaomi MiMo-V2.5-Pro's native omnimodal capabilities.
- External Source 1: Builder – Multimodal Analysis skill
- External Source 2: MiMo-V2.5-Pro omnimodal API
- Inline Source: Product demo video analysis

TEMPLATE: Builder – Multimodal Analysis (Video Analysis Output)

TASK: Act as Builder. Analyze the provided video using MiMo-V2.5-Pro's multimodal API.
ADDITIONAL INSTRUCTIONS: Save file in Artifacts/Cycle 1/Week 1/ as "demo-video-analysis.md"

CONTENT:
<content>

Source:
- File Path: /home/kmagwenzi/Desktop/Demo Video/AI-Suplex-Core-Demo-compressed.mp4
- Analysis Prompt: "Describe what happens in this video in detail. What product is being shown? What features are demonstrated? What is the target audience?"
- Analysis Type: video

</content>
</prompt-pattern>
````

---

## 🎯 What the AI Will Output

1. **The Analysis** — fully structured markdown with scene breakdown, key elements, summary
2. **MEMORY_ROUTE block** — copy-paste commands for 3lm memory stack

**Example output structure:**

```markdown
## 🎬 Video Analysis

**File:** AI-Suplex-Core-Demo-compressed.mp4
**Duration:** 45.2s
**Model:** mimo-v2.5-pro
**Modality:** Video

### Scene Breakdown
1. 0:00-0:03 — Title card: "AI-SUPLEX CORE EDITION"
2. 0:03-0:10 — Dashboard overview with tasklists
3. 0:10-0:20 — Session start workflow demonstration
...

### Key Elements
- **Text on screen:** "AI-SUPLEX CORE EDITION", "Persistent AI Memory"
- **Products:** AI-Suplex Core Edition vault
- **Actions:** Tasklist generation, session capture, memory routing

### Summary
Product demo showcasing AI-Suplex Core Edition's workflow...

### Insights
- Demo focuses on ease-of-use over advanced features
- Target audience appears to be solo entrepreneurs
```

---

## 🔧 Quick CLI Alternative

If you prefer running directly from terminal:

```bash
# Set your API key
export MIMO_API_KEY="your_key_here"

# Analyze a video
VIDEO_B64=$(base64 -w0 /path/to/video.mp4)
echo "{\"model\":\"mimo-v2.5-pro\",\"messages\":[{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"text\":\"Describe this video in detail\"},{\"type\":\"video_url\",\"video_url\":{\"url\":\"data:video/mp4;base64,$VIDEO_B64\"}}]}],\"max_tokens\":2000}" > /tmp/payload.json
curl -s -X POST https://api.xiaomimimo.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MIMO_API_KEY" \
  -d @/tmp/payload.json | python3 -m json.tool

# Analyze an image
IMAGE_B64=$(base64 -w0 /path/to/image.png)
echo "{\"model\":\"mimo-v2.5-pro\",\"messages\":[{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"text\":\"Describe this image\"},{\"type\":\"image_url\",\"image_url\":{\"url\":\"data:image/png;base64,$IMAGE_B64\"}}]}],\"max_tokens\":2000}" > /tmp/payload.json
curl -s -X POST https://api.xiaomimimo.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MIMO_API_KEY" \
  -d @/tmp/payload.json | python3 -m json.tool

# Analyze audio
AUDIO_B64=$(base64 -w0 /path/to/audio.wav)
echo "{\"model\":\"mimo-v2.5-pro\",\"messages\":[{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"text\":\"Transcribe and summarize this audio\"},{\"type\":\"input_audio\",\"input_audio\":{\"data\":\"$AUDIO_B64\",\"format\":\"wav\"}}]}],\"max_tokens\":2000}" > /tmp/payload.json
curl -s -X POST https://api.xiaomimimo.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MIMO_API_KEY" \
  -d @/tmp/payload.json | python3 -m json.tool
```

---

## 📊 Modality Reference

| Modality | Content Type | API Format | Max Practical Size |
|----------|-------------|------------|-------------------|
| **Image** | `image/png` | `image_url` with base64 URL | 10MB |
| **Video** | `video/mp4` | `video_url` with base64 URL | 5MB (chunk if larger) |
| **Audio** | `audio/wav` | `input_audio` with base64 data | 5MB (chunk if larger) |

---

#### Sources
[^1]: [[Builder – Multimodal Analysis]]
[^2]: [[MiMo-V2.5-Pro Documentation]]
[^3]: [[AI-Suplex Artifact Template]]
