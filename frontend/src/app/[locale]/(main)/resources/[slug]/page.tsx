import React from 'react';
import { redirect } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ResourceDetailClient, ResourceData } from '@/components/resources/resource-detail-client';
import { ASSETS } from '@/lib/assets';

// Static Data Dictionary for Resources (Tin tức, Case Studies, Tài liệu Catalogue)
const RESOURCE_MOCK_DATABASE: Record<string, ResourceData> = {
  // ── TIN TỨC (NEWS) ────────────────────────────────────────────────────────
  'news-1': {
    slug: 'news-1',
    type: 'news',
    category: 'Tin tức ngành B2B',
    title: 'Xu hướng Tiêu chuẩn Phòng sạch ISO 14644-1 Mới nhất trong Nhà máy Bán dẫn 2026',
    description: 'Phân tích các yêu cầu kiểm soát hạt bụi mịn Class 10 - Class 100 và giải pháp trang thiết bị bảo hộ ESD đạt chuẩn quốc tế cho các nhà máy FDI.',
    date: '15/05/2026',
    author: 'Đội ngũ Kỹ thuật ULink',
    readTime: '6 phút đọc',
    coverImage: ASSETS.about.qualityLab,
    contentHtml: `
      <h2>1. Tổng quan về Tiêu chuẩn Phòng sạch ISO 14644-1</h2>
      <p>Trong bối cảnh ngành công nghiệp bán dẫn và điện tử tại Việt Nam tăng trưởng vượt bậc, việc tuân thủ khắt khe tiêu chuẩn phòng sạch <strong>ISO 14644-1</strong> trở thành yếu tố sống còn đối với các nhà sản xuất B2B. Mật độ hạt bụi kích thước micron có thể làm rò rỉ vi mạch điện tử và suy giảm hiệu suất linh kiện.</p>
      
      <h2>2. Kiểm soát Tĩnh điện (ESD) và Vật tư Tiêu hao Chuyên dụng</h2>
      <p>Bên cạnh độ sạch không khí, tính năng chống tĩnh điện (ESD control) của trang phục, găng tay PU, khẩu trang và thảm dính bụi đóng vai trò cốt lõi. ULink cung cấp trọn bộ giải pháp đạt tiêu chuẩn điện trở bề mặt 10^6 - 10^9 Ω.</p>
      
      <ul>
        <li>Găng tay phủ PU đầu ngón & lòng bàn tay chống tĩnh điện</li>
        <li>Quần áo phòng sạch liền thân chống bám bụi</li>
        <li>Giày phòng sạch đế PVC/PU chống trượt</li>
      </ul>
      
      <h2>3. Khuyên dùng cho Doanh nghiệp FDI</h2>
      <p>Các nhà máy tại KCN Yên Phong, VSIP, Amata nên thực hiện kiểm định định kỳ vật tư 6 tháng/lần để đảm bảo không bị gián đoạn chuỗi cung ứng toàn cầu.</p>
    `,
    highlights: [
      'Đạt chuẩn kiểm định điện trở bề mặt 10^6 - 10^9 Ω',
      'Đầy đủ chứng chỉ CO/CQ và MSDS quốc tế',
      'Cung ứng sẵn kho tại các Hub miền Bắc và miền Nam'
    ]
  },
  'news-2': {
    slug: 'news-2',
    type: 'news',
    category: 'Giải pháp Đóng gói',
    title: 'Giải pháp Bao bì Chống Tĩnh điện ESD Đạt Tiêu chuẩn Xuất khẩu Mỹ & Châu Âu',
    description: 'Hướng dẫn lựa chọn túi nhôm ESD, màng xốp dẻo EPE và thùng nẹp nhựaPP sóng cho linh kiện điện tử cao cấp.',
    date: '10/05/2026',
    author: 'Chuyên gia Chuỗi cung ứng ULink',
    readTime: '5 phút đọc',
    coverImage: ASSETS.home.solutionPackaging,
    contentHtml: `
      <h2>1. Tầm quan trọng của Bao bì ESD trong Vận chuyển Hàng không & Đường biển</h2>
      <p>Khi vận chuyển các thiết bị cảm biến và bo mạch điện tử qua đường biển, biến đổi nhiệt độ và độ ẩm rất dễ phát sinh dòng tĩnh điện gây cháy hỏng chip. Túi nhôm che chắn tĩnh điện (Shielding Bag) ULink giúp cách ly hoàn toàn dòng điện từ bên ngoài.</p>
      
      <h2>2. Các loại bao bì phổ biến</h2>
      <p>ULink thiết kế quy chuẩn đóng gói 3 lớp bảo vệ tối ưu cho từng lô hàng xuất khẩu:</p>
      <ul>
        <li>Lớp trong: Túi màng Shielding bọc kín linh kiện</li>
        <li>Lớp giữa: Khay định hình EPE chống sốc chống tĩnh điện</li>
        <li>Lớp ngoài: Thùng nhựa Danpla PP sóng độ bền cao</li>
      </ul>
    `,
    highlights: [
      'Kháng tĩnh điện bề mặt đạt độ suy giảm dòng điện < 0.05s',
      'Chống ẩm tuyệt đối chống oxy hóa chân linh kiện',
      'Tùy chỉnh kích thước theo bản vẽ kỹ thuật'
    ]
  },
  'news-3': {
    slug: 'news-3',
    type: 'news',
    category: 'Vật tư Công nghiệp',
    title: 'Giải pháp Găng tay Chống cắt Cấp độ A4-A6 Tối ưu An toàn Lao động',
    description: 'Đánh giá khả năng chống cắt của găng tay sợi HPPE phủ Nitrile trong nhà máy gia công kim loại và cơ khí chính xác.',
    date: '02/05/2026',
    author: 'Ban An toàn ULink',
    readTime: '4 phút đọc',
    coverImage: ASSETS.home.productCutGloves,
    contentHtml: `
      <h2>1. Tiêu chuẩn Chống cắt ANSI/ISEA 105 & EN 388</h2>
      <p>Việc lựa chọn đúng găng tay bảo hộ chống cắt giúp giảm 85% nguy cơ chấn thương bàn tay cho công nhân lắp ráp linh kiện kim loại. Sợi HPPE thế hệ mới của ULink mang lại độ linh hoạt tối đa khi cầm nắm chi tiết nhỏ.</p>
      
      <h2>2. Ứng dụng thực tế</h2>
      <p>Sản phẩm phù hợp cho dây chuyền dập khung vỏ ô tô, gia công inox, cắt kính công nghiệp và dập khuôn nhựa.</p>
    `,
    highlights: [
      'Chống cắt cấp độ Cut Level A4 - A6',
      'Độ bám dầu mỡ vượt trội với lớp phủ Micro-Foam Nitrile',
      'Giặt nhiều lần không bị xù sợi hoặc giảm độ chống cắt'
    ]
  },

  // ── CASE STUDIES ──────────────────────────────────────────────────────────
  'case-study-1': {
    slug: 'case-study-1',
    type: 'case-study',
    category: 'Case Study Thực tế',
    title: 'Case Study: Giảm 25% Chi phí Vật tư Tiêu hao cho Tập đoàn Điện tử Samsung Vendor',
    description: 'Dự án chuẩn hóa chuỗi cung ứng vật tư phòng sạch và găng tay ESD cho tập đoàn linh kiện tại KCN Yên Phong.',
    date: '20/04/2026',
    author: 'ULink Enterprise Solutions',
    readTime: '8 phút đọc',
    coverImage: ASSETS.about.heroWarehouse,
    contentHtml: `
      <h2>1. Bài toán của Khách hàng</h2>
      <p>Khách hàng là vendor cấp 1 chuyên sản xuất camera module cho điện thoại thông minh, gặp rào cản tỷ lệ lỗi rác bụi phòng sạch và chi phí tồn kho vật tư tiêu hao cao do giao hàng nhỏ lẻ từ nhiều nhà cung cấp khác nhau.</p>
      
      <h2>2. Giải pháp từ ULink</h2>
      <p>ULink triển khai mô hình <strong>VMI (Vendor Managed Inventory)</strong> kết hợp Hub giao hàng nhanh trong 2 giờ tại Bắc Ninh, đồng thời thay thế toàn bộ găng tay PU thông thường bằng dòng găng PU ESD thế hệ mới.</p>
      
      <h2>3. Kết quả đạt được</h2>
      <ul>
        <li>Tiết kiệm <strong>25% tổng chi phí mua hàng hàng năm</strong></li>
        <li>Tỷ lệ giao đúng giờ (OTIF) đạt <strong>99.8%</strong></li>
        <li>Giảm 40% diện tích kho bãi lưu trữ vật tư tại nhà máy</li>
      </ul>
    `,
    highlights: [
      'Tiết kiệm 25% tổng ngân sách vật tư phòng sạch',
      'Cam kết giữ giá cố định 12 tháng hợp đồng khung B2B',
      'VMI giữ tồn kho an toàn tại Hub Bắc Ninh'
    ]
  },
  'case-study-2': {
    slug: 'case-study-2',
    type: 'case-study',
    category: 'Case Study Thực tế',
    title: 'Case Study: Tối ưu Quy trình Đóng gói Báo giá Tự động cho Nhà máy Dược phẩm Mỹ',
    description: 'Ứng dụng giải pháp bao bì tiêu chuẩn phòng sạch y tế ISO Class 5 cho chuỗi nhà máy dược tại Bình Dương.',
    date: '12/04/2026',
    author: 'ULink Medical Division',
    readTime: '7 phút đọc',
    coverImage: ASSETS.home.solutionCleanroom,
    contentHtml: `
      <h2>1. Thách thức ngành Dược phẩm</h2>
      <p>Nhà máy dược cần tuân thủ GMP-WHO khắt khe đối với vật tư bao bì cấp 1 tiếp xúc trực tiếp với thuốc viên và vắc-xin.</p>
      <h2>2. Giải pháp</h2>
      <p>ULink sản xuất túi tiệt trùng màng Tyvek / PE chuyên dụng trong phòng sạch Class 100, cung cấp mã tracking lô hàng điện tử.</p>
    `,
    highlights: [
      'Túi tiệt trùng đạt chuẩn ISO Class 5',
      'Đầy đủ hồ sơ kiểm định sinh học & độ sạch vi sinh',
      'Hỗ trợ gửi mẫu thử tận nơi trong 24 giờ'
    ]
  },
  'case-study-3': {
    slug: 'case-study-3',
    type: 'case-study',
    category: 'Case Study Thực tế',
    title: 'Case Study: Chuẩn hóa 100% Khăn lau Chống tĩnh điện cho Chuỗi Kho vận Logistics',
    description: 'Chuyển đổi khăn lau phòng sạch Wiper 1009 sang dòng Wipes Microfiber 4004 cho kho linh kiện phụ tùng ô tô.',
    date: '05/04/2026',
    author: 'ULink Industrial Sales',
    readTime: '5 phút đọc',
    coverImage: ASSETS.home.solutionPackaging,
    contentHtml: `
      <h2>1. Bài toán giảm thiểu xơ bụi</h2>
      <p>Khăn lau thông thường để lại xơ vải trên các thấu kính cảm biến ô tô. ULink đã áp dụng dòng khăn Microfiber siêu mịn cắt siêu âm bằng laser.</p>
      <h2>2. Kết quả</h2>
      <p>Hoàn toàn không để lại xơ bụi, nâng cao 30% hiệu suất lau chùi bề mặt thấu kính.</p>
    `,
    highlights: [
      'Khăn lau siêu mịn cắt laser không phát sinh xơ sợi',
      'Hấp thụ dung môi IPA vượt trội',
      'Đóng gói hút chân không 100 cái/túi'
    ]
  },

  // ── TÀI LIỆU (DOCS & CATALOGUE) ──────────────────────────────────────────
  'docs-1': {
    slug: 'docs-1',
    type: 'doc',
    category: 'Catalogue Sản phẩm 2026',
    title: 'Catalogue Tổng hợp Vật tư Tiêu hao Phòng sạch & Chống tĩnh điện (ESD)',
    description: 'Bộ tài liệu Catalogue 48 trang tổng hợp chi tiết bảng quy cách, kích thước, độ sạch và mã đặt hàng B2B.',
    date: '01/01/2026',
    author: 'Ban Sản phẩm ULink',
    readTime: '3 phút đọc',
    coverImage: ASSETS.about.qualityLab,
    pdfUrl: '/files/catalogue-ulink-cleanroom-2026.pdf',
    pdfSize: '4.8 MB',
    contentHtml: `
      <h2>Về Tài liệu Catalogue ULink 2026</h2>
      <p>Tài liệu này bao gồm toàn bộ danh mục sản phẩm cốt lõi của ULink:</p>
      <ul>
        <li>Trang phục, khẩu trang, nón trùm phòng sạch</li>
        <li>Găng tay PU, Nitrile, Latex ESD</li>
        <li>Giày, dép, thảm dính bụi Sticky Mat</li>
        <li>Bao bì ESD, màng PE, túi nhôm, thùng Danpla</li>
      </ul>
      <p>Tất cả sản phẩm đều đi kèm mã SKU chính thức giúp bộ phận thu mua dễ dàng lập yêu cầu báo giá (RFQ) trực tuyến.</p>
    `,
    highlights: [
      'Bảng quy đổi kích thước chuẩn EU/US/VN',
      'Hướng dẫn phân biệt hàng chính hãng & thông số điện trở',
      'Mã QR tra cứu báo giá tức thì'
    ]
  },
  'docs-2': {
    slug: 'docs-2',
    type: 'doc',
    category: 'Chứng nhận Kỹ thuật ISO',
    title: 'Hồ sơ Chứng nhận Tiêu chuẩn ISO 9001:2015 & ISO 14001:2015 ULink',
    description: 'Chứng chỉ quản lý chất lượng và hệ thống quản lý môi trường được cấp bởi tổ chức kiểm định quốc tế.',
    date: '10/01/2026',
    author: 'Bộ phận QA/QC ULink',
    readTime: '2 phút đọc',
    coverImage: ASSETS.about.qualityLab,
    pdfUrl: '/files/iso-certifications-ulink.pdf',
    pdfSize: '1.9 MB',
    contentHtml: `
      <h2>Hồ sơ Năng lực QA/QC ULink</h2>
      <p>Toàn bộ quy trình nhập khẩu, lưu kho và phân phối vật tư của ULink tuân thủ nghiêm ngặt chuẩn ISO 9001:2015. Quý khách hàng FDI có thể tải về file PDF chứng nhận để hoàn thiện hồ sơ đánh giá nhà cung cấp (Supplier Assessment).</p>
    `,
    highlights: [
      'Chứng nhận ISO 9001:2015 có hiệu lực toàn cầu',
      'Kết quả kiểm định RoHS & REACH cho vật tư bao bì',
      'Cam kết 100% sản phẩm có nguồn gốc xuất xứ rõ ràng'
    ]
  },
  'docs-3': {
    slug: 'docs-3',
    type: 'doc',
    category: 'Hướng dẫn Kỹ thuật',
    title: 'Sổ tay Hướng dẫn Kiểm tra Điện trở Bề mặt Chống Tĩnh điện (ESD Guide)',
    description: 'Quy trình chuẩn bị thiết bị đo điện trở, nhiệt độ và độ ẩm phòng thử nghiệm theo chuẩn ANSI/ESD S20.20.',
    date: '15/02/2026',
    author: 'Kỹ sư Trưởng ESD ULink',
    readTime: '5 phút đọc',
    coverImage: ASSETS.about.qualityLab,
    pdfUrl: '/files/esd-testing-handbook.pdf',
    pdfSize: '3.1 MB',
    contentHtml: `
      <h2>Nội dung Sổ tay Hướng dẫn ESD</h2>
      <p>Sổ tay cung cấp hướng dẫn từng bước giúp cán bộ quản lý phòng sạch tự đo đạc và nghiệm thu vật tư chống tĩnh điện trước khi đưa vào sản xuất:</p>
      <ul>
        <li>Cách sử dụng máy đo Megohmmeter đo điện trở Point-to-Point</li>
        <li>Ngưỡng chấp nhận điện trở cho găng tay, thảm cao su, khay nhựa</li>
        <li>Xử lý sự cố khi điện trở bề mặt bị suy giảm do độ ẩm môi trường</li>
      </ul>
    `,
    highlights: [
      'Đáp ứng tiêu chuẩn quốc tế ANSI/ESD S20.20-2021',
      'Bảng tra cứu sai số phép đo nhiệt độ/độ ẩm',
      'Mẫu biên bản nghiệm thu vật tư ESD'
    ]
  },
  'docs-4': {
    slug: 'docs-4',
    type: 'doc',
    category: 'Bảng Thông số Vật liệu (MSDS)',
    title: 'Bảng Báo cáo An toàn Vật liệu (MSDS) & RoHS Khăn lau Phòng sạch Wiper',
    description: 'Tài liệu MSDS an toàn hóa chất và chứng nhận không chứa chất nguy hại RoHS cho dòng khăn lau Wiper 1009/4004.',
    date: '20/02/2026',
    author: 'Bộ phận Compliance ULink',
    readTime: '3 phút đọc',
    coverImage: ASSETS.home.solutionPackaging,
    pdfUrl: '/files/msds-rohs-cleanroom-wipers.pdf',
    pdfSize: '2.2 MB',
    contentHtml: `
      <h2>Báo cáo An toàn Hóa chất & RoHS</h2>
      <p>Tài liệu chứng minh dòng khăn lau ULink Wiper hoàn toàn không chứa 10 chất nguy hại bị hạn chế theo chỉ thị RoHS 3 (EU 2015/863), an toàn tuyệt đối cho người thao tác và thiết bị điện tử.</p>
    `,
    highlights: [
      'Chứng nhận RoHS 3 không chứa Chì, Thủy ngân, Cadmium',
      'An toàn khi sử dụng với dung môi Cồn IPA và Acetone',
      'Tệp PDF bản gốc tiếng Anh & bản dịch tiếng Việt'
    ]
  }
};

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  const data = RESOURCE_MOCK_DATABASE[slug];

  // If slug is not found in mock database, redirect gracefully back to /resources
  if (!data) {
    redirect({ href: '/resources', locale });
  }

  return <ResourceDetailClient data={data} locale={locale} />;
}
