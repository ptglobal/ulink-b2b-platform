import { createItem, readItems, updateItem, updateSingleton } from '@directus/sdk';
import { createDirectusClient, loginAdmin } from '../lib/config.mjs';
import { createEnsureHelpers } from '../lib/ensure-helpers.mjs';
import { COLLECTION_DEFS } from '../schema/collections.mjs';

const client = createDirectusClient();
const helpers = createEnsureHelpers(client);

const commonMedia = {
  hero: {
    path: '/images/home/section1/HomeBanner.webp',
    role: 'homepage.hero.cleanroom-production'
  },
  materials: {
    path: '/images/brand/ulink-material-system-v2.webp',
    role: 'homepage.materials.catalog-system'
  },
  about: {
    path: '/images/home/section4/companyu.webp',
    role: 'homepage.about.hanam-factory'
  },
  cleanroomProduct: {
    path: '/images/home/section2/product-cut-gloves.webp',
    role: 'homepage.products.cleanroom-protection'
  },
  customPackaging: {
    path: '/images/home/section2/product-custom-pkg.webp',
    role: 'homepage.products.custom-packaging'
  },
  hvacProduct: {
    path: '/images/home/section2/product-hvac-tape.webp',
    role: 'homepage.products.hvac-material'
  }
};

const contentByLocale = {
  vi: {
    version: 2,
    hero: {
      kicker: 'Mạng lưới cung ứng công nghiệp ULink',
      title: 'Chuẩn hóa mua sắm vật tư cho toàn bộ nhà máy',
      description:
        'Từ yêu cầu kỹ thuật đến SKU, báo giá và giao hàng: ULink kết nối danh mục vật tư phòng sạch, bao bì công nghiệp và năng lực đáp ứng vùng trong một quy trình có thể kiểm soát.',
      primaryAction: { label: 'Tạo yêu cầu báo giá', href: '/quick-order' },
      secondaryAction: { label: 'Khám phá danh mục', href: '/products' },
      assurance: 'Đội ngũ kỹ thuật xác minh yêu cầu trước khi chốt mã hàng và phương án cung ứng.',
      image: {
        ...commonMedia.hero,
        alt: 'Chuyên viên ULink kiểm tra vật tư trong trung tâm phân phối công nghiệp'
      }
    },
    journey: {
      title: 'Một quy trình mua sắm có thể theo dõi',
      description: 'Bốn điểm kiểm soát giúp đội mua hàng đi từ nhu cầu đến kế hoạch giao nhận rõ ràng.',
      items: [
        { icon: 'document', label: '01', title: 'Chuẩn hóa yêu cầu', description: 'Ghi nhận tiêu chuẩn, môi trường sử dụng, quy cách đóng gói và sản lượng.', href: '/quick-order', action: 'Tạo yêu cầu' },
        { icon: 'catalog', label: '02', title: 'Đối chiếu SKU', description: 'So sánh thuộc tính kỹ thuật, tài liệu và lựa chọn thay thế phù hợp.', href: '/products', action: 'Xem danh mục' },
        { icon: 'quote', label: '03', title: 'Báo giá có bằng chứng', description: 'Gắn giá, thời gian phản hồi và điều kiện thương mại với đúng dòng hàng.', href: '/rfqs', action: 'Theo dõi RFQ' },
        { icon: 'delivery', label: '04', title: 'Điều phối giao hàng', description: 'Kết nối hub, lịch giao, chứng từ và trạng thái thực hiện.', href: '/regional-hubs', action: 'Xem mạng lưới' }
      ]
    },
    materials: {
      title: 'Danh mục vật tư theo ngữ cảnh vận hành',
      description: 'Tổ chức theo yêu cầu phòng sạch, kiểm soát tĩnh điện, bảo vệ sản phẩm và đóng gói vận chuyển.',
      image: {
        ...commonMedia.materials,
        alt: 'Hệ vật tư phòng sạch và bao bì công nghiệp được phân nhóm theo công năng'
      },
      groups: [
        { title: 'Vật tư phòng sạch', description: 'Găng tay, trang phục, khăn lau, khẩu trang, thảm dính bụi và vật tư ESD.', href: '/solutions/categories/cleanroom-consumables' },
        { title: 'Bao bì công nghiệp', description: 'Màng PE, túi chống tĩnh điện, khay, vật liệu chống ẩm và giải pháp đóng gói theo quy cách.', href: '/solutions/categories/industrial-packaging' }
      ]
    },
    proof: {
      title: 'Năng lực cung ứng được đo bằng cam kết vận hành',
      description: 'Các chỉ số tập trung vào tốc độ phản hồi, kiểm soát hồ sơ và khả năng phục vụ nhà máy.',
      items: [
        { value: '24h', label: 'mốc phản hồi RFQ mục tiêu', detail: 'Khi yêu cầu đủ dữ liệu kỹ thuật' },
        { value: '06', label: 'cụm ngành trọng tâm', detail: 'Điện tử, y tế, thực phẩm, logistics, gỗ, HVAC' },
        { value: '03', label: 'tầng kiểm soát đơn hàng', detail: 'SKU · Chứng từ · Giao nhận' },
        { value: 'ISO', label: 'hồ sơ tuân thủ', detail: 'CO/CQ · SDS · RoHS · REACH' }
      ]
    },
    governance: {
      title: 'Kiểm soát cung ứng từ mã hàng đến giao nhận',
      description: 'Mỗi yêu cầu được nối với hồ sơ kỹ thuật, điều kiện thương mại và năng lực đáp ứng vùng.',
      items: [
        { title: 'Danh mục và hồ sơ kỹ thuật', description: 'Mỗi SKU được đối chiếu thuộc tính, tiêu chuẩn và tài liệu trước khi đề xuất.', href: '/products' },
        { title: 'Nhu cầu và báo giá', description: 'RFQ, hàng mẫu và điều kiện thương mại được theo dõi theo từng yêu cầu.', href: '/quick-order' },
        { title: 'Năng lực vùng', description: 'Hub, khu công nghiệp, SLA và đội phụ trách được nối vào kế hoạch giao hàng.', href: '/regional-hubs' }
      ]
    },
    cta: {
      title: 'Bắt đầu từ yêu cầu kỹ thuật thực tế',
      description: 'Gửi mã hàng hiện có, tiêu chuẩn cần đáp ứng hoặc mô tả môi trường sử dụng. ULink sẽ đưa yêu cầu về đúng nhóm xử lý.',
      primaryAction: { label: 'Tạo RFQ', href: '/quick-order' },
      secondaryAction: { label: 'Trao đổi với ULink', href: '/contact' }
    }
  },
  en: {
    version: 2,
    hero: {
      kicker: 'ULink industrial supply network',
      title: 'Standardize material procurement across every plant',
      description: 'From technical requirement to SKU, quotation, and delivery, ULink connects cleanroom supplies, industrial packaging, and regional fulfillment in one controlled process.',
      primaryAction: { label: 'Create a request for quote', href: '/quick-order' },
      secondaryAction: { label: 'Explore the catalog', href: '/products' },
      assurance: 'Our technical team validates requirements before confirming the item code and supply plan.',
      image: { ...commonMedia.hero, alt: 'ULink specialist inspecting materials in an industrial distribution center' }
    },
    journey: {
      title: 'A procurement process you can trace',
      description: 'Four control points take a buying team from need to a clear fulfillment plan.',
      items: [
        { icon: 'document', label: '01', title: 'Normalize the requirement', description: 'Capture standards, use environment, packaging format, and demand.', href: '/quick-order', action: 'Create request' },
        { icon: 'catalog', label: '02', title: 'Match the SKU', description: 'Compare technical attributes, documents, and acceptable alternatives.', href: '/products', action: 'View catalog' },
        { icon: 'quote', label: '03', title: 'Quote with evidence', description: 'Attach price, response timing, and commercial terms to the correct line.', href: '/rfqs', action: 'Track RFQs' },
        { icon: 'delivery', label: '04', title: 'Coordinate delivery', description: 'Connect hub, schedule, documents, and execution status.', href: '/regional-hubs', action: 'View network' }
      ]
    },
    materials: {
      title: 'Materials organized around operating context',
      description: 'Structured for cleanroom control, electrostatic protection, product protection, and transport packaging.',
      image: { ...commonMedia.materials, alt: 'Cleanroom and industrial packaging materials grouped by function' },
      groups: [
        { title: 'Cleanroom supplies', description: 'Gloves, garments, wipers, masks, sticky mats, and ESD consumables.', href: '/solutions/categories/cleanroom-consumables' },
        { title: 'Industrial packaging', description: 'PE film, antistatic bags, trays, moisture barriers, and made-to-spec packaging.', href: '/solutions/categories/industrial-packaging' }
      ]
    },
    proof: {
      title: 'Supply capability measured by operating commitments',
      description: 'The metrics focus on response speed, document control, and plant-level fulfillment.',
      items: [
        { value: '24h', label: 'target RFQ response', detail: 'For technically complete requests' },
        { value: '06', label: 'priority industry clusters', detail: 'Electronics, health, food, logistics, wood, HVAC' },
        { value: '03', label: 'order control layers', detail: 'SKU · Documents · Delivery' },
        { value: 'ISO', label: 'compliance records', detail: 'CO/CQ · SDS · RoHS · REACH' }
      ]
    },
    governance: {
      title: 'Supply control from item code to delivery',
      description: 'Every request connects technical records, commercial terms, and regional fulfillment capacity.',
      items: [
        { title: 'Catalog and technical records', description: 'Each SKU is checked against attributes, standards, and documents before recommendation.', href: '/products' },
        { title: 'Demand and quotations', description: 'RFQs, sample requests, and commercial terms remain traceable by request.', href: '/quick-order' },
        { title: 'Regional capability', description: 'Hubs, industrial zones, SLAs, and account teams connect to the delivery plan.', href: '/regional-hubs' }
      ]
    },
    cta: {
      title: 'Start with the real technical requirement',
      description: 'Send an existing item code, required standard, or operating context. ULink will route it to the right team.',
      primaryAction: { label: 'Create RFQ', href: '/quick-order' },
      secondaryAction: { label: 'Talk to ULink', href: '/contact' }
    }
  },
  ja: {
    version: 2,
    hero: {
      kicker: 'ULink 産業資材調達ネットワーク',
      title: '工場全体の資材調達を標準化',
      description: '技術要件から SKU、見積、納品まで。ULink はクリーンルーム資材、産業包装、地域配送能力を一つの管理可能なプロセスで結びます。',
      primaryAction: { label: '見積依頼を作成', href: '/quick-order' },
      secondaryAction: { label: 'カタログを見る', href: '/products' },
      assurance: '技術チームが品番と供給計画を確定する前に要件を確認します。',
      image: { ...commonMedia.hero, alt: '産業物流センターで資材を検査する ULink 担当者' }
    },
    journey: {
      title: '追跡できる調達プロセス',
      description: '4つの管理ポイントで、要求から明確な納品計画までをつなぎます。',
      items: [
        { icon: 'document', label: '01', title: '要件を標準化', description: '規格、使用環境、包装仕様、需要量を記録します。', href: '/quick-order', action: '依頼を作成' },
        { icon: 'catalog', label: '02', title: 'SKU を照合', description: '技術属性、資料、代替候補を比較します。', href: '/products', action: 'カタログを見る' },
        { icon: 'quote', label: '03', title: '根拠付き見積', description: '価格、回答時間、取引条件を正しい明細に紐づけます。', href: '/rfqs', action: 'RFQ を追跡' },
        { icon: 'delivery', label: '04', title: '納品を調整', description: '拠点、日程、書類、実行状況を接続します。', href: '/regional-hubs', action: 'ネットワークを見る' }
      ]
    },
    materials: {
      title: '運用環境に沿って整理された資材',
      description: 'クリーンルーム管理、静電気対策、製品保護、輸送包装に対応します。',
      image: { ...commonMedia.materials, alt: '機能別に分類されたクリーンルーム資材と産業包装材' },
      groups: [
        { title: 'クリーンルーム資材', description: '手袋、ウェア、ワイパー、マスク、粘着マット、ESD 消耗品。', href: '/solutions/categories/cleanroom-consumables' },
        { title: '産業包装', description: 'PE フィルム、帯電防止袋、トレー、防湿材、特注包装。', href: '/solutions/categories/industrial-packaging' }
      ]
    },
    proof: {
      title: '運用コミットメントで示す供給能力',
      description: '回答速度、書類管理、工場への供給対応力を指標として提示します。',
      items: [
        { value: '24h', label: 'RFQ 回答目標', detail: '技術要件が揃った依頼が対象' },
        { value: '06', label: '重点産業', detail: '電子、医療、食品、物流、木材、HVAC' },
        { value: '03', label: '受注管理レイヤー', detail: 'SKU・書類・納品' },
        { value: 'ISO', label: 'コンプライアンス資料', detail: 'CO/CQ・SDS・RoHS・REACH' }
      ]
    },
    governance: {
      title: '品番から納品まで一貫して管理',
      description: '各依頼を技術資料、取引条件、地域の供給能力に結び付けます。',
      items: [
        { title: 'カタログと技術記録', description: '提案前に各 SKU の属性、規格、資料を照合します。', href: '/products' },
        { title: '需要と見積', description: 'RFQ、サンプル、取引条件を依頼単位で追跡します。', href: '/quick-order' },
        { title: '地域供給能力', description: '拠点、工業団地、SLA、担当チームを納品計画に接続します。', href: '/regional-hubs' }
      ]
    },
    cta: {
      title: '実際の技術要件から始めましょう',
      description: '既存品番、必要規格、使用環境をお送りください。ULink が適切な担当へ振り分けます。',
      primaryAction: { label: 'RFQ を作成', href: '/quick-order' },
      secondaryAction: { label: 'ULink に相談', href: '/contact' }
    }
  }
};

