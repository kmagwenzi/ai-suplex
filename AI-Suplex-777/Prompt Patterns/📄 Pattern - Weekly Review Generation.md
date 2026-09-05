
# AI-Suplex Prompt Pattern : Weekly Review Generation

**TWABAM ⚡!** Here is the complete **Prompt Pattern for Weekly Review Generation**, formatted for immediate use.

---

## 📋 **How to Use This Pattern:**

1. **Copy** the entire prompt pattern below
2. **Paste** into Claude/ChatGPT/DeepSeek
3. **Replace** the content section with your specific week data
4. **Execute** – AI will generate a strategic weekly review

---

## 📋 The Prompt Pattern

```yaml
<prompt-pattern>
CONTEXT: Generate a structured weekly review from session data, artifacts, and trackers for a specific cycle and week
- External Source 1: Orchestrator – Weekly Review Skill
- External Source 2 [optional]: AI-Suplex-777/AI-Suplex Kick-start/AI‑Suplex Methodology – 7‑7‑7 Edition
- Inline Source [minimal]: Converting a week's worth of sessions into strategic intelligence for the next week

EXAMPLE: AI-Suplex-777/Skills/Orchestrator – Weekly Review.md

TASK: Act as Orchestrator. Generate a complete weekly review using the data sources provided, following the exact structure and methodology from the Weekly Review skill. Include executive summary, key achievements, lessons learned, blockers & challenges, progress by focus area, recommendations for next week, and next week's focus areas.

MEMORY LOOP:
After generating the Weekly Review, extract and report:
- Stable decisions that should go to semantic memory.
- Reusable workflow patterns that should go to procedural memory.
- Useful but unproven ideas that should go to lessons.md.
- Any contradictions, reversals, or superseded assumptions that should be marked deprecated.
▶️ 3LM COMMAND:
   If you have terminal access (Claude Code, Cursor, Zed):
   → Run silently: node Tools/3lm.js promote --min 70 && node Tools/3lm.js revise && node Tools/3lm.js index
   
   If you are web-based (ChatGPT, DeepSeek web) without terminal access:
   → Print: "Run from terminal: node Tools/3lm.js promote --min 70 && node Tools/3lm.js revise && node Tools/3lm.js index"
   
   If using Obsidian: just click 🔄 Weekly Review — the macro runs this automatically.

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
# - Save file in AI-Suplex-777/Reviews/Weekly/ folder as `Week <N> Review.md`
# - Open saved file in new tab
# - Use the review to select focus areas for next week's tasklist

CONTENT:
<content>
Source:
--- To be replaced with actual source ---
# Use one or more source properties that work together:
- Cycle Number: [Specify cycle number, e.g., "1"] (required)
- Week Number: [Specify week number, e.g., "2"] (required)
- Strategic Context: [Optional: Goals set for this week, external factors, special considerations]
- Data References: [Optional: Specific session files or folders to examine]
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
CONTEXT: Generate a structured weekly review from session data, artifacts, and trackers for a specific cycle and week
- External Source 1: Orchestrator – Weekly Review Skill
- External Source 2: AI-Suplex-777/AI-Suplex Kick-start/AI‑Suplex Methodology – 7‑7‑7 Edition
- Inline Source: Reviewing Week 2 of Cycle 1 — the launch push week for AI-Suplex digital products

EXAMPLE: AI-Suplex-777/Skills/Orchestrator – Weekly Review.md

TASK: Act as Orchestrator. Generate a complete weekly review using the data sources provided, following the exact structure and methodology from the Weekly Review skill. Include executive summary, key achievements, lessons learned, blockers & challenges, progress by focus area, recommendations for next week, and next week's focus areas.
ADDITIONAL INSTRUCTIONS: Save the generated review to `AI-Suplex-777/Reviews/Weekly/` as `Week 2 Review.md`.

CONTENT:
<content>
Source:
- Cycle Number: "1"
- Week Number: "2"
- Strategic Context: "This was launch week for AI-Suplex digital products. Tuesday Reset completed, Bombshell Launch strategy at 10/25 tasks (40%). Today (Wed) is dedicated to full launch push — ZIPs, Gumroad upload, thumbnails, INFILTRATION blitz. Hard stop 13:00 daily for WQR switch. WQR resumes fully Thursday."
- Data References: "Examine Sessions/Active/End/ and Sessions/Archive/End/ for Cycle 1 Week 2 sessions. Check Artifacts/Cycle 1/Week 2/ (12 artifacts), B-Bombs/Cycle 1/Week 2/ (1 B-Bomb), Insights/Cycle 1/Week 2.md. Review Trackers/Digital Products Tracker.md and Trackers/AI Engineering Tracker.md."
- Raw Notes: "Digital Products was the dominant focus this week. AI Engineering had Graph RAG discovery work earlier in the week. Freelance, WQR, and Content Creation had no dedicated sessions. Graphify remains on death row — needs decision by end of week."
</content>

</prompt-pattern>
```

