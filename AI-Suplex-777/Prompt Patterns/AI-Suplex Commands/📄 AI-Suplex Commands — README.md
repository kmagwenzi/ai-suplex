---
type: documentation
title: "AI-Suplex Commands — Documentation"
version: 2.0
date: 2026-07-25
tags: [ai-suplex-commands, prompt-patterns, executable-prompts, documentation]
---

# ⚡ AI-Suplex Commands — Documentation

## 🎯 What Are AI-Suplex Commands?

**AI-Suplex Commands** are one-line pattern triggers that invoke Prompt Patterns with pre-filled parameters. They eliminate the need to copy-paste full YAML pattern blocks — just type the command name and the AI loads the referenced pattern and executes it.

```
Before:  Copy 50-line pattern → paste into AI → fill CONTENT → execute
After:   AI-Suplex: Artifact Capture → CONTENT → ADDITIONAL → done
```

## 📐 Command Structure

```
AI-Suplex: <Command Name>
CONTENT
  - <Source type>: <value>

ADDITIONAL: <instructions>
```

| Block | Required | Purpose |
|-------|----------|---------|
| `AI-Suplex:` | ✅ | Signals the AI this is a command |
| `CONTENT` | ✅ (at least one source) | The input material |
| `ADDITIONAL` | ⬜ Optional | Post-generation instructions |

## 📋 Available Commands

| Command | Pattern | Role | Output |
|---------|---------|------|--------|
| `AI-Suplex: Artifact Capture` | `📄 Pattern - Artifact Capture.md` | Builder | Structured artifact from conversation |
| `AI-Suplex: Artifact Capture(Scratch Pad)` | `⚡ Command — Artifact Capture(Scratch Pad).md` | Builder | Shortcut for the frequent `prompt.md` capture |
| `AI-Suplex: Artifact Capture(Markdown)` | `⚡ Command — Artifact Capture(Markdown).md` | Builder | Wrap any `.md` file as an artifact (no conversion) |
| `AI-Suplex: Artifact Capture(file)` | `⚡ Command — Artifact Capture(Non Markdown).md` | Builder | Convert a non-markdown file (docx/pdf/mp4/etc) into a searchable artifact (markitdown → frontmatter → memory loop) |
| `AI-Suplex: Artifact Capture(youtube)` | `⚡ Command — Artifact Capture (YouTube).md` | Builder | Study-notes artifact from a YouTube video (transcribe → IBM note format → memory loop) |
| `AI-Suplex: Session End Report` | `📄 Pattern - Session End Report.md` | Architect | Full session report with memory loop |
| `AI-Suplex: Session Start` | `📄 Pattern - Session Start Prompt Generation.md` | Architect | Session start prompt from tasklist |
| `AI-Suplex: Save Context` | `⚡ Command — Save Context.md` | Builder | Thread-owned context file (`{prefix}cycle-X-week-Y-…`); archives only its own predecessor; AGENTS.md untouched unless the daily-tasks thread |
| `AI-Suplex: Tasklist Generation` | `📄 Pattern - Tasklist Generation.md` | Orchestrator | Structured tasklist from to-dos |
| `AI-Suplex: Weekly Review` | `📄 Pattern - Weekly Review Generation.md` | Orchestrator | Weekly review with metrics |
| `AI-Suplex: B-Bomb Promotion` | `📄 Pattern - B-Bomb Promotion.md` | Builder | B-Bomb from polished artifact |
| `AI-Suplex: Batch Insight` | `📄 Pattern - Batch Insight Generation.md` | Builder | Batch insights from session data |
| `AI-Suplex: Weekly Plan` | `📄 Pattern - Weekly Plan Generation.md` | Orchestrator | Weekly plan from cycle strategy |

## 🔧 Source Types (CONTENT)

| Type | Usage | Example |
|------|-------|---------|
| `Chat Reference:` | Reference earlier conversation | `Chat Reference: Previous output about Paynow` |
| `File Reference:` | Reference a vault file | `File Reference: [[EcoCash PRD]]` or `File Reference: prompt.md` |
| `Raw Content:` | Inline content paste | `Raw Content: ## Architecture decision...` |

## ⚡ ADDITIONAL Instructions

