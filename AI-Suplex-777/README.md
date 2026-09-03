# AI-Suplex 7-7-7 — The Vault

This is the working vault: the files an agent reads and writes to run the AI-Suplex loop. See the [repository README](../README.md) for the big picture, the loop diagram, and the data model.

## Start here

```bash
node Tools/vault-index.js          # build the file index
node Tools/knowledge-graph.js --build-current   # build the knowledge graph
node Tools/3lm.js start            # load memory + context
```

Requires Node 22+.

## The structure

- `AGENTS.md` — how any agent operates this vault
- `Skills/` — the 12 AI skills (Orchestrator, Architect, Builder)
- `Prompt Patterns/` — copy-paste interaction patterns
- `Scripts/` — 24 Sweeper macros (file operations, MOCs, trackers)
- `Templates/` — session templates
- `Tools/` — `3lm` · `vault-index` · `knowledge-graph`
- `Memory/` — the 3-layer memory stack (episodic · semantic · procedural · lessons)
- `Guides/` — workflow guides
- `AI-Suplex Kick-start/` — methodology + the Deep Ultra 🦸 persona

*"Each new session starts smarter than the last."*
