// Sweeper – Weekly Review.js
// Generates a structured weekly review from session data, artifacts, and insights.
// Triggers 3lm promote --min 70 and 3lm revise after review is saved.

module.exports = async (quickAdd) => {
  const { app, quickAddApi } = quickAdd;
  const vault = app.vault;

  // Helper: run 3lm command from inside the vault
  function exec3lm(command) {
    try {
      const { execSync } = require("child_process");
      const vaultPath = app.vault.adapter.basePath;
      const cwd = vaultPath + "/AI-Suplex-777";
      const cmd = `node Tools/3lm.js ${command}`;
      return execSync(cmd, {
        encoding: "utf8",
        timeout: 30000,
        stdio: "pipe",
        cwd,
      });
    } catch (e) {
      console.error("3lm " + command + " error: " + e.message);
      return null;
    }
  }

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
      { path: "AI-Suplex-777/Artifacts", type: "artifact" },
      { path: "AI-Suplex-777/B-Bombs", type: "bbomb" },
    ];

    for (const { path, type } of folders) {
      if (!(await vault.adapter.exists(path))) continue;
      const cyclePath = `${path}/Cycle ${cycle}`;
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
    const insightsPath = `AI-Suplex-777/Insights/Cycle ${cycle}/Week ${week}.md`;
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
  const reviewsFolder = `AI-Suplex-777/Reviews/Weekly`;
  await ensureFolder(reviewsFolder);
  const reviewPath = `${reviewsFolder}/Week ${week} Review.md`;
  let file = vault.getAbstractFileByPath(reviewPath);
  if (file) await vault.delete(file);
  await vault.create(reviewPath, reviewContent);

  new Notice(`Weekly review saved for Cycle ${cycle}, Week ${week}`, 4000);
  console.log(`Review saved to: ${reviewPath}`);

  // --- 3lm Memory Loop — promote winning patterns ---
  new Notice("🧠 Running 3lm promote — scoring & promoting lessons...", 3000);

  const promoteResult = exec3lm("promote --min 70");
  if (promoteResult !== null) {
    exec3lm("revise");
    exec3lm("index");
    new Notice(
      "✅ Memory promoted — high-scoring lessons moved to semantic/procedural memory",
      4000,
    );
  } else {
    new Notice(
      "⚠️ 3lm not available — run manually: node Tools/3lm.js promote --min 70 → revise",
      5000,
    );
  }
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
