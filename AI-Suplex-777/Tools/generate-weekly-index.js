// Tools/generate-weekly-index.js
// ─────────────────────────────────────────────────────────────────────────────
// Generates a frozen weekly "rollup" page — the distilled memory anchor for one
// cycle/week. Dynamic fields (artifacts, B-Bombs, key insights) are derived from
// the vault; narrative fields (theme, quick summary) are left as TODO for the
// Architect to fill at weekly review.
//
// Usage:
//   node Tools/generate-weekly-index.js                     # auto-detect latest cycle/week
//   node Tools/generate-weekly-index.js --cycle 2 --week 1  # explicit
//
// Output: MOCs/<Period>/Weekly/Cycle <cycle>/Cycle <cycle> Week <week>.md
// ─────────────────────────────────────────────────────────────────────────────

const fs = require("fs");
const path = require("path");

// The path contract — every cycle-scoped path resolves through Tools/paths.js.
// `P.resolve()` returns whichever layout exists, so this tool is correct on BOTH
// sides of the Period migration (Phase 3 tooling runs before Phase 4 file moves).
const P = require("./paths");
const { parseCyclePath } = P;

const ROOT = path.resolve(__dirname, "..");

// — Helpers —————————————————————————————————————————————————————————————————
function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    let val = kv[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    data[kv[1]] = val;
  }
  return data;
}

function extractSummary(content, fm) {
  if (fm.description) return fm.description;
  const body = content.replace(/^---\n[\s\S]*?\n---/, "");
  const lines = body.split("\n");
  let summary = "";
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith(">") || t.startsWith("-") || t.startsWith("|")) continue;
    summary = t.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
    break;
  }
  return summary || "(no summary)";
}

function readMarkdownFiles(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  const out = [];
  for (const name of fs.readdirSync(full)) {
    if (!name.endsWith(".md")) continue;
    const fp = path.join(full, name);
    try {
      const content = fs.readFileSync(fp, "utf8");
      const fm = parseFrontmatter(content);
      out.push({
        file: name,
        rel: path.join(dir, name).split(path.sep).join("/"),
        title: fm.title || name.replace(/\.md$/, ""),
        date: fm.date || null,
        focus: fm.focus || "—",
        summary: extractSummary(content, fm),
      });
    } catch (_) { /* skip unreadable */ }
  }
  return out;
}

function latestCycleWeek() {
  // Parse the tree rather than assume `Cycle N` sits at the Artifacts root — the
  // Period migration inserts a level, and max-directory guessing is the bug class
  // this contract exists to remove.
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

function readInsights(cycle, week) {
  const fp = P.abs(P.resolve(P.insightDir(cycle, week)));
  if (!fs.existsSync(fp)) return [];
  const content = fs.readFileSync(fp, "utf8");
  const out = [];
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*-\s*\*\*(.+?)\*\*\s*–\s*\*(\w[\w-]*)\*\s*–\s*(.+)$/);
    if (m) out.push({ focus: m[2], text: m[3].trim() });
  }
  return out;
}

function weekRange(entries) {
  const dates = entries.map((e) => e.date).filter(Boolean).sort();
  if (!dates.length) return "—";
  return `${dates[0]} → ${dates[dates.length - 1]}`;
}

// — Main —————————————————————————————————————————————————————————————————————
function main() {
  const ci = process.argv.indexOf("--cycle");
  const wi = process.argv.indexOf("--week");
  const detected = latestCycleWeek();
  const cycle = ci > -1 ? process.argv[ci + 1] : String(detected.cycle);
  const week = wi > -1 ? process.argv[wi + 1] : String(detected.week);

  // Resolved through the contract — correct on both layouts (never string-built).
  const artifactDirRel = P.resolve(P.artifactDir(cycle, week));
  const bBombDirRel = P.resolve(P.bBombDir(cycle, week));
  const insightFileRel = P.resolve(P.insightDir(cycle, week));

  const artifacts = readMarkdownFiles(artifactDirRel);
  const bbombs = readMarkdownFiles(bBombDirRel);
  const insights = readInsights(cycle, week).slice(0, 3);

  artifacts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  bbombs.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const focusCount = {};
  for (const a of artifacts) if (a.focus && a.focus !== "—") focusCount[a.focus] = (focusCount[a.focus] || 0) + 1;
  const dominantFocus = Object.entries(focusCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const dates = weekRange(artifacts);

  const md = [];
  md.push("---");
  md.push("type: weekly-index");
  md.push(`cycle: ${cycle}`);
  md.push(`week: ${week}`);
  md.push(`theme: ""`);
  md.push(`dates: ${dates}`);
  md.push("---");
  md.push("");
  md.push(`# 📅 Cycle ${cycle} — Week ${week} Index`);
  md.push("");
  md.push("## 📌 Theme");
  md.push(`> _TODO — Architect fills at weekly review._ (dominant focus this week: \`${dominantFocus}\`)`);
  md.push("");
  md.push("## ⚡ Quick Summary");
  md.push("> _TODO — Architect fills at weekly review._");
  md.push("");
  md.push("## 💡 Key Insights");
  if (insights.length) {
    insights.forEach((ins, i) => {
      md.push(`${i + 1}. ${ins.text}`);
    });
    md.push("");
    md.push(`_Source: \`${insightFileRel}\`_`);
  } else {
    md.push("> _None recorded this week._");
  }
  md.push("");
  md.push("## 📦 Artifacts");
  md.push("");
  md.push("| Title | Focus | Date |");
  md.push("|-------|-------|------|");
  for (const a of artifacts) {
    md.push(`| [${a.title}](${a.rel}) | ${a.focus} | ${a.date || "—"} |`);
  }
  md.push("");
  md.push("## 💣 B-Bomb Index");
  md.push("");
  if (bbombs.length) {
    md.push("| Title | Focus | Date |");
    md.push("|-------|-------|------|");
    for (const b of bbombs) {
      md.push(`| [${b.title}](${b.rel}) | ${b.focus} | ${b.date || "—"} |`);
    }
  } else {
    md.push("> _No B-Bombs promoted this week._");
  }
  md.push("");
  md.push("## 🔗 Related");
  md.push(`- Insights: \`${insightFileRel}\``);
  md.push(`- Artifacts: \`${artifactDirRel}/\``);
  md.push(`- B-Bombs: \`${bBombDirRel}/\``);
  md.push("");
  md.push("---");
  md.push(`*Weekly index — generated ${new Date().toISOString().slice(0, 10)} · AI-Suplex 7-7-7*`);
  md.push("");

  const outPath = P.abs(P.resolve(P.weeklyRollupFile(cycle, week)));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, md.join("\n"));

  console.log("┌──────────────────────────────────────────────┐");
  console.log("│  📅 Weekly Index Generator                    │");
  console.log("└──────────────────────────────────────────────┘");
  console.log(`  Cycle ${cycle} · Week ${week}`);
  console.log(`  Artifacts: ${artifacts.length} · B-Bombs: ${bbombs.length} · Insights: ${insights.length}`);
  console.log(`  → ${path.relative(ROOT, outPath)}`);
  console.log("  TWABAM ⚡!\n");
}

main();
