// Artifact.js – 7‑7‑7 Edition
// Prompts for focus, cycle, week, title, content, etc.
// Saves to AI-Suplex-777/Artifacts/<Period>/Cycle X/Week Y/

module.exports = async (quickAdd) => {
    const { quickAddApi, app } = quickAdd;
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
    const folderPath = P.artifactDir(cycle, week);
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
};