import { DEFAULT_LOCALE } from '../lib/i18n.mjs';
import { translations } from './translation_data.mjs';

export async function seedInitialContent(helpers) {
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

  const hubId = await helpers.ensureItem('regional_hubs', 'slug', {
    name: 'Đông Vân 4',
    slug: 'dong-van-4',
    delivery_sla: 'Giao trong 24 giờ đến cụm Hà Nam và Hà Nội; 48 giờ cho khu vực lân cận.',
    warehouse_capacity: '5.000 m² kho kiểm soát nhiệt độ',
    technical_team: 'Kỹ sư kỹ thuật tại chỗ 24/7 hỗ trợ tư vấn phòng sạch.',
    cluster_overview: 'Phục vụ cụm công nghiệp Đông Vân chuyên điện tử và cơ khí chính xác.',
    location: 'KCN Đông Vân IV, Kim Bảng, Hà Nam',
    coordinates: '20.6139,105.9084',
    status: 'published'
  });
  await seedTranslations('regional_hubs', hubId, 'dong_van_4');

  const bacThangLongId = await helpers.ensureItem('regional_hubs', 'slug', {
    name: 'Bắc Thăng Long',
    slug: 'bac-thang-long',
    delivery_sla: 'Giao trong 12 giờ trong nội thành.',
    warehouse_capacity: '3.000 m²',
    technical_team: 'Đội ngũ kỹ sư tư vấn tối ưu bao bì.',
    cluster_overview: 'Hỗ trợ trung tâm xuất khẩu điện tử công nghệ cao tại Hà Nội.',
    location: 'Đông Anh, Hà Nội',
    coordinates: '21.1235,105.7891',
    status: 'published'
  });
  await seedTranslations('regional_hubs', bacThangLongId, 'bac_thang_long');

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
    hubId,
    sku1Id,
    sku2Id,
    sku3Id,
    fallbackLocale: DEFAULT_LOCALE
  };
}
