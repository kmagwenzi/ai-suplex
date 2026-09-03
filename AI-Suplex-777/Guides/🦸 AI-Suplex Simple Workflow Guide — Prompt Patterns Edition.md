			# AI-Suplex Simple Workflow — Pattern Edition

**TWABAM ⚡!** This is the **AI Chat / AI Agent Assisted workflow** — follow using only Prompt Patterns. Copy-paste into any AI chat. No Obsidian macros needed.

> **For local coding agents (Claude Code, Open Code):** Make sure to `cd` into the inner folder first:
> ```bash
> cd "7-7-7 Edition/AI-Suplex-777"
> ```
> The agent reads `AGENTS.md` and accesses `Skills/`, `Prompt Patterns/`, and `cm` from here.
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

When switching between chat windows or sessions, use the Context Switching pattern to ensure no knowledge is lost:

1. Open `Prompt Patterns/📄 Pattern - Context Switching.md`
2. Copy the `<prompt-pattern>` block → paste into AI chat
3. Fill in the Source section with your current session context
4. Execute — the AI generates a context summary and saves it

**What happens:**
- Context summary saved to `AI-Suplex Kick-start/Context Kick-start/Active/YYYY-MM-DD-cycle-x-week-y-mission-title.md`
- Previous context archived to `Archived/`
- Next session picks up seamlessly via `3lm start`

> 💡 **When to use:** Switching chat windows, ending a work block, taking a break, or any time you want to ensure the next session remembers what you did.

---

## Full Pattern Chain

```
Tasklist → Session Start → Artifact/B-Bomb/Insight → Session End → Context Switch → Weekly Plan → Weekly Review
```

Every step is a copy-paste pattern. No Obsidian required. No macros. Just AI chat.

---

## What's Next?

- **Cycle Plan:** `📄 Pattern - Cycle Plan Generation.md` — 7-week strategic roadmap
- **Cycle Review:** `📄 Pattern - Cycle Review Generation.md` — end-of-cycle analysis
- **Full Guides:** See `The AI-Suplex Workflow Pipeline.md` and `Simple Workflow Guide.md` for the macro-powered version

---

**You're now running AI-Suplex with nothing but prompt patterns.** 🦸⚡
