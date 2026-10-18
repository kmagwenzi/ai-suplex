// Aggregate Weekly Session Data – Sweeper Skill
// Prompts for Cycle and Week, scans all relevant files, and writes a single source file for the AI.
// Overwrites previous source file for that week.

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

  // Helper: ensure folder exists
  async function ensureFolder(folderPath) {
    if (!(await vault.adapter.exists(folderPath))) {
      await vault.createFolder(folderPath);
    }
  }

  // Helper: parse frontmatter (simple regex)
  function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    const frontmatter = match[1];
    const result = {};
    const lines = frontmatter.split("\n");
    for (const line of lines) {
      const colon = line.indexOf(":");
      if (colon === -1) continue;
      let key = line.slice(0, colon).trim();
      let value = line.slice(colon + 1).trim();
      if (value.startsWith('"') && value.endsWith('"'))
        value = value.slice(1, -1);
      result[key] = value;
    }
    return result;
  }

  // Helper: read a file and extract its session data (for session end)
  async function readSessionEnd(filePath, frontmatter, content) {
    // Extract mission (from the narrative or from the start? Not stored in end file. We'll skip.)
    const insights = [];
    const nextActions = [];
    // Extract from frontmatter
    if (frontmatter.key_insights && frontmatter.key_insights !== "")
      insights.push(frontmatter.key_insights);
    if (frontmatter.next_actions && frontmatter.next_actions !== "")
      nextActions.push(frontmatter.next_actions);
    // Also try to extract from markdown sections (CRITICAL INSIGHTS, NEXT ACTIONS)
    const insightsSection = content.match(
      /# CRITICAL INSIGHTS \(Max 3\)\n([\s\S]*?)(?=\n#|$)/,
    );
    if (insightsSection) {
      const lines = insightsSection[1].split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("-")) {
          const insight = trimmed.replace(/^-\s*/, "").trim();
          if (insight && !insights.includes(insight)) insights.push(insight);
        }
      }
    }
    const nextSection = content.match(
      /# NEXT ACTIONS \(Max 3\)\n([\s\S]*?)(?=\n#|$)/,
    );
    if (nextSection) {
      const lines = nextSection[1].split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("-")) {
          const action = trimmed.replace(/^-\s*/, "").trim();
          if (action && !nextActions.includes(action)) nextActions.push(action);
        }
      }
    }
    return {
      type: "session",
      date: frontmatter.date || "unknown",
      focus: frontmatter.focus || "unknown",
      duration: frontmatter.duration_minutes || "?",
      energyStart: frontmatter.energy_start || "?",
      energyEnd: frontmatter.energy_end || "?",
      focusQuality: frontmatter.focus_quality || "?",
      insights: insights.join("; "),
      nextActions: nextActions.join("; "),
      filePath,
    };
  }

  // Helper: read artifact or B‑bomb
  async function readProduct(filePath, frontmatter, type) {
    return {
      type,
      date: frontmatter.date || "unknown",
      focus: frontmatter.focus || "unknown",
      title:
        frontmatter.title || filePath.split("/").pop().replace(/\.md$/, ""),
      description:
        frontmatter.description || frontmatter["💣 B-BOMB content"] || "",
      productPotential: frontmatter.product_potential || "",
      filePath,
    };
  }

  // --- Main ---
  const cycle = await quickAddApi.inputPrompt("Cycle (1-7)", "e.g., 1");
  const week = await quickAddApi.inputPrompt("Week (1-7)", "e.g., 1");

  const targetCycle = parseInt(cycle);
  const targetWeek = parseInt(week);
  if (isNaN(targetCycle) || isNaN(targetWeek)) {
    new Notice("Invalid cycle or week. Aborting.");
    return;
  }

  // Folders to scan
  const sessionFolders = [
    "AI-Suplex-777/Sessions/Active/End",
    "AI-Suplex-777/Sessions/Archive/End",
  ];
  const productFolders = ["AI-Suplex-777/Artifacts", "AI-Suplex-777/B-Bombs"];

  const sessionData = [];
  const productData = [];

  // Scan session end files
  for (const folder of sessionFolders) {
    if (!(await vault.adapter.exists(folder))) continue;
    const files = vault
      .getMarkdownFiles()
      .filter((f) => f.path.startsWith(folder));
    for (const file of files) {
      const content = await vault.read(file);
      const frontmatter = parseFrontmatter(content);
      if (frontmatter.cycle != targetCycle || frontmatter.week != targetWeek)
        continue;
      const data = await readSessionEnd(file.path, frontmatter, content);
      sessionData.push(data);
    }
  }

  // Scan artifacts and B‑bombs (if they have cycle/week frontmatter)
  for (const folder of productFolders) {
    if (!(await vault.adapter.exists(folder))) continue;
    const files = vault
      .getMarkdownFiles()
      .filter((f) => f.path.startsWith(folder));
    for (const file of files) {
      const content = await vault.read(file);
      const frontmatter = parseFrontmatter(content);
      if (frontmatter.cycle != targetCycle || frontmatter.week != targetWeek)
        continue;
      const type = folder.includes("Artifacts") ? "artifact" : "b-bomb";
      const data = await readProduct(file.path, frontmatter, type);
      productData.push(data);
    }
  }

  // Build source markdown file
  const sourceFolder = P.reviewDir(targetCycle, targetWeek);
  await ensureFolder(sourceFolder);
  const sourcePath = `${sourceFolder}/Week ${targetWeek} Aggregate Data.md`;
  let sourceContent = `# Weekly Source Data – Cycle ${targetCycle}, Week ${targetWeek}\n\n`;
  sourceContent += `**Generated:** ${new Date().toISOString().slice(0, 19).replace("T", " ")}\n\n`;

  sourceContent += `## Sessions (${sessionData.length})\n\n`;
  for (const s of sessionData) {
    sourceContent += `### Session on ${s.date} – Focus: ${s.focus}\n`;
    sourceContent += `- **Duration:** ${s.duration} min\n`;
    sourceContent += `- **Energy:** ${s.energyStart} → ${s.energyEnd}\n`;
    sourceContent += `- **Focus Quality:** ${s.focusQuality}\n`;
    if (s.insights) sourceContent += `- **Key Insights:** ${s.insights}\n`;
    if (s.nextActions)
      sourceContent += `- **Next Actions:** ${s.nextActions}\n`;
    sourceContent += `- **File:** ${s.filePath}\n\n`;
  }

  sourceContent += `## Artifacts & B‑Bombs (${productData.length})\n\n`;
  for (const p of productData) {
    sourceContent += `### ${p.type === "artifact" ? "Artifact" : "B‑Bomb"}: ${p.title}\n`;
    sourceContent += `- **Date:** ${p.date}\n`;
    sourceContent += `- **Focus:** ${p.focus}\n`;
    sourceContent += `- **Description:** ${p.description}\n`;
    if (p.productPotential)
      sourceContent += `- **Product Potential:** ${p.productPotential}\n`;
    sourceContent += `- **File:** ${p.filePath}\n\n`;
  }

  // Write or overwrite
  let file = vault.getAbstractFileByPath(sourcePath);
  if (file) await vault.delete(file);
  await vault.create(sourcePath, sourceContent);
  await app.workspace.openLinkText(sourcePath, "", false);
  new Notice(`Weekly source data saved and opened: ${sourcePath}`, 4000);
};
