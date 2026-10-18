---
TEMPLATE:
Completion_Phrase: "AI-Suplex: Session End"
Parameters_Optional:
  - Main Worker: "Hustler/Ochastrator/Architect/Builder/Sweeper"
  - Session_Rating: "1–5 (1=poor, 5=excellent)"
  - Completion_Status: "[completed, partial, blocked]"
  - Key_Insights:
      - "Insight 1 (what did you learn?)"
      - "Insight 2"
  - Next_Actions:
      - "Action 1 (immediate follow‑up)"
      - "Action 2"
  - Future Strategy
    - Strategy 1
    - Strategy 2
  - Blockers:
      - "Blocker 1 (if any)"
  - Session_Narrative: "Optional, free‑text summary"
   
Response_Protocol:AI-Suplex
  - "Generate a session end report in AI-Suplex/Sessions/Active/End/"
  - "Include frontmatter with date, time, rating, status, insights, next actions, blockers"
  - "Append key insights and next actions to the report body"
  - "Open the file for editing"
  - "Update Command Center dashboard (via Dataview queries)"
---
_End sequence to report generation via AI-Suplex on {{DATE:YYYY-MM-DD}}*_


EXAMPLE:
  AI-Suplex: Session End
  Session_Rating: 4
  Completion_Status: partial
  Key_Insights:
    - "Webhook worked after removing 'whatsapp:' prefix"
  Next_Actions:
    - "Test payment flow tomorrow"
  Blockers:
    - "Waiting for Oracle support to respond"
  Session_Narrative: "Spent most of the time troubleshooting the webhook. Found the fix near the end."
---
