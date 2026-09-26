// Sweeper – Weekly Review.js
// Generates a structured weekly review from session data, artifacts, and insights.

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

  // --- Helper: parse frontmatter from a file ---
  async function parseFrontmatter(filePath) {
    try {
      const file = vault.getAbstractFileByPath(filePath);
      if (!file) return {};
      const content = await vault.read(file);
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
    } catch (e) {
      return {};
    }
  }

  // --- Helper: ensure folder exists ---
  async function ensureFolder(folderPath) {
    if (!(await vault.adapter.exists(folderPath))) {
      await vault.createFolder(folderPath);
    }
  }

  // --- Helper: get session files for a cycle/week ---
  async function getSessionsForWeek(cycle, week) {
    const folders = [
      "AI-Suplex-777/Sessions/Active/End",
      "AI-Suplex-777/Sessions/Archive/End",
    ];
    let sessions = [];
    for (const folder of folders) {
      if (!(await vault.adapter.exists(folder))) continue;
      const files = vault
        .getMarkdownFiles()
        .filter((f) => f.path.startsWith(folder));
      for (const file of files) {
        const fm = await parseFrontmatter(file.path);
        if (fm.cycle != cycle || fm.week != week) continue;
        sessions.push({
          path: file.path,
          date: fm.date || "",
          focus: fm.focus || "",
          duration: parseInt(fm.duration_minutes) || 0,
          mission: fm.mission || "",
          keyInsights: fm.key_insights || "",
          nextActions: fm.next_actions || "",
          blockers: fm.blockers || "",
          completionStatus: fm.completion_status || "",
          rating: fm.session_rating || "",
        });
      }
    }
    sessions.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    return sessions;
  }

  // --- Helper: count artifacts and B-Bombs for week ---
  async function countArtifactsAndBBombs(cycle, week) {
    let artifactCount = 0;
    let bbombCount = 0;

    const folders = [
      { tree: "Artifacts", type: "artifact" },
      { tree: "B-Bombs", type: "bbomb" },
    ];

    for (const { tree, type } of folders) {
      const rootPath = `AI-Suplex-777/${tree}`;
      if (!(await vault.adapter.exists(rootPath))) continue;
      const cyclePath = P.cycleDir(tree, cycle);
      if (!(await vault.adapter.exists(cyclePath))) continue;
      const weekPath = `${cyclePath}/Week ${week}`;
      if (!(await vault.adapter.exists(weekPath))) continue;

      const files = vault
        .getMarkdownFiles()
        .filter((f) => f.path.startsWith(weekPath));
      if (type === "artifact") artifactCount += files.length;
      else bbombCount += files.length;
    }

    return { artifactCount, bbombCount };
  }

  // --- Helper: count insights for week ---
  async function countInsights(cycle, week) {
    const insightsPath = P.insightFile(cycle, week);
    if (!(await vault.adapter.exists(insightsPath))) return 0;

    const content = await vault.read(vault.getAbstractFileByPath(insightsPath));
    const bulletMatches = content.match(/^-\s+/gm);
    return bulletMatches ? bulletMatches.length : 0;
  }

  // --- Helper: get date range for week ---
  function getWeekDateRange(cycle, week) {
    const startOfCycle = new Date(2026, 0, 1);
    const weekStart = new Date(startOfCycle);
    weekStart.setDate(
      startOfCycle.getDate() + (cycle - 1) * 49 + (week - 1) * 7,
    );
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const fmt = (d) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { start: fmt(weekStart), end: fmt(weekEnd) };
  }

  // --- Main ---
  const cycle = await quickAddApi.inputPrompt("Cycle number (e.g., 1)", "1");
  if (!cycle || cycle < 1) {
    new Notice("Invalid cycle. Aborting.");
    return;
  }

  const week = await quickAddApi.inputPrompt("Week number (e.g., 1-7)", "1");
  if (!week || week < 1 || week > 7) {
    new Notice("Invalid week. Aborting.");
    return;
  }

  const sessions = await getSessionsForWeek(cycle, week);
  if (!sessions.length) {
    new Notice(
      `No sessions found for Cycle ${cycle}, Week ${week}. Run some sessions first.`,
    );
    return;
  }

  const { artifactCount, bbombCount } = await countArtifactsAndBBombs(
    cycle,
    week,
  );
  const insightCount = await countInsights(cycle, week);
  const dateRange = getWeekDateRange(cycle, week);

  // Aggregate stats
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const focusCounts = {};
  sessions.forEach((s) => {
    const f = s.focus || "Unknown";
    focusCounts[f] = (focusCounts[f] || 0) + 1;
  });
  const topFocuses = Object.entries(focusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([f, c]) => `${f} (${c})`)
    .join(", ");

  // Extract achievements
  const achievements = sessions
    .filter(
      (s) =>
        s.completionStatus === "completed" ||
        (s.keyInsights && s.keyInsights.includes("success")),
    )
    .slice(0, 5)
    .map((s) => s.mission || s.keyInsights || "Work completed")
    .filter((v, i, a) => a.indexOf(v) === i);

  // Extract lessons
  const lessons = sessions
    .map((s) => s.keyInsights)
    .filter((i) => i && i !== "")
    .slice(0, 5);

  // Extract blockers
  const blockers = sessions
    .filter(
      (s) =>
        (s.blockers && s.blockers !== "") || s.completionStatus === "blocked",
    )
    .map((s) => s.blockers || "Work blocked")
    .filter((v, i, a) => a.indexOf(v) === i);

  // Focus progress table
  let focusTable = "| Focus | Sessions | Key Insight | Next Action |\n";
  focusTable += "|-------|----------|-------------|-------------|\n";
  for (const [focus, count] of Object.entries(focusCounts)) {
    const focusSessions = sessions.filter((s) => s.focus === focus);
    const latestInsight =
      focusSessions.reverse().find((s) => s.keyInsights)?.keyInsights || "—";
    const latestAction =
      focusSessions.reverse().find((s) => s.nextActions)?.nextActions || "—";
    focusTable += `| ${focus} | ${count} | ${latestInsight.slice(0, 50)}... | ${latestAction.slice(0, 50)}... |\n`;
  }

  // Generate review content
  const timestamp = new Date().toLocaleString();
  const reviewContent = `# Weekly Review – Cycle ${cycle}, Week ${week}

**Period:** ${dateRange.start} to ${dateRange.end}
**Generated:** ${timestamp}

## Executive Summary
- **Total sessions:** ${sessions.length}
- **Total focus hours:** ${totalMinutes} minutes (${totalHours} hours)
- **Top focus areas:** ${topFocuses}
- **Artifacts created:** ${artifactCount}
- **B‑Bombs created:** ${bbombCount}
- **Insights logged:** ${insightCount}

## Key Achievements
${achievements.length ? achievements.map((a) => `- ${a}`).join("\n") : "- No completed sessions recorded"}

## Lessons Learned
${lessons.length ? lessons.map((l) => `- ${l}`).join("\n") : "- Continue working to build insights"}

## Blockers & Challenges
${blockers.length ? blockers.map((b) => `- ${b}`).join("\n") : "- No blockers reported"}

## Progress by Focus Area
${focusTable}

## Recommendations for Next Week
${generateRecommendations(sessions, focusCounts)}

## Next Week's Focus Areas
${generateNextWeekFocuses(focusCounts)}

## Quick Links
- [[Command Center]]
- [[AI-Suplex-777/MOCs/]]
- [[AI-Suplex-777/Trackers/]]
- [[AI-Suplex-777/Tasklists/Combined/]]

---
_ Generated by AI-Suplex Weekly Review Macro on ${timestamp} _
`;

  // Save review
  const reviewsFolder = P.reviewDir(cycle, week);
  await ensureFolder(reviewsFolder);
  const reviewPath = `${reviewsFolder}/Week ${week} Review.md`;
  let file = vault.getAbstractFileByPath(reviewPath);
  if (file) await vault.delete(file);
  await vault.create(reviewPath, reviewContent);

  new Notice(`Weekly review saved for Cycle ${cycle}, Week ${week}`, 4000);
  console.log(`Review saved to: ${reviewPath}`);
};

