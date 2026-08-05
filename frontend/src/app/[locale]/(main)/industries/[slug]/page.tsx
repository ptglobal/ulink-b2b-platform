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
  const isEn = !isVi && !isJa;

  let actualSlug = slug;
  if (slug === 'pharmaceutical' || slug === 'cosmetics') {
    actualSlug = 'pharmaceutical-cosmetics';
  } else if (slug === 'food') {
    actualSlug = 'food-beverage';
  }

  const VALID_SLUGS = ['electronics', 'pharmaceutical-cosmetics', 'food-beverage'];
  if (!VALID_SLUGS.includes(actualSlug)) {
    return null;
  }

  if (actualSlug === 'electronics') {
    return {
      slug: 'electronics',
      name: isVi ? 'Điện tử & Bán dẫn' : isJa ? '電子・半導体' : 'Electronics & Semiconductors',
      title: isVi 
        ? 'Giải pháp cho ngành Điện tử & Bán dẫn' 
        : isJa 
        ? '電子・半導体産業向けソリューション' 
        : 'Solutions for Electronics & Semiconductors',
      description: isVi
        ? 'Tối ưu kiểm soát ô nhiễm và quy trình đóng gói để đảm bảo chất lượng và độ tin cậy của linh kiện điện tử.'
        : isJa
        ? '電子部品の品質と信頼性を確保するために、汚染管理と包装プロセスを最適化します。'
        : 'Optimize contamination control and packaging processes to ensure the quality and reliability of electronic components.',
      iconName: 'Cpu',
      gradient: 'from-blue-600 to-indigo-900',
      bannerImage: '/images/industries/electronics_hero.webp',
      valueProps: [
        {
          title: isVi ? 'Đảm bảo chất lượng cao' : isJa ? '高品質の保証' : 'High Quality Assurance',
          desc: isVi 
            ? 'Kiểm soát tĩnh điện và hạt bụi giúp giảm thiểu rủi ro lỗi sản phẩm.' 
            : isJa 
            ? '静電気とチリの制御により、製品の欠陥リスクを最小限に抑えます。' 
            : 'Controlling static and dust particles minimizes product defect risks.',
          iconName: 'ShieldCheck'
        },
        {
          title: isVi ? 'Nâng cao hiệu suất sản xuất' : isJa ? '生産効率の向上' : 'Enhance Production Efficiency',
          desc: isVi 
            ? 'Tiêu chuẩn hóa vật tư và quy trình giúp tăng hiệu quả và năng suất.' 
            : isJa 
            ? '資材とプロセスの標準化により、効率と生産性が向上します。' 
            : 'Standardizing supplies and processes improves efficiency and productivity.',
          iconName: 'Settings'
        },
        {
          title: isVi ? 'Tối ưu chuỗi cung ứng' : isJa ? 'サプライチェーンの最適化' : 'Optimize Supply Chain',
          desc: isVi 
            ? 'Nguồn cung ổn định toàn cầu và giao hàng đúng hạn.' 
            : isJa 
            ? '安定したグローバル供給とタイムリーな納品。' 
            : 'Stable global supply and timely delivery.',
          iconName: 'Globe'
        },
        {
          title: isVi ? 'Tối ưu hóa chi phí' : isJa ? 'コスト最適化' : 'Cost Optimization',
          desc: isVi 
            ? 'Giải pháp vật tư toàn diện giúp tiết kiệm chi phí vận hành.' 
            : isJa 
            ? '包括的な資材ソリューションにより、運用コストを削減します。' 
            : 'Comprehensive supply solutions help save operational costs.',
          iconName: 'Zap'
        }
      ],
      challengesIntro: isVi 
        ? 'Thách thức trong ngành Điện tử' 
        : isJa 
        ? '電子産業における課題' 
        : 'Challenges in the Electronics Industry',
      challenges: [
        {
          title: isVi ? 'Hạt bụi siêu nhỏ gây lỗi sản phẩm' : isJa ? '極小の塵埃による製品の不具合' : 'Micro dust particles causing product defects',
          desc: isVi
            ? 'Hạt bụi siêu mịn bám dính trên các lớp quang khắc gây chập mạch, đứt đường dẫn điện cực.'
            : isJa
            ? '超微細な塵埃がフォトリソグラフィー層に付着し、短絡や電極の断線を引き起こします。'
            : 'Ultra-fine dust particles adhering to photolithography layers cause short circuits or electrode breakage.',
          iconName: 'Sparkles'
        },
        {
          title: isVi ? 'Tĩnh điện gây hư hỏng linh kiện' : isJa ? '静電気による部品の損傷' : 'Static electricity damaging components',
          desc: isVi
            ? 'Hiện tượng phóng tĩnh điện (ESD) gây hỏng chip ngầm không thể phát hiện bằng mắt thường.'
            : isJa
            ? '静電気放電（ESD）により、目視では検出できない潜在的なチップ破損が発生します。'
            : 'Electrostatic discharge (ESD) causes latent chip damage undetectable to the eye.',
          iconName: 'Zap'
        },
        {
          title: isVi ? 'Va đập trong vận chuyển gây suy giảm chất lượng' : isJa ? '輸送時の衝撃による品質低下' : 'Impact during transport degrading quality',
          desc: isVi
            ? 'Va đập, rung chấn và độ ẩm cao trong quá trình lưu kho và vận chuyển làm giảm độ tin cậy và tuổi thọ linh kiện.'
            : isJa
            ? '保管や輸送中の衝撃、振動、高湿度は、部品の信頼性と寿命を低下させます。'
            : 'Impacts, vibrations, and high humidity during storage and transport reduce component reliability and lifespan.',
          iconName: 'Truck'
        }
      ],
      cleanroomIntro: isVi
        ? 'Duy trì môi trường sản xuất sạch sẽ, kiểm soát hạt bụi và tĩnh điện.'
        : isJa
        ? 'クリーンな製造環境を維持し、塵埃と静電気を制御します。'
        : 'Maintain a clean manufacturing environment, controlling dust particles and static electricity.',
      cleanroomCategories: [
        {
          name: isVi ? 'Quần áo phòng sạch & phụ kiện' : isJa ? 'クリーンルームウェア＆用品' : 'Cleanroom Wear & Accessories',
          image: '/images/industries/cleanroom_suit.webp',
          slug: 'cleanroom-consumables'
        },
        {
          name: isVi ? 'Găng tay phòng sạch' : isJa ? 'クリーンルーム手袋' : 'Cleanroom Gloves',
          image: '/images/home/product-gloves.jpg',
          slug: 'cleanroom-consumables'
        },
        {
          name: isVi ? 'Khẩu trang phòng sạch' : isJa ? 'クリーンルームマスク' : 'Cleanroom Masks',
          image: '/images/industries/cleanroom_mask.webp',
          slug: 'cleanroom-consumables'
        },
        {
          name: isVi ? 'Thảm dính bụi' : isJa ? '粘着マット' : 'Sticky Mats',
          image: '/images/industries/sticky_mat.webp',
          slug: 'cleanroom-consumables'
        }
      ],
      cleanroomViewAll: isVi ? 'Xem tất cả sản phẩm phòng sạch' : isJa ? 'すべてのクリーンルーム製品を見る' : 'See all cleanroom products',
      packagingIntro: isVi
        ? 'Bảo vệ linh kiện trong quá trình lưu trữ và vận chuyển.'
        : isJa
        ? '保管および輸送プロセスにおいて部品を保護します。'
        : 'Protect components during storage and transportation processes.',
      packagingCategories: [
        {
          name: isVi ? 'Màng PE (LLDPE)' : isJa ? 'PEストレッチフィルム' : 'PE Stretch Film (LLDPE)',
          image: '/images/industries/pe_film.webp',
          slug: 'industrial-packaging'
        },
        {
          name: isVi ? 'Túi chống tĩnh điện & màng chống tĩnh điện' : isJa ? '帯電防止袋＆フィルム' : 'ESD Shielding Bags & Film',
          image: '/images/industries/shielding_bag.webp',
          slug: 'industrial-packaging'
        },
        {
          name: isVi ? 'Khay nhựa (ESD)' : isJa ? 'ESDプラスチックトレイ' : 'ESD Plastic Trays',
          image: '/images/industries/esd_tray.webp',
          slug: 'industrial-packaging'
        },
        {
          name: isVi ? 'Túi nhôm chống ẩm' : isJa ? '防湿アルミ袋' : 'Moisture Barrier Aluminum Bags',
          image: '/images/industries/shielding_bag.webp',
          slug: 'industrial-packaging'
        }
      ],
      packagingViewAll: isVi ? 'Xem tất cả sản phẩm đóng gói' : isJa ? 'すべての包装製品を見る' : 'See all packaging products',
      casesTitle: isVi ? 'Trường hợp áp dụng thực tế' : isJa ? '実際の導入事例' : 'Real-world Applications',
      cases: [
        {
          title: isVi 
            ? 'Cải thiện môi trường sản xuất tại nhà máy linh kiện' 
            : isJa 
            ? '部品工場における製造環境の改善' 
            : 'Improving production environment at component factory',
          description: isVi
            ? 'Giảm tỉ lệ lỗi sản phẩm từ 1.8% xuống 1.2% nhờ quy trình kiểm soát hạt bụi và tĩnh điện đồng bộ tại phòng sạch Class 100.'
            : isJa
            ? 'Class 100クリーンルームでの一貫した塵埃と静電気管理プロセスにより、製品不具合率を1.8%から1.2%に低減。'
            : 'Reduced product defect rate from 1.8% to 1.2% through synchronized dust and static control processes in a Class 100 cleanroom.',
          image: '/images/industries/case_cleanroom.webp',
          badge: isVi ? 'Giảm 32% lỗi' : isJa ? '不良率32%低減' : '32% Defect Reduction'
        },
        {
          title: isVi 
            ? 'Tối ưu bao bì cho doanh nghiệp lắp ráp bán dẫn' 
            : isJa 
            ? '半導体アセンブリ企業の包装最適化' 
            : 'Optimizing packaging for semiconductor assembly company',
          description: isVi
            ? 'Loại bỏ hoàn toàn rủi ro phóng tĩnh điện trong quá trình vận chuyển liên tỉnh bằng cách chuyển sang khay nhựa ESD và túi nhôm che chắn sóng.'
            : isJa
            ? 'ESDプラスチックトレイとシールドアルミ袋への変更により、都市間輸送中の静電気放電リスクを完全に排除。'
            : 'Completely eliminated electrostatic discharge risks during inter-provincial transit by switching to ESD plastic trays and shielding aluminum bags.',
          image: '/images/industries/case_packaging.webp',
          badge: isVi ? 'Giảm 45% hư hỏng' : isJa ? '破損45%削減' : '45% Damage Reduction'
        },
        {
          title: isVi 
            ? 'Giải pháp cho nhà cung cấp linh kiện điện tử' 
            : isJa 
            ? '電子部品サプライヤー向けソリューション' 
            : 'Solutions for electronic component suppliers',
          description: isVi
            ? 'Tăng 28% hiệu suất đóng gói cuối cùng, tăng tốc độ xử lý đơn hàng và tiết kiệm 15% chi phí vật tư bằng thiết kế cuộn màng PE tùy chỉnh.'
            : isJa
            ? 'カスタム設計のPEフィルムロールの導入により、最終包装効率が28%向上し、注文処理の迅速化と15%の資材コスト削減を実現。'
            : 'Increased final packaging efficiency by 28%, accelerated order processing, and saved 15% in materials cost through custom PE film roll designs.',
          image: '/images/industries/case_supplier.webp',
          badge: isVi ? 'Tăng 28% hiệu suất' : isJa ? '効率28%向上' : '28% Efficiency Increase'
        }
      ],
      whyUsTitle: isVi ? 'Vì sao chọn ULINK?' : isJa ? 'なぜULINKを選ぶのか？' : 'Why Choose ULINK?',
      whyUsList: isVi 
        ? [
            'Sản phẩm đạt tiêu chuẩn chất lượng phòng sạch cao cấp',
            'Quy trình kiểm soát chất lượng kiểm định nghiêm ngặt',
            'Chuỗi cung ứng ổn định toàn cầu, giao hàng đúng hẹn',
            'Hỗ trợ kỹ thuật chuyên sâu và tùy chỉnh theo yêu cầu riêng'
          ]
        : isJa
        ? [
            '高品質クリーンルーム基準を満たす製品',
            '厳格な品質管理・検査プロセス',
            '安定したグローバルサプライチェーンと確実な納期',
            '技術サポートと個別要望への柔軟な対応'
          ]
        : [
            'Products meeting high cleanroom quality standards',
            'Strict quality control and inspection processes',
            'Stable global supply chain and timely delivery',
            'Dedicated technical support & custom tailoring'
          ],
      standardsTitle: isVi ? 'Chứng nhận & tiêu chuẩn áp dụng' : isJa ? '適用される認証＆規格' : 'Certifications & Standards',
      standards: [
        { name: 'ISO 9001', detail: isVi ? 'Quản lý chất lượng' : isJa ? '品質管理' : 'Quality Management' },
        { name: 'ISO 14001', detail: isVi ? 'Quản lý môi trường' : isJa ? '環境管理' : 'Environmental Mgmt' },
        { name: 'RoHS', detail: isVi ? 'Hạn chế chất nguy hại' : isJa ? '有害物質制限' : 'Restricted Substances' },
        { name: 'REACH', detail: isVi ? 'An toàn hóa chất' : isJa ? '化学物質安全' : 'Chemical Safety' }
      ],
      resourcesTitle: isVi ? 'Tài liệu liên quan' : isJa ? '関連資料' : 'Related Resources',
      catalogue: {
        title: isVi 
          ? 'Catalogue giải pháp cho ngành Điện tử' 
          : isJa 
          ? '電子産業向けソリューションカタログ' 
          : 'Solutions Catalogue for Electronics',
        info: 'PDF / 6.2MB',
        url: '#'
      }
    };
  }

  if (actualSlug === 'pharmaceutical-cosmetics') {
    return {
      slug: 'pharmaceutical-cosmetics',
      name: isVi ? 'Dược phẩm & Y tế' : isJa ? '医薬品・医療' : 'Pharmaceuticals & Medical',
      title: isVi 
        ? 'Giải pháp cho ngành Dược phẩm' 
        : isJa 
        ? '医薬品・医療産業向けソリューション' 
        : 'Solutions for Pharmaceuticals & Medical',
      description: isVi
        ? 'ULink Industries cung cấp hệ thống vật tư phòng sạch PPE chuẩn vô trùng, màng đóng gói bảo vệ và các giải pháp chống ô nhiễm chéo tối ưu đạt chuẩn GMP, ISO 14644 và FDA.'
        : isJa
        ? 'ULink Industriesは、GMP、ISO 14644、およびFDA規格に準拠した無菌PPEクリーンルーム用品、保護包装用フィルム、および最適な交差汚染防止ソリューションを提供します。'
        : 'ULink Industries provides sterile PPE cleanroom supplies, protective packaging films, and optimal anti-cross contamination solutions complying with GMP, ISO 14644, and FDA standards.',
      iconName: 'Activity',
      gradient: 'from-emerald-600 to-teal-900',
      bannerImage: '/images/industries/indus.png',
      valueProps: [
        {
          title: isVi ? 'Chuẩn vô trùng tối đa' : isJa ? '最大レベルの無菌' : 'Max Sterility Level',
          desc: isVi 
            ? 'Đạt tiêu chuẩn phòng sạch Class 100 - ISO 5 khắt khe.' 
            : isJa 
            ? '厳しいClass 100 - ISO 5クリーンルーム基準に準拠。' 
            : 'Complies with strict Class 100 - ISO 5 cleanroom standards.',
          iconName: 'ShieldCheck'
        },
        {
          title: isVi ? 'Chống nhiễm chéo' : isJa ? '交差汚染防止' : 'Cross Contamination Control',
          desc: isVi 
            ? 'Vật tư thiết kế tối ưu giảm thiểu nguy cơ lây nhiễm vi sinh.' 
            : isJa 
            ? '微生物汚染リスクを最小限に抑える最適な資材設計。' 
            : 'Optimally designed supplies minimizing microbial risks.',
          iconName: 'Activity'
        },
        {
          title: isVi ? 'Đạt chuẩn GMP & FDA' : isJa ? 'GMP & FDA適合' : 'GMP & FDA Compliant',
          desc: isVi 
            ? 'Đáp ứng đầy đủ các chứng nhận an toàn y tế quốc tế.' 
            : isJa 
            ? '国際的な医療安全認証に完全に適合。' 
            : 'Fully complies with international medical safety certs.',
          iconName: 'CheckCircle2'
        },
        {
          title: isVi ? 'Hỗ trợ kỹ thuật 24/7' : isJa ? '24/7技術サポート' : '24/7 Tech Support',
          desc: isVi 
            ? 'Tư vấn giải pháp và cung cấp hồ sơ năng lực đầy đủ.' 
            : isJa 
            ? 'ソリューション提案と完全な機能プロファイルの提供。' 
            : 'Solution consulting and complete capability profiles.',
          iconName: 'Factory'
        }
      ],
      challengesIntro: isVi 
        ? 'Thách thức trong ngành Dược phẩm' 
        : isJa 
        ? '医薬品産業における課題' 
        : 'Challenges in the Pharmaceutical Industry',
      challenges: [
        {
          title: isVi ? 'Bụi bẩn & vi sinh vật bám dính trên bao bì' : isJa ? '容器に付着する塵埃・微生物' : 'Dust & microbes adhering to packaging',
          desc: isVi
            ? 'Sự bám dính của các bào tử nấm mốc hoặc vi sinh trên chai lọ, bao bì đóng gói trực tiếp có thể làm hỏng hoạt chất của thuốc.'
            : isJa
            ? '直接包装資材やボトルに付着したカビ胞子や微生物は、製剤の有効成分を損なう可能性があります。'
            : 'Adhesion of mold spores or microbes to direct packaging containers can compromise active drug ingredients.',
          iconName: 'Sparkles'
        },
        {
          title: isVi ? 'Lông bụi từ trang phục công nhân thông thường' : isJa ? '通常作業服からの繊維クズ・発塵' : 'Fibers & dust shedding from regular clothes',
          desc: isVi
            ? 'Vải dệt thông thường liên tục phát tán xơ vải và tế bào chết từ cơ thể người vào luồng khí phòng sạch.'
            : isJa
            ? '通常の織物は、クリーンルーム内の気流中に繊維クズや人体からの角質細胞を継続的に放出します。'
            : 'Regular woven fabrics continuously shed lint fibers and human skin cells into the cleanroom airflow.',
          iconName: 'AlertCircle'
        },
        {
          title: isVi ? 'Rủi ro nhiễm bẩn chéo giữa các lô hàng' : isJa ? 'ロット間の交差汚染リスク' : 'Cross-contamination risk between batches',
          desc: isVi
            ? 'Quy trình khử trùng không triệt để hoặc dùng sai vật dụng lau phòng sạch tạo cơ hội lây nhiễm chéo hoạt chất thuốc.'
            : isJa
            ? '不完全な滅菌や誤ったワイパーの使用により、製剤成分の交差汚染を引き起こす可能性があります。'
            : 'Incomplete sterilization or usage of incorrect cleanroom wipers allows active pharmaceutical ingredients to cross-contaminate.',
          iconName: 'ShieldCheck'
        }
      ],
      cleanroomIntro: isVi
        ? 'Giải pháp bảo vệ môi trường sản xuất vô trùng, phòng sạch dược phẩm.'
        : isJa
        ? '無菌製造環境や医薬品クリーンルーム向けの保護ソリューション。'
        : 'Protective solutions for sterile pharmaceutical and cleanroom manufacturing environments.',
      cleanroomCategories: [
        {
          name: isVi ? 'Quần áo phòng sạch' : isJa ? 'クリーンルームウェア' : 'Cleanroom Wear & Coveralls',
          image: '/images/industries/cleanroom_suit.webp',
          slug: 'cleanroom-consumables'
        },
        {
          name: isVi ? 'Khẩu trang phòng sạch vô trùng' : isJa ? '滅菌クリーンルームマスク' : 'Sterile Cleanroom Masks',
          image: '/images/industries/cleanroom_mask.webp',
          slug: 'cleanroom-consumables'
        },
        {
          name: isVi ? 'Khăn lau phòng sạch' : isJa ? 'クリーンルームワイパー' : 'Cleanroom Wipers',
          image: '/images/home/product-wipes.jpg',
          slug: 'cleanroom-consumables'
        },
        {
          name: isVi ? 'Thảm dính bụi phòng dịch' : isJa ? '除塵粘着マット' : 'De-dusting Sticky Mats',
          image: '/images/industries/sticky_mat.webp',
          slug: 'cleanroom-consumables'
        }
      ],
      cleanroomViewAll: isVi ? 'Xem tất cả sản phẩm phòng sạch' : isJa ? 'すべてのクリーンルーム製品を見る' : 'See all cleanroom products',
      packagingIntro: isVi
        ? 'Bao bì sơ cấp tiếp xúc trực tiếp vô trùng và màng bảo vệ bên ngoài.'
        : isJa
        ? '無菌の直接接触一次包装および外装保護フィルム。'
        : 'Sterile primary contact packaging and external protective film solutions.',
      packagingCategories: [
        {
          name: isVi ? 'Túi nhôm chống ẩm & tiệt trùng' : isJa ? '防湿・滅菌アルミ袋' : 'Sterile Moisture Barrier Aluminum Bags',
          image: '/images/industries/shielding_bag.webp',
          slug: 'industrial-packaging'
        },
        {
          name: isVi ? 'Màng PE quấn bảo vệ y tế' : isJa ? '医療用保護PEフィルム' : 'Medical Grade PE protective film',
          image: '/images/industries/pe_film.webp',
          slug: 'industrial-packaging'
        },
        {
          name: isVi ? 'Khay nhựa chống tĩnh điện y tế' : isJa ? '医療用ESDプラスチックトレイ' : 'Medical ESD Plastic Trays',
          image: '/images/industries/esd_tray.webp',
          slug: 'industrial-packaging'
        }
      ],
      packagingViewAll: isVi ? 'Xem tất cả sản phẩm đóng gói' : isJa ? 'すべての包装製品を見る' : 'See all packaging products',
      casesTitle: isVi ? 'Trường hợp áp dụng thực tế' : isJa ? '実際の導入事例' : 'Real-world Applications',
      cases: [
        {
          title: isVi 
            ? 'Đạt chuẩn GMP WHO cho nhà máy Dược Hậu Giang' 
            : isJa 
            ? 'Dược Hậu Giang工場のGMP WHO基準の達成' 
            : 'Achieving GMP WHO Standards for DHG Pharma Factory',
          description: isVi
            ? 'Đồng bộ hóa vật tư quần áo phòng sạch vô trùng Class 100 giúp vượt qua đợt đánh giá khắt khe của Bộ Y Tế thành công.'
            : isJa
            ? 'Class 100滅菌クリーンルームウェア等の資材同期化により、保健省による厳格な評価を通過。'
            : 'Synchronizing Class 100 sterile cleanroom wear and supplies successfully passed strict Ministry of Health audits.',
          image: '/images/industries/case_cleanroom.webp',
          badge: isVi ? 'Đạt chuẩn GMP' : isJa ? 'GMP phù hợp' : 'GMP Compliant'
        },
        {
          title: isVi 
            ? 'Tối ưu màng đóng gói cho nhà máy thiết bị y tế' 
            : isJa 
            ? '医療機器工場の包装フィルム最適化' 
            : 'Optimizing packaging film for medical device factory',
          description: isVi
            ? 'Ứng dụng túi nhôm chống ẩm và màng tiệt trùng giúp tăng thời gian bảo quản dụng cụ phẫu thuật thêm 18 tháng.'
            : isJa
            ? '防湿アルミ袋と滅菌フィルムの採用により、手術器具の保存期間を18ヶ月延長。'
            : 'Application of moisture-barrier aluminum bags and sterile film extended surgical instrument shelf life by 18 months.',
          image: '/images/industries/case_packaging.webp',
          badge: isVi ? 'Tăng 18 tháng bảo quản' : isJa ? '保存期間18ヶ月延長' : '+18mo Shelf Life'
        },
        {
          title: isVi 
            ? 'Kiểm soát nhiễm chéo tại lab nghiên cứu vacxin' 
            : isJa 
            ? 'ワクチン研究所における交差汚染制御' 
            : 'Controlling cross-contamination at vaccine research lab',
          description: isVi
            ? 'Hệ thống giấy lau phòng sạch và thảm dính bụi chuyên dụng giúp triệt tiêu hoàn toàn vi khuẩn phát tán trong phòng thí nghiệm.'
            : isJa
            ? '専用クリーンルームワイパーと粘着マットの導入により、実験室内の浮遊細菌を完全に排除。'
            : 'Specialized cleanroom wipers and sticky mats completely eliminated airborne bacteria in the laboratory room.',
          image: '/images/industries/case_supplier.webp',
          badge: isVi ? 'Triệt tiêu 100% khuẩn' : isJa ? '細菌100%排除' : '100% Bacteria Elimination'
        }
      ],
      whyUsTitle: isVi ? 'Vì sao chọn ULINK?' : isJa ? 'なぜULINKを選ぶのか？' : 'Why Choose ULINK?',
      whyUsList: isVi 
        ? [
            'Sản phẩm đạt tiêu chuẩn chất lượng cao cấp, vô trùng tuyệt đối',
            'Kiểm soát chất lượng nghiêm ngặt đạt chuẩn WHO-GMP và FDA',
            'Nguồn cung ứng dồi dào, đảm bảo giao hàng đúng hẹn',
            'Hỗ trợ kỹ thuật, kiểm định và hồ sơ năng lực đầy đủ cho nhà máy'
          ]
        : isJa
        ? [
            '最高水準の無菌品質を満たす製品',
            'WHO-GMPおよびFDA規格に準拠した厳格な品質管理',
            '豊富な供給能力により確実な納期を約束',
            '技術サポート、製品検査、工場向け機能プロファイルの提供'
          ]
        : [
            'Products meeting premium sterile quality standards',
            'Strict quality control complying with WHO-GMP and FDA',
            'Abundant supply capacity ensuring on-time delivery',
            'Technical support, inspection reports, and full factory profile documentation'
          ],
      standardsTitle: isVi ? 'Chứng nhận & tiêu chuẩn áp dụng' : isJa ? '適用される認証＆規格' : 'Certifications & Standards',
      standards: [
        { name: 'WHO-GMP', detail: isVi ? 'Thực hành sản xuất tốt' : isJa ? '優良製造基準' : 'Good Manufacturing' },
        { name: 'ISO 13485', detail: isVi ? 'Thiết bị y tế' : isJa ? '医療機器品質' : 'Medical Devices Mgmt' },
        { name: 'ISO 14644', detail: isVi ? 'Tiêu chuẩn phòng sạch' : isJa ? 'クリーンルーム基準' : 'Cleanroom Standard' },
        { name: 'FDA & CE', detail: isVi ? 'Tiêu chuẩn Mỹ & Châu Âu' : isJa ? '米国＆欧州安全基準' : 'US & EU Certification' }
      ],
      resourcesTitle: isVi ? 'Tài liệu liên quan' : isJa ? '関連資料' : 'Related Resources',
      catalogue: {
        title: isVi 
          ? 'Catalogue giải pháp cho ngành Dược phẩm & Y tế' 
          : isJa 
          ? '医薬品・医療用ソリューションカタログ' 
          : 'Solutions Catalogue for Pharmaceuticals & Medical',
        info: 'PDF / 5.8MB',
        url: '#'
      }
    };
  }

  if (actualSlug === 'food-beverage') {
    return {
      slug: 'food-beverage',
      name: isVi ? 'Thực phẩm & Đồ uống' : isJa ? '食品・飲料' : 'Food & Beverage',
      title: isVi 
        ? 'Giải pháp cho ngành Thực phẩm & Đồ uống' 
        : isJa 
        ? '食品・飲料加工向け安全・衛生ソリューション' 
        : 'Safety & Sanitation Solutions for Food & Beverage Processing',
      description: isVi
        ? 'Chế biến thực phẩm đòi hỏi kiểm soát bụi bẩn tối đa và các loại vật tư bao bì tiếp xúc trực tiếp an toàn. Đảm bảo vệ sinh an toàn thực phẩm nghiêm ngặt.'
        : isJa
        ? '食品加工では、最大限 of 塵埃管理と安全な直接接触包装資材が必要です。厳格な食品衛生安全性を確保します。'
        : 'Food processing requires maximum contamination control and food-contact safe packaging supplies. Strict hygiene and food safety assurance.',
      iconName: 'Utensils',
      gradient: 'from-amber-500 to-orange-800',
      bannerImage: '/images/home/solution-packaging.jpg',
      valueProps: [
        {
          title: isVi ? 'Đạt chuẩn FDA' : isJa ? 'FDA適合' : 'FDA Certified',
          desc: isVi 
            ? 'Vật liệu an toàn tuyệt đối khi tiếp xúc trực tiếp với thực phẩm.' 
            : isJa 
            ? '食品に直接接触しても完全に安全な素材を使用。' 
            : 'Materials fully safe for direct contact with food products.',
          iconName: 'ShieldCheck'
        },
        {
          title: isVi ? 'Kiểm soát xơ vải & vi nhựa' : isJa ? '繊維・マイクロプラスチック制御' : 'Lint & Microplastics Control',
          desc: isVi 
            ? 'Hạn chế dị vật rơi vào nguyên liệu chế biến.' 
            : isJa 
            ? '加工原材料への異物混入を効果的に抑制。' 
            : 'Effectively prevents foreign objects from falling into ingredients.',
          iconName: 'Activity'
        },
        {
          title: isVi ? 'Quy trình chuẩn hóa' : isJa ? 'プロセスの標準化' : 'Process Standardization',
          desc: isVi 
            ? 'Tiêu chuẩn hóa vật tư giúp dây chuyền luôn ổn định.' 
            : isJa 
            ? '資材の標準化により生産ラインを安定させます。' 
            : 'Standardizing supplies keeps the production lines stable.',
          iconName: 'Settings'
        },
        {
          title: isVi ? 'Tối ưu chi phí' : isJa ? 'コスト最適化' : 'Cost Optimization',
          desc: isVi 
            ? 'Giảm thiểu hao phí vật tư và đóng gói hiệu quả.' 
            : isJa 
            ? '包装資材の無駄を最小限に抑え、効率化を図ります。' 
            : 'Minimizes material waste and increases packaging efficiency.',
          iconName: 'Zap'
        }
      ],
      challengesIntro: isVi 
        ? 'Thách thức trong ngành Thực phẩm' 
        : isJa 
        ? '食品産業における課題' 
        : 'Challenges in the Food Industry',
      challenges: [
        {
          title: isVi ? 'Rác thải vi nhựa và xơ vải rơi vào nguyên liệu' : isJa ? '原材料へのマイクロプラスチック・繊維混入' : 'Microplastics & fibers falling into ingredients',
          desc: isVi
            ? 'Xơ vải từ trang phục bảo hộ cũ rơi vào bồn trộn nguyên liệu gây lỗi chất lượng thành phẩm hàng loạt.'
            : isJa
            ? '古い防護服からの繊維が混合タンクに混入し、大量の製品品質不良の原因となります。'
            : 'Fibers from old protective suits falling into mixing vats cause bulk product quality defects.',
          iconName: 'Sparkles'
        },
        {
          title: isVi ? 'Bao bì đóng gói pallet bên ngoài bị rách' : isJa ? '外装パレット包装の破損・破れ' : 'Outer pallet packaging tearing or breaking',
          desc: isVi
            ? 'Màng quấn pallet không đủ dai dẫn đến rách, làm ẩm nước và côn trùng xâm nhập trong kho lạnh.'
            : isJa
            ? 'パレットストレッチフィルムの強度が不足し、冷凍庫内での破れや湿気、虫の侵入を招きます。'
            : 'Insufficient pallet stretch film strength leads to tearing, moisture, and pest intrusion in cold storage.',
          iconName: 'AlertCircle'
        },
        {
          title: isVi ? 'Quy trình lau chùi băng chuyền dính dầu mỡ' : isJa ? 'コンベアの油分除去・清掃作業' : 'Conveyor belt grease cleaning process',
          desc: isVi
            ? 'Hao phí thời gian và hóa chất khi lau băng tải thực phẩm bằng khăn thông thường phát sinh bụi vải.'
            : isJa
            ? '通常のタオルで食品コンベアを清掃すると、清掃時間や化学薬品の浪費、および布埃が発生します。'
            : 'Wiping food conveyor belts with regular cloths wastes time/chemicals and generates lint dust.',
          iconName: 'Settings'
        }
      ],
      cleanroomIntro: isVi
        ? 'Giải pháp kiểm soát vệ sinh, trang phục bảo hộ đạt chuẩn tiếp xúc thực phẩm.'
        : isJa
        ? '食品接触基準に適合した衛生管理・防護服ソリューション。'
        : 'Sanitation control and protective wear solutions complying with food contact standards.',
      cleanroomCategories: [
        {
          name: isVi ? 'Mũ bảo hộ & Khẩu trang thực phẩm' : isJa ? '食品用キャップ＆マスク' : 'Food Grade Caps & Masks',
          image: '/images/industries/cleanroom_mask.webp',
          slug: 'cleanroom-consumables'
        },
        {
          name: isVi ? 'Găng tay cao su tiếp xúc thực phẩm' : isJa ? '食品接触用ゴム手袋' : 'Food Contact Rubber Gloves',
          image: '/images/home/product-gloves.jpg',
          slug: 'cleanroom-consumables'
        },
        {
          name: isVi ? 'Giấy lau băng tải không bụi' : isJa ? '無塵コンベアワイパー' : 'Lint-free Conveyor Wipers',
          image: '/images/home/product-wipes.jpg',
          slug: 'cleanroom-consumables'
        }
      ],
      cleanroomViewAll: isVi ? 'Xem tất cả sản phẩm phòng sạch' : isJa ? 'すべてのクリーンルーム製品を見る' : 'See all cleanroom products',
      packagingIntro: isVi
        ? 'Màng bọc, màng co đóng gói an toàn thực phẩm.'
        : isJa
        ? '食品安全衛生に準拠したラッピング・シュリンクフィルム。'
        : 'Wrapping and shrink film solutions complying with food safety standards.',
      packagingCategories: [
        {
          name: isVi ? 'Màng PE quấn pallet thực phẩm' : isJa ? '食品パレット用PEフィルム' : 'Food Grade PE Pallet Film',
          image: '/images/industries/pe_film.webp',
          slug: 'industrial-packaging'
        }
      ],
      packagingViewAll: isVi ? 'Xem tất cả sản phẩm đóng gói' : isJa ? 'すべての包装製品を見る' : 'See all packaging products',
      casesTitle: isVi ? 'Trường hợp áp dụng thực tế' : isJa ? '実際の導入事例' : 'Real-world Applications',
      cases: [
        {
          title: isVi 
            ? 'Cải tiến quy trình đóng gói hàng xuất khẩu thủy sản' 
            : isJa 
            ? '水産輸出製品包装プロセスの改善' 
            : 'Improving seafood export packaging process',
          description: isVi
            ? 'Sử dụng màng PE lực căng cao của ULink giúp pallet thủy sản vững chắc, chống ẩm lạnh 100% suốt quá trình vận chuyển đường biển.'
            : isJa
            ? 'ULinkの高張力PEフィルムを使用することで、海上輸送中も水産パレットを強固に固定し、100%防湿防寒します。'
            : 'Using ULink high-tension PE film secured seafood pallets firmly, ensuring 100% moisture protection during ocean freight.',
          image: '/images/home/solution-packaging.jpg',
          badge: isVi ? 'Chống ẩm 100%' : isJa ? '100%防湿' : '100% Moisture Proof'
        },
        {
          title: isVi 
            ? 'Giảm thiểu dị vật tại nhà máy sữa chua' 
            : isJa 
            ? 'ヨーグルト工場における異物混入の削減' 
            : 'Reducing foreign object entry at yogurt factory',
          description: isVi
            ? 'Thay thế trang phục bảo hộ thông thường bằng bộ đồ chống phát tán xơ vải của ULink giúp tỷ lệ dị vật đạt mức 0%.'
            : isJa
            ? '通常の防護服をULinkの発塵防止ウェアに変更したことで、異物混入率が0%になりました。'
            : 'Replacing regular suits with ULink lint-free coveralls successfully reduced foreign object entry rate to 0%.',
          image: '/images/home/solution-cleanroom.jpg',
          badge: isVi ? 'Dị vật giảm về 0%' : isJa ? '異物混入0%' : '0% Foreign Objects'
        }
      ],
      whyUsTitle: isVi ? 'Vì sao chọn ULINK?' : isJa ? 'なぜULINKを選ぶのか？' : 'Why Choose ULINK?',
      whyUsList: isVi 
        ? [
            'Sản phẩm đạt chuẩn FDA, an toàn tuyệt đối cho thực phẩm',
            'Kiểm soát chất lượng vệ sinh nghiêm ngặt đạt chuẩn HACCP',
            'Chuỗi cung ứng bền vững và giải pháp logistics tối ưu',
            'Hỗ trợ thiết kế kích thước và quy cách theo yêu cầu riêng'
          ]
        : isJa
        ? [
            'FDA基準を満たし、食品に完全に安全な製品',
            'HACCP基準に準拠した厳格な衛生・品質管理',
            '持続可能なサプライチェーンと最適化された物流ソリューション',
            'ご要望に応じたカスタムサイズ・仕様の設計サポート'
          ]
        : [
            'Products meeting FDA standards, fully safe for food contact',
            'Strict hygiene and quality control complying with HACCP standards',
            'Sustainable supply chain and optimized logistics solutions',
            'Support for custom size and specifications design tailoring'
          ],
      standardsTitle: isVi ? 'Chứng nhận & tiêu chuẩn áp dụng' : isJa ? '適用される認証＆規格' : 'Certifications & Standards',
      standards: [
        { name: 'FDA', detail: isVi ? 'An toàn thực phẩm Hoa Kỳ' : isJa ? '米国食品医薬品局安全基準' : 'Food Contact Safety' },
        { name: 'HACCP', detail: isVi ? 'Phân tích mối nguy' : isJa ? 'ハサップ衛生管理' : 'Hazard Analysis' },
        { name: 'ISO 22000', detail: isVi ? 'Hệ thống an toàn thực phẩm' : isJa ? '食品安全マネジメント' : 'Food Safety Mgmt' }
      ],
      resourcesTitle: isVi ? 'Tài liệu liên quan' : isJa ? '関連資料' : 'Related Resources',
      catalogue: {
        title: isVi 
          ? 'Catalogue giải pháp ngành Thực phẩm & Đồ uống' 
          : isJa 
          ? '食品・飲料向けカタログ' 
          : 'Solutions Catalogue for Food & Beverage',
        info: 'PDF / 5.8MB',
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
  if (slug === 'pharmaceutical' || slug === 'cosmetics') {
    actualSlug = 'pharmaceutical-cosmetics';
  } else if (slug === 'food') {
    actualSlug = 'food-beverage';
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
