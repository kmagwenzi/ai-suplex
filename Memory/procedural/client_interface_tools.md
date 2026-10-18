# AI-Suplex Procedural Memory — Client Interface Tools Evaluation

## Purpose
Evaluate three tools (Archon, Vibe Kanban, Paseo) as potential client interface and agent orchestration layers for AI-Suplex Custom Edition. Updated from the original AnythingLLM analysis (June 6) to include new findings (June 8).

## The Client Interface Landscape

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT-FACING (What clients see)                            │
│  AnythingLLM (MIT) — Desktop app, natural language Q&A      │
│  Fork → brand → pre-configure for AI-Suplex workspaces      │
├─────────────────────────────────────────────────────────────┤
│  AGENT ORCHESTRATION (What runs behind the scenes)          │
│  Archon (MIT) — Workflow engine, YAML-defined processes     │
│  Paseo — Multi-agent orchestration via CLI                  │
│  Vibe Kanban — SUNSETTING — community maintained only       │
├─────────────────────────────────────────────────────────────┤
│  AI-SUPLEX CORE (What you built)                             │
│  3-Layer Memory Stack + 3lm CLI + 10 Patterns               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Archon — Workflow Engine

**Source:** coleam00/archon | 22.3k stars | MIT License

| Feature | Detail |
|---------|--------|
| **What it is** | Open-source harness builder for AI coding. Define development processes as YAML workflows. |
| **Key insight** | "Like what Dockerfiles did for infrastructure and GitHub Actions for CI/CD — Archon does for AI coding workflows. Think n8n, but for software development." |
| **License** | MIT — fully forkable |
| **Assistants** | Claude Code, Codex, Pi |
| **Platforms** | CLI, Web UI, Slack, Telegram, Discord, GitHub |
| **Key feature** | Isolated git worktrees — run multiple workflows in parallel |
| **Built-in workflows** | 19 (plan-to-pr, fix-issue, adversarial-dev, refactor, etc.) |

### How It Fits AI-Suplex

Archon can define AI-Suplex session execution as a **repeatable YAML workflow**:

```yaml
# .archon/workflows/ai-suplex-session.yaml
nodes:
  - id: load-context
    prompt: "Run 3lm start. Load semantic, episodic, procedural context."

  - id: execute-tasklist
    depends_on: [load-context]
    prompt: "Execute the active Tasklist. Capture artifacts, insights, B-Bombs."

  - id: end-session
    depends_on: [execute-tasklist]
    prompt: "Write Session End report. Run 3lm end to write episode."

  - id: extract-lessons
    depends_on: [end-session]
    prompt: "Run 3lm learn. Extract lessons from episode to lessons.md."

  - id: promote
    depends_on: [extract-lessons]
    prompt: "Run 3lm promote --min 70. Score and promote stable lessons."
    loop:
      until: NO_PROMOTABLE_ITEMS

  - id: revise
    depends_on: [promote]
    prompt: "Run 3lm revise. Check contradictions, update deprecation watch."

  - id: refresh-index
    depends_on: [revise]
    bash: "node scripts/3lm/3lm.js index"
```

**Use case for Custom Edition:** A client buys AI-Suplex Custom ($150+). You define their workflow as an Archon YAML file. They run `archon run ai-suplex-session` and the entire session loop executes deterministically. No CLI memorization. No manual steps. One command.

| Strength | Weakness |
|----------|----------|
| Deterministic, repeatable execution | Focused on coding workflows — needs adaptation for AI-Suplex |
| MIT license — fork and brand | Requires Claude Code ($) or other assistant setup |
| Web UI dashboard for clients | Complex setup — Docker, Postgres, Bun |
| Multi-platform (Slack, Telegram) | Overkill for simple client sessions |

**Verdict: Backend engine for Custom Edition workflows. Not a client interface.**

---

## 📋 Vibe Kanban — SUNSETTING ⚠️

**Source:** BloopAI/vibe-kanban | 26.9k stars | Open Source

| Feature | Detail |
|---------|--------|
| **What it is** | CLI-based kanban board for managing coding agents in parallel |
| **Status** | **Sunsetting.** Project continues as open source, community-maintained. Company winding down. |
| **Users** | 30,000 active users, 100,000 PRs created |
| **Assistants** | Claude Code, Codex, OpenCode |
| **Key feature** | Parallel agent execution with git worktree isolation |

