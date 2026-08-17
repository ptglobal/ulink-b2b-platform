/**
 * Convert all PNG images under public/images/ to WebP format.
 * Usage: node scripts/convert-images.mjs
 *
 * - Converts .png → .webp (quality 80, preserves transparency)
 * - Deletes original PNG after successful conversion
 * - Prints before/after size comparison table
 */
import { readdir, stat, unlink } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = join(import.meta.dirname, '..', 'public', 'images');
const WEBP_QUALITY = 80;

async function* walkPngs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkPngs(fullPath);
    } else if (extname(entry.name).toLowerCase() === '.png') {
      yield fullPath;
    }
  }
}

async function convert() {
  const results = [];
  let totalBefore = 0;
  let totalAfter = 0;

  console.log('🔄 Converting PNG → WebP...\n');

  for await (const pngPath of walkPngs(IMAGES_DIR)) {
    const webpPath = pngPath.replace(/\.png$/i, '.webp');
    const relPath = relative(IMAGES_DIR, pngPath);

    try {
      const beforeStat = await stat(pngPath);
      const beforeKb = beforeStat.size / 1024;

      await sharp(pngPath).webp({ quality: WEBP_QUALITY }).toFile(webpPath);

      const afterStat = await stat(webpPath);
      const afterKb = afterStat.size / 1024;
      const saved = ((1 - afterKb / beforeKb) * 100).toFixed(1);

      results.push({
        file: relPath,
        before: beforeKb.toFixed(1),
        after: afterKb.toFixed(1),
        saved: `${saved}%`
      });

      totalBefore += beforeKb;
      totalAfter += afterKb;

      // Delete original PNG
      await unlink(pngPath);
    } catch (err) {
      console.error(`❌ Failed: ${relPath} — ${err.message}`);
    }
  }

  // Print results table
  console.log(
    'File'.padEnd(60),
    'PNG (KB)'.padStart(10),
    'WebP (KB)'.padStart(10),
    'Saved'.padStart(8)
  );
  console.log('─'.repeat(90));

  for (const r of results) {
    console.log(
      r.file.padEnd(60),
      r.before.padStart(10),
      r.after.padStart(10),
      r.saved.padStart(8)
    );
  }

  console.log('─'.repeat(90));
  console.log(
    'TOTAL'.padEnd(60),
    totalBefore.toFixed(1).padStart(10),
    totalAfter.toFixed(1).padStart(10),
    `${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%`.padStart(8)
  );
  console.log(`\n✅ Converted ${results.length} files. Original PNGs deleted.`);
}

convert().catch(console.error);
