export async function seedInitialContent(helpers) {
  const electronicsId = await helpers.ensureItem('industries', 'slug', {
    name: 'Electronics',
    slug: 'electronics',
    status: 'published',
    description: 'Advanced cleanroom and packaging solutions for semiconductor, PCB, and display fabrication.'
  });

  const pharmaceuticalId = await helpers.ensureItem('industries', 'slug', {
    name: 'Pharmaceutical & Cosmetics',
    slug: 'pharmaceutical-cosmetics',
    status: 'published',
    description: 'Sterile packaging and contamination control consumables certified for cleanroom Grade A/B.'
  });

  const cleanroomId = await helpers.ensureItem('product_categories', 'slug', {
    name: 'Cleanroom Consumables',
    slug: 'cleanroom-consumables',
    status: 'published',
    description: 'Contamination control products for industrial cleanrooms.'
  });

  const glovesCategoryId = await helpers.ensureItem('product_categories', 'slug', {
    name: 'Cleanroom Gloves',
    slug: 'cleanroom-gloves',
    parent: cleanroomId,
    status: 'published',
    description: 'Nitrile and latex gloves certified for cleanroom environments.'
  });

  const wipersCategoryId = await helpers.ensureItem('product_categories', 'slug', {
    name: 'Cleanroom Wipers',
    slug: 'cleanroom-wipers',
    parent: cleanroomId,
    status: 'published',
    description: 'Ultra-low linting wipes for cleanroom surfaces.'
  });

  const glovesProductId = await helpers.ensureItem('products', 'slug', {
    name: 'Nitrile Cleanroom Gloves',
    slug: 'nitrile-cleanroom-gloves',
    category: glovesCategoryId,
    short_description: 'Class 100 / ISO 5 powder-free nitrile gloves with textured fingertips.',
    specifications: {
      Material: 'Nitrile',
      Class: 'Class 100 / ISO 5',
      Sterility: 'Non-sterile',
      Color: 'White',
      Length: '12 inches (300mm)'
    },
    status: 'published',
    meta_title: 'Nitrile Cleanroom Gloves | ULink B2B',
    meta_description: 'High-quality powder-free nitrile gloves certified for ISO 5 cleanroom environments.'
  });

  const wipersProductId = await helpers.ensureItem('products', 'slug', {
    name: 'Polyester Cleanroom Wipers',
    slug: 'polyester-cleanroom-wipers',
    category: wipersCategoryId,
    short_description: '100% continuous filament polyester wipers with laser-sealed borders.',
    specifications: {
      Material: '100% Polyester',
      Size: '9 x 9 inches',
      Border: 'Laser-sealed',
      Packaging: 'Double-bagged'
    },
    status: 'published',
    meta_title: 'Polyester Cleanroom Wipers | ULink B2B',
    meta_description: 'Ultra-low lint polyester wipes designed for cleaning sensitive surfaces in cleanrooms.'
  });

  await helpers.ensureItem('products_industries', 'id', {
    id: 1,
    products_id: glovesProductId,
    industries_id: electronicsId
  });
  await helpers.ensureItem('products_industries', 'id', {
    id: 2,
    products_id: glovesProductId,
    industries_id: pharmaceuticalId
  });
  await helpers.ensureItem('products_industries', 'id', {
    id: 3,
    products_id: wipersProductId,
    industries_id: electronicsId
  });

  const sku1Id = await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'sku-gloves-nitrile-s',
    product: glovesProductId,
    unit: 'box',
    pack_size: '100 pcs/box',
    attributes: { size: 'S', color: 'white' },
    status: 'published'
  });

  const sku2Id = await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'sku-gloves-nitrile-m',
    product: glovesProductId,
    unit: 'box',
    pack_size: '100 pcs/box',
    attributes: { size: 'M', color: 'white' },
    status: 'published'
  });

  const sku3Id = await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'sku-wipers-poly-9',
    product: wipersProductId,
    unit: 'pack',
    pack_size: '150 sheets/pack',
    attributes: { size: '9x9', sterile: false },
    status: 'published'
  });

  const hubId = await helpers.ensureItem('regional_hubs', 'slug', {
    name: 'ÄÃ´ng VÄƒn 4',
    slug: 'dong-van-4',
    delivery_sla: 'Within 24 hours to Ha Nam and Hanoi clusters; 48 hours regional.',
    warehouse_capacity: '5,000 square meters climate-controlled',
    technical_team: 'On-site technical engineers available 24/7 for cleanroom consulting.',
    cluster_overview: 'Serving the Dong Van industrial clusters specializing in electronics and precision engineering.',
    location: 'Dong Van IV Industrial Park, Kim Bang, Ha Nam',
    coordinates: '20.6139,105.9084',
    status: 'published'
  });

  await helpers.ensureItem('regional_hubs', 'slug', {
    name: 'Báº¯c ThÄƒng Long',
    slug: 'bac-thang-long',
    delivery_sla: 'Within 12 hours local delivery.',
    warehouse_capacity: '3,000 square meters',
    technical_team: 'Consulting engineers for packaging optimization.',
    cluster_overview: 'Supporting the high-tech electronics export hub in Hanoi.',
    location: 'Dong Anh, Hanoi',
    coordinates: '21.1235,105.7891',
    status: 'published'
  });

  await helpers.ensureItem('blog_posts', 'slug', {
    title: 'Optimizing ESD Control in Electronics Cleanrooms',
    slug: 'optimizing-esd-control',
    body: '<p>Electrostatic discharge (ESD) can ruin entire wafer batches. Controlling ESD in cleanrooms requires dedicated materials, ESD-safe garments, and certified cleanroom packaging...</p>',
    author: 'Tech Advisor Team',
    published_at: new Date().toISOString(),
    status: 'published'
  });

  await helpers.ensureItem('case_studies', 'slug', {
    title: 'Cleanroom Wiper Cost Optimization for Samsung Supplier',
    slug: 'samsung-wiper-cost-optimization',
    summary: 'How ULink optimized wiper grade and logistics to reduce annual spend by 18% while keeping particle count below specifications.',
    body: '<p>Our client, a tier-1 supplier of mobile components, struggled with rising costs of high-grade polyester wipes. ULink conducted a particle contamination audit and shifted them to a tailored laser-sealed wiper, yielding massive savings...</p>',
    industry: electronicsId,
    status: 'published'
  });

  await helpers.ensureItem('iso_certifications', 'number', {
    name: 'ISO 9001:2015 Quality Management',
    number: 'QMS-SG-2026-991',
    issuer: 'SGS international',
    valid_until: '2029-06-01',
    status: 'published'
  });

  await helpers.ensureItem('hero_banners', 'id', {
    id: 1,
    title: 'Ná»n táº£ng cung á»©ng B2B ULink',
    subtitle: 'Váº­t tÆ° phÃ²ng sáº¡ch & Bao bÃ¬ cÃ´ng nghiá»‡p chuyÃªn sÃ¢u cho doanh nghiá»‡p FDI.',
    cta_label: 'YÃªu cáº§u bÃ¡o giÃ¡',
    cta_url: '/quick-order',
    sort: 1,
    status: 'published'
  });

  await helpers.ensureSingleton('site_settings', {
    contact_email: 'contact@ulink.com',
    contact_phone: '+84 24 1234 5678',
    address: 'Táº§ng 12, TÃ²a nhÃ  TechPark, KÄT Cáº§u Giáº¥y, HÃ  Ná»™i, Viá»‡t Nam',
    meta_title: 'ULink B2B Platform â€” Váº­t tÆ° phÃ²ng sáº¡ch & Bao bÃ¬',
    meta_description: 'Ná»n táº£ng phÃ¢n phá»‘i váº­t tÆ° phÃ²ng sáº¡ch vÃ  giáº£i phÃ¡p bao bÃ¬ cÃ´ng nghiá»‡p hÃ ng Ä‘áº§u cho FDI táº¡i Viá»‡t Nam.'
  });

  await helpers.ensureSingleton('homepage', {
    title: 'Trang chá»§ ULink B2B',
    hero_section: {
      headline: 'Äá»‘i tÃ¡c cung á»©ng váº­t tÆ° cÃ´ng nghiá»‡p tin cáº­y',
      cta: 'Xem sáº£n pháº©m'
    }
  });

  return {
    hubId,
    sku1Id,
    sku2Id,
    sku3Id
  };
}
