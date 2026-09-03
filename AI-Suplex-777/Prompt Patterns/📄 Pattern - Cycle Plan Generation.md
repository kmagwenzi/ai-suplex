# AI-Suplex Prompt Pattern: Cycle Plan Generation

**TWABAM ⚡!** Here is the complete **Prompt Pattern for Cycle Plan Generation**, formatted for immediate use.

---

## 📋 How to Use This Pattern

1. **Review** your previous cycle — run `Sweeper – Generate Cycle Review` if available (skip for inaugural cycle).
2. **Define** your strategic goals for the upcoming 7-week cycle.
3. **Copy** the entire `<prompt-pattern>` block below.
4. **Paste** into your AI assistant (Claude, ChatGPT, DeepSeek, etc.).
5. **Replace** the `Source` section under `CONTENT:` with your actual goals and constraints.
6. **Execute**. The AI, acting as the **Orchestrator**, generates a complete 7-week strategic cycle plan.

---

## 📋 The Prompt Pattern

```yaml
<prompt-pattern>
CONTEXT: Generate a strategic 7-week cycle plan from strategic goals, focus priorities, and previous cycle data
- External Source 1: AI-Suplex-777/Skills/Orchestrator – Cycle Plan Generator
- External Source 2 [optional]: AI-Suplex-777/Skills/Orchestrator – Cycle Review
- Inline Source: Transforming strategic goals into a 7-week execution roadmap

EXAMPLE: AI-Suplex-777/Templates/Examples/Example - Cycle Plan
TEMPLATE: AI-Suplex-777/Templates/AI-Suplex - Cycle Plan Template

TASK: Act as Orchestrator. Generate a complete 7-week cycle plan using the raw input provided, following the exact structure and formatting from the example. Include cycle structure (4 phases), week-by-week breakdown (Weeks 1, 2–3, 4–5, 6–7), financial forecast table, and critical success factors. Output the plan in chat for Hustler review, then offer to save.

MEMORY LOOP:
After generating the Cycle Plan, extract and report:
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
- Save file in AI-Suplex-777/Plans/ folder
- Name file as: Cycle X Plan.md (replace X with cycle number)
- After saving, offer to generate a Week 1 tasklist using the Tasklist Generation pattern

CONTENT:
<content>
Source:
--- Replace with actual source ---
- Cycle: [Cycle number]
- Period: [Start date] to [End date]
- Strategic Theme: [Overarching goal, e.g., "AI-Suplex → Income → Audience → System Maturity"]
- Previous Cycle Review: [Link to review if available, or "N/A — inaugural cycle"]
- Strategic Goals: [Top 3-5 goals for this cycle]
- Focus Priorities: [Ordered list of focus areas, e.g., "1. AI Engineering, 2. WQR, 3. Freelance, 4. Digital Products, 5. Content Creation"]
- Resource Constraints: [Time, energy, budget limitations]
- Revenue Targets: [Financial goals if applicable]
- Known Constraints: [Travel, events, holidays, or other time blocks]
--- Replace with actual source ---
</content>
</prompt-pattern>
```

> **Note:** The `External Source` links reference the Cycle Plan Generator skill for methodology. If the previous cycle review exists, include it as `External Source 2` for continuity.

---

## 🎯 Example Usage

```yaml
<prompt-pattern>
CONTEXT: Generate a strategic 7-week cycle plan from strategic goals, focus priorities, and previous cycle data
- External Source 1: AI-Suplex-777/Skills/Orchestrator – Cycle Plan Generator
- External Source 2: AI-Suplex-777/Skills/Orchestrator – Cycle Review
- Inline Source: Transforming strategic goals into a 7-week execution roadmap

EXAMPLE: AI-Suplex-777/Templates/Examples/Example - Cycle Plan
TEMPLATE: AI-Suplex-777/Templates/AI-Suplex - Cycle Plan Template

TASK: Act as Orchestrator. Generate a complete 7-week cycle plan using the raw input provided, following the exact structure and formatting from the example. Include cycle structure (4 phases), week-by-week breakdown (Weeks 1, 2–3, 4–5, 6–7), financial forecast table, and critical success factors. Output the plan in chat for Hustler review, then offer to save.
ADDITIONAL INSTRUCTIONS:
- Save file in AI-Suplex-777/Plans/ folder as Cycle 2 Plan.md
- After saving, offer to generate a Week 1 tasklist using the Tasklist Generation pattern

CONTENT:
<content>
Source:
- Cycle: "Cycle 2"
- Period: "May 11 to June 27"
- Strategic Theme: "Revenue Acceleration — convert AI-Suplex system into consistent income"
- Previous Cycle Review: "[[Cycle 1 Review]] — Achieved $2,800 of $5,300 target (53%). Major lessons: under-estimated content lead time, WQR onboarding slower than expected"
- Strategic Goals:
  1. Generate $4,000–$6,000 combined revenue (Freelance + WQR + Digital Products)
  2. Establish WQR as primary recurring revenue stream (10+ paid subscribers)
  3. Grow digital products to $500–$1,000/month
  4. Build content engine producing 3+ pieces/week
- Focus Priorities:
  1. Freelance (revenue primary)
  2. WQR (recurring revenue build)
  3. Digital Products (passive income)
  4. Content Creation (audience growth)
  5. AI Engineering (system maintenance)
- Resource Constraints: "Available 4-5 hours/day weekdays, full weekends free. June 1-7 has reduced availability (family commitment)"
- Revenue Targets: "$4,000–$6,000 combined. Freelance: $2,500–$3,500. WQR: $1,000–$1,500. Digital Products: $500–$1,000"
- Known Constraints: "June 1-7 reduced hours. Week 6 is review + Cycle 3 planning"
</content>
</prompt-pattern>
```

