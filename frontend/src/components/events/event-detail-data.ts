export type EventDetailSection = {
  time: string;
  title: string;
  description: string;
};

export type EventSpeaker = {
  name: string;
  title: string;
  company: string;
  bio: string;
};

export type EventDetail = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  time: string;
  location: string;
  registrationStatus: string;
  overview: string;
  highlights: string[];
  agenda: EventDetailSection[];
  speakers: EventSpeaker[];
  benefits: string[];
  organizer: {
    name: string;
    description: string;
    contact: string;
  };
};

const EVENT_DETAILS: Record<string, EventDetail> = {
  'ev-001': {
    slug: 'ev-001',
    title: 'Hội thảo khoa học quốc tế: Công nghệ kiểm soát ô nhiễm phòng sạch bán dẫn thế hệ mới',
    summary:
      'Chương trình cập nhật các công nghệ kiểm soát ô nhiễm mới, quy trình vận hành và các bài học triển khai thực tế từ nhà máy bán dẫn.',
    image: '/images/about/quality-lab.webp',
    date: '15/09/2026',
    time: '09:00 - 11:30',
    location: 'Phòng họp trực tuyến Zoom & Hội trường ULink Hà Nam',
    registrationStatus: 'Đăng ký sẽ mở sớm',
    overview:
      'Hội thảo tập trung vào cách kiểm soát ô nhiễm, tối ưu môi trường sạch và chuẩn hóa vận hành cho các dây chuyền bán dẫn và điện tử chính xác.',
    highlights: [
      'Cập nhật xu hướng phòng sạch bán dẫn 2026',
      'Phân tích lỗi ô nhiễm thường gặp trong vận hành thực tế',
      'Thảo luận giải pháp phù hợp với nhà máy FDI',
      'Kết nối trực tiếp với đội ngũ kỹ thuật ULink'
    ],
    agenda: [
      {
        time: '08:30 - 09:00',
        title: 'Đón khách và check-in',
        description: 'Đăng ký tham dự, nhận tài liệu và kết nối nhanh với ban tổ chức.'
      },
      {
        time: '09:00 - 09:40',
        title: 'Xu hướng kiểm soát ô nhiễm phòng sạch 2026',
        description: 'Cập nhật các thay đổi nổi bật trong tiêu chuẩn và thực hành vận hành.'
      },
      {
        time: '09:40 - 10:20',
        title: 'Vật tư tiêu hao trong dây chuyền bán dẫn',
        description: 'Vai trò của vật tư phòng sạch, ESD và quy trình kiểm soát rủi ro.'
      },
      {
        time: '10:20 - 11:00',
        title: 'Q&A cùng chuyên gia',
        description: 'Trao đổi tình huống thực tế từ nhà máy và tối ưu cách triển khai.'
      },
      {
        time: '11:00 - 11:30',
        title: 'Kết nối doanh nghiệp',
        description: 'Gặp gỡ trực tiếp đội ngũ ULink và thảo luận nhu cầu dự án.'
      }
    ],
    speakers: [
      {
        name: 'TS. Nguyễn Minh Anh',
        title: 'Giám đốc kỹ thuật',
        company: 'ULink Industries',
        bio: 'Phụ trách định hướng công nghệ phòng sạch và giải pháp kiểm soát ô nhiễm cho khách hàng FDI.'
      },
      {
        name: 'Ông Lê Quang Huy',
        title: 'Chuyên gia vận hành nhà máy',
        company: 'Semiconductor Alliance Vietnam',
        bio: 'Có kinh nghiệm triển khai kiểm soát rủi ro ô nhiễm và tối ưu lưu trình trong nhà máy bán dẫn.'
      },
      {
        name: 'Bà Trần Thị Mai',
        title: 'Trưởng bộ phận QA',
        company: 'ULink Industries',
        bio: 'Phụ trách tiêu chuẩn chất lượng, truy xuất vật tư và đánh giá tuân thủ hệ thống phòng sạch.'
      }
    ],
    benefits: [
      'Cập nhật tiêu chuẩn và xu hướng mới nhất của ngành phòng sạch bán dẫn',
      'Nhận tài liệu tóm tắt sự kiện từ đội ngũ kỹ thuật ULink',
      'Trao đổi trực tiếp với chuyên gia và đặt câu hỏi theo bối cảnh nhà máy',
      'Kết nối với các doanh nghiệp cùng ngành và nhà cung cấp giải pháp'
    ],
    organizer: {
      name: 'ULink Industries',
      description:
        'Đơn vị tổ chức chương trình cùng đối tác ngành bán dẫn và phòng sạch, tập trung vào chia sẻ thực tiễn triển khai.',
      contact: 'contact@ulinkindustries.com'
    }
  },
  'ev-002': {
    slug: 'ev-002',
    title:
      'Hội nghị khách hàng và Triển lãm bao bì ESD cao cấp trong chuỗi cung ứng linh kiện điện tử',
    summary:
      'Sự kiện dành cho khách hàng điện tử với nội dung về cấu hình bao bì ESD, demo vật tư và chia sẻ case thực tế từ nhà máy.',
    image: '/images/about/hero-warehouse.webp',
    date: '22/09/2026',
    time: '14:00 - 16:30',
    location: 'Khách sạn Crowne Plaza, Số 36 Lê Đức Thọ, Hà Nội',
    registrationStatus: 'Đăng ký sẽ mở sớm',
    overview:
      'Chương trình chia sẻ cách thiết kế gói bao bì ESD đúng chuẩn, giảm lỗi vận chuyển và tối ưu hiệu quả chi phí cho chuỗi cung ứng điện tử.',
    highlights: [
      'Hiểu cách chọn bao bì ESD theo từng loại linh kiện',
      'Xem demo vật tư và cấu hình đóng gói thực tế',
      'Trao đổi trực tiếp với đội ngũ kỹ thuật ULink',
      'Kết nối với các bộ phận mua hàng và QA/QC'
    ],
    agenda: [
      {
        time: '13:30 - 14:00',
        title: 'Đón khách và check-in',
        description: 'Nhận tài liệu, name tag và thông tin khu trưng bày.'
      },
      {
        time: '14:00 - 14:35',
        title: 'Chiến lược bao bì ESD cho chuỗi cung ứng điện tử',
        description: 'Phân tích các lỗi thường gặp và cách thiết kế gói đóng gói chuẩn xuất khẩu.'
      },
      {
        time: '14:35 - 15:15',
        title: 'Demo vật tư và case thực tế',
        description: 'Trình bày các cấu hình bao bì chống tĩnh điện đang dùng tại nhà máy.'
      },
      {
        time: '15:15 - 15:45',
        title: 'Giao lưu, hỏi đáp',
        description: 'Giải đáp tình huống kỹ thuật và nhu cầu tùy chỉnh của doanh nghiệp.'
      }
    ],
    speakers: [
      {
        name: 'Ông Phạm Quốc Nam',
        title: 'Giám đốc chuỗi cung ứng',
        company: 'ULink Industries',
        bio: 'Phụ trách các giải pháp đóng gói, lưu kho và vận chuyển cho ngành điện tử.'
      },
      {
        name: 'Bà Nguyễn Thảo Vy',
        title: 'Chuyên gia vật tư ESD',
        company: 'ULink Industries',
        bio: 'Nghiên cứu và triển khai các dòng bao bì chống tĩnh điện, chống ẩm và tối ưu chi phí.'
      }
    ],
    benefits: [
      'Nắm được cách chọn bao bì ESD đúng cho từng loại linh kiện',
      'Nhận bảng tham khảo cấu hình gói đóng gói phổ biến',
      'Trao đổi với đội ngũ kỹ thuật về bài toán xuất khẩu',
      'Xem demo trực tiếp vật tư và vật liệu đóng gói'
    ],
    organizer: {
      name: 'ULink Industries',
      description:
        'Sự kiện dành cho khách hàng điện tử, tập trung vào giải pháp bao bì ESD và tối ưu chuỗi cung ứng.',
      contact: 'contact@ulinkindustries.com'
    }
  },
  'ev-003': {
    slug: 'ev-003',
    title: 'Workshop trực tuyến: chọn vật tư phòng sạch phù hợp cho dây chuyền xuất khẩu 2026',
    summary:
      'Workshop thực chiến về cách chọn găng tay, khẩu trang, khăn lau và vật tư đóng gói cho dây chuyền xuất khẩu.',
    image: '/images/home/section2/solution-packaging.webp',
    date: '05/10/2026',
    time: '08:30 - 17:00',
    location: 'Văn phòng đại diện ULink, Quận 1, TP. Hồ Chí Minh',
    registrationStatus: 'Đăng ký sẽ mở sớm',
    overview:
      'Workshop chia sẻ cách chọn vật tư phòng sạch theo từng công đoạn sản xuất để giữ ổn định chất lượng đầu ra và giảm lỗi trong chuỗi xuất khẩu.',
    highlights: [
      'Nắm được quy trình chọn vật tư theo từng công đoạn',
      'Nhận checklist dùng trong xưởng và kho xuất hàng',
      'Hỏi đáp trực tiếp với chuyên gia ứng dụng',
      'Kết nối với các bộ phận mua hàng và QA/QC'
    ],
    agenda: [
      {
        time: '08:00 - 08:30',
        title: 'Đón khách và giới thiệu chương trình',
        description: 'Tổng quan nội dung workshop và mục tiêu ứng dụng thực tế.'
      },
      {
        time: '08:30 - 09:20',
        title: 'Chọn vật tư phòng sạch cho dải xuất khẩu',
        description: 'Cách chọn găng tay, khẩu trang, khăn lau và bao bì theo nhu cầu nhà máy.'
      },
      {
        time: '09:20 - 10:00',
        title: 'Bài học từ các dây chuyền thực tế',
        description: 'Chia sẻ các case triển khai và lỗi phổ biến khi chọn sai vật tư.'
      },
      {
        time: '10:00 - 10:30',
        title: 'Q&A',
        description: 'Trao đổi trực tiếp với đội ngũ ULink về bài toán vật tư phòng sạch.'
      }
    ],
    speakers: [
      {
        name: 'Ông Trần Văn Đức',
        title: 'Trưởng nhóm kỹ thuật',
        company: 'ULink Industries',
        bio: 'Phụ trách đào tạo và tư vấn giải pháp vật tư phòng sạch cho khách hàng xuất khẩu.'
      },
      {
        name: 'Bà Lê Thu Hằng',
        title: 'Chuyên gia ứng dụng',
        company: 'ULink Industries',
        bio: 'Có kinh nghiệm tư vấn cấu hình vật tư cho sản xuất điện tử và logistics.'
      }
    ],
    benefits: [
      'Biết cách chọn vật tư đúng cho từng công đoạn',
      'Có checklist áp dụng cho nhà máy và kho xuất hàng',
      'Trao đổi trực tiếp với chuyên gia ứng dụng',
      'Kết nối với bộ phận mua hàng và QA/QC'
    ],
    organizer: {
      name: 'ULink Industries',
      description: 'Workshop thực chiến về lựa chọn vật tư phòng sạch cho dây chuyền xuất khẩu.',
      contact: 'contact@ulinkindustries.com'
    }
  }
};

export function getEventDetailBySlug(slug: string) {
  return EVENT_DETAILS[slug.toLowerCase()] ?? null;
}

export function getEventRegisterLink(slug: string) {
  return `/events/${slug.toLowerCase()}/register`;
}
