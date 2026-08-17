import { FileText, BookOpen, ShieldCheck, Briefcase, Newspaper, CalendarDays } from '@/components/icons';
import { ResourceItem } from './types';

// Updated 6 Tabs configuration matching the screenshot
export const TABS = [
  { id: 'all', label: { vi: 'Tất cả', en: 'All', ja: 'すべて' }, icon: FileText },
  {
    id: 'guide',
    label: { vi: 'Cẩm nang kỹ thuật', en: 'Technical Guides', ja: '技術ガイド' },
    icon: BookOpen
  },
  {
    id: 'standard',
    label: { vi: 'Chứng chỉ chất lượng', en: 'Certificates', ja: '品質認証書' },
    icon: ShieldCheck
  },
  {
    id: 'case-study',
    label: { vi: 'Nghiên cứu điển hình', en: 'Case Studies', ja: 'ケーススタディ' },
    icon: Briefcase
  },
  { id: 'news', label: { vi: 'Tin tức', en: 'News', ja: 'ニュース' }, icon: Newspaper },
  { id: 'event', label: { vi: 'Sự kiện', en: 'Events', ja: 'イベント' }, icon: CalendarDays }
];

export interface EventItem {
  id: string;
  title: { vi: string; en: string; ja: string };
  image: string;
  date: string;
  time: string;
  location: { vi: string; en: string; ja: string };
  link: string;
}

