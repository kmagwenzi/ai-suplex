// To Do List.js – 7‑7‑7 Edition
// Creates a raw to-do list with checkboxes and opens in a new tab.
// Saves to AI-Suplex-777/Tasklists/RawTasks/

module.exports = async (quickAdd) => {
    const { quickAddApi, app } = quickAdd;
    const vault = app.vault;

    // Generate filename: YYYY-MM-DD-HHMM To Do List
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const fileName = `${year}-${month}-${day}-${hours}${minutes} To Do List.md`;

    const folderPath = "AI-Suplex-777/Tasklists/RawTasks";

    // Ensure folder exists
    if (!(await vault.adapter.exists(folderPath))) {
        await vault.createFolder(folderPath);
    }

    const filePath = `${folderPath}/${fileName}`;

    // Create to-do list content
    const content = `# To Do List

- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
`;

    // Create file and open in new tab
    await vault.create(filePath, content);
    const file = vault.getAbstractFileByPath(filePath);
    await app.workspace.openLinkText(file.path, "", false);
    new Notice(`To Do List created: ${fileName}`, 3000);

    // Show follow-up prompt
    setTimeout(() => {
        new Notice("💡 Use Pattern: Tasklist Generation to convert this into a structured tasklist", 5000);
    }, 3500);
};
