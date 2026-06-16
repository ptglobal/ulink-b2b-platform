export async function seedAdditionalContent(helpers, ids) {
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
  const binhDuongId = await helpers.ensureItem('regional_hubs', 'slug', {
    name: 'VSIP Bình Dương',
    slug: 'vsip-binh-duong',
    delivery_sla: 'Giao trong 24 giờ cho khu vực TP.HCM và Bình Dương; 48 giờ cho Đồng Nai, Long An.',
    warehouse_capacity: '4.000 m² kho kiểm soát nhiệt độ',
    technical_team: 'Đội ngũ kỹ sư tại chỗ hỗ trợ tư vấn bao bì và phòng sạch.',
    cluster_overview: 'Phục vụ cụm công nghiệp VSIP chuyên điện tử, dược phẩm và chế biến thực phẩm.',
    location: 'KCN VSIP II-A, Tân Uyên, Bình Dương',
    coordinates: '11.0500,106.6500',
    status: 'published'
  });

  const haiPhongId = await helpers.ensureItem('regional_hubs', 'slug', {
    name: 'VSIP Hải Phòng',
    slug: 'vsip-hai-phong',
    delivery_sla: 'Giao trong 24 giờ cho Hải Phòng và Quảng Ninh; 36 giờ cho Hải Dương, Hưng Yên.',
    warehouse_capacity: '3.500 m²',
    technical_team: 'Kỹ sư kỹ thuật hỗ trợ kiểm soát nhiễm bẩn và ESD.',
    cluster_overview: 'Hỗ trợ khu vực công nghiệp trọng điểm Hải Phòng — điện tử, ô tô và linh kiện.',
    location: 'KCN VSIP Hải Phòng, Thuỷ Nguyên, Hải Phòng',
    coordinates: '20.9000,106.6800',
    status: 'published'
  });

  const longThanhId = await helpers.ensureItem('regional_hubs', 'slug', {
    name: 'Long Thành',
    slug: 'long-thanh',
    delivery_sla: 'Giao trong 12 giờ cho Đồng Nai; 24 giờ cho Bà Rịa-Vũng Tàu và Bình Thuận.',
    warehouse_capacity: '2.500 m²',
    technical_team: 'Đội ngũ hỗ trợ tối ưu chi phí vật tư tiêu hao.',
    cluster_overview: 'Phục vụ cụm công nghiệp Long Thành — dệt may, giày dép và cơ khí.',
    location: 'KCN Long Thành, Long Thành, Đồng Nai',
    coordinates: '10.8000,106.9500',
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
