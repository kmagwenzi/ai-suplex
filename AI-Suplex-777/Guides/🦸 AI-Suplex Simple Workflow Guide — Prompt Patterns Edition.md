			# AI-Suplex Simple Workflow — Pattern Edition

**TWABAM ⚡!** This is the **AI Chat / AI Agent Assisted workflow** — follow using only Prompt Patterns. Copy-paste into any AI chat. No Obsidian macros needed.

> **For local coding agents (Claude Code, Open Code):** Make sure to `cd` into the inner folder first:
> ```bash
> cd "7-7-7 Edition/AI-Suplex-777"
> ```
> The agent reads `AGENTS.md` and accesses `Skills/`, `Prompt Patterns/`, `Tools/`, and `Guides/` from here.
>
> **For cloud AI chats (ChatGPT, DeepSeek):** Just copy the pattern blocks below — no folder setup needed.

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

1. Open `Prompt Patterns/📄 Pattern - Tasklist Generation.md`
2. Copy the entire `<prompt-pattern>` block
3. Paste into Claude, ChatGPT, or DeepSeek
4. Replace the Source section with your to-do list
5. Execute — the AI generates a structured tasklist with task IDs

---

## Step 3: Start a Session

1. Open `Prompt Patterns/📄 Pattern - Session Start Prompt Generation.md`
2. Copy the `<prompt-pattern>` block → paste into AI chat
3. Complete Source /- Raw Source: with the Execution Command (Bottom of AI-Suplex Tasklist) and Source/ - File Reference: with the file path to AI-Suplex Tasklist
4. Execute — get a ready-to-use session start prompt with mission, tasks, and metrics

---

## Step 4: Work & Capture

During your session, capture everything using patterns:

| What            | Pattern                                    | When                    |
| --------------- | ------------------------------------------ | ----------------------- |
| 📄 **Artifact** | `📄 Pattern - Artifact Capture.md`         | Saving work-in-progress |
| 💡 **Insights** | `📄 Pattern - Batch Insight Generation.md` | Logging learnings       |
| 💣 **B-Bomb**   | `📄 Pattern - B-Bomb Promotion.md`         | Promoting polished work |

---

## Step 5: End the Session

1. Open `Prompt Patterns/📄 Pattern - Session End Prompt Generation.md` and paste into AI chat and execute  - _You get a blank Session Start Prompt_
2. Fill in Session End Prompt data and paste into: `AI-Suplex-777/prompt.md` 
3. Open `Prompt Patterns/📄 Pattern - Session End Report` paste into AI chat
4. In `CONTENT` section make Source/- File Reference  refer to: `AI-Suplex-777/prompt.md` 
5. Execute and get full session report

---

## Step 6: Plan Your Week

1. Open `Prompt Patterns/📄 Pattern - Weekly Plan Generation.md`
2. Copy → paste → replace Source with pending tasks and priorities
3. Execute — get a daily breakdown with focus allocation and energy management

---

## Step 7: Review Your Week

1. Open `Prompt Patterns/📄 Pattern - Weekly Review Generation.md`
2. Copy → paste → replace Source with your week's data
3. Execute — the AI analyses your week and suggests improvements

---

## Step 8: Switch Context (When Changing Chat Windows)

A **thread is a lane; an instance is a window.** When you switch chat windows or end a work block, use **Save Context v3** so the next window loads the right context — and never overwrites another window's.

1. Open `Prompt Patterns/📄 Pattern - Save Context.md`
2. Copy the `<prompt-pattern>` block → paste into AI chat
3. Supply the instance coordinates:
   ```
   Thread: daily-tasks | long-running-tasks | random-task | realist
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

## Full Pattern Chain

```
Kickstart → Tasklist → Session Start → Artifact/B-Bomb/Insight → Session End → Save Context → Weekly Plan → Weekly Review
```

Every step is a copy-paste pattern. No Obsidian required. No macros. Just AI chat.

---

## What's Next?

- **Cycle Plan:** `📄 Pattern - Cycle Plan Generation.md` — 7-week strategic roadmap
- **Cycle Review:** `📄 Pattern - Cycle Review Generation.md` — end-of-cycle analysis
- **Full Guides:** See `AI-Suplex Kick-start/The AI-Suplex Workflow Pipeline.md` and `Guides/🦸 AI-Suplex Full Workflow Guide.md` for the full pipeline and the macro-powered version

---

**You're now running AI-Suplex with nothing but prompt patterns.** 🦸⚡
