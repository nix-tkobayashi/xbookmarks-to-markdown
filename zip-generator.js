// This function is now independent of the global `chrome` and `JSZip` objects,
// making it testable in a Node.js environment.
async function generateZip(markdownFiles, JSZip, chrome) {
    const zip = new JSZip();
    let indexContent = "# X Bookmarks\n\n";

    markdownFiles.forEach(file => {
        const safeFilename = file.filename.replace(/[\\/:*?"<>|]/g, '_') + ".md";
        zip.file(safeFilename, file.content);
        indexContent += `- [${file.filename}](${encodeURIComponent(safeFilename)})\n`;
    });

    zip.file("index.md", indexContent);

    const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
    
    // In a real environment, we can't easily test the FileReader part without a browser environment.
    // However, we can trust the chrome.downloads.download call is made with the right blob.
    // For the purpose of this refactoring, we will assume the blob is correct
    // and focus on testing the call to chrome.downloads.download.
    
    // The actual download logic will be slightly different in background.js
    // to accommodate this refactoring.
    return zipArrayBuffer;
}

// Export the function for use in background.js and for testing.
// Note: background.js will need to be updated to use this module.
// This setup is for Node.js `require`. In the extension context, you might need to adjust how you import/export.
// For now, we will handle this manually.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = generateZip;
}

