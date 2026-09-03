// Sweeper – Enhance MOCs & Trackers.js
// Scans recent sessions, updates MOCs with highlights, and updates current week's progress/blockers in Trackers.

module.exports = async (quickAdd) => {
    const { app, quickAddApi } = quickAdd;
    const vault = app.vault;

    async function readFocuses() {
        const focusesPath = "AI-Suplex-777/Focuses.md";
        if (!(await vault.adapter.exists(focusesPath))) return [];
        const content = await vault.adapter.read(focusesPath);
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        if (!match) return [];
        const frontmatter = match[1];
        const focuses = [];
        const nameMatches = [...frontmatter.matchAll(/name:\s*(\S+)/g)];
        const displayMatches = [...frontmatter.matchAll(/display:\s*(.+)/g)];
        for (let i = 0; i < nameMatches.length; i++) {
            focuses.push({
                name: nameMatches[i][1],
                display: displayMatches[i] ? displayMatches[i][1] : nameMatches[i][1]
            });
        }
        return focuses;
    }

    async function getRecentSessions(days = 7) {
        const sessions = [];
        const folders = ["AI-Suplex-777/Sessions/Active/End"];
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        for (const folder of folders) {
            if (!(await vault.adapter.exists(folder))) continue;
            const files = vault.getMarkdownFiles().filter(f => f.path.startsWith(folder));
            for (const file of files) {
                const stat = await vault.adapter.stat(file.path);
                if (stat && new Date(stat.mtime) < cutoff) continue;
                const content = await vault.read(file);
                const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
                if (!fmMatch) continue;
                const fm = fmMatch[1];
                const focusMatch = fm.match(/focus:\s*(\w+)/);
                const focus = focusMatch ? focusMatch[1] : null;
                const insightsMatch = content.match(/# Key Insights\n-\s*(.+)/);
                const insight = insightsMatch ? insightsMatch[1] : "";
                sessions.push({
                    date: new Date(stat.mtime),
                    focus,
                    insight,
                    filePath: file.path
                });
            }
        }
        return sessions;
    }

    const focuses = await readFocuses();
    if (!focuses.length) return;

    const cycle = await quickAddApi.inputPrompt("Current cycle (1-7)", "e.g., 1");
    const week = await quickAddApi.inputPrompt("Current week (1-7)", "e.g., 1");
    const recentSessions = await getRecentSessions(7);

    for (const focus of focuses) {
        const { name, display } = focus;
        const displaySafe = display.replace(/[\\/:*?"<>|]/g, '-');

        // Enhance MOC
        const mocPath = `AI-Suplex-777/MOCs/${displaySafe} MOC.md`;
        if (await vault.adapter.exists(mocPath)) {
            let mocContent = await vault.read(vault.getAbstractFileByPath(mocPath));
            const marker = "<!-- SWEEPER-HIGHLIGHTS -->";
            const highlightsStart = "## 🔥 Recent Highlights";
            let newHighlights = `${marker}\n${highlightsStart}\n`;
            const focusSessions = recentSessions.filter(s => s.focus === name).sort((a,b) => b.date - a.date).slice(0,3);
            if (focusSessions.length) {
                newHighlights += "**Recent sessions:**\n";
                for (const s of focusSessions) {
                    const dateStr = s.date.toISOString().slice(0,10);
                    newHighlights += `- **${dateStr}** – ${s.insight || "No insight recorded"}\n`;
                }
            } else {
                newHighlights += "No recent sessions.\n";
            }
            newHighlights += `\n> [!info] **Last enhanced:** ${new Date().toISOString().slice(0,19).replace('T', ' ')} by Sweeper.\n`;

            if (mocContent.includes(marker)) {
                const regex = new RegExp(`${marker}[\\s\\S]*?>\\[!info\\].*?\\n`, 'm');
                mocContent = mocContent.replace(regex, newHighlights);
            } else {
                const lines = mocContent.split('\n');
                let insertIndex = 0;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('# ')) { insertIndex = i+1; break; }
                }
                lines.splice(insertIndex, 0, newHighlights);
                mocContent = lines.join('\n');
            }
            await vault.modify(vault.getAbstractFileByPath(mocPath), mocContent);
        }

        // Enhance Tracker
        const trackerPath = `AI-Suplex-777/Trackers/${displaySafe} Tracker.md`;
        if (await vault.adapter.exists(trackerPath)) {
            let trackerContent = await vault.read(vault.getAbstractFileByPath(trackerPath));
            const weekRegex = new RegExp(`\\| ${week} \\| .+? \\| .+? \\| .+? \\| (.+?) \\|`, 'i');
            const match = trackerContent.match(weekRegex);
            if (match) {
                const focusSessions = recentSessions.filter(s => s.focus === name);
                let progressText = "";
                if (focusSessions.length) {
                    progressText = focusSessions.map(s => s.insight).filter(i => i).join("; ");
                }
                if (progressText) {
                    const rowRegex = new RegExp(`(\\| ${week} \\| .+? \\|) .+? (\\| .+? \\| .+? \\|)`, 'i');
                    trackerContent = trackerContent.replace(rowRegex, `$1 ${progressText} $2`);
                    await vault.modify(vault.getAbstractFileByPath(trackerPath), trackerContent);
                }
            }
        }
    }

    new Notice(`Enhanced MOCs and Trackers.`, 4000);
};