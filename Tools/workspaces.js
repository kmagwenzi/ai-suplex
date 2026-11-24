#!/usr/bin/env node
// workspaces.js — the workspace tool (Execution Console lane, T003)
//
// WHY THIS FILE IS NOT 3lm:
//   3lm is the MEMORY tool — episodic · procedural · semantic. Workspaces are a different noun:
//   the briefs an agent is pointed at. Merging them would make the memory CLI a workflow CLI.
//
// Contract: Artifacts/2026-2027/Cycle 3/Week 5/2026-11-23-0740-integration-contract-v1-… (§6)
// Rule: emit a PROMPT. Never chain CLI verbs — the vault's 3lm copies have diverged
//   (1,818 lines here, 1,099 in the Agents Terminal tree), so a verb chain breaks on vault #2.
//
// Usage:
//   node Tools/workspaces.js list      [--vault PATH] [--json]
//   node Tools/workspaces.js detect    [PATH] [--json]
//   node Tools/workspaces.js kickstart <ref|slug> [--vault PATH] [--agent NAME] [--out FILE] [--json]
//
// Exit codes: 0 ok · 1 usage/refusal · 2 unfilled slot (a template bug, never a runtime condition)

'use strict';

const fs = require('fs');
const path = require('path');

// lanes — Spec R3/R10: legacy tokens parse forever, are never written
const THREADS = ['daily-tasks', 'project-tasks', 'long-running-tasks', 'random-tasks', 'random-task', 'realist'];
const SINGLETONS = ['daily-tasks', 'realist'];
const INSTANCE_RE = new RegExp('^(' + THREADS.join('|') + ')-(\\d+)-(.+)\\.md$');
const SINGLETON_RE = new RegExp('^(' + SINGLETONS.join('|') + ')\\.md$');

