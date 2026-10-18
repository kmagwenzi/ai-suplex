#!/usr/bin/env node
"use strict";

/**
 * approvals.js — the AI-Suplex "Hustler decides" GATE (T010, split from 3lm).
 *
 * 3lm owns the MEMORY layer; approvals owns the human-in-the-loop gate. This CLI is
 * read-only: it scans canonical vault state (gauntlet in-battle artifacts, the lessons
 * pool, the B-Bombs/ count) and surfaces one inbox — it never writes, never decides.
 *
 * Usage:
 *   node Tools/approvals.js            # the human inbox
 *   node Tools/approvals.js --json     # machine inbox (for a delivery surface / cockpit)
 *   node Tools/approvals.js --vault PATH   # run against another AI-Suplex vault
 */

const fs = require("fs");
const path = require("path");

function flag(name) { return process.argv.includes("--" + name); }
function opt(name, fallback) {
  const i = process.argv.indexOf("--" + name);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : fallback;
}

const VAULT = path.resolve(opt("vault", path.join(__dirname, "..")));
const MEMORY_ROOT = path.join(VAULT, "Memory");

function log(label, msg) {
  console.log("\x1b[1;36m[approvals " + label + "]\x1b[0m " + msg);
}
function readFile(p) {
  try { return fs.readFileSync(p, "utf-8"); } catch { return null; }
}
function parseFrontmatter(content) {
  const m = (content || "").match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { data: {}, body: content || "" };
  const data = {};
  m[1].split("\n").forEach(function (line) {
    const kv = line.match(/^(\w+):\s*(.+)/);
    if (kv) data[kv[1]] = kv[2].trim();
  });
  return { data: data, body: content.slice(m[0].length).trim() };
}
function walkFiles(dir, pattern, out) {
  out = out || [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, pattern, out);
    else if (pattern.test(entry.name)) out.push(full);
  }
  return out;
}

function scoreLessonLines(items) {
  // Mirrors 3lm's promote rubric — keep in sync if promote changes.
  return items.map(function (lesson) {
    const text = lesson.replace(/^- \[[^\]]+\]\s*/, "").trim();
    let score = 40;
    const occurrences = items.filter(function (l) { return l.includes(text.substring(0, 30)); }).length;
    if (occurrences >= 3) score += 30;
    else if (occurrences >= 2) score += 15;
    if (/(should|promote|use|keep|move|create|run|write|build)/i.test(text)) score += 20;
    if (/(must not|should not|avoid|do not|never)/i.test(text)) score += 15;
    return { line: lesson, text: text, score: Math.min(score, 100), occurrences: occurrences };
  });
}

function gatherApprovals() {
  const artifactsRoot = path.join(VAULT, "Artifacts");
  const bbombsRoot = path.join(VAULT, "B-Bombs");
  const lessonsPath = path.join(MEMORY_ROOT, "lessons.md");

  const gates = walkFiles(artifactsRoot, /\.md$/)
    .filter(function (f) {
      const fm = parseFrontmatter(readFile(f));
      return fm.data.type === "gauntlet" && fm.data.status === "in-battle";
    })
    .map(function (f) {
      const fm = parseFrontmatter(readFile(f));
      return {
        mission: fm.data.mission || "untitled mission",
        path: path.relative(VAULT, f),
        status: "in-battle",
        action: "flip status: in-battle -> clear when the battle is won",
      };
    });

  const lessonsContent = readFile(lessonsPath);
  const section = lessonsContent
    ? (lessonsContent.match(/## Current Lessons\n([\s\S]*?)(?=\n## |$)/) || [])[1] || ""
    : "";
  const items = section.split("\n").filter(function (l) { return l.startsWith("- "); });
  const scored = scoreLessonLines(items).sort(function (a, b) { return b.score - a.score; });
  const ready = scored.filter(function (s) { return s.score >= 70; });
  const borderline = scored.filter(function (s) { return s.score >= 40 && s.score < 70; });

  return {
    generated: new Date().toISOString(),
    pending: gates.length > 0 || ready.length > 0,
    gates: gates,
    lessons: {
      pool: items.length,
      ready: ready.length,
      borderline: borderline.length,
      readyItems: ready.slice(0, 10).map(function (s) { return { score: s.score, text: s.text }; }),
    },
    bBombs: { count: walkFiles(bbombsRoot, /\.md$/).length },
  };
}

const inbox = gatherApprovals();

if (flag("json")) {
  console.log(JSON.stringify(inbox, null, 2));
  process.exit(0);
}

if (flag("help")) {
  console.log([
    "approvals — the AI-Suplex 'Hustler decides' gate",
    "",
    "  node Tools/approvals.js            # human inbox",
    "  node Tools/approvals.js --json     # machine inbox",
    "  node Tools/approvals.js --vault PATH",
    "",
    "Read-only: scans gauntlet in-battle artifacts + lessons.md + the B-Bombs/ count.",
    "The approval ACTION (flip a gate, 3lm promote, bbomb_hunter pick) stays human.",
  ].join("\n"));
  process.exit(0);
}

log("approvals", "Aggregating 'Hustler decides' items — the inbox...");

console.log("\n\x1b[1;36m1. 🔥 FINAL BOSS GATES\x1b[0m — gauntlet battles awaiting your clear");
if (inbox.gates.length) {
  inbox.gates.forEach(function (g) {
    console.log("  🔥 " + g.mission.substring(0, 72));
    console.log("     " + g.path + "  · action: " + g.action);
  });
} else {
  console.log("  ✓ none — no gauntlet battle awaiting a clear.");
}

console.log("\n\x1b[1;36m2. 📝 LESSON PROMOTIONS\x1b[0m — lessons awaiting Saturday judgment");
console.log("  Pool " + inbox.lessons.pool + " · ready " + inbox.lessons.ready + " (≥70) · borderline " + inbox.lessons.borderline + " (40–69)");
if (inbox.lessons.readyItems.length) {
  inbox.lessons.readyItems.slice(0, 5).forEach(function (s) {
    console.log("  ✅ [" + s.score + "] " + s.text.substring(0, 74));
  });
} else {
  console.log("  ✓ none at threshold — nothing auto-promotes yet.");
}
console.log("  Action: 3lm promote --min 70 (Saturday) promotes; review false positives first.");

console.log("\n\x1b[1;36m3. 💣 B-BOMB CANDIDATES\x1b[0m — the Saturday pick");
console.log("  Existing B-Bombs: " + inbox.bBombs.count);
console.log("  Action: python3 Tools/bbomb_hunter.py ranks hidden connections → pick 2–3 → promote.");

console.log("\n\x1b[1;36m4. 💡 UNJUDGED CAPTURES\x1b[0m — survey flags");
console.log("  Action: 3lm survey scans captures since session start → [NEW] / [~DUP] for you to judge.");

console.log(
  inbox.pending
    ? "\n🦸 Decisions pending above are yours, Hustler. Staff-in-the-loop: you always decide.\n"
    : "\n🦸 Inbox clear — nothing needs your call. TWABAM ⚡!\n",
);
