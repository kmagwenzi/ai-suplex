---
skill_name: "Orchestrator – Weekly Plan Generator"
role: "Orchestrator"
version: "1.0"
date: 2026-05-13
tags: [skill, orchestrator, weekly-plan, planning, ai-suplex]
---

# Orchestrator Skill: Weekly Plan Generator

## 🎯 Purpose

Generate a **structured weekly plan** from pending tasks, next actions, focus areas, and strategic goals. The plan provides a day-by-day execution roadmap that respects the Hustler's energy patterns and ensures every focus area gets meaningful time.

Unlike the Cycle Plan (which sets 7-week strategy), this skill produces a **tactical week-level blueprint** — turning strategic objectives into daily action blocks. The output integrates with session start prompts, tasklists, and the weekly review.

---

## 📥 Input

The Hustler provides (or the Orchestrator gathers from vault data):

| Input | Required | Source |
|-------|----------|--------|
| **Cycle Number** | ✅ | Current cycle context |
| **Week Number** | ✅ | Current week |
| **Week Period Dates** | ✅ | Monday–Sunday date range |
| **Pending Task IDs** | ✅ | From active tasklists (`Tasklists/`) |
| **Next Actions** | ✅ | From recent session end files (`Sessions/Active/End/`) |
| **Focus Priorities** | ✅ | From `Focuses.md` and current strategic context |
| **Strategic Goals** | ❌ | From cycle plan or Hustler's stated objectives |
| **Known Constraints** | ❌ | Appointments, travel, energy limitations |
| **Previous Week Lessons** | ❌ | From last week's review or session ends |

---

## 📤 Output

A markdown document saved to `AI-Suplex-777/Plans/Weekly/Week X Plan.md` with the following structure:

```markdown
# Weekly Plan – Cycle X, Week Y

**Period:** Start → End
**Generated:** Timestamp

## 🎯 Weekly Mission
One-sentence mission statement.

## 📋 Priority Tasks (By Focus)
| Focus | Priority Tasks | Est. Hours |
|-------|---------------|------------|

## 📅 Daily Breakdown
### Monday (date)
- **AM:** Focus — tasks
- **PM:** Focus — tasks
### Tuesday (date)
...

## ⚡ Energy Management
- High-energy blocks
- Low-energy blocks
- Breaks/recovery

## 📊 Success Metrics
- [ ] Metric 1
- [ ] Metric 2
- [ ] Metric 3

## 🔗 Quick Links
- [[Command Center]]
- [[Tasklists/]]
- [[Focuses]]
```

---

## 🧠 Workflow Instructions

When the Hustler says *"Orchestrator, generate a weekly plan for Cycle X, Week Y"* (or similar), follow these steps:

### 1. Determine Cycle and Week
- If the Hustler provides cycle and week numbers, use those.
- If only a period is given, infer cycle/week from the date.
- If nothing is given, ask the Hustler for the current cycle/week.
- Confirm the Monday–Sunday date range for the week.

### 2. Scan Pending Tasks from Tasklists
- Read active tasklists in `AI-Suplex-777/Tasklists/`.
- Identify incomplete tasks (marked `[ ]` or `[DEFERRED]`).
- Note their focus area (from the tasklist frontmatter or task context).
- Prioritise tasks by deadline and strategic importance.

### 3. Collect Next Actions from Recent Session Ends
- Scan `AI-Suplex-777/Sessions/Active/End/` for the most recent session end files.
- Extract all items from `next_actions` frontmatter fields.
- Cross-reference with pending tasks — deduplicate and consolidate.
- If available, run `Sweeper – Extract Next Steps` to automate this collection (the user runs it, you advise).

