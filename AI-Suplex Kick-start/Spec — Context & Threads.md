---
type: spec
title: "Spec — Context & Threads"
version: 2.1
date: 2026-10-18
revised: 2026-10-18
edition: 7-7-7
status: active
cycle: 2
week: 7
focus: ai-engineering
tags: [spec, context, threads, instances, parallelism, write-scope, producer-committer, cloudroom, as-mc, save-context, architecture]
supersedes: "v1.0 (2026-09-23) — preserved in git history and summarised in §1"
authority_note: "RATIFIED + CANONICAL 2026-10-16. The sweep (§9) landed; AGENTS.md -> Execution Threads (4) mirrors this spec exactly."
key_insights: "Threads are lanes; instances are windows. project-tasks and random-tasks run N concurrent instances, each owning ONE ephemeral, instance-scoped context file; daily-tasks and realist stay single. The context file stops being memory and becomes a session slot — durable state lives in Memory/, Projects/*Spec.md and the project tasklist. A writer class (producer vs committer) lets Cloudroom cloud agents run against the vault without forking the one memory."
next_actions: "v2.1 (2026-10-18): plural lane names (project-tasks · random-tasks) with legacy prefixes parsed forever. v2.0 landed 2026-10-16 and shipped to 777 as v2.7.0."
---

# 🧵 Spec — Context & Threads (v2.0)

**Definition-level.** The rules an agent must follow to run the thread model correctly — *without reading a chat log.*

**Companion:** `Guides/Guide — Context & Threads.md` (the practical, step-ordered version for the Hustler).
**Canonical:** `AGENTS.md` → *Execution Threads (4)*. This spec mirrors it and adds the rationale.

> [!success] ✅ **Canonical — 2026-10-16 · Cycle 2, Week 7**
> The sweep (§9) **landed** 2026-10-16 — spec + patterns + skill + guide + `Tools/3lm.js threads` + `AGENTS.md` (Execution Threads 4) — and shipped to the 777 repo as **v2.7.0**.
> This spec is **authoritative**; it mirrors `AGENTS.md` exactly. v1.0 (2026-09-23) is preserved in git history and summarised in §1.
>
> **v2.1 — 2026-10-18 (the pluralisation delta):** lanes are **plural nouns** — `project-tasks` (was `long-running-tasks`) and `random-tasks` (was `random-task`). **Both legacy prefixes parse forever** (R10); only new files take the new prefix. No structural change to the thread model.

---

## 0 · The one-line change

**v1.0:** four threads, each exactly **one** context file.
**v2.0:** **threads are lanes; instances are windows.** `project-tasks` and `random-tasks` run **N concurrent instances** — each owning **one ephemeral, instance-scoped context file**. `daily-tasks` and `realist` stay single.

**v2.1:** **lanes are plural nouns.** `long-running-tasks` → **`project-tasks`**; `random-task` → **`random-tasks`**. Legacy prefixes are parsed forever, written never (R10).

And the deeper shift: **the context file stops being memory.** It becomes a **session slot** — cheap, regenerable, archived on close. Durable state lives in `Memory/`, `Projects/*Spec.md`, and the project tasklist.

---

## 1 · Why threads exist

AI-Suplex runs more than one body of work at the same time. A day's execution, a multi-session build, a one-off job, and an execution audit all want to be *open* — and each writes context to disk.

### The v1.0 incident — four writers, one file

> [!warning] The incident that produced v1.0 (2026-09-23)
> A context brief written for the **Sep 18** session was still being surfaced after the week had moved on. Nothing errored. The system confidently reported a world that no longer existed.
>
> The fix was not "be careful" — **per-thread files make ownership explicit: whoever owns the thread owns the file.**

### The v2.0 defect — day-scope was doing workstream-scope's job

> [!warning] What v2.0 fixes
> v2.1 (2026-10-06) added the rule *"later saves the same day **append** to the current file."* That rule silently assumed **one workstream per thread per day.**
>
> **The evidence:** the live `random-task` brief held the **router + decision layer**, then *appended* the **vault migration**, the **Ultra offer**, *and* the **Cloudroom research** — four missions wearing one filename. Nothing errored. It was simply no longer one thing.
>
> **The fix:** append is scoped to an **instance**, never across instances. A new window is a new instance is a new file.

