const { buildMarkdown } = require('./content.js');

const base = {
    tweetUrl: 'https://x.com/someone/status/1234567890',
    authorName: 'Some One@someone',
    tweetText: '',
    timestamp: '2026-08-01T12:00:00.000Z',
    imageUrls: [],
    hasVideo: false,
    linkUrls: [],
};

describe('buildMarkdown', () => {
    test('text tweet keeps its text and gets a filename with title and tweet ID', () => {
        const result = buildMarkdown({ ...base, tweetText: 'Hello world' });
        expect(result.content).toContain('Hello world');
        expect(result.filename).toBe('Hello_world_1234567890');
    });

    test('image-only tweet gets a placeholder body and a Media section', () => {
        const result = buildMarkdown({ ...base, imageUrls: ['https://pbs.twimg.com/media/abc.jpg'] });
        expect(result.content).toContain('*(Media-only tweet)*');
        expect(result.content).toContain('## Media');
        expect(result.content).toContain('![Image](https://pbs.twimg.com/media/abc.jpg)');
    });

    test('video-only tweet gets a placeholder body and a video link', () => {
        const result = buildMarkdown({ ...base, hasVideo: true });
        expect(result.content).toContain('*(Media-only tweet)*');
        expect(result.content).toContain('[Video](https://x.com/someone/status/1234567890)');
    });

    test('tweet with no text and no media still gets a non-empty body', () => {
        const result = buildMarkdown({ ...base });
        expect(result.content).toContain('*(No text content)*');
    });

    test('media-only tweet falls back to the tweet ID as filename', () => {
        const result = buildMarkdown({ ...base, hasVideo: true });
        expect(result.filename).toBe('1234567890');
    });

    test('tweets sharing the same first 50 characters get distinct filenames', () => {
        const text = 'A'.repeat(60);
        const a = buildMarkdown({ ...base, tweetText: text, tweetUrl: 'https://x.com/u/status/111' });
        const b = buildMarkdown({ ...base, tweetText: text, tweetUrl: 'https://x.com/u/status/222' });
        expect(a.filename).not.toBe(b.filename);
        expect(a.filename.endsWith('_111')).toBe(true);
        expect(b.filename.endsWith('_222')).toBe(true);
    });

    test('tweet ID is extracted even when the URL has a suffix after /status/<id>', () => {
        const result = buildMarkdown({ ...base, tweetUrl: 'https://x.com/someone/status/9876543210/photo/1' });
        expect(result.filename).toBe('9876543210');
    });

    test('links are rendered as a Links section', () => {
        const result = buildMarkdown({ ...base, tweetText: 'check this', linkUrls: ['https://t.co/xyz'] });
        expect(result.content).toContain('## Links');
        expect(result.content).toContain('- https://t.co/xyz');
    });

    test('frontmatter contains author, timestamp and URL', () => {
        const result = buildMarkdown({ ...base, tweetText: 'hi' });
        expect(result.content).toContain('Author: Some One@someone');
        expect(result.content).toContain('Timestamp: 2026-08-01T12:00:00.000Z');
        expect(result.content).toContain('URL: https://x.com/someone/status/1234567890');
    });
});
