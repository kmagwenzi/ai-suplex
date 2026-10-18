#!/usr/bin/env node
/**
 * outreach-board.js — generate `MOCs/Outreach Board.md` from the Outreach records.
 *
 * Outreach Entity spec §5: **the board is a projection, never hand-edited.**
 * Files are truth; this script is the only writer.
 *
 * Layout — overdue first (spec §5):
 *   # 📮 Outreach Board
 *   ## ⏰ OVERDUE (n)              ← `sent` with `follow_up_at` in the past
 *   ## ✉️ SENT · awaiting (n)
 *   ## 💬 REPLIED · in play (n)    ← open pipeline value
 *   ## 😴 DORMANT (n)              ← parked deliberately; NEVER counted overdue
 *   ## 🏁 CLOSED (n)               ← won / lost
 *   ## 📊 Movement (trailing 7 days)
 *
 * The period comes from `Tools/paths.js` at runtime — never a literal label.
 *
 * Usage:
 *   node Tools/outreach-board.js            # write the board
 *   node Tools/outreach-board.js --dry      # print it, write nothing
 *   node Tools/outreach-board.js --json     # machine-readable summary
 *
 * NOTE: the Sweeper macro (`Scripts/Sweeper – Refresh Outreach Board.js`) is a
 * thin wrapper over this tool, mirroring how `Refresh B-Bomb Index` shells out.
 * The wrapper is blocked on Period Structure T015 (`Scripts/lib/paths.js`).
 */

const fs = require("fs");
const path = require("path");
const P = require("./paths");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "MOCs", "Outreach Board.md");
const TODAY = new Date().toISOString().slice(0, 10);
const STAMP = new Date().toISOString().replace("T", " ").slice(0, 16);

const day = (iso) => Math.round((Date.parse(TODAY) - Date.parse(iso)) / 86400000);
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || "").trim());
const money = (n) => `$${Number(n).toLocaleString("en-US")}`;

function load() {
  const dir = path.join(ROOT, P.outreachDir());
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    let fm;
    try {
      fm = P.parseFrontmatter(fs.readFileSync(path.join(dir, f), "utf8"));
    } catch {
      continue;
    }
    if (String(fm.type || "").trim() !== "outreach") continue;
    out.push({ file: f, ...fm });
  }
  // deterministic: newest-first by created, then filename
  return out.sort((a, b) =>
    String(b.created || "").localeCompare(String(a.created || "")) || a.file.localeCompare(b.file)
  );
}

function bucket(records) {
  const overdue = [], sent = [], replied = [], dormant = [], closed = [];
  for (const r of records) {
    const s = String(r.status || "").trim();
    if (s === "sent" && isDate(r.follow_up_at) && r.follow_up_at < TODAY) overdue.push(r);
    else if (s === "sent") sent.push(r);
    else if (s === "replied") replied.push(r);
    else if (s === "dormant") dormant.push(r);
    else if (s === "won" || s === "lost") closed.push(r);
    // `drafted` is deliberately absent from the board (spec §5): nothing was sent
  }
  overdue.sort((a, b) => String(a.follow_up_at).localeCompare(String(b.follow_up_at)));
  return { overdue, sent, replied, dormant, closed };
}

function movement(records) {
  const since7 = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const since28 = new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
  const sentN = records.filter((r) => isDate(r.sent_at) && r.sent_at >= since7).length;
  const repliesN = records.filter((r) => isDate(r.replied_at) && r.replied_at >= since7).length;
  // spec §10: reply rate = replies ÷ sent, trailing 4 weeks
  const sent4w = records.filter((r) => isDate(r.sent_at) && r.sent_at >= since28).length;
  const replies4w = records.filter((r) => isDate(r.replied_at) && r.replied_at >= since28).length;
  const rate = sent4w ? Math.round((replies4w / sent4w) * 100) : 0;
  const gaps = records
    .filter((r) => isDate(r.sent_at) && isDate(r.replied_at))
    .map((r) => day(r.sent_at) - day(r.replied_at))
    .sort((a, b) => a - b);
  const median = gaps.length ? gaps[Math.floor(gaps.length / 2)] : null;
  return { sentN, repliesN, rate, sent4w, replies4w, median };
}

/**
 * Gate B (spec §6) — the revenue gate. ONE home for the thresholds so the board
 * and the weekly review can never disagree about what failed.
 *
 * Two failure modes, deliberately separate:
 *   `sent = 0`                      → discipline failure (the week was not deployed)
 *   `sent ≥ 5` AND `replies = 0`    → positioning failure (shooting, missing everything)
 * Conflating them hides the diagnosis.
 */