### The v2.0 pressure — Cloudroom

**Cloudroom** (open-source cloud agents, Apache-2.0, Hermes-native) runs **one isolated sandbox + one Git branch per agent.** That is the worktree model v1.0 §R5 **rejected** — arriving one level down, automatically, at scale.

> [!important] The integration constraint
> Cloudroom wants *many* agents on *branches*; AI-Suplex wants *one memory with one writer*. The integration is safe **only** if every cloud agent is a **producer, never a committer.** That is why v2.0 adds a **writer class** (R8).
> Source: `Artifacts/2026-2027/Cycle 2/Week 7/2026-10-15-1503-cloudroom-as-mc-fit-and-saas-opportunity-ai-engineering.md`

---

## 2 · The four threads

| Thread | Purpose | Context prefix | Instances | Writes `AGENTS.md`? |
|--------|---------|----------------|-----------|---------------------|
| **Daily tasks** | the day's execution — **the primary thread** | `daily-tasks-` | **1 (singleton)** | ✅ **yes — sole writer** |
| **Project tasks** | a multi-session build (company site, AS MC) — *was "long-running tasks"* | `project-tasks-` | **N** | ❌ no |
| **Random tasks** | one-off / misc jobs (config, tooling, PRDs) | `random-tasks-` | **N** | ❌ no |
| **Realist** | the execution audit — persona: The Realist | `realist-` | **1 (singleton)** | ❌ no |

**Each instance owns exactly one context file and one write-scope.**

> **Lanes are plural nouns** — `daily-tasks` · `project-tasks` · `random-tasks`. The prefix is the ownership **glob** (`{thread}-*`), so the morphology costs nothing: one token, parsed everywhere. `realist` is the singleton exception — a *persona*, not a lane.
>
> **v2.1 correction (2026-10-18).** `random-task` was singular in v1.0–v2.0 for no reason beyond inheritance: a filename token coined before the thread model existed, then frozen by a circular note that read *"the prefix stays singular — forking the token breaks selection."* That sentence forbids **forking**, not singularity; the glob argument works identically for either spelling. Meanwhile the command surface already said ***Random Tasks*** (plural) while the disk said `random-task-*`. The token is now plural.

---

## 3 · The rules

### R1 — One instance = one context file

A **thread instance** writes its own prefixed file in `Context Kick-start/Active/` and archives **only its own** file **on close**.

**Never archive, overwrite, or edit another instance's context file** — not even another instance of the *same* thread. Ownership is by filename, and it is absolute.

> ⚠️ **One file, one writer.** Your first instinct — *one shared file, one section per instance* — is **rejected**. Two windows appending to sections of one file is two writers to one file; a markdown append is not atomic, so the loss is silent. That is the 2026-09-23 incident rebuilt deliberately. **Sections belong *inside* an instance file — never across instances.**

### R2 — The Active Mission Context has a single writer: the daily-tasks thread

`AI-Suplex Kick-start/Context Kick-start/Active Mission Context.md` is refreshed **only** by the daily-tasks thread.

**Why:** four writers to one section is not a merge conflict — it is a **losing argument**. The section is a snapshot of *the* live mission. With four authors it becomes an average of four partial views, and an average of missions is not a mission. **One writer, one truth.**

Every other thread states plainly: **"AGENTS.md unchanged (not the daily-tasks thread)."**

### R3 — Filename convention

```
Context Kick-start/Active/{thread}-{ref}-{slug}.md
Context Kick-start/Archived/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md
```

| Part | Rule |
|------|------|
| `{thread}` | the exact prefix: `daily-tasks` · `project-tasks` · `random-tasks` · `realist` — **plus the parse-only legacy tokens** `long-running-tasks` · `random-task` (R10) |
| `{ref}` | short ordinal, **per thread, reset per day** (R9). Singletons omit it. |
| `{slug}` | kebab-case, **stable for the instance's life**. The *current* mission lives in frontmatter — **never rename the file to follow the mission.** |

