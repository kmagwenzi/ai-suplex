// Sweeper – Archive Session.js
// Moves a single session (start + end) from Active/ to Archive/, preserving cycle/week structure.

module.exports = async (quickAdd) => {
    const { app, quickAddApi } = quickAdd;
    const vault = app.vault;

    async function moveFile(filePath, targetFolder) {
        if (!filePath) return false;
        const file = vault.getAbstractFileByPath(filePath);
        if (!file) return false;
        const fileName = file.name;
        const newPath = `${targetFolder}/${fileName}`;
        if (await vault.adapter.exists(newPath)) {
            console.warn(`File already exists at ${newPath}, skipping.`);
            return false;
        }
        await vault.rename(file, newPath);
        return true;
    }

    const cycle = await quickAddApi.inputPrompt("Cycle (1-7)", "e.g., 1");
    if (!cycle || cycle < 1 || cycle > 7) {
        new Notice("Invalid cycle.");
        return;
    }
    const week = await quickAddApi.inputPrompt("Week (1-7)", "e.g., 1");
    if (!week || week < 1 || week > 7) {
        new Notice("Invalid week.");
        return;
    }

    const activeEndFolder = "AI-Suplex-777/Sessions/Active/End";
    let endFiles = [];
    const nestedPath = `${activeEndFolder}`; // flat, but we'll filter by frontmatter
    const allFiles = vault.getMarkdownFiles().filter(f => f.path.startsWith(activeEndFolder));
    for (const file of allFiles) {
        const content = await vault.read(file);
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (fmMatch) {
            const fm = fmMatch[1];
            const cycleMatch = fm.match(/cycle:\s*(\d+)/);
            const weekMatch = fm.match(/week:\s*(\d+)/);
            if (cycleMatch && weekMatch && cycleMatch[1] == cycle && weekMatch[1] == week) {
                endFiles.push({ path: file.path, name: file.name, date: file.name.slice(0,10) });
            }
        }
    }

    if (endFiles.length === 0) {
        new Notice(`No session end files found for Cycle ${cycle}, Week ${week}.`, 3000);
        return;
    }

    const choices = endFiles.map(f => `${f.date} - ${f.name}`);
    const selected = await quickAddApi.suggester(choices, endFiles, "Select session to archive");
    if (!selected) return;

    const sessionDate = selected.date;
    const endFileName = selected.name;
    const startFileName = endFileName.replace("-session-end", "-session-start");

    const startPath = `AI-Suplex-777/Sessions/Active/Start/${startFileName}`;
    const endPath = selected.path;

    const targetStartFolder = `AI-Suplex-777/Sessions/Archive/Start`;
    const targetEndFolder = `AI-Suplex-777/Sessions/Archive/End`;

    await vault.adapter.mkdir(targetStartFolder);
    await vault.adapter.mkdir(targetEndFolder);

    let movedStart = false, movedEnd = false;
    if (await vault.adapter.exists(startPath)) {
        movedStart = await moveFile(startPath, targetStartFolder);
    } else {
        console.warn(`Start file not found: ${startPath}`);
    }
    movedEnd = await moveFile(endPath, targetEndFolder);

    if (movedEnd) {
        new Notice(`Session ${sessionDate} archived: Start moved? ${movedStart}, End moved.`, 4000);
    } else {
        new Notice(`Failed to archive session.`, 3000);
    }
};