import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const files = [
  'src/components/resources/resources-client.tsx',
  'src/components/resources/resource-card.tsx',
  'src/components/resources/resource-detail-client.tsx'
];

const forbiddenPatterns = [
  'handleDownload(',
  'onDownload',
  'downloadUrl || resource.fileId',
  'downloadUrl || resource.fileId',
  'labels.downloadPdf',
  'modalDownload',
  '<FileDown',
  'FileDown',
  'pdfUrl &&',
  'download\n',
  'download>'
];

test('resources ui no longer exposes download affordances', () => {
  for (const relativePath of files) {
    const absolutePath = path.join(process.cwd(), relativePath);
    const source = fs.readFileSync(absolutePath, 'utf8');

    for (const pattern of forbiddenPatterns) {
      assert.equal(
        source.includes(pattern),
        false,
        `${relativePath} still contains forbidden pattern: ${pattern}`
      );
    }
  }
});
