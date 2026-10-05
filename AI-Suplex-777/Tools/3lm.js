#!/usr/bin/env node

/**
 * 3lm — AI-Suplex 3 Layer Memory Tool
 *
 * Vault operations for the self-improving memory system.
 *
 * Usage: node 3lm <command> [--param value ...]
 *
 * Commands:
 *   start              Load context, generate mission brief
 *   end                Write episodic file, score outcome
 *   learn              Extract lessons from episode
 *   add-lessons        Quick-capture: push lessons from artifact/B-Bomb/insight
 *   survey             Scan session captures → surveyed insights for the LLM to judge
 *   sync [message]     Commit + push current branch to all git remotes
 *   promote --min N    Score lessons, promote above threshold
 *   clean              Consolidate + dedup lessons.md; keep 50 recent, archive the rest (run promote first)
 *   revise             Check contradictions, deprecate old rules
 *   index              Refresh memory/index.md
 *   status             Show memory/ folder stats
 *   approvals          Aggregated "Hustler decides" inbox (FINAL BOSS gates · lessons · B-Bombs)
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");

const MEMORY_ROOT = path.join(__dirname, "..", "Memory");
const SESSIONS_ROOT = path.join(__dirname, "..", "Sessions");
const TASKLISTS_ROOT = path.join(__dirname, "..", "Tasklists");

// The path contract — every cycle-scoped path resolves through Tools/paths.js.
// `P.resolve()` returns whichever layout exists on disk, so this tool is correct
// on BOTH sides of the Period migration (Phase 3 before Phase 4).
const P = require("./paths");

// ── UTILS ──────────────────────────────────────────────

function log(label, msg) {
  console.log(`\x1b[1;36m[3lm ${label}]\x1b[0m ${msg}`);
}

function error(msg) {
  console.error(`\x1b[1;31m[3lm error]\x1b[0m ${msg}`);
  process.exit(1);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { data: {}, body: content };
  const data = {};
  match[1].split("\n").forEach((line) => {
    const kv = line.match(/^(\w+):\s*(.+)/);
    if (kv) data[kv[1]] = kv[2].trim();
  });
  return { data, body: content.slice(match[0].length).trim() };
}

function getNow() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    datetime: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`,
    timestamp: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`,
  };
}

function listFiles(dir, pattern = /.*/) {
  if (!fs.existsSync(dir)) return [];
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => pattern.test(f))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(dir, a));
        const statB = fs.statSync(path.join(dir, b));
        return statB.mtime - statA.mtime;
      });
  } catch {
    return [];
  }
}

function findLatestEpisodicWeek() {
  const episodicRoot = path.join(MEMORY_ROOT, "episodic");
  if (!fs.existsSync(episodicRoot)) return null;
  const vaultRoot = P.vaultRoot();

  let latest = null;
  let latestMtime = 0;

  // Walk the whole episodic tree and derive cycle/week from the PATH — the contract's
  // job, not a directory-name convention. Layout-agnostic: works for both the legacy
  // `Cycle-N/Week-N` shape and the period `<Period>/Cycle-N/Week-N` shape.
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".md")) continue;

      const rel = path.relative(vaultRoot, full).split(path.sep).join("/");
      const cw = P.parseCyclePath(rel);
      if (!cw || !cw.cycle || !cw.week) continue;

      let mtime = 0;
      try {
        mtime = fs.statSync(full).mtimeMs;
      } catch {
        continue;
      }
      if (mtime > latestMtime) {
        latestMtime = mtime;
        latest = { cycle: parseInt(cw.cycle, 10), week: parseInt(cw.week, 10) };
      }
    }
  };

  walk(episodicRoot);
  return latest;
}

function readEpisodicFiles(cycle, week) {
  const dir = P.abs(P.resolve(P.episodicDir(cycle, week)));
  return listFiles(dir)
    .map((f) => {
      const filePath = path.join(dir, f);
      const content = readFile(filePath);
      if (!content) return null;
      const { data, body } = parseFrontmatter(content);
      return { file: f, path: filePath, data, body };
    })
    .filter(Boolean);
}

// ── KITTY FACE ─────────────────────────────────────────

const KITTY = `
  ╔══════════════════════════════╗
  ║    🦸 3lm — 3 Layer Memory   ║
  ║    vault operations tool     ║
  ╚══════════════════════════════╝`;

// ── STALENESS GUARD ───────────────────────────────────
// Warns when key context files drift past their freshness threshold,
// so "each session starts smarter" doesn't silently serve stale facts.

const VAULT_ROOT = path.join(__dirname, "..");
const CONTEXT_KICKSTART_ACTIVE = path.join(
  VAULT_ROOT,
  "AI-Suplex Kick-start",
  "Context Kick-start",
  "Active",
);

// Files that must stay fresh. maxDays defaults to the --stale-days flag (or 7).
// `contentDate` (when present) overrides file mtime — used for docs whose
// freshness lives in a section, not the file's last edit.
const STALENESS_WATCH = [
  { label: "AGENTS.md (Active Mission Context)", file: "AGENTS.md", contentDate: agentsMissionDate, fix: "update Active Mission Context (rotate from Context Kick-start Active)" },
  { label: "vault-context.md (vault awareness)", file: "Memory/vault-context.md", fix: "node Tools/vault-index.js --current" },
  { label: "Knowledge graph DB (full — knowledge-graph.db)", file: "Memory/knowledge-graph.db", fix: "node Tools/knowledge-graph.js --build" },
  { label: "Knowledge graph DB (current — knowledge-graph-current.db)", file: "Memory/knowledge-graph-current.db", fix: "node Tools/knowledge-graph.js --build-current" },
  { label: "Memory index (index.md)", file: "Memory/index.md", fix: "node Tools/3lm.js index" },
  { label: "Lessons (lessons.md)", file: "Memory/lessons.md", maxDays: 14, fix: "node Tools/3lm.js promote --min 70" },
];

