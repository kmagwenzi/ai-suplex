---
skill_name: "Orchestrator – Cycle Review"
role: "Orchestrator"
version: "1.0"
date: 2026-04-21
tags: [skill, orchestrator, cycle-review, ai-suplex, 7-7-7]
---

# Orchestrator Skill: Cycle Review

## 🎯 Purpose

Analyse a complete 7‑week cycle's work (all sessions, artifacts, B‑Bombs, insights, trackers, MOCs) and produce a **strategic cycle review** that helps the Hustler:

- Understand what was achieved across the entire cycle
- Identify long‑term lessons and patterns
- Evaluate focus area performance and progress
- Get strategic recommendations for the next cycle
- Plan Cycle X+1 goals and focus areas

The review is generated from:
- All session end reports for the cycle (Weeks 1‑7)
- Artifacts and B‑Bombs created during the cycle
- Weekly insights and trackers
- MOCs with cycle‑long highlights

The output is a comprehensive markdown document suitable for saving in `AI-Suplex-777/Reviews/Cycle X Review.md` and serves as the foundation for planning the next 7‑week cycle.

---

## 📥 Input

The Hustler can provide:

- **A specific cycle number** (e.g., "Cycle 1")
- **Optional strategic context** – goals that were set for this cycle, any external factors
- **Optional focus areas to emphasize** – if certain focuses need special attention

If no cycle is specified, the Orchestrator will infer the most recently completed cycle based on session dates and folder structure.

**Data sources to examine:**
- `AI-Suplex-777/Sessions/Active/End/` and `/Archive/End/` for all sessions with `cycle: X` in frontmatter
- `AI-Suplex-777/Artifacts/Cycle X/` – all artifacts across weeks 1‑7
- `AI-Suplex-777/B-Bombs/Cycle X/` – all B‑Bombs across weeks 1‑7  
- `AI-Suplex-777/Insights/Cycle X/` – weekly insight files
- `AI-Suplex-777/Trackers/` – all tracker files for the cycle
- `AI-Suplex-777/MOCs/` – Maps of Content with cycle‑long highlights
- `AI-Suplex-777/Focuses.md` – current focus area definitions

**Optional pre‑step:** The Hustler may run `Sweeper – Enhance MOCs & Trackers` for each week first to ensure all data is current.

---

## 📤 Output

A markdown document with the following structure:

```markdown
# Cycle {{X}} Review – {{start date}} to {{end date}}

**Cycle Period:** {{cycle start}} to {{cycle end}}  
**Generated:** {{timestamp}}  
**Next Cycle:** Cycle {{X+1}}

## 📊 Executive Summary
- **Total sessions:** {{count}} across 7 weeks
- **Total focus hours:** {{sum of all durations}} minutes ({{hours}} hours)
- **Average sessions per week:** {{avg sessions/week}}
- **Artifacts created:** {{count}} ({{artifacts/week}} per week)
- **B‑Bombs created:** {{count}} ({{b‑bombs/week}} per week)
- **Insights logged:** {{count}} ({{insights/week}} per week)
- **Top 3 focus areas by time:** 1. {{focus1}}, 2. {{focus2}}, 3. {{focus3}}

## 🏆 Cycle Achievements
- (List 3‑5 major accomplishments that span the entire cycle or represent significant milestones)

## 📈 Performance by Focus Area
| Focus | Sessions | Hours | Avg Rating | Key Achievement | Status |
|-------|----------|-------|------------|-----------------|--------|
| {{focus1}} | {{count}} | {{hours}} | {{rating}} | {{achievement}} | {{status}} |
| {{focus2}} | {{count}} | {{hours}} | {{rating}} | {{achievement}} | {{status}} |
| ... | ... | ... | ... | ... | ... |

*Status indicators:* 🚀 Excellent (consistent progress) • ✅ Good (steady work) • 🔄 Needs attention (sporadic) • ⚠️ At risk (minimal activity)

## 🧠 Cycle‑Level Lessons Learned
- (Thematic insights that emerged across multiple weeks, e.g., "Energy management", "Tool effectiveness", "Workflow patterns")

## 📉 Challenges & Blockers (Cycle View)
- (Recurring or major blockers that affected multiple weeks, with root‑cause analysis)

## 🔄 Week‑by‑Week Progress Snapshot
| Week | Sessions | Hours | Key Theme | Status |
|------|----------|-------|-----------|--------|
| 1 | {{count}} | {{hours}} | {{theme}} | {{status}} |
| 2 | {{count}} | {{hours}} | {{theme}} | {{status}} |
| ... | ... | ... | ... | ... |
| 7 | {{count}} | {{hours}} | {{theme}} | {{status}} |

## 🚀 Strategic Recommendations for Cycle {{X+1}}
- (3‑5 high‑impact recommendations based on cycle patterns, e.g., "Increase time allocation for {{focus}}", "Experiment with {{new workflow}}", "Address {{recurring blocker}}")

## 🎯 Suggested Goals for Cycle {{X+1}}
- (2‑3 SMART goals for the next cycle, derived from achievements and lessons)

## 📅 Proposed Focus Allocation for Cycle {{X+1}}
| Focus | Recommended % | Rationale |
|-------|---------------|-----------|
| {{focus1}} | {{%}} | {{reason}} |
| {{focus2}} | {{%}} | {{reason}} |
| ... | ... | ... |

## 🔗 Quick Links
- [[🦸AI-Suplex 7‑7‑7 – Command Center]]
- [[MOCs/]]
- [[Trackers/]]  
- [[Tasklists/Combined/]]
- [[Focuses.md]]
```

