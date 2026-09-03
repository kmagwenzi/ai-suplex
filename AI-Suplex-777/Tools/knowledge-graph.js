#!/usr/bin/env node

/**
 * graph.js — AI-Suplex Knowledge Graph
 *
 * SQLite-backed knowledge graph that reads from LLM Wiki output
 * and enables typed, bidirectional entity relationship queries.
 *
 * Usage: node Tools/graph.js <command> [--param value ...]
 *
 * Commands:
 *   --build             Full graph from Memory/wiki-index.md
 *   --build-current     Current week graph from Memory/wiki-current.md
 *   --query <term>      Entity search + all relationships
 *   --path <A> <B>      Shortest path between two entities
 *   --hubs              Top 10 most-connected entities
 *   --orphans           Entities with zero relationships
 *   --export-markdown   Write Memory/graph/ as markdown files
 *   --status            Entity/relationship counts
 */

const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const VAULT_ROOT = path.join(__dirname, "..");
const DB_PATH = path.join(VAULT_ROOT, "Memory", "graph.db");
const GRAPH_DIR = path.join(VAULT_ROOT, "Memory", "graph");
const WIKI_INDEX = path.join(VAULT_ROOT, "Memory", "wiki-index.md");
const WIKI_CURRENT = path.join(VAULT_ROOT, "Memory", "wiki-current.md");

// ── UTILS ──────────────────────────────────────────────

const KITTY = "\n  \\x1b[1;33m╔══════════════════════════════╗\x1b[0m\n  \\x1b[1;33m║                         🦸  ║\x1b[0m\n  \\x1b[1;33m╚══════════════════════════════╝\x1b[0m\n";

function log(label, msg) {
  console.log(`\x1b[1;32m[graph ${label}]\x1b[0m ${msg}`);
}

function warn(msg) {
  console.error(`\x1b[1;33m[graph warn]\x1b[0m ${msg}`);
}

function error(msg) {
  console.error(`\x1b[1;31m[graph error]\x1b[0m ${msg}`);
  process.exit(1);
}

function readMarkdown(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    error(`Cannot read: ${filePath}`);
  }
}

function writeMarkdown(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
}

