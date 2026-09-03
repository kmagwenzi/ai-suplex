# AI-Suplex Procedural Memory — Client Interface via AnythingLLM

## Purpose
Define how AnythingLLM (or a custom fork) serves as a client-facing interface on top of the AI-Suplex vault — transforming the structured memory layer into a natural language Q&A system that clients can query without technical knowledge.

## The Model

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (Non-Technical)                                      │
│  "What did we complete this week?"                           │
│  "Show me the timeline."                                     │
│  "What are the next steps?"                                  │
├─────────────────────────────────────────────────────────────┤
│  CLIENT INTERFACE — AnythingLLM / Custom Fork                │
│  • Workspace per client                                      │
│  • Natural language Q&A                                      │
│  • Zero training required                                    │
│  • Reads from synced vault folder                            │
├─────────────────────────────────────────────────────────────┤
│  AI-SUPLEX VAULT — Structured Memory (Builder Side)          │
│  • Sessions executed per client focus                        │
│  • Episodes capture what happened                            │
│  • Semantic stores client rules/preferences                  │
│  • Procedural encodes repeatable client workflows            │
│  • Promotion pipeline keeps knowledge current                │
└─────────────────────────────────────────────────────────────┘
```

## Procedure

### Server Side (You — the Builder)

1. Assign each client a focus area in `Focuses.md`
2. Execute sessions tagged to that client's focus
3. Write Session End reports in plain client language
4. Run `3lm end → learn → promote` after each session
5. Sync the vault folder to a shared location (Git, Syncthing, cloud drive)

### Client Side (Them — the Consumer)

1. Install AnythingLLM Desktop (or your branded fork)
2. Point workspace at the synced vault folder
3. Ask questions in natural language

### Example Q&A Flow

```
Client: "What did you work on this week?"

AnythingLLM → Reads latest episodic file for their focus
           → "Session completed: Website Redesign Phase 2. 
              Score: 90/100. Completed: responsive navigation, 
              contact form, mobile header. Incomplete: 
              footer widget (waiting on assets). 
              Next action: implement footer widget on Monday."

Client: "What did we decide about the brand colors?"

AnythingLLM → Reads memory/semantic/client_rules.md
           → "Brand colors: primary #1a1a2e (navy), 
              accent #e94560 (coral red), neutral #f5f5f5. 
              Decided in Session 3, Week 2. Font pairing: 
              Inter (headings) + Source Sans Pro (body)."
```

## Use Cases

| Client Type | Key Questions | Value |
|-------------|-------------|-------|
| **Freelance client** | "What did you work on this week? What's next?" | Replaces status emails and update calls |
| **Product client** | "What features are done? What's blocked?" | Real-time project dashboard, no spreadsheets |
| **Consulting client** | "What did we decide about X? What were your recommendations?" | Preserves decision history, prevents re-litigation |
| **Agency client** | "Show me deliverables from the last sprint." | Portfolio of B-Bombs and artifacts, queryable |
| **Ongoing retainer** | "How many sessions did we run this month? What was the ROI?" | Transparent billing, demonstrable progress |

## Money Models

| Model | How It Works | Client Value |
|-------|-------------|--------------|
| **Premium Add-On** | Client gets AnythingLLM workspace as part of your service | Transparent project management |
| **Branded Fork** | Your own branded version of AnythingLLM (MIT license allows this) | Professional, white-labeled experience |
| **Managed Service** | You host the vault + interface; client accesses via web/desktop | Zero setup for client |
| **Per-Project Pricing** | One workspace = one project. Client pays per active project. | Scaled pricing, clear ROI |

## Setup Notes

- **AnythingLLM is MIT-licensed** — you can fork, modify, brand, and distribute
- **Workspaces are isolated** — Client A cannot see Client B's vault data
- **Vault stays canonical** — AnythingLLM reads from it, but doesn't write to it. The promotion pipeline remains yours.
- **Syncing options:** Git (free, version control), Syncthing (real-time, peer-to-peer), cloud drive (simple, built-in)

## Operating Rule

> **The vault is yours. The answers are theirs. AnythingLLM reads what AI-Suplex writes. Never let the client interface replace the memory pipeline — it's a display layer, not the engine.**
