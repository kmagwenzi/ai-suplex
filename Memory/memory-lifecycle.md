# AI-Suplex Memory Lifecycle

This file defines how memory moves through the AI-Suplex system over time.

## Lifecycle Model

AI-Suplex memory follows a simple loop:

1. Capture.
2. Compress.
3. Classify.
4. Promote or deprecate.
5. Index.
6. Reuse.

The goal is to turn lived execution into durable, reusable operating knowledge.

## Capture

Capture happens during and after a session.

Captured material includes:
- the active Tasklist,
- the Session Start file,
- the Session End report,
- produced artifacts,
- insights,
- B-Bombs,
- explicit decisions,
- explicit constraints,
- explicit preferences.

## Compress

Compression reduces raw execution into a smaller and more useful form.

Compression outputs include:
- episode summaries,
- lesson candidates,
- workflow candidates,
- stable facts,
- deprecation candidates.

Compression should preserve what matters and discard noise.

## Classify

Every candidate memory item should be classified into one of these states:

- **Temporary** — useful now, but not ready for long-term storage.
- **Candidate** — likely useful, but not yet proven.
- **Stable** — repeatedly true and ready for durable memory.
- **Deprecated** — superseded by better evidence.
- **Archived** — historical only.

Classification is what keeps the vault useful instead of bloated.

## Promote

Promotion moves memory into the right long-term location.

### Promote to Semantic Memory
Use semantic memory for:
- durable facts,
- user preferences,
- naming conventions,
- project truths,
- stable constraints.

### Promote to Procedural Memory
Use procedural memory for:
- repeatable workflows,
- session patterns,
- review routines,
- prompt patterns,
- execution playbooks.

### Keep in Lessons
Use `memory/lessons.md` for:
- promising ideas,
- partial patterns,
- notes that need more evidence.

## Deprecate

Deprecation marks memory that is no longer the best version.

A memory item should be deprecated when:
- a newer rule replaces it,
- the workflow changes,
- evidence consistently contradicts it,
- or it no longer fits the current system.

Deprecated items should remain visible until the next review cycle confirms replacement.

## Index

The memory index should point to the most relevant active files.

The index is not a store of knowledge.

It is a map for fast loading.

## Reuse

Reusable memory should be loaded into future sessions only when needed.

Prefer loading:
- the smallest relevant set,
- the most stable files,
- the current cycle/week context,
- the active procedural rules for the task.

Reuse should improve speed without reintroducing clutter.

## CortexMem Bridge

Cortexmem may be used as a bridge for:
- explicit decisions,
- explicit constraints,
- explicit preferences,
- compact session summaries,
- fast capture of important state.

Cortexmem is not the canonical memory store.

The markdown vault remains the source of truth.

## Review Rule

Memory must be reviewed on a schedule.

- Review every session.
- Review weekly.
- Review again at cycle boundaries.

If memory is not reviewed, it will drift.

## Operating Rule

Do not treat memory as a dump.

Treat memory as a curated system that gets better through repeated use, review, and promotion.

## Outcome

When this lifecycle works properly:
- sessions become better organized,
- repeated mistakes decrease,
- good workflows become standard,
- and AI-Suplex improves from its own history.