```
Context Kick-start/Active/
├── daily-tasks.md                              ← singleton: no ref, no slug
├── realist.md
├── random-tasks-1-vault-migration.md
├── random-tasks-2-cloudroom-spike.md
├── project-tasks-1-on-ramp.md
└── project-tasks-2-cockpit.md
```

**Parse:** `^(daily-tasks|project-tasks|long-running-tasks|random-tasks|random-task|realist)-(\d+)-(.+)\.md$` — anchor-safe and human-typable. **The alternation is the contract:** new tokens first, legacy tokens after, one pattern in `Tools/3lm.js` **and** `Tools/asmc.js`.
**Singletons** keep v1.0 names (`daily-tasks.md`, `realist.md`).

### R4 — Ownership + archive rule (instance-scoped)

**An instance archives only itself, and only on close.**

| Event | Action |
|-------|--------|
| **Window opens** | AS MC allocates `{ref}`, creates `Active/{thread}-{ref}-{slug}.md`, `status: open` |
| **During the session** | **append in place** — this is where the "section" idea is correct |
| **Window closes** | `status: closed` → move to `Archived/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md` |

The v2.1 "first save of the day archives, later saves append" rule is **retired.** Append is now scoped to the instance; a **new window is a new file**, not an append.

### R5 — Write-scope partitioning (one tree, one branch)

**The vault stays on one tree and one branch.** Threads are partitioned by **write-scope**, not by branching the vault's memory.

> [!important] Worktrees were considered and **rejected** (v1.0, reaffirmed v2.0)
> A git worktree — or a Cloudroom sandbox branch — per agent looks tidy and breaks the premise. The vault's value is that **memory is shared**; a branch per thread forks `Memory/`, the knowledge graph, and the index, so each thread compounds against a different truth and the graph becomes N partial graphs.
>
> **Partition the writing, never the memory.**

### R6 — A session is closed by the commit, not the file

Writing the context file does **not** close a session. The session ends when the work is committed:

```
Session End → 3lm end → 3lm learn → 3lm index → 3lm sync
```

**One `3lm sync` at a time.** With N instances the AS MC is the **serializer**. A context file without a commit is a draft.

### R7 — Where the Realist fits

The Realist is **a specialization of the Orchestrator** (strategy · planning · review) — **not a fifth role, not an instance.**

| | |
|---|---|
| **Cadence** | **Twice weekly** — Tuesday (after the Reset, before the tasklist) and Saturday evening / Sunday afternoon |
| **Thread** | **Always its own.** Never the daily or build thread |
| **Writes** | A **five-line log** to `Reviews/Realist/<YYYY-Www>.md` — **nothing else**, and no context file |
| **Boundary** | **Prescribes** what should change; **never produces** a tasklist, spec, or artifact |

> **The dividing line:** *The Realist decides WHAT should change. The Orchestrator and Architect decide HOW.*

### R8 — Writer class: producer vs committer *(new in v2.0)*

Every instance declares its class in frontmatter. **This is the Cloudroom firewall.**

| Capability | **Producer** (cloud agent · research window) | **Committer** (laptop · AS MC on the main tree) |
|---|---|---|
| Its **own** instance file | ✅ | ✅ |
| Artifacts / insights | ✅ | ✅ |
| `Memory/` · `3lm index` · lessons | ❌ | ✅ **sole writer** |
| Active Mission Context (`AGENTS.md`) | ❌ | ✅ |
| `B-Bombs/` | ❌ | ✅ (human gate) |
| `3lm sync` | ❌ | ✅ **serialized — one at a time** |

**A producer returns a file; the committer lands it.** Unpartitioned, a cloud agent that commits forks the memory — the exact failure R5 exists to prevent.

### R9 — `ref` allocation *(new in v2.0)*

| | |
|---|---|
| **Authority** | the **AS MC** (`ai-suplex` Hermes profile) allocates `{ref}` at instance open |
| **Fallback** | the **Hustler** — for **777-Edition** deployments **without an AS MC** |
| **Scope** | per thread |
| **Reset** | **per day** — the first instance of a thread each day is `1` |
| **Reuse** | never reused within the same day for the same thread |
| **Uniqueness** | the companion archive date (`Archived/{YYYY-MM-DD}-…`) makes cross-day names globally unique |

