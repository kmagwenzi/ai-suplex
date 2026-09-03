
# AI-Suplex Prompt Pattern : Cycle Review Generation

**TWABAM ⚡!** Here is the complete **Prompt Pattern for Cycle Review Generation**, formatted for immediate use.

---

## 📋 **How to Use This Pattern:**

1. **Copy** the entire prompt pattern below
2. **Paste** into Claude/ChatGPT/DeepSeek
3. **Replace** the content section with your specific insight content
4. **Execute** – AI will generate a review of you 7 week cycle

---

## 📋 The Prompt Pattern

```yaml
<prompt-pattern>
CONTEXT: Generate a comprehensive 7‑week cycle review from session data, artifacts, and trackers
- External Source 1: Orchestrator – Cycle Review Skill 
- External Source 2 [optional]: AI-Suplex-777/AI-Suplex Kick-start/AI‑Suplex Methodology – 7‑7‑7 Edition
- Inline Source: [minimal]: Transforming 7 weeks of work into strategic intelligence for next cycle planning

EXAMPLE: AI-Suplex-777/Skills/Orchestrator – Cycle Review.md

TASK: Act as Orchestrator. Generate a complete 7‑week cycle review using the data sources provided, following the exact structure and methodology from the Cycle Review skill. Include executive summary, focus area performance, cycle achievements, lessons learned, strategic recommendations, and next cycle goals.

MEMORY LOOP:
After generating the Cycle Review, extract and report:
- Stable decisions that should go to semantic memory.
- Reusable workflow patterns that should go to procedural memory.
- Useful but unproven ideas that should go to lessons.md.
- Any contradictions, reversals, or superseded assumptions that should be marked deprecated.
▶️ 3LM COMMAND:
   If you have terminal access (Claude Code, Cursor, Zed):
   → Run silently: node Tools/3lm.js promote --min 70 && node Tools/3lm.js index
   
   If you are web-based (ChatGPT, DeepSeek web) without terminal access:
   → Print: "Run from terminal: node Tools/3lm.js promote --min 70 && node Tools/3lm.js index"
   
   If using Obsidian: run 🔄 Weekly Review macro — it chains this automatically.

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
# - Save file in AI-Suplex-777/Reviews/ folder as `Cycle X Review.md`
# - Open saved file in new tab 
# - Use the review to generate tasklist for next cycle

CONTENT:
<content>
Source:
--- To be replaced with actual source ---
# Use one or more source properties that work together:
- Cycle Number: [Specify cycle number, e.g., "Cycle 1"] (required)
- Strategic Context: [Optional: Goals set for this cycle, external factors, special considerations]
- Data References: [Optional: Specific files or folders to examine]
- Raw Notes: [Optional: Additional observations or priorities for the review]
--- To be replaced with actual source ---
</content>
</prompt-pattern>
```

> Note: Use one or more source properties that work together in clarifying task. As a requirement at least one source must be specified  


---

## 🎯 Example Usage
```yaml
<prompt-pattern>
CONTEXT: Generate a comprehensive 7‑week cycle review from session data, artifacts, and trackers
- External Source 1: Orchestrator – Cycle Review Skill
- External Source 2: AI-Suplex-777/AI-Suplex Kick-start/AI‑Suplex Methodology – 7‑7‑7 Edition
- Inline Source: Transforming 7 weeks of work into strategic intelligence for next cycle planning

EXAMPLE: AI-Suplex-777/Skills/Orchestrator – Cycle Review.md

TASK: Act as Orchestrator. Generate a complete 7‑week cycle review using the data sources provided, following the exact structure and methodology from the Cycle Review skill. Include executive summary, focus area performance, cycle achievements, lessons learned, strategic recommendations, and next cycle goals.
ADDITIONAL INSTRUCTIONS: Save the generated review to the `AI-Suplex-777/Reviews/` folder as `Cycle 1 Review.md`.

CONTENT:
<content>
Source:
- Cycle Number: "Cycle 1"
- Strategic Context: "This was the inaugural cycle of AI-Suplex 7‑7‑7 system. Focus was on system setup, testing, and creating launch assets."
- Data References: "Examine all sessions in Cycle 1 folders, artifacts in Artifacts/Cycle 1/, B-Bombs in B-Bombs/Cycle 1/, and trackers for all focus areas."
- Raw Notes: "Pay special attention to Digital Products focus as it had the most activity. Look for patterns in session energy and productivity."
</content>

</prompt-pattern>
```

---

## 🔄 What the User Gets
When this pattern is used, the AI will generate a cycle review matching the exact format and strategic depth of the Cycle Review skill. This includes:

*   **Executive Summary** – Key metrics across 7 weeks
*   **Cycle Achievements** – Major milestones and accomplishments  
*   **Focus Area Performance** – Table showing sessions, hours, ratings, and status per focus
*   **Cycle‑Level Lessons Learned** – Thematic insights from across weeks
*   **Challenges & Blockers** – Recurring issues with root‑cause analysis
*   **Week‑by‑Week Snapshot** – Progress trend through the cycle
*   **Strategic Recommendations** – Actionable advice for next cycle
*   **Next Cycle Goals** – SMART goals for Cycle X+1
*   **Focus Allocation Proposal** – Suggested time distribution for next cycle


---

## 💡 Why This Pattern Works
1.  **Clear Role Instruction:** Explicitly tells the AI to "Act as Orchestrator," ensuring it uses the correct skill set.
2.  **Comprehensive Scope:** Covers the full 7‑week cycle, not just weekly snapshots.
3.  **Strategic Orientation:** Focuses on patterns, lessons, and forward planning.
4.  **Data‑Driven:** Based on actual session data, artifacts, and trackers.
5.  **Actionable Output:** Produces concrete recommendations and next cycle goals.

## 🔗 Integration Points
- **Pre‑requisite:** Run `Sweeper – Enhance MOCs & Trackers` for recent weeks to ensure data freshness
- **Post‑review:** Use the generated review to:
  - Update `Focuses.md` if rebalancing is needed
  - Generate tasklist for next cycle using Tasklist Generation pattern
  - Archive completed cycle folders
  - Adjust session planning based on lessons learned

## 🎯 Special Scenarios

### Partial Cycle Review
If the cycle is incomplete (e.g., only weeks 1‑4):
- Specify in Strategic Context: "This is an interim review for partial cycle"
- The AI will adjust projections and label appropriately

### First Cycle Review  
For Cycle 1:
- Emphasize system adoption and setup as achievements
- Focus on establishing baselines
- Celebrate initial momentum

### Cycle Transition
After review completion:
- Consider archiving `Sessions/Active/End/` files to `Sessions/Archive/Cycle X/`
- Reset weekly counters in trackers for new cycle
- Update any cycle‑dependent references

**TWABAM ⚡!** This pattern transforms 49 days of work into strategic intelligence. Use it at each 7‑week boundary to evolve your system and accelerate progress.


---
---
#### Sources
[^1]: [[Orchestrator – Cycle Review]]
[^2]: [[AI‑Suplex Methodology – 7‑7‑7 Edition]]
[^3]: [[Orchestrator – Weekly Review]] (for weekly‑level reference)
```