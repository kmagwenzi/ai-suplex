// Sweeper – Create Tracker.js (Enhanced v2)
// Creates progress trackers with performance previews and cycle stats, plus an index file.

module.exports = async (quickAdd) => {
    const { app, quickAddApi } = quickAdd;
    const vault = app.vault;

    // --- Helper: read focuses from Focuses.md ---
    async function readFocuses() {
        const focusesPath = "AI-Suplex-777/Focuses.md";
        if (!(await vault.adapter.exists(focusesPath))) {
            new Notice("Focuses.md not found. Please run Focus Manager first.");
            return [];
        }
        const content = await vault.adapter.read(focusesPath);
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        if (!match) return [];
        const frontmatter = match[1];
        const focuses = [];
        const nameMatches = [...frontmatter.matchAll(/name:\s*(\S+)/g)];
        const displayMatches = [...frontmatter.matchAll(/display:\s*(.+)/g)];
        const descMatches = [...frontmatter.matchAll(/description:\s*"(.+?)"/g)];
        for (let i = 0; i < nameMatches.length; i++) {
            focuses.push({
                name: nameMatches[i][1],
                display: displayMatches[i] ? displayMatches[i][1] : nameMatches[i][1],
                description: descMatches[i] ? descMatches[i][1] : ""
            });
        }
        return focuses;
    }

    // --- Helper: ensure folder exists ---
    async function ensureFolder(folderPath) {
        if (!(await vault.adapter.exists(folderPath))) {
            await vault.createFolder(folderPath);
        }
    }

    // --- Helper: parse frontmatter from a file (returns object) ---
    async function parseFrontmatter(filePath) {
        const content = await vault.read(vault.getAbstractFileByPath(filePath));
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        if (!match) return {};
        const frontmatter = match[1];
        const result = {};
        const lines = frontmatter.split('\n');
        for (const line of lines) {
            const colon = line.indexOf(':');
            if (colon === -1) continue;
            let key = line.slice(0, colon).trim();
            let value = line.slice(colon + 1).trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            result[key] = value;
        }
        return result;
    }

    // --- Helper: collect session data for a given cycle, week, and focus ---
    async function getSessionDataForWeek(cycle, week, focusName) {
        const sessionFolders = [
            "AI-Suplex-777/Sessions/Active/End",
            "AI-Suplex-777/Sessions/Archive/End"
        ];
        let sessions = [];
        for (const folder of sessionFolders) {
            if (!(await vault.adapter.exists(folder))) continue;
            const files = vault.getMarkdownFiles().filter(f => f.path.startsWith(folder));
            for (const file of files) {
                const fm = await parseFrontmatter(file.path);
                if (fm.cycle != cycle || fm.week != week) continue;
                if (fm.focus !== focusName) continue;
                sessions.push({
                    date: fm.date,
                    duration: parseInt(fm.duration_minutes) || 0,
                    keyInsights: fm.key_insights || "",
                    nextActions: fm.next_actions || "",
                    blockers: fm.blockers || "",
                    completionStatus: fm.completion_status || "",
                    objectivesCompleted: fm.objectives_completed || "",
                    rating: fm.session_rating
                });
            }
        }
        sessions.sort((a,b) => (a.date || "").localeCompare(b.date || ""));
        let totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
        let totalHours = (totalMinutes / 60).toFixed(1);
        let avgDuration = sessions.length ? Math.round(totalMinutes / sessions.length) : 0;
        let insights = sessions.map(s => s.keyInsights).filter(i => i && i !== "").slice(0, 2);
        let nextActions = sessions.map(s => s.nextActions).filter(a => a && a !== "").slice(0, 2);
        let blockers = sessions.map(s => s.blockers).filter(b => b && b !== "").slice(0, 2);
        let ratings = sessions.map(s => parseFloat(s.rating)).filter(r => r > 0);
        let avgRating = ratings.length ? (ratings.reduce((a,b) => a+b, 0) / ratings.length).toFixed(1) : "—";
        return { sessionCount: sessions.length, totalHours, avgDuration, avgRating, insights, nextActions, blockers, sessions };
    }

    async function countArtifacts(cycle, week) {
        let count = 0;
        const folders = ["AI-Suplex-777/Artifacts", "AI-Suplex-777/B-Bombs"];
        for (const folder of folders) {
            const path = `${folder}/Cycle ${cycle}/Week ${week}`;
            if (await vault.adapter.exists(path)) {
                const files = vault.getMarkdownFiles().filter(f => f.path.startsWith(path));
                count += files.length;
            }
        }
        return count;
    }

    async function countInsights(cycle, week) {
        const path = `AI-Suplex-777/Insights/Cycle ${cycle}/Week ${week}.md`;
        if (!(await vault.adapter.exists(path))) return 0;
        const content = await vault.read(vault.getAbstractFileByPath(path));
        const matches = content.match(/^-\s+/gm);
        return matches ? matches.length : 0;
    }

    // --- Helper: get progress indicator emoji based on hours ---
    function getProgressIndicator(totalHours) {
        if (!totalHours || totalHours === 0) return "🔴";
        if (totalHours < 2) return "🟡";
        if (totalHours < 5) return "🟢";
        return "🚀";
    }

    // --- Helper: calculate performance metrics from sessions ---
    function calculatePerformanceMetrics(sessions) {
        let totalSessions = sessions.length;
        if (totalSessions === 0) {
            return { avgRating: 0, completionRate: 0, totalSessions: 0 };
        }
        let totalRating = 0;
        let ratedSessions = 0;
        let completedSessions = 0;
        for (let s of sessions) {
            if (s.rating && !isNaN(parseFloat(s.rating))) {
                totalRating += parseFloat(s.rating);
                ratedSessions++;
            }
            // Check completion status: if objectives_completed contains "/", parse ratio
            if (s.objectivesCompleted && s.objectivesCompleted.includes('/')) {
                let parts = s.objectivesCompleted.split('/');
                if (parts.length === 2) {
                    let completed = parseInt(parts[0]);
                    let total = parseInt(parts[1]);
                    if (!isNaN(completed) && !isNaN(total) && total > 0) {
                        let ratio = completed / total;
                        if (ratio >= 0.8) completedSessions++; // 80% or more considered completed
                    }
                }
            } else if (s.completionStatus && s.completionStatus.toLowerCase().includes('complete')) {
                completedSessions++;
            }
        }
        let avgRating = ratedSessions > 0 ? (totalRating / ratedSessions).toFixed(1) : 0;
        let completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
        return { avgRating, completionRate, totalSessions };
    }

    // --- Main ---
    const focuses = await readFocuses();
    if (!focuses.length) return;

    const cycle = await quickAddApi.inputPrompt("Cycle number (e.g., 1)", "1");
    if (!cycle || cycle < 1 || cycle > 7) {
        new Notice("Invalid cycle. Aborting.");
        return;
    }

    const trackersFolder = "AI-Suplex-777/Trackers";
    await ensureFolder(trackersFolder);

    for (const focus of focuses) {
        const displayName = focus.display;
        const fileName = `${displayName} Tracker.md`;
        const filePath = `${trackersFolder}/${fileName}`;

        let cycleTotalSessions = 0;
        let cycleTotalHours = 0;
        let cycleTotalArtifacts = 0;
        let cycleTotalInsights = 0;
        let weekData = [];
        let highlightsForFocus = [];

        for (let week = 1; week <= 7; week++) {
            const data = await getSessionDataForWeek(cycle, week, focus.name);
            const artifacts = await countArtifacts(cycle, week);
            const insights = await countInsights(cycle, week);
            cycleTotalSessions += data.sessionCount;
            cycleTotalHours += parseFloat(data.totalHours);
            cycleTotalArtifacts += artifacts;
            cycleTotalInsights += insights;
            weekData.push({ week, ...data, artifacts, insights });
            if (data.sessionCount > 0) {
                highlightsForFocus.push({ week, ...data, artifacts, insights });
            }
        }

        const avgSessionMin = cycleTotalSessions ? Math.round((cycleTotalHours * 60) / cycleTotalSessions) : 0;
        const cycleStatsTable = `| **Sessions** | **Hours** | **Avg/Session** | **Artifacts** | **Insights** |\n|${'-------|'.repeat(4)}-------|\n| ${cycleTotalSessions} | ${cycleTotalHours.toFixed(1)} | ${avgSessionMin}min | ${cycleTotalArtifacts} | ${cycleTotalInsights} |`;

        let weeksTable = `| Week | Sessions | Hours | Rating | Artifacts | Status |\n`;
        weeksTable += `|------|----------|-------|--------|-----------|--------|\n`;
        
        for (const wd of weekData) {
            const status = wd.sessionCount > 0 ? (wd.sessionCount >= 3 ? "✅" : "🔄") : "⬜";
            const rating = wd.avgRating !== "—" ? `⭐${wd.avgRating}` : "—";
            weeksTable += `| ${wd.week} | ${wd.sessionCount || '—'} | ${wd.totalHours || '—'} | ${rating} | ${wd.artifacts || '—'} | ${status} |\n`;
        }

        let highlightsSection = "";
        if (highlightsForFocus.length > 0) {
            for (const hl of highlightsForFocus) {
                highlightsSection += `### Week ${hl.week}\n`;
                highlightsSection += `- **Sessions:** ${hl.sessionCount} | **Hours:** ${hl.totalHours}h | **Avg:** ${hl.avgDuration}min | **Rating:** ⭐${hl.avgRating}\n`;
                highlightsSection += `- **Artifacts:** ${hl.artifacts} | **Insights:** ${hl.insights}\n`;
                if (hl.nextActions.length) highlightsSection += `- **Next:** ${hl.nextActions.join('; ')}\n`;
                if (hl.blockers.length) highlightsSection += `- **Blockers:** ${hl.blockers.join('; ')}\n`;
                highlightsSection += `\n`;
            }
        } else {
            highlightsSection = `*No session data yet for Cycle ${cycle}. Run sessions and re-run to populate.*\n`;
        }

        let content = `---
tags: [tracker, ${focus.name}]
focus: ${focus.name}
cycle: ${cycle}
updated: ${new Date().toISOString().split('T')[0]}
---

# 📊 ${displayName} Tracker – Cycle ${cycle}

## 🎯 Cycle Goal
*(What do you want to achieve this cycle for ${displayName}?)*

---

## 📈 Cycle Performance

${cycleStatsTable}

---

## 📅 Weekly Progress

${weeksTable}

---

## 🔥 Weekly Highlights

${highlightsSection}

## 📝 Notes & Reflections

- 

## 🔗 Quick Links
- [[${displayName} MOC]]
- [[Command Center]]
`;

        let file = vault.getAbstractFileByPath(filePath);
        if (file) await vault.delete(file);
        await vault.create(filePath, content);
        console.log(`Updated tracker: ${fileName}`);
    }
    
    // Create/update Trackers index file
    const indexFilePath = "AI-Suplex-777/Trackers.md";
    const sortedFocuses = focuses.sort((a, b) => a.display.localeCompare(b.display));
    let indexContent = `
# AI-Suplex 777 🦸 - Trackers

`;
    for (const focus of sortedFocuses) {
        indexContent += `[[${focus.display} Tracker]]\n`;
    }
    indexContent += `
---
_Tracking Progress via AI-Suplex on Current time: ${new Date().toISOString()}_`;

    let indexFile = vault.getAbstractFileByPath(indexFilePath);
    if (indexFile) await vault.delete(indexFile);
    await vault.create(indexFilePath, indexContent);
    console.log(`Created/updated Trackers index: ${indexFilePath}`);

    new Notice(`Trackers updated with performance previews for Cycle ${cycle}`, 4000);
};
