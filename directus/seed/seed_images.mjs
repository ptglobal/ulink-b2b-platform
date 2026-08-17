import { copyFileSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withDbClient } from '../lib/folder-db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PRODUCT_IMAGES = [
  {
    slug: 'nitrile-cleanroom-gloves',
    imageUuid: '58296a84-0a95-4674-8840-a178bc5fe2a1',
    src: '/images/brand/ulink-product-nitrile-gloves-royal-v1.webp',
    title: 'Găng tay nitrile phòng sạch'
  },
  {
    slug: 'polyester-cleanroom-wipers',
    imageUuid: '2a98e72c-15a9-450f-bb7e-f823fbd5508a',
    src: '/images/brand/ulink-product-cleanroom-wipers-royal-v1.webp',
    title: 'Khăn lau polyester phòng sạch'
  },
  {
    slug: 'tyvek-cleanroom-coverall',
    imageUuid: '362ab8d2-45e0-47b1-91a1-9a74288b209e',
    src: '/images/brand/ulink-product-tyvek-coverall-royal-v1.webp',
    title: 'Bộ áo liền quần phòng sạch Tyvek'
  },
  {
    slug: 'cleanroom-face-mask-3ply',
    imageUuid: 'b78e24c2-9e90-4c7b-b8f2-89cdcb7a329a',
    src: '/images/brand/ulink-product-cleanroom-mask-royal-v1.webp',
    title: 'Khẩu trang 3 lớp phòng sạch'
  },
  {
    slug: 'esd-wrist-strap',
    imageUuid: 'c73ee8a2-ea88-4682-9988-cbfa98ab2211',
    src: '/images/brand/ulink-product-esd-wrist-strap-royal-v1.webp',
    title: 'Dây đeo cổ tay chống tĩnh điện'
  },
  {
    slug: 'esd-table-mat-2layer',
    imageUuid: 'd89ef2c2-be00-477c-a49e-bca9efda8822',
    src: '/images/brand/ulink-product-esd-table-mat-royal-v1.webp',
    title: 'Thảm chống tĩnh điện ESD 2 lớp'
  },
  {
    slug: 'ipa-cleanroom-grade-999',
    imageUuid: 'f47bb992-a1f9-4bba-9bcf-10cf8eac2211',
    src: '/images/brand/ulink-product-ipa-cleanroom-royal-v1.webp',
    title: 'Dung dịch IPA 99.9% Cleanroom Grade'
  },
  {
    slug: 'sticky-mat-30-layers',
    imageUuid: '98bc72de-a890-4f99-bbcf-8ab05c12670f',
    src: '/images/brand/ulink-product-sticky-mat-royal-v1.webp',
    title: 'Thảm dính bụi phòng sạch 30 lớp'
  },
  {
    slug: 'esd-shielding-bag',
    imageUuid: '125cf49a-528d-468e-bf03-8ab05c12670f',
    src: '/images/brand/ulink-product-esd-shielding-bag-royal-v1.webp',
    title: 'Túi chống tĩnh điện ESD Shielding'
  },
  {
    slug: 'sterile-latex-cleanroom-gloves',
    imageUuid: 'f82cf9a2-da00-4cfa-a9bf-13cf8eac3311',
    src: '/images/brand/ulink-product-sterile-latex-gloves-royal-v1.webp',
    title: 'Găng tay latex vô trùng phòng sạch'
  }
];