const homepageExtensions = {
  vi: {
    about: {
      title: 'Hạ tầng cung ứng được thiết kế cho môi trường nhà máy',
      description:
        'ULink kết nối năng lực kho, đội ngũ kỹ thuật và danh mục vật tư trong một hệ vận hành thống nhất tại Hub Hà Nam.',
      bullets: [
        'Đối chiếu SKU và hồ sơ kỹ thuật trước khi báo giá',
        'Kiểm soát nhập kho, đóng gói và chứng từ theo lô',
        'Điều phối giao hàng theo cụm khu công nghiệp'
      ],
      action: { label: 'Về ULink Industries', href: '/about' },
      image: { ...commonMedia.about, alt: 'Trung tâm vận hành và kho công nghiệp ULink tại Hà Nam' }
    },
    productGroups: [
      {
        title: 'Vật tư bảo hộ & phòng sạch',
        description: 'Găng tay chống cắt, găng nitrile, khăn lau, trang phục và vật tư kiểm soát tĩnh điện.',
        href: '/solutions/categories/cleanroom-consumables',
        image: { ...commonMedia.cleanroomProduct, alt: 'Găng tay bảo hộ công nghiệp trong danh mục ULink' }
      },
      {
        title: 'Bao bì thiết kế theo quy cách',
        description: 'Thùng, khay, màng và vật liệu chèn bảo vệ được cấu hình theo sản phẩm và luồng vận chuyển.',
        href: '/solutions/categories/industrial-packaging',
        image: { ...commonMedia.customPackaging, alt: 'Giải pháp bao bì công nghiệp tùy chỉnh ULink' }
      },
      {
        title: 'Vật tư cơ điện & HVAC',
        description: 'Băng keo, vật tư bảo ôn và nhóm phụ trợ phục vụ bảo trì hệ thống nhà máy.',
        href: '/solutions/categories/esd-supplies',
        image: { ...commonMedia.hvacProduct, alt: 'Vật tư băng keo kỹ thuật cho hệ thống HVAC' }
      }
    ]
  },
  en: {
    about: {
      title: 'Supply infrastructure designed for factory operations',
      description:
        'ULink connects warehouse capacity, technical teams, and industrial materials through one operating system at the Ha Nam hub.',
      bullets: [
        'Validate SKUs and technical records before quotation',
        'Control inbound, packing, and lot-level documents',
        'Coordinate delivery by industrial cluster'
      ],
      action: { label: 'About ULink Industries', href: '/about' },
      image: { ...commonMedia.about, alt: 'ULink industrial warehouse and operations center in Ha Nam' }
    },
    productGroups: [
      {
        title: 'Protection & cleanroom materials',
        description: 'Cut-resistant gloves, nitrile gloves, wipers, garments, and electrostatic-control consumables.',
        href: '/solutions/categories/cleanroom-consumables',
        image: { ...commonMedia.cleanroomProduct, alt: 'Industrial protective gloves supplied by ULink' }
      },
      {
        title: 'Made-to-spec packaging',
        description: 'Cartons, trays, films, and protective inserts configured around the product and transport flow.',
        href: '/solutions/categories/industrial-packaging',
        image: { ...commonMedia.customPackaging, alt: 'ULink custom industrial packaging solution' }
      },
      {
        title: 'M&E and HVAC supplies',
        description: 'Technical tapes, insulation supplies, and supporting materials for factory maintenance.',
        href: '/solutions/categories/esd-supplies',
        image: { ...commonMedia.hvacProduct, alt: 'Technical tape material for HVAC systems' }
      }
    ]
  },
  ja: {
    about: {
      title: '工場運営のために設計された供給インフラ',
      description: 'ULink はハナム拠点で、倉庫能力、技術チーム、産業資材カタログを一つの運用体系に統合します。',
      bullets: ['見積前の SKU と技術資料の照合', '入荷・梱包・ロット書類の管理', '工業団地クラスター別の納品調整'],
      action: { label: 'ULink Industries について', href: '/about' },
      image: { ...commonMedia.about, alt: 'ハナムの ULink 産業倉庫・運用センター' }
    },
    productGroups: [
      {
        title: '保護具・クリーンルーム資材',
        description: '耐切創手袋、ニトリル手袋、ワイパー、ウェア、静電気対策消耗品。',
        href: '/solutions/categories/cleanroom-consumables',
        image: { ...commonMedia.cleanroomProduct, alt: 'ULink の産業用保護手袋' }
      },
      {
        title: '仕様対応パッケージ',
        description: '製品と輸送フローに合わせた箱、トレー、フィルム、保護インサート。',
        href: '/solutions/categories/industrial-packaging',
        image: { ...commonMedia.customPackaging, alt: 'ULink のカスタム産業包装ソリューション' }
      },
      {
        title: '機電・HVAC 資材',
        description: '工場保全向けの技術テープ、断熱材、補助資材。',
        href: '/solutions/categories/esd-supplies',
        image: { ...commonMedia.hvacProduct, alt: 'HVAC システム用技術テープ資材' }
      }
    ]
  }
};

