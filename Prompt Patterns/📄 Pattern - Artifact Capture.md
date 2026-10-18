 0# AI-Suplex Prompt Pattern: Artifact Capture

**TWABAM ⚡!** Copy-paste this into Claude, ChatGPT, DeepSeek, or any other AI chat to capture work-in-progress as a structured AI-Suplex artifact **and** automatically route learnings to the 3-layer memory stack.

---

## 🎯 How to Use

1. **Copy** the entire `<prompt-pattern>` block below
2. **Paste** into your AI chat
3. **Replace** the `CONTENT:` section with your raw work
4. **Execute** — the AI generates the artifact **and** routes lessons to memory via `3lm add-lessons`

---

## 📋 The Prompt Pattern

````yaml
<prompt-pattern>
CONTEXT: Capture a work-in-progress artifact (code, diagram, prompt, research notes, etc.) as a structured AI‑Suplex artifact file, then route extracted lessons to the 3-layer memory stack.
- External Source 1: AI-Suplex-777/Skills/Builder – Artifact Capture
- External Source 2 [optional]: AI-Suplex-777/AI-Suplex Kick-start/The AI-Suplex Workflow Pipeline
- Inline Source: Transforming raw work outputs into structured, trackable assets

TEMPLATE: Templates/AI-Suplex - Artifact Template

TASK: Act as Builder. Generate a complete AI‑Suplex Artifact using the provided content, following the exact structure from the Artifact Template. Include frontmatter with focus, cycle, week, key insights, next actions, date, and time. Fill all sections: Overview, Purpose & Goals, Artifact Content, Learnings & Insights, and Next Steps.

MEMORY LOOP:
After generating the Artifact, extract and report:
- Stable decisions that should go to semantic memory.
- Reusable workflow patterns that should go to procedural memory.
- Useful but unproven ideas that should go to lessons.md.
- Any contradictions, reversals, or superseded assumptions that should be marked deprecated.
- Any index updates required.

▶️ 3LM COMMAND:
   Push each extracted lesson (max 3) via the quick-capture command:
     node Tools/3lm.js add-lessons --source artifact --ref <artifact-title> --list "lesson one" "lesson two"

   The LLM knows the lessons — extract them directly, no episode round-trip.
   Lessons are scored on Saturday's 3lm promote --min 70.
   To close the session and run the full loop: click 🏁 End in Obsidian.


▶️ 3LM QUICK CAPTURE — Run after capturing:
   node Tools/3lm.js add-lessons --source artifact --ref <artifact-title> --list "lesson one" "lesson two" && node Tools/3lm.js index

   ⚠️ ON FAILURE — give the user the exact commands to complete artifact capture + 3lm:
     1. Save the artifact to Artifacts/<Period>/Cycle X/Week Y/
     2. node Tools/3lm.js add-lessons --source artifact --ref <artifact-title> --list "lesson one" "lesson two"
     3. node Tools/3lm.js index
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
- Save file in Artifacts/<Period>/Cycle X/Week Y/
- File naming: YYYY-MM-DD-HHMM-${mission-title}-${focus}.md
# - Open saved file in new tab

CONTENT:
<content>

Source — use one or more (at least one required):
--- Replace with your actual source ---
- Raw Content: [Paste your work-in-progress content here — code, diagrams, prompts, research notes, etc.]
- File Reference: [[Existing file with content to convert to artifact]]
- Chat Reference: Previous output from this session or another AI conversation
--- Replace with your actual source ---

</content>
</prompt-pattern>
````

> **Note:** At least one source must be specified. The 3lm quick-capture command runs from your AI‑Suplex‑777 project folder.

---

## 💡 Example Usage

````yaml
<prompt-pattern>
CONTEXT: Capture a work-in-progress artifact as a structured AI‑Suplex artifact file, then route extracted lessons to the 3-layer memory stack.
- External Source 1: Builder – Artifact Capture skill
- External Source 2: AI-Suplex Workflow Pipeline documentation
- Inline Source: Converting webhook configuration into trackable artifact

TEMPLATE: AI-Suplex-777/Templates/AI-Suplex - Artifact Template

TASK: Act as Builder. Generate a complete AI‑Suplex Artifact using the provided content.
ADDITIONAL INSTRUCTIONS: Save file in Artifacts/<Period>/Cycle 1/Week 1/ folder as "wqr-webhook-configuration.md"

CONTENT:
<content>

Source:
- Raw Content:
  Title: "WQR Paynow Webhook Configuration"
  Focus: wqr
  Cycle: 1
  Week: 1
  Overview: "n8n webhook setup for receiving Paynow payment confirmations"
  Primary Objective: "Receive payment confirmations from Paynow automatically"
  Success Criteria: "Webhook successfully receives POST requests with payment data"
  Intended Use: "Automate order status updates when payments are confirmed"
  Artifact Content:
  ```json
  {
    "webhook": "https://wqr.co.zw/paynow",
    "method": "POST",
    "headers": {"Content-Type": "application/json"},
    "timeout": 30,
    "retry": 3
  }
  ```
  Key Insight: "Webhook fixed by removing URL prefix that was causing 404 errors"
  Next Action: "Test payment flow with actual Paynow sandbox transactions"

</content>
</prompt-pattern>
````

---

## 🎯 What the AI Will Output

1. **The Artifact** — fully structured markdown file with frontmatter
2. **3LM quick-capture** — `add-lessons` command executed (or printed on failure)

**Example 3LM capture output:**

```bash
# === 3LM QUICK CAPTURE ===
# Run these from your AI-Suplex-777 project folder:

node Tools/3lm.js add-lessons --source artifact --ref "WQR Paynow Webhook Configuration" --list \
  "URL prefixes in webhook configs can cause 404 errors" \
  "Paynow sandbox has a 30s timeout limit"

node Tools/3lm.js index
# === END 3LM QUICK CAPTURE ===
```

---

## 🧠 Lesson Routing Rules

| Destination | Use When | Example |
|:-----|:---------|:--------|
| `lessons.md` (via `add-lessons`) | Every capture — useful but unproven ideas | `"URL prefixes caused 404 errors"` |
| semantic memory (via `3lm promote`) | Stable, repeated truths | `"Paynow sandbox timeout is 30 seconds"` |
| procedural memory (via `3lm promote`) | Repeatable workflows | `"Webhook Response Mode must be responseNode"` |
| Deprecation Watch | Superseded assumptions, reversals | `"Old pricing model superseded"` |

> **Note:** `add-lessons` writes to `lessons.md` only. Saturday's `3lm promote --min 70` scores and promotes stable lessons to semantic/procedural memory.

---

#### Sources
[^1]: [[Builder – Artifact Capture]]
[^2]: [[The AI-Suplex Workflow Pipeline]]
[^3]: [[AI-Suplex - Artifact Template]]
