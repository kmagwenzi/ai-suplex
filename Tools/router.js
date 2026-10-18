#!/usr/bin/env node
"use strict";

/**
 * router.js — recommend (never enforce) skills + tools for a task.
 * v2 scoring: stopword-filtered tokens + knowledge-graph expansion (0.5 weight),
 * weighted by quality. Logs the decision; runs nothing.
 * Spec: Projects/Skill & Tool Router — Design Spec.md §6 · §3 Phase 2.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INDEX = path.join(ROOT, "Skills", "index.json");
const MANIFEST = path.join(ROOT, "Tools", "manifest.json");
const LOG = path.join(ROOT, "Memory", "routing-log.md");
const GRAPH_DB = path.join(ROOT, "Memory", "knowledge-graph.db");

const STOP = new Set(["a","an","the","and","or","of","to","in","on","for","with","is","are","be","into","from","as","at","by","this","that","it","its","how","what","when","do","does","not","no","if","then","else","up","down","out","off","over","under","again","further","once","here","there","all","any","both","each","few","more","most","other","some","such","only","own","same","so","than","too","very","can","will","just","should","now","my","your","our","their"]);

function parseArgs(argv) {
  const a = { task: "", role: "", index: INDEX, manifest: MANIFEST, log: LOG, dry: false, json: false, graph: true, graphDb: GRAPH_DB };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === "--task") a.task = argv[++i] || "";
    else if (v === "--role") a.role = argv[++i] || "";
    else if (v === "--json") a.json = true;
    else if (v === "--dry") a.dry = true;
    else if (v === "--no-graph") a.graph = false;
    else if (v === "--graph-db") a.graphDb = path.resolve(argv[++i] || ".");
    else if (v === "--index") a.index = path.resolve(argv[++i] || ".");
    else if (v === "--manifest") a.manifest = path.resolve(argv[++i] || ".");
    else if (v === "--log") a.log = path.resolve(argv[++i] || ".");
  }
  return a;
}

function contentTokens(text) {
  return new Set(String(text).toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP.has(w)));
}

function graphTerms(dbPath, taskTokens) {
  if (!taskTokens || taskTokens.size === 0 || !fs.existsSync(dbPath)) return [];
  try {
    const { DatabaseSync } = require("node:sqlite");
    const db = new DatabaseSync(dbPath, { readOnly: true });
    const ids = new Set();
    for (const t of taskTokens) {
      const rows = db.prepare("SELECT id FROM entities WHERE lower(title) LIKE ?").all("%" + t.toLowerCase() + "%");
      for (const r of rows) ids.add(r.id);
    }
    if (ids.size === 0) { db.close(); return []; }
    const idArr = [...ids].slice(0, 50);
    const ph = idArr.map(() => "?").join(",");
    const related = new Set();
    const relRows = db.prepare("SELECT source_id, target_id FROM relationships WHERE source_id IN (" + ph + ") OR target_id IN (" + ph + ")").all(...idArr, ...idArr);
    for (const r of relRows) {
      if (!ids.has(r.source_id)) related.add(r.source_id);
      if (!ids.has(r.target_id)) related.add(r.target_id);
    }
    const terms = new Set();
    for (const rid of related) {
      const row = db.prepare("SELECT title FROM entities WHERE id = ?").get(rid);
      if (row) for (const w of contentTokens(row.title)) terms.add(w);
    }
    db.close();
    return [...terms].slice(0, 30);
  } catch (e) {
    return [];
  }
}

function matchCount(taskTokens, graphTerms, fields) {
  const fieldTokens = contentTokens(fields.join(" "));
  const taskMatch = [...taskTokens].filter(w => fieldTokens.has(w)).length;
  const graphMatch = [...graphTerms].filter(w => fieldTokens.has(w)).length;
  const denom = taskTokens.size + 0.5 * graphTerms.length;
  return denom ? (taskMatch + 0.5 * graphMatch) / denom : 0;
}

function matchedReasons(taskTokens, fields) {
  const fieldTokens = contentTokens(fields.join(" "));
  return [...taskTokens].filter(w => fieldTokens.has(w));
}

function recommend(args) {
  const taskTokens = contentTokens(args.task);
  if (taskTokens.size === 0) return { error: "empty task" };
  if (!fs.existsSync(args.index)) return { error: "Skills/index.json missing — run: node Tools/refresh-skill-index.js" };
  if (!fs.existsSync(args.manifest)) return { error: "Tools/manifest.json missing" };

  const skills = JSON.parse(fs.readFileSync(args.index, "utf8"));
  const tools = JSON.parse(fs.readFileSync(args.manifest, "utf8")).tools || [];
  const gTerms = args.graph ? graphTerms(args.graphDb, taskTokens) : [];

  const byId = {};
  for (const s of skills) byId[s.id] = s;

  const skillHits = skills
    .filter(s => s.status !== "deprecated")
    .map(s => {
      const fields = [s.description].concat(s.triggers || []);
      return { id: s.id, name: s.skill_name, score: matchCount(taskTokens, gTerms, fields) * (s.quality || 0.5), reasons: matchedReasons(taskTokens, fields), depends_on: s.depends_on || [] };
    })
    .filter(s => s.score > 0);

  const extra = [];
  for (const h of skillHits) {
    for (const dep of h.depends_on) {
      if (byId[dep] && !skillHits.some(x => x.id === dep) && !extra.some(x => x.id === dep)) {
        extra.push({ id: dep, name: byId[dep].skill_name, score: (byId[dep].quality || 0.5) * 0.5, reasons: ["dependency"], depends_on: [] });
      }
    }
  }

  const allSkills = skillHits.concat(extra)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 5);

  const toolHits = tools
    .map(t => {
      const fields = [t.description, t.purpose].concat(t.verbs || []);
      return { id: t.id, purpose: t.purpose, invocation: t.invocation, writes: !!t.writes, score: matchCount(taskTokens, gTerms, fields) * 0.8, reasons: matchedReasons(taskTokens, fields) };
    })
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 5);

  return { skills: allSkills, tools: toolHits, graph: gTerms.length };
}

function fmtText(r) {
  const lines = ["Recommended skills:"];
  if (r.skills.length === 0) lines.push("  (none)");
  r.skills.forEach((s, i) => lines.push("  " + (i + 1) + ". " + s.name + " (" + s.score.toFixed(2) + ") — " + (s.reasons.slice(0, 3).join(", ") || "")));
  lines.push("Recommended tools:");
  if (r.tools.length === 0) lines.push("  (none)");
  r.tools.forEach((t, i) => lines.push("  " + (i + 1) + ". " + t.id + (t.writes ? " [writes]" : " [read-only]") + " → " + t.invocation));
  if (r.graph) lines.push("(graph: " + r.graph + " related terms)");
  return lines.join("\n");
}

function appendLog(logPath, task, rec, chosen) {
  const header = "| ts | task | top_skills | top_tools | chosen_skill | chosen_tool | by |\n|---|---|---|---|---|---|---|\n";
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, "# 🧭 Routing Log\n\n> Recommend-only audit trail. Chosen columns fill only when the human/AI confirms.\n\n" + header);
  }
  const skills = rec.skills.map(s => s.name).join("; ") || "none";
  const tools = rec.tools.map(t => t.id).join("; ") || "none";
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  const esc = x => String(x).replace(/\|/g, "\\|").replace(/\n/g, " ");
  const row = "| " + ts + " | " + esc(task.slice(0, 60)) + " | " + esc(skills.slice(0, 80)) + " | " + esc(tools.slice(0, 80)) + " | " + chosen.skill + " | " + chosen.tool + " | " + chosen.by + " |\n";
  fs.appendFileSync(logPath, row);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.task) {
    console.error("usage: node Tools/router.js --task \"<text>\" [--role r] [--json] [--dry] [--no-graph]");
    process.exit(2);
  }
  const rec = recommend(args);
  if (rec.error) { console.error("router: " + rec.error); process.exit(2); }
  if (args.json) console.log(JSON.stringify(rec, null, 2));
  else console.log(fmtText(rec));
  if (!args.dry) appendLog(args.log, args.task, rec, { skill: "", tool: "", by: "" });
  if (rec.skills.length === 0 && rec.tools.length === 0) process.exit(1);
  process.exit(0);
}

main();
