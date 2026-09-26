// Sweeper – Ensure Folder Structure (Current Cycle).js
// Creates all required AI-Suplex-777 folders for the given cycle.
// Run once per cycle (or when setting up a new vault).

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
      outreachDir: ()    => j("AI-Suplex-777","Outreach",label),
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

  // Cycle-specific folders: Artifacts/<Period>/Cycle X/Week 1..7, B-Bombs similarly, Next Steps/<Period>/Cycle X
  for (let week = 1; week <= 7; week++) {
    await ensureFolder(P.artifactDir(cycle, week));
    await ensureFolder(P.bBombDir(cycle, week));
  }
  await ensureFolder(P.insightDir(cycle));
  await ensureFolder(P.nextStepsDir(cycle));
  // Outreach is NOT cycle-scoped (Outreach spec §7) — one period-level tree every
  // cycle writes into, so a follow-up never disappears at a cycle boundary.
  await ensureFolder(P.outreachDir());

  // Insight files: /AI-Suplex-777/Insights/<Period>/Cycle X/Week Y.md (per-week files, not folders)
  const header = `# Insights – Cycle ${cycle}, Week `;
  for (let week = 1; week <= 7; week++) {
    const filePath = P.insightFile(cycle, week);
    if (!(await vault.adapter.exists(filePath))) {
      await vault.create(filePath, header + `${week}\n\n`);
      console.log(`Created insight file: ${filePath}`);
    }
  }

  // Plan folder for this cycle
  await ensureFolder(P.planDir(cycle));

  new Notice(`Folder structure for Cycle ${cycle} created/verified.`, 4000);
};
