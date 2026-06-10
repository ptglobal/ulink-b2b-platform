import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowRight,
  ArrowUpRight,
  Headset,
  ShieldCheck,
  Zap,
  Clock,
  Truck,
  MousePointerClick,
  Package,
  Users
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('home');

  const trust = [
    { img: ASSETS.home.trustGlobe, title: t('trust.globalTitle'), lines: [t('trust.globalDesc1'), t('trust.globalDesc2')] },
    { img: ASSETS.home.trustSample, title: t('trust.sampleTitle'), lines: [t('trust.sampleDesc1')] },
    { img: ASSETS.home.trustDelivery, title: t('trust.deliveryTitle'), lines: [t('trust.deliveryDesc1')] },
    { img: ASSETS.home.trustIso, title: t('trust.isoTitle'), lines: [t('trust.isoDesc1'), t('trust.isoDesc2')] }
  ];

  const products = [
    { img: ASSETS.home.productGlovesBox, title: t('products.gloves'), tags: t('products.glovesDesc') },
    { img: ASSETS.home.productWiper2, title: t('products.wipes'), tags: t('products.wipesDesc') },
    { img: ASSETS.home.productTapeRolls, title: t('products.tape'), tags: t('products.tapeDesc') },
    { img: ASSETS.home.productPackaging, title: t('products.packaging'), tags: t('products.packagingDesc') }
  ];

  const partners = [
    { name: 'SAMSUNG', color: '#4b58b0', size: 14, weight: 'font-medium' as const },
    { name: 'LG', color: '#8e8e8f', size: 17, weight: 'font-medium' as const },
    { name: 'Canon', color: '#f45354', size: 17, weight: 'font-semibold' as const, subtitle: 'All for dreams', subtitleColor: '#7b7b7b' },
    { name: 'Mider', color: '#5aab76', size: 17, weight: 'font-light' as const, subtitle: 'Walve hum tunonuglion', subtitleColor: '#8e8d8e' },
    { name: 'FUJIFILM', color: '#716d6d', size: 13, weight: 'font-medium' as const },
    { name: 'mkor', color: '#6875bc', size: 15, weight: 'font-normal' as const, subtitle: 'Technology', subtitleColor: '#687fc4' }
  ];

  const news = [
    { img: ASSETS.home.news1, date: t('news.item1Date'), title: t('news.item1Title') },
    { img: ASSETS.home.news2, date: t('news.item2Date'), title: t('news.item2Title') },
    { img: ASSETS.home.news3, date: t('news.item3Date'), title: t('news.item3Title') }
  ];

  const support = [
    { icon: Headset, title: t('support.consultingTitle'), desc: t('support.consultingDesc') },
    { icon: ShieldCheck, title: t('support.guaranteeTitle'), desc: t('support.guaranteeDesc') },
    { icon: Zap, title: t('support.emergencyTitle'), desc: t('support.emergencyDesc') },
    { icon: Clock, title: t('support.availabilityTitle'), desc: t('support.availabilityDesc') }
  ];


  const fadeLeft = {
    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 16%, #000 100%)',
    maskImage: 'linear-gradient(to right, transparent 0%, #000 16%, #000 100%)'
  };

  return (
    <div className="bg-white">
      {/* ── HERO (Figma 2071:1056) ───────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#fafbfd] via-[#eff2f8] to-[#e8edf5] lg:min-h-[400px]">
        {/* Ảnh găng tay tràn mép phải, fade mép trái để hoà vào nền (desktop) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] select-none lg:block">
          <Image
            src={ASSETS.home.hero}
            alt=""
            fill
            priority
            sizes="58vw"
            className="object-cover object-bottom"
            style={fadeLeft}
          />
        </div>

        <div className="relative z-10 flex items-center px-5 sm:px-8 lg:min-h-[400px] lg:px-12">
          <div className="max-w-[460px] py-14 lg:py-12">
            <p className="text-[12px] leading-normal text-[#818baa]">{t('hero.eyebrow')}</p>

            <h1 className="mt-4 font-semibold tracking-tight">
              <span className="block text-[28px] leading-[1.18] text-[#2b3a6d] md:text-[36px]">
                {t('hero.titleLine1')}
              </span>
              <span className="block text-[28px] leading-[1.18] text-[#334272] md:text-[36px]">
                {t('hero.titleLine2')}
              </span>
            </h1>

            <p className="mt-5 max-w-[388px] text-[13px] leading-[22.5px] text-[#808aa6]">
              {t('hero.description')}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/quick-order"
                className="inline-flex h-10 items-center gap-2 rounded-t-[3px] border border-[#1e2c61] bg-[#011853] px-5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                {t('hero.ctaOrder')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/solutions"
                className="inline-flex h-10 items-center gap-2 rounded-tl-[3px] border border-[#c6cddb] bg-[#fdfefe] px-5 text-[13px] text-[#6d779a] transition-colors hover:bg-muted"
              >
                {t('hero.ctaSolutions')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Ảnh găng tay cho mobile */}
        <div className="relative w-full lg:hidden">
          <div className="relative aspect-[814/356] w-full">
            <Image src={ASSETS.home.hero} alt="" fill className="object-cover object-bottom" />
          </div>
        </div>
      </section>

      {/* ── TRUST BAR (Figma 2071:1097) ──────────────────── */}
      <section className="relative z-10 -mt-11 px-5 pb-2 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 overflow-hidden rounded-tl-[10px] border-2 border-[#f1f2f5] bg-[#fdfefe] lg:grid-cols-4 lg:divide-x lg:divide-[#f1f2f5]">
          {trust.map(({ img, title, lines }) => (
            <div key={title} className="flex items-start gap-3 px-6 py-5">
              <Image src={img} alt="" width={36} height={36} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-[12px] text-[#5d6788]">{title}</p>
                {lines.map((line) => (
                  <p key={line} className="mt-0.5 text-[11px] leading-[1.5] text-[#939cb3]">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTIONS / PRODUCTS (Figma 2071:1009…1055) ──── */}
      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-6">
          {/* Cột tiêu đề — bám trái, ngang hàng với hàng thẻ (Figma 2071:1052–1055) */}
          <div className="lg:w-[20%] lg:shrink-0 lg:pt-2">
            <h2 className="text-2xl font-semibold tracking-tight text-[#606990]">
              {t('products.sectionTitle')}
            </h2>
            {/* Line nằm DƯỚI tiêu đề (Figma 2071:1051, y=105) */}
            <div className="mt-3 h-0.5 w-5 rounded bg-brand" />
            <p className="mt-4 max-w-md text-[13px] leading-relaxed text-[#8590ab]">
              {t('products.sectionDesc')}
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6975ab] transition-colors hover:text-brand-strong"
            >
              {t('products.viewAll')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* 4 thẻ sản phẩm — ảnh trên, dải nhãn dưới + mũi tên (Figma 2071:1043…1018) */}
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map(({ img, title, tags }) => (
              <Link
                key={title}
                href="/products"
                className="group flex flex-col overflow-hidden rounded border border-border bg-card transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[255/85] overflow-hidden bg-[#f7f8f8]">
                  <Image
                    src={img}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-2.5 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-medium text-[#697297]">{title}</h3>
                    <p className="mt-1 truncate text-[11px] text-[#9aa3ba]">{tags}</p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-[#9aa3ba] transition-colors group-hover:text-brand"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS · NEWS · SUPPORT (Figma 2071:991 / 964 / 948) ── */}
      <section className="grid grid-cols-1 gap-3 px-5 pb-12 sm:px-8 lg:grid-cols-12 lg:px-12">
        {/* Đối tác tiêu biểu — 1 hàng logo (Figma 2071:991) */}
        <div className="flex flex-col rounded border border-border bg-card px-6 py-5 lg:col-span-4">
          <h2 className="text-[15px] font-semibold text-[#636d94]">{t('partners.title')}</h2>
          <div className="flex flex-1 items-center gap-6 py-4">
            {partners.map((p) => (
              <div key={p.name} className="flex flex-col items-center text-center">
                <span
                  className={`${p.weight} leading-none`}
                  style={{ color: p.color, fontSize: `${p.size + 4}px` }}
                >
                  {p.name}
                </span>
                {'subtitle' in p && p.subtitle && (
                  <span className="mt-1 text-[7px] font-light leading-none text-center" style={{ color: p.subtitleColor }}>
                    {p.subtitle}
                  </span>
                )}
              </div>
            ))}
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6973a4] transition-colors hover:text-brand-strong"
          >
            {t('partners.viewAll')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Tin tức mới nhất — 3 cột (Figma 2071:964) */}
        <div className="rounded border border-border bg-card p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#646e92]">{t('news.title')}</h2>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7784bb] transition-colors hover:text-brand-strong"
            >
              {t('news.viewAll')}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-3">
            {news.map((n, i) => (
              <li
                key={n.title}
                className={i > 0 ? 'sm:border-l sm:border-[#eef0f4] sm:pl-5' : undefined}
              >
                <Link href="/resources" className="group flex h-full flex-col">
                  <div className="relative aspect-[146/38] w-full overflow-hidden rounded bg-muted">
                    <Image src={n.img} alt="" fill sizes="160px" className="object-cover" />
                  </div>
                  <p className="mt-3 text-[11px] text-[#a3aabd]">{n.date}</p>
                  <p className="mt-1.5 line-clamp-3 flex-1 text-[11px] font-medium leading-snug text-[#7c86a5] transition-colors group-hover:text-brand">
                    {n.title}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#7583b9]">
                    {t('news.readMore')}
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hỗ trợ nhanh (Figma 2071:948) */}
        <div className="rounded border border-border bg-card p-6 lg:col-span-3">
          <h2 className="text-[15px] font-semibold text-[#676f95]">{t('support.title')}</h2>
          <ul className="mt-5 space-y-4">
            {support.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <Icon
                  className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#1b2a63]"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs font-medium text-[#7780a0]">{title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-[#929bb2]">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── SERVICE BAR (Figma 2071:921) ────────────────── */}
      <section className="px-5 pb-12 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center gap-4 rounded border border-border bg-[#fafbfd] px-6 py-5 lg:flex-row lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {[
              { icon: Truck, title: t('serviceBar.slaTitle'), desc: t('serviceBar.slaDesc') },
              { icon: MousePointerClick, title: t('serviceBar.reorderTitle'), desc: t('serviceBar.reorderDesc') },
              { icon: Package, title: t('serviceBar.bufferTitle'), desc: t('serviceBar.bufferDesc') },
              { icon: Users, title: t('serviceBar.dedicatedTitle'), desc: t('serviceBar.dedicatedDesc') }
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-[34px] w-[34px] shrink-0 text-[#1b2a63]" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <p className="text-[12px] font-medium text-[#5d6788]">{title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-[#939cb3]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/about"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded bg-[#011853] px-5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          >
            {t('serviceBar.cta')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── NHÀ MÁY (ảnh + mô tả) ────────────────────────── */}
      <section className="px-5 pb-12 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 overflow-hidden rounded border border-border bg-card md:grid-cols-2">
          <div className="relative aspect-[16/9] w-full bg-muted md:aspect-auto md:min-h-[280px]">
            <Image
              src={ASSETS.home.factory}
              alt={t('partners.factoryTitle')}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-8 lg:p-12">
            <h2 className="text-xl font-semibold tracking-tight text-[#606990]">
              {t('partners.factoryTitle')}
            </h2>
            <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-[#8590ab]">
              {t('partners.factoryDesc')}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
