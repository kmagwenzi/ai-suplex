# AI-Suplex Prompt Pattern: Weekly Plan Generation

**TWABAM ⚡!** Here is the complete **Prompt Pattern for Weekly Plan Generation**, formatted for immediate use.

---

## 📋 How to Use This Pattern

1. **Review** your cycle plan — understand where you are in the 7-week arc.
2. **Scan** pending tasks from active tasklists and next actions from recent session ends.
3. **Copy** the entire `<prompt-pattern>` block below.
4. **Paste** into your AI assistant (Claude, ChatGPT, DeepSeek, etc.).
5. **Replace** the `Source` section under `CONTENT:` with your actual cycle context, pending tasks, and constraints.
6. **Execute**. The AI, acting as the **Orchestrator**, generates a complete week-by-week execution plan.
7. **Review** the plan in chat, then save it to the vault.

---

## 📋 The Prompt Pattern

```yaml
<prompt-pattern>
CONTEXT: Generate a tactical weekly plan from cycle strategy, pending tasks, next actions, and focus priorities
- External Source 1: AI-Suplex-777/Skills/Orchestrator – Weekly Plan Generator
- External Source 2 [optional]: AI-Suplex-777/Plans/Cycle X Plan.md (current cycle plan)
- Inline Source: Translating strategic cycle objectives into day-by-day execution blocks

EXAMPLE: AI-Suplex-777/Templates/Examples/Example - Weekly Plan
TEMPLATE: AI-Suplex-777/Templates/AI-Suplex - Weekly Plan Template

TASK: Act as Orchestrator. Generate a complete weekly plan using the raw input provided, following the exact structure and formatting from the template and example. Include a weekly mission, priority tasks by focus, daily breakdown (Mon–Sun), energy map, and success metrics. Respect locked days and energy patterns. Output the plan in chat for Hustler review, then offer to save.

MEMORY LOOP:
After generating the Weekly Plan, extract and report:
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
ADDITIONAL INSTRUCTIONS:
- Save file in AI-Suplex-777/Plans/Weekly/ folder
- Name file as: Week X Plan.md (replace X with week number, e.g., Week 1 Plan.md)
- After saving, offer to generate daily session start prompts using the Session Start Prompt Generation pattern
- Respect locked days (e.g., Monday Hustle Days, rest days) — do not schedule work on them

CONTENT:
<content>
Source:
|--- Replace with actual source ---
- Cycle: [Cycle number]
- Week: [Week number]
- Period: [Start date] to [End date] (e.g., "Jun 23 to Jun 28")
- Cycle Mission: [One-line cycle mission from Cycle Plan]
- Pending Tasks: [Key incomplete tasks from active tasklists — include task IDs and focus areas]
- Next Actions: [Items from recent session end next_actions fields]
- Focus Priorities: [Ordered focus areas for this week, e.g., "1. WQR Ship, 2. AI-Eng, 3. Content"]
- Locked Days: [Days that are blocked, e.g., "Monday — family bulk water business"]
- Energy Notes: [Energy constraints, e.g., "Post-launch recovery, moderate energy Tue–Thu"]
- Strategic Goals: [2–3 key objectives this week must serve]
|--- Replace with actual source ---
</content>
</prompt-pattern>
```

> **Note:** The `External Source 1` link references the Weekly Plan Generator skill for methodology. If a cycle plan exists, include it as `External Source 2` so the weekly plan aligns with the cycle's strategic arc.

---

## 🎯 Example Usage

```yaml
<prompt-pattern>
CONTEXT: Generate a tactical weekly plan from cycle strategy, pending tasks, next actions, and focus priorities
- External Source 1: AI-Suplex-777/Skills/Orchestrator – Weekly Plan Generator
- External Source 2: AI-Suplex-777/Plans/Cycle 1 Plan.md
- Inline Source: Translating strategic cycle objectives into day-by-day execution blocks

EXAMPLE: AI-Suplex-777/Templates/Examples/Example - Weekly Plan
TEMPLATE: AI-Suplex-777/Templates/AI-Suplex - Weekly Plan Template

TASK: Act as Orchestrator. Generate a complete weekly plan using the raw input provided, following the exact structure and formatting from the template and example. Include a weekly mission, priority tasks by focus, daily breakdown (Tue–Sun), energy map, and success metrics. Respect locked days and energy patterns. Output the plan in chat for Hustler review, then offer to save.
ADDITIONAL INSTRUCTIONS:
- Save file in AI-Suplex-777/Plans/Weekly/ folder as Week 1 Plan.md
- After saving, offer to generate daily session start prompts using the Session Start Prompt Generation pattern
- Monday (Jun 22) is LOCKED — family bulk water business, no work scheduled

CONTENT:
<content>
Source:
- Cycle: "Cycle 1"
- Week: "Week 1"
- Period: "Tue Jun 23 to Sun Jun 28"
- Cycle Mission: "Launch AI-Suplex publicly. Build Agent Terminal as a portfolio weapon. Ship WQR 2.0 to real clients. Land first freelance revenue."
- Pending Tasks:
  - WQR: Twilio number integration + Google Drive OAuth
  - WQR: Oracle deploy + final E2E tests
  - AI-Eng: DeepSeek vs OpenAI comparison study
  - AI-Eng: Build 5 WQR prompt templates
  - Content: WQR build-in-public thread
  - B-Bomb Day: 3lm promote --min 70, archive artifacts
- Next Actions:
  - "Test WhatsApp FAQ endpoint after Twilio number is verified"
  - "Run 3lm learn before Sat B-Bomb Day"
- Focus Priorities:
  1. WQR SHIP IT (Oracle deploy, final tests)
  2. AI-Engineering (comparison study, prompt templates)
  3. Content (build-in-public, architecture deep-dive, weekly recap)
  4. B-Bomb Day (promote, archive)
- Locked Days:
  - Monday — family bulk water business
- Energy Notes: "Launch week momentum. High energy Tue–Wed, moderate Thu–Fri, variable Sat. Sunday rest."
- Strategic Goals:
  1. WQR 2.0 live on Oracle, FAQ answering via WhatsApp
  2. AI-Eng Week 1 module + B-Bomb captured
  3. 3+ content posts published
</content>
</prompt-pattern>
```

