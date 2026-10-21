---
type: documentation
tags:
  - documentation
  - methodology
  - weekly-reset
  - 7/1/3
date: 2026-08-12
topic: Weekly Reset
---
 
# Weekly Reset — The Tuesday Ritual

> **Open this every Tuesday morning. Follow the list. Close it. Work.**

---

## 🎯 What This Is

A frictionless checklist to maintain the 7-7-7 rhythm without requiring discipline or memory. Each step is a single click or copy-paste action. No thinking required.

**When to run:**
**Saturday** (end of hustle week) — B-Bomb promotion + aggregate data + weekly review
- **Tuesday** (start of new week) — Archive old sessions + enhance dashboards

**Total time:** 15-20 minutes.

---

## 📅 Saturday Ritual (End of Week — B-Bomb Day)

### Step 1: Enhance Dashboards
- [ ] Run **Sweeper – Enhance MOCs & Trackers**
- [ ] Verify `MOCs/` updated with this week's sessions
- [ ] Verify `Trackers/` updated with this week's metrics

### Step 2: B-Bomb Promotion — Scan & Package Explosives
Open your Artifacts folder. Scan for anything that meets these criteria:

| Look For                              | Example                                |
| ------------------------------------- | -------------------------------------- |
| Completed work that solved a problem  | "Webhook fixed by removing URL prefix" |
| A reusable template or script         | "Cloud sync bash script"               |
| Documentation that's reference-worthy | "Quick Start Guide for AI-Suplex"      |
| Something you'd show a client         | "Sales page structure analysis"        |

**The 60-second B-Bomb scan:**
- [ ] Open `Artifacts/<Period>/Cycle 1/Week [current]/` — skim file list
- [ ] Identify 2-3 candidates that stand out
- [ ] For each candidate: run the **💣 B-Bomb** macro
- [ ] Run **Sweeper – Refresh B-Bomb Index**

> **Pro tip:** If nothing stands out immediately, you had a slow week. That's fine. Don't force it. A genuine B-Bomb is better than 5 forced ones.

**Alternative — AI-Assisted Promotion (for big artifact weeks):**
1. Copy the **📄 Pattern - B-Bomb Promotion** from `Prompt Patterns/`
2. Paste into Claude/ChatGPT/DeepSeek
3. Replace source with: "Scan Artifacts/<Period>/Cycle [X]/Week [Y]/ for B-Bomb candidates. Rank by innovation quotient."
4. Execute — AI identifies candidates and drafts promotion content

**Graph RAG Candidate Scan (Impl 1 — hidden connections):**

- [ ] Refresh the file index — `node Tools/vault-index.js --current` *(the graph + B-Bomb hunt are Ultra — skip in 777)*
- [ ] Run `python3 Tools/bbomb_hunter.py` — ranked B-Bomb candidates from hidden cross-focus connections (shared tags + graph traversal)
- [ ] Pick 2–3 candidates (IQ ≥ 7, verdict YES/MAYBE) → run the **💣 B-Bomb** macro on each

### Step 3: Aggregate Week's Data

- [ ] Run **Sweeper – Aggregate Weekly Data** — compiles all sessions, artifacts, and B-Bombs into one source file
- [ ] File opens automatically: `Reviews/<Period>/Weekly/Cycle X/Week Y/Week Y Aggregate Data.md`
- [ ] Run `node Tools/generate-weekly-index.js` — freezes the week's rollup → `MOCs/<Period>/Weekly/Cycle X/Cycle X Week Y.md` (theme, summary, 3 insights, artifact list, B-Bomb index)

### Step 4: Weekly Review

- [ ] Run **Sweeper – Weekly Review** — generates structured review from session data
- [ ] Fill in the generated review template

> **AI-Assisted Weekly Review:** Copy the aggregated source file from Step 4, paste into Claude/ChatGPT/DeepSeek with the Orchestrator Weekly Review skill. The AI gets a complete data picture in one file.

### Step 5: Archive Old Sessions

- [ ] Run **Sweeper – Archive All Active Sessions** (Commander button or QuickAdd macro)
- [ ] Verify `Sessions/Archive/` has this week's files

### Step 6: Sync to Cloud (Git + Backup)

- [ ] Git commit + push — `./Scripts/cloud-sync.sh "Week X — Y sessions, Z promoted"`
- [ ] Optional: full encrypted backup — `~/scripts/ai-suplex-backup.sh` (Google Drive + Dropbox, per [[☁️ AI-Suplex Backup & Infrastructure Guide]])

---

## 📅 Tuesday Ritual (Week Start — Planning Day)

### Step 1: Close Last Week

- [ ] Run **Sweeper – Archive All Active Sessions** (if Saturday was missed)
- [ ] Skip if already done Saturday

### Step 2: Ensure Structure

- [ ] Run **Sweeper – Ensure Folder Structure** (creates missing Cycle/Week folders)

### Step 3: Generate New Tasklist

