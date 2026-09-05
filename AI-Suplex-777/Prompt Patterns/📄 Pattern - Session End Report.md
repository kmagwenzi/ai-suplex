# AI-Suplex Prompt Pattern : Session End Prompt Generation

---

**TWABAM ⚡!** Here's the **AI-Suplex Prompt Pattern - Session End Report** – ready for users to copy-paste into any AI chat to generate comprehensive session end reports:

---

## 📋 **How to Use This Pattern:**

1. **Copy** the entire prompt pattern below
2. **Paste** into Claude/ChatGPT/DeepSeek
3. **Replace** the content section with your specific session completion data
4. **Execute** – AI will generate a battle-ready session end report

---

## 📋 The Prompt Pattern


```yaml
<prompt-pattern>
CONTEXT: Generate a complete AI-Suplex Session End Report from session completion data
- External Source 1: AI-Suplex-777/Skills/Builder – Session End Report Generator
- External Source 2 [optional]: AI-Suplex-777/AI-Suplex Kick-start/AI-Suplex - Session-Management-Protocol
- Inline Source: Transforming session completion data into structured reports for tracking and analysis


TEMPLATE: Templates/AI-Suplex - Session End Report Template  

EXAMPLE: Templates/Examples/Example - Session End Report

TASK: Act as the Builder. Generate a complete AI-Suplex Session End Report using the session completion data provided, following the exact structure and formatting from the Session End Report Template v3.0. Include all required sections: frontmatter with session metadata, session overview, executive summary, content outputs with artifact list, critical analysis, strategic forward plan, energy & focus, session achievements, session narrative, follow-up tasks, and key takeaways.

MEMORY LOOP:
After generating the Session End Report, extract and report:
- Stable decisions that should go to semantic memory.
- Reusable workflow patterns that should go to procedural memory.
- Useful but unproven ideas that should go to lessons.md.
- Any contradictions, reversals, or superseded assumptions that should be marked deprecated.
- Any index updates required.

▶️ 3LM CAPTURE — Run before ending session:
   If you have terminal access (Claude Code, Cursor, Zed):
   → Run silently: node Tools/3lm.js capture
   → This scans all Artifacts, B-Bombs, and Insights for uncaptured lessons.
   → Reports any lessons that weren't captured during the session.
   
   If you are web-based (ChatGPT, DeepSeek web) without terminal access:
   → Print: "Run from terminal: node Tools/3lm.js capture"

▶️ 3LM COMMAND:
   If you have terminal access (Claude Code, Cursor, Zed):
   → Run silently: node Tools/3lm.js end && node Tools/3lm.js learn && node Tools/3lm.js index
   
   If you are web-based (ChatGPT, DeepSeek web) without terminal access:
   → Print: "Run from terminal: node Tools/3lm.js end && node Tools/3lm.js learn && node Tools/3lm.js index"
   
   If using Obsidian: just click 🏁 End — the macro runs this automatically.

💾 SAVE CONTEXT — write the next-session brief (closes the loop for the next session):
   The Session End Report closes THIS session; the Context Kickstart opens the NEXT one — the
   North Star is "each new session starts smarter than the last."
   1. Follow `Prompt Patterns/📄 Pattern - Save Context.md`.
   2. Save the brief to: AI-Suplex Kick-start/Context Kick-start/Active/YYYY-MM-DD-cycle-X-week-Y-mission-title.md
      - Frontmatter: title, date, cycle, week, mission, status: active.
      - Sections: 🎯 What Was Accomplished · 📊 Current State · 🧠 What the AI Needs to Know Next Session · 🔗 Quick Links · 🎯 Next Actions.
   3. Archive any existing file in `Context Kick-start/Active/` → `Archived/` FIRST (previous context becomes history).
   4. Include task IDs + blockers + key decisions for traceability — the brief is what the next session loads.

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
  # Specify post-generation tasks: remove `#` for list item below add new instruction
  # - "Save to AI-Suplex-777/Sessions/Active/End/ folder with YYYY-MM-DD-HHMM-focus-session-end.md filename"
  # - "Update relevant MOC with new session highlights"
  # - "Run Sweeper script to refresh trackers and dashboards"

