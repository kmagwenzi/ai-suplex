# AI-Suplex Prompt Pattern:  Batch Insight Generation

**TWABAM ⚡!** Here's the **AI-Suplex Insight Prompt Pattern** – ready for users to copy-paste into any AI chat to generate structured insights:

> Note: Use this pattern for batch insight generation otherwise for a single insight entry the macro is better  

---

## 📋 **How to Use This Pattern:**

1. **Copy** the entire prompt pattern below
2. **Paste** into Claude/ChatGPT/DeepSeek
3. **Replace** the content section with your specific insight content
4. **Execute** – AI will generate battle-ready insights in the correct format

---

## 📋 The Prompt Pattern

```yaml
<prompt-pattern>  
CONTEXT: Generate structured AI-Suplex insights from observations, learnings, or reflections
- External Source 1 [optional]: Builder – Artifact Capture skill 
- External Source 2 [optional]: AI-Suplex-777/AI-Suplex Kick-start/The AI-Suplex Workflow Pipeline
- Inline Source [minimal]: Capturing learnings and reflections from work sessions

EXAMPLE: AI-Suplex-777/Templates/Examples/Example - Insight

TASK: Act as Builder. Generate structured AI-Suplex insights using the content provided, following the exact structure and formatting from the Example - Insight file. Format insights as bullet points with timestamp, focus area, insight text, and source.

MEMORY LOOP:
After generating insights, extract and report:
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


▶️ 3LM QUICK CAPTURE — Run after capturing:
   If you have terminal access (Claude Code, Cursor, Zed):
   → Run silently: node Tools/3lm.js learn && node Tools/3lm.js index
   
   If you are web-based (ChatGPT, DeepSeek web) without terminal access:
   → Print: "Run from terminal: node Tools/3lm.js learn && node Tools/3lm.js index"
   
   This extracts the lesson from your capture immediately.
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
#- Specify post-generation tasks e.g: "Append insights to Insights/Cycle [X]/Week [Y].md"

CONTENT:
<content>

Source: Use one or more source properties that work together:

--- To be replaced with actual source ---
- Raw Content: [Paste your observations, learnings, or reflections here - what did you discover?] (required)
- File Reference: [[Existing session, artifact, or B-Bomb to extract insights from]] for context (optional)
- Chat Reference: e.g: Previous Output from session or AI conversation (optional)
--- To be replaced with actual source ---

</content>
</prompt-pattern> 
```

> Note: Use one or more source properties that work together in clarifying task. As a requirement at least one source must be specified  


---

## 🎯 **Example Usage**

```yaml
<prompt-pattern>  
Context: Generate structured AI-Suplex insights from observations, learnings, or reflections
- External Source 1 [optional]: Builder – Artifact Capture skill
- External Source 2 [optional]: AI-Suplex Worker Roles documentation
- Inline Source [minimal]: Context: Capturing learnings from template pattern development

Example: AI-Suplex-777/Templates/Examples/Example - Insight

Task: Act as Builder. Generate structured AI-Suplex insights using the content provided, following the exact structure and formatting from the Example - Insight file. Format insights as bullet points with timestamp, focus area, insight text, and source.

MEMORY LOOP: After generating insights, append each insight to Memory/lessons.md. Notify user to run 3lm promote when ready. Follow the rules in the main pattern above.

Content:
<content>

Source:
- Raw Content: "
  
- Insight 1:Template patterns bridge the gap -between templates and user adoption by providing clear workflows. 
- Insight 2: The \'Pattern → Template → Example\' trinity creates a complete learning loop for users. 

- Insight 3:Integrating patterns into the Command Center makes them immediately discoverable and usable
"

</content>
</prompt-pattern> 
```


---

## 🔄 **What Users Get**

When they use this pattern, the AI will generate insights like this [^2]:

```
- **2026-04-14 15:30** – *digital-products* – Template patterns bridge the gap between templates and user adoption by providing clear workflows [Source: session]
- **2026-04-14 15:30** – *digital-products* – The "Pattern → Template → Example" trinity creates a complete learning loop for users [Source: session]
- **2026-04-14 15:30** – *digital-products* – Integrating patterns into the Command Center makes them immediately discoverable and usable [Source: session]
```

---

## 💡 **Why This Pattern Works**

1. **Exact Format Compliance** – Follows the exact structure from Example - Insight [^2] with timestamps, focus areas, and sources
2. **Batch Processing** – Perfect for capturing multiple insights at once (as noted in the workflow: "Capturing insights using Agentic AI: Builder is best suited for batch capture of insights" [^3])
3. **Role Assignment** – Specifies "Act as Builder" for consistent output
4. **Source Tracking** – Automatically includes proper source attribution for each insight

**TWABAM ⚡!** This pattern transforms raw observations into structured, trackable insights that feed into the Insight dashboard and weekly reviews. Users just need to provide their learnings, and the Builder handles the formatting and organization.



---

---
#### Sources
[^1]: [[Builder – Artifact Capture]]
[^2]: [[Example - Insight]]
[^3]: [[Generate Prompt Pattern - Context+Agent-AI-Pipeline+Example]]