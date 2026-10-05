# AI-Suplex Prompt Pattern: Outreach Capture

**TWABAM ⚡!** Copy-paste this into any AI chat to capture an **external interaction** — a message sent, a reply received, an application filed — as a structured Outreach record that the board and the two gates can read.

> **Why this exists:** every loop in AI-Suplex was **internal** (session → report → memory). The outside world had no slot, so *"did anyone respond to me this week?"* was unanswerable and applications went invisible for 25 days. This pattern gives the outside world a file.
>
> **⚠️ The design's own honesty test:** capture must cost **≤ 60 seconds**. If it takes longer, the entity is dead — **fix this path, never add a reminder.**

---

## 🎯 How to Use

1. **Copy** the `<prompt-pattern>` block below
2. **Paste** into your AI chat
3. **Replace** the `CONTENT:` section (or use a variant that defaults it)
4. **Execute** — the AI writes the record into `Outreach/<Period>/` and reports the path

---

## 📋 The Prompt Pattern

````yaml
<prompt-pattern>
CONTEXT: Capture an external interaction (outreach) as a structured AI-Suplex Outreach record, so the interaction acquires a state and a clock and can surface as a session blocker when it goes overdue.
- External Source 1: Projects/AI-Suplex Ultra Edition/Outreach Entity — Design Spec.md
- External Source 2 [optional]: Memory/semantic/entities.md → "Outreach (the external loop)"
- Inline Source: One file per external interaction, with state and clock

TEMPLATE: Templates/AI-Suplex - Outreach Template.md

TASK: Act as Builder. Generate ONE complete Outreach record from the provided content, following the Outreach Template and the §4.1 contract exactly.

PATH RESOLUTION (never hardcode the period):
   Run: node -e "console.log(require('./Tools/paths.js').outreachDir())"
   Save to: <that path>/YYYY-MM-DD-HHMM-<counterparty-slug>-<focus>.md
   Default status: drafted

FRONTMATTER — always required:
   type: outreach · status · counterparty · channel · focus · created: YYYY-MM-DD

FRONTMATTER — REQUIRED BY STATE (enforce this; a missing field is a board error):
   drafted  → (nothing extra, and NO clock)
   sent     → sent_at + follow_up_at        ← the clock is the whole design
   replied  → replied_at
   won      → closed_at + outcome + evidence (invoice / payment ref / artifact)
   lost     → closed_at + outcome
   dormant  → follow_up_at as a deliberate FAR-FUTURE date (parked, never "lost")

RULES:
- `replied` is the load-bearing state — it is the moment the external loop closes. Prefer it over `sent` the moment they respond.
- If a state's required field cannot be determined from the source, ASK rather than invent it. A guessed date poisons the gate.
- Never mark `sent` without a real `sent_at`. Never fabricate an application that was not made.
- `channel` ∈ linkedin | email | mindrift | upwork | fiverr | whatsapp | platform | in-person | other
- `focus` ∈ freelance | wqr | ai-engineering | digital-products | content-creation | research
- `source_artifact:` LINKS to what produced it — never copy the artifact, never delete it.

BODY: ## 📋 Summary · ## 🎯 The Ask · ## 📝 Progress (append-only, dated) · ## 🔗 Links · ## 🏁 Outcome

MEMORY LOOP — CONDITIONAL (protects the 60-second gate):
   RUN the loop only when the capture carries a transferable lesson — i.e. when this is a
   STATE TRANSITION that taught something (replied · won · lost), not a routine `drafted`/`sent`.
   Routine status updates are data, not lessons; forcing the loop on every one breaks the gate.

▶️ 3LM QUICK CAPTURE — when it applies:
   node Tools/3lm.js add-lessons --source artifact --ref "<counterparty> — <context>" --list "lesson one" "lesson two" && node Tools/3lm.js index

   ⚠️ ON FAILURE — give the user the exact commands:
     1. The record is already saved at the resolved Outreach path
     2. node Tools/3lm.js add-lessons --source artifact --ref "<title>" --list "..."
     3. node Tools/3lm.js index

MEMORY RULES:
- Promote only stable, repeated truths to semantic memory.
- Promote only repeatable workflows to procedural memory.
- Mark superseded items deprecated instead of deleting them.
- Do not invent memory updates not supported by the input.
- Do not reference Graphify. The vault is canonical; memory is managed via the 3lm CLI.

ADDITIONAL INSTRUCTIONS: NONE
- Report the saved path + the record's status and clock
- If the status is `sent` and no `follow_up_at` was given, propose one and say so

CONTENT:
<content>

Source — use one or more (at least one required):
--- Replace with your actual source ---
- Raw Content: [The interaction — what was sent, what came back, who, when]
- File Reference: [[Existing file — a sent message export, a reply thread, an application draft]]
- Chat Reference: Previous output from this session
--- Replace with your actual source ---

</content>
</prompt-pattern>
````

> **Note:** At least one source is required. The 3lm command runs from your `AI-Suplex-777` folder.

---

## 💡 Example Usage

````yaml
<prompt-pattern>
CONTEXT: Capture an external interaction as a structured Outreach record.
TEMPLATE: Templates/AI-Suplex - Outreach Template.md
TASK: Act as Builder. Generate one Outreach record.

CONTENT:
<content>

Source:
- Raw Content:
  Counterparty: "Taku"
  Context: "Asked to be a reference for the Interledger grant"
  Channel: email
  Focus: ai-engineering
  2026-08-27 — sent — reference request
  2026-08-27 — replied — agreed
  Ask: "Confirm he is willing to be contacted by the grant reviewers."
  Next action: "Send the reviewers his contact details once the grant moves."

</content>
</prompt-pattern>
````

---

## 🎯 What the AI Will Output

1. **The Outreach record** — written to the resolved `Outreach/<Period>/` path
2. **A state + clock report** — status, and the `follow_up_at` that will make it surface
3. **The 3LM quick-capture** — only for a state transition that taught something

---

## 🧠 Why the state matters more than the prose

| State | What it means | The clock it carries |
|:--|:--|:--|
| `drafted` | Written, not sent | **none** — and that is correct |
| `sent` | In the world, awaiting | `follow_up_at` → **Gate A** surfaces it when overdue |
| `replied` | **The loop closed** — the metric that matters | `replied_at` |
| `won` / `lost` | Terminal | `closed_at` + `outcome` (+ `evidence` for `won`) |
| `dormant` | Parked deliberately | a far-future `follow_up_at` — **never counted overdue** |

> **A record with no clock is invisible by construction.** That is the whole mechanism.

---

#### Sources
[^1]: [[Projects/AI-Suplex Ultra Edition/Outreach Entity — Design Spec]]
[^2]: [[Templates/AI-Suplex - Outreach Template]]
[^3]: [[Memory/semantic/entities]]
