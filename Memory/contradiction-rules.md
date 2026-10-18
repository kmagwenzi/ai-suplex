# AI-Suplex Contradiction Rules

These rules define how to handle memory conflicts.

## Core Rule

Do not delete conflicting memory immediately.

Keep both versions until the system has enough evidence to decide.

## Conflict Resolution Order

When two memories conflict, resolve them in this order:

1. Prefer the version with stronger evidence.
2. Prefer the version repeated across more sessions.
3. Prefer explicit project rules over inferred behavior.
4. Prefer newer evidence only if it is clearly better.
5. Prefer procedural memory for workflows and semantic memory for stable facts.

## Deprecation Handling

If one memory replaces another:
- mark the older one as deprecated,
- keep it visible for one review cycle,
- remove or compress it only after replacement is confirmed.

## Contradiction Types

Common contradiction types include:
- naming changes,
- workflow changes,
- priority changes,
- user preference changes,
- scope changes,
- tool or infrastructure changes.

## Review Requirement

Any unresolved contradiction should be:
- surfaced in the next review,
- compared against recent sessions,
- and either promoted, revised, or deprecated.