function logToFile(detail) {
  const logFile = path.join(VAULT_ROOT, "Memory", "graph", "log.md");
  const now = new Date().toISOString();
  const entry = `- **${now}** — ${detail}\n`;
  const dir = path.dirname(logFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(logFile, entry);
}

// ── SECTION → TYPE MAPPING ─────────────────────────────

const SECTION_TYPE_MAP = {
  "artifacts": "artifact",
  "b-bombs": "b-bomb",
  "memory": "memory",
  "memory — episodic": "episodic",
  "memory — procedural": "procedural",
  "memory — semantic": "semantic",
  "sessions": "session",
  "tasklists": "tasklist",
  "agents terminal": "specification",
  "plans": "plan",
  "skills": "skill",
  "prompt patterns": "pattern",
  "projects": "project",
  "insights": "insight",
  "reviews": "review",
  "mocs": "moc",
  "trackers": "tracker",
};

function classifyType(sectionHeader) {
  if (!sectionHeader) return "artifact";
  const key = sectionHeader.replace(/^##\s*/, "").trim().toLowerCase();
  // Strip "Active — " prefix for Sessions
  const clean = key.replace(/^active\s*[—-]\s*/, "").replace(/^archive\s*[—-]\s*/, "");
  return SECTION_TYPE_MAP[clean] || "artifact";
}

// ── MARKDOWN PARSER ────────────────────────────────────

/**
 * Parse a wiki table row line.
 * Format: | [Title](path) | date | focus | summary (may contain |) |
 *
 * Uses two-stage extraction: match the link first,
 * then split the remaining columns from the right.
 */
function parseTableLine(line, section) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;

  // Match [Title](path)
  const linkMatch = trimmed.match(/^\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|/);
  if (!linkMatch) return null;

  const title = linkMatch[1].trim();
  const filePath = linkMatch[2].trim();

  // Everything after the link column, up to the trailing |
  let rest = trimmed.slice(linkMatch[0].length);
  const lastPipe = rest.lastIndexOf("|");
  if (lastPipe === -1) return null;
  rest = rest.slice(0, lastPipe).trim();

  // Split by pipe — date and focus are always the first two columns
  const cols = rest.split("|").map(s => s.trim());
  if (cols.length < 2) return null;

  const date = cols[0] === "—" || !cols[0] ? null : cols[0];
  const focus = cols[1] === "—" || !cols[1] ? null : cols[1];
  // Everything after focus is the summary (rejoined with |)
  const summary = cols.length > 2 ? cols.slice(2).join(" | ").trim() : "";

  // Extract cycle/week from path
  const cw = extractCycleWeek(filePath);

  return {
    title,
    path: filePath,
    type: classifyType(section),
    focus,
    cycle: cw.cycle,
    week: cw.week,
    date,
    summary: summary ? summary.slice(0, 200) : "",
    section,
  };
}

function extractCycleWeek(filePath) {
  // Artifacts/Cycle 1/Week 4/... → cycle 1, week 4
  const cwMatch = filePath.match(/Cycle\s+(\d+)\/Week\s+(\d+)/i);
  if (cwMatch) return { cycle: cwMatch[1], week: cwMatch[2] };
  // Memory/episodic/Cycle-1/Week-4/...
  const altMatch = filePath.match(/Cycle-(\d+)\/Week-(\d+)/i);
  if (altMatch) return { cycle: altMatch[1], week: altMatch[2] };
  return { cycle: null, week: null };
}

/**
 * Parse Entity Tags section from wiki markdown.
 * Format: - **#tag** — entity1, entity2, entity3 (+N more)
 */
function parseEntityTags(content) {
  const tags = {};
  // Find the Entity Tags section
  const sectionMatch = content.match(/##\s*🏷️\s*Entity Tags\n\n([\s\S]*?)(?:\n---|\n\*Generated|\n##\s|\n$|$)/);
  if (!sectionMatch) return tags;

  const tagBlock = sectionMatch[1];
  const lines = tagBlock.split("\n");

  for (const line of lines) {
    const match = line.match(/^\s*-\s*\*\*(#[^*]+)\*\*\s*[—-]\s*(.+)/);
    if (!match) continue;

    const tag = match[1].trim();
    const rawEntities = match[2].trim();

    // Split by comma, strip "(+N more)" suffix
    const entities = rawEntities
      .split(",")
      .map(e => e.replace(/\s*\(\+\d+\s*more\)\s*$/, "").trim())
      .filter(Boolean);

    if (entities.length > 0) {
      tags[tag] = entities;
    }
  }

  return tags;
}

/**
 * Parse the full wiki markdown. Returns { entities, sections }.
 *
 * entities: array of {title, path, type, focus, cycle, week, date, summary, section}
 * Two-pass:
 *   Pass 1 — extract all table rows with their parent section header.
 */
function parseWikiMarkdown(content) {
  const lines = content.split("\n");
  const entities = [];
  let currentSection = null;

  for (const line of lines) {
    // Track current section header
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      currentSection = h2Match[1].trim();
      continue;
    }

    // Skip non-table lines inside sections
    if (!line.trim().startsWith("| [")) continue;

    const entity = parseTableLine(line, currentSection);
    if (entity) entities.push(entity);
  }

  return entities;
}

// ── RELATIONSHIP DETECTION ─────────────────────────────

/**
 * Detect relationship type between two entities.
 *
 * Priority: supersedes > references > contains > relates_to
 */
function detectRelationship(e1, e2, sharedEvidence) {
  // Version supersedes: V[N] supersedes V[N-1] with same project root
  const vMatch1 = e1.title.match(/\bV(\d+)\b/i);
  const vMatch2 = e2.title.match(/\bV(\d+)\b/i);
  if (vMatch1 && vMatch2) {
    const v1 = parseInt(vMatch1[1]);
    const v2 = parseInt(vMatch2[1]);
    // Check if they share a project name (same title minus version)
    const base1 = e1.title.replace(/\s*V\d+\s*/i, "").trim().toLowerCase();
    const base2 = e2.title.replace(/\s*V\d+\s*/i, "").trim().toLowerCase();
    if (base1 === base2 && v1 > v2) {
      return { type: "supersedes", strength: 4, evidence: sharedEvidence, direction: "e1→e2" };
    }
    if (base1 === base2 && v2 > v1) {
      return { type: "supersedes", strength: 4, evidence: sharedEvidence, direction: "e2→e1" };
    }
  }

  // Path-based containment: if e1's path is a parent directory of e2's
  if (e1.path && e2.path) {
    const d1 = path.dirname(e1.path);
    const d2 = path.dirname(e2.path);
    // Same Cycle/Week directory
    if (d1 === d2 && e1.path !== e2.path) {
      // Just co-occurring — handled by section grouping
    }
    // Check explicit containment: e2's path starts with e1's path (parent dir)
    if (d2.startsWith(path.dirname(e1.path)) && d1 !== d2) {
      return { type: "contains", strength: 3, evidence: sharedEvidence };
    }
  }

  // Summary cross-reference: e1's summary mentions e2's title keywords
  if (e1.summary && e2.title) {
    const titleWords = e2.title.split(/\s+/).filter(w => w.length >= 4);
    const significantWords = titleWords.filter(w =>
      !["this", "that", "with", "from", "what", "when", "your", "over", "into"].includes(w.toLowerCase())
    );
    if (significantWords.length >= 2) {
      const allPresent = significantWords.every(w =>
        e1.summary.toLowerCase().includes(w.toLowerCase())
      );
      if (allPresent) {
        return { type: "references", strength: 2, evidence: `${e1.path} mentions ${e2.title}` };
      }
    }
  }

  // Default: co-occurrence from shared section
  return { type: "relates_to", strength: 1, evidence: sharedEvidence };
}

/**
 * Build relationships from parsed entities grouped by section.
 * Two-pass: section co-occurrence (pass 1), then cross-section
 * from shared Entity Tags (pass 2).
 */
function buildRelationships(entities, entityTags) {
  const relationships = [];
  const seen = new Set();

  function key(srcId, tgtId, type) {
    return `${srcId}|${tgtId}|${type}`;
  }

  function pushRel(e1, e2, evidence) {
    const rel = detectRelationship(e1, e2, evidence);
    const k = key(e1.id, e2.id, rel.type);
    if (seen.has(k)) return;
    seen.add(k);
    const srcId = rel.direction === "e2→e1" ? e2.id : e1.id;
    const tgtId = rel.direction === "e2→e1" ? e1.id : e2.id;
    relationships.push({
      source_id: srcId,
      target_id: tgtId,
      type: rel.type,
      strength: rel.strength,
      evidence: rel.evidence,
    });
    seen.add(key(e2.id, e1.id, rel.type));
  }

  // Pass 1: section-based co-occurrence
  const bySection = {};
  for (const e of entities) {
    const sec = e.section || "__none__";
    if (!bySection[sec]) bySection[sec] = [];
    bySection[sec].push(e);
  }

  // Cap per-section pair explosion: for sections >15 entities, use a
  // sliding window (adjacent ±7) instead of O(n²) all-pairs.
  const MAX_PAIRS_PER_SECTION = 15;
  const WINDOW_SIZE = 7;

  for (const [section, sectionEntities] of Object.entries(bySection)) {
    sectionEntities.sort((a, b) => a.title.localeCompare(b.title));
    const evidence = `Same section: ${section}`;
    const n = sectionEntities.length;

    if (n <= MAX_PAIRS_PER_SECTION) {
      // Small section: all-pairs is fine
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          pushRel(sectionEntities[i], sectionEntities[j], evidence);
        }
      }
    } else {
      // Large section: sliding window to keep it O(n * window)
      for (let i = 0; i < n; i++) {
        const end = Math.min(i + 1 + WINDOW_SIZE, n);
        for (let j = i + 1; j < end; j++) {
          pushRel(sectionEntities[i], sectionEntities[j], evidence);
        }
      }
    }
  }

  // Pass 2: cross-section from shared Entity Tags
  if (entityTags && Object.keys(entityTags).length > 0) {
    // Build title → entity lookup
    const titleMap = {};
    for (const e of entities) {
      titleMap[e.title.toLowerCase()] = e;
    }

    for (const [tag, titles] of Object.entries(entityTags)) {
      const matched = titles
        .map(t => titleMap[t.toLowerCase()])
        .filter(Boolean)
        .sort((a, b) => a.title.localeCompare(b.title));

      const n = matched.length;
      // Cap large tag groups with a sliding window
      const tagWindow = n <= 15 ? n : 8;

      for (let i = 0; i < n; i++) {
        const end = Math.min(i + 1 + tagWindow, n);
        for (let j = i + 1; j < end; j++) {
          const relType = "relates_to";
          const k = key(matched[i].id, matched[j].id, relType);
          if (!seen.has(k)) {
            seen.add(k);
            relationships.push({
              source_id: matched[i].id,
              target_id: matched[j].id,
              type: relType,
              strength: 2,
              evidence: `Shared tag: ${tag}`,
            });
            seen.add(key(matched[j].id, matched[i].id, relType));
          }
        }
      }
    }
  }

  return relationships;
}

// ── SQLITE SCHEMA ──────────────────────────────────────

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS entities (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      path        TEXT NOT NULL UNIQUE,
      type        TEXT,
      focus       TEXT,
      cycle       TEXT,
      week        TEXT,
      date        TEXT,
      summary     TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS relationships (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id   INTEGER NOT NULL REFERENCES entities(id),
      target_id   INTEGER NOT NULL REFERENCES entities(id),
      type        TEXT NOT NULL,
      strength    INTEGER DEFAULT 1,
      evidence    TEXT,
      created_at  TEXT DEFAULT (datetime('now')),
      UNIQUE(source_id, target_id, type)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_id   INTEGER NOT NULL REFERENCES entities(id),
      tag         TEXT NOT NULL,
      UNIQUE(entity_id, tag)
    );

    CREATE TABLE IF NOT EXISTS logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      action      TEXT NOT NULL,
      detail      TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_entities_title ON entities(title);
    CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
    CREATE INDEX IF NOT EXISTS idx_entities_focus ON entities(focus);
    CREATE INDEX IF NOT EXISTS idx_rel_source ON relationships(source_id);
    CREATE INDEX IF NOT EXISTS idx_rel_target ON relationships(target_id);
    CREATE INDEX IF NOT EXISTS idx_tags_entity ON tags(entity_id);
    CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags(tag);
  `);
}

// ── BUILD ───────────────────────────────────────────────

function build(useCurrent) {
  const wikiPath = useCurrent ? WIKI_CURRENT : WIKI_INDEX;
  const wikiName = useCurrent ? "wiki-current.md" : "wiki-index.md";

  if (!fs.existsSync(wikiPath)) {
    error(`Wiki file not found: ${wikiPath}`);
  }

  console.log(KITTY);
  log("build", `📚 Knowledge Graph — Reading ${wikiName}...`);
  const content = readMarkdown(wikiPath);

  const parsed = parseWikiMarkdown(content);
  log("parse", `${parsed.length} entities extracted from tables`);

  // Parse entity tags from Entity Tags section (both wiki files have it)
  const entityTags = parseEntityTags(content);
  log("parse", `${Object.keys(entityTags).length} tag groups found in Entity Tags section`);

  // Ensure directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Open DB and create schema
  const db = new DatabaseSync(DB_PATH);
  createSchema(db);

  try {
  // Clear existing data + begin transaction
  db.exec("BEGIN");
  db.exec("DELETE FROM tags");
  db.exec("DELETE FROM relationships");
  db.exec("DELETE FROM entities");

  // Insert entities
  const insertEntity = db.prepare(`
    INSERT OR REPLACE INTO entities (title, path, type, focus, cycle, week, date, summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const entityIds = {};
  let inserted = 0;
  let skipped = 0;

  for (const e of parsed) {
    if (!e.title || !e.path) {
      skipped++;
      continue;
    }
    try {
      const result = insertEntity.run(
        e.title, e.path, e.type, e.focus,
        e.cycle, e.week, e.date, e.summary
      );
      e.id = Number(result.lastInsertRowid);
      entityIds[e.path] = e.id;
      inserted++;
    } catch (err) {
      warn(`Skipping ${e.title}: ${err.message}`);
      skipped++;
    }
  }

  log("insert", `${inserted} entities inserted, ${skipped} skipped`);

  // Build relationships
  const rels = buildRelationships(parsed, entityTags);

  const insertRel = db.prepare(`
    INSERT OR IGNORE INTO relationships (source_id, target_id, type, strength, evidence)
    VALUES (?, ?, ?, ?, ?)
  `);

  let relInserted = 0;
  for (const r of rels) {
    try {
      insertRel.run(r.source_id, r.target_id, r.type, r.strength, r.evidence);
      relInserted++;
    } catch (err) {
      // IGNORE handles duplicates
    }
  }

  log("rels", `${relInserted} relationships created`);

  // Insert tags from Entity Tags section (both wiki files have it)
  if (entityTags && Object.keys(entityTags).length > 0) {
    const insertTag = db.prepare(
      "INSERT OR IGNORE INTO tags (entity_id, tag) VALUES (?, ?)"
    );

    let tagInserted = 0;
    const titleMap = {};
    for (const e of parsed) {
      titleMap[e.title.toLowerCase()] = e.id;
    }

    for (const [tag, titles] of Object.entries(entityTags)) {
      for (const t of titles) {
        const entityId = titleMap[t.toLowerCase()];
        if (entityId) {
          try {
            insertTag.run(entityId, tag);
            tagInserted++;
          } catch { /* IGNORE */ }
        }
      }
    }

    log("tags", `${tagInserted} tag assignments created`);
  }

  // Commit transaction and log
  const relCount = db.prepare("SELECT COUNT(*) as c FROM relationships").get().c;
  db.exec(`INSERT INTO logs (action, detail) VALUES ('build', 'Built ${wikiName}: ${inserted} entities, ${relCount} relationships')`);
  db.exec("COMMIT");

  const detail = `Built ${wikiName}: ${inserted} entities, ${relCount} relationships`;
  log("done", detail);
  logToFile(detail);
  console.log(`\n  \x1b[1;33mTWABAM ⚡!\x1b[0m\n`);

  db.close();
  return true;
  } catch (err) {
    try { db.exec("ROLLBACK"); } catch {}
    try { db.close(); } catch {}
    error(`Build failed: ${err.message}`);
  }
}

// ── QUERY ───────────────────────────────────────────────

function queryGraph(term) {
  if (!fs.existsSync(DB_PATH)) {
    error("No graph found. Run --build or --build-current first.");
  }

  const db = new DatabaseSync(DB_PATH);

  const results = db.prepare(`
    SELECT * FROM entities
    WHERE title LIKE ? OR path LIKE ? OR summary LIKE ?
    ORDER BY date DESC
    LIMIT 10
  `).all(`%${term}%`, `%${term}%`, `%${term}%`);

  if (results.length === 0) {
    console.log(`\n  No entities found matching "${term}"\n`);
    db.close();
    return;
  }

  for (const ent of results) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`\x1b[1;33m${ent.title}\x1b[0m`);
    console.log(`  Path:     ${ent.path}`);
    console.log(`  Type:     ${ent.type || "—"}`);
    console.log(`  Focus:    ${ent.focus || "—"}`);
    console.log(`  Cycle:    ${ent.cycle || "—"} / Week ${ent.week || "—"}`);
    console.log(`  Date:     ${ent.date || "—"}`);
    if (ent.summary) console.log(`  Summary:  ${ent.summary.slice(0, 120)}...`);

    // Get related entities
    const related = db.prepare(`
      SELECT e.title, e.path, e.type,
             CASE WHEN r.source_id = ? THEN 'outgoing' ELSE 'incoming' END as direction,
             r.type as rel_type, r.strength, r.evidence
      FROM relationships r
      JOIN entities e ON (e.id = r.target_id AND r.source_id = ?)
         OR (e.id = r.source_id AND r.target_id = ?)
      WHERE (r.source_id = ? OR r.target_id = ?)
        AND e.id != ?
      ORDER BY r.strength DESC
      LIMIT 20
    `).all(ent.id, ent.id, ent.id, ent.id, ent.id, ent.id);

    if (related.length > 0) {
      console.log(`\n  \x1b[1;36mRelationships (${related.length}):\x1b[0m`);
      for (const r of related) {
        const dir = r.direction === "outgoing" ? "→" : "←";
        console.log(`    ${dir} \x1b[1;32m${r.title}\x1b[0m [${r.rel_type}] (${r.strength})`);
        console.log(`      ${r.path}`);
      }
    } else {
      console.log(`\n  \x1b[2mNo relationships found\x1b[0m`);
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  db.close();
}

// ── PATH FINDING ────────────────────────────────────────

function findPath(queryA, queryB) {
  if (!fs.existsSync(DB_PATH)) {
    error("No graph found. Run --build or --build-current first.");
  }

  const db = new DatabaseSync(DB_PATH);

  const findEntity = db.prepare(`
    SELECT * FROM entities WHERE title LIKE ? OR path LIKE ? OR summary LIKE ? LIMIT 1
  `);

  const entA = findEntity.get(`%${queryA}%`, `%${queryA}%`, `%${queryA}%`);
  const entB = findEntity.get(`%${queryB}%`, `%${queryB}%`, `%${queryB}%`);


  if (!entA) error(`Entity not found: "${queryA}"`);
  if (!entB) error(`Entity not found: "${queryB}"`);

  // BFS
  const getNeighbors = db.prepare(`
    SELECT e.id, e.title, e.path, r.type as rel_type, r.strength, r.evidence
    FROM relationships r
    JOIN entities e ON e.id = r.target_id
    WHERE r.source_id = ?
    UNION
    SELECT e.id, e.title, e.path, r.type as rel_type, r.strength, r.evidence
    FROM relationships r
    JOIN entities e ON e.id = r.source_id
    WHERE r.target_id = ?
  `);

  const visited = new Set();
  const queue = [{ id: entA.id, path: [] }];
  visited.add(entA.id);

  let foundPath = null;

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.id === entB.id) {
      foundPath = current.path;
      break;
    }

    const neighbors = getNeighbors.all(current.id, current.id);
    for (const n of neighbors) {
      if (!visited.has(n.id)) {
        visited.add(n.id);
        queue.push({
          id: n.id,
          path: [...current.path, {
            from: current.id,
            to: n.id,
            title: n.title,
            path: n.path,
            type: n.rel_type,
            strength: n.strength,
            evidence: n.evidence,
          }],
        });
      }
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`\x1b[1;33m${entA.title}\x1b[0m → \x1b[1;33m${entB.title}\x1b[0m`);

  if (!foundPath) {
    console.log(`  \x1b[2mNo path found\x1b[0m`);
  } else {
    console.log(`  Hops: ${foundPath.length}`);
    console.log();
    // Display the path
    let prevTitle = entA.title;
    for (const step of foundPath) {
      // Resolve the from-title
      const fromEnt = db.prepare("SELECT title FROM entities WHERE id = ?").get(step.from);
      const fromTitle = fromEnt ? fromEnt.title : "?";
      console.log(`  \x1b[1;32m${fromTitle}\x1b[0m —[\x1b[36m${step.type}\x1b[0m]→ \x1b[1;32m${step.title}\x1b[0m`);
    }
  }
  console.log(`\n${"─".repeat(60)}`);

  db.close();
}