### How It Fits AI-Suplex

Vibe Kanban was the closest thing to "project management for AI agents." Each AI-Suplex tasklist could be a kanban card. Each card spawns an agent that executes the session.

**BUT:** The project is dead. 26.9k stars and sunsetting means the company couldn't make money from it. Forking it means inheriting:
- No active development
- No security patches
- No community support
- Codebase you have to maintain alone

| Strength | Weakness |
|----------|----------|
| Perfect workflow for AI agent task management | **Project is dead.** Company sunsetting. |
| Large community (30k users) | Community will fragment without company backing |
| Open source — forkable | You inherit all maintenance |
| Works with multiple coding agents | Not worth forking a dead project |

**Verdict: ⚠️ AVOID. Dead project. Do not build on it.**

---

## 🖥️ Paseo — Agent Orchestration CLI

**Source:** paseo.sh | Proprietary (not open source?)

| Feature | Detail |
|---------|--------|
| **What it is** | CLI for managing AI coding agents from terminal. Multi-agent orchestration. |
| **Key commands** | `paseo run`, `paseo ls`, `paseo attach`, `paseo send` |
| **Assistants** | Claude, Codex |
| **Key feature** | One agent can spawn sub-agents for parallel work |
| **Security** | End-to-end encrypted remote daemon access |

### How It Fits AI-Suplex

Paseo is infrastructure, not an interface. Use it to run multiple AI-Suplex sessions in parallel across different client vaults:

```
paseo run "execute Client A's weekly review session"
paseo run "execute Client B's project kickoff session"
paseo ls   # Monitor both
```

The real value is **multi-agent workflows** — a lead agent (Orchestrator) spawns worker agents (Builders) for parallel task execution.

| Strength | Weakness |
|----------|----------|
| Clean CLI — simple commands | Not open source? License unclear |
| Multi-agent parallel execution | Developer tool, not client-facing |
| Remote daemon for distributed access | Requires $PASEO_HOST setup for remote |
| End-to-end encrypted | Limited to CLI — no web UI for clients |

**Verdict: Backend orchestration layer. Useful for running multiple Custom Edition sessions in parallel. Not a client interface.**

---

## 📊 Consolidated Recommendation

| Layer | Tool | Status | For AI-Suplex |
|-------|------|--------|--------------|
| **Client Interface** | AnythingLLM (MIT) | ✅ Recommended | Fork → brand → pre-configure. Desktop app for clients to query their vault. |
| **Workflow Engine** | Archon (MIT) | ✅ Recommended | Define AI-Suplex sessions as YAML workflows. Repeatable, deterministic execution. |
| **Agent Orchestration** | Paseo | 🟡 Evaluate | Multi-agent parallel execution. Useful at scale (5+ client vaults). |
| **Project Management** | Vibe Kanban | ❌ Dead | Sunsetting. Do not depend on it. |
| **Document Ingestion** | Docling (MIT) | 🟢 Optional | PDF/DOCX → markdown pipeline. |

## Custom Edition Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT SEES THIS                                            │
│  AnythingLLM fork — branded desktop app                      │
│  "Ask my workflow anything"                                  │
│  Workspace pre-configured for their project                  │
├─────────────────────────────────────────────────────────────┤
│  RUNS ON THIS (invisible to client)                          │
│  Archon workflow — deterministic session execution          │
│  1. Load context (3lm start)                                │
│  2. Execute tasklist (AI agent)                              │
│  3. End session (3lm end)                                   │
│  4. Extract lessons (3lm learn)                             │
│  5. Promote (3lm promote)                                   │
│  6. Revise (3lm revise)                                     │
│  7. Refresh index (3lm index)                               │
├─────────────────────────────────────────────────────────────┤
│  STORES IN THIS (canonical)                                  │
│  AI-Suplex vault — 3-layer memory stack                     │
│  Markdown files. Git-synced. Human-readable.                │
└─────────────────────────────────────────────────────────────┘
```

## Next Steps

1. **Fork AnythingLLM** — Brand it for AI-Suplex Custom Edition. MIT license. 2-4 hours.
2. **Evaluate Archon** — Install, test with a simple AI-Suplex workflow. MIT license. 1-2 hours.
3. **Skip Vibe Kanban** — Dead project. Don't invest time.
4. **Paseo for later** — Revisit when you have 5+ client vaults running in parallel.
