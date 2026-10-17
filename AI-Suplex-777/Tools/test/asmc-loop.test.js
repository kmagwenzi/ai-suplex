#!/usr/bin/env node
"use strict";

/**
 * asmc-loop.test.js — T007: the operator loop runs HEADLESS.
 *
 * Proves that `asmc open` is a deterministic projection over the v2.0 instance model
 * + the open tasklists (no LLM, no session, no chat), that it degrades on an EMPTY
 * vault (the fresh-clone property), that staleness is surfaced and can gate, and
 * that `asmc close` never invents a session.
 *
 * Usage: node Tools/test/asmc-loop.test.js   · exit 0 = pass, 1 = regression.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

const ASMC = path.join(__dirname, "..", "asmc.js");
const ACT = "AI-Suplex Kick-start/Context Kick-start/Active/";

let failures = 0;
function check(cond, msg) {
  console.log((cond ? "  [ok]   " : "  [FAIL] ") + msg);
  if (!cond) failures++;
}

function vault(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "asmc-"));
  for (const rel of Object.keys(files)) {
    const fp = path.join(dir, rel);
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, files[rel]);
  }
  return dir;
}

function run(v, args) {
  return spawnSync("node", [ASMC].concat(args).concat(["--vault", v]), { encoding: "utf8" });
}

const OPEN_INST =
  "---\nthread: long-running-tasks\nstatus: open\nopened: 2026-10-17T09:00\nwriter: committer\nagent: local\n---\n";

const POPULATED = {
  "period.md": '---\nperiod_label: "2026-2027"\n---\n',
  "Memory/vault-context.md": "# Vault Context\n\n> Cycle 2 · Week 7 · Generated 2026-10-17\n",
  [ACT + "daily-tasks.md"]: OPEN_INST,
  [ACT + "long-running-tasks-1-ultra-mvp.md"]: OPEN_INST,
  [ACT + "long-running-tasks-2-finished.md"]: "---\nstatus: closed\n---\n",
  [ACT + "_instances.md"]: "# projection (never an instance)\n",
  "Tasklists/Active/2026-10-17-demo-tasklist.md": [
    "---",
    "type: tasklist",
    "title: Demo",
    "---",
    "",
    "| ID | Role | Dur | Task | Nature |",
    "|----|------|-----|------|--------|",
    "| T001 | Builder | 10m | ✅ **DONE** — first | Execution |",
    "| T002 | Builder | 10m | second thing | Execution |",
    "| T003 | Builder | 10m | third thing | Execution |",
    "",
  ].join("\n"),
};

// ── 1 · the populated vault ────────────────────────────
const A = vault(POPULATED);
let r = run(A, ["open"]);
check(r.status === 0, "open exits 0 on a populated vault");
const out = r.stdout || "";
check(/Operator Brief/.test(out), "prints the operator brief header");
check(/Cycle 2/.test(out) && /Week 7/.test(out), "reads cycle + week from vault-context");
check(/2 open instance/.test(out), "counts ONLY open instances (2 of 3)");
check(/ultra-mvp/.test(out) && /daily-tasks/.test(out), "lists both open instances");
check(!/finished/.test(out), "never lists a CLOSED instance");
check(!/_instances.md/.test(out), "never lists the generated projection as an instance");
check(/T002/.test(out) && /next/.test(out), "reports the next unchecked task (T002)");
check(/3 tasks/.test(out) && /1 done/.test(out), "counts tasklist tasks (3 total, 1 done)");

// ── 2 · --json is machine-readable ─────────────────────
r = run(A, ["status", "--json"]);
check(r.status === 0, "status --json exits 0");
let j = null;
try { j = JSON.parse(r.stdout); } catch (e) {}
check(!!j, "status --json emits valid JSON");
check(j && j.open === 2, "json.open counts open instances");
check(j && Array.isArray(j.instances) && j.instances.length === 3, "json.instances carries every instance");
check(j && Array.isArray(j.tasklists) && j.tasklists[0].next === "T002", "json.tasklists[0].next === T002");

// ── 3 · staleness on the oldest open instance ──────────
const OLD = new Date(Date.now() - 30 * 86400000);
fs.utimesSync(path.join(A, ACT + "long-running-tasks-1-ultra-mvp.md"), OLD, OLD);
r = run(A, ["open"]);
check(r.status === 0, "open still exits 0 when stale (warn, do not block)");
check(/[Ss]tale/.test(r.stdout || ""), "surfaces the stale instance");
check(/30d|29d/.test(r.stdout || ""), "reports the age of the stale instance");

// ── 4 · --strict turns staleness into a gate ───────────
r = run(A, ["open", "--strict"]);
check(r.status === 1, "--strict exits 1 when stale (the cron gate)");

// ── 5 · EMPTY vault — the fresh-clone property ─────────
const B = vault({ "period.md": '---\nperiod_label: "2026-2027"\n---\n' });
r = run(B, ["open"]);
check(r.status === 0, "open exits 0 on an EMPTY vault (fresh clone)");
check(/0 open instance/.test(r.stdout || ""), "empty vault reports 0 open instances");
check(/0 open tasklist/.test(r.stdout || "") || /no open tasklist/i.test(r.stdout || ""), "empty vault reports no tasklists");

// ── 6 · close never invents a session ──────────────────
const C = vault(POPULATED);
r = run(C, ["close", "--dry-run"]);
check(r.status === 0, "close --dry-run exits 0");
const c = r.stdout || "";
check(/learn/.test(c) && /index/.test(c), "close plans learn + index");
check(/skip/i.test(c) && /end/i.test(c), "close SKIPS 3lm end when no session report exists today");
check(!/\[run\]/.test(c), "--dry-run runs nothing");

// ── 7 · confirm mutating mode refuses without 3lm ──────
r = run(C, ["close"]);
check(r.status !== 0, "close fails loudly when the vault has no Tools/3lm.js");

// ── 8 · usage ─────────────────────────────────────────
r = spawnSync("node", [ASMC], { encoding: "utf8" });
check(r.status === 0, "no args exits 0");
check(/asmc\.js open/.test(r.stdout || "") && /asmc\.js close/.test(r.stdout || ""), "usage documents the loop halves");

for (const d of [A, B, C]) fs.rmSync(d, { recursive: true, force: true });
console.log(failures === 0
  ? "\nPASS — the operator loop runs headless, degrades on an empty vault, and never invents a session."
  : "\nFAIL — " + failures + " assertion(s) failed.");
process.exit(failures === 0 ? 0 : 1);