// ── HUBS ────────────────────────────────────────────────

function showHubs() {
  if (!fs.existsSync(DB_PATH)) {
    error("No graph found. Run --build or --build-current first.");
  }

  const db = new DatabaseSync(DB_PATH);

  const hubs = db.prepare(`
    SELECT e.title, e.path, e.type, e.focus,
           COUNT(r.id) as connections
    FROM entities e
    LEFT JOIN relationships r ON r.source_id = e.id OR r.target_id = e.id
    GROUP BY e.id
    ORDER BY connections DESC
    LIMIT 10
  `).all();

  console.log(`\n\x1b[1;36mTop 10 Most-Connected Entities\x1b[0m`);
  console.log(`${"─".repeat(60)}`);

  for (const h of hubs) {
    console.log(`\n  \x1b[1;33m${h.title}\x1b[0m (${h.connections} connections)`);
    console.log(`  Type: ${h.type || "—"} | Focus: ${h.focus || "—"}`);
    console.log(`  ${h.path}`);
  }
  console.log();

  db.close();
}

// ── ORPHANS ─────────────────────────────────────────────

function showOrphans() {
  if (!fs.existsSync(DB_PATH)) {
    error("No graph found. Run --build or --build-current first.");
  }

  const db = new DatabaseSync(DB_PATH);

  const orphans = db.prepare(`
    SELECT e.title, e.path, e.type, e.focus
    FROM entities e
    LEFT JOIN relationships r ON r.source_id = e.id OR r.target_id = e.id
    WHERE r.id IS NULL
    ORDER BY e.title
  `).all();

  console.log(`\n\x1b[1;36mOrphan Entities (${orphans.length})\x1b[0m`);
  console.log(`${"─".repeat(60)}`);

  if (orphans.length === 0) {
    console.log("  None — all entities have relationships.");
  } else {
    for (const o of orphans) {
      console.log(`  \x1b[1;33m${o.title}\x1b[0m`);
      console.log(`  ${o.path}  ·  ${o.type || "—"}  ·  ${o.focus || "—"}`);
    }
  }
  console.log();

  db.close();
}

