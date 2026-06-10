import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowRight,
  Headset,
  ShieldCheck,
  Zap,
  Clock,
  Globe,
  PackageCheck,
  Timer,
  BadgeCheck,
  Cpu,
  Heart,
  Car,
  UtensilsCrossed,
  Microscope,
  GraduationCap,
  Hand,
  Droplets,
  Disc,
  Box,
  CalendarCheck,
  RotateCcw,
  Archive,
  Combine,
  AlertCircle
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('home');

  const trust = [
    { icon: Globe, title: t('trust.globalTitle'), lines: [t('trust.globalDesc1'), t('trust.globalDesc2')] },
    { icon: PackageCheck, title: t('trust.sampleTitle'), lines: [t('trust.sampleDesc1')] },
    { icon: Timer, title: t('trust.deliveryTitle'), lines: [t('trust.deliveryDesc1')] },
    { icon: BadgeCheck, title: t('trust.isoTitle'), lines: [t('trust.isoDesc1'), t('trust.isoDesc2')] }
  ];

  const products = [
    { img: ASSETS.home.productGlovesBox, icon: Hand, title: t('products.gloves'), tags: t('products.glovesDesc') },
    { img: ASSETS.home.productWiper2, icon: Droplets, title: t('products.wipes'), tags: t('products.wipesDesc') },
    { img: ASSETS.home.productTapeRolls, icon: Disc, title: t('products.tape'), tags: t('products.tapeDesc') },
    { img: ASSETS.home.productPackaging, icon: Box, title: t('products.packaging'), tags: t('products.packagingDesc') }
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
    <div className="w-full bg-white">
      {/* ── HERO (Figma 2071:1056) ───────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-background via-muted to-muted md:min-h-[320px] lg:min-h-[380px]">
        {/* Ảnh găng tay tràn mép phải, fade mép trái để hoà vào nền (desktop) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] select-none md:block">
          <Image
            src={ASSETS.home.hero}
            alt=""
            fill
            priority
            sizes="58vw"
            className="object-cover object-center"
            style={fadeLeft}
          />
          {/* Dot grid pattern (Figma 2071:1059–1083) */}
          <div className="absolute left-[7%] top-[25%] grid grid-cols-5 gap-[8px]" aria-hidden="true">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-white/40" />
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center px-4 sm:px-8 md:min-h-[320px] lg:min-h-[380px] lg:px-16">
          <div className="max-w-[460px] py-8 sm:py-10">
            <p className="text-xs leading-normal text-silver">{t('hero.eyebrow')}</p>

            <h1 className="mt-3 font-semibold tracking-tight sm:mt-4">
              <span className="block text-2xl leading-[1.18] text-primary sm:text-3xl md:text-4xl">
                {t('hero.titleLine1')}
              </span>
              <span className="block text-2xl leading-[1.18] text-primary sm:text-3xl md:text-4xl">
                {t('hero.titleLine2')}
              </span>
            </h1>

            <p className="mt-2 max-w-[388px] text-sm leading-relaxed text-muted-foreground sm:mt-3">
              {t('hero.description')}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
              <Link
                href="/quick-order"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-strong hover:border-brand-strong sm:h-10 sm:px-5"
              >
                {t('hero.ctaOrder')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/solutions"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm text-muted-foreground transition-colors hover:border-brand hover:text-brand sm:h-10 sm:px-5"
              >
                {t('hero.ctaSolutions')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Ảnh găng tay cho mobile */}
        <div className="relative w-full md:hidden">
          <div className="relative aspect-[16/7] w-full">
            <Image src={ASSETS.home.hero} alt="" fill className="object-cover object-center" />
          </div>
        </div>
      </section>

      {/* ── TRUST BAR (Figma 2071:1097) ──────────────────── */}
      <section className="relative z-10 -mt-6 mx-auto w-full max-w-[1440px] px-4 pb-2 sm:-mt-11 sm:px-8 lg:px-16">
        <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card lg:grid-cols-4 lg:divide-x lg:divide-border">
          {trust.map(({ icon: Icon, title, lines }) => (
            <div key={title} className="flex h-full flex-col items-center gap-1.5 px-3 py-3 text-center sm:flex-row sm:items-start sm:gap-3 sm:px-5 sm:py-5 sm:text-left lg:px-6">
              <Icon className="h-6 w-6 shrink-0 text-primary sm:mt-0.5 sm:h-9 sm:w-9" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="text-[11px] font-medium text-foreground sm:text-xs">{title}</p>
                {lines.map((line) => (
                  <p key={line} className="mt-0.5 text-[10px] leading-[1.4] text-muted-foreground sm:text-[11px] sm:leading-[1.5]">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTIONS / PRODUCTS (Figma 2071:1009…1055) ──── */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8 lg:px-16">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
          {/* Cột tiêu đề — bám trái, ngang hàng với hàng thẻ (Figma 2071:1052–1055) */}
          <div className="lg:w-[20%] lg:shrink-0 lg:pt-2">
            <h2 className="text-xl font-semibold tracking-tight text-primary sm:text-2xl">
              {t('products.sectionTitle')}
            </h2>
            {/* Line nằm DƯỚI tiêu đề (Figma 2071:1051, y=105) */}
            <div className="mt-3 h-0.5 w-5 bg-brand" />
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:mt-4">
              {t('products.sectionDesc')}
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-strong sm:mt-6"
            >
              {t('products.viewAll')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* 4 thẻ sản phẩm — ảnh trên, dải nhãn dưới + mũi tên (Figma 2071:1043…1018) */}
          <div className="grid flex-1 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {products.map(({ img, icon, title, tags }) => (
              <Link
                key={title}
                href="/products"
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[255/85] overflow-hidden bg-muted">
                  <Image
                    src={img}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-2.5 transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Icon đè lên ảnh – góc trái dưới */}
                  {(() => { const Icon = icon; return (
                    <Icon
                      className="absolute bottom-2 left-3 z-10 h-5 w-5 text-primary/70 sm:h-7 sm:w-7"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  ); })()}
                </div>
                <div className="flex items-center gap-2 border-t border-border px-3 py-2.5 sm:gap-2.5 sm:px-4 sm:py-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-medium text-foreground sm:text-sm">{title}</h3>
                    <p className="mt-0.5 truncate text-[10px] text-silver sm:mt-1 sm:text-[11px]">{tags}</p>
                  </div>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-silver transition-colors group-hover:text-brand sm:h-4 sm:w-4"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS · NEWS · SUPPORT (Figma 2071:991 / 964 / 948) ── */}
      <section className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-3 px-4 pb-6 sm:px-8 sm:pb-8 lg:grid-cols-12 lg:px-16">
        {/* Đối tác tiêu biểu — 1 hàng logo (Figma 2071:991) */}
        <div className="flex flex-col rounded-lg border border-border bg-card px-4 py-4 sm:px-6 lg:col-span-4">
          <h2 className="text-sm font-semibold text-primary sm:text-base">{t('partners.title')}</h2>
          <div className="grid flex-1 grid-cols-3 items-center gap-3 py-4">
            {partners.map((p) => (
              <div key={p.name} className="flex flex-col items-center text-center">
                <span
                  className={`${p.weight} leading-none`}
                  style={{ color: p.color, fontSize: `${Math.min(p.size + 4, 18)}px` }}
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
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-brand transition-colors hover:text-brand-strong"
          >
            {t('partners.viewAll')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Tin tức mới nhất — 3 cột (Figma 2071:964) */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary sm:text-base">{t('news.title')}</h2>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand transition-colors hover:text-brand-strong"
            >
              {t('news.viewAll')}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-2.5 h-0.5 w-5 bg-brand" />
          <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
            {news.map((n, i) => (
              <li
                key={n.title}
                className={i > 0 ? 'sm:border-l sm:border-border sm:pl-5' : undefined}
              >
                <Link href="/resources" className="group flex h-full flex-col">
                  <div className="relative aspect-[146/38] w-full overflow-hidden bg-muted">
                    <Image src={n.img} alt="" fill sizes="160px" className="object-cover" />
                  </div>
                  <p className="mt-3 text-[11px] text-silver">{n.date}</p>
                  <p className="mt-1.5 line-clamp-3 flex-1 text-[11px] font-medium leading-snug text-muted-foreground transition-colors group-hover:text-brand">
                    {n.title}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-brand">
                    {t('news.readMore')}
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hỗ trợ nhanh (Figma 2071:948) */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 lg:col-span-3">
          <h2 className="text-sm font-semibold text-primary sm:text-base">{t('support.title')}</h2>
          <div className="mt-2.5 h-0.5 w-5 bg-brand" />
          <ul className="mt-3 space-y-3">
            {support.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <Icon
                  className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs font-medium text-foreground">{title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>


      {/* ── ABOUT + INDUSTRIES (1 block liền, ngăn bằng gạch) ── */}
      <section className="mx-auto w-full max-w-[1440px] px-4 pb-6 sm:px-8 sm:pb-8 lg:px-16">
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card lg:flex-row">
          {/* About ULink Industries */}
          <div className="flex flex-1 flex-col sm:flex-row lg:w-1/2">
            {/* Text */}
            <div className="flex flex-1 flex-col justify-center p-4 sm:p-6">
              <h2 className="text-base font-semibold tracking-tight text-primary sm:text-lg">
                {t('about.title')}
              </h2>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:text-sm">
                {t('about.desc')}
              </p>
              <Link
                href="/about"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand transition-colors hover:text-brand-strong sm:mt-4 sm:text-sm"
              >
                {t('about.cta')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            {/* Ảnh nhà máy */}
            <div className="relative hidden w-[40%] shrink-0 sm:block">
              <Image
                src={ASSETS.home.factory}
                alt={t('about.title')}
                fill
                sizes="(max-width: 1024px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="mx-0 border-t border-border lg:my-0 lg:border-l lg:border-t-0" />

          {/* Giải pháp cho các ngành nghề */}
          <div className="flex flex-1 flex-col p-4 sm:p-6 lg:w-1/2">
            <h2 className="text-base font-semibold tracking-tight text-primary sm:text-lg">
              {t('industries.title')}
            </h2>
            <div className="mt-3 grid flex-1 grid-cols-3 gap-x-3 gap-y-3 sm:mt-4 sm:grid-cols-6 sm:gap-x-4">
              {[
                { icon: Cpu, title: t('industries.semiconductor'), desc: t('industries.semiconductorDesc') },
                { icon: Heart, title: t('industries.medical'), desc: t('industries.medicalDesc') },
                { icon: Car, title: t('industries.automotive'), desc: t('industries.automotiveDesc') },
                { icon: UtensilsCrossed, title: t('industries.food'), desc: t('industries.foodDesc') },
                { icon: Microscope, title: t('industries.precision'), desc: t('industries.precisionDesc') },
                { icon: GraduationCap, title: t('industries.research'), desc: t('industries.researchDesc') }
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center text-center">
                  <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" strokeWidth={1.5} aria-hidden="true" />
                  <p className="mt-1 text-[10px] font-medium leading-tight text-foreground sm:mt-1.5 sm:text-[11px]">{title}</p>
                  <p className="mt-0.5 hidden text-[10px] leading-snug text-muted-foreground sm:block">{desc}</p>
                </div>
              ))}
            </div>
            <Link
              href="/solutions"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand transition-colors hover:text-brand-strong sm:mt-4 sm:text-sm"
            >
              {t('industries.viewAll')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DỊCH VỤ KHÁC BIỆT (Differentiators) ──────────── */}
      <section className="mx-auto w-full max-w-[1440px] px-4 pb-6 sm:px-8 sm:pb-8 lg:px-16">
        <div className="rounded-lg border border-border bg-card px-4 py-5 sm:px-6 sm:py-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary sm:text-sm">
            {t('differentiators.title')}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:mt-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {[
              { icon: CalendarCheck, title: t('differentiators.scheduled'), desc: t('differentiators.scheduledDesc') },
              { icon: RotateCcw, title: t('differentiators.reorder'), desc: t('differentiators.reorderDesc') },
              { icon: Archive, title: t('differentiators.buffer'), desc: t('differentiators.bufferDesc') },
              { icon: Combine, title: t('differentiators.consolidation'), desc: t('differentiators.consolidationDesc') },
              { icon: AlertCircle, title: t('differentiators.emergency'), desc: t('differentiators.emergencyDesc') }
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <Icon className="h-6 w-6 text-primary sm:h-7 sm:w-7" strokeWidth={1.5} aria-hidden="true" />
                <p className="mt-2 text-[11px] font-semibold text-primary sm:mt-3 sm:text-xs">{title}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:mt-1 sm:text-[11px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
