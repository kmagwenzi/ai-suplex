// Sweeper – Refresh Outreach Board.js
// Generates `MOCs/Outreach Board.md` from the Outreach records.
//
// The board is a PROJECTION — files are truth, this is never hand-edited
// (Outreach Entity spec §5). All logic lives in `Tools/outreach-board.js`:
//   overdue first → sent awaiting → replied (pipeline value) → dormant → closed
//   + the Movement block that feeds Gate B (sent = 0 fails loudly).
//
// This macro is a THIN WRAPPER by design — the same shape as
// `Sweeper – Refresh B-Bomb Index` shelling out to the node tools. It resolves
// no period path itself: `Tools/paths.js` reads `period.md` at runtime, so this
// file stays period-agnostic (Period Structure spec — "no literal label").
//
// Usage (Obsidian → QuickAdd): run "Sweeper – Refresh Outreach Board".

const { execSync } = require("child_process");

module.exports = async (quickAdd) => {
  const { app, Notice } = quickAdd;

  try {
    const vaultPath = app.vault.adapter.basePath;
    const cwd = vaultPath + "/AI-Suplex-777";

    const out = execSync("node Tools/outreach-board.js", {
      encoding: "utf8",
      timeout: 30000,
      stdio: "pipe",
      cwd,
    }).trim();

    // out is two lines: "📮 Outreach Board → MOCs/Outreach Board.md" + a summary
    const summary = out.split("\n").pop().trim();
    new Notice(`📮 Outreach Board refreshed\n${summary}`, 4000);
    console.log("[Refresh Outreach Board]", out);
  } catch (e) {
    new Notice("❌ Outreach Board failed — see console", 5000);
    console.error("[Refresh Outreach Board] " + (e.stderr || e.message));
  }
};
