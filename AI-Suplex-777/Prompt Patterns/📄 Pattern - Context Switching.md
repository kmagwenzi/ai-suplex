---
title: "Pattern - Context Switching"
date: 2026-06-22
tags: [pattern, context-switching, builder, memory]
---

<prompt-pattern>
  <meta>
    <name>Context Switching</name>
    <version>1.0</version>
    <author>AI-Suplex</author>
    <role>Builder</role>
    <skill>Builder – Context Switching</skill>
  </meta>

  <description>
    Summarize the current session context, save it for the next session, and archive the previous context. This ensures no knowledge is lost when switching between chat windows or sessions.
  </description>

  <usage>
    Copy this pattern into your AI chat when you want to:
    - Switch to a new chat window
    - End your current work session
    - Save progress before taking a break
    - Ensure the next session picks up where you left off
  </usage>

  <prompt>
    <source>
      ## Current Session Context

      **Date:** [YYYY-MM-DD]
      **Cycle:** [X]
      **Week:** [Y]
      **Mission:** [Current mission/task]

      ### What I Accomplished This Session:
      - [Task 1 with Task ID]
      - [Task 2 with Task ID]
      - [Task 3 with Task ID]

      ### Current State:
      - Tasks completed: [X/Y]
      - Current phase: [Phase name]
      - Blockers: [Any blockers or None]

      ### Key Decisions Made:
      - [Decision 1]
      - [Decision 2]

      ### Files Created/Modified:
      - [File path 1]
      - [File path 2]
    </source>

    <task>
      Generate a Context Summary following the AI-Suplex Context Switching protocol:

      1. Create a context summary file with proper frontmatter
      2. Save to: `AI-Suplex Kick-start/Context Kick-start/Active/YYYY-MM-DD-cycle-X-week-Y-mission-title.md`
      3. Archive any existing file in Active/ to Archived/
      4. Confirm the save and archive operations

      Use this template for the context summary:

      ```markdown
      ---
      title: "Context Kickstart — Cycle X Week Y"
      date: YYYY-MM-DD
      cycle: X
      week: Y
      mission: "Mission Title"
      status: active
      ---

      # 🦸 Context Kickstart — Cycle X Week Y

      > **Generated:** [Date Time]
      > **Session:** [Session description]

      ---

      ## 🎯 What Was Accomplished

      [List completed tasks with IDs]

      ---

      ## 📊 Current State

      | Metric | Status |
      |--------|--------|
      | Tasks Completed | X/Y |
      | Session Phase | [current phase] |
      | Blockers | [any blockers] |

      ---

      ## 🧠 What the AI Needs to Know Next Session

      1. [Key context point 1]
      2. [Key context point 2]
      3. [Key context point 3]

      ---

      ## 🔗 Quick Links

      | Resource | Location |
      |----------|----------|
      | Tasklist | `Tasklists/Active/[filename].md` |
      | Session Start | `Sessions/Active/Start/[filename].md` |

      ---

      ## 🎯 Next Actions

      1. [Immediate next task]
      2. [Upcoming tasks]

      ---

      *Context generated via AI-Suplex on YYYY-MM-DD*
      ```
    </task>

    <example>
      **Input:**
      ```
      Date: 2026-06-22
      Cycle: 1
      Week: 1
      Mission: Pipeline Documentation
      Completed: T019-B (IBM Module 1), T020-B (Capture notes)
      Current: Module 2 starting
      Blockers: None
      ```

      **Output:** Context saved to `2026-06-22-cycle-1-week-1-pipeline-docs.md`
      Old context archived.
      Next session will know: "IBM Module 1 complete, Module 2 next."
    </example>
  </prompt>

  <memory-loop>
    After executing this pattern:
    1. Run `node Tools/3lm.js end` (if ending session)
    2. Run `node Tools/3lm.js learn` (extract lessons)
    3. Log the context switch in today's episode
  </memory-loop>

  <additional-instructions>
    - Always use the correct filename format: `YYYY-MM-DD-cycle-x-week-y-mission-title.md`
    - Always archive the previous Active context before saving new one
    - Include all task IDs in the summary for traceability
    - Keep "What AI Needs to Know" section concise but complete
  </additional-instructions>
</prompt-pattern>
