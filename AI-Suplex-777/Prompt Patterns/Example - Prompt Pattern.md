
```yaml
<prompt-pattern>
CONTEXT: Generate a structured AI-Suplex tasklist from raw to-do items or project requirements
- External Source 1: Orchestrator – AI‑Suplex Tasklist Generator skill
- External Source 2: AI-Suplex Kick-start/Tasklist examples
- Inline Source: Context: Converting unstructured tasks into battle-ready execution plans

EXAMPLE: AI-Suplex-777/Templates/Examples/2026-04-12-AI-Suplex-Tasklist-ai-suplex-core-&-777-launch
# or use TEMPLATE: [Template file path if available]

TASK: Act as Orchestrator. Generate a complete AI-Suplex tasklist using the raw input provided, following the exact structure and formatting from the example tasklist. Include proper frontmatter, session breakdowns, role assignments, and execution command.

CORTEXMEM: After generating, persist strategic decisions. Follow the rules in the specific pattern file.

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
- Raw Content: [Paste Task ID (e.g., T003-H) OR full task description here] 
- File Reference: [[2026-04-12-AI-Suplex-Tasklist-ai-suplex-core-&-777-launch]] for context (optional)
- Chat Reference: e.g: Previous Output from conversations with AI (optional)
--- To be replaced with actual source ---

</content> 
</prompt-pattern>
```

## 🧠 CortexMem Integration

Each pattern in this folder includes a `CORTEXMEM:` section embedded directly inside the `<prompt-pattern>` block. See `📖 Pattern Quick Reference.md` for the full guide, or check any pattern file for pattern-specific `get_context` / `save_context` instructions.

**CLI helper:** Run `node cm <tool> [--param value ...]` from the repo root (`AI-Suplex-777/`).