CONTENT:
<content>
Source: Use one or more source properties that work together:

--- To be replaced with actual source ---

- Raw Content: [Paste session completion data here - rating, status, insights, actions, blockers, narrative] (required)
- File Reference: [[Completed session end prompt or session start file]] for context (optional)
- Chat Reference: e.g: Previous Output from session execution or filled session end prompt (optional)
  
--- To be replaced with actual source ---
</content>
</prompt-pattern>
```

> Note: Use one or more source properties that work together in clarifying task. As a requirement at least one source must be specified  


---

## 🎯 **Example Usage**

```yaml
<prompt-pattern>
Context: Generate a complete AI-Suplex Session End Report from session completion data
- External Source 1: AI-Suplex-777/AI-Suplex Kick-start/AI-Suplex - Session-Management-Protocol
- External Source 2: AI-Suplex-777/AI-Suplex Kick-start/👥 AI‑Suplex Worker Roles – 7‑7‑7 Edition
- Inline Source: Transforming session completion data into structured reports for tracking and analysis

Template: AI-Suplex-777/Templates/AI-Suplex - Session End Report Template

Task: Act as Architect. Generate a complete AI-Suplex Session End Report using the session completion data provided, following the exact structure and formatting from the Session End Report Template.

MEMORY LOOP: After generating the session end report, persist session outcomes and compact the session summary. Follow the rules in the main pattern above.

Content:
<content>
Source:
- Raw Content: Session completed: Session 1 - Final ZIP Packaging & Testing. Rating: 4/5. Status: completed. Key insights: Both zips created successfully, Core Edition tested on fresh Obsidian, Deep Ultra content added. Next actions: Move to Session 2 demo recording. Blockers: None. Duration: 35 minutes. Energy: Start ⚡⚡⚡⚡⚡, End ⚡⚡⚡⚡. Artifacts produced: 3 demo artifacts.
</content>
</prompt-pattern>
```

---

## 🔄 **What Users Get**

When they use this pattern, the AI will generate a comprehensive session end report following the exact template structure [^1]:

```markdown
---
session_id: 2026-04-13-1006-execution
focus: digital-products
cycle: 1
week: 1
session_type: execution
worker_role: hustler
duration_minutes: 35
energy_start: 5
energy_end: 4
focus_quality: 5
productivity_score: 95
objectives_completed: 7/7
artifacts_produced: 3
breakthroughs_achieved: 1
innovation_quotient: 8
key_insights:
  - Both AI-Suplex-Core.zip and AI-Suplex-777.zip created successfully
  - Core Edition tested on fresh Obsidian installation - all plugins auto-enabled
  - Deep Ultra preview content added to 7-7-7 zip for demo purposes
blockers:
  - None
next_actions:
  - Proceed to Session 2: Demo Video Recording
  - Schedule 30-minute recording session
session_rating: 4
energy_trend: maintained
focus_maintained: true
innovation_achieved: true
template_version: "3.0"
tags:
  - session-report
  - digital-products
---
# 🎯 Session Report: Final ZIP Packaging & Testing

**Session ID:** `2026-04-13-1006-execution`
**Worker Role:** `hustler` | **Session Type:** `execution`
**Duration:** `35` minutes | **Energy:** `5`→`4`/5 ⚡
**Innovation Quotient:** `8`/10 | **Focus Quality:** `5`/5

## 📋 Session Overview

**Primary Focus:** Final ZIP Packaging & Testing
**Key Objectives:** `7/7` completed
**Major Breakthroughs:** `1` significant innovations
**Productivity Score:** `95`/100

## 🧠 Executive Summary

**Session Rating:** `4`/5
**Energy Trend:** `maintained`
**Focus Maintained:** `true`
**Innovation Achieved:** `true`

