import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowRight,
  Clock,
  Users,
  Package,
  Truck,
  CheckCircle,
  Warehouse,
  Route,
  Globe,
  ShieldCheck,
  TrendingDown,
  FileText,
  Layers,
  Eye,
  Settings,
  Ruler,
  Thermometer,
  Paperclip,
  Sparkles,
  Download,
  ShieldAlert,
  Activity,
  Bookmark,
  Factory,
  Award
} from 'lucide-react';
import { HeadsetMic } from '@/components/icons/headset-mic';
import { VietnamMap, type ClusterMarker } from '@/components/vietnam-map';
import { fetchRegionalHubs, parseCoordinates, getHubName, getIndustrialZoneName } from '@/lib/regional-hub-data';
import HubClusterList from '@/components/regional-hubs/hub-cluster-list';
import SolutionCarousel from '@/components/regional-hubs/solution-carousel';
import TestimonialCarousel from '@/components/regional-hubs/testimonial-carousel';
import WorkingProcess from '@/components/regional-hubs/working-process';
import { ResourcesNews, CtaBanner } from '@/components/home';
import { Link } from '@/i18n/navigation';
import { fetchProducts } from '@/lib/product-data';
import ProductCard from '@/components/product/product-card';

export default async function RegionalHubsPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('regionalHubs');

  const hubs = await fetchRegionalHubs();
  
  // Fetch up to 12 products from Directus
  const { products: dbProducts } = await fetchProducts({ limit: 12 });
  
  // Randomly select 3 products to display in the Featured Products section
  const randomProducts = [...dbProducts]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  // Parse coordinates for map markers
  const mapClusters: ClusterMarker[] = hubs
    .map((hub) => {
      const coords = parseCoordinates(hub.coordinates);
      if (!coords) return null;
      return { id: String(hub.id), lat: coords.lat, lon: coords.lon };
    })
    .filter((c): c is ClusterMarker => c !== null);
  const carouselSlides = [
    {
      eyebrow: t('carousel.slide1.eyebrow'),
      title: t('carousel.slide1.title'),
      feat1: t('carousel.slide1.feat1'),
      feat2: t('carousel.slide1.feat2'),
      image: '/images/home/section2/solution-packaging.webp',
      alt: 'Pallet Wrap'
    },
    {
      eyebrow: t('carousel.slide2.eyebrow'),
      title: t('carousel.slide2.title'),
      feat1: t('carousel.slide2.feat1'),
      feat2: t('carousel.slide2.feat2'),
      image: '/images/home/section2/product-cut-gloves.webp',
      alt: 'Industrial Gloves'
    },
    {
      eyebrow: t('carousel.slide3.eyebrow'),
      title: t('carousel.slide3.title'),
      feat1: t('carousel.slide3.feat1'),
      feat2: t('carousel.slide3.feat2'),
      image: '/images/home/section2/product-hvac-tape.webp',
      alt: 'Aluminum Foil Tape'
    },
    {
      eyebrow: t('carousel.slide4.eyebrow'),
      title: t('carousel.slide4.title'),
      feat1: t('carousel.slide4.feat1'),
      feat2: t('carousel.slide4.feat2'),
      image: '/images/home/section2/solution-cleanroom.webp',
      alt: 'Cleanroom Wiper'
    },
    {
      eyebrow: t('carousel.slide5.eyebrow'),
      title: t('carousel.slide5.title'),
      feat1: t('carousel.slide5.feat1'),
      feat2: t('carousel.slide5.feat2'),
      image: '/images/home/section2/product-custom-pkg.webp',
      alt: 'PE Shrink Film'
    }
  ];

  const carouselLabels = {
    rfqButton: t('carousel.rfqButton'),
    learnMore: t('carousel.learnMore')
  };

  const testimonialLabels = {
    eyebrow: t('testimonials.eyebrow'),
    title: t('testimonials.title'),
    subtitle: t('testimonials.subtitle'),
    company1: t('testimonials.company1'),
    quote1: t('testimonials.quote1'),
    name1: t('testimonials.name1'),
    role1: t('testimonials.role1'),
    company2: t('testimonials.company2'),
    quote2: t('testimonials.quote2'),
    name2: t('testimonials.name2'),
    role2: t('testimonials.role2')
  };

  return (
    <>
      <section
        className="relative w-full bg-[#1E72EC] text-[#F5F5F5]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 sm:py-14 lg:px-16 lg:py-16">
          {/* Eyebrow */}
          <div className="mb-5 flex items-center gap-1.5">
            <span className="text-[13px] text-blue-300/60">{t('eyebrow')}</span>
            <ArrowRight className="h-3 w-3 text-blue-300/40" />
          </div>

          {/* Main layout: left info + center-right visualization */}
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[340px_1fr] xl:grid-cols-[360px_1fr]">

            {/* === LEFT COLUMN: Title + Description + Stats === */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Title */}
                <h1 className="text-[30px] font-bold leading-[1.3] text-white sm:text-[34px] lg:text-[38px]">
                  {t('title')}
                </h1>

                {/* Description */}
                <p className="mt-5 max-w-[500px] text-[13px] leading-[1.8] text-blue-100/75">
                  {t('description')}
                </p>
              </div>

              {/* Stats Cards Stack */}
              <div className="mt-8 flex flex-col gap-4 w-full max-w-[340px]">
                {/* Stat 1: Distance */}
                <div className="w-full bg-white rounded-md border-l-[4px] border-[#1769E2] p-5 shadow-sm">
                  <StatRow
                    icon={<Route className="h-[22px] w-[22px] text-[#1769E2]" />}
                    label={t('stats.distanceLabel')}
                    value={t('stats.distanceValue')}
                    unit={t('stats.distanceUnit')}
                    note={t('stats.distanceNote')}
                  />
                </div>

                {/* Stat 2: Time */}
                <div className="w-full bg-white rounded-md border-l-[4px] border-[#1769E2] p-5 shadow-sm">
                  <StatRow
                    icon={<Clock className="h-[22px] w-[22px] text-[#1769E2]" />}
                    label={t('stats.timeLabel')}
                    value={t('stats.timeValue')}
                    unit={t('stats.timeUnit')}
                    note={t('stats.timeNote')}
                  />
                </div>

                {/* Stat 3: Partners */}
                <div className="w-full bg-white rounded-md border-l-[4px] border-[#1769E2] p-5 shadow-sm">
                  <StatRow
                    icon={<Users className="h-[22px] w-[22px] text-[#1769E2]" />}
                    label={t('stats.partnersLabel')}
                    value={t('stats.partnersValue')}
                    note={t('stats.partnersNote')}
                  />
                </div>
              </div>
            </div>

            {/* === CENTER-RIGHT COLUMN: Map & Hub List Side-by-Side (Seamless connections) === */}
            <div className="relative flex items-center justify-between gap-0">
              {/* Map container - left side of this section with cyber-tech borders */}
              <div className="relative hidden h-[640px] w-[420px] shrink-0 lg:block border border-blue-400/20  rounded-sm">
                {/* L-shaped corner notches */}
                <div className="absolute -top-[2px] -left-[2px] h-4 w-4 border-t-2 border-l-2 border-blue-400" />
                <div className="absolute -top-[2px] -right-[2px] h-4 w-4 border-t-2 border-r-2 border-blue-400" />
                <div className="absolute -bottom-[2px] -left-[2px] h-4 w-4 border-b-2 border-l-2 border-blue-400" />
                <div className="absolute -bottom-[2px] -right-[2px] h-4 w-4 border-b-2 border-r-2 border-blue-400" />

                {/* Tech dots inside the corners */}
                <div className="absolute top-1.5 left-1.5 h-1.5 w-1.5 rounded-full bg-white" />
                <div className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white" />

                {/* Center horizontal segments */}
                <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 h-[2px] w-12 bg-blue-400/70" />
                <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 h-[2px] w-12 bg-blue-400/70" />

                <VietnamMap className="h-full w-full" clusters={mapClusters} />
              </div>

              {/* Hub List & Status Header - right side of this section */}
              <div className="flex flex-1 flex-col justify-start max-w-[340px] pl-6 z-10">
                {/* Network Status Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-blue-300/40 font-mono tracking-wider font-semibold">NETWORK STATUS</span>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Network Online
                  </div>
                </div>

                {/* Cluster List — client component for RFQ modal interaction */}
                <HubClusterList
                  hubs={hubs.map((hub) => ({
                    id: hub.id,
                    name: hub.name,
                    slug: hub.slug,
                    localizedName: getHubName(hub, locale),
                    zonesStr: hub.industrial_zones && hub.industrial_zones.length > 0
                      ? hub.industrial_zones.map((z) => getIndustrialZoneName(z, locale)).join(', ')
                      : ''
                  }))}
                  labels={{
                    title: t('hubRfq.title'),
                    hubLabel: t('hubRfq.hubLabel'),
                    contactName: t('hubRfq.contactName'),
                    company: t('hubRfq.company'),
                    phone: t('hubRfq.phone'),
                    email: t('hubRfq.email'),
                    note: t('hubRfq.note'),
                    notePlaceholder: t('hubRfq.notePlaceholder'),
                    submit: t('hubRfq.submit'),
                    submitting: t('hubRfq.submitting'),
                    success: t('hubRfq.success'),
                    error: t('hubRfq.error'),
                    required: t('hubRfq.required'),
                    invalidEmail: t('hubRfq.invalidEmail'),
                    invalidPhone: t('hubRfq.invalidPhone')
                  }}
                />

                {/* Technical Live Data Footer */}
                <div className="mt-2 text-right">
                  <p className="text-[9px] font-mono tracking-widest text-blue-300/30 uppercase">
                    ULINK INDUSTRIAL NETWORK // LIVE DATA • 04 HUBS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === SECTION 2: Real-time Live Data Bar === */}
      <section className="w-full bg-[#F8FAFC] py-8 border-b border-slate-200/60">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="inline-block rounded-md border border-dashed border-[#1769E2]/30 bg-[#1769E2]/5 px-4 py-2">
              <span className="text-[12px] font-bold text-[#1769E2] uppercase tracking-wider">
                {t('dashboard.headerTitle')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {t('dashboard.headerTime')}
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 rounded-xl border border-slate-200/60 bg-white shadow-sm divide-y md:divide-y-0 lg:divide-x divide-slate-100">
            {/* Metric 1: Orders */}
            <div className="p-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1769E2]/8">
                <FileText className="h-[22px] w-[22px] text-[#1769E2]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('dashboard.ordersLabel')}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[20px] font-bold text-slate-900">{t('dashboard.ordersValue')}</span>
                  <span className="text-[13px] font-semibold text-slate-500">{t('dashboard.ordersUnit')}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                  <span>▲</span>
                  <span>{t('dashboard.ordersChange')}</span>
                  <span className="text-slate-400 font-normal ml-0.5">{t('dashboard.ordersNote')}</span>
                </div>
              </div>
            </div>

            {/* Metric 2: Delivery */}
            <div className="p-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1769E2]/8">
                <CheckCircle className="h-[22px] w-[22px] text-[#1769E2]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('dashboard.deliveryLabel')}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[20px] font-bold text-slate-900">{t('dashboard.deliveryValue')}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                  <span>▲</span>
                  <span>{t('dashboard.deliveryChange')}</span>
                  <span className="text-slate-400 font-normal ml-0.5">{t('dashboard.deliveryNote')}</span>
                </div>
              </div>
            </div>

            {/* Metric 3: Vehicles */}
            <div className="p-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1769E2]/8">
                <Truck className="h-[22px] w-[22px] text-[#1769E2]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('dashboard.vehiclesLabel')}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[20px] font-bold text-slate-900">{t('dashboard.vehiclesValue')}</span>
                  <span className="text-[13px] font-semibold text-slate-500">{t('dashboard.vehiclesUnit')}</span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400 font-medium">{t('dashboard.vehiclesNote')}</p>
              </div>
            </div>

            {/* Metric 4: Warehouse */}
            <div className="p-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1769E2]/8">
                <Warehouse className="h-[22px] w-[22px] text-[#1769E2]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('dashboard.warehouseLabel')}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-[20px] font-bold text-slate-900">{t('dashboard.warehouseValue')}</span>
                  <span className="text-[13px] font-semibold text-slate-500">{t('dashboard.warehouseUnit')}</span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400 font-medium">{t('dashboard.warehouseNote')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === SECTION 3: Featured Products === */}
      <section className="w-full bg-white py-14">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1.5 mt-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1769E2]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#1769E2]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#1769E2]" />
              </div>
              <div>
                <h2 className="text-[22px] font-bold text-slate-900 leading-tight">
                  {t('featuredProducts.title')}
                </h2>
                <p className="mt-2 text-[12px] text-slate-500 max-w-[600px]">
                  {t('featuredProducts.subtitle')}
                </p>
              </div>
            </div>
            <Link
              href="/solutions"
              className="group text-[13px] font-semibold text-[#1769E2] flex items-center gap-1 transition-colors hover:text-[#1257bd] shrink-0"
            >
              {t('featuredProducts.viewAll')}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {randomProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} locale={locale} />
            ))}
            {randomProducts.length === 0 && (
              <p className="text-sm text-slate-400 text-center col-span-3 py-12">
                {locale === 'vi' ? 'Không có sản phẩm nổi bật nào.' : 'No featured products available.'}
              </p>
            )}
          </div>
        </div>
      </section>

    

      {/* === SECTION 4: Interactive Solution Carousel === */}
      <SolutionCarousel slides={carouselSlides} labels={carouselLabels} />

      {/* === SECTION 5: Core Capabilities === */}
      <section className="w-full bg-white py-16 sm:py-20 border-t border-slate-100">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left: Main info */}
            <div className="lg:col-span-4 max-w-md">
              <h2 className="text-[22px] sm:text-[24px] font-bold text-slate-900 leading-tight">
                {t('capabilities.title')}
              </h2>
              <p className="mt-4 text-[13px] text-slate-500 leading-relaxed">
                {t('capabilities.desc')}
              </p>
            </div>

            {/* Right: Three Cards */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

                {/* Card 1: Manufacturing */}
                <div className="flex flex-col items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1769E2]/8 mb-4">
                    <Factory className="h-6 w-6 text-[#1769E2]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-2">
                    {t('capabilities.manufacturing.title')}
                  </h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
                    {t('capabilities.manufacturing.desc')}
                  </p>
                  <Link
                    href="/solutions"
                    className="group text-[12px] font-semibold text-[#1769E2] inline-flex items-center gap-1 hover:text-[#1257bd] transition-colors mt-auto"
                  >
                    {t('capabilities.learnMore')}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {/* Card 2: Supply Chain */}
                <div className="flex flex-col items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1769E2]/8 mb-4">
                    <Clock className="h-6 w-6 text-[#1769E2]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-2">
                    {t('capabilities.supplyChain.title')}
                  </h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
                    {t('capabilities.supplyChain.desc')}
                  </p>
                  <Link
                    href="/about"
                    className="group text-[12px] font-semibold text-[#1769E2] inline-flex items-center gap-1 hover:text-[#1257bd] transition-colors mt-auto"
                  >
                    {t('capabilities.learnMore')}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {/* Card 3: Quality Control */}
                <div className="flex flex-col items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1769E2]/8 mb-4">
                    <Award className="h-6 w-6 text-[#1769E2]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-2">
                    {t('capabilities.quality.title')}
                  </h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
                    {t('capabilities.quality.desc')}
                  </p>
                  <Link
                    href="/about/quality"
                    className="group text-[12px] font-semibold text-[#1769E2] inline-flex items-center gap-1 hover:text-[#1257bd] transition-colors mt-auto"
                  >
                    {t('capabilities.learnMore')}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

   

      {/* === SECTION 3.5: Ha Nam Distribution Center Overview === */}
      <section className="w-full bg-white py-16 sm:py-20 border-t border-slate-100">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 text-center">

          {/* Eyebrow */}
          <span className="text-[13px] font-bold text-[#1769E2] tracking-wider uppercase block">
            {t('hanamIntro.eyebrow')}
          </span>

          {/* Title */}
          <h2 className="mt-3 text-[24px] sm:text-[28px] font-extrabold text-slate-900 leading-tight">
            {t('hanamIntro.title')}
          </h2>

          {/* Description */}
          <p className="mt-4 max-w-[800px] mx-auto text-[13px] sm:text-[14px] text-slate-500 leading-relaxed">
            {t('hanamIntro.desc')}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/contact"
              className="bg-[#1769E2] text-white text-[13px] font-semibold py-3 px-6 rounded-md flex items-center gap-2 hover:bg-[#1257bd] transition-colors"
            >
              {t('hanamIntro.contactSales')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="border border-[#1769E2] text-[#1769E2] text-[13px] font-semibold py-3 px-6 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              {t('hanamIntro.learnMore')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Large Image Showcase */}
          <div className="mt-12 max-w-[900px] mx-auto aspect-[16/9] rounded-xl overflow-hidden shadow-md border border-slate-100 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/about/hero-warehouse.webp"
              alt="Ha Nam Distribution Center - ULink Industries"
              className="h-full w-full object-cover"
            />
          </div>

        </div>
      </section>
      

      {/* === SECTION 7: Customer Testimonials === */}
      <TestimonialCarousel labels={testimonialLabels} />

      {/* === SECTION 8: Working Process === */}
      <WorkingProcess />

      {/* === SECTION 9: Resources & News === */}
      <ResourcesNews />

      {/* === SECTION 10: Call to Action Banner === */}
      <CtaBanner containerClassName="max-w-[1440px] px-4 sm:px-8 lg:px-16" />
    </>
  );
}

/* ─── Sub-components ─── */

function StatRow({
  icon,
  label,
  value,
  unit,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  note: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1769E2]/8">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-500">{label}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[26px] font-bold leading-none text-slate-900">{value}</span>
          {unit && <span className="text-[18px] font-bold text-slate-800/80">{unit}</span>}
        </div>
        <p className="mt-1 text-[11px] text-slate-500/80">{note}</p>
      </div>
    </div>
  );
}

