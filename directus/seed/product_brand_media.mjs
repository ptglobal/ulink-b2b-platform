import { readFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFiles, readItems, updateItem, uploadFiles } from '@directus/sdk';
import { createDirectusClient, loginAdmin } from '../lib/config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendPublic = join(__dirname, '../../frontend/public');

const assignments = [
  ['nitrile-cleanroom-gloves', '/images/brand/ulink-product-nitrile-gloves-royal-v1.webp', 'Găng tay nitrile phòng sạch'],
  ['polyester-cleanroom-wipers', '/images/brand/ulink-product-cleanroom-wipers-royal-v1.webp', 'Khăn lau polyester phòng sạch'],
  ['tyvek-cleanroom-coverall', '/images/brand/ulink-product-tyvek-coverall-royal-v1.webp', 'Bộ áo liền quần phòng sạch Tyvek'],
  ['cleanroom-face-mask-3ply', '/images/brand/ulink-product-cleanroom-mask-royal-v1.webp', 'Khẩu trang ba lớp phòng sạch'],
  ['esd-wrist-strap', '/images/brand/ulink-product-esd-wrist-strap-royal-v1.webp', 'Dây đeo cổ tay chống tĩnh điện'],
  ['esd-table-mat-2layer', '/images/brand/ulink-product-esd-table-mat-royal-v1.webp', 'Thảm bàn chống tĩnh điện hai lớp'],
  ['ipa-cleanroom-grade-999', '/images/brand/ulink-product-ipa-cleanroom-royal-v1.webp', 'Dung dịch IPA 99.9% cấp phòng sạch'],
  ['sticky-mat-30-layers', '/images/brand/ulink-product-sticky-mat-royal-v1.webp', 'Thảm dính bụi phòng sạch 30 lớp'],
  ['esd-shielding-bag', '/images/brand/ulink-product-esd-shielding-bag-royal-v1.webp', 'Túi chống tĩnh điện ESD Shielding'],
  ['sterile-latex-cleanroom-gloves', '/images/brand/ulink-product-sterile-latex-gloves-royal-v1.webp', 'Găng tay latex vô trùng phòng sạch']
];

const client = createDirectusClient();

async function ensureFile(publicPath, title) {
  const filename = `ulink-cms-${publicPath.split('/').pop()}`;
  const existing = await client.request(
    readFiles({ filter: { filename_download: { _eq: filename } }, fields: ['id'], limit: 1 })
  );
  if (existing.length) return existing[0].id;

  const bytes = await readFile(join(frontendPublic, publicPath.replace(/^\//, '')));
  const form = new FormData();
  form.append('title', title);
  form.append('file', new Blob([bytes], { type: 'image/webp' }), filename);
  const uploaded = await client.request(uploadFiles(form));
  return uploaded.id;
}

async function main() {
  await loginAdmin(client);

  for (const [slug, publicPath, title] of assignments) {
    const products = await client.request(
      readItems('products', { filter: { slug: { _eq: slug } }, fields: ['id'], limit: 1 })
    );
    if (!products.length) throw new Error(`Product not found: ${slug}`);

    const fileId = await ensureFile(publicPath, title);
    await client.request(updateItem('products', products[0].id, { hero: fileId }));

    const skus = await client.request(
      readItems('product_skus', { filter: { product: { _eq: products[0].id } }, fields: ['id', 'product'], limit: -1 })
    );
    for (const sku of skus) {
      await client.request(updateItem('product_skus', sku.id, { product: sku.product, images: [fileId] }));
    }

    console.log(`Linked ${slug} -> ${basename(publicPath)} (${skus.length} SKU)`);
  }
}

main().catch((error) => {
  console.error('Product brand media seed failed:', error);
  process.exit(1);
});
