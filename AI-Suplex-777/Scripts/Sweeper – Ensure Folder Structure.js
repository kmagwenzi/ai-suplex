// Sweeper – Ensure Folder Structure.js
// Creates the complete folder hierarchy for AI‑Suplex 7‑7‑7 Edition.
// Run once after unzipping the vault (the period-scoped subfolders are then
// created by Tools/initialise-vault.js or the cycle/rollover macros).

module.exports = async (quickAdd) => {
    const { app, quickAddApi } = quickAdd;
    const vault = app.vault;

    // ── Paths (Period Structure, decision ④): shared module + inlined fallback ──
    const PC = (() => { try { return require("Scripts/lib/paths.js"); } catch (_) {
      const PERIOD_FILE = "AI-Suplex-777/period.md", PRE = "0000-Build";
      const j = (...p) => p.map(x => String(x).replace(/^\/+|\/+$/g, "")).filter(Boolean).join("/");
      const bind = (label) => ({
        label,
        reviewWeeklyDir: () => j("AI-Suplex-777", "Reviews", label, "Weekly"),
        periodPlanDir:   () => j("AI-Suplex-777", "Plans", label),
        periodCardDir:   () => j("AI-Suplex-777", "MOCs", label),
        outreachDir:     () => j("AI-Suplex-777", "Outreach", label),
      });
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

    // Base root
    await ensureFolder("AI-Suplex-777");

    // Sessions
    await ensureFolder("AI-Suplex-777/Sessions");
    await ensureFolder("AI-Suplex-777/Sessions/Active");
    await ensureFolder("AI-Suplex-777/Sessions/Active/Start");
    await ensureFolder("AI-Suplex-777/Sessions/Active/End");
    await ensureFolder("AI-Suplex-777/Sessions/Archive");
    await ensureFolder("AI-Suplex-777/Sessions/Archive/Start");
    await ensureFolder("AI-Suplex-777/Sessions/Archive/End");

    // Artifacts, B‑Bombs, Insights (base roots; cycle subfolders are period-scoped)
    await ensureFolder("AI-Suplex-777/Artifacts");
    await ensureFolder("AI-Suplex-777/B-Bombs");
    await ensureFolder("AI-Suplex-777/Insights");

    // MOCs and Trackers (will be populated by Sweeper scripts)
    await ensureFolder("AI-Suplex-777/MOCs");
    await ensureFolder("AI-Suplex-777/Trackers");

    // Tasklists
    await ensureFolder("AI-Suplex-777/Tasklists");
    await ensureFolder("AI-Suplex-777/Tasklists/Combined");
    await ensureFolder("AI-Suplex-777/Tasklists/RawTasks");

    // Reviews and Plans — Reviews/Weekly is PERIOD-scoped (Reviews/<Period>/Weekly),
    // never the pre-refactor `Reviews/Weekly` root.
    await ensureFolder("AI-Suplex-777/Reviews");
    await ensureFolder(P.reviewWeeklyDir());
    await ensureFolder("AI-Suplex-777/Plans");
    await ensureFolder(P.periodPlanDir());
    await ensureFolder(P.periodCardDir());
    await ensureFolder(P.outreachDir());

    // Quality notes (for Architect long reviews)
    await ensureFolder("AI-Suplex-777/QualityNotes");

    // AI-Suplex Kick-start folder and user project space
    await ensureFolder("AI-Suplex-777/AI-Suplex Kick-start");
    await ensureFolder("AI-Suplex-777/AI-Suplex Kick-start/Project");

    new Notice("Folder structure for AI‑Suplex 7‑7‑7 Edition has been created/verified.", 5000);
};
