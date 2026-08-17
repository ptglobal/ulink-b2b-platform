import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { fetchProducts } from '@/lib/product-data';
import IndustryDetailClient from '@/components/industries/industry-detail-client';
import { CtaBanner } from '@/components/home';

interface IndustryPageProps {
  params: { locale: string; slug: string };
}

// Function to construct rich industry details dynamically based on slug and locale
function getIndustryDetails(slug: string, locale: string) {
  const isVi = locale === 'vi';
  const isJa = locale === 'ja';

  let actualSlug = slug;
  if (slug === 'pharmaceutical' || slug === 'cosmetics' || slug === 'pharma-medical') {
    actualSlug = 'pharmaceutical-cosmetics';
  } else if (slug === 'food' || slug === 'food-beverage') {
    actualSlug = 'food-beverage';
  } else if (slug === 'furniture-wood') {
    actualSlug = 'furniture';
  } else if (slug === 'construction-hvac' || slug === 'manufacturing') {
    actualSlug = 'construction';
  }

  const VALID_SLUGS = ['electronics', 'pharmaceutical-cosmetics', 'food-beverage', 'logistics', 'furniture', 'construction'];
  if (!VALID_SLUGS.includes(actualSlug)) {
    return null;
  }

  if (actualSlug === 'electronics') {
    return {
      slug: 'electronics',
      name: isVi ? 'Điện tử & Bán dẫn' : isJa ? '電子・半導体' : 'Electronics & Semiconductors',
      title: isVi ? 'Giải pháp cho ngành Điện tử & Bán dẫn' : isJa ? '電子・半導体産業向けソリューション' : 'Solutions for Electronics & Semiconductors',
      description: isVi
        ? 'Tối ưu kiểm soát ô nhiễm và quy trình đóng gói để đảm bảo chất lượng và độ tin cậy của linh kiện điện tử.'
        : isJa
          ? '電子部品の品質と信頼性を確保するために、汚染管理と包装プロセスを最適化します。'
          : 'Optimize contamination control and packaging processes to ensure the quality and reliability of electronic components.',
      iconName: 'Cpu',
      gradient: 'from-brand-deep to-brand',
      bannerImage: '/images/brand/ulink-industry-electronics-royal-v1.webp',
      valueProps: [
        {
          title: isVi ? 'Đảm bảo chất lượng cao' : isJa ? '高品質の保証' : 'High Quality Assurance',
          desc: isVi ? 'Kiểm soát tĩnh điện và hạt bụi giúp giảm thiểu rủi ro lỗi sản phẩm.' : isJa ? '静電気とチリの制御により、製品の欠陥リスクを最小限に抑えます。' : 'Controlling static and dust particles minimizes product defect risks.',
          iconName: 'ShieldCheck'
        },
        {
          title: isVi ? 'Nâng cao hiệu suất sản xuất' : isJa ? '生産効率の向上' : 'Enhance Production Efficiency',
          desc: isVi ? 'Tiêu chuẩn hóa vật tư và quy trình giúp tăng hiệu quả và năng suất.' : isJa ? '資材とプロセスの標準化により、効率と生産性が向上します。' : 'Standardizing supplies and processes improves efficiency and productivity.',
          iconName: 'Settings'
        },
        {
          title: isVi ? 'Tối ưu chuỗi cung ứng' : isJa ? 'サプライチェーンの最適化' : 'Optimize Supply Chain',
          desc: isVi ? 'Nguồn cung ổn định toàn cầu và giao hàng đúng hạn.' : isJa ? '安定したグローバル供給とタイムリーな納品。' : 'Stable global supply and timely delivery.',
          iconName: 'Globe'
        },
        {
          title: isVi ? 'Tối ưu hóa chi phí' : isJa ? 'コスト最適化' : 'Cost Optimization',
          desc: isVi ? 'Giải pháp vật tư toàn diện giúp tiết kiệm chi phí vận hành.' : isJa ? '包括的な資材ソリューションにより、運用コストを削減します。' : 'Comprehensive supply solutions help save operational costs.',
          iconName: 'Zap'
        }
      ],
      challengesIntro: isVi ? 'Thách thức trong ngành Điện tử' : isJa ? '電子産業における課題' : 'Challenges in the Electronics Industry',
      challenges: [
        {
          title: isVi ? 'Hạt bụi siêu nhỏ gây lỗi sản phẩm' : isJa ? '極小の塵埃による製品の不具合' : 'Micro dust particles causing product defects',
          desc: isVi ? 'Hạt bụi siêu mịn bám dính trên các lớp quang khắc gây chập mạch, đứt đường dẫn điện cực.' : isJa ? '超微細な塵埃がフォトリソグラフィー層に付着し、短絡や電極の断線を引き起こします。' : 'Ultra-fine dust particles adhering to photolithography layers cause short circuits or electrode breakage.',
          iconName: 'Sparkles'
        },
        {
          title: isVi ? 'Tĩnh điện gây hư hỏng linh kiện' : isJa ? '静電気による部品の損傷' : 'Static electricity damaging components',
          desc: isVi ? 'Hiện tượng phóng tĩnh điện (ESD) gây hỏng chip ngầm không thể phát hiện bằng mắt thường.' : isJa ? '静電気放電（ESD）により、目視では検出できない潜在的なチップ破損が発生します。' : 'Electrostatic discharge (ESD) causes latent chip damage undetectable to the eye.',
          iconName: 'Zap'
        },
        {
          title: isVi ? 'Va đập trong vận chuyển gây suy giảm chất lượng' : isJa ? '輸送時の衝撃による品質低下' : 'Impact during transport degrading quality',
          desc: isVi ? 'Va đập, rung chấn và độ ẩm cao trong quá trình lưu kho và vận chuyển làm giảm độ tin cậy và tuổi thọ linh kiện.' : isJa ? '保管や輸送中の衝撃、振動、高湿度は、部品の信頼性と寿命を低下させます。' : 'Impacts, vibrations, and high humidity during storage and transport reduce component reliability and lifespan.',
          iconName: 'Truck'
        }
      ],
      cleanroomIntro: isVi ? 'Duy trì môi trường sản xuất sạch sẽ, kiểm soát hạt bụi và tĩnh điện.' : isJa ? 'クリーンな製造環境を維持し、塵埃と静電気を制御します。' : 'Maintain a clean manufacturing environment, controlling dust particles and static electricity.',
      cleanroomCategories: [
        { name: isVi ? 'Quần áo phòng sạch' : isJa ? 'クリーンルームウェア＆用品' : 'Cleanroom Wear & Accessories', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-apparel' },
        { name: isVi ? 'Găng tay phòng sạch' : isJa ? 'クリーンルーム手袋' : 'Cleanroom Gloves', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-gloves' },
        { name: isVi ? 'Khẩu trang phòng sạch' : isJa ? 'クリーンルームマスク' : 'Cleanroom Masks', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-masks' },
        { name: isVi ? 'Thảm dính bụi' : isJa ? '粘着マット' : 'Sticky Mats', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-consumables' }
      ],
      cleanroomViewAll: isVi ? 'Xem tất cả sản phẩm phòng sạch' : isJa ? 'すべてのクリーンルーム製品を見る' : 'See all cleanroom products',
      packagingIntro: isVi ? 'Bảo vệ linh kiện trong quá trình lưu trữ và vận chuyển.' : isJa ? '保管および輸送プロセスにおいて部品を保護します。' : 'Protect components during storage and transportation processes.',
      packagingCategories: [
        { name: isVi ? 'Màng PE (LLDPE)' : isJa ? 'PEストレッチフィルム' : 'PE Stretch Film (LLDPE)', image: '/images/industries/electronics_hero.webp', slug: 'industrial-packaging' },
        { name: isVi ? 'Túi chống tĩnh điện & màng chống tĩnh điện' : isJa ? '帯電防止袋＆フィルム' : 'ESD Shielding Bags & Film', image: '/images/industries/electronics_hero.webp', slug: 'esd-supplies' },
        { name: isVi ? 'Khay nhựa (ESD)' : isJa ? 'ESDプラスチックトレイ' : 'ESD Plastic Trays', image: '/images/industries/electronics_hero.webp', slug: 'esd-supplies' },
        { name: isVi ? 'Túi nhôm chống ẩm' : isJa ? '防湿アルミ袋' : 'Moisture Barrier Aluminum Bags', image: '/images/industries/electronics_hero.webp', slug: 'industrial-packaging' }
      ],
      packagingViewAll: isVi ? 'Xem tất cả sản phẩm đóng gói' : isJa ? 'すべての包装製品を見る' : 'See all packaging products',
      casesTitle: isVi ? 'Trường hợp áp dụng thực tế' : isJa ? '実際の導入事例' : 'Real-world Applications',
      cases: [
        {
          title: isVi ? 'Cải thiện môi trường sản xuất tại nhà máy linh kiện' : isJa ? '部品工場における製造環境の改善' : 'Improving production environment at component factory',
          description: isVi ? 'Giảm tỉ lệ lỗi sản phẩm từ 1.8% xuống 1.2% nhờ quy trình kiểm soát hạt bụi và tĩnh điện đồng bộ tại phòng sạch Class 100.' : isJa ? 'Class 100クリーンルームでの一貫した塵埃と静電気管理プロセスにより、製品不具合率を1.8%から1.2%に低減。' : 'Reduced product defect rate from 1.8% to 1.2% through synchronized dust and static control processes in a Class 100 cleanroom.',
          image: '/images/industries/electronics_hero.webp',
          badge: isVi ? 'Giảm 32% lỗi' : isJa ? '不良率32%低減' : '32% Defect Reduction'
        },
        {
          title: isVi ? 'Tối ưu bao bì cho doanh nghiệp lắp ráp bán dẫn' : isJa ? '半導体アセンブリ企業の包装最適化' : 'Optimizing packaging for semiconductor assembly company',
          description: isVi ? 'Loại bỏ hoàn toàn rủi ro phóng tĩnh điện trong quá trình vận chuyển liên tỉnh bằng cách chuyển sang khay nhựa ESD và túi nhôm che chắn sóng.' : isJa ? 'ESDプラスチックトレイとシールドアルミ袋への変更により、都市間輸送中の静電気放電リスクを完全に排除。' : 'Completely eliminated electrostatic discharge risks during inter-provincial transit by switching to ESD plastic trays and shielding aluminum bags.',
          image: '/images/industries/electronics_hero.webp',
          badge: isVi ? 'Giảm 45% hư hỏng' : isJa ? '破損45%削減' : '45% Damage Reduction'
        },
        {
          title: isVi ? 'Giải pháp cho nhà cung cấp linh kiện điện tử' : isJa ? '電子部品サプライヤー向けソリューション' : 'Solutions for electronic component suppliers',
          description: isVi ? 'Tăng 28% hiệu suất đóng gói cuối cùng, tăng tốc độ xử lý đơn hàng và tiết kiệm 15% chi phí vật tư bằng thiết kế cuộn màng PE tùy chỉnh.' : isJa ? 'カスタム設計のPEフィルムロールの導入により、最終包装効率が28%向上し、注文処理の迅速化と15%の資材コスト削減を実現。' : 'Increased final packaging efficiency by 28%, accelerated order processing, and saved 15% in materials cost through custom PE film roll designs.',
          image: '/images/industries/electronics_hero.webp',
          badge: isVi ? 'Tăng 28% hiệu suất' : isJa ? '効率28%向上' : '28% Efficiency Increase'
        }
      ],
      whyUsTitle: isVi ? 'Vì sao chọn ULINK?' : isJa ? 'なぜULINKを選ぶのか？' : 'Why Choose ULINK?',
      whyUsList: isVi
        ? ['Sản phẩm đạt tiêu chuẩn chất lượng phòng sạch cao cấp', 'Quy trình kiểm soát chất lượng kiểm định nghiêm ngặt', 'Chuỗi cung ứng ổn định toàn cầu, giao hàng đúng hẹn', 'Hỗ trợ kỹ thuật chuyên sâu và tùy chỉnh theo yêu cầu riêng']
        : isJa
          ? ['高品質クリーンルーム基準を満たす製品', '厳格な品質管理・検査プロセス', '安定したグローバルサプライチェーンと確実な納期', '技術サポートと個別要望への柔軟な対応']
          : ['Products meeting high cleanroom quality standards', 'Strict quality control and inspection processes', 'Stable global supply chain and timely delivery', 'Dedicated technical support & custom tailoring'],
      standardsTitle: isVi ? 'Chứng nhận & tiêu chuẩn áp dụng' : isJa ? '適用される認証＆規格' : 'Certifications & Standards',
      standards: [
        { name: 'ISO 9001:2015', detail: isVi ? 'Hệ thống quản lý chất lượng sản xuất linh kiện điện tử.' : isJa ? '電子部品製造の品質管理システム。' : 'Quality management system for electronics manufacturing.' },
        { name: 'ISO 14001:2015', detail: isVi ? 'Tiêu chuẩn quản lý môi trường và an toàn hóa chất nhà máy.' : isJa ? '環境管理および工場化学物質の安全基準。' : 'Environmental management and chemical safety standards.' },
        { name: 'RoHS 2.0', detail: isVi ? 'Tuân thủ chỉ thị hạn chế chất nguy hại trong sản phẩm điện tử.' : isJa ? '電子製品における有害物質使用制限指令への適合。' : 'Restriction of hazardous substances compliance in electronics.' },
        { name: 'REACH', detail: isVi ? 'Đánh giá, đăng ký và cấp phép hóa chất an toàn Châu Âu.' : isJa ? '欧州化学物質の評価・登録・認可安全基準。' : 'EU chemical safety evaluation and authorization compliance.' }
      ],
      resourcesTitle: isVi ? 'Tài liệu liên quan' : isJa ? '関連資料' : 'Related Resources',
      catalogue: {
        title: isVi ? 'Catalogue giải pháp cho ngành Điện tử' : isJa ? '電子産業向けソリューションカタログ' : 'Solutions Catalogue for Electronics',
        info: 'PDF / 6.2MB',
        url: '#'
      }
    };
  }

  if (actualSlug === 'pharmaceutical-cosmetics') {
    return {
      slug: 'pharmaceutical-cosmetics',
      name: isVi ? 'Dược phẩm & Y tế' : isJa ? '医薬品・医療' : 'Pharmaceuticals & Medical',
      title: isVi ? 'Giải pháp cho ngành Dược phẩm' : isJa ? '医薬品・医療産業向けソリューション' : 'Solutions for Pharmaceuticals & Medical',
      description: isVi
        ? 'ULink Industries cung cấp hệ thống vật tư phòng sạch PPE chuẩn vô trùng, màng đóng gói bảo vệ và các giải pháp chống ô nhiễm chéo tối ưu đạt chuẩn GMP, ISO 14644 và FDA.'
        : isJa
          ? 'ULink Industriesは、GMP、ISO 14644、およびFDA規格に準拠した無菌PPEクリーンルーム用品、保護包装用フィルム、および最適な交差汚染防止ソリューションを提供します。'
          : 'ULink Industries provides sterile PPE cleanroom supplies, protective packaging films, and optimal anti-cross contamination solutions complying with GMP, ISO 14644, and FDA standards.',
      iconName: 'Activity',
      gradient: 'from-brand-deep to-brand',
      bannerImage: '/images/brand/ulink-industry-pharma-royal-v1.webp',
      valueProps: [
        {
          title: isVi ? 'Chuẩn vô trùng tối đa' : isJa ? '最大レベルの無菌' : 'Max Sterility Level',
          desc: isVi ? 'Đạt tiêu chuẩn phòng sạch Class 100 - ISO 5 khắt khe.' : isJa ? '厳しいClass 100 - ISO 5クリーンルーム基準に準拠。' : 'Complies with strict Class 100 - ISO 5 cleanroom standards.',
          iconName: 'ShieldCheck'
        },
        {
          title: isVi ? 'Chống nhiễm chéo' : isJa ? '交差汚染防止' : 'Cross Contamination Control',
          desc: isVi ? 'Vật tư thiết kế tối ưu giảm thiểu nguy cơ lây nhiễm vi sinh.' : isJa ? '微生物汚染リスクを最小限に抑える最適な資材設計。' : 'Optimally designed supplies minimizing microbial risks.',
          iconName: 'Activity'
        },
        {
          title: isVi ? 'Đạt chuẩn GMP & FDA' : isJa ? 'GMP & FDA適合' : 'GMP & FDA Compliant',
          desc: isVi ? 'Đáp ứng đầy đủ các chứng nhận an toàn y tế quốc tế.' : isJa ? '国際的な医療安全認証に完全に適合。' : 'Fully complies with international medical safety certs.',
          iconName: 'CheckCircle2'
        },
        {
          title: isVi ? 'Hỗ trợ kỹ thuật 24/7' : isJa ? '24/7技術サポート' : '24/7 Tech Support',
          desc: isVi ? 'Tư vấn giải pháp và cung cấp hồ sơ năng lực đầy đủ.' : isJa ? 'ソリューション提案と完全な機能プロファイルの提供。' : 'Solution consulting and complete capability profiles.',
          iconName: 'Factory'
        }
      ],
      challengesIntro: isVi ? 'Thách thức trong ngành Dược phẩm' : isJa ? '医薬品産業における課題' : 'Challenges in the Pharmaceutical Industry',
      challenges: [
        {
          title: isVi ? 'Bụi bẩn & vi sinh vật bám dính trên bao bì' : isJa ? '容器に付着する塵埃・微生物' : 'Dust & microbes adhering to packaging',
          desc: isVi ? 'Sự bám dính của các bào tử nấm mốc hoặc vi sinh trên chai lọ, bao bì đóng gói trực tiếp có thể làm hỏng hoạt chất của thuốc.' : isJa ? '直接包装資材やボトルに付着したカビ胞子や微生物は、製剤の有効成分を損なう可能性があります。' : 'Adhesion of mold spores or microbes to direct packaging containers can compromise active drug ingredients.',
          iconName: 'Sparkles'
        },
        {
          title: isVi ? 'Lông bụi từ trang phục công nhân thông thường' : isJa ? '通常作業服からの繊維クズ・発塵' : 'Fibers & dust shedding from regular clothes',
          desc: isVi ? 'Vải dệt thông thường liên tục phát tán xơ vải và tế bào chết từ cơ thể người vào luồng khí phòng sạch.' : isJa ? '通常の織物は、クリーンルーム内の気流中に繊維クズや人体からの角質細胞を継続的に放出します。' : 'Regular woven fabrics continuously shed lint fibers and human skin cells into the cleanroom airflow.',
          iconName: 'AlertCircle'
        },
        {
          title: isVi ? 'Rủi ro nhiễm bẩn chéo giữa các lô hàng' : isJa ? 'ロット間の交差汚染リスク' : 'Cross-contamination risk between batches',
          desc: isVi ? 'Quy trình khử trùng không triệt để hoặc dùng sai vật dụng lau phòng sạch tạo cơ hội lây nhiễm chéo hoạt chất thuốc.' : isJa ? '不完全な滅菌や誤ったワイパーの使用により、製剤成分の交差汚染を引き起こす可能性があります。' : 'Incomplete sterilization or usage of incorrect cleanroom wipers allows active pharmaceutical ingredients to cross-contaminate.',
          iconName: 'ShieldCheck'
        }
      ],
      cleanroomIntro: isVi ? 'Giải pháp bảo vệ môi trường sản xuất vô trùng, phòng sạch dược phẩm.' : isJa ? '無菌製造環境や医薬品クリーンルーム向けの保護ソリューション。' : 'Protective solutions for sterile pharmaceutical and cleanroom manufacturing environments.',
      cleanroomCategories: [
        { name: isVi ? 'Quần áo phòng sạch' : isJa ? 'クリーンルームウェア' : 'Cleanroom Wear & Coveralls', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-apparel' },
        { name: isVi ? 'Khẩu trang phòng sạch vô trùng' : isJa ? '滅菌クリーンルームマスク' : 'Sterile Cleanroom Masks', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-masks' },
        { name: isVi ? 'Khăn lau phòng sạch' : isJa ? 'クリーンルームワイパー' : 'Cleanroom Wipers', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-wipers' },
        { name: isVi ? 'Thảm dính bụi phòng dịch' : isJa ? '除塵粘着マット' : 'De-dusting Sticky Mats', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-consumables' }
      ],
      cleanroomViewAll: isVi ? 'Xem tất cả sản phẩm phòng sạch' : isJa ? 'すべてのクリーンルーム製品を見る' : 'See all cleanroom products',
      packagingIntro: isVi ? 'Bao bì sơ cấp tiếp xúc trực tiếp vô trùng và màng bảo vệ bên ngoài.' : isJa ? '無菌の直接接触一次包装および外装保護フィルム。' : 'Sterile primary contact packaging and external protective film solutions.',
      packagingCategories: [
        { name: isVi ? 'Túi nhôm chống ẩm & tiệt trùng' : isJa ? '防湿・滅菌アルミ袋' : 'Sterile Moisture Barrier Aluminum Bags', image: '/images/industries/electronics_hero.webp', slug: 'industrial-packaging' },
        { name: isVi ? 'Màng PE quấn bảo vệ y tế' : isJa ? '医療用保護PEフィルム' : 'Medical Grade PE protective film', image: '/images/industries/electronics_hero.webp', slug: 'industrial-packaging' },
        { name: isVi ? 'Khay nhựa chống tĩnh điện y tế' : isJa ? '医療用ESDプラスチックトレイ' : 'Medical ESD Plastic Trays', image: '/images/industries/electronics_hero.webp', slug: 'esd-supplies' }
      ],
      packagingViewAll: isVi ? 'Xem tất cả sản phẩm đóng gói' : isJa ? 'すべての包装製品を見る' : 'See all packaging products',
      casesTitle: isVi ? 'Trường hợp áp dụng thực tế' : isJa ? '実際の導入事例' : 'Real-world Applications',
      cases: [
        {
          title: isVi ? 'Đạt chuẩn GMP WHO cho nhà máy Dược Hậu Giang' : isJa ? 'Dược Hậu Giang工場のGMP WHO基準の達成' : 'Achieving GMP WHO Standards for DHG Pharma Factory',
          description: isVi ? 'Đồng bộ hóa vật tư quần áo phòng sạch vô trùng Class 100 giúp vượt qua đợt đánh giá khắt khe của Bộ Y Tế thành công.' : isJa ? 'Class 100滅菌クリーンルームウェア等の資材同期化により、保健省による厳格な評価を通過。' : 'Synchronizing Class 100 sterile cleanroom wear and supplies successfully passed strict Ministry of Health audits.',
          image: '/images/industries/electronics_hero.webp',
          badge: isVi ? 'Đạt chuẩn GMP' : isJa ? 'GMP適合' : 'GMP Compliant'
        },
        {
          title: isVi ? 'Tối ưu màng đóng gói cho nhà máy thiết bị y tế' : isJa ? '医療機器工場の包装フィルム最適化' : 'Optimizing packaging film for medical device factory',
          description: isVi ? 'Ứng dụng túi nhôm chống ẩm và màng tiệt trùng giúp tăng thời gian bảo quản dụng cụ phẫu thuật thêm 18 tháng.' : isJa ? '防湿アルミ袋と滅菌フィルムの採用により、手術器具の保存期間を18ヶ月延長。' : 'Application of moisture-barrier aluminum bags and sterile film extended surgical instrument shelf life by 18 months.',
          image: '/images/industries/electronics_hero.webp',
          badge: isVi ? 'Tăng 18 tháng bảo quản' : isJa ? '保存期間18ヶ月延長' : '+18mo Shelf Life'
        },
        {
          title: isVi ? 'Kiểm soát nhiễm chéo tại lab nghiên cứu vacxin' : isJa ? 'ワクチン研究所における交差汚染制御' : 'Controlling cross-contamination at vaccine research lab',
          description: isVi ? 'Hệ thống giấy lau phòng sạch và thảm dính bụi chuyên dụng giúp triệt tiêu hoàn toàn vi khuẩn phát tán trong phòng thí nghiệm.' : isJa ? '専用クリーンルームワイパーと粘着マットの導入により、実験室内の浮遊細菌を完全に排除。' : 'Specialized cleanroom wipers and sticky mats completely eliminated airborne bacteria in the laboratory room.',
          image: '/images/industries/electronics_hero.webp',
          badge: isVi ? 'Triệt tiêu 100% khuẩn' : isJa ? '細菌100%排除' : '100% Bacteria Elimination'
        }
      ],
      whyUsTitle: isVi ? 'Vì sao chọn ULINK?' : isJa ? 'なぜULINKを選ぶのか？' : 'Why Choose ULINK?',
      whyUsList: isVi
        ? ['Sản phẩm đạt tiêu chuẩn chất lượng cao cấp, vô trùng tuyệt đối', 'Kiểm soát chất lượng nghiêm ngặt đạt chuẩn WHO-GMP và FDA', 'Nguồn cung ứng dồi dào, đảm bảo giao hàng đúng hẹn', 'Hỗ trợ kỹ thuật, kiểm định và hồ sơ năng lực đầy đủ cho nhà máy']
        : isJa
          ? ['最高水準の無菌品質を満たす製品', 'WHO-GMPおよびFDA規格に準拠した厳格な品質管理', '豊富な供給能力により確実な納期を約束', '技術サポート、製品検査、工場向け機能プロファイルの提供']
          : ['Products meeting premium sterile quality standards', 'Strict quality control complying with WHO-GMP and FDA', 'Abundant supply capacity ensuring on-time delivery', 'Technical support, inspection reports, and full factory profile documentation'],
      standardsTitle: isVi ? 'Chứng nhận & tiêu chuẩn áp dụng' : isJa ? '適用される認証＆規格' : 'Certifications & Standards',
      standards: [
        { name: 'ISO 13485:2016', detail: isVi ? 'Hệ thống quản lý chất lượng thiết bị y tế - tiêu chuẩn toàn cầu cho sản xuất dược phẩm an toàn.' : isJa ? '医療機器品質マネジメントシステム。' : 'Medical device quality management system standard.' },
        { name: 'GMP - WHO', detail: isVi ? 'Thực hành sản xuất thuốc tốt theo tiêu chuẩn Tổ chức Y tế Thế giới, bắt buộc cho nhà máy dược phẩm.' : isJa ? 'WHO世界保健機関適正製造基準。' : 'Good manufacturing practice for pharmaceuticals.' },
        { name: 'ISO 14644 Cleanroom', detail: isVi ? 'Tiêu chuẩn quốc tế về phân loại và kiểm soát môi trường phòng sạch trong sản xuất Dược phẩm & Y tế.' : isJa ? 'クリーンルーム環境管理国際規格。' : 'International cleanroom environmental control standard.' },
        { name: 'FDA 21 CFR', detail: isVi ? 'Tuân thủ quy định FDA Hoa Kỳ cho bao bì tiếp xúc trực tiếp với dược phẩm và thực phẩm chức năng.' : isJa ? '米国FDA直接接触包装規制適合。' : 'FDA US code of federal regulations for direct packaging.' }
      ],
      resourcesTitle: isVi ? 'Tài liệu liên quan' : isJa ? '関連資料' : 'Related Resources',
      catalogue: {
        title: isVi ? 'Catalogue giải pháp cho ngành Dược phẩm & Y tế' : isJa ? '医薬品・医療用ソリューションカタログ' : 'Solutions Catalogue for Pharmaceuticals & Medical',
        info: 'PDF / 5.8MB',
        url: '#'
      }
    };
  }

  if (actualSlug === 'food-beverage') {
    return {
      slug: 'food-beverage',
      name: isVi ? 'Thực phẩm & Đồ uống' : isJa ? '食品・飲料' : 'Food & Beverage',
      title: isVi ? 'Giải pháp cho ngành Thực phẩm & Đồ uống' : isJa ? '食品・飲料加工向け安全・衛生ソリューション' : 'Safety & Sanitation Solutions for Food & Beverage Processing',
      description: isVi
        ? 'Chế biến thực phẩm đòi hỏi kiểm soát bụi bẩn tối đa và các loại vật tư bao bì tiếp xúc trực tiếp an toàn. Đảm bảo vệ sinh an toàn thực phẩm nghiêm ngặt.'
        : isJa
          ? '食品加工では、最大限の塵埃管理と安全な直接接触包装資材が必要です。厳格な食品衛生安全性を確保します。'
          : 'Food processing requires maximum contamination control and food-contact safe packaging supplies. Strict hygiene and food safety assurance.',
      iconName: 'Utensils',
      gradient: 'from-brand-deep to-brand',
      bannerImage: '/images/brand/ulink-industry-food-royal-v1.webp',
      valueProps: [
        {
          title: isVi ? 'Đạt chuẩn FDA' : isJa ? 'FDA適合' : 'FDA Certified',
          desc: isVi ? 'Vật liệu an toàn tuyệt đối khi tiếp xúc trực tiếp với thực phẩm.' : isJa ? '食品に直接接触しても完全に安全な素材を使用。' : 'Materials fully safe for direct contact with food products.',
          iconName: 'ShieldCheck'
        },
        {
          title: isVi ? 'Kiểm soát xơ vải & vi nhựa' : isJa ? '繊維・マイクロプラスチック制御' : 'Lint & Microplastics Control',
          desc: isVi ? 'Hạn chế dị vật rơi vào nguyên liệu chế biến.' : isJa ? '加工原材料への異物混入を効果的に抑制。' : 'Effectively prevents foreign objects from falling into ingredients.',
          iconName: 'Activity'
        },
        {
          title: isVi ? 'Quy trình chuẩn hóa' : isJa ? 'プロセスの標準化' : 'Process Standardization',
          desc: isVi ? 'Tiêu chuẩn hóa vật tư giúp dây chuyền luôn ổn định.' : isJa ? '資材の標準化により生産ラインを安定させます。' : 'Standardizing supplies keeps the production lines stable.',
          iconName: 'Settings'
        },
        {
          title: isVi ? 'Tối ưu chi phí' : isJa ? 'コスト最適化' : 'Cost Optimization',
          desc: isVi ? 'Giảm thiểu hao phí vật tư và đóng gói hiệu quả.' : isJa ? '包装資材の無駄を最小限に抑え、効率化を図ります。' : 'Minimizes material waste and increases packaging efficiency.',
          iconName: 'Zap'
        }
      ],
      challengesIntro: isVi ? 'Thách thức trong ngành Thực phẩm' : isJa ? '食品産業における課題' : 'Challenges in the Food Industry',
      challenges: [
        {
          title: isVi ? 'Rác thải vi nhựa và xơ vải rơi vào nguyên liệu' : isJa ? '原材料へのマイクロプラスチック・繊維混入' : 'Microplastics & fibers falling into ingredients',
          desc: isVi ? 'Xơ vải từ trang phục bảo hộ cũ rơi vào bồn trộn nguyên liệu gây lỗi chất lượng thành phẩm hàng loạt.' : isJa ? '古い防護服からの繊維が混合タンクに混入し、大量の製品品質不良の原因となります。' : 'Fibers from old protective suits falling into mixing vats cause bulk product quality defects.',
          iconName: 'Sparkles'
        },
        {
          title: isVi ? 'Bao bì đóng gói pallet bên ngoài bị rách' : isJa ? '外装パレット包装の破損・破れ' : 'Outer pallet packaging tearing or breaking',
          desc: isVi ? 'Màng quấn pallet không đủ dai dẫn đến rách, làm ẩm nước và côn trùng xâm nhập trong kho lạnh.' : isJa ? 'パレットストレッチフィルムの強度が不足し、冷凍庫内での破れや湿気、虫の侵入を招きます。' : 'Insufficient pallet stretch film strength leads to tearing, moisture, and pest intrusion in cold storage.',
          iconName: 'AlertCircle'
        },
        {
          title: isVi ? 'Quy trình lau chùi băng chuyền dính dầu mỡ' : isJa ? 'コンベアの油分除去・清掃作業' : 'Conveyor belt grease cleaning process',
          desc: isVi ? 'Hao phí thời gian và hóa chất khi lau băng tải thực phẩm bằng khăn thông thường phát sinh bụi vải.' : isJa ? '通常のタオルで食品コンベアを清掃すると、清掃時間や化学薬品の浪費、および布埃が発生します。' : 'Wiping food conveyor belts with regular cloths wastes time/chemicals and generates lint dust.',
          iconName: 'Settings'
        }
      ],
      cleanroomIntro: isVi ? 'Giải pháp kiểm soát vệ sinh, trang phục bảo hộ đạt chuẩn tiếp xúc thực phẩm.' : isJa ? '食品接触基準に適合した衛生管理・防護服ソリューション。' : 'Sanitation control and protective wear solutions complying with food contact standards.',
      cleanroomCategories: [
        { name: isVi ? 'Mũ bảo hộ & Khẩu trang thực phẩm' : isJa ? '食品用キャップ＆マスク' : 'Food Grade Caps & Masks', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-masks' },
        { name: isVi ? 'Găng tay cao su tiếp xúc thực phẩm' : isJa ? '食品接触用ゴム手袋' : 'Food Contact Rubber Gloves', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-gloves' },
        { name: isVi ? 'Giấy lau băng tải không bụi' : isJa ? '無塵コンベアワイパー' : 'Lint-free Conveyor Wipers', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-wipers' }
      ],
      cleanroomViewAll: isVi ? 'Xem tất cả sản phẩm phòng sạch' : isJa ? 'すべてのクリーンルーム製品を見る' : 'See all cleanroom products',
      packagingIntro: isVi ? 'Màng bọc, màng co đóng gói an toàn thực phẩm.' : isJa ? '食品安全衛生に準拠したラッピング・シュリンクフィルム。' : 'Wrapping and shrink film solutions complying with food safety standards.',
      packagingCategories: [
        { name: isVi ? 'Màng PE quấn pallet thực phẩm' : isJa ? '食品パレット用PEフィルム' : 'Food Grade PE Pallet Film', image: '/images/industries/electronics_hero.webp', slug: 'industrial-packaging' }
      ],
      packagingViewAll: isVi ? 'Xem tất cả sản phẩm đóng gói' : isJa ? 'すべての包装製品を見る' : 'See all packaging products',
      casesTitle: isVi ? 'Trường hợp áp dụng thực tế' : isJa ? '実際の導入事例' : 'Real-world Applications',
      cases: [
        {
          title: isVi ? 'Cải tiến quy trình đóng gói hàng xuất khẩu thủy sản' : isJa ? '水産輸出製品包装プロセスの改善' : 'Improving seafood export packaging process',
          description: isVi ? 'Sử dụng màng PE lực căng cao của ULink giúp pallet thủy sản vững chắc, chống ẩm lạnh 100% suốt quá trình vận chuyển đường biển.' : isJa ? 'ULinkの高張力PEフィルムを使用することで、海上輸送中も水産パレットを強固に固定し、100%防湿防寒します。' : 'Using ULink high-tension PE film secured seafood pallets firmly, ensuring 100% moisture protection during ocean freight.',
          image: '/images/industries/electronics_hero.webp',
          badge: isVi ? 'Chống ẩm 100%' : isJa ? '100%防湿' : '100% Moisture Proof'
        },
        {
          title: isVi ? 'Giảm thiểu dị vật tại nhà máy sữa chua' : isJa ? 'ヨーグルト工場における異物混入の削減' : 'Reducing foreign object entry at yogurt factory',
          description: isVi ? 'Thay thế trang phục bảo hộ thông thường bằng bộ đồ chống phát tán xơ vải của ULink giúp tỷ lệ dị vật đạt mức 0%.' : isJa ? '通常の防護服をULinkの発塵防止ウェアに変更したことで、異物混入率が0%になりました。' : 'Replacing regular suits with ULink lint-free coveralls successfully reduced foreign object entry rate to 0%.',
          image: '/images/industries/electronics_hero.webp',
          badge: isVi ? 'Dị vật giảm về 0%' : isJa ? '異物混入0%' : '0% Foreign Objects'
        }
      ],
      whyUsTitle: isVi ? 'Vì sao chọn ULINK?' : isJa ? 'なぜULINKを選ぶのか？' : 'Why Choose ULINK?',
      whyUsList: isVi
        ? ['Sản phẩm đạt chuẩn FDA, an toàn tuyệt đối cho thực phẩm', 'Kiểm soát chất lượng vệ sinh nghiêm ngặt đạt chuẩn HACCP', 'Chuỗi cung ứng bền vững và giải pháp logistics tối ưu', 'Hỗ trợ thiết kế kích thước và quy cách theo yêu cầu riêng']
        : isJa
          ? ['FDA基準を満たし、食品に完全に安全な製品', 'HACCP基準に準拠した厳格な衛生・品質管理', '持続可能なサプライチェーンと最適化された物流ソリューション', 'ご要望に応じたカスタムサイズ・仕様の設計サポート']
          : ['Products meeting FDA standards, fully safe for food contact', 'Strict hygiene and quality control complying with HACCP standards', 'Sustainable supply chain and optimized logistics solutions', 'Support for custom size and specifications design tailoring'],
      standardsTitle: isVi ? 'Chứng nhận & tiêu chuẩn áp dụng' : isJa ? '適用される認証＆規格' : 'Certifications & Standards',
      standards: [
        { name: 'FDA 21 CFR', detail: isVi ? 'Tiêu chuẩn an toàn vật liệu tiếp xúc trực tiếp thực phẩm Hoa Kỳ.' : isJa ? '米国FDA食品直接接触安全基準。' : 'FDA regulations for direct food contact safety.' },
        { name: 'HACCP', detail: isVi ? 'Hệ thống phân tích mối nguy và kiểm soát điểm tới hạn trong chế biến.' : isJa ? 'ハサップ食品衛生・危険分析重要管理点。' : 'Hazard analysis and critical control points in food.' },
        { name: 'ISO 22000:2018', detail: isVi ? 'Hệ thống quản lý an toàn thực phẩm chuỗi cung ứng toàn cầu.' : isJa ? '食品安全マネジメントシステム国際規格。' : 'Food safety management system for global supply chains.' },
        { name: 'ISO 9001:2015', detail: isVi ? 'Hệ thống quản lý chất lượng quy trình bao bì và chế biến thực phẩm.' : isJa ? '食品加工・包装プロセスの品質管理。' : 'Quality management system for food processing & packaging.' }
      ],
      resourcesTitle: isVi ? 'Tài liệu liên quan' : isJa ? '関連資料' : 'Related Resources',
      catalogue: {
        title: isVi ? 'Catalogue giải pháp ngành Thực phẩm & Đồ uống' : isJa ? '食品・飲料向けカタログ' : 'Solutions Catalogue for Food & Beverage',
        info: 'PDF / 5.8MB',
        url: '#'
      }
    };
  }

  if (actualSlug === 'logistics') {
    return {
      slug: 'logistics',
      name: isVi ? 'Kho vận & Logistics' : isJa ? '倉庫＆物流' : 'Warehouse & Logistics',
      title: isVi ? 'Giải pháp cho ngành Kho vận & Logistics' : isJa ? '倉庫＆物流向けソリューション' : 'Solutions for Warehouse & Logistics',
      description: isVi
        ? 'Tối ưu hóa quy trình lưu kho, vận chuyển và phân phối hàng hóa với giải pháp màng quấn pallet, bao bì chống ẩm và chống va đập chuyên dụng.'
        : isJa
          ? '専用のパレットラッピングフィルム、防湿・耐衝撃包装ソリューションにより、倉庫保管、輸送、および流通プロセスを最適化します。'
          : 'Optimize warehousing, transport, and distribution processes with specialized pallet wrap film, moisture-proof, and anti-impact packaging solutions.',
      iconName: 'Warehouse',
      gradient: 'from-brand-deep to-brand',
      bannerImage: '/images/brand/ulink-industry-logistics-royal-v1.webp',
      valueProps: [
        {
          title: isVi ? 'Tối ưu lưu kho & vận chuyển' : isJa ? '保管・輸送の最適化' : 'Storage & Transport Optimization',
          desc: isVi ? 'Bảo vệ hàng hóa vững chắc khi xếp chồng và di chuyển đường dài.' : isJa ? '長距離移動や積み重ね時の貨物を強固に保護。' : 'Firmly protects goods during stacking and long-distance transport.',
          iconName: 'ShieldCheck'
        },
        {
          title: isVi ? 'Giảm thiểu tỷ lệ hư hỏng' : isJa ? '破損率の削減' : 'Minimize Damage Rate',
          desc: isVi ? 'Chống ẩm, chống nước bám và chống trầy xước bao bì bên ngoài.' : isJa ? '外装包装の防湿・防水・防傷効果。' : 'Moisture-proof, waterproof, and scratch-resistant for outer packaging.',
          iconName: 'Activity'
        },
        {
          title: isVi ? 'Tăng tốc độ đóng gói' : isJa ? '梱包スピードの向上' : 'Accelerate Packaging Speed',
          desc: isVi ? 'Màng co & màng quấn pallet lực căng cao giúp đóng kiện nhanh.' : isJa ? '高張力シュリンク＆パレットフィルムで迅速な梱包を実現。' : 'High-tension shrink & pallet wrap enables fast bundling.',
          iconName: 'Settings'
        },
        {
          title: isVi ? 'Tiết kiệm chi phí bao bì' : isJa ? '包装コストの削減' : 'Save Packaging Costs',
          desc: isVi ? 'Tối ưu độ dày và chiều dài cuộn màng giúp giảm hao phí 20%.' : isJa ? 'フィルムの厚みと長さを最適化し無駄を20%削減。' : 'Optimized thickness and roll length reduces waste by 20%.',
          iconName: 'Zap'
        }
      ],
      challengesIntro: isVi ? 'Thách thức trong ngành Kho vận & Logistics' : isJa ? '倉庫＆物流における課題' : 'Challenges in Logistics',
      challenges: [
        {
          title: isVi ? 'Hàng hóa dịch chuyển gãy đổ khi vận chuyển' : isJa ? '輸送中の貨物の荷崩れ・破損' : 'Cargo shifting and tumbling during transport',
          desc: isVi ? 'Màng quấn kém chất lượng bị đứt cuộn làm pallet hàng bị xiêu quẹo và va đập.' : isJa ? '低品質なフィルムの切れによりパレット荷崩れが発生。' : 'Poor quality film snaps cause pallet goods to lean and impact each other.',
          iconName: 'AlertCircle'
        },
        {
          title: isVi ? 'Độ ẩm kho bãi làm hỏng thùng carton' : isJa ? '倉庫の湿気によるダンボールの破損' : 'Warehouse moisture softening cartons',
          desc: isVi ? 'Độ ẩm cao tại kho lạnh làm nhũn rách vỏ hộp bọc ngoài hàng hóa.' : isJa ? '冷暗倉庫での高湿度により外装箱が軟化・破損。' : 'High humidity in cold storage softens and tears outer cartons.',
          iconName: 'Sparkles'
        }
      ],
      cleanroomIntro: isVi ? 'Vật tư bảo hộ & an toàn lao động trong kho bãi.' : isJa ? '倉庫内での安全・保護用品。' : 'Safety and protective gear in warehousing.',
      cleanroomCategories: [
        { name: isVi ? 'Găng tay kho bãi & bốc xếp' : isJa ? '倉庫・荷役用手袋' : 'Warehouse Handling Gloves', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-gloves' },
        { name: isVi ? 'Khẩu trang chống bụi kho' : isJa ? '防塵防護マスク' : 'Dust Protective Masks', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-masks' }
      ],
      cleanroomViewAll: isVi ? 'Xem tất cả sản phẩm bảo hộ kho' : isJa ? 'すべての保護用品を見る' : 'See all warehouse safety products',
      packagingIntro: isVi ? 'Giải pháp màng quấn & bao bì đóng kiện vận chuyển.' : isJa ? 'パレット梱包・輸送用フィルムソリューション。' : 'Pallet wrapping and shipping packaging solutions.',
      packagingCategories: [
        { name: isVi ? 'Màng PE quấn pallet lực căng cao' : isJa ? '高張力PEパレットフィルム' : 'High-Tension PE Pallet Film', image: '/images/industries/electronics_hero.webp', slug: 'industrial-packaging' },
        { name: isVi ? 'Màng co PE bảo vệ hàng hóa' : isJa ? '保護用PEシュリンクフィルム' : 'Protective PE Shrink Film', image: '/images/industries/electronics_hero.webp', slug: 'industrial-packaging' }
      ],
      packagingViewAll: isVi ? 'Xem tất cả sản phẩm đóng gói' : isJa ? 'すべての包装製品を見る' : 'See all packaging products',
      casesTitle: isVi ? 'Trường hợp áp dụng thực tế' : isJa ? '実際の導入事例' : 'Real-world Applications',
      cases: [
        {
          title: isVi ? 'Tối ưu hóa quy trình quấn pallet tại Tổng kho Bắc Ninh' : isJa ? 'バクニン倉庫でのパレット梱包最適化' : 'Optimizing Pallet Wrapping at Bac Ninh Depot',
          description: isVi ? 'Tăng 35% tốc độ đóng gói và triệt tiêu 100% rủi ro đổ vỡ pallet khi vận chuyển đường dài.' : isJa ? '梱包スピードを35%向上させ、長距離輸送時の荷崩れを100%防止。' : 'Increased packaging speed by 35% and eliminated 100% of long-distance pallet collapse risks.',
          image: '/images/industries/electronics_hero.webp',
          badge: isVi ? 'Tăng 35% tốc độ' : isJa ? 'スピード35%向上' : '35% Faster Speed'
        }
      ],
      whyUsTitle: isVi ? 'Vì sao chọn ULINK?' : isJa ? 'なぜULINKを選ぶのか？' : 'Why Choose ULINK?',
      whyUsList: isVi
        ? ['Đạt tiêu chuẩn đóng gói vận tải quốc tế ISTA', 'Màng PE lực dai vượt trội chống rách thủng', 'Nguồn cung dồi dào, giao hàng kho trong 24h', 'Hỗ trợ thiết kế kích thước cuộn màng theo máy quấn']
        : isJa
          ? ['国際輸送梱包規格ISTAに準拠', '優れた耐引き裂き性を持つPEフィルム', '豊富な在庫で24時間以内に納品', '自動巻き機に応じたフィルムサイズ設計']
          : ['Complying with ISTA international transport packaging standards', 'Superior puncture-resistant PE film', 'Abundant inventory, 24h warehouse delivery', 'Custom roll size design for automatic wrappers'],
      standardsTitle: isVi ? 'Chứng nhận & tiêu chuẩn áp dụng' : isJa ? '適用される認証＆規格' : 'Certifications & Standards',
      standards: [
        { name: 'ISTA 3A / 6', detail: isVi ? 'Tiêu chuẩn thử nghiệm độ bền bao bì đóng gói vận tải quốc tế.' : isJa ? '国際安全輸送協会試験規格。' : 'International safe transit association packaging test standard.' },
        { name: 'ISO 9001:2015', detail: isVi ? 'Hệ thống quản lý chất lượng quy trình lưu kho và phân phối.' : isJa ? '倉庫保管および流通プロセスの品質管理。' : 'Quality management system for warehousing & distribution.' },
        { name: 'ISO 14001:2015', detail: isVi ? 'Tiêu chuẩn vận hành kho bãi xanh và quản lý môi trường.' : isJa ? 'グリーン倉庫管理および環境適合規格。' : 'Environmental management system for green warehousing.' },
        { name: 'RoHS & REACH', detail: isVi ? 'Chứng nhận an toàn vật liệu màng PE quấn pallet và túi chống ẩm.' : isJa ? 'パレットフィルムおよび防湿袋の資材安全認証。' : 'Material safety compliance for PE film and desiccant bags.' }
      ],
      resourcesTitle: isVi ? 'Tài liệu liên quan' : isJa ? '関連資料' : 'Related Resources',
      catalogue: {
        title: isVi ? 'Catalogue giải pháp ngành Kho vận & Logistics' : isJa ? '倉庫＆物流向けカタログ' : 'Solutions Catalogue for Logistics',
        info: 'PDF / 5.5MB',
        url: '#'
      }
    };
  }

  if (actualSlug === 'furniture') {
    return {
      slug: 'furniture',
      name: isVi ? 'Đồ gỗ - Nội thất' : isJa ? '家具・インテリア' : 'Furniture & Interior',
      title: isVi ? 'Giải pháp cho ngành Đồ gỗ - Nội thất' : isJa ? '家具・インテリア産業向けソリューション' : 'Solutions for Furniture & Interior',
      description: isVi
        ? 'Bảo vệ toàn diện bề mặt gỗ, da, vải và kim loại trong suốt quy trình sản xuất, vận chuyển và lắp đặt nội thất cao cấp.'
        : isJa
          ? '高級家具の製造、輸送、設置プロセス全体において、木材、皮革、布地、金属の表面を包括的に保護します。'
          : 'Comprehensive protection for wood, leather, fabric, and metal surfaces throughout the manufacturing, transport, and installation of premium furniture.',
      iconName: 'Armchair',
      gradient: 'from-brand-deep to-brand',
      bannerImage: '/images/brand/ulink-industry-furniture-royal-v1.webp',
      valueProps: [
        {
          title: isVi ? 'Bảo vệ bề mặt cao cấp' : isJa ? '高級表面保護' : 'Premium Surface Protection',
          desc: isVi ? 'Chống trầy xước nước sơn gỗ và bề mặt da cao cấp.' : isJa ? '塗装面や高級皮革の傷を完全に防止。' : 'Prevents scratches on wood paint and premium leather.',
          iconName: 'ShieldCheck'
        },
        {
          title: isVi ? 'Chống ẩm mốc xuất khẩu' : isJa ? '輸出用防湿・防カビ' : 'Export Anti-Mold',
          desc: isVi ? 'Hạn chế ẩm mốc trong container đi biển dài ngày.' : isJa ? '海上コンテナ輸送中の湿気・カビを抑制。' : 'Prevents mold in long ocean container transits.',
          iconName: 'Activity'
        }
      ],
      challengesIntro: isVi ? 'Thách thức trong ngành Nội thất' : isJa ? '家具産業における課題' : 'Challenges in Furniture',
      challenges: [
        {
          title: isVi ? 'Trầy xước nước sơn gỗ khi va chạm' : isJa ? '衝突による木材塗装の傷' : 'Scratches on wood finish from collisions',
          desc: isVi ? 'Va quệt trong quá trình di chuyển từ xưởng ra kho làm hỏng lớp sơn PU.' : isJa ? '工場から倉庫への移動時の擦れでPU塗装が損壊。' : 'Friction during transit damages the PU paint coat.',
          iconName: 'AlertCircle'
        }
      ],
      cleanroomIntro: isVi ? 'Trang phục & vật tư sạch cho phòng sơn nội thất.' : isJa ? '家具塗装室用クリーンウェア＆資材。' : 'Cleanwear & supplies for furniture paint rooms.',
      cleanroomCategories: [
        { name: isVi ? 'Khẩu trang phòng sơn nội thất' : isJa ? '塗装用防護マスク' : 'Furniture Paint Room Masks', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-masks' }
      ],
      cleanroomViewAll: isVi ? 'Xem tất cả sản phẩm phòng sơn' : isJa ? 'すべての塗装用品を見る' : 'See all paint room products',
      packagingIntro: isVi ? 'Giải pháp màng bọc bảo vệ bề mặt gỗ & bao bì đóng gói.' : isJa ? '木材保護フィルム＆梱包ソリューション。' : 'Wood surface protection film & packaging solutions.',
      packagingCategories: [
        { name: isVi ? 'Màng PE bọc bảo vệ bề mặt gỗ' : isJa ? '木材表面保護PEフィルム' : 'Wood Surface PE Protective Film', image: '/images/industries/electronics_hero.webp', slug: 'industrial-packaging' }
      ],
      packagingViewAll: isVi ? 'Xem tất cả sản phẩm đóng gói' : isJa ? 'すべての包装製品を見る' : 'See all packaging products',
      casesTitle: isVi ? 'Trường hợp áp dụng thực tế' : isJa ? '実際の導入事例' : 'Real-world Applications',
      cases: [
        {
          title: isVi ? 'Bảo vệ đồ gỗ xuất khẩu Mỹ cho Nhà máy Gỗ An Cường' : isJa ? 'An Cường工場向け米国輸出家具の保護' : 'Protecting US Export Furniture for An Cuong Factory',
          description: isVi ? 'Loại bỏ 100% khiếu nại trầy xước sơn và giảm 40% thời gian bọc hàng thủ công.' : isJa ? '塗装傷のクレームを100%排除し、手梱包時間を40%削減。' : 'Eliminated 100% of paint scratch complaints and reduced manual wrap time by 40%.',
          image: '/images/industries/electronics_hero.webp',
          badge: isVi ? 'Giảm 100% lỗi sơn' : isJa ? '傷クレーム0' : 'Zero Scratch Complaints'
        }
      ],
      whyUsTitle: isVi ? 'Vì sao chọn ULINK?' : isJa ? 'なぜULINKを選ぶのか？' : 'Why Choose ULINK?',
      whyUsList: isVi
        ? ['Màng bọc bảo vệ chuyên dụng không để lại keo', 'Xốp PE foam định hình chống va đập góc hoàn hảo', 'Nguồn cung ổn định cho các tập đoàn gỗ xuất khẩu']
        : isJa
          ? ['のり残りしない専用保護フィルム', '角落ち防止の完璧な成形PEフォーム', '大手木材輸出企業への安定供給実績']
          : ['Specialized non-residue protective film', 'Perfect corner impact-proof PE foam shapes', 'Stable supply for major wood exporters'],
      standardsTitle: isVi ? 'Chứng nhận & tiêu chuẩn áp dụng' : isJa ? '適用される認証＆規格' : 'Certifications & Standards',
      standards: [
        { name: 'FSC CoC', detail: isVi ? 'Chứng nhận quản lý chuỗi hành trình sản phẩm rừng bền vững.' : isJa ? 'FSC森林認証 CoCサプライチェーン。' : 'Forest stewardship council chain of custody certification.' },
        { name: 'ISO 9001:2015', detail: isVi ? 'Hệ thống quản lý chất lượng bao bì bọc bảo vệ bề mặt nội thất.' : isJa ? '家具保護フィルムの品質管理システム。' : 'Quality management system for furniture protective packaging.' },
        { name: 'RoHS', detail: isVi ? 'Đảm bảo màng PE và xốp foam không chứa hóa chất độc hại.' : isJa ? 'PEフィルムおよびフォーム材の有害物質非含有証明。' : 'RoHS certification for non-hazardous PE film & foam.' },
        { name: 'REACH', detail: isVi ? 'An toàn keo dán bóc tách không để lại vết vệt trên gỗ cao cấp.' : isJa ? '高級木材用のり残りゼロ粘着剤の安全基準。' : 'EU chemical safety for non-residue protective adhesive film.' }
      ],
      resourcesTitle: isVi ? 'Tài liệu liên quan' : isJa ? '関連資料' : 'Related Resources',
      catalogue: {
        title: isVi ? 'Catalogue giải pháp ngành Đồ gỗ & Nội thất' : isJa ? '家具・インテリア向けカタログ' : 'Solutions Catalogue for Furniture',
        info: 'PDF / 5.2MB',
        url: '#'
      }
    };
  }

  if (actualSlug === 'construction') {
    return {
      slug: 'construction',
      name: isVi ? 'Xây dựng & Cơ khí - HVAC' : isJa ? '精密機械＆HVAC' : 'Precision Engineering & HVAC',
      title: isVi ? 'Giải pháp cho ngành Xây dựng & Cơ khí - HVAC' : isJa ? '精密機械＆HVAC向けソリューション' : 'Solutions for Engineering & HVAC',
      description: isVi
        ? 'Cung cấp vật tư cơ khí, phụ kiện ống đồng, van điều khiển, băng keo nhôm cách nhiệt và thiết bị HVAC chính hãng cho hệ thống điều hòa không khí.'
        : isJa
          ? '産業用空調・換気システム向けに、機械資材、銅管継手、制御バルブ、および純正HVAC機器を提供します。'
          : 'Providing engineering materials, copper pipe fittings, control valves, and genuine HVAC equipment for industrial air conditioning and ventilation systems.',
      iconName: 'Wrench',
      gradient: 'from-brand-deep to-brand',
      bannerImage: '/images/brand/ulink-industry-hvac-royal-v1.webp',
      valueProps: [
        {
          title: isVi ? 'Cách nhiệt & Tiết kiệm năng lượng' : isJa ? '断熱＆省エネ' : 'Insulation & Energy Saving',
          desc: isVi ? 'Băng keo nhôm cách nhiệt giúp giảm thất thoát nhiệt 25%.' : isJa ? '断熱アルミテープにより熱損失を25%削減。' : 'Aluminum insulation tape reduces heat loss by 25%.',
          iconName: 'ShieldCheck'
        },
        {
          title: isVi ? 'Chống oxy hóa & Rỉ sét' : isJa ? '防錆・防食' : 'Anti-Oxidation & Rust Proof',
          desc: isVi ? 'Bảo vệ đường ống đồng và linh kiện kim loại công trình.' : isJa ? '銅管や機械金属部品の長寿命化保護。' : 'Protects copper pipes and metal parts from rust.',
          iconName: 'Activity'
        }
      ],
      challengesIntro: isVi ? 'Thách thức trong ngành HVAC & Cơ khí' : isJa ? 'HVAC＆機械産業における課題' : 'Challenges in Engineering & HVAC',
      challenges: [
        {
          title: isVi ? 'Thất thoát nhiệt tại các mối nối ống gió' : isJa ? 'ダクト接続部における熱損失' : 'Heat loss at duct connections',
          desc: isVi ? 'Băng dán thông thường bị đứt keo khi nhiệt độ thay đổi.' : isJa ? '通常のテープは温度変化で粘着力が低下。' : 'Regular tape loses adhesion under temperature fluctuations.',
          iconName: 'AlertCircle'
        }
      ],
      cleanroomIntro: isVi ? 'Trang phục & găng tay bảo hộ cơ khí HVAC.' : isJa ? 'HVAC・機械作業用保護具。' : 'HVAC and mechanical safety gear.',
      cleanroomCategories: [
        { name: isVi ? 'Găng tay chống cắt cấp 5' : isJa ? 'Level 5耐切創手袋' : 'Level 5 Cut Resistant Gloves', image: '/images/industries/electronics_hero.webp', slug: 'cleanroom-gloves' }
      ],
      cleanroomViewAll: isVi ? 'Xem tất cả sản phẩm an toàn lao động' : isJa ? 'すべての安全用品を見る' : 'See all safety products',
      packagingIntro: isVi ? 'Vật tư dán cách nhiệt & màng bọc bảo vệ tấm ốp.' : isJa ? '断熱テープ＆保護フィルム。' : 'Insulation tape & protective film.',
      packagingCategories: [
        { name: isVi ? 'Băng keo nhôm cách nhiệt HVAC' : isJa ? 'HVAC用断熱アルミテープ' : 'HVAC Aluminum Foil Insulation Tape', image: '/images/industries/electronics_hero.webp', slug: 'industrial-packaging' }
      ],
      packagingViewAll: isVi ? 'Xem tất cả sản phẩm dán cách nhiệt' : isJa ? 'すべての断熱製品を見る' : 'See all insulation products',
      casesTitle: isVi ? 'Trường hợp áp dụng thực tế' : isJa ? '実際の導入事例' : 'Real-world Applications',
      cases: [
        {
          title: isVi ? 'Thi công hệ thống HVAC cho Nhà máy LG Hải Phòng' : isJa ? 'LGハイフォン工場HVACシステム施工' : 'HVAC Installation for LG Hai Phong Factory',
          description: isVi ? 'Sử dụng băng keo nhôm ULink giúp kín khí 100% và tiết kiệm 18% điện năng vận hành máy lạnh trung tâm.' : isJa ? 'ULinkアルミテープの採用で100%の気密性を確保し中央空調の消費電力を18%削減。' : 'Using ULink aluminum tape achieved 100% airtightness and saved 18% in central AC power consumption.',
          image: '/images/industries/electronics_hero.webp',
          badge: isVi ? 'Tiết kiệm 18% điện' : isJa ? '省エネ18%' : '18% Energy Savings'
        }
      ],
      whyUsTitle: isVi ? 'Vì sao chọn ULINK?' : isJa ? 'なぜULINKを選ぶのか？' : 'Why Choose ULINK?',
      whyUsList: isVi
        ? ['Băng keo nhôm chịu nhiệt & chống cháy đạt tiêu chuẩn UL 181', 'Găng tay chống cắt tiêu chuẩn EN 388 Level 5', 'Giao hàng tận chân công trình toàn quốc']
        : isJa
          ? ['UL 181適合の耐熱・難燃アルミテープ', 'EN 388 Level 5適合の耐切創手袋', '全国の施工現場へ直接納品可能']
          : ['UL 181 flame-retardant aluminum tape', 'EN 388 Level 5 cut resistant gloves', 'Direct jobsite delivery nationwide'],
      standardsTitle: isVi ? 'Chứng nhận & tiêu chuẩn áp dụng' : isJa ? '適用される認証＆規格' : 'Certifications & Standards',
      standards: [
        { name: 'UL 181', detail: isVi ? 'Tiêu chuẩn chống cháy và chịu nhiệt băng keo nhôm ống gió HVAC.' : isJa ? 'ULダクト・断熱難燃テープ規格。' : 'UL standard for safety factory-made air ducts & tapes.' },
        { name: 'EN 388 Level 5', detail: isVi ? 'Tiêu chuẩn găng tay bảo hộ chống cắt cao nhất cho cơ khí.' : isJa ? '耐切創手袋最高レベル規格。' : 'Highest cut resistance standard level for protective gloves.' },
        { name: 'ISO 9001:2015', detail: isVi ? 'Hệ thống quản lý chất lượng vật tư cơ khí công trình.' : isJa ? '機械建築資材の品質管理システム。' : 'Quality management system for engineering construction.' },
        { name: 'ISO 14001:2015', detail: isVi ? 'Quản lý an toàn môi trường và an toàn lao động thi công.' : isJa ? '施工現場の環境・安全管理規格。' : 'Environmental & occupational safety management system.' }
      ],
      resourcesTitle: isVi ? 'Tài liệu liên quan' : isJa ? '関連資料' : 'Related Resources',
      catalogue: {
        title: isVi ? 'Catalogue giải pháp ngành Xây dựng & Cơ khí HVAC' : isJa ? 'HVAC・建築ソリューションカタログ' : 'Solutions Catalogue for HVAC',
        info: 'PDF / 6.0MB',
        url: '#'
      }
    };
  }

  return null;
}

export async function generateMetadata({ params: { locale, slug } }: IndustryPageProps): Promise<Metadata> {
  const details = getIndustryDetails(slug, locale);
  if (!details) return { title: 'Không tìm thấy giải pháp | ULink B2B' };

  return {
    title: `${details.title} | ULink B2B`,
    description: details.description
  };
}

export default async function IndustryDetailPage({ params: { locale, slug } }: IndustryPageProps) {
  setRequestLocale(locale);

  let actualSlug = slug;
  if (slug === 'pharmaceutical' || slug === 'cosmetics' || slug === 'pharma-medical') {
    actualSlug = 'pharmaceutical-cosmetics';
  } else if (slug === 'food' || slug === 'food-beverage') {
    actualSlug = 'food-beverage';
  } else if (slug === 'furniture-wood') {
    actualSlug = 'furniture';
  } else if (slug === 'construction-hvac' || slug === 'manufacturing') {
    actualSlug = 'construction';
  }

  const industryData = getIndustryDetails(actualSlug, locale);
  if (!industryData) {
    notFound();
  }

  // Fetch real products belonging to this industry slug
  const { products } = await fetchProducts({
    industry: actualSlug,
    limit: 8
  });

  const isVi = locale === 'vi';
  const isJa = locale === 'ja';

  const translations = {
    home: isVi ? 'Trang chủ' : isJa ? 'ホーム' : 'Home',
    resources: isVi ? 'Tài nguyên' : isJa ? 'リソース' : 'Resources',
    overview: isVi ? 'Tổng quan' : isJa ? '概要' : 'Overview',
    cleanroomSol: isVi ? 'Giải pháp phòng sạch' : isJa ? 'クリーンルーム' : 'Cleanroom Solutions',
    packagingSol: isVi ? 'Giải pháp đóng gói' : isJa ? '包装' : 'Packaging Solutions',
    cases: isVi ? 'Trường hợp áp dụng' : isJa ? '導入事例' : 'Case Studies',
    recommendedProducts: isVi ? 'Sản phẩm đề xuất' : isJa ? 'おすすめ製品' : 'Recommended Products',
    resourceTab: isVi ? 'Tài nguyên' : isJa ? '資料' : 'Resources',
    seeAll: isVi ? 'Xem toàn bộ' : isJa ? 'すべてを見る' : 'See all',
    contactSupport: isVi ? 'Liên hệ hỗ trợ kỹ thuật' : isJa ? '技術サポートに連絡' : 'Contact Support',
    noProductDesc: isVi
      ? 'Chưa có sản phẩm đề xuất cụ thể cho ngành này. Vui lòng liên hệ bộ phận hỗ trợ kỹ thuật.'
      : isJa
        ? 'この業界向けの特定の推奨製品はまだありません。技術サポート部門にお問い合わせください。'
        : 'No specific recommended products for this industry yet. Please contact technical support.'
  };

  return (
    <IndustryDetailClient
      industryData={industryData}
      products={products}
      locale={locale}
      currentSlug={slug}
      translations={translations}
    >
      <CtaBanner containerClassName="max-w-[1440px] px-4 sm:px-8 lg:px-16" />
    </IndustryDetailClient>
  );
}
