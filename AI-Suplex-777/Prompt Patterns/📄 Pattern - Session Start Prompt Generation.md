# AI-Suplex Prompt Pattern: Session Start Prompt

**TWABAM ⚡!** Here's the **AI-Suplex Prompt Pattern - Session Start Prompt** – ready for users to copy-paste into any AI chat to generate battle-ready session start prompts:

---

## 📋 **How to Use This Pattern:**

1. **Copy** the entire prompt pattern below
2. **Paste** into Claude/ChatGPT/DeepSeek
3. **Replace** the content section with your specific Session Number, Task ID or task details
4. **Execute** – AI will generate a battle-ready session start prompt

---

## 📋 The Prompt Pattern


```yaml
<prompt-pattern>  
CONTEXT: Generate a complete AI-Suplex Session Start prompt from a Session Number, Task ID or task description
- External Source 1 [optional]: AI-Suplex-777/Skills/Architect – Session Start Prompt Generator
- External Source 2 [optional]: AI-Suplex-777/AI-Suplex Kick-start/AI-Suplex - Session Start Prompt
- Inline Source [minimal]: Converting tasklist tasks into executable session prompts

TEMPLATE: AI-Suplex-777/Templates/AI-Suplex - Session Start Prompt Template.md

EXAMPLE: AI-Suplex-777/Templates/Examples/Example - Session Start  Prompt

TASK: Act as Architect. Generate a complete AI-Suplex Session Start prompt using the Session Number, Task ID or task description provided, following the exact structure and formatting from the Architect skill. Include all required fields: Session_Type, Focus, Mission, Expected_Duration, Energy_Level, Tasks with role tags, Success Metrics, and optional Context/Constraints.

MEMORY LOOP:
After generating the Session Start Prompt, extract and report:
- Stable decisions that should go to semantic memory.
- Reusable workflow patterns that should go to procedural memory.
- Useful but unproven ideas that should go to lessons.md.
- Any contradictions, reversals, or superseded assumptions that should be marked deprecated.
- Any index updates required.

   If you are web-based (ChatGPT, DeepSeek web) without terminal access:
   
   If using Obsidian: just click 🏁 End — the macro runs this automatically.

▶️ 3LM MEMORY LOOP — Run before answering the user:
   If you have terminal access (Claude Code, Cursor, Zed):
   → Run silently: node Tools/3lm.js start && node Tools/3lm.js learn && node Tools/3lm.js index
   
   If you are web-based (ChatGPT, DeepSeek web) without terminal access:
   → Print: "Run from terminal: node Tools/3lm.js start && node Tools/3lm.js learn && node Tools/3lm.js index"
   
   If using Obsidian: just click 🏁 End — the macro runs this automatically.

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
# Remove `#` from list items or add instruction to apply post generation tasks
- Save file in Sessions/Active/Start/ folder"
- Use the file naming convention: fileName = `-${mission}-${focus}-${sessionType}-session-start.md`;

CONTENT:
<content>

Source: Use one or more source properties that work together:

--- To be replaced with actual source ---

- Raw Content: [Paste Task ID (e.g., T003-H) OR full task description here] (required)
- File Reference: [[2026-04-12-AI-Suplex-Tasklist-ai-suplex-core-&-777-launch]] for context [^2] (optional)
- Chat Reference: e.g: previous chat window output (optional)
  
--- To be replaced with actual source ---

</content>
</prompt-pattern> 
```
> Note: Use one or more source properties that work together in clarifying task. As a requirement at least one source must be specified  



---

## 🎯 **Example Usage**

```yaml
<prompt-pattern>  
Context: Generate a complete AI-Suplex Session Start prompt from a Task ID or task description
- External Source 1 [optional]: AI-Suplex-777/Skills/Architect – Session Start Prompt Generator
- External Source 2 [optional]: AI-Suplex-777/AI-Suplex Kick-start/AI-SUPLEX SESSION START PROTOCOL – COMPLETE GUIDE
- Inline Source [minimal]: Context: Converting tasklist tasks into executable session prompts

Template: AI-Suplex-777/Skills/Architect – Session Start Prompt Generator

Task: Act as Architect. Generate a complete AI-Suplex Session Start prompt using the Session Number, Task ID or task description provided, following the exact structure and formatting from the Architect skill.

MEMORY LOOP: Before generating, load relevant context. After generating, persist the session plan. Follow the rules in the main pattern above.

Content:
<content>

Source:
- Raw Content: T003-H: Test Core vault on fresh Obsidian (unzip → open → trust plugins → click Start → Command Center updates)

</content>
</prompt-pattern> 
```

## 🔄 **What Users Get**

When they use this pattern, the AI will generate a session start prompt following the exact protocol [^1]:

```yaml
AI-Suplex: Session Start
  - Session_Type: "execution"
  - Focus: "digital-products"
  - Cycle: 1
  - Week: 1
  - Mission: "CORE VAULT FRESH INSTALL TESTING"
  - Expected_Duration: "25 minutes"
  - Energy_Level: ⚡⚡⚡⚡

Mission: Test AI-Suplex Core Edition on fresh Obsidian installation to verify installation flow and Command Center functionality.

Tasks:
  [HUSTLER] - [ ] T003-H: Test Core vault on fresh Obsidian (unzip → open → trust plugins → click Start → Command Center updates)

Success Metrics:
  - Vault opens without errors
  - All required plugins auto-enable
  - Dummy session runs successfully
  - Command Center updates visible after session

Context: Final testing phase for AI-Suplex Core Edition launch. Core has flat folders with 5 basic macros and simplified Command Center.
References: [[2026-04-12-AI-Suplex-Tasklist-ai-suplex-core-&-777-launch]]
```

## 💡 **Why This Pattern Works**

1. **Exact Role Assignment** – Specifies "Act as Architect" for consistent output using the Architect skill [^1]
2. **Protocol Compliance** – Follows the exact session start structure defined in the skill
3. **Task Context Integration** – Links back to source tasklist for full context [^2]
4. **Complete Output** – Ensures all required sections (Focus, Mission, Tasks, Success Metrics, etc.)

**TWABAM ⚡!** This pattern transforms isolated task items into complete, executable session prompts that follow the AI-Suplex protocol exactly. Users just need to provide a Session Number, Task ID or task description, and the Architect skill handles the formatting and structure.

#### Sources
[^1]: [[Architect – Session Start Prompt Generator]]
[^2]: [[2026-04-12-ai-suplex-core-&-777-launch-ai-suplex-tasklist]]