const generateZip = require('./zip-generator');
const JSZip = require('jszip');

describe('generateZip', () => {
  it('should create a zip file with an index and markdown files', async () => {
    const markdownFiles = [
      { filename: 'file1', content: 'content1' },
      { filename: 'file2', content: 'content2' },
      { filename: 'file<invalid>char', content: 'content3' },
    ];

    const zipArrayBuffer = await generateZip(markdownFiles, JSZip);
    
    // We can't directly inspect the blob content easily in Node.js without a browser environment.
    // However, we can load the generated blob with JSZip again and check its contents.
    const zip = await JSZip.loadAsync(zipArrayBuffer);

    // Check for index.md
    expect(zip.files['index.md']).toBeDefined();
    const indexContent = await zip.files['index.md'].async('string');
    expect(indexContent).toContain('- [file1](file1.md)');
    expect(indexContent).toContain('- [file2](file2.md)');
    expect(indexContent).toContain('- [file<invalid>char](file_invalid_char.md)');

    // Check for markdown files
    expect(zip.files['file1.md']).toBeDefined();
    const file1Content = await zip.files['file1.md'].async('string');
    expect(file1Content).toBe('content1');

    expect(zip.files['file2.md']).toBeDefined();
    const file2Content = await zip.files['file2.md'].async('string');
    expect(file2Content).toBe('content2');
    
    // Check that invalid characters are sanitized
    expect(zip.files['file_invalid_char.md']).toBeDefined();
    const file3Content = await zip.files['file_invalid_char.md'].async('string');
    expect(file3Content).toBe('content3');
  });
});
