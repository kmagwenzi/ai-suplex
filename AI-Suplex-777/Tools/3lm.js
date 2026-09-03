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
 *   promote --min N    Score lessons, promote above threshold
 *   revise             Check contradictions, deprecate old rules
 *   index              Refresh memory/index.md
 *   status             Show memory/ folder stats
 */

const fs = require("fs");
const path = require("path");

const MEMORY_ROOT = path.join(__dirname, "..", "Memory");
const SESSIONS_ROOT = path.join(__dirname, "..", "Sessions");
const TASKLISTS_ROOT = path.join(__dirname, "..", "Tasklists");

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

  let latestCycle = null;
  let latestWeek = null;
  let latestMtime = 0;

  const cycleDirs = fs
    .readdirSync(episodicRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("Cycle-"))
    .sort()
    .reverse();

  for (const cycleDir of cycleDirs) {
    const cyclePath = path.join(episodicRoot, cycleDir.name);
    const weekDirs = fs
      .readdirSync(cyclePath, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith("Week-"))
      .sort()
      .reverse();

    for (const weekDir of weekDirs) {
      const weekPath = path.join(cyclePath, weekDir.name);
      const files = fs.readdirSync(weekPath);
      if (files.length > 0) {
        // Check mtime of most recent file
        const stats = files.map((f) => fs.statSync(path.join(weekPath, f)));
        const newest = Math.max(...stats.map((s) => s.mtimeMs));
        if (newest > latestMtime) {
          latestMtime = newest;
          const cycleNum = cycleDir.name.replace("Cycle-", "");
          const weekNum = weekDir.name.replace("Week-", "");
          latestCycle = parseInt(cycleNum, 10);
          latestWeek = parseInt(weekNum, 10);
        }
      }
    }
  }

  if (latestCycle !== null && latestWeek !== null) {
    return { cycle: latestCycle, week: latestWeek };
  }
  return null;
}