---

## 🔄 What the User Gets

When this pattern is used, the AI (acting as Orchestrator) will generate a complete weekly plan matching the exact format of the Template. This includes:

* **🎯 Weekly Mission** — One-sentence mission that defines what the week must accomplish.
* **📋 Priority Tasks (By Focus)** — Table mapping each focus area to its top tasks, estimated hours, and status.
* **📅 Daily Breakdown (Mon–Sun)** — Per-day schedule with AM/PM/Evening blocks, focus assignment, and specific checkboxes.
* **⚡ Energy Map** — Day-by-day energy level with notes on what each energy level is best for.
* **📊 Success Metrics** — 3–5 clear yes/no outcomes that answer "Did the week succeed?"
* **🔗 Quick Links** — Navigation to Command Center, Tasklists, Focuses, and Cycle Plan.
* **🔄 Memory Loop** — Stable decisions and lessons extracted for 3lm promotion.

---

## 💡 Why This Pattern Works

1. **Tactical, Not Strategic:** While the Cycle Plan covers 7 weeks at altitude, this pattern puts boots on the ground — day by day, task by task.
2. **Energy-Aware:** Patterns respect peak/off hours, locked days, and rest blocks — preventing the all-too-common "crash by Friday."
3. **Integrates Upstream:** Directly pulls from the cycle plan for strategic alignment, from tasklists for pending work, and from session ends for next actions.
4. **Locked Day Respect:** Built-in support for Monday Hustle Days or other recurring blocks — no scheduling conflicts.
5. **B-Bomb Day Ready:** Saturday is automatically treated as promotion + archive day, linking into the 3lm memory loop.

---

## 🔗 Integration Points

| Stage               | Action                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| **Pre-requisite**   | Cycle Plan must exist — the weekly plan executes the cycle, not replaces it                       |
| **Pre-generation**  | Scan active tasklists + most recent session end files for next actions                            |
| **Post-generation** | Save file to `AI-Suplex-777/Plans/Weekly/Week X Plan.md`                                          |
| **Daily execution** | Use each day's breakdown as input to the [[📄 Pattern - Session Start Prompt Generation]] pattern |
| **End of week**     | Feed outcomes into the [[📄 Pattern - Weekly Review Generation]] pattern                          |
| **3lm**             | Weekly planning decisions extracted via MEMORY LOOP — run 3lm promote to persist                  |

---

## 🎯 Special Scenarios

### Launch Week
- Energy levels will run high — still enforce a recovery day after launch
- Daily breakdown should include monitoring/response blocks, not just execution tasks
- Reduce AI-Eng to minimum — launch logistics take priority

### Low-Energy Week
- Cut daily blocks to 1 focus maximum per day
- Extend the week to cover 7 days lighter instead of 5 days packed
- Success metrics should emphasize "showed up" over "shipped"

### Week After Locked Days (Post-Monday Hustle)
- Tuesday morning should be a gentle ramp-up, not a crushing catch-up
- Use the PM block for high-priority items, not the AM

### Holiday Week
- Reduce daily hours to 3–4 max
- Accept that success metrics may be 50% of normal
- Prioritize maintenance over new work

---

## 🧠 Relationship to the Cycle Plan

The Weekly Plan **executes** the Cycle Plan. It doesn't replace it.

| Aspect | Cycle Plan | Weekly Plan |
|--------|-----------|-------------|
| **Horizon** | 7 weeks | 1 week |
| **Granularity** | Day-level by focus | AM/PM/Evening blocks per day |
| **Input** | Strategic goals, resource constraints | Pending tasks, next actions, session ends |
| **Output** | Phase structure, weekly objectives | Daily breakdown, task assignments |
| **Energy** | High-level allocation | Day-by-day energy map |

---

---

**TWABAM ⚡!** This pattern turns your cycle strategy into daily execution. Plan the week, work the plan. 🦸💣

---

#### Sources
[^1]: [[Orchestrator – Weekly Plan Generator]]
[^2]: [[AI-Suplex - Weekly Plan Template]]
[^3]: [[Example - Weekly Plan]]
[^4]: [[📄 Pattern - Cycle Plan Generation]] (parent pattern)
[^5]: [[📄 Pattern - Session Start Prompt Generation]] (downstream pattern)