| Instruction | Effect |
|-------------|--------|
| `Save to <path>` | Custom save location (default: pattern's default) |
| `Open in new tab` | Open result in editor |
| `Skip memory loop` | Don't run 3lm add-lessons/index |
| `Run <script>` | Execute script after output (e.g., `Run 3lm end`) |

## 🔄 Execution Flow

```
User types: AI-Suplex: Artifact Capture
                  ↓
AI reads: Prompt Patterns/📄 Pattern - Artifact Capture.md
                  ↓
AI extracts: CONTENT source (chat/file/raw)
                  ↓
AI executes: Pattern's TASK instructions
                  ↓
AI applies: ADDITIONAL instructions (save path, memory loop)
                  ↓
AI reports: Output file path + lessons extracted
```

## 📝 Usage Examples

### Artifact from Chat
```
AI-Suplex: Artifact Capture
CONTENT
  - Chat Reference: Previous conversation about Paynow integration

ADDITIONAL: Save to Artifacts/<Period>/Cycle 1/Week 5/
```

### Artifact from File (Scratch Pad)
```
AI-Suplex: Artifact Capture(Scratch Pad)

ADDITIONAL: Save to Artifacts/<Period>/Cycle 1/Week 5/
```

### Artifact from File (Markdown)
```
AI-Suplex: Artifact Capture(Markdown)
CONTENT
  - File Reference: Projects/Agents Terminal/Web Console — Design Spec.md

ADDITIONAL: Save to Artifacts/<Period>/Cycle 2/Week 2/
```

### Artifact from File (Non-Markdown)
```
AI-Suplex: Artifact Capture(file)
CONTENT
  - File Reference: Executive Overview(Screen).docx

ADDITIONAL: Save to Artifacts/<Period>/Cycle 2/Week 2/, move original to Attachments/
```

### Session End Report
```
AI-Suplex: Session End Report
CONTENT
  - Raw Content: Session completed. Rating 5/5. 8 artifacts. 4 breakthroughs.

ADDITIONAL: Run 3lm end → learn → index
```

### Tasklist from To-Do List
```
AI-Suplex: Tasklist Generation
CONTENT
  - Raw Content: fix Oracle block, test Paynow webhook, update Freelance MOC

ADDITIONAL: Save to Tasklists/Active/
```

### Save Context (thread-aware)
```
AI-Suplex: Save Context(long-running-tasks)

ADDITIONAL: Save before switching to the deploy build
```

## 🏗️ How to Add a New Command

1. **Write the Pattern** — Create `Prompt Patterns/📄 Pattern - <Name>.md` with TASK instructions
2. **Write the Command** — Create `Prompt Patterns/AI-Suplex Command/⚡ Command — <Name>.md` with trigger syntax
3. **Register in AGENTS.md** — Add to the Commands table
4. **Register in this README** — Add to the Available Commands table

### Command Template

```markdown
---
type: ai-suplex-command
pattern: "[Pattern Name]"
pattern_file: "📄 Pattern - [Name].md"
role: "[Builder|Architect|Orchestrator]"
date: YYYY-MM-DD
---

# ⚡ AI-Suplex: [Command Name] — Command file link

## 🎯 Trigger

AI-Suplex: [Command Name]
CONTENT
  - <Source type>: <value>

ADDITIONAL: <instructions>
```

## 📋 Usage

```
AI-Suplex: [Command Name]
CONTENT
  - [Example usage]
```

## 🤖 What the AI Does
1. Reads `[Pattern File]`
2. Uses CONTENT source
3. Executes TASK
4. Applies ADDITIONAL instructions
5. Runs memory loop
```

## 🗂️ File Structure

Prompt Patterns/
├── 📄 Pattern - <Name>.md          (Full pattern — documentation)
├── 📄 Pattern - <Name>.md
├── ...
├── AI-Suplex Commands/
│   ├── ⚡ Command — <Name>.md    (Trigger — invocation)
│   ├── ⚡ Command — <Name>.md
│   └── ⚡ Command — Artifact Capture(Scratch Pad).md      (Concept doc)
└── 📄 AI-Suplex Commands — README.md          (This README)
```

## 🎯 Design Principles

1. **Commands are call sites** — they reference patterns, never duplicate them
2. **CONTENT is required** — at least one source type must be present
3. **ADDITIONAL is optional** — defaults are sensible
4. **AI loads the pattern** — the pattern is the source of truth for execution
5. **Memory loop by default** — runs unless `Skip memory loop` is specified
6. **One line → full output** — the command replaces the entire copy-paste workflow

## 🔗 Relationship to Other Systems

| System              | Relationship                                                                          |
| ------------------- | ------------------------------------------------------------------------------------- |
| **Prompt Patterns** | Commands invoke patterns. Patterns define the task.                                   |
| **AGENTS.md**       | Commands registered in AGENTS.md are active. New commands must be added there.        |
| **3lm Memory**      | Every command execution feeds into the memory loop by default.                        |
| **Skills**          | Commands reference Skills indirectly through their Pattern files.                     |
| **B-Bombs**         | Commands can produce artifacts that become B-Bombs via `AI-Suplex: B-Bomb Promotion`. |

---

*TWABAM ⚡! AI-Suplex Commands — One line, full output.*
