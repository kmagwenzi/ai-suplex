// Sweeper – Ensure Folder Structure.js
// Creates the complete folder hierarchy for AI‑Suplex 7‑7‑7 Edition.
// Run once after unzipping the vault.

module.exports = async (quickAdd) => {
    const { app, quickAddApi } = quickAdd;
    const vault = app.vault;

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

    // Artifacts, B‑Bombs, Insights (base folders; subfolders created by macros)
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

    // Reviews and Plans
    await ensureFolder("AI-Suplex-777/Reviews");
    await ensureFolder("AI-Suplex-777/Reviews/Weekly");
    await ensureFolder("AI-Suplex-777/Plans");

    // Quality notes (for Architect long reviews)
    await ensureFolder("AI-Suplex-777/QualityNotes");

    // AI-Suplex Kick-start folder and user project space
    await ensureFolder("AI-Suplex-777/AI-Suplex Kick-start");
    await ensureFolder("AI-Suplex-777/AI-Suplex Kick-start/Project");

    new Notice("Folder structure for AI‑Suplex 7‑7‑7 Edition has been created/verified.", 5000);
};