// Sweeper – Create MOC.js
// Reads focuses from Focuses.md and generates a MOC for each focus in AI-Suplex-777/MOCs/ plus an index file

module.exports = async (quickAdd) => {
  const { app } = quickAdd;
  const vault = app.vault;
  const focusesPath = "AI-Suplex-777/Focuses.md";

  async function readFocuses() {
    if (!(await vault.adapter.exists(focusesPath))) {
      new Notice("Focuses.md not found. Please run Focus Manager first.");
      return [];
    }
    const content = await vault.adapter.read(focusesPath);
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return [];
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

  const focuses = await readFocuses();
  if (!focuses.length) return;

  const mocsFolder = "AI-Suplex-777/MOCs";
  if (!(await vault.adapter.exists(mocsFolder))) {
    await vault.createFolder(mocsFolder);
  }

  for (const focus of focuses) {
    const displayName = focus.display;
    const fileName = `${displayName} MOC.md`;
    const filePath = `${mocsFolder}/${fileName}`;
    const content = `---
tags: [moc, ${focus.name}]
focus: ${focus.name}
description: "${focus.description}"
---

# 🗺️ Map of Content: ${displayName}

> ${focus.description}

## 📅 Sessions tagged with \`#${focus.name}\`

\`\`\`dataview
TABLE date as Date, session_type as Type, focus_quality as "Focus Q"
FROM "AI-Suplex-777/Sessions/Active/Start" OR "AI-Suplex-777/Sessions/Active/End"
WHERE contains(tags, "${focus.name}")
SORT date DESC
LIMIT 20
\`\`\`

## 💣 Artifacts & B‑Bombs

### Artifacts
\`\`\`dataview
TABLE date as Date, key_insights as "Key Insights"
FROM "AI-Suplex-777/Artifacts"
WHERE contains(tags, "${focus.name}")
SORT date DESC
LIMIT 20
\`\`\`

### B‑Bombs
\`\`\`dataview
TABLE date as Date, product_potential as "Product Potential"
FROM "AI-Suplex-777/B-Bombs"
WHERE contains(tags, "${focus.name}")
SORT date DESC
LIMIT 20
\`\`\`

## 💡 Insights
\`\`\`dataview
LIST item.text
FROM "AI-Suplex-777/Insights"
FLATTEN file.lists as item
WHERE contains(item.text, "${focus.name}")
SORT file.ctime DESC
LIMIT 10
\`\`\`

## 🔗 Related
- [[${displayName} Tracker]]
- [[Command Center]]
`;

    let file = vault.getAbstractFileByPath(filePath);
    if (file) await vault.delete(file);
    await vault.create(filePath, content);
    console.log(`Created/updated MOC: ${fileName}`);
  }
  // Create/update MOCs index file
  const indexFilePath = "AI-Suplex-777/MOCs.md";
  const sortedFocuses = focuses.sort((a, b) =>
    a.display.localeCompare(b.display),
  );
  let indexContent = `
# AI-Suplex 777 🦸 - MOCs

`;
  for (const focus of sortedFocuses) {
    indexContent += `[[${focus.display} MOC]]\n`;
  }
  indexContent += `
---
_Mapping Content via AI-Suplex on ${new Date().toISOString()}_
`;

  let indexFile = vault.getAbstractFileByPath(indexFilePath);
  if (indexFile) await vault.delete(indexFile);
  await vault.create(indexFilePath, indexContent);
  console.log(`Created/updated MOCs index: ${indexFilePath}`);

  new Notice(`Generated ${focuses.length} MOC files and index.`, 3000);
};
