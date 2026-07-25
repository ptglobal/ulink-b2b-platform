import {
  FileText,
  Star,
  Package,
  BookOpen,
  ShieldCheck,
  Briefcase,
  Newspaper
} from 'lucide-react';
import { ResourceItem } from './types';

// 7 Tabs configuration
export const TABS = [
  { id: 'all', label: { vi: 'Tất cả bài viết', en: 'All Articles', ja: 'すべての記事' }, icon: FileText },
  { id: 'industry', label: { vi: 'Chuyên ngành', en: 'Industries', ja: '専門分野' }, icon: Star },
  { id: 'product', label: { vi: 'Sản phẩm', en: 'Products', ja: '製品' }, icon: Package },
  { id: 'guide', label: { vi: 'Hướng dẫn kĩ thuật', en: 'Technical Guides', ja: '技術ガイド' }, icon: BookOpen },
  { id: 'standard', label: { vi: 'Tiêu chuẩn & Quy định', en: 'Standards & Regs', ja: '規格・規制' }, icon: ShieldCheck },
  { id: 'case-study', label: { vi: 'Case Study', en: 'Case Studies', ja: 'ケーススタディ' }, icon: Briefcase },
  { id: 'news', label: { vi: 'Tin tức', en: 'News', ja: 'ニュース' }, icon: Newspaper },
];

// Industry filter mapping (bilingual)
export const INDUSTRIES = [
  { id: 'electronics', name: { vi: 'Điện tử', en: 'Electronics', ja: '電子' } },
  { id: 'pharmaceutical', name: { vi: 'Dược phẩm', en: 'Pharmaceuticals', ja: '医薬品' } },
  { id: 'cosmetics', name: { vi: 'Mỹ phẩm', en: 'Cosmetics', ja: '化粧品' } },
  { id: 'food', name: { vi: 'Thực phẩm', en: 'Food & Beverage', ja: '食品' } },
];

// Topic filter mapping (bilingual)
export const TOPICS = [
  { id: 'cleanroom', name: { vi: 'Phòng sạch', en: 'Cleanroom', ja: 'クリーンルーム' } },
  { id: 'packaging', name: { vi: 'Đóng gói', en: 'Packaging', ja: '包装' } },
  { id: 'esd', name: { vi: 'Chống tĩnh điện (ESD)', en: 'ESD Control', ja: '静電気対策' } },
];

// Content Type filter mapping (bilingual)
export const CONTENT_TYPES = [
  { id: 'article', name: { vi: 'Bài viết', en: 'Article', ja: '記事' } },
  { id: 'tech-doc', name: { vi: 'Tài liệu kỹ thuật', en: 'Technical Doc', ja: '技術文書' } },
  { id: 'certificate', name: { vi: 'Chứng chỉ', en: 'Certificate', ja: '認証' } },
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
      vi: 'Xu hướng công nghệ phòng sạch năm 2025',
      en: 'Cleanroom Technology Trends in 2025',
      ja: '2025年のクリーンルーム技術動向'
    }
  }
];