function parseDateFromString(str) {
  const m = str.match(/([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/);
  if (!m) return null;
  const d = new Date(`${m[1]} ${m[2]}, ${m[3]}`);
  return isNaN(d.getTime()) ? null : d;
}

function agentsMissionDate(filePath) {
  const content = readFile(filePath);
  if (!content) return null;
  const dm = content.match(/\*\*Date:\*\*\s*(.+)/);
  return dm ? parseDateFromString(dm[1]) : null;
}

function ageInDaysFrom(ts) {
  if (!ts) return null;
  return (Date.now() - ts) / 86400000;
}

function ageInDays(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  return ageInDaysFrom(fs.statSync(filePath).mtimeMs);
}

function humanAge(days) {
  if (days < 1) return `${Math.round(days * 24)}h`;
  return `${Math.round(days)}d`;
}

function latestContextKickstartFile() {
  const files = listFiles(CONTEXT_KICKSTART_ACTIVE, /\.md$/);
  return files.length ? path.join(CONTEXT_KICKSTART_ACTIVE, files[0]) : null;
}

function checkStaleness(defaultMaxDays) {
  const results = [];
  for (const item of STALENESS_WATCH) {
    const fp = path.join(VAULT_ROOT, item.file);
    const max = item.maxDays || defaultMaxDays;
    // Prefer content-derived date (e.g. AGENTS.md mission date) over file mtime.
    let days = item.contentDate
      ? ageInDaysFrom(item.contentDate(fp)?.getTime())
      : null;
    if (days === null) days = ageInDays(fp);
    if (days !== null && days > max) {
      results.push({ label: item.label, file: fp, days, fix: item.fix || "" });
    }
  }
  const kc = latestContextKickstartFile();
  const kcDays = ageInDays(kc);
  if (kcDays !== null && kcDays > defaultMaxDays) {
    results.push({ label: "Context Kick-start Active (latest)", file: kc, days: kcDays, fix: "write a new Active context file (session end)" });
  }
  return results;
}

// ── START ──────────────────────────────────────────────

function cmdStart() {
  console.log(KITTY);
  log("start", "Loading memory context...\n");

  // Staleness guard — warn if key context files have drifted.
  const stale = checkStaleness(staleDays);
  if (stale.length > 0) {
    console.log("⚠️  STALENESS GUARD — stale context detected:");
    stale.forEach((s) => {
      console.log(`     ${s.label} → ${humanAge(s.days)} old`);
      console.log(`        ${s.file}`);
      if (s.fix) console.log(`        → ${s.fix}`);
    });
    console.log("");
  } else {
    console.log("✅ Context fresh.\n");
  }

  // Graph RAG: generated session context (Impl 2) — optional --context flag.
  if (genContext) {
    const genScript = path.join(__dirname, "session_context.py");
    if (fs.existsSync(genScript)) {
      log("start", "Generating session context (Impl 2)...");
      try {
        const out = execSync(`python3 "${genScript}"`, {
          timeout: 420000, // LLM generation measured 87s–3.5min (DeepSeek latency variance); keep generous margin
          encoding: "utf-8",
        });
        console.log("\n── GENERATED SESSION CONTEXT ──");
        console.log(out.trim() + "\n");
      } catch (e) {
        console.log("  ⚠️  session_context.py failed: " + (e.message || e) + "\n");
      }
    } else {
      console.log("ℹ️  --context requested but Tools/session_context.py not found (pending Oh-My-Pi build).\n");
    }
  }

  // 0.5 — Skill & tool router (recommend-only, Phase 0). Injects a ranked hint; runs nothing.
  const routerJs = path.join(__dirname, "router.js");
  const skillIndex = path.join(__dirname, "..", "Skills", "index.json");
  if (genContext && fs.existsSync(routerJs) && fs.existsSync(skillIndex)) {
    try {
      const vcPath = path.join(MEMORY_ROOT, "vault-context.md");
      let task = "";
      if (fs.existsSync(vcPath)) {
        const lines = fs.readFileSync(vcPath, "utf8").split(String.fromCharCode(10));
        let capturing = false;
        const parts = [];
        for (const line of lines) {
          if (line.indexOf("## 🎯 Active Mission") === 0) { capturing = true; continue; }
          if (capturing && line.indexOf("## ") === 0) break;
          if (capturing && line.trim()) parts.push(line.trim());
        }
        task = parts.join(" ").slice(0, 300);
      }
      if (task) {
        const out = spawnSync(process.execPath, [routerJs, "--task", task, "--json", "--dry"], {
          cwd: path.join(__dirname, ".."), encoding: "utf8", timeout: 15000,
        });
        const rec = JSON.parse(out.stdout);
        if ((rec.skills && rec.skills.length) || (rec.tools && rec.tools.length)) {
          console.log("");
          console.log("── 🧭 RECOMMENDED SKILLS & TOOLS ──");
          (rec.skills || []).slice(0, 3).forEach((s, i) => console.log("  " + (i + 1) + ". " + s.name + " (" + Number(s.score).toFixed(2) + ")"));
          (rec.tools || []).slice(0, 3).forEach((t) => console.log("  · " + t.id + " → " + t.invocation));
          console.log("  (recommend-only — nothing loaded or run)");
          console.log("");
        }
      }
    } catch (e) {
      // router is advisory; a failure must never break 3lm start
    }
  }

  // 1. Load semantic memory
  const semanticDir = path.join(MEMORY_ROOT, "semantic");
  const semanticFiles = listFiles(semanticDir);

  console.log("── SEMANTIC MEMORY ──");
  semanticFiles.forEach((f) => {
    const content = readFile(path.join(semanticDir, f));
    if (content) {
      console.log(`  📄 ${f}`);
      const { body } = parseFrontmatter(content);
      // Show first 5 non-empty, non-heading lines
      const lines = body
        .split("\n")
        .filter(
          (l) =>
            l.trim() &&
            !l.startsWith("#") &&
            !l.startsWith("- ") &&
            l.trim().length > 20,
        )
        .slice(0, 3);
      lines.forEach((l) => console.log(`     ${l.trim()}`));
    }
  });

  // 2. Load lessons
  const lessonsPath = path.join(MEMORY_ROOT, "lessons.md");
  const lessonsContent = readFile(lessonsPath);
  console.log("\n── LESSONS ──");
  if (lessonsContent) {
    console.log("  📄 lessons.md");
    // Show lessons under "## Current Lessons"
    const lessonsSection =
      (lessonsContent.match(/## Current Lessons\n([\s\S]*?)(?=\n## |$)/) ||
        [])[1] || "";
    const lessonItems = lessonsSection
      .split("\n")
      .filter((l) => l.startsWith("- "));
    if (lessonItems.length > 0) {
      console.log(`     ${lessonItems.length} current lessons`);
      lessonItems.slice(0, 3).forEach((l) => console.log(`     ${l}`));
    }
  }

  // 3. Load last 3 relevant episodic files
  const now = getNow();
  // Detect latest cycle/week with episode files
  const latestWeek = findLatestEpisodicWeek();
  const epCycle = latestWeek ? latestWeek.cycle : 0;
  const epWeek = latestWeek ? latestWeek.week : 1;
  const episodicFiles = readEpisodicFiles(epCycle, epWeek);
  const recentEpisodes = episodicFiles.slice(0, 3);

  console.log("\n── RECENT EPISODES ──");
  if (recentEpisodes.length > 0) {
    recentEpisodes.forEach((ep) => {
      console.log(`  📄 ${ep.file}  (score: ${ep.data.score || "N/A"})`);
    });
  } else {
    console.log("  (no episodes found — start a session to create one)");
  }

  // 4. Load procedural memory
  const proceduralDir = path.join(MEMORY_ROOT, "procedural");
  const proceduralFiles = listFiles(proceduralDir);

  console.log("\n── PROCEDURAL FILES ──");
  proceduralFiles.forEach((f) => {
    console.log(`  🔧 ${f}`);
    const content = readFile(path.join(proceduralDir, f));
    if (content) {
      const purpose = content.match(/## Purpose\n(.+)/);
      if (purpose) console.log(`     ${purpose[1]}`);
    }
  });

  // 5. Check for active Tasklist
  const activeTasklistsDir = path.join(TASKLISTS_ROOT, "Active");
  const activeTasklists = listFiles(activeTasklistsDir);

  console.log("\n── ACTIVE TASKLISTS ──");
  if (activeTasklists.length > 0) {
    activeTasklists.forEach((f) => {
      console.log(`  📋 ${f}`);
    });
  } else {
    console.log("  (no active tasklists — create one to begin)");
  }

  log("start", "Context loaded.\n");
  log("start", "Ready for mission. TWABAM ⚡!");
}

// ── END ────────────────────────────────────────────────

function cmdEnd() {
  console.log(KITTY);
  log("end", "Closing session...");

  const now = getNow();

  // Prompt for session details (simplified — in real use, read from session end file)
  const sessionEndDir = path.join(SESSIONS_ROOT, "Active", "End");
  const sessionEndFiles = listFiles(sessionEndDir).filter((f) =>
    f.endsWith(".md"),
  );

  if (sessionEndFiles.length === 0) {
    error(
      "No Session End report found in Sessions/Active/End/. Write the report first.",
    );
  }

  // Use the most recent session end file
  const latestReport = sessionEndFiles[0];
  const reportPath = path.join(sessionEndDir, latestReport);
  const reportContent = readFile(reportPath);

  if (!reportContent) {
    error(`Could not read ${reportPath}`);
  }

  const { data: report } = parseFrontmatter(reportContent);

  const cycle = report.cycle || "1";
  const week = report.week || "4";
  const focus = report.focus || "digital-products";
  const sessionId = report.session_id || `session-${now.date}`;
  const tasklistId = report.tasklist_id || "unknown";
  const score = report.session_rating
    ? `${report.session_rating}/5`
    : report.score || "N/A";

  // Extract insights from the report for the Lessons section
  const rawInsights = report.key_insights || "";
  const rawActions = report.next_actions || "";

  // Helper: parse a block of text into clean lesson items
  function parseLessons(text) {
    // Strip surrounding quotes
    let cleaned = text.replace(/^["']|["']$/g, "");
    // Split on semicolons or sentence-ending periods (period + space + capital letter)
    return cleaned
      .split(/[;\n]|\.\s+(?=[A-Z])/)
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter((s) => s.length > 8);
  }

  const insightList = parseLessons(rawInsights);
  const actionList = parseLessons(rawActions);

  // Build lessons from insights and actions
  const allLessons = [...insightList, ...actionList];
  const lessonItems =
    allLessons.length > 0
      ? allLessons.map((l, i) => `${i + 1}. ${l}`).join("\n")
      : "<!-- No lessons auto-extracted — run 3lm add-lessons or edit manually. -->";

  // Compose episodic file
  const episodeContent = `---
type: episode
session_id: ${sessionId}
tasklist_id: ${tasklistId}
cycle: ${cycle}
week: ${week}
focus: ${focus}
status: archived
score: ${score}
source_files:
  - Sessions/Active/End/${latestReport}
---

# Episode Summary
${report.session_narrative || "(Edit this summary — what happened during the session?)"}

## Objective
${report.objective || "(What was the goal?)"}

## What Happened
${report.completion_status || "completed"}

## Outputs
- Artifacts: ${report.artifacts_produced || "0"}
- Rating: ${report.session_rating || score}

## Lessons
${lessonItems}

## Promotion Candidates
- Semantic:
- Procedural:
`;

  const episodeDir = P.abs(P.resolve(P.episodicDir(cycle, week)));
  if (!fs.existsSync(episodeDir)) fs.mkdirSync(episodeDir, { recursive: true });

  const episodeFileName = `${now.datetime}-${sessionId}-episode.md`;
  const episodePath = path.join(episodeDir, episodeFileName);

  writeFile(episodePath, episodeContent);

  log(
    "end",
    `Episode written: ${P.resolve(P.episodicDir(cycle, week))}/${episodeFileName}`,
  );
  log("end", `Score: ${score}`);
  log(
    "end",
    "Session complete. Run `3lm learn` to extract lessons. TWABAM ⚡!",
  );
}

// ── LEARN ──────────────────────────────────────────────

function cmdLearn() {
  console.log(KITTY);
  log("learn", "Extracting lessons from latest episode...");

  // Find the most recent episode
  let latestEp = null;
  let latestDate = "";

  const episodicBase = path.join(MEMORY_ROOT, "episodic");
  if (!fs.existsSync(episodicBase)) {
    error("No episodic memory found. Run `3lm end` first.");
  }

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(full);
      } else if (entry.name.endsWith(".md")) {
        const stat = fs.statSync(full);
        if (!latestEp || stat.mtime > new Date(latestDate)) {
          latestEp = full;
          latestDate = stat.mtime.toISOString();
        }
      }
    });
  }

  scanDir(episodicBase);

  if (!latestEp) {
    error("No episodes found. Run `3lm end` first.");
  }

  const content = readFile(latestEp);
  if (!content) error(`Could not read ${latestEp}`);

  const { data, body } = parseFrontmatter(content);

  // Extract lessons section (filter placeholders and empties)
  const placeholder = /^\(?edit this lesson[^)]*\)?/i;
  const lessonsSection =
    (body.match(/##\s*Lessons\s*\n([\s\S]*?)(?=\n##\s|\s*$)/) || [])[1] || "";
  const lessons = lessonsSection
    .split("\n")
    .filter((l) => l.match(/^\d+\.\s+.+/))
    .map((l) => l.replace(/^\d+\.\s+/, "").trim())
    .filter((l) => l.length > 0)
    .filter((l) => !placeholder.test(l))
    .filter((l) => !/^\(?(what did you learn|add a lesson|lesson here)\)?/i.test(l));

  if (lessons.length === 0) {
    log("learn", "No lessons found in the episode.");
    log("learn", "Edit the episode file and add lessons under ## Lessons.");
    return;
  }

  // Read existing lessons
  const lessonsPath = path.join(MEMORY_ROOT, "lessons.md");
  let existingLessons = readFile(lessonsPath) || "";

  // Append to "Current Lessons" section
  const newLessons = lessons
    .map((l) => `- [Episode: ${data.session_id || "unknown"}] ${l}`)
    .join("\n");

  if (existingLessons.includes("## Current Lessons")) {
    existingLessons = existingLessons.replace(
      "## Current Lessons\n",
      `## Current Lessons\n\n${newLessons}\n\n`,
    );
  } else {
    existingLessons += `\n## Current Lessons\n\n${newLessons}\n`;
  }

  writeFile(lessonsPath, existingLessons);

  log("learn", `Extracted ${lessons.length} lessons from episode.`);
  log("learn", `Appended to memory/lessons.md`);
  log("learn", "Run `3lm promote --min 70` to score and promote. TWABAM ⚡!");
}

// ── ADD-LESSONS ────────────────────────────────────────
// Quick-capture push path. Unlike `learn` (which PULLS lessons from an episode
// file), the AI already knows the lessons during an artifact/B-Bomb/insight
// capture. This lets it push them straight into lessons.md with clean
// attribution, no hand-editing and no episode round-trip.

function cmdAddLessons() {
  console.log(KITTY);
  log("add-lessons", "Appending quick-capture lessons...");

  const args = process.argv.slice(3);
  let source = "capture";
  let ref = "";
  const lessons = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--source" && args[i + 1]) {
      source = args[i + 1];
      i++;
    } else if (a === "--ref" && args[i + 1]) {
      ref = args[i + 1];
      i++;
    } else if (a === "--list") {
      for (let j = i + 1; j < args.length; j++) {
        if (args[j].startsWith("--")) break;
        lessons.push(args[j]);
      }
      i = args.length;
    }
  }

  if (lessons.length === 0) {
    error(
      'No lessons provided. Usage: 3lm add-lessons --source artifact --ref 2026-08-23-x --list "lesson one" "lesson two"',
    );
  }

  const tagMap = {
    artifact: "Artifact",
    "b-bomb": "B-Bomb",
    bbomb: "B-Bomb",
    insight: "Insight",
    episode: "Episode",
    session: "Session",
  };
  const tag =
    tagMap[source.toLowerCase()] ||
    source.charAt(0).toUpperCase() + source.slice(1);

  // Placeholder + empty filter — reject the default "(Edit this lesson...)" noise.
  const placeholder = /^\(?edit this lesson[^)]*\)?/i;
  const cleaned = lessons
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l) => !placeholder.test(l))
    .filter((l) => !/^\(?(what did you learn|add a lesson|lesson here)\)?/i.test(l));

  if (cleaned.length === 0) {
    error("All provided lessons were placeholders or empty — nothing to add.");
  }

  // Dedup against every existing lesson line (tagged or bare).
  const lessonsPath = path.join(MEMORY_ROOT, "lessons.md");
  const existing = readFile(lessonsPath) || "";
  const existingTexts = new Set(
    (existing.match(/^\s*- (\[[^\]]+\]\s*)?(.+)$/gm) || []).map((l) =>
      l
        .replace(/^\s*- (\[[^\]]+\]\s*)?/, "")
        .trim()
        .toLowerCase(),
    ),
  );

  const fresh = cleaned.filter((l) => !existingTexts.has(l.toLowerCase()));
  const dupCount = cleaned.length - fresh.length;

  if (fresh.length === 0) {
    log("add-lessons", "All lessons already captured (dedup). Nothing added.");
    return;
  }

  const refSuffix = ref ? `: ${ref}` : "";
  const newLines = fresh.map((l) => `- [${tag}${refSuffix}] ${l}`);

  // Append at the END of "## Current Lessons" (before Deprecation Watch /
  // Promotion Candidates) so file order stays chronological (most recent last).
  const marker = "## Current Lessons";
  const lastIdx = existing.lastIndexOf(marker);
  let updated;
  if (lastIdx !== -1) {
    const afterMarker = existing.slice(lastIdx + marker.length);
    const nextSection = afterMarker.match(
      /\n## (Deprecation Watch|Promotion Candidates)\b/,
    );
    const insertAt = nextSection
      ? lastIdx + marker.length + nextSection.index
      : existing.length;
    updated =
      existing.slice(0, insertAt) +
      "\n" +
      newLines.join("\n") +
      "\n" +
      existing.slice(insertAt);
  } else {
    updated =
      existing.trimEnd() + `\n\n${marker}\n\n` + newLines.join("\n") + "\n";
  }

  writeFile(lessonsPath, updated);

  log(
    "add-lessons",
    `Added ${fresh.length} lesson(s)${dupCount ? `, skipped ${dupCount} duplicate(s)` : ""}.`,
  );
  log("add-lessons", `Tagged: [${tag}${refSuffix}]`);
  log("add-lessons", "Run `3lm promote --min 70` on Saturday. TWABAM ⚡!");
}

