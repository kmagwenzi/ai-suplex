# AI-Suplex Simple Workflow — Commands Edition

**TWABAM ⚡!** This is the **AI Chat / AI Agent Assisted workflow** — type `AI-Suplex: <Command>` into any AI chat. The command loads the pattern and runs it. No Obsidian macros needed.

> **For local coding agents (Claude Code, Open Code):** Make sure to `cd` into the inner folder first:
> ```bash
> cd "7-7-7 Edition/AI-Suplex-777"
> ```
> The agent reads `AGENTS.md` and accesses `Skills/`, `Prompt Patterns/`, `Tools/`, and `Guides/` from here.
>
> **For cloud AI chats (ChatGPT, DeepSeek):** Type the command — no folder setup needed.

## ⚡ Command shortcuts (the fast path)

| Step | Command |
|---|---|
| Tasklist | `AI-Suplex: Tasklist Generation` |
| Session Start | `AI-Suplex: Session Start` |
| Artifact / Insight / B-Bomb | `AI-Suplex: Artifact Capture` · `Batch Insight` · `B-Bomb Promotion` |
| Session End | `AI-Suplex: Session End Report` |
| Weekly Plan | `AI-Suplex: Weekly Plan` |
| Weekly Review | `AI-Suplex: Weekly Review` |
| Save Context | `AI-Suplex: Save Context` |

Each command wraps a pattern — the pattern is the library underneath, one folder down in `Prompt Patterns/`.

---

## Step 1: Add Your Focus Areas

Open `Focuses.md` in any text editor. Add your focus areas:

```yaml
focuses:
  - name: my-focus
    display: My Focus
    description: "What I'm working on"
```

---

## Step 2: Generate a Tasklist

**Command:** `AI-Suplex: Tasklist Generation`

1. Type `AI-Suplex: Tasklist Generation`
2. Paste your to-do list under CONTENT
3. Execute — the AI generates a structured tasklist with task IDs

---

## Step 3: Start a Session

**Command:** `AI-Suplex: Session Start`

1. Type `AI-Suplex: Session Start`
2. Supply the Execution Command (bottom of your tasklist) + the tasklist file path as CONTENT
3. Execute — get a ready-to-use session start prompt with mission, tasks, and metrics

---

## Step 4: Work & Capture

During your session, capture everything with commands:

| What            | Command                       | When                    |
| --------------- | ----------------------------- | ----------------------- |
| 📄 **Artifact** | `AI-Suplex: Artifact Capture` | Saving work-in-progress |
| 💡 **Insights** | `AI-Suplex: Batch Insight`    | Logging learnings       |
| 💣 **B-Bomb**   | `AI-Suplex: B-Bomb Promotion` | Promoting polished work |

---

## Step 5: End the Session

**Command:** `AI-Suplex: Session End Report`

1. Type `AI-Suplex: Session End Report`
2. In CONTENT, make File Reference point to `AI-Suplex-777/prompt.md`
3. Execute — get the full session report

---

## Step 6: Plan Your Week

**Command:** `AI-Suplex: Weekly Plan`

1. Type `AI-Suplex: Weekly Plan`
2. Supply pending tasks and priorities as CONTENT
3. Execute — get a daily breakdown with focus allocation and energy management

---

## Step 7: Review Your Week

**Command:** `AI-Suplex: Weekly Review`

1. Type `AI-Suplex: Weekly Review`
2. Supply your week's data as CONTENT
3. Execute — the AI analyses your week and suggests improvements

---

## Step 8: Switch Context (When Changing Chat Windows)

**Command:** `AI-Suplex: Save Context`

A **thread is a lane; an instance is a window.** When you switch chat windows or end a work block, use **Save Context v3** so the next window loads the right context — and never overwrites another window's.

1. Type `AI-Suplex: Save Context`
2. Supply the instance coordinates as CONTENT:
   ```
   Thread: daily-tasks | project-tasks | random-tasks | realist
   Instance: <ref or slug>     ← N lanes only; omit for singletons
   Writer: committer | producer
   ```
4. Execute — the AI writes the summary and reports what it wrote (and whether `AGENTS.md` changed)

**What happens:**

| Step | Result |
|---|---|
| Write | `Context Kick-start/Active/{thread}-{ref}-{slug}.md` (or `{thread}.md` for singletons) |
| Append | A later save to the **same instance** updates in place — no second file |
| Archive | **On close** — only this instance's file → `Archived/{YYYY-MM-DD}-{thread}-{ref}-{slug}.md` |
| `AGENTS.md` | **Only** the `daily-tasks` thread refreshes the Active Mission Context |

- **One instance = one file = one writer.** A new window is a new file; never edit another instance's context file.
- **A session is closed by the commit**, not the file — a committer runs `node Tools/3lm.js sync`.
- **Producers never sync.** A cloud agent writes only its own instance file + artifacts.
- See the open set: `node Tools/3lm.js threads --list`.

> 💡 **When to use:** Switching chat windows, ending a work block, taking a break, or any time you want the next session to remember exactly what this one did.

---

## Full Command Chain

```
AI-Suplex: Kickstart → Tasklist Generation → Session Start → Artifact Capture / B-Bomb Promotion / Batch Insight → Session End Report → Save Context → Weekly Plan → Weekly Review
```

Every step is a one-line command. No Obsidian required. No macros. Just AI chat. The patterns underneath are in `Prompt Patterns/`.

---

## What's Next?

- **Cycle Plan:** 7-week strategic roadmap *(pattern-only — command pending)*
- **Cycle Review:** end-of-cycle analysis *(pattern-only — command pending)*
- **Full Guides:** See `AI-Suplex Kick-start/The AI-Suplex Workflow Pipeline.md` and `Guides/🦸 AI-Suplex Full Workflow Guide.md` for the full pipeline and the macro-powered version

---

**You're now running AI-Suplex on commands — with the patterns one folder underneath.** 🦸⚡
