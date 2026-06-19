import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Users,
  Route,
  Globe,
  Truck,
  ShieldCheck,
  TrendingDown,
  FileText
} from 'lucide-react';
import { HeadsetMic } from '@/components/icons/headset-mic';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';
import { VietnamMap, type ClusterMarker } from '@/components/vietnam-map';
import { fetchRegionalHubs, parseCoordinates } from '@/lib/regional-hub-data';

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
    <div className="w-full bg-[#F5F5F5]">

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — BREADCRUMB
          ═══════════════════════════════════════════════════════════════ */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto w-full max-w-[1440px] px-4 pt-3 sm:px-8 lg:px-16"
      >
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Link href="/" className="font-medium text-primary transition-colors hover:text-brand">
            {tHubs('eyebrow')}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-muted-foreground">
            {t('hero.ctaSolutions')}
          </span>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — HERO SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-background via-muted to-muted md:min-h-[340px] lg:min-h-[400px]">
        {/* Hero image — fades into background on desktop */}
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
          {/* Dot grid pattern */}
          <div className="absolute left-[7%] top-[25%] grid grid-cols-5 gap-[8px]" aria-hidden="true">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-white/40" />
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center px-4 sm:px-8 md:min-h-[340px] lg:min-h-[400px] lg:px-16">
          <div className="max-w-[480px] py-10 sm:py-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-silver">
              {t('hero.eyebrow')}
            </p>

            <h1 className="mt-4 font-semibold tracking-tight">
              <span className="block text-[26px] leading-[1.18] text-primary sm:text-[32px] md:text-[38px]">
                {t('hero.titleLine1')}
              </span>
              <span className="block text-[26px] leading-[1.18] text-primary sm:text-[32px] md:text-[38px]">
                {t('hero.titleLine2')}
              </span>
            </h1>

            <p className="mt-3 max-w-[400px] text-[13px] leading-relaxed text-muted-foreground sm:mt-4">
              {t('hero.description')}
            </p>

            <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
              <Link
                href="/quick-order"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand bg-brand px-5 text-[13px] font-semibold text-brand-foreground transition-colors hover:bg-brand-strong hover:border-brand-strong sm:h-11 sm:px-6"
              >
                {t('hero.ctaOrder')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/solutions"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand sm:h-11 sm:px-6"
              >
                {t('hero.ctaSolutions')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile hero image */}
        <div className="relative w-full md:hidden">
          <div className="relative aspect-[16/7] w-full">
            <Image src={ASSETS.home.hero} alt="" fill className="object-cover object-center" />
          </div>
        </div>
      </section>

      {/* ── Hero Metrics Bar ── */}
      <section className="relative z-10 -mt-7 mx-auto w-full max-w-[1440px] px-4 pb-4 sm:-mt-12 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-border bg-card shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-border">
          <MetricCard
            icon={<Route className="h-5 w-5 text-brand" />}
            label={tHubs('stats.distanceLabel')}
            value={tHubs('stats.distanceValue')}
            unit={tHubs('stats.distanceUnit')}
            note={tHubs('stats.distanceNote')}
          />
          <MetricCard
            icon={<Clock className="h-5 w-5 text-brand" />}
            label={tHubs('stats.timeLabel')}
            value={tHubs('stats.timeValue')}
            unit={tHubs('stats.timeUnit')}
            note={tHubs('stats.timeNote')}
          />
          <MetricCard
            icon={<Users className="h-5 w-5 text-brand" />}
            label={tHubs('stats.partnersLabel')}
            value={tHubs('stats.partnersValue')}
            note={tHubs('stats.partnersNote')}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — VISUAL STATIC MAP (API-driven)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 sm:py-10 lg:px-16">
        <div className="mb-6">
          <h2 className="text-[22px] font-bold leading-tight text-primary sm:text-[26px] lg:text-[30px]">
            {tHubs('title')}
          </h2>
          <p className="mt-3 max-w-[600px] text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
            {tHubs('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[354px_1fr]">
          {/* Map */}
          <div className="relative hidden h-[540px] w-[354px] shrink-0 lg:block">
            <VietnamMap className="h-full w-full" clusters={mapClusters} />
          </div>

          {/* Cluster Cards — aligned with connector lines */}
          <div className="flex h-auto flex-col gap-4 lg:h-[540px] lg:justify-between lg:gap-0 lg:py-8">
            {hubs.map((hub, index) => (
              <div
                key={hub.id}
                className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-brand/30 hover:shadow-md sm:p-5"
              >
                {/* Number badge */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm transition-colors group-hover:bg-brand">
                  <span className="text-[12px] font-bold text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-[14px] font-bold leading-tight text-primary sm:text-[15px]">
                    {hub.name}
                  </p>
                  {hub.industrial_zones && hub.industrial_zones.length > 0 && (
                    <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground sm:text-[12px]">
                      {hub.industrial_zones.map((z) => z.name).join(', ')}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <Link
                  href="/regional-hubs"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-all group-hover:border-brand group-hover:bg-brand group-hover:text-white"
                  aria-label={hub.name}
                >
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            ))}

            {/* Fallback if no hubs from API */}
            {hubs.length === 0 && (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">
                No regional hubs available
              </div>
            )}
          </div>
        </div>

        {/* Mobile map */}
        <div className="mt-6 lg:hidden">
          <div className="relative mx-auto h-[400px] w-full max-w-[300px]">
            <VietnamMap className="h-full w-full" clusters={mapClusters} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — USP SECTION (Why choose ULINK)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background">
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 sm:px-8 sm:pb-10 lg:px-16">
          <div className="rounded-lg border border-border bg-card px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            {/* Section title */}
            <h2 className="mb-6 text-[15px] font-bold text-primary sm:text-[16px]">
              {tWhy('title')}
            </h2>

            {/* Items row */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {[
                { key: 'network', icon: <Globe className="h-10 w-10 text-primary/70" strokeWidth={1.2} /> },
                { key: 'supplyChain', icon: <Truck className="h-10 w-10 text-primary/70" strokeWidth={1.2} /> },
                { key: 'quality', icon: <ShieldCheck className="h-10 w-10 text-primary/70" strokeWidth={1.2} /> },
                { key: 'cost', icon: <TrendingDown className="h-10 w-10 text-primary/70" strokeWidth={1.2} /> },
                { key: 'support', icon: <HeadsetMic className="h-10 w-10 text-primary/70" strokeWidth={1.2} /> }
              ].map((item) => (
                <div key={item.key} className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                    {item.icon}
                  </div>
                  {/* Text */}
                  <div className="flex-1">
                    <p className="text-[12px] font-bold leading-tight text-primary/80 sm:text-[13px]">
                      {tWhy(`items.${item.key}.title`)}
                    </p>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground sm:text-[11px]">
                      {tWhy(`items.${item.key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — BOTTOM BANNER (CTA)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background">
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 sm:px-8 sm:pb-12 lg:px-16">
          <div className="flex flex-col items-start justify-between gap-5 rounded-lg border border-[#1f3063] bg-primary px-6 py-6 sm:px-8 md:flex-row md:items-center md:gap-8 lg:px-10">
            {/* Left: icon + text */}
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                <FileText className="h-9 w-9 text-primary-foreground/80" strokeWidth={1.4} />
              </div>
              <div>
                <p className="text-[15px] font-bold leading-tight text-primary-foreground sm:text-[16px]">
                  {tCta('title')}
                </p>
                <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-primary-foreground/60 sm:text-[12px]">
                  {tCta('desc')}
                </p>
              </div>
            </div>

            {/* Right: CTA button */}
            <Link
              href="/quick-order"
              className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-brand-strong/40 bg-brand px-6 py-3 text-[13px] font-semibold text-brand-foreground transition-colors hover:bg-brand-strong"
            >
              {tCta('button')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ─── Sub-components ─── */

function MetricCard({
  icon,
  label,
  value,
  unit,
  note
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  note: string;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 sm:px-6 sm:py-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/8">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
          {label}
        </p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[24px] font-bold leading-none text-primary sm:text-[28px]">
            {value}
          </span>
          {unit && (
            <span className="text-[16px] font-bold text-primary/65 sm:text-[18px]">{unit}</span>
          )}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground/80 sm:text-[11px]">{note}</p>
      </div>
    </div>
  );
}
