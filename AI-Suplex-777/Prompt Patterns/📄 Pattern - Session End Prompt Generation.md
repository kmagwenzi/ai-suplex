# AI-Suplex Prompt Pattern : Session End Prompt Generation

**TWABAM ⚡!** Here's the **AI-Suplex Prompt Pattern - Session End Prompt** – ready for users to copy-paste into any AI chat to generate complete session end prompts:

---

## 📋 **How to Use This Pattern:**

1. **Copy** the entire prompt pattern below
2. **Paste** into Claude/ChatGPT/DeepSeek
3. **Replace** the content section with your specific session completion details
4. **Execute** – AI will generate a battle-ready session end prompt


---

## 📋 The Prompt Pattern

```yaml
<prompt-pattern>
CONTEXT: Generate a complete AI-Suplex Session End prompt for a completed session
- External Source 1: AI-Suplex-777/Skills/Architect – Session End Prompt Generator
- External Source 2 [optional]: AI-Suplex-777/AI-Suplex Kick-start/AI-Suplex - Session-Management-Protocol
- Inline Source: Capturing session completion data and learnings for reporting

TEMPLATE: AI-Suplex-777/Templates/AI-Suplex - Session End Prompt Template

TASK: Act as Architect. Generate a complete AI-Suplex Session End prompt using the session details provided, following the exact structure and formatting from the Session End Template. Include all required fields: Session_Rating, Completion_Status, Key_Insights, Next_Actions, Blockers, and optional Session_Narrative.

MEMORY LOOP:
After generating the Session End Prompt, extract and report:
- Stable decisions that should go to semantic memory.
- Reusable workflow patterns that should go to procedural memory.
- Useful but unproven ideas that should go to lessons.md.
- Any contradictions, reversals, or superseded assumptions that should be marked deprecated.
- Any index updates required.

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
#- Specify post-generation tasks e.g: "Save file in Sessions/Active/End/ folder for editing"

CONTENT:
<content>
Source: Use one or more source properties that work together:

--- To be replaced with actual source ---

- Raw Content: [Paste session completion details here - what was accomplished, rating, insights, next actions] (required)
- File Reference: [[Session start file or tasklist]] for context (optional)
- Chat Reference: e.g: Previous Output from session execution or summary (optional)
  
--- To be replaced with actual source ---
</content>
</prompt-pattern>
```

> Note: Use one or more source properties that work together in clarifying task. As a requirement at least one source must be specified  


---

## 🎯 **Example Usage**

```yaml
<prompt-pattern>
Context: Generate a complete AI-Suplex Session End prompt for a completed session
- External Source 1: AI-Suplex-777/AI-Suplex Kick-start/AI-Suplex - Session-Management-Protocol
- External Source 2: AI-Suplex-777/AI-Suplex Kick-start/👥 AI‑Suplex Worker Roles – 7‑7‑7 Edition
- Inline Source: Capturing session completion data and learnings for reporting

Template: AI-Suplex-777/Templates/AI-Suplex - Session End Prompt Template

Task: Act as Architect. Generate a complete AI-Suplex Session End prompt using the session details provided, following the exact structure and formatting from the Session End Template.

MEMORY LOOP: Before generating, load session context. After generating, persist session completion state. Follow the rules in the main pattern above.

Content:
<content>
Source:
- Raw Content: Completed Session 1: Final ZIP Packaging & Testing. Rating: 4/5. Status: completed. Key insights: Both zips created successfully, Core Edition tested on fresh Obsidian, Deep Ultra content added. Next actions: Move to Session 2 demo recording.
</content>
</prompt-pattern>
```

---


## 🔄 **What Users Get**

When they use this pattern, the AI will generate a session end prompt following the exact structure [^3]:

```yaml
# Session: digital-products, Cycle 1, Week 1

AI-Suplex: Session End
  - Session_Rating: 4
  - Completion_Status: completed
  - Key_Insights:
      - Both AI-Suplex-Core.zip and AI-Suplex-777.zip created successfully
      - Core Edition tested on fresh Obsidian installation - all plugins auto-enabled
      - Deep Ultra preview content added to 7-7-7 zip for demo purposes
  - Next_Actions:
      - Proceed to Session 2: Demo Video Recording
      - Schedule 30-minute recording session
      - Prepare demo script highlighting Commander buttons
  - Blockers:
      - None encountered
  - Session_Narrative: Successfully completed final packaging and testing phase for AI-Suplex launch. Both Core and 7-7-7 editions are battle-ready for upload.

Response_Protocol:
  - Generate a session end report in AI-Suplex-777/Sessions/Active/End/
  - Include frontmatter with date, time, rating, status, insights, next actions, blockers
  - Append key insights and next actions to the report body
  - Open the file for editing
```

---

## 💡 **Why This Pattern Works**

1. **Exact Role Assignment** – Specifies "Act as Architect" for consistent output [^2]
2. **Protocol Compliance** – Follows the session end structure from the Session-Management-Protocol [^1]
3. **Complete Fields** – Ensures all required sections (Rating, Status, Insights, Actions, Blockers) are included
4. **Next Step Guidance** – Includes Response_Protocol for generating the actual session end report

**TWABAM ⚡!** This pattern transforms raw session completion data into structured end prompts that can be used to generate formal session end reports. Users just need to provide their session details, and the Architect skill handles the formatting and protocol compliance.


---

---
#### Sources
[^1]: [[AI-Suplex - Session-Management-Protocol]]
[^2]: [[👥 AI‑Suplex Worker Roles – 7‑7‑7 Edition]]
[^3]: [[Architect – Session End Prompt Generator]]