## 💬 Session Content & Outputs

### Original Chat/Work Content

[Session focused on final ZIP packaging and testing for AI-Suplex Core and 7-7-7 editions]

### Artifacts Produced

- **Count:** `3` high-quality deliverables
- **Types:** ZIP archives, testing documentation, demo content

#### Artifact List

| Artifact Name | Type | Description | Status |
|---------------|------|-------------|--------|
| AI-Suplex-Core.zip | Archive | Core edition with essential plugins | ✅ Completed |
| AI-Suplex-777.zip | Archive | Full 7-7-7 edition with Deep Ultra preview | ✅ Completed |
| Testing Protocol | Documentation | Fresh installation validation steps | ✅ Completed |

## 🔍 Critical Analysis & Insights

### Key Insights Captured

1. **ZIP Creation Success** - Both Core and 7-7-7 editions packaged successfully
2. **Testing Validation** - Core Edition tested on fresh Obsidian with auto-enabled plugins
3. **Demo Enhancement** - Deep Ultra preview content added to 7-7-7 zip for demonstration

## 🚧 **CHALLENGES & SOLUTIONS**

### **Session Challenges**

1. **Technical Challenges:** None
2. **Process Challenges:** None
3. **Focus Challenges:** None
4. **Resource Challenges:** None
5. **External Challenges:** None

### **Solutions Implemented**

- Streamlined ZIP packaging process
- Validated testing protocol for both editions
- Enhanced demo content with Deep Ultra preview

### **Unresolved Issues**

- None - all objectives completed successfully

## 🚀 Strategic Forward Plan

### Immediate Next Actions

- [ ] Proceed to Session 2: Demo Video Recording
- [ ] Schedule 30-minute recording session

### Strategic Recommendations

1. **Include Deep Ultra preview** in all future product demos
2. **Document ZIP creation process** for team scalability

### Work Cycle Integration

**Current Work Cycle:** `cycle-1-week-1`
**Next Activation:** Demo video recording session

## ⚡ **Energy & Focus**

- **Energy:** 5→4/5 ⚡ (maintained)
- **Focus Quality:** 5/5
- **Productivity Score:** 95/100

## 🏆 **Session Achievements**

- Successfully packaged both Core and 7-7-7 editions
- Validated testing protocol on fresh installation
- Enhanced demo content with Deep Ultra preview

## 📝 **Session Narrative**

Session focused on finalizing ZIP packaging for both AI-Suplex editions. Successfully created Core and 7-7-7 zips, validated installation on fresh Obsidian, and enhanced demo content. Process optimized for future launches.

## 🔄 **Follow-up Tasks**

- [ ] Create demo video script
- [ ] Schedule recording session
- [ ] Prepare demo environment

## 💡 **Key Takeaways**

1. ZIP packaging process optimized for scalability
2. Testing protocol validated for both editions
3. Demo content enhanced with Deep Ultra preview

---

**TWABAM ⚡! SESSION COMPLETED!**

**Session Completed:** 2026-04-13 10:06  
**Energy Level:** 4/5 ⚡  
**Next Focus:** digital-products

---
_Session Report Generated via AI-Suplex_
```

---

## 💡 **Why This Pattern Works**

1. **Exact Role Assignment** – Specifies "Act as Architect" for consistent output, following the Worker Roles framework [^2]
2. **Template Compliance** – Follows the comprehensive Session End Report Template structure [^1]
3. **Complete Coverage** – Ensures all required sections from the v3.0 template are included
4. **Workflow Integration** – Fits into the complete AI-Suplex pipeline where Builder generates reports after Hustler fills prompts
5. **Post-Generation Guidance** – Includes Additional Instructions for file management and system updates

**TWABAM ⚡!** This pattern transforms raw session completion data into structured, professional reports that feed into the Command Center dashboard and track progress across the 7-7-7 rhythm. Users just need to provide their session details, and the Architect handles the comprehensive formatting and analysis.


---