The AI will present the review in chat. The Hustler can then ask to save it to `AI-Suplex-777/Reviews/Cycle {{X}} Review.md`.

---

## 🧠 Workflow Instructions (for the AI)

When the Hustler says *"Orchestrator, generate a cycle review for Cycle 1"* (or similar), follow these steps:

### 1. Determine the cycle
- If the Hustler specifies a cycle number, use that.
- Otherwise, infer from the most recent session end files or folder structure (`Cycle X` folders).
- If the cycle appears incomplete (e.g., only weeks 1‑3 have data), ask the Hustler if they want a partial review or wait for completion.

### 2. Gather data across all 7 weeks
- **Session end files** in `AI-Suplex-777/Sessions/Active/End/` and `Archive/End/` with `cycle: X` in frontmatter.
- **Artifacts** in `AI-Suplex-777/Artifacts/Cycle X/` – scan all week subfolders.
- **B‑Bombs** in `AI-Suplex-777/B-Bombs/Cycle X/` – scan all week subfolders.
- **Insights** from `AI-Suplex-777/Insights/Cycle X/Week Y.md` files (1‑7).
- **Trackers** – read all tracker files, extract cycle‑level metrics.
- **MOCs** – check for cycle‑long highlights or patterns.

### 3. Calculate cycle aggregates
- Count **total sessions** across all weeks.
- Sum **all durations** (convert minutes to hours).
- Calculate **averages per week** (sessions, hours, artifacts, B‑Bombs, insights).
- Identify **top focus areas** by session count and total hours.
- Compute **average ratings** per focus area.

### 4. Extract cycle achievements
- Look for **mission completion** across multiple sessions.
- Identify **projects finished** or **major milestones reached**.
- Note **B‑Bombs with high product potential** (≥7/10).
- Identify **workflow improvements** implemented during the cycle.
- List 3‑5 most significant achievements.

### 5. Analyze focus area performance
- For each focus defined in `Focuses.md`:
  - Count sessions and total hours
  - Calculate average rating
  - Identify key achievement (most significant output)
  - Assign status based on consistency and progress
- Present as a table.

### 6. Identify cycle‑level lessons
- Group insights by **theme** (e.g., productivity, tools, mindset).
- Look for **patterns across weeks** (e.g., "Energy drops on Thursdays").
- Identify **what worked well** and **what needs change**.
- Extract 5‑7 thematic lessons.

### 7. Analyze challenges
- Identify **blockers that recurred** across weeks.
- Note **weeks with low productivity** and possible causes.
- Suggest **root causes** and **potential solutions**.

### 8. Create week‑by‑week snapshot
- For each week 1‑7:
  - Count sessions and hours
  - Identify dominant theme or focus
  - Assign status (🟢 Good week, 🟡 Mixed, 🔴 Challenged)
- Show progression through the cycle.

### 9. Generate strategic recommendations
- Based on patterns, suggest:
  - **Focus area adjustments** (more/less time)
  - **Workflow changes** (session timing, duration)
  - **Tool or process improvements**
  - **Blockers to address proactively**
- Make recommendations **actionable** and **specific**.

### 10. Suggest next cycle goals
- Derive from:
  - Unfinished work from this cycle
  - New opportunities identified
  - Strategic direction from achievements
- Frame as **SMART goals** (Specific, Measurable, Achievable, Relevant, Time‑bound).

### 11. Propose focus allocation
- Based on performance and goals, suggest time allocation.
- Consider:
  - Strategic importance
  - Current momentum
  - Learning opportunities
- Total should approximate 100% across focuses.

### 12. Present the review
- Output the complete markdown.
- Ask the Hustler if they want to save it.
- Offer to help with **next cycle planning** (tasklist generation, focus updates).

---

## 📝 Example

**User:** "Orchestrator, generate a cycle review for Cycle 1."

**AI (after scanning):** (produces a review with actual data from the user's vault, following the template above, showing 7 weeks of progress across AI Engineering, Digital Products, and Freelance focuses).

---

## 🔗 Integration

- **Before review:** Run `Sweeper – Enhance MOCs & Trackers` for each week to ensure data freshness.
- **After review:** Use the `Orchestrator – AI‑Suplex Tasklist Generator` to plan Cycle X+1.
- **Focus management:** Update `Focuses.md` if rebalancing is needed.
- **Archive:** Consider moving completed cycle folders to archive after review.

---

## ✅ Quality Checklist

- [ ] All metrics are accurate and span all 7 weeks.
- [ ] Achievements are cycle‑level, not just weekly.
- [ ] Lessons are thematic, not just individual insights.
- [ ] Recommendations are strategic and actionable.
- [ ] Goals for next cycle are SMART.
- [ ] Focus allocation is realistic and justified.
- [ ] The output is clean markdown, ready to save.

---

## 🎯 Special Considerations

### Partial Cycles
If the cycle is incomplete (e.g., only weeks 1‑4 have data):
- Label clearly as "Interim Cycle Review"
- Base projections on current pace
- Adjust recommendations accordingly

### First Cycle
For Cycle 1:
- Acknowledge this is the inaugural cycle
- Focus on establishing baselines
- Celebrate system adoption as an achievement

### Cycle Transitions
- Suggest archiving completed cycle folders
- Update any cycle‑dependent references
- Reset weekly counters for new cycle

---

**TWABAM ⚡!** This skill transforms 7 weeks of work into strategic intelligence. Use it at each cycle boundary to evolve your system and accelerate progress. 🦸💣