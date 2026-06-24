/**
 * Extended product seed data for demo — more categories, industries, standards, products, SKUs.
 * Run after initial_content.mjs to add variety to the solutions page.
 */
import { readItems } from '@directus/sdk';

async function getIdBySlug(client, collection, slug) {
  const items = await client.request(
    readItems(collection, { filter: { slug: { _eq: slug } }, fields: ['id'], limit: 1 })
  );
  return items?.[0]?.id ?? null;
}

export async function seedExtendedProducts(helpers, client) {
  // ─── Additional Industries ────────────────────────────────────────
  const foodBevId = await helpers.ensureItem('industries', 'slug', {
    name: 'Thực phẩm & Đồ uống',
    slug: 'food-beverage',
    status: 'published',
    description: 'Vật tư vệ sinh, bao bì và kiểm soát nhiễm bẩn cho ngành chế biến thực phẩm.'
  });

  const autoId = await helpers.ensureItem('industries', 'slug', {
    name: 'Ô tô & Cơ khí',
    slug: 'automotive',
    status: 'published',
    description: 'Giải pháp phòng sạch và bảo vệ bề mặt cho sản xuất linh kiện ô tô.'
  });

  const solarId = await helpers.ensureItem('industries', 'slug', {
    name: 'Năng lượng mặt trời',
    slug: 'solar-energy',
    status: 'published',
    description: 'Vật tư kiểm soát hạt bụi cho sản xuất tấm pin và cell quang điện.'
  });

  // Get existing industry IDs
  const electronicsId = await getIdBySlug(client, 'industries', 'electronics');
  const pharmaId = await getIdBySlug(client, 'industries', 'pharmaceutical-cosmetics');

  // ─── Additional Standards ─────────────────────────────────────────
  const iec61340Id = await helpers.ensureItem('standards', 'slug', {
    name: 'IEC 61340-5-1',
    slug: 'iec-61340-5-1',
    description: 'Protection of electronic devices from electrostatic phenomena.',
    status: 'published'
  });

  const iso14001Id = await helpers.ensureItem('standards', 'slug', {
    name: 'ISO 14001',
    slug: 'iso-14001',
    description: 'Environmental management systems — Requirements with guidance for use.',
    status: 'published'
  });

  const enIso374Id = await helpers.ensureItem('standards', 'slug', {
    name: 'EN ISO 374',
    slug: 'en-iso-374',
    description: 'Protective gloves against dangerous chemicals and micro-organisms.',
    status: 'published'
  });

  const astmF2100Id = await helpers.ensureItem('standards', 'slug', {
    name: 'ASTM F2100',
    slug: 'astm-f2100',
    description: 'Standard specification for performance of materials used in medical face masks.',
    status: 'published'
  });

  // Get existing standard IDs
  const iso14644Id = await getIdBySlug(client, 'standards', 'iso-14644-1');
  const iso9001Id = await getIdBySlug(client, 'standards', 'iso-9001');

  // ─── Additional Categories ────────────────────────────────────────
  const cleanroomId = await getIdBySlug(client, 'product_categories', 'cleanroom-consumables');

  const apparelCatId = await helpers.ensureItem('product_categories', 'slug', {
    name: 'Quần áo phòng sạch',
    slug: 'cleanroom-apparel',
    parent: cleanroomId,
    status: 'published',
    description: 'Trang phục bảo hộ và kiểm soát nhiễm bẩn cho nhân viên phòng sạch.'
  });

  const maskCatId = await helpers.ensureItem('product_categories', 'slug', {
    name: 'Khẩu trang phòng sạch',
    slug: 'cleanroom-masks',
    parent: cleanroomId,
    status: 'published',
    description: 'Khẩu trang đạt chuẩn cho môi trường phòng sạch.'
  });

  const packagingCatId = await helpers.ensureItem('product_categories', 'slug', {
    name: 'Bao bì công nghiệp',
    slug: 'industrial-packaging',
    status: 'published',
    description: 'Giải pháp đóng gói và bảo vệ sản phẩm trong vận chuyển và lưu kho.'
  });

  const esdCatId = await helpers.ensureItem('product_categories', 'slug', {
    name: 'Vật tư ESD',
    slug: 'esd-supplies',
    status: 'published',
    description: 'Sản phẩm chống tĩnh điện bảo vệ linh kiện điện tử nhạy cảm.'
  });

  const chemCatId = await helpers.ensureItem('product_categories', 'slug', {
    name: 'Hóa chất phòng sạch',
    slug: 'cleanroom-chemicals',
    parent: cleanroomId,
    status: 'published',
    description: 'Dung dịch tẩy rửa và hóa chất chuyên dụng cho phòng sạch.'
  });

  console.log('  Extended categories & industries created');

  // ─── Products ─────────────────────────────────────────────────────
  // Product 3: Coverall
  const coverallId = await helpers.ensureItem('products', 'slug', {
    name: 'Bộ áo liền quần phòng sạch Tyvek',
    slug: 'tyvek-cleanroom-coverall',
    brand: 'DuPont',
    category: apparelCatId,
    short_description: 'Áo liền quần Tyvek IsoClean, chống tĩnh điện, ISO Class 5.',
    specifications: {
      Material: 'Tyvek IsoClean',
      Class: 'ISO 5 / Class 100',
      ESD: 'Carbon stripe dissipative',
      Closure: 'Zip front with storm flap',
      Color: 'White'
    },
    status: 'published',
    meta_title: 'Bộ áo liền quần phòng sạch Tyvek | ULink',
    meta_description: 'Áo liền quần Tyvek IsoClean chống tĩnh điện, đạt chuẩn ISO 5 cho phòng sạch.'
  });

  // Product 4: Face mask
  const maskId = await helpers.ensureItem('products', 'slug', {
    name: 'Khẩu trang 3 lớp phòng sạch',
    slug: 'cleanroom-face-mask-3ply',
    brand: 'Kimberly-Clark',
    category: maskCatId,
    short_description: 'Khẩu trang 3 lớp không dệt, ear-loop, giảm phát tán hạt từ người dùng.',
    specifications: {
      Layers: '3-ply non-woven',
      BFE: '>99%',
      Style: 'Ear-loop',
      Color: 'Blue',
      Packaging: 'Cleanroom double-bagged'
    },
    status: 'published',
    meta_title: 'Khẩu trang 3 lớp phòng sạch | ULink',
    meta_description: 'Khẩu trang 3 lớp BFE >99% cho nhân viên phòng sạch.'
  });

  // Product 5: ESD Wrist Strap
  const esdStrapId = await helpers.ensureItem('products', 'slug', {
    name: 'Dây đeo cổ tay chống tĩnh điện',
    slug: 'esd-wrist-strap',
    brand: '3M',
    category: esdCatId,
    short_description: 'Dây đeo cổ tay ESD điều chỉnh được, điện trở 1MΩ, dây nối dài 1.8m.',
    specifications: {
      Resistance: '1 MΩ ± 10%',
      'Cord Length': '1.8m coiled',
      'Band Material': 'Hypoallergenic fabric',
      Snap: '10mm',
      Color: 'Blue'
    },
    status: 'published',
    meta_title: 'Dây đeo cổ tay chống tĩnh điện ESD | ULink',
    meta_description: 'Dây đeo cổ tay ESD 3M cho nhân viên làm việc với linh kiện điện tử nhạy cảm.'
  });

  // Product 6: ESD Mat
  const esdMatId = await helpers.ensureItem('products', 'slug', {
    name: 'Thảm chống tĩnh điện ESD 2 lớp',
    slug: 'esd-table-mat-2layer',
    brand: '3M',
    category: esdCatId,
    short_description: 'Thảm bàn ESD 2 lớp, bề mặt dissipative xanh trên lớp conductive đen.',
    specifications: {
      'Surface Resistance': '10^6 – 10^8 Ω',
      'Volume Resistance': '10^3 – 10^5 Ω',
      Thickness: '2mm',
      Color: 'Blue/Black',
      Material: 'Rubber compound'
    },
    status: 'published',
    meta_title: 'Thảm chống tĩnh điện ESD 2 lớp | ULink',
    meta_description: 'Thảm bàn ESD 2 lớp cho trạm làm việc xử lý linh kiện điện tử.'
  });

  // Product 7: IPA Cleaner
  const ipaId = await helpers.ensureItem('products', 'slug', {
    name: 'Dung dịch IPA 99.9% Cleanroom Grade',
    slug: 'ipa-cleanroom-grade-999',
    brand: 'Techspray',
    category: chemCatId,
    short_description: 'Isopropyl Alcohol 99.9% tinh khiết, lọc 0.2µm, đóng chai phòng sạch.',
    specifications: {
      Purity: '99.9%',
      Filtration: '0.2 µm',
      'Residue (NVR)': '<1 ppm',
      Packaging: 'Cleanroom bottle',
      Volume: '1L / 5L / 20L'
    },
    status: 'published',
    meta_title: 'IPA 99.9% Cleanroom Grade | ULink',
    meta_description: 'Dung dịch IPA 99.9% siêu tinh khiết cho tẩy rửa bề mặt phòng sạch.'
  });

  // Product 8: Sticky mat
  const stickyMatId = await helpers.ensureItem('products', 'slug', {
    name: 'Thảm dính bụi phòng sạch 30 lớp',
    slug: 'sticky-mat-30-layers',
    brand: 'Contec',
    category: cleanroomId,
    short_description: 'Thảm dính bụi 30 lớp, bóc từng lớp, giảm hạt bụi tại lối vào phòng sạch.',
    specifications: {
      Layers: '30 peelable layers',
      Size: '24 x 36 inches',
      Color: 'Blue / White',
      Adhesion: 'High tack polyethylene',
      'Particle removal': '>99% for particles >5µm'
    },
    status: 'published',
    meta_title: 'Thảm dính bụi phòng sạch 30 lớp | ULink',
    meta_description: 'Thảm dính bụi 30 lớp hiệu quả cao cho lối vào phòng sạch.'
  });

  // Product 9: Packaging bags
  const esdBagId = await helpers.ensureItem('products', 'slug', {
    name: 'Túi chống tĩnh điện ESD Shielding',
    slug: 'esd-shielding-bag',
    brand: 'Desco',
    category: packagingCatId,
    short_description: 'Túi shielding ESD bảo vệ linh kiện khỏi phóng điện, đạt ANSI/ESD S541.',
    specifications: {
      Material: 'Metallic polyester / LDPE',
      'Surface Resistance': '<10^11 Ω',
      Shielding: '<50 nJ (per ANSI/ESD S541)',
      Seal: 'Heat sealable / Zip-lock',
      Transparency: 'Semi-transparent'
    },
    status: 'published',
    meta_title: 'Túi chống tĩnh điện ESD Shielding | ULink',
    meta_description: 'Túi ESD shielding bảo vệ linh kiện điện tử nhạy cảm khi vận chuyển và lưu kho.'
  });

  // Product 10: Latex gloves (sterile)
  const latexGlovesId = await helpers.ensureItem('products', 'slug', {
    name: 'Găng tay latex vô trùng phòng sạch',
    slug: 'sterile-latex-cleanroom-gloves',
    brand: 'Ansell',
    category: await getIdBySlug(client, 'product_categories', 'cleanroom-gloves'),
    short_description: 'Găng tay latex gamma-irradiated, vô trùng, đạt ISO Class 4 cho dược phẩm.',
    specifications: {
      Material: 'Natural rubber latex',
      Sterility: 'Gamma irradiated (SAL 10⁻⁶)',
      Class: 'ISO 4 / Class 10',
      AQL: '0.65',
      Length: '12 inches'
    },
    status: 'published',
    meta_title: 'Găng tay latex vô trùng phòng sạch | ULink',
    meta_description: 'Găng tay latex vô trùng cho phòng sạch dược phẩm GMP.'
  });

  console.log('  Extended products created');

  // ─── SKUs ─────────────────────────────────────────────────────────
  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'CVL-TYVEK-M', product: coverallId, unit: 'pcs', pack_size: '25 pcs/case',
    attributes: { size: 'M' }, stock_status: 'in_stock', status: 'published'
  });
  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'CVL-TYVEK-L', product: coverallId, unit: 'pcs', pack_size: '25 pcs/case',
    attributes: { size: 'L' }, stock_status: 'in_stock', status: 'published'
  });
  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'CVL-TYVEK-XL', product: coverallId, unit: 'pcs', pack_size: '25 pcs/case',
    attributes: { size: 'XL' }, stock_status: 'low_stock', status: 'published'
  });

  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'MSK-3PLY-BLU-50', product: maskId, unit: 'box', pack_size: '50 pcs/box',
    attributes: { color: 'blue' }, stock_status: 'in_stock', status: 'published'
  });
  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'MSK-3PLY-WHT-50', product: maskId, unit: 'box', pack_size: '50 pcs/box',
    attributes: { color: 'white' }, stock_status: 'out_of_stock', status: 'published'
  });

  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'ESD-WRIST-BLU', product: esdStrapId, unit: 'pcs', pack_size: '1 pcs',
    attributes: { color: 'blue' }, stock_status: 'in_stock', status: 'published'
  });

  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'ESD-MAT-60x120', product: esdMatId, unit: 'roll', pack_size: '60x120cm',
    attributes: { size: '60x120cm' }, stock_status: 'in_stock', status: 'published'
  });
  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'ESD-MAT-90x150', product: esdMatId, unit: 'roll', pack_size: '90x150cm',
    attributes: { size: '90x150cm' }, stock_status: 'low_stock', status: 'published'
  });

  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'IPA-999-1L', product: ipaId, unit: 'bottle', pack_size: '1L',
    attributes: { volume: '1L' }, stock_status: 'in_stock', status: 'published'
  });
  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'IPA-999-5L', product: ipaId, unit: 'can', pack_size: '5L',
    attributes: { volume: '5L' }, stock_status: 'in_stock', status: 'published'
  });
  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'IPA-999-20L', product: ipaId, unit: 'drum', pack_size: '20L',
    attributes: { volume: '20L' }, stock_status: 'out_of_stock', status: 'published'
  });

  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'SMAT-30L-BLU', product: stickyMatId, unit: 'pack', pack_size: '4 mats/case',
    attributes: { color: 'blue' }, stock_status: 'in_stock', status: 'published'
  });
  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'SMAT-30L-WHT', product: stickyMatId, unit: 'pack', pack_size: '4 mats/case',
    attributes: { color: 'white' }, stock_status: 'in_stock', status: 'published'
  });

  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'ESD-BAG-6x10', product: esdBagId, unit: 'pack', pack_size: '100 pcs/pack',
    attributes: { size: '6x10 inch' }, stock_status: 'in_stock', status: 'published'
  });
  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'ESD-BAG-12x16', product: esdBagId, unit: 'pack', pack_size: '50 pcs/pack',
    attributes: { size: '12x16 inch' }, stock_status: 'low_stock', status: 'published'
  });

  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'GLV-LATEX-ST-S', product: latexGlovesId, unit: 'pair', pack_size: '200 pairs/case',
    attributes: { size: 'S', sterile: true }, stock_status: 'in_stock', status: 'published'
  });
  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'GLV-LATEX-ST-M', product: latexGlovesId, unit: 'pair', pack_size: '200 pairs/case',
    attributes: { size: 'M', sterile: true }, stock_status: 'in_stock', status: 'published'
  });
  await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'GLV-LATEX-ST-L', product: latexGlovesId, unit: 'pair', pack_size: '200 pairs/case',
    attributes: { size: 'L', sterile: true }, stock_status: 'out_of_stock', status: 'published'
  });

  console.log('  Extended SKUs created');

  // ─── Industry links ───────────────────────────────────────────────
  let piId = 10;
  const industryLinks = [
    [coverallId, electronicsId], [coverallId, pharmaId], [coverallId, foodBevId],
    [maskId, pharmaId], [maskId, foodBevId],
    [esdStrapId, electronicsId], [esdStrapId, autoId],
    [esdMatId, electronicsId], [esdMatId, solarId],
    [ipaId, electronicsId], [ipaId, pharmaId], [ipaId, solarId],
    [stickyMatId, electronicsId], [stickyMatId, pharmaId], [stickyMatId, foodBevId],
    [esdBagId, electronicsId], [esdBagId, autoId], [esdBagId, solarId],
    [latexGlovesId, pharmaId], [latexGlovesId, foodBevId],
  ];
  for (const [pid, iid] of industryLinks) {
    await helpers.ensureItem('products_industries', 'id', { id: piId++, products_id: pid, industries_id: iid });
  }

  // ─── Standard links ───────────────────────────────────────────────
  let psId = 10;
  const standardLinks = [
    [coverallId, iso14644Id], [coverallId, iec61340Id],
    [maskId, astmF2100Id], [maskId, iso14644Id],
    [esdStrapId, iec61340Id],
    [esdMatId, iec61340Id], [esdMatId, iso9001Id],
    [ipaId, iso14644Id], [ipaId, iso14001Id],
    [stickyMatId, iso14644Id],
    [esdBagId, iec61340Id], [esdBagId, iso9001Id],
    [latexGlovesId, iso14644Id], [latexGlovesId, enIso374Id],
  ];
  for (const [pid, sid] of standardLinks) {
    await helpers.ensureItem('products_standards', 'id', { id: psId++, products_id: pid, standards_id: sid });
  }

  // ─── Regional Hub links ───────────────────────────────────────────
  // Fetch hub IDs by slug
  const hubSlugs = ['dong-van-4', 'bac-thang-long', 'binh-duong', 'hai-phong', 'long-thanh'];
  const hubRecords = {};
  for (const slug of hubSlugs) {
    const found = await client.request(readItems('regional_hubs', { filter: { slug: { _eq: slug } }, fields: ['id'], limit: 1 }));
    if (found.length > 0) hubRecords[slug] = found[0].id;
  }

  let prhId = 1;
  const regionLinks = [
    // Coverall → available in Bắc Thăng Long & Bình Dương
    [coverallId, hubRecords['bac-thang-long']],
    [coverallId, hubRecords['binh-duong']],
    // Mask → all northern hubs
    [maskId, hubRecords['dong-van-4']],
    [maskId, hubRecords['bac-thang-long']],
    [maskId, hubRecords['hai-phong']],
    // ESD Strap → southern hubs
    [esdStrapId, hubRecords['binh-duong']],
    [esdStrapId, hubRecords['long-thanh']],
    // ESD Mat → nationwide
    [esdMatId, hubRecords['dong-van-4']],
    [esdMatId, hubRecords['bac-thang-long']],
    [esdMatId, hubRecords['binh-duong']],
    [esdMatId, hubRecords['long-thanh']],
    // IPA → Bình Dương & Long Thành (chemical storage hubs)
    [ipaId, hubRecords['binh-duong']],
    [ipaId, hubRecords['long-thanh']],
    // Sticky Mat → all hubs
    [stickyMatId, hubRecords['dong-van-4']],
    [stickyMatId, hubRecords['bac-thang-long']],
    [stickyMatId, hubRecords['binh-duong']],
    [stickyMatId, hubRecords['hai-phong']],
    [stickyMatId, hubRecords['long-thanh']],
    // ESD Bag → electronics hubs
    [esdBagId, hubRecords['bac-thang-long']],
    [esdBagId, hubRecords['binh-duong']],
    [esdBagId, hubRecords['long-thanh']],
    // Latex Gloves → pharmaceutical hubs
    [latexGlovesId, hubRecords['bac-thang-long']],
    [latexGlovesId, hubRecords['binh-duong']],
  ].filter(([, hubId]) => hubId != null);

  for (const [pid, hubId] of regionLinks) {
    await helpers.ensureItem('products_regional_hubs', 'id', { id: prhId++, products_id: pid, regional_hubs_id: hubId });
  }

  // ─── Documents ────────────────────────────────────────────────────
  const docs = [
    { title: 'Tyvek Coverall TDS', doc_type: 'tds', product: coverallId, language: 'en' },
    { title: 'Tyvek Coverall MSDS', doc_type: 'msds', product: coverallId, language: 'en' },
    { title: 'Cleanroom Mask Specification', doc_type: 'tds', product: maskId, language: 'en' },
    { title: 'ESD Wrist Strap Technical Guide', doc_type: 'tds', product: esdStrapId, language: 'en' },
    { title: 'ESD Mat Technical Data Sheet', doc_type: 'tds', product: esdMatId, language: 'en' },
    { title: 'ESD Mat Certificate of Conformance', doc_type: 'certificate', product: esdMatId, language: 'en' },
    { title: 'IPA 99.9% Safety Data Sheet', doc_type: 'msds', product: ipaId, language: 'en' },
    { title: 'IPA 99.9% TDS', doc_type: 'tds', product: ipaId, language: 'en' },
    { title: 'IPA Cleanroom Brochure', doc_type: 'brochure', product: ipaId, language: 'vi' },
    { title: 'Sticky Mat Brochure', doc_type: 'brochure', product: stickyMatId, language: 'vi' },
    { title: 'ESD Shielding Bag TDS', doc_type: 'tds', product: esdBagId, language: 'en' },
    { title: 'ESD Bag ANSI/ESD S541 Certificate', doc_type: 'certificate', product: esdBagId, language: 'en' },
    { title: 'Sterile Latex Gloves TDS', doc_type: 'tds', product: latexGlovesId, language: 'en' },
    { title: 'Sterile Latex Gloves MSDS', doc_type: 'msds', product: latexGlovesId, language: 'en' },
    { title: 'Latex Gloves Sterility Certificate', doc_type: 'certificate', product: latexGlovesId, language: 'en' },
  ];
  for (const doc of docs) {
    await helpers.ensureItem('documents', 'title', { ...doc, status: 'published' });
  }

  console.log('  Extended documents & links created');
  console.log(`  Total new products: 8 | New SKUs: 18 | New documents: ${docs.length}`);
}
