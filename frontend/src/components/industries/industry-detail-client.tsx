'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  AlertCircle, 
  FileDown, 
  Download, 
  ChevronRight,
  Cpu,
  Activity,
  Utensils,
  ShieldCheck,
  Settings,
  Globe,
  Zap,
  Sparkles,
  Truck,
  CheckCircle2,
  Factory
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { ASSETS } from '@/lib/assets';
import { IndustryDetailClientProps } from './types';
import { IndustryValueProps } from './industry-value-props';




// Map icon names to Lucide icons
const iconMap: Record<string, React.ComponentType<any>> = {
  Cpu,
  Activity,
  Utensils,
  ShieldCheck,
  Settings,
  Globe,
  Zap,
  Sparkles,
  Truck,
  CheckCircle2,
  Factory
};

// List of partner logos for rendering
const partnerLogos = [
  { name: 'Samsung', src: ASSETS.home.partnerSamsung },
  { name: 'Canon', src: ASSETS.home.partnerCanon },
  { name: 'Panasonic', src: ASSETS.home.partnerPanasonic },
  { name: 'IBM', src: ASSETS.home.partnerIbm },
  { name: 'Traphaco', src: ASSETS.home.partnerTraphaco },
  { name: 'Coca-Cola', src: ASSETS.home.partnerCocaCola },
  { name: 'VinFast', src: ASSETS.home.partnerVinfast },
  { name: 'LG', src: ASSETS.home.partnerLg },
  { name: 'Amkor', src: ASSETS.home.partnerAmkor },
  { name: 'Vinamilk', src: ASSETS.home.partnerVinamilk },
  { name: '3M', src: ASSETS.home.partner3m },
  { name: 'BYD', src: ASSETS.home.partnerByd }
];

