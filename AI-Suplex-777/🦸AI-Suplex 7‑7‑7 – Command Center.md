---
cssclass: dashboard
title: AI-Suplex 7‑7‑7 – Command Center
tags: [dashboard, command-center, full]
---
 
# 🦸 AI‑SUPLEX 7‑7‑7 – COMMAND CENTER

> *Your live dashboard for the 7‑7‑7 rhythm. Everything below updates automatically as you work.*

> [!tip] **🚀 New to AI-Suplex? Start with Patterns!**  
> Skip the learning curve: Go to **[[#🧩 Pattern Quick Access|Pattern Quick Access]]** ↓ below, copy any pattern, paste into AI chat, and get perfect outputs in seconds. Patterns are the fastest way to start using AI-Suplex.

---

## ⚡ Recently Completed Sessions (Last 7 Days)

```dataview
TABLE 
  date as Date,
  focus as Focus,
  cycle as Cycle,
  week as Week,
  key_insights as "Key Insight",
  energy_start as "⚡ Start",
  energy_end as "⚡ End",
  focus_quality as "Focus Q"
  
FROM "AI-Suplex-777/Sessions/Active/End"
WHERE date >= date(today) - dur(7 days)
SORT date DESC
LIMIT 10
````

> [!tip] **Missing sessions?** Run `Sweeper – Archive Session` to move old ones, or adjust the date filter.

---

## 📊 Quick Stats (Last 7 Days)

> [!info] **Portable across all vaults** — paths use vault-relative format. Works in Personal, Core, and 7-7-7 vaults.

### Recent Session Activity

```dataview
CALENDAR date
FROM "AI-Suplex-777/Sessions/Active/End"
WHERE date >= date(today) - dur(7 days)
```

### Total Sessions (7d)

```dataviewjs
dv.paragraph(dv.pages('"AI-Suplex-777/Sessions/Active/End"').where(p => p.date >= dv.date('today') - dv.duration('7 days')).length)
```

### Total Focus Hours (7d)

```dataviewjs
const sessions = dv.pages('"AI-Suplex-777/Sessions/Active/End"').where(p => p.date >= dv.date('today') - dv.duration('7 days'));
const totalMinutes = sessions.duration_minutes.array().reduce((a, b) => (a || 0) + (b || 0), 0);
dv.paragraph(totalMinutes + " minutes (" + Math.round(totalMinutes / 60) + " hours)")
```

### Artifacts Created (7d)

```dataviewjs
dv.paragraph(dv.pages('"AI-Suplex-777/Artifacts"').where(p => p.date >= dv.date('today') - dv.duration('7 days')).length)
```

### B‑Bombs Created (7d)

```dataviewjs
dv.paragraph(dv.pages('"AI-Suplex-777/B-Bombs"').where(p => p.date >= dv.date('today') - dv.duration('7 days')).length)
```

### Insights Logged (7d)

```dataviewjs
const sevenDaysAgo = dv.date('today') - dv.duration('7 days');
let count = 0;

for (let page of dv.pages('"AI-Suplex-777/Insights"')) {
    for (let item of page.file.lists) {
        const match = item.text.match(/\*\*(\d{4}-\d{2}-\d{2})/);
        if (match) {
            const itemDate = dv.date(match[1]);
            if (itemDate >= sevenDaysAgo) {
                count++;
            }
        }
    }
}

dv.paragraph(count + " insights (last 7 days)");
```

> [!tip] **Data looks empty?** That means no sessions/artifacts were created in the last 7 days. Run a session and the metrics will populate automatically.

---

## 🧠 Focus Area Health (Last 7 Days)

```dataview
TABLE
  length(rows) as "Sessions (7d)",
  round(average(rows.energy_start),1) as "Avg Energy Start",
  round(average(rows.focus_quality),1) as "Avg Focus Q",
  choice(length(rows) > 0, "🟢 Active", "⚪ Idle") as Status
FROM "AI-Suplex-777/Sessions/Active/End"
WHERE date >= date(today) - dur(7 days)
GROUP BY focus
SORT length(rows) DESC
```

> [!note] **Drill down** – Click on any focus name to open its MOC. Trackers are linked below.

---

## 💣 B‑Bomb Arsenal

### B‑Bomb Count by Week (Last 5 Weeks)

```dataview
TABLE rows.file.link as "B‑Bombs", length(rows) as "Count"
FROM "AI-Suplex-777/B-Bombs"
FLATTEN date
GROUP BY dateformat(date, "'Week ' W") as Week
SORT Week DESC
LIMIT 5
```

### Latest B‑Bombs (Top 5)

```dataview
TABLE 
  date as Date,
  focus as Focus,
  product_potential as "Product Potential"
FROM "AI-Suplex-777/B-Bombs"
SORT date DESC
LIMIT 5
```

---

## 📌 Next Actions (From Recent Session Ends)

```dataview
TABLE 
  date as Date,
  focus as Focus,
  next_actions as "Next Action"
FROM "AI-Suplex-777/Sessions/Active/End"
WHERE next_actions != ""
SORT date DESC
LIMIT 10
```

> [!todo] **Ready to work?** Pick an action and run `Session Start` (Architect skill can generate a prompt).

---

## 📅 Cycle & Week Context

- **Current Cycle:** (set in trackers – run `Sweeper – Create Tracker` to define)
- **Current Week:** (update in trackers as you progress)

**Quick links:**

- [[AI-Suplex-777/MOCs|All MOCs]]
- [[AI-Suplex-777/Trackers|All Trackers]]
- [[AI-Suplex-777/Tasklists|Tasklists]]
- [[AI-Suplex-777/Reviews/Weekly|Weekly Reviews]]

---

## 🔗 Quick Links & Tools

| Tool                                             | Description                                      |
| ------------------------------------------------ | ------------------------------------------------ |
| [[AI-Suplex-777/Command Center\|Command Center]] | You are here                                     |
| [[AI-Suplex-777/Focuses\|Focuses]]               | Manage your focus areas                          |
| `MOCs/`                                          | Maps of Content (one per focus)                  |
| `Trackers/`                                      | Progress trackers (one per focus)                |
| `Skills/`                                        | AI agent blueprints                              |
| `Prompt Pattern/`                              | Copy-paste patterns for AI chats                 |
| `Sessions/Active/Start`                          | Session start templates                          |
| `Sessions/Active/End`                            | Session end reports                              |
| `Artifacts/`                                     | Work‑in‑progress assets (nested by cycle/week)   |
| `B-Bombs/`                                       | Polished, reusable assets (nested by cycle/week) |
| `Insights/`                                      | Weekly insight logs                              |
| `Tasklists/`                                     | AI‑Suplex & Combined Tasklists                   |
| `Reviews/Weekly/`                                | Weekly review files                              |
| `Plans/`                                         | Phase execution plans                            |
| `QualityNotes/`                                  | Long Architect review notes                      |
| `AI-Suplex Kick-start/`                          | Methodology docs and your project notes          |

---

## 🛠️ Commander Buttons (Already Configured)

| Button      | Macro                             |
| ----------- | --------------------------------- |
| 🚀 Start    | Session Start                     |
| 🏁 End      | Session End                       |
| 📄 Artifact | Artifact                          |
| 💣 B‑Bomb   | B-Bomb                            |
| 💡 Insight  | Insight                           |
| 🎯 Focus    | Focus Manager                     |
| 🗺️ MOC     | Sweeper – Create MOC              |
| 📊 Tracker  | Sweeper – Create Tracker          |
| 📦 Archive  | Sweeper – Archive Session         |
| 🔄 Enhance  | Sweeper – Enhance MOCs & Trackers |

> [!info] **Pro tip:** Use the **Enhance** button before a weekly review to inject recent data into MOCs and Trackers.

---

## 🧠 AI Skills Quick Access

- **Orchestrator – Tasklist Generator** – Convert to‑do list into structured tasks.
- **Orchestrator – Combined Tasklist** – Merge tasks from multiple sources.
- **Orchestrator – Weekly Review** – Generate strategic summary.
- **Architect – Session Start Prompt** – Turn a task ID into a session start prompt.
- **Architect – Session End Report** – Create a report from a filled prompt.

> [!tip] **How to use:** Open the skill file (in `Skills/`), copy its content, paste into Claude/ChatGPT, and ask it to act as that role.

---

## 🧩 Pattern Quick Access

| Pattern                | Template                                         | Use When                                                 |
| ---------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| **Create Artifact**    | [[📄 Pattern - Artifact Generation]]             | You have work-in-progress to save as structured artifact |
| **Create B-Bomb**      | [[📄 Pattern - B-Bomb Promotion]]                | You have polished work ready for productization          |
| **Start Session**      | [[📄 Pattern - Session Start Prompt Generation]] | Beginning a focused work session                         |
| **End Session Prompt** | [[📄 Pattern - Session End Prompt Generation]]   | Generating session completion prompts                    |
| **End Session Report** | [[📄 Pattern - Session End Report]]              | Creating comprehensive session end reports               |
| **Generate Tasklist**  | [[📄 Pattern - Tasklist Generation]]             | Converting raw to-do lists into structured plans         |
| **Batch Insights**     | [[📄 Pattern - Batch Insight Generation]]        | Capturing multiple learnings from observations           |

> [!note] **How to use patterns:** Copy the pattern template, paste into AI chat, replace content section with your specific input, and execute.

---

**TWABAM ⚡!** This is your mission control. Bookmark it as your home note. Every session, artifact, B‑Bomb, and insight feeds into this dashboard.
