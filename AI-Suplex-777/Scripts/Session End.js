// Session End.js – 7‑7‑7 Edition
// Captures rating, completion status, insights, next actions.
// Reads focus, cycle, week from the corresponding session start file (by matching filename).
// Chains 3lm memory loop: end → learn → index after report is saved.

module.exports = async (quickAdd) => {
  const { quickAddApi, app } = quickAdd;
  const vault = app.vault;

  // Helper: find most recent session start file to inherit focus/cycle/week
  async function getLatestSessionStart() {
    const startFolder = "AI-Suplex-777/Sessions/Active/Start";
    if (!(await vault.adapter.exists(startFolder))) return null;
    const files = vault
      .getMarkdownFiles()
      .filter((f) => f.path.startsWith(startFolder));
    if (files.length === 0) return null;
    const withStats = await Promise.all(
      files.map(async (f) => ({
        file: f,
        stat: await vault.adapter.stat(f.path),
      })),
    );
    withStats.sort((a, b) => b.stat.mtime - a.stat.mtime);
    return withStats[0].file;
  }

  // Helper: run 3lm command from inside the vault
  function exec3lm(command) {
    try {
      const { execSync } = require("child_process");
      const vaultPath = app.vault.adapter.basePath;
      const cwd = vaultPath + "/AI-Suplex-777";
      const cmd = `node Tools/3lm.js ${command}`;
      return execSync(cmd, {
        encoding: "utf8",
        timeout: 30000,
        stdio: "pipe",
        cwd,
      });
    } catch (e) {
      console.error("3lm " + command + " error: " + e.message);
      return null;
    }
  }

  let focus = "",
    cycle = "",
    week = "";
  const latestStart = await getLatestSessionStart();
  if (latestStart) {
    const content = await vault.read(latestStart);
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      const fm = fmMatch[1];
      const focusMatch = fm.match(/focus:\s*(\w+)/);
      if (focusMatch) focus = focusMatch[1];
      const cycleMatch = fm.match(/cycle:\s*(\d+)/);
      if (cycleMatch) cycle = cycleMatch[1];
      const weekMatch = fm.match(/week:\s*(\d+)/);
      if (weekMatch) week = weekMatch[1];
    }
  }
  if (!focus) focus = await quickAddApi.inputPrompt("Focus (if not inherited)");
  if (!cycle) cycle = await quickAddApi.inputPrompt("Cycle (1-7)");
  if (!week) week = await quickAddApi.inputPrompt("Week (1-7)");

  const rating = await quickAddApi.suggester(
    ["1", "2", "3", "4", "5"],
    [1, 2, 3, 4, 5],
    "Session rating (1-5)",
  );
  const completionStatus = await quickAddApi.suggester(
    ["completed", "partial", "blocked"],
    ["completed", "partial", "blocked"],
    "Completion status",
  );
  const keyInsights = await quickAddApi.inputPrompt(
    "Key insights (one sentence, can edit later)",
  );
  const nextActions = await quickAddApi.inputPrompt(
    "Next actions (one sentence, can edit later)",
  );
  const narrative = await quickAddApi.inputPrompt(
    "Session narrative (optional)",
    null,
    { multiline: true },
  );

  const now = new Date();
  const formattedDate = now.toISOString().slice(0, 10);
  const timeForFilename = now.toISOString().slice(11, 16).replace(":", "");
  const fileName = `${formattedDate}-${timeForFilename}-${focus}-session-end.md`;
  const filePath = `AI-Suplex-777/Sessions/Active/End/${fileName}`;

  const frontmatter = `---
tags:
  - session
  - end
  - ${focus}
  - #7/${cycle}/${week}
date: ${formattedDate}
time: ${now.toTimeString().slice(0, 5)}
focus: ${focus}
cycle: ${cycle}
week: ${week}
session_rating: ${rating}
completion_status: ${completionStatus}
key_insights: "${keyInsights || ""}"
next_actions: "${nextActions || ""}"
---

# AI-Suplex: Session End

## Session Narrative
${narrative || ""}

## Key Insights
- ${keyInsights || ""}

## Next Actions
- ${nextActions || ""}

## Quick Links
- [[Insights]]
- [[B-Bombs]]
- [[Artifacts]]

---
*Session ended via QuickAdd script macro (7‑7‑7 Edition)*
`;

  await vault.create(filePath, frontmatter);
  const file = vault.getAbstractFileByPath(filePath);
  await app.workspace.openLinkText(file.path, "", false);
  new Notice(`Session End created: ${fileName}`, 3000);

  // --- 3lm Memory Loop ---
  // Write episode, extract lessons, refresh index — all in background
  new Notice("🧠 Running 3lm memory loop...", 2000);

  const endResult = exec3lm("end");
  if (endResult !== null) {
    exec3lm("learn");
    exec3lm("index");
    new Notice(
      "✅ Memory updated — episode written, lessons extracted, index refreshed",
      4000,
    );
  } else {
    new Notice(
      "⚠️ 3lm not available — memory update skipped (run manually: node Tools/3lm.js end → learn → index)",
      5000,
    );
  }
};