// Mock Articles matching the high-fidelity UI design
export const MOCK_RESOURCES: ResourceItem[] = [
  {
    id: 'ART-001',
    category: 'industry',
    badge: { vi: 'Chuyên ngành', en: 'Industry', ja: '専門分野' },
    title: {
      vi: 'Tầm quan trọng của phòng sạch trong sản xuất bán dẫn hiện đại',
      en: 'The Importance of Cleanrooms in Modern Semiconductor Manufacturing',
      ja: '現代の半導体製造におけるクリーンルームの重要性'
    },
    description: {
      vi: 'Tìm hiểu vai trò của phòng sạch trong việc kiểm soát ô nhiễm, đảm bảo độ tin cậy và nâng cao năng suất trong ngành bán dẫn.',
      en: 'Learn about the role of cleanrooms in contamination control, ensuring reliability, and improving yield in the semiconductor industry.',
      ja: '半導体産業における汚染管理、信頼性確保、歩留まり向上におけるクリーンルーム의 역할について説明します。'
    },
    date: '20/05/2026',
    image: '/images/industries/electronics_hero.webp',
    industryId: 'electronics',
    topicId: 'cleanroom',
    contentType: 'article',
    author: {
      name: { vi: 'Nguyễn Minh Anh', en: 'Minh Anh Nguyen', ja: 'グエン・ミン・アイン' },
      role: { vi: 'Chuyên gia kỹ thuật – ULink Industries', en: 'Technical Expert – ULink Industries', ja: '技術専門家 – ULink Industries' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '8 phút đọc', en: '8 min read', ja: '8分で読める' },
    audioDuration: '08:45',
    audioSecs: 525,
    size: '1.8 MB',
    type: 'PDF',
    downloadUrl: '/documents/ART-001.pdf',
    sections: [
      {
        id: 'sec-1',
        num: '1.',
        title: { vi: 'Phòng sạch là gì?', en: 'What is a Cleanroom?', ja: 'クリーンルームとは？' },
        content: {
          vi: 'Phòng sạch (Cleanroom) là không gian được thiết kế đặc biệt để kiểm soát các hạt bụi, vi khuẩn, hơi hóa chất và các tác nhân gây ô nhiễm khác trong không khí. Mục tiêu là duy trì môi trường đạt tiêu chuẩn về độ sạch, nhiệt độ, độ ẩm và áp suất, phục vụ cho các quy trình sản xuất yêu cầu độ chính xác và độ tin cậy cao.',
          en: 'A cleanroom is a specially designed space controlled to limit airborne particles, bacteria, chemical vapors, and other contaminants. The goal is to maintain standards of cleanliness, temperature, humidity, and pressure for precision-demanding production.',
          ja: 'クリーンルームとは、浮遊粒子、細菌、化学物質の蒸気、およびその他の汚染物質を制限するために制御された特別に設計された空間です。目的は、高精度な製造に必要な清浄 độ, 温度, 湿度, および圧力의 規格を維持することです。'
        },
        alertText: {
          vi: 'Trong ngành bán dẫn, chỉ một hạt bụi có kích thước nhỏ hơn 0.1µm cũng có thể gây lỗi cho chip, ảnh hưởng nghiêm trọng đến chất lượng sản phẩm.',
          en: 'In the semiconductor industry, a single particle smaller than 0.1µm can cause chip defects, severely impacting product quality.',
          ja: '半導体産業では、0.1µm未満의 단일의 粒子であってもチップの欠陥を引き起こし、製品の品質に深刻な影響を与える可能性があります。'
        }
      },
      {
        id: 'sec-2',
        num: '2.',
        title: {
          vi: 'Vai trò của phòng sạch trong sản xuất bán dẫn',
          en: 'Role of Cleanrooms in Semiconductor Manufacturing',
          ja: '半導体製造におけるクリーンルームの役割'
        },
        content: {
          vi: 'Sản xuất bán dẫn là một quy trình cực kỳ nhạy cảm với môi trường. Phòng sạch đóng vai trò then chốt trong việc kiểm soát các hạt bụi siêu mịn bám dính trên bề mặt Silicon Wafer trong quá trình quang khắc. Bất kỳ sự ô nhiễm nào cũng có thể làm đứt gãy hoặc ngắn mạch các đường dẫn điện cực siêu vi mô, làm giảm tỷ lệ yield và tăng chi phí phế phẩm.',
          en: 'Semiconductor manufacturing is extremely environment-sensitive. Cleanrooms play a key role in controlling ultra-fine dust on silicon wafer surfaces during photolithography. Any contamination can break or short-circuit microscale electrical lines, reducing yield and increasing scrap costs.',
          ja: '半導体製造は環境に対して非常に敏感です。クリーンルームは、フォトリソグラフィー中のシリコンウェーハ表面の超微細な塵埃を制御する上で重要な役割を果たします。いかなる汚染も微細な電気配線の断線や短絡を引き起こし、歩留まりを低下させ、スクラップコストを増加させる可能性があります。'
        }
      },
      {
        id: 'sec-3',
        num: '3.',
        title: { vi: 'Các cấp độ phòng sạch phổ biến', en: 'Common Cleanroom Classifications', ja: '一般的なクリーンルームの分類' },
        content: {
          vi: 'Dựa trên tiêu chuẩn quốc tế ISO 14644-1, phòng sạch được phân cấp từ ISO Class 1 (sạch nhất) đến ISO Class 9. Trong công nghiệp bán dẫn, các công đoạn cốt lõi như sản xuất wafer đòi hỏi môi trường ISO Class 3 hoặc ISO Class 4. Công đoạn lắp ráp và đóng gói chip sau đó có thể được vận hành trong điều kiện phòng sạch ISO Class 5 hoặc ISO Class 6.',
          en: 'Based on the ISO 14644-1 standard, cleanrooms are classified from ISO Class 1 (cleanest) to ISO Class 9. Core processes like wafer fabrication require ISO Class 3 or 4. Later chip assembly and packaging processes can operate within ISO Class 5 or 6 environments.',
          ja: 'ISO 14644-1規格に基づいて、クリーンルームはISOクラス1（最も清潔）からISOクラス9に分類されます。ウェーハ製造などのコアプロセスにはISOクラス3または4が必要です。その後のチップ組み立ておよびパッケージングプロセスは、ISOクラス5または6の環境で動作できます。'
        }
      },
      {
        id: 'sec-4',
        num: '4.',
        title: { vi: 'Yếu tố ảnh hưởng đến hiệu quả phòng sạch', en: 'Factors Influencing Cleanroom Efficiency', ja: 'クリーンルームの効率に影響を与える要因' },
        content: {
          vi: 'Hiệu quả kiểm soát ô nhiễm của phòng sạch phụ thuộc vào ba trụ cột: hệ thống lọc không khí HEPA/ULPA hiệu suất cao, duy trì chênh lệch áp suất dương để chặn luồng khí bẩn bên ngoài, và đặc biệt là trang phục bảo hộ của nhân viên (ESD Coveralls, Găng tay nitrile sạch, Mũ trùm, Khẩu trang) cùng thói quen làm việc tuân thủ quy trình gowning.',
          en: 'Cleanroom contamination control relies on three pillars: high-efficiency HEPA/ULPA air filters, positive differential pressure to block outside air, and personnel protective wear (ESD Coveralls, clean Nitrile gloves, Hoods, Masks) alongside strict gowning protocols.',
          ja: 'クリーンルームの汚染管理は、3つの柱に基づいています：高効率のHEPA/ULPAエアフィルター、外部の空気を遮断するための陽圧差圧、および作業服（ESDカバーオール、清潔なニトリル手袋、フード、マスク）と厳格な更衣手順。'
        }
      },
      {
        id: 'sec-5',
        num: '5.',
        title: {
          vi: 'Giải pháp tối ưu phòng sạch của ULink Industries',
          en: 'ULink Industries Optimized Cleanroom Solutions',
          ja: 'ULink Industriesの最適化されたクリーンルームソリューション'
        },
        content: {
          vi: 'ULink Industries cung cấp dải giải pháp vật tư phòng sạch toàn diện, đáp ứng các tiêu chuẩn khắt khe nhất của ngành bán dẫn thế giới. Chúng tôi mang đến các sản phẩm khăn lau phòng sạch Polyester 100% không xơ, găng tay Nitrile siêu sạch Class 100, thảm dính bụi nhiều lớp và bộ trang phục chống tĩnh điện ESD Coverall chất lượng bền bỉ.',
          en: 'ULink Industries provides a comprehensive range of cleanroom supplies meeting strict semiconductor standards. We offer 100% polyester lint-free wipers, Class 100 clean Nitrile gloves, multilayer sticky mats, and durable ESD Coveralls.',
          ja: 'ULink Industriesは、厳格な半導体規格を満たすクリーンルーム用消耗品の包括的な製品群を提供しています。100%ポリエステル製の発塵のないワイパー、クラス100の清潔なニトリル手袋、多層粘着マット、および耐久性のあるESDカバーオールを提供しています。'
        }
      },
      {
        id: 'sec-6',
        num: '6.',
        title: { vi: 'Kết luận', en: 'Conclusion', ja: '結論' },
        content: {
          vi: 'Việc đầu tư thiết kế và duy trì vận hành phòng sạch chuẩn hóa chính là chìa khóa vàng giúp các nhà máy bán dẫn hiện đại nâng cao tỷ lệ yield sản xuất, giảm thiểu hao hụt tài chính và khẳng định vị thế uy tín trên chuỗi cung ứng toàn cầu.',
          en: 'Investing in and maintaining standardized cleanrooms is the golden key for modern semiconductor factories to boost yield rates, minimize financial losses, and solidify their reputation in the global supply chain.',
          ja: '標準化されたクリーンルームへの投資と維持は、現代の半導体工場が歩留まり率を向上させ、財務上の損失を最小限に抑え、グローバルサプライチェーンにおける信頼性を確固たるものにするための鍵です。'
        }
      }
    ],
    aiSummary: {
      intro: {
        vi: 'Phòng sạch đóng vai trò thiết yếu trong sản xuất bán dẫn bằng cách kiểm soát ô nhiễm hạt và vi sinh, đảm bảo độ tin cậy của chip và nâng cao hiệu suất sản xuất.',
        en: 'Cleanrooms play a vital role in semiconductor manufacturing by controlling particulate and microbiological contamination, ensuring chip reliability, and boosting production performance.',
        ja: 'クリーンルームは、粒子および微生物の汚染を制御し、チップの信頼性を確保し、製造パフォーマンスを向上させることにより、半導体製造において不可欠な役割を果たします。'
      },
      bullets: [
        {
          vi: 'Phòng sạch giúp loại bỏ hạt bụi và vi khuẩn – nguyên nhân chính gây lỗi sản phẩm.',
          en: 'Cleanrooms help eliminate dust particles and bacteria - the main cause of product defects.',
          ja: 'クリーンルームは、製品欠陥の主な原因である塵埃粒子や細菌の排除に役立ちます。'
        },
        {
          vi: 'Các cấp độ phòng sạch (ISO 1 đến ISO 9) được thiết kế cho từng công đoạn sản xuất khác nhau.',
          en: 'Cleanroom levels (ISO 1 to ISO 9) are designed for different production stages.',
          ja: 'クリーンルームのレベル（ISO 1からISO 9）は、さまざまな製造段階向けに設計されています。'
        },
        {
          vi: 'Kiểm soát hiệu quả các yếu tố như nhiệt độ, độ ẩm, áp suất và luồng khí là yếu tố quyết định.',
          en: 'Effective control of elements like temperature, humidity, pressure, and airflow is crucial.',
          ja: '温度、湿度、圧力、および気流などの要素の効果的な制御が重要です。'
        },
        {
          vi: 'ULink Industries cung cấp giải pháp phòng sạch toàn diện, đáp ứng tiêu chuẩn quốc tế.',
          en: 'ULink Industries provides comprehensive cleanroom solutions meeting international standards.',
          ja: 'ULink Industriesは、国際規格を満たす包括的なクリーンルームソリューションを提供します。'
        }
      ]
    }
  },
  {
    id: 'ART-002',
    category: 'guide',
    badge: { vi: 'Hướng dẫn kỹ thuật', en: 'Technical Guide', ja: '技術ガイド' },
    title: {
      vi: 'Hướng dẫn vệ sinh và khử trùng phòng sạch đúng cách',
      en: 'Guide to Proper Cleanroom Cleaning and Disinfection',
      ja: '適切なクリーンルームの清掃 & 消毒のガイド'
    },
    description: {
      vi: 'Quy trình vệ sinh phòng sạch chuẩn giúp duy trì môi trường kiểm soát và giảm thiểu rủi ro ô nhiễm chéo.',
      en: 'Standard cleanroom cleaning procedures help maintain controlled environments and minimize cross-contamination risks.',
      ja: '標準的なクリーンルーム清掃手順は、管理された environment を維持し、交差汚染のリスクを最小限に抑えるのに役立ちます。'
    },
    date: '18/05/2026',
    image: '/images/home/product-wipes.jpg',
    industryId: 'pharmaceutical',
    topicId: 'cleanroom',
    contentType: 'tech-doc',
    author: {
      name: { vi: 'TS. Nguyễn Văn An', en: 'Dr. An Nguyen', ja: 'グエン・バン・アン博士' },
      role: { vi: 'Chuyên gia vi sinh học – ULink R&D', en: 'Microbiology Specialist – ULink R&D', ja: '微生物学専門家 – ULink R&D' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '6 phút đọc', en: '6 min read', ja: '6分で読める' },
    audioDuration: '06:12',
    audioSecs: 372,
    size: '2.4 MB',
    type: 'PDF',
    downloadUrl: '/documents/ART-002.pdf',
    sections: [
      {
        id: 'sec-1',
        num: '1.',
        title: { vi: 'Tầm quan trọng của việc vệ sinh', en: 'Importance of Cleaning', ja: '清掃の重要性' },
        content: {
          vi: 'Vệ sinh phòng sạch đòi hỏi các nguyên tắc ngặt nghèo để tránh nhiễm bẩn ngược lại.',
          en: 'Cleanroom cleaning demands strict principles to avoid reverse contamination.',
          ja: 'クリーンルームの清掃は、逆汚染を避けるために厳格な原則を要求します。'
        }
      }
    ],
    aiSummary: {
      intro: {
        vi: 'Hướng dẫn các bước thực tế và lựa chọn hóa chất tẩy rửa chuẩn để làm sạch không gian phòng sạch.',
        en: 'Guides practical steps and standard chemical choices to clean cleanroom environments.',
        ja: 'クリーンルーム環境を清掃するための実践的なステップと標準的な化学物質の選択を案内します。'
      },
      bullets: [
        {
          vi: 'Luôn lau một chiều từ trên xuống dưới, từ trong ra ngoài.',
          en: 'Always wipe unidirectionally from top to bottom, inside to out.',
          ja: '常に上から下、内から外へと一方向に拭きます。'
        }
      ]
    }
  },
  {
    id: 'ART-003',
    category: 'product',
    badge: { vi: 'Sản phẩm', en: 'Product', ja: '製品' },
    title: {
      vi: 'Găng tay nitrile phòng sạch: Tiêu chuẩn và ứng dụng',
      en: 'Cleanroom Nitrile Gloves: Standards and Applications',
      ja: 'クリーンルーム用ニトリル手袋：規格 và 用途'
    },
    description: {
      vi: 'Khám phá các tiêu chí quan trọng và ứng dụng thực tế của găng tay nitrile trong nhiều ngành công nghiệp.',
      en: 'Explore important criteria and practical applications of nitrile gloves across multiple industries.',
      ja: '複数の産業におけるニトリル手袋の重要な基準と実用的な用途を探ります。'
    },
    date: '16/05/2026',
    image: '/images/home/product-gloves.jpg',
    industryId: 'electronics',
    topicId: 'cleanroom',
    contentType: 'article',
    author: {
      name: { vi: 'Phạm Văn Hùng', en: 'Hung Van Pham', ja: 'ファム・ヴァン・フン' },
      role: { vi: 'Kỹ sư vật liệu – ULink R&D', en: 'Materials Engineer – ULink R&D', ja: '材料エンジニア – ULink R&D' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '5 phút đọc', en: '5 min read', ja: '5分で読める' },
    audioDuration: '05:30',
    audioSecs: 330,
    size: '1.2 MB',
    type: 'PDF',
    downloadUrl: '/documents/ART-003.pdf',
    sections: [
      {
        id: 'sec-1',
        num: '1.',
        title: { vi: 'Tại sao chọn Nitrile?', en: 'Why Choose Nitrile?', ja: 'ngăn ngừa dị ứng nitrile?' },
        content: {
          vi: 'Nitrile có khả năng kháng đâm thủng tốt và không gây dị ứng da tay như cao su tự nhiên.',
          en: 'Nitrile offers great puncture resistance and avoids latex allergy risks.',
          ja: 'ニトリルは優れた穿刺耐性を提供し、ラテックスアレルギーのリスクを回避します。'
        }
      }
    ],
    aiSummary: {
      intro: {
        vi: 'Khám phá lý do găng tay nitrile được ưa chuộng rộng rãi trong công nghiệp bán dẫn.',
        en: 'Explores why nitrile gloves are widely preferred in the semiconductor industry.',
        ja: 'ニトリル手袋が半導体産業で広く好まれる理由を探ります。'
      },
      bullets: [
        {
          vi: 'Độ đàn hồi tốt và khả năng bám dính cao.',
          en: 'Excellent elasticity and high grip performance.',
          ja: '優れた弾力性と高いグリップ性能。'
        }
      ]
    }
  },
  {
    id: 'ART-004',
    category: 'standard',
    badge: { vi: 'Tiêu chuẩn', en: 'Standard', ja: '規格' },
    title: {
      vi: 'Tiêu chuẩn phòng sạch GMP trong sản xuất Dược phẩm',
      en: 'GMP Cleanroom Standards in Pharmaceutical Manufacturing',
      ja: '医薬品製造におけるGMPクリーンルーム規格'
    },
    description: {
      vi: 'Tìm hiểu các nguyên tắc thiết kế và vận hành phòng sạch đáp ứng tiêu chuẩn GMP WHO trong sản xuất dược phẩm.',
      en: 'Learn about the design and operational principles of cleanrooms meeting GMP WHO standards in pharmaceutical manufacturing.',
      ja: '医薬品製造におけるGMP WHO規格を満たすクリーンルームの設計および運用原則について説明します。'
    },
    date: '15/05/2026',
    image: '/images/home/product-wipes.jpg',
    industryId: 'pharmaceutical',
    topicId: 'cleanroom',
    contentType: 'certificate',
    author: {
      name: { vi: 'Trần Thị Lan', en: 'Lan Thi Tran', ja: 'チャン・ティ・ラン' },
      role: { vi: 'Trưởng phòng Đảm bảo Chất lượng QA', en: 'QA Director', ja: '品質保証(QA)部長' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '7 phút đọc', en: '7 min read', ja: '7分で読める' },
    audioDuration: '07:15',
    audioSecs: 435,
    size: '2.1 MB',
    type: 'PDF',
    downloadUrl: '/documents/ART-004.pdf',
    sections: [
      {
        id: 'sec-1',
        num: '1.',
        title: { vi: 'Tiêu chuẩn GMP trong phòng sạch', en: 'GMP Standards in Cleanrooms', ja: 'クリーンルームにおけるGMP規格' },
        content: {
          vi: 'Hệ thống phòng sạch dược phẩm phải kiểm soát nghiêm ngặt cả nồng độ hạt bụi và số lượng vi sinh vật trong không khí nhằm loại bỏ hoàn toàn nguy cơ nhiễm chéo.',
          en: 'Pharmaceutical cleanrooms must strictly control both particle concentrations and viable microorganisms to prevent cross-contamination.',
          ja: '医薬品クリーンルームは、交差汚染を防止するために、粒子濃度と生存微生物の両方を厳密に制御する必要があります。'
        }
      }
    ],
    aiSummary: {
      intro: {
        vi: 'Hướng dẫn toàn diện về thiết kế và vận hành phòng sạch dược phẩm đáp ứng các cấp độ sạch A, B, C, D theo tiêu chuẩn GMP.',
        en: 'Comprehensive guide to designing and operating pharmaceutical cleanrooms meeting cleanliness grades A, B, C, D under GMP.',
        ja: 'GMPに基づく清浄度グレードA、B、C、Dを満たす医薬品クリーンルーム của 設計と運用の包括的なガイド。'
      },
      bullets: [
        {
          vi: 'Kiểm soát chặt chẽ vi sinh vật và tiểu phân bụi lơ lửng.',
          en: 'Strict control of microorganisms and airborne particulates.',
          ja: '微生物および空気中の粒子の厳格な制御。'
        }
      ]
    }
  },
  {
    id: 'ART-005',
    category: 'case-study',
    badge: { vi: 'Case Study', en: 'Case Study', ja: 'ケーススタディ' },
    title: {
      vi: 'Giải pháp tối ưu màng bọc chống tĩnh điện ESD cho tập đoàn linh kiện Hàn Quốc',
      en: 'Optimizing ESD Shielding Packaging for a Korean Electronics Conglomerate',
      ja: '韓国の電子部品グループ向けのESDシールドパッケージの最適化'
    },
    description: {
      vi: 'Chi tiết dự án thiết kế bao bì chống tĩnh điện chuyên dụng giúp giảm tỷ lệ lỗi hỏng linh kiện trong quá trình vận chuyển xuống dưới 0.1%.',
      en: 'Detailed project on custom ESD packaging design that helped reduce component defect rate during transport to below 0.1%.',
      ja: '輸送中の部品欠陥率を0.1%未満に抑えるのに役立った、カスタムESDパッケージング設計に関する詳細なプロジェクト。'
    },
    date: '10/05/2026',
    image: '/images/home/product-gloves.jpg',
    industryId: 'electronics',
    topicId: 'esd',
    contentType: 'article',
    author: {
      name: { vi: 'Lee Sang Min', en: 'Sang Min Lee', ja: 'イ・サンミン' },
      role: { vi: 'Chuyên gia Tư vấn Giải pháp – ULink Korea', en: 'Solutions Advisor – ULink Korea', ja: 'ソリューションアドバイザー – ULink Korea' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '9 phút đọc', en: '9 min read', ja: '9分で読める' },
    audioDuration: '09:30',
    audioSecs: 570,
    size: '3.2 MB',
    type: 'PDF',
    downloadUrl: '/documents/ART-005.pdf',
    sections: [
      {
        id: 'sec-1',
        num: '1.',
        title: { vi: 'Thách thức về phóng tĩnh điện', en: 'The Threat of Electrostatic Discharge', ja: '静電気放電の脅威' },
        content: {
          vi: 'Linh kiện bán dẫn rất nhạy cảm với phóng tĩnh điện (ESD). Một dòng điện cực nhỏ vài Volt cũng có thể phá hủy hoàn toàn cấu trúc mạch silic bên trong.',
          en: 'Semiconductor components are highly sensitive to ESD. A tiny discharge of just a few Volts can destroy the internal silicon circuitry.',
          ja: '半導体部品はESDに対して非常に敏感です。わずか数ボルトの小さな放電でも、内部のシリコン回路を破壊する可能性があります。'
        }
      }
    ],
    aiSummary: {
      intro: {
        vi: 'Nghiên cứu dự án ứng dụng túi chắn điện từ (Shielding Bags) và khay nhựa ESD của ULink giúp giảm thiểu rủi ro vận chuyển.',
        en: 'Case study on applying ULink electromagnetic shielding bags and ESD plastic trays to minimize transport risks.',
        ja: '輸送リスクを最小限に抑えるためのULink電磁シールドバッグおよびESDプラスチックトレイの適用に関するケーススタディ。'
      },
      bullets: [
        {
          vi: 'Giảm đáng kể tỷ lệ hư hỏng sản phẩm trong chuỗi cung ứng linh kiện bán dẫn.',
          en: 'Significantly reduced product damage rates in the semiconductor supply chain.',
          ja: '半導体サプライチェーンにおける製品損傷率の大幅な削減。'
        }
      ]
    }
  },
  {
    id: 'ART-006',
    category: 'news',
    badge: { vi: 'Tin tức', en: 'News', ja: 'ニュース' },
    title: {
      vi: 'ULink ra mắt dòng sản phẩm túi nhôm đóng gói phòng sạch chuẩn Class 100',
      en: 'ULink Launches Class 100 Cleanroom Aluminum Packaging Bags',
      ja: 'ULinkがクラス100クリーンルーム用アルミ包装袋の製品ラインを発売'
    },
    description: {
      vi: 'Dòng sản phẩm túi nhôm thế hệ mới với khả năng chống ẩm vượt trội, không phát sinh xơ bụi bụi bẩn, chuyên dùng cho đóng gói dược phẩm và thực phẩm cao cấp.',
      en: 'Next-generation aluminum bags with outstanding moisture barrier, zero lint, specialized for packaging pharmaceuticals and high-end food products.',
      ja: '優れた防湿性、発塵ゼロを備え、医薬品や高級食品の包装に特化した次世代アルミ袋製品ライン。'
    },
    date: '05/05/2026',
    image: '/images/home/product-wipes.jpg',
    industryId: 'food',
    topicId: 'packaging',
    contentType: 'article',
    author: {
      name: { vi: 'Phạm Minh Tuấn', en: 'Minh Tuan Pham', ja: 'ファム・ミン・トゥアン' },
      role: { vi: 'Giám đốc Phát triển Sản phẩm – ULink', en: 'Product Development Director – ULink', ja: '製品開発ディレクター – ULink' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '4 phút đọc', en: '4 min read', ja: '4分で読める' },
    audioDuration: '04:10',
    audioSecs: 250,
    size: '1.0 MB',
    type: 'PDF',
    downloadUrl: '/documents/ART-006.pdf',
    sections: [
      {
        id: 'sec-1',
        num: '1.',
        title: { vi: 'Độ sạch tối ưu cho bao bì thực phẩm & dược phẩm', en: 'Optimal Cleanliness for Food & Pharma Packaging', ja: '食品・医薬品包装における最適な清潔度' },
        content: {
          vi: 'Túi nhôm phòng sạch Class 100 được sản xuất trong môi trường vô trùng khép kín, được kiểm tra nghiêm ngặt về chỉ số bụi và độ ẩm trước khi xuất xưởng.',
          en: 'Class 100 cleanroom aluminum bags are manufactured in a closed sterile environment, strictly checked for dust and moisture indices before shipping.',
          ja: 'クラス100クリーンルーム用アルミ袋は、密閉された無菌環境で製造され、出荷前にほこりや湿度の指数が厳格にチェックされます。'
        }
      }
    ],
    aiSummary: {
      intro: {
        vi: 'ULink chính thức giới thiệu giải pháp bao bì bảo vệ toàn diện chống oxy hóa và ẩm mốc cho các ứng dụng công nghiệp nhạy cảm.',
        en: 'ULink officially introduces a comprehensive packaging solution protecting against oxidation and moisture for sensitive industrial apps.',
        ja: 'ULinkは、敏感な産業用アプリケーション向けに、酸化や湿気から保護する包括的なパッケージングソリューションを公式に導入します。'
      },
      bullets: [
        {
          vi: 'Khả năng ngăn ẩm, ngăn không khí và cản ánh sáng tối đa.',
          en: 'Maximum moisture barrier, air barrier, and light blocking capability.',
          ja: '最大の防湿、空気遮断、および遮光機能。'
        }
      ]
    }
  },
  {
    id: 'ART-007',
    category: 'industry',
    badge: { vi: 'Chuyên ngành', en: 'Industry', ja: '専門分野' },
    title: {
      vi: 'Quy chuẩn đóng gói phòng sạch trong ngành Mỹ phẩm cao cấp',
      en: 'Cleanroom Packaging Standards in Premium Cosmetics Industry',
      ja: '高級化粧品産業におけるクリーンルーム包装規格'
    },
    description: {
      vi: 'Làm thế nào để duy trì độ vô trùng và hạn chế nhiễm khuẩn tối đa cho các sản phẩm mỹ phẩm organic thông qua bao bì phòng sạch chuyên dụng.',
      en: 'How to maintain sterility and maximize bacterial control for organic cosmetics using dedicated cleanroom packaging.',
      ja: '専用のクリーンルーム包装を使用して、オーガニック化粧品製品の無菌性を維持し、細菌管理を最大化する方法。'
    },
    date: '01/05/2026',
    image: '/images/industries/electronics_hero.webp',
    industryId: 'cosmetics',
    topicId: 'packaging',
    contentType: 'tech-doc',
    author: {
      name: { vi: 'Nguyễn Thị Mai', en: 'Mai Thi Nguyen', ja: 'グエン・ティ・マイ' },
      role: { vi: 'Chuyên gia phát triển công thức – ULink Beauty', en: 'Formulation Expert – ULink Beauty', ja: '処方専門家 – ULink Beauty' },
      avatar: '/images/about/op-team.webp'
    },
    readTime: { vi: '6 phút đọc', en: '6 min read', ja: '6分で読める' },
    audioDuration: '06:40',
    audioSecs: 400,
    size: '1.5 MB',
    type: 'PDF',
    downloadUrl: '/documents/ART-007.pdf',
    sections: [
      {
        id: 'sec-1',
        num: '1.',
        title: { vi: 'Yêu cầu kiểm soát nhiễm khuẩn', en: 'Bacterial Contamination Control Requirements', ja: '細菌汚染管理要件' },
        content: {
          vi: 'Các sản phẩm mỹ phẩm tự nhiên không chứa chất bảo quan nhân tạo rất dễ bị ô nhiễm vi sinh. Việc đóng gói trong phòng sạch chuẩn Class 1000 giúp giữ trọn vẹn chất lượng mỹ phẩm.',
          en: 'Natural cosmetics without artificial preservatives are highly prone to microbial contamination. Packaging in Class 1000 cleanrooms keeps cosmetic quality intact.',
          ja: '人工保存料を含まないナチュラル化粧品は、微生物汚染が発生しやすいです。クラス1000クリーンルームでの包装は、化粧品の品質をそのまま維持します。'
        }
      }
    ],
    aiSummary: {
      intro: {
        vi: 'Bài viết phân tích tầm quan trọng của bao bì phòng sạch vô trùng và kỹ thuật gowning của nhân sự đóng gói mỹ phẩm organic.',
        en: 'The article analyzes the importance of sterile cleanroom packaging and gowning techniques of organic cosmetics packaging staff.',
        ja: 'この記事では、無菌クリーンルーム包装の重要性と、オーガニック化粧品包装スタッフの更衣技術について分析しています。'
      },
      bullets: [
        {
          vi: 'Đóng gói trong môi trường vô trùng giúp kéo dài thời gian sử dụng tự nhiên của mỹ phẩm.',
          en: 'Packaging in a sterile environment extends the natural shelf life of cosmetics.',
          ja: '無菌環境での包装は、化粧品の自然な貯蔵寿命を延ばします。'
        }
      ]
    }
  }
];
