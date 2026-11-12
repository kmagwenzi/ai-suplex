---
title: "Pattern - Kickstart Workspace"
date: 2026-11-11
version: 1.0
tags: [pattern, kickstart-workspace, workspace, load, run, terminology, builder]
---

# AI-Suplex Prompt Pattern — Kickstart Workspace

Load and run a defined **workspace** — the client-facing name for `Kickstart`. **Kickstart runs; it never creates.**

## 🎯 How to Use

1. Copy the `<prompt-pattern>` block below.
2. Replace `WORKSPACE` with the type + title (or slug / ref).
3. Paste into your AI chat. The AI loads the workspace and executes it — it does **not** create it.

## 📋 The Prompt Pattern

```yaml
<prompt-pattern>
CONTEXT: Load and run an AI-Suplex workspace (a thread instance; client-facing: "workspace").
- External Source 1: AI-Suplex Kick-start/Spec — Context & Threads.md (v2.3)
- External Source 2: Prompt Patterns/📄 Pattern - Kickstart.md (the load-side order)
- Inline Source: "Workspace" replaces "thread" client-facing; the internal lane token stays.

TASK: Act as Builder. Resolve the workspace type to its internal lane, select the instance
(slug or ref — one open → load it, many → ask), load the Current mission brief + the
workspace brief + node Tools/3lm.js start --context, then execute the workspace's tasklist
(or its brief tasks). Do NOT create a brief, allocate a ref, or write a new file.

MEMORY LOOP: none at kickstart — it loads context, captures nothing.

ADDITIONAL INSTRUCTIONS: NONE

CONTENT:
WORKSPACE:
  - Type: <Daily Work | Project | Quick Task | Review>
  - Title: <title, slug, or ref>
</prompt-pattern>
```

## 🔤 Workspace type → internal lane

| Workspace type | Internal lane | Instances |
|---|---|---|
| Daily Work | `daily-tasks` | 1 (singleton) |
| Project | `project-tasks` | Many |
| Quick Task | `random-tasks` | Many |
| Review | `realist` | 1 (singleton) |

## ⚡ Fast Path — One Command (the context core)

1. **Current mission brief** — read `Context Kick-start/Active Mission Context.md` (the live state).
2. **Workspace brief** — read `Context Kick-start/Active/{lane}-{ref}-{slug}.md` (or `{lane}.md` for a singleton). N lanes: list first, then load the chosen workspace.
3. **Vault awareness** — `Memory/vault-context.md` + `Memory/vault-index.md`.
4. **Run `node Tools/3lm.js start --context`** — staleness guard + memory load + generated session context.
5. **Execute** — the workspace's tasklist (or the brief's tasks).

## 🛡️ The guardrail

**Kickstart runs; Define creates.** `Kickstart Workspace` never creates a brief, never allocates a ref, never writes a new file. It only loads and executes what already exists.

## 🧠 Memory Loop

**None.** Kickstart *loads* context; it captures nothing. The staleness guard inside `3lm start --context` is the loop's rail.

## 🔗 Related

- `Prompt Patterns/AI-Suplex Commands/⚡ Command — Kickstart Workspace.md` (the invocation)
- `Prompt Patterns/AI-Suplex Commands/⚡ Command — Define Workspace.md` (the create-side)
- `Prompt Patterns/📄 Pattern - Kickstart.md` (v2.0 — the load-side order it extends)
- `AI-Suplex Kick-start/Spec — Context & Threads.md` (v2.3)

---

*Pattern v1.0 captured via AI-Suplex on 2026-11-11 — Cycle 3, Week 4. TWABAM ⚡*
