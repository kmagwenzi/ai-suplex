// Outreach.js — the Outreach entity capture macro (Outreach spec §7, path 2)
// Mirrors Artifacts.js: suggester for status/channel/focus, prompt for the rest.
// Saves to AI-Suplex-777/Outreach/<Period>/YYYY-MM-DD-HHMM-<counterparty-slug>-<focus>.md
// Default status: drafted. State-conditional fields enforced per spec §4.1.
// The board (`Tools/outreach-board.js`) projects these files — never hand-edit it.

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
        reviewWeeklyDir: () => j("AI-Suplex-777","Reviews",label,"Weekly"),
        mocsDir:     (c)   => j("AI-Suplex-777","MOCs",per(c),"Weekly",`Cycle ${c}`),
        periodCardDir:()   => j("AI-Suplex-777","MOCs",label),
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

    async function getFocuses() {
        const focusesPath = "AI-Suplex-777/Focuses.md";
        const fallback = [
            { name: "ai-engineering", display: "AI Engineering" },
            { name: "wqr", display: "WQR" },
            { name: "freelance", display: "Freelance" },
            { name: "digital-products", display: "Digital Products" },
            { name: "content-creation", display: "Content Creation" },
            { name: "research", display: "Research" },
        ];
        if (!(await vault.adapter.exists(focusesPath))) return fallback;
        const content = await vault.adapter.read(focusesPath);
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        if (!match) return fallback;
        const frontmatter = match[1];
        const focuses = [];
        const nameMatches = [...frontmatter.matchAll(/\s*-\s*name:\s*(\S+)/g)];
        const displayMatches = [...frontmatter.matchAll(/\s*display:\s*(.+)/g)];
        for (let i = 0; i < nameMatches.length; i++) {
            focuses.push({
                name: nameMatches[i][1],
                display: displayMatches[i] ? displayMatches[i][1].trim() : nameMatches[i][1],
            });
        }
        return focuses.length ? focuses : fallback;
    }

    async function ensureFolder(folderPath) {
        if (!(await vault.adapter.exists(folderPath))) {
            await vault.createFolder(folderPath);
        }
    }

    // — the suggester options (spec §4.1) —
    const statuses = ["drafted", "sent", "replied", "won", "lost", "dormant"];
    const channels = ["linkedin", "email", "mindrift", "upwork", "fiverr", "whatsapp", "platform", "in-person", "other"];

    const status = await quickAddApi.suggester(statuses, statuses, "Status (default: drafted)") || "drafted";
    const counterparty = (await quickAddApi.inputPrompt("Counterparty (the human or organisation)"))?.trim();
    if (!counterparty) {
        new Notice("Outreach capture aborted — counterparty is required.", 4000);
        return;
    }
    const channel = await quickAddApi.suggester(channels, channels, "Channel") || "other";
    const focuses = await getFocuses();
    const focusNames = focuses.map(f => f.name);
    const focus = await quickAddApi.suggester(focusNames, focusNames, "Focus") || "freelance";
    const focusDisplay = (focuses.find(f => f.name === focus) || { display: focus }).display;

    const context = (await quickAddApi.inputPrompt("One-line context (for the title)"))?.trim() || counterparty;
    const summary = (await quickAddApi.inputPrompt("Summary (one paragraph — who, why, what was asked)", null, { multiline: true }))?.trim() || "";
    const ask = (await quickAddApi.inputPrompt("The Ask (the specific thing wanted from them)"))?.trim() || "";

    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10);
    const timeForFilename = now.toISOString().slice(11, 16).replace(":", "");

    // — state-conditional fields (spec §4.1) — a required field left blank is a board error
    let sent_at = "", follow_up_at = "", replied_at = "", closed_at = "", outcome = "", evidence = "";
    if (status === "sent") {
        sent_at = (await quickAddApi.inputPrompt("sent_at (YYYY-MM-DD)", formattedDate))?.trim() || formattedDate;
        follow_up_at = (await quickAddApi.inputPrompt("follow_up_at (YYYY-MM-DD) — the wake condition", ""))?.trim() || "";
    } else if (status === "replied") {
        replied_at = (await quickAddApi.inputPrompt("replied_at (YYYY-MM-DD)", formattedDate))?.trim() || formattedDate;
    } else if (status === "won" || status === "lost") {
        closed_at = (await quickAddApi.inputPrompt("closed_at (YYYY-MM-DD)", formattedDate))?.trim() || formattedDate;
        outcome = (await quickAddApi.inputPrompt("Outcome (what happened, what was learned)", null, { multiline: true }))?.trim() || "";
        if (status === "won") {
            evidence = (await quickAddApi.inputPrompt("Evidence link (invoice / agreement / payment ref / artifact)"))?.trim() || "";
        }
    } else if (status === "dormant") {
        follow_up_at = (await quickAddApi.inputPrompt("follow_up_at (YYYY-MM-DD) — a deliberate far-future date", ""))?.trim() || "";
    }

    // — filename: <date>-<time>-<counterparty-slug>-<focus> (spec §7) —
    const slug = counterparty.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 50);
    const fileName = `${formattedDate}-${timeForFilename}-${slug}-${focus}.md`;
    const folderPath = P.outreachDir();
    await ensureFolder(folderPath);
    const filePath = `${folderPath}/${fileName}`;

    const frontmatter = `---
type: outreach
status: ${status}
counterparty: "${counterparty.replace(/"/g, '\\"')}"
organization: 
role_or_offer: 
channel: ${channel}
focus: ${focus}
created: ${formattedDate}
sent_at: ${sent_at}
follow_up_at: ${follow_up_at}
replied_at: ${replied_at}
closed_at: ${closed_at}
outcome: "${outcome.replace(/"/g, '\\"')}"
evidence: ${evidence}
expected_value: 
currency: USD
source_artifact: 
source_session: 
next_action: 
tags:
  - outreach
  - ${focus}
---

# Outreach — ${counterparty} (${context})

## 📋 Summary
${summary}

## 🎯 The Ask
${ask}

## 📝 Progress
- ${formattedDate} — ${status}${channel ? ` (${channel})` : ""}

## 🔗 Links
- Source artifact: 
- Focus MOC: [[${focusDisplay} MOC]]
- Related session: 

## 🏁 Outcome
${outcome || "*Filled at close — what happened, what was learned.*"}

---
*Outreach record created via QuickAdd on ${formattedDate} — \`Outreach/<Period>/\`. The board is generated from these files; never hand-edit it.*
`;

    await vault.create(filePath, frontmatter);
    const file = vault.getAbstractFileByPath(filePath);
    await app.workspace.openLinkText(file.path, "", false);
    new Notice(`Outreach captured: ${fileName}`, 3000);
};