function readEpisodicFiles(cycle, week) {
  const dir = path.join(
    MEMORY_ROOT,
    "episodic",
    `Cycle-${cycle}`,
    `Week-${week}`,
  );
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

// ── START ──────────────────────────────────────────────

function cmdStart() {
  console.log(KITTY);
  log("start", "Loading memory context...\n");

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
      : "1. (Edit this lesson — what did you learn?)\n2.";

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

  const episodeDir = path.join(
    MEMORY_ROOT,
    "episodic",
    `Cycle-${cycle}`,
    `Week-${week}`,
  );
  if (!fs.existsSync(episodeDir)) fs.mkdirSync(episodeDir, { recursive: true });

  const episodeFileName = `${now.datetime}-${sessionId}-episode.md`;
  const episodePath = path.join(episodeDir, episodeFileName);

  writeFile(episodePath, episodeContent);

  log(
    "end",
    `Episode written: memory/episodic/Cycle-${cycle}/Week-${week}/${episodeFileName}`,
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

  // Extract lessons section
  const lessonsSection =
    (body.match(/## Lessons\n([\s\S]*?)(?=\n## |$)/) || [])[1] || "";
  const lessons = lessonsSection
    .split("\n")
    .filter((l) => l.match(/^\d+\.\s+.+/))
    .map((l) => l.replace(/^\d+\.\s+/, "").trim());

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

// ── PROMOTE ────────────────────────────────────────────

function cmdPromote(minScore) {
  console.log(KITTY);
  log("promote", `Scoring lessons (threshold: ${minScore || 70})...`);

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

  // Simplified scoring: check if lesson appears multiple times, count words
  const scored = lessonItems.map((lesson) => {
    const text = lesson.replace(/^- \[[^\]]+\]\s*/, "").trim();
    let score = 40; // base

    // Check for repetition
    const occurrences = lessonItems.filter((l) =>
      l.includes(text.substring(0, 30)),
    ).length;
    if (occurrences >= 3) score += 30;
    else if (occurrences >= 2) score += 15;

    // Check for actionable language (contains "should", "promote", "use", "keep")
    if (/(should|promote|use|keep|move|create|run|write|build)/i.test(text))
      score += 20;

    // Check for contradiction markers
    if (/(must not|should not|avoid|do not|never)/i.test(text)) score += 15;

    return { lesson: text, score: Math.min(score, 100), occurrences };
  });

  scored.forEach((s) => {
    const icon = s.score >= 70 ? "✅" : s.score >= 40 ? "📝" : "🗑️";
    console.log(`  ${icon} Score ${s.score} - ${s.lesson.substring(0, 60)}...`);
  });

  log(
    "promote",
    `${scored.filter((s) => s.score >= 70).length} lessons ready for promotion (≥70).`,
  );
  log(
    "promote",
    `${scored.filter((s) => s.score >= 40 && s.score < 70).length} lessons kept as candidates (40-69).`,
  );
  log(
    "promote",
    `${scored.filter((s) => s.score < 40).length} lessons below threshold (<40).`,
  );
  log("promote", "TWABAM ⚡!");
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
  log("clean", "Cleaning lessons.md — deduplicating and archiving...");

  const lessonsPath = path.join(MEMORY_ROOT, "lessons.md");
  const archivePath = path.join(MEMORY_ROOT, "archived-lessons.md");
  const content = readFile(lessonsPath);

  if (!content) {
    log("clean", "No lessons found. Nothing to clean.");
    return;
  }

  // Extract the header (everything before ## Current Lessons)
  const header = (content.match(/^[\s\S]*?(?=## Current Lessons)/) || [
    "",
  ])[0].trim();

  // Extract all lessons under ## Current Lessons
  const lessonsSection =
    (content.match(/## Current Lessons\n([\s\S]*?)(?=\n## |$)/) || [])[1] || "";
  const lessonLines = lessonsSection
    .split("\n")
    .filter((l) => l.trim().startsWith("- "))
    .map((l) => l.trim());

  if (lessonLines.length === 0) {
    log("clean", "No lessons to clean.");
    return;
  }

  const beforeCount = lessonLines.length;

  // Deduplicate: compare text content after the [Episode:] tag
  const seen = new Map();
  const deduped = [];
  for (const line of lessonLines) {
    const text = line
      .replace(/^- \[[^\]]+\]\s*/, "")
      .toLowerCase()
      .trim();
    if (!seen.has(text)) {
      seen.set(text, line);
      deduped.push(line);
    }
  }
  const dedupRemoved = beforeCount - deduped.length;

  // Keep the 20 most recent, archive the rest
  const keepCount = 20;
  const kept = deduped.slice(0, keepCount);
  const toArchive = deduped.slice(keepCount);

  // Warn if lessons will be archived without being promoted
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
  // Write back cleaned lessons.md
  const newContent = `${header}

## Current Lessons
\n${kept.join("\n")}\n
## Promotion Candidates
\n`;
  writeFile(lessonsPath, newContent);

  // Append archived lessons
  if (toArchive.length > 0) {
    let archiveContent = readFile(archivePath) || "";
    if (!archiveContent.trim()) {
      archiveContent = `# 🗄️ Archived Lessons\n\n> Lessons moved here from lessons.md after ${keepCount}-item limit.\n\n`;
    }

    const archiveNote = `\n## Archived ${getNow().date}\n\n${toArchive.join("\n")}\n`;
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
  case "status":
    cmdStatus();
    break;
  default:
    console.log(KITTY);
    console.log("\nUsage: node 3lm <command> [--param value ...]\n");
    console.log("Commands:");
    console.log("  start              Load context, generate mission brief");
    console.log("  end                Write episodic file, score outcome");
    console.log("  learn              Extract lessons from episode");
    console.log(
      "  promote --min N    Score lessons, promote above threshold (default: 70)",
    );
    console.log(
      "  revise             Check contradictions, deprecate old rules",
    );
    console.log("  index              Refresh memory/index.md");
    console.log("  status             Show memory/ folder stats\n");
    break;
}
