// Sweeper – Archive All Active Sessions.js
// Moves EVERY session file from Active/Start and Active/End to Archive/Start and Archive/End.

module.exports = async (quickAdd) => {
    const { app } = quickAdd;
    const vault = app.vault;

    async function moveAllFiles(sourceDir, targetBase) {
        const allFiles = vault.getMarkdownFiles();
        const filesToMove = allFiles.filter(f => f.path.startsWith(sourceDir));
        if (filesToMove.length === 0) return 0;
        let movedCount = 0;
        for (const file of filesToMove) {
            const relativePath = file.path.substring(sourceDir.length + 1);
            const targetPath = `${targetBase}/${relativePath}`;
            const targetFolder = targetPath.substring(0, targetPath.lastIndexOf('/'));
            if (!(await vault.adapter.exists(targetFolder))) {
                await vault.createFolder(targetFolder);
            }
            await vault.rename(file, targetPath);
            movedCount++;
        }
        return movedCount;
    }

    const confirm = await quickAdd.quickAddApi.yesNoPrompt("⚠️ This will move ALL active session files to Archive. Continue?", true);
    if (!confirm) {
        new Notice("Archive cancelled.", 2000);
        return;
    }

    const startMoved = await moveAllFiles("AI-Suplex-777/Sessions/Active/Start", "AI-Suplex-777/Sessions/Archive/Start");
    const endMoved = await moveAllFiles("AI-Suplex-777/Sessions/Active/End", "AI-Suplex-777/Sessions/Archive/End");

    new Notice(`Archived ${startMoved} start files and ${endMoved} end files.`, 5000);
};