#!/usr/bin/env node
/**
 * 🦸 LLM Wiki — Vault Awareness Engine for AI-Suplex
 *
 * Karpathy-style LLM Wiki adapted for AI-Suplex's file-first paradigm.
 * Scans the vault, extracts frontmatter + summaries, builds a tiered index
 * so the AI agent knows every file without manual path references.
 *
 * Usage:
 *   node Tools/llm-wiki.js           # Full scan — all tiers
 *   node Tools/llm-wiki.js --quick   # Tier 1 only (fast, for session start)
 *
 * Output:
 *   Memory/wiki-index.md  — Tier 1 compact index (agent reads every session)
 *   Memory/wiki-full.md   — All tiers (searchable reference)
 *   Memory/wiki-log.md    — Chronological append-only log
 *
 * TWABAM ⚡!
 */

const fs = require("fs");
const path = require("path");

// — Config ——————————————————————————————————————————————————————————————
const ROOT = path.resolve(__dirname, "..");
const WIKI_DIR = path.join(ROOT, "Memory");
const NOW = new Date().toISOString().replace("T", " ").slice(0, 19);
const DATE = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0, 8).replace(/:/g, "");

// Minimum file size to include (skip empty stubs and templates)
const MIN_SIZE = 300;

// Directories and patterns to skip
const SKIP_DIRS = [
  ".git", ".obsidian", ".trash", "node_modules",
  "Templates", "Prompt Patterns", "Scripts", "Sessions",
  "Community", // Skills/Community — third-party imports, not AI-Suplex knowledge
];

const SKIP_PATTERNS = [
  /^license/i, /^\./, /chart\.md/, /dataview/i,
  /welcome/i, /readme/i, // README/WELCOME are bootstrap, not knowledge
];

// — Tier Definitions ———————————————————————————————————————————————————————
const TIERS = {
  1: {
    label: "Core Knowledge — Agent reads every session",
    dirs: [
      "Artifacts",
      "B-Bombs",
      "Memory/semantic",
      "Memory/procedural",
      "Memory/episodic",
      "Memory/governance",
    ],
    filter: (fp) => {
      if (!fp.endsWith(".md")) return false;
      try { return fs.statSync(path.join(ROOT, fp)).size >= MIN_SIZE; }
      catch { return false; }
    },
  },
  2: {
    label: "Extended Knowledge — Agent loads on demand",
    dirs: [
      "AI-Suplex Kick-start/",
      "Skills",
      "AGENTS.md",
      "Focuses.md",
    ],
    filter: (fp) => {
      if (!fp.endsWith(".md")) return false;
      try {
        const stat = fs.statSync(path.join(ROOT, fp));
        return stat.size >= MIN_SIZE && stat.isFile();
      } catch { return false; }
    },
  },
  3: {
    label: "Full Vault — Searchable, not auto-loaded",
    dirs: [
      "Plans",
      "Sessions/Active",
      "Tasklists/Active",
      "Reviews",
      "AI-Suplex Kick-start/Context Kick-start",
      "memory",
      "README.md",
    ],
    filter: (fp) => {
      if (!fp.endsWith(".md")) return false;
      try {
        const stat = fs.statSync(path.join(ROOT, fp));
        return stat.size >= 200 && stat.isFile();
      } catch { return false; }
    },
    maxDepth: 2,
  },
};

// — Helpers ———————————————————————————————————————————————————————————————
function log(label, msg) {
  console.log(`\x1b[1;36m[llm-wiki ${label}]\x1b[0m ${msg}`);
}

