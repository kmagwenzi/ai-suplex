#!/usr/bin/env node
/**
 * 🦸 Vault Index — Vault Awareness Engine for AI-Suplex
 *
 * A Karpathy-style knowledge index adapted for AI-Suplex's file-first paradigm.
 * Scans the vault, extracts frontmatter + summaries, and emits a clean
 * four-file contract (plus an append-only log) so each file does ONE job:
 *
 *   vault-context.md       — agent-facing session brief (READ ALWAYS). Never parsed by the graph.
 *   vault-full.md          — full search index (SEARCH ON DEMAND). All tiers, deduplicated.
 *   vault-index.md         — MACHINE graph node/edge source (read by knowledge-graph.js --build).
 *   vault-index-current.md — current-window graph source (read by knowledge-graph.js --build-current).
 *   vault-log.md           — append-only audit log.
 *
 * Usage:
 *   node Tools/vault-index.js           # Full scan — all tiers (index + full + log)
 *   node Tools/vault-index.js --quick   # Tier 1 only (graph source + log)
 *   node Tools/vault-index.js --current # Session brief + current graph source
 *   node Tools/vault-index.js --days N  # retention window for the brief (default 14)
 *
 * TWABAM ⚡!
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

// — Path contract (single source of truth) ————————————————————————————————
// Every cycle-scoped path resolves through Tools/paths.js. `P.resolve()` keeps this
// tool correct on BOTH layouts during the Period migration (Phase 3 before Phase 4):
// it returns whichever path actually exists, and falls back to the layout the tree
// is currently in — so output stays identical to the pre-migration baseline.
const P = require("./paths");
const { parseCyclePath } = P;

// — Config ——————————————————————————————————————————————————————————————
const ROOT = path.resolve(__dirname, "..");
const VAULT_DIR = path.join(ROOT, "Memory");
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
    label: "Core Knowledge — graph node/edge source",
    dirs: [
      "Artifacts",
      "B-Bombs",
      "Memory/semantic",
      "Memory/procedural",
      "Memory/episodic",
      "Memory/governance",
      "Projects/Agents Terminal V3/Agents Terminal V3 — Specification.md",
      "Projects/Agents Terminal V3/Agents Terminal/orchestrator",
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
  console.log(`\x1b[1;36m[vault-index ${label}]\x1b[0m ${msg}`);
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
    "WQR", "AI-Suplex", "Agents Terminal", "POTRAZ", "compound loop",
    "3lm", "Saturday Promote", "EcoCash", "Voice AI", "DeepSeek",
    "Fireworks", "AMD", "n8n", "Redis", "PostgreSQL", "WhatsApp",
    "B-Bomb", "artifact", "memory", "orchestrator", "sub-agent",
  ];
  for (const e of entities) {
    if (summary.toLowerCase().includes(e.toLowerCase())) {
      tags.push(e.toLowerCase().replace(/\s+/g, "-"));
    }
  }
  return [...new Set(tags)]; // deduplicate
}

function isBBombCandidate(fm) {
  const v = fm.b_bomb_candidate;
  return v === true || v === "true" || fm.status === "candidate";
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
          b_bomb_candidate: isBBombCandidate(fm),
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
            b_bomb_candidate: isBBombCandidate(fm),
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
function generateVaultIndex(tierData, label) {
  let md = "";
  md += "# 🦸 AI-Suplex Vault Index\n\n";
  md += `> ${label}\n`;
  md += `> Generated: ${NOW}\n\n`;

  // Group by type/parent directory
  const groups = {};
  for (const entry of tierData) {
    const parent = path.dirname(entry.path).split(path.sep)[0];
    let group = parent;

    // More specific grouping — parse the path, never string-match a layout
    const cw = parseCyclePath(entry.path);
    if (cw && entry.path.startsWith("Artifacts/")) group = "Artifacts";
    else if (cw && entry.path.startsWith("B-Bombs/")) group = "B-Bombs";
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

  md += "\n---\n*Generated by Vault Index — Deep Ultra 🦸. TWABAM ⚡!*\n";
  return md;
}

// — Brief Generator (vault-context.md) —————————————————————————————————
function withinDays(dateStr, days) {
  if (!dateStr) return false;
  const d = new Date(dateStr.slice(0, 10));
  if (isNaN(d.getTime())) return false;
  return Date.now() - d.getTime() <= days * 86400000;
}

function normalizeTitle(t) {
  return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function truncateText(s, n) {
  s = String(s || "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function scanActiveTasklists() {
  const dir = path.join(ROOT, "Tasklists", "Active");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join("Tasklists", "Active", f))
    .sort((a, b) => fs.statSync(path.join(ROOT, b)).mtime - fs.statSync(path.join(ROOT, a)).mtime);
  const out = [];
  for (const rel of files.slice(0, 3)) {
    try {
      const content = fs.readFileSync(path.join(ROOT, rel), "utf8");
      const fm = parseFrontmatter(content);
      const h1 = content.match(/^#\s+(.+)$/m);
      const title = fm.title || (h1 ? h1[1].trim() : path.basename(rel, ".md"));
      const open = [];
      for (const line of content.split("\n")) {
        if (!/^\|\s*T\d{3}\s*\|/.test(line) || line.includes("✅")) continue;
        const taskText = (line.split("|").map((c) => c.trim())[4] || "").replace(/\*\*/g, "");
        if (!taskText) continue;
        open.push(truncateText(taskText, 80));
        if (open.length >= 3) break;
      }
      out.push({ title, path: rel, open });
    } catch {}
  }
  return out;
}