// Helper to generate realistic high-fidelity bullet points for category items
function getCategoryBullets(catName: string, locale: string): string[] {
  const nameLower = catName.toLowerCase();
  const isVi = locale === 'vi';
  const isJa = locale === 'ja';

  if (nameLower.includes('quần áo') || nameLower.includes('wear') || nameLower.includes('suit')) {
    return isVi 
      ? ['Vải chống tĩnh điện ESD cao cấp', 'Hạn chế tối đa phát tán xơ vải', 'Đạt tiêu chuẩn ISO Class 5 (Class 100)']
      : isJa
      ? ['高級ESD帯電防止生地', '繊維ゴミ・発塵を最小限に抑える', 'ISO Class 5（Class 100）基準適合']
      : ['Premium ESD anti-static fabric', 'Minimizes lint and fiber shedding', 'ISO Class 5 (Class 100) compliant'];
  }
  if (nameLower.includes('găng tay') || nameLower.includes('gloves')) {
    return isVi 
      ? ['Nitrile cao cấp không bột mịn', 'Độ đàn hồi cao & chống trượt tốt', 'Kháng dung môi và hóa chất nhẹ']
      : isJa
      ? ['粉なし高級ニトリルゴム', '優れた伸縮性と滑り止め加工', '軽度な溶剤・化学薬品に対応']
      : ['Powder-free premium Nitrile', 'High elasticity & non-slip grip', 'Resistant to light solvents & chemicals'];
  }
  if (nameLower.includes('khẩu trang') || nameLower.includes('mask')) {
    return isVi 
      ? ['Màng lọc khuẩn hiệu suất cao', 'Thiết kế ôm khít, thông thoáng', 'Tiệt trùng và đóng gói riêng biệt']
      : isJa
      ? ['高効率細菌ろ過フィルター', 'フィット感が高く通気性に優れる', '個別滅菌パック包装']
      : ['High-efficiency bacterial filter', 'Snug fit with high breathability', 'Individually sterilized & packed'];
  }
  if (nameLower.includes('thảm') || nameLower.includes('mat')) {
    return isVi 
      ? ['Độ bám dính hạt bụi đế giày cao', 'Lớp keo phân tầng đánh số 1-30', 'Chất liệu Polyethylene thân thiện']
      : isJa
      ? ['靴底の塵埃を強力吸着', '1〜30までの積層剥離タイプ', '環境に優しいポリエチレン製']
      : ['High adhesive dust trapping', 'Numbered layers from 1 to 30', 'Eco-friendly polyethylene material'];
  }
  if (nameLower.includes('khăn') || nameLower.includes('wiper') || nameLower.includes('lau')) {
    return isVi 
      ? ['Thấm hút chất lỏng & dung môi cực tốt', 'Không để lại sợi tơ bụi sau khi lau', 'Cắt mép bằng công nghệ siêu âm']
      : isJa
      ? ['液体や溶剤の吸液性に優れる', '拭き取り跡の繊維くずが残らない', '超音波端面カット加工']
      : ['Excellent absorption of solvents', 'No lint residue left after wiping', 'Ultrasonic heat-sealed edges'];
  }
  if (nameLower.includes('nhôm') || nameLower.includes('barrier') || nameLower.includes('túi nhôm')) {
    return isVi 
      ? ['Chống ẩm, oxy và tia cực tím tuyệt đối', 'Độ bền dai cơ học cao, khó rách', 'Hỗ trợ hàn kín nhiệt mép túi tốt']
      : isJa
      ? ['湿気、酸素、紫外線を遮断', '引き裂きに強い高い機械的強度', '優れた熱シール性']
      : ['Blocks moisture, oxygen & UV', 'High mechanical strength against tears', 'Excellent heat-sealability'];
  }
  if (nameLower.includes('tĩnh điện') || nameLower.includes('esd') || nameLower.includes('shielding')) {
    return isVi 
      ? ['Ngăn sóng điện từ & dòng điện tích', 'Bảo vệ bo mạch nhạy cảm an toàn', 'Độ dày màng nhựa tối ưu']
      : isJa
      ? ['電磁波や静電荷を遮断', '敏感な回路基板の安全な保護', '最適なプラスチックフィルム厚']
      : ['Shields electromagnetic & static', 'Safe protection for sensitive PCBs', 'Optimal plastic film thickness'];
  }
  if (nameLower.includes('khay') || nameLower.includes('tray')) {
    return isVi 
      ? ['Nhựa PET/PS định hình chắc chắn', 'Điện trở bề mặt chuẩn tĩnh điện', 'Thiết kế và gia công khuôn theo yêu cầu']
      : isJa
      ? ['頑丈な成形PET/PSプラスチック', '標準的な表面抵抗値', '金型のカスタム設計・加工に対応']
      : ['Sturdy molded PET/PS plastic', 'Standard surface resistivity', 'Custom mold design & processing'];
  }
  if (nameLower.includes('pe') || nameLower.includes('film') || nameLower.includes('màng pe')) {
    return isVi 
      ? ['Lực co giãn và độ bám dính cực tốt', 'Bảo vệ pallet hàng khi lưu kho lạnh', 'Chống bụi bẩn, nước và va đập nhẹ']
      : isJa
      ? ['優れた自己粘着性と延伸性', '冷凍倉庫保管時のパレット保護', 'チリ、湿気、軽微な衝撃から保護']
      : ['Excellent stretch and cling force', 'Protects pallets in cold storage', 'Shields from dust, moisture & minor impacts'];
  }

  return isVi 
    ? ['Đạt tiêu chuẩn an toàn kỹ thuật cao', 'Đầy đủ chứng nhận chất lượng CO/CQ', 'Tối ưu hóa chi phí vận hành cho nhà máy']
    : isJa
    ? ['高度な技術安全基準に準拠', 'CO/CQ品質証明書を完備', '工場の運用コストを最適化']
    : ['Complies with high safety standards', 'Complete quality CO/CQ certification', 'Optimizes factory operational costs'];
}

