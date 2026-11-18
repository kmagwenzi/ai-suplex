# AI-Suplex Procedural Memory — Client Interface & Orchestration Tool Evaluation

## Purpose
A reusable framework for evaluating tools as a client interface or agent-orchestration layer on top of the framework — written so the *method* (not a one-off verdict) is what transfers to the next evaluation.

## The Landscape (three layers)

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT-FACING (what clients see)                            │
│  A Q&A / chat layer — desktop app or web, natural language  │
├─────────────────────────────────────────────────────────────┤
│  AGENT ORCHESTRATION (what runs behind the scenes)          │
│  Workflow engines and multi-agent CLIs                      │
├─────────────────────────────────────────────────────────────┤
│  THE FRAMEWORK CORE (what you built)                         │
│  Memory stack + CLI + patterns                              │
└─────────────────────────────────────────────────────────────┘
```

## Evaluation Criteria (transferable)

For any candidate, answer these before deciding:

| Criterion | Question | Red flags |
|-----------|----------|-----------|
| **License** | Permissive, or copyleft? | Copyleft without a distribution plan |
| **Project status** | Actively maintained, or sunsetting? | "Community-maintained only", no recent commits |
| **Interface vs orchestration** | What does the client see vs what runs behind? | A tool sold as an interface that is really a dev CLI |
| **Setup cost** | Docker / DB / runtime burden | Heavy infra for a simple session |
| **Extensibility** | Can you define your own workflow (YAML/script)? | Closed process, no hooks |

## Worked example — four candidate classes

- **Q&A / client interface (e.g. a permissive desktop app):** a display layer — fork, brand, pre-configure workspaces. It reads what the framework writes; it never replaces the memory pipeline.
- **Workflow engine (e.g. a YAML-defined harness):** a deterministic *backend* — express the session loop (start → execute → end → learn → promote → revise → index) as a workflow a client runs with one command.
- **Multi-agent CLI (e.g. an orchestration tool):** useful at scale — a lead agent spawns worker agents across parallel vaults. Infrastructure, not an interface.
- **Sunsetting tool:** even with a large community, a project whose company is winding down means you inherit all maintenance. Check status before building on it.

## Selection matrix (shape to copy)

| Layer | Candidate class | Fit |
|-------|-----------------|-----|
| Client interface | Permissive Q&A desktop app | Fork → brand → pre-configure |
| Workflow engine | YAML-defined harness | Backend — deterministic session execution |
| Orchestration | Multi-agent CLI | Scale — parallel vaults |
| Document ingestion | MIT markdown converter | Optional — non-markdown → markdown |

## Operating Rule

> **License first, status second, fit third.** Never build on a tool you would not be willing to fork and maintain alone; and never let a display layer replace the memory pipeline — it reads, the framework writes.

---

*Genericised 2026-11-18 — named tool verdicts and product-specific pricing removed; the evaluation method remains.*
