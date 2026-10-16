#!/usr/bin/env node
"use strict";

/**
 * threads-staleness.test.js — Context & Threads v2.0: the instance projection + guard.
 *
 * Proves (a) `threads --list` parses `{thread}-{ref}-{slug}.md` into instances,
 * (b) `_instances.md` is EXCLUDED from the guard/list, (c) `threads --open` returns
 * only `status: open`, and (d) `threads --stale` returns the OLDEST open instance
 * (the stalled-instance signal), not the newest file.
 *
 * Usage: node Tools/test/threads-staleness.test.js   · exit 0 = pass, 1 = regression.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

const THREE_LM = path.join(__dirname, "..", "3lm.js");

let failures = 0;
function check(cond, msg) { console.log((cond ? "  [ok]   " : "  [FAIL] ") + msg); if (!cond) failures++; }
function run(args) { return spawnSync("node", [THREE_LM].concat(args), { encoding: "utf8" }); }
function parseJSON(s) { try { return JSON.parse(s); } catch { return null; } }

// ── fixture: a throwaway Active/ with controlled mtimes ──
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "threads-test-"));
function mk(name, body, mtimeMs) {
  const p = path.join(TMP, name);
  fs.writeFileSync(p, body);
  fs.utimesSync(p, new Date(mtimeMs), new Date(mtimeMs));
}
mk("random-task-1-vault-migration.md", "---\nstatus: open\nopened: 2026-10-16T08:00\n---\n", 1000);       // OLDEST open
mk("long-running-tasks-1-777-production-push.md", "---\nstatus: closed\n---\n", 2000);                     // closed
mk("daily-tasks.md", "---\nstatus: open\n---\n", 2500);                                                     // singleton open
mk("random-task-2-cloudroom-spike.md", "---\nstatus: open\n---\n", 3000);                                    // NEWEST open
mk("_instances.md", "# projection\n", 4000);                                                                  // must be EXCLUDED

// ── (a) --list parses + excludes _instances.md ──
let r = run(["threads", "--list", "--json", "--dir", TMP]);
let json = parseJSON(r.stdout);
check(r.status === 0 && Array.isArray(json), "--list exits 0 and emits a JSON array");
check(json !== null && json.length === 4, "--list parses exactly 4 instance files (excludes _instances.md)");
check(json !== null && !json.some((x) => x.file === "_instances.md"), "_instances.md is excluded from --list");
const vm = json !== null ? json.find((x) => x.file === "random-task-1-vault-migration.md") : null;
check(vm !== null && vm.thread === "random-task" && vm.ref === "1" && vm.slug === "vault-migration", "--list parses thread/ref/slug from the filename");
check(vm !== null && vm.status === "open" && vm.opened === "2026-10-16T08:00", "--list reads status/opened from frontmatter");

// ── (b) legacy/old-shape files are NOT misparsed as instances ──
mk("daily-tasks-cycle-2-week-7-legacy.md", "---\n---\n", 3500);
r = run(["threads", "--list", "--json", "--dir", TMP]);
json = parseJSON(r.stdout);
check(json !== null && json.length === 4, "an old-shape file is not misparsed as an instance (count unchanged)");

// ── (c) --open filters to status: open ──
r = run(["threads", "--open", "--json", "--dir", TMP]);
json = parseJSON(r.stdout);
check(json !== null && json.length === 3, "--open returns 3 open (excludes the closed instance)");
check(json !== null && !json.some((x) => x.status === "closed"), "--open excludes closed instances");

// ── (d) --stale returns the OLDEST open instance ──
r = run(["threads", "--stale", "--json", "--dir", TMP]);
json = parseJSON(r.stdout);
check(json !== null && json !== null && json.file === "random-task-1-vault-migration.md", "--stale returns the OLDEST open instance (not the newest)");

fs.rmSync(TMP, { recursive: true, force: true });
console.log(failures === 0 ? "\nPASS — threads projection + open-instance staleness." : "\nFAIL — " + failures + " assertion(s) failed.");
process.exit(failures === 0 ? 0 : 1);