// Sweeper – Generate Cycle Review.js
// ⚠️ LEGACY — CortexMem retired. Use 3lm promote→revise for cycle reviews.
// Aggregates all Cycle memories from cortexmem into a review file.
// Run at the end of a Cycle (7th week).

const { execSync } = require("child_process");
const path = require("path");

function cortexmem(quickAdd, args) {
  try {
    const cmPath = path.join(
      quickAdd.app.vault.adapter.basePath,
      "AI-Suplex-777",
      "cm",
    );
    return execSync(`node "${cmPath}" ${args}`, {
      encoding: "utf8",
      timeout: 15000,
      stdio: "pipe",
    }).trim();
  } catch (e) {
    return "";
  }
}

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

  const cycleOptions = [1, 2, 3, 4, 5, 6, 7];
  const cycle = await quickAddApi.suggester(
    cycleOptions,
    cycleOptions,
    "Select cycle to review",
  );

  if (!cycle) {
    new Notice("Cycle review cancelled.");
    return;
  }

  const decisions = cortexmem(
    quickAdd,
    `get_context --space "cycle-${cycle}" --type decision --limit 50`,
  );
  const bBombs = cortexmem(
    quickAdd,
    `get_context --space "cycle-${cycle}" --type b-bomb --limit 50`,
  );

  const now = new Date().toISOString().slice(0, 10);
  const reviewContent = `---
cycle: ${cycle}
date: ${now}
---

# Cycle ${cycle} Review

## Key Decisions
${decisions || "No decisions recorded for this cycle."}

## B-Bombs Produced
${bBombs || "No B-Bombs recorded for this cycle."}

## Summary
[AI-generated summary based on aggregated memories]

---
*Cycle review generated via AI-Suplex on ${now}*
`;

  // ── FIX (T015 / E-5): this used to write to the Reviews ROOT, while the one real
  // cycle review lives INSIDE the cycle directory
  // (`Reviews/<Period>/Weekly/Cycle 1/Cycle-1-review-….md`). Same ruling as E-4 —
  // the contract describes reality, so cycle reviews belong in the cycle directory.
  const reviewFolder = P.reviewCycleDir(cycle);
  if (!(await vault.adapter.exists(reviewFolder))) {
    await vault.createFolder(reviewFolder);
  }

  const filePath = `${reviewFolder}/Cycle-${cycle}-review-${now}.md`;
  await vault.create(filePath, reviewContent);
  new Notice(`✅ Cycle ${cycle} review created → ${filePath}`, 5000);
};
