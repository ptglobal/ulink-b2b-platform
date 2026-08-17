export type AboutNewsSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type AboutNewsArticle = {
  id: string;
  category: string;
  title: string;
  summary: string;
  author: string;
  date: string;
  readTime: string;
  coverImage: string;
  highlights: string[];
  sections: AboutNewsSection[];
  relatedIds: string[];
};

export const ABOUT_NEWS_ARTICLES: AboutNewsArticle[] = [
  {
    id: '1',
    category: 'Thị trường',
    title: 'Thắt chặt chuỗi cung ứng vật tư B2B năm 2026',
    summary:
      'Những giải pháp đột phá giúp các nhà máy tối ưu hóa chi phí dự trữ kho bãi trong bối cảnh nhu cầu tăng cao và lead time biến động.',
    author: 'Minh Tuấn',
    date: '05/08/2026',
    readTime: '5 phút đọc',
    coverImage: '/images/about/quality-hero-bg.webp',
    highlights: [
      'Tối ưu tồn kho theo mô hình dự báo nhu cầu ngắn hạn',
      'Rút ngắn lead time nhờ gom đơn theo cụm nhà máy',
      'Ưu tiên vật tư chiến lược để giảm rủi ro đứt gãy'
    ],
    sections: [
      {
        title: 'Bối cảnh thị trường',
        paragraphs: [
          'Năm 2026 ghi nhận áp lực lớn lên chuỗi cung ứng vật tư B2B khi chi phí logistics, biến động đơn hàng và yêu cầu giao nhanh cùng tăng.',
          'Các doanh nghiệp sản xuất buộc phải tái cấu trúc kế hoạch mua hàng, phân nhóm vật tư theo mức độ ưu tiên và tăng tốc trao đổi dữ liệu với nhà cung cấp.'
        ]
      },
      {
        title: 'Ba hướng triển khai thực tế',
        paragraphs: [
          'Doanh nghiệp có thể bắt đầu bằng việc chuẩn hóa danh mục vật tư, gắn mức tồn kho an toàn theo từng nhóm sản phẩm và thiết lập ngưỡng cảnh báo sớm.',
          'Đồng thời, nên xây dựng lại lịch đặt hàng theo vùng và theo nhà máy để hạn chế tồn kho phân tán, giảm chi phí giữ hàng mà vẫn đảm bảo mức phục vụ.'
        ],
        bullets: [
          'Chuẩn hóa master data cho vật tư chiến lược',
          'Đồng bộ forecast giữa mua hàng và vận hành',
          'Thiết lập KPI giao đúng hạn theo từng nhà cung cấp'
        ]
      },
      {
        title: 'Kết luận',
        paragraphs: [
          'Thắt chặt chuỗi cung ứng không chỉ là câu chuyện giảm chi phí mà còn là cách doanh nghiệp tăng khả năng chống chịu trước biến động của thị trường.'
        ]
      }
    ],
    relatedIds: ['2', '3']
  },
  {
    id: '2',
    category: 'Công nghệ',
    title: 'Ứng dụng hệ thống WMS trong quản lý kho hiện đại',
    summary:
      'Tự động hóa dữ liệu giúp kiểm soát tỷ lệ sai lệch tồn kho dưới 0.01% và tăng khả năng truy xuất hàng hóa theo thời gian thực.',
    author: 'Bích Ngọc',
    date: '02/08/2026',
    readTime: '6 phút đọc',
    coverImage: '/images/about/op-wms.webp',
    highlights: [
      'Dữ liệu kho cập nhật theo thời gian thực',
      'Giảm lỗi nhập - xuất nhờ quét mã vạch',
      'Nâng độ chính xác tồn kho lên mức vận hành chuẩn'
    ],
    sections: [
      {
        title: 'WMS thay đổi vận hành kho thế nào?',
        paragraphs: [
          'Hệ thống WMS giúp doanh nghiệp kiểm soát vị trí hàng hóa, luồng xuất nhập và trạng thái đơn hàng tập trung trên một nền tảng duy nhất.',
          'Nhờ đó, đội vận hành không còn phụ thuộc vào bảng tính rời rạc mà có thể theo dõi từng kiện hàng, từng vị trí và từng thao tác xử lý.'
        ]
      },
      {
        title: 'Các lợi ích nổi bật',
        paragraphs: [
          'Khi triển khai đúng cách, WMS hỗ trợ giảm thời gian tìm hàng, tăng độ chính xác picking và cải thiện chất lượng báo cáo cho quản lý.'
        ],
        bullets: [
          'Kiểm soát batch và serial rõ ràng',
          'Tối ưu sơ đồ slotting trong kho',
          'Giảm sai lệch tồn kho và tồn đọng xử lý'
        ]
      }
    ],
    relatedIds: ['1', '4']
  },
  {
    id: '3',
    category: 'Vận tải',
    title: 'Giải pháp giao hàng thần tốc 24h vùng kinh tế trọng điểm',
    summary:
      'Mạng lưới kết nối giao thông đồng bộ giúp tối ưu lộ trình xe tải, rút ngắn thời gian giao nhận và tăng tỷ lệ đúng hẹn.',
    author: 'Hoàng Nam',
    date: '28/07/2026',
    readTime: '4 phút đọc',
    coverImage: '/images/about/op-truck.webp',
    highlights: [
      'Giao nhanh trong 24h cho cụm khách hàng trọng điểm',
      'Điều phối tuyến xe theo dữ liệu thực tế',
      'Nâng tỷ lệ giao đúng hẹn nhờ tối ưu tuyến'
    ],
    sections: [
      {
        title: 'Lý do mô hình giao nhanh 24h hiệu quả',
        paragraphs: [
          'Tại các vùng kinh tế trọng điểm, khoảng cách giữa kho trung chuyển và điểm tiêu thụ đủ ngắn để doanh nghiệp xây dựng mô hình giao nhận 24h khả thi.',
          'Mấu chốt là kết nối dữ liệu đơn hàng, tình trạng xe và năng lực bốc xếp để ra quyết định phân bổ tuyến kịp thời.'
        ]
      },
      {
        title: 'Điểm cần kiểm soát',
        paragraphs: [
          'Doanh nghiệp nên đặt ngưỡng cảnh báo cho đơn gấp, đơn lạnh và đơn có yêu cầu hẹn giờ để không làm ảnh hưởng đến độ đúng hẹn chung.'
        ]
      }
    ],
    relatedIds: ['1', '4']
  },
  {
    id: '4',
    category: 'Bền vững',
    title: 'Tiêu chuẩn xanh cho hệ thống kho hàng công nghiệp',
    summary:
      'Chuyển đổi năng lượng mặt trời giúp giảm 35% chi phí vận hành kho đồng thời cải thiện chỉ số phát thải của toàn hệ thống.',
    author: 'Khánh Linh',
    date: '20/07/2026',
    readTime: '5 phút đọc',
    coverImage: '/images/about/quality-lab.webp',
    highlights: [
      'Giảm phát thải bằng điện mặt trời áp mái',
      'Tăng hiệu quả chiếu sáng và thông gió',
      'Cải thiện chỉ số ESG cho hệ thống kho'
    ],
    sections: [
      {
        title: 'Kho xanh không chỉ là câu chuyện năng lượng',
        paragraphs: [
          'Một hệ thống kho xanh cần được nhìn tổng thể từ vật liệu xây dựng, năng lượng sử dụng, dòng di chuyển nội bộ cho đến cách quản lý chất thải.',
          'Khi áp dụng đồng bộ, doanh nghiệp vừa tiết kiệm chi phí vừa tăng khả năng đáp ứng các yêu cầu bền vững từ khách hàng quốc tế.'
        ]
      },
      {
        title: 'Các nhóm tiêu chuẩn nên ưu tiên',
        paragraphs: [
          'Doanh nghiệp có thể bắt đầu từ những hạng mục dễ triển khai như đèn LED, cảm biến tiết kiệm điện, mái năng lượng mặt trời và quy trình phân loại rác tại nguồn.'
        ]
      }
    ],
    relatedIds: ['2', '3']
  }
];

export function getAboutNewsArticleById(id: string) {
  return ABOUT_NEWS_ARTICLES.find((article) => article.id === id) ?? null;
}
