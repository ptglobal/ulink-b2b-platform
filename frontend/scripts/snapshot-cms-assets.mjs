import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const envText = await readFile(path.join(root, '.env.local'), 'utf8');
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')];
    })
);

const directusUrl = (process.env.DIRECTUS_URL || env.DIRECTUS_URL || 'http://127.0.0.1:8055').replace(/\/$/, '');
const token = process.env.DIRECTUS_TOKEN || env.DIRECTUS_TOKEN;
if (!token) throw new Error('DIRECTUS_TOKEN is required to snapshot CMS assets.');

const headers = { Authorization: `Bearer ${token}` };
const filesResponse = await fetch(
  `${directusUrl}/files?limit=-1&fields=id,type,filename_download`,
  { headers }
);
if (!filesResponse.ok) throw new Error(`Unable to list Directus files (${filesResponse.status}).`);

const { data: files } = await filesResponse.json();
const outputDirectory = path.join(root, 'public', 'cms-assets');
await mkdir(outputDirectory, { recursive: true });

const extensionByMime = {
  'image/avif': '.avif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
  'application/pdf': '.pdf'
};
const manifest = {};

for (const file of files) {
  const originalExtension = path.extname(file.filename_download || '').toLowerCase();
  const extension = originalExtension || extensionByMime[file.type] || '.bin';
  const filename = `${file.id}${extension}`;
  const response = await fetch(`${directusUrl}/assets/${file.id}`, { headers });
  if (!response.ok) {
    console.warn(`Skipped inaccessible Directus file ${file.id} (${response.status}).`);
    continue;
  }
  await writeFile(path.join(outputDirectory, filename), Buffer.from(await response.arrayBuffer()));
  manifest[file.id] = `/cms-assets/${filename}`;
}

await mkdir(path.join(root, 'src', 'generated'), { recursive: true });
await writeFile(
  path.join(root, 'src', 'generated', 'cms-asset-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8'
);

console.log(`Snapshotted ${Object.keys(manifest).length} Directus assets.`);