---

## 🔄 What the User Gets

When this pattern is used, the AI (acting as Orchestrator) will generate a complete 7-week cycle plan matching the exact format of the Example. This includes:

* **🎯 Cycle Mission** — Strategic one-liner that defines the entire cycle
* **📊 Cycle Structure** — 4-phase table (Foundation → Launch → Acceleration → Scale) with focus areas and primary activities
* **🗓️ Week-by-Week Breakdown** — For each week/phase:
  - **Daily Split** — How focus areas are distributed across days
  - **Key Deliverables** — 5–10 actionable checklist items
  - **Success Metrics** — Measurable criteria with energy targets
* **📈 Financial Forecast** — Weekly income projection table by stream with cumulative target
* **⚡ Critical Success Factors** — 5–7 make-or-break factors for the cycle
* **🔗 Quick Links** — Navigation to Command Center, Focuses, Trackers

---

## 💡 Why This Pattern Works

1. **Strategic Horizon:** Covers 7 weeks, not 7 days — forces big-picture thinking.
2. **Phase-Based Structure:** Foundation → Launch → Acceleration → Scale mirrors real product/ business lifecycles.
3. **Financial Forecasting:** Builds revenue awareness from Week 1, even during zero-income phases.
4. **Energy Management:** Daily splits prevent context-hopping; energy targets prevent burnout.
5. **Template Consistency:** Output matches the `AI-Suplex - Cycle Plan Template` exactly, ready for Obsidian.
6. **3lm Memory Loop:** Cycle-level decisions persist through 3lm promote — feeding the next cycle's context.

---

## 🔗 Integration Points

| Stage | Action |
|-------|--------|
| **Pre-requisite** | Run `Sweeper – Generate Cycle Review` to close previous cycle (skip for Cycle 1) |
| **Post-generation** | Save file to `AI-Suplex-777/Plans/Cycle X Plan.md` |
| **Week 1 Tasklist** | Use the [[📄 Pattern - Tasklist Generation]] pattern to generate Week 1 tasks from the plan |
| **Session Planning** | Reference weekly deliverables when generating session start prompts |
| **3lm** | Cycle plan decisions routed via MEMORY LOOP in pattern — run 3lm promote to persist |
| **Command Center** | Add link to plan from Command Center for quick access |

---

## 🎯 Special Scenarios

### Inaugural Cycle (Cycle 1)
- No previous review needed — focus on system setup and foundation.
- Revenue forecasts will be conservative (zero income weeks 1–2).
- Emphasize system adoption as a success metric.

### Post-Product Launch Cycle
- Foundation phase may be shorter (skip system setup).
- Financial forecasts should reference existing MRR/product baselines.
- Scale phase may include hiring, outsourcing, or automation.

### Low-Energy Cycle
- Reduce daily splits to 1 focus area per day maximum.
- Extend Foundation phase to 2 weeks if needed.
- Lower revenue targets proportionally.

### Transition Cycle
- If switching focus areas entirely (e.g., moving from Freelance-heavy to Product-heavy):
  - Foundation phase includes system reconfiguration.
  - Financial forecast accounts for ramp-up time.
  - Success factors emphasize patience.

---

---

**TWABAM ⚡!** This pattern transforms strategic goals into a 7-week execution roadmap. Use it at the start of each cycle to set direction and maintain momentum. 🦸💣

---
#### Sources
[^1]: [[Orchestrator – Cycle Plan Generator]]
[^2]: [[Example - Cycle Plan]]
[^3]: [[AI-Suplex - Cycle Plan Template]]
[^4]: [[Orchestrator – Cycle Review]] (for pre-plan reference)
