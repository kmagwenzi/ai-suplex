// Insight.js – 7‑7‑7 Edition (appends bullet list, not callout)
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

    const insightText = await quickAddApi.inputPrompt("Insight", null, { multiline: true });
    const sourceOptions = ["session", "artifact", "b-bomb", "report", "external"];
    const source = await quickAddApi.suggester(sourceOptions, sourceOptions, "Source");

    const folderPath = `AI-Suplex-777/Insights/Cycle ${cycle}`;
    await ensureFolder(folderPath);
    const filePath = `${folderPath}/Week ${week}.md`;
    let file = vault.getAbstractFileByPath(filePath);
    if (!file) {
        await vault.create(filePath, `# Insights – Cycle ${cycle}, Week ${week}\n\n`);
        file = vault.getAbstractFileByPath(filePath);
    }

    const now = new Date();
    const timestamp = `${now.toISOString().slice(0,10)} ${now.toTimeString().slice(0,5)}`;
    // Bullet list format (Dataview-friendly)
    const insightBlock = `- **${timestamp}** – *${focus}* – ${insightText.replace(/\n/g, ' ')} [Source: ${source}]\n`;

    await vault.append(file, insightBlock);
    new Notice(`Insight appended to Cycle ${cycle}, Week ${week}`, 3000);

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