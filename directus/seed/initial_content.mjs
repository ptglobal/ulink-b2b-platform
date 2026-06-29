import { readItems, updateItem, deleteItems } from '@directus/sdk';
import { DEFAULT_LOCALE } from '../lib/i18n.mjs';
import { translations } from './translation_data.mjs';
import { withDbClient } from '../lib/folder-db.mjs';

function getGeoEntry(map, key, label) {
  const entry = map?.get(key);
  if (!entry) {
    throw new Error(`Missing ${label} seed for ${key}.`);
  }
  return entry;
}

async function upsertRegionalHub(client, helpers, slug, data) {
  const existing = await client.request(
    readItems('regional_hubs', {
      filter: { slug: { _eq: slug } },
      fields: ['id'],
      limit: 1
    })
  );

  const payload = { slug, ...data };
  if (existing.length > 0) {
    await client.request(updateItem('regional_hubs', existing[0].id, payload));
    return existing[0].id;
  }

  return helpers.ensureItem('regional_hubs', 'slug', payload);
}

async function clearCollection(client, collection) {
  try {
    const items = await client.request(readItems(collection, { fields: ['id'], limit: -1 }));
    if (items && items.length > 0) {
      const ids = items.map(item => item.id);
      await client.request(deleteItems(collection, ids));
      console.log(`Cleared ${items.length} items from ${collection}`);
    }
  } catch (err) {
    console.error(`Error clearing collection ${collection}:`, err.message);
  }
}

async function seedHubTranslations(helpers, hubId, nameVi, nameEn, nameJa) {
  await helpers.ensureTranslation('regional_hubs', hubId, 'vi', { name: nameVi });
  await helpers.ensureTranslation('regional_hubs', hubId, 'en', { name: nameEn });
  await helpers.ensureTranslation('regional_hubs', hubId, 'ja', { name: nameJa });
}

async function seedZoneTranslations(helpers, zoneId, nameVi, nameEn, nameJa) {
  await helpers.ensureTranslation('hub_industrial_zones', zoneId, 'vi', { name: nameVi });
  await helpers.ensureTranslation('hub_industrial_zones', zoneId, 'en', { name: nameEn });
  await helpers.ensureTranslation('hub_industrial_zones', zoneId, 'ja', { name: nameJa });
}

