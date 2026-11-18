# AI-Suplex Procedural Memory — Fork-Target Selection

## Purpose
How to choose an open-source base to fork and productise — the criteria that decide whether a codebase is worth building a branded product on.

## Selection Criteria

| Factor | What to verify |
|--------|----------------|
| **License** | Permissive (MIT/Apache) → fork, rebrand, sell freely. Copyleft (AGPL/GPL) → check distribution obligations before forking |
| **Community** | Stars, active commits, healthy maintainer base — adoption is a maintenance signal |
| **Platform fit** | Runs natively where your users are (desktop, terminal, macOS/Linux/Windows) |
| **Brand potential** | Can it be fully rebranded without the base's identity leaking through? |
| **Reference implementations** | Adjacent projects that already solved a hard sub-feature — reimplementable under a permissive license |

## The Fork Pattern

Permissive base → fork → specialise → brand → sell. Choose the base for its mechanics, not its name; the product is the specialisation, not the code.

## What a forked product becomes

- One workspace per client or project.
- Pre-configured with your framework's CLI.
- Quick-switch between workspaces.
- Notifications when long tasks complete.
- Your branding, colours, name.

## Operating Rule

> **A fork decision is a maintenance commitment.** Check the license first, the community second, and the exit cost third. Never fork a project you would not maintain alone.

---

*Genericised 2026-11-18 — specific fork-target names and the product name removed; the selection method remains.*
