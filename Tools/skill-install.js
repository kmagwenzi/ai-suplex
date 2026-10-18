#!/usr/bin/env node
"use strict";

/**
 * skill-install.js — find + install Community skills (gated).
 * Borrows the vercel-labs/skills source contract: owner/repo, URLs, local path.
 * Lands ONLY in Skills/Community/ (never the curated Skills/ root).
 * --preview plans; --add requires --confirm. Guardrails: size + file-count caps.
 * Spec §14.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const COMMUNITY = path.join(ROOT, "Skills", "Community");
const LOG = path.join(ROOT, "Memory", "routing-log.md");
const MAX_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 1000;

function parseArgs(argv) {
  const a = { mode: "", source: "", skill: "", confirm: false, community: COMMUNITY, log: LOG, maxBytes: MAX_BYTES, maxFiles: MAX_FILES };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === "--list" || v === "--preview" || v === "--add") { a.mode = v.slice(2); a.source = argv[++i] || ""; }
    else if (v === "--skill") a.skill = argv[++i] || "";
    else if (v === "--confirm") a.confirm = true;
    else if (v === "--community") a.community = path.resolve(argv[++i] || ".");
    else if (v === "--log") a.log = path.resolve(argv[++i] || ".");
    else if (v === "--max-bytes") a.maxBytes = Number(argv[++i]) || MAX_BYTES;
    else if (v === "--max-files") a.maxFiles = Number(argv[++i]) || MAX_FILES;
  }
  return a;
}

function slugOf(src) {
  let s = src.replace(/\/$/, "");
  if (/^https?:\/\//.test(s) || /^git@/.test(s)) s = s.split("/").pop().replace(/\.git$/, "");
  else if (/^[\w.-]+\/[\w.-]+$/.test(s)) s = s.split("/").pop();
  else s = path.basename(s);
  s = s.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return s || "skill";
}

function resolveSource(src) {
  if (fs.existsSync(src) && fs.statSync(src).isDirectory()) {
    return { dir: src, cleanup: null, slug: slugOf(src) };
  }
  let url = src;
  if (/^[\w.-]+\/[\w.-]+$/.test(src) && !/^https?:\/\//.test(src)) url = "https://github.com/" + src + ".git";
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sinst-"));
  const r = spawnSync("git", ["clone", "--depth", "1", url, tmp], { encoding: "utf8", timeout: 120000 });
  if (r.status !== 0) return { error: "clone failed: " + (r.stderr || "").split("\n")[0] };
  return { dir: tmp, cleanup: tmp, slug: slugOf(src) };
}

function findSkills(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { continue; }
    for (const e of entries) {
      if (e.name === ".git" || e.name === "node_modules") continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.name.toLowerCase() === "skill.md") out.push(p);
    }
  }
  return out;
}

function skillMeta(skillMdPath) {
  const dir = path.dirname(skillMdPath);
  const text = fs.readFileSync(skillMdPath, "utf8");
  const nm = text.match(/^name:\s*(.+)$/m);
  const ds = text.match(/^description:\s*(.+)$/m);
  return {
    dir,
    name: (nm ? nm[1].trim() : path.basename(dir)),
    description: ds ? ds[1].trim() : "",
  };
}

function collectFiles(dir) {
  const files = [];
  let bytes = 0;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { continue; }
    for (const e of entries) {
      if (e.name === ".git" || e.name === "node_modules") continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else { files.push(p); bytes += fs.statSync(p).size; }
    }
  }
  return { files, bytes };
}

function pick(metaList, skillName) {
  if (!skillName) return metaList;
  const want = skillName.toLowerCase();
  const hits = metaList.filter(m => m.name.toLowerCase() === want || path.basename(m.dir).toLowerCase() === want);
  return hits.length ? hits : [];
}

function copySkill(skillDir, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(skillDir, dest, {
    recursive: true,
    filter: (src) => !src.split(path.sep).includes(".git") && !src.split(path.sep).includes("node_modules"),
  });
}

function appendLog(logPath, slug, action) {
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, "# 🧭 Routing Log\n\n> Recommend-only audit trail. Chosen columns fill only when the human/AI confirms.\n\n| ts | task | top_skills | top_tools | chosen_skill | chosen_tool | by |\n|---|---|---|---|---|---|---|\n");
  }
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  const row = "| " + ts + " | install " + slug + " |  | skill-install | " + slug + " | " + action + " | hustler |\n";
  fs.appendFileSync(logPath, row);
}

function main() {
  const a = parseArgs(process.argv.slice(2));
  if (!a.mode || !a.source) {
    console.error("usage: node Tools/skill-install.js (--list | --preview | --add) <source> [--skill n] [--confirm]");
    process.exit(2);
  }
  const src = resolveSource(a.source);
  if (src.error) { console.error("skill-install: " + src.error); process.exit(2); }
  const metas = findSkills(src.dir).map(skillMeta);
  if (metas.length === 0) { console.error("skill-install: no SKILL.md found in " + a.source); if (src.cleanup) fs.rmSync(src.cleanup, { recursive: true, force: true }); process.exit(1); }

  if (a.mode === "list") {
    metas.forEach(m => console.log("  • " + m.name + (m.description ? " — " + m.description.slice(0, 80) : "")));
    if (src.cleanup) fs.rmSync(src.cleanup, { recursive: true, force: true });
    return;
  }

  const picked = pick(metas, a.skill);
  if (picked.length === 0) { console.error("skill-install: no skill matches --skill " + a.skill); if (src.cleanup) fs.rmSync(src.cleanup, { recursive: true, force: true }); process.exit(1); }

  let totalBytes = 0, totalFiles = 0;
  for (const m of picked) { const c = collectFiles(m.dir); totalBytes += c.bytes; totalFiles += c.files.length; }

  if (a.mode === "preview") {
    console.log("Would install " + picked.length + " skill(s) from " + a.source + " → " + path.join(a.community, src.slug) + ":");
    picked.forEach(m => console.log("  • " + m.name + " (" + collectFiles(m.dir).files.length + " files, " + collectFiles(m.dir).bytes + " bytes)"));
    console.log("Total: " + totalFiles + " files, " + totalBytes + " bytes (caps: " + a.maxBytes + " bytes, " + a.maxFiles + " files)");
    if (src.cleanup) fs.rmSync(src.cleanup, { recursive: true, force: true });
    return;
  }

  // --add
  if (!a.confirm) { console.error("skill-install: --add requires --confirm (run --preview first). Nothing installed."); if (src.cleanup) fs.rmSync(src.cleanup, { recursive: true, force: true }); process.exit(2); }
  if (totalBytes > a.maxBytes) { console.error("skill-install: total size " + totalBytes + " exceeds --max-bytes " + a.maxBytes + " — refused."); if (src.cleanup) fs.rmSync(src.cleanup, { recursive: true, force: true }); process.exit(1); }
  if (totalFiles > a.maxFiles) { console.error("skill-install: " + totalFiles + " files exceeds --max-files " + a.maxFiles + " — refused."); if (src.cleanup) fs.rmSync(src.cleanup, { recursive: true, force: true }); process.exit(1); }

  fs.mkdirSync(a.community, { recursive: true });
  for (const m of picked) copySkill(m.dir, path.join(a.community, src.slug, path.basename(m.dir)));
  console.log("Installed " + picked.length + " skill(s) → " + path.join(a.community, src.slug));
  appendLog(a.log, src.slug, "install");
  if (src.cleanup) fs.rmSync(src.cleanup, { recursive: true, force: true });
}

main();
