const { isSupportedPageUrl } = require('./url-utils');

describe('isSupportedPageUrl', () => {
    test.each([
        'https://x.com/i/bookmarks',
        'https://x.com/i/bookmarks/all',
        'https://x.com/i/bookmarks?ref=popup',
        'https://x.com/i/history',
        'https://x.com/i/history/tags/123'
    ])('accepts %s', (url) => {
        expect(isSupportedPageUrl(url)).toBe(true);
    });

    test.each([
        'https://x.com/home',
        'https://x.com/notifications',
        'https://x.com/i/bookmarksevil',
        'https://x.com/i/historyevil',
        'https://twitter.com/i/bookmarks',
        'http://x.com/i/bookmarks',
        'https://evil.example/https://x.com/i/bookmarks',
        'https://evil.example/i/bookmarks',
        'not a url',
        ''
    ])('rejects %s', (url) => {
        expect(isSupportedPageUrl(url)).toBe(false);
    });

    test.each([undefined, null, 42])('rejects non-string %p', (url) => {
        expect(isSupportedPageUrl(url)).toBe(false);
    });
});
