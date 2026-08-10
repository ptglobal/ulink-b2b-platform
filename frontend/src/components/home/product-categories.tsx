import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';
import { SectionHeader } from './section-header';

export async function ProductCategories() {
  const t = await getTranslations('home');

  const topTwoCards = [
    {
      id: 'cleanroom',
      title: 'Giải pháp - Sản phẩm Phòng sạch',
      description: 'Sản phẩm bảo vệ và kiểm soát bụi, ô nhiễm cho phòng sạch tại các nhà sản xuất: Điện tử, Thực phẩm, Dược phẩm, Y tế.',
      href: '/solutions/categories/cleanroom-consumables',
      image: ASSETS.home.productCutGloves,
      accentBorder: 'border-l-[#0D4397]',
      diamondColor: 'text-[#0D4397]',
      items: [
        { label: 'Găng tay Nitrile/Latex', href: '/solutions/categories/cleanroom-gloves' },
        { label: 'Trang phục phòng sạch', href: '/solutions/categories/cleanroom-apparel' },
        { label: 'Khăn lau / Cleanroom Wiper', href: '/solutions/categories/cleanroom-wipers' },
        { label: 'Khẩu trang Y tế', href: '/solutions/categories/cleanroom-masks' },
        { label: 'Sticky Mat/Thảm phòng sạch', href: '/solutions/categories/cleanroom-consumables' },
        { label: 'Thiết bị đo lường', href: '/solutions/categories/esd-supplies' },
      ]
    },
    {
      id: 'packaging',
      title: 'Giải pháp - Sản phẩm Bao bì',
      description: 'Sản phẩm sản xuất theo yêu cầu và đơn đặt hàng của khách hàng — phục vụ các nhà sản xuất trong ngành Điện tử, Thực phẩm, Dược phẩm và Y tế.',
      href: '/solutions/categories/industrial-packaging',
      image: ASSETS.home.solutionPackaging,
      accentBorder: 'border-l-amber-600',
      diamondColor: 'text-amber-600',
      items: [
        { label: 'Màng co PE/Shrink film', href: '/solutions/categories/industrial-packaging' },
        { label: 'Màng bọc thực phẩm', href: '/solutions/categories/industrial-packaging' },
        { label: 'Màng quấn PE Pallet', href: '/solutions/categories/industrial-packaging' },
        { label: 'Màng/Túi nhôm', href: '/solutions/categories/industrial-packaging' },
        { label: 'Túi PE/PP/Shield Bag', href: '/solutions/categories/industrial-packaging' },
        { label: 'Băng Keo', href: '/solutions/categories/industrial-packaging' },
      ]
    }
  ];

  const bottomThreeCards = [
    {
      id: 'cut-protection',
      title: 'Chống cắt - Chống cắt chuyên dụng',
      description: 'Được thiết kế chuyên dụng để bảo vệ đôi tay khỏi các vật liệu sắc cạnh trong môi trường công nghiệp như: tấm kim loại, kính nhôm, linh kiện cơ khí và các công việc bảo trì. Phù hợp cho thao tác trong sản xuất kho vận, lắp đặt và bảo trì công nghiệp',
      href: '/solutions/categories/cleanroom-gloves',
      image: ASSETS.home.productCutGloves,
      accentBorder: 'border-l-[#0D4397]',
      diamondColor: 'text-[#0D4397]'
    },
    {
      id: 'hvac-tape',
      title: 'Băng Keo Nhôm - Ứng dụng trong HVAC',
      description: 'Băng keo nhôm - Vật tư chuyên dụng dùng để dán kín mối nối, bề mặt bảo ôn và hệ thống gió HVAC. Với cấu trúc bề mặt nhôm, keo acrylic chất lượng cao, sản phẩm giúp tăng hiệu quả làm kín, chống thoát nhiệt và hỗ trợ giải pháp tổng thể tùy chỉnh theo yêu cầu kỹ thuật.',
      href: '/solutions/categories/esd-supplies',
      image: ASSETS.home.productHvacTape,
      accentBorder: 'border-l-[#0D4397]',
      diamondColor: 'text-[#0D4397]'
    },
    {
      id: 'custom-packaging',
      title: 'Bao bì - sản xuất theo yêu cầu',
      description: 'ULink Industries chuyên sản xuất các sản phẩm bao bì chất lượng cao bao gồm: màng co PE bảo vệ hàng hóa, màng quấn pallet giúp cố định và bảo vệ hàng trong vận chuyển, túi PE theo yêu cầu phù hợp với mọi nhu cầu đóng gói của khách hàng.',
      href: '/solutions/categories/industrial-packaging',
      image: ASSETS.home.productCustomPkg,
      accentBorder: 'border-l-amber-600',
      diamondColor: 'text-amber-600'
    }
  ];

  return (
    <section className="mx-auto w-full max-w-[1800px] px-4 py-8 lg:py-12">
      {/* SECTION HEADER BAR */}
      <SectionHeader
        title={t('categories.sectionTitle')}
        subtitle={t('categories.sectionSubTitle')}
        viewAllHref="/solutions"
        viewAllLabel={t('categories.viewAll')}
      />

      {/* TOP ROW: 2 BIG SOLUTION CARDS */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {topTwoCards.map((card) => (
          <div
            key={card.id}
            className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white border-l-4 sm:border-l-[5px] ${card.accentBorder} shadow-sm transition-all duration-300 hover:shadow-md`}
          >
            {/* Top Image Banner */}
            <div className="relative h-[220px] w-full overflow-hidden bg-slate-50 sm:h-[260px]">
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Card Content Body */}
            <div className="flex flex-1 flex-col p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-[18px] font-bold text-slate-900 sm:text-[20px]">
                <span className={card.diamondColor}>◇</span> {card.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {card.description}
              </p>

              {/* 2-Column List of Sub-Items */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {card.items.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="flex items-center gap-2 text-xs text-slate-700 hover:text-[#0D4397] transition-colors sm:text-sm font-medium"
                  >
                    <span className={`${card.diamondColor} text-[10px] shrink-0`}>🔹</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Bottom Right Action Link */}
              <div className="mt-8 flex justify-end pt-3 border-t border-slate-100">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D4397] transition-colors hover:underline sm:text-sm"
                >
                  <span>{t('categories.viewDetail')}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM ROW: 3 FEATURE CARDS */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        {bottomThreeCards.map((card) => (
          <div
            key={card.id}
            className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white border-l-4 sm:border-l-[5px] ${card.accentBorder} shadow-sm transition-all duration-300 hover:shadow-md`}
          >
            {/* Top Image Banner */}
            <div className="relative h-[180px] w-full overflow-hidden bg-slate-50 sm:h-[200px]">
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Card Content Body */}
            <div className="flex flex-1 flex-col p-6 sm:p-7 justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-slate-900 leading-snug sm:text-[18px]">
                  {card.title}
                </h3>
                <div className="my-3 border-b border-dashed border-slate-300" />
                <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
