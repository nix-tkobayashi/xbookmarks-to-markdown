// Single source of truth for the X.com pages the extension can export from.
// /i/bookmarks is the classic bookmarks page; /i/history hosts the newer
// bookmark-tags UI that X serves to some accounts.
const SUPPORTED_PAGE_PATHS = [
    '/i/bookmarks',
    '/i/history'
];

function isSupportedPageUrl(url) {
    if (typeof url !== 'string') return false;
    let parsed;
    try {
        parsed = new URL(url);
    } catch (e) {
        return false;
    }
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'x.com') return false;
    return SUPPORTED_PAGE_PATHS.some(path =>
        parsed.pathname === path || parsed.pathname.startsWith(path + '/'));
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isSupportedPageUrl, SUPPORTED_PAGE_PATHS };
}
