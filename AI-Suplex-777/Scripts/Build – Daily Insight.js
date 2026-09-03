// Build – Daily Insight.js
// ⚠️ DEPRECATED — Use Insight.js instead.
// Insight.js captures insights to Memory/lessons.md with 3lm learn.
// This script is kept for backward compatibility but redirects to Insight.js.

const { execSync } = require("child_process");

module.exports = async (quickAdd) => {
  const { app } = quickAdd;

  new Notice("⚠️ Use Insight.js instead — it captures to 3lm memory directly.", 5000);

  // Redirect to Insight.js behavior
  try {
    const vaultPath = app.vault.adapter.basePath;
    const cwd = vaultPath + "/AI-Suplex-777";

    // Run 3lm learn to extract any pending lessons
    execSync("node Tools/3lm.js learn", {
      encoding: "utf8",
      timeout: 15000,
      stdio: "pipe",
      cwd,
    });

    // Run 3lm index to refresh
    execSync("node Tools/3lm.js index", {
      encoding: "utf8",
      timeout: 15000,
      stdio: "pipe",
      cwd,
    });

    new Notice("✅ 3lm learn + index completed. Use Insight.js for future insights.", 3000);
  } catch (e) {
    console.error("3lm error: " + e.message);
    new Notice("⚠️ 3lm not available. Run manually: node Tools/3lm.js learn && index", 3000);
  }
};
