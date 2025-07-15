# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome/Chromium browser extension (Manifest V3) that exports X (formerly Twitter) bookmarks to Markdown format. The extension processes all data locally for privacy.

## Commands

### Development
- `npm install` - Install dependencies
- `npm test` - Run Jest tests
- `npm run build` - Create extension.zip for distribution (packages all necessary files)

### Testing Individual Components
- `npm test zip-generator.test.js` - Test ZIP generation functionality

## Architecture

### Key Files and Their Roles

1. **manifest.json** - Extension configuration
   - Permissions: scripting, downloads
   - Host permission: https://x.com/i/bookmarks

2. **background.js** - Service worker (Chrome Extension background script)
   - Handles message passing between popup and content script
   - Manages JSZip integration and file downloads
   - Injects content script into X bookmarks page

3. **content.js** - Page scraping logic
   - Scrapes bookmark articles from X.com using DOM queries
   - Implements auto-scrolling to load all bookmarks
   - Filters bookmarks by date range
   - Converts tweets to Markdown format

4. **popup.js/popup.html** - Extension UI
   - Date range picker for filtering bookmarks
   - Export button triggers the entire process
   - Helper button to navigate to X bookmarks page

5. **zip-generator.js** - Modular ZIP creation
   - Generates ZIP files with JSZip
   - Creates index.md with links to all bookmarks
   - Sanitizes filenames for cross-platform compatibility

### Message Flow
1. User clicks export in popup.js
2. popup.js sends message to background.js
3. background.js injects content.js into X bookmarks page
4. content.js scrapes and filters bookmarks, sends data back
5. background.js uses zip-generator.js to create ZIP file
6. ZIP file is downloaded via Chrome downloads API

## Important Notes

- The extension requires active X.com session (user must be logged in)
- All processing happens locally - no external API calls
- The artifacts/ directory contains the production-ready extension files
- When modifying content.js, test thoroughly as X.com DOM structure may change
- Date filtering uses UTC timestamps for consistency