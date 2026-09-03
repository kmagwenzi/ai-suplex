// Artifact.js – 7‑7‑7 Edition
// Prompts for focus, cycle, week, title, content, etc.
// Saves to AI-Suplex-777/Artifacts/Cycle X/Week Y/

module.exports = async (quickAdd) => {
    const { quickAddApi, app } = quickAdd;
    const vault = app.vault;

    // Helper: run 3lm learn to extract lesson from capture
    function exec3lm(command) {
        try {
            const { execSync } = require("child_process");
            const vaultPath = app.vault.adapter.basePath;
            const cwd = vaultPath + "/AI-Suplex-777";
            return execSync(`node Tools/3lm.js ${command}`, {
                encoding: "utf8",
                timeout: 15000,
                stdio: "pipe",
                cwd,
            });
        } catch (e) {
            console.error("3lm " + command + " error: " + e.message);
            return null;
        }
    }

    async function getFocuses() {
        const focusesPath = "AI-Suplex-777/Focuses.md";
        if (!(await vault.adapter.exists(focusesPath))) {
            return ["ai-engineering", "wqr", "freelance", "digital-products", "content-creation"];
        }
        const content = await vault.adapter.read(focusesPath);
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        if (!match) return [];
        const frontmatter = match[1];
        const nameMatches = [...frontmatter.matchAll(/name:\s*(\S+)/g)];
        return nameMatches.map(m => m[1]);
    }

    async function ensureFolder(folderPath) {
        if (!(await vault.adapter.exists(folderPath))) {
            await vault.createFolder(folderPath);
        }
    }

    const focusOptions = await getFocuses();
    const focus = await quickAddApi.suggester(focusOptions, focusOptions, "Select focus area");

    const cycleOptions = [1,2,3,4,5,6,7];
    const cycle = await quickAddApi.suggester(cycleOptions, cycleOptions, "Select cycle (1-7)");
    const weekOptions = [1,2,3,4,5,6,7];
    const week = await quickAddApi.suggester(weekOptions, weekOptions, "Select week (1-7)");

    const title = await quickAddApi.inputPrompt("Artifact Title");
    const overview = await quickAddApi.inputPrompt("Overview");
    const primaryObjective = await quickAddApi.inputPrompt("Primary Objective");
    const successCriteria = await quickAddApi.inputPrompt("Success Criteria");
    const intendedUse = await quickAddApi.inputPrompt("Intended Use");
    const artifactContent = await quickAddApi.inputPrompt("Artifact Content", null, { multiline: true });
    const keyInsights = await quickAddApi.inputPrompt("Key insight (one sentence)");
    const nextActions = await quickAddApi.inputPrompt("Next action (one sentence)");

    const now = new Date();
    const formattedDate = now.toISOString().slice(0,10);
    const [year, month, day] = formattedDate.split("-");
    const timeForFilename = now.toISOString().slice(11,16).replace(":", "");
    const safeTitle = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0,50);
    const fileName = `${year}-${month}-${day}-${timeForFilename}-${focus}-${safeTitle}.md`;
    const folderPath = `AI-Suplex-777/Artifacts/Cycle ${cycle}/Week ${week}`;
    await ensureFolder(folderPath);
    const filePath = `${folderPath}/${fileName}`;

    const frontmatter = `---
tags:
  - artifact
  - work-in-progress
  - ${focus}
  - #7/${cycle}/${week}
date: ${formattedDate}
time: ${now.toISOString().slice(0,19).replace('T', 'T')}
focus: ${focus}
cycle: ${cycle}
week: ${week}
key_insights: "${keyInsights || ''}"
next_actions: "${nextActions || ''}"
---

# ${title}

## 📋 Overview
${overview || ''}

## 🎯 Purpose & Goals
- **Primary Objective:** ${primaryObjective || ''}
- **Success Criteria:** ${successCriteria || ''}
- **Intended Use:** ${intendedUse || ''}

---

## 📦 Artifact Content
${artifactContent || '*(Content to be added)*'}

### External Resources
- [[${focus} MOC]]
- [[${focus} Tracker]]

## 🧠 Learnings & Insights
1. 
2. 
3.

## 🔄 Next Steps
1. 
2. 
3.

---
*Artifact captured via QuickAdd on ${formattedDate}*
`;

    await vault.create(filePath, frontmatter);
    const file = vault.getAbstractFileByPath(filePath);
    await app.workspace.openLinkText(file.path, "", false);
    new Notice(`Artifact created: ${fileName}`, 3000);

    // 3lm Quick Capture — extract lesson immediately
    try {
        new Notice("🧠 Extracting lesson...", 1500);
        exec3lm("learn");
        exec3lm("index");
        new Notice("✅ Lesson captured", 1500);
    } catch (e) {
        console.error("3lm capture error: " + e.message);
    }
};