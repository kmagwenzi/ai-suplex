#!/usr/bin/env node
"use strict";

/**
 * db.js — T110 (THE HONEST MIRROR, Phase 3: the store).
 *
 * The ONLY file that imports \`node:sqlite\` (O-3.1). It owns the mirror's
 * derived store — one SQLite file DROPPED and re-derived from the vault on every
 * rebuild. No incremental truth.
 *
 *   node Tools/lib/db.js rebuild [--db PATH]
 *   node Tools/lib/db.js query "<sql>" [--db PATH]
 *
 * Doctrine: the vault is canonical, this DB is derived. Every cell traces to a
 * file (report.path + task.line). rebuild deletes the file and re-parses the
 * vault — same input, byte-identical store. The mirror does not store opinions;
 * it stores what the files prove.
 */

const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { parseAll } = require("./tasklist-parser");

const DEFAULT_DB = "Memory/mirror.db";

// ── schema (report · task · check_item · evidence + the views that matter) ──
const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS report(",
  "  id TEXT PRIMARY KEY,",
  "  path TEXT NOT NULL,",
  "  cycle INTEGER, week INTEGER, date TEXT, thread TEXT, focus TEXT,",
  "  format TEXT,",
  "  declared INTEGER NOT NULL DEFAULT 0,",
  "  checked INTEGER NOT NULL DEFAULT 0,",
  "  evidenced INTEGER NOT NULL DEFAULT 0,",
  "  artifacts INTEGER NOT NULL DEFAULT 0,",
  "  duration_min INTEGER NOT NULL DEFAULT 0,",
  "  rating INTEGER",
  ");",
  "CREATE TABLE IF NOT EXISTS task(",
  "  report_id TEXT NOT NULL,",
  "  line INTEGER NOT NULL,",
  "  task_id TEXT, role TEXT, nature TEXT, est_min INTEGER,",
  "  checked INTEGER NOT NULL DEFAULT 0,",
  "  evidence_type TEXT, evidence_ref TEXT,",
  "  title TEXT, phase TEXT,",
  "  PRIMARY KEY (report_id, line)",
  ");",
  "CREATE TABLE IF NOT EXISTS check_item(",
  "  report_id TEXT NOT NULL,",
  "  line INTEGER NOT NULL,",
  "  title TEXT, checked INTEGER NOT NULL DEFAULT 0, phase TEXT,",
  "  PRIMARY KEY (report_id, line)",
  ");",
  "CREATE TABLE IF NOT EXISTS evidence(",
  "  task_id TEXT, report_id TEXT, kind TEXT, ref TEXT, verified INTEGER",
  ");",
  "CREATE VIEW IF NOT EXISTS evidence_coverage AS",
  "  SELECT id, path, declared, checked, evidenced,",
  "    CASE WHEN checked > 0 THEN ROUND(100.0 * evidenced / checked, 1) ELSE NULL END AS coverage_pct",
  "  FROM report;",
  "CREATE VIEW IF NOT EXISTS claim_gap AS",
  "  SELECT id, path, checked - evidenced AS gap FROM report;",
  "CREATE VIEW IF NOT EXISTS per_phase_completion AS",
  "  SELECT report_id, phase, COUNT(*) AS total, SUM(checked) AS done",
  "  FROM task GROUP BY report_id, phase;",
].join("\n");

