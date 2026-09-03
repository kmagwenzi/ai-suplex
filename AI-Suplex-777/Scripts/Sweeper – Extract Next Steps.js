// Extract Next Steps from Frontmatter – AI‑Suplex Sweeper Skill (Fixed)
// Scans Artifacts, B‑Bombs, Session End files for next_actions frontmatter
// Appends to Next Steps/Cycle X/Week X.md, respecting last processed timestamp

module.exports = async (quickAdd) => {
    const { app, quickAddApi } = quickAdd;
    const vault = app.vault;

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
        const folderPath = `AI-Suplex-777/Next Steps/Cycle ${cycle}`;
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
            // Fallback: try to extract from path (e.g., Artifacts/Cycle 1/Week 2/...)
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