**Why an allocator:** a bare counter as *identity* is weak — two windows can both believe they are `1`. As a **session slot** with a single allocator, it is exactly right. Identity lives in `Memory/`, the specs, and the tasklist; the ref is a handle.

### R10 — Legacy prefixes are read-only *(new in v2.1)*

A prefix rename is **additive**. The tooling accepts both tokens; only **new** files are written with the new one.

| Token | Status | Written? | Parsed? |
|---|---|---|---|
| `project-tasks` | current | ✅ | ✅ |
| `long-running-tasks` | **legacy** | ❌ never | ✅ **forever** |
| `random-tasks` | current | ✅ | ✅ |
| `random-task` | **legacy** | ❌ never | ✅ **forever** |

**Why:** 29 historical files depend on the old tokens — archived briefs, episodes, artifacts, session reports. If `INSTANCE_RE` drops a legacy alternative, `threads --list` returns a **shorter list**, nothing throws, and the loss is invisible. That is the same silent-parse failure class already fixed in `parseFrontmatter` (block lists dropped, lessons silently zeroed).

**Test the legacy path, not just the new one.** A migration that only asserts the new prefix proves nothing about the files it may have orphaned.

---

## 4 · The context file contract

Produced by `Prompt Patterns/📄 Pattern - Save Context.md` (v3, instance-aware).

**Frontmatter:**

```yaml
---
thread: project-tasks        # the lane
instance: 1                  # the ref (R9) — omit for singletons
mission: "Vault migration"   # the CURRENT mission; may change
slug: vault-migration        # matches the filename; never changes
status: open                 # open | closed
writer: committer            # committer | producer   (R8)
agent: local                 # local | cloudroom
opened: 2026-10-16T06:10
cycle: 2
week: 7
parent: null                 # prior instance file when resumed
---
```

**Required sections (unchanged):** What Was Accomplished · Current State · What the AI Needs to Know Next Session · Quick Links · Next Actions.

**Content rules:**
1. **Name terminal states explicitly** — `PUBLISHED` · `SENT` · `SUBMITTED` · `CLAIMED` · `PAID`. **"Ready" is not a state.**
2. **Cite task IDs** — context without traceability is a rumour.
3. **Point at the durable layer.** The brief is disposable — its `Next Actions` must link to the **spec / tasklist / artifact** that actually holds the memory.

---

## 5 · Discovery & resolution

**Active files stay canonical** — ownership is the filename, not a database row.

**A generated projection** `Context Kick-start/Active/_instances.md` lists the open set:

| ref | thread | slug | opened | writer | agent | status |
|-----|--------|------|--------|--------|-------|--------|

> **A projection, never hand-edited** — the same rule as `MOCs/Outreach Board.md`. A hand-written registry would be a second writer to one file, which R1/R2 forbid. Generated by `node Tools/3lm.js threads --list`.
>
> ⚠️ **The projection is excluded from the staleness scan.** `3lm`'s guard takes the newest `.md` in `Active/` (`3lm.js:221–243`); a regenerated `_instances.md` would otherwise **mask a genuinely stale brief**. The builder must filter it (§9 #7). Selection globs (`{thread}-*`) already exclude it — only the guard needs the fix.

**Kickstart resolution:**

| Form | Behaviour |
|------|-----------|
| `Kickstart(Daily Tasks)` | singleton — unchanged |
| `Kickstart(Project Tasks)` | list open instances · **one** → load it · **many** → ask |
| `Kickstart(Long Running Tasks)` | **legacy alias** — accepted, routed to `project-tasks` |
| `Kickstart(Random Tasks: vault-migration)` | select by **slug** |
| `Kickstart(Random Tasks: 2)` | select by **ref** |

---

## 6 · Failure modes this spec prevents

