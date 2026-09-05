---
skill_name: "Orchestrator – Weekly Review"
role: "Orchestrator"
version: "1.0"
date: 2026-04-10
tags: [skill, orchestrator, weekly-review, ai-suplex]
---

# Orchestrator Skill: Weekly Review

## 🎯 Purpose

Analyse the past week’s work (sessions, artifacts, B‑Bombs, insights, trackers) and produce a **structured weekly review** that helps the Hustler:

- Understand what was achieved
- Identify lessons learned
- Spot blockers and patterns
- Get actionable recommendations for the next week

The review can be generated from:

- The **Sweeper – Enhance MOCs & Trackers** output (which injects recent highlights into MOCs and updates trackers)
- Directly from session end reports, insights, and trackers
- A combination of the above

The output is a markdown document suitable for saving in `AI-Suplex-777/Reviews/Weekly/` and for use in planning the next cycle/week.

---

## 📥 Input

The Hustler can provide:

- **A specific week** (e.g., “Cycle 1, Week 3”)
- **A date range** (e.g., “last 7 days”)
- **Or just a request** – the Orchestrator will assume the most recent complete week based on session end dates.

Optionally, the Hustler may run `Sweeper – Enhance MOCs & Trackers` first to have fresh highlights in MOCs and trackers. The Orchestrator can then read those enhanced files.

If no data is available, the skill will ask the Hustler to run some sessions first.

---

## 📤 Output

A markdown document with the following structure:

```markdown
# Weekly Review – Cycle {{X}}, Week {{Y}}

**Period:** {{start date}} to {{end date}}  
**Generated:** {{timestamp}}

## 📊 Executive Summary
- **Total sessions:** {{count}}
- **Total focus hours:** {{sum of durations}} minutes ({{hours}} hours)
- **Top focus areas:** {{list of focuses with session counts}}
- **Artifacts created:** {{count}}
- **B‑Bombs created:** {{count}}
- **Insights logged:** {{count}}

## 🏆 Key Achievements
- (List notable accomplishments, based on session missions and key insights)

## 🧠 Lessons Learned
- (Compiled from key insights across sessions)

## ⚠️ Blockers & Challenges
- (List any blockers reported in session ends or trackers)

## 📈 Progress by Focus Area
| Focus | Sessions | Key Insight | Next Action |
|-------|----------|-------------|--------------|
| ... | ... | ... | ... |

## 🚀 Recommendations for Next Week
- (AI‑generated suggestions based on patterns, e.g., “Start sessions earlier”, “Reduce context switching”, “Protect more time for deep work”)

## 📅 Next Week’s Focus Areas
- (Prioritised list of focuses to work on, based on pending next actions and strategic goals)

## 🔗 Quick Links
- [[Command Center]]
- [[MOCs/]]
- [[Trackers/]]
- [[Tasklists/Combined/]]
```

The AI will present the review in the chat. The Hustler can then ask to save it to `AI-Suplex-777/Reviews/Weekly/Week {{Y}} Review.md`.

---

## 🧠 Workflow Instructions (for the AI)

When the Hustler says *“Orchestrator, generate a weekly review for Cycle 1, Week 3”* (or similar), follow these steps:

### 1. Determine the week and cycle
- If the Hustler specifies cycle and week, use those.
- Otherwise, infer from the most recent session end files (use the `cycle` and `week` from frontmatter).
- If no sessions exist, ask the Hustler to run some sessions first.

### 2. Gather data
- **Session end files** in `AI-Suplex-777/Sessions/Active/End/` (and optionally `Archive/End/`) that match the cycle and week.
- **Artifacts** and **B‑Bombs** created during that period (check `date` in frontmatter or file modification time).
- **Insights** from `AI-Suplex-777/Insights/Cycle X/Week Y.md` (if exists).
- **MOCs** and **Trackers** – optionally read them for enhanced highlights (if the Hustler ran the Sweeper enhance script).

### 3. Calculate aggregates
- Count sessions, sum durations (convert minutes to hours).
- Group sessions by focus (from frontmatter `focus`).
- Count artifacts and B‑Bombs (by scanning folders and filtering by date).
- Count insights (by counting entries in the weekly insights file or scanning `Insights.md`).

### 4. Extract achievements
- From session end reports, look for:
  - Mission statements that indicate completion (e.g., “successfully deployed”, “fixed”, “completed”).
  - Key insights that mention progress.
- List up to 5 achievements (bullet points).

### 5. Extract lessons learned
- Collect all `key_insights` from session ends and insights.
- Deduplicate and group by theme (e.g., “technical”, “process”, “tool”).
- Present as bullet points.

### 6. Identify blockers
- From session ends, look for `completion_status: blocked` or any mention of “blocker”, “waiting”, “stuck”.
- Also check trackers for blockers (if available).
- List each blocker and suggest a next action (e.g., “Follow up with Oracle support”).

### 7. Build the focus progress table
- For each focus that had sessions, extract:
  - Number of sessions
  - The most recent key insight (or the most important one)
  - The latest next action (from the most recent session end)
- Present as a markdown table.

### 8. Generate recommendations
- Analyse patterns:
  - If energy levels were low, suggest shorter sessions or more breaks.
  - If focus quality was low, suggest reducing distractions or time‑blocking.
  - If many artifacts but few B‑Bombs, suggest a promotion session.
  - If a focus area has no sessions, suggest allocating time.
- Write 2‑5 actionable recommendations.

### 9. Suggest next week’s focus areas
- Prioritise focuses based on:
  - Number of pending next actions
  - Strategic importance (ask the Hustler or infer from product goals)
- List them in order.

### 10. Present the review
- Output the markdown.
- Ask the Hustler if they want to save it to `Reviews/Weekly/`. If yes, write the file.

---

## 📝 Example

**User:** “Orchestrator, generate weekly review for Cycle 1, Week 1.”

**AI (after scanning):** (produces a review with actual data from the user’s vault, following the template above).

---

## 🔗 Integration

- Run `Sweeper – Enhance MOCs & Trackers` before this skill to have the freshest data in MOCs and trackers.
- After the review, the Hustler can use the `Architect – Session Start Prompt Generator` to start sessions for the next week’s focus areas.

---

## ✅ Quality Checklist

- [ ] All dates and counts are accurate.
- [ ] Achievements and lessons are specific, not generic.
- [ ] Recommendations are actionable and based on actual data.
- [ ] Blockers include suggested next actions.
- [ ] The output is clean markdown (ready to save).

---

**TWABAM ⚡!** This skill turns raw session data into a strategic compass. Use it every Sunday to sharpen your focus for the coming week. 🦸💣
`