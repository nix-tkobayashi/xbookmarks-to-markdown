const fs = require('fs');
const path = require('path');

const en = require('./_locales/en/messages.json');
const ja = require('./_locales/ja/messages.json');

describe('locales', () => {
    test('en and ja define exactly the same message keys', () => {
        expect(Object.keys(ja).sort()).toEqual(Object.keys(en).sort());
    });

    test('every message is a non-empty string', () => {
        for (const locale of [en, ja]) {
            for (const [key, entry] of Object.entries(locale)) {
                expect(typeof entry.message).toBe('string');
                expect(entry.message.length).toBeGreaterThan(0);
            }
        }
    });

    test('every __MSG_key__ referenced in manifest.json exists in the default locale', () => {
        const manifest = fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8');
        const referenced = [...manifest.matchAll(/__MSG_(\w+)__/g)].map(m => m[1]);
        expect(referenced.length).toBeGreaterThan(0);
        for (const key of referenced) {
            expect(en).toHaveProperty(key);
        }
    });

    test('every i18n key referenced in the scripts and popup exists in both locales', () => {
        const sources = ['popup.js', 'popup.html', 'background.js', 'content.js']
            .map(f => fs.readFileSync(path.join(__dirname, f), 'utf8'))
            .join('\n');
        const referenced = new Set([
            ...[...sources.matchAll(/getMessage\('(\w+)'/g)].map(m => m[1]),
            ...[...sources.matchAll(/i18nMessage\('(\w+)'/g)].map(m => m[1]),
            ...[...sources.matchAll(/data-i18n="(\w+)"/g)].map(m => m[1]),
        ]);
        expect(referenced.size).toBeGreaterThan(0);
        for (const key of referenced) {
            expect(en).toHaveProperty(key);
            expect(ja).toHaveProperty(key);
        }
    });
});
