// Sweeper – Enhance MOCs & Trackers.js
// Scans recent sessions, updates MOCs with highlights, and updates current week's progress in Trackers.
// FIXED: tracker row regex matches actual 6-column table, MOC path includes " MOC" suffix,
//        focus detection falls back to tags, key_insights extracted from YAML frontmatter

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
        display: displayMatches[i] ? displayMatches[i][1] : nameMatches[i][1],
      });
    }
    return focuses;
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
    let insights = sessions.map(s => s.keyInsights).filter(i => i && i !== "").slice(0, 2);
    let nextActions = sessions.map(s => s.nextActions).filter(a => a && a !== "").slice(0, 3);
    let blockers = sessions.map(s => s.blockers).filter(b => b && b !== "").slice(0, 2);
    let sessionCount = sessions.length;
    return { sessionCount, totalHours, insights, nextActions, blockers, sessions };
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
      if (s.objectivesCompleted && s.objectivesCompleted.includes('/')) {
        let parts = s.objectivesCompleted.split('/');
        if (parts.length === 2) {
          let completed = parseInt(parts[0]);
          let total = parseInt(parts[1]);
          if (!isNaN(completed) && !isNaN(total) && total > 0) {
            let ratio = completed / total;
            if (ratio >= 0.8) completedSessions++;
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

  // --- Helper: get all sessions for a given cycle and focus ---
  async function getAllSessionsForCycle(cycle, focusName) {
    let allSessions = [];
    for (let week = 1; week <= 7; week++) {
      const data = await getSessionDataForWeek(cycle, week, focusName);
      if (data.sessions.length > 0) {
        allSessions = allSessions.concat(data.sessions);
      }
    }
    return allSessions;
  }

  async function getRecentSessions(focuses, days = 7) {
    const sessions = [];
    const folders = ["AI-Suplex-777/Sessions/Active/End"];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    for (const folder of folders) {
      if (!(await vault.adapter.exists(folder))) continue;
      const files = vault
        .getMarkdownFiles()
        .filter((f) => f.path.startsWith(folder));
      for (const file of files) {
        const stat = await vault.adapter.stat(file.path);
        if (stat && new Date(stat.mtime) < cutoff) continue;
        const content = await vault.read(file);
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!fmMatch) continue;
        const fm = fmMatch[1];
        const focusMatch = fm.match(/focus:\s*([\w-]+)/);
        let focus = focusMatch ? focusMatch[1] : null;
        // Fallback: detect focus from tags
        if (!focus) {
          const tagsMatch = fm.match(/tags:\s*\n?(\s*-[\s\S]*?)(?=\n\w|\n---|$)/);
          if (tagsMatch) {
            const tagsBlock = tagsMatch[1];
            const tagMatches = [...tagsBlock.matchAll(/-\s*([\w-]+)/g)];
            for (const match of tagMatches) {
              const tag = match[1];
              if (focuses.some(f => f.name === tag)) {
                focus = tag;
                break;
              }
            }
          }
        }
        // Extract key_insights from YAML frontmatter
        let insight = "";
        const keyInsightsMatch = fm.match(/key_insights:\s*\n?((?:\s*-[^\n]*(?:\n|$))*)/);
        if (keyInsightsMatch) {
          const insightsBlock = keyInsightsMatch[1];
          const firstBulletMatch = insightsBlock.match(/^\s*-\s*(.+)$/m);
          if (firstBulletMatch) {
            insight = firstBulletMatch[1].trim();
          }
        }
        // Fallback to markdown section
        if (!insight) {
          const insightsMatch = content.match(
            /#+\s*🔑?\s*Key\s+Insights.*?\n([\s\S]*?)(?=\n##|\n###|$)/i,
          );
          if (insightsMatch) {
            const lines = insightsMatch[1].split("\n");
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.match(/^\s*[-*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
                insight = trimmed.replace(/^[-*\d]+\.\s*/, "").trim();
                break;
              }
            }
          }
        }
        sessions.push({
          date: new Date(stat.mtime),
          focus,
          insight,
          filePath: file.path,
        });
      }
    }
    return sessions;
  }

  const focuses = await readFocuses();
  if (!focuses.length) return;

  const cycle = await quickAddApi.inputPrompt("Current cycle (1-7)", "e.g., 1");
  const week = await quickAddApi.inputPrompt("Current week (1-7)", "e.g., 1");
  const recentSessions = await getRecentSessions(focuses, 7);

  for (const focus of focuses) {
    const { name, display } = focus;
    const displaySafe = display.replace(/[\\/:*?"<>|]/g, "-");

    // --- Enhance MOC ---
    // Note: actual files use " MOC" suffix, e.g. "AI Engineering MOC.md"
    const mocPath = `AI-Suplex-777/MOCs/${displaySafe} MOC.md`;
    if (await vault.adapter.exists(mocPath)) {
      let mocContent = await vault.read(vault.getAbstractFileByPath(mocPath));
      const marker = "\n<!-- SWEEPER-HIGHLIGHTS -->";
      const highlightsStart = "## 🔥 Recent Highlights";
      let newHighlights = `${marker}\n${highlightsStart}\n`;
      const focusSessions = recentSessions
        .filter((s) => s.focus === name)
        .sort((a, b) => b.date - a.date)
        .slice(0, 3);
      if (focusSessions.length) {
        newHighlights += "**Recently completed sessions:**\n";
        for (const s of focusSessions) {
          const dateStr = s.date.toISOString().slice(0, 10);
          newHighlights += `- **${dateStr}** – ${s.insight || "No insight recorded"}\n`;
        }
      } else {
        newHighlights += "No recently completed sessions.\n";
      }
      newHighlights += `\n> [!info] **Last enhanced:** ${new Date().toISOString().slice(0, 19).replace("T", " ")} by Sweeper.\n`;

      if (mocContent.includes(marker)) {
        const regex = new RegExp(`${marker}[\\s\\S]*?>\\[!info\\].*?\\n`, "m");
        mocContent = mocContent.replace(regex, newHighlights);
      } else {
        const lines = mocContent.split("\n");
        let insertIndex = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("# ")) {
            insertIndex = i + 1;
            break;
          }
        }
        lines.splice(insertIndex, 0, newHighlights);
        mocContent = lines.join("\n");
      }
      await vault.modify(vault.getAbstractFileByPath(mocPath), mocContent);
    }

    // --- Enhance Tracker ---
    // Actual tracker table format (6 columns):
    // | Week | Sessions | Hours | Rating | Artifacts | Status |
    // | 1    | 2        | 3.0   | ⭐4.3  | 45        | 🔄     |
    const trackerPath = `AI-Suplex-777/Trackers/${displaySafe} Tracker.md`;
    if (await vault.adapter.exists(trackerPath)) {
      let trackerContent = await vault.read(vault.getAbstractFileByPath(trackerPath));

      // 1. Update weekly progress row for current week
      const weekData = await getSessionDataForWeek(cycle, week, name);
      let status = "⬜";
      if (weekData.sessionCount > 0) {
        const indicator = getProgressIndicator(parseFloat(weekData.totalHours));
        if (weekData.sessionCount >= 3) status = "✅";
        else status = "🔄";
      }

      // Build replacement row matching the 6-column tracker table
      // | Week | Sessions | Hours | Rating | Artifacts | Status |
      const sessionsVal = weekData.sessionCount > 0 ? weekData.sessionCount : "—";
      const hoursVal = weekData.sessionCount > 0 ? weekData.totalHours : "0.0";

      // Calculate average rating for this week's sessions
      let avgRating = "—";
      const rated = weekData.sessions.filter(s => s.rating && !isNaN(parseFloat(s.rating)));
      if (rated.length > 0) {
        const sum = rated.reduce((a, s) => a + parseFloat(s.rating), 0);
        avgRating = `⭐${(sum / rated.length).toFixed(1)}`;
      }

      const artifactsCount = weekData.sessionCount > 0 ? "?" : "—"; // placeholder - Enhance doesn't count artifacts per-week

      const rowRegex = new RegExp(
        `^\\| ${week} \\|.*?\\|`,
        "im"
      );
      const newRow = `| ${week} | ${sessionsVal} | ${hoursVal} | ${avgRating} | ${artifactsCount} | ${status} |`;
      if (rowRegex.test(trackerContent)) {
        trackerContent = trackerContent.replace(rowRegex, newRow);
      }

      // 2. Update Performance Summary section
      const allSessions = await getAllSessionsForCycle(cycle, name);
      if (allSessions.length > 0) {
        const perfMetrics = calculatePerformanceMetrics(allSessions);
        const performanceSection = `## 📈 Performance Summary\n\n| Metric | Value |\n|--------|-------|\n| **Total Sessions** | ${perfMetrics.totalSessions} |\n| **Average Rating** | ${perfMetrics.avgRating}/5 ⭐ |\n| **Completion Rate** | ${perfMetrics.completionRate}% |\n| **Overall** | ${perfMetrics.avgRating >= 4 ? "🚀 Excellent" : perfMetrics.avgRating >= 3 ? "✅ Good" : "🔄 Needs Improvement"} |\n\n`;

        const perfSectionRegex = /## 📈 Performance Summary[\s\S]*?(?=\n## |$)/;
        if (perfSectionRegex.test(trackerContent)) {
          trackerContent = trackerContent.replace(perfSectionRegex, performanceSection.trimEnd());
        } else {
          const highlightsEndRegex = /## 🔥 Weekly Highlights[\s\S]*?(?=\n## |$)/;
          if (highlightsEndRegex.test(trackerContent)) {
            trackerContent = trackerContent.replace(
              highlightsEndRegex,
              match => match + '\n' + performanceSection
            );
          }
        }
      }

      await vault.modify(vault.getAbstractFileByPath(trackerPath), trackerContent);
    }
  }

  new Notice(`Enhanced MOCs and Trackers.`, 4000);
};
