chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeBookmarks") {
        scrapeBookmarks(request.startDate, request.endDate).then(response => {
            sendResponse(response);
        }).catch(error => {
            console.error("Scraping failed:", error);
            sendResponse({ status: "Scraping failed. See console for details." });
        });
        return true; // Indicates that the response is sent asynchronously
    }
});

async function scrapeBookmarks(startDateStr, endDateStr) {
    const articles = new Map();
    let lastHeight = 0;
    let shouldStop = false;

    const startDate = startDateStr ? new Date(startDateStr.replace(/-/g, '/')) : null;
    const endDate = endDateStr ? new Date(endDateStr.replace(/-/g, '/')) : null;
    if (endDate) {
        endDate.setHours(23, 59, 59, 999);
    }

    while (!shouldStop) {
        const articleElements = document.querySelectorAll('article[data-testid="tweet"]');
        
        for (const article of articleElements) {
            const tweetLinkElement = article.querySelector('a[href*="/status/"]');
            if (!tweetLinkElement) continue;
            const tweetUrl = tweetLinkElement.href;

            if (!articles.has(tweetUrl)) {
                const timeElement = article.querySelector('time');
                if (timeElement && timeElement.getAttribute('datetime')) {
                    const timestamp = new Date(timeElement.getAttribute('datetime'));
                    
                    if (startDate && timestamp < startDate) {
                        shouldStop = true;
                        break;
                    }

                    if ((!startDate || timestamp >= startDate) && (!endDate || timestamp <= endDate)) {
                        articles.set(tweetUrl, article);
                    }
                }
            }
        }

        if (shouldStop) break;

        const allVisibleArticles = document.querySelectorAll('article[data-testid="tweet"]');
        if (allVisibleArticles.length === 0) {
            break;
        }

        const lastArticle = allVisibleArticles[allVisibleArticles.length - 1];
        lastArticle.scrollIntoView({ behavior: 'auto', block: 'center' });
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newHeight = document.body.scrollHeight;
        if (newHeight === lastHeight) {
            break;
        }
        lastHeight = newHeight;
    }

    const markdownFiles = [];
    for (const article of articles.values()) {
        const markdown = parseArticleToMarkdown(article);
        if (markdown) {
            markdownFiles.push(markdown);
        }
    }
    
    if (markdownFiles.length === 0) {
        return { status: "No bookmarks found in the selected date range." };
    }

    return { markdownFiles };
}

function parseArticleToMarkdown(article) {
    try {
        const tweetLinkElement = article.querySelector('a[href*="/status/"]');
        if (!tweetLinkElement) return null;
        
        const tweetUrl = tweetLinkElement.href;
        const tweetId = tweetUrl.split('/').pop();

        const authorElement = article.querySelector('div[data-testid="User-Name"]');
        const authorName = authorElement ? authorElement.textContent.trim() : 'Unknown Author';
        
        const tweetTextElement = article.querySelector('div[data-testid="tweetText"]');
        const tweetText = tweetTextElement ? tweetTextElement.innerText : '';

        const timeElement = article.querySelector('time');
        const timestamp = timeElement ? timeElement.getAttribute('datetime') : new Date().toISOString();

        // Extract images
        const images = [];
        article.querySelectorAll('div[data-testid="tweetPhoto"] img').forEach(img => {
            images.push(`![Image](${img.src})`);
        });

        // Extract links
        const links = [];
        article.querySelectorAll('a[href*="https://t.co/"]').forEach(link => {
            if (!links.includes(link.href)) {
                links.push(link.href);
            }
        });

        // Construct Markdown content
        let content = `---
Author: ${authorName}
Timestamp: ${timestamp}
URL: ${tweetUrl}
---

${tweetText}
`;

        if (images.length > 0) {
            content += `\n## Media\n${images.join('\n')}\n`;
        }

        if (links.length > 0) {
            content += `\n## Links\n${links.map(l => `- ${l}`).join('\n')}\n`;
        }
        
        // Use a sanitized version of the tweet text or the ID for the filename
        const filename = tweetText.substring(0, 50).replace(/\s+/g, '_') || tweetId;

        return { filename, content };
    } catch (error) {
        console.error("Failed to parse an article:", error, article);
        return null;
    }
}