function shouldSkip(relPath) {
  const parts = relPath.split(path.sep);
  for (const part of parts) {
    if (SKIP_DIRS.includes(part)) return true;
  }
  const name = path.basename(relPath);
  for (const p of SKIP_PATTERNS) {
    if (p.test(name)) return true;
  }
  return false;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data = {};
  const lines = match[1].split("\n");
  for (const line of lines) {
    const m = line.match(/^(\w[\w_]*):\s*(.*)/);
    if (m) {
      let val = m[2].replace(/^["']|["']$/g, "").trim();
      // Handle arrays
      if (val.startsWith("[") && val.endsWith("]")) {
        val = val.slice(1, -1).split(",").map(s => s.trim().replace(/["']/g, ""));
      }
      data[m[1]] = val;
    }
  }
  data._body_start = match[0].length;
  return data;
}

function extractSummary(content, fm) {
  // Get body after frontmatter
  const body = fm._body_start ? content.slice(fm._body_start) : content;
  const lines = body.split("\n");
  let summary = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue; // Skip headings
    if (trimmed.startsWith("|")) continue; // Skip table lines
    if (trimmed.startsWith("```")) continue; // Skip code fences
    if (trimmed.startsWith("> ")) {
      // Blockquote — include without >
      summary += trimmed.slice(2) + " ";
    } else {
      summary += trimmed + " ";
    }
    if (summary.length > 200) break;
  }
  return summary.slice(0, 200).trim() || "(no summary available)";
}

function getEntityTags(fm, summary) {
  const tags = [];
  // From frontmatter
  if (fm.tags) {
    const t = Array.isArray(fm.tags) ? fm.tags : [fm.tags];
    tags.push(...t);
  }
  // From focus
  if (fm.focus) tags.push(fm.focus);
  // Key entities from summary
  const entities = [
    "3lm", "memory", "semantic", "procedural", "episodic",
    "artifact", "b-bomb", "insight", "session", "tasklist",
    "skill", "prompt pattern", "orchestrator", "promote", "knowledge graph",
  ];
  for (const e of entities) {
    if (summary.toLowerCase().includes(e.toLowerCase())) {
      tags.push(e.toLowerCase().replace(/\s+/g, "-"));
    }
  }
  return [...new Set(tags)]; // deduplicate
}

// — Scanner ———————————————————————————————————————————————————————————————
function scanDirectory(dirRel) {
  const results = [];
  const fullDir = path.join(ROOT, dirRel);

  if (!fs.existsSync(fullDir)) {
    return results;
  }

  // If it's a single file
  if (dirRel.endsWith(".md")) {
    if (!shouldSkip(dirRel)) {
      try {
        const content = fs.readFileSync(fullDir, "utf8");
        const fm = parseFrontmatter(content);
        const summary = extractSummary(content, fm);
        const tags = getEntityTags(fm, summary);
        const stat = fs.statSync(fullDir);
        results.push({
          path: dirRel,
          name: path.basename(dirRel),
          title: fm.title || path.basename(dirRel, ".md"),
          type: fm.type || "document",
          focus: fm.focus || null,
          cycle: fm.cycle || null,
          week: fm.week || null,
          date: fm.date || null,
          summary,
          tags,
          size: stat.size,
          modified: stat.mtime.toISOString().slice(0, 19),
        });
      } catch (e) {
        log("warn", `Could not read: ${dirRel}`);
      }
    }
    return results;
  }

  // Walk directory
  try {
    const entries = fs.readdirSync(fullDir, { withFileTypes: true });
    for (const entry of entries) {
      const subRel = path.join(dirRel, entry.name);
      if (shouldSkip(subRel)) continue;

      if (entry.isDirectory()) {
        results.push(...scanDirectory(subRel));
      } else if (entry.name.endsWith(".md")) {
        try {
          const fp = path.join(ROOT, subRel);
          const content = fs.readFileSync(fp, "utf8");
          if (content.length < MIN_SIZE) continue;

          const fm = parseFrontmatter(content);
          const summary = extractSummary(content, fm);
          const tags = getEntityTags(fm, summary);
          const stat = fs.statSync(fp);

          results.push({
            path: subRel,
            name: entry.name,
            title: fm.title || entry.name.replace(".md", ""),
            type: fm.type || "document",
            focus: fm.focus || null,
            cycle: fm.cycle,
            week: fm.week,
            date: fm.date || null,
            summary,
            tags,
            size: stat.size,
            modified: stat.mtime.toISOString().slice(0, 19),
          });
        } catch (e) {
          log("warn", `Could not read: ${subRel}`);
        }
      }
    }
  } catch (e) {
    log("warn", `Could not scan: ${dirRel}`);
  }

  return results;
}

function scanTier(tierNum, tierConfig) {
  const all = [];
  for (const dir of tierConfig.dirs) {
    log("scan", `Tier ${tierNum}: ${dir}`);
    const results = scanDirectory(dir);
    all.push(...results);
  }

  // Deduplicate by path
  const seen = new Set();
  const unique = all.filter((f) => {
    if (seen.has(f.path)) return false;
    seen.add(f.path);
    return true;
  });

  log("scan", `Tier ${tierNum}: ${unique.length} unique files`);
  return unique;
}

// — Generator —————————————————————————————————————————————————————————————
function generateWikiIndex(tierData, label) {
  let md = "";
  md += "# 🦸 AI-Suplex Wiki Index\n\n";
  md += `> ${label}\n`;
  md += `> Generated: ${NOW}\n\n`;

  // Group by type/parent directory
  const groups = {};
  for (const entry of tierData) {
    const parent = path.dirname(entry.path).split(path.sep)[0];
    let group = parent;

    // More specific grouping
    if (entry.path.includes("Artifacts/Cycle")) group = "Artifacts";
    else if (entry.path.includes("B-Bombs/Cycle")) group = "B-Bombs";
    else if (entry.path.includes("Memory/episodic")) group = "Memory — Episodic";
    else if (entry.path.includes("Memory/semantic")) group = "Memory — Semantic";
    else if (entry.path.includes("Memory/procedural")) group = "Memory — Procedural";
    else if (entry.path.includes("Memory/governance")) group = "Memory — Governance";
    else if (entry.path.includes("Projects/Agents")) group = "Agents Terminal";

    if (!groups[group]) groups[group] = [];
    groups[group].push(entry);
  }

  // Sort groups
  const sortedGroups = Object.keys(groups).sort();

  for (const group of sortedGroups) {
    const entries = groups[group];
    entries.sort((a, b) => (b.date || "").localeCompare(a.date || "")); // Newest first

    md += `## ${group}\n\n`;
    md += "| Title | Date | Focus | Summary |\n";
    md += "|-------|------|-------|--------|\n";

    for (const entry of entries) {
      const dateStr = entry.date || (entry.modified ? entry.modified.slice(0, 10) : "—");
      const focusStr = entry.focus || "—";
      md += `| [${entry.title}](${entry.path}) | ${dateStr} | ${focusStr} | ${entry.summary.slice(0, 100)} |\n`;
    }
    md += "\n";
  }

  // Tag index
  md += "## 🏷️ Entity Tags\n\n";
  const tagMap = {};
  for (const entry of tierData) {
    for (const tag of entry.tags) {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(entry.title);
    }
  }
  const sortedTags = Object.keys(tagMap).sort();
  for (const tag of sortedTags) {
    const titles = tagMap[tag].slice(0, 5).join(", ");
    md += `- **#${tag}** — ${titles}${tagMap[tag].length > 5 ? ` (+${tagMap[tag].length - 5} more)` : ""}\n`;
  }

  md += "\n---\n*Generated by vault-index — Deep Ultra 🦸. TWABAM ⚡!*\n";
  return md;
}

function generateWikiLog(entries, prevLogContent) {
  const prevEntries = prevLogContent
    ? prevLogContent.match(/-\s\[(.*?)\]\s(.*?)\s—\s(.*?)(?=\n-\s\[|$)/g)
    : [];

  let md = "";
  md += "# 🗓️ Wiki Log — Chronological\n\n";
  md += `> Append-only record of indexed files and operations.\n\n`;

  // New entries
  md += `## ${DATE}\n\n`;
  md += `**Action:** Index updated — ${entries.length} files\n\n`;
  for (const entry of entries.slice(0, 20)) {
    md += `- [${entry.title}](${entry.path}) — ${entry.summary.slice(0, 60)}\n`;
  }
  if (entries.length > 20) {
    md += `- ... and ${entries.length - 20} more files\n`;
  }
  md += "\n";

  // Preserve previous entries
  if (prevLogContent && prevLogContent.length > 100) {
    const prevLines = prevLogContent.split("\n");
    const prevStart = prevLines.findIndex((l) => l.startsWith("## "));
    if (prevStart > 0) {
      // Re-append previous log entries (deduplicating the current date section)
      const oldEntries = prevLines
        .slice(prevStart)
        .filter((l) => !l.includes(DATE))
        .join("\n");
      if (oldEntries.trim()) {
        md += oldEntries + "\n";
      }
    }
  }

  md += "\n---\n*Generated by vault-index — Deep Ultra 🦸.*\n";
  return md;
}

// — Main ——————————————————————————————————————————————————————————————————
function main() {
  console.log("\x1b[1;36m╔══════════════════════════════════╗\x1b[0m");
  console.log("\x1b[1;36m║  🧠 LLM Wiki — Vault Indexer     ║\x1b[0m");
  console.log("\x1b[1;36m╚══════════════════════════════════╝\x1b[0m\n");

  const quick = process.argv.includes("--quick");
  const verbose = process.argv.includes("--verbose");
  const currentMode = process.argv.includes("--current");
  const okfCheck = process.argv.includes("--okf-check");
  const okfInit = process.argv.includes("--okf-init");
  const daysIdx = process.argv.indexOf("--days");
  const days = daysIdx > -1 ? parseInt(process.argv[daysIdx + 1], 10) : null;

  fs.mkdirSync(WIKI_DIR, { recursive: true });

  // — OKF Compliance ————————————————————————————————————————————————
  if (okfCheck || okfInit) {
    if (okfCheck) okfCheckConformance();
    if (okfInit) okfInitConformance();
    return;
  }

  // — Current-Week Mode: Only this week + last week + always-important files —
  if (currentMode) {
    // Always-included memory files (never age out)
    const alwaysInclude = [
      "Memory/semantic",
      "Memory/procedural",
      "Memory/governance",
      "Memory/lessons.md",
      "Memory/index.md",
      "AGENTS.md",
    ];

    // Determine cycle and week
    const ci = process.argv.indexOf("--cycle");
    const wi = process.argv.indexOf("--week");
    // Auto-detect the latest cycle (highest "Cycle N" dir under Artifacts) when not passed
    let cycle = ci > -1 ? process.argv[ci + 1] : "1";
    if (ci <= -1) {
      const artRoot = path.join(ROOT, "Artifacts");
      let maxCycle = 0;
      if (fs.existsSync(artRoot)) {
        for (const d of fs.readdirSync(artRoot, { withFileTypes: true })) {
          if (!d.isDirectory()) continue;
          const m = d.name.match(/^Cycle\s+(\d+)$/i);
          if (m) maxCycle = Math.max(maxCycle, parseInt(m[1], 10));
        }
      }
      cycle = String(maxCycle || 1);
    }
    const thisWeek = parseInt(wi > -1 ? process.argv[wi + 1] : (() => {
      // Auto-detect: find latest week directory in Artifacts
      for (let w = 10; w >= 1; w--) {
        const d = `Artifacts/Cycle ${cycle}/Week ${w}`;
        if (fs.existsSync(path.join(ROOT, d))) return w;
      }
      return 1;
    })());
    const prevWeek = Math.max(1, thisWeek - 1);

    log("current", `Cycle ${cycle}, Week ${thisWeek} (prev: ${prevWeek})`);

    // Scan weekly directories
    const thisWeekDirs = [
      `Artifacts/Cycle ${cycle}/Week ${thisWeek}`,
      `B-Bombs/Cycle ${cycle}/Week ${thisWeek}`,
      `Artifacts/Cycle ${cycle}/Week ${prevWeek}`,
      `B-Bombs/Cycle ${cycle}/Week ${prevWeek}`,
    ];

    let entries = [];

    // Always-include files
    for (const dir of alwaysInclude) {
      log("scan", `Always: ${dir}`);
      entries.push(...scanDirectory(dir));
    }

    // Weekly directories
    for (const dir of thisWeekDirs) {
      log("scan", `Weekly: ${dir}`);
      entries.push(...scanDirectory(dir));
    }

    // Also scan episodic for current + previous week
    const episodicWeeks = [
      `Memory/episodic/Cycle-${cycle}/Week-${thisWeek}`,
      `Memory/episodic/Cycle-${cycle}/Week-${prevWeek}`,
    ];
    for (const dir of episodicWeeks) {
      log("scan", `Episodic: ${dir}`);
      entries.push(...scanDirectory(dir));
    }

    // Deduplicate
    const seen = new Set();
    const unique = entries.filter((e) => {
      if (seen.has(e.path)) return false;
      seen.add(e.path);
      return true;
    });

    log("current", `${unique.length} files (Cycle ${cycle}, Weeks ${prevWeek}-${thisWeek})`);

    const idx = generateWikiIndex(unique, `Current Focus — Cycle ${cycle}, Weeks ${prevWeek}-${thisWeek}`);
    const idxPath = path.join(WIKI_DIR, "wiki-current.md");
    fs.writeFileSync(idxPath, idx);
    log("write", `wiki-current.md → ${unique.length} entries`);

    console.log(`\n\x1b[1;32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
    console.log(`\x1b[1;32m  🧠 Wiki-Current Generated\x1b[0m`);
    console.log(`\x1b[1;32m  ${unique.length} files — Cycle ${cycle}, Weeks ${prevWeek}–${thisWeek}\x1b[0m`);
    console.log(`\x1b[1;32m  → Memory/wiki-current.md\x1b[0m`);
    console.log(`\x1b[1;32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
    console.log(`\x1b[1;33m  TWABAM ⚡!\x1b[0m\n`);
    return;
  }

  // Scan all tiers
  const tierResults = {};
  let totalScanned = 0;

  for (const [tierNum, tierConfig] of Object.entries(TIERS)) {
    if (quick && parseInt(tierNum) > 1) {
      log("skip", `Tier ${tierNum} — skipping (--quick mode)`);
      continue;
    }
    tierResults[tierNum] = scanTier(parseInt(tierNum), tierConfig);
    totalScanned += tierResults[tierNum].length;
  }

  // Generate Tier 1 index (compact, agent reads every session)
  const tier1Full = tierResults["1"] || [];
  let tier1IndexData = tier1Full;

  // Retention: with --days N, the every-session index keeps only the last N days of
  // time-series content (Artifacts / B-Bombs / Episodic). Stable memory files
  // (semantic / procedural / governance / lessons / index) always stay.
  if (days && days > 0) {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const isTimeSeries = (p) =>
      p.startsWith("Artifacts/") || p.startsWith("B-Bombs/") || p.startsWith("Memory/episodic/");
    const before = tier1Full.length;
    tier1IndexData = tier1Full.filter((e) => {
      if (!isTimeSeries(e.path)) return true; // stable knowledge — always keep
      if (!e.date) return false;              // undated time-series → drop
      return e.date.slice(0, 10) >= cutoff;
    });
    log("retain", `--days ${days} → ${before} scanned → ${tier1IndexData.length} in index (last ${days} days)`);
  }

  const idx1 = generateWikiIndex(tier1IndexData, TIERS["1"].label);
  const idx1Path = path.join(WIKI_DIR, "wiki-index.md");
  fs.writeFileSync(idx1Path, idx1);
  log("write", `wiki-index.md → ${tier1IndexData.length} entries (Tier 1 only)`);

  // Generate full index (all tiers, searchable)
  if (!quick) {
    const allData = Object.values(tierResults).flat();
    const deduped = [];
    const seen = new Set();
    for (const e of allData) {
      if (!seen.has(e.path)) { seen.add(e.path); deduped.push(e); }
    }
    const idxFull = generateWikiIndex(deduped, "Full Vault Index — All tiers");
    const idxFullPath = path.join(WIKI_DIR, "wiki-full.md");
    fs.writeFileSync(idxFullPath, idxFull);
    log("write", `wiki-full.md → ${deduped.length} entries (all tiers)`);
  }

  // Generate log
  const logPath = path.join(WIKI_DIR, "wiki-log.md");
  const prevLog = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : null;
  const allEntries = Object.values(tierResults).flat();
  const logMd = generateWikiLog(allEntries, prevLog);
  fs.writeFileSync(logPath, logMd);
  log("write", `wiki-log.md → ${allEntries.length} files indexed`);

  // Summary
  console.log(`\n\x1b[1;32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
  console.log(`\x1b[1;32m  🧠 LLM Wiki Complete\x1b[0m`);
  console.log(`\x1b[1;32m  ${totalScanned} total files scanned\x1b[0m`);
  for (const [tierNum, data] of Object.entries(tierResults)) {
    const t = TIERS[tierNum];
    console.log(`\x1b[1;32m  Tier ${tierNum}: ${data.length} files — ${t.label}\x1b[0m`);
  }
  console.log(`\x1b[1;32m  → Memory/wiki-index.md (agent auto-loads)\x1b[0m`);
  console.log(`\x1b[1;32m  → Memory/wiki-full.md (searchable reference)\x1b[0m`);
  console.log(`\x1b[1;32m  → Memory/wiki-log.md (chronological)\x1b[0m`);
  console.log(`\x1b[1;32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
  console.log(`\x1b[1;33m  TWABAM ⚡!\x1b[0m\n`);
}

// — OKF Compliance ——————————————————————————————————————————————————————

function okfWalkFiles(dirRel, files) {
  const fullDir = path.join(ROOT, dirRel);
  if (!fs.existsSync(fullDir)) return;
  try {
    const entries = fs.readdirSync(fullDir, { withFileTypes: true });
    for (const entry of entries) {
      const subRel = path.join(dirRel, entry.name);
      const subFull = path.join(ROOT, subRel);
      if (shouldSkip(subRel)) continue;
      if (entry.isDirectory()) {
        okfWalkFiles(subRel, files);
      } else if (entry.name.endsWith(".md") && !/index\.md$/.test(entry.name)) {
        try {
          const content = fs.readFileSync(subFull, "utf8");
          if (content.length < 100) continue;
          const fm = parseFrontmatter(content);
          files.push({ path: subRel, content, fm, size: content.length });
        } catch {}
      }
    }
  } catch {}
}

function okfCheckConformance() {
  log("okf", "Scanning vault for Open Knowledge Format conformance...");
  const files = [];
  okfWalkFiles(".", files);

  let pass = 0, fail = 0, missingType = [];
  for (const f of files) {
    if (f.fm.type) { pass++; }
    else { fail++; missingType.push(f); }
  }

  console.log(`\n📊 OKF Conformance Report`);
  console.log(`${"─".repeat(60)}`);
  console.log(`  Files scanned:   ${files.length}`);
  console.log(`  \x1b[1;32mPassed:\x1b[0m          ${pass} (have 'type' in frontmatter)`);
  console.log(`  \x1b[1;31mFailed:\x1b[0m          ${fail} (missing 'type' in frontmatter)\n`);

  if (missingType.length > 0) {
    console.log(`  \x1b[1;33mFiles missing 'type':\x1b[0m`);
    for (const f of missingType.slice(0, 20)) {
      console.log(`    \x1b[2m${f.path}\x1b[0m`);
    }
    if (missingType.length > 20) {
      console.log(`    ... and ${missingType.length - 20} more`);
    }
  }

  const pct = files.length > 0 ? Math.round(pass / files.length * 100) : 0;
  console.log(`\n  \x1b[1;36mConformance: ${pct}%\x1b[0m`);
  if (pct >= 90) console.log(`  \x1b[1;32m✅ OKF v0.1 compatible (≥90%)\x1b[0m`);
  else if (pct >= 70) console.log(`  \x1b[1;33m⚠️  Needs improvement\x1b[0m`);
  else console.log(`  \x1b[1;31m❌ Not OKF compliant\x1b[0m`);

  console.log(`\n  Fix: \x1b[1;33mnode Tools/llm-wiki.js --okf-init\x1b[0m\n`);
  console.log(`\x1b[1;33m  TWABAM ⚡!\x1b[0m\n`);
}

function okfInitConformance() {
  log("okf", "Adding Open Knowledge Format 'type' fields to vault...");
  const files = [];
  okfWalkFiles(".", files);

  let updated = 0, skipped = 0;
  for (const f of files) {
    if (f.fm.type) { skipped++; continue; }

    // Auto-detect type from path
    let inferredType = "document";
    if (f.path.includes("Artifacts/Cycle")) inferredType = "artifact";
    else if (f.path.includes("B-Bombs/Cycle")) inferredType = "b-bomb";
    else if (f.path.includes("Memory/episodic")) inferredType = "episodic";
    else if (f.path.includes("Memory/semantic")) inferredType = "semantic";
    else if (f.path.includes("Memory/procedural")) inferredType = "procedural";
    else if (f.path.includes("Memory/governance")) inferredType = "governance";
    else if (f.path.includes("Memory/lessons")) inferredType = "lessons";
    else if (f.path.includes("Projects/")) inferredType = "specification";
    else if (f.path.includes("Skills/")) inferredType = "skill";
    else if (f.path.includes("Plans/")) inferredType = "plan";
    else if (f.path.includes("Sessions/")) inferredType = "session";
    else if (f.path.includes("AI-Suplex Kick-start")) inferredType = "documentation";

    // Insert 'type' after the first frontmatter line (or after '---')
    const newContent = f.content.replace(
      /^(---\n)/,
      `$1type: ${inferredType}\n`
    );
    fs.writeFileSync(path.join(ROOT, f.path), newContent);
    updated++;
  }

  // Update root index.md with OKF version
  const rootIdx = path.join(ROOT, "index.md");
  let rootContent = "";
  if (fs.existsSync(rootIdx)) {
    rootContent = fs.readFileSync(rootIdx, "utf8");
    if (!rootContent.includes("okf_version")) {
      rootContent = rootContent.replace(/^(---\n)/, `$1okf_version: "0.1"\n`);
      fs.writeFileSync(rootIdx, rootContent);
      log("okf", "Added okf_version to index.md");
    }
  } else {
    rootContent = `---\nokf_version: "0.1"\ntitle: "AI-Suplex Knowledge Bundle"\n---\n\n# 🦸 AI-Suplex — OKF v0.1 Compliant Knowledge Bundle\n`;
    fs.writeFileSync(rootIdx, rootContent);
    log("okf", "Created index.md with okf_version");
  }

  console.log(`\n  \x1b[1;32mOKF Init Complete\x1b[0m`);
  console.log(`  ${updated} files updated with 'type' field`);
  console.log(`  ${skipped} files already had 'type' (skipped)`);
  console.log(`  \x1b[1;36mAI-Suplex vault is now OKF v0.1 compliant\x1b[0m`);
  console.log(`\n  Verify: \x1b[1;33mnode Tools/llm-wiki.js --okf-check\x1b[0m`);
  console.log(`\n\x1b[1;33m  TWABAM ⚡!\x1b[0m\n`);
}

main();
