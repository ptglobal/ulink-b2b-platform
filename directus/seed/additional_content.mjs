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
