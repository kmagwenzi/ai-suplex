#!/usr/bin/env node
"use strict";
/**
 * AI-Suplex vault initialiser — first-run setup (Period Structure, decisions ①–⑩).
 *
 * Turns an EMPTY vault into a working AI-Suplex vault with ZERO configuration:
 *   1. writes `period.md` — the period source of truth, with the label DERIVED
 *      from today (never typed) and period_index 1
 *   2. creates the Cycle 1 directory structure under the derived period
 *
 * The label is derived, never hardcoded: a distributed vault cannot know the
 * user's genesis date. `period_start` = the run date; `period_end` = +343 days
 * (7 cycles × 7 weeks = 49 weeks — the 7-7-7 rhythm).
 *
 * Idempotent: if `period.md` already exists it reports and exits 0 without
 * touching anything (pass --force to re-seed the directory structure only).
 *
 * Usage:
 *   node Tools/initialise-vault.js            # vault root = cwd
 *   node Tools/initialise-vault.js <root>     # explicit vault root
 *   node Tools/initialise-vault.js <root> --force
 *
 * Self-contained: it CREATES period.md, so it cannot depend on Tools/paths.js
 * (which reads it).
 */
const fs = require("fs");
const path = require("path");

const PRE_PERIOD = "0000-Build";
const SPAN_DAYS = 343; // 7 cycles × 7 weeks = 49 weeks

function addDays(iso, n) {
  const [y, m, d] = String(iso).split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function deriveLabel(start, end) {
  return `${start.slice(0, 4)}-${end.slice(0, 4)}`;
}
function joinPath(...parts) {
  return parts.map((p) => String(p).replace(/^\/+|\/+$/g, "")).filter(Boolean).join("/");
}
function mkdirp(root, rel) {
  const full = path.join(root, ...rel.split("/"));
  fs.mkdirSync(full, { recursive: true });
  return full;
}

function renderPeriodMd(label, start, end) {
  return `---
type: config
period_index: 1
period_label: "${label}"
period_start: ${start}
period_end: ${end}
cycle_1_start: ${start}
generated_by: "AI-Suplex vault initialiser"
---

# ⏳ Period 1 — ${label}

**This file is the single source of truth for the vault's Period.** Every cycle-scoped
path is resolved from it at runtime by \`Tools/paths.js\` / \`Tools/paths.py\` /
\`Scripts/lib/paths.js\`. Nothing else may contain a period label.

## What a Period is

A **Period is a run of 7 cycles** — not a calendar year and not anchored to 1 January.
The label is **derived and cosmetic**; it is never an identifier.

\`\`\`
Period 1 (${label})   →  Cycles 1–7
Period 2 (next)        →  Cycles 1–7 again   ← the Period level disambiguates them
\`\`\`

## Path shape

\`\`\`
<Root>/
├── period.md                                     ← this file
├── Artifacts/<Period>/Cycle <n>/Week <n>/
├── B-Bombs/<Period>/Cycle <n>/Week <n>/
├── Insights/<Period>/Cycle <n>/Week <n>.md
├── Reviews/<Period>/Weekly/Cycle <n>/Week <n>/
├── MOCs/<Period>/Weekly/Cycle <n>/Cycle <n> Week <n>.md
├── Plans/<Period>/{<Period> Plan.md, Cycle <n>/{Cycle <n> Plan.md, Week <n> Plan.md}}
├── Next Steps/<Period>/Cycle <n>/
├── Outreach/<Period>/
└── Memory/episodic/<Period>/Cycle-<n>/Week-<n>/
\`\`\`

Pre-period cycles (Cycle 0) use the reserved label **\`0000-Build\`**.

## Rollover

When **Cycle 7 completes**, \`Sweeper – Start New Cycle\` creates **Period 2**:
increment \`period_index\`, set \`cycle_1_start\`/\`period_start\` to the day after the
previous \`period_end\`, re-derive \`period_label\` and \`period_end\`, reset the cycle
counter to 1. The label is always re-derived — never hand-edited.

---

*Created by the AI-Suplex vault initialiser on ${start}. TWABAM ⚡*
`;
}

function createStructure(root, label) {
  const dirs = [];
  // Cycle 1: Artifacts, B-Bombs, Next Steps — Week 1..7
  for (const tree of ["Artifacts", "B-Bombs", "Next Steps"]) {
    for (let w = 1; w <= 7; w++) {
      dirs.push(joinPath(tree, label, "Cycle 1", `Week ${w}`));
    }
  }
  // Insights — the Cycle dir (Week N.md files created below)
  dirs.push(joinPath("Insights", label, "Cycle 1"));
  // Reviews — Weekly/Cycle 1/Week 1..7
  for (let w = 1; w <= 7; w++) {
    dirs.push(joinPath("Reviews", label, "Weekly", "Cycle 1", `Week ${w}`));
  }
  // MOCs — the period card dir + weekly rollups
  dirs.push(joinPath("MOCs", label, "Weekly", "Cycle 1"));
  // Plans — period + cycle 1
  dirs.push(joinPath("Plans", label));
  dirs.push(joinPath("Plans", label, "Cycle 1"));
  // Outreach — period-level (NOT cycle-scoped)
  dirs.push(joinPath("Outreach", label));
  // Episodic — Cycle-1/Week-1..7
  for (let w = 1; w <= 7; w++) {
    dirs.push(joinPath("Memory", "episodic", label, "Cycle-1", `Week-${w}`));
  }

  for (const d of dirs) mkdirp(root, d);

  // Insight files Week 1..7.md
  for (let w = 1; w <= 7; w++) {
    const f = path.join(root, joinPath("Insights", label, "Cycle 1", `Week ${w}.md`));
    if (!fs.existsSync(f)) fs.writeFileSync(f, `# Insights – Cycle 1, Week ${w}\n\n`);
  }

  // Period card + period plan placeholders
  const card = path.join(root, joinPath("MOCs", label, `${label}.md`));
  if (!fs.existsSync(card)) {
    fs.writeFileSync(card, `# 📅 Period 1 — ${label}\n\n> The period card. Summaries land here as cycles close.\n`);
  }
  const plan = path.join(root, joinPath("Plans", label, `${label} Plan.md`));
  if (!fs.existsSync(plan)) {
    fs.writeFileSync(plan, `# 🎯 ${label} Plan\n\n> The period plan (tier 1). Fill in as cycles open.\n`);
  }

  return dirs.length;
}

function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const rootArg = args.find((a) => !a.startsWith("--"));
  const root = path.resolve(rootArg || process.cwd());

  const periodFile = path.join(root, "period.md");

  if (fs.existsSync(periodFile) && !force) {
    console.log("🦸 AI-Suplex already initialised — period.md exists. Nothing changed.");
    console.log("   (re-run with --force to re-seed the directory structure only)");
    return 0;
  }

  const start = todayIso();
  const end = addDays(start, SPAN_DAYS);
  const label = deriveLabel(start, end);

  if (!fs.existsSync(periodFile)) {
    fs.writeFileSync(periodFile, renderPeriodMd(label, start, end));
    console.log(`✅ period.md written — Period 1 (${label})`);
    console.log(`     ${start} → ${end}  (${SPAN_DAYS} days = 7 cycles × 7 weeks)`);
  } else {
    console.log(`ℹ️  period.md already exists (${label}) — re-seeding structure only`);
  }

  const created = createStructure(root, label);
  console.log(`✅ ${created} directories + starter files created under ${label}/`);
  console.log("");
  console.log("TWABAM ⚡! Your vault is armed. Next: `node Tools/3lm.js start --context`");
  return 0;
}

if (require.main === module) process.exit(main());
