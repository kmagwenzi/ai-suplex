// Scripts/lib/paths.js — the QuickAdd path contract (Period Structure, decision ④)
// ─────────────────────────────────────────────────────────────────────────────
// ONE source of truth for every cycle-scoped path a QuickAdd macro writes.
// The macros run inside Obsidian, so this module is deliberately dependency-free:
// it takes the vault adapter in, reads `period.md`, and returns a bound API.
//
//   const P = await require("Scripts/lib/paths.js").load(app.vault.adapter);
//   P.artifactDir(2, 4)   // "AI-Suplex-777/Artifacts/<Period>/Cycle 2/Week 4"
//
// NOTE ON PATHS: QuickAdd macros address the OBSIDIAN vault root, so every path
// is prefixed `AI-Suplex-777/` — unlike Tools/paths.js, which is vault-relative.
//
// FALLBACK (decision ④): a macro must never break if `require` cannot resolve this
// module in Obsidian. Every macro wraps the require and falls back to an INLINED
// copy of the four pure functions below (`parseLabel`, `periodFor`, `join`/builders).
// Keep those functions tiny and side-effect-free so the inline copy stays honest.
//
// Spec: `Projects/AI-Suplex Ultra Edition/Period Structure — Design Spec.md` §4/§5
// ─────────────────────────────────────────────────────────────────────────────
"use strict";

const VAULT_PREFIX = "AI-Suplex-777";
const PRE_PERIOD = "0000-Build";
const PERIOD_FILE = `${VAULT_PREFIX}/period.md`;

/**
 * Extract `period_label` from the raw text of period.md.
 * Returns null when absent — the caller decides how to fail.
 */
function parseLabel(raw) {
  const m = String(raw || "").match(/^\s*period_label:\s*"?([^"\n]+?)"?\s*$/m);
  return m ? m[1].trim() : null;
}

/**
 * Cycle 0 belongs to the reserved pre-period label (spec §6); everything else
 * belongs to the current period. Never type a label — always pass the read one.
 */
function periodFor(cycle, label) {
  return Number(cycle) === 0 ? PRE_PERIOD : label;
}

/** POSIX-join the segments of an Obsidian-vault-relative path. */
function joinPath(...parts) {
  return parts
    .map((p) => String(p).replace(/\\/g, "/").replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}

/**
 * Bind the contract to a concrete period label and return the sync API.
 * @param {string} label e.g. "YYYY-YYYY" (read from period.md)
 */
function bind(label) {
  const per = (c) => periodFor(c, label);
  return {
    label,
    periodFor: per,

    // — the contract (spec §4) —
    artifactDir: (c, w) => joinPath(VAULT_PREFIX, "Artifacts", per(c), `Cycle ${c}`, `Week ${w}`),
    bBombDir: (c, w) => joinPath(VAULT_PREFIX, "B-Bombs", per(c), `Cycle ${c}`, `Week ${w}`),
    insightDir: (c) => joinPath(VAULT_PREFIX, "Insights", per(c), `Cycle ${c}`),
    insightFile: (c, w) => joinPath(VAULT_PREFIX, "Insights", per(c), `Cycle ${c}`, `Week ${w}.md`),
    reviewDir: (c, w) => joinPath(VAULT_PREFIX, "Reviews", per(c), "Weekly", `Cycle ${c}`, `Week ${w}`),
    reviewCycleDir: (c) => joinPath(VAULT_PREFIX, "Reviews", per(c), "Weekly", `Cycle ${c}`),
    reviewWeeklyDir: () => joinPath(VAULT_PREFIX, "Reviews", label, "Weekly"),
    mocsDir: (c) => joinPath(VAULT_PREFIX, "MOCs", per(c), "Weekly", `Cycle ${c}`),
    periodCardDir: () => joinPath(VAULT_PREFIX, "MOCs", label),
    planDir: (c) => joinPath(VAULT_PREFIX, "Plans", per(c), `Cycle ${c}`),
    periodPlanDir: () => joinPath(VAULT_PREFIX, "Plans", label),
    episodicDir: (c, w) => joinPath(VAULT_PREFIX, "Memory", "episodic", per(c), `Cycle-${c}`, `Week-${w}`),
    nextStepsDir: (c) => joinPath(VAULT_PREFIX, "Next Steps", per(c), `Cycle ${c}`),

    // — NOT cycle-scoped on purpose (Outreach spec §7): a record is created when
    // contact happens and must stay visible until it closes, regardless of cycle.
    // Mirrors `outreachDir()` in Tools/paths.js.
    outreachDir: () => joinPath(VAULT_PREFIX, "Outreach", label),

    // — generic escape hatch for any other cycle-scoped tree —
    cycleDir: (tree, c) => joinPath(VAULT_PREFIX, tree, per(c), `Cycle ${c}`),
  };
}

/**
 * Read period.md through the vault adapter and return the bound API.
 * FAILS LOUDLY (throws) — a macro must never guess a period label.
 */
async function load(adapter) {
  let raw = "";
  try {
    raw = await adapter.read(PERIOD_FILE);
  } catch (err) {
    throw new Error(
      `AI-Suplex path contract: cannot read ${PERIOD_FILE}. ` +
        `The vault has no Period source of truth. Restore period.md or run the vault initialiser.`
    );
  }
  const label = parseLabel(raw);
  if (!label) {
    throw new Error(
      `AI-Suplex path contract: ${PERIOD_FILE} has no readable period_label. ` +
        `Refusing to guess a period — fix period.md.`
    );
  }
  return bind(label);
}

module.exports = {
  VAULT_PREFIX,
  PRE_PERIOD,
  PERIOD_FILE,
  parseLabel,
  periodFor,
  joinPath,
  bind,
  load,
};
