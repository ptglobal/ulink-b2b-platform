import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { fetchProducts } from '@/lib/product-data';
import IndustryDetailClient from '@/components/industries/industry-detail-client';

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
  }

  const VALID_SLUGS = ['electronics', 'pharmaceutical-cosmetics', 'food-beverage'];
  if (!VALID_SLUGS.includes(actualSlug)) {
    return null;
  }

  if (actualSlug === 'electronics') {
    return {
      slug: 'electronics',
      name: isVi ? 'Điện tử' : isJa ? '電子' : 'Electronics',
      title: isVi 
        ? 'Giải pháp cho ngành Điện tử' 
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
      bannerImage: '/images/industries/electronics_hero.png',
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
            ? '静電気放電（ESD）により、目視では検出できない潜在的なチップ損傷が発生します。'
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
          image: '/images/industries/cleanroom_suit.png',
          slug: 'cleanroom-consumables'
        },
        {
          name: isVi ? 'Găng tay phòng sạch' : isJa ? 'クリーンルーム手袋' : 'Cleanroom Gloves',
          image: '/images/home/product-gloves.jpg',
          slug: 'cleanroom-consumables'
        },
        {
          name: isVi ? 'Khẩu trang phòng sạch' : isJa ? 'クリーンルームマスク' : 'Cleanroom Masks',
          image: '/images/industries/cleanroom_mask.png',
          slug: 'cleanroom-consumables'
        },
        {
          name: isVi ? 'Thảm dính bụi' : isJa ? '粘着マット' : 'Sticky Mats',
          image: '/images/industries/sticky_mat.png',
          slug: 'cleanroom-consumables'
        },
        {
          name: isVi ? 'Giấy lau phòng sạch' : isJa ? 'クリーンルームワイパー' : 'Cleanroom Wipers',
          image: '/images/home/product-wipes.jpg',
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
          image: '/images/industries/pe_film.png',
          slug: 'industrial-packaging'
        },
        {
          name: isVi ? 'Túi chống tĩnh điện & màng chống tĩnh điện' : isJa ? '帯電防止袋＆フィルム' : 'ESD Shielding Bags & Film',
          image: '/images/industries/shielding_bag.png',
          slug: 'industrial-packaging'
        },
        {
          name: isVi ? 'Khay nhựa (ESD)' : isJa ? 'ESDプラスチックトレイ' : 'ESD Plastic Trays',
          image: '/images/industries/esd_tray.png',
          slug: 'industrial-packaging'
        },
        {
          name: isVi ? 'Túi nhôm chống ẩm' : isJa ? '防湿アルミ袋' : 'Moisture Barrier Aluminum Bags',
          image: '/images/industries/shielding_bag.png',
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
          image: '/images/industries/case_cleanroom.png',
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
          image: '/images/industries/case_packaging.png',
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
          image: '/images/industries/case_supplier.png',
          badge: isVi ? 'Tăng 28% hiệu suất' : isJa ? '効率28%向上' : '28% Efficiency Increase'
        }
      ],
      whyUsTitle: isVi ? 'Vì sao chọn ULINK?' : isJa ? 'なぜULINKを選ぶのか？' : 'Why Choose ULINK?',
      whyUsList: isVi 
        ? [
            'Sản phẩm đạt tiêu chuẩn chất lượng cao',
            'Kiểm soát chất lượng nghiêm ngặt',
            'Chuỗi cung ứng ổn định toàn cầu',
            'Hỗ trợ kỹ thuật và tùy chỉnh theo yêu cầu'
          ]
        : isJa
        ? [
            '高品質基準を満たす製品',
            '厳格な品質管理プロセス',
            '安定したグローバルサプライチェーン',
            '技術サポートと個別要望への対応'
          ]
        : [
            'Products meeting high quality standards',
            'Strict quality control processes',
            'Stable global supply chain',
            'Technical support & custom tailoring'
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
        info: isVi ? 'PDF / 6.2MB' : isJa ? 'PDF / 6.2MB' : 'PDF / 6.2MB',
        url: '#'
      }
    };
  }

  // Fallback data mapping for other slugs
  const name = actualSlug === 'pharmaceutical-cosmetics'
    ? (isVi ? 'Dược phẩm & Mỹ phẩm' : isJa ? '医薬品・化粧品' : 'Pharmaceuticals & Cosmetics')
    : actualSlug === 'food-beverage'
    ? (isVi ? 'Thực phẩm' : isJa ? '食品・飲料' : 'Food & Beverage')
    : actualSlug === 'automotive'
    ? (isVi ? 'Cơ khí chế tạo' : isJa ? '自動車・精密機械' : 'Automotive & Manufacturing')
    : actualSlug === 'solar-energy'
    ? (isVi ? 'Năng lượng mặt trời' : isJa ? '太陽光エネルギー' : 'Solar Energy')
    : (isVi ? 'Giải pháp chuyên biệt' : isJa ? '専門ソリューション' : 'Specialized Solutions');

  const title = actualSlug === 'pharmaceutical-cosmetics'
    ? (isVi ? 'Giải pháp vô trùng & kiểm soát vi sinh cho ngành Dược phẩm & Mỹ phẩm' : isJa ? '医薬品・化粧品向け無菌・微生物制御ソリューション' : 'Sterility & Microbe Control Solutions for Pharmaceuticals & Cosmetics')
    : actualSlug === 'food-beverage'
    ? (isVi ? 'Giải pháp vệ sinh an toàn cho ngành chế biến Thực phẩm & Đồ uống' : isJa ? '食品・飲料加工向け安全・衛生ソリューション' : 'Safety & Sanitation Solutions for Food & Beverage Processing')
    : actualSlug === 'automotive'
    ? (isVi ? 'Giải pháp phòng sạch & bảo vệ bề mặt cho ngành Cơ khí & Lắp ráp Ô tô' : isJa ? '自動車・精密機械向け表面保護・クリーンルームソリューション' : 'Surface Protection & Cleanroom Solutions for Automotive & Manufacturing')
    : actualSlug === 'solar-energy'
    ? (isVi ? 'Giải pháp kiểm soát bụi chuyên sâu cho ngành Năng lượng mặt trời' : isJa ? '太陽光発電向け高度塵埃制御ソリューション' : 'Advanced Dust Control Solutions for Solar Energy Industry')
    : (isVi ? 'Giải pháp kỹ thuật chuyên nghiệp' : isJa ? 'プロフェッショナルエンジニアリングソリューション' : 'Professional Engineering Solutions');

  const description = actualSlug === 'pharmaceutical-cosmetics'
    ? (isVi ? 'Môi trường bào chế thuốc tiêm, thiết bị y tế và sản phẩm mỹ phẩm đòi hỏi độ vô trùng tối đa (Class 100 - ISO 5) để triệt tiêu bào tử nấm và vi khuẩn.' : isJa ? '注射剤、医療機器、化粧品の調製環境では、カビ胞子や細菌を死滅させるために最大限の無菌性（Class 100 - ISO 5）が求められます。' : 'Preparation environments for injectables, medical devices, and cosmetics require maximum sterility (Class 100 - ISO 5) to eliminate mold spores and bacteria.')
    : actualSlug === 'food-beverage'
    ? (isVi ? 'Chế biến thực phẩm đòi hỏi kiểm soát bụi bẩn tối đa và các loại vật tư bao bì tiếp xúc trực tiếp an toàn. Đảm bảo vệ sinh an toàn thực phẩm nghiêm ngặt.' : isJa ? '食品加工では、最大限の塵埃管理と安全な直接接触包装資材が必要です。厳格な食品衛生安全性を確保します。' : 'Food processing requires maximum contamination control and food-contact safe packaging supplies. Strict hygiene and food safety assurance.')
    : actualSlug === 'automotive'
    ? (isVi ? 'Bao bì bảo vệ sản phẩm, chống trầy xước và bám bẩn hạt sơn, hóa chất dầu mỡ trong quá trình gia công cơ khí chính xác và lắp ráp linh kiện ô tô xe máy.' : isJa ? '精密機械加工および自動車・バイク部品の組み立て工程における製品保護、傷防止、塗装粒着、油脂化学物質汚染対策の包装。' : 'Product protective packaging, scratch prevention, and resistance to paint particles and greases during precision machining and vehicle assembly.')
    : actualSlug === 'solar-energy'
    ? (isVi ? 'Giải pháp kiểm soát bụi chuyên sâu trên bề mặt tấm pin năng lượng mặt trời, hạn chế tối đa suy hao hiệu suất quang năng và rủi ro lỗi cell.' : isJa ? '太陽光パネル表面の高度な塵埃制御ソリューション。発電効率の低下やセル欠陥のリスクを最小限に抑えます。' : 'Specialized dust control solutions on solar panel surfaces, minimizing solar performance loss and cell defect risks.')
    : '';

  const iconName = actualSlug === 'pharmaceutical-cosmetics' ? 'Activity' : actualSlug === 'food-beverage' ? 'Utensils' : actualSlug === 'automotive' ? 'Car' : actualSlug === 'solar-energy' ? 'Sun' : 'Shield';
  const gradient = actualSlug === 'pharmaceutical-cosmetics' ? 'from-emerald-600 to-teal-900' : actualSlug === 'food-beverage' ? 'from-amber-500 to-orange-800' : actualSlug === 'automotive' ? 'from-violet-600 to-purple-900' : actualSlug === 'solar-energy' ? 'from-orange-500 to-red-800' : 'from-slate-600 to-slate-900';
  const bannerImage = actualSlug === 'pharmaceutical-cosmetics' ? '/images/icons/pharmaceuticals.png' : actualSlug === 'food-beverage' ? '/images/icons/food_processing.png' : actualSlug === 'automotive' ? '/images/icons/manufacturing.png' : actualSlug === 'solar-energy' ? '/images/icons/semiconductor.png' : '/images/home/solution-cleanroom.jpg';

  const challengesList = actualSlug === 'pharmaceutical-cosmetics'
    ? [
        { title: isVi ? 'Bụi bẩn & vi sinh vật bám dính trên bao bì' : isJa ? '容器に付着する塵埃・微生物' : 'Dust & microbes adhering to packaging', iconName: 'Sparkles' },
        { title: isVi ? 'Lông bụi từ trang phục công nhân thông thường' : isJa ? '通常作業服からの繊維クズ・発塵' : 'Fibers & dust shedding from regular clothes', iconName: 'AlertCircle' },
        { title: isVi ? 'Rủi ro nhiễm bẩn chéo giữa các lô hàng' : isJa ? 'ロット間の交差汚染リスク' : 'Cross-contamination risk between batches', iconName: 'ShieldCheck' }
      ]
    : actualSlug === 'food-beverage'
    ? [
        { title: isVi ? 'Rác thải vi nhựa và xơ vải rơi vào nguyên liệu' : isJa ? '原材料へのマイクロプラスチック・繊維混入' : 'Microplastics & fibers falling into ingredients', iconName: 'Sparkles' },
        { title: isVi ? 'Bao bì đóng gói pallet bên ngoài bị rách' : isJa ? '外装パレット包装の破損・破れ' : 'Outer pallet packaging tearing or breaking', iconName: 'AlertCircle' },
        { title: isVi ? 'Quy trình lau chùi băng chuyền dính dầu mỡ' : isJa ? 'コンベアの油分除去・清掃作業' : 'Conveyor belt grease cleaning process', iconName: 'Settings' }
      ]
    : actualSlug === 'automotive'
    ? [
        { title: isVi ? 'Bụi bẩn & xơ vải bám trên bề mặt trước khi sơn' : isJa ? '塗装前の表面への塵埃・繊維付着' : 'Dust & fibers on surface before painting', iconName: 'Sparkles' },
        { title: isVi ? 'Hóa chất, dầu mỡ cơ khí gây hư hỏng' : isJa ? '油脂・化学薬品による損傷' : 'Chemicals & mechanical greases causing damage', iconName: 'AlertCircle' },
        { title: isVi ? 'Rủi ro trầy xước trong quá trình đóng gói' : isJa ? '包装・輸送中の擦り傷リスク' : 'Scratch risks during packaging and transit', iconName: 'Shield' }
      ]
    : [
        { title: isVi ? 'Bụi mịn bám trên bề mặt cell pin' : isJa ? 'セル表面への微細塵埃付着' : 'Fine dust on cell surfaces', iconName: 'Sparkles' },
        { title: isVi ? 'Tích tụ bụi bẩn gây điểm nóng (hotspot)' : isJa ? '発塵蓄積によるホットスポット現象' : 'Dust buildup causing hotspots', iconName: 'AlertCircle' },
        { title: isVi ? 'Hao mòn vật lý do thời tiết khắc nghiệt' : isJa ? '過酷な気象条件による物理的摩耗' : 'Physical wear due to harsh weather', iconName: 'Settings' }
      ];

  const standardsList = actualSlug === 'pharmaceutical-cosmetics'
    ? [
        { name: 'ISO 13485', detail: 'Medical Devices' },
        { name: 'WHO-GMP', detail: 'Good Manufacturing' },
        { name: 'ISO 14644', detail: 'Cleanroom Class 5' }
      ]
    : actualSlug === 'food-beverage'
    ? [
        { name: 'FDA', detail: 'Food Contact Safe' },
        { name: 'HACCP', detail: 'Hazard Analysis' },
        { name: 'ISO 22000', detail: 'Food Safety Mgmt' }
      ]
    : actualSlug === 'automotive'
    ? [
        { name: 'ISO 9001', detail: 'Quality Mgmt' },
        { name: 'RoHS', detail: 'Hazardous Materials' },
        { name: 'CE Standard', detail: 'European Conformity' }
      ]
    : [
        { name: 'IEC 61215', detail: 'PV Design Cert' },
        { name: 'UL 1703', detail: 'PV Safety Standard' },
        { name: 'ISO 9001', detail: 'Quality Mgmt' }
      ];

  return {
    slug: actualSlug,
    name,
    title,
    description,
    iconName,
    gradient,
    bannerImage,
    valueProps: [
      {
        title: isVi ? 'Đảm bảo chất lượng' : isJa ? '品質保証' : 'Quality Assurance',
        desc: isVi ? 'Kiểm soát ô nhiễm tối ưu để nâng cao tỷ lệ thành phẩm đạt chuẩn.' : isJa ? '製品合格率向上のための最適な汚染管理。' : 'Optimal contamination control to improve yield rates.',
        iconName: 'ShieldCheck'
      },
      {
        title: isVi ? 'Quy trình chuẩn hóa' : isJa ? 'プロセスの標準化' : 'Process Standardization',
        desc: isVi ? 'Tiêu chuẩn hóa vật tư giúp quy trình sản xuất luôn ổn định.' : isJa ? '資材の標準化により安定した生産プロセスを実現。' : 'Standardizing supplies keeps the production process stable.',
        iconName: 'Settings'
      },
      {
        title: isVi ? 'Hỗ trợ chuyên sâu' : isJa ? '専門的なサポート' : 'Dedicated Support',
        desc: isVi ? 'Tư vấn kỹ thuật và giải pháp thiết kế riêng biệt.' : isJa ? 'カスタム設計のための技術相談と提案。' : 'Technical consulting and tailored design solutions.',
        iconName: 'Globe'
      }
    ],
    challengesIntro: isVi ? 'Thách thức sản xuất & Kiểm soát rủi ro' : isJa ? '製造上の課題とリスク管理' : 'Production Challenges & Risk Control',
    challenges: challengesList,
    cleanroomIntro: isVi ? 'Giải pháp bảo vệ môi trường sản xuất vô trùng, phòng sạch.' : isJa ? '無菌製造環境やクリーンルーム向けの保護ソリューション。' : 'Protective solutions for sterile and cleanroom manufacturing environments.',
    cleanroomCategories: [
      {
        name: isVi ? 'Quần áo phòng sạch & phụ kiện' : isJa ? 'クリーンルームウェア＆用品' : 'Cleanroom Wear & Accessories',
        image: '/images/home/product-gloves.jpg',
        slug: 'cleanroom-consumables'
      },
      {
        name: isVi ? 'Khăn lau phòng sạch' : isJa ? 'クリーンルームワイパー' : 'Cleanroom Wipers',
        image: '/images/home/product-wipes.jpg',
        slug: 'cleanroom-consumables'
      }
    ],
    cleanroomViewAll: isVi ? 'Xem tất cả sản phẩm phòng sạch' : isJa ? 'すべてのクリーンルーム製品を見る' : 'See all cleanroom products',
    packagingIntro: isVi ? 'Giải pháp đóng gói lưu kho và bảo quản sản phẩm an toàn.' : isJa ? '安全な保管と製品保護のための包装ソリューション。' : 'Packaging solutions for safe warehousing and product protection.',
    packagingCategories: [
      {
        name: isVi ? 'Màng đóng gói công nghiệp' : isJa ? '工業用包装フィルム' : 'Industrial Packaging Film',
        image: '/images/home/product-packaging.jpg',
        slug: 'industrial-packaging'
      }
    ],
    packagingViewAll: isVi ? 'Xem tất cả sản phẩm đóng gói' : isJa ? 'すべての包装製品を見る' : 'See all packaging products',
    casesTitle: isVi ? 'Trường hợp áp dụng thực tế' : isJa ? '実際の導入事例' : 'Real-world Applications',
    cases: [
      {
        title: isVi ? 'Nâng cấp phòng sạch Class 1000' : isJa ? 'Class 1000クリーンルームのアップグレード' : 'Upgrading Class 1000 Cleanroom',
        description: isVi ? 'Tối ưu hóa môi trường làm việc thông qua hệ thống vật tư đồng bộ và kiểm soát tĩnh điện tốt hơn.' : isJa ? '一貫した資材システムと優れた静電気管理による作業環境の最適化。' : 'Optimizing the work environment through standardized supplies and enhanced electrostatic control.',
        image: '/images/home/solution-cleanroom.jpg',
        badge: isVi ? 'Tăng 15% hiệu quả' : isJa ? '効率15%向上' : '15% Efficiency Increase'
      },
      {
        title: isVi ? 'Cải tiến đóng gói hàng xuất khẩu' : isJa ? '輸出製品包装の改善' : 'Improving Export Packaging',
        description: isVi ? 'Áp dụng màng PE chuyên dụng giúp bảo vệ sản phẩm khỏi rách nát và bụi bẩn khi vận chuyển đường biển.' : isJa ? '専用PEフィルムの採用により、海上輸送中の製品の破れやチリから保護。' : 'Adopting specialized PE films protects products from tears and dust during maritime shipping.',
        image: '/images/home/solution-packaging.jpg',
        badge: isVi ? 'Giảm 99% lỗi bụi' : isJa ? '塵埃付着99%削減' : '99% Dust Reduction'
      }
    ],
    whyUsTitle: isVi ? 'Vì sao chọn ULINK?' : isJa ? 'なぜULINKを選ぶのか？' : 'Why Choose ULINK?',
    whyUsList: isVi
      ? [
          'Sản phẩm đạt tiêu chuẩn chất lượng cao',
          'Kiểm soát chất lượng nghiêm ngặt',
          'Chuỗi cung ứng ổn định toàn cầu',
          'Hỗ trợ kỹ thuật và tùy chỉnh theo yêu cầu'
        ]
      : isJa
      ? [
          '高品質基準を満たす製品',
          '厳格な品質管理プロセス',
          '安定したグローバルサプライチェーン',
          '技術サポート và 個別要望への対応'
        ]
      : [
          'Products meeting high quality standards',
          'Strict quality control processes',
          'Stable global supply chain',
          'Technical support & custom tailoring'
        ],
    standardsTitle: isVi ? 'Chứng nhận & tiêu chuẩn áp dụng' : isJa ? '適用される認証＆規格' : 'Certifications & Standards',
    standards: standardsList,
    resourcesTitle: isVi ? 'Tài liệu liên quan' : isJa ? '関連資料' : 'Related Resources',
    catalogue: {
      title: isVi ? `Catalogue giải pháp ngành ${name}` : isJa ? `${name}向けカタログ` : `Solutions Catalogue for ${name}`,
      info: 'PDF / 5.8MB',
      url: '#'
    }
  };
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
  }
  
  const industryData = getIndustryDetails(actualSlug, locale);
  if (!industryData) {
    notFound();
  }

  // Fetch real products belonging to this industry slug
  const { products } = await fetchProducts({
    industry: actualSlug,
    limit: 6
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
    />
  );
}

