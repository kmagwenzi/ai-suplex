# Known issues — AI-Suplex 777 v2.10.0

> What does not work yet, written by us before a user finds it. Nothing here is
> hidden behind a promise. If an item matters to you, open an issue and it moves up.

## Verified working (2026-11-18)

A cold copy of this package — no `.git`, no `.obsidian`, no prior state — was
bootstrapped end to end:

    node Tools/initialise-vault.js      # period.md + 40 folders
    node Tools/vault-index.js --current # the file index
    node Tools/3lm.js start --context   # the first brief

All three completed. Node 20+ required (Node 22 tested).

## Not there yet

1. **No agent contract file.** `.ai-suplex/schema.json` does not exist, and
   `3lm doctor` / `3lm migrate` are not implemented. The vault has no machine-
   readable schema to validate against.
2. **No vault format version.** `release.json` carries the release version, but the
   vault format itself is not versioned, so a future structural change cannot be
   migrated safely.
3. **No desktop app in this package.** The Workflow Console ships separately (and
   only once it is packaged). This download is the vault: markdown, tooling, prompts,
   skills, templates.
4. **Ultra faculties are excluded by design.** Knowledge graph, router, wiki,
   opportunity mapper and Deep Ultra Mode live under `Tools/ultra/` in the full
   edition and are not part of 777.
5. **`Memory/procedural/` ships 16 example workflows.** They teach the shape of a
   procedural note. Treat them as examples, not as your data.
6. **Generated indexes are not shipped.** `Memory/vault-*.md` and the knowledge
   graph are regenerated from *your* vault — an index is a photograph of wherever it
   was taken, so shipping one would leak the author's contents.
7. **Cron / automation tasks need your own configuration.** The vault documents the
   ritual, it does not schedule itself.

## 777 v2.10.0 · 2026-11-18
