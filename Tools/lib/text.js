"use strict";

/**
 * text.js — tiny deterministic text helpers shared by the Ultra tools.
 *
 * Extracted from Tools/opportunity.js (the Portfolio Opportunity Mapper) so the
 * Living Wiki (Tools/wiki.js) reuses the SAME implementations instead of drifting
 * a second copy (PRD — Living Wiki v1: "reuse opportunity.js's clean/toNum/median").
 */

/** Trim and strip repeated outer quote layers ("x" → x, "'y'" → y). */
function clean(v) {
  let t = String(v == null ? "" : v).trim();
  while ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

/** Number(v) when finite, else 0. */
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Median of a numeric array; empty → 0. */
function median(arr) {
  if (arr.length === 0) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2;
}

module.exports = { clean, toNum, median };
