#!/usr/bin/env node
"use strict";

/**
 * paths.js — the AI-Suplex path contract (single source of truth).
 *
 * Every cycle-scoped path in the vault is shaped:
 *
 *   <Tree>/<Period>/Cycle <n>/Week <n>/…
 *
 * where <Period> is a DERIVED label (e.g. "<Period>") read from `period.md`
 * at the vault root — never typed by hand, never hardcoded in a caller.
 *
 * Spec: `Projects/AI-Suplex Ultra Edition/Period Structure — Design Spec.md`
 *       §4 (contract) · §5 (resolver API) · §6 (Cycle 0 → `0000-Build/`)
 *
 * Contract rules this module enforces:
 *   1. `period.md` is the ONLY source of a period label — missing file fails loudly.
 *   2. A period label is derived from dates (`YYYY-YYYY`), never authored.
 *   3. Cycle 0 belongs to the reserved pre-period label `0000-Build`.
 *   4. Callers receive POSIX, vault-relative paths (no leading slash).
 *
 * Usage:
 *   const P = require("./paths");
 *   P.artifactDir(2, 4)   // "Artifacts/<Period>/Cycle 2/Week 4"
 *
 * CLI:
 *   node Tools/paths.js            # print the resolved period + a path sample
 *   node Tools/paths.js --self-test  # assert the contract round-trips
 */

const fs = require("fs");
const path = require("path");

const VAULT_ROOT = path.resolve(__dirname, "..");
const PERIOD_FILE = path.join(VAULT_ROOT, "period.md");

/** Reserved label for pre-period cycles (spec §6). */
const PRE_PERIOD_LABEL = "0000-Build";

/** Canonical rhythm (spec §3): 7 cycles of 7 weeks. */
const CYCLES_PER_PERIOD = 7;
const WEEKS_PER_CYCLE = 7;

/**
 * Days from `period_start` to `period_end`.
 *
 * **343 days = 7 cycles × 7 weeks = 49 weeks.** Ruled by the Hustler (2026-09-26)
 * after the T006 review escalated the spec §4.1 example (which said 364 = the spec's
 * `2026-06-19 → 2027-06-18`). The rhythm is the authority:
 * *"7 cycles of 7 weeks = 49 weeks of work; 52 weeks in a year − 49 = 3 weeks vacation."*
 * — `B-Bombs/Cycle 0/Week 2/2026-05-16-b-bomb-7-7-7-rhythm-math-digital-products`
 *
 * The derived label is unchanged either way; the span is not. Change this in BOTH runtimes.
 */
const PERIOD_SPAN_DAYS = 343;

// ── FRONTMATTER ────────────────────────────────────────

/**
 * Minimal YAML-frontmatter reader — same shape the other tools already use.
 * Handles `key: value`, quoted values, and ignores nested/block content.
 */