for (const [locale, extension] of Object.entries(homepageExtensions)) {
  contentByLocale[locale].version = 3;
  contentByLocale[locale].about = extension.about;
  contentByLocale[locale].materials.groups = extension.productGroups;
}

const aboutSupportingMedia = {
  vi: [
    { path: '/images/brand/ulink-operations-wms-royal-v1.webp', role: 'about.operations.wms-control', alt: 'Trung tâm điều phối kho ULink theo dõi tồn kho và lệnh xuất hàng' },
    { path: '/images/brand/ulink-operations-inbound-royal-v1.webp', role: 'about.operations.inbound-quality', alt: 'Nhân sự ULink kiểm tra chất lượng vật tư tại khu vực nhập kho' },
    { path: '/images/brand/ulink-operations-dispatch-royal-v1.webp', role: 'about.operations.dispatch-control', alt: 'Khu vực điều phối xuất hàng ULink với kiện hàng được nhận diện rõ ràng' },
    { path: '/images/brand/ulink-operations-team-royal-v1.webp', role: 'about.operations.technical-team', alt: 'Đội ngũ kỹ thuật và cung ứng ULink trao đổi kế hoạch phục vụ nhà máy' }
  ],
  en: [
    { path: '/images/brand/ulink-operations-wms-royal-v1.webp', role: 'about.operations.wms-control', alt: 'ULink warehouse control center monitoring inventory and dispatch orders' },
    { path: '/images/brand/ulink-operations-inbound-royal-v1.webp', role: 'about.operations.inbound-quality', alt: 'ULink specialist inspecting material quality in the inbound area' },
    { path: '/images/brand/ulink-operations-dispatch-royal-v1.webp', role: 'about.operations.dispatch-control', alt: 'ULink dispatch area with clearly identified outbound shipments' },
    { path: '/images/brand/ulink-operations-team-royal-v1.webp', role: 'about.operations.technical-team', alt: 'ULink technical and supply team reviewing a plant service plan' }
  ],
  ja: [
    { path: '/images/brand/ulink-operations-wms-royal-v1.webp', role: 'about.operations.wms-control', alt: '在庫と出荷指示を監視する ULink 倉庫管理センター' },
    { path: '/images/brand/ulink-operations-inbound-royal-v1.webp', role: 'about.operations.inbound-quality', alt: '入荷エリアで資材品質を確認する ULink 担当者' },
    { path: '/images/brand/ulink-operations-dispatch-royal-v1.webp', role: 'about.operations.dispatch-control', alt: '出荷品を明確に識別した ULink 配送管理エリア' },
    { path: '/images/brand/ulink-operations-team-royal-v1.webp', role: 'about.operations.technical-team', alt: '工場向け供給計画を確認する ULink の技術・供給チーム' }
  ]
};

