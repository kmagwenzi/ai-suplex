// Sweeper – Ensure Folder Structure (Current Cycle).js
// Creates all required AI-Suplex-777 folders for the given cycle.
// Run once per cycle (or when setting up a new vault).

module.exports = async (quickAdd) => {
  const { app, quickAddApi } = quickAdd;
  const vault = app.vault;

  async function ensureFolder(folderPath) {
    if (!(await vault.adapter.exists(folderPath))) {
      await vault.createFolder(folderPath);
      console.log(`Created folder: ${folderPath}`);
    }
  }

  const cycle = await quickAddApi.inputPrompt("Cycle number (1-7)", "e.g., 1");
  if (!cycle || cycle < 1 || cycle > 7) {
    new Notice("Invalid cycle. Aborting.");
    return;
  }

  // Top-level folders
  const topFolders = [
    "AI-Suplex-777/Sessions",
    "AI-Suplex-777/Sessions/Active",
    "AI-Suplex-777/Sessions/Active/Start",
    "AI-Suplex-777/Sessions/Active/End",
    "AI-Suplex-777/Sessions/Archive",
    "AI-Suplex-777/Sessions/Archive/Start",
    "AI-Suplex-777/Sessions/Archive/End",
    "AI-Suplex-777/Artifacts",
    "AI-Suplex-777/B-Bombs",
    "AI-Suplex-777/Insights",
    "AI-Suplex-777/Next Steps",
    "AI-Suplex-777/MOCs",
    "AI-Suplex-777/Trackers",
    "AI-Suplex-777/Skills",
    "AI-Suplex-777/Plans",
    "AI-Suplex-777/Reviews",
    "AI-Suplex-777/Reviews/Weekly",
    "AI-Suplex-777/Tasklists",
    "AI-Suplex-777/Tasklists/Combined",
    "AI-Suplex-777/Tasklists/RawTasks",
    "AI-Suplex-777/QualityNotes",
  ];

  for (const folder of topFolders) {
    await ensureFolder(folder);
  }

  // Cycle-specific folders: Artifacts/Cycle X/Week 1..7, B-Bombs similarly, Next Steps/Cycle X
  for (let week = 1; week <= 7; week++) {
    await ensureFolder(`AI-Suplex-777/Artifacts/Cycle ${cycle}/Week ${week}`);
    await ensureFolder(`AI-Suplex-777/B-Bombs/Cycle ${cycle}/Week ${week}`);
  }
  await ensureFolder(`AI-Suplex-777/Insights/Cycle ${cycle}`);
  await ensureFolder(`AI-Suplex-777/Next Steps/Cycle ${cycle}`);

  // Insight files: /AI-Suplex-777/Insights/Cycle X/Week Y.md (per-week files, not folders)
  const header = `# Insights – Cycle ${cycle}, Week `;
  for (let week = 1; week <= 7; week++) {
    const filePath = `AI-Suplex-777/Insights/Cycle ${cycle}/Week ${week}.md`;
    if (!(await vault.adapter.exists(filePath))) {
      await vault.create(filePath, header + `${week}\n\n`);
      console.log(`Created insight file: ${filePath}`);
    }
  }

  // Plan folder for this cycle
  await ensureFolder(`AI-Suplex-777/Plans/Cycle ${cycle}`);

  new Notice(`Folder structure for Cycle ${cycle} created/verified.`, 4000);
};