const SIGNALS = ['Tools/3lm.js', 'Memory', 'Focuses.md', 'Tasklists', 'period.md'];
const MAX_TASKS = 5;
const MAX_HIGHLIGHTS = 10;

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { data: {}, body: text };
  const lines = m[1].split(/\r?\n/);
  const data = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (val === '|' || val === '>') {
      const buf = [];
      while (i + 1 < lines.length && /^\s{2,}/.test(lines[i + 1])) buf.push(lines[++i].trim());
      data[key] = buf.join(' ').trim();
      continue;
    }
    if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val.slice(1, -1).split(',').map(function (s) { return s.trim().replace(/^["']|["']$/g, ''); }).filter(Boolean);
      continue;
    }
    data[key] = val.replace(/^["']|["']$/g, '').trim();
  }
  return { data: data, body: text.slice(m[0].length) };
}

function read(p) { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return null; } }
function exists(p) { try { return fs.existsSync(p); } catch (e) { return false; } }

// The context home is NOT always at the root: 777 keeps it under "AI-Suplex Kick-start/".
// Contract v1.1 — resolve both layouts; never guess a third.
function contextHome(root) {
  const rootLevel = path.join(root, 'Context Kick-start');
  if (exists(rootLevel)) return { dir: rootLevel, layout: 'root' };
  const nested = path.join(root, 'AI-Suplex Kick-start', 'Context Kick-start');
  if (exists(nested)) return { dir: nested, layout: 'nested' };
  return null;
}

// detection — contract §2.2. T004 owns the full surface; this is what kickstart needs.
function detect(root) {
  const gate = exists(path.join(root, 'AGENTS.md'));
  const signals = SIGNALS.filter(function (s) { return exists(path.join(root, s)); });
  const home = contextHome(root);
  const hasContextKickstart = Boolean(home);
  let shape;
  if (!gate || signals.length < 2) shape = 'NOT_AI_SUPLEX';
  else if (hasContextKickstart && signals.length >= 4) shape = 'VAULT';
  else shape = 'WORKSPACE';
  const det = { root: root, shape: shape, score: signals.length, signals: signals, gate: gate, hasContextKickstart: hasContextKickstart, contextLayout: home ? home.layout : null };
  const seam = readSeam(root);
  det.seamVersion = seam.semver;
  det.seamMin = seam.framework_min;
  det.vaultVersion = readAgentsVersion(root);
  const per = readPeriod(root);
  det.periodLabel = per ? per.label : null;
  const cfg = readConfig(root);
  det.config = { present: cfg.present, path: cfg.present ? cfg.path : null, invalid: cfg.invalid || null };
  det.config.drift = configDrift(det, cfg);
  return det;
}


// ── the optional accelerator (P2): .ai-suplex/config.json ────────────────────
// It NAMES the tree; it never replaces looking at it. Reality always wins, and
// a disagreement is reported as drift rather than resolved silently.
function configPath(root) { return path.join(root, '.ai-suplex', 'config.json'); }

function readConfig(root) {
  const p = configPath(root);
  if (!exists(p)) return { path: p, present: false };
  try {
    const data = JSON.parse(read(p));
    return { path: p, present: true, data: data };
  } catch (e) {
    return { path: p, present: true, invalid: 'invalid JSON: ' + e.message };
  }
}

function configDrift(det, cfg) {
  if (!cfg.present) return [];
  if (cfg.invalid) return ['config unreadable — ' + cfg.invalid];
  const d = cfg.data || {};
  const drift = [];
  // Every key the file declares is checked against the tree (§3.4 lists eight).
  const pairs = [
    ['shape', det.shape, 'shape'],
    ['context_layout', det.contextLayout, 'layout'],
    ['seam_version', det.seamVersion, 'seam'],
    ['seam_min', det.seamMin, 'seam_min'],
    ['vault_version', det.vaultVersion, 'AGENTS.md version'],
    ['period_label', det.periodLabel, 'period label']
  ];
  pairs.forEach(function (p) {
    const key = p[0], have = d[key], want = p[1], label = p[2];
    if (have !== undefined && have !== null && String(have) !== String(want)) {
      drift.push('config says ' + label + ' ' + have + ', tree says ' + (want === null ? 'none' : want));
    }
  });
  if (d.config_version !== undefined && d.config_version !== 1) {
    drift.push('config_version ' + d.config_version + ' is not supported (this tool reads 1)');
  }
  return drift;
}

function readSeam(root) {
  const p = path.join(root, 'contract.json');
  if (!exists(p)) return { semver: null, framework_min: null };
  try { const j = JSON.parse(read(p)); return { semver: j.semver || null, framework_min: j.framework_min || null }; }
  catch (e) { return { semver: null, framework_min: null, invalid: true }; }
}

function readPeriod(root) {
  const p = path.join(root, 'period.md');
  if (!exists(p)) return null;
  const fm = parseFrontmatter(read(p) || '').data;
  return { label: fm.period_label || null, start: fm.period_start || null, end: fm.period_end || null };
}

function readAgentsVersion(root) {
  const p = path.join(root, 'AGENTS.md');
  if (!exists(p)) return null;
  return parseFrontmatter(read(p) || '').data.version || null;
}

function writeConfig(root, opts) {
  const det = detect(root);
  if (det.shape === 'NOT_AI_SUPLEX') {
    const e = new Error('refusing: ' + root + ' is not an AI-Suplex tree (signals ' + det.score + '/5)');
    e.code = 1; throw e;
  }
  const p = configPath(root);
  if (exists(p) && !opts.force) {
    const e = new Error(p + ' already exists — pass --force to rewrite it');
    e.code = 1; throw e;
  }
  const seam = readSeam(root);
  const period = readPeriod(root);
  const cfg = {
    config_version: 1,
    vault_version: readAgentsVersion(root),
    seam_version: seam.semver,
    seam_min: seam.framework_min,
    shape: det.shape,
    context_layout: det.contextLayout,
    period_label: period ? period.label : null,
    generated_by: 'workspaces.js config init',
    generated_at: new Date().toISOString()
  };
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  return { path: p, config: cfg };
}

function listWorkspaces(root) {
  const home = contextHome(root);
  if (!home) return [];
  const dir = path.join(home.dir, 'Active');
  if (!exists(dir)) return [];
  const out = [];
  fs.readdirSync(dir).forEach(function (f) {
    if (!f.endsWith('.md') || f.startsWith('_')) return;
    const singleton = SINGLETON_RE.exec(f);
    const inst = INSTANCE_RE.exec(f);
    if (!singleton && !inst) return;
    const fm = parseFrontmatter(read(path.join(dir, f)) || '').data;
    out.push({
      file: f,
      thread: (singleton || inst)[1],
      ref: singleton ? null : Number(inst[2]),
      slug: singleton ? null : inst[3],
      singleton: Boolean(singleton),
      status: fm.status || 'unknown',
      writer: fm.writer || 'unknown',
      agent: fm.agent || 'unknown',
      opened: fm.opened || '',
      mission: fm.mission || '',
      outcome: fm.outcome || '',
      blocked_on: fm.blocked_on || null,
      review_requested: fm.review_requested === true || fm.review_requested === 'true',
      path: path.join(dir, f)
    });
  });
  return out;
}

function resolveWorkspace(root, selector) {
  const all = listWorkspaces(root);
  if (!all.length) { const h = contextHome(root); throw new Error('no workspaces in ' + (h ? path.join(h.dir, 'Active') : root)); }
  if (selector == null) {
    if (all.length === 1) return all[0];
    throw new Error('several workspaces are open — name one by slug or ref: ' + all.map(function (w) {
      return w.singleton ? w.thread : w.slug + ' (ref ' + w.ref + ')';
    }).join(' · '));
  }
  // status: closed in Active/ is an R11 sweep debt, not a live workspace.
  const live = all.filter(function (w) { return w.status !== 'closed'; });
  if (live.length !== all.length) {
    const closed = all.filter(function (w) { return w.status === 'closed'; }).map(function (w) { return w.file; });
    console.error('warning: ' + closed.length + ' closed brief(s) still in Active/ — sweep owed: ' + closed.join(', '));
  }

  // A singleton has neither ref nor slug — its thread name IS its identity.
  const byThread = live.filter(function (w) { return w.singleton; })
    .filter(function (w) { return selector === w.thread || selector === w.thread + '.md'; })[0];
  if (byThread) return byThread;

  if (/^\d+$/.test(String(selector))) {
    const byRef = live.filter(function (w) { return w.ref === Number(selector); })[0];
    if (byRef) return byRef;
  }
  const bySlug = live.filter(function (w) { return w.slug === selector; })[0];
  if (bySlug) return bySlug;
  throw new Error('no workspace matching ' + selector + ' — open: ' + all.map(function (w) { return w.singleton ? w.thread : w.slug; }).join(' · '));
}

// R11 — a tasklist pairs by instance_slug
function findTasklist(root, slug) {
  const dir = path.join(root, 'Tasklists', 'Active');
  if (!exists(dir)) return { pairing: 'no-tasklists-dir', tasklist: null, unpaired: [] };
  // Newest-first by filename date, so a lane's later-day tasklist wins deterministically
  // instead of whichever name readdirSync happened to return first (T006, latent finding).
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.md'); }).sort().reverse();
  const unpaired = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const fm = parseFrontmatter(read(path.join(dir, f)) || '').data;
    if (!fm.instance_slug) { unpaired.push(f); continue; }
    if (fm.instance_slug === slug) {
      const t = { file: f, path: path.join(dir, f), status: fm.status || 'unknown' };
      return { pairing: 'paired', tasklist: t, unpaired: unpaired };
    }
  }
  // two different failures, two different names: a tasklist with no instance_slug is UNPAIRABLE
  // (R11 would orphan it); tasklists that all have slugs but none for this workspace are UNMATCHED.
  const pairing = unpaired.length ? 'unpaired' : (files.length ? 'unmatched' : 'no-tasklists');
  return { pairing: pairing, tasklist: null, unpaired: unpaired };
}

function nextTasks(tasklistText) {
  if (!tasklistText) return null;
  const out = [];
  const lines = tasklistText.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;
    if (/^\|\s*[-: ]+\|/.test(t)) continue;
    if (/^\|\s*(ID|#)\s*\|/i.test(t)) continue;
    const isTaskRow = /^\|\s*[A-Z]?\d{1,4}\s*\|/.test(t);
    const isCheckbox = /^[-*]\s*\[ \]/.test(t);
    // A finished task is not a next task. Skipping the ✅ rows keeps the prompt forward-looking
    // and short — a kickstart that lists what is already done invites the agent to redo it.
    const done = t.indexOf('\u2705') !== -1 || /\*\*DONE\b/i.test(t) || /^[-*]\s*\[[xX]\]/.test(t);
    if (done) continue;
    if (isTaskRow || isCheckbox) { out.push(t); if (out.length >= MAX_TASKS) break; }
  }
  return out.length ? out : null;
}

function memoryHighlights(root, mission, brief) {
  const out = [];
  if (brief && brief.blocked_on) out.push('- BLOCKER: ' + brief.blocked_on);
  const text = read(path.join(root, 'Memory', 'lessons.md'));
  if (!text) return out.length ? out : null;
  const tokens = String(mission || '').toLowerCase().match(/[a-z0-9-]{4,}/g) || [];
  const unique = tokens.filter(function (v, i) { return tokens.indexOf(v) === i; });
  if (!unique.length) return null;
  // Keyword match is a coarse filter and the auditors said so: it returned ten loosely-related
  // lessons and one duplicated line. Dedupe, prefer the ones that warn, then cap.
  const seen = {};
  const hits = text.split(/\r?\n/)
    .filter(function (l) { const t = l.trim(); return t.startsWith('-') || t.startsWith('*'); })
    .filter(function (l) { return unique.some(function (tok) { return l.toLowerCase().indexOf(tok) !== -1; }); })
    .filter(function (l) { const k = l.trim(); if (seen[k]) return false; seen[k] = true; return true; })
    .sort(function (a, b) {
      const warn = /blocker|never|must|fail|broken|breaks/i;
      return (warn.test(b) ? 1 : 0) - (warn.test(a) ? 1 : 0);
    })
    .slice(0, MAX_HIGHLIGHTS - out.length);
  return out.concat(hits).length ? out.concat(hits) : null;
}

// the template — contract §6. Array-joined so the file needs no backticks at all.
const TEMPLATE = [
  '# KICKSTART — {{WORKSPACE_TITLE}}',
  '',
  'You are working inside an AI-Suplex workspace. Read this fully before acting.',
  '',
  '## Identity',
  '- vault_root:   {{VAULT_ROOT}}',
  '- shape:        {{SHAPE}}',
  '- lane:         {{THREAD}} · ref {{REF}} · slug {{SLUG}}',
  '- brief:        {{BRIEF_PATH}}',
  '- writer_class: {{WRITER_CLASS}}',
  '- harness:      {{HARNESS}}',
  '- agent_location: {{AGENT_LOCATION}}',
  '',
  '## Mission',
  '{{MISSION}}',
  '',
  '## Definition of done',
  '{{OUTCOME}}',
  '',
  '## The tasklist',
  '{{TASKLIST_PATH_OR_NONE}}',
  '{{NEXT_TASKS}}',
  '',
  '## What the vault knows (loaded, not remembered)',
  '{{MEMORY_HIGHLIGHTS}}',
  '',
  '## Rules you may not break',
  '1. One file, one writer. Never edit another instance\'s brief.',
  '2. Never write Memory/, AGENTS.md, Active Mission Context.md, or B-Bombs/ unless writer_class',
  '   is committer AND the daily thread owns the file.',
  '3. Never run 3lm sync (a committer serializes it), never touch Tools/ultra/**.',
  '4. Name terminal states: PUBLISHED · SENT · SUBMITTED · CLAIMED · PAID. "Ready" is not a state.',
  '5. Cite task IDs. Point at the durable layer (spec / tasklist / artifact), not the chat.',
  '',
  '## When you finish',
  'Report: what shipped · what is terminal · what is open · the artifact path(s) you wrote.',
  'Capture is manual in v0.1: node Tools/3lm.js end -> learn -> index.'
].join('\n');

const PLACEHOLDERS = ['WORKSPACE_TITLE', 'VAULT_ROOT', 'SHAPE', 'THREAD', 'REF', 'SLUG', 'BRIEF_PATH',
  'WRITER_CLASS', 'HARNESS', 'AGENT_LOCATION', 'MISSION', 'OUTCOME', 'TASKLIST_PATH_OR_NONE', 'NEXT_TASKS', 'MEMORY_HIGHLIGHTS'];

function fill(template, slots) {
  let out = template;
  const missing = [];
  PLACEHOLDERS.forEach(function (name) {
    const v = slots[name];
    if (v === undefined || v === null || String(v).trim() === '') { missing.push(name); return; }
    out = out.split('{{' + name + '}}').join(String(v));
  });
  if (missing.length) {
    const e = new Error('unfilled slot(s): ' + missing.join(', '));
    e.code = 2;
    throw e;
  }
  const leftover = out.match(/\{\{[A-Z_]+\}\}/);
  if (leftover) { const e = new Error('template still contains ' + leftover[0]); e.code = 2; throw e; }
  return out;
}

function kickstart(opts) {
  const det = detect(opts.vault);
  if (det.shape === 'NOT_AI_SUPLEX') {
    const e = new Error('refusing: ' + opts.vault + ' is NOT_AI_SUPLEX (AGENTS.md: ' + det.gate +
      ', signals ' + det.score + '/5: ' + (det.signals.join(', ') || 'none') + ')');
    e.code = 1;
    throw e;
  }
  if (!det.hasContextKickstart) {
    // Contract v1.3 §2.3: a WORKSPACE-class tree has no brief store, so there is nothing to
    // kickstart. The earlier §2.3 line claimed kickstart works there and the tool quoted that
    // clause while refusing — both auditors called it out. The clause was the bug, not the code.
    const e = new Error('refusing: ' + opts.vault + ' is WORKSPACE-class — it has no Context Kick-start/, ' +
      'so it holds no briefs to kickstart (contract §2.3, amended v1.3). Detection and capture work here. ' +
      'To enable kickstart, add Context Kick-start/Active/<thread>-<ref>-<slug>.md — that makes it a VAULT.');
    e.code = 1;
    throw e;
  }
  const ws = resolveWorkspace(opts.vault, opts.selector);
  const tl = ws.singleton ? { pairing: 'singleton', tasklist: null, unpaired: [] } : findTasklist(opts.vault, ws.slug);
  const tasks = nextTasks(tl.tasklist ? read(tl.tasklist.path) : null);
  const highlights = memoryHighlights(opts.vault, ws.mission, ws);

  const title = ws.singleton ? ws.thread : (ws.slug || ws.thread);
  const slots = {
    WORKSPACE_TITLE: title,
    VAULT_ROOT: opts.vault,
    SHAPE: det.shape,
    THREAD: ws.thread,
    REF: ws.singleton ? '-' : String(ws.ref),
    SLUG: ws.singleton ? '-' : String(ws.slug),
    BRIEF_PATH: path.relative(opts.vault, ws.path),
    WRITER_CLASS: ws.writer,
    HARNESS: opts.agent || 'unstated — set with --agent',
    AGENT_LOCATION: ws.agent || 'unknown',
    MISSION: ws.mission || '(no mission in the brief — add one before running)',
    OUTCOME: ws.outcome || '(no outcome in the brief — Define Workspace should have written one)',
    TASKLIST_PATH_OR_NONE: tl.tasklist
      ? 'Tasklists/Active/' + tl.tasklist.file + '  [status: ' + tl.tasklist.status + ']'
      : '(no tasklist paired to this workspace)',
    NEXT_TASKS: tasks
      ? tasks.map(function (t) { return '  ' + t; }).join('\n')
      : (tl.tasklist ? '  (no unchecked tasks left in the tasklist)' : '  (nothing to list — no tasklist is paired)'),
    MEMORY_HIGHLIGHTS: highlights
      ? highlights.join('\n')
      : '  (no lesson matched this mission\'s keywords — read the brief, not the whole memory)'
  };

  return { detection: det, workspace: ws, tasklist: tl, prompt: fill(TEMPLATE, slots), tasks: tasks, highlights: highlights };
}

// A flag takes a value only if it is on this list; everything else is boolean.
// Guessing ("the next token is not --x, so it must be my value") made `detect --json <path>`
// silently detect the wrong tree and exit 0 — found independently by both T006 auditors.
const VALUE_FLAGS = ['vault', 'agent', 'out', 'max', 'ref', 'since'];

function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.slice(0, 2) === '--') {
      const key = a.slice(2);
      if (VALUE_FLAGS.indexOf(key) !== -1 && argv[i + 1] !== undefined && argv[i + 1].slice(0, 2) !== '--') {
        opts[key] = argv[i + 1];
        i++;
      } else {
        opts[key] = true;
      }
    } else {
      opts._.push(a);
    }
  }
  return opts;
}

