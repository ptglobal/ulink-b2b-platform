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
  Factory,
  Package,
  User,
  Clock
} from '@/components/icons';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { BrandedMedia } from '@/components/media/branded-media';
import { ASSETS } from '@/lib/assets';
import { IndustryDetailClientProps } from './types';
import { IndustryValueProps } from './industry-value-props';
import { getTranslatedName, getTranslatedField } from '@/lib/i18n-content';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';




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

const caseMedia = [
  '/images/industries/case_cleanroom.webp',
  '/images/industries/case_packaging.webp',
  '/images/industries/case_supplier.webp'
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
  const [showToast, setShowToast] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleCatalogueClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Tabs definitions
  const tabs = [
    { id: 'overview', label: translations.overview },
    { id: 'cleanroom', label: translations.cleanroomSol },
    { id: 'packaging', label: translations.packagingSol },
    { id: 'standards', label: industryData.standardsTitle },
    { id: 'cases', label: translations.cases }
  ];

  // Construct dynamic cleanroom items from DB products array if present, or fallback to static list
  const displayCleanroomItems = (products && products.length > 0)
    ? products.slice(0, 4).map((p) => {
      const pName = getTranslatedName(p, locale) || p.name;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const heroImg = (p as any).hero;
      const imageSrc = heroImg
        ? (heroImg.startsWith('http') || heroImg.startsWith('/') ? heroImg : `${getDirectusUrl()}/assets/${heroImg}`)
        : '';

      const catSlug = (p.category as any)?.slug || 'cleanroom-consumables';
      return {
        name: pName,
        image: imageSrc,
        href: `/solutions/categories/${catSlug}`,
        bullets: getCategoryBullets(pName, locale)
      };
    })
    : industryData.cleanroomCategories.map((cat) => ({
      name: cat.name,
      image: cat.image,
      href: `/solutions/categories/${cat.slug || 'cleanroom-consumables'}`,
      bullets: getCategoryBullets(cat.name, locale)
    }));

  // Construct dynamic packaging items from DB products array if present, or fallback to static list
  const displayPackagingItems = (products && products.length > 4)
    ? products.slice(4, 8).map((p) => {
      const pName = getTranslatedName(p, locale) || p.name;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const heroImg = (p as any).hero;
      const imageSrc = heroImg
        ? (heroImg.startsWith('http') || heroImg.startsWith('/') ? heroImg : `${getDirectusUrl()}/assets/${heroImg}`)
        : '';

      const catSlug = (p.category as any)?.slug || 'industrial-packaging';
      return {
        name: pName,
        image: imageSrc,
        href: `/solutions/categories/${catSlug}`,
        bullets: getCategoryBullets(pName, locale)
      };
    })
    : industryData.packagingCategories.map((cat) => ({
      name: cat.name,
      image: cat.image,
      href: `/solutions/categories/${cat.slug || 'industrial-packaging'}`,
      bullets: getCategoryBullets(cat.name, locale)
    }));

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
    <div className="min-h-screen bg-background text-slate-900 font-sans">

      {/* ── SECTION 1: HERO BANNER (Full Width) ── */}
      <section className="relative flex min-h-[460px] w-full flex-col justify-center overflow-hidden bg-brand-deep md:min-h-[500px]">
        <BrandedMedia
          src={industryData.bannerImage}
          alt={industryData.title}
          className="absolute inset-0"
          imageClassName="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-brand-deep/70" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 grid grid-cols-4 opacity-30 md:grid-cols-8 lg:grid-cols-16" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index} className="border-r border-white/10" />
          ))}
        </div>

        {/* Content Container */}
        <div className="relative z-20 mx-auto flex h-full w-full max-w-[1440px] flex-col items-start justify-center px-4 pb-20 pt-28 sm:px-8 lg:px-16">
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
            <Factory className="mb-8 h-10 w-10 text-brand-soft" aria-hidden="true" />
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
              onClick={handleCatalogueClick}
              className="inline-flex h-11 items-center justify-center gap-2 border border-white bg-transparent hover:bg-white hover:text-slate-900 text-white font-extrabold text-sm px-6 py-2.5 transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300 rounded-none shadow-sm"
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
      <div className="sticky top-[72px] z-30 bg-white border-b border-slate-200/80 shadow-md transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300 mt-12">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
          <div className="flex overflow-x-auto no-scrollbar py-0.5 gap-8 scroll-smooth">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={(e) => handleTabClick(e, tab.id)}
                className={`py-4.5 text-xs sm:text-sm font-bold transition-[color,background-color,border-color,box-shadow,opacity,transform] relative border-b-2 whitespace-nowrap leading-none ${activeTab === tab.id
                    ? 'border-brand text-brand'
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
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

            <div className="grid min-h-[220px] w-full border-y border-border bg-brand/[0.06] sm:grid-cols-2 lg:grid-cols-4">
              {industryData.standards.slice(0, 4).map((standard, index) => (
                <div key={standard.name} className="flex min-h-40 flex-col justify-between border-b border-r border-border p-5 sm:border-b-0">
                  <span className="font-mono text-xs text-brand">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="text-base font-medium text-foreground">{standard.name}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{standard.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (1/3) - Why Choose ULINK Card */}
          <div className="bg-background border border-slate-200/80 p-8 shadow-sm space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-5">
              <h3 className="text-lg font-extrabold text-foreground border-b pb-4 flex items-center gap-2">
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
                className="w-full bg-brand hover:bg-brand/90 text-white font-extrabold text-sm h-11 inline-flex items-center justify-center transition-colors shadow-md rounded-none"
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {isVi ? 'Nhóm sản phẩm chuyên dụng phòng sạch' : isJa ? 'クリーンルーム専用製品グループ' : 'Cleanroom Specialized Products'}
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              {industryData.cleanroomIntro}
            </p>
          </div>

          {/* Grid of 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayCleanroomItems.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className="group bg-white border border-slate-200/50 shadow-sm hover:shadow-xl transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300 flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Square Image container */}
                    <Link href={item.href} className="block relative aspect-square w-full bg-slate-50 overflow-hidden border-b border-slate-100 p-1">
                      {item.image ? (
                        <BrandedMedia
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0"
                          imageClassName="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          compactBrand
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-brand/[0.06]">
                          <Package className="h-12 w-12 text-brand" aria-hidden="true" />
                        </div>
                      )}
                    </Link>
                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <Link href={item.href} className="block">
                        <h4 className="text-sm sm:text-base font-extrabold text-foreground line-clamp-1 leading-snug hover:text-blue-600 transition-colors" title={item.name}>
                          {item.name}
                        </h4>
                      </Link>
                      {/* Features bullets */}
                      <ul className="space-y-1.5">
                        {item.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex gap-2 items-start text-xs text-slate-500 font-semibold leading-snug">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* View product link */}
                  <div className="px-5 pb-5 pt-2">
                    <Link
                      href={item.href}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
                    >
                      {isVi ? 'Xem danh sách sản phẩm' : isJa ? '製品リストを見る' : 'View product list'}
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {isVi ? 'Bao bì & Đóng gói công nghiệp' : isJa ? '工業用包装＆パッケージング' : 'Industrial Packaging & Wrapping'}
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              {industryData.packagingIntro}
            </p>
          </div>

          {/* Grid of 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPackagingItems.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className="group bg-white border border-slate-200/50 shadow-sm hover:shadow-xl transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300 flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Square Image container */}
                    <Link href={item.href} className="block relative aspect-square w-full bg-slate-50 overflow-hidden border-b border-slate-100 p-1">
                      {item.image ? (
                        <BrandedMedia
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0"
                          imageClassName="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          compactBrand
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-brand/[0.06]">
                          <Package className="h-12 w-12 text-brand" aria-hidden="true" />
                        </div>
                      )}
                    </Link>
                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <Link href={item.href} className="block">
                        <h4 className="text-sm sm:text-base font-extrabold text-foreground line-clamp-1 leading-snug hover:text-blue-600 transition-colors" title={item.name}>
                          {item.name}
                        </h4>
                      </Link>
                      {/* Features bullets */}
                      <ul className="space-y-1.5">
                        {item.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex gap-2 items-start text-xs text-slate-500 font-semibold leading-snug">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* View product link */}
                  <div className="px-5 pb-5 pt-2">
                    <Link
                      href={item.href}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
                    >
                      {isVi ? 'Xem danh sách sản phẩm' : isJa ? '製品リストを見る' : 'View product list'}
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
      <section id="standards" className="scroll-mt-36 py-16 lg:py-20 w-full bg-[#F4F8FE]/60 border-t border-b border-blue-100/70">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 space-y-10">
          <div className="space-y-2 text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block">
              {industryData.standardsTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {isVi ? 'Tiêu chuẩn chất lượng khắt khe nhất' : isJa ? '最も厳格な品質管理基準' : 'Strict Quality Standards'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              {isVi
                ? `Tất cả sản phẩm dành cho ngành ${industryData.name} của ULink đều được kiểm định và đạt các tiêu chuẩn quốc tế uy tín nhất.`
                : isJa
                  ? `ULinkの${industryData.name}向け製品はすべて検査を受け、最も信頼性の高い国際基準に適合しています。`
                  : `All ULink products for ${industryData.name} are inspected and meet the most prestigious international standards.`}
            </p>
          </div>

          {/* Grid of 4 standards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industryData.standards.map((std, idx) => {
              const icons = [ShieldCheck, CheckCircle2, Package, User];
              const IconComp = icons[idx % icons.length];

              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/80 rounded-xl p-6 text-center space-y-4 flex flex-col items-center hover:shadow-lg transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100/70 text-blue-600 border border-blue-200/50">
                    <IconComp className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-extrabold text-foreground leading-snug">
                      {std.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {std.detail}
                    </p>
                  </div>
                </div>
              );
            })}
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {industryData.casesTitle}
            </h2>
          </div>

          {/* Grid of 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {industryData.cases.map((cs, idx) => (
              <div
                key={idx}
                className="group bg-white border border-slate-200/50 overflow-hidden shadow-sm hover:shadow-lg transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image wrapper */}
                  <div className="relative aspect-[16/10] w-full bg-slate-50 overflow-hidden border-b border-slate-100">
                    <BrandedMedia
                      src={caseMedia[idx % caseMedia.length]}
                      alt={cs.title}
                      className="absolute inset-0"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      compactBrand
                    />
                    {/* Badge */}
                    <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 uppercase tracking-wider">
                      {cs.badge}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-6 space-y-2">
                    <h4 className="text-sm sm:text-base font-extrabold text-foreground line-clamp-2 leading-snug">
                      {cs.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {cs.description}
                    </p>
                  </div>
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
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest">
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
                className="flex h-16 items-center justify-center p-2 bg-white border border-slate-200/50 shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300 grayscale opacity-65 hover:grayscale-0 hover:opacity-100"
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

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500/20">
          <Clock className="h-5 w-5 text-amber-500 shrink-0 animate-pulse" />
          <span className="text-sm font-semibold">
            {isVi ? 'Tài liệu đang chờ cập nhật' : isJa ? 'カタログドキュメントは準備中です' : 'The document is pending update'}
          </span>
        </div>
      )}
    </div>
  );
}