// 12 Mock Resources to display on the main grid (matching the screenshot layout)
export const MOCK_RESOURCES: ResourceItem[] = [
  {
    id: 'RES-001',
    category: 'guide',
    badge: { vi: 'Cẩm nang kỹ thuật', en: 'Technical Guide', ja: '技術ガイド' },
    title: {
      vi: 'Cẩm nang kỹ thuật thiết kế và vận hành phòng sạch - Tập 1',
      en: 'Technical Guide to Cleanroom Design and Operation - Vol. 1',
      ja: 'クリーンルーム設計と運用の技術ガイド - 第1巻'
    },
    description: {
      vi: 'Hướng dẫn chi tiết về cấu trúc màng lọc HEPA, luồng không khí laminar và tiêu chuẩn kiểm soát tiểu phân.',
      en: 'Detailed instructions on HEPA filter configuration, laminar airflow, and particulate control standards.',
      ja: 'HEPAフィルターの構成、層流、および粒子制御規格に関する詳細な説明。'
    },
    date: '20/05/2026',
    image: '/images/industries/electronics_hero.webp',
    industryId: 'electronics',
    topicId: 'cleanroom',
    contentType: 'tech-doc',
    author: {
      name: { vi: 'Nguyễn Minh Anh', en: 'Minh Anh Nguyen', ja: 'グエン・ミン・アイン' },
      role: {
        vi: 'Chuyên gia kỹ thuật – ULink Industries',
        en: 'Technical Expert – ULink Industries',
        ja: '技術専門家 – ULink Industries'
      },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '8 phút đọc', en: '8 min read', ja: '8分で読める' },
    audioDuration: '08:45',
    audioSecs: 525,
    size: '2.5 MB',
    type: 'PDF',
    downloadUrl: '/documents/RES-001.pdf',
    sections: [
      {
        id: 'sec-1',
        num: '1.',
        title: {
          vi: 'Giới thiệu màng lọc HEPA',
          en: 'HEPA Filter Intro',
          ja: 'HEPAフィルターの紹介'
        },
        content: {
          vi: 'Màng lọc HEPA là thành phần cốt lõi của bất kỳ hệ thống phòng sạch nào, giúp giữ lại 99.97% các hạt có kích thước từ 0.3 micromet.',
          en: 'HEPA filter is the core component of any cleanroom system, capturing 99.97% of particles down to 0.3 microns.',
          ja: 'HEPAフィルターは、あらゆるクリーンルームシステムのコアコンポーネントであり、0.3ミクロンまでの粒子の99.97%を捕捉します。'
        }
      }
    ],
    aiSummary: {
      intro: {
        vi: 'Cẩm nang toàn diện về tiêu chuẩn thiết kế phòng sạch.',
        en: 'Comprehensive guide to cleanroom design standards.',
        ja: 'クリーンルーム設計規格の包括的なガイド。'
      },
      bullets: [
        {
          vi: 'Cơ chế lọc không khí HEPA.',
          en: 'HEPA filtration mechanics.',
          ja: 'HEPAフィルターろ過メカニズム。'
        }
      ]
    }
  },
  {
    id: 'RES-002',
    category: 'standard',
    badge: { vi: 'Chứng chỉ chất lượng', en: 'Certificates', ja: '品質認証書' },
    title: {
      vi: 'Chứng nhận chất lượng ISO 9001:2015 & ISO 14001:2015 - ULink',
      en: 'ISO 9001:2015 & ISO 14001:2015 Certifications - ULink',
      ja: 'ISO 9001:2015 & ISO 14001:2015 品質認証書 - ULink'
    },
    description: {
      vi: 'Bản sao hợp pháp hệ thống quản lý chất lượng và quản lý môi trường đạt tiêu chuẩn quốc tế của ULink Industries.',
      en: 'Certified copy of ULink Industries international quality and environmental management systems.',
      ja: 'ULink Industriesの国際的な品質および環境管理システム認証書のコピー。'
    },
    date: '18/05/2026',
    image: '/images/about/iso-9001.webp',
    industryId: 'pharmaceutical',
    topicId: 'cleanroom',
    contentType: 'certificate',
    author: {
      name: { vi: 'ULink QA', en: 'ULink QA', ja: 'ULink 品質保証' },
      role: { vi: 'Ban đảm bảo chất lượng', en: 'Quality Assurance Dept', ja: '品質保証部' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: 'Tải về ngay', en: 'Download now', ja: '今すぐダウンロード' },
    audioDuration: '0',
    audioSecs: 0,
    size: '1.2 MB',
    type: 'PDF',
    downloadUrl: '/documents/RES-002.pdf',
    sections: [],
    aiSummary: {
      intro: {
        vi: 'Chứng nhận ISO chính thức.',
        en: 'Official ISO Certificates.',
        ja: '公式ISO認証書。'
      },
      bullets: []
    }
  },
  {
    id: 'RES-003',
    category: 'case-study',
    badge: { vi: 'Nghiên cứu điển hình', en: 'Case Study', ja: 'ケーススタディ' },
    title: {
      vi: 'Nghiên cứu điển hình phòng sạch: Hệ thống kiểm soát ESD tại nhà máy sản xuất Chip bán dẫn Hà Nam',
      en: 'Cleanroom Case Study: ESD Control System at Ha Nam Semiconductor Plant',
      ja: 'クリーンルーム事例研究：河南省半導体工場におけるESD制御システム'
    },
    description: {
      vi: 'Cách ULink hỗ trợ doanh nghiệp tối ưu hóa trang phục chống tĩnh điện và giảm tỷ lệ lỗi ESD từ 2.4% xuống 0.05%.',
      en: 'How ULink supported the enterprise in optimizing ESD garments and reducing ESD defect rates from 2.4% to 0.05%.',
      ja: 'ULinkがESD衣類の最適化とESD欠陥率の2.4%から0.05%への削減において企業をどのように支援したか。'
    },
    date: '15/05/2026',
    image: '/images/about/quality-lab.webp',
    industryId: 'electronics',
    topicId: 'esd',
    contentType: 'article',
    author: {
      name: { vi: 'Phạm Minh Tuấn', en: 'Minh Tuan Pham', ja: 'ファム・ミン・トゥアン' },
      role: {
        vi: 'Trưởng bộ phận Nghiên cứu ESD',
        en: 'Head of ESD Research',
        ja: 'ESD研究開発部門長'
      },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '10 phút đọc', en: '10 min read', ja: '10分で読める' },
    audioDuration: '10:15',
    audioSecs: 615,
    size: '3.4 MB',
    type: 'PDF',
    downloadUrl: '/documents/RES-003.pdf',
    sections: [
      {
        id: 'sec-1',
        num: '1.',
        title: { vi: 'Bối cảnh dự án', en: 'Project Background', ja: 'プロジェクトの背景' },
        content: {
          vi: 'Nhà máy gặp vấn đề lớn về phóng tĩnh điện làm hư hại các vi mạch nhớ trong quá trình đóng gói.',
          en: 'The factory faced severe ESD problems damaging memory microchips during the packaging process.',
          ja: '工場は、パッケージングプロセス中にメモリマイクロチップを損傷する深刻なESD問題に直面していました。'
        }
      }
    ],
    aiSummary: {
      intro: {
        vi: 'Phân tích thực tế dự án kiểm soát ESD thành công.',
        en: 'Real-world analysis of a successful ESD control project.',
        ja: '成功したESD制御プロジェクトの実世界分析。'
      },
      bullets: [
        {
          vi: 'Giảm tỷ lệ lỗi linh kiện bán dẫn.',
          en: 'Reduced semiconductor defect rate.',
          ja: '半導体欠陥率の低減。'
        }
      ]
    }
  },
  {
    id: 'RES-004',
    category: 'news',
    badge: { vi: 'Tin tức', en: 'News', ja: 'ニュース' },
    title: {
      vi: 'Công bố tiêu chuẩn phòng sạch quốc tế mới nhất năm 2026',
      en: 'Announcement of the Latest International Cleanroom Standards 2026',
      ja: '2026年最新国際クリーンルーム規格の発表'
    },
    description: {
      vi: 'Cập nhật các quy chuẩn kỹ thuật ISO Class 5 và quy trình khử khuẩn bắt buộc cho phòng thí nghiệm y sinh.',
      en: 'Updates on ISO Class 5 technical standards and mandatory sterilization processes for biomedical labs.',
      ja: 'バイオメディカルラボ向けのISOクラス5技術規格および義務的な滅菌プロセスの更新。'
    },
    date: '10/05/2026',
    image: '/images/home/section5/mc-iso-9001-2015.webp',
    industryId: 'pharmaceutical',
    topicId: 'cleanroom',
    contentType: 'article',
    author: {
      name: { vi: 'Trần Thị Lan', en: 'Lan Thi Tran', ja: 'チャン・ティ・ラン' },
      role: { vi: 'Biên tập viên y sinh', en: 'Biomedical Editor', ja: 'バイオメディカル編集者' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '5 phút đọc', en: '5 min read', ja: '5分で読める' },
    audioDuration: '05:40',
    audioSecs: 340,
    size: '1.5 MB',
    type: 'PDF',
    downloadUrl: '/documents/RES-004.pdf',
    sections: [],
    aiSummary: {
      intro: {
        vi: 'Cập nhật tin tức ISO mới nhất.',
        en: 'Latest ISO standards update.',
        ja: '最新のISO規格の更新。'
      },
      bullets: []
    }
  },
  {
    id: 'RES-005',
    category: 'event',
    badge: { vi: 'Sự kiện', en: 'Event', ja: 'イベント' },
    title: {
      vi: 'Hội thảo trực tuyến: Giải pháp vật tư phòng sạch tối ưu cho các nhà máy lắp ráp điện tử Hàn Quốc',
      en: 'Webinar: Optimized Cleanroom Consumables Solutions for Korean Electronics Factories',
      ja: 'ウェビナー：韓国の電子機器工場向けの最適なクリーンルーム消耗品ソリューション'
    },
    description: {
      vi: 'Cơ hội học hỏi kinh nghiệm thực tế cùng các chuyên gia hàng đầu từ ULink và Hiệp hội Thiết bị bán dẫn.',
      en: 'Opportunity to learn practical experience with leading experts from ULink and Semiconductor Association.',
      ja: 'ULinkおよび半導体協会の主要な専門家から実践的な経験を学ぶ機会。'
    },
    date: '08/05/2026',
    image: '/images/about/hero-warehouse.webp',
    industryId: 'electronics',
    topicId: 'cleanroom',
    contentType: 'article',
    author: {
      name: { vi: 'ULink Marketing', en: 'ULink Marketing', ja: 'ULink マーケティング' },
      role: { vi: 'Tổ chức sự kiện', en: 'Event Coordinator', ja: 'イベントコーディネーター' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: 'Đăng ký ngay', en: 'Register now', ja: '今すぐ登録' },
    audioDuration: '0',
    audioSecs: 0,
    size: 'Đại biểu miễn phí',
    type: 'EVENT',
    downloadUrl: '/contact',
    sections: [],
    aiSummary: {
      intro: {
        vi: 'Hội thảo sắp tới về phòng sạch điện tử.',
        en: 'Upcoming semiconductor cleanroom webinar.',
        ja: '次回の半導体クリーンルームウェビナー。'
      },
      bullets: []
    }
  },
  {
    id: 'RES-006',
    category: 'guide',
    badge: { vi: 'Cẩm nang kỹ thuật', en: 'Technical Guide', ja: '技術ガイド' },
    title: {
      vi: 'Cẩm nang lựa chọn và kiểm tra chất lượng găng tay nitrile sạch Class 100',
      en: 'Handbook for Selecting and Testing Class 100 Clean Nitrile Gloves',
      ja: 'クラス100クリーンニトリル手袋の選択と品質検査ハンドブック'
    },
    description: {
      vi: 'Phân tích các chỉ số ion, hạt mịn phát sinh và độ bền kéo của găng tay nitrile chuyên dụng.',
      en: 'Analysis of ionic levels, particulate counts, and tensile strength of professional nitrile gloves.',
      ja: 'プロフェッショナル向けニトリル手袋のイオンレベル、粒子数、および引張強度の分析。'
    },
    date: '05/05/2026',
    image: '/images/illustrations/cleanroom-gloves.png',
    industryId: 'electronics',
    topicId: 'cleanroom',
    contentType: 'tech-doc',
    author: {
      name: { vi: 'Nguyễn Văn An', en: 'An Nguyen', ja: 'アイン・グエン' },
      role: { vi: 'Kỹ sư chất lượng', en: 'QA Engineer', ja: '品質保証エンジニア' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '7 phút đọc', en: '7 min read', ja: '7分で読める' },
    audioDuration: '06:50',
    audioSecs: 410,
    size: '1.9 MB',
    type: 'PDF',
    downloadUrl: '/documents/RES-006.pdf',
    sections: [],
    aiSummary: {
      intro: {
        vi: 'Hướng dẫn lựa chọn găng tay nitrile phòng sạch.',
        en: 'Guide to cleanroom nitrile gloves selection.',
        ja: 'クリーンルーム用ニトリル手袋の選択ガイド。'
      },
      bullets: []
    }
  },
  {
    id: 'RES-007',
    category: 'standard',
    badge: { vi: 'Chứng chỉ chất lượng', en: 'Certificates', ja: '品質認証書' },
    title: {
      vi: 'Quy chuẩn an toàn ESD & Chứng chỉ chống tĩnh điện của ULink',
      en: 'ESD Safety Standards & ULink Anti-Static Certificate',
      ja: 'ESD安全基準 & ULink静電気対策認証書'
    },
    description: {
      vi: 'Tổng hợp chứng nhận từ đơn vị đo lường độc lập cho trang phục, giày dép và vòng đeo cổ tay ESD.',
      en: 'Collection of certificates from independent verification bodies for ESD clothing, footwear, and wrist straps.',
      ja: 'ESD衣類、履物、およびリストストラップに関する独立検査機関による認証書のコレクション。'
    },
    date: '02/05/2026',
    image: '/images/about/quality-lab.webp',
    industryId: 'electronics',
    topicId: 'esd',
    contentType: 'certificate',
    author: {
      name: { vi: 'ULink ESD Team', en: 'ULink ESD Team', ja: 'ULink ESDチーム' },
      role: { vi: 'Bộ phận quản lý ESD', en: 'ESD Management', ja: 'ESD管理部門' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: 'Tải tài liệu', en: 'Download document', ja: '資料をダウンロード' },
    audioDuration: '0',
    audioSecs: 0,
    size: '2.1 MB',
    type: 'PDF',
    downloadUrl: '/documents/RES-007.pdf',
    sections: [],
    aiSummary: {
      intro: {
        vi: 'Tài liệu tiêu chuẩn ESD chính thức.',
        en: 'Official ESD standard documents.',
        ja: '公式ESD規格資料。'
      },
      bullets: []
    }
  },
  {
    id: 'RES-008',
    category: 'case-study',
    badge: { vi: 'Nghiên cứu điển hình', en: 'Case Study', ja: 'ケーススタディ' },
    title: {
      vi: 'Nghiên cứu điển hình: Giải pháp bao bì nhôm màng bọc vô trùng tối ưu cho nhà máy dược phẩm chuẩn GMP-WHO',
      en: 'Case Study: Optimized Sterile Aluminum Packaging Solutions for GMP-WHO Pharmaceutical Plants',
      ja: '事例研究：GMP-WHO医薬品工場向けの最適な無菌アルミ包装ソリューション'
    },
    description: {
      vi: 'Dự án tư vấn thiết kế và cung ứng túi nhôm ngăn ẩm tuyệt đối cho dây chuyền đóng gói thuốc kháng sinh dạng bột.',
      en: 'Consultation and supply project for absolute moisture barrier aluminum bags for antibiotic powder packaging lines.',
      ja: '抗生物質粉末包装ライン向けの完全防湿アルミ袋の設計および供給プロジェクト。'
    },
    date: '28/04/2026',
    image: '/images/home/section2/solution-packaging.webp',
    industryId: 'pharmaceutical',
    topicId: 'packaging',
    contentType: 'article',
    author: {
      name: { vi: 'Dược sĩ Lê Thị Bình', en: 'Pharmacist Binh Le', ja: '薬剤師レ・ティ・ビン' },
      role: {
        vi: 'Chuyên viên kỹ thuật bao bì dược',
        en: 'Pharma Packaging Specialist',
        ja: '医薬品包装専門家'
      },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '9 phút đọc', en: '9 min read', ja: '9分で読める' },
    audioDuration: '09:20',
    audioSecs: 560,
    size: '3.1 MB',
    type: 'PDF',
    downloadUrl: '/documents/RES-008.pdf',
    sections: [],
    aiSummary: {
      intro: {
        vi: 'Giải pháp túi nhôm phòng sạch cho dược phẩm.',
        en: 'Cleanroom aluminum bag solutions for pharma.',
        ja: '医薬品向けのクリーンルームアルミ袋ソリューション。'
      },
      bullets: []
    }
  },
  {
    id: 'RES-009',
    category: 'news',
    badge: { vi: 'Tin tức', en: 'News', ja: 'ニュース' },
    title: {
      vi: 'ULink Industries khánh thành dây chuyền sản xuất túi nhôm phòng sạch chuẩn Class 100 tại Hà Nam',
      en: 'ULink Industries Inaugurates Class 100 Cleanroom Aluminum Bag Production Line in Ha Nam',
      ja: 'ULink Industriesが河南省でクラス100クリーンルーム用アルミ袋生産ラインを落成'
    },
    description: {
      vi: 'Nhà xưởng đạt tiêu chuẩn phòng sạch cao nhất phục vụ cho các tập đoàn linh kiện bán dẫn đa quốc gia tại Việt Nam.',
      en: 'The workshop meets the highest cleanroom standards serving multinational semiconductor corporations in Vietnam.',
      ja: 'ベトナムの多国籍半導体企業にサービスを提供する、最高水準のクリーンルーム規格を満たすワークショップ。'
    },
    date: '25/04/2026',
    image: '/images/about/hero-warehouse.webp',
    industryId: 'electronics',
    topicId: 'packaging',
    contentType: 'article',
    author: {
      name: { vi: 'ULink PR Team', en: 'ULink PR Team', ja: 'ULink PRチーム' },
      role: { vi: 'Truyền thông tập đoàn', en: 'Corporate Communications', ja: 'コーポレート広報' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '4 phút đọc', en: '4 min read', ja: '4分で読める' },
    audioDuration: '04:30',
    audioSecs: 270,
    size: '1.1 MB',
    type: 'PDF',
    downloadUrl: '/documents/RES-009.pdf',
    sections: [],
    aiSummary: {
      intro: {
        vi: 'Sự kiện khánh thành dây chuyền túi nhôm mới.',
        en: 'Inauguration of the new aluminum bag line.',
        ja: '新しいアルミ袋生産ラインの落成イベント。'
      },
      bullets: []
    }
  },
  {
    id: 'RES-010',
    category: 'event',
    badge: { vi: 'Sự kiện', en: 'Event', ja: 'イベント' },
    title: {
      vi: 'Triển lãm và giới thiệu công nghệ đóng gói chống ẩm, chống tĩnh điện 2026 tại Hà Nội',
      en: 'Exhibition and Showcase of Moisture-proof & Anti-static Packaging Technology 2026 in Hanoi',
      ja: '2026年ハノイでの防湿・静電気対策包装技術の展示会およびショーケース'
    },
    description: {
      vi: 'Hội tụ các giải pháp màng phức hợp nhôm, khay định hình ESD và cẩm nang kỹ thuật đóng gói xuất khẩu.',
      en: 'Bringing together aluminum composite film solutions, ESD trays, and export packaging manuals.',
      ja: 'アルミ複合フィルムソリューション、ESDトレイ、および輸出包装マニュアルを一同に集結。'
    },
    date: '20/04/2026',
    image: '/images/about/quality-lab.webp',
    industryId: 'cosmetics',
    topicId: 'packaging',
    contentType: 'article',
    author: {
      name: { vi: 'ULink Events', en: 'ULink Events', ja: 'ULink イベント' },
      role: { vi: 'Điều phối viên', en: 'Coordinator', ja: 'コーディネーター' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: 'Đăng ký tham gia', en: 'Register to attend', ja: '参加登録' },
    audioDuration: '0',
    audioSecs: 0,
    size: 'Miễn phí vé vào',
    type: 'EVENT',
    downloadUrl: '/contact',
    sections: [],
    aiSummary: {
      intro: {
        vi: 'Sự kiện triển lãm bao bì công nghiệp.',
        en: 'Industrial packaging exhibition.',
        ja: '産業用包装展示会イベント。'
      },
      bullets: []
    }
  },
  {
    id: 'RES-011',
    category: 'guide',
    badge: { vi: 'Cẩm nang kỹ thuật', en: 'Technical Guide', ja: '技術ガイド' },
    title: {
      vi: 'Cẩm nang tối ưu hóa chi phí vận hành phòng sạch và giảm hao phí điện năng',
      en: 'Guide to Optimizing Cleanroom Operational Costs and Reducing Energy Waste',
      ja: 'クリーンルーム運営コストの最適化と電力損失の低減ガイド'
    },
    description: {
      vi: 'Các biện pháp điều khiển tốc độ gió thông minh qua hệ thống FFU và tối ưu hóa hệ thống lạnh trung tâm Chiller.',
      en: 'Measures for smart wind speed control via FFU systems and optimization of Chiller central cooling systems.',
      ja: 'FFUシステムを介したスマートな風速制御およびチラー中央冷却システムの最適化対策。'
    },
    date: '15/04/2026',
    image: '/images/industries/electronics_hero.webp',
    industryId: 'electronics',
    topicId: 'cleanroom',
    contentType: 'tech-doc',
    author: {
      name: { vi: 'Vũ Hoàng Nam', en: 'Hoang Nam Vu', ja: 'ヴー・ホアン・ナム' },
      role: {
        vi: 'Kỹ sư HVAC phòng sạch',
        en: 'Cleanroom HVAC Engineer',
        ja: 'クリーンルームHVACエンジニア'
      },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '8 phút đọc', en: '8 min read', ja: '8分で読める' },
    audioDuration: '08:20',
    audioSecs: 500,
    size: '2.3 MB',
    type: 'PDF',
    downloadUrl: '/documents/RES-011.pdf',
    sections: [],
    aiSummary: {
      intro: {
        vi: 'Tối ưu hóa năng lượng phòng sạch.',
        en: 'Optimizing cleanroom energy.',
        ja: 'クリーンルームのエネルギー最適化。'
      },
      bullets: []
    }
  },
  {
    id: 'RES-012',
    category: 'standard',
    badge: { vi: 'Chứng chỉ chất lượng', en: 'Certificates', ja: '品質認証書' },
    title: {
      vi: 'Chứng nhận chất lượng sản phẩm găng tay Nitrile & khẩu trang phòng sạch đạt chuẩn FDA',
      en: 'FDA Quality Certification for Nitrile Gloves & Cleanroom Masks',
      ja: 'ニトリル手袋およびクリーンルーム用マスクのFDA品質認証書'
    },
    description: {
      vi: 'Tài liệu pháp lý chứng nhận độ sạch và độ an toàn sinh học đối với các sản phẩm bảo hộ y tế của ULink.',
      en: 'Legal documentation certifying cleanliness and bio-safety standards for ULink medical protection products.',
      ja: 'ULinkの医療保護製品に関する清浄度およびバイオセーフティ規格を証明する法的文書。'
    },
    date: '10/04/2026',
    image: '/images/home/section5/mc-iso-9001-2015.webp',
    industryId: 'pharmaceutical',
    topicId: 'cleanroom',
    contentType: 'certificate',
    author: {
      name: { vi: 'ULink Regulatory', en: 'ULink Regulatory', ja: 'ULink 規制対応' },
      role: {
        vi: 'Ban tuân thủ pháp lý',
        en: 'Regulatory Compliance',
        ja: '規制コンプライアンス部門'
      },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: 'Tải chứng chỉ', en: 'Download cert', ja: '認証書をダウンロード' },
    audioDuration: '0',
    audioSecs: 0,
    size: '1.4 MB',
    type: 'PDF',
    downloadUrl: '/documents/RES-012.pdf',
    sections: [],
    aiSummary: {
      intro: {
        vi: 'Chứng chỉ FDA chính thức.',
        en: 'Official FDA Certificate.',
        ja: '公式FDA認証書。'
      },
      bullets: []
    }
  },
  {
    id: 'RES-013',
    category: 'case-study',
    badge: { vi: 'Nghiên cứu điển hình', en: 'Case Study', ja: 'ケーススタディ' },
    title: {
      vi: 'Nghiên cứu điển hình: tối ưu đóng gói chống ẩm cho module bán dẫn tại Bắc Ninh',
      en: 'Case Study: Optimizing Moisture-Proof Packaging for Semiconductor Modules in Bac Ninh',
      ja: 'ケーススタディ: バクニンでの半導体モジュール向け防湿包装の最適化'
    },
    description: {
      vi: 'ULink hỗ trợ nhà máy rút ngắn thời gian đóng gói, giảm lỗi hút ẩm và chuẩn hóa quy trình xuất hàng cho khách Nhật Bản.',
      en: 'ULink helped the plant shorten packing time, reduce moisture defects, and standardize export handling for Japanese customers.',
      ja: 'ULink は梱包時間を短縮し、吸湿不良を削減し、日本向け出荷工程を標準化しました。'
    },
    date: '28/03/2026',
    image: '/images/industries/case_packaging.webp',
    industryId: 'electronics',
    topicId: 'packaging',
    contentType: 'article',
    author: {
      name: { vi: 'ULink Supply Chain', en: 'ULink Supply Chain', ja: 'ULink サプライチェーン' },
      role: {
        vi: 'Nhóm giải pháp đóng gói',
        en: 'Packaging Solutions Team',
        ja: '包装ソリューションチーム'
      },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '9 phút đọc', en: '9 min read', ja: '9分で読める' },
    audioDuration: '09:05',
    audioSecs: 545,
    size: '2.9 MB',
    type: 'PDF',
    downloadUrl: '/documents/RES-013.pdf',
    sections: [
      {
        id: 'sec-1',
        num: '1.',
        title: { vi: 'Bối cảnh dự án', en: 'Project Context', ja: 'プロジェクト背景' },
        content: {
          vi: 'Nhà máy cần giảm rủi ro hút ẩm trong khâu đóng gói module trước khi xuất sang thị trường Nhật Bản.',
          en: 'The plant needed to reduce moisture exposure during module packing before export to Japan.',
          ja: '工場は日本向け輸出前のモジュール梱包時における吸湿リスクの低減を必要としていました。'
        }
      }
    ],
    aiSummary: {
      intro: {
        vi: 'Tối ưu quy trình đóng gói cho xuất khẩu.',
        en: 'Optimized export packing workflow.',
        ja: '輸出梱包フローの最適化。'
      },
      bullets: [
        {
          vi: 'Giảm lỗi hút ẩm trong quá trình lưu kho.',
          en: 'Reduced moisture defects during storage.',
          ja: '保管中の吸湿不良を削減。'
        }
      ]
    }
  },
  {
    id: 'RES-014',
    category: 'news',
    badge: { vi: 'Tin tức', en: 'News', ja: 'ニュース' },
    title: {
      vi: 'ULink mở rộng kho trung chuyển phòng sạch với hệ thống truy xuất mã vạch tại Bắc Ninh',
      en: 'ULink Expands Cleanroom Transit Warehouse with Barcode Traceability in Bac Ninh',
      ja: 'ULink、バクニンでバーコード追跡付きクリーンルーム中継倉庫を拡張'
    },
    description: {
      vi: 'Khu trung chuyển mới giúp đồng bộ nhập xuất, giảm thời gian xử lý đơn và tăng độ chính xác tồn kho cho khách công nghiệp.',
      en: 'The new transit hub synchronizes inbound and outbound handling, shortens order processing, and improves inventory accuracy for industrial clients.',
      ja: '新しい中継拠点は入出庫を同期し、受注処理を短縮して、産業顧客向けの在庫精度を高めます。'
    },
    date: '18/03/2026',
    image: '/images/about/warehouse-terminal.png',
    industryId: 'electronics',
    topicId: 'packaging',
    contentType: 'article',
    author: {
      name: { vi: 'ULink PR Team', en: 'ULink PR Team', ja: 'ULink PRチーム' },
      role: { vi: 'Truyền thông tập đoàn', en: 'Corporate Communications', ja: 'コーポレート広報' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '4 phút đọc', en: '4 min read', ja: '4分で読める' },
    audioDuration: '04:05',
    audioSecs: 245,
    size: '1.2 MB',
    type: 'PDF',
    downloadUrl: '/documents/RES-014.pdf',
    sections: [],
    aiSummary: {
      intro: {
        vi: 'Tin mở rộng kho trung chuyển mới.',
        en: 'News on the new transit warehouse.',
        ja: '新しい中継倉庫のニュース。'
      },
      bullets: []
    }
  },
  {
    id: 'RES-015',
    category: 'event',
    badge: { vi: 'Sự kiện', en: 'Event', ja: 'イベント' },
    title: {
      vi: 'Workshop trực tuyến: chọn vật tư phòng sạch phù hợp cho dây chuyền xuất khẩu 2026',
      en: 'Online Workshop: Selecting the Right Cleanroom Consumables for 2026 Export Lines',
      ja: 'オンラインワークショップ: 2026年輸出ライン向けクリーンルーム消耗品の選定'
    },
    description: {
      vi: 'Buổi workshop chia sẻ cách chọn găng tay, khẩu trang và vật tư đóng gói để giữ ổn định chất lượng khi xuất khẩu.',
      en: 'This workshop shares how to choose gloves, masks, and packaging consumables to keep export quality stable.',
      ja: 'このワークショップでは、輸出品質を安定させるための手袋・マスク・包装消耗品の選び方を紹介します。'
    },
    date: '12/03/2026',
    image: '/images/home/section2/solution-cleanroom.webp',
    industryId: 'electronics',
    topicId: 'cleanroom',
    contentType: 'article',
    author: {
      name: { vi: 'ULink Events', en: 'ULink Events', ja: 'ULink イベント' },
      role: { vi: 'Điều phối viên', en: 'Coordinator', ja: 'コーディネーター' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: 'Đăng ký tham gia', en: 'Register to attend', ja: '参加登録' },
    audioDuration: '0',
    audioSecs: 0,
    size: 'Miễn phí tham dự',
    type: 'EVENT',
    downloadUrl: '/contact',
    sections: [],
    aiSummary: {
      intro: {
        vi: 'Workshop về vật tư phòng sạch.',
        en: 'Workshop on cleanroom consumables.',
        ja: 'クリーンルーム消耗品のワークショップ。'
      },
      bullets: []
    }
  }
];

// Most Viewed Articles (horizontal list of 3 cards)
export const MOST_VIEWED_ARTICLES: ResourceItem[] = [
  {
    id: 'MV-001',
    category: 'guide',
    badge: { vi: 'Cẩm nang kỹ thuật', en: 'Technical Guide', ja: '技術ガイド' },
    title: {
      vi: 'Hướng dẫn thiết lập phòng sạch đạt chuẩn GMP cho các cơ sở y tế',
      en: 'Guide to Setting Up GMP Compliant Cleanrooms for Medical Facilities',
      ja: '医療施設向けのGMP準拠クリーンルームのセットアップガイド'
    },
    description: {
      vi: 'Quy trình chi tiết từ thiết kế sơ đồ, chọn thiết bị lọc và kiểm soát vi sinh vật lơ lửng.',
      en: 'Detailed process from layout design, selecting filtration equipment, and controlling suspended microorganisms.',
      ja: 'レイアウト設計、ろ過装置の選択、および浮遊微生物の制御までの詳細なプロセス。'
    },
    date: '12/04/2026',
    image: '/images/about/quality-lab.webp',
    industryId: 'pharmaceutical',
    topicId: 'cleanroom',
    contentType: 'tech-doc',
    author: {
      name: { vi: 'TS. Nguyễn Văn An', en: 'Dr. An Nguyen', ja: 'グエン・バン・アン博士' },
      role: { vi: 'Chuyên gia vi sinh', en: 'Microbiology Expert', ja: '微生物学専門家' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '7 phút đọc', en: '7 min read', ja: '7分で読める' },
    audioDuration: '07:30',
    audioSecs: 450,
    size: '2.0 MB',
    type: 'PDF',
    downloadUrl: '/documents/MV-001.pdf',
    sections: [],
    aiSummary: { intro: { vi: '', en: '', ja: '' }, bullets: [] }
  },
  {
    id: 'MV-002',
    category: 'standard',
    badge: { vi: 'Chứng chỉ chất lượng', en: 'Certificates', ja: '品質認証書' },
    title: {
      vi: 'Phương pháp kiểm thử và phân loại tiêu chuẩn phòng sạch ISO 14644-1',
      en: 'Testing and Classification Methods for ISO 14644-1 Cleanrooms',
      ja: 'ISO 14644-1クリーンルームのテストおよび分類方法'
    },
    description: {
      vi: 'Cách đo đạc số lượng bụi mịn và phân tích mẫu không khí theo đúng quy định quốc tế.',
      en: 'How to measure particulate counts and analyze air samples according to international regulations.',
      ja: '国際規制に従って粒子数を測定し、空気サンプルを分析する方法。'
    },
    date: '08/04/2026',
    image: '/images/home/section5/mc-iso-9001-2015.webp',
    industryId: 'electronics',
    topicId: 'cleanroom',
    contentType: 'certificate',
    author: {
      name: { vi: 'Vũ Hoàng Nam', en: 'Hoang Nam Vu', ja: 'ヴー・ホアン・ナム' },
      role: { vi: 'Kỹ sư đo lường', en: 'Calibration Engineer', ja: '校正エンジニア' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '5 phút đọc', en: '5 min read', ja: '5分で読める' },
    audioDuration: '05:10',
    audioSecs: 310,
    size: '1.7 MB',
    type: 'PDF',
    downloadUrl: '/documents/MV-002.pdf',
    sections: [],
    aiSummary: { intro: { vi: '', en: '', ja: '' }, bullets: [] }
  },
  {
    id: 'MV-003',
    category: 'case-study',
    badge: { vi: 'Nghiên cứu điển hình', en: 'Case Study', ja: 'ケーススタディ' },
    title: {
      vi: 'Giải pháp đóng gói chống ẩm và ESD cho xuất khẩu linh kiện điện tử tinh vi',
      en: 'Moisture-proof & ESD Packaging Solutions for Sensitive Electronics Export',
      ja: '精密電子部品輸出向けの防湿・ESDパッケージングソリューション'
    },
    description: {
      vi: 'Quy trình chọn màng phức hợp nhôm và túi hút chân không ESD của tập đoàn ULink.',
      en: 'The process of selecting aluminum composite film and ESD vacuum bags of ULink corporation.',
      ja: 'ULinkグループのアルミ複合フィルムおよびESD真空袋の選択プロセス。'
    },
    date: '04/04/2026',
    image: '/images/home/section2/solution-packaging.webp',
    industryId: 'electronics',
    topicId: 'esd',
    contentType: 'article',
    author: {
      name: { vi: 'Lee Sang Min', en: 'Sang Min Lee', ja: 'イ・サンミン' },
      role: { vi: 'Chuyên gia ESD', en: 'ESD Expert', ja: 'ESD専門家' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '8 phút đọc', en: '8 min read', ja: '8分で読める' },
    audioDuration: '08:15',
    audioSecs: 495,
    size: '2.8 MB',
    type: 'PDF',
    downloadUrl: '/documents/MV-003.pdf',
    sections: [],
    aiSummary: { intro: { vi: '', en: '', ja: '' }, bullets: [] }
  }
];

// Upcoming Events Mock Data
export const UPCOMING_EVENTS: EventItem[] = [
  {
    id: 'EV-001',
    title: {
      vi: 'Hội thảo khoa học quốc tế: Công nghệ kiểm soát ô nhiễm phòng sạch bán dẫn thế hệ mới',
      en: 'International Scientific Conference: Next-Gen Semiconductor Cleanroom Contamination Control',
      ja: '国際科学会議：次世代半導体クリーンルーム汚染管理技術'
    },
    image: '/images/about/quality-lab.webp',
    date: '15/09/2026',
    time: '09:00 - 11:30',
    location: {
      vi: 'Phòng họp trực tuyến Zoom & Hội trường ULink Hà Nam',
      en: 'Zoom Online Meeting & ULink Ha Nam Hall',
      ja: 'Zoomオンライン会議 & ULink河南省ホール'
    },
    link: '/events/ev-001/register'
  },
  {
    id: 'EV-002',
    title: {
      vi: 'Hội nghị khách hàng và Triển lãm bao bì ESD cao cấp trong chuỗi cung ứng linh kiện điện tử',
      en: 'Customer Conference & Premium ESD Packaging Exhibition in Electronics Supply Chain',
      ja: '電子機器サプライチェーンにおける顧客会議およびプレミアムESDパッケージング展示会'
    },
    image: '/images/about/hero-warehouse.webp',
    date: '22/09/2026',
    time: '14:00 - 16:30',
    location: {
      vi: 'Khách sạn Crowne Plaza, Số 36 Lê Đức Thọ, Hà Nội',
      en: 'Crowne Plaza Hotel, 36 Le Duc Tho, Hanoi',
      ja: 'クラウンプラザホテル、36レ・ドゥック・ト、ハノイ'
    },
    link: '/events/ev-002/register'
  },
  {
    id: 'EV-003',
    title: {
      vi: 'Đào tạo kỹ thuật chuyên sâu: Thực hành Gowning và Đo đạc chất lượng phòng sạch chuẩn ISO 14644',
      en: 'Advanced Technical Training: Gowning Practice & ISO 14644 Cleanroom Calibration',
      ja: '高度な技術トレーニング：ガウニングの実践 & ISO 14644クリーンルームキャリブレーション'
    },
    image: '/images/home/section2/solution-packaging.webp',
    date: '05/10/2026',
    time: '08:30 - 17:00',
    location: {
      vi: 'Văn phòng đại diện ULink, Quận 1, TP. Hồ Chí Minh',
      en: 'ULink Representative Office, District 1, HCMC',
      ja: 'ULink代表事務所、1区、ホーチミン市'
    },
    link: '/events/ev-003/register'
  }
];

// Popular Articles (Sidebar)
export const POPULAR_ARTICLES = [
  {
    id: 'pop-1',
    number: '01',
    title: {
      vi: 'ISO 14644-1:2015 – Tiêu chuẩn phòng sạch mới nhất',
      en: 'ISO 14644-1:2015 – The Latest Cleanroom Standard',
      ja: 'ISO 14644-1:2015 – 最新のクリーンルーム規格'
    }
  },
  {
    id: 'pop-2',
    number: '02',
    title: {
      vi: 'Găng tay nitrile và latex: Loại nào phù hợp với bạn?',
      en: 'Nitrile vs Latex Gloves: Which is Right for You?',
      ja: 'ニトリル手袋対ラテックス手袋：どちらが適していますか？'
    }
  },
  {
    id: 'pop-3',
    number: '03',
    title: {
      vi: '5 yếu tố ảnh hưởng đến hiệu quả của phòng sạch',
      en: '5 Factors Affecting Cleanroom Efficiency',
      ja: 'クリーンルームの効率に影響を与える5つの要因'
    }
  },
  {
    id: 'pop-4',
    number: '04',
    title: {
      vi: 'Hướng dẫn lựa chọn vật liệu phòng sạch phù hợp',
      en: 'Guide to Selecting the Right Cleanroom Materials',
      ja: '適切なクリーンルーム資材の選択ガイド'
    }
  },
  {
    id: 'pop-5',
    number: '05',
    title: {
      vi: 'Xu thái công nghệ phòng sạch năm 2025',
      en: 'Cleanroom Technology Trends in 2025',
      ja: '2025年のクリーンルーム技術動向'
    }
  }
];