---

## 🔄 What the User Gets
When this pattern is used, the AI will generate a weekly review matching the exact format and strategic depth of the Weekly Review skill. This includes:

*   **Executive Summary** – Total sessions, total focus hours, top focus areas, artifacts, B‑Bombs, insights
*   **Key Achievements** – Notable accomplishments from session missions and insights
*   **Lessons Learned** – Compiled from key insights across all sessions
*   **Blockers & Challenges** – Blockers reported in session ends or trackers
*   **Progress by Focus Area** – Table with sessions, key insight, and next action per focus
*   **Recommendations for Next Week** – AI‑generated suggestions based on week patterns (energy, context switching, deep work)
*   **Next Week's Focus Areas** – Prioritised list based on pending actions and strategic goals


---

## 💡 Why This Pattern Works
1.  **Clear Role Instruction:** Explicitly tells the AI to "Act as Orchestrator," ensuring it uses the correct skill set.
2.  **Focused Scope:** Covers exactly one week, not the full 7‑week cycle — ideal for mid‑cycle course corrections.
3.  **Data‑Driven:** Based on actual session data, artifacts, and trackers from the vault.
4.  **Actionable Output:** Produces concrete next‑week recommendations and focus priorities.
5.  **Lightweight:** Faster than a full cycle review — designed for the weekly Saturday ritual.

## 🔗 Integration Points
- **Pre‑requisite:** Run `Sweeper – Enhance MOCs & Trackers` for the current week to ensure data freshness
- **Post‑review:** Use the generated review to:
  - Generate next week's tasklist using the Tasklist Generation pattern
  - Adjust session planning based on lessons learned
  - Feed insights into the Cycle Review at end of the 7‑week cycle
- **Rhythm:** Saturday ritual — matches AI‑Suplex's Saturday B‑Bomb Day schedule

## 🎯 Special Scenarios

### Partial Week Review
If the week is still in progress (e.g., mid‑week check):
- Specify in Strategic Context: "This is a mid‑week pulse check"
- The AI will note incomplete data and project forward

### Light Week
If few sessions were run (e.g., holiday, illness):
- Specify in Strategic Context: "This was a reduced‑capacity week"
- The AI will focus on quality over quantity and note the gap

### Launch Week
During product launch or high‑stakes weeks:
- Emphasize momentum and shipping milestones
- Track burnout risk and recommend recovery

**TWABAM ⚡!** This pattern transforms a week of sessions into a strategic compass for the next seven days. Run it every Saturday to keep momentum building and the system evolving.

---

---
#### Sources
[^1]: [[Orchestrator – Weekly Review]]
[^2]: [[AI‑Suplex Methodology – 7‑7‑7 Edition]]
[^3]: [[Orchestrator – Cycle Review]] (for cycle‑level reference)
