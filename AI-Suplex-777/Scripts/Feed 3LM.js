// Feed 3LM.js – 7‑7‑7 Edition (was Feed CortexMem.js)
// Captures insights directly into the 3-layer memory stack.
// Appends to Memory/lessons.md for 3lm promote scoring.
// Also logs to Insights/Cycle X/Week Y.md for dashboard visibility.

module.exports = async (quickAdd) => {
  const { app, quickAddApi } = quickAdd;
  const vault = app.vault;

  // Helper: ensure file exists
  async function ensureFile(filePath, defaultContent) {
    if (!(await vault.adapter.exists(filePath))) {
      await vault.create(filePath, defaultContent);
    }
  }

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

  async function ensureFolder(folderPath) {
    if (!(await vault.adapter.exists(folderPath))) {
      await vault.createFolder(folderPath);
    }
  }

  const focusOptions = await getFocuses();
  const focus = await quickAddApi.suggester(
    focusOptions,
    focusOptions,
    "Select focus area for this insight",
  );
  if (!focus) {
    new Notice("Feed 3LM cancelled.");
    return;
  }

  const cycleOptions = [1, 2, 3, 4, 5, 6, 7];
  const cycle = await quickAddApi.suggester(
    cycleOptions,
    cycleOptions,
    "Select cycle (1-7)",
  );
  const weekOptions = [1, 2, 3, 4, 5, 6, 7];
  const week = await quickAddApi.suggester(
    weekOptions,
    weekOptions,
    "Select week (1-7)",
  );

  const insightText = await quickAddApi.inputPrompt(
    "What did you learn? (appended directly to 3lm Memory/lessons.md)",
    null,
    { multiline: true },
  );
  if (!insightText || !insightText.trim()) {
    new Notice("No insight entered.");
    return;
  }

  const now = new Date();
  const timestamp =
    now.toISOString().slice(0, 10) + " " + now.toTimeString().slice(0, 5);
  const safeText = insightText.replace(/\n/g, " ").replace(/"/g, "'");

  // --- Save to Insights log (dashboard visibility) ---
  const insightsFolder = "AI-Suplex-777/Insights/Cycle " + cycle;
  await ensureFolder(insightsFolder);
  const insightsFile = insightsFolder + "/Week " + week + ".md";
  await ensureFile(
    insightsFile,
    "# Insights – Cycle " + cycle + ", Week " + week + "\n\n",
  );

  let insightsVaultFile = vault.getAbstractFileByPath(insightsFile);
  const insightBullet =
    "- **" + timestamp + "** – *" + focus + "* 🧠 – " + safeText + "\n";
  await vault.append(insightsVaultFile, insightBullet);

  // --- Feed directly into 3lm Memory/lessons.md ---
  const lessonsPath = "AI-Suplex-777/Memory/lessons.md";
  const lessonsDefault =
    "# 🧠 Lessons — Candidate Learnings\n\n> Staging area for insights waiting for 3lm promote.\n> Lessons scoring 70+ on Saturday's promote run are promoted to semantic/procedural memory.\n\n";
  await ensureFile(lessonsPath, lessonsDefault);

  let lessonsFile = vault.getAbstractFileByPath(lessonsPath);
  const lessonEntry =
    "- [" +
    timestamp +
    "] **[" +
    focus +
    "]** " +
    safeText +
    " *(fed via Feed 3LM)*\n";
  await vault.append(lessonsFile, lessonEntry);

  new Notice(
    "🧠 Insight fed to 3lm Memory/lessons.md | Will be scored on next 3lm promote\n" +
      "💡 Also logged to Insights/Cycle " +
      cycle +
      "/Week " +
      week +
      ".md",
    5000,
  );
};