export async function seedProductImages() {
  console.log('Seeding product and SKU images...');

  await withDbClient(async (dbClient) => {
    // 1. Get the folder ID for 'products'
    const folderRes = await dbClient.query("SELECT id FROM directus_folders WHERE name = 'products' LIMIT 1");
    const productsFolderId = folderRes.rows[0]?.id || null;

    const destDir = join(__dirname, '../uploads');
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    for (const item of PRODUCT_IMAGES) {
      const srcPath = join(__dirname, '../../frontend/public', item.src);
      if (!existsSync(srcPath)) {
        console.warn(`[Seeder] Source file not found: ${srcPath}`);
        continue;
      }

      const destPath = join(destDir, `${item.imageUuid}.webp`);
      try {
        // Copy the physical file
        copyFileSync(srcPath, destPath);
        const stats = statSync(destPath);

        // Insert or update directus_files entry
        const existingFile = await dbClient.query("SELECT id FROM directus_files WHERE id = $1", [item.imageUuid]);
        if (existingFile.rows.length === 0) {
          await dbClient.query(
            `INSERT INTO directus_files (id, storage, filename_disk, filename_download, title, type, filesize, folder)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [item.imageUuid, 'local', `${item.imageUuid}.webp`, item.src.split('/').pop(), item.title, 'image/webp', stats.size, productsFolderId]
          );
          console.log(`+ Seeded file record: ${item.title}`);
        } else {
          await dbClient.query(
            `UPDATE directus_files SET filesize = $1, folder = $2 WHERE id = $3`,
            [stats.size, productsFolderId, item.imageUuid]
          );
          console.log(`= Updated file record: ${item.title}`);
        }

        // Link the image as product's hero
        const productRes = await dbClient.query("SELECT id FROM products WHERE slug = $1 LIMIT 1", [item.slug]);
        if (productRes.rows.length > 0) {
          const productId = productRes.rows[0].id;
          await dbClient.query("UPDATE products SET hero = $1 WHERE id = $2", [item.imageUuid, productId]);
          console.log(`  Linked hero image for product: ${item.slug}`);

          // Seed the same image for the product's SKUs (as JSON array)
          const skuUpdateRes = await dbClient.query("UPDATE product_skus SET images = $1::jsonb WHERE product = $2", [JSON.stringify([item.imageUuid]), productId]);
          console.log(`  Seeded image for ${skuUpdateRes.rowCount} SKUs of ${item.slug}`);
        } else {
          console.warn(`[Seeder] Product with slug not found: ${item.slug}`);
        }

      } catch (err) {
        console.error(`[Seeder] Failed to seed image for ${item.slug}:`, err);
      }
    }

    // 2. Populate multiple gallery images for ALL products in DB via products_files junction table
    try {
      const allProductsRes = await dbClient.query("SELECT id, slug, hero FROM products");
      const allFilesRes = await dbClient.query("SELECT id FROM directus_files WHERE type LIKE 'image/%'");
      const availableImageUuids = allFilesRes.rows.map(r => r.id);

      if (availableImageUuids.length > 0) {
        console.log(`[Seeder] Seeding multiple gallery images for ${allProductsRes.rows.length} products...`);
        for (let idx = 0; idx < allProductsRes.rows.length; idx++) {
          const p = allProductsRes.rows[idx];
          const heroUuid = p.hero || availableImageUuids[idx % availableImageUuids.length];
          
          // Set hero if missing
          if (!p.hero) {
            await dbClient.query("UPDATE products SET hero = $1 WHERE id = $2", [heroUuid, p.id]);
          }

          // Pick 3 complementary gallery image UUIDs
          const galleryUuids = availableImageUuids
            .filter(id => id !== heroUuid)
            .slice(idx % 5, (idx % 5) + 3);

          for (const gUuid of galleryUuids) {
            const checkJunction = await dbClient.query(
              "SELECT id FROM products_files WHERE products_id = $1 AND directus_files_id = $2",
              [p.id, gUuid]
            );
            if (checkJunction.rows.length === 0) {
              await dbClient.query(
                "INSERT INTO products_files (products_id, directus_files_id) VALUES ($1, $2)",
                [p.id, gUuid]
              );
            }
          }
        }
        console.log('[Seeder] Successfully populated multiple gallery images in products_files table for all products.');
      }
    } catch (galleryErr) {
      console.error('[Seeder] Failed to seed gallery junction images:', galleryErr.message);
    }
  });

  console.log('Product and SKU images seeded successfully.');
}
