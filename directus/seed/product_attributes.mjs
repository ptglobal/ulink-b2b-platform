import { readItems } from '@directus/sdk';

export async function seedProductAttributes(helpers, client) {
  console.log('\n--- SEEDING PRODUCT ATTRIBUTES & OPTIONS (GLOBAL MASTER DATA) ---');

  // Helper to find product ID by slug
  async function getIdBySlug(collection, slug) {
    const items = await client.request(
      readItems(collection, { filter: { slug: { _eq: slug } }, fields: ['id'], limit: 1 })
    );
    return items?.[0]?.id ?? null;
  }

  // 1. Seed Global Attributes (no product FK — master data)
  const attributes = [
    { id: 1, name: 'Kích cỡ', slug: 'size', sort: 1 },
    { id: 2, name: 'Màu sắc', slug: 'color', sort: 2 }
  ];

  for (const attr of attributes) {
    await helpers.ensureItem('product_attributes', 'id', attr);
  }

  // 2. Seed Attribute Options
  const options = [
    // Size options (attribute 1)
    { id: 1, attribute: 1, value: 'S', sku_suffix: 'S', sort: 1 },
    { id: 2, attribute: 1, value: 'M', sku_suffix: 'M', sort: 2 },
    { id: 3, attribute: 1, value: 'L', sku_suffix: 'L', sort: 3 },
    { id: 4, attribute: 1, value: 'XL', sku_suffix: 'XL', sort: 4 },

    // Color options (attribute 2)
    { id: 5, attribute: 2, value: 'Xanh dương', sku_suffix: 'BLUE', sort: 1 },
    { id: 6, attribute: 2, value: 'Trắng', sku_suffix: 'WHITE', sort: 2 }
  ];

  for (const opt of options) {
    await helpers.ensureItem('product_attribute_options', 'id', opt);
  }

  // Fetch all seeded product IDs
  const glovesId = await getIdBySlug('products', 'nitrile-cleanroom-gloves');
  const wipersId = await getIdBySlug('products', 'polyester-cleanroom-wipers');
  const coverallId = await getIdBySlug('products', 'tyvek-cleanroom-coverall');
  const maskId = await getIdBySlug('products', 'cleanroom-face-mask-3ply');
  const esdStrapId = await getIdBySlug('products', 'esd-wrist-strap');
  const esdMatId = await getIdBySlug('products', 'esd-table-mat-2layer');
  const ipaId = await getIdBySlug('products', 'ipa-cleanroom-grade-999');
  const stickyMatId = await getIdBySlug('products', 'sticky-mat-30-layers');
  const esdBagId = await getIdBySlug('products', 'esd-shielding-bag');
  const latexGlovesId = await getIdBySlug('products', 'sterile-latex-cleanroom-gloves');

  // 3. Seed M2M: Assign attributes to ALL products
  const assignments = [
    // 1. Găng tay Nitrile → Kích cỡ + Màu sắc
    { id: 1, products_id: glovesId, product_attributes_id: 1 },
    { id: 2, products_id: glovesId, product_attributes_id: 2 },
    
    // 2. Giấy lau phòng sạch → Kích cỡ
    { id: 3, products_id: wipersId, product_attributes_id: 1 },
    
    // 3. Quần áo phòng sạch Coverall → Kích cỡ
    { id: 4, products_id: coverallId, product_attributes_id: 1 },
    
    // 4. Khẩu trang 3 lớp → Màu sắc
    { id: 5, products_id: maskId, product_attributes_id: 2 },
    
    // 5. Vòng đeo tay chống tĩnh điện → Màu sắc
    { id: 6, products_id: esdStrapId, product_attributes_id: 2 },
    
    // 6. Thảm cao su chống tĩnh điện → Kích cỡ + Màu sắc
    { id: 7, products_id: esdMatId, product_attributes_id: 1 },
    { id: 8, products_id: esdMatId, product_attributes_id: 2 },
    
    // 7. Cồn IPA → Kích cỡ (Dung tích)
    { id: 9, products_id: ipaId, product_attributes_id: 1 },
    
    // 8. Thảm dính bụi PE → Kích cỡ + Màu sắc
    { id: 10, products_id: stickyMatId, product_attributes_id: 1 },
    { id: 11, products_id: stickyMatId, product_attributes_id: 2 },
    
    // 9. Túi chống tĩnh điện → Kích cỡ
    { id: 12, products_id: esdBagId, product_attributes_id: 1 },
    
    // 10. Găng tay Latex → Kích cỡ
    { id: 13, products_id: latexGlovesId, product_attributes_id: 1 }
  ].filter(a => a.products_id != null);

  for (const assignment of assignments) {
    await helpers.ensureItem('products_product_attributes', 'id', assignment);
  }

  const requiredSeedProducts = [
    ['nitrile-cleanroom-gloves', glovesId],
    ['polyester-cleanroom-wipers', wipersId],
    ['tyvek-cleanroom-coverall', coverallId],
    ['cleanroom-face-mask-3ply', maskId],
    ['esd-wrist-strap', esdStrapId],
    ['esd-table-mat-2layer', esdMatId],
    ['ipa-cleanroom-grade-999', ipaId],
    ['sticky-mat-30-layers', stickyMatId],
    ['esd-shielding-bag', esdBagId],
    ['sterile-latex-cleanroom-gloves', latexGlovesId]
  ];

  const missingProducts = requiredSeedProducts
    .filter(([, id]) => !id)
    .map(([slug]) => slug);

  if (missingProducts.length > 0) {
    throw new Error(`Seed products missing before attribute assignment: ${missingProducts.join(', ')}`);
  }

  const coveredProductIds = new Set(assignments.map((assignment) => assignment.products_id));
  const uncoveredProducts = requiredSeedProducts
    .filter(([, id]) => id && !coveredProductIds.has(id))
    .map(([slug]) => slug);

  if (uncoveredProducts.length > 0) {
    throw new Error(`Seed products missing attribute coverage: ${uncoveredProducts.join(', ')}`);
  }

  console.log('  Global product attributes, options & M2M assignments for all seed products complete!');
}