// ── PROMOTE ────────────────────────────────────────────

function cmdPromote(minScore) {
  console.log(KITTY);
  const threshold = minScore || 70;
  log("promote", `Scoring + promoting lessons (threshold: ${threshold})...`);

  const lessonsPath = path.join(MEMORY_ROOT, "lessons.md");
  const content = readFile(lessonsPath);

  if (!content) {
    error("No lessons found. Run `3lm learn` first.");
  }

  const lessonsSection =
    (content.match(/## Current Lessons\n([\s\S]*?)(?=\n## |$)/) || [])[1] || "";
  const lessonItems = lessonsSection
    .split("\n")
    .filter((l) => l.startsWith("- "));

  if (lessonItems.length === 0) {
    log("promote", "No lessons to score.");
    return;
  }

  // Scoring: repetition + actionable language + contradiction markers
  const scored = lessonItems.map((lesson) => {
    const text = lesson.replace(/^- \[[^\]]+\]\s*/, "").trim();
    let score = 40;

    const occurrences = lessonItems.filter((l) =>
      l.includes(text.substring(0, 30)),
    ).length;
    if (occurrences >= 3) score += 30;
    else if (occurrences >= 2) score += 15;

    if (/(should|promote|use|keep|move|create|run|write|build)/i.test(text))
      score += 20;

    if (/(must not|should not|avoid|do not|never)/i.test(text)) score += 15;

    return { line: lesson, text, score: Math.min(score, 100), occurrences };
  });

  // Classify: procedural if workflow/action language, else semantic
  function classify(text) {
    const procedural = /(step|process|pattern|workflow|pipeline|build order|how to|run |execute|deploy|configure|setup|create |generate|macro|script)/i;
    return procedural.test(text) ? "procedural" : "semantic";
  }

  const promoted = scored.filter((s) => s.score >= threshold);
  const candidates = scored.filter((s) => s.score >= 40 && s.score < threshold);
  const rejected = scored.filter((s) => s.score < 40);

  scored.forEach((s) => {
    const icon = s.score >= threshold ? "✅" : s.score >= 40 ? "📝" : "🗑️";
    console.log(`  ${icon} Score ${s.score} - ${s.text.substring(0, 60)}...`);
  });

  // ── ACTUALLY PROMOTE ──────────────────────────────
  let semanticCount = 0;
  let proceduralCount = 0;

  if (promoted.length > 0) {
    const now = new Date().toISOString().split("T")[0];
    const promotedLines = new Set(promoted.map((s) => s.line));
    const headerMatch = content.match(/^[\s\S]*?(?=\n## Current Lessons)/);
    const header = headerMatch ? headerMatch[0].trim() : "";

    for (const s of promoted) {
      const layer = classify(s.text);
      const targetFile =
        layer === "procedural"
          ? path.join(MEMORY_ROOT, "procedural", "promoted-lessons.md")
          : path.join(MEMORY_ROOT, "semantic", "promoted-lessons.md");
      const targetDir = path.dirname(targetFile);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      let existing = readFile(targetFile) || "";
      if (!existing.trim()) {
        const title =
          layer === "procedural"
            ? "# 🛠️ Promoted Procedural Lessons\n\n> Auto-promoted from lessons.md. Review during Weekly Reset.\n\n"
            : "# 🧠 Promoted Semantic Lessons\n\n> Auto-promoted from lessons.md. Review during Weekly Reset.\n\n";
        existing = title;
      }

      const entry = `- [Promoted ${now}] ${s.text}\n`;
      writeFile(targetFile, existing + entry);

      if (layer === "procedural") proceduralCount++;
      else semanticCount++;
    }

    // Rewrite lessons.md without promoted lines
    const remaining = lessonItems.filter((l) => !promotedLines.has(l));
    const newContent = `${header}\n\n## Current Lessons\n${remaining.join("\n")}\n\n## Promotion Candidates\n`;
    writeFile(lessonsPath, newContent);

    log("promote", `Moved: ${semanticCount} → semantic, ${proceduralCount} → procedural`);
  }

  log("promote", `${promoted.length} promoted (≥${threshold}).`);
  log("promote", `${candidates.length} kept as candidates (40-${threshold - 1}).`);
  log("promote", `${rejected.length} below threshold (<40).`);
  log("promote", "TWABAM ⚡!");
}

// ── APPROVALS (Hustler-decides inbox) ──────────────────

function walkFiles(dir, pattern, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, pattern, out);
    else if (pattern.test(entry.name)) out.push(full);
  }
  return out;
}

function scoreLessonLines(items) {
  // Mirrors cmdPromote's rubric — keep in sync if promote changes.
  return items.map((lesson) => {
    const text = lesson.replace(/^- \[[^\]]+\]\s*/, "").trim();
    let score = 40;
    const occurrences = items.filter((l) =>
      l.includes(text.substring(0, 30)),
    ).length;
    if (occurrences >= 3) score += 30;
    else if (occurrences >= 2) score += 15;
    if (/(should|promote|use|keep|move|create|run|write|build)/i.test(text))
      score += 20;
    if (/(must not|should not|avoid|do not|never)/i.test(text)) score += 15;
    return { line: lesson, text, score: Math.min(score, 100), occurrences };
  });
}

