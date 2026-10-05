---
type: ai-suplex-command
command: "Outreach Capture"
pattern_file: "📄 Pattern - Outreach Capture.md"
role: "Builder"
date: 2026-09-26
---

# ⚡ AI-Suplex: Outreach Capture — Command

Shortcut for giving an **external interaction** a file, a state and a clock. Three variants, one pattern.

> **⏱️ The 60-second rule:** capture must cost under a minute. If it doesn't, the entity is dead — **fix the path, never add a reminder.**

## 🎯 Trigger — three variants

### 1 · Bare (summarised from the chat)
```
AI-Suplex: Outreach Capture
CONTENT
  - Chat Reference: <the interaction just discussed>

ADDITIONAL: <optional>
```

### 2 · Scratch Pad (`prompt.md`)
```
AI-Suplex: Outreach Capture(Scratch Pad)

ADDITIONAL: <optional>
```
> `(Scratch Pad)` ≡ bare capture with `File Reference: prompt.md`.

### 3 · File (a sent message export, a reply thread, an application draft)
```
AI-Suplex: Outreach Capture(File)
CONTENT
  - File Reference: [[path/to/export.md]]
```

## 📋 Usage — worked examples

```
AI-Suplex: Outreach Capture
CONTENT
  - Chat Reference: Emailed Taku about being an Interledger reference; he agreed same day.

ADDITIONAL: Log as replied.
```

```
AI-Suplex: Outreach Capture(File)
CONTENT
  - File Reference: [[Drop Zone/linkedin-reply-thread.md]]

ADDITIONAL: Channel linkedin · focus freelance.
```

## 🤖 What the AI Does

1. **Resolves the path** — `node -e "console.log(require('./Tools/paths.js').outreachDir())"` → `Outreach/<Period>/` (**never a hardcoded period**).
2. **Reads** the Pattern: [[📄 Pattern - Outreach Capture]].
3. **Determines the state** — `drafted` · `sent` · `replied` · `won` · `lost` · `dormant`. **Asks rather than guesses** if the source is ambiguous.
4. **Enforces the state-conditional fields** — `sent` needs `sent_at` + `follow_up_at`; `replied` needs `replied_at`; `won`/`lost` need `closed_at` + `outcome`; `won` also needs `evidence`.
5. **Writes** `Outreach/<Period>/YYYY-MM-DD-HHMM-<counterparty-slug>-<focus>.md` from the Outreach Template.
6. **Links, never copies** — `source_artifact:` points at what produced it.
7. **Optionally runs the memory loop** — *only for a state transition that taught something* (`replied` / `won` / `lost`), never for routine `drafted`/`sent`.
8. **Reports** the saved path, the status, and the clock that will surface it.

## 📄 Field Mapping

| From the source | To the record |
|---|---|
| Who was approached | `counterparty` (+ `organization`, `role_or_offer`) |
| How | `channel` ∈ linkedin · email · mindrift · upwork · fiverr · whatsapp · platform · in-person · other |
| Which lane | `focus` ∈ freelance · wqr · ai-engineering · digital-products · content-creation · research |
| What was sent/returned | `## 📋 Summary` · `## 📝 Progress` (dated, append-only) |
| What is wanted | `## 🎯 The Ask` |
| What happens next | `next_action` + `follow_up_at` |
| What produced it | `source_artifact:` (a link) |

## 🔗 Variations

| Command | Source | Use when |
| --- | --- | --- |
| `Outreach Capture` | Chat reference | Logging an interaction just discussed |
| `Outreach Capture(Scratch Pad)` | `prompt.md` | Working notes about an approach |
| `Outreach Capture(File)` | Any file | A sent-message export or a reply thread |

## ⚠️ The rules that keep the gates honest

1. **No clock, no visibility.** A non-drafted record without `follow_up_at` can never be overdue — it is invisible by construction.
2. **`replied` is the load-bearing state.** The moment they respond, move it — that transition is the metric the whole entity exists to produce.
3. **Never fabricate a send.** If no application went out, `drafted` is the truth and the gap stays visible. *A record that says zero is worth more than a metric that lies.*
4. **`dormant` ≠ `lost`.** Parked deliberately, excluded from the overdue counter.
5. **Not a CRM** (spec §14) — no deal stages, no forecasting, no contacts database. It tracks outreach; it does not send it.
