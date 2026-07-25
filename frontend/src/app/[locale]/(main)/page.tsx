import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Users,
  Route,
  Globe,
  Truck,
  ShieldCheck,
  TrendingDown,
  FileText,
  MapPin,
  Cpu,
  Utensils,
  Ship,
  Pill,
  Sofa,
  Wrench,
  Receipt,
  Send,
  Building2,
  Factory,
  Check
} from 'lucide-react';
import { HeadsetMic } from '@/components/icons/headset-mic';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';
import { VietnamMap, type ClusterMarker } from '@/components/vietnam-map';
import { fetchRegionalHubs, parseCoordinates, getHubName, getIndustrialZoneName } from '@/lib/regional-hub-data';

/** ISR — revalidate every hour; on-demand revalidation via content webhooks */
export const revalidate = 3600;

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  const [t, tHubs, tWhy, tCta] = await Promise.all([
    getTranslations('home'),
    getTranslations('regionalHubs'),
    getTranslations('whyChoose'),
    getTranslations('ctaBanner')
  ]);

  // ── Fetch regional hubs from Directus API ──
  const hubs = await fetchRegionalHubs();

  // Parse coordinates for map markers
  const mapClusters: ClusterMarker[] = hubs
    .map((hub) => {
      const coords = parseCoordinates(hub.coordinates);
      if (!coords) return null;
      return { id: String(hub.id), lat: coords.lat, lon: coords.lon };
    })
    .filter((c): c is ClusterMarker => c !== null);

  const fadeLeft = {
    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 16%, #000 100%)',
    maskImage: 'linear-gradient(to right, transparent 0%, #000 16%, #000 100%)'
  };

  return (
    <div className="w-full bg-white">

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — HERO BANNER WITH EXACT IMAGE ASPECT RATIO (1440x579)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-slate-50 aspect-[1440/579] min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[579px]">
        {/* Full-width background image */}
        <div className="absolute inset-0 w-full h-full select-none">
          <Image
            src={ASSETS.home.hero}
            alt="ULINK Industrial Consumable Materials"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-10 flex h-full w-full items-center justify-start py-4 pl-4 sm:pl-4 lg:pl-4">
          {/* Outer Translucent Glass Wrapper */}
          <div className="relative flex h-full aspect-square items-center justify-center rounded-3xl border border-white/40 bg-white/35 p-3 shadow-2xl backdrop-blur-md sm:p-5 lg:p-6">
            {/* Inner White Glass Card */}
            <div className="flex h-full w-full flex-col justify-center rounded-2xl border border-white/75 bg-white/85 p-6 shadow-lg backdrop-blur-lg sm:p-8 md:p-10 lg:p-12">
              <div>
                <p className="text-[14px] font-bold uppercase tracking-wider text-muted-foreground/90 sm:text-[16px]">
                  {t('hero.eyebrowTop')}
                </p>

                <p className="mt-2 text-[15px] font-bold uppercase tracking-wider text-brand sm:text-[17px]">
                  {t('hero.eyebrowSub')}
                </p>

                <h1 className="mt-4 text-[34px] font-extrabold leading-[1.1] tracking-tight text-primary sm:text-[44px] md:text-[52px] lg:text-[58px]">
                  {t('hero.title')}
                </h1>

                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-[18px] lg:text-[20px]">
                  {t('hero.description')}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  href="/quick-order"
                  className="inline-flex h-13 items-center gap-3 rounded-lg bg-brand px-8 text-[16px] font-semibold text-brand-foreground shadow-md transition-all hover:bg-brand-strong sm:h-14 sm:px-10 sm:text-[18px]"
                >
                  {t('hero.ctaRfq')}
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex h-13 items-center gap-3 text-[16px] font-semibold text-brand transition-colors hover:text-brand-strong hover:bg-brand/5 px-5 sm:h-14 sm:text-[18px]"
                >
                  {t('hero.ctaCatalogue')}
                  <Image
                    src={ASSETS.home.iconSend}
                    alt="Catalogue"
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain sm:h-7 sm:w-7"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 Feature Value Proposition Cards Bar ── */}
      <section className="mx-auto mt-8 w-full max-w-[1800px] px-4 py-6 sm:mt-10">
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-y-0">
          {/* Card 1 */}
          <div className="flex items-center gap-4 p-5 sm:gap-5 sm:p-6 lg:border-r lg:border-border lg:p-7">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
              <Image
                src={ASSETS.home.iconNation}
                alt="Nationwide"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <p className="text-[16px] font-bold leading-snug text-primary sm:text-[18px]">
                {t('features.nationwideTitle')}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
                {t('features.nationwideDesc')}
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-center gap-4 p-5 sm:gap-5 sm:p-6 lg:border-r lg:border-border lg:p-7">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
              <Image
                src={ASSETS.home.iconAdapter}
                alt="Flexible"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <p className="text-[16px] font-bold leading-snug text-primary sm:text-[18px]">
                {t('features.flexibleTitle')}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
                {t('features.flexibleDesc')}
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-center gap-4 p-5 sm:gap-5 sm:p-6 lg:border-r lg:border-border lg:p-7">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
              <Image
                src={ASSETS.home.iconFile}
                alt="Cost Optimization"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <p className="text-[16px] font-bold leading-snug text-primary sm:text-[18px]">
                {t('features.costTitle')}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
                {t('features.costDesc')}
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex items-center gap-4 p-5 sm:gap-5 sm:p-6 lg:p-7">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
              <Image
                src={ASSETS.home.iconSecurity}
                alt="Quality Assurance"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <p className="text-[16px] font-bold leading-snug text-primary sm:text-[18px]">
                {t('features.qualityTitle')}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
                {t('features.qualityDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — DANH MỤC SẢN PHẨM (PRODUCT CATEGORIES) — 3 ROWS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-[1800px] px-4 py-8 lg:py-12">
        {/* ── HÀNG 1: SECTION HEADER BAR ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            {/* 3 dots cyan accent indicator */}
            <div className="mt-1.5 flex flex-col gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" />
              <span className="h-2 w-2 rounded-full bg-brand/60" />
              <span className="h-2 w-2 rounded-full bg-brand/30" />
            </div>
            <div>
              <h2 className="text-[24px] font-extrabold tracking-tight text-primary sm:text-[28px] lg:text-[32px]">
                {t('categories.sectionTitle')}
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
                {t('categories.sectionSubTitle')}
              </p>
            </div>
          </div>
          <Link
            href="/solutions"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            {t('categories.viewAll')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
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
          <div className="group flex flex-col overflow-hidden rounded-2xl border border-border border-l-4 border-l-brand  shadow-sm transition-all hover:shadow-md">
            <div className="relative h-[200px] w-full overflow-hidden bg-slate-50">
              <Image
                src={ASSETS.home.productCutGloves}
                alt="Chống cắt"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="border-b border-dashed border-border" />
            <div className="flex flex-1 flex-col p-6">
              <h4 className="text-[16px] font-bold text-primary sm:text-[18px]">
                {t('categories.cutResistantTitle')}
              </h4>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
                {t('categories.cutResistantDesc')}
              </p>
            </div>
          </div>

          {/* Sub-Card 2: Băng keo nhôm HVAC */}
          <div className="group flex flex-col overflow-hidden rounded-2xl border border-border border-l-4 border-l-brand  shadow-sm transition-all hover:shadow-md">
            <div className="relative h-[200px] w-full overflow-hidden bg-slate-50">
              <Image
                src={ASSETS.home.productHvacTape}
                alt="Băng Keo Nhôm HVAC"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="border-b border-dashed border-border" />
            <div className="flex flex-1 flex-col p-6">
              <h4 className="text-[16px] font-bold text-primary sm:text-[18px]">
                {t('categories.hvacTapeTitle')}
              </h4>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
                {t('categories.hvacTapeDesc')}
              </p>
            </div>
          </div>

          {/* Sub-Card 3: Bao bì sản xuất theo yêu cầu */}
          <div className="group flex flex-col overflow-hidden rounded-2xl border border-border border-l-4 border-l-amber-600  shadow-sm transition-all hover:shadow-md">
            <div className="relative h-[200px] w-full overflow-hidden bg-slate-50">
              <Image
                src={ASSETS.home.productCustomPkg}
                alt="Bao bì theo yêu cầu"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="border-b border-dashed border-border" />
            <div className="flex flex-1 flex-col p-6">
              <h4 className="text-[16px] font-bold text-primary sm:text-[18px]">
                {t('categories.customPkgTitle')}
              </h4>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
                {t('categories.customPkgDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — GIẢI PHÁP THEO NGÀNH (INDUSTRY SOLUTIONS)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-[1800px] px-4 py-8 lg:py-12">
        {/* ── SECTION HEADER BAR ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            {/* 3 dots cyan accent indicator */}
            <div className="mt-1.5 flex flex-col gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" />
              <span className="h-2 w-2 rounded-full bg-brand/60" />
              <span className="h-2 w-2 rounded-full bg-brand/30" />
            </div>
            <div>
              <h2 className="text-[24px] font-extrabold tracking-tight text-primary sm:text-[28px] lg:text-[32px]">
                {t('industries.sectionTitle')}
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
                {t('industries.sectionSubTitle')}
              </p>
            </div>
          </div>
          <Link
            href="/industries"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            {t('industries.viewDetail')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* ── LƯỚI 6 THẺ NGÀNH NGHỀ (GRID 6 CARDS: 3 COLUMNS x 2 ROWS) ── */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: t('industries.card1Title'),
              desc: t('industries.card1Desc'),
              iconSrc: ASSETS.home.indElectronics,
              href: '/industries/electronics',
            },
            {
              title: t('industries.card2Title'),
              desc: t('industries.card2Desc'),
              iconSrc: ASSETS.home.indFood,
              href: '/industries/food-beverage',
            },
            {
              title: t('industries.card3Title'),
              desc: t('industries.card3Desc'),
              iconSrc: ASSETS.home.indLogistics,
              href: '/industries/logistics',
            },
            {
              title: t('industries.card4Title'),
              desc: t('industries.card4Desc'),
              iconSrc: ASSETS.home.indPharma,
              href: '/industries/pharma-medical',
            },
            {
              title: t('industries.card5Title'),
              desc: t('industries.card5Desc'),
              iconSrc: ASSETS.home.indFurniture,
              href: '/industries/furniture-wood',
            },
            {
              title: t('industries.card6Title'),
              desc: t('industries.card6Desc'),
              iconSrc: ASSETS.home.indConstruction,
              href: '/industries/construction-hvac',
            },
          ].map((card, idx) => (
            <Link
              key={idx}
              href={card.href}
              className="group flex flex-col justify-between rounded-xl border border-border p-6 shadow-sm transition-all hover:border-brand/50 hover:shadow-md sm:p-7"
            >
              <div>
                <h3 className="text-[18px] font-bold text-primary transition-colors group-hover:text-brand sm:text-[20px]">
                  {card.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
                  {card.desc}
                </p>
              </div>

              {/* Bottom Row: Left 60x60 PNG Icon & Right Up-Arrow */}
              <div className="mt-8 flex items-end justify-between pt-2">
                <div className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center">
                  <Image
                    src={card.iconSrc}
                    alt="Industry Icon"
                    width={60}
                    height={60}
                    className="h-[60px] w-[60px] object-contain transition-transform group-hover:scale-105"
                  />
                </div>
                <ArrowUpRight className="h-7 w-7 text-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — VỀ CHÚNG TÔI (ABOUT US)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-[1800px] px-4 py-8 lg:py-12">
        {/* ── SECTION HEADER BAR ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            {/* 3 dots cyan accent indicator */}
            <div className="mt-1.5 flex flex-col gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" />
              <span className="h-2 w-2 rounded-full bg-brand/60" />
              <span className="h-2 w-2 rounded-full bg-brand/30" />
            </div>
            <div>
              <h2 className="text-[24px] font-extrabold tracking-tight text-primary sm:text-[28px] lg:text-[32px]">
                {t('about.sectionTitle')}
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
                {t('about.sectionSubTitle')}
              </p>
            </div>
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            {t('about.viewDetail')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* ── 2 COLUMNS CONTENT GRID ── */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          {/* Left Column: Factory Building Photo & Caption */}
          <div className="flex flex-col lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-50 shadow-sm sm:aspect-[16/11]">
              <Image
                src={ASSETS.home.companyFactory}
                alt="ULINK Industries Ha Nam Factory Hub"
                fill
                className="object-cover transition-transform duration-500 hover:scale-102"
              />
            </div>
            {/* Photo Caption Bar */}
            <div className="mt-3 flex items-center justify-between text-[12px] text-muted-foreground sm:text-[13px]">
              <span>{t('about.captionHub')}</span>
              <span>{t('about.captionStatus')}</span>
            </div>
          </div>

          {/* Right Column: Text Content & 4 Key Metric Items */}
          <div className="flex flex-col lg:col-span-6">
            <h3 className="text-[20px] font-bold leading-tight text-primary sm:text-[22px] lg:text-[24px]">
              {t('about.mainTitle')}
            </h3>

            <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
              {t('about.mainDesc')}
            </p>

            <div className="my-6 border-b border-border" />

            {/* Bullet Points */}
            <ul className="space-y-2.5 text-[14px] text-foreground sm:text-[15px]">
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{t('about.bullet1')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{t('about.bullet2')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{t('about.bullet3')}</span>
              </li>
            </ul>

            {/* 4 Metric Items Grid with Dividers & 32x32 Icons */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-border">
              {/* Metric 1 */}
              <div className="flex flex-col items-center p-3 text-center sm:px-2 sm:py-3">
                <Image
                  src={ASSETS.home.iconSlack}
                  alt="Experience"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <span className="mt-3 text-[13px] font-medium text-foreground sm:text-[14px]">
                  {t('about.metric1')}
                </span>
              </div>

              {/* Metric 2 */}
              <div className="flex flex-col items-center p-3 text-center sm:px-2 sm:py-3">
                <Image
                  src={ASSETS.home.iconShield}
                  alt="Quality"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <span className="mt-3 text-[13px] font-medium text-foreground sm:text-[14px]">
                  {t('about.metric2')}
                </span>
              </div>

              {/* Metric 3 */}
              <div className="flex flex-col items-center p-3 text-center sm:px-2 sm:py-3">
                <Image
                  src={ASSETS.home.iconTag}
                  alt="SKU Count"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <span className="mt-3 text-[13px] font-medium text-foreground sm:text-[14px]">
                  {t('about.metric3')}
                </span>
              </div>

              {/* Metric 4 */}
              <div className="flex flex-col items-center p-3 text-center sm:px-2 sm:py-3">
                <Image
                  src={ASSETS.home.iconTruck}
                  alt="Fast Delivery"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <span className="mt-3 text-[13px] font-medium text-foreground sm:text-[14px]">
                  {t('about.metric4')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — SẢN PHẨM PHÙ HỢP VỚI (TARGET CUSTOMER SEGMENTS)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full py-8 lg:py-12">
        {/* ── SECTION HEADER BAR ── */}
        <div className="mx-auto w-full max-w-[1800px] px-4">
          <div className="flex items-start gap-3">
            {/* 3 dots cyan accent indicator */}
            <div className="mt-1.5 flex flex-col gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" />
              <span className="h-2 w-2 rounded-full bg-brand/60" />
              <span className="h-2 w-2 rounded-full bg-brand/30" />
            </div>
            <div>
              <h2 className="text-[24px] font-extrabold tracking-tight text-primary sm:text-[28px] lg:text-[32px]">
                {t('targetSegments.sectionTitle')}
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
                {t('targetSegments.sectionSubTitle')}
              </p>
            </div>
          </div>
        </div>

        {/* ── 2 CARDS GRID FULL-WIDTH (FDI vs SME) ── */}
        <div className="mt-8 grid w-full grid-cols-1 lg:grid-cols-2">
          {/* CARD 1: DOANH NGHIỆP FDI (Dark Blue Theme) */}
          <div className="flex flex-col justify-between bg-[#4A6FA5] text-white shadow-sm">
            {/* ROW 1: TEXT CONTENT (With Left Padding Inset) */}
            <div className="p-6 sm:p-10 lg:pb-6 lg:pt-12 lg:pl-32 lg:pr-16 xl:pl-48">
              {/* Header: Circle Icon & Title */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#4A6FA5] sm:h-14 sm:w-14">
                  <Building2 className="h-7 w-7 text-[#4A6FA5]" aria-hidden="true" />
                </div>
                <h3 className="text-[20px] font-bold text-white sm:text-[22px] lg:text-[24px]">
                  {t('targetSegments.fdiTitle')}
                </h3>
              </div>

              {/* Checklist */}
              <ul className="mt-8 space-y-4 text-[14px] text-white/95 sm:text-[15px] lg:text-[16px]">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
                  <span>{t('targetSegments.fdiCheck1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
                  <span>{t('targetSegments.fdiCheck2')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
                  <span>{t('targetSegments.fdiCheck3')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
                  <span>{t('targetSegments.fdiCheck4')}</span>
                </li>
              </ul>
            </div>

            {/* ROW 2: BUTTON ROW (Full Width Centered, Unaffected by Text Padding) */}
            <div className="flex w-full items-center justify-center px-6 pb-8 pt-4 sm:pb-10">
              <Link
                href="/solutions/fdi"
                className="inline-flex items-center gap-2 rounded bg-white px-8 py-3 text-[14px] font-bold text-[#4A6FA5] shadow transition-transform hover:scale-102 hover:bg-white/95 sm:text-[15px]"
              >
                {t('targetSegments.viewDetail')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* CARD 2: DOANH NGHIỆP SME (Light Blue Pastel Theme) */}
          <div className="flex flex-col justify-between bg-[#D8E6FC] text-slate-800 shadow-sm">
            {/* ROW 1: TEXT CONTENT (With Left Padding Inset) */}
            <div className="p-6 sm:p-10 lg:pb-6 lg:pt-12 lg:pl-32 lg:pr-16 xl:pl-48">
              {/* Header: Icon & Title */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center text-brand sm:h-14 sm:w-14">
                  <Factory className="h-8 w-8 text-brand" aria-hidden="true" />
                </div>
                <h3 className="text-[20px] font-bold text-slate-900 sm:text-[22px] lg:text-[24px]">
                  {t('targetSegments.smeTitle')}
                </h3>
              </div>

              {/* Checklist */}
              <ul className="mt-8 space-y-4 text-[14px] text-slate-800 sm:text-[15px] lg:text-[16px]">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  <span>{t('targetSegments.smeCheck1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  <span>{t('targetSegments.smeCheck2')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  <span>{t('targetSegments.smeCheck3')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  <span>{t('targetSegments.smeCheck4')}</span>
                </li>
              </ul>
            </div>

            {/* ROW 2: BUTTON ROW (Full Width Centered, Unaffected by Text Padding) */}
            <div className="flex w-full items-center justify-center px-6 pb-8 pt-4 sm:pb-10">
              <Link
                href="/solutions/sme"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-3 text-[14px] font-bold text-white shadow transition-transform hover:scale-102 hover:bg-brand-strong sm:text-[15px]"
              >
                {t('targetSegments.viewDetail')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


