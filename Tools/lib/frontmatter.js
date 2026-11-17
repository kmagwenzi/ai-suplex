#!/usr/bin/env node
"use strict";

/**
 * frontmatter.js — the vault's YAML-ish frontmatter reader.
 *
 * Handles the two shapes the vault writes:
 *   key: value            inline scalar
 *   key:                  block list, items on the following "  - " lines
 *
 * Block lists are flattened to a NEWLINE-JOINED STRING so text consumers work.
 * Before this fix a block list was silently dropped: a Session End report that
 * carried key_insights as a list produced an episode with no lessons, and
 * `3lm learn` reported "No lessons found". That happened twice (2026-10-16 and
 * 2026-10-18) before the parser was fixed.
 */

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { data: {}, body: content };

  const data = {};
  let currentKey = null;

  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_][\w-]*):[ \t]*(.*)$/);
    if (kv) {
      const key = kv[1];
      const value = kv[2].trim();
      if (value) {
        data[key] = value;
        currentKey = null;
      } else {
        data[key] = null; // a block list may follow
        currentKey = key;
      }
      continue;
    }

    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && currentKey) {
      const text = item[1].trim().replace(/^["']|["']$/g, "");
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(text);
    }
  }

  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) data[key] = data[key].join("\n");
    else if (data[key] === null) data[key] = "";
  }

  return { data, body: content.slice(match[0].length).trim() };
}

module.exports = { parseFrontmatter };
