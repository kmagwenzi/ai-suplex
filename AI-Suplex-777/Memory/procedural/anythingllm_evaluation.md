# AI-Suplex Procedural Memory — AnythingLLM Evaluation

## Purpose
Evaluate AnythingLLM (Mintplex Labs, MIT-licensed, local-first desktop app) as a complementary semantic search and Q&A layer on top of the AI-Suplex 3-layer memory stack.

## What AnythingLLM Is

| Feature | Detail |
|---------|--------|
| **Type** | Desktop app (Electron), also self-hosted (Docker) and cloud |
| **License** | MIT — fully open source |
| **LLM support** | Local (Ollama, LM Studio) or cloud (OpenAI, Claude, Azure, AWS) |
| **Document support** | PDF, DOCX, CSV, TXT, MD, codebases, websites |
| **Vector DB** | LanceDB (default, local), Pinecone, Chroma, Weaviate, Qdrant |
| **Privacy** | Everything runs locally by default. No account needed. |
| **Workspaces** | Isolated knowledge bases — one per project, client, or vault |
| **Agent skills** | Community hub with custom agents, slash commands, system prompts |
| **API** | Developer API for custom integrations |

## How It Sits on Top of AI-Suplex

```
┌─────────────────────────────────────────────────────────┐
│  ANYTHINGLLM — Semantic Search & Q&A Layer              │
│  "What did I learn from the launch session?"             │
│  "What are my preferences for file structure?"          │
│  "Which sessions had the highest scores?"               │
├─────────────────────────────────────────────────────────┤
│  AI-SUPLEX 3-LAYER MEMORY STACK                         │
│  Episodic → Semantic → Procedural + Lessons             │
│  Structured files. Promotion pipeline. 3lm CLI.         │
└─────────────────────────────────────────────────────────┘
```

AnythingLLM is the **query interface.** AI-Suplex is the **memory engine.** They don't compete — they complement.

## Complementary vs Competitive Analysis

| Aspect | AI-Suplex | AnythingLLM | Relationship |
|--------|-----------|-------------|-------------|
| **Memory storage** | Structured markdown files | Vector embeddings | Different layers |
| **Memory retrieval** | `3lm start` — file-based loading by cycle/week | Natural language Q&A across all files | Complementary |
| **Knowledge creation** | Sessions → episodes → lessons → promote | Document ingestion → chunking → embedding | Different inputs |
| **Self-improvement** | Promotion pipeline, scoring, contradiction handling | None — static search/retrieval | AI-Suplex is unique here |
| **Interface** | CLI (`3lm`), Prompt Patterns, vault browser | Desktop app, chat UI, API | Different UX |
| **Setup** | Node.js, markdown files | Install desktop app, point at folder | AnythingLLM is simpler |

**Verdict: Complementary.** AI-Suplex structures knowledge and self-improves. AnythingLLM queries it. You don't replace one with the other — you use both.

## Specific Use Cases

### 1. Cross-Session Q&A

```
Question: "What did I decide about the CortexMem architecture?"
AI-Suplex (manual): Browse memory/semantic/project_rules.md → read line about CortexMem
AnythingLLM: Ask naturally → "CortexMem is an optional bridge for selected high-value context. 
  The markdown vault is canonical. Only 5 use cases: decisions, constraints, preferences, 
  summaries, bridge continuity."
```

### 2. Pattern Discovery Across Episodes

```
Question: "What themes repeat across my last 3 sessions?"
AI-Suplex (manual): Read 3 episodic files → manually compare lessons
AnythingLLM: Ask → "Repeated themes: architecture decisions made incrementally, 
  promotion pipeline was hardest to design, files-first = fast iteration"
```

### 3. Onboarding / Quick Reference

```
Question: "How do I start a session?"
AI-Suplex (manual): Read procedural/session_start.md
AnythingLLM: Ask → "1. Read active Tasklist. 2. Confirm ready. 3. Load semantic + episodic. 
  4. Create session start file. 5. Mark Tasklist as in execution."
```

### 4. Weekly Review Assistance

```
Question: "Summarize the last week's sessions and highlight promotion candidates."
AnythingLLM: Reads 3 episode files → "Session 1 (marathon, score 95): 6 lessons, 
  4 candidates. Session 2 (patterns, score 90): 4 lessons. Promotion candidates: 
  'Graphify excluded' (score 75, ready for semantic), 'Every pattern needs 
  MEMORY LOOP' (score 60, keep as candidate)."
```

## Where AnythingLLM Falls Short (AI-Suplex Wins)

| AI-Suplex Does This | AnythingLLM Doesn't |
|---------------------|---------------------|
| Scores lessons and promotes winning patterns | Static search — no learning from use |
| Handles contradictions (deprecate, don't delete) | No memory governance |
| Organizes by Cycle/Week for temporal retrieval | Flat vector search only |
| Files-first — git-friendly, human-readable | Vector DB — opaque, not git-friendly |
| Self-improves — each session starts smarter | Same results every time |

## Setup for AI-Suplex Users

```
1. Install AnythingLLM Desktop (free)
2. Create workspace: "AI-Suplex Memory"
3. Point it at your AI-Suplex-777/ folder
4. Wait for ingestion (embeds all .md files)
5. Ask your first question: "What are my preferences?"
   → Should answer from memory/semantic/preferences.md
6. Ask: "What are my active tasklists?"
   → Should list Tasklists/Active/ contents
7. Ask: "What lessons are ready for promotion?"
   → Should summarize memory/lessons.md
```

## Recommendation

| Audience | Recommendation |
|----------|---------------|
| **Core Edition users** | Not needed — Core is flat and small. Folders are enough. |
| **7-7-7 Edition users** | Optional enhancement. The vault works without it, but AnythingLLM makes cross-session Q&A effortless. |
| **Power users / developers** | Strongly recommended. Semantic search across a growing vault (>20 episodes) becomes essential. |
| **AI-Suplex as product** | Mention AnythingLLM in the "Power User" section of the guides. Not a dependency — an acceleration layer. |

## Operating Rule

> **AI-Suplex structures the knowledge. AnythingLLM queries it. The vault is canonical — AnythingLLM answers from it, but AI-Suplex writes to it. Do not let AnythingLLM answers replace the promotion pipeline.**
