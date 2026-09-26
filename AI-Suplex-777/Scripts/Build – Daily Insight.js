// Build – Daily Insight.js
// ⚠️ LEGACY — CortexMem retired. Use Insight macro for insight logging.
// 3lm end→learn handles memory automatically on session end.
// Captures a daily insight directly to cortexmem.

const { execSync } = require("child_process");
const NODE = "/usr/bin/node";
const CORTEXMEM = "/home/kmagwenzi/.npm-global/bin/cortexmem";

function cortexmem(args) {
  // QuickAdd/Obsidian may not have node in PATH, so use full path
  try {
    execSync(`${NODE} ${CORTEXMEM} ${args}`, {
      encoding: "utf8",
      timeout: 15000,
      stdio: "pipe",
    });
    return true;
  } catch (e) {
    console.error(`cortexmem error: ${e.message}`);
    return false;
  }
}

module.exports = async (quickAdd) => {
  const { app, quickAddApi } = quickAdd;
  const vault = app.vault;

  async function getFocuses() {
    const focusesPath = "AI-Suplex-777/Focuses.md";
    if (!(await vault.adapter.exists(focusesPath))) {
      return [
        "ai-engineering",
        "wqr",
        "freelance",
        "digital-products",
        "content-creation",
      ];
    }
    const content = await vault.adapter.read(focusesPath);
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return [];
    const frontmatter = match[1];
    const nameMatches = [...frontmatter.matchAll(/name:\s*(\S+)/g)];
    return nameMatches.map((m) => m[1]);
  }

  const focusOptions = await getFocuses();
  const focus = await quickAddApi.suggester(
    focusOptions,
    focusOptions,
    "Select focus area for this insight",
  );
  if (!focus) {
    new Notice("Insight capture cancelled.");
    return;
  }

  const insightText = await quickAddApi.inputPrompt(
    "What did you learn?",
    null,
    { multiline: true },
  );
  if (!insightText || !insightText.trim()) {
    new Notice("No insight entered.");
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  const safeText = insightText.replace(/"/g, "'").slice(0, 1000);

  const saved = cortexmem(
    `save_context --type insight --space "${focus}" --content "${safeText}" --tags "${focus},insight,${date}"`,
  );

  if (saved) {
    new Notice(`🧠 Insight saved to cortexmem for ${focus}`);
  } else {
    new Notice("⚠️ Insight captured but cortexmem save failed");
  }
};