const careersMediaRoles = [
  { path: '/images/brand/ulink-careers-news-onboarding-royal-v1.webp', role: 'careers.news.onboarding' },
  { path: '/images/brand/ulink-careers-news-engineer-royal-v1.webp', role: 'careers.news.operations-engineer' },
  { path: '/images/brand/ulink-careers-news-training-royal-v1.webp', role: 'careers.news.supply-training' },
  { path: '/images/brand/ulink-careers-news-sports-royal-v1.webp', role: 'careers.news.sports-day' },
  { path: '/images/brand/ulink-careers-gallery-office-royal-v1.webp', role: 'careers.gallery.procurement-office' },
  { path: '/images/brand/ulink-careers-gallery-control-room-royal-v1.webp', role: 'careers.gallery.control-room' },
  { path: '/images/brand/ulink-careers-gallery-quality-lab-royal-v1.webp', role: 'careers.gallery.quality-lab' },
  { path: '/images/brand/ulink-careers-gallery-wms-royal-v1.webp', role: 'careers.gallery.wms-operator' },
  { path: '/images/brand/ulink-careers-gallery-packing-royal-v1.webp', role: 'careers.gallery.packing-team' },
  { path: '/images/brand/ulink-careers-gallery-hub-royal-v1.webp', role: 'careers.gallery.regional-hub' }
];