function gatherApprovals() {
  const vaultRoot = path.join(__dirname, "..");
  const artifactsRoot = path.join(vaultRoot, "Artifacts");
  const bbombsRoot = path.join(vaultRoot, "B-Bombs");
  const lessonsPath = path.join(MEMORY_ROOT, "lessons.md");

  const gates = walkFiles(artifactsRoot, /\.md$/)
    .filter((f) => {
      const fm = parseFrontmatter(readFile(f) || "");
      return fm.data.type === "gauntlet" && fm.data.status === "in-battle";
    })
    .map((f) => {
      const fm = parseFrontmatter(readFile(f) || "");
      return {
        mission: fm.data.mission || "untitled mission",
        path: path.relative(vaultRoot, f),
        status: "in-battle",
        action: "flip `status: in-battle` → `clear` when the battle is won",
      };
    });

  const lessonsContent = readFile(lessonsPath);
  const section = lessonsContent
    ? (lessonsContent.match(/## Current Lessons\n([\s\S]*?)(?=\n## |$)/) || [])[1] || ""
    : "";
  const items = section.split("\n").filter((l) => l.startsWith("- "));
  const scored = scoreLessonLines(items).sort((a, b) => b.score - a.score);
  const ready = scored.filter((s) => s.score >= 70);
  const borderline = scored.filter((s) => s.score >= 40 && s.score < 70);

  return {
    generated: new Date().toISOString(),
    pending: gates.length > 0 || ready.length > 0,
    gates,
    lessons: {
      pool: items.length,
      ready: ready.length,
      borderline: borderline.length,
      readyItems: ready.slice(0, 10).map((s) => ({ score: s.score, text: s.text })),
    },
    bBombs: { count: walkFiles(bbombsRoot, /\.md$/).length },
  };
}

function cmdApprovals() {
  const inbox = gatherApprovals();

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(inbox, null, 2));
    return;
  }

  console.log(KITTY);
  log("approvals", "Aggregating 'Hustler decides' items — the inbox...");

  // 1. 🔥 FINAL BOSS gates — gauntlet artifacts still in-battle
  console.log("\n\x1b[1;36m1. 🔥 FINAL BOSS GATES\x1b[0m — gauntlet battles awaiting your clear");
  if (inbox.gates.length) {
    inbox.gates.forEach((g) => {
      console.log(`  🔥 ${g.mission.substring(0, 72)}`);
      console.log(`     ${g.path}  · action: ${g.action}`);
    });
  } else {
    console.log("  ✓ none — no gauntlet battle awaiting a clear.");
  }

  // 2. 📝 Lesson promotion candidates
  console.log("\n\x1b[1;36m2. 📝 LESSON PROMOTIONS\x1b[0m — lessons awaiting Saturday judgment");
  console.log(
    `  Pool ${inbox.lessons.pool} · ready ${inbox.lessons.ready} (≥70) · borderline ${inbox.lessons.borderline} (40–69)`,
  );
  if (inbox.lessons.readyItems.length) {
    inbox.lessons.readyItems.slice(0, 5).forEach((s) => {
      console.log(`  ✅ [${s.score}] ${s.text.substring(0, 74)}`);
    });
  } else {
    console.log("  ✓ none at threshold — nothing auto-promotes yet.");
  }
  console.log(
    "  Action: `3lm promote --min 70` (Saturday) promotes; review false positives first.",
  );

  // 3. 💣 B-Bomb candidates
  console.log("\n\x1b[1;36m3. 💣 B-BOMB CANDIDATES\x1b[0m — the Saturday pick");
  console.log(`  Existing B-Bombs: ${inbox.bBombs.count}`);
  console.log(
    "  Action: `python3 Tools/bbomb_hunter.py` ranks hidden connections → pick 2–3 → promote.",
  );

  // 4. 💡 Unjudged captures
  console.log("\n\x1b[1;36m4. 💡 UNJUDGED CAPTURES\x1b[0m — survey flags");
  console.log(
    "  Action: `3lm survey` scans captures since session start → [NEW] / [~DUP] for you to judge.",
  );

  console.log(
    inbox.pending
      ? "\n🦸 Decisions pending above are yours, Hustler. Staff-in-the-loop: you always decide.\n"
      : "\n🦸 Inbox clear — nothing needs your call. TWABAM ⚡!\n",
  );
}

