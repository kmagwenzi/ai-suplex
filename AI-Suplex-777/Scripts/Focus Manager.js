// Focus Manager.js – 7‑7‑7 Edition
// ⚠️ NOTE: CortexMem space creation removed. Focuses.md is canonical.
// Manages AI-Suplex-777/Focuses.md (add/edit/delete focuses).
// 3lm handles all memory operations.

const { execSync } = require("child_process");
const path = require("path");

// CortexMem removed — Focuses.md is canonical.
// 3lm handles all memory operations.

function createFocusMemory(focusName) {
  // Focus synced to Memory/semantic/focuses.md via Sync Focuses to 3lm macro
  return true;
}

module.exports = async (quickAdd) => {
  const { app, quickAddApi } = quickAdd;
  const vault = app.vault;
  const focusesPath = "AI-Suplex-777/Focuses.md";

  const defaultFocuses = [
    {
      name: "ai-engineering",
      display: "AI Engineering",
      description:
        "Learning and applying AI engineering skills, including prompt engineering, RAG, agents, fine‑tuning.",
    },
    {
      name: "wqr",
      display: "WQR",
      description:
        "WhatsApp Quick Responder SaaS – payment integration, bot workflows, client onboarding.",
    },
    {
      name: "freelance",
      display: "Freelance",
      description:
        "Web development freelancing – client projects, Upwork, portfolio building.",
    },
    {
      name: "digital-products",
      display: "Digital Products",
      description:
        "Creating and selling digital products (templates, courses, prompt packs).",
    },
    {
      name: "content-creation",
      display: "Content Creation",
      description: "Build in public, tutorials, social media, audience growth.",
    },
  ];

  async function ensureFolder(folderPath) {
    if (!(await vault.adapter.exists(folderPath))) {
      await vault.createFolder(folderPath);
    }
  }

  async function readFocuses() {
    await ensureFolder("AI-Suplex-777");
    if (!(await vault.adapter.exists(focusesPath))) {
      let defaultYaml = `---\nfocuses:\n`;
      for (const f of defaultFocuses) {
        defaultYaml += `  - name: ${f.name}\n    display: ${f.display}\n    description: "${f.description.replace(/"/g, '\\"')}"\n`;
      }
      defaultYaml += `---\n`;
      await vault.adapter.write(focusesPath, defaultYaml);
      return defaultFocuses;
    }
    const content = await vault.adapter.read(focusesPath);
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
      console.warn("Invalid frontmatter, regenerating defaults.");
      let defaultYaml = `---\nfocuses:\n`;
      for (const f of defaultFocuses) {
        defaultYaml += `  - name: ${f.name}\n    display: ${f.display}\n    description: "${f.description.replace(/"/g, '\\"')}"\n`;
      }
      defaultYaml += `---\n`;
      await vault.adapter.write(focusesPath, defaultYaml);
      return defaultFocuses;
    }
    const frontmatter = match[1];
    const focuses = [];
    const nameMatches = [...frontmatter.matchAll(/name:\s*(\S+)/g)];
    const displayMatches = [...frontmatter.matchAll(/display:\s*(.+)/g)];
    const descMatches = [...frontmatter.matchAll(/description:\s*"(.+?)"/g)];
    for (let i = 0; i < nameMatches.length; i++) {
      focuses.push({
        name: nameMatches[i][1],
        display: displayMatches[i] ? displayMatches[i][1] : nameMatches[i][1],
        description: descMatches[i] ? descMatches[i][1] : "",
      });
    }
    return focuses;
  }

  async function writeFocuses(focuses) {
    let yaml = `---\nfocuses:\n`;
    for (const f of focuses) {
      yaml += `  - name: ${f.name}\n    display: ${f.display}\n    description: "${f.description.replace(/"/g, '\\"')}"\n`;
    }
    yaml += `---\n`;
    await vault.adapter.write(focusesPath, yaml);
  }

  let focuses = await readFocuses();

  const menuOptions = [
    "Add focus",
    "Edit focus",
    "Delete focus",
    "View focuses",
    "Exit",
  ];
  let running = true;
  while (running) {
    const choice = await quickAddApi.suggester(
      menuOptions,
      menuOptions,
      "Focus Manager",
    );
    if (choice === "Exit") break;

    if (choice === "Add focus") {
      const name = await quickAddApi.inputPrompt(
        "Focus name (lowercase, hyphen-separated, e.g., 'investor-updates')",
      );
      if (!name) continue;
      if (focuses.some((f) => f.name === name)) {
        new Notice("Focus already exists.");
        continue;
      }
      const display = await quickAddApi.inputPrompt(
        "Display name (e.g., 'Investor Updates')",
      );
      const description = await quickAddApi.inputPrompt(
        "Description (one sentence)",
      );
      focuses.push({
        name,
        display: display || name,
        description: description || "",
      });
      await writeFocuses(focuses);
      createFocusMemory(quickAdd, name);
      new Notice(`✅ Added focus: ${display} (run Sync Focuses to 3lm to update memory)`);
    } else if (choice === "Edit focus") {
      const focusNames = focuses.map((f) => `${f.display} (${f.name})`);
      const selected = await quickAddApi.suggester(
        focusNames,
        focuses,
        "Select focus to edit",
      );
      if (!selected) continue;
      const newName = await quickAddApi.inputPrompt(
        "New name (lowercase, hyphen)",
        selected.name,
      );
      const newDisplay = await quickAddApi.inputPrompt(
        "New display name",
        selected.display,
      );
      const newDesc = await quickAddApi.inputPrompt(
        "New description",
        selected.description,
      );
      if (newName) selected.name = newName;
      if (newDisplay) selected.display = newDisplay;
      if (newDesc !== undefined) selected.description = newDesc;
      await writeFocuses(focuses);
      new Notice(`Updated focus: ${selected.display}`);
    } else if (choice === "Delete focus") {
      const focusNames = focuses.map((f) => `${f.display} (${f.name})`);
      const selected = await quickAddApi.suggester(
        focusNames,
        focuses,
        "Select focus to delete",
      );
      if (!selected) continue;
      const confirm = await quickAddApi.yesNoPrompt(
        `Delete "${selected.display}"?`,
        false,
      );
      if (confirm) {
        focuses = focuses.filter((f) => f.name !== selected.name);
        await writeFocuses(focuses);
        new Notice(`Deleted focus: ${selected.display}`);
      }
    } else if (choice === "View focuses") {
      const lines = focuses.map(
        (f) => `- **${f.display}** (${f.name}): ${f.description}`,
      );
      const msg = lines.join("\n") || "No focuses defined.";
      new Notice(msg, 5000);
    }
  }
};
