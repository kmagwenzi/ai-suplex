#!/usr/bin/env node
"use strict";

/**
 * tasklist-parser.js — T109 (THE HONEST MIRROR, Phase 2: the parser).
 *
 * Turns a tasklist markdown file into structured rows WITHOUT guessing.
 * The vault writes TWO formats and BOTH must parse without a crash:
 *   · table     — \`| ID | Role | Dur|Duration | Task | Nature |\` under \`## Phase N\`
 *   · checklist — \`- [x]\` / \`- [ ]\` under \`# Tasks\` (legacy, no ids)
 *
 * Doctrine rules this obeys:
 *   · reuse Tools/lib/frontmatter.js for frontmatter — never re-parse what is parsed;
 *   · unknown shapes → \`unparsed\`, never guessed;
 *   · a number is computed from a file, never from memory;
 *   · read-only — this module never writes.
 *
 * Node stdlib only.
 */

const fs = require("fs");
const path = require("path");
const { parseFrontmatter } = require("./frontmatter");
const { clean } = require("./text");

const TASKLIST_DIR = "Tasklists";

// ── table row helpers ────────────────────────────────────────────────────────
/** "| a | b | c |" → ["a","b","c"] (trimmed); null for a non-pipe line. */
function splitRow(line) {
  const s = line.trim();
  if (!s.startsWith("|")) return null;
  const inner = s.endsWith("|") ? s.slice(1, -1) : s.slice(1);
  return inner.split("|").map((c) => c.trim());
}

const DUR_COLS = new Set(["dur", "duration", "est", "estimate", "estimated", "mins", "minutes"]);

/** A task table header carries id + role + a duration column + a task column. */
function isTaskHeader(cells) {
  const c = cells.map((x) => x.toLowerCase());
  const hasId = c.includes("id");
  const hasRole = c.includes("role");
  const hasDur = c.some((x) => DUR_COLS.has(x));
  const hasTask = c.includes("task") || c.includes("description") || c.includes("item");
  return hasId && hasRole && hasDur && hasTask;
}

/** A markdown separator row: every cell is optional-colon + 2+ dashes + optional-colon. */
function isSeparator(cells) {
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

function isDoneCell(s) {
  return /✅|done|complete/i.test(String(s || ""));
}

// ── duration ─────────────────────────────────────────────────────────────────
/** "25m"|"5 min"|"1.5h"|"—" → minutes; null when unparseable (never guessed). */
function parseMinutes(raw) {
  if (raw == null) return null;
  const t = String(raw).trim().toLowerCase();
  if (!t || t === "—" || t === "–" || t === "-" || t === "n/a" || t === "na") return null;
  const m = t.match(/^([\d.]+)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes|d|day|days)$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2][0];
  if (unit === "h") return Math.round(n * 60);
  if (unit === "d") return Math.round(n * 8 * 60); // a working day = 8 hours
  return Math.round(n);
}

// ── parse ────────────────────────────────────────────────────────────────────
/**
 * parseTasklist(content, relPath) → a report object. Pure: no I/O, no writes.
 */
