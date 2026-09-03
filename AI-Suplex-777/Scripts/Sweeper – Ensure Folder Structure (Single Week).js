// Sweeper – Ensure Folder Structure (Single Week).js
// Creates Artifacts and B-Bombs folders for a single specified cycle/week.
// Useful when you only need folders for one week, not all 7.

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

  const week = await quickAddApi.inputPrompt("Week number (1-7)", "e.g., 1");
  if (!week || week < 1 || week > 7) {
    new Notice("Invalid week. Aborting.");
    return;
  }

  await ensureFolder(`AI-Suplex-777/Artifacts/Cycle ${cycle}/Week ${week}`);
  await ensureFolder(`AI-Suplex-777/B-Bombs/Cycle ${cycle}/Week ${week}`);
  await ensureFolder(`AI-Suplex-777/Plans/Cycle ${cycle}/Week ${week}`);

  // Insight file: /AI-Suplex-777/Insights/Cycle X/Week Y.md (file, not folder)
  const insightPath = `AI-Suplex-777/Insights/Cycle ${cycle}/Week ${week}.md`;
  if (!(await vault.adapter.exists(insightPath))) {
    await vault.adapter.mkdirp(`AI-Suplex-777/Insights/Cycle ${cycle}`);
    await vault.create(
      insightPath,
      `# Insights – Cycle ${cycle}, Week ${week}\n\n`,
    );
    console.log(`Created insight file: ${insightPath}`);
  }

  new Notice(
    `Folder structure for Cycle ${cycle}, Week ${week} created/verified.`,
    4000,
  );
};