// ── STATUS ──────────────────────────────────────────────

function showStatus() {
  if (!fs.existsSync(DB_PATH)) {
    console.log("\n  No graph built yet. Run --build or --build-current first.\n");
    return;
  }

  const db = new DatabaseSync(DB_PATH);

  const entCount = db.prepare("SELECT COUNT(*) as c FROM entities").get();
  const relCount = db.prepare("SELECT COUNT(*) as c FROM relationships").get();
  const tagCount = db.prepare("SELECT COUNT(*) as c FROM tags").get();
  const lastBuild = db.prepare("SELECT * FROM logs ORDER BY id DESC LIMIT 1").get();

  const typeCounts = db.prepare(`
    SELECT type, COUNT(*) as c FROM entities GROUP BY type ORDER BY c DESC
  `).all();

  const focusCounts = db.prepare(`
    SELECT focus, COUNT(*) as c FROM entities WHERE focus IS NOT NULL GROUP BY focus ORDER BY c DESC
  `).all();

  const fileSize = fs.statSync(DB_PATH).size;
  const sizeKB = (fileSize / 1024).toFixed(1);

  console.log(`\n\x1b[1;36mKnowledge Graph Status\x1b[0m`);
  console.log(`${"─".repeat(60)}`);
  console.log(`  Entities:          ${entCount.c}`);
  console.log(`  Relationships:     ${relCount.c}`);
  console.log(`  Tags:              ${tagCount.c}`);
  console.log(`  DB Size:           ${sizeKB} KB`);
  console.log(`  Last Built:        ${lastBuild ? lastBuild.created_at : "—"}`);
  if (lastBuild) console.log(`  Detail:            ${lastBuild.detail}`);

  console.log(`\n  \x1b[1;33mBy Type:\x1b[0m`);
  for (const t of typeCounts) {
    const bar = "█".repeat(Math.min(t.c, 40));
    console.log(`    ${t.type.padEnd(15)} ${bar} ${t.c}`);
  }

  if (focusCounts.length > 0) {
    console.log(`\n  \x1b[1;33mBy Focus:\x1b[0m`);
    for (const f of focusCounts) {
      console.log(`    ${(f.focus || "—").padEnd(20)} ${f.c}`);
    }
  }

  console.log();

  db.close();
}

