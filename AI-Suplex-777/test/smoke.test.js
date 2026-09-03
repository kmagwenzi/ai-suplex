'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// This file lives at AI-Suplex-777/test/, so the vault root is one level up.
const VAULT = path.join(__dirname, '..');

function run(tool, args = []) {
  return execFileSync('node', [path.join(VAULT, 'Tools', tool), ...args], {
    cwd: VAULT,
    encoding: 'utf-8',
  });
}

test('3lm status reports memory stack stats', () => {
  const out = run('3lm.js', ['status']);
  assert.match(out, /Governance|Semantic|Procedural|Episodic|memory/i);
});

test('3lm index regenerates Memory/index.md', () => {
  run('3lm.js', ['index']);
  assert.ok(fs.existsSync(path.join(VAULT, 'Memory', 'index.md')), 'index.md should exist');
});

test('vault-index builds the file index', () => {
  run('vault-index.js');
  assert.ok(fs.existsSync(path.join(VAULT, 'Memory', 'wiki-index.md')), 'wiki-index.md should exist');
});

test('knowledge-graph builds and queries the graph', () => {
  run('knowledge-graph.js', ['--build']);
  assert.ok(fs.existsSync(path.join(VAULT, 'Memory', 'graph.db')), 'graph.db should exist');
  const status = run('knowledge-graph.js', ['--status']);
  assert.match(status, /entit|relationship|hub|node/i);
});