// ── REVISE ─────────────────────────────────────────────

function cmdRevise() {
  console.log(KITTY);
  log("revise", "Checking for contradictions...");

  const contradictionRulesPath = path.join(
    MEMORY_ROOT,
    "contradiction-rules.md",
  );
  const semanticDir = path.join(MEMORY_ROOT, "semantic");
  const lessonsPath = path.join(MEMORY_ROOT, "lessons.md");

  const contradictionRules = readFile(contradictionRulesPath);
  if (!contradictionRules) {
    log("revise", "No contradiction rules file found.");
    return;
  }

  const lessons = readFile(lessonsPath);
  if (!lessons) {
    log("revise", "No lessons to check against.");
    return;
  }

  // Load semantic truths
  log("revise", "Loading semantic truths...");
  const semanticFiles = listFiles(semanticDir);
  let conflictCount = 0;

  semanticFiles.forEach((f) => {
    const content = readFile(path.join(semanticDir, f));
    if (!content) return;

    // Simple contradiction check: look for negations in lessons vs assertions in semantic
    const lessonItems = (lessons.match(/- \[[^\]]+\]\s*(.+)/g) || []).map((l) =>
      l.replace(/- \[[^\]]+\]\s*/, "").trim(),
    );

    lessonItems.forEach((lesson) => {
      if (
        lesson.toLowerCase().includes("should not") ||
        lesson.toLowerCase().includes("avoid")
      ) {
        const positiveVersion = lesson
          .replace(/should not/i, "should")
          .replace(/avoid/i, "prefer");
        if (content.includes(positiveVersion.substring(0, 30))) {
          log(
            "revise",
            `⚠️  Potential conflict in ${f}: lesson contradicts semantic rule`,
          );
          log("revise", `   Lesson: ${lesson.substring(0, 80)}`);
          conflictCount++;
        }
      }
    });
  });

  if (conflictCount === 0) {
    log("revise", "No contradictions detected.");
  } else {
    log(
      "revise",
      `${conflictCount} potential contradictions found. Review manually.`,
    );
  }

  // Check Deprecation Watch
  log("revise", "Checking deprecation watch...");
  const deprecationSection =
    (lessons.match(/## Deprecation Watch\n([\s\S]*?)(?=\n#|$)/) || [])[1] || "";
  const deprecationItems = deprecationSection
    .split("\n")
    .filter((l) => l.startsWith("- "));

  if (deprecationItems.length > 0) {
    log("revise", `${deprecationItems.length} items on deprecation watch:`);
    deprecationItems.forEach((d) => console.log(`  🚩 ${d.substring(2)}`));
  }

  log("revise", "Revision check complete. TWABAM ⚡!");
}

// ── INDEX ──────────────────────────────────────────────

function cmdIndex() {
  console.log(KITTY);
  log("index", "Refreshing memory/index.md...");

  const indexPath = path.join(MEMORY_ROOT, "index.md");

  // Scan all memory files
  const governanceFiles = listFiles(MEMORY_ROOT, /\.md$/).filter((f) =>
    [
      "index",
      "memory-lifecycle",
      "promotion-rules",
      "contradiction-rules",
      "review-cadence",
    ].some((n) => f.includes(n)),
  );

  const semanticFiles = listFiles(path.join(MEMORY_ROOT, "semantic"), /\.md$/);
  const proceduralFiles = listFiles(
    path.join(MEMORY_ROOT, "procedural"),
    /\.md$/,
  );

  // Find latest episode
  let latestEpisode = "";
  const episodicBase = path.join(MEMORY_ROOT, "episodic");
  if (fs.existsSync(episodicBase)) {
    function findLatest(dir) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      entries.forEach((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) findLatest(full);
        else if (entry.name.endsWith(".md") && !latestEpisode) {
          latestEpisode = path.relative(MEMORY_ROOT, full);
        }
      });
    }
    findLatest(episodicBase);
  }

  const indexPath_content = `# AI-Suplex Memory Index

TWABAM ⚡! This file is the quick lookup map for the AI-Suplex memory system.
Last refreshed: ${getNow().datetime}

## Core Memory Files

${governanceFiles.map((f) => `- [${f.replace(".md", "")}](${f})`).join("\n")}

## Semantic Files
${semanticFiles.map((f) => `- semantic/${f}`).join("\n")}

## Procedural Files
${proceduralFiles.map((f) => `- procedural/${f}`).join("\n")}

## Staging
- lessons.md

## Latest Episode
${latestEpisode ? `- ${latestEpisode}` : "(none)"}

## Bridge Layer
- cortexmem — optional fast-capture bridge

## Loading Rule
Read this index first. Load only the files needed for the current task.
Prefer the reviewed markdown vault over any transient bridge state.
`;

  writeFile(indexPath, indexPath_content);

  log(
    "index",
    `Index refreshed: ${governanceFiles.length + semanticFiles.length + proceduralFiles.length} files indexed.`,
  );
  log("index", "TWABAM ⚡!");
}

// ── STATUS ─────────────────────────────────────────────


// ── SURVEY ──────────────────────────────────────────────
// Discovery step: scan this session's Artifacts, B-Bombs, and Insights and
// present a surveyed list of candidate insights to the LLM. The LLM — not the
// script — then judges what's missing, condenses similar entries, and writes
// lessons.md (via add-lessons / direct edit). Survey discovers, LLM decides.