// ── EXPORT MARKDOWN ─────────────────────────────────────

function exportMarkdown() {
  if (!fs.existsSync(DB_PATH)) {
    error("No graph found. Run --build or --build-current first.");
  }

  const db = new DatabaseSync(DB_PATH);

  const entities = db.prepare("SELECT * FROM entities ORDER BY title").all();

  if (!fs.existsSync(GRAPH_DIR)) fs.mkdirSync(GRAPH_DIR, { recursive: true });

  // Build index
  let indexContent = `# 🧠 Knowledge Graph Index\n\n`;
  indexContent += `> Generated: ${new Date().toISOString()}\n`;
  indexContent += `> Entities: ${entities.length}\n\n`;

  const byType = {};
  for (const e of entities) {
    const t = e.type || "other";
    if (!byType[t]) byType[t] = [];
    byType[t].push(e);
  }

  for (const [type, typeEntities] of Object.entries(byType).sort()) {
    indexContent += `## ${type.charAt(0).toUpperCase() + type.slice(1)}\n\n`;
    for (const e of typeEntities) {
      const slug = slugify(e.title);
      indexContent += `- [${e.title}](graph/${slug}.md)\n`;
    }
    indexContent += "\n";
  }

  writeMarkdown(path.join(GRAPH_DIR, "index.md"), indexContent);
  log("export", "index.md written");

  // Write per-entity files
  let written = 0;
  const getRels = db.prepare(`
    SELECT e.title, e.path, e.type,
           r.type as rel_type, r.strength, r.evidence
    FROM relationships r
    JOIN entities e ON (e.id = r.target_id)
    WHERE r.source_id = ?
    UNION
    SELECT e.title, e.path, e.type,
           r.type as rel_type, r.strength, r.evidence
    FROM relationships r
    JOIN entities e ON (e.id = r.source_id)
    WHERE r.target_id = ?
    ORDER BY r.strength DESC
  `);

  for (const e of entities) {
    const rels = getRels.all(e.id, e.id);
    const slug = slugify(e.title);

    let content = `# ${e.title}\n\n`;
    content += `**Path:** ${e.path}\n`;
    content += `**Type:** ${e.type || "—"} | **Focus:** ${e.focus || "—"} | **Date:** ${e.date || "—"}\n`;
    if (e.cycle) content += `**Cycle:** ${e.cycle} / **Week:** ${e.week}\n`;
    content += `\n${e.summary || ""}\n\n`;

    if (rels.length > 0) {
      content += `## Relationships\n\n`;
      for (const r of rels) {
        content += `- **${r.rel_type}** → [${r.title}](${slugify(r.title)}.md) (strength: ${r.strength})\n`;
        if (r.evidence) content += `  - _${r.evidence}_\n`;
      }
    }

    writeMarkdown(path.join(GRAPH_DIR, `${slug}.md`), content);
    written++;
  }

  log("export", `${written} entity pages written to Memory/graph/`);
  log("done", `Exported ${written} entities to Memory/graph/`);

  db.close();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ── CLI ─────────────────────────────────────────────────

function showHelp() {
  console.log(`
\x1b[1;33mgraph\x1b[0m — AI-Suplex Knowledge Graph CLI

\x1b[1;36mCommands:\x1b[0m
  --build             Full graph from Memory/wiki-index.md
  --build-current     Current week graph from Memory/wiki-current.md
  --query <term>      Search entities + show relationships
  --path <A> <B>      Find shortest path between two entities
  --hubs              Top 10 most-connected entities
  --orphans           List entities with zero relationships
  --export-markdown   Export graph to Memory/graph/ as markdown
  --status            Entity/relationship counts + type breakdown

\x1b[1;36mExamples:\x1b[0m
  node Tools/graph.js --build-current
  node Tools/graph.js --query POTRAZ
  node Tools/graph.js --path "POTRAZ V6" "WQR"
  node Tools/graph.js --hubs
`);
}

// ── MAIN ────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length === 0) {
  showHelp();
  process.exit(0);
}

switch (args[0]) {
  case "--build":
    build(false);
    break;

  case "--build-current":
    build(true);
    break;

  case "--query":
    if (!args[1]) error("--query requires a search term");
    queryGraph(args[1]);
    break;

  case "--path":
    if (!args[1] || !args[2]) error("--path requires two entity names");
    findPath(args[1], args[2]);
    break;

  case "--hubs":
    showHubs();
    break;

  case "--orphans":
    showOrphans();
    break;

  case "--export-markdown":
    exportMarkdown();
    break;

  case "--status":
    showStatus();
    break;

  case "--help":
  case "-h":
    showHelp();
    break;

  default:
    console.log(`Unknown command: ${args[0]}`);
    showHelp();
    process.exit(1);
}
