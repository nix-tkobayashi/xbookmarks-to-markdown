try {
  importScripts('url-utils.js', 'jszip.min.js', 'zip-generator.js');
} catch (e) {
  console.error(e);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startExport") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && isSupportedPageUrl(activeTab.url)) {
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ["content.js"]
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("Failed to inject script:", chrome.runtime.lastError.message);
            sendResponse({ status: chrome.i18n.getMessage('statusInjectFailed') });
            return;
          }
          // After injecting, send a message to the content script to start scraping
          chrome.tabs.sendMessage(activeTab.id, { 
            action: "scrapeBookmarks",
            startDate: request.startDate,
            endDate: request.endDate
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error communicating with content script:", chrome.runtime.lastError.message);
            } else if (response && response.markdownFiles) {
              handleGeneratedZip(response.markdownFiles);
              sendResponse({ status: chrome.i18n.getMessage('statusExportComplete') });
            } else if (response && response.status) {
                sendResponse({ status: response.status });
            }
            else {
               sendResponse({ status: chrome.i18n.getMessage('statusExportFailedNoData') });
            }
          });
        });
      } else {
        sendResponse({ status: chrome.i18n.getMessage('statusWrongPage') });
      }
    });

    return true; // Indicates that the response is sent asynchronously
  }
});

async function handleGeneratedZip(markdownFiles) {
    // generateZip is now defined in zip-generator.js
    const zipArrayBuffer = await generateZip(markdownFiles, JSZip, chrome);
    const zipBlob = new Blob([zipArrayBuffer]);
    
    const reader = new FileReader();
    reader.onload = function() {
        chrome.downloads.download({
            url: reader.result,
            filename: "x-bookmarks.zip",
            saveAs: true
        });
    };
    reader.readAsDataURL(zipBlob);
}