function cmdSurvey(sinceOverride) {
  console.log(KITTY);
  log("survey", "Scanning this session's captures — presenting surveyed insights...");

  // ── 1. Determine cycle/week/focus from the latest session start file ──
  // (Calendar math is WRONG for AI-Suplex's Tuesday-starting 7-week rhythm.)
  const sessionStartDir = path.join(SESSIONS_ROOT, "Active", "Start");
  const startFiles = listFiles(sessionStartDir, /\.md$/);
  let cycle = 1;
  let week = 1;
  let focus = "unknown";
  let sessionId = "";
  let sessionStartMs = 0; // cutoff: only survey captures created at/after session start
  if (startFiles.length > 0) {
    const latest = path.join(sessionStartDir, startFiles[0]);
    const { data } = parseFrontmatter(readFile(latest) || "");
    cycle = parseInt(data.cycle, 10) || 1;
    week = parseInt(data.week, 10) || 1;
    focus = data.focus || "unknown";
    sessionId = data.session_id || "";

    // Session-start filename encodes start time: YYYY-MM-DD-HHMM-...
    const tsMatch = startFiles[0].match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})-/);
    if (tsMatch) {
      const [, Y, M, D, hh, mm] = tsMatch;
      sessionStartMs = new Date(
        parseInt(Y, 10), parseInt(M, 10) - 1, parseInt(D, 10),
        parseInt(hh, 10), parseInt(mm, 10),
      ).getTime();
    }
  }

  // Explicit --since override (YYYY-MM-DD[ HH:mm]) beats the session-start cutoff.
  if (sinceOverride) {
    const m = sinceOverride.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if (m) {
      const [, Y, Mo, D, hh, mm] = m;
      sessionStartMs = new Date(
        parseInt(Y, 10), parseInt(Mo, 10) - 1, parseInt(D, 10),
        parseInt(hh || "0", 10), parseInt(mm || "0", 10),
      ).getTime();
    }
  }

  const cycleDir = `Cycle ${cycle}`;
  const weekDir = `Week ${week}`;
  let sinceStr = "";
  if (sessionStartMs) {
    const d = new Date(sessionStartMs);
    const pad = (n) => String(n).padStart(2, "0");
    sinceStr = ` · since ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  console.log(`\n  Session: ${sessionId || "(none)"} · ${cycleDir} ${weekDir} · ${focus}${sinceStr}\n`);

  // ── 2. Normalization helpers ──
  const norm = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const STOP = new Set([
    "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
    "is", "are", "was", "were", "be", "been", "being", "that", "this", "these",
    "those", "it", "its", "as", "at", "by", "from", "not", "no", "yes", "into",
    "over", "under", "more", "most", "than", "then", "so", "such", "each", "every",
    "all", "any", "some", "both", "either", "neither", "do", "does", "did", "have",
    "has", "had", "can", "could", "should", "would", "will", "shall", "may", "might",
    "must", "about", "out", "up", "down", "off", "per", "via", "vs", "get", "got",
    "make", "makes", "made", "use", "uses", "used", "using", "how", "what", "which",
    "who", "whom", "whose", "when", "where", "why", "we", "you", "they", "he", "she",
    "them", "us", "our", "your", "their", "his", "her", "my", "me", "just", "very",
    "too", "also", "only", "even", "still", "yet", "own", "one", "two", "three",
  ]);
  const tokens = (s) =>
    norm(s).split(" ").filter((w) => w.length > 2 && !STOP.has(w));
  const sig = (s) => norm(s).slice(0, 60);

  // ── 3. Load existing lessons (tagged or bare) ──
  const lessonsPath = path.join(MEMORY_ROOT, "lessons.md");
  const lessonsContent = readFile(lessonsPath) || "";
  const existing = []; // { text, tag, line, sig, toks }
  lessonsContent.split("\n").forEach((l, i) => {
    const t = l.trim();
    if (!t.startsWith("- ")) return;
    const m = t.match(/^- \[([^\]]+)\]\s*(.+)$/);
    const text = m ? m[2].trim() : t.slice(2).trim();
    if (text.length < 10) return;
    const s = sig(text);
    if (!s) return;
    existing.push({ text, tag: m ? m[1] : "", line: i + 1, sig: s, toks: tokens(text) });
  });

  // ── 4. Extract candidate insights from this week's captures ──
  // Light filters only (strip markdown/checkboxes) — the LLM re-judges, so no
  // heavy imperative-verb blacklist here.
  const sources = [
    { name: "Artifacts", dir: P.abs(P.resolve(P.artifactDir(cycle, week))) },
    { name: "B-Bombs", dir: P.abs(P.resolve(P.bBombDir(cycle, week))) },
    // insightDir() returns the FILE path — the scan root is its directory.
    { name: "Insights", dir: path.dirname(P.abs(P.resolve(P.insightDir(cycle, week)))) },
  ];

  const stripMarkdown = (s) => s.replace(/\*\*|`/g, "").trim();
  const isCheckbox = (s) => /^\s*(?:[-*]\s*)?\[[ xX]\]/.test(s.trim());
  const splitInsights = (s) =>
    String(s)
      .split(/[;\n]|\.\s+(?=[A-Z0-9])/)
      .map((x) => stripMarkdown(x).replace(/^["'-]+|["']+$/g, "").trim())
      .filter((x) => x.length > 15 && !isCheckbox(x));

  const candidates = []; // { text, source, file, sig, toks }
  const filesScanned = [];
  const filesSkipped = [];

  sources.forEach((src) => {
    if (!fs.existsSync(src.dir)) {
      log("survey", `${src.name}: not found (${src.dir}).`);
      return;
    }
    const files =
      src.name === "Insights"
        ? fs.readdirSync(src.dir).filter((f) => f === `${weekDir}.md`)
        : fs.readdirSync(src.dir).filter((f) => f.endsWith(".md"));

    files.forEach((file) => {
      const filePath = path.join(src.dir, file);
      const stat = fs.statSync(filePath);
      // Only survey captures created at/after the session start (keeps the list
      // relevant to THIS session). Insights files are aggregated weekly, so they
      // are always included.
      if (sessionStartMs && src.name !== "Insights" && stat.mtimeMs < sessionStartMs) {
        filesSkipped.push(`${src.name}/${file}`);
        return;
      }
      const content = readFile(filePath);
      if (!content) return;
      filesScanned.push(`${src.name}/${file}`);
      const { data, body } = parseFrontmatter(content);

      const texts = [];

      // frontmatter key_insights (string or YAML list)
      const ki = Array.isArray(data.key_insights)
        ? data.key_insights.join("\n")
        : data.key_insights;
      if (ki) splitInsights(ki).forEach((t) => texts.push(t));

      // body bullets/numbered items under lesson-bearing headings.
      // "Next Steps"/"Next Actions"/"Tasks" are ACTIONS, not insights — skip them.
      const bodyLines = body.split("\n");
      let inLessonSection = false;
      const lessonHeading = /^#{2,4}\s+.*(learnings?|insights?|takeaways?|lessons?|conclusion|findings?|reflection)/i;
      const actionHeading = /^#{2,4}\s+.*(next steps?|next actions?|follow.?up|action items?|to.?do|tasks?|checklist)/i;
      bodyLines.forEach((l) => {
        if (actionHeading.test(l)) {
          inLessonSection = false;
          return;
        }
        if (lessonHeading.test(l)) {
          inLessonSection = true;
          return;
        }
        if (/^#{2,4}\s+/.test(l)) {
          inLessonSection = false;
          return;
        }
        if (!inLessonSection) return;
        const m = l.match(/^\s*(?:[-*]\s+|\d+\.\s+)(.+)$/);
        if (m) {
          const t = stripMarkdown(m[1].trim());
          if (t.length > 15 && !isCheckbox(t)) texts.push(t);
        }
      });

      texts.forEach((t) => {
        const s = sig(t);
        if (!s) return;
        candidates.push({ text: t, source: src.name, file, sig: s, toks: tokens(t) });
      });
    });
  });

  // ── 5. Hint each candidate: [NEW] or [~DUP → L{line}] ──
  // A near-match is a HINT (the LLM decides), computed via word-token overlap.
  const dedupCand = [];
  const seenCand = new Set();
  candidates.forEach((c) => {
    if (seenCand.has(c.sig)) return;
    seenCand.add(c.sig);
    dedupCand.push(c);
  });

  const matchFor = (c) => {
    const ct = c.toks;
    if (ct.length === 0) return null;
    let best = null;
    let bestScore = 0;
    existing.forEach((e) => {
      if (e.sig === c.sig) {
        best = e;
        bestScore = Infinity;
        return;
      }
      const et = e.toks;
      if (et.length === 0) return;
      const shared = ct.filter((w) => et.includes(w)).length;
      if (shared < 3) return; // require meaningful overlap, not shared glue words
      const score = shared / Math.min(ct.length, et.length);
      if (score > bestScore) {
        bestScore = score;
        best = e;
      }
    });
    return bestScore >= 0.4 ? best : null;
  };

  const flagged = dedupCand.map((c) => ({ ...c, match: matchFor(c) }));

  // ── 6. Report — grouped by source, each item hinted ──
  console.log(`  Scanned:  ${filesScanned.length} capture file(s)`);
  if (filesSkipped.length > 0) {
    console.log(`  Skipped:  ${filesSkipped.length} pre-session file(s)`);
  }
  console.log(`  Existing lessons: ${existing.length}\n`);

  const groups = {};
  flagged.forEach((c) => {
    const key = c.source === "Insights" ? "insight" : c.source === "B-Bombs" ? "b-bomb" : "artifact";
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });

  const typeLabel = { insight: "INSIGHTS", "b-bomb": "B-BOMBS", artifact: "ARTIFACTS" };
  let newCount = 0;
  let dupCount = 0;

  Object.entries(groups).forEach(([type, items]) => {
    console.log(`── ${typeLabel[type]} (${items.length}) ──`);
    items.forEach((c) => {
      if (c.match) {
        dupCount++;
        console.log(`  [~DUP → L${c.match.line}] ${c.text.slice(0, 75)}`);
        console.log(`      ↳ existing: ${c.match.text.slice(0, 75)}`);
      } else {
        newCount++;
        console.log(`  [NEW] ${c.text.slice(0, 75)}`);
      }
    });
    console.log("");
  });

  console.log(`  Summary: ${newCount} new, ${dupCount} near-dup (LLM to verify).`);
  console.log("\n  Next: you decide —");
  console.log("    • Add missing lessons → `3lm add-lessons --source <type> --ref <id> --list \"...\"`");
  console.log("    • Condense similar entries → edit lessons.md directly");
  console.log("    • Then `3lm end` → `3lm learn` → `3lm index`.");
  log("survey", "TWABAM ⚡!");
}

// ── SYNC ───────────────────────────────────────────────
// Session-end sync: commit + push to all remotes (GitHub + GitLab).
// The heavy encrypted cloud backup (~/scripts/ai-suplex-backup.sh) stays
// end-of-day/cron — see Guides/☁️ AI-Suplex Backup & Infrastructure Guide.md.

function run(cmd, args, opts) {
  const r = spawnSync(cmd, args, { encoding: "utf-8", ...opts });
  const out = (r.stdout || "").trim();
  const err = (r.stderr || "").trim();
  return { code: r.status, out, err };
}

function cmdSync() {
  console.log(KITTY);
  log("sync", "Committing + pushing session to git remotes...");

  const opts = { cwd: VAULT_ROOT };

  // 0. Preflight — is this a git repo?
  const isRepo = run("git", ["rev-parse", "--is-inside-work-tree"], opts);
  if (isRepo.code !== 0) {
    error("Not a git repository. Run `git init` first.");
  }

  // 1. Determine commit message (optional arg or a sensible default).
  const argMsg = process.argv.slice(3).filter((a) => !a.startsWith("--")).join(" ");
  let commitMsg = argMsg;
  if (!commitMsg) {
    const sessionStartDir = path.join(SESSIONS_ROOT, "Active", "Start");
    const startFiles = listFiles(sessionStartDir, /\.md$/);
    let sid = "";
    let focus = "";
    if (startFiles.length > 0) {
      const { data } = parseFrontmatter(readFile(path.join(sessionStartDir, startFiles[0])) || "");
      sid = data.session_id || startFiles[0].replace(/\.md$/, "");
      focus = data.focus || "";
    }
    const now = getNow();
    commitMsg = `Session End — ${sid || now.date}${focus ? " — " + focus : ""}`;
  }

  // 2. Stage + commit (no-op if nothing to commit).
  const add = run("git", ["add", "-A"], opts);
  if (add.code !== 0) error("git add failed: " + add.err);
  const commit = run("git", ["commit", "-m", commitMsg], opts);
  if (commit.code !== 0) {
    const msg = (commit.err + "\n" + commit.out).toLowerCase();
    // "nothing to commit" is fine (clean tree / submodule-only dirt) — just push.
    if (msg.includes("nothing to commit") || msg.includes("nothing added to commit")) {
      log("sync", "Working tree clean — nothing to commit. Proceeding to push.");
    } else {
      error("git commit failed: " + (commit.err || commit.out));
    }
  } else {
    log("sync", `Committed: ${commitMsg}`);
    console.log(`     ${(commit.out || "").split("\n")[0] || ""}`);
  }

  // 3. Push to every configured remote, current branch.
  const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"], opts).out;
  const remotes = run("git", ["remote"], opts).out.split("\n").filter(Boolean);
  if (remotes.length === 0) {
    error("No git remotes configured. Add one with `git remote add origin <url>`.");
  }

  let pushed = 0;
  for (const remote of remotes) {
    const push = run("git", ["push", remote, branch], opts);
    if (push.code === 0) {
      log("sync", `Pushed ${branch} → ${remote} ✅`);
      pushed++;
    } else {
      console.log(`  ⚠️  push to ${remote} failed: ${push.err.split("\n")[0]}`);
    }
  }

  if (pushed === 0) {
    error("All remotes failed. Check credentials/network.");
  }

  log("sync", `Synced to ${pushed}/${remotes.length} remote(s).`);
  log("sync", "Cloud backup: run `~/scripts/ai-suplex-backup.sh` at end of day (or via cron).");
  log("sync", "TWABAM ⚡!");
}

function cmdStatus() {
  console.log(KITTY);

  const governanceDir = MEMORY_ROOT;
  const semanticDir = path.join(MEMORY_ROOT, "semantic");
  const proceduralDir = path.join(MEMORY_ROOT, "procedural");
  const episodicDir = path.join(MEMORY_ROOT, "episodic");

  const governanceCount = listFiles(governanceDir, /\.md$/).length;
  const semanticCount = listFiles(semanticDir, /\.md$/).length;
  const proceduralCount = listFiles(proceduralDir, /\.md$/).length;

  let episodicCount = 0;
  if (fs.existsSync(episodicDir)) {
    function countFiles(dir) {
      if (!fs.existsSync(dir)) return;
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        if (e.isDirectory()) countFiles(path.join(dir, e.name));
        else if (e.name.endsWith(".md")) episodicCount++;
      });
    }
    countFiles(episodicDir);
  }

  console.log(`\n  Governance:  ${governanceCount} files`);
  console.log(`  Semantic:    ${semanticCount} files`);
  console.log(`  Procedural:  ${proceduralCount} files`);
  console.log(`  Episodic:    ${episodicCount} episodes`);
  console.log(
    `  Total:       ${governanceCount + semanticCount + proceduralCount + episodicCount} files\n`,
  );

  // Check for active tasklists and sessions
  const activeTL = path.join(TASKLISTS_ROOT, "Active");
  const activeSS = path.join(SESSIONS_ROOT, "Active", "Start");
  const activeSE = path.join(SESSIONS_ROOT, "Active", "End");

  console.log(`  Active Tasklists:    ${listFiles(activeTL, /\.md$/).length}`);
  console.log(
    `  Active Session Starts: ${listFiles(activeSS, /\.md$/).length}`,
  );
  console.log(`  Active Session Ends:  ${listFiles(activeSE, /\.md$/).length}`);

  console.log("\nTWABAM ⚡!");
}

