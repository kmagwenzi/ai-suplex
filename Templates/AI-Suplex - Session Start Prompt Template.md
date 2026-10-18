```yaml
---
tags:
  - session
  - start
  - ${focus}
  - 7/${cycle}/${week}
date: ${formattedDate}
time: ${now.toTimeString().slice(0,5)}
focus: ${focus}
session_type: ${sessionType}
cycle: ${cycle}
week: ${week}
duration_minutes: ${duration}
energy_start: ${energy}
mission: ${mission || "No mission provided."}
---

# AI-Suplex: Session Start

**Session Type:** ${sessionType}
**Focus:** ${focus}
**Cycle:** ${cycle} | **Week:** ${week}
**Duration (min):** ${duration}
**Energy Level:** ${"⚡".repeat(energy)}

## Mission
${mission || "No mission provided."}

## Tasks
${tasksContent}

## Success Metrics
${metricsContent}

## Quick Links
- [[Insights]]
- [[B-Bombs]]
- [[Artifacts]]

---
*Session started via AI-Suplex on ${formattedDate}*

```