function parseFrontmatter(text) {
  const m = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

// ── DATE DERIVATION ────────────────────────────────────

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A real calendar date — the pattern alone is not enough (2026-13-99 matches
 * `YYYY-MM-DD` but is not a date). Verified by round-tripping through UTC.
 */
function isIsoDate(iso) {
  if (typeof iso !== "string" || !ISO_DATE.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function assertIsoDate(iso, what) {
  if (typeof iso !== "string" || !ISO_DATE.test(iso)) {
    throw new Error(`paths.js: ${what} must be an ISO date (YYYY-MM-DD), got ${JSON.stringify(iso)}`);
  }
  if (!isIsoDate(iso)) {
    throw new Error(`paths.js: ${what} is not a real calendar date: ${JSON.stringify(iso)}`);
  }
}

/** Add days to an ISO date in UTC — no timezone drift. */
function addDays(iso, days) {
  assertIsoDate(iso, "date");
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** period_end = period_start + PERIOD_SPAN_DAYS. Derived, never authored. */
function derivePeriodEnd(startIso, spanDays = PERIOD_SPAN_DAYS) {
  return addDays(startIso, spanDays);
}

/** period_label = "YYYY-YYYY" from the start and end years. Derived, never authored. */
function derivePeriodLabel(startIso, endIso) {
  assertIsoDate(startIso, "period_start");
  assertIsoDate(endIso, "period_end");
  return `${startIso.slice(0, 4)}-${endIso.slice(0, 4)}`;
}

// ── PERIOD SOURCE OF TRUTH ─────────────────────────────

let _cache = null;

/**
 * Read `period.md` — the single source of truth.
 * @param {{fresh?: boolean}} [opts] bypass the cache (used by the staleness guard)
 * @returns {{index:number, label:string, start:string, end:string, cycle1Start:string}}
 * @throws if the file is missing or a required field is absent/invalid — never guesses.
 */
function readPeriod(opts = {}) {
  if (_cache && !opts.fresh) return _cache;

  if (!fs.existsSync(PERIOD_FILE)) {
    throw new Error(
      `paths.js: period.md not found at ${PERIOD_FILE}.\n` +
        `  The vault has no Period source of truth. Run the vault initialiser\n` +
        `  ("Sweeper – Initialise Vault") or restore period.md. Refusing to guess a label.`
    );
  }

  const fm = parseFrontmatter(fs.readFileSync(PERIOD_FILE, "utf8"));

  const index = Number(fm.period_index);
  const label = fm.period_label;
  const start = fm.period_start;
  const end = fm.period_end;
  const cycle1Start = fm.cycle_1_start || start;

  const bad = [];
  if (!Number.isInteger(index) || index < 1) bad.push("period_index (positive integer)");
  if (!label) bad.push("period_label");
  if (!isIsoDate(start)) bad.push("period_start (a real YYYY-MM-DD date)");
  if (!isIsoDate(end)) bad.push("period_end (a real YYYY-MM-DD date)");
  if (bad.length) {
    throw new Error(`paths.js: period.md is missing/invalid fields: ${bad.join(", ")}\n  → ${PERIOD_FILE}`);
  }
  if (end <= start) {
    throw new Error(
      `paths.js: period_end (${end}) must fall after period_start (${start}).\n  → ${PERIOD_FILE}`
    );
  }
  if (!isIsoDate(cycle1Start)) {
    throw new Error(`paths.js: cycle_1_start must be a real YYYY-MM-DD date, got ${JSON.stringify(cycle1Start)}\n  → ${PERIOD_FILE}`);
  }

  // A hand-typed label is a contract violation — the label must be derived.
  const derived = derivePeriodLabel(start, end);
  if (!/^\d{4}-\d{4}$/.test(label)) {
    throw new Error(
      `paths.js: period_label "${label}" is not a derived label.\n` +
        `  Expected "YYYY-YYYY" derived from period_start/period_end (e.g. "${derived}").`
    );
  }
  if (label !== derived) {
    throw new Error(
      `paths.js: period_label "${label}" contradicts its dates — derived value is "${derived}".\n` +
        `  The label is derived, never authored. Fix period.md (or the initialiser that wrote it).`
    );
  }

  _cache = { index, label, start, end, cycle1Start };
  return _cache;
}

/** Drop the memoised period + tree layouts (after a rollover, rewrite, or file move). */
function resetCache() {
  _cache = null;
  _layoutCache.clear();
}

// ── GUARDS ─────────────────────────────────────────────

function int(v, what, min) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min) {
    throw new Error(`paths.js: ${what} must be an integer ≥ ${min}, got ${JSON.stringify(v)}`);
  }
  return n;
}

/** Cycle 0 is pre-period; every other cycle belongs to the current period. */
function periodForCycle(cycle) {
  const c = int(cycle, "cycle", 0);
  return c === 0 ? PRE_PERIOD_LABEL : readPeriod().label;
}

/** POSIX join for vault-relative paths. */
function j(...parts) {
  return parts
    .map((p) => String(p).replace(/\\/g, "/").replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

// ── THE CONTRACT (spec §5) ─────────────────────────────

/** "<Period>" */
function periodLabel() {
  return readPeriod().label;
}

/** "Artifacts/<Period>/Cycle 2/Week 4" */
function artifactDir(cycle, week) {
  return j("Artifacts", periodForCycle(cycle), `Cycle ${int(cycle, "cycle", 0)}`, `Week ${int(week, "week", 1)}`);
}

/** "B-Bombs/<Period>/Cycle 2/Week 4" */
function bBombDir(cycle, week) {
  return j("B-Bombs", periodForCycle(cycle), `Cycle ${int(cycle, "cycle", 0)}`, `Week ${int(week, "week", 1)}`);
}

/**
 * "Outreach/<Period>" — the Outreach entity tree (Outreach spec §7).
 *
 * NOT cycle-scoped on purpose: an outreach record is created when contact happens
 * and must stay visible until it closes, regardless of which cycle is running.
 * The period comes from `period.md` at runtime — never a literal label (spec T001).
 */
function outreachDir() {
  return j("Outreach", readPeriod().label);
}

/** "Insights/<Period>/Cycle 2/Week 4.md" — returns the FILE path (spec §4). */
function insightDir(cycle, week) {
  return j("Insights", periodForCycle(cycle), `Cycle ${int(cycle, "cycle", 0)}`, `Week ${int(week, "week", 1)}.md`);
}

/**
 * "Reviews/<Period>/Weekly/Cycle 2/Week 4" — the week's review **directory**.
 *
 * ⚠️ CORRECTED 2026-09-26 (decision ⑧, ruled after the T010 migration).
 * The spec originally described a flat `…/Week <n>.md` FILE. That shape never
 * existed: a week of review is a **directory** holding two files — the narrative
 * review and the raw aggregate data that fed it. No tool ever called this, which
 * is why the mismatch survived. The contract now describes reality (Option A).
 */
function reviewDir(cycle, week) {
  return j(
    "Reviews",
    periodForCycle(cycle),
    "Weekly",
    `Cycle ${int(cycle, "cycle", 0)}`,
    `Week ${int(week, "week", 1)}`
  );
}

/** "Reviews/<Period>/Weekly/Cycle <n>" — the cycle's review directory */
function reviewCycleDir(cycle) {
  return j("Reviews", periodForCycle(cycle), "Weekly", `Cycle ${int(cycle, "cycle", 0)}`);
}

/** "Reviews/<Period>/Weekly" — the period-level reviews root (no cycle segment). */
function reviewWeeklyDir() {
  return j("Reviews", readPeriod().label, "Weekly");
}

/** "…/Week 4/Week 4 Review.md" — the narrative review for the week. */
function reviewReviewFile(cycle, week) {
  const w = int(week, "week", 1);
  return j(reviewDir(cycle, w), `Week ${w} Review.md`);
}

/** "…/Week 4/Week 4 Aggregate Data.md" — the raw aggregate that fed the review. */
function reviewDataFile(cycle, week) {
  const w = int(week, "week", 1);
  return j(reviewDir(cycle, w), `Week ${w} Aggregate Data.md`);
}

/** "MOCs/<Period>/Weekly/Cycle 2" */
function mocsDir(cycle) {
  return j("MOCs", periodForCycle(cycle), "Weekly", `Cycle ${int(cycle, "cycle", 0)}`);
}

/** "MOCs/<Period>" — the period card lives inside as <Period>.md */
function periodCardDir() {
  return j("MOCs", readPeriod().label);
}

/** "Plans/<Period>/Cycle 2" */
function planDir(cycle) {
  return j("Plans", periodForCycle(cycle), `Cycle ${int(cycle, "cycle", 0)}`);
}

/** "Plans/<Period>" — the period plan lives inside as <Period> Plan.md */
function periodPlanDir() {
  return j("Plans", readPeriod().label);
}

/** "Memory/episodic/<Period>/Cycle-2/Week-4" */
function episodicDir(cycle, week) {
  return j("Memory", "episodic", periodForCycle(cycle), `Cycle-${int(cycle, "cycle", 0)}`, `Week-${int(week, "week", 1)}`);
}

/**
 * "Next Steps/<Period>/Cycle 2" — cycle-scoped, and MISSING from the original §4
 * contract and the T010 migration manifest. Found by **T015 / F-3**; had it stayed
 * un-migrated it would have silently merged across two periods like every other tree.
 */
function nextStepsDir(cycle) {
  return j("Next Steps", periodForCycle(cycle), `Cycle ${int(cycle, "cycle", 0)}`);
}

/** { index, label, start, end } */
function currentPeriod() {
  const p = readPeriod();
  return { index: p.index, label: p.label, start: p.start, end: p.end };
}

/**
 * Parse a cycle-scoped path back into its parts. Replaces regex/max-cycle guessing.
 *
 * A path qualifies only if it names a **Cycle** — this keeps tasklist filenames
 * (which contain "week 4" but are not cycle-scoped) from matching.
 *
 * @returns {{period:string|null, cycle:string, week:string|null}|null}
 *          `period` is null for legacy (pre-migration) paths; `cycle`/`week` are
 *          strings, matching the existing tools' `extractCycleWeek` return shape.
 */
function parseCyclePath(input) {
  if (typeof input !== "string" || !input.trim()) return null;
  const p = input.replace(/\\/g, "/");

  const cm = p.match(/Cycle[-\s]+(\d+)/i);
  if (!cm) return null;

  const pm = p.match(/(?:^|\/)(\d{4}-\d{4}|0000-Build)(?=\/|$)/);
  const wm = p.match(/Week[-\s]+(\d+)/i);

  return {
    period: pm ? pm[1] : null,
    cycle: cm[1],
    week: wm ? wm[1] : null,
  };
}

// ── MIGRATION-TOLERANT LOOKUP ──────────────────────────

/**
 * Map a canonical contract path to its legacy (pre-period) equivalent.
 *
 *   `Artifacts/<Period>/Cycle 2/Week 4`        → `Artifacts/Cycle 2/Week 4`
 *   `Memory/episodic/<Period>/Cycle-2/Week-4`  → `Memory/episodic/Cycle-2/Week-4`
 *
 * Works by removing the period segment. Returns null when there is none.
 */
function legacyOf(relPath) {
  if (typeof relPath !== "string" || !relPath) return null;
  const parts = relPath.replace(/\\/g, "/").split("/");
  const i = parts.findIndex((p) => p === PRE_PERIOD_LABEL || /^\d{4}-\d{4}$/.test(p));
  if (i === -1) return null;
  return parts.filter((_, idx) => idx !== i).join("/");
}

/**
 * Which layout does a tree currently use? `"period"` | `"legacy"` | `"absent"`.
 *
 * Detected by looking for a period-labelled child (`<Period>` or `0000-Build`).
 * This is what keeps Phase 3 (tooling) safe while Phase 4 (files) has not run yet:
 * tools keep writing where the tree actually lives, so there is no split-brain
 * and T009 can require genuinely identical output.
 */
const TREE_ROOTS = ["Artifacts", "B-Bombs", "Insights", "Reviews", "MOCs", "Plans", "Next Steps", "Outreach", "Memory/episodic"];
const _layoutCache = new Map();

function treeRootOf(relPath) {
  const parts = String(relPath).replace(/\\/g, "/").split("/");
  if (parts[0] === "Memory" && parts[1] === "episodic") return "Memory/episodic";
  return parts[0];
}

function treeLayout(tree) {
  if (_layoutCache.has(tree)) return _layoutCache.get(tree);
  let layout = "absent";
  const base = abs(tree);
  if (fs.existsSync(base)) {
    let entries = [];
    try {
      entries = fs.readdirSync(base);
    } catch {
      /* unreadable tree — treat as absent */
    }
    if (entries.some((e) => e === PRE_PERIOD_LABEL || /^\d{4}-\d{4}$/.test(e))) layout = "period";
    else if (entries.length) layout = "legacy";
  }
  _layoutCache.set(tree, layout);
  return layout;
}

/**
 * Where should this contract path live **right now**?
 *   1. canonical exists on disk → canonical
 *   2. legacy exists on disk    → legacy
 *   3. neither → wherever its tree currently lives (legacy during Phase 3, canonical after Phase 4)
 *
 * Use this for both reads and writes until the migration completes.
 */
function resolve(relPath) {
  const canonical = String(relPath).replace(/\\/g, "/");
  if (fs.existsSync(abs(canonical))) return canonical;
  const legacy = legacyOf(canonical);
  if (legacy && fs.existsSync(abs(legacy))) return legacy;
  if (legacy && treeLayout(treeRootOf(canonical)) === "legacy") return legacy;
  return canonical;
}

// ── NAMED FILES (implied by spec §4) ───────────────────

/** "Plans/<Period>/<Period> Plan.md" — tier 1 */
function periodPlanFile() {
  const l = readPeriod().label;
  return j("Plans", l, `${l} Plan.md`);
}

/** "MOCs/<Period>/<Period>.md" — the period card */
function periodCardFile() {
  const l = readPeriod().label;
  return j("MOCs", l, `${l}.md`);
}

/** "MOCs/<Period>/Weekly/Cycle 2/Cycle 2 Week 4.md" — the frozen weekly rollup */
function weeklyRollupFile(cycle, week) {
  const c = int(cycle, "cycle", 0);
  const w = int(week, "week", 1);
  return j(mocsDir(c), `Cycle ${c} Week ${w}.md`);
}

// ── MISC ───────────────────────────────────────────────

function vaultRoot() {
  return VAULT_ROOT;
}

function periodFilePath() {
  return PERIOD_FILE;
}

/** Resolve a vault-relative contract path to an absolute path. */
function abs(relPath) {
  return path.join(VAULT_ROOT, relPath);
}

function isPrePeriod(label) {
  return label === PRE_PERIOD_LABEL;
}

// ── CLI ────────────────────────────────────────────────

function selfTest() {
  const checks = [];
  const eq = (name, actual, expected) => {
    const lift = (v) => JSON.stringify(v);
    checks.push({ name, ok: lift(actual) === lift(expected), actual, expected });
  };

  const p = readPeriod();
  eq("period label", periodLabel(), p.label);

  eq("artifactDir(2,4)", artifactDir(2, 4), `Artifacts/${p.label}/Cycle 2/Week 4`);
  eq("bBombDir(2,4)", bBombDir(2, 4), `B-Bombs/${p.label}/Cycle 2/Week 4`);
  eq("insightDir(2,4)", insightDir(2, 4), `Insights/${p.label}/Cycle 2/Week 4.md`);
  eq("reviewDir(2,4)", reviewDir(2, 4), `Reviews/${p.label}/Weekly/Cycle 2/Week 4`);
  eq("reviewReviewFile(2,4)", reviewReviewFile(2, 4), `Reviews/${p.label}/Weekly/Cycle 2/Week 4/Week 4 Review.md`);
  eq("reviewDataFile(2,4)", reviewDataFile(2, 4), `Reviews/${p.label}/Weekly/Cycle 2/Week 4/Week 4 Aggregate Data.md`);
  eq("mocsDir(2)", mocsDir(2), `MOCs/${p.label}/Weekly/Cycle 2`);
  eq("planDir(2)", planDir(2), `Plans/${p.label}/Cycle 2`);
  eq("episodicDir(2,4)", episodicDir(2, 4), `Memory/episodic/${p.label}/Cycle-2/Week-4`);
  eq("weeklyRollupFile(2,4)", weeklyRollupFile(2, 4), `MOCs/${p.label}/Weekly/Cycle 2/Cycle 2 Week 4.md`);

  // Cycle 0 → reserved pre-period label
  eq("artifactDir(0,1)", artifactDir(0, 1), "Artifacts/0000-Build/Cycle 0/Week 1");
  eq("episodicDir(0,1)", episodicDir(0, 1), "Memory/episodic/0000-Build/Cycle-0/Week-1");

  // Round-trip every builder
  const roundTrips = [
    [artifactDir(2, 4), "2", "4"],
    [bBombDir(2, 4), "2", "4"],
    [insightDir(2, 4), "2", "4"],
    [reviewDir(2, 4), "2", "4"],
    [weeklyRollupFile(2, 4), "2", "4"],
    [episodicDir(2, 4), "2", "4"],
    [planDir(3), "3", null],
    [mocsDir(5), "5", null],
    [artifactDir(0, 1), "0", "1"],
  ];
  for (const [built, cycle, week] of roundTrips) {
    const got = parseCyclePath(built);
    eq(
      `round-trip ${built}`,
      got && { cycle: got.cycle, week: got.week },
      { cycle, week }
    );
  }

  // Legacy paths parse with a null period (migration safety)
  const legacy = parseCyclePath("Artifacts/Cycle 1/Week 4/2026-06-08-foo.md");
  eq("legacy period is null", legacy && legacy.period, null);
  eq("legacy cycle", legacy && legacy.cycle, "1");

  // Non-cycle paths must NOT match
  eq("tasklist filename ignored", parseCyclePath("Tasklists/Active/2026-09-24-week-4-controlled-lanes.md"), null);
  eq("plain string ignored", parseCyclePath("Memory/lessons.md"), null);
  eq("null ignored", parseCyclePath(null), null);

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    const mark = c.ok ? "  ✅" : "  ❌";
    console.log(`${mark} ${c.name}`);
    if (!c.ok) console.log(`      expected ${JSON.stringify(c.expected)} · got ${JSON.stringify(c.actual)}`);
  }
  console.log(`\n  ${checks.length - failed.length}/${checks.length} checks passed`);
  return failed.length === 0;
}

function main() {
  const arg = process.argv[2];
  if (arg === "--self-test") {
    process.exit(selfTest() ? 0 : 1);
  }
  const p = readPeriod();
  console.log("🦸 AI-Suplex path contract");
  console.log(`  vault root : ${VAULT_ROOT}`);
  console.log(`  period.md  : ${PERIOD_FILE}`);
  console.log(`  period     : ${p.label}  (index ${p.index})`);
  console.log(`  start → end: ${p.start} → ${p.end}`);
  console.log(`  cycle 1    : ${p.cycle1Start}`);
  console.log("");
  console.log(`  artifactDir(2, 4)     → ${artifactDir(2, 4)}`);
  console.log(`  bBombDir(2, 4)        → ${bBombDir(2, 4)}`);
  console.log(`  insightDir(2, 4)      → ${insightDir(2, 4)}`);
  console.log(`  reviewDir(2, 4)       → ${reviewDir(2, 4)}`);
  console.log(`  mocsDir(2)            → ${mocsDir(2)}`);
  console.log(`  planDir(2)            → ${planDir(2)}`);
  console.log(`  episodicDir(2, 4)     → ${episodicDir(2, 4)}`);
  console.log(`  artifactDir(0, 1)     → ${artifactDir(0, 1)}   (pre-period)`);
}

module.exports = {
  // spec §5 API
  periodLabel,
  artifactDir,
  bBombDir,
  outreachDir,
  insightDir,
  reviewDir,
  reviewCycleDir,
  reviewWeeklyDir,
  reviewReviewFile,
  reviewDataFile,
  mocsDir,
  periodCardDir,
  planDir,
  periodPlanDir,
  episodicDir,
  nextStepsDir,
  currentPeriod,
  parseCyclePath,
  // migration-tolerant lookup (Phase 3 against the unmigrated tree — T009)
  legacyOf,
  resolve,
  treeLayout,
  treeRootOf,
  TREE_ROOTS,
  // named files implied by spec §4
  periodPlanFile,
  periodCardFile,
  weeklyRollupFile,
  // derivation (used by the vault initialiser)
  derivePeriodEnd,
  derivePeriodLabel,
  addDays,
  // internals / guards
  readPeriod,
  resetCache,
  parseFrontmatter,
  isPrePeriod,
  vaultRoot,
  periodFilePath,
  abs,
  // constants
  PRE_PERIOD_LABEL,
  CYCLES_PER_PERIOD,
  WEEKS_PER_CYCLE,
  PERIOD_SPAN_DAYS,
};

if (require.main === module) main();
