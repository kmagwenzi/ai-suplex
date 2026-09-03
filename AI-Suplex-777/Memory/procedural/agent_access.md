# AI-Suplex Procedural Memory — Agent Access Protocol

## Purpose
Define how any AI coding agent (Zed, Claude Code, Cursor, Codex, OpenCode) can programmatically access and operate the AI-Suplex vault — reading memory files, executing sessions, and running the full self-improving loop.

## Architecture

AI-Suplex is **agent-ready by design.** The vault is markdown-first and filesystem-based. Any agent that can read/write files and execute commands has full vault access — no Obsidian plugin, local server, or special API required.

```
┌──────────────────────────────────────────────┐
│  AI AGENT (Zed, Claude Code, Cursor, Codex)  │
│                                              │
│  Capabilities needed:                        │
│  • Read files (read_file / cat)              │
│  • Write files (write_file / edit_file)      │
│  • Search files (grep / find)                │
│  • Execute commands (terminal / exec)        │
└──────────────────┬───────────────────────────┘
                   │ operates on
                   ▼
┌──────────────────────────────────────────────┐
│  AI-SUPLEX VAULT (markdown-first)            │
│                                              │
│  memory/         — 3-Layer Memory Stack      │
│  Tasklists/      — Execution plans            │
│  Sessions/       — Active/Archived sessions  │
│  Artifacts/      — Work-in-progress assets   │
│  Prompt Patterns/ — 10 upgraded patterns      │
│  scripts/3lm/    — Vault operations CLI       │
└──────────────────────────────────────────────┘
```

## Procedure

### Session Start

**Agent loads context:**
```
1. Run: node scripts/3lm/3lm.js start
   → Loads semantic + lessons + recent episodic + procedural
   → Shows active tasklists
2. Read: Sessions/Active/Start/{latest-session}.md
   → The active mission
3. Read: Tasklists/Active/{tasklist}.md
   → What needs to be done
```

### During Session

**Agent operates the vault:**
```
Read files:   read_file memory/semantic/preferences.md
Write files:  write_file Artifacts/Cycle-1/Week-4/new-artifact.md
Search:       grep "promotion" memory/lessons.md
Edit:         edit_file memory/lessons.md
Create dirs:  mkdir -p memory/episodic/Cycle-1/Week-5
```

### Session End

**Agent closes the loop:**
```
1. Write Session End report to Sessions/Active/End/
2. Run: node scripts/3lm/3lm.js end
   → Reads report → writes episodic file → scores outcome
3. Run: node scripts/3lm/3lm.js learn
   → Extracts lessons → appends to memory/lessons.md
4. Run: node scripts/3lm/3lm.js index
   → Refreshes memory/index.md
```

### Weekly Review

**Agent promotes and revises:**
```
Run: node scripts/3lm/3lm.js promote --min 70
Run: node scripts/3lm/3lm.js revise
Run: node scripts/3lm/3lm.js index
```

## Rules

- **Vault is canonical** — Agent operates on markdown files directly, not through an API abstraction
- **3lm is the entry point** — All memory operations go through 3lm or direct file I/O
- **No plugin required** — The agent doesn't need Obsidian plugins. The filesystem is the interface
- **CortexMem is optional** — Agent can use `cm` for fast bridge capture if available, but it's not required
- **Agent writes, human reviews** — Agent-generated files (episodes, lessons) are human-readable. Review before promotion

## Notes

AI-Suplex was architected for agent access from the start. The files-first, markdown-first design means no impedance mismatch between what the agent does (read/write files) and what the vault is (a folder of markdown files). Other tools require Obsidian plugins, local servers, or proprietary APIs. AI-Suplex requires a filesystem and Node.js.

**This agent (Zed/DeepSeek) validated the full protocol on June 6, 2026** — read memory files, wrote tasklists, created sessions, ran 3lm commands, and operated the complete self-improving loop. Zero additional tools required.

**Vault Size:** Agent can handle any number of files. Context loading is bounded by `3lm start` (loads only semantic + lessons + 3 episodes + procedural), so even 1000 episodes won't overwhelm the agent.