function gateLines(m, overdueCount) {
  const L = [];
  let verdict;
  if (m.sentN === 0) {
    verdict = "🔴 FAIL — `sent = 0`";
    L.push("> [!danger] 🔴 **FAIL — `sent = 0`**");
    L.push("> Nothing went out this week. **The week was not deployed.** This is a *discipline* failure, not a positioning one.");
  } else if (m.sentN < 3) {
    verdict = `🟡 WARN — sent ${m.sentN}, below the floor of 3`;
    L.push(`> [!warning] 🟡 **WARN — sent ${m.sentN}, below the deployment floor of 3**`);
    L.push("> Above zero, below the floor. The floor sits under the Cycle 2 target of 5–10/week — **it is the alarm, not the goal.**");
  } else if (m.sentN >= 5 && m.repliesN === 0) {
    verdict = "🔴 FAIL — volume without response";
    L.push("> [!danger] 🔴 **FAIL — volume without response**");
    L.push("> `sent ≥ 5` with `replies = 0`. A *positioning* failure — **change the channel or the message**, not the effort.");
  } else {
    verdict = `✅ PASS — sent ${m.sentN}, replies ${m.repliesN}`;
    L.push(`> [!success] ✅ **PASS — sent ${m.sentN}, replies ${m.repliesN}**`);
  }
  if (overdueCount) {
    L.push(">");
    L.push(`> [!warning] 🟡 **WARN — ${overdueCount} overdue follow-up(s)** · Gate A carries the action (they appear in \`3lm start --context\`)`);
  }
  return { lines: L, verdict };
}

/**
 * Gate B cell for the Outreach Tracker's weekly row — one line combining the
 * primary verdict with the overdue WARN, both from `gateLines` (the single home
 * for the thresholds). `Sweeper – Enhance MOCs & Trackers` pastes it into the row.
 */
function trackerGateCell(m, overdueCount) {
  const { verdict } = gateLines(m, overdueCount);
  return overdueCount ? `${verdict} · +${overdueCount} overdue` : verdict;
}

function render(records) {
  const { overdue, sent, replied, dormant, closed } = bucket(records);
  const m = movement(records);
  // spec §10: open pipeline value = Σ expected_value where status ∈ {sent, replied}
  const pipeline = [...sent, ...replied].reduce((s, r) => s + (Number(r.expected_value) || 0), 0);

  const row = (r, cols) =>
    `| ${cols.map((c) => c(r)).join(" | ")} |`;

  const L = [];
  L.push("# 📮 Outreach Board", "");
  L.push(`> Generated ${STAMP} · **${records.length} records** · **${overdue.length} overdue**`);
  L.push(">");
  L.push("> *Generated by `Tools/outreach-board.js` — never hand-edit. Files are truth; this is a projection.*");
  L.push("");

  const table = (recs, cols, head) => {
    // Always render the heading — a section at (0) is information, not noise.
    // The board must be able to say "nothing is overdue" out loud.
    L.push(`## ${head}`, "");
    if (!recs.length) {
      L.push("_none_", "");
      return;
    }
    L.push(`| ${cols.map((c) => c.h).join(" | ")} |`);
    L.push(`|${cols.map(() => "---").join("|")}|`);
    for (const r of recs) L.push(row(r, cols.map((c) => c.v)));
    L.push("");
  };

  table(overdue, [
    { h: "Counterparty", v: (r) => `**${r.counterparty || r.file}**` },
    { h: "Channel", v: (r) => r.channel || "—" },
    { h: "Sent", v: (r) => r.sent_at || "—" },
    { h: "Due", v: (r) => r.follow_up_at || "—" },
    { h: "Late", v: (r) => `${day(r.follow_up_at)}d` },
    { h: "Next action", v: (r) => String(r.next_action || "—").slice(0, 70) },
  ], `⏰ OVERDUE (${overdue.length})`);

  table(sent, [
    { h: "Counterparty", v: (r) => r.counterparty || r.file },
    { h: "Channel", v: (r) => r.channel || "—" },
    { h: "Sent", v: (r) => r.sent_at || "—" },
    { h: "Follow up", v: (r) => r.follow_up_at || "—" },
  ], `✉️ SENT · awaiting (${sent.length})`);

  if (replied.length) {
    L.push(`## 💬 REPLIED · in play (${replied.length})   ← open pipeline value: **${money(pipeline)}**`, "");
    L.push("| Counterparty | Channel | Replied | Next action |");
    L.push("|---|---|---|---|");
    for (const r of replied) {
      L.push(`| ${r.counterparty || r.file} | ${r.channel || "—"} | ${r.replied_at || "—"} | ${String(r.next_action || "—").slice(0, 60)} |`);
    }
    L.push("");
  } else {
    L.push("## 💬 REPLIED · in play (0)", "");
    L.push("_No one has replied yet — this is the metric the entity exists to move._", "");
  }

  table(dormant, [
    { h: "Counterparty", v: (r) => r.counterparty || r.file },
    { h: "Parked until", v: (r) => r.follow_up_at || "—" },
  ], `😴 DORMANT (${dormant.length})`);

  table(closed, [
    { h: "Counterparty", v: (r) => r.counterparty || r.file },
    { h: "Result", v: (r) => r.status },
    { h: "Closed", v: (r) => r.closed_at || "—" },
    { h: "Outcome", v: (r) => String(r.outcome || "—").slice(0, 60) },
  ], `🏁 CLOSED (${closed.length})`);

  // Gate B counters + thresholds (spec §6, §10) — rendered here so the weekly
  // review can read them, and so the gate is visible before the review exists.
  L.push("## 📊 Movement (trailing 7 days)", "");
  L.push(`- Sent: **${m.sentN}** · **Replies: ${m.repliesN}** · Reply rate: **${m.rate}%** (trailing 4w: ${m.replies4w}/${m.sent4w})`);
  L.push(`- Median time-to-first-reply: ${m.median === null ? "— (no replies yet)" : `${m.median} days`}`);
  L.push(`- Open pipeline value: **${money(pipeline)}** · Overdue: **${overdue.length}**`);
  L.push("");

  // Deployment floor = 3 (spec §6); the floor is the ALARM, not the goal.
  L.push("### 🚦 Gate B — the revenue gate", "");
  L.push(...gateLines(m, overdue.length).lines);
  L.push("");
  L.push("---");
  L.push("*Generated via AI-Suplex — Outreach Entity spec §5. TWABAM ⚡*");

  return L.join("\n") + "\n";
}

