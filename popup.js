document.addEventListener('DOMContentLoaded', () => {
  const exportContainer = document.getElementById('export-container');
  const wrongPageContainer = document.getElementById('wrong-page-container');
  const navigateBtn = document.getElementById('navigateBtn');
  const exportBtn = document.getElementById('exportBtn');
  const statusDiv = document.getElementById('status');

  // Check the current tab's URL as soon as the popup opens.
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url && currentTab.url.startsWith('https://x.com/i/bookmarks')) {
      // If we are on the correct page, show the export UI.
      exportContainer.style.display = 'block';
      wrongPageContainer.style.display = 'none';
    } else {
      // If we are on the wrong page, show the navigation message.
      exportContainer.style.display = 'none';
      wrongPageContainer.style.display = 'block';
    }
  });

  // Event listener for the export button.
  exportBtn.addEventListener('click', () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    statusDiv.textContent = 'Starting export...';

    chrome.runtime.sendMessage({ 
      action: "startExport",
      startDate: startDate,
      endDate: endDate
    }, (response) => {
      if (chrome.runtime.lastError) {
        statusDiv.textContent = `Error: ${chrome.runtime.lastError.message}`;
        console.error(chrome.runtime.lastError);
      } else if (response && response.status) {
        statusDiv.textContent = response.status;
      }
    });
  });

  // Event listener for the "Go to Bookmarks" button.
  navigateBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://x.com/i/bookmarks' });
  });
});