const careersMediaAlts = {
  vi: [
    'Chương trình chào đón nhân sự mới của ULink',
    'Kỹ sư vận hành ULink làm việc cùng người hướng dẫn tại kho tự động',
    'Đội ngũ ULink tham gia đào tạo quản trị chuỗi cung ứng',
    'Nhân sự ULink trong ngày hội thể thao tại khu công nghiệp',
    'Đội mua hàng và kỹ thuật ULink phối hợp tại văn phòng',
    'Giám sát kho ULink điều phối vận hành tại trung tâm kiểm soát',
    'Kỹ sư chất lượng ULink kiểm định mẫu bao bì ESD',
    'Nhân sự ULink vận hành hệ thống WMS và máy quét mã',
    'Đội đóng gói ULink xác minh lô hàng công nghiệp',
    'Trung tâm hoàn tất đơn hàng vùng của ULink nhìn từ trên cao'
  ],
  en: [
    'ULink new employee onboarding program',
    'ULink operations engineer working with a mentor in an automated warehouse',
    'ULink team taking part in supply-chain management training',
    'ULink employees at an industrial campus sports day',
    'ULink procurement and engineering team collaborating in the office',
    'ULink warehouse supervisor coordinating work in the control room',
    'ULink quality engineer testing an ESD packaging sample',
    'ULink specialist operating WMS and barcode scanning systems',
    'ULink packing team verifying an industrial shipment',
    'Aerial view of a ULink regional fulfillment hub'
  ],
  ja: [
    'ULink 新入社員オンボーディングプログラム',
    '自動倉庫で指導を受ける ULink オペレーションエンジニア',
    'サプライチェーン管理研修に参加する ULink チーム',
    '工業団地でスポーツデーに参加する ULink 社員',
    'オフィスで連携する ULink の調達・技術チーム',
    '管理室で倉庫業務を調整する ULink スーパーバイザー',
    'ESD 包装サンプルを検査する ULink 品質エンジニア',
    'WMS とバーコードスキャンを運用する ULink 担当者',
    '産業向け出荷を確認する ULink 梱包チーム',
    'ULink 地域フルフィルメント拠点の空撮'
  ]
};

