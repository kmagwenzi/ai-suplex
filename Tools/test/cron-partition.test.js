#!/usr/bin/env node
"use strict";

/**
 * cron-partition.test.js — T008: D5 — one job, one owner.
 *
 * Proves the two halves of the cron executor never overlap:
 *   · rituals.sh (deterministic) executes NO LLM step and NO gateway call;
 *   · crontab.example schedules ONLY rituals.sh (the deterministic shell);
 *   · hermes-jobs.md (agent-shaped) holds the LLM + gateway jobs, and its
 *     create blocks never re-implement the index/graph math.
 *
 * Comments and help text are documentation, not calls — this test reads the
 * EXECUTABLE surface of each half.
 *
 * Usage: node Tools/test/cron-partition.test.js   · exit 0 = pass, 1 = regression.
 */

const fs = require("fs");
const path = require("path");

const RITUALS = fs.readFileSync(path.join(__dirname, "..", "rituals.sh"), "utf8");
const CRONTAB = fs.readFileSync(path.join(__dirname, "..", "cron", "crontab.example"), "utf8");
let HERMES = null;
try { HERMES = fs.readFileSync(path.join(__dirname, "..", "cron", "hermes-jobs.md"), "utf8"); } catch {}

let failures = 0;
function check(cond, msg) {
  console.log((cond ? "  [ok]   " : "  [FAIL] ") + msg);
  if (!cond) failures++;
}

// Strip comments + the usage heredoc, leaving only what rituals.sh EXECUTES.
function executableBody(src) {
  let out = [];
  let inHeredoc = false;
  for (const line of src.split("\n")) {
    if (/<<'EOF'/.test(line)) { inHeredoc = true; continue; }
    if (inHeredoc && /^EOF\s*$/.test(line)) { inHeredoc = false; continue; }
    if (inHeredoc) continue;
    out.push(line.replace(/\s+#.*$/, "")); // drop trailing inline comments
  }
  return out.join("\n");
}

// ── 1 · rituals.sh EXECUTES only deterministic tools ──
const EXEC = executableBody(RITUALS);
const RITUAL_FORBIDDEN = ["bbomb_hunter", "hermes", "asmc", "session_context", "DEEPSEEK_API", "GEMINI_API", "OPENAI"];
for (const tok of RITUAL_FORBIDDEN) {
  check(!EXEC.includes(tok), "rituals.sh executes no " + tok + " (deterministic only)");
}
check(!/\bpython3\b/.test(EXEC), "rituals.sh executes no python3 (the LLM step is gone)");
check(/3lm\.js index/.test(EXEC), "rituals.sh owns the deterministic 3lm index");
check(/vault-index/.test(EXEC), "rituals.sh owns the deterministic index rebuild");
check(!/knowledge-graph/.test(EXEC), "rituals.sh no longer rebuilds the graph (graph = Ultra)");

// ── 2 · crontab schedules ONLY rituals.sh ──
const cronSchedule = CRONTAB.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
for (const l of cronSchedule) {
  check(l.includes("rituals.sh"), "crontab line schedules rituals.sh only → " + l.trim().slice(0, 44));
}
check(cronSchedule.length === 3, "crontab schedules exactly 3 deterministic rituals");
check(/daily/.test(CRONTAB) && /saturday/.test(CRONTAB) && /tuesday/.test(CRONTAB), "crontab covers daily · saturday · tuesday");

// ── 3 · hermes-jobs.md is the agent-shaped half ──
check(!!HERMES, "Tools/cron/hermes-jobs.md exists (the agent-shaped definitions)");
if (HERMES) {
  const creates = (HERMES.match(/hermes cron create/g) || []).length;
  check(creates >= 4, "hermes-jobs.md defines ≥4 agent-shaped jobs (" + creates + " create blocks)");
  const blocks = (HERMES.match(/```[\s\S]*?```/g) || []).join("\n");
  check(/bbomb_hunter/.test(HERMES), "B-Bomb ranking (LLM) moved into hermes cron");
  check(/asmc open|operator brief/i.test(HERMES), "the operator brief is the deterministic source for the morning job");
  check(!/vault-index/.test(blocks) && !/knowledge-graph/.test(blocks), "no hermes job re-implements index/graph math (create blocks only)");
  check(/rituals\.sh/.test(HERMES), "hermes-jobs.md documents the partition against rituals.sh");
  check(/ai-suplex/.test(HERMES), "hermes-jobs.md gates on the ai-suplex profile");
  check(/gateway|discord/i.test(HERMES), "hermes-jobs.md gates on the gateway / delivery surface");
}

console.log(failures === 0
  ? "\nPASS — the executor is partitioned: deterministic shell vs agent-shaped cron, one job one owner."
  : "\nFAIL — " + failures + " assertion(s) failed.");
process.exit(failures === 0 ? 0 : 1);
