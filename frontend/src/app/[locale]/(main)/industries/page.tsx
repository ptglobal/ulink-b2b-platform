import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Armchair, Warehouse, Pill, Utensils, Wrench, Cpu, Check, ArrowRight } from 'lucide-react';
import CoreAdvantages from '@/components/solutions/core-advantages';
import AboutUsHub from '@/components/solutions/about-us-hub';
import ContactCta from '@/components/solutions/contact-cta';
import MarketNews from '@/components/solutions/market-news';
import FaqSection from '@/components/solutions/faq-section';
import {
  TargetSegments,
  PartnersCertifications,
  WorkingProcess
} from '@/components/home';
type Props = { params: { locale: string } };

const IconMap: Record<string, React.ComponentType<any>> = {
  Armchair: Armchair,
  Warehouse: Warehouse,
  Pill: Pill,
  Utensils: Utensils,
  Wrench: Wrench,
  Cpu: Cpu
};

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

  const content = {
    breadcrumbHome: isVi ? 'Trang chủ' : isJa ? 'ホーム' : 'Home',
    breadcrumbCurrent: isVi ? 'Ngành nghề' : isJa ? '業界別' : 'Industries',
    viewDetails: isVi ? 'Xem chi tiết' : isJa ? '詳細を見る' : 'View details'
  };

  const industriesList = [
    {
      slug: 'furniture',
      name: isVi ? 'Nội thất' : isJa ? '家具・インテリア' : 'Furniture & Interior',
      icon: 'Armchair',
      image: '/images/home/section3/funiture.webp',
      description: isVi
        ? 'Bảo vệ toàn diện bề mặt gỗ, da, vải và kim loại trong suốt quy trình sản xuất, vận chuyển và lắp đặt nội thất cao cấp.'
        : isJa
          ? '高級家具の製造、輸送、設置プロセス全体において、木材、皮革、布地、金属の表面を包括的に保護します。'
          : 'Comprehensive protection for wood, leather, fabric, and metal surfaces throughout the manufacturing, transport, and installation of premium furniture.',
      bullets: isVi
        ? [
          'Màng bọc PE bảo vệ bề mặt gỗ & da',
          'Bao bì carton chống va đập & xốp định hình',
          'Túi chống ẩm cho linh kiện & phụ kiện nội thất'
        ]
        : isJa
          ? [
            '木材・皮革表面保護用PEラップ',
            '耐衝撃ダンボール包装＆成形発泡スチロール',
            '家具部品・アクセサリー用防湿バッグ'
          ]
          : [
            'PE wrap protecting wood & leather surfaces',
            'Anti-impact carton packaging & molded foam',
            'Moisture-proof bags for components & accessories'
          ]
    },
    {
      slug: 'logistics',
      name: isVi ? 'Kho & Logistics' : isJa ? '倉庫＆物流' : 'Warehouse & Logistics',
      icon: 'Warehouse',
      image: '/images/about/op-warehouse.webp',
      description: isVi
        ? 'Tối ưu hóa quy trình lưu kho, vận chuyển và phân phối hàng hóa với giải pháp bao bì bảo vệ chuyên dụng từ ULink Industries.'
        : isJa
          ? 'ULink Industriesの専用保護包装ソリューションにより、倉庫保管、輸送、および流通プロセスを最適化します。'
          : 'Optimize warehousing, transport, and distribution processes with specialized protective packaging solutions from ULink Industries.',
      bullets: isVi
        ? [
          'Màng co, màng quấn pallet bảo vệ hàng hóa',
          'Bao bì chống ẩm, chống va đập khi vận chuyển',
          'Vật tư đóng gói & dán nhãn cho kho bãi'
        ]
        : isJa
          ? [
            '貨物保護用シュリンクフィルム＆パレットラップ',
            '輸送用防湿・耐衝撃包装',
            '倉庫用梱包資材＆ラベル表示'
          ]
          : [
            'Shrink film & pallet wrap protecting cargo',
            'Moisture-proof & anti-impact transport packaging',
            'Packaging materials & labeling for warehouses'
          ]
    },
    {
      slug: 'pharmaceutical',
      name: isVi ? 'Dược phẩm' : isJa ? '製薬・バイオ' : 'Pharmaceuticals',
      icon: 'Pill',
      image: '/images/about/quality-hero-bg.webp',
      description: isVi
        ? 'Các sản phẩm bảo hộ y tế chất lượng cao, phục vụ môi trường khám chữa bệnh, phẫu thuật chuẩn vô trùng.'
        : isJa
          ? '無菌基準の診療・手術環境に対応する、高品質な医療用保護製品。'
          : 'High-quality medical protective products serving sterile examination and surgical environments.',
      bullets: isVi
        ? [
          'Khẩu trang y tế, găng tay vô trùng tiêu chuẩn',
          'Dụng cụ bảo hộ phẫu thuật dùng một lần',
          'Bao bì và hộp đựng rác thải y tế chuyên dụng'
        ]
        : isJa
          ? [
            '標準的な医療用マスク＆無菌手袋',
            '使い捨て手術用保護具',
            '医療用専用包装＆廃棄物容器'
          ]
          : [
            'Standard medical masks & sterile gloves',
            'Single-use surgical protective equipment',
            'Specialized medical packaging & waste containers'
          ]
    },
    {
      slug: 'food',
      name: isVi ? 'Thực phẩm' : isJa ? '食品・飲料' : 'Food & Beverage',
      icon: 'Utensils',
      image: '/images/icons/food_processing.webp',
      description: isVi
        ? 'Giải pháp bao bì chuyên dụng cho ngành thực phẩm & đồ uống — màng co PE, màng bọc thực phẩm, bảo quản tươi ngon, đạt chuẩn ISO 22000.'
        : isJa
          ? '食品・飲料業界向けの専用包装ソリューション — PEシュリンクフィルム、食品用ラップ、鮮度保持、ISO 22000基準。'
          : 'Specialized packaging solutions for the food & beverage industry — PE shrink film, food wrap, freshness preservation, ISO 22000 standard.',
      bullets: isVi
        ? [
          'Màng bọc, túi đóng gói thực phẩm an toàn',
          'Trang phục bảo hộ cho công nhân chế biến',
          'Giải pháp kiểm soát vi sinh bề mặt thiết bị'
        ]
        : isJa
          ? [
            '安全な食品用ラップ＆包装袋',
            '加工従事者用保護作業服',
            '設備表面の微生物制御ソリューション'
          ]
          : [
            'Safe food wraps & packaging bags',
            'Protective clothing for food processing workers',
            'Microbial control solutions for equipment surfaces'
          ]
    },
    {
      slug: 'manufacturing',
      name: isVi ? 'Cơ khí chế tạo & HVAC' : isJa ? '精密機械＆HVAC' : 'Precision Engineering & HVAC',
      icon: 'Wrench',
      image: '/images/icons/manufacturing.webp',
      description: isVi
        ? 'Cung cấp vật tư cơ khí, phụ kiện ống đồng, van điều khiển và thiết bị HVAC chính hãng cho hệ thống điều hòa không khí và thông gió công nghiệp.'
        : isJa
          ? '産業用空調・換気システム向けに、機械資材、銅管継手、制御バルブ、および純正HVAC機器を提供します。'
          : 'Providing engineering materials, copper pipe fittings, control valves, and genuine HVAC equipment for industrial air conditioning and ventilation systems.',
      bullets: isVi
        ? [
          'Màng PE đóng kiện, dây đai chịu lực lớn',
          'Dầu, mỡ bôi trơn và hóa chất công nghiệp',
          'Kẹp cơ khí và màng chống rỉ sét VCI'
        ]
        : isJa
          ? [
            '梱包用PEフィルム＆高耐荷重ストラップ',
            '工業用潤滑油・グリース＆化学品',
            '機械用クランプ＆VCI防錆フィルム'
          ]
          : [
            'PE packaging film & heavy-duty strapping',
            'Industrial lubricants, greases & chemicals',
            'Mechanical clamps & VCI anti-rust film'
          ]
    },
    {
      slug: 'electronics',
      name: isVi ? 'Điện tử' : isJa ? '電子・半導体' : 'Electronics & Semiconductors',
      icon: 'Cpu',
      image: '/images/icons/electronics.webp',
      description: isVi
        ? 'Đảm bảo môi trường sản xuất không ô nhiễm hạt bụi và tĩnh điện, bảo vệ cấu trúc nhạy cảm của vi mạch.'
        : isJa
          ? '塵埃や静電気のないクリーンな製造環境を確保し、微細な集積回路の脆弱な構造を保護します。'
          : 'Ensuring a clean manufacturing environment free of dust particles and static electricity, protecting the sensitive structures of microcircuits.',
      bullets: isVi
        ? [
          'Phòng sạch & trang phục bảo hộ PPE',
          'Sản phẩm chống tĩnh điện ESD chuyên dụng',
          'Bao bì chống ẩm, chống từ trường đa lớp'
        ]
        : isJa
          ? [
            'クリーンルーム＆PPE保護服',
            '静電気放電（ESD）対策専用製品',
            '多層防湿・防磁シールド包装'
          ]
          : [
            'Cleanroom & PPE protective wear',
            'Specialized electrostatic discharge (ESD) products',
            'Multi-layer moisture-barrier & shielding packaging'
          ]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-16">
      {/* Hero Section Banner Layout - Full Width */}
      <div className="relative overflow-hidden bg-slate-900 min-h-[420px] lg:min-h-[480px] shadow-sm flex items-stretch w-full">
        {/* Background Image */}
        <Image
          src="/images/industries/indus.png"
          alt="ULink Industries Solutions"
          fill
          className="object-cover pointer-events-none"
          priority
        />
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-slate-950/45 z-0" />

        {/* Content - Contrained inside max-width container for content alignment */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-blue-200/90 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              {content.breadcrumbHome}
            </Link>
            <span className="text-blue-200/40">&gt;</span>
            <span className="text-white font-medium">{content.breadcrumbCurrent}</span>
          </nav>

          {/* Text area */}
          <div className="max-w-3xl my-auto">
            <h1 className="text-2xl sm:text-3.5xl lg:text-[40px] font-extrabold text-white leading-[1.2] tracking-tight">
              {isVi
                ? 'Tối ưu chuỗi cung ứng nguyên liệu và vật tư với giải pháp Phòng sạch & Đóng gói.'
                : isJa
                  ? 'クリーンルーム＆包装ソリューションによる原材料と資材のサプライチェーン最適化。'
                  : 'Optimizing material & supply chain with Cleanroom & Packaging solutions.'}
            </h1>
            <p className="mt-5 text-xs sm:text-sm lg:text-base leading-relaxed text-blue-100/90 max-w-2xl font-medium">
              {isVi
                ? 'ULink Industries thấu hiểu các tiêu chuẩn khắt khe & thách thức vận hành trong từng ngành. Chúng tôi cung cấp giải pháp toàn diện, giúp nâng cao chất lượng, đảm bảo an toàn & tối ưu hiệu suất sản xuất.'
                : isJa
                  ? 'ULink Industriesは、各業界の厳格な基準と運用の課題を深く理解しています。品質向上、安全確保、および生産効率最適化を支援する包括的なソリューションを提供します。'
                  : 'ULink Industries understands the strict standards & operational challenges in each sector. We deliver comprehensive solutions to enhance quality, ensure safety & optimize production efficiency.'}
            </p>

            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white text-white hover:bg-white/10 px-5 py-2.5 text-xs sm:text-sm font-bold tracking-wide transition-colors"
              >
                {isVi ? 'Liên hệ với Chúng tôi' : isJa ? 'お問い合わせ' : 'Contact Us'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 py-12 lg:py-16 flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col items-start max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] leading-tight tracking-tight">
            {isVi
              ? 'Giải pháp theo ngành nghề'
              : isJa
                ? '業界別ソリューション'
                : 'Solutions by Industry'}
          </h2>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed font-medium">
            {isVi
              ? 'Các giải pháp phòng sạch & đóng gói được thiết kế phù hợp với đặc thù & yêu cầu riêng của từng ngành nghề sản xuất.'
              : isJa
                ? '各業界の特性と個別の要件に合わせて設計されたクリーンルームおよび包装ソリューション。'
                : 'Cleanroom & packaging solutions designed to suit the specific characteristics and requirements of each manufacturing industry.'}
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industriesList.map((ind, index) => {
            const IconComponent = IconMap[ind.icon] || Cpu;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Top Image */}
                <Link
                  href={`/industries/${ind.slug}`}
                  className="relative aspect-[16/10] w-full bg-slate-50 overflow-hidden block"
                >
                  <Image
                    src={ind.image}
                    alt={ind.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105 duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </Link>

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Icon & Title */}
                  <Link
                    href={`/industries/${ind.slug}`}
                    className="flex items-center gap-2.5 mb-4 group/title"
                  >
                    <IconComponent className="h-5.5 w-5.5 text-blue-600 shrink-0" />
                    <h3 className="text-base sm:text-lg font-bold text-[#0F1E36] group-hover/title:text-blue-600 leading-tight transition-colors">
                      {ind.name}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed flex-1 font-medium">
                    {ind.description}
                  </p>

                  {/* Bullet Points */}
                  <ul className="space-y-2.5 mb-6">
                    {ind.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-600 font-medium leading-normal">
                        <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* View Details Link */}
                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <Link
                      href={`/industries/${ind.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {content.viewDetails}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Core Advantages & Features Section */}
        <CoreAdvantages locale={locale} />

        {/* About Us & Hub Ha Nam Section */}
        <AboutUsHub locale={locale} />
      </div>
      {/* Customer Segments Section */}
      <TargetSegments />

      <PartnersCertifications />
      <WorkingProcess />

      {/* Market News Section */}
      <MarketNews locale={locale} />



      {/* Direct Contact Banner Section */}
      <ContactCta locale={locale} />

      {/* FAQ Accordion Section */}
      <FaqSection locale={locale} />
    </div>
  );
}