function generateRecommendations(sessions, focusCounts) {
  const recs = [];

  if (sessions.length < 3) {
    recs.push("Aim for at least 3 focused sessions per week to build momentum");
  }

  const avgDuration =
    sessions.reduce((s, se) => s + se.duration, 0) / sessions.length;
  if (avgDuration < 45) {
    recs.push("Consider longer sessions for deep work (aim for 45-90 minutes)");
  }

  const hasBlockers = sessions.some((s) => s.blockers);
  if (hasBlockers) {
    recs.push(
      "Address blockers at the start of next week to avoid context loss",
    );
  }

  const focuses = Object.keys(focusCounts);
  if (focuses.length > 2) {
    recs.push("Limit to 2 focus areas per week to avoid context switching");
  }

  if (!recs.length) {
    recs.push("Continue the current pace and protect your focus time");
  }

  return recs.map((r) => `- ${r}`).join("\n");
}

function generateNextWeekFocuses(focusCounts) {
  const nextActions = [];

  for (const [focus, count] of Object.entries(focusCounts).sort(
    (a, b) => b[1] - a[1],
  )) {
    nextActions.push(`- **${focus}** (${count} sessions this week)`);
  }

  return (
    nextActions.join("\n") || "- Complete sessions to see focus priorities"
  );
}
