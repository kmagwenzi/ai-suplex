// Session Start.js – 7‑7‑7 Edition
// Prompts for focus, cycle, week, mission, tasks, metrics, energy.
// Saves to AI-Suplex-777/Sessions/Active/Start/ (frontmatter contains cycle/week/focus).
// Optionally runs 3lm start to load memory context.

module.exports = async (quickAdd) => {
  const { quickAddApi, app } = quickAdd;
  const vault = app.vault;

  // Helper: run 3lm start to load memory context (non-blocking)
  function exec3lmStart() {
    try {
      const { execSync } = require("child_process");
      const vaultPath = app.vault.adapter.basePath;
      const cwd = vaultPath + "/AI-Suplex-777";
      return execSync("node Tools/3lm.js start", {
        encoding: "utf8",
        timeout: 15000,
        stdio: "pipe",
        cwd,
      });
    } catch (e) {
      console.error("3lm start error: " + e.message);
      return null;
    }
  }

  // Helper: read focuses from Focuses.md
  async function getFocuses() {
    const focusesPath = "AI-Suplex-777/Focuses.md";
    if (!(await vault.adapter.exists(focusesPath))) {
      return [
        "ai-engineering",
        "wqr",
        "freelance",
        "digital-products",
        "content-creation",
      ];
    }
    const content = await vault.adapter.read(focusesPath);
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return [];
    const frontmatter = match[1];
    const nameMatches = [...frontmatter.matchAll(/name:\s*(\S+)/g)];
    return nameMatches.map((m) => m[1]);
  }

  const focusOptions = await getFocuses();
  const focus = await quickAddApi.suggester(
    focusOptions,
    focusOptions,
    "Select focus area",
  );

  const typeOptions = ["execution", "planning", "review", "creative"];
  const sessionType = await quickAddApi.suggester(
    typeOptions,
    typeOptions,
    "Select session type",
  );

  const cycleOptions = [1, 2, 3, 4, 5, 6, 7];
  const cycle = await quickAddApi.suggester(
    cycleOptions,
    cycleOptions,
    "Select cycle (1-7)",
  );
  const weekOptions = [1, 2, 3, 4, 5, 6, 7];
  const week = await quickAddApi.suggester(
    weekOptions,
    weekOptions,
    "Select week (1-7)",
  );

  const duration = await quickAddApi.inputPrompt(
    "Expected Duration (minutes)",
    "e.g., 90",
  );
  const energyOptions = [1, 2, 3, 4, 5];
  const energyLabels = ["⚡", "⚡⚡", "⚡⚡⚡", "⚡⚡⚡⚡", "⚡⚡⚡⚡⚡"];
  const energy = await quickAddApi.suggester(
    energyLabels,
    energyOptions,
    "Select energy level",
  );

  const mission = await quickAddApi.inputPrompt("Mission", null, {
    multiline: true,
  });
  let tasksRaw = await quickAddApi.inputPrompt(
    "Tasks (optional, one per line)",
    null,
    { multiline: true },
  );
  let metricsRaw = await quickAddApi.inputPrompt(
    "Success Metrics (optional, one per line)",
    null,
    { multiline: true },
  );

  let tasksContent = "- [ ] \n- [ ] \n- [ ]";
  if (tasksRaw && tasksRaw.trim()) {
    const lines = tasksRaw.split("\n");
    tasksContent = lines
      .map((line) => (line.trim().startsWith("- [ ]") ? line : `- [ ] ${line}`))
      .join("\n");
  }
  let metricsContent = "-\n-\n-";
  if (metricsRaw && metricsRaw.trim()) {
    const lines = metricsRaw.split("\n");
    metricsContent = lines
      .map((line) => (line.trim().startsWith("-") ? line : `- ${line}`))
      .join("\n");
  }

  const now = new Date();
  const formattedDate = now.toISOString().slice(0, 10);
  const timeForFilename = now.toISOString().slice(11, 16).replace(":", "");
  const fileName = `${formattedDate}-${timeForFilename}-${focus}-${sessionType}-session-start.md`;
  const filePath = `AI-Suplex-777/Sessions/Active/Start/${fileName}`;

  const frontmatter = `---
tags:
  - session
  - start
  - ${focus}
  - #7/${cycle}/${week}
date: ${formattedDate}
time: ${now.toTimeString().slice(0, 5)}
focus: ${focus}
session_type: ${sessionType}
cycle: ${cycle}
week: ${week}
duration_minutes: ${duration}
energy_start: ${energy}
---

# AI-Suplex: Session Start

**Session Type:** ${sessionType}
**Focus:** ${focus}
**Cycle:** ${cycle} | **Week:** ${week}
**Duration (min):** ${duration}
**Energy Level:** ${"⚡".repeat(energy)}

## Mission
${mission || "No mission provided."}

## Tasks
${tasksContent}

## Success Metrics
${metricsContent}

## Quick Links
- [[Insights]]
- [[B-Bombs]]
- [[Artifacts]]

---
*Session started via QuickAdd script macro (7‑7‑7 Edition)*
`;

  await vault.create(filePath, frontmatter);
  const file = vault.getAbstractFileByPath(filePath);
  await app.workspace.openLinkText(file.path, "", false);
  new Notice(`Session Start created: ${fileName}`, 3000);

  // --- 3lm start: load memory context in background ---
  setTimeout(() => {
    const context = exec3lmStart();
    if (context !== null) {
      console.log("3lm start: memory context loaded for session");
    }
  }, 500);
};
