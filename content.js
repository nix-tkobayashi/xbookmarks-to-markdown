// Guard so re-injecting this script (every export click) doesn't stack listeners,
// which would run two scrape loops at once.
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage && !window.__xbmListenerRegistered) {
    window.__xbmListenerRegistered = true;
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "scrapeBookmarks") {
            scrapeBookmarks(request.startDate, request.endDate).then(response => {
                sendResponse(response);
            }).catch(error => {
                console.error("Scraping failed:", error);
                sendResponse({ status: i18nMessage('statusScrapingFailed', "Scraping failed. See console for details.") });
            });
            return true; // Indicates that the response is sent asynchronously
        }
    });
}

// Browser-locale message with an English fallback, so this file also loads in Node for tests.
function i18nMessage(key, fallback) {
    if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
        const message = chrome.i18n.getMessage(key);
        if (message) return message;
    }
    return fallback;
}

async function scrapeBookmarks(startDateStr, endDateStr) {
    const markdownByUrl = new Map();
    let lastHeight = 0;

    const startDate = startDateStr ? new Date(startDateStr.replace(/-/g, '/')) : null;
    const endDate = endDateStr ? new Date(endDateStr.replace(/-/g, '/')) : null;
    if (endDate) {
        endDate.setHours(23, 59, 59, 999);
    }

    while (true) {
        const articleElements = document.querySelectorAll('article[data-testid="tweet"]');

        for (const article of articleElements) {
            const tweetLinkElement = article.querySelector('a[href*="/status/"]');
            if (!tweetLinkElement) continue;
            const tweetUrl = tweetLinkElement.href;
            if (markdownByUrl.has(tweetUrl)) continue;

            const timeElement = article.querySelector('time');
            if (!timeElement || !timeElement.getAttribute('datetime')) continue;
            const timestamp = new Date(timeElement.getAttribute('datetime'));

            // Bookmarks are ordered by when they were bookmarked, not by tweet date,
            // so an out-of-range tweet must be skipped, never used as a stop signal.
            if ((startDate && timestamp < startDate) || (endDate && timestamp > endDate)) continue;

            // Parse immediately: X.com virtualizes the timeline and drops off-screen
            // articles from the DOM, so element references go stale after scrolling.
            const markdown = parseArticleToMarkdown(article);
            if (markdown) {
                markdownByUrl.set(tweetUrl, markdown);
            }
        }

        if (articleElements.length === 0) break;

        const lastArticle = articleElements[articleElements.length - 1];
        lastArticle.scrollIntoView({ behavior: 'auto', block: 'center' });
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newHeight = document.body.scrollHeight;
        if (newHeight === lastHeight) break;
        lastHeight = newHeight;
    }

    const markdownFiles = Array.from(markdownByUrl.values());

    if (markdownFiles.length === 0) {
        return { status: i18nMessage('statusNoBookmarks', "No bookmarks found in the selected date range.") };
    }

    return { markdownFiles };
}

function parseArticleToMarkdown(article) {
    try {
        const tweetLinkElement = article.querySelector('a[href*="/status/"]');
        if (!tweetLinkElement) return null;
        const tweetUrl = tweetLinkElement.href;

        const authorElement = article.querySelector('div[data-testid="User-Name"]');
        const authorName = authorElement ? authorElement.textContent.trim() : 'Unknown Author';

        const tweetTextElement = article.querySelector('div[data-testid="tweetText"]');
        const tweetText = tweetTextElement ? tweetTextElement.innerText : '';

        const timeElement = article.querySelector('time');
        const timestamp = timeElement ? timeElement.getAttribute('datetime') : new Date().toISOString();

        const imageUrls = [];
        article.querySelectorAll('div[data-testid="tweetPhoto"] img').forEach(img => {
            if (img.src && !imageUrls.includes(img.src)) {
                imageUrls.push(img.src);
            }
        });

        const hasVideo = !!article.querySelector('video, div[data-testid="videoPlayer"]');

        const linkUrls = [];
        article.querySelectorAll('a[href*="https://t.co/"]').forEach(link => {
            if (!linkUrls.includes(link.href)) {
                linkUrls.push(link.href);
            }
        });

        return buildMarkdown({ tweetUrl, authorName, tweetText, timestamp, imageUrls, hasVideo, linkUrls });
    } catch (error) {
        console.error("Failed to parse an article:", error, article);
        return null;
    }
}

// Pure function (no DOM access) so it can be unit-tested in Node.
function buildMarkdown({ tweetUrl, authorName, tweetText, timestamp, imageUrls, hasVideo, linkUrls }) {
    const idMatch = tweetUrl.match(/\/status\/(\d+)/);
    const tweetId = idMatch ? idMatch[1] : tweetUrl.split('/').pop();

    const media = imageUrls.map(src => `![Image](${src})`);
    if (hasVideo) {
        media.push(`[Video](${tweetUrl})`);
    }

    const body = tweetText || (media.length > 0 ? '*(Media-only tweet)*' : '*(No text content)*');

    let content = `---
Author: ${authorName}
Timestamp: ${timestamp}
URL: ${tweetUrl}
---

${body}
`;

    if (media.length > 0) {
        content += `\n## Media\n${media.join('\n')}\n`;
    }

    if (linkUrls.length > 0) {
        content += `\n## Links\n${linkUrls.map(l => `- ${l}`).join('\n')}\n`;
    }

    // Always include the tweet ID so tweets sharing the same first 50 characters
    // (or with no text at all) never collide inside the ZIP.
    const titlePart = tweetText.substring(0, 50).replace(/\s+/g, '_');
    const filename = titlePart ? `${titlePart}_${tweetId}` : tweetId;

    return { filename, content };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildMarkdown };
}
