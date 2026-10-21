# 🦸 AI-Suplex Quick Start Guide

> *From chaos to clarity, thoughts to assets.*

**TWABAM ⚡!** Welcome to AI-Suplex. This guide gets you from unzip to your first session in under 5 minutes — whether you use Obsidian, a coding agent, or both.

---

## 📦 After Unzipping

You'll get a folder that looks like this:

```
7-7-7 Edition/
├── .obsidian/         ← Plugin configs & macros (may be hidden)
└── AI-Suplex-777/     ← Product content
```

---

## 🟣 Option A: Use with Obsidian (Full Workflow)

### 1. Open the outer folder in Obsidian
```
File → Open Vault → Select: "7-7-7 Edition/"
```

### 2. Trust plugins
Obsidian prompts: *"Trust author and enable plugins?"* → Click **Trust**.

### 3. You're ready
Commander buttons are **pre-configured** — 🚀 Start, 🏁 End, and the capture buttons are already on the ribbon and toolbar.

### 4. You're ready
- 🚀 Click the **Start** button in the left ribbon
- Work. Capture 📄 Artifacts. Log 💡 Insights.
- 🏁 Click **End** when done
- 📊 Open the **Command Center** — your session is live on the dashboard

> ⚠️ **Common mistake:** Don't open the inner `AI-Suplex-777/` folder in Obsidian — macros won't work. Open the folder that contains `.obsidian/`.

---

## 🟢 Option B: Use with a Coding Agent (No Obsidian Required)

### 1. Open the inner folder in your terminal
```
cd 7-7-7 Edition/AI-Suplex-777/
```

### 2. The agent reads AGENTS.md automatically
The `AGENTS.md` file teaches the AI your project structure, roles, rules, skills, and memory system — no configuration needed.

### 3. Use AI-Suplex Commands (type → execute)
1. Type `AI-Suplex: <Command>` + your content
2. Start with `AI-Suplex: Tasklist Generation`
3. Paste into Claude / ChatGPT / DeepSeek / Copilot
4. Replace the CONTENT source with your material
5. Execute — the AI loads the pattern and returns structured output

> 💡 Prefer the raw block? Open `Prompt Patterns/`, copy the `<prompt-pattern>`, paste, replace `Source`. Same result, one extra step.

> 💡 **Pro tip:** Run `node Tools/3lm.js start --context` before chatting — the agent loads your memory (decisions, lessons, recent episodes) first. `node Tools/3lm.js threads --list` shows any open context instances.

---

## 🔄 Using Both (Recommended)

| Software                    | Open this folder                        |
| --------------------------- | --------------------------------------- |
| **Obsidian**                | `7-7-7 Edition/` (outer)                |
| **Claude Code / Open Code** | `7-7-7 Edition/AI-Suplex-777/` (inner) |

### Why two roots?
- **Obsidian** needs `.obsidian/` at the vault root for macros to work
- **Coding agents** need direct access to `AGENTS.md`, `Skills/`, `Prompt Patterns/` as the project root

Both point to the same files — just from different angles.

---

## 🧵 More Than One Window (Threads)

A **thread is a lane; an instance is a window.** Four lanes keep parallel agent work from colliding:

| Thread | Use it for | Instances | Context file |
|---|---|---|---|
| **Daily tasks** | the day's execution — the main one | 1 | `daily-tasks.md` |
| **Project tasks** | a build that spans sessions | N | `project-tasks-{ref}-{slug}.md` |
| **Random tasks** | one-off jobs — config, docs, PRDs | N | `random-tasks-{ref}-{slug}.md` |
| **Realist** | the twice-weekly execution audit | 1 | *(5-line log — no context file)* |

- **One instance = one context file = one writer.** A new window is a new file, never an append to another window's file.
- **Save Context** writes to `AI-Suplex Kick-start/Context Kick-start/Active/`; the **daily-tasks** thread is the only writer of the Active Mission Context.
- **A session is closed by the commit**, not by the file — a committer runs `node Tools/3lm.js sync`.

> 📖 The practical walkthrough: [[Guide — Context & Threads]] · the rules: `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.0).

---

## 🚀 Your First 5 Minutes

| Step |         Obsidian User         |                    Pattern-Only User                     |
| ---- | :---------------------------: | :------------------------------------------------------: |
| 1    | Open outer folder in Obsidian |                 Open `Prompt Patterns/`                  |
| 2    |         Trust plugins         |        Copy `📄 Pattern - Tasklist Generation.md`        |
| 3    |        Click 🚀 Start         |                    Paste into AI chat                    |
| 4    |     Fill mission + tasks      |                Paste your raw to-do list                 |
| 5    |      Work. Click 🏁 End.      | Execute — get structured tasklist with roles + durations |

**You just completed the AI-Suplex pipeline.** From raw input to structured output in one cycle.

### What's next?
- 📄 Capture an **Artifact** mid-work — save anything worth keeping
- 💣 Promote a polished artifact to a **B‑Bomb** — your reusable, sellable asset
- 📊 Open the **Command Center** — watch your dashboard come alive
- 🧠 Run `node Tools/3lm.js start` — see what the memory stack remembers

> 💡 **Full macro reference:** See [[⚡ Macros Quick Start Guide]]

---

## 🆙 Editions

> **Core Edition has been retired.** The **7-7-7 Edition** is the only edition — 20 Prompt Patterns, 14 AI Skills, focus areas & MOCs, cycle/week tracking, the 3lm memory loop, and Commander buttons pre-configured.
>
> **Ladder:** the open-source repo is **free**. The packaged 7-7-7 Edition is **$29** on Selar (`selar.com/270lq55ke0`); **Ultra (~$149)** is the paid harness upgrade. Selar is the only storefront.

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| "No macros in Command Palette" | You opened the inner folder. Open the outer folder (the one with `.obsidian/`). |
| Commander buttons not showing | Enable Commander plugin in Settings → Community Plugins, then run the setup guide |
| Macros error about paths | Don't rename the vault folder after extracting. Keep `AI-Suplex-777/`. |
| Dataview queries show nothing | You need to complete at least one session. Click 🚀 Start → work → 🏁 End. |
| 3lm not running | Run `node Tools/3lm.js status` from the vault root. Requires **Node 22+**. |
| AI skill not working | Skills are markdown files — copy the content into an AI chat. They don't run inside Obsidian. |

---

**TWABAM ⚡! You're locked and loaded.** Go capture your first session.

*AI-Suplex Quick Start Guide — 7-7-7 Edition*
