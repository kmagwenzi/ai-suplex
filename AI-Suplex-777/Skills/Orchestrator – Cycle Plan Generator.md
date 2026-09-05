---
skill_name: "Orchestrator – Cycle Plan Generator"
role: "Orchestrator"
version: "1.0"
date: 2026-05-13
tags: [skill, orchestrator, cycle-plan, ai-suplex, 7-7-7]
---

# Orchestrator Skill: Cycle Plan Generator

## 🎯 Purpose

Plan a complete 7-week cycle with phased focus areas, weekly deliverables, success metrics, and financial targets. Produces a **strategic cycle roadmap** that guides the Hustler through the entire cycle — from Foundation through Launch, Acceleration, to Scale.

Unlike the Cycle Review (which looks backward), this skill is **forward-looking**. It transforms strategic objectives into an actionable 7-week battle plan that integrates all focus areas, respects energy management, and sets measurable success criteria.

---

## 📥 Input

The Hustler provides:

| Input | Required | Description |
|-------|----------|-------------|
| **Cycle Number** | ✅ | E.g., "Cycle 1", "Cycle 2" |
| **Strategic Theme** | ✅ | The overarching goal or gamechanger (e.g., "Income → Audience → System Maturity") |
| **Focus Areas** | ✅ | The focus areas for the cycle, in priority order |
| **Cycle Dates** | ✅ | Start and end dates for the 7-week period |
| **Financial Targets** | ❌ | Optional income/revenue goals per stream |
| **Known Constraints** | ❌ | Travel, events, holidays, or other time blocks |
| **Previous Cycle Lessons** | ❌ | Key takeaways from last cycle (if applicable) |

---

## 📤 Output

A markdown document saved to `AI-Suplex-777/Plans/Cycle X Plan.md` with the following structure:

```markdown
# 🎯 7-WEEK CYCLE X – [STRATEGIC THEME]

**Cycle Dates:** Week 1 (Start) → Week 7 (End)
**Review Week:** Week 7 – Assess, Refine, Launch Cycle X+1

## 📊 CYCLE STRUCTURE

| Phase | Weeks | Focus | Primary Activities |
|-------|-------|-------|--------------------|
| Foundation | 1 | ... | ... |
| Launch | 2–3 | ... | ... |
| Acceleration | 4–5 | ... | ... |
| Scale | 6–7 | ... | ... |

## 🗓️ WEEK 1: [PHASE] – [FOCUS]
[deliverables, success metrics]

## 🗓️ WEEK 2–3: [PHASE] – [FOCUS]
[deliverables, success metrics]

... (weeks 4–5, 6–7)

## 📈 FINANCIAL FORECAST – CYCLE X
[weekly forecast table]

## ⚡ CRITICAL SUCCESS FACTORS
[5–7 factors]
```

---

## 🧠 Workflow Instructions

When the Hustler says *"Orchestrator, generate a cycle plan for Cycle [X]"* (or similar), follow these steps:

### 1. Determine Cycle Parameters
- Confirm the **cycle number** and **strategic theme** with the Hustler.
- Clarify **focus areas** and their priority order.
- Ask about **financial targets** and any **known constraints**.
- If a previous cycle review exists, load it for context (`get_context(query: "cycle-<N-1> decisions", depth: 3)`).

### 2. Design Phase Structure
Break the 7-week cycle into 4 natural phases:

| Phase | Weeks | Typical Purpose |
|-------|-------|-----------------|
| **Foundation** | Week 1 | Set up systems, clear blockers, establish baseline |
| **Launch** | Weeks 2–3 | First major output, profiles live, initial client work |
| **Acceleration** | Weeks 4–5 | Dual-income execution, beta launches, content engine |
| **Scale** | Weeks 6–7 | Revenue growth, audience expansion, system optimization |

**Custom phases** are allowed — adapt to the Hustler's specific objectives.

### 3. Assign Focus Areas to Weeks
- Map each focus area to specific weeks and phases.
- Consider **energy management** — don't put 3 heavy focuses in a single week.
- Use **daily splits** or **alternating days** (e.g., Mon/Wed/Fri = Focus A, Tue/Thu/Sat = Focus B).

### 4. Define Key Deliverables Per Week
- List 5–10 specific deliverables per week.
- Use **actionable language** ("Build", "Deploy", "Launch", "Create").
- Reference existing task IDs if a tasklist is in play.

### 5. Set Success Metrics Per Phase
- Define **measurable success criteria** (numbers, percentages, milestones).
- Include **energy targets** (⚡⚡⚡⚡ minimum recommended).

### 6. Build Financial Forecast
If the Hustler provides financial targets:
- Break down income by stream per week (Freelance, Products, WQR/MRR, etc.).
- Show **weekly totals** and a **cumulative cycle target**.
- Keep it realistic — $0 weeks early, growth later.

### 7. Identify Critical Success Factors
- 5–7 factors that will make or break the cycle.
- Mix of **discipline factors** ("daily build-in-public"), **strategy factors** ("freelance volume game"), and **energy factors** ("sleep 7+ hours").

### 8. Output the Plan
- Present the plan in chat for Hustler review.
- Offer to save to `AI-Suplex-777/Plans/Cycle X Plan.md`.
- Offer to persist strategic decisions to CortexMem.

---

## 🔗 Integration Points

| Integration | When |
|-------------|------|
| **Previous Cycle Review** | Load Cycle X-1 review for context before planning |
| **Focuses.md** | Reference current focus areas for alignment |
| **Tasklist Generation** | After plan is approved, generate Week 1 tasklist |
| **CortexMem** | Save strategic decisions: `node cm save_context --context_type decision --content "Cycle X Plan: <strategic theme> | phases: <phase summary>"` |
| **Session Planning** | Use weekly deliverables to drive session start prompts |
| **B‑Bomb Promotion** | Wee-ends of Phase 2+ for promoting key deliverables |

---

## 📝 Example

**User:** "Orchestrator, generate a Cycle 1 plan. Theme is 'AI-Suplex → Income → Audience → System Maturity'. Focuses: AI Engineering, WQR, Freelance, Digital Products, Content Creation. Financial target: $6,000–12,000 by end of cycle."

**AI (Orchestrator):** (produces a complete 4-phase, 7-week roadmap with weekly deliverables, success metrics, financial forecast, and critical success factors — following the reference structure)

---

## ✅ Quality Checklist

- [ ] Phases are logically sequenced (Foundation → Launch → Acceleration → Scale)
- [ ] Weekly workload is realistic (no 14-hour days)
- [ ] Focus areas aligned with strategic objectives
- [ ] Success metrics are measurable (not "do better" — "3 posts published")
- [ ] Financial targets are ambitious but achievable
- [ ] Daily splits or alternating days are logical
- [ ] Energy management is considered
- [ ] Critical success factors are actionable
- [ ] Week 7 includes review and Cycle X+1 planning

---

## ⚠️ Common Mistakes to Avoid

| Mistake | Why It Fails | Fix |
|---------|--------------|-----|
| Overloading Week 1 | Burnout before momentum | Keep Foundation week lean — setup only |
| Ignoring energy management | Crash by Week 4 | Schedule lighter weeks after heavy ones |
| Vague success metrics | Can't measure progress | Quantify everything ("3 clients", "$500 revenue") |
| No review week | No learning cycle | Week 7 must include review + next cycle planning |
| Too many focuses per week | context switching kills depth | Max 2 focuses per day, 3 per week |

---

**TWABAM ⚡!** The 7-week plan is your north star. Execute it with precision. 🦸💣
