
# AI-Suplex Prompt Pattern: Tasklist Generation

**TWABAM ⚡!** Here is the complete **Prompt Pattern for Tasklist Generation**, formatted for immediate use.

---

## 📋 How to Use This Pattern

1.  **Copy** the entire `prompt-pattern` block below.
2.  **Paste** it into your AI assistant (Claude, ChatGPT, DeepSeek).
3.  **Replace** the content in the `Source` section with your specific task details.
4.  **Execute**. The AI, acting as the **Orchestrator**, will generate a complete, formatted AI-Suplex tasklist.

---

## 📋 The Prompt Pattern

```yaml
<prompt-pattern>
CONTEXT: Generate a structured AI-Suplex tasklist from raw to-do items or project requirements
- External Source 1 Orchestrator[optional]: AI-Suplex-777/Skills/Orchestrator – AI‑Suplex Tasklist Generator
- External Source 2 [optional]: AI-Suplex-777/AI-Suplex Kick-start/The AI-Suplex Workflow Pipeline
- Inline Source: Converting unstructured tasks into battle-ready execution plans

EXAMPLE: AI-Suplex-777/Templates/Examples/Example - Tasklist

TASK: Act as Orchestrator. Generate a complete AI-Suplex tasklist using the raw input provided, following the exact structure and formatting from the example tasklist. Include proper frontmatter, session breakdowns, role assignments, and an execution command.

MEMORY LOOP:
After generating the Tasklist, extract and report:
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
# Specify post-generation tasks: Remove `#` for list items below add new post-generation instructions
# - Save file in AI-Suplex-777/Tasklists/ folder
# - Use the file naming convention: fileName = `YYYY-MM-DD-${mission-title}-tasklist.md`;
# - Open saved file in new tab 

CONTENT:
<content>
Source:
--- To be replaced with actual source ---
# Use one or more source properties that work together:
- Raw Content: [Paste your raw to-do list, project requirements, or mission description here] (required)
- File Reference: [[AI-Suplex-777/Tasklists/2026-04-12-ai-suplex-core-&-777-launch-ai-suplex-tasklist]] for context (optional)
- Chat Reference: e.g., Previous output from a conversation with an AI assistant (optional)
--- To be replaced with actual source ---
</content>
</prompt-pattern>
```

> Note: Use one or more source properties that work together in clarifying task. As a requirement at least one source must be specified  


---

## 🎯 Example Usage
```yaml
<prompt-pattern>
CONTEXT: Generate a structured AI-Suplex tasklist from raw to-do items or project requirements
- External Source 1: Orchestrator – AI‑Suplex Tasklist Generator skill
- External Source 2: AI-Suplex-777/AI-Suplex Kick-start/👥 AI‑Suplex Worker Roles – 7‑7‑7 Edition
- Inline Source: Context: Converting unstructured tasks into battle-ready execution plans

EXAMPLE: AI-Suplex-777/Templates/Examples/2026-04-12-AI-Suplex-Tasklist-ai-suplex-core-&-777-launch

TASK: Act as Orchestrator. Generate a complete AI-Suplex tasklist using the raw input provided, following the exact structure and formatting from the example tasklist. Include proper frontmatter, session breakdowns, role assignments, and an execution command.
ADDITIONAL INSTRUCTIONS: Save the generated tasklist to the `Tasklists/` folder as `YYYY-MM-DD-Project-Name-Tasklist.md`.

CONTENT:
<content>
Source:
- Raw Content: "Launch new client onboarding service: create a welcome packet, set up an automated email sequence, design a client portal, and record a tutorial video."
</content>

</prompt-pattern>

```

---

## 🔄 What the User Gets


When this pattern is used, the AI will generate a tasklist matching the exact format and energy of the provided example . This includes:
*   A title with the "TWABAM ⚡!" prefix.
*   Proper YAML frontmatter (date, status, cycle, week, focus, tags).
*   Sessions broken down by duration.
*   Tasks assigned to specific roles (Hustler, Builder, Architect, Sweeper, Orchestrator) with unique IDs (e.g., `T001-H`).
*   Clear success metrics for each session.
*   A task distribution summary table.
*   A final execution command block.


---

---
#### Sources
[^1]: [[Orchestrator – AI‑Suplex Tasklist Generator]]
[^2]: [[👥 AI‑Suplex Worker Roles – 7‑7‑7 Edition]]
[^3]: [[2026-04-12-ai-suplex-core-&-777-launch-ai-suplex-tasklist]]
