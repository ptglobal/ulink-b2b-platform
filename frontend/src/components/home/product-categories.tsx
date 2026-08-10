import Image from 'next/image';
import { ArrowRight, ShieldCheck, Layers, Package, Zap, Sparkles, Shirt, FlaskConical, Hand } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';
import { SectionHeader } from './section-header';

export async function ProductCategories() {
  const t = await getTranslations('home');

  const allCategories = [
    { name: 'Vật tư phòng sạch', slug: 'cleanroom-consumables', href: '/solutions/categories/cleanroom-consumables', icon: ShieldCheck, count: '120+ Sản phẩm' },
    { name: 'Găng tay phòng sạch', slug: 'cleanroom-gloves', href: '/solutions/categories/cleanroom-gloves', icon: Hand, count: '45+ Loại' },
    { name: 'Khăn lau phòng sạch', slug: 'cleanroom-wipers', href: '/solutions/categories/cleanroom-wipers', icon: Layers, count: '30+ Quy cách' },
    { name: 'Quần áo phòng sạch', slug: 'cleanroom-apparel', href: '/solutions/categories/cleanroom-apparel', icon: Shirt, count: '25+ Mẫu' },
    { name: 'Khẩu trang phòng sạch', slug: 'cleanroom-masks', href: '/solutions/categories/cleanroom-masks', icon: Sparkles, count: '15+ Loại' },
    { name: 'Bao bì công nghiệp', slug: 'industrial-packaging', href: '/solutions/categories/industrial-packaging', icon: Package, count: '80+ Mã' },
    { name: 'Vật tư ESD', slug: 'esd-supplies', href: '/solutions/categories/esd-supplies', icon: Zap, count: '60+ Thiết bị' },
    { name: 'Hóa chất phòng sạch', slug: 'cleanroom-chemicals', href: '/solutions/categories/cleanroom-chemicals', icon: FlaskConical, count: '20+ Dòng' }
  ];

  return (
    <section className="mx-auto w-full max-w-[1800px] px-4 py-8 lg:py-12">
      {/* ── HÀNG 1: SECTION HEADER BAR ── */}
      <SectionHeader
        title={t('categories.sectionTitle')}
        subtitle={t('categories.sectionSubTitle')}
        viewAllHref="/solutions"
        viewAllLabel={t('categories.viewAll')}
      />

      {/* ── HÀNG 1.5: LƯỚI 8 DANH MỤC SẢN PHẨM TRỰC QUAN ── */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {allCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            className="group flex flex-col items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-brand hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand transition-colors group-hover:bg-brand group-hover:text-white shrink-0 mt-1">
              <cat.icon className="h-5 w-5" />
            </div>
            <div className="my-2">
              <span className="text-xs font-bold text-slate-800 transition-colors group-hover:text-brand line-clamp-2 leading-tight">
                {cat.name}
              </span>
              <span className="mt-1 block text-[10px] font-semibold text-slate-400">
                {cat.count}
              </span>
            </div>
            <span className="text-[10px] font-bold text-brand group-hover:underline inline-flex items-center gap-0.5">
              Xem ngay <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </Link>
        ))}
      </div>

      {/* ── HÀNG 2: 2 THẺ GIẢI PHÁP LỚN (GRID 2 COLUMNS) ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Phòng sạch */}
        <div className="group flex flex-col overflow-hidden rounded-2xl border border-border border-l-4 border-l-brand sm:border-l-[6px]  shadow-sm transition-all hover:shadow-md">
          <div className="relative h-[240px] w-full overflow-hidden bg-slate-50 sm:h-[280px]">
            <Image
              src={ASSETS.home.solutionCleanroom}
              alt="Phòng sạch"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col p-6 sm:p-8">
            <h3 className="flex items-center gap-2 text-[18px] font-bold text-primary sm:text-[20px]">
              <span className="text-brand">◇</span> {t('categories.cleanroomTitle')}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
              {t('categories.cleanroomDesc')}
            </p>

            {/* 6 Sub-features grid */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                t('categories.cleanroomItem1'),
                t('categories.cleanroomItem2'),
                t('categories.cleanroomItem3'),
                t('categories.cleanroomItem4'),
                t('categories.cleanroomItem5'),
                t('categories.cleanroomItem6'),
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[13px] text-foreground sm:text-[14px]">
                  <span className="text-brand text-[10px]">🔹</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end pt-2">
              <Link
                href="/solutions/cleanroom"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand transition-colors hover:text-brand-strong sm:text-[14px]"
              >
                {t('categories.viewDetail')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Bao bì */}
        <div className="group flex flex-col overflow-hidden rounded-2xl border border-border border-l-4 border-l-amber-600 sm:border-l-[6px]  shadow-sm transition-all hover:shadow-md">
          <div className="relative h-[240px] w-full overflow-hidden bg-slate-50 sm:h-[280px]">
            <Image
              src={ASSETS.home.solutionPackaging}
              alt="Bao bì"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col p-6 sm:p-8">
            <h3 className="flex items-center gap-2 text-[18px] font-bold text-primary sm:text-[20px]">
              <span className="text-amber-600">◇</span> {t('categories.packagingTitle')}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
              {t('categories.packagingDesc')}
            </p>

            {/* 6 Sub-features grid */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                t('categories.packagingItem1'),
                t('categories.packagingItem2'),
                t('categories.packagingItem3'),
                t('categories.packagingItem4'),
                t('categories.packagingItem5'),
                t('categories.packagingItem6'),
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[13px] text-foreground sm:text-[14px]">
                  <span className="text-brand text-[10px]">🔹</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end pt-2">
              <Link
                href="/solutions/packaging"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand transition-colors hover:text-brand-strong sm:text-[14px]"
              >
                {t('categories.viewDetail')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── HÀNG 3: 3 THẺ NỔI BẬT BÊN DƯỚI (GRID 3 COLUMNS) ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Sub-Card 1: Chống cắt */}
        <Link
          href="/solutions/cleanroom"
          className="group flex flex-col overflow-hidden rounded-2xl border border-border border-l-4 border-l-brand shadow-sm transition-all hover:shadow-md hover:border-brand"
        >
          <div className="relative h-[200px] w-full overflow-hidden bg-slate-50">
            <Image
              src={ASSETS.home.productCutGloves}
              alt="Chống cắt"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="border-b border-dashed border-border" />
          <div className="flex flex-1 flex-col p-6">
            <h4 className="text-[16px] font-bold text-primary transition-colors group-hover:text-brand sm:text-[18px]">
              {t('categories.cutResistantTitle')}
            </h4>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
              {t('categories.cutResistantDesc')}
            </p>
          </div>
        </Link>

        {/* Sub-Card 2: Băng keo nhôm HVAC */}
        <Link
          href="/solutions/cleanroom"
          className="group flex flex-col overflow-hidden rounded-2xl border border-border border-l-4 border-l-brand shadow-sm transition-all hover:shadow-md hover:border-brand"
        >
          <div className="relative h-[200px] w-full overflow-hidden bg-slate-50">
            <Image
              src={ASSETS.home.productHvacTape}
              alt="Băng Keo Nhôm HVAC"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="border-b border-dashed border-border" />
          <div className="flex flex-1 flex-col p-6">
            <h4 className="text-[16px] font-bold text-primary transition-colors group-hover:text-brand sm:text-[18px]">
              {t('categories.hvacTapeTitle')}
            </h4>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
              {t('categories.hvacTapeDesc')}
            </p>
          </div>
        </Link>

        {/* Sub-Card 3: Bao bì sản xuất theo yêu cầu */}
        <Link
          href="/solutions/packaging"
          className="group flex flex-col overflow-hidden rounded-2xl border border-border border-l-4 border-l-amber-600 shadow-sm transition-all hover:shadow-md hover:border-amber-600"
        >
          <div className="relative h-[200px] w-full overflow-hidden bg-slate-50">
            <Image
              src={ASSETS.home.productCustomPkg}
              alt="Bao bì theo yêu cầu"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="border-b border-dashed border-border" />
          <div className="flex flex-1 flex-col p-6">
            <h4 className="text-[16px] font-bold text-primary transition-colors group-hover:text-amber-600 sm:text-[18px]">
              {t('categories.customPkgTitle')}
            </h4>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
              {t('categories.customPkgDesc')}
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