function scanBlockers() {
  const dir = path.join(ROOT, "Sessions", "Active", "End");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join("Sessions", "Active", "End", f))
    .sort((a, b) => fs.statSync(path.join(ROOT, b)).mtime - fs.statSync(path.join(ROOT, a)).mtime);
  if (!files.length) return [];
  const content = fs.readFileSync(path.join(ROOT, files[0]), "utf8");
  const m = content.match(/^blockers:\s*\n((?:^\s+-\s+.+\n?)+)/m);
  if (!m) return [];
  return m[1].split("\n")
    .map((l) => l.replace(/^\s+-\s+/, "").trim())
    .filter((l) => l && !/none|structural|transient|^—$/i.test(l));
}

/**
 * Gate A — overdue outreach follow-ups (Outreach Entity spec §6).
 *
 * A record is OVERDUE when it is `sent` and its `follow_up_at` is in the past.
 * `dormant` is EXCLUDED by design (spec §4.2): dormant is parked deliberately,
 * never lost — it still renders on the board, but it must never count as overdue.
 */
function scanOverdueOutreach() {
  let dir;
  try {
    dir = path.join(ROOT, P.outreachDir());
  } catch {
    return []; // no period resolved — degrade quietly, never crash the brief
  }
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    let fm;
    try {
      fm = parseFrontmatter(fs.readFileSync(path.join(dir, f), "utf8"));
    } catch {
      continue;
    }
    // only `sent` carries the overdue clock; `dormant` is deliberately excluded
    if (String(fm.status || "").trim() !== "sent") continue;
    const due = String(fm.follow_up_at || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) continue;
    if (due >= DATE) continue;
    const days = Math.round((Date.parse(DATE) - Date.parse(due)) / 86400000);
    const who = fm.counterparty || f.replace(/\.md$/, "");
    const next = fm.next_action ? ` — ${String(fm.next_action).split(".")[0]}` : "";
    out.push({ due, line: `⏰ OVERDUE ${days}d — follow up with **${who}** (due ${due})${next}` });
  }
  return out.sort((a, b) => a.due.localeCompare(b.due)).map((o) => o.line);
}

function scanInsights() {
  const root = path.join(ROOT, "Insights");
  if (!fs.existsSync(root)) return [];
  const files = [];
  const walk = (rel) => {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) return;
    for (const e of fs.readdirSync(full, { withFileTypes: true })) {
      const sub = path.join(rel, e.name);
      if (e.isDirectory()) walk(sub);
      else if (e.name.endsWith(".md")) files.push(sub);
    }
  };
  walk("Insights");
  files.sort((a, b) => fs.statSync(path.join(ROOT, b)).mtime - fs.statSync(path.join(ROOT, a)).mtime);
  const bullets = [];
  for (const f of files) {
    if (bullets.length >= 3) break;
    const lines = fs.readFileSync(path.join(ROOT, f), "utf8")
      .split("\n").map((l) => l.trim()).filter((l) => l.startsWith("- "));
    for (let i = lines.length - 1; i >= 0 && bullets.length < 3; i--) {
      bullets.push(truncateText(lines[i].slice(2), 140));
    }
  }
  return bullets;
}