const careersSupportingMedia = Object.fromEntries(
  Object.entries(careersMediaAlts).map(([locale, alts]) => [
    locale,
    careersMediaRoles.map((media, index) => ({ ...media, alt: alts[index] }))
  ])
);

const pagePresentations = {
  about: {
    title: { vi: 'Năng lực ULink Industries', en: 'ULink Industries capability', ja: 'ULink Industries の供給力' },
    content: {
      vi: {
        version: 2,
        heroMedia: {
          path: '/images/brand/ulink-corporate-capability-v1.webp',
          role: 'about.hero.corporate-capability',
          alt: 'Đội ngũ kỹ thuật và mua hàng ULink tại trung tâm phân phối công nghiệp'
        },
        supportingMedia: aboutSupportingMedia.vi
      },
      en: {
        version: 2,
        heroMedia: {
          path: '/images/brand/ulink-corporate-capability-v1.webp',
          role: 'about.hero.corporate-capability',
          alt: 'ULink engineering and procurement team at an industrial distribution center'
        },
        supportingMedia: aboutSupportingMedia.en
      },
      ja: {
        version: 2,
        heroMedia: {
          path: '/images/brand/ulink-corporate-capability-v1.webp',
          role: 'about.hero.corporate-capability',
          alt: '産業物流センターで業務を確認する ULink の技術・調達チーム'
        },
        supportingMedia: aboutSupportingMedia.ja
      }
    }
  },
  'about-sustainability': {
    title: { vi: 'Phát triển bền vững', en: 'Sustainability', ja: 'サステナビリティ' },
    content: {
      vi: {
        version: 2,
        heroMedia: {
          path: '/images/brand/ulink-sustainability-royal-v1.webp',
          role: 'sustainability.hero.circular-industrial-supply',
          alt: 'Giải pháp vật tư công nghiệp ULink trong hệ sinh thái sản xuất xanh và tuần hoàn'
        }
      },
      en: {
        version: 2,
        heroMedia: {
          path: '/images/brand/ulink-sustainability-royal-v1.webp',
          role: 'sustainability.hero.circular-industrial-supply',
          alt: 'ULink industrial materials within a greener circular manufacturing ecosystem'
        }
      },
      ja: {
        version: 2,
        heroMedia: {
          path: '/images/brand/ulink-sustainability-royal-v1.webp',
          role: 'sustainability.hero.circular-industrial-supply',
          alt: '環境配慮型の循環製造エコシステムにおける ULink 産業資材'
        }
      }
    }
  },
  'about-careers': {
    title: { vi: 'Sự nghiệp tại ULink', en: 'Careers at ULink', ja: 'ULink の採用情報' },
    content: {
      vi: {
        version: 2,
        heroMedia: {
          path: '/images/brand/ulink-careers-training-royal-v1.webp',
          role: 'careers.hero.technical-training',
          alt: 'Đội ngũ ULink tham gia đào tạo kỹ thuật tại trung tâm vận hành'
        },
        supportingMedia: careersSupportingMedia.vi
      },
      en: {
        version: 2,
        heroMedia: {
          path: '/images/brand/ulink-careers-training-royal-v1.webp',
          role: 'careers.hero.technical-training',
          alt: 'ULink team taking part in technical training at an operations center'
        },
        supportingMedia: careersSupportingMedia.en
      },
      ja: {
        version: 2,
        heroMedia: {
          path: '/images/brand/ulink-careers-training-royal-v1.webp',
          role: 'careers.hero.technical-training',
          alt: 'オペレーションセンターで技術研修を受ける ULink チーム'
        },
        supportingMedia: careersSupportingMedia.ja
      }
    }
  },
  industries: {
    title: { vi: 'Ngành phục vụ', en: 'Industries served', ja: '対応産業' },
    content: {
      vi: {
        version: 2,
        heroMedia: {
          path: '/images/industries/indus.png',
          role: 'industries.hero.multi-sector-material-systems',
          alt: 'Hệ thống vật tư ULink phục vụ nhiều cụm ngành sản xuất'
        }
      },
      en: {
        version: 2,
        heroMedia: {
          path: '/images/industries/indus.png',
          role: 'industries.hero.multi-sector-material-systems',
          alt: 'ULink material systems serving multiple manufacturing sectors'
        }
      },
      ja: {
        version: 2,
        heroMedia: {
          path: '/images/industries/indus.png',
          role: 'industries.hero.multi-sector-material-systems',
          alt: '複数の製造業分野に対応する ULink 資材システム'
        }
      }
    }
  },
  'about-standards': {
    title: { vi: 'Chất lượng và tiêu chuẩn', en: 'Quality and standards', ja: '品質と規格' },
    content: {
      vi: {
        version: 1,
        heroMedia: {
          path: '/images/brand/ulink-quality-lab-v1.webp',
          role: 'quality.hero.esd-compliance-lab',
          alt: 'Kỹ sư ULink kiểm định điện trở bề mặt của bao bì chống tĩnh điện'
        }
      },
      en: {
        version: 1,
        heroMedia: {
          path: '/images/brand/ulink-quality-lab-v1.webp',
          role: 'quality.hero.esd-compliance-lab',
          alt: 'ULink quality engineer testing the surface resistance of ESD packaging'
        }
      },
      ja: {
        version: 1,
        heroMedia: {
          path: '/images/brand/ulink-quality-lab-v1.webp',
          role: 'quality.hero.esd-compliance-lab',
          alt: '帯電防止包装の表面抵抗を測定する ULink 品質エンジニア'
        }
      }
    }
  },
  solutions: {
    title: { vi: 'Giải pháp vật tư', en: 'Material solutions', ja: '資材ソリューション' },
    content: {
      vi: {
        version: 1,
        heroMedia: {
          path: '/images/brand/ulink-material-applications-v1.webp',
          role: 'solutions.hero.material-applications',
          alt: 'Hệ vật tư phòng sạch, ESD và bao bì công nghiệp được kiểm tra theo ứng dụng'
        }
      },
      en: {
        version: 1,
        heroMedia: {
          path: '/images/brand/ulink-material-applications-v1.webp',
          role: 'solutions.hero.material-applications',
          alt: 'Cleanroom, ESD, and industrial packaging materials verified by application'
        }
      },
      ja: {
        version: 1,
        heroMedia: {
          path: '/images/brand/ulink-material-applications-v1.webp',
          role: 'solutions.hero.material-applications',
          alt: '用途別に検証されたクリーンルーム・ESD・産業包装資材'
        }
      }
    }
  }
};