function parseTasklist(content, relPath) {
  const { data: meta } = parseFrontmatter(content); // reuse the vault's frontmatter reader

  const allLines = content.split("\n");
  // skip the frontmatter block so reported line numbers are ABSOLUTE file lines
  let start = 0;
  if (allLines[0] && allLines[0].trim() === "---") {
    for (let k = 1; k < allLines.length; k++) {
      if (allLines[k].trim() === "---") { start = k + 1; break; }
    }
  }

  const tasks = [];
  const checks = [];
  const unparsed = [];
  const phases = [];

  let phase = { heading: null, line: 0 };
  let havePhase = false;

  const setPhase = (heading, lineNo) => {
    phase = { heading: clean(heading), line: lineNo };
    havePhase = true;
  };
  const curPhase = () => (phases.length ? phases[phases.length - 1] : null);
  const bumpPhase = (key) => {
    const p = curPhase();
    if (p) p[key] += 1;
  };

  for (let i = start; i < allLines.length; i++) {
    const line = allLines[i];
    const lineNo = i + 1;

    // heading → a new phase
    const h = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/);
    if (h && !line.trim().startsWith("|")) {
      setPhase(h[2], lineNo);
      if (havePhase) phases.push({ heading: phase.heading, line: lineNo, tasks: 0, checked: 0, unchecked: 0 });
      continue;
    }

    // checkbox
    const cb = line.match(/^\s*[-*]\s+\[([ xX])\]\s*(.*)$/);
    if (cb) {
      const checked = cb[1].toLowerCase() === "x";
      checks.push({ title: clean(cb[2]), checked, phase: phase.heading, file: relPath, line: lineNo });
      bumpPhase(checked ? "checked" : "unchecked");
      continue;
    }

    // table header
    const cells = splitRow(line);
    if (cells && isTaskHeader(cells)) {
      const col = (name) => cells.findIndex((x) => x.toLowerCase() === name.toLowerCase());
      const idIdx = col("id");
      const roleIdx = col("role");
      const durIdx = cells.findIndex((x) => DUR_COLS.has(x.toLowerCase()));
      const taskIdx = col("task") >= 0 ? col("task") : cells.findIndex((x) => ["description", "item"].includes(x.toLowerCase()));
      const natIdx = col("nature");
      const evIdx = cells.findIndex((x) => /evidence/i.test(x.toLowerCase()));

      let j = i + 1;
      for (; j < allLines.length; j++) {
        const dl = allLines[j];
        if (!dl.trim()) break;
        const dcells = splitRow(dl);
        if (!dcells) break;
        if (isSeparator(dcells)) continue;
        if (isTaskHeader(dcells)) break; // another table begins
        if (dcells.length < 3) {
          unparsed.push({ file: relPath, line: j + 1, raw: dl.trim(), reason: "task row with fewer than 3 cells" });
          continue;
        }
        const idCell = idIdx >= 0 ? (dcells[idIdx] != null ? dcells[idIdx] : "") : "";
        const roleCell = roleIdx >= 0 ? (dcells[roleIdx] != null ? dcells[roleIdx] : "") : "";
        const durCell = durIdx >= 0 ? (dcells[durIdx] != null ? dcells[durIdx] : "") : "";
        const titleCell = taskIdx >= 0 ? (dcells[taskIdx] != null ? dcells[taskIdx] : "") : "";
        const natCell = natIdx >= 0 ? (dcells[natIdx] != null ? dcells[natIdx] : "") : "";
        const evCell = evIdx >= 0 && dcells[evIdx] != null ? dcells[evIdx] : null;

        const rawTitle = titleCell ? clean(titleCell) : "";
        const titleDone = /^✅\s*/.test(rawTitle);
        const title = titleDone ? rawTitle.replace(/^✅\s*/, "") : rawTitle;
        const done = isDoneCell(roleCell) || isDoneCell(natCell) || isDoneCell(idCell) || titleDone;
        tasks.push({
          id: isDoneCell(idCell) || !idCell ? null : clean(idCell),
          role: isDoneCell(roleCell) || !roleCell ? null : clean(roleCell),
          dur: durCell ? clean(durCell) : null,
          minutes: parseMinutes(durCell),
          nature: isDoneCell(natCell) || !natCell ? null : clean(natCell),
          title,
          status: done ? "done" : "open",
          phase: phase.heading,
          evidence: evCell ? clean(evCell) : null,
          file: relPath,
          line: j + 1,
        });
        bumpPhase("tasks");
      }
      i = j - 1;
      continue;
    }
  }

  const hasEvidenceField =
    tasks.some((t) => t.evidence != null) ||
    Object.keys(meta).some((k) => /evidence/i.test(k));

  return {
    path: relPath,
    meta,
    format: tasks.length > 0 ? "table" : checks.length > 0 ? "checklist" : "empty",
    tasks,
    checks,
    unparsed,
    phases: phases.filter((p) => p.tasks || p.checked || p.unchecked),
    counts: {
      tasks: tasks.length,
      tasksDone: tasks.filter((t) => t.status === "done").length,
      checks: checks.length,
      checksDone: checks.filter((c) => c.checked).length,
      unparsed: unparsed.length,
    },
    hasEvidenceField,
  };
}

// ── walk ─────────────────────────────────────────────────────────────────────
/** Every tasklist .md under Tasklists/ (Active + Archive), vault-relative, sorted. */
function walkTasklists(vault) {
  const root = path.join(vault, TASKLIST_DIR);
  const out = [];
  const walk = (dir) => {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith(".md")) out.push(path.relative(vault, full).split(path.sep).join("/"));
    }
  };
  walk(root);
  return out.sort();
}

/** Parse every tasklist in the vault. No writes. */
function parseAll(vault) {
  return walkTasklists(vault).map((rel) => {
    const content = fs.readFileSync(path.join(vault, rel), "utf8");
    return parseTasklist(content, rel);
  });
}

module.exports = { parseTasklist, walkTasklists, parseAll, parseMinutes };

// ── CLI ──────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const vault = path.resolve(__dirname, "..", "..");
  const target = process.argv[2];
  if (!target || target === "--all") {
    const reports = parseAll(vault);
    const summary = reports.map((r) => ({ path: r.path, format: r.format, tasks: r.counts.tasks, done: r.counts.tasksDone, checks: r.counts.checks, unparsed: r.counts.unparsed }));
    console.log(JSON.stringify({ tasklists: reports.length, summary }, null, 2));
  } else {
    let rel = target;
    if (!rel.startsWith(TASKLIST_DIR + "/")) {
      const hits = walkTasklists(vault).filter((p) => p === target || p.endsWith("/" + target));
      if (hits.length === 0) { console.error("no tasklist matches " + JSON.stringify(target)); process.exit(2); }
      rel = hits[0];
    }
    const content = fs.readFileSync(path.join(vault, rel), "utf8");
    console.log(JSON.stringify(parseTasklist(content, rel), null, 2));
  }
}