function findVault(start) {
  let dir = path.resolve(start || process.cwd());
  for (let i = 0; i < 8; i++) {
    if (exists(path.join(dir, 'AGENTS.md'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return path.resolve(start || process.cwd());
}

function usage() {
  return [
    'workspaces — the workspace tool (3lm stays the memory tool)',
    '',
    '  node Tools/workspaces.js list      [--vault PATH] [--json]',
    '  node Tools/workspaces.js detect    [PATH] [--json]',
    '  node Tools/workspaces.js kickstart <ref|slug> [--vault PATH] [--agent NAME] [--out FILE] [--json]',
    '  node Tools/workspaces.js config    init|show [--vault PATH] [--force] [--json]',
    '  node Tools/workspaces.js selftest  <fixture-root>',
    '',
    '  --vault PATH   vault root (default: nearest ancestor with AGENTS.md)',
    '  --agent NAME   dsh | zed | zcode | kimi (labelled in the prompt; never invoked)',
    '  --out FILE     write the prompt to FILE instead of stdout',
    '  --json         machine-readable result'
  ].join('\n');
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const verb = opts._[0];
  const vault = opts.vault ? path.resolve(String(opts.vault)) : null;

  if (!verb || verb === 'help' || opts.help) { console.log(usage()); return 0; }

  if (verb === 'detect') {
    // Same rule as every other verb: an explicit path is taken VERBATIM (never a parent);
    // no path means "the vault this terminal is in", resolved upward — and said out loud.
    const explicitPath = opts._[1] ? path.resolve(String(opts._[1])) : null;
    const target = vault || explicitPath || findVault();
    const det = detect(target);
    det.rootSource = vault ? '--vault' : (explicitPath ? 'argument' : 'cwd-walkup');
    if (opts.json) console.log(JSON.stringify(det, null, 2));
    else {
      const missing = SIGNALS.filter(function (s) { return det.signals.indexOf(s) === -1; });
      console.log(det.shape + '  score ' + det.score + '/5  [' + det.signals.join(', ') + ']  ' + det.root + '  (' + det.rootSource + ')');
      if (det.shape !== 'VAULT' && missing.length) console.log('missing: ' + missing.join(', ') + (det.gate ? '' : ' · AGENTS.md'));
    }
    return det.shape === 'NOT_AI_SUPLEX' ? 1 : 0;
  }

  const root = vault || findVault();
  if (!exists(path.join(root, 'AGENTS.md'))) {
    console.error('workspaces: no AGENTS.md at ' + root + ' — pass --vault PATH');
    return 1;
  }

  if (verb === 'config') {
    const sub = opts._[1];
    if (sub === 'init') {
      try {
        const r = writeConfig(root, { force: Boolean(opts.force) });
        if (opts.json) console.log(JSON.stringify(r, null, 2));
        else { console.log('wrote ' + r.path); console.log(JSON.stringify(r.config, null, 2)); }
        return 0;
      } catch (e) { console.error('workspaces: ' + e.message); return 1; }
    }
    if (sub === 'show' || sub === undefined) {
      const det = detect(root);
      const cfg = readConfig(root);
      if (opts.json) { console.log(JSON.stringify({ path: cfg.path, present: cfg.present, data: cfg.data || null, invalid: cfg.invalid || null, drift: det.config.drift, detection: det }, null, 2)); return 0; }
      if (!cfg.present) { console.log('no .ai-suplex/config.json — optional (P2); detection works without it'); }
      else if (cfg.invalid) { console.log('config is INVALID — ' + cfg.invalid); }
      else console.log(JSON.stringify(cfg.data, null, 2));
      if (det.config.drift.length) { console.log(''); det.config.drift.forEach(function (d) { console.log('DRIFT: ' + d); }); }
      return det.config.drift.length ? 1 : 0;
    }
    console.error('workspaces config: unknown subcommand ' + sub + ' (init | show)');
    return 1;
  }

  if (verb === 'selftest') {
    const testRoot = path.resolve(opts._[1] || root);
    const expPath = path.join(testRoot, 'expectations.json');
    if (!exists(expPath)) { console.error('selftest: no expectations.json in ' + testRoot); return 1; }
    const exp = JSON.parse(read(expPath));
    let fails = 0;
    exp.fixtures.forEach(function (fx) {
      const dir = path.join(testRoot, fx.dir);
      const det = detect(dir);
      const ws = listWorkspaces(dir).filter(function (w) { return !w.singleton; })[0];
      const tl = ws ? findTasklist(dir, ws.slug) : { pairing: 'none' };
      const shapeOk = det.shape === fx.shape;
      const scoreOk = det.score === fx.score;
      const layoutOk = !fx.context_layout || fx.context_layout === det.contextLayout;
      const pairOk = !fx.tasklist || (fx.tasklist.paired ? tl.pairing === 'paired' : tl.pairing === 'unpaired');
      const cfgOk = fx.config === undefined || (fx.config === 'present' ? det.config.present : !det.config.present);
      let tasks = null;
      if (fx.next_tasks !== undefined && tl.tasklist) {
        tasks = nextTasks(read(tl.tasklist.path));
        var tasksOk = tasks !== null && tasks.length === fx.next_tasks;
        if (fx.excludes_done) tasksOk = tasksOk && !tasks.some(function (t) { return t.indexOf('\u2705') !== -1 || /\*\*DONE\b/i.test(t); });
      } else { var tasksOk = true; }
      const driftOk = fx.drift === undefined || det.config.drift.length === fx.drift;
      const ok = shapeOk && scoreOk && layoutOk && pairOk && cfgOk && driftOk && tasksOk;
      if (!ok) fails++;
      console.log((ok ? 'PASS' : 'FAIL') + '  ' + fx.id + ' ' + fx.dir.padEnd(30) +
        ' shape=' + det.shape.padEnd(14) + ' score=' + det.score + '/5' +
        ' layout=' + String(det.contextLayout || '-').padEnd(7) +
        ' pairing=' + String(tl.pairing).padEnd(10) +
        ' config=' + (det.config.present ? 'present' : 'absent') +
        ' drift=' + det.config.drift.length +
        (fx.next_tasks !== undefined ? ' next=' + (tasks ? tasks.length : 'null') : ''));
    });
    console.log('');
    console.log(fails === 0 ? 'ALL FIXTURES MATCH THE ORACLE' : fails + ' FIXTURE(S) DISAGREE WITH THE ORACLE');
    return fails === 0 ? 0 : 1;
  }

  if (verb === 'list') {
    const det = detect(root);
    const all = listWorkspaces(root);
    // "Lying by omission" (contract §2.3): an empty board for a non-vault tree is a claim.
    if (det.shape !== 'VAULT') {
      const msg = det.shape === 'NOT_AI_SUPLEX'
        ? 'not an AI-Suplex tree — signals ' + det.score + '/5 (AGENTS.md: ' + det.gate + ')'
        : 'WORKSPACE-class: no thread model, so there are no workspaces to list (detect + capture only)';
      if (opts.json) { console.log(JSON.stringify({ root: root, shape: det.shape, workspaces: [], note: msg }, null, 2)); }
      else { console.log(det.shape + ' — ' + msg); console.log('root: ' + root + (det.contextLayout ? ' (' + det.contextLayout + ' layout)' : '')); }
      return det.shape === 'NOT_AI_SUPLEX' ? 1 : 0;
    }
    if (opts.json) { console.log(JSON.stringify(all, null, 2)); return 0; }
    if (!all.length) { console.log('VAULT — no workspaces open in ' + root); return 0; }
    all.forEach(function (w) {
      const tl = w.singleton ? { pairing: 'singleton' } : findTasklist(root, w.slug);
      const flags = [w.status, tl.pairing];
      if (w.blocked_on) flags.push('blocked: ' + w.blocked_on);
      if (w.review_requested) flags.push('review');
      const left = w.singleton ? w.thread : w.thread + ' · ref ' + w.ref + ' · ' + w.slug;
      console.log(left.padEnd(46) + flags.join(' · ').padEnd(26) + '  ' + String(w.mission).slice(0, 58));
    });
    return 0;
  }

  if (verb === 'kickstart') {
    try {
      const r = kickstart({ vault: root, selector: opts._[1], agent: typeof opts.agent === 'string' ? opts.agent : null });
      if (!opts.json && r.tasklist.pairing !== 'paired' && !r.workspace.singleton) {
        console.error('warning: tasklist pairing is ' + r.tasklist.pairing + ' — the prompt carries no tasklist (R11 would orphan it)');
      }
      if (opts.json && typeof opts.out === 'string') {
        fs.writeFileSync(path.resolve(opts.out), r.prompt, 'utf8');
        console.error('kickstart: wrote ' + path.resolve(opts.out) + ' (and printing --json)');
      }
      if (opts.json) {
        console.log(JSON.stringify({
          vault: root,
          detection: r.detection,
          workspace: { thread: r.workspace.thread, ref: r.workspace.ref, slug: r.workspace.slug },
          tasklist: r.tasklist.tasklist
            ? { file: r.tasklist.tasklist.file, status: r.tasklist.tasklist.status, pairing: 'paired' }
            : { pairing: r.tasklist.pairing, unpaired: r.tasklist.unpaired },
          tasks: r.tasks,
          highlights: r.highlights,
          prompt: r.prompt
        }, null, 2));
      } else if (typeof opts.out === 'string') {
        fs.writeFileSync(path.resolve(opts.out), r.prompt, 'utf8');
        console.error('kickstart: wrote ' + path.resolve(opts.out));
      } else {
        process.stdout.write(r.prompt + '\n');
      }
      return 0;
    } catch (e) {
      console.error('workspaces: ' + e.message);
      return e.code === 2 ? 2 : 1;
    }
  }

  console.error('workspaces: unknown verb ' + verb + '\n\n' + usage());
  return 1;
}

if (require.main === module) process.exit(main());
module.exports = { detect: detect, listWorkspaces: listWorkspaces, findTasklist: findTasklist, kickstart: kickstart, parseFrontmatter: parseFrontmatter, fill: fill, TEMPLATE: TEMPLATE };
