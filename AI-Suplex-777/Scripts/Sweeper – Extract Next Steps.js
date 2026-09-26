// Extract Next Steps from Frontmatter – AI‑Suplex Sweeper Skill (Fixed)
// Scans Artifacts, B‑Bombs, Session End files for next_actions frontmatter
// Appends to Next Steps/<Period>/Cycle X/Week X.md, respecting last processed timestamp

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

    // --- Helper: ensure folder exists ---
    async function ensureFolder(folderPath) {
        if (!(await vault.adapter.exists(folderPath))) {
            await vault.createFolder(folderPath);
        }
    }

    // --- Helper: read file frontmatter (simple regex) ---
    function parseFrontmatter(content) {
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) return {};
        const frontmatter = frontmatterMatch[1];
        const result = {};
        const lines = frontmatter.split('\n');
        for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) continue;
            let key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            result[key] = value;
        }
        return result;
    }

    // --- Helper: get last processed timestamp ---
    const timestampFilePath = 'AI-Suplex-777/Next Steps/.last_processed';
    async function getLastProcessed() {
        if (await vault.adapter.exists(timestampFilePath)) {
            const content = await vault.adapter.read(timestampFilePath);
            return new Date(content.trim());
        }
        // Default: start of time (or you can set to a recent date)
        return new Date(0);
    }

    async function setLastProcessed(date) {
        await vault.adapter.write(timestampFilePath, date.toISOString());
    }

    // --- Helper: append entry to weekly Next Steps file ---
    async function appendNextStep(cycle, week, capturedDate, taskText, sourcePath) {
        const folderPath = P.nextStepsDir(cycle);
        await ensureFolder(folderPath);
        const filePath = `${folderPath}/Week ${week}.md`;
        let file = vault.getAbstractFileByPath(filePath);
        if (!file) {
            await vault.create(filePath, `# Next Steps – Cycle ${cycle}, Week ${week}\n\n`);
            file = vault.getAbstractFileByPath(filePath);
        }
        const timestamp = `${capturedDate.toISOString().slice(0,10)} ${capturedDate.toTimeString().slice(0,5)}`;
        const entry = `- **${timestamp}** – ${taskText}  \n  [Source: ${sourcePath}]\n`;
        await vault.append(file, entry);
    }

    // --- Main logic ---
    const lastProcessed = await getLastProcessed();
    const now = new Date();
    let anyAdded = false;

    // Define folders to scan
    const scanFolders = [
        'AI-Suplex-777/Artifacts',
        'AI-Suplex-777/B-Bombs',
        'AI-Suplex-777/Sessions/Active/End'
    ];

    // Get all markdown files in vault
    const allFiles = vault.getMarkdownFiles();

    for (const file of allFiles) {
        const filePath = file.path;
        // Check if file belongs to any scan folder
        const inScanFolder = scanFolders.some(folder => filePath.startsWith(folder));
        if (!inScanFolder) continue;

        // Check file modification time
        const stat = await vault.adapter.stat(filePath);
        if (!stat) continue;
        const mtime = new Date(stat.mtime);
        if (mtime <= lastProcessed) continue;

        // Read file content
        const content = await vault.read(file);
        const frontmatter = parseFrontmatter(content);
        const nextActions = frontmatter.next_actions;
        if (!nextActions || nextActions.trim() === '') continue;

        // Determine cycle and week (from frontmatter or from folder path)
        let cycle = frontmatter.cycle;
        let week = frontmatter.week;
        if (!cycle || !week) {
            // Fallback: try to extract from path (e.g., Artifacts/<Period>/Cycle 1/Week 2/...)
            const cycleMatch = filePath.match(/Cycle (\d+)/i);
            const weekMatch = filePath.match(/Week (\d+)/i);
            if (cycleMatch) cycle = parseInt(cycleMatch[1]);
            if (weekMatch) week = parseInt(weekMatch[1]);
        }
        if (!cycle || !week) {
            console.warn(`Skipping ${filePath}: missing cycle/week`);
            continue;
        }

        // Append the next action
        await appendNextStep(cycle, week, mtime, nextActions, filePath);
        anyAdded = true;
    }

    // Update last processed timestamp if any entries were added
    if (anyAdded) {
        await setLastProcessed(now);
        new Notice(`Extracted next steps from files modified since last CTL generation.`, 3000);
    } else {
        new Notice(`No new next steps found since last extraction.`, 2000);
    }
};