export default function IndustryDetailClient({
  industryData,
  products,
  locale,
  currentSlug,
  translations,
  children
}: IndustryDetailClientProps & { children?: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Tabs definitions
  const tabs = [
    { id: 'overview', label: translations.overview },
    { id: 'cleanroom', label: translations.cleanroomSol },
    { id: 'packaging', label: translations.packagingSol },
    { id: 'standards', label: industryData.standardsTitle },
    { id: 'cases', label: translations.cases }
  ];

  // Set up Scrollspy using Intersection Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px -50% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, observerOptions);

    tabs.forEach((tab) => {
      const el = document.getElementById(tab.id);
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [translations, industryData]);

  // Smooth scroll handler
  const handleTabClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 135;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveTab(id);
    }
  };

  // Breadcrumbs text helper
  const isVi = locale === 'vi';
  const isJa = locale === 'ja';
  
  const currentBreadcrumb = industryData.name;
  const industryCategoryName = isVi ? 'Ngành nghề' : isJa ? '業界別' : 'Industries';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      
      {/* ── SECTION 1: HERO BANNER (Full Width) ── */}
      <section className="relative w-full overflow-hidden bg-slate-950 flex flex-col justify-center min-h-[460px] md:min-h-[500px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={industryData.bannerImage}
            alt={industryData.title}
            fill
            className="object-cover opacity-60"
            priority
          />
          {/* Linear gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-slate-950/85 z-10" />
        </div>

        {/* Content Container */}
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 z-20 pt-28 pb-20 relative flex flex-col items-start justify-center h-full">
          {/* Breadcrumbs inside Hero Banner */}
          <nav className="flex items-center gap-1.5 text-xs text-white/70 font-semibold mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              {translations.home}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-white/50" />
            <Link href="/industries" className="hover:text-white transition-colors">
              {industryCategoryName}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-white/50" />
            <span className="text-white font-extrabold">{currentBreadcrumb}</span>
          </nav>

          {/* Heading and Description */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {industryData.title}
            </h1>
            <p className="text-sm sm:text-base text-white/95 max-w-3xl leading-relaxed font-normal">
              {industryData.description}
            </p>
          </div>

          {/* Ghost download button */}
          <div className="mt-8">
            <Link
              href={industryData.catalogue.url}
              className="inline-flex h-11 items-center justify-center gap-2 border border-white bg-transparent hover:bg-white hover:text-slate-900 text-white font-extrabold text-sm px-6 py-2.5 transition-all duration-300 rounded-none shadow-sm"
            >
              <Download className="h-4 w-4" />
              {isVi ? 'Tải hồ sơ năng lực' : isJa ? '機能プロファイルをダウンロード' : 'Download Capability Profile'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FLOATING VALUE CARDS GRID (4 Cards) ── */}
      <IndustryValueProps valueProps={industryData.valueProps} />

      {/* ── STICKY TABS NAVIGATION ── */}
      <div className="sticky top-[72px] z-30 bg-white border-b border-slate-200/80 shadow-md transition-all duration-300 mt-12">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
          <div className="flex overflow-x-auto no-scrollbar py-0.5 gap-8 scroll-smooth">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={(e) => handleTabClick(e, tab.id)}
                className={`py-4.5 text-xs sm:text-sm font-bold transition-all relative border-b-2 whitespace-nowrap leading-none ${
                  activeTab === tab.id
                    ? 'border-[#1769E2] text-[#1769E2]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: TỔNG QUAN GIẢI PHÁP & VÌ SAO CHỌN ULINK (Overview) ── */}
      <section id="overview" className="scroll-mt-36 py-16 lg:py-20 w-full bg-white">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Column (2/3) - Text & Large Image */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">
                {isVi ? 'Tổng quan giải pháp' : isJa ? 'ソリューション概要' : 'Solution Overview'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36]">
                {industryData.slug === 'pharmaceutical-cosmetics' 
                  ? (isVi ? 'Đảm bảo tiêu chuẩn vô trùng khắt khe nhất' : isJa ? '最も厳格な無菌基準を保証' : 'Ensure the strictest sterility standards')
                  : industryData.slug === 'electronics'
                  ? (isVi ? 'Kiểm soát ô nhiễm & tĩnh điện tối ưu' : isJa ? '汚染管理と静電気対策の最適化' : 'Optimize contamination & electrostatic control')
                  : (isVi ? 'Quy trình chuẩn hóa và an toàn vệ sinh' : isJa ? '衛生管理とプロセスの標準化' : 'Hygiene control & process standardization')}
              </h2>
            </div>
            
            <div className="text-sm text-slate-600 font-medium leading-relaxed space-y-4 max-w-4xl">
              {industryData.slug === 'pharmaceutical-cosmetics' ? (
                <>
                  <p>
                    Môi trường sản xuất dược phẩm và trang thiết bị y tế đòi hỏi sự kiểm soát nghiêm ngặt về số lượng tiểu phân hạt bụi và vi sinh vật. ULINK cung cấp giải pháp đồng bộ từ trang phục phòng sạch vô trùng, găng tay chuyên dụng đến hệ thống khăn lau không bụi để đảm bảo quy trình sản xuất luôn vô trùng tuyệt đối.
                  </p>
                  <p>
                    Các vật tư phụ trợ được lựa chọn kỹ lưỡng, trải qua quy trình tiệt trùng nghiêm ngặt và đóng gói hút chân không hai lớp, giúp loại bỏ hoàn toàn nguy cơ lây nhiễm chéo hoặc phát tán xơ sợi vào dung dịch thuốc hay thiết bị y khoa.
                  </p>
                </>
              ) : industryData.slug === 'electronics' ? (
                <>
                  <p>
                    Quy trình sản xuất mạch tích hợp, chip bán dẫn và linh kiện điện tử đòi hỏi môi trường siêu sạch (Class 10 - Class 100) để ngăn ngừa hỏng hóc do hạt bụi siêu mịn. ULINK mang lại các giải pháp kiểm soát tĩnh điện (ESD) vượt trội và lọc bụi chất lượng cao.
                  </p>
                  <p>
                    Tất cả găng tay, khăn lau và khay nhựa đựng linh kiện của chúng tôi đều đạt tiêu chuẩn điện trở bề mặt an toàn, giúp phân tán dòng điện tích tích tụ và bảo vệ mạch điện nhạy cảm khỏi hiện tượng phóng tĩnh điện.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Trong ngành thực phẩm và đồ uống, việc duy trì vệ sinh an toàn thực phẩm là yếu tố sống còn. Các giải pháp của chúng tôi tập trung vào việc ngăn chặn rác thải vi nhựa, xơ vải từ trang phục bảo hộ và vi sinh vật gây hại bám dính vào nguyên liệu.
                  </p>
                  <p>
                    Sản phẩm của ULINK làm từ chất liệu đạt tiêu chuẩn FDA cho tiếp xúc thực phẩm trực tiếp, dễ dàng làm sạch băng tải và hệ thống ống dẫn dầu mỡ công nghiệp, giúp tối ưu hóa thời gian vệ sinh định kỳ.
                  </p>
                </>
              )}
            </div>

            {/* Large Image representing production line */}
            <div className="relative w-full aspect-[21/9] min-h-[220px] overflow-hidden border border-slate-200/50 shadow-md">
              <Image
                src={industryData.slug === 'pharmaceutical-cosmetics' 
                  ? '/images/home/solution-cleanroom.jpg' 
                  : industryData.slug === 'electronics'
                  ? '/images/industries/case_cleanroom.webp'
                  : '/images/home/solution-packaging.jpg'
                }
                alt="Production Line Facility"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Column (1/3) - Why Choose ULINK Card */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 p-8 shadow-sm space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-5">
              <h3 className="text-lg font-extrabold text-[#0F1E36] border-b pb-4 flex items-center gap-2">
                <ShieldCheck className="h-5.5 w-5.5 text-blue-600" />
                {industryData.whyUsTitle}
              </h3>
              <ul className="space-y-4">
                {industryData.whyUsList.map((item, idx) => (
                  <li key={idx} className="flex gap-3 items-start text-xs sm:text-sm text-slate-600 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-6">
              <Link
                href="/contact"
                className="w-full bg-[#1769E2] hover:bg-[#1769E2]/90 text-white font-extrabold text-sm h-11 inline-flex items-center justify-center transition-colors shadow-md rounded-none"
              >
                {isVi ? 'Liên hệ ngay' : isJa ? '今すぐ連絡' : 'Contact Now'}
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 3: GIẢI PHÁP PHÒNG SẠCH (Cleanroom Solutions) ── */}
      <section id="cleanroom" className="scroll-mt-36 py-16 lg:py-20 w-full bg-slate-50 border-t border-b border-slate-100">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 space-y-10">
          <div className="space-y-2 max-w-3xl">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">
              {translations.cleanroomSol}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36]">
              {isVi ? 'Nhóm sản phẩm chuyên dụng phòng sạch' : isJa ? 'クリーンルーム専用製品グループ' : 'Cleanroom Specialized Products'}
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              {industryData.cleanroomIntro}
            </p>
          </div>

          {/* Grid of 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industryData.cleanroomCategories.map((cat, idx) => {
              const bullets = getCategoryBullets(cat.name, locale);
              return (
                <div 
                  key={idx} 
                  className="group bg-white border border-slate-200/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Square Image container */}
                    <div className="relative aspect-square w-full bg-slate-50 overflow-hidden border-b border-slate-100 flex items-center justify-center p-1">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <h4 className="text-sm sm:text-base font-extrabold text-[#0F1E36] line-clamp-1 leading-snug">
                        {cat.name}
                      </h4>
                      {/* Features bullets */}
                      <ul className="space-y-1.5">
                        {bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex gap-2 items-start text-xs text-slate-500 font-semibold leading-snug">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* View solutions link */}
                  <div className="px-5 pb-5 pt-2">
                    <Link
                      href={`/solutions?industry=${currentSlug}&category=${cat.slug || 'cleanroom-consumables'}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
                    >
                      {isVi ? 'Xem danh mục sản phẩm' : isJa ? '製品カテゴリを見る' : 'View product category'}
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: BAO BÌ & ĐÓNG GÓI (Packaging Solutions) ── */}
      <section id="packaging" className="scroll-mt-36 py-16 lg:py-20 w-full bg-white">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 space-y-10">
          <div className="space-y-2 max-w-3xl">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">
              {translations.packagingSol}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36]">
              {isVi ? 'Bao bì & Đóng gói công nghiệp' : isJa ? '工業用包装＆パッケージング' : 'Industrial Packaging & Wrapping'}
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              {industryData.packagingIntro}
            </p>
          </div>

          {/* Grid of 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industryData.packagingCategories.map((cat, idx) => {
              const bullets = getCategoryBullets(cat.name, locale);
              return (
                <div 
                  key={idx} 
                  className="group bg-white border border-slate-200/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Square Image container */}
                    <div className="relative aspect-square w-full bg-slate-50 overflow-hidden border-b border-slate-100 flex items-center justify-center p-1">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <h4 className="text-sm sm:text-base font-extrabold text-[#0F1E36] line-clamp-1 leading-snug">
                        {cat.name}
                      </h4>
                      {/* Features bullets */}
                      <ul className="space-y-1.5">
                        {bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex gap-2 items-start text-xs text-slate-500 font-semibold leading-snug">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* View solutions link */}
                  <div className="px-5 pb-5 pt-2">
                    <Link
                      href={`/solutions?industry=${currentSlug}&category=${cat.slug || 'industrial-packaging'}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
                    >
                      {isVi ? 'Xem danh mục sản phẩm' : isJa ? '製品カテゴリを見る' : 'View product category'}
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: CHỨNG NHẬN & TIÊU CHUẨN (Standards & Certs) ── */}
      <section id="standards" className="scroll-mt-36 py-16 lg:py-20 w-full bg-slate-50 border-t border-b border-slate-100">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 space-y-10">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">
              {industryData.standardsTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36]">
              {isVi ? 'Tiêu chuẩn chất lượng khắt khe nhất' : isJa ? '最も厳格な品質管理基準' : 'Strict Quality Standards'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">
              {isVi 
                ? 'Sản phẩm của ULink đáp ứng đầy đủ các tiêu chuẩn quốc tế nghiêm ngặt nhất cho môi trường sản xuất.' 
                : isJa 
                ? 'ULinkの製品は、製造環境における最も厳格な国際基準に完全に準拠しています。' 
                : 'ULink products comply fully with the most rigorous international manufacturing standards.'}
            </p>
          </div>

          {/* Grid of standards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industryData.standards.map((std, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200/50 shadow-sm p-6 text-center space-y-3 flex flex-col items-center hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-black text-sm select-none border-2 border-blue-600">
                  {std.name.split(' ')[0]}
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-[#0F1E36]">
                    {std.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {std.detail}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-normal font-semibold max-w-[200px] mx-auto mt-2">
                    {isVi 
                      ? 'Đạt kiểm định xuất khẩu và an toàn kỹ thuật cao.' 
                      : isJa 
                      ? '輸出検査および高い技術的安全基準に適合。' 
                      : 'Certified for export and high safety performance.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: TRƯỜNG HỢP ÁP DỤNG (Case Studies) ── */}
      <section id="cases" className="scroll-mt-36 py-16 lg:py-20 w-full bg-white">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 space-y-10">
          <div className="space-y-2 max-w-3xl">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">
              {translations.cases}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36]">
              {industryData.casesTitle}
            </h2>
          </div>

          {/* Grid of 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {industryData.cases.map((cs, idx) => (
              <div 
                key={idx} 
                className="group bg-white border border-slate-200/50 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image wrapper */}
                  <div className="relative aspect-[16/10] w-full bg-slate-50 overflow-hidden border-b border-slate-100">
                    <Image
                      src={cs.image}
                      alt={cs.title}
                      fill
                      className="object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    {/* Badge */}
                    <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 uppercase tracking-wider">
                      {cs.badge}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-6 space-y-2">
                    <h4 className="text-sm sm:text-base font-extrabold text-[#0F1E36] line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {cs.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
                      {cs.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <Link
                    href="/about"
                    className="text-xs font-bold text-[#1769E2] inline-flex items-center gap-1 hover:underline"
                  >
                    {isVi ? 'Xem chi tiết case study' : isJa ? 'ケーススタディの詳細' : 'View case study details'}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND PARTNERS LOGOS GRID ── */}
      <section className="py-16 w-full bg-slate-50 border-t border-b border-slate-100">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-sm font-extrabold text-[#0F1E36] uppercase tracking-widest">
              {isVi 
                ? 'Được tin cậy bởi các tập đoàn và nhà máy sản xuất quy mô' 
                : isJa 
                ? '主要メーカーおよび大手工場からの信頼' 
                : 'Trusted by leading corporations and large manufacturing factories'}
            </h3>
            <div className="h-0.5 w-16 bg-blue-600 mx-auto" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {partnerLogos.map((logo, idx) => (
              <div 
                key={idx} 
                className="flex h-16 items-center justify-center p-2 bg-white border border-slate-200/50 shadow-sm transition-all duration-300 grayscale opacity-65 hover:grayscale-0 hover:opacity-100"
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={140}
                  height={50}
                  className="object-contain max-h-10 w-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ── */}
      {children}

    </div>
  );
}
