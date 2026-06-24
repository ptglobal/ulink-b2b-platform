import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isVi = locale === 'vi';
  const isJa = locale === 'ja';
  return {
    title: isVi
      ? 'Giải pháp theo Ngành nghề | ULink B2B'
      : isJa
      ? '業界別ソリューション | ULink B2B'
      : 'Industry Solutions | ULink B2B',
    description: isVi
      ? 'Khám phá giải pháp vật tư phòng sạch và đóng gói chuyên sâu cho các ngành Điện tử, Bán dẫn, Dược phẩm, Y tế, Thực phẩm và Cơ khí chế tạo.'
      : isJa
      ? '電子、半導体、製薬、医療、食品、精密機械業界向けのクリーンルームおよび包装ソリューションをご覧ください。'
      : 'Explore specialized cleanroom and packaging solutions for Electronics, Semiconductors, Pharmaceuticals, Medical, Food, and Manufacturing industries.'
  };
}

export default async function IndustriesPage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  const isVi = locale === 'vi';
  const isJa = locale === 'ja';

  // Content dictionary for multi-lingual support
  const content = {
    breadcrumbHome: isVi ? 'Trang chủ' : isJa ? 'ホーム' : 'Home',
    breadcrumbCurrent: isVi ? 'Ngành nghề' : isJa ? '業界別' : 'Industries',
    
    heroTitleLine1: isVi 
      ? 'Giải pháp tối ưu cho mọi ngành nghề.' 
      : isJa 
      ? 'あらゆる業界に最適なソリューション。' 
      : 'Optimized solutions for every industry.',
    heroTitleLine2: isVi 
      ? 'Phòng sạch & Đóng gói toàn diện.' 
      : isJa 
      ? '包括的なクリーンルーム＆包装。' 
      : 'Comprehensive Cleanroom & Packaging.',
      
    heroDesc: isVi
      ? 'ULink Industries thấu hiểu các tiêu chuẩn khắt khe và thách thức vận hành trong từng ngành. Chúng tôi cung cấp giải pháp toàn diện, giúp nâng cao chất lượng, đảm bảo an toàn và tối ưu hiệu suất.'
      : isJa
      ? 'ULink Industriesは、各業界の厳格な基準 và 運用の課題を深く理解しています。品質向上、安全確保、およびパフォーマンス最適化を支援する包括的なソリューションを提供します。'
      : 'ULink Industries understands the strict standards and operational challenges of each sector. We deliver end-to-end solutions to enhance quality, safety, and performance.',
      
    btnCleanroom: isVi ? 'Giải pháp phòng sạch' : isJa ? 'クリーンルームソリューション' : 'Cleanroom Solutions',
    btnPackaging: isVi ? 'Giải pháp đóng gói' : isJa ? '包装ソリューション' : 'Packaging Solutions',
    
    sectionTitle: isVi ? 'Giải pháp theo ngành nghề' : isJa ? '業界別ソリューション' : 'Solutions by Industry',
    sectionSubtitle: isVi
      ? 'Các giải pháp phòng sạch & đóng gói được thiết kế phù hợp với đặc thù và yêu cầu riêng của từng ngành.'
      : isJa
      ? '各業界の特性と個別の要件に合わせて設計されたクリーンルームおよび包装ソリューション。'
      : 'Cleanroom & packaging solutions designed to suit the specific characteristics and requirements of each industry.',
      
    keySolutionsLabel: isVi ? 'Giải pháp chính:' : isJa ? '主なソリューション:' : 'Key solutions:',
    btnViewDetails: isVi ? 'Xem chi tiết' : isJa ? '詳細を見る' : 'Xem chi tiết',
    
    bottomQuoteBtn: isVi ? 'Yêu cầu báo giá/Liên hệ' : isJa ? '見積もり依頼/お問い合わせ' : 'Yêu cầu báo giá/Liên hệ',
    
    bottomColumns: [
      {
        icon: '/images/icons/icon_support.png',
        title: isVi ? 'Đội ngũ chuyên môn' : isJa ? '専門家チーム' : 'Đội ngũ chuyên môn',
        desc: isVi ? 'Tư vấn giải pháp phù hợp theo từng ngành nghề.' : isJa ? '業界ごとに適したソリューションを提案します。' : 'Tư vấn giải pháp phù hợp theo từng ngành nghề.'
      },
      {
        icon: '/images/icons/icon_customization.png',
        title: isVi ? 'Giải pháp tùy chỉnh' : isJa ? 'カスタムソリューション' : 'Giải pháp tùy chỉnh',
        desc: isVi ? 'Thiết kế linh hoạt, đáp ứng yêu cầu đặc thù của khách hàng.' : isJa ? 'お客様の固有の要件に対応する柔軟な設計。' : 'Thiết kế linh hoạt, đáp ứng yêu cầu đặc thù của khách hàng.'
      },
      {
        icon: '/images/icons/icon_global.png',
        title: isVi ? 'Chuỗi cung ứng toàn cầu' : isJa ? 'グローバルサプライチェーン' : 'Chuỗi cung ứng toàn cầu',
        desc: isVi ? 'Sản phẩm chất lượng từ các đối tác uy tín trên toàn thế giới.' : isJa ? '世界中の信頼できるパートナーからの高品質製品。' : 'Sản phẩm chất lượng từ các đối tác uy tín trên toàn thế giới.'
      },
      {
        icon: '/images/icons/icon_standards.png',
        title: isVi ? 'Chất lượng & tiêu chuẩn' : isJa ? '品質と基準' : 'Chất lượng & tiêu chuẩn',
        desc: isVi ? 'Đáp ứng ISO, GMP, RoHS và các tiêu chuẩn quốc tế khác.' : isJa ? 'ISO、GMP、RoHS、およびその他の国際基準に準拠。' : 'Đáp ứng ISO, GMP, RoHS và các tiêu chuẩn quốc tế khác.'
      }
    ],

    industries: [
      {
        slug: 'electronics',
        name: isVi ? 'Điện tử' : isJa ? '電子' : 'Electronics',
        icon: '/images/icons/icon_electronics.png',
        image: '/images/icons/electronics.png',
        description: isVi 
          ? 'Kiểm soát tĩnh điện và hạt bụi, bảo vệ linh kiện và đảm bảo độ tin cậy.'
          : isJa
          ? '静電気と塵埃を制御し、部品を保護して信頼性を確保します。'
          : 'Static and dust particle control, protecting components and ensuring reliability.',
        bullets: isVi 
          ? ['Phòng sạch & PPE', 'Sản phẩm chống tĩnh điện', 'Vật tư phòng sạch', 'Bao bì chống ẩm và chống tĩnh điện']
          : isJa
          ? ['クリーンルーム＆PPE', '静電気対策製品', 'クリーンルーム資材', '防湿・静電防止包装']
          : ['Cleanroom & PPE', 'ESD Products', 'Cleanroom Consumables', 'Moisture & ESD Packaging']
      },
      {
        slug: 'electronics',
        name: isVi ? 'Bán dẫn' : isJa ? '半導体' : 'Semiconductors',
        icon: '/images/icons/icon_semiconductor.png',
        image: '/images/icons/semiconductor.png',
        description: isVi 
          ? 'Đáp ứng tiêu chuẩn siêu sạch, kiểm soát hạt siêu mịn và tạp chất.'
          : isJa
          ? '超クリーン基準を満たし、超微細粒子や不純物を制御します。'
          : 'Meeting ultra-clean standards, controlling sub-micron particles and impurities.',
        bullets: isVi 
          ? ['Phòng sạch & PPE', 'Vật tư phòng sạch', 'Hóa chất & vật liệu chuyên dụng', 'Bao bì chân không & chống tĩnh điện']
          : isJa
          ? ['クリーンルーム＆PPE', 'クリーンルーム資材', '専用化学品＆材料', '真空・静電防止包装']
          : ['Cleanroom & PPE', 'Cleanroom Consumables', 'Specialized Materials & Chemicals', 'Vacuum & ESD Packaging']
      },
      {
        slug: 'pharmaceutical-cosmetics',
        name: isVi ? 'Dược phẩm' : isJa ? '製薬' : 'Pharmaceuticals',
        icon: '/images/icons/icon_pharmaceutical.png',
        image: '/images/icons/pharmaceuticals.png',
        description: isVi 
          ? 'Tuân thủ GMP, đảm bảo vô trùng và an toàn trong sản xuất.'
          : isJa
          ? 'GMPに準拠し、製造における無菌性と安全性を確保します。'
          : 'GMP compliance, ensuring sterility and safety in production.',
        bullets: isVi 
          ? ['Phòng sạch & PPE', 'Vật tư tiêu hao', 'Thiết bị phòng sạch', 'Bao bì dược phẩm']
          : isJa
          ? ['クリーンルーム＆PPE', '消耗資材', 'クリーンルーム設備', '医薬品包装']
          : ['Cleanroom & PPE', 'Consumable Supplies', 'Cleanroom Equipment', 'Pharmaceutical Packaging']
      },
      {
        slug: 'pharmaceutical-cosmetics',
        name: isVi ? 'Y tế' : isJa ? '医療' : 'Medical',
        icon: '/images/icons/icon_medical.png',
        image: '/images/icons/medical.png',
        description: isVi 
          ? 'Đảm bảo vô trùng, bảo vệ nhân viên và bệnh nhân khỏi nhiễm chéo.'
          : isJa
          ? '無菌性を確保し、スタッフと患者を交差感染から保護します。'
          : 'Ensuring sterility, protecting staff and patients from cross-contamination.',
        bullets: isVi 
          ? ['Phòng sạch & PPE', 'Vật tư y tế dùng một lần', 'Dung dịch & hóa chất', 'Giải pháp khử khuẩn']
          : isJa
          ? ['クリーンルーム＆PPE', '使い捨て医療用資材', '薬液＆化学品', '消毒・滅菌ソリューション']
          : ['Cleanroom & PPE', 'Disposable Medical Supplies', 'Solutions & Chemicals', 'Disinfection Solutions']
      },
      {
        slug: 'food-beverage',
        name: isVi ? 'Thực phẩm' : isJa ? '食品' : 'Food',
        icon: '/images/icons/icon_food.png',
        image: '/images/icons/food_processing.png',
        description: isVi 
          ? 'Kiểm soát vi sinh và dị vật, đảm bảo an toàn thực phẩm.'
          : isJa
          ? '微生物と異物を制御し、食品安全を確保します。'
          : 'Controlling microbes and foreign bodies, ensuring food safety.',
        bullets: isVi 
          ? ['Phòng sạch & PPE', 'Vật tư tiêu hao', 'Hóa chất vệ sinh', 'Bao bì thực phẩm']
          : isJa
          ? ['クリーンルーム＆PPE', '消耗資材', '衛生化学品', '食品包装']
          : ['Cleanroom & PPE', 'Consumable Supplies', 'Sanitation Chemicals', 'Food Packaging']
      },
      {
        slug: 'automotive',
        name: isVi ? 'Cơ khí chế tạo' : isJa ? '精密機械' : 'Manufacturing',
        icon: '/images/icons/icon_manufacturing.png',
        image: '/images/icons/manufacturing.png',
        description: isVi 
          ? 'Bảo vệ sản phẩm và thiết bị, ổn định sản xuất và nâng cao chất lượng.'
          : isJa
          ? '製品と設備を保護し、生産を安定させて品質を向上させます。'
          : 'Protecting products and equipment, stabilizing production and improving quality.',
        bullets: isVi 
          ? ['Phòng sạch & PPE', 'Vật tư phòng sạch', 'Dầu mỡ & hóa chất', 'Bao bì bảo vệ sản phẩm']
          : isJa
          ? ['クリーンルーム＆PPE', 'クリーンルーム資材', '潤滑油＆化学品', '製品保護包装']
          : ['Cleanroom & PPE', 'Cleanroom Consumables', 'Lubricants & Chemicals', 'Product Protective Packaging']
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-16">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 py-8 flex flex-col gap-10">
        
        {/* Breadcrumb Section */}
        <nav className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            {content.breadcrumbHome}
          </Link>
          <span className="mx-1">/</span>
          <span className="text-slate-500 font-semibold">{content.breadcrumbCurrent}</span>
        </nav>

        {/* Hero Section Banner Layout */}
        <div className="relative overflow-hidden bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-stretch min-h-[350px] shadow-sm">
          {/* Left Content Side */}
          <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center space-y-6 z-10 bg-gradient-to-r from-slate-50 via-slate-50/95 to-transparent md:max-w-2xl lg:max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0F1E36] leading-[1.15]">
              {content.heroTitleLine1}
              <br />
              {content.heroTitleLine2}
            </h1>
            
            <p className="text-xs sm:text-sm leading-relaxed text-slate-500 max-w-xl font-medium">
              {content.heroDesc}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={`/solutions?category=cleanroom-consumables`}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#0F1E36] px-6 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#1A2D49] transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <img src="/images/icons/icon_standards.png" className="h-4.5 w-4.5 mr-2 brightness-0 invert" alt="" />
                {content.btnCleanroom}
              </Link>
              <Link
                href={`/solutions?category=industrial-packaging`}
                className="inline-flex h-11 items-center justify-center rounded-lg border-2 border-[#0F1E36] bg-white px-6 text-xs sm:text-sm font-semibold text-[#0F1E36] hover:bg-slate-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <img src="/images/icons/icon_packaging.png" className="h-4.5 w-4.5 mr-2" alt="" />
                {content.btnPackaging}
              </Link>
            </div>
          </div>

          {/* Right Cleanroom Background Image */}
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[45%] lg:w-[50%] z-0">
            <img
              src="/images/icons/food_processing.png"
              className="w-full h-full object-cover"
              alt="ULink Cleanroom Solutions"
            />
            {/* White overlay gradient to blend with left text */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent" />
          </div>
        </div>

        {/* Industry Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-6 border-t border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F1E36] shrink-0">
            {content.sectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl md:text-right font-medium">
            {content.sectionSubtitle}
          </p>
        </div>

        {/* Grid of 6 Industry Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {content.industries.map((ind, index) => (
            <div
              key={index}
              className="flex rounded-xl border border-slate-100 bg-[#F8FAFC] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Card Left: text and details (60% width) */}
              <div className="w-[60%] flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4">
                <div className="space-y-4">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-2.5">
                    <img src={ind.icon} className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" alt="" />
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0F1E36] leading-tight">
                      {ind.name}
                    </h3>
                  </div>
                  
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed min-h-[48px]">
                    {ind.description}
                  </p>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {content.keySolutionsLabel}
                    </p>
                    <ul className="space-y-1 text-[11px] text-slate-600 font-medium">
                      {ind.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-[#1769E2] font-bold select-none shrink-0">✓</span>
                          <span className="leading-tight">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/industries/${ind.slug}`}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-bold text-slate-700 hover:border-[#0F1E36] hover:text-[#0F1E36] transition-all hover:scale-[1.01]"
                  >
                    {content.btnViewDetails} <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>

              {/* Card Right: industry photo (40% width) */}
              <div className="w-[40%] shrink-0 relative hidden sm:block">
                <img
                  src={ind.image}
                  className="w-full h-full object-cover"
                  alt={`${ind.name} solution`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar Section */}
        <div className="mt-8 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 p-6 sm:p-8 bg-[#F8FAFC] rounded-xl border border-slate-200/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
            {content.bottomColumns.map((col, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <img src={col.icon} className="h-5.5 w-5.5 shrink-0" alt="" />
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-[#0F1E36] leading-snug">
                    {col.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-medium">
                    {col.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center shrink-0 self-start sm:self-auto pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-200/60 w-full xl:w-auto">
            <Link
              href={`/quick-order`}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#0F1E36] px-6 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#1A2D49] transition-all hover:scale-[1.01] w-full sm:w-auto text-center"
            >
              {content.bottomQuoteBtn} <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