// ── CLEAN ─────────────────────────────────────────────

function cmdClean() {
  console.log(KITTY);
  log("clean", "Cleaning lessons.md — consolidating, deduplicating and archiving...");

  const lessonsPath = path.join(MEMORY_ROOT, "lessons.md");
  const archivePath = path.join(MEMORY_ROOT, "archived-lessons.md");
  const content = readFile(lessonsPath);

  if (!content) {
    log("clean", "No lessons found. Nothing to clean.");
    return;
  }

  // Walk the file line by line, tracking section context. Handles both the
  // legacy `## [Episode: ...]` header format and the canonical `## Current Lessons`
  // format, plus the trailing Deprecation Watch / Promotion Candidates sections.
  const lines = content.split("\n");

  let headerLines = [];      // any intro text before the first lesson-bearing section
  let currentTag = "";       // active [Episode:] / [Session:] / [Artifact:] tag
  let section = "header";    // header | lessons | deprecation | promotion
  const lessons = [];        // { text, tag } in file order
  let deprecationLines = []; // preserved verbatim
  let promotionLines = [];   // preserved verbatim

  const placeholderRe = /^\(?edit this lesson[^)]*\)?/i;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("## Deprecation Watch")) {
      section = "deprecation";
      continue;
    }
    if (trimmed.startsWith("## Promotion Candidates")) {
      section = "promotion";
      continue;
    }
    if (trimmed.startsWith("## Current Lessons")) {
      section = "lessons";
      currentTag = ""; // bare bullets here carry no episode attribution
      continue;
    }

    const epMatch = trimmed.match(
      /^## \[(Episode|Session|Artifact|B-Bomb|Insight):\s*(.+)\]\s*$/,
    );
    if (epMatch) {
      currentTag = `${epMatch[1]}: ${epMatch[2]}`;
      section = "lessons";
      continue;
    }

    if (section === "lessons" && trimmed.startsWith("- ")) {
      const existingTag = trimmed.match(/^- \[([^\]]+)\]\s*(.+)$/);
      if (existingTag) {
        lessons.push({ text: existingTag[2].trim(), tag: existingTag[1] });
      } else {
        lessons.push({ text: trimmed.replace(/^- /, "").trim(), tag: currentTag });
      }
      continue;
    }

    if (section === "deprecation" && trimmed.startsWith("- ")) {
      deprecationLines.push(line);
      continue;
    }
    if (section === "promotion" && trimmed.startsWith("- ")) {
      promotionLines.push(line);
      continue;
    }

    if (section === "header") {
      headerLines.push(line);
    }
  }

  // Drop placeholders/empties, then dedup by normalized text (tag stripped).
  const valid = lessons.filter(
    (l) => l.text.length > 0 && !placeholderRe.test(l.text),
  );
  const seen = new Map();
  const deduped = [];
  for (const l of valid) {
    const key = l.text.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.set(key, l);
      deduped.push(l);
    }
  }
  const dedupRemoved = valid.length - deduped.length;

  // Keep the 50 MOST RECENT (file order is chronological → most recent at end).
  const keepCount = 50;
  const kept = deduped.slice(-keepCount);
  const toArchive = deduped.slice(0, Math.max(0, deduped.length - keepCount));

  if (toArchive.length > 0) {
    log(
      "warn",
      `${toArchive.length} lessons will be ARCHIVED without scoring.`,
    );
    log(
      "warn",
      "Run '3lm promote --min 70' first to score and promote valuable lessons before they are archived.",
    );
  }

  // Rebuild lessons.md: header + Current Lessons + Deprecation Watch + Promotion Candidates.
  const fmt = (l) => (l.tag ? `- [${l.tag}] ${l.text}` : `- ${l.text}`);
  const headerText = headerLines.join("\n").trim();

  let newContent = "";
  if (headerText) newContent += headerText + "\n\n";
  newContent += "## Current Lessons\n\n" + kept.map(fmt).join("\n") + "\n";
  if (deprecationLines.length > 0) {
    newContent += "\n## Deprecation Watch\n" + deprecationLines.join("\n") + "\n";
  }
  newContent += "\n## Promotion Candidates\n";

  writeFile(lessonsPath, newContent);

  // Archive older lessons.
  if (toArchive.length > 0) {
    let archiveContent = readFile(archivePath) || "";
    if (!archiveContent.trim()) {
      archiveContent = `# 🗄️ Archived Lessons\n\n> Lessons moved here from lessons.md after ${keepCount}-item limit.\n\n`;
    }

    const archiveNote =
      `\n## Archived ${getNow().date}\n\n` + toArchive.map(fmt).join("\n") + "\n";
    writeFile(archivePath, archiveContent + archiveNote);
    log(
      "clean",
      `Archived ${toArchive.length} older lessons to archived-lessons.md`,
    );
  }

  log("clean", `Removed ${dedupRemoved} duplicates`);
  log("clean", `Kept ${kept.length} active lessons (limit: ${keepCount})`);
  log("clean", "TWABAM ⚡!");
}

