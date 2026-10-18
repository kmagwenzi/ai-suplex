// Sweeper – Ensure Folder Structure (Single Week).js
// Creates Artifacts and B-Bombs folders for a single specified cycle/week.
// Useful when you only need folders for one week, not all 7.

module.exports = async (quickAdd) => {
  const { app, quickAddApi } = quickAdd;
  const vault = app.vault;

  // ── Paths (Period Structure, decision ④): shared module + inlined fallback ──
  const PC = (() => { try { return require("Scripts/lib/paths.js"); } catch (_) {
    const PERIOD_FILE = "AI-Suplex-777/period.md", PRE = "0000-Build";
    const j = (...p) => p.map(x => String(x).replace(/^\/+|\/+$/g, "")).filter(Boolean).join("/");
    const bind = (label) => { const per = c => Number(c) === 0 ? PRE : label; return {
      label,
      artifactDir: (c,w) => j("AI-Suplex-777","Artifacts",per(c),`Cycle ${c}`,`Week ${w}`),
      bBombDir:    (c,w) => j("AI-Suplex-777","B-Bombs",per(c),`Cycle ${c}`,`Week ${w}`),
      insightDir:  (c)   => j("AI-Suplex-777","Insights",per(c),`Cycle ${c}`),
      insightFile: (c,w) => j("AI-Suplex-777","Insights",per(c),`Cycle ${c}`,`Week ${w}.md`),
      reviewDir:   (c,w) => j("AI-Suplex-777","Reviews",per(c),"Weekly",`Cycle ${c}`,`Week ${w}`),
      reviewCycleDir:(c) => j("AI-Suplex-777","Reviews",per(c),"Weekly",`Cycle ${c}`),
      mocsDir:     (c)   => j("AI-Suplex-777","MOCs",per(c),"Weekly",`Cycle ${c}`),
      planDir:     (c)   => j("AI-Suplex-777","Plans",per(c),`Cycle ${c}`),
      periodPlanDir:()   => j("AI-Suplex-777","Plans",label),
      episodicDir: (c,w) => j("AI-Suplex-777","Memory","episodic",per(c),`Cycle-${c}`,`Week-${w}`),
      nextStepsDir:(c)   => j("AI-Suplex-777","Next Steps",per(c),`Cycle ${c}`),
      cycleDir: (tree,c) => j("AI-Suplex-777",tree,per(c),`Cycle ${c}`),
    }; };
    return { VAULT_PREFIX: "AI-Suplex-777", PRE_PERIOD: PRE, PERIOD_FILE, parseLabel: raw => { const m = String(raw||"").match(/^\s*period_label:\s*"?([^"\n]+?)"?\s*$/m); return m ? m[1].trim() : null; }, periodFor: (c,l) => Number(c)===0?PRE:l, joinPath: j, bind };
  } })();
  const P = await (async () => {
    const label = PC.parseLabel(await app.vault.adapter.read(PC.PERIOD_FILE));
    if (!label) throw new Error("period.md has no readable period_label");
    return PC.bind(label);
  })();

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

  await ensureFolder(P.artifactDir(cycle, week));
  await ensureFolder(P.bBombDir(cycle, week));
  await ensureFolder(`${P.cycleDir("Plans", cycle)}/Week ${week}`);

  // Insight file: /AI-Suplex-777/Insights/<Period>/Cycle X/Week Y.md (file, not folder)
  const insightPath = P.insightFile(cycle, week);
  if (!(await vault.adapter.exists(insightPath))) {
    await vault.adapter.mkdir(P.insightDir(cycle));
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
