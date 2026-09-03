// Sweeper – Start New Cycle.js
// Seeds a new cycle by loading previous cycle context via 3lm.
// Run at the start of a new 7-week cycle.

const { execSync } = require("child_process");
const path = require("path");

module.exports = async (quickAdd) => {
  const { app } = quickAdd;
  const vault = app.vault;

  // Determine current cycle from date
  const now = new Date();
  const month = now.getMonth() + 1;
  const cycle = Math.ceil(month / 2) || 1;
  const prevCycle = cycle - 1;
  const cycleDir = `Cycle-${cycle}`;
  const prevCycleDir = `Cycle-${prevCycle}`;

  new Notice(`Starting Cycle ${cycle}...`, 2000);

  // Ensure new cycle folder structure
  const folders = [
    `AI-Suplex-777/Artifacts/${cycleDir}`,
    `AI-Suplex-777/B-Bombs/${cycleDir}`,
    `AI-Suplex-777/Insights/${cycleDir}`,
    `AI-Suplex-777/Memory/episodic/${cycleDir}`,
    `AI-Suplex-777/Reviews/Weekly/${cycleDir}`,
    `AI-Suplex-777/Sessions/Active/Start`,
    `AI-Suplex-777/Sessions/Active/End`,
  ];

  for (const folder of folders) {
    if (!(await vault.adapter.exists(folder))) {
      await vault.createFolder(folder);
    }
  }

  // Load previous cycle context via 3lm start
  try {
    const vaultPath = app.vault.adapter.basePath;
    const cwd = vaultPath + "/AI-Suplex-777";
    execSync("node Tools/3lm.js start", {
      encoding: "utf8",
      timeout: 15000,
      stdio: "pipe",
      cwd,
    });
    new Notice("✅ Previous cycle context loaded via 3lm start", 2000);
  } catch (e) {
    console.error("3lm start error: " + e.message);
  }

  // Extract lessons from previous cycle
  try {
    const vaultPath = app.vault.adapter.basePath;
    const cwd = vaultPath + "/AI-Suplex-777";
    execSync("node Tools/3lm.js learn", {
      encoding: "utf8",
      timeout: 15000,
      stdio: "pipe",
      cwd,
    });
    new Notice("✅ Previous cycle lessons extracted", 2000);
  } catch (e) {
    console.error("3lm learn error: " + e.message);
  }

  // Refresh index
  try {
    const vaultPath = app.vault.adapter.basePath;
    const cwd = vaultPath + "/AI-Suplex-777";
    execSync("node Tools/3lm.js index", {
      encoding: "utf8",
      timeout: 15000,
      stdio: "pipe",
      cwd,
    });
    new Notice("✅ Memory index refreshed", 2000);
  } catch (e) {
    console.error("3lm index error: " + e.message);
  }

  new Notice(`✅ Cycle ${cycle} started. Previous context loaded.`, 3000);
};
