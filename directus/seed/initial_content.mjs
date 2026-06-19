import { readItems, updateItem } from '@directus/sdk';
import { DEFAULT_LOCALE } from '../lib/i18n.mjs';
import { translations } from './translation_data.mjs';

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

  const electronicsId = await helpers.ensureItem('industries', 'slug', {
    name: 'Điện tử',
    slug: 'electronics',
    status: 'published',
    description: 'Giải pháp phòng sạch và bao bì công nghiệp cho sản xuất bán dẫn, PCB và màn hình.'
  });
  await seedTranslations('industries', electronicsId, 'electronics');

  const pharmaceuticalId = await helpers.ensureItem('industries', 'slug', {
    name: 'Dược phẩm & Mỹ phẩm',
    slug: 'pharmaceutical-cosmetics',
    status: 'published',
    description: 'Vật tư đóng gói vô trùng và kiểm soát nhiễm bẩn cho phòng sạch cấp A/B.'
  });
  await seedTranslations('industries', pharmaceuticalId, 'pharmaceutical');

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

  const haNamProvince = getGeoEntry(geography?.provincesByAbbr, 'HNA', 'province');
  const dongVan4Id = await upsertRegionalHub(client, helpers, 'dong-van-4', {
    name: 'Đông Vân 4',
    province: haNamProvince.id,
    detail_address: 'KCN Đông Vân IV, Kim Bảng, Hà Nam',
    operating_status: 'active',
    coordinates: '20.5500,105.9100',
    warehouse_total_area: 5000,
    warehouse_utilized_area: 3200,
    warehouse_available_area: 1800,
    warehouse_storage_tons: 2000,
    warehouse_pallets: 800,
    standard_delivery_time: '24 giờ',
    on_time_rate: 96.5,
    on_time_rate_delta: '+2.1%',
    orders_today: 45,
    order_capacity_per_day: 100,
    avg_delivery_time: '18 giờ',
    person_in_charge_name: 'Nguyễn Văn Hùng',
    person_in_charge_title: 'Giám đốc Hub',
    person_in_charge_phone: '0912345678',
    current_personnel_count: 25,
    status: 'published'
  });
  await seedTranslations('regional_hubs', dongVan4Id, 'dong_van_4');

  const haNoiProvince = getGeoEntry(geography?.provincesByAbbr, 'HN', 'province');
  const bacThangLongId = await upsertRegionalHub(client, helpers, 'bac-thang-long', {
    name: 'Bắc Thăng Long',
    province: haNoiProvince.id,
    detail_address: 'Đông Anh, Hà Nội',
    operating_status: 'active',
    coordinates: '21.1000,105.8500',
    warehouse_total_area: 3500,
    warehouse_utilized_area: 2800,
    warehouse_available_area: 700,
    warehouse_storage_tons: 1500,
    warehouse_pallets: 600,
    standard_delivery_time: '12 giờ',
    on_time_rate: 98.2,
    on_time_rate_delta: '+0.5%',
    orders_today: 72,
    order_capacity_per_day: 150,
    avg_delivery_time: '8 giờ',
    person_in_charge_name: 'Trần Thị Mai',
    person_in_charge_title: 'Trưởng phòng vận hành',
    person_in_charge_phone: '0987654321',
    current_personnel_count: 35,
    status: 'published'
  });
  await seedTranslations('regional_hubs', bacThangLongId, 'bac_thang_long');

  // Hub Industrial Zones
  await helpers.ensureItem('hub_industrial_zones', 'name', {
    name: 'KCN Đông Vân IV',
    hub: dongVan4Id
  });
  await helpers.ensureItem('hub_industrial_zones', 'name', {
    name: 'KCN Đồng Văn III',
    hub: dongVan4Id
  });
  await helpers.ensureItem('hub_industrial_zones', 'name', {
    name: 'KCN Bắc Thăng Long',
    hub: bacThangLongId
  });

  // Hub Team Members
  await helpers.ensureItem('hub_team_members', 'name', {
    name: 'Trần Minh Đức',
    role: 'Kỹ sư phòng sạch',
    years_experience: 8,
    hub: dongVan4Id,
    sort: 1
  });
  await helpers.ensureItem('hub_team_members', 'name', {
    name: 'Lê Hoàng Nam',
    role: 'Quản lý kho',
    years_experience: 5,
    hub: dongVan4Id,
    sort: 2
  });
  await helpers.ensureItem('hub_team_members', 'name', {
    name: 'Phạm Thị Hoa',
    role: 'Kỹ sư QC',
    years_experience: 6,
    hub: bacThangLongId,
    sort: 1
  });

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
    hubId: dongVan4Id,
    sku1Id,
    sku2Id,
    sku3Id,
    fallbackLocale: DEFAULT_LOCALE
  };
}