function toInt(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

/** Open (and lazily create) the store. Idempotent. */
function openDb(dbPath) {
  const db = new DatabaseSync(dbPath);
  db.exec(SCHEMA);
  return db;
}

/**
 * The unified task list for one report.
 *   table     → the table rows are the tasks (checked = done marker)
 *   checklist → the checkbox entries are the tasks (checked = [x])
 * Success-criteria checkboxes in a table report are NOT tasks (they live in check_item).
 */
function unifiedTasks(report) {
  if (report.format === "checklist") {
    return report.checks.map((c) => ({
      task_id: null, role: null, nature: null, est_min: null,
      checked: c.checked ? 1 : 0, title: c.title, phase: c.phase, line: c.line,
      evidence_ref: null,
    }));
  }
  return report.tasks.map((t) => ({
    task_id: t.id, role: t.role, nature: t.nature, est_min: t.minutes,
    checked: t.status === "done" ? 1 : 0, title: t.title, phase: t.phase, line: t.line,
    evidence_ref: t.evidence,
  }));
}

/** Delete the store and re-derive it from the vault. No incremental truth. */
function rebuild(vault, dbPath) {
  if (fs.existsSync(dbPath)) fs.rmSync(dbPath);
  const db = openDb(dbPath);
  const reports = parseAll(vault);

  const insReport = db.prepare(
    "INSERT INTO report(id, path, cycle, week, date, thread, focus, format, declared, checked, evidenced, artifacts, duration_min, rating) " +
    "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
  );
  const insTask = db.prepare(
    "INSERT INTO task(report_id, line, task_id, role, nature, est_min, checked, evidence_type, evidence_ref, title, phase) " +
    "VALUES (?,?,?,?,?,?,?,?,?,?,?)"
  );
  const insCheck = db.prepare(
    "INSERT INTO check_item(report_id, line, title, checked, phase) VALUES (?,?,?,?,?)"
  );

  let declared = 0, checked = 0;
  db.exec("BEGIN"); // one atomic, fast rebuild — never 1600 autocommits
  try {
    for (const r of reports) {
      const id = r.path;
      const tasks = unifiedTasks(r);
      const checkedCount = tasks.reduce((s, t) => s + (t.checked ? 1 : 0), 0);
      const durSum = tasks.reduce((s, t) => s + (t.est_min || 0), 0);
      const legacy = !r.hasEvidenceField;
      insReport.run(
        id, r.path,
        toInt(r.meta.cycle), toInt(r.meta.week),
        r.meta.date || r.meta.created || null,
        r.meta.thread || null, r.meta.focus || null,
        r.format, tasks.length, checkedCount, 0, 0, durSum, null
      );
      for (const t of tasks) {
        insTask.run(id, t.line, t.task_id, t.role, t.nature, t.est_min, t.checked,
          legacy ? "legacy_unknown" : null, t.evidence_ref, t.title, t.phase);
      }
      if (r.format === "table") {
        for (const c of r.checks) insCheck.run(id, c.line, c.title, c.checked ? 1 : 0, c.phase);
      }
      declared += tasks.length; checked += checkedCount;
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    db.close();
    throw e;
  }
  db.close();
  return { db: dbPath, reports: reports.length, tasks: declared, checked };
}

/** Deterministic snapshot of the store — for rebuild-diff (acceptance test #1). */
function dump(dbPath) {
  const db = openDb(dbPath);
  const out = {};
  for (const table of ["report", "task", "check_item", "evidence"]) {
    out[table] = db.prepare("SELECT * FROM " + table + " ORDER BY 1, 2").all();
  }
  db.close();
  return out;
}

module.exports = { openDb, rebuild, dump, unifiedTasks, toInt, DEFAULT_DB };

// ── CLI ──────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const vault = path.resolve(__dirname, "..", "..");
  const ai = (n) => process.argv.indexOf(n);
  const dbPath = ai("--db") >= 0 ? process.argv[ai("--db") + 1] : path.join(vault, DEFAULT_DB);
  const cmd = process.argv[2];
  if (cmd === "rebuild") {
    console.log(JSON.stringify(rebuild(vault, dbPath), null, 2));
  } else if (cmd === "query") {
    const sql = process.argv[3];
    const db = openDb(dbPath);
    console.log(JSON.stringify(db.prepare(sql).all(), null, 2));
    db.close();
  } else {
    console.log([
      "db — the mirror's derived store (T110). node:sqlite isolated here.",
      "",
      "  node Tools/lib/db.js rebuild [--db PATH]   # delete + re-derive from the vault",
      "  node Tools/lib/db.js query '<sql>' [--db PATH]",
      "",
      "  Default db: " + DEFAULT_DB + " (gitignored, rebuildable from zero).",
    ].join("\n"));
  }
}