export async function seedInitialContent(helpers, client, geography) {
  async function seedTranslations(collection, sourceId, key) {
    const data = translations[collection]?.[key];
    if (!data) return;
    if (data.vi) {
      await helpers.ensureTranslation(collection, sourceId, 'vi', data.vi);
    }
    if (data.en) {
      await helpers.ensureTranslation(collection, sourceId, 'en', data.en);
    }
    if (data.ja) {
      await helpers.ensureTranslation(collection, sourceId, 'ja', data.ja);
    }
  }

  // 1. Clear old seed data related to regional hubs, zones, team members, and dependent commerce/rfq data
  console.log('Cleaning up old regional hubs, industrial zones, team members, and dependent transactional/RFQ data...');
  await clearCollection(client, 'products_regional_hubs');
  await clearCollection(client, 'rfq_assignment_rules');
  await clearCollection(client, 'hub_team_members');
  await clearCollection(client, 'hub_industrial_zones');
  await clearCollection(client, 'deliveries');
  await clearCollection(client, 'order_items');
  await clearCollection(client, 'invoices');
  await clearCollection(client, 'orders');
  await clearCollection(client, 'rfq_requests');
  await clearCollection(client, 'regional_hubs');
  await clearCollection(client, 'iso_certifications_translations');
  await clearCollection(client, 'iso_certifications');
  await clearCollection(client, 'documents');

  // Seed files into directus_files via postgres client
  let documentsFolderId = null;
  await withDbClient(async (dbClient) => {
    // Get folder ID for "documents"
    const folderRes = await dbClient.query("SELECT id FROM directus_folders WHERE name = 'documents' LIMIT 1");
    documentsFolderId = folderRes.rows[0]?.id || null;

    const filesToSeed = [
      {
        id: '135cf49a-528d-468e-bf03-8ab05c12670f',
        storage: 'local',
        filename_disk: '135cf49a-528d-468e-bf03-8ab05c12670f.pdf',
        filename_download: 'file _1.pdf',
        title: 'Document File 1',
        type: 'application/pdf',
        filesize: 10732,
        folder: documentsFolderId
      },
      {
        id: '17e93170-4d2b-4a45-b18f-a4c3f8ab2f48',
        storage: 'local',
        filename_disk: '17e93170-4d2b-4a45-b18f-a4c3f8ab2f48.pdf',
        filename_download: 'file _2.pdf',
        title: 'Document File 2',
        type: 'application/pdf',
        filesize: 11086,
        folder: documentsFolderId
      },
      {
        id: '22a340ce-b785-4543-b1ef-4cf3eec8e9aa',
        storage: 'local',
        filename_disk: '22a340ce-b785-4543-b1ef-4cf3eec8e9aa.pdf',
        filename_download: 'file _3.pdf',
        title: 'Document File 3',
        type: 'application/pdf',
        filesize: 11053,
        folder: documentsFolderId
      }
    ];

    for (const file of filesToSeed) {
      const existing = await dbClient.query("SELECT id FROM directus_files WHERE id = $1", [file.id]);
      if (existing.rows.length === 0) {
        await dbClient.query(
          `INSERT INTO directus_files (id, storage, filename_disk, filename_download, title, type, filesize, folder)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [file.id, file.storage, file.filename_disk, file.filename_download, file.title, file.type, file.filesize, file.folder]
        );
        console.log(`+ Seeded directus_files entry: ${file.filename_download}`);
      } else {
        await dbClient.query(
          `UPDATE directus_files SET filesize = $1, folder = $2 WHERE id = $3`,
          [file.filesize, file.folder, file.id]
        );
        console.log(`= Updated directus_files entry: ${file.filename_download}`);
      }
    }
  });

  const electronicsId = await helpers.ensureItem('industries', 'slug', {
    name: 'Điện tử',
    slug: 'electronics',
    status: 'published',
    description: 'Giải pháp phòng sạch và bao bì công nghiệp cho sản xuất bán dẫn, PCB và màn hình.'
  });
  await seedTranslations('industries', electronicsId, 'electronics');

  const pharmaceuticalId = await helpers.ensureItem('industries', 'slug', {
    name: 'Dược phẩm',
    slug: 'pharmaceutical',
    status: 'published',
    description: 'Vật tư đóng gói vô trùng và kiểm soát nhiễm bẩn cho phòng sạch cấp A/B.'
  });
  await seedTranslations('industries', pharmaceuticalId, 'pharmaceutical');

  const cosmeticsId = await helpers.ensureItem('industries', 'slug', {
    name: 'Mỹ phẩm',
    slug: 'cosmetics',
    status: 'published',
    description: 'Giải pháp phòng sạch và đóng gói bảo vệ cho sản xuất mỹ phẩm và hóa mỹ phẩm.'
  });
  await seedTranslations('industries', cosmeticsId, 'cosmetics');

  const foodId = await helpers.ensureItem('industries', 'slug', {
    name: 'Thực phẩm',
    slug: 'food',
    status: 'published',
    description: 'Vật tư vệ sinh, bao bì và kiểm soát nhiễm bẩn cho ngành chế biến thực phẩm.'
  });
  await seedTranslations('industries', foodId, 'food');

  const cleanroomId = await helpers.ensureItem('product_categories', 'slug', {
    name: 'Vật tư phòng sạch',
    slug: 'cleanroom-consumables',
    status: 'published',
    description: 'Sản phẩm kiểm soát nhiễm bẩn cho môi trường phòng sạch công nghiệp.'
  });
  await seedTranslations('product_categories', cleanroomId, 'cleanroom');

  const glovesCategoryId = await helpers.ensureItem('product_categories', 'slug', {
    name: 'Găng tay phòng sạch',
    slug: 'cleanroom-gloves',
    parent: cleanroomId,
    status: 'published',
    description: 'Găng tay nitrile và latex đạt chuẩn cho môi trường phòng sạch.'
  });
  await seedTranslations('product_categories', glovesCategoryId, 'gloves');

  const wipersCategoryId = await helpers.ensureItem('product_categories', 'slug', {
    name: 'Khăn lau phòng sạch',
    slug: 'cleanroom-wipers',
    parent: cleanroomId,
    status: 'published',
    description: 'Khăn lau siêu ít xơ cho bề mặt phòng sạch.'
  });
  await seedTranslations('product_categories', wipersCategoryId, 'wipers');

  const glovesProductId = await helpers.ensureItem('products', 'slug', {
    name: 'Găng tay nitrile phòng sạch',
    slug: 'nitrile-cleanroom-gloves',
    brand: 'Ansell',
    category: glovesCategoryId,
    short_description: 'Găng tay nitrile không bột, Class 100 / ISO 5, đầu ngón có vân.',
    specifications: {
      Material: 'Nitrile',
      Class: 'Class 100 / ISO 5',
      Sterility: 'Non-sterile',
      Color: 'White',
      Length: '12 inches (300mm)'
    },
    status: 'published',
    meta_title: 'Găng tay nitrile phòng sạch | ULink B2B',
    meta_description: 'Găng tay nitrile không bột chất lượng cao đạt chuẩn ISO 5 cho môi trường phòng sạch.'
  });
  await seedTranslations('products', glovesProductId, 'gloves');

  const wipersProductId = await helpers.ensureItem('products', 'slug', {
    name: 'Khăn lau polyester phòng sạch',
    slug: 'polyester-cleanroom-wipers',
    brand: 'Texwipe',
    category: wipersCategoryId,
    short_description: 'Khăn lau polyester sợi liên tục 100% với mép cắt laser.',
    specifications: {
      Material: '100% Polyester',
      Size: '9 x 9 inches',
      Border: 'Laser-sealed',
      Packaging: 'Double-bagged'
    },
    status: 'published',
    meta_title: 'Khăn lau polyester phòng sạch | ULink B2B',
    meta_description: 'Khăn lau polyester siêu ít xơ, thiết kế cho bề mặt nhạy cảm trong phòng sạch.'
  });
  await seedTranslations('products', wipersProductId, 'wipers');

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
  await helpers.ensureItem('products_industries', 'id', {
    id: 4,
    products_id: glovesProductId,
    industries_id: cosmeticsId
  });
  await helpers.ensureItem('products_industries', 'id', {
    id: 5,
    products_id: glovesProductId,
    industries_id: foodId
  });

  // Standards seed data
  const isoCleanroomId = await helpers.ensureItem('standards', 'slug', {
    name: 'ISO 14644-1',
    slug: 'iso-14644-1',
    description: 'Cleanrooms and associated controlled environments — Classification of air cleanliness by particle concentration.',
    status: 'published'
  });

  const en455Id = await helpers.ensureItem('standards', 'slug', {
    name: 'EN 455',
    slug: 'en-455',
    description: 'Medical gloves for single use — Requirements and testing for freedom from holes, physical properties, and biological evaluation.',
    status: 'published'
  });

  const isoLaunderingId = await helpers.ensureItem('standards', 'slug', {
    name: 'ISO 9001',
    slug: 'iso-9001',
    description: 'Quality management systems — Requirements.',
    status: 'published'
  });

  // Link products to standards
  await helpers.ensureItem('products_standards', 'id', {
    id: 1,
    products_id: glovesProductId,
    standards_id: isoCleanroomId
  });
  await helpers.ensureItem('products_standards', 'id', {
    id: 2,
    products_id: glovesProductId,
    standards_id: en455Id
  });
  await helpers.ensureItem('products_standards', 'id', {
    id: 3,
    products_id: wipersProductId,
    standards_id: isoCleanroomId
  });
  await helpers.ensureItem('products_standards', 'id', {
    id: 4,
    products_id: wipersProductId,
    standards_id: isoLaunderingId
  });

  // Technical documents seed
  await helpers.ensureItem('documents', 'title', {
    title: 'Nitrile Gloves Technical Data Sheet',
    doc_type: 'tds',
    product: glovesProductId,
    file: '135cf49a-528d-468e-bf03-8ab05c12670f',
    language: 'en',
    status: 'published'
  });
  await helpers.ensureItem('documents', 'title', {
    title: 'Nitrile Gloves Material Safety Data Sheet',
    doc_type: 'msds',
    product: glovesProductId,
    file: '17e93170-4d2b-4a45-b18f-a4c3f8ab2f48',
    language: 'en',
    status: 'published'
  });
  await helpers.ensureItem('documents', 'title', {
    title: 'Polyester Wipers Technical Data Sheet',
    doc_type: 'tds',
    product: wipersProductId,
    file: '22a340ce-b785-4543-b1ef-4cf3eec8e9aa',
    language: 'en',
    status: 'published'
  });
  await helpers.ensureItem('documents', 'title', {
    title: 'Cleanroom Wipers Brochure',
    doc_type: 'brochure',
    product: wipersProductId,
    file: '135cf49a-528d-468e-bf03-8ab05c12670f',
    language: 'vi',
    status: 'published'
  });

  const sku1Id = await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'sku-gloves-nitrile-s',
    product: glovesProductId,
    unit: 'box',
    pack_size: '100 pcs/box',
    attributes: { size: 'S', color: 'white' },
    stock_status: 'in_stock',
    status: 'published'
  });

  const sku2Id = await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'sku-gloves-nitrile-m',
    product: glovesProductId,
    unit: 'box',
    pack_size: '100 pcs/box',
    attributes: { size: 'M', color: 'white' },
    stock_status: 'low_stock',
    status: 'published'
  });

  const sku3Id = await helpers.ensureItem('product_skus', 'sku_code', {
    sku_code: 'sku-wipers-poly-9',
    product: wipersProductId,
    unit: 'pack',
    pack_size: '150 sheets/pack',
    attributes: { size: '9x9', sterile: false },
    stock_status: 'out_of_stock',
    status: 'published'
  });

  // Resolve provinces using geography seeded data (with post-2025 mergers mapping)
  const ninhBinhProvince = getGeoEntry(geography?.provincesByAbbr, 'NB', 'province');
  const hungYenProvince = getGeoEntry(geography?.provincesByAbbr, 'HY', 'province');
  const haiPhongProvince = getGeoEntry(geography?.provincesByAbbr, 'HP', 'province');
  const quangNinhProvince = getGeoEntry(geography?.provincesByAbbr, 'QN', 'province');
  const haNoiProvince = getGeoEntry(geography?.provincesByAbbr, 'HN', 'province');
  const bacNinhProvince = getGeoEntry(geography?.provincesByAbbr, 'BN', 'province');
  const phuThoProvince = getGeoEntry(geography?.provincesByAbbr, 'PT', 'province');

  const hubsData = [
    {
      slug: 'ninh-binh',
      name: 'HUB Ninh Bình',
      nameEn: 'Ninh Binh Hub',
      nameJa: 'ニンビンハブ',
      province: ninhBinhProvince.id,
      detail_address: 'KCN Gián Khẩu, huyện Gia Viễn, tỉnh Ninh Bình (Bao gồm Hà Nam, Nam Định)',
      operating_status: 'active',
      coordinates: '20.2500,105.9700',
      warehouse_total_area: 3000,
      warehouse_utilized_area: 0,
      warehouse_available_area: 3000,
      warehouse_storage_tons: 0,
      warehouse_pallets: 0,
      standard_delivery_time: '24 giờ',
      sla_details: { "Ninh Bình": "12h", "Hà Nam": "24h", "Nam Định": "24h" },
      on_time_rate: 98.2,
      on_time_rate_delta: '+1.1%',
      orders_today: 0,
      order_capacity_per_day: 1000,
      avg_delivery_time: '18 giờ',
      avg_delivery_distance: 45.0,
      person_in_charge_name: 'Nguyễn Văn Tiến',
      person_in_charge_title: 'Trưởng Hub',
      person_in_charge_phone: '0987654321',
      current_personnel_count: 12,
      status: 'published'
    },
    {
      slug: 'hung-yen',
      name: 'HUB Hưng Yên',
      nameEn: 'Hung Yen Hub',
      nameJa: 'フンイエンハブ',
      province: hungYenProvince.id,
      detail_address: 'KCN Phố Nối A, huyện Yên Mỹ, tỉnh Hưng Yên',
      operating_status: 'active',
      coordinates: '20.9100,106.0100',
      warehouse_total_area: 2500,
      warehouse_utilized_area: 0,
      warehouse_available_area: 2500,
      warehouse_storage_tons: 0,
      warehouse_pallets: 0,
      standard_delivery_time: '12 giờ',
      sla_details: { "Nội tỉnh": "12h", "Lân cận": "24h" },
      on_time_rate: 98.5,
      on_time_rate_delta: '+1.2%',
      orders_today: 0,
      order_capacity_per_day: 600,
      avg_delivery_time: '8 giờ',
      avg_delivery_distance: 25.0,
      person_in_charge_name: 'Lê Tuấn Anh',
      person_in_charge_title: 'Quản lý vận hành',
      person_in_charge_phone: '0934567890',
      current_personnel_count: 8,
      status: 'published'
    },
    {
      slug: 'hai-phong',
      name: 'HUB Hải Phòng',
      nameEn: 'Hai Phong Hub',
      nameJa: 'ハイフォンハブ',
      province: haiPhongProvince.id,
      detail_address: 'VSIP Hải Phòng, huyện Thủy Nguyên, Thành phố Hải Phòng (Bao gồm Hải Dương)',
      operating_status: 'active',
      coordinates: '20.9000,106.6800',
      warehouse_total_area: 4800,
      warehouse_utilized_area: 0,
      warehouse_available_area: 4800,
      warehouse_storage_tons: 0,
      warehouse_pallets: 0,
      standard_delivery_time: '12 giờ',
      sla_details: { "Hải Phòng": "6h", "Hải Dương": "16h" },
      on_time_rate: 98.5,
      on_time_rate_delta: '+1.1%',
      orders_today: 0,
      order_capacity_per_day: 1200,
      avg_delivery_time: '10 giờ',
      avg_delivery_distance: 28.0,
      person_in_charge_name: 'Vũ Quốc Khánh',
      person_in_charge_title: 'Giám đốc Hub',
      person_in_charge_phone: '0956789012',
      current_personnel_count: 18,
      status: 'published'
    },
    {
      slug: 'quang-ninh',
      name: 'HUB Quảng Ninh',
      nameEn: 'Quang Ninh Hub',
      nameJa: 'クアンニンハブ',
      province: quangNinhProvince.id,
      detail_address: 'KCN Đông Mai, thị xã Quảng Yên, tỉnh Quảng Ninh',
      operating_status: 'active',
      coordinates: '20.9500,107.0800',
      warehouse_total_area: 1100,
      warehouse_utilized_area: 0,
      warehouse_available_area: 1100,
      warehouse_storage_tons: 0,
      warehouse_pallets: 0,
      standard_delivery_time: '24 giờ',
      sla_details: { "KCN": "12h", "Huyện đảo": "48h" },
      on_time_rate: 96.8,
      on_time_rate_delta: '+0.2%',
      orders_today: 0,
      order_capacity_per_day: 250,
      avg_delivery_time: '20 giờ',
      avg_delivery_distance: 45.0,
      person_in_charge_name: 'Đỗ Hữu Nghĩa',
      person_in_charge_title: 'Trưởng Hub',
      person_in_charge_phone: '0967890123',
      current_personnel_count: 5,
      status: 'published'
    },
    {
      slug: 'ha-noi',
      name: 'HUB Hà Nội',
      nameEn: 'Ha Noi Hub',
      nameJa: 'ハノイハブ',
      province: haNoiProvince.id,
      detail_address: 'KCN Bắc Thăng Long, huyện Đông Anh, Thành phố Hà Nội',
      operating_status: 'active',
      coordinates: '21.1000,105.8500',
      warehouse_total_area: 4000,
      warehouse_utilized_area: 0,
      warehouse_available_area: 4000,
      warehouse_storage_tons: 0,
      warehouse_pallets: 0,
      standard_delivery_time: '12 giờ',
      sla_details: { "Express": "4h", "Standard": "12h" },
      on_time_rate: 98.8,
      on_time_rate_delta: '+0.9%',
      orders_today: 0,
      order_capacity_per_day: 1000,
      avg_delivery_time: '8 giờ',
      avg_delivery_distance: 15.0,
      person_in_charge_name: 'Trần Thị Mai',
      person_in_charge_title: 'Trưởng phòng vận hành',
      person_in_charge_phone: '0987654321',
      current_personnel_count: 20,
      status: 'published'
    },
    {
      slug: 'bac-ninh',
      name: 'HUB Bắc Ninh',
      nameEn: 'Bac Ninh Hub',
      nameJa: 'バクニンハブ',
      province: bacNinhProvince.id,
      detail_address: 'VSIP Bắc Ninh, thị xã Từ Sơn, tỉnh Bắc Ninh (Bao gồm Bắc Giang)',
      operating_status: 'active',
      coordinates: '21.1800,106.0700',
      warehouse_total_area: 5500,
      warehouse_utilized_area: 0,
      warehouse_available_area: 5500,
      warehouse_storage_tons: 0,
      warehouse_pallets: 0,
      standard_delivery_time: '12 giờ',
      sla_details: { "Bắc Ninh": "8h", "Bắc Giang": "12h" },
      on_time_rate: 98.8,
      on_time_rate_delta: '+1.3%',
      orders_today: 0,
      order_capacity_per_day: 1400,
      avg_delivery_time: '8 giờ',
      avg_delivery_distance: 22.0,
      person_in_charge_name: 'Phạm Thị Hoa',
      person_in_charge_title: 'Trưởng Hub',
      person_in_charge_phone: '0978901234',
      current_personnel_count: 23,
      status: 'published'
    },
    {
      slug: 'phu-tho',
      name: 'HUB Phú Thọ',
      nameEn: 'Phu Tho Hub',
      nameJa: 'フートハブ',
      province: phuThoProvince.id,
      detail_address: 'KCN Thụy Vân, Thành phố Việt Trì, tỉnh Phú Thọ (Bao gồm Vĩnh Phúc)',
      operating_status: 'active',
      coordinates: '21.3200,105.3900',
      warehouse_total_area: 2500,
      warehouse_utilized_area: 0,
      warehouse_available_area: 2500,
      warehouse_storage_tons: 0,
      warehouse_pallets: 0,
      standard_delivery_time: '24 giờ',
      sla_details: { "Phú Thọ": "18h", "Vĩnh Phúc": "24h" },
      on_time_rate: 97.4,
      on_time_rate_delta: '+0.3%',
      orders_today: 0,
      order_capacity_per_day: 550,
      avg_delivery_time: '16 giờ',
      avg_delivery_distance: 48.0,
      person_in_charge_name: 'Trịnh Minh Tuấn',
      person_in_charge_title: 'Trưởng Hub',
      person_in_charge_phone: '0901234567',
      current_personnel_count: 10,
      status: 'published'
    }
  ];

  const hubIds = {};
  for (const item of hubsData) {
    const { nameEn, nameJa, ...hubPayload } = item;
    const hubId = await upsertRegionalHub(client, helpers, item.slug, hubPayload);
    await seedHubTranslations(helpers, hubId, item.name, nameEn, nameJa);
    hubIds[item.slug] = hubId;
  }

  // Use Ninh Binh Hub as the primary key reference ID (since Ha Nam is merged into it)
  const primaryHubId = hubIds['ninh-binh'];

  // Link products to regional hubs
  await helpers.ensureItem('products_regional_hubs', 'id', {
    id: 1,
    products_id: glovesProductId,
    regional_hubs_id: hubIds['ninh-binh']
  });
  await helpers.ensureItem('products_regional_hubs', 'id', {
    id: 2,
    products_id: glovesProductId,
    regional_hubs_id: hubIds['ha-noi']
  });
  await helpers.ensureItem('products_regional_hubs', 'id', {
    id: 3,
    products_id: wipersProductId,
    regional_hubs_id: hubIds['bac-ninh']
  });

  const zonesData = [
    // Ninh Bình (merged with Hà Nam, Nam Định)
    { name: 'KCN Đồng Văn I', nameEn: 'Dong Van I IP', nameJa: 'ドンヴァンI工業団地', hub: hubIds['ninh-binh'] },
    { name: 'KCN Đồng Văn II', nameEn: 'Dong Van II IP', nameJa: 'ドンヴァンII工業団地', hub: hubIds['ninh-binh'] },
    { name: 'KCN Đồng Văn III', nameEn: 'Dong Van III IP', nameJa: 'ドンヴァンIII工業団地', hub: hubIds['ninh-binh'] },
    { name: 'KCN Đồng Văn IV', nameEn: 'Dong Van IV IP', nameJa: 'ドンヴァンIV工業団地', hub: hubIds['ninh-binh'] },
    { name: 'KCN Thanh Liêm', nameEn: 'Thanh Liem IP', nameJa: 'タンリエム工業団地', hub: hubIds['ninh-binh'] },
    { name: 'KCN Mỹ Thuận', nameEn: 'My Thuan IP', nameJa: 'ミートゥアン工業団地', hub: hubIds['ninh-binh'] },
    { name: 'KCN Bảo Minh', nameEn: 'Bao Minh IP', nameJa: 'バオミン工業団地', hub: hubIds['ninh-binh'] },
    { name: 'KCN Gián Khẩu', nameEn: 'Gian Khau IP', nameJa: 'ザンカウ工業団地', hub: hubIds['ninh-binh'] },
    { name: 'KCN Khánh Phú', nameEn: 'Khanh Phu IP', nameJa: 'カインフー工業団地', hub: hubIds['ninh-binh'] },

    // Hưng Yên
    { name: 'KCN Phố Nối A', nameEn: 'Pho Noi A IP', nameJa: 'フォノイA工業団地', hub: hubIds['hung-yen'] },
    { name: 'KCN Phố Nối B', nameEn: 'Pho Noi B IP', nameJa: 'フォノイB工業団地', hub: hubIds['hung-yen'] },
    { name: 'KCN Thăng Long II', nameEn: 'Thang Long II IP', nameJa: 'タンロンII工業団地', hub: hubIds['hung-yen'] },

    // Hải Phòng (merged with Hải Dương)
    { name: 'KCN Đại An', nameEn: 'Dai An IP', nameJa: 'ダイアン工業団地', hub: hubIds['hai-phong'] },
    { name: 'KCN Tân Trường', nameEn: 'Tan Truong IP', nameJa: 'タントゥオン工業団地', hub: hubIds['hai-phong'] },
    { name: 'KCN An Phát', nameEn: 'An Phat IP', nameJa: 'アンファット工業団地', hub: hubIds['hai-phong'] },
    { name: 'KCN VSIP Hải Phòng', nameEn: 'VSIP Hai Phong IP', nameJa: 'VSIPハイフォン工業団地', hub: hubIds['hai-phong'] },
    { name: 'KCN Tràng Duệ', nameEn: 'Trang Due IP', nameJa: 'チャンドゥエ工業団地', hub: hubIds['hai-phong'] },
    { name: 'KCN Nam Đình Vũ', nameEn: 'Nam Dinh Vu IP', nameJa: 'ナムディンヴー工業団地', hub: hubIds['hai-phong'] },

    // Quảng Ninh
    { name: 'KCN Đông Mai', nameEn: 'Dong Mai IP', nameJa: 'ドンマイ工業団地', hub: hubIds['quang-ninh'] },
    { name: 'KCN Amata Sông Khoai', nameEn: 'Amata Song Khoai IP', nameJa: 'アマタソンコアイ工業団地', hub: hubIds['quang-ninh'] },

    // Hà Nội
    { name: 'KCN Phú Nghĩa', nameEn: 'Phu Nghia IP', nameJa: 'フーギア工業団地', hub: hubIds['ha-noi'] },
    { name: 'KCN Bắc Thăng Long', nameEn: 'Bac Thang Long IP', nameJa: 'バクタンロン工業団地', hub: hubIds['ha-noi'] },
    { name: 'KCN Quang Minh', nameEn: 'Quang Minh IP', nameJa: 'クアンミン工業団地', hub: hubIds['ha-noi'] },

    // Bắc Ninh (merged with Bắc Giang)
    { name: 'KCN VSIP Bắc Ninh', nameEn: 'VSIP Bac Ninh IP', nameJa: 'VSIPバクニン工業団地', hub: hubIds['bac-ninh'] },
    { name: 'KCN Yên Phong I', nameEn: 'Yen Phong I IP', nameJa: 'エンフォンI工業団地', hub: hubIds['bac-ninh'] },
    { name: 'KCN Yên Phong II', nameEn: 'Yen Phong II IP', nameJa: 'エンフォンII工業団地', hub: hubIds['bac-ninh'] },
    { name: 'KCN Quế Võ I', nameEn: 'Que Vo I IP', nameJa: 'クエヴォI工業団地', hub: hubIds['bac-ninh'] },
    { name: 'KCN Quế Võ II', nameEn: 'Que Vo II IP', nameJa: 'クエヴォII工業団地', hub: hubIds['bac-ninh'] },
    { name: 'KCN Quế Võ III', nameEn: 'Que Vo III IP', nameJa: 'クeヴォIII工業団地', hub: hubIds['bac-ninh'] },
    { name: 'KCN Quang Châu', nameEn: 'Quang Chau IP', nameJa: 'クアンチャウ工業団地', hub: hubIds['bac-ninh'] },
    { name: 'KCN Vân Trung', nameEn: 'Van Trung IP', nameJa: 'ヴァントゥン工業団地', hub: hubIds['bac-ninh'] },
    { name: 'KCN Yên Lư', nameEn: 'Yen Lu IP', nameJa: 'イェンルー工業団地', hub: hubIds['bac-ninh'] },

    // Phú Thọ (merged with Vĩnh Phúc)
    { name: 'KCN Khai Quang', nameEn: 'Khai Quang IP', nameJa: 'カイクアン工業団地', hub: hubIds['phu-tho'] },
    { name: 'KCN Thăng Long Vĩnh Phúc', nameEn: 'Thang Long Vinh Phuc IP', nameJa: 'タンロンビンフック工業団地', hub: hubIds['phu-tho'] },
    { name: 'KCN Thụy Vân', nameEn: 'Thuy Van IP', nameJa: 'トゥイヴァン工業団地', hub: hubIds['phu-tho'] },
    { name: 'KCN Phú Hà', nameEn: 'Phu Ha IP', nameJa: 'フーハ工業団地', hub: hubIds['phu-tho'] }
  ];

  for (const zone of zonesData) {
    const { nameEn, nameJa, ...zonePayload } = zone;
    const zoneId = await helpers.ensureItem('hub_industrial_zones', 'name', zonePayload);
    await seedZoneTranslations(helpers, zoneId, zone.name, nameEn, nameJa);
  }

  const teamMembers = [
    // Ninh Bình
    { name: 'Nguyễn Văn Tiến', role: 'Quản lý đại diện', years_experience: 10, hub: hubIds['ninh-binh'], sort: 1 },
    { name: 'Trần Văn Hoàng', role: 'Senior Sales (Nam Định)', years_experience: 5, hub: hubIds['ninh-binh'], sort: 2 },
    { name: 'Phạm Minh Hải', role: 'Sales Địa Bàn (Ninh Bình)', years_experience: 3, hub: hubIds['ninh-binh'], sort: 3 },
    // Hưng Yên
    { name: 'Lê Tuấn Anh', role: 'Sales Địa Bàn', years_experience: 4, hub: hubIds['hung-yen'], sort: 1 },
    // Hải Phòng
    { name: 'Nguyễn Trung Đức', role: 'Senior Sales (Hải Dương)', years_experience: 6, hub: hubIds['hai-phong'], sort: 1 },
    { name: 'Vũ Quốc Khánh', role: 'Giám đốc Hub', years_experience: 7, hub: hubIds['hai-phong'], sort: 2 },
    // Quảng Ninh
    { name: 'Đỗ Hữu Nghĩa', role: 'Trưởng Hub', years_experience: 3, hub: hubIds['quang-ninh'], sort: 1 },
    // Hà Nội
    { name: 'Trần Thị Mai', role: 'Trưởng phòng vận hành', years_experience: 12, hub: hubIds['ha-noi'], sort: 1 },
    // Bắc Ninh
    { name: 'Phạm Thị Hoa', role: 'Trưởng Hub', years_experience: 6, hub: hubIds['bac-ninh'], sort: 1 },
    { name: 'Nguyễn Văn Sơn', role: 'Senior Sales (Bắc Giang)', years_experience: 8, hub: hubIds['bac-ninh'], sort: 2 },
    // Phú Thọ
    { name: 'Đỗ Văn Bình', role: 'Senior Sales (Vĩnh Phúc)', years_experience: 6, hub: hubIds['phu-tho'], sort: 1 },
    { name: 'Trịnh Minh Tuấn', role: 'Trưởng Hub', years_experience: 4, hub: hubIds['phu-tho'], sort: 2 }
  ];

  for (const member of teamMembers) {
    await helpers.ensureItem('hub_team_members', 'name', member);
  }

  const blogPostId = await helpers.ensureItem('blog_posts', 'slug', {
    title: 'Tối ưu kiểm soát ESD trong phòng sạch điện tử',
    slug: 'optimizing-esd-control',
    body: '<p>Phóng điện tĩnh (ESD) có thể làm hỏng cả lô wafer. Việc kiểm soát ESD trong phòng sạch cần vật tư chuyên dụng, quần áo chống tĩnh điện và bao bì phòng sạch đạt chuẩn.</p>',
    author: 'Tech Advisor Team',
    published_at: new Date().toISOString(),
    meta_title: 'Tối ưu kiểm soát ESD trong phòng sạch điện tử',
    meta_description: 'Các biện pháp kiểm soát phòng sạch thực tiễn để giảm phóng điện tĩnh trong môi trường bán dẫn.',
    status: 'published'
  });
  await seedTranslations('blog_posts', blogPostId, 'esd_control');

  const caseStudyId = await helpers.ensureItem('case_studies', 'slug', {
    title: 'Tối ưu chi phí khăn lau phòng sạch cho nhà cung cấp Samsung',
    slug: 'samsung-wiper-cost-optimization',
    summary: 'Cách ULink tối ưu cấp độ khăn lau và logistics để giảm 18% chi phí hằng năm mà vẫn giữ hạt bụi trong ngưỡng cho phép.',
    body: '<p>Khách hàng của chúng tôi, một nhà cung cấp cấp 1 cho linh kiện di động, gặp khó khăn vì chi phí khăn lau polyester cao cấp tăng mạnh. ULink đã thực hiện audit nhiễm bẩn và chuyển sang loại khăn lau cắt laser theo yêu cầu, giúp tiết kiệm đáng kể.</p>',
    industry: electronicsId,
    status: 'published'
  });
  await seedTranslations('case_studies', caseStudyId, 'samsung_wiper');

  const isoId = await helpers.ensureItem('iso_certifications', 'number', {
    name: 'ISO 9001:2015 Hệ thống quản lý chất lượng',
    number: 'QMS-SG-2026-991',
    issuer: 'SGS International',
    valid_until: '2029-06-01',
    file: '22a340ce-b785-4543-b1ef-4cf3eec8e9aa',
    status: 'published'
  });
  await seedTranslations('iso_certifications', isoId, 'iso9001');

  const heroBannerId = await helpers.ensureItem('hero_banners', 'id', {
    id: 1,
    title: 'Nền tảng cung ứng B2B ULink',
    subtitle: 'Vật tư phòng sạch & bao bì công nghiệp chuyên sâu cho doanh nghiệp FDI.',
    cta_label: 'Yêu cầu báo giá',
    cta_url: '/quick-order',
    sort: 1,
    status: 'published'
  });
  await seedTranslations('hero_banners', heroBannerId, 'banner1');

  const siteSettingsId = await helpers.ensureSingleton('site_settings', {
    contact_email: 'contact@ulink.com',
    contact_phone: '+84 24 1234 5678',
    address: 'Tầng 12, Tòa nhà TechPark, KĐT Cầu Giấy, Hà Nội, Việt Nam',
    meta_title: 'ULink B2B Platform — Vật tư phòng sạch & bao bì',
    meta_description: 'Nền tảng phân phối vật tư phòng sạch và giải pháp bao bì công nghiệp hàng đầu cho FDI tại Việt Nam.'
  });
  await seedTranslations('site_settings', siteSettingsId, 'settings');

  const homepageId = await helpers.ensureSingleton('homepage', {
    title: 'Trang chủ ULink B2B',
    hero_section: {
      headline: 'Đối tác cung ứng vật tư công nghiệp tin cậy',
      cta: 'Xem sản phẩm'
    }
  });
  await seedTranslations('homepage', homepageId, 'home');

  return {
    hubId: primaryHubId,
    sku1Id,
    sku2Id,
    sku3Id,
    fallbackLocale: DEFAULT_LOCALE
  };
}
