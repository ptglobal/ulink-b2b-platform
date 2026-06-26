import { translations } from './translation_data.mjs';

async function seedTranslations(helpers, collection, sourceId, key) {
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

function getGeoEntry(map, key, label) {
  const entry = map?.get(key);
  if (!entry) {
    throw new Error(`Missing ${label} seed for ${key}.`);
  }
  return entry;
}

export async function seedAdditionalContent(helpers, ids, geography) {
  // Partners
  await helpers.ensureItem('partners', 'name', {
    name: '3M',
    url: 'https://www.3m.com',
    sort: 1,
    status: 'published'
  });

  await helpers.ensureItem('partners', 'name', {
    name: 'Kimberly-Clark Professional',
    url: 'https://www.kcprofessional.com',
    sort: 2,
    status: 'published'
  });

  await helpers.ensureItem('partners', 'name', {
    name: 'Ansell',
    url: 'https://www.ansell.com',
    sort: 3,
    status: 'published'
  });

  await helpers.ensureItem('partners', 'name', {
    name: 'Contec',
    url: 'https://www.contecinc.com',
    sort: 4,
    status: 'published'
  });

  // Pages
  await helpers.ensureItem('pages', 'slug', {
    title: 'Về chúng tôi',
    slug: 'about-us',
    body: '<p>ULink là nền tảng phân phối vật tư phòng sạch và bao bì công nghiệp hàng đầu cho doanh nghiệp FDI tại Việt Nam. Chúng tôi kết nối nhà sản xuất với nguồn cung ứng chất lượng cao thông qua hệ thống logistics thông minh và đội ngũ kỹ thuật chuyên sâu.</p>',
    meta_title: 'Về ULink — Nền tảng cung ứng B2B',
    meta_description: 'Tìm hiểu về ULink, đối tác phân phối vật tư phòng sạch và bao bì công nghiệp cho FDI tại Việt Nam.',
    status: 'published'
  });

  await helpers.ensureItem('pages', 'slug', {
    title: 'Chính sách bảo mật',
    slug: 'privacy-policy',
    body: '<p>ULink cam kết bảo vệ thông tin cá nhân của khách hàng theo quy định pháp luật Việt Nam và tiêu chuẩn quốc tế.</p>',
    meta_title: 'Chính sách bảo mật | ULink',
    meta_description: 'Chính sách bảo mật và xử lý dữ liệu cá nhân của ULink B2B Platform.',
    status: 'published'
  });

  await helpers.ensureItem('pages', 'slug', {
    title: 'Điều khoản sử dụng',
    slug: 'terms-of-service',
    body: '<p>Bằng việc sử dụng nền tảng ULink, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây.</p>',
    meta_title: 'Điều khoản sử dụng | ULink',
    meta_description: 'Điều khoản và điều kiện sử dụng nền tảng ULink B2B.',
    status: 'published'
  });

  // Additional regional hubs
  const binhDuongProvince = getGeoEntry(geography?.provincesByAbbr, 'HCM', 'province');
  const haiPhongProvince = getGeoEntry(geography?.provincesByAbbr, 'HP', 'province');
  const dongNaiProvince = getGeoEntry(geography?.provincesByAbbr, 'DN', 'province');

  const binhDuongId = await helpers.ensureItem('regional_hubs', 'slug', {
    name: 'VSIP Bình Dương',
    slug: 'vsip-binh-duong',
    province: binhDuongProvince.id,
    detail_address: 'KCN VSIP II-A, Tân Uyên, Bình Dương',
    operating_status: 'active',
    coordinates: '11.0500,106.6500',
    warehouse_total_area: 4000,
    warehouse_utilized_area: 3000,
    warehouse_available_area: 1000,
    warehouse_storage_tons: 1800,
    warehouse_pallets: 700,
    standard_delivery_time: '24 giờ',
    on_time_rate: 95.0,
    on_time_rate_delta: '+1.2%',
    orders_today: 60,
    order_capacity_per_day: 120,
    avg_delivery_time: '20 giờ',
    person_in_charge_name: 'Lê Quang Minh',
    person_in_charge_title: 'Giám đốc vận hành',
    person_in_charge_phone: '0901234567',
    current_personnel_count: 30,
    status: 'published'
  });

  const haiPhongId = await helpers.ensureItem('regional_hubs', 'slug', {
    name: 'VSIP Hải Phòng',
    slug: 'vsip-hai-phong',
    province: haiPhongProvince.id,
    detail_address: 'KCN VSIP Hải Phòng, Thuỷ Nguyên, Hải Phòng',
    operating_status: 'active',
    coordinates: '20.9000,106.6800',
    warehouse_total_area: 3500,
    warehouse_utilized_area: 2500,
    warehouse_available_area: 1000,
    warehouse_storage_tons: 1400,
    warehouse_pallets: 550,
    standard_delivery_time: '24 giờ',
    on_time_rate: 94.8,
    on_time_rate_delta: '-0.3%',
    orders_today: 38,
    order_capacity_per_day: 80,
    avg_delivery_time: '22 giờ',
    person_in_charge_name: 'Vũ Đình Tùng',
    person_in_charge_title: 'Trưởng Hub',
    person_in_charge_phone: '0918765432',
    current_personnel_count: 22,
    status: 'published'
  });

  const longThanhId = await helpers.ensureItem('regional_hubs', 'slug', {
    name: 'Long Thành',
    slug: 'long-thanh',
    province: dongNaiProvince.id,
    detail_address: 'KCN Long Thành, Long Thành, Đồng Nai',
    operating_status: 'active',
    coordinates: '10.8000,106.9500',
    warehouse_total_area: 2500,
    warehouse_utilized_area: 1800,
    warehouse_available_area: 700,
    warehouse_storage_tons: 1000,
    warehouse_pallets: 400,
    standard_delivery_time: '12 giờ',
    on_time_rate: 97.5,
    on_time_rate_delta: '+1.0%',
    orders_today: 25,
    order_capacity_per_day: 60,
    avg_delivery_time: '10 giờ',
    person_in_charge_name: 'Hoàng Thị Lan',
    person_in_charge_title: 'Phó Giám đốc Hub',
    person_in_charge_phone: '0932109876',
    current_personnel_count: 18,
    status: 'published'
  });

  // Industrial zones for additional hubs
  const vsipIiAZoneId = await helpers.ensureItem('hub_industrial_zones', 'name', {
    name: 'KCN VSIP II-A',
    hub: binhDuongId
  });
  await seedTranslations(helpers, 'hub_industrial_zones', vsipIiAZoneId, 'vsip_ii_a');

  const vsipHaiPhongZoneId = await helpers.ensureItem('hub_industrial_zones', 'name', {
    name: 'KCN VSIP Hải Phòng',
    hub: haiPhongId
  });
  await seedTranslations(helpers, 'hub_industrial_zones', vsipHaiPhongZoneId, 'vsip_hai_phong');

  const longThanhZoneId = await helpers.ensureItem('hub_industrial_zones', 'name', {
    name: 'KCN Long Thành',
    hub: longThanhId
  });
  await seedTranslations(helpers, 'hub_industrial_zones', longThanhZoneId, 'long_thanh');

  // Team members for additional hubs
  await helpers.ensureItem('hub_team_members', 'name', {
    name: 'Nguyễn Thanh Sơn',
    role: 'Kỹ sư logistics',
    years_experience: 7,
    hub: binhDuongId,
    sort: 1
  });
  await helpers.ensureItem('hub_team_members', 'name', {
    name: 'Đỗ Văn Bình',
    role: 'Chuyên viên ESD',
    years_experience: 4,
    hub: haiPhongId,
    sort: 1
  });
  await helpers.ensureItem('hub_team_members', 'name', {
    name: 'Trịnh Minh Tuấn',
    role: 'Quản lý kho',
    years_experience: 6,
    hub: longThanhId,
    sort: 1
  });

  // RFQ assignment rules
  await helpers.ensureItem('rfq_assignment_rules', 'id', {
    id: 1,
    hub: ids.hubId,
    industry: null,
    assigned_sales: null,
    priority: 0,
    is_default: true
  });
}
