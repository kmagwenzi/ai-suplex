#!/usr/bin/env node
/**
 * convert.js — the File Modality Bridge.
 *
 * Deterministic CLI that turns ANY file (docx/pdf/pptx/xlsx/html/epub/zip,
 * image, YouTube URL, vector, audio/video) into a canonical AI-Suplex artifact.
 * Replaces the prose-only "Artifact Capture(file)" command with one tested path.
 *
 * One code path, one routing matrix, one fixture pack. Reuses gauntlet.js's
 * resolveVault()/log/warn/fail + shell-safe 3lm hook (execFileSync argv arrays).
 *
 * v2.0 adds: `--transcribe` (audio/video), OCR fallback for scanned PDF,
 * size-guard digest mode, and `--batch` multi-file conversion.
 *
 * Usage:
 *   node Tools/convert.js <source> [flags]
 *   node Tools/convert.js --batch <dir> [flags]   (or multiple <source> args)
 *       [--to <dir>] [--title <n>] [--focus <n>] [--tags <csv>]
 *       [--list <lesson>…] [--move] [--no-3lm] [--dry] [--json]
 *       [--transcribe] [--full] [--selftest] [--help]
 *
 * No new npm deps. Shells out to existing binaries via execFileSync argv.
 * TWABAM ⚡!
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

// ── Vault resolution (env-first → walk-up) — same as gauntlet.js ───────────
function resolveVault() {
  if (process.env.AISUPLEX_VAULT && fs.existsSync(process.env.AISUPLEX_VAULT)) {
    return process.env.AISUPLEX_VAULT;
  }
  let dir = process.cwd();
  for (;;) {
    if (fs.existsSync(path.join(dir, "Tasklists", "Active"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(__dirname, "..");
}

const VAULT = resolveVault();
const ARTIFACTS_DIR = path.join(VAULT, "Artifacts");
const VAULT_CONTEXT = path.join(VAULT, "Memory", "vault-context.md");

// The path contract — every cycle-scoped path resolves through Tools/paths.js.
// ⚠️ T014 (2026-09-26): this file was MISSING from the spec §5 consumer table and
// from T007's migration list, so it kept building `Artifacts/Cycle N/Week N` and
// silently re-created the pre-period tree on every file capture.
const P = require("./paths");

function log(label, msg) {
  console.log(`\x1b[1;36m[convert ${label}]\x1b[0m ${msg}`);
}
function warn(msg) {
  console.error(`\x1b[1;33m[convert warn]\x1b[0m ${msg}`);
}
function fail(msg) {
  console.error(`\x1b[1;31m[convert error]\x1b[0m ${msg}`);
  process.exit(1);
}

// ── Binary resolution ──────────────────────────────────────────────────────
const BIN_HINTS = {
  markitdown: "pip install 'markitdown[all]' (or: pipx install markitdown)",
  file2md: "pip install file2md",
  libreoffice: "sudo dnf install libreoffice",
  youtube_transcript_api: "pip install youtube-transcript-api",
  ffmpeg: "sudo dnf install ffmpeg",
  whisper: "pip install openai-whisper",
  tesseract: "sudo dnf install tesseract",
  pdftoppm: "sudo dnf install poppler-utils",
};

function resolveBin(name) {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const local = home ? path.join(home, ".local", "bin", name) : null;
  if (local && fs.existsSync(local)) return local;
  return name; // bare name → PATH lookup by execFileSync
}

// Non-exiting presence probe for OPTIONAL deps (whisper/tesseract/…).
// Unlike runBin, this never process.exit()s, so it can gate a fallback chain.
function hasBin(name) {
  const bin = resolveBin(name);
  if (path.isAbsolute(bin)) return true; // found under ~/.local/bin
  const dirs = (process.env.PATH || "").split(path.delimiter).filter(Boolean);
  return dirs.some((d) => fs.existsSync(path.join(d, name)));
}

// Thrown (not exit) on a missing binary — the CLI's main() converts this to a
// clean `fail()`, and the selftest/batch can catch it without killing the run.
function missingBin(name) {
  return new Error(`binary "${name}" not installed — run: ${BIN_HINTS[name] || "install it"}`);
}

function runBin(name, args, opts = {}) {
  const bin = resolveBin(name);
  try {
    return execFileSync(bin, args, {
      encoding: "utf-8",
      maxBuffer: 32 * 1024 * 1024,
      ...opts,
    });
  } catch (e) {
    if (e.code === "ENOENT") throw missingBin(name);
    throw e;
  }
}

// ── Modality routing ───────────────────────────────────────────────────────
const OFFICE_EXTS = ["docx", "pdf", "pptx", "xlsx", "html", "htm", "epub", "zip"];
const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "gif"];
const VECTOR_EXTS = ["odg", "ai", "svg"];
const MARKDOWN_EXTS = ["md", "markdown"];
const MEDIA_EXTS = ["mp3", "wav", "m4a", "mp4", "mov"];

const SIZE_GUARD_BYTES = 16 * 1024; // ~16 KB / ~4,000 tokens
const DIGEST_LEAD_CHARS = 2000;

function extOf(source) {
  return path.extname(source).replace(/^\./, "").toLowerCase();
}

function youtubeId(url) {
  const m = String(url).match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

// Returns a route kind: "markdown" | "office" | "image" | "media" | "vector" | "youtube" | "url" | "unknown"
function detectType(source) {
  if (/^https?:\/\//i.test(source)) {
    return youtubeId(source) ? "youtube" : "url";
  }
  const ext = extOf(source);
  if (MARKDOWN_EXTS.includes(ext)) return "markdown";
  if (OFFICE_EXTS.includes(ext)) return "office";
  if (IMAGE_EXTS.includes(ext)) return "image";
  if (MEDIA_EXTS.includes(ext)) return "media";
  if (VECTOR_EXTS.includes(ext)) return "vector";
  return "unknown";
}

// ── Converters (return markdown string) ────────────────────────────────────
function convertMarkitdown(input) {
  try {
    return runBin("markitdown", [input]).trim();
  } catch (e) {
    if (/not installed/.test(String(e))) {
      // fallback: file2md writes <input>.md
      runBin("file2md", [input]);
      const md = String(input) + ".md";
      if (fs.existsSync(md)) {
        const out = fs.readFileSync(md, "utf-8").trim();
        try { fs.unlinkSync(md); } catch {}
        return out;
      }
      throw new Error("markitdown and file2md both unavailable");
    }
    throw e;
  }
}

function convertVector(input) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "convert-"));
  runBin("libreoffice", ["--headless", "--convert-to", "pdf", "--outdir", tmp, input], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  const base = path.basename(input).replace(/\.[^.]+$/, "");
  const pdf = path.join(tmp, base + ".pdf");
  if (!fs.existsSync(pdf)) throw new Error("libreoffice produced no PDF (unsupported vector?)");
  const md = convertMarkitdown(pdf);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
  return md;
}

function convertYoutube(url) {
  const id = youtubeId(url);
  if (!id) throw new Error(`not a valid YouTube URL: ${url}`);
  try {
    return runBin("youtube_transcript_api", [id, "--format", "text"]).trim();
  } catch {
    return convertMarkitdown(url); // fallback: markitdown <url>
  }
}

// ── v2: PDF with OCR fallback ──────────────────────────────────────────────
// Text-layer PDF → markitdown. Scanned PDF (empty text layer) → OCR.
function convertPdf(source) {
  const md = convertMarkitdown(source).trim();
  if (md) return md;
  return ocrPdf(source);
}

function ocrPdf(source) {
  if (!hasBin("pdftoppm")) throw missingBin("pdftoppm");
  if (!hasBin("tesseract")) throw missingBin("tesseract");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "convert-ocr-"));
  try {
    runBin("pdftoppm", ["-png", "-r", "300", source, path.join(tmp, "page")], {
      stdio: ["ignore", "ignore", "pipe"],
    });
    const pages = fs.readdirSync(tmp).filter((f) => /\.png$/i.test(f)).sort();
    if (!pages.length) throw new Error(`OCR produced no page images for ${source}`);
    const out = [];
    for (const p of pages) {
      const txt = runBin("tesseract", [path.join(tmp, p), "stdout", "-l", "eng"]).trim();
      if (txt) out.push(txt);
    }
    return out.join("\n\n");
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
  }
}

// ── v2: audio/video transcription ──────────────────────────────────────────
function extractAudio(source) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "convert-audio-"));
  const wav = path.join(tmp, "audio.wav");
  runBin("ffmpeg", ["-y", "-i", source, "-vn", "-ac", "1", "-ar", "16000", wav], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  if (!fs.existsSync(wav)) throw new Error(`ffmpeg produced no audio for ${source}`);
  return { wav, tmp };
}

function transcribeWhisper(wav) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "convert-whisper-"));
  try {
    runBin("whisper", [wav, "--model", "base", "--output_format", "txt", "--output_dir", outDir], {
      stdio: ["ignore", "ignore", "pipe"],
    });
    const base = path.basename(wav).replace(/\.[^.]+$/, "");
    const txt = path.join(outDir, base + ".txt");
    if (fs.existsSync(txt)) return fs.readFileSync(txt, "utf-8").trim();
    throw new Error("whisper produced no transcript");
  } finally {
    try { fs.rmSync(outDir, { recursive: true, force: true }); } catch {}
  }
}

// whisper → markitdown audio → graceful "install whisper" hint (never crashes).
function convertTranscribe(source) {
  let tmp = null;
  try {
    const extracted = extractAudio(source);
    tmp = extracted.tmp;
    if (hasBin("whisper")) return transcribeWhisper(extracted.wav);
    // markitdown may shell to whisper internally; on missing whisper it returns
    // a non-empty "…could not transcribe…" error string — treat as failure.
    const md = convertMarkitdown(source).trim();
    if (md && !/could not transcribe/i.test(md)) return md;
    throw new Error(
      `transcription unavailable — whisper not installed (run: ${BIN_HINTS.whisper}); markitdown audio fallback produced no transcript`
    );
  } finally {
    if (tmp) { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {} }
  }
}

function convertSource(source) {
  const type = detectType(source);
  if (type === "markdown") {
    return { type, markdown: fs.readFileSync(source, "utf-8") };
  }
  if (type === "office") {
    if (extOf(source) === "pdf") return { type, markdown: convertPdf(source) };
    return { type, markdown: convertMarkitdown(source) };
  }
  if (type === "media") {
    return { type, markdown: convertTranscribe(source) };
  }
  if (type === "vector") {
    return { type, markdown: convertVector(source) };
  }
  if (type === "youtube") {
    return { type, markdown: convertYoutube(source) };
  }
  if (type === "url") {
    return { type, markdown: convertMarkitdown(source) };
  }
  if (type === "image") {
    return { type, markdown: null }; // stub built later
  }
  throw new Error(
    `unsupported file type (${extOf(source) || "unknown"}) — no converter for this modality`
  );
}

// ── Cycle/week derivation ──────────────────────────────────────────────────
function deriveCycleWeek() {
  if (fs.existsSync(VAULT_CONTEXT)) {
    const m = fs.readFileSync(VAULT_CONTEXT, "utf-8").match(/Cycle\s+(\d+)\s*·\s*Week\s+(\d+)/);
    if (m) return { cycle: parseInt(m[1], 10), week: parseInt(m[2], 10) };
  }
  // Fallback: parse the tree rather than guess the max `Cycle N` at the root — the
  // Period level sits above it now, and max-detection is the bug class the refactor
  // exists to remove (it would report the previous period's Cycle 7 after a rollover).
  let best = { cycle: 1, week: 1 };
  const walk = (rel, depth) => {
    if (depth > 3) return;
    let entries;
    try {
      entries = fs.readdirSync(path.join(VAULT, rel), { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const sub = `${rel}/${e.name}`;
      const cw = P.parseCyclePath(sub);
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

// ── Helpers ────────────────────────────────────────────────────────────────
function slugify(s) {
  const out = String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return out || "artifact";
}

function nowStamp() {
  const d = new Date();
  const date = d.toISOString().slice(0, 10);
  const time = d.toTimeString().slice(0, 5).replace(":", "");
  return { date, time };
}

function uniquePath(dir, filename) {
  let candidate = path.join(dir, filename);
  let n = 2;
  while (fs.existsSync(candidate)) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    candidate = path.join(dir, `${base}-${n}${ext}`);
    n++;
  }
  return candidate;
}

function buildFrontmatter({ title, focus, cycle, week, tags, source, lessons }) {
  const { date, time } = nowStamp();
  const tagList = [...new Set([...tags, "artifact"])].map((t) => `  - ${t}`).join("\n");
  const insights = lessons.length
    ? lessons.map((l) => `  - ${l}`).join("\n")
    : `  - "TODO — Architect fills"`;
  return [
    "---",
    "type: artifact",
    `title: "${title}"`,
    `date: "${date}"`,
    `time: "${time}"`,
    `focus: "${focus}"`,
    `cycle: ${cycle}`,
    `week: ${week}`,
    "tags:",
    tagList,
    `source: "${source}"`,
    "converted_by: \"convert.js\"",
    "key_insights:",
    insights,
    "next_actions:",
    '  - "TODO"',
    "---",
    "",
  ].join("\n");
}

// ── v2: size-guard digest ──────────────────────────────────────────────────
// Deterministic digest: every heading + the first ~2,000 chars, pointing at the
// full text preserved in Attachments/<name>.full.md.
function buildDigest(markdown, fullRel) {
  const headings = markdown.split("\n").filter((l) => /^#{1,6}\s+/.test(l));
  const lead = markdown.slice(0, DIGEST_LEAD_CHARS).trim();
  return [
    `> **Digest** — source exceeded the ${SIZE_GUARD_BYTES}-byte size guard; full text preserved separately.`,
    `> Full text: \`${fullRel}\``,
    "",
    "## Headings",
    "",
    ...(headings.length ? headings : ["_no headings_"]),
    "",
    "## Lead",
    "",
    lead,
    "",
  ].join("\n");
}

// ── 3lm hook (shell-safe execFileSync argv arrays) ─────────────────────────
function run3lm(args) {
  return execFileSync("node", [path.join(VAULT, "Tools", "3lm.js"), ...args], {
    cwd: VAULT,
    encoding: "utf-8",
  });
}

function fire3lmHook(title, lessons) {
  if (!lessons.length) return;
  run3lm(["add-lessons", "--source", "artifact", "--ref", title, "--list", ...lessons]);
  run3lm(["index"]);
}

// ── Main pipeline ──────────────────────────────────────────────────────────
// Throws on error (no process.exit) so batch mode can isolate per-file failures;
// main() converts a throw into a clean fail() for the single-file CLI path.
function run(source, opts) {
  let type = detectType(source);
  if (opts.transcribe && type === "unknown") type = "media"; // --transcribe forces transcription of unrecognized audio/video
  if (type === "unknown") {
    throw new Error(
      `unsupported file type (${extOf(source) || "unknown"}) — no converter for this modality`
    );
  }
  const { cycle, week } = deriveCycleWeek();
  const { date, time } = nowStamp();
  const title = opts.title || path.basename(source, path.extname(source)).replace(/[_-]+/g, " ") || "artifact";
  const slug = slugify(title);
  const destDir = opts.to
    ? path.resolve(VAULT, opts.to)
    : path.join(VAULT, P.resolve(P.artifactDir(cycle, week)));
  const attachmentsDir = path.join(destDir, "Attachments");
  const filename = `${date}-${time}-${slug}.md`;
  const dest = uniquePath(destDir, filename);
  const focus = opts.focus || "general";

  const sourceRel = /^https?:/i.test(source)
    ? source
    : path.relative(VAULT, path.resolve(source));

  if (opts.dry) {
    return {
      status: "dry",
      type,
      dest: path.relative(VAULT, dest),
      source: sourceRel,
      cycle,
      week,
    };
  }

  // Convert (throws on unsupported / empty)
  const result = convertSource(source);
  let markdown = result.markdown;

  let attachmentRel = null;
  if (type === "image") {
    // copy original to Attachments/ + stub body (model reads the image directly)
    fs.mkdirSync(attachmentsDir, { recursive: true });
    const base = path.basename(source);
    const att = uniquePath(attachmentsDir, base);
    if (opts.move) fs.renameSync(source, att);
    else fs.copyFileSync(source, att);
    attachmentRel = path.relative(VAULT, att);
    markdown = `> Original image: \`${attachmentRel}\`\n\nSee the image directly — the model reads it. (Copied to Attachments/.)`;
  } else if (!/^https?:/i.test(source)) {
    // preserve the original (copy-by-default; --move is opt-in)
    fs.mkdirSync(attachmentsDir, { recursive: true });
    const base = path.basename(source);
    const att = uniquePath(attachmentsDir, base);
    if (opts.move) fs.renameSync(source, att);
    else fs.copyFileSync(source, att);
    attachmentRel = path.relative(VAULT, att);
  }

  // verify-then-write
  if (!markdown || !markdown.trim()) {
    throw new Error(`conversion produced empty output for ${source} — no artifact written`);
  }

  // v2 size-guard: digest artifact + full text in Attachments/ (--full bypasses)
  let fullRel = null;
  let digest = false;
  if (!opts.full && Buffer.byteLength(markdown, "utf-8") > SIZE_GUARD_BYTES) {
    fs.mkdirSync(attachmentsDir, { recursive: true });
    const fullPath = uniquePath(attachmentsDir, `${slug}.full.md`);
    fs.writeFileSync(fullPath, markdown);
    fullRel = path.relative(VAULT, fullPath);
    markdown = buildDigest(markdown, fullRel);
    digest = true;
  }

  fs.mkdirSync(destDir, { recursive: true });
  const frontmatter = buildFrontmatter({
    title,
    focus,
    cycle,
    week,
    tags: opts.tags,
    source: sourceRel,
    lessons: opts.lessons,
  });
  const body = markdown;

  // atomic write: temp then rename
  const tmp = dest + `.tmp-${process.pid}`;
  fs.writeFileSync(tmp, frontmatter + body);
  fs.renameSync(tmp, dest);

  const bytes = Buffer.byteLength(frontmatter + body, "utf-8");

  // 3lm hook
  if (!opts.no3lm) fire3lmHook(title, opts.lessons);

  return {
    status: "ok",
    type,
    dest: path.relative(VAULT, dest),
    attachment: attachmentRel,
    bytes,
    digest,
    full: fullRel,
  };
}

// ── v2: batch mode ─────────────────────────────────────────────────────────
function runBatch(inputs, opts) {
  const results = [];
  for (const input of inputs) {
    try {
      const r = run(input, { ...opts, no3lm: true });
      results.push({ input, ok: true, type: r.type, dest: r.dest, bytes: r.bytes || 0, digest: !!r.digest });
    } catch (e) {
      results.push({ input, ok: false, error: e && e.message ? e.message : String(e) });
    }
  }
  const okCount = results.filter((r) => r.ok).length;
  console.log(`\n\x1b[1;36m[convert batch]\x1b[0m ${results.length} file(s) — ${okCount} converted, ${results.length - okCount} failed:`);
  for (const r of results) {
    const mark = r.ok ? "\x1b[1;32m✓\x1b[0m" : "\x1b[1;31m✗\x1b[0m";
    const detail = r.ok ? `${r.type} → ${r.dest}${r.digest ? " (digest)" : ""}` : r.error.slice(0, 100);
    console.log(`  ${mark} ${path.basename(r.input)}  ${detail}`);
  }
  // one summary 3lm hook (not per-file)
  if (!opts.no3lm && opts.lessons.length) {
    fire3lmHook(`batch: ${okCount}/${results.length} converted`, opts.lessons);
  }
  return { status: "batch", total: results.length, ok: okCount, failed: results.length - okCount, results };
}

// ── Selftest ───────────────────────────────────────────────────────────────
function selftest() {
  const dir = path.join(__dirname, "test", "fixtures");
  const fixtures = [
    { file: "sample.md", expect: "markdown" },
    { file: "sample.docx", expect: "office" },
    { file: "sample.html", expect: "office" },
    { file: "sample.pdf", expect: "office" },
    { file: "sample.pptx", expect: "office" },
    { file: "sample.xlsx", expect: "office" },
    { file: "sample.png", expect: "image" },
    { file: "sample.unknown", expect: "unknown" },
    // v2 routes: transcription + OCR. Deps are OPTIONAL — when whisper/tesseract
    // are absent, assert the graceful install-hint (never a crash).
    { file: "sample.wav", expect: "media", gracefulHint: /whisper/i },
    { file: "sample-scanned.pdf", expect: "office", gracefulHint: /tesseract/i },
  ];
  let pass = 0;
  let failc = 0;
  console.log("\x1b[1;36m[convert selftest]\x1b[0m fixture pack:");
  for (const f of fixtures) {
    const fp = path.join(dir, f.file);
    if (!fs.existsSync(fp)) {
      failc++;
      console.log(`  ✗ ${f.file}: fixture missing`);
      continue;
    }
    try {
      const r = convertSource(fp);
      const textRoutes = ["markdown", "office", "vector", "youtube", "url", "media"];
      if (r.type === f.expect && (!textRoutes.includes(r.type) || (r.markdown && r.markdown.trim()))) {
        pass++;
        console.log(`  ✓ ${f.file} → ${r.type}`);
      } else {
        failc++;
        console.log(`  ✗ ${f.file}: expected ${f.expect}, got ${r.type} (empty: ${!r.markdown || !r.markdown.trim()})`);
      }
    } catch (e) {
      if (f.expect === "unknown" && /unsupported/i.test(String(e))) {
        pass++;
        console.log(`  ✓ ${f.file} → unsupported (correct)`);
      } else if (f.gracefulHint && f.gracefulHint.test(String(e))) {
        pass++;
        console.log(`  ✓ ${f.file} → graceful hint (${(String(e).match(f.gracefulHint) || ["dep absent"])[0]})`);
      } else {
        failc++;
        console.log(`  ✗ ${f.file}: ${String(e).slice(0, 120)}`);
      }
    }
  }

  // v2 size-guard digest (pure-function check)
  const big = "# Heading One\n\n" + "x ".repeat(4000) + "\n\n## Heading Two\n\n" + "y ".repeat(4000);
  const dg = buildDigest(big, "Attachments/big.full.md");
  const dgOk =
    dg.includes("## Headings") &&
    dg.includes("# Heading One") &&
    dg.includes("## Heading Two") &&
    dg.includes("## Lead") &&
    dg.includes("Attachments/big.full.md") &&
    dg.length < big.length;
  if (dgOk) { pass++; console.log(`  ✓ size-guard digest (headings + lead, ${dg.length} < ${big.length} chars)`); }
  else { failc++; console.log(`  ✗ size-guard digest: malformed`); }

  console.log(`\n\x1b[1;3${failc ? "1" : "2"}mSelftest: ${pass} pass / ${failc} fail\x1b[0m\n`);
  process.exit(failc ? 1 : 0);
}

// ── Main ───────────────────────────────────────────────────────────────────
function showHelp() {
  console.log(`
\x1b[1;33mconvert.js\x1b[0m — File Modality Bridge v2 (Tools/convert.js)

\x1b[1;36mUsage:\x1b[0m
  node Tools/convert.js <source> [flags]
  node Tools/convert.js --batch <dir> [flags]      # or multiple <source> args

\x1b[1;36mFlags:\x1b[0m
  --to <dir>        destination dir (default: auto Artifacts/<Period>/Cycle X/Week Y/)
  --title <name>    artifact title (default: derived from filename)
  --focus <name>    focus tag (default: general)
  --tags <csv>      comma-separated extra tags
  --list <lesson>…  lessons for the 3lm add-lessons hook (max 3)
  --move            relocate source into Attachments/ (default: copy)
  --no-3lm          skip the memory loop
  --dry             read-only: print the plan, write nothing
  --json            machine-readable result to stdout
  --transcribe      force transcription of audio/video (media is auto-detected)
  --full            bypass the size-guard digest (write full text inline)
  --batch <dir>     convert every file in <dir> (per-file table + one 3lm hook)
  --selftest        run the fixture pack and report pass/fail
  --help
`);
}

function collectBatchDir(dir, out) {
  const resolved = path.resolve(VAULT, dir);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    throw new Error(`--batch dir not found or not a directory: ${dir}`);
  }
  const files = fs.readdirSync(resolved, { withFileTypes: true })
    .filter((d) => d.isFile() && !d.name.startsWith(".") && !d.name.endsWith(".full.md"))
    .map((d) => path.join(resolved, d.name))
    .sort();
  out.push(...files);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
  }
  if (args.includes("--selftest")) {
    selftest();
    return;
  }

  const opts = {
    to: null,
    title: null,
    focus: null,
    tags: [],
    lessons: [],
    move: false,
    no3lm: false,
    dry: false,
    json: false,
    transcribe: false,
    full: false,
    batch: false,
  };
  const sources = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--batch") {
      opts.batch = true;
      const d = args[++i];
      if (!d) fail("--batch requires a directory");
      collectBatchDir(d, sources);
    } else if (a === "--to") opts.to = args[++i];
    else if (a === "--title") opts.title = args[++i];
    else if (a === "--focus") opts.focus = args[++i];
    else if (a === "--tags") opts.tags = (args[++i] || "").split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--list") {
      for (let j = i + 1; j < args.length && !args[j].startsWith("--"); j++) {
        opts.lessons.push(args[j]);
        i = j;
      }
      opts.lessons = opts.lessons.slice(0, 3);
    } else if (a === "--move") opts.move = true;
    else if (a === "--no-3lm") opts.no3lm = true;
    else if (a === "--dry") opts.dry = true;
    else if (a === "--json") opts.json = true;
    else if (a === "--transcribe") opts.transcribe = true;
    else if (a === "--full") opts.full = true;
    else if (a.startsWith("--")) warn(`unknown flag ignored: ${a}`);
    else sources.push(a);
  }

  if (opts.batch || sources.length > 1) {
    if (sources.length === 0) fail("no sources to convert (--batch dir was empty or no files given)");
    const result = runBatch(sources, opts);
    if (opts.json) console.log(JSON.stringify(result));
    process.exit(result.failed ? 1 : 0);
  }

  if (sources.length === 0) fail("no source provided");

  try {
    const result = run(sources[0], opts);
    if (opts.json) {
      console.log(JSON.stringify({ status: result.status, path: result.dest, type: result.type, bytes: result.bytes || 0 }));
    } else if (result.status === "dry") {
      console.log(`\x1b[1;32m[--dry] plan\x1b[0m`);
      console.log(`  type:       ${result.type}`);
      console.log(`  source:     ${result.source}`);
      console.log(`  destination: ${result.dest}`);
      console.log(`  cycle/week: ${result.cycle}/${result.week}`);
      console.log(`  (no write — dry run)`);
    } else {
      log("done", `${result.type} → ${result.dest} (${result.bytes} bytes)`);
      if (result.digest) log("digest", `full text → ${result.full}`);
      if (result.attachment) log("attach", result.attachment);
      if (opts.lessons.length) log("3lm", `lessons captured → ${opts.lessons.length}`);
      console.log(`\n\x1b[1;33m  TWABAM ⚡!\x1b[0m\n`);
    }
  } catch (e) {
    fail(e && e.message ? e.message : String(e));
  }
}

main();