/**
 * Find the newest Cycle/Week that actually holds content — layout-agnostic.
 *
 * Replaces the old "highest `Cycle N` directory at the Artifacts root" heuristic,
 * which broke the moment a Period level was introduced (and, on rollover, would
 * still report the previous period's Cycle 7). Walks directories only, bounded.
 */
function detectLatestCycleWeek() {
  let best = { cycle: 1, week: 1 };
  const walk = (rel, depth) => {
    if (depth > 3) return;
    let entries;
    try {
      entries = fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const sub = `${rel}/${e.name}`;
      const cw = parseCyclePath(sub);
      if (cw) {
        const c = parseInt(cw.cycle, 10);
        const w = cw.week ? parseInt(cw.week, 10) : 1;
        if (c > best.cycle || (c === best.cycle && w > best.week)) best = { cycle: c, week: w };
      }
      walk(sub, depth + 1);
    }
  };
  walk("Artifacts", 0);
  return best;
}

function getTopHubs() {
  const db = path.join(ROOT, "Memory", "knowledge-graph.db");
  if (!fs.existsSync(db)) return [];
  try {
    // Reads the FULL graph (Memory/knowledge-graph.db) — stable week-to-week
    // so the injected hubs don't churn with the current-week window.
    const out = execFileSync(
      "node", [path.join(ROOT, "Tools", "knowledge-graph.js"), "--hubs"],
      { encoding: "utf8", timeout: 8000, stdio: ["ignore", "pipe", "pipe"] }
    );
    const hubs = [];
    for (const line of out.split("\n")) {
      const m = line.match(/^\s+(.+?)\s+\((\d+) connections\)/);
      if (m) {
        const clean = m[1].replace(/\x1b\[[0-9;]*m/g, "").trim();
        hubs.push(`${clean} (${m[2]})`);
      }
      if (hubs.length >= 5) break;
    }
    return hubs;
  } catch {
    return [];
  }
}

function pendingBBombs(entries, days) {
  const candidates = entries
    .filter((e) => e.path.startsWith("Artifacts/") && withinDays(e.date || e.modified, days))
    .filter((e) => e.b_bomb_candidate);
  if (!candidates.length) return [];
  const promoted = new Set(
    entries.filter((e) => e.path.startsWith("B-Bombs/")).map((e) => normalizeTitle(e.title))
  );
  return candidates.filter((c) => {
    const sig = normalizeTitle(c.title);
    for (const p of promoted) {
      if (p && sig && (p.includes(sig) || sig.includes(p))) return false;
    }
    return true;
  });
}

function generateVaultContext({ cycle, week, entries, days }) {
  const L = [];
  const none = "— none —";

  L.push("# 🦸 Vault Context", "", `> Cycle ${cycle} · Week ${week} · Generated ${NOW}`, "");

  L.push("## 🎯 Active Mission", "");
  const tasklists = scanActiveTasklists();
  if (tasklists.length) {
    for (const tl of tasklists) {
      L.push(`- [[${tl.path}|${tl.title}]]`);
      if (tl.open.length) for (const t of tl.open) L.push(`  - ${t}`);
      else L.push(`  - ${none}`);
    }
  } else {
    L.push(`- ${none}`);
  }
  L.push("");

  L.push("## 🧱 Unresolved Blockers", "");
  // Gate A (Outreach Entity spec §6): overdue follow-ups render FIRST — they are
  // the only blockers carrying an external clock, and the outside loop only
  // closes if it surfaces here. Fed by the empty socket, no new UI invented.
  const blockers = [...scanOverdueOutreach(), ...scanBlockers()];
  if (blockers.length) for (const b of blockers) L.push(`- ${b}`);
  else L.push(`- ${none}`);
  L.push("");

  L.push("## 💣 Pending B-Bombs", "");
  const pending = pendingBBombs(entries, days);
  if (pending.length) for (const p of pending) L.push(`- [[${p.path}|${p.title}]]`);
  else L.push(`- ${none} *(flag an Artifact with \`b_bomb_candidate: true\` to surface it here)*`);
  L.push("");

  L.push("## 🆕 Recent Artifacts", "");
  const recent = entries
    .filter((e) => e.path.startsWith("Artifacts/") && withinDays(e.date || e.modified, days))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  if (recent.length) {
    const cap = 12;
    for (const a of recent.slice(0, cap)) L.push(`- [[${a.path}|${a.title}]] — ${truncateText(a.summary, 80)}`);
    if (recent.length > cap) L.push(`- …and ${recent.length - cap} more (last ${days} days)`);
  } else {
    L.push(`- ${none}`);
  }
  L.push("");

  L.push("## 🧠 Recent Insights", "");
  const insights = scanInsights();
  if (insights.length) for (const ins of insights) L.push(`- ${ins}`);
  else L.push(`- ${none}`);
  L.push("");

  L.push("## 🔗 Cross-Focus Connections", "");
  const hubs = getTopHubs();
  if (hubs.length) for (const h of hubs) L.push(`- ${h}`);
  else L.push(`- ${none} *(build the graph: \`node Tools/knowledge-graph.js --build\`)*`);
  L.push("");

  L.push("## 📚 Memory Map", "");
  L.push("- [[Memory/index.md|memory index]] · [[Memory/lessons.md|lessons]] · [[Memory/vault-full.md|full index (search)]] · [[Memory/vault-index.md|graph index]]");
  L.push("");

  L.push("---", "*Generated by Vault Index — Deep Ultra 🦸. TWABAM ⚡!*");
  return L.join("\n") + "\n";
}

function generateVaultLog(entries, prevLogContent) {
  const prevEntries = prevLogContent
    ? prevLogContent.match(/-\s\[(.*?)\]\s(.*?)\s—\s(.*?)(?=\n-\s\[|$)/g)
    : [];

  let md = "";
  md += "# 🗓️ Vault Log — Chronological\n\n";
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

  md += "\n---\n*Generated by Vault Index — Deep Ultra 🦸.*\n";
  return md;
}

// — Main ——————————————————————————————————————————————————————————————————
function main() {
  console.log("\x1b[1;36m╔══════════════════════════════════╗\x1b[0m");
  console.log("\x1b[1;36m║  🧠 Vault Index — Vault Awareness   ║\x1b[0m");
  console.log("\x1b[1;36m╚══════════════════════════════════╝\x1b[0m\n");

  const quick = process.argv.includes("--quick");
  const verbose = process.argv.includes("--verbose");
  const currentMode = process.argv.includes("--current");
  const okfCheck = process.argv.includes("--okf-check");
  const okfInit = process.argv.includes("--okf-init");
  const daysIdx = process.argv.indexOf("--days");
  const days = daysIdx > -1 ? parseInt(process.argv[daysIdx + 1], 10) : null;

  fs.mkdirSync(VAULT_DIR, { recursive: true });

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
      "Projects/Agents Terminal V3/Agents Terminal V3 — Specification.md",
    ];

    // Determine cycle and week
    const ci = process.argv.indexOf("--cycle");
    const wi = process.argv.indexOf("--week");
    // Detect the current cycle/week by PARSING the tree, not by max-directory guessing.
    // The old "highest Cycle N under Artifacts" heuristic is the exact bug class this
    // refactor removes: after a period rollover it would still report Cycle 7 and
    // silently mis-brief every session.
    const detected = detectLatestCycleWeek();
    const cycle = ci > -1 ? process.argv[ci + 1] : String(detected.cycle);
    const thisWeek = parseInt(wi > -1 ? process.argv[wi + 1] : String(detected.week));
    const prevWeek = Math.max(1, thisWeek - 1);

    log("current", `Cycle ${cycle}, Week ${thisWeek} (prev: ${prevWeek})`);

    // Scan weekly directories — resolved through the contract (works pre- and post-migration)
    const thisWeekDirs = [
      P.resolve(P.artifactDir(cycle, thisWeek)),
      P.resolve(P.bBombDir(cycle, thisWeek)),
      P.resolve(P.artifactDir(cycle, prevWeek)),
      P.resolve(P.bBombDir(cycle, prevWeek)),
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
      P.resolve(P.episodicDir(cycle, thisWeek)),
      P.resolve(P.episodicDir(cycle, prevWeek)),
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

    const briefDays = days || 14;

    // Current-window graph source (Option A: machine table, read by --build-current)
    const currentLabel = `Current window — Cycle ${cycle}, Weeks ${prevWeek}-${thisWeek} (graph node/edge source)`;
    fs.writeFileSync(
      path.join(VAULT_DIR, "vault-index-current.md"),
      generateVaultIndex(unique, currentLabel)
    );
    log("write", `vault-index-current.md → ${unique.length} entries (graph current source)`);

    // Agent-facing session brief (read-always; never parsed by the graph)
    const brief = generateVaultContext({ cycle, week: thisWeek, entries: unique, days: briefDays });
    fs.writeFileSync(path.join(VAULT_DIR, "vault-context.md"), brief);
    log("write", `vault-context.md → ${brief.split("\n").length} lines (session brief)`);

    console.log(`\n\x1b[1;32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
    console.log(`\x1b[1;32m  🧠 Vault Context + Graph Source Generated\x1b[0m`);
    console.log(`\x1b[1;32m  ${unique.length} files — Cycle ${cycle}, Weeks ${prevWeek}–${thisWeek}\x1b[0m`);
    console.log(`\x1b[1;32m  → Memory/vault-context.md (session brief)\x1b[0m`);
    console.log(`\x1b[1;32m  → Memory/vault-index-current.md (graph current source)\x1b[0m`);
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

  // Generate Tier 1 index (graph node/edge source)
  const tier1Full = tierResults["1"] || [];
  let tier1IndexData = tier1Full;

  // Retention: with --days N, the graph index keeps only the last N days of
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

  const idx1 = generateVaultIndex(tier1IndexData, "Graph node/edge source — read by knowledge-graph.js --build");
  const idx1Path = path.join(VAULT_DIR, "vault-index.md");
  fs.writeFileSync(idx1Path, idx1);
  log("write", `vault-index.md → ${tier1IndexData.length} entries (Tier 1 only)`);

  // Generate full index (all tiers, searchable)
  if (!quick) {
    const allData = Object.values(tierResults).flat();
    const deduped = [];
    const seen = new Set();
    for (const e of allData) {
      if (!seen.has(e.path)) { seen.add(e.path); deduped.push(e); }
    }
    const idxFull = generateVaultIndex(deduped, "Full search index — all tiers (search on demand)");
    const idxFullPath = path.join(VAULT_DIR, "vault-full.md");
    fs.writeFileSync(idxFullPath, idxFull);
    log("write", `vault-full.md → ${deduped.length} entries (all tiers)`);
  }

  // Generate log
  const logPath = path.join(VAULT_DIR, "vault-log.md");
  const prevLog = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : null;
  const allEntries = Object.values(tierResults).flat();
  const logMd = generateVaultLog(allEntries, prevLog);
  fs.writeFileSync(logPath, logMd);
  log("write", `vault-log.md → ${allEntries.length} files indexed`);

  // Summary
  console.log(`\n\x1b[1;32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
  console.log(`\x1b[1;32m  🧠 Vault Index Complete\x1b[0m`);
  console.log(`\x1b[1;32m  ${totalScanned} total files scanned\x1b[0m`);
  for (const [tierNum, data] of Object.entries(tierResults)) {
    const t = TIERS[tierNum];
    console.log(`\x1b[1;32m  Tier ${tierNum}: ${data.length} files — ${t.label}\x1b[0m`);
  }
  console.log(`\x1b[1;32m  → Memory/vault-index.md (graph node/edge source)\x1b[0m`);
  console.log(`\x1b[1;32m  → Memory/vault-full.md (search on demand)\x1b[0m`);
  console.log(`\x1b[1;32m  → Memory/vault-log.md (append-only audit)\x1b[0m`);
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

  console.log(`\n  Fix: \x1b[1;33mnode Tools/vault-index.js --okf-init\x1b[0m\n`);
  console.log(`\x1b[1;33m  TWABAM ⚡!\x1b[0m\n`);
}

function okfInitConformance() {
  log("okf", "Adding Open Knowledge Format 'type' fields to vault...");
  const files = [];
  okfWalkFiles(".", files);

  let updated = 0, skipped = 0;
  for (const f of files) {
    if (f.fm.type) { skipped++; continue; }

    // Auto-detect type from path (parsed, never layout-matched)
    let inferredType = "document";
    const cw = parseCyclePath(f.path);
    if (cw && f.path.startsWith("Artifacts/")) inferredType = "artifact";
    else if (cw && f.path.startsWith("B-Bombs/")) inferredType = "b-bomb";
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
  console.log(`\n  Verify: \x1b[1;33mnode Tools/vault-index.js --okf-check\x1b[0m`);
  console.log(`\n\x1b[1;33m  TWABAM ⚡!\x1b[0m\n`);
}

main();