function main() {
  const argv = process.argv.slice(2);
  const records = load();
  const md = render(records);
  const { overdue, sent, replied, dormant, closed } = bucket(records);

  if (argv.includes("--gate-b")) {
    // Standalone lead section for the Weekly Review (spec §6). One source of truth
    // for the thresholds — the review and the board can never disagree.
    const { overdue, sent, replied } = bucket(records);
    const m = movement(records);
    const pipeline = [...sent, ...replied].reduce((s, r) => s + (Number(r.expected_value) || 0), 0);
    const g = gateLines(m, overdue.length);
    console.log("## 🚦 Outreach — Gate B (weekly revenue gate)", "");
    console.log(`- Sent this week: **${m.sentN}** · **Replies: ${m.repliesN}** ← the headline`);
    console.log(`- Reply rate: **${m.rate}%** (trailing 4w: ${m.replies4w}/${m.sent4w})`);
    console.log(`- Overdue follow-ups: **${overdue.length}**`);
    console.log(`- Open pipeline value: **${money(pipeline)}**`);
    console.log("");
    console.log(g.lines.join("\n"));
    return;
  }
  if (argv.includes("--tracker-row")) {
    // One tracker-table line — the 7 data cells (no outer pipes) for the Sweeper
    // to paste into `Trackers/Outreach Tracker.md`. All metric + gate logic stays
    // here (single source of truth); the Sweeper only prepends the cycle·week label.
    const m = movement(records);
    const pipeline = [...sent, ...replied].reduce((s, r) => s + (Number(r.expected_value) || 0), 0);
    const ttr = m.median === null ? "—" : `${m.median} day${m.median === 1 ? "" : "s"}`;
    console.log([
      String(m.sentN),
      `**${m.repliesN}**`,
      `${m.rate}% (${m.replies4w}/${m.sent4w})`,
      String(overdue.length),
      money(pipeline),
      ttr,
      trackerGateCell(m, overdue.length),
    ].join(" | "));
    return;
  }
  if (argv.includes("--json")) {
    console.log(JSON.stringify({
      records: records.length, overdue: overdue.length, sent: sent.length,
      replied: replied.length, dormant: dormant.length, closed: closed.length,
      movement: movement(records),
    }, null, 2));
    return;
  }
  if (argv.includes("--dry")) {
    process.stdout.write(md);
    return;
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, md, "utf8");
  console.log(`📮 Outreach Board → ${path.relative(ROOT, OUT)}`);
  console.log(`   ${records.length} records · ${overdue.length} overdue · ${replied.length} in play`);
}

if (require.main === module) main();
module.exports = { load, bucket, render, movement, gateLines, trackerGateCell };
