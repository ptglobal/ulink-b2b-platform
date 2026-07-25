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
  Check,
  Package,
  FileCheck,
  UserCheck,
  Settings,
  Download,
  Shield,
  Zap,
  CheckSquare,
  TrendingUp,
  PhoneCall,
  Mail
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

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — ĐỐI TÁC TIÊU BIỂU & CHỨNG NHẬN ISO
          ═══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-[1800px] px-4 py-12 lg:py-16">
        {/* ── SECTION HEADER BAR ── */}
        <div className="flex items-start gap-3">
          {/* 3 dots cyan accent indicator */}
          <div className="mt-1.5 flex flex-col gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span className="h-2 w-2 rounded-full bg-brand/60" />
            <span className="h-2 w-2 rounded-full bg-brand/30" />
          </div>
          <div>
            <h2 className="text-[24px] font-extrabold tracking-tight text-primary sm:text-[28px] lg:text-[32px]">
              {t('partners.sectionTitle')}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
              {t('partners.sectionSubTitle')}
            </p>
          </div>
        </div>

        {/* ── PARTNERS LOGO GRID (6 COLS x 2 ROWS) ── */}
        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6 lg:gap-12">
          {/* 1. Samsung */}
          <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
            <Image
              src={ASSETS.home.partnerSamsung}
              alt="Samsung"
              width={260}
              height={120}
              className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
            />
          </div>
          {/* 2. Canon */}
          <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
            <Image
              src={ASSETS.home.partnerCanon}
              alt="Canon"
              width={260}
              height={120}
              className="h-20 w-auto max-h-[90px] object-contain sm:h-24 lg:max-h-[105px]"
            />
          </div>
          {/* 3. Panasonic */}
          <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
            <Image
              src={ASSETS.home.partnerPanasonic}
              alt="Panasonic"
              width={260}
              height={120}
              className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
            />
          </div>
          {/* 4. IBM */}
          <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
            <Image
              src={ASSETS.home.partnerIbm}
              alt="IBM"
              width={240}
              height={120}
              className="h-20 w-auto max-h-[90px] object-contain sm:h-24 lg:max-h-[105px]"
            />
          </div>
          {/* 5. Traphaco */}
          <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
            <Image
              src={ASSETS.home.partnerTraphaco}
              alt="Traphaco"
              width={260}
              height={120}
              className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
            />
          </div>
          {/* 6. Coca-Cola */}
          <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
            <Image
              src={ASSETS.home.partnerCocaCola}
              alt="Coca-Cola"
              width={260}
              height={120}
              className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
            />
          </div>

          {/* 7. VinFast */}
          <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
            <Image
              src={ASSETS.home.partnerVinfast}
              alt="VinFast"
              width={260}
              height={120}
              className="h-22 w-auto max-h-[105px] object-contain sm:h-26 lg:max-h-[120px]"
            />
          </div>
          {/* 8. LG */}
          <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
            <Image
              src={ASSETS.home.partnerLg}
              alt="LG"
              width={240}
              height={120}
              className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
            />
          </div>
          {/* 9. Amkor */}
          <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
            <Image
              src={ASSETS.home.partnerAmkor}
              alt="Amkor Technology"
              width={260}
              height={120}
              className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
            />
          </div>
          {/* 10. Vinamilk */}
          <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
            <Image
              src={ASSETS.home.partnerVinamilk}
              alt="Vinamilk"
              width={260}
              height={120}
              className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
            />
          </div>
          {/* 11. 3M */}
          <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
            <Image
              src={ASSETS.home.partner3m}
              alt="3M"
              width={240}
              height={120}
              className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
            />
          </div>
          {/* 12. BYD */}
          <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
            <Image
              src={ASSETS.home.partnerByd}
              alt="BYD"
              width={240}
              height={120}
              className="h-16 w-auto max-h-[80px] object-contain sm:h-20 lg:max-h-[96px]"
            />
          </div>
        </div>

        {/* ── CERTIFICATIONS & ISO STANDARDS ROW (5 COLUMNS) ── */}
        <div className="mt-16  border-border pt-12">
          <div className="grid grid-cols-1 gap-8 items-center sm:grid-cols-2 lg:grid-cols-5">
            {/* Col 1: Title & Desc */}
            <div className="flex flex-col justify-center pr-4">
              <h3 className="text-[18px] font-bold text-primary sm:text-[20px]">
                {t('partners.isoTitle')}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
                {t('partners.isoDesc')}
              </p>
            </div>

            {/* Col 2: ISO 9001:2015 / QUACERT / JAS-ANZ */}
            <div className="flex h-36 items-center justify-center p-2 sm:h-40">
              <Image
                src={ASSETS.home.certIso9001}
                alt="ISO 9001:2015 QUACERT JAS-ANZ"
                width={320}
                height={140}
                className="h-28 w-auto max-h-[128px] object-contain sm:h-32"
              />
            </div>

            {/* Col 3: SGS */}
            <div className="flex h-36 items-center justify-center p-2 sm:h-40">
              <Image
                src={ASSETS.home.certSgs}
                alt="SGS Certification"
                width={300}
                height={140}
                className="h-26 w-auto max-h-[116px] object-contain sm:h-30"
              />
            </div>

            {/* Col 4: RoHS compliant */}
            <div className="flex h-36 items-center justify-center p-2 sm:h-40">
              <Image
                src={ASSETS.home.certRohs}
                alt="RoHS Compliant"
                width={320}
                height={140}
                className="h-28 w-auto max-h-[128px] object-contain sm:h-32"
              />
            </div>

            {/* Col 5: MSDS Material Safety Data Sheet */}
            <div className="flex h-36 items-center justify-center p-2 sm:h-40">
              <Image
                src={ASSETS.home.certMsds}
                alt="MSDS Material Safety Data Sheet"
                width={340}
                height={160}
                className="h-30 w-auto max-h-[136px] object-contain sm:h-34"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 7 — CASE STUDY (CÂU CHUYỆN TRIỂN KHAI THỰC TẾ)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-[1800px] px-4 py-12 lg:py-16">
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
                {t('caseStudy.sectionTitle')}
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
                {t('caseStudy.sectionSubTitle')}
              </p>
            </div>
          </div>
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            {t('caseStudy.viewAll')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* ── 3 CASE STUDY CARDS GRID ── */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {[1, 2, 3].map((num) => (
            <Link
              key={num}
              href={`/resources/case-study-${num}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              {/* Top Banner Image with ULINK Logo Watermark */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <Image
                  src={ASSETS.home.solutionPackaging}
                  alt="Case Study Production Line"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* ULINK Watermark Badge Top Right */}
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-black/40 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-brand" />
                  ULINK
                </div>
              </div>

              {/* Middle Text Area */}
              <div className="flex flex-1 flex-col p-6">
                <p className="text-[13px] font-bold text-[#4A6FA5] sm:text-[14px]">
                  {t(`caseStudy.card${num}Category` as any)}
                </p>
                <h3 className="mt-3 text-[14px] font-bold leading-relaxed text-slate-800 sm:text-[15px]">
                  {t(`caseStudy.card${num}Title` as any)}
                </h3>
              </div>

              {/* Card Footer Bar */}
              <div className="mt-auto flex items-center justify-between border-t border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Package className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-primary sm:text-[14px]">
                      {t(`caseStudy.card${num}Metric` as any)}
                    </p>
                    <p className="text-[11px] text-muted-foreground sm:text-[12px]">
                      {t(`caseStudy.card${num}Tag` as any)}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-brand transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 8 — QUY TRÌNH LÀM VIỆC (WORKING PROCESS — 4 BƯỚC)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-[1800px] px-4 py-12 lg:py-16">
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
                {t('workingProcess.sectionTitle')}
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
                {t('workingProcess.sectionSubTitle')}
              </p>
            </div>
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            {t('workingProcess.viewDetail')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* ── 4 STEP CARDS GRID ── */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: 1, icon: FileCheck },
            { step: 2, icon: UserCheck },
            { step: 3, icon: Settings },
            { step: 4, icon: Truck }
          ].map(({ step, icon: IconComponent }) => (
            <div
              key={step}
              className="flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              {/* Tầng 1: Icon & Dashed Line Connector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center text-brand">
                  <IconComponent className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true" />
                </div>
                {/* Dashed connector line */}
                <div className="ml-4 h-0 w-full border-b border-dashed border-slate-300" />
              </div>

              {/* Tầng 2: Nội dung chính */}
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-[14px] font-bold text-muted-foreground sm:text-[15px]">
                  {t(`workingProcess.step${step}Number` as any)}
                </p>
                <h3 className="mt-1 text-[18px] font-extrabold text-primary sm:text-[20px] lg:text-[22px]">
                  {t(`workingProcess.step${step}Title` as any)}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-600 sm:text-[15px]">
                  {t(`workingProcess.step${step}Desc` as any)}
                </p>
              </div>

              {/* Tầng 3: Footer KPI */}
              <div className="mt-6 mt-auto flex items-center justify-between border-t border-border pt-4">
                <span className="text-[13px] font-semibold text-muted-foreground sm:text-[14px]">
                  {t(`workingProcess.step${step}KpiLabel` as any)}
                </span>
                <span className="text-[16px] font-extrabold text-brand sm:text-[18px]">
                  {t(`workingProcess.step${step}KpiValue` as any)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 9 — TÀI NGUYÊN & TIN TỨC MỚI NHẤT
          ═══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-[1800px] px-4 py-12 lg:py-16">
        {/* ── 1. MASTER SECTION HEADER BAR ── */}
        <div className="flex items-start gap-3">
          {/* 3 dots cyan accent indicator */}
          <div className="mt-1.5 flex flex-col gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span className="h-2 w-2 rounded-full bg-brand/60" />
            <span className="h-2 w-2 rounded-full bg-brand/30" />
          </div>
          <div>
            <h2 className="text-[24px] font-extrabold tracking-tight text-primary sm:text-[28px] lg:text-[32px]">
              {t('resourcesSection.sectionTitle')}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
              {t('resourcesSection.sectionSubTitle')}
            </p>
          </div>
        </div>

        {/* ── 2. SUB-SECTION HEADER BAR (TIN TỨC MỚI NHẤT) ── */}
        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-5 w-1 rounded bg-brand" />
            <h3 className="text-[18px] font-bold text-primary sm:text-[20px] lg:text-[22px]">
              {t('resourcesSection.newsSectionTitle')}
            </h3>
          </div>
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand transition-colors hover:text-brand-strong sm:text-[15px]"
          >
            {t('resourcesSection.viewAllNews')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* ── 3. 3 NEWS CARDS GRID ── */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {[1, 2, 3].map((num) => (
            <Link
              key={num}
              href={`/resources/news-${num}`}
              className="group flex flex-col transition-all"
            >
              {/* Top Article Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={ASSETS.about.qualityLab}
                  alt="News Article Production Lab"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Publish Date */}
              <p className="mt-4 text-[13px] font-bold text-brand sm:text-[14px]">
                {t(`resourcesSection.card${num}Date` as any)}
              </p>

              {/* News Article Title */}
              <h4 className="mt-2 text-[14px] font-bold leading-relaxed text-[#4A6FA5] transition-colors group-hover:text-brand sm:text-[15px] lg:text-[16px]">
                {t(`resourcesSection.card${num}Title` as any)}
              </h4>

              {/* Card Footer "Read More" */}
              <div className="mt-6 mt-auto flex items-center justify-between border-t border-slate-200/80 pt-4">
                <span className="text-[14px] font-semibold text-brand transition-colors group-hover:text-brand-strong sm:text-[15px]">
                  {t('resourcesSection.readMore')}
                </span>
                <ArrowRight className="h-5 w-5 text-brand transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>

        {/* ── 4. SUB-SECTION HEADER BAR (TÀI LIỆU & CATALOGUE) ── */}
        <div className="mt-12 flex items-center gap-3 border-t border-border pt-8 sm:mt-16">
          <div className="h-5 w-1 rounded bg-brand" />
          <h3 className="text-[18px] font-bold text-primary sm:text-[20px] lg:text-[22px]">
            {t('resourcesSection.docsTitle')}
          </h3>
        </div>

        {/* ── 4 DOCUMENT CARDS GRID ── */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { num: 1, icon: Download },
            { num: 2, icon: FileText },
            { num: 3, icon: Settings },
            { num: 4, icon: FileCheck }
          ].map(({ num, icon: IconComp }) => (
            <Link
              key={num}
              href={`/resources/docs-${num}`}
              className="group flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              {/* Tầng 1: Icon & Top Right ArrowUpRight */}
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center text-brand">
                  <IconComp className="h-8 w-8" aria-hidden="true" />
                </div>
                <ArrowUpRight className="h-6 w-6 text-brand transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </div>

              {/* Tầng 2: Nội dung chính */}
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-[13px] font-medium text-slate-500 sm:text-[14px]">
                  {t(`resourcesSection.doc${num}Category` as any)}
                </p>
                <h4 className="mt-2 text-[15px] font-bold text-slate-800 transition-colors group-hover:text-brand sm:text-[16px]">
                  {t(`resourcesSection.doc${num}Title` as any)}
                </h4>
              </div>

              {/* Tầng 3: Footer Metadata */}
              <div className="mt-6 mt-auto border-t border-border pt-4">
                <p className="text-[12px] font-medium text-slate-500 sm:text-[13px]">
                  {t(`resourcesSection.doc${num}Meta` as any)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── 5. SUB-SECTION HEADER BAR (TƯ VẤN & HỖ TRỢ) ── */}
        <div className="mt-12 flex items-center gap-3 border-t border-border pt-8 sm:mt-16">
          <div className="h-5 w-1 rounded bg-brand" />
          <h3 className="text-[18px] font-bold text-primary sm:text-[20px] lg:text-[22px]">
            {t('resourcesSection.supportTitle')}
          </h3>
        </div>

        {/* ── 4 SUPPORT CARDS GRID ── */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { num: 1, icon: CheckSquare },
            { num: 2, icon: Shield },
            { num: 3, icon: TrendingUp },
            { num: 4, icon: Zap }
          ].map(({ num, icon: IconComp }) => (
            <div
              key={num}
              className="flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-start text-brand">
                <IconComp className="h-9 w-9" aria-hidden="true" />
              </div>
              <h4 className="mt-6 text-[16px] font-bold text-slate-800 sm:text-[18px]">
                {t(`resourcesSection.supp${num}Title` as any)}
              </h4>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600 sm:text-[14px]">
                {t(`resourcesSection.supp${num}Desc` as any)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 10 — CTA BANNER (BÁO GIÁ NHANH TRONG 24H & LIÊN HỆ TRỰC TIẾP)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#3B82F6] text-white">
        <div className="mx-auto w-full max-w-[1800px] px-6 py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* ── CỘT BÊN TRÁI: BÁO GIÁ NHANH 24H (7/12 COLS) ── */}
            <div className="flex flex-col justify-center lg:col-span-7">
              <p className="text-[14px] font-medium text-white/80 sm:text-[15px]">
                {tCta('eyebrow')}
              </p>
              <h2 className="mt-4 text-[32px] font-extrabold tracking-tight text-white sm:text-[44px] lg:text-[52px] leading-tight">
                {tCta('title')}
              </h2>
              <p className="mt-6 text-[14px] leading-relaxed text-white/90 sm:text-[16px] max-w-[720px]">
                {tCta('description')}
              </p>

              {/* Action Buttons Row */}
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link
                  href="/rfq"
                  className="inline-flex items-center gap-3 rounded-lg bg-white px-8 py-3.5 text-[15px] font-bold text-brand shadow-lg transition-transform hover:scale-102 hover:bg-slate-50"
                >
                  {tCta('ctaRfq')}
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex items-center gap-3 text-[15px] font-bold text-white transition-opacity hover:opacity-80"
                >
                  {tCta('ctaCatalogue')}
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* ── CỘT BÊN PHẢI: LIÊN HỆ TRỰC TIẾP (5/12 COLS WITH VERTICAL BORDER) ── */}
            <div className="flex flex-col justify-center lg:col-span-5 lg:border-l lg:border-white/30 lg:pl-16">
              <h3 className="text-[18px] font-bold text-white sm:text-[20px]">
                {tCta('directContactTitle')}
              </h3>

              {/* 3 Contact Info Items */}
              <div className="mt-8 flex flex-col gap-6">
                {/* Item 1: Phone */}
                <div className="flex items-start gap-4 border-b border-white/20 pb-5">
                  <PhoneCall className="h-6 w-6 shrink-0 text-white mt-1" aria-hidden="true" />
                  <div>
                    <p className="text-[18px] font-extrabold text-white sm:text-[20px]">
                      {tCta('phone')}
                    </p>
                    <p className="mt-1 text-[13px] text-white/75 sm:text-[14px]">
                      {tCta('phoneHours')}
                    </p>
                  </div>
                </div>

                {/* Item 2: Email */}
                <div className="flex items-start gap-4 border-b border-white/20 pb-5">
                  <Mail className="h-6 w-6 shrink-0 text-white mt-1" aria-hidden="true" />
                  <div>
                    <p className="text-[18px] font-extrabold text-white sm:text-[20px]">
                      {tCta('email')}
                    </p>
                    <p className="mt-1 text-[13px] text-white/75 sm:text-[14px]">
                      {tCta('emailSla')}
                    </p>
                  </div>
                </div>

                {/* Item 3: IZ Connection */}
                <div className="flex items-start gap-4">
                  <Send className="h-6 w-6 shrink-0 text-white mt-1" aria-hidden="true" />
                  <div>
                    <p className="text-[18px] font-extrabold text-white sm:text-[20px]">
                      {tCta('izConnect')}
                    </p>
                    <p className="mt-1 text-[13px] text-white/75 sm:text-[14px]">
                      {tCta('izList')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