### 4. Review Focus Area Priorities
- Read `AI-Suplex-777/Focuses.md` for the defined focus areas.
- Consult the cycle plan (if one exists) for strategic priorities.
- Rank focus areas for the upcoming week based on:
  - Urgent deadlines (launches, client delivery)
  - Strategic importance (cycle objectives)
  - Carry-over from unfinished previous week work
  - Energy alignment (don't put 3 heavy focuses in one week)

### 5. Generate Daily Breakdown (Monday–Sunday)
- Allocate focus areas to specific days.
- Apply the **60/40 rule** as a starting point: 60% deep execution work, 40% lighter/admin/planning work.
- **Never** schedule the same heavy focus for 5 days straight — alternate or use morning/afternoon splits.
- Respect energy patterns:
  - **High-energy days** (typically Mon–Wed mornings): Deep work, launches, complex tasks
  - **Low-energy days** (typically Fri afternoon, weekend): Admin, review, rest
- Include at least one rest or recovery block (Saturday PM or Sunday).
- For each day, specify:
  - **AM block** (primary focus + tasks)
  - **PM block** (secondary focus + tasks)
- Add notes for Save Context, hard stops, or special events.

### 6. Define Success Metrics
- 3–5 measurable outcomes for the week.
- Each metric should answer "Did the week succeed?" with a clear yes/no.
- Examples: "Core + 7-7-7 live on Gumroad", "3 INFILTRATION posts published", "WQR ngrok tunnel operational".

### 7. Output the Weekly Plan
- Present the full plan in chat.
- Offer to save to `AI-Suplex-777/Plans/Weekly/Week X Plan.md`.
- Persist planning decisions to CortexMem.

---

## ⚡ Energy Management Principles

| Energy Level | Best For | Example Tasks |
|---|---|---|
| 5 (Peak) | Deep work, launches, complex dev | Product packaging, writing, coding, architecture decisions |
| 4 (High) | Execution, integrations | Testing, deployment, content creation, integrations |
| 3 (Moderate) | Standard tasks | Admin, reviews, documentation, planning |
| 2 (Low) | Light work | Emails, reading, organizing, small fixes |
| 1 (Rest) | Recovery | No work, rest, family, hobbies |

**Hard Rules:**
- Never schedule two consecutive days at energy level 5. The Hustler burns out.
- Max one heavy launch day per week.
- After a launch day → schedule a lighter recovery day.
- Saturday PM and Sunday are rest by default — only schedule work if explicitly agreed.

---

## 🔗 Integration Points

| Integration | When |
|---|---|
| **Sweeper – Extract Next Steps** | Run before this skill to gather all pending next actions across session ends |
| **Tasklist Generation** | After the plan is approved, generate detailed tasklists for each day |
| **Session Start Prompts** | Use the daily breakdown to generate precise session start prompts |
| **Weekly Review** | At week's end, compare actual output vs plan to feed the review |
| **Cycle Plan** | The weekly plan should directly support the cycle's strategic objectives |
| **CortexMem** | Save weekly planning decisions: `node cm save_context --context_type decision --content "Weekly Plan: Cycle X/Week Y | Focus: <primary> | Priority: <top-3>"` |

---

## ✅ Quality Checklist

- [ ] Priorities align with cycle goals and focus area rankings
- [ ] Time allocation is realistic (not overbooked — max 6–8h productive time/day)
- [ ] Each focus area has clear, actionable deliverables
- [ ] Energy management is considered (peak hours for deep work, rest blocks included)
- [ ] Success metrics are specific and measurable (not "do better" — "3 posts published")
- [ ] Daily breakdown covers all weekdays (Mon–Fri at minimum)
- [ ] At least one rest or recovery block is included (Sat PM or Sun)
- [ ] Next actions from recent session ends are incorporated
- [ ] Pending tasks from active tasklists are accounted for
- [ ] The plan fits within the broader cycle strategy

---

## ⚠️ Common Mistakes to Avoid

| Mistake | Why It Fails | Fix |
|---|---|---|
| Overloading Monday | Burnout before midweek | Start strong but not crushing — ease into the week |
| Ignoring energy patterns | 3pm deep work fails | Schedule creative work for peak hours, admin for low energy |
| Same focus every day | Save Context fatigue | Max 2 foci per day, alternate across the week |
| No rest block | Crash by Friday | Schedule at least a half-day of rest |
| Vague tasks | Hard to execute | Every task should be actionable ("Fix Oracle block" not "Work on WQR") |
| Ignoring session end next actions | Recurring incompletes | Always scan session ends before planning |

---

**TWABAM ⚡!** A great weekly plan turns strategy into daily execution. Plan the week, work the plan. 🦸💣