function collectMedia(value, found = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectMedia(item, found);
  } else if (value && typeof value === 'object') {
    if (typeof value.path === 'string' && typeof value.role === 'string') {
      found.push({ path: value.path, role: value.role });
    }
    for (const child of Object.values(value)) collectMedia(child, found);
  }
  return found;
}

function assertUniqueMediaRoles() {
  const entries = collectMedia(contentByLocale.vi);
  const paths = new Set();
  const roles = new Set();
  for (const entry of entries) {
    if (paths.has(entry.path)) throw new Error(`Duplicate media path in brand content: ${entry.path}`);
    if (roles.has(entry.role)) throw new Error(`Duplicate media role in brand content: ${entry.role}`);
    paths.add(entry.path);
    roles.add(entry.role);
  }
}

async function upsertTranslation(sourceId, languageCode, content) {
  const collection = 'homepage_translations';
  const rows = await client.request(
    readItems(collection, {
      filter: { homepage_id: { _eq: sourceId }, languages_code: { _eq: languageCode } },
      fields: ['id'],
      limit: 1
    })
  );
  const payload = {
    homepage_id: sourceId,
    languages_code: languageCode,
    title: languageCode === 'vi' ? 'Trang chủ ULink B2B' : languageCode === 'en' ? 'ULink B2B Homepage' : 'ULink B2B ホームページ',
    content
  };
  if (rows.length) {
    await client.request(updateItem(collection, rows[0].id, payload));
  } else {
    await client.request(createItem(collection, payload));
  }
}