- [ ] Copy **📄 Pattern - Tasklist Generation** from `Prompt Patterns/`
- [ ] Paste into AI chat with this week's raw to-do list
- [ ] Execute — get structured tasklist with roles + durations
- [ ] Save in `Tasklists/`

### Step 4: Sync Memory + Knowledge Graph

- [ ] Run `node Tools/3lm.js index` — refreshes memory lookup
- [ ] Run `node Tools/3lm.js status` — verify memory stack (optional)
- [ ] Run `node Tools/vault-index.js --current` — vault scan → `Memory/vault-context.md` (auto-detects latest cycle/week)
- [ ] Run `node Tools/vault-index.js --quick --days 14` — bounded every-session index → `Memory/vault-index.md` (last 14 days; stable memory files always kept)
- [ ] If last week's rollup wasn't generated Saturday: run `node Tools/generate-weekly-index.js` → `MOCs/<Period>/Weekly/`
- [ ] *(skip in 777 — the knowledge graph is Ultra; the markdown index is the free-lane source)*

### Step 5: Quick Dashboard Check


- [ ] Open **Command Center** — confirm dashboard shows today's state
- [ ] Spot check: are last week's sessions visible? Artifacts count accurate?

### Step 6: Refresh Mission Context + Sync

- [ ] Update `AI-Suplex Kick-start/Context Kick-start/Active Mission Context.md` — rotate from the latest `Context Kick-start/Active/` file (or paste current state: date, status, next actions)
- [ ] Run `node Tools/3lm.js start --context` — confirm **`✅ Context fresh`** (staleness guard green) + generated session context (Impl 2)
- [ ] Git commit + push — `./Scripts/cloud-sync.sh "Week X — reset + mission context refreshed"`
- [ ] Optional: encrypted backup `~/scripts/ai-suplex-backup.sh` (per [[☁️ AI-Suplex Backup & Infrastructure Guide]])

---

## 🗓️ Full Weekly Rhythm

```
Monday    — Closed (Hustle day — your other income streams)
Tuesday   — Weekly Reset + New Tasklist + Planning
Wed-Fri   — Execution (sessions, artifacts, B-Bombs)
Saturday  — B-Bomb Promotion + Weekly Review + Sweeper tasks
Sunday    — Rest or light work
```

---

## ⚡ Commander Button Quick Reference

| Button                     | What It Runs                                                               | When                                           |
| -------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| 📦 Archive All             | Sweeper – Archive All Active Sessions                                      | Saturday or Tuesday                            |
| 📊 Enhance MOCs            | Sweeper – Enhance MOCs & Trackers                                          | Saturday                                       |
| 🔄 Weekly Review           | Sweeper – Weekly Review                                                    | Saturday                                       |
| 💣 B-Bomb                  | B-Bombs (manual promotion)                                                 | Saturday                                       |
| 💣 Hunt B-Bombs            | `python3 Tools/bbomb_hunter.py`                                            | Saturday (Step 2)                              |
| 🔄 Refresh B-Bombs         | Sweeper – Refresh B-Bomb Index                                             | Saturday (after promoting)                     |
| 📁 Ensure Structure        | Sweeper – Ensure Folder Structure                                          | Tuesday                                        |
| 🧠 Sync Memory             | `node Tools/3lm.js index`                                                  | Tuesday                                        |
| 🔗 Refresh Graph (Ultra)   | `node Tools/ultra/knowledge-graph.js --build-current` — Ultra harness only        | Ultra harness · skip in 777                     |
| 📅 Weekly Index (14d)      | `node Tools/vault-index.js --quick --days 14`                                 | Tuesday (Step 4) + anytime                     |
| 📅 Weekly Rollup           | `node Tools/generate-weekly-index.js`                                      | Saturday (Step 4) + Tuesday if missed          |
| 📊 Aggregate Weekly        | Sweeper – Aggregate Weekly Data                                            | Saturday (before AI review)                    |
| ☁️ Sync to Cloud           | `./Scripts/cloud-sync.sh "message"`                                        | Saturday + Tuesday                             |
| 🧠 Refresh Mission Context | Update AGENTS.md + `3lm start` (green)                                     | Tuesday                                        |

> 💡 **Full macro reference:** See [[⚡ Macros Quick Start Guide]]

---

## 🤖 Automation Roadmap

| Phase           | What                                                                                                     | When                   |
| --------------- | -------------------------------------------------------------------------------------------------------- | ---------------------- |
| **Now**         | This checklist (manual, but structured)                                                                  | Live today             |
| **Post-Launch** | n8n scheduled workflow — triggers Saturday + Tuesday, sends reminder, runs Sweeper scripts automatically | After WQR Docker setup |
| **Ultra**       | Intelligent B-Bomb Promotion — Graph RAG scans artifacts, ranks candidates, suggests top 3               | Ultra Edition roadmap  |

---

## 🧠 The Simple Truth

You don't need discipline. You need a **single file you open every Tuesday and Saturday** that tells you exactly what to do.

This is that file.

---

*Weekly Reset checklist — AI-Suplex 7-7-7*