| Failure | Cause | Rule |
|---|---|---|
| Stale context acted on as current | Two threads writing one file | R1 |
| Silent loss from a shared-file append | Two instances writing sections of one file | R1 |
| `AGENTS.md` averaging four partial missions | Four writers, one section | R2 |
| A thread deleting another's live context | Archive by recency instead of ownership | R4 |
| Multi-mission files ("four missions, one filename") | Day-scope doing workstream-scope's job | R4 |
| Memory diverging into N partial truths | Branching/sandboxing the memory | R5, R8 |
| A legacy prefix silently stops parsing | `INSTANCE_RE` rewritten as a replacement instead of an alternation | R10 |
| A cloud agent forking the vault | Producer committing to `Memory/` | R8 |
| Two windows both claiming `ref 1` | No allocator | R9 |
| "Done" that was never committed | Treating the file as closure | R6 |
| The audit becoming a content factory | The Realist producing instead of prescribing | R7 |

---

## 7 · Invariants

1. An instance's **filename** identifies exactly one owning instance.
2. **Exactly one** thread writes `AGENTS.md` — `daily-tasks`.
3. The vault is **one tree, one branch, one memory.**
4. **One `3lm sync`** at a time.
5. A session is closed by a **commit**.
6. The Realist **prescribes**; the Orchestrator and Architect **produce**.
7. A **producer** never writes `Memory/`; a **committer** lands it.
8. **One file, one writer** — sections never span instances.

---

## 8 · Relationship to the AS MC

`Spec — AI-Suplex Mission Control (AS MC)` **inherits** this spec (§4 and §8.2 now delegate here). **§9 has landed** — the AS MC is the R9 **allocator** and the R6 **sync serializer**, so the AS MC briefs and crons run correct under parallelism.

---

## 9 · The sweep — implementation plan

> **Status: ✅ landed 2026-10-16.** Every item shipped, tested (11/11 + eval 34/34), and promoted to the 777 repo as **v2.7.0** (the threading release).

| # | Artifact | Change | Owner |
|---|----------|--------|-------|
| 1 | `AGENTS.md` → *Execution Threads (4)* | mirror R1 · R3 · R4 · R8 · R9 | daily-tasks thread |
| 2 | `Prompt Patterns/📄 Pattern - Save Context.md` | **→ v3** — instance-scoped, writer class, close-archives | Builder |
| 3 | `Skills/Builder – Save Context.md` | **fix the self-contradiction** (checklist still says v1 `YYYY-MM-DD-…`) | Builder |
| 4 | `Prompt Patterns/📄 Pattern - Kickstart.md` + `⚡ Command — Kickstart.md` | instance resolution (§5) | Builder |
| 5 | `Guides/Guide — Context & Threads.md` | practical walkthrough | Builder |
| 6 | `Projects/AI-Suplex Ultra Edition/Spec — AI-Suplex Mission Control (AS MC).md` §4/§8.2 | delegate to this spec (§8) | Architect |
| 7 | `Tools/3lm.js` | `threads --list` projection (**exclude `_instances.md` from the guard**) + **open-instance** staleness (today it checks only the *newest* Active file — 3lm.js:221–243) | Builder |
| 8 | DSH `/save-context` skill shim | v1 naming + *"archive any file in Active/"* | Builder |

**Migration note:** existing Active files keep their names until their instance closes. No retro-split — the current multi-mission brief is simply the **last file of the old shape**, and it archives on close.

---

## 🔗 Related

- `AGENTS.md` → *Execution Threads (4)* — the canonical rule set this spec mirrors
- `Prompt Patterns/📄 Pattern - Save Context.md` (v3) — the mechanism
- `Prompt Patterns/📄 Pattern - Kickstart.md` — the loader
- `Guides/Guide — Context & Threads.md` — the practical companion
- `Projects/AI-Suplex Ultra Edition/Spec — AI-Suplex Mission Control (AS MC).md` — the operator that allocates refs and serializes sync
- `Artifacts/2026-2027/Cycle 2/Week 7/2026-10-15-1503-cloudroom-as-mc-fit-and-saas-opportunity-ai-engineering.md` — the producer/committer constraint (R8)

---
*Spec v2.1 (pluralisation delta) via AI-Suplex on 2026-10-18 — Cycle 2, Week 7 · ai-engineering: `project-tasks` · `random-tasks`, legacy prefixes parse forever.*
*Spec v2.0 ratified + canonical 2026-10-16. Sweep landed; shipped as v2.7.0. v1.0 captured 2026-09-23. TWABAM ⚡*