async function upsertPageTranslation(sourceId, languageCode, title, content) {
  const collection = 'pages_translations';
  const rows = await client.request(
    readItems(collection, {
      filter: { pages_id: { _eq: sourceId }, languages_code: { _eq: languageCode } },
      fields: ['id'],
      limit: 1
    })
  );
  const payload = { pages_id: sourceId, languages_code: languageCode, title, content };
  if (rows.length) await client.request(updateItem(collection, rows[0].id, payload));
  else await client.request(createItem(collection, payload));
}

async function upsertPagePresentation(slug, definition) {
  const existing = await client.request(
    readItems('pages', { filter: { slug: { _eq: slug } }, fields: ['id'], limit: 1 })
  );
  const basePayload = {
    status: 'published',
    slug,
    title: definition.title.vi,
    content: definition.content.vi
  };
  const page = existing.length
    ? await client.request(updateItem('pages', existing[0].id, basePayload))
    : await client.request(createItem('pages', basePayload));
  const pageId = page?.id ?? existing[0]?.id;
  for (const locale of Object.keys(definition.content)) {
    await upsertPageTranslation(pageId, locale, definition.title[locale], definition.content[locale]);
  }
}

async function main() {
  assertUniqueMediaRoles();
  await loginAdmin(client);

  await client.request(
    updateSingleton('site_settings', {
      contact_email: 'contact@ulinkindustries.com',
      contact_phone: '0247 309 9899',
      address: 'Lô CN05 KCN Đồng Văn IV, xã Đại Cương, Kim Bảng, Hà Nam, Việt Nam',
      meta_title: 'ULink Industries — Nền tảng mua sắm vật tư B2B',
      meta_description:
        'Chuẩn hóa danh mục, yêu cầu báo giá và giao nhận vật tư phòng sạch, ESD và bao bì công nghiệp cho doanh nghiệp sản xuất.'
    })
  );

  const targetCollections = new Set(['pages', 'homepage', 'pages_translations', 'homepage_translations']);
  for (const definition of COLLECTION_DEFS) {
    if (targetCollections.has(definition.collection)) {
      await helpers.ensureCollection(definition);
    }
  }

  const homepage = await client.request(
    updateSingleton('homepage', {
      title: 'Trang chủ ULink B2B',
      hero_section: { migrated_to: 'content', design_system: 'carbon-v11' },
      content: contentByLocale.vi
    })
  );
  const homepageId = homepage?.id ?? 1;

  for (const [locale, content] of Object.entries(contentByLocale)) {
    await upsertTranslation(homepageId, locale, content);
  }

  for (const [slug, definition] of Object.entries(pagePresentations)) {
    await upsertPagePresentation(slug, definition);
  }

  console.log(
    `Brand content seeded for ${Object.keys(contentByLocale).join(', ')} across homepage and ${Object.keys(pagePresentations).length} pages.`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error('Brand content seed failed:', error);
  process.exit(1);
});