const command = process.argv[2];

// Parse --min-score flag
const minScoreIdx = process.argv.indexOf("--min");
const minScore =
  minScoreIdx > -1 ? parseInt(process.argv[minScoreIdx + 1]) || 70 : 70;

// Parse --since flag (survey cutoff override; else derived from session-start filename)
const sinceIdx = process.argv.indexOf("--since");
const sinceArg = sinceIdx > -1 ? process.argv[sinceIdx + 1] : null;

// Parse --stale-days flag (staleness guard threshold, default 7)
const staleDaysIdx = process.argv.indexOf("--stale-days");
const staleDays =
  staleDaysIdx > -1 ? parseInt(process.argv[staleDaysIdx + 1]) || 7 : 7;

// Parse --context flag (run the Graph RAG session-context generator, Impl 2)
const genContext = process.argv.includes("--context");

switch (command) {
  case "start":
    cmdStart();
    break;
  case "end":
    cmdEnd();
    break;
  case "learn":
    cmdLearn();
    break;
  case "add-lessons":
    cmdAddLessons();
    break;
  case "promote":
    cmdPromote(minScore);
    break;
  case "revise":
    cmdRevise();
    break;
  case "index":
    cmdIndex();
    break;
  case "clean":
    cmdClean();
    break;
  case "survey":
    cmdSurvey(sinceArg);
    break;
  case "sync":
    cmdSync();
    break;
  case "status":
    cmdStatus();
    break;
  case "approvals":
    cmdApprovals();
    break;
  default:
    console.log(KITTY);
    console.log("\nUsage: node 3lm <command> [--param value ...]\n");
    console.log("Commands:");
    console.log("  start              Load context, generate mission brief (checks staleness)");
    console.log("                     --stale-days N  freshness threshold, default 7");
    console.log("                     --context        also run Graph RAG session-context generator");
    console.log("  end                Write episodic file, score outcome");
    console.log("  learn              Extract lessons from episode");
    console.log(
      "  add-lessons        Quick-capture: push lessons from artifact/B-Bomb/insight",
    );
    console.log(
      "                     --source <type> --ref <id> --list \"lesson 1\" \"lesson 2\"",
    );
    console.log(
      "  promote --min N    Score lessons, promote above threshold (default: 70)",
    );
    console.log(
      "  clean              Consolidate + dedup lessons.md; keep 50 recent, archive the rest (run promote first)",
    );
    console.log(
      "  revise             Check contradictions, deprecate old rules",
    );
    console.log("  index              Refresh memory/index.md");
    console.log("  survey             Scan session captures → surveyed insights for the LLM to judge");
    console.log("                     --since YYYY-MM-DD [HH:mm]   only captures at/after this time");
    console.log("  sync [message]     Commit + push current branch to all git remotes");
    console.log("  status             Show memory/ folder stats");
    console.log(
      "  approvals          Aggregated 'Hustler decides' inbox (FINAL BOSS gates · lessons · B-Bombs)",
    );
    console.log(
      "                     --json  machine-readable inbox (for the Phase C cockpit)\n",
    );
    break;
}