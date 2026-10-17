#!/usr/bin/env node
"use strict";

/**
 * asmc — AI-Suplex Mission Control: the HEADLESS operator loop (T007).
 *
 * The AS MC is not a new system: it is the vault's operating loop instantiated as one
 * executor. This tool is the loop, minus the chat window — it runs the rhythm
 * (open -> execute -> close) against the v2.0 instance model with no LLM in the path.
 *
 *   open    the loop's left half  — the operator brief: the four threads AS
 *           INSTANCES, the open tasklists (+ the next unchecked task), the staleness
 *           guard. Deterministic: no LLM, no session, no writes.
 *   close   the loop's right half — 3lm learn -> index (and 3lm end ONLY when a
 *           Session End report from today exists; only daily-tasks runs a session).
 *   status  the same state as JSON (--json) for a cron / delivery surface.
 *
 * Invariants (Spec — AS MC · Spec — Context & Threads v2.0):
 *   · One instance = one file. This tool READS instances; it never opens or archives one.
 *   · It never writes the Active Mission Context (daily-tasks is its sole writer).
 *   · It never runs 3lm sync — the commit is the closure, and one committer owns it.
 *
 * Usage:
 *   node Tools/asmc.js open    [--vault PATH] [--max DAYS] [--strict] [--json]
 *   node Tools/asmc.js close   [--vault PATH] [--dry-run] [--end]
 *   node Tools/asmc.js status  [--vault PATH] [--json]
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

// ── CLI ────────────────────────────────────────────────

function flag(name) {
  return process.argv.includes("--" + name);
}
function opt(name, fallback) {
  const i = process.argv.indexOf("--" + name);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : fallback;
}

const VAULT = path.resolve(opt("vault", path.join(__dirname, "..")));
const ACTIVE_DIR = path.join(VAULT, "AI-Suplex Kick-start", "Context Kick-start", "Active");
const MISSION_CONTEXT = path.join(VAULT, "AI-Suplex Kick-start", "Context Kick-start", "Active Mission Context.md");
const TASKLISTS_DIR = path.join(VAULT, "Tasklists", "Active");
const SESSIONS_END_DIR = path.join(VAULT, "Sessions", "Active", "End");
const THREE_LM = path.join(VAULT, "Tools", "3lm.js");

const MAX_DAYS = Number(opt("max", 7)) || 7;
const STRICT = flag("strict");

// Instance model — Context & Threads v2.0. Mirrors Tools/3lm.js: an instance is
// {thread}-{ref}-{slug}.md (N lanes) or {thread}.md (daily-tasks / realist singletons).
// _instances.md is the generated projection — never an instance.
const INSTANCE_RE = /^(daily-tasks|long-running-tasks|random-task|realist)-(\d+)-(.+)\.md$/;
const SINGLETON_RE = /^(daily-tasks|realist)\.md$/;
const DAY = 86400000;

// ── UTILS ──────────────────────────────────────────────

function read(p) {
  try { return fs.readFileSync(p, "utf-8"); } catch { return null; }
}

function readdir(p) {
  try { return fs.readdirSync(p); } catch { return []; }
}

function parseFrontmatter(content) {
  const m = (content || "").match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)/);
    if (kv) data[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return data;
}

function stamp(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function ageDays(ms) {
  return ms ? (Date.now() - ms) / DAY : null;
}

function humanAge(days) {
  if (days === null) return "—";
  if (days < 1) return Math.round(days * 24) + "h";
  return Math.round(days) + "d";
}

// ── THE FOUR THREADS AS v2.0 INSTANCES ─────────────────

function collectInstances() {
  const instances = [];
  const legacy = [];
  for (const name of readdir(ACTIVE_DIR)) {
    if (!name.endsWith(".md")) continue;
    if (name === "_instances.md") continue; // projection — never an instance
    const im = name.match(INSTANCE_RE);
    const sm = im ? null : name.match(SINGLETON_RE);
    if (!im && !sm) { legacy.push(name); continue; }
    const fp = path.join(ACTIVE_DIR, name);
    const fm = parseFrontmatter(read(fp) || "");
    let mtimeMs = 0;
    try { mtimeMs = fs.statSync(fp).mtimeMs; } catch {}
    instances.push({
      thread: im ? im[1] : sm[1],
      ref: im ? im[2] : null,
      slug: im ? im[3] : null,
      singleton: !im,
      file: name,
      status: fm.status || "open",
      opened: fm.opened || null,
      writer: fm.writer || null,
      agent: fm.agent || null,
      mission: fm.mission || null,
      mtimeMs,
      ageDays: ageDays(mtimeMs),
    });
  }
  instances.sort((a, b) => {
    if (a.thread !== b.thread) return a.thread < b.thread ? -1 : 1;
    const ar = a.singleton ? -1 : Number(a.ref);
    const br = b.singleton ? -1 : Number(b.ref);
    return ar - br;
  });
  return { instances, legacy };
}

// ── THE OPEN TASKLISTS ─────────────────────────────────

const TASK_ROW = /^\|\s*(T\d+)\s*\|/;
const TASK_DONE = /✅|\bDONE\b|\[x\]/i;

function taskTitle(line) {
  const cells = line.split("|").map((c) => c.trim());
  const raw = cells[4] || "";
  const clean = raw
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .split("\u2014")[0]
    .trim();
  return clean.length > 72 ? clean.slice(0, 71) + "…" : clean;
}

function scanTasklist(fp) {
  const content = read(fp) || "";
  const fm = parseFrontmatter(content);
  let tasks = 0;
  let done = 0;
  let next = null;
  for (const line of content.split("\n")) {
    const m = line.match(TASK_ROW);
    if (!m) continue;
    tasks++;
    if (TASK_DONE.test(line)) done++;
    else if (!next) next = { id: m[1], title: taskTitle(line) };
  }
  let mtimeMs = 0;
  try { mtimeMs = fs.statSync(fp).mtimeMs; } catch {}
  return {
    file: path.basename(fp),
    title: fm.title || null,
    status: fm.status || "active",
    mtimeMs: mtimeMs,
    tasks: tasks,
    done: done,
    next: next ? next.id : null,
    nextTitle: next ? next.title : null,
  };
}

function scanTasklists() {
  const out = [];
  for (const name of readdir(TASKLISTS_DIR).sort()) {
    if (!name.endsWith(".md")) continue;
    const fp = path.join(TASKLISTS_DIR, name);
    if (!fs.existsSync(fp)) continue;
    out.push(scanTasklist(fp));
  }
  // Current work first — the brief surfaces what was touched most recently.
  out.sort((a, b) => b.mtimeMs - a.mtimeMs || (a.file < b.file ? -1 : 1));
  return out;
}

// ── THE STALENESS GUARD (the operator's two targets) ───
// The full 6-file memory guard lives in 3lm start; the operator brief guards the two
// things the operator ACTS ON: the live mission state and the oldest open instance.

function checkStaleness(instances) {
  const stale = [];
  const mc = read(MISSION_CONTEXT);
  if (mc) {
    const dm = mc.match(/\*\*Date:\*\*\s*(.+)/);
    const m = dm && dm[1].match(/([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/);
    const ts = m ? new Date(m[1] + " " + m[2] + ", " + m[3]).getTime() : null;
    const d = ageDays(ts);
    if (d !== null && d > MAX_DAYS) {
      stale.push({ label: "Active Mission Context", file: MISSION_CONTEXT, days: d, fix: "refresh it (daily-tasks is the sole writer)" });
    }
  }
  const open = instances.filter((i) => i.status === "open");
  if (open.length > 0) {
    const oldest = open.slice().sort((a, b) => a.mtimeMs - b.mtimeMs)[0];
    const d = ageDays(oldest.mtimeMs);
    if (d !== null && d > MAX_DAYS) {
      stale.push({ label: "Instance " + oldest.file, file: path.join(ACTIVE_DIR, oldest.file), days: d, fix: "close it (Save Context → archive, dated)" });
    }
  }
  return stale;
}

// ── CONTEXT (period / cycle / week) ────────────────────

function readState() {
  const period = parseFrontmatter(read(path.join(VAULT, "period.md")) || "").period_label || null;
  const vc = read(path.join(VAULT, "Memory", "vault-context.md")) || "";
  const m = vc.match(/>\s*Cycle\s+(\d+)\s*·\s*Week\s+(\d+)/);
  return {
    vault: VAULT,
    date: stamp(Date.now()),
    period: period,
    cycle: m ? Number(m[1]) : null,
    week: m ? Number(m[2]) : null,
  };
}

// ── RENDER ─────────────────────────────────────────────

function renderBrief(state, instances, tasklists, stale) {
  const open = instances.filter((i) => i.status === "open");
  const L = [];

  L.push("# 🦸 Operator Brief — " + state.date);
  const meta = [];
  if (state.period) meta.push("**Period:** " + state.period);
  if (state.cycle) meta.push("Cycle " + state.cycle);
  if (state.week) meta.push("Week " + state.week);
  if (meta.length) L.push(meta.join(" · "));
  L.push("");

  L.push("## 🧵 Threads — " + open.length + " open instance(s)");
  if (open.length === 0) {
    L.push("  (none — a fresh vault has no instance yet; open one with the thread's pattern)");
  } else {
    L.push("| ref | thread | slug | opened | writer | age |");
    L.push("|-----|--------|------|--------|--------|-----|");
    for (const i of open) {
      L.push(
        "| " + (i.singleton ? "— *(singleton)*" : i.ref) + " | " + i.thread + " | " +
        (i.singleton ? "—" : i.slug) + " | " + (i.opened || "—") + " | " +
        (i.writer || "—") + " | " + humanAge(i.ageDays) + " |"
      );
    }
  }
  L.push("");

  L.push("## ⚠️ Staleness guard — " + (stale.length === 0 ? "clean" : stale.length + " stale"));
  if (stale.length === 0) {
    L.push("  ✅ every target is within " + MAX_DAYS + "d");
  } else {
    for (const s of stale) {
      L.push("  ⏰ " + s.label + " → " + humanAge(s.days) + " old");
      L.push("     " + s.file);
      L.push("     → " + s.fix);
    }
  }
  L.push("");

  L.push("## 📋 Tasklists — " + tasklists.length + " open tasklist(s)");
  if (tasklists.length === 0) {
    L.push("  (none — no open tasklist in Tasklists/Active/)");
  } else {
    for (const t of tasklists) {
      let line;
      if (t.tasks === 0) {
        line = "  · " + t.file + " — (no task rows detected)";
      } else {
        line = "  · " + t.file + " — " + t.tasks + " tasks · " + t.done + " done";
        if (t.next) line += " · next **" + t.next + "**" + (t.nextTitle ? " — " + t.nextTitle : "");
        else line += " · ✅ all checked";
      }
      L.push(line);
    }
  }
  L.push("");

  L.push("## ▶️ Next");
  L.push("  · full memory load (semantic · lessons · episodes):  node Tools/3lm.js start");
  L.push("  · close the loop when done:  node Tools/asmc.js close");
  L.push("");
  L.push("*Deterministic — no LLM in the path. The full 6-file memory guard runs inside 3lm start.*");
  return L.join("\n");
}

function buildState() {
  const state = readState();
  const { instances, legacy } = collectInstances();
  const tasklists = scanTasklists();
  const stale = checkStaleness(instances);
  return { state, instances, legacy, tasklists, stale };
}

// ── COMMANDS ───────────────────────────────────────────

function outputJson(state, instances, tasklists, stale) {
  const clean = instances.map((i) => {
    const o = Object.assign({}, i);
    delete o.mtimeMs;
    return o;
  });
  console.log(JSON.stringify({
    vault: state.vault,
    date: state.date,
    period: state.period,
    cycle: state.cycle,
    week: state.week,
    open: clean.filter((i) => i.status === "open").length,
    instances: clean,
    tasklists: tasklists.map(function (t) {
      const o = Object.assign({}, t);
      delete o.mtimeMs;
      return o;
    }),
    stale: stale.map((s) => ({ label: s.label, file: s.file, days: Math.round(s.days), fix: s.fix })),
    ok: stale.length === 0,
  }, null, 2));
}

function cmdOpen() {
  const { state, instances, legacy, tasklists, stale } = buildState();
  if (flag("json")) {
    outputJson(state, instances, tasklists, stale);
  } else {
    console.log(renderBrief(state, instances, tasklists, stale));
    if (legacy.length) {
      console.log("");
      console.log("⚠️  Legacy (old-shape) context files — archive on close: " + legacy.join(", "));
    }
  }
  if (STRICT && stale.length > 0) process.exit(1);
}

function cmdStatus() {
  const { state, instances, tasklists, stale } = buildState();
  if (flag("json")) {
    outputJson(state, instances, tasklists, stale);
  } else {
    const open = instances.filter((i) => i.status === "open");
    console.log("AS MC · " + state.date + (state.period ? " · " + state.period : "") +
      (state.cycle ? " · Cycle " + state.cycle + " Week " + state.week : ""));
    console.log("  vault:      " + VAULT);
    console.log("  instances:  " + open.length + " open / " + instances.length + " total");
    console.log("  tasklists:  " + tasklists.length + " open");
    console.log("  staleness:  " + (stale.length === 0 ? "clean" : stale.length + " stale"));
  }
  if (STRICT && stale.length > 0) process.exit(1);
}

// The loop's right half. 3lm end writes an episode from the newest Session End report
// — it is the DAILY-TASKS session's close, never a background lane's. So close runs it
// only when a report from TODAY exists, and otherwise says so out loud.
function todayReport() {
  let newest = null;
  for (const name of readdir(SESSIONS_END_DIR)) {
    if (!name.endsWith(".md")) continue;
    const fp = path.join(SESSIONS_END_DIR, name);
    let mtimeMs = 0;
    try { mtimeMs = fs.statSync(fp).mtimeMs; } catch { continue; }
    if (!newest || mtimeMs > newest.mtimeMs) newest = { file: name, mtimeMs: mtimeMs };
  }
  if (!newest) return null;
  return stamp(newest.mtimeMs) === stamp(Date.now()) ? newest : null;
}

function cmdClose() {
  const dry = flag("dry-run");
  const forceEnd = flag("end");
  const report = todayReport();
  const runEnd = forceEnd || !!report;

  const steps = [];
  if (runEnd) {
    steps.push({ run: true, label: "3lm end", note: report ? report.file : "forced with --end" });
  } else {
    steps.push({ run: false, label: "3lm end", note: "no Session End report from today — only the daily-tasks session closes with end" });
  }
  steps.push({ run: true, label: "3lm learn", note: "extract lessons from the latest episode" });
  steps.push({ run: true, label: "3lm index", note: "refresh the memory lookup" });

  console.log("▶ close — the loop's right half");
  for (const s of steps) {
    if (!s.run) console.log("  [skip] " + s.label + " — " + s.note);
    else console.log("  [" + (dry ? "plan" : "run") + "] " + s.label + " — " + s.note);
  }
  console.log("");
  console.log("  ↳ 3lm sync is NOT run here — the commit is the closure, and one committer owns it.");

  if (dry) return;

  if (!fs.existsSync(THREE_LM)) {
    console.error("asmc error: " + THREE_LM + " not found — this vault has no 3lm.");
    process.exit(2);
  }
  for (const s of steps) {
    if (!s.run) continue;
    const cmd = s.label.replace("3lm ", "");
    const r = spawnSync(process.execPath, [THREE_LM, cmd], { cwd: VAULT, stdio: "inherit" });
    if (r.status !== 0) {
      console.error("asmc error: 3lm " + cmd + " exited " + r.status + " — stopping the loop.");
      process.exit(r.status || 1);
    }
  }
}

function usage() {
  console.log([
    "asmc — AI-Suplex Mission Control · the headless operator loop (T007)",
    "",
    "  node Tools/asmc.js open    [--vault PATH] [--max DAYS] [--strict] [--json]",
    "  node Tools/asmc.js close   [--vault PATH] [--dry-run] [--end]",
    "  node Tools/asmc.js status  [--vault PATH] [--json]",
    "",
    "  open    the four threads AS INSTANCES + the open tasklists + the staleness guard",
    "          (deterministic: no LLM, no session, no writes)",
    "  close   3lm learn -> index (and 3lm end only when a Session End report from today exists)",
    "  status  the same state, one screen (or --json for a delivery surface)",
    "",
    "  --max DAYS   the staleness threshold (default 7)",
    "  --strict     exit 1 when anything is stale (the cron gate)",
    "  --vault PATH run against another AI-Suplex vault (default: this vault)",
    "",
    "  Invariants: reads instances, never opens/archives one · never writes the",
    "  Active Mission Context · never runs 3lm sync (the commit is the closure).",
  ].join("\n"));
}

const cmd = process.argv[2];
if (!cmd) { usage(); process.exit(0); }
else if (cmd === "open") cmdOpen();
else if (cmd === "close") cmdClose();
else if (cmd === "status") cmdStatus();
else { usage(); process.exit(1); }
