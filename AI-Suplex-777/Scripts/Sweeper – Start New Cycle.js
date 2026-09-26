// Sweeper – Start New Cycle.js
// Seeds a new Cycle with inherited memories from the previous Cycle.
// Run at the start of a new 7‑week cycle.

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

// ── Rollover helpers (Period Structure, decision ②) ───────────────────────────
// A Period is a run of 7 cycles = 49 weeks. 343 days. This is a RHYTHM FACT, not a
// label — the label is always DERIVED from the dates, never typed.
const PERIOD_SPAN_DAYS = 343;

function addDaysIso(iso, days) {
  const [y, m, d] = String(iso).split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function deriveLabel(startIso, endIso) {
  return `${startIso.slice(0, 4)}-${endIso.slice(0, 4)}`;
}

/** Replace a `key: value` line in period.md, or prepend it if absent. */
function setField(raw, key, value) {
  const re = new RegExp(`^(\\s*${key}:\\s*).*$`, "m");
  if (re.test(raw)) return raw.replace(re, `$1${value}`);
  return raw.replace(/^---\r?\n/, `---\n${key}: ${value}\n`);
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
      outreachDir: ()    => j("AI-Suplex-777","Outreach",label),
      cycleDir: (tree,c) => j("AI-Suplex-777",tree,per(c),`Cycle ${c}`),
    }; };
    return { VAULT_PREFIX: "AI-Suplex-777", PRE_PERIOD: PRE, PERIOD_FILE, parseLabel: raw => { const m = String(raw||"").match(/^\s*period_label:\s*"?([^"\n]+?)"?\s*$/m); return m ? m[1].trim() : null; }, periodFor: (c,l) => Number(c)===0?PRE:l, joinPath: j, bind };
  } })();
  const P = await (async () => {
    const label = PC.parseLabel(await app.vault.adapter.read(PC.PERIOD_FILE));
    if (!label) throw new Error("period.md has no readable period_label");
    return PC.bind(label);
  })();

  // ── Read the CURRENT period as RAW TEXT, so a rollover can rewrite it faithfully ──
  let periodRaw;
  try {
    periodRaw = await vault.adapter.read(PC.PERIOD_FILE);
  } catch (e) {
    new Notice(`❌ Cannot read ${PC.PERIOD_FILE} — aborting. Nothing written.`, 8000);
    return;
  }
  const readField = (key) => {
    const m = periodRaw.match(new RegExp(`^\\s*${key}:\\s*"?([^"\\n]+?)"?\\s*$`, "m"));
    return m ? m[1].trim() : null;
  };
  const curIndex = parseInt(readField("period_index") || "1", 10);
  const curLabel = PC.parseLabel(periodRaw);
  if (!curLabel) {
    new Notice("❌ period.md has no readable period_label — aborting. Nothing written.", 8000);
    return;
  }

  const cycleOptions = [1, 2, 3, 4, 5, 6, 7];
  const previousCycle = await quickAddApi.suggester(
    cycleOptions,
    cycleOptions.map((c) => `Cycle ${c} — just completed`),
    `Which cycle just COMPLETED?   (current period: ${curLabel})`,
  );
  if (!previousCycle) {
    new Notice("Cycle inheritance cancelled.");
    return;
  }

  // ── Decide: next cycle in THIS period, or ROLL the period ────────────────────
  let newCycle;
  let newLabel = curLabel;

  if (previousCycle < 7) {
    newCycle = previousCycle + 1;
  } else {
    // Decision ② — Cycle 7 completion ROLLS THE PERIOD instead of erroring with
    // "No next cycle available (max is 7)." Derived fields only; never hand-typed.
    const newIndex = curIndex + 1;
    const today = new Date().toISOString().slice(0, 10);

    // ── Periods are CONTIGUOUS ────────────────────────────────────────────────
    // The next run starts the day AFTER the previous one ended. Using `today`
    // alone is a collision trap: rolling on 2026-09-26 gives +343d = 2027-09-04,
    // i.e. the SAME two calendar years as Period 1 — two periods sharing one label,
    // which is precisely the silent-collision bug this refactor exists to prevent.
    // If the rollover is LATE (run after the period ended), start today instead —
    // a recorded gap, exactly like the Sep 15–23 gap.
    const prevEnd = readField("period_end");
    const dayAfterPrev = prevEnd ? addDaysIso(prevEnd, 1) : today;
    const newStart = dayAfterPrev > today ? dayAfterPrev : today;
    const newEnd = addDaysIso(newStart, PERIOD_SPAN_DAYS);
    newLabel = deriveLabel(newStart, newEnd);

    // ── HARD GUARD — labels must be unique, and we refuse rather than overwrite ──
    if (newLabel === curLabel) {
      new Notice(
        `❌ Refusing to roll: the derived label ${newLabel} is IDENTICAL to the current ` +
          `period's. Two periods must never share a label. Check period_end in period.md. ` +
          `Nothing written.`,
        12000,
      );
      return;
    }
    if (await vault.adapter.exists(`${PC.VAULT_PREFIX}/Artifacts/${newLabel}`)) {
      new Notice(
        `❌ Refusing to roll: a directory for period ${newLabel} ALREADY EXISTS. ` +
          `Rolling would merge two runs into one tree. Nothing written.`,
        12000,
      );
      return;
    }

    const choice = await quickAddApi.suggester(
      ["Cancel — change nothing", `ROLL to Period ${newIndex} (${newLabel})`],
      [
        "Cancel",
        `period_index ${curIndex} → ${newIndex}  ·  ${newStart} → ${newEnd}  ·  Cycle resets to 1`,
      ],
      `Cycle 7 complete — roll the period?   Current: ${curLabel}`,
    );
    if (!choice || !String(choice).startsWith("ROLL")) {
      new Notice("Period rollover cancelled — nothing written.");
      return;
    }

    let next = periodRaw;
    next = setField(next, "period_index", newIndex);
    next = setField(next, "period_label", `"${newLabel}"`);
    next = setField(next, "period_start", newStart);
    next = setField(next, "period_end", newEnd);
    next = setField(next, "cycle_1_start", newStart);
    next = setField(next, "generated_by", `"Sweeper – Start New Cycle (rollover, ${newStart})"`);
    await vault.adapter.write(PC.PERIOD_FILE, next);

    newCycle = 1;
    new Notice(
      `⏳ Period ${newIndex} opened — ${newLabel} (${newStart} → ${newEnd}). Cycle reset to 1.`,
      9000,
    );
  }

  // Re-bind to the (possibly NEW) label so every path below resolves correctly.
  const NP = PC.bind(newLabel);

  // ── Build the new cycle's structure under the correct period ─────────────────
  async function ensureFolder(p) {
    if (!(await vault.adapter.exists(p))) await vault.createFolder(p);
  }
  for (let w = 1; w <= 7; w++) {
    await ensureFolder(NP.artifactDir(newCycle, w));
    await ensureFolder(NP.bBombDir(newCycle, w));
  }
  await ensureFolder(NP.insightDir(newCycle));
  await ensureFolder(NP.nextStepsDir(newCycle));
  await ensureFolder(NP.reviewCycleDir(newCycle));
  await ensureFolder(NP.mocsDir(newCycle));
  await ensureFolder(NP.planDir(newCycle));
  await ensureFolder(NP.periodPlanDir());
  await ensureFolder(NP.outreachDir());
  for (let w = 1; w <= 7; w++) {
    const f = NP.insightFile(newCycle, w);
    if (!(await vault.adapter.exists(f))) {
      await vault.create(f, `# Insights – Cycle ${newCycle}, Week ${w}\n\n`);
    }
  }

  // ── Inherit decisions from the completed cycle ───────────────────────────────
  // CortexMem spaces are PERIOD-SCOPED: `cycle-1` in Period 2 is a different cycle
  // from `cycle-1` in Period 1, and the rollover makes that reachable. Read the
  // period-scoped space first, then fall back to the legacy un-scoped name.
  const prevScoped = `${curLabel}-cycle-${previousCycle}`;
  const newScoped = `${newLabel}-cycle-${newCycle}`;
  let previousDecisions = cortexmem(
    quickAdd,
    `get_context --space "${prevScoped}" --type decision`,
  );
  if (!previousDecisions) {
    previousDecisions = cortexmem(
      quickAdd,
      `get_context --space "cycle-${previousCycle}" --type decision`,
    );
  }

  if (previousDecisions) {
    const decisionLines = previousDecisions.split("\n").filter((l) => l.trim());
    let inherited = 0;
    for (const decision of decisionLines.slice(0, 20)) {
      const safeContent = decision.replace(/"/g, "'").slice(0, 500);
      cortexmem(
        quickAdd,
        `save_context --type decision --space "${newScoped}" --content "${safeContent}" --tags "inherited"`,
      );
      inherited++;
    }
    new Notice(
      `🧠 ${newScoped} seeded with ${inherited} memories from ${prevScoped}`,
    );
  } else {
    new Notice(`No memories found from ${prevScoped} to inherit.`);
  }
};
