#!/usr/bin/env node
"use strict";

/**
 * approvals-cli.test.js — T010 split: approvals is its own CLI, 3lm stays memory-only.
 *
 * Proves Tools/approvals.js reads the gate (gauntlet in-battle artifacts, the lessons
 * pool, the B-Bombs count) and that Tools/3lm.js no longer owns the approvals command.
 *
 * Usage: node Tools/test/approvals-cli.test.js   · exit 0 = pass, 1 = regression.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

const APPROVALS = path.join(__dirname, "..", "approvals.js");
const THREE_LM = path.join(__dirname, "..", "3lm.js");

let failures = 0;
function check(cond, msg) { console.log((cond ? "  [ok]   " : "  [FAIL] ") + msg); if (!cond) failures++; }

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "approvals-"));
fs.mkdirSync(path.join(TMP, "Artifacts/2026-2027/Cycle 1/Week 1"), { recursive: true });
fs.writeFileSync(
  path.join(TMP, "Artifacts/2026-2027/Cycle 1/Week 1/battle.md"),
  "---\ntype: gauntlet\nstatus: in-battle\nmission: The First Battle\n---\n",
);
fs.mkdirSync(path.join(TMP, "Memory"), { recursive: true });
fs.writeFileSync(
  path.join(TMP, "Memory/lessons.md"),
  "## Current Lessons\n- [A] should promote this lesson\n- [B] keep this one\n",
);
fs.mkdirSync(path.join(TMP, "B-Bombs"), { recursive: true });
fs.writeFileSync(path.join(TMP, "B-Bombs/something.md"), "# b\n");

function run(args) { return spawnSync("node", [APPROVALS].concat(args).concat(["--vault", TMP]), { encoding: "utf8" }); }

// 1 — --json
let r = run(["--json"]);
check(r.status === 0, "--json exits 0");
let j = null; try { j = JSON.parse(r.stdout); } catch (e) {}
check(!!j, "--json emits valid JSON");
check(!!j && j.gates.length === 1 && j.gates[0].mission === "The First Battle", "finds the in-battle gauntlet gate");
check(!!j && j.lessons.pool === 2, "counts the lessons pool (2)");
check(!!j && j.bBombs.count === 1, "counts B-Bombs (1)");

// 2 — human output
r = run([]);
check(r.status === 0, "human output exits 0");
check(/FINAL BOSS/.test(r.stdout || ""), "human output names FINAL BOSS gates");
check(/Hustler/.test(r.stdout || ""), "human output addresses the Hustler");

// 3 — 3lm no longer owns approvals
r = spawnSync("node", [THREE_LM, "approvals"], { encoding: "utf8" });
check(!/Hustler decides/.test(r.stdout || ""), "3lm approvals no longer runs the gate (memory-only)");
check(/Usage/.test(r.stdout || ""), "3lm falls through to usage for the removed command");

fs.rmSync(TMP, { recursive: true, force: true });
console.log(failures === 0 ? "\nPASS — approvals is its own CLI; 3lm is memory-only." : "\nFAIL — " + failures + " assertion(s) failed.");
process.exit(failures === 0 ? 0 : 1);
