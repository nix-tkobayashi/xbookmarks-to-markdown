# X Bookmarks to Markdown

A browser extension to export your bookmarks from X (formerly Twitter) into organized Markdown files.

## Features

- **Export by Date Range**: Select a "From" and "To" date to export only the bookmarks you need.
- **Markdown Format**: Each bookmark is saved as a separate Markdown file, preserving the text, author, and timestamp.
- **ZIP Archive**: All Markdown files are conveniently packaged into a single `.zip` file for easy download.
- **User-Friendly Interface**: Simple and straightforward popup UI to manage your exports.
- **Privacy-Focused**: All processing is done locally in your browser. No data is sent to external servers.

## How to Use

1.  Navigate to your X bookmarks page (`https://x.com/i/bookmarks`).
2.  Click on the extension icon in your browser's toolbar.
3.  Select the desired date range using the "From" and "To" fields.
4.  Click the "Export Bookmarks" button.
5.  A "Save As" dialog will appear, allowing you to save the `x-bookmarks.zip` file to your computer.

## Installation

You can install this extension by loading it as an unpacked extension in Chrome or other Chromium-based browsers.

1.  Download or clone this repository.
2.  If you downloaded a ZIP, extract it.
3.  Open your browser's extension management page (e.g., `chrome://extensions`).
4.  Enable "Developer mode".
5.  Click "Load unpacked" and select the `dist` directory from this project.

# Privacy Policy

This extension operates entirely on your local machine.

- **Data Access**: The extension requests access to `https://x.com/i/bookmarks` to read your bookmark data for the sole purpose of exporting it.
- **Data Storage**: No bookmark data, personal information, or browsing activity is ever stored, transmitted, or sent to any external server. All processing happens and stays in your browser.
- **Downloads**: The "Export Bookmarks" feature uses the browser's `downloads` permission to save the generated `.zip` file directly to your computer. The extension does not access your download history.

Your privacy is fully respected. The code is open-source and can be reviewed to verify these claims.
