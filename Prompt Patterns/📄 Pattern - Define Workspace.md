---
title: "Pattern - Define Workspace"
date: 2026-11-11
version: 1.0
tags: [pattern, define-workspace, workspace, create, terminology, builder]
---

# AI-Suplex Prompt Pattern — Define Workspace

Turn a raw job into a **workspace** — the client-facing word for a thread instance. A workspace is **one lane, one brief, one writer**. **Define creates; it never runs.**

## 🎯 How to Use

1. Copy the `<prompt-pattern>` block below.
2. Replace `WORKSPACE` · `TASKS` · `SETTINGS`.
3. Paste into your AI chat. The AI writes the workspace brief — it does **not** execute it.

## 📋 The Prompt Pattern

```yaml
<prompt-pattern>
CONTEXT: Create an AI-Suplex workspace (a thread instance; client-facing: "workspace").
- External Source 1: AI-Suplex-777/Skills/Builder – Save Context
- External Source 2: AI-Suplex Kick-start/Spec — Context & Threads.md (v2.3)
- Inline Source: "Workspace" replaces "thread" client-facing; the internal lane token stays.

TASK: Act as Builder. Create exactly ONE workspace brief from WORKSPACE / TASKS / SETTINGS.
Resolve the workspace type to its internal lane, allocate the next {ref} (per thread, reset
per day — R9), slug the title, and write Context Kick-start/Active/{lane}-{ref}-{slug}.md
(singletons: {lane}.md). Write a tasklist ONLY if Create tasklist: YES. State the Outcome
as the definition of done. Do NOT load, run, or execute anything.

MEMORY LOOP: none at define time.

ADDITIONAL INSTRUCTIONS: NONE

CONTENT:
WORKSPACE:
  - Type: <Daily Work | Project | Quick Task | Review>
  - Title: <kebab-slug>
  - Mission: <one line>
  - Outcome: <the acceptance test — when is this done?>

TASKS:
1. <first task>
2. <second task>

SETTINGS:
  - Create tasklist: <YES | NO — default by type>
  - Agent: <agent name | Ask me later>
  - Mode: <Trusted local agent | Contributor agent>
  - Priority: <High | Medium | Low>
  - Due date: <optional>
</prompt-pattern>
```

## 🔤 Workspace type → internal lane

| Workspace type | Internal lane | Instances | Create tasklist (default) |
|---|---|---|---|
| Daily Work | `daily-tasks` | 1 (singleton) | Yes |
| Project | `project-tasks` | Many | Yes |
| Quick Task | `random-tasks` | Many | No |
| Review | `realist` | 1 (singleton) | No |

## 📄 The generated brief (what the AI writes)

```markdown
---
thread: random-tasks        # the internal lane — never the client label
instance: 1                 # ref — omit for singletons
title: quick-wins
mission: Check off quick wins from the daily hustle
outcome: All selected quick wins completed or explicitly blocked with a next action.
status: open
writer: committer           # committer | producer
agent: local
opened: 2026-11-11T12:00
tasklist: false             # true only when Create tasklist: YES
---

# Quick Wins

## Mission
Check off quick wins from the daily hustle.

## Tasks
- [ ] T-001 — Publish LinkedIn post
- [ ] T-002 — Add Google Cloud API key for kmagwenzi@ai-suplex

## What the AI needs to know next
- Complete only the tasks listed above.
- Ask before creating durable memory or modifying shared mission context.
- Record terminal outcomes explicitly: SENT, PUBLISHED, CALLED, CONFIGURED, or BLOCKED.

## Next actions
- Begin with T-001.
```

## 🛡️ The guardrail

**Define creates. Kickstart runs.** `Define Workspace` never loads, never executes, never opens a session. To run the workspace, use `AI-Suplex: Kickstart Workspace`.

## 🧠 Memory Loop

**None.** A workspace that has not run has produced nothing to remember. The memory loop belongs to the run side.

## 🔗 Related

- `Prompt Patterns/AI-Suplex Commands/⚡ Command — Define Workspace.md` (the invocation)
- `Prompt Patterns/AI-Suplex Commands/⚡ Command — Kickstart Workspace.md` (the run-side)
- `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.3 — the instance rules)

---

*Pattern v1.0 captured via AI-Suplex on 2026-11-11 — Cycle 3, Week 4. TWABAM ⚡*
