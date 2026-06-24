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
  FileText
} from 'lucide-react';
import { HeadsetMic } from '@/components/icons/headset-mic';
import { VietnamMap, type ClusterMarker } from '@/components/vietnam-map';
import { Link } from '@/i18n/navigation';
import { fetchRegionalHubs, parseCoordinates, getHubName, getIndustrialZoneName } from '@/lib/regional-hub-data';

export default async function RegionalHubsPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('regionalHubs');

  const hubs = await fetchRegionalHubs();

  // Parse coordinates for map markers
  const mapClusters: ClusterMarker[] = hubs
    .map((hub) => {
      const coords = parseCoordinates(hub.coordinates);
      if (!coords) return null;
      return { id: String(hub.id), lat: coords.lat, lon: coords.lon };
    })
    .filter((c): c is ClusterMarker => c !== null);

  return (
    <>
      <section className="relative w-full overflow-hidden bg-background">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 sm:py-14 lg:px-16 lg:py-16">
          {/* Eyebrow */}
          <div className="mb-5 flex items-center gap-1.5">
            <span className="text-[13px] text-muted-foreground">{t('eyebrow')}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>

          {/* Main layout: left info + center (map + clusters) + right dashboard */}
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[360px_1fr_280px] xl:grid-cols-[400px_1fr_290px]">

            {/* === LEFT COLUMN: Title + Description + Stats === */}
            <div className="flex flex-col">
              {/* Title */}
              <h1 className="text-[26px] font-bold leading-[1.37] text-primary sm:text-[30px] lg:text-[32px]">
                {t('title')}
              </h1>

              {/* Description */}
              <p className="mt-5 max-w-[500px] text-[12px] leading-[1.85] text-muted-foreground">
                {t('description')}
              </p>

              {/* Stats Card */}
              <div className="mt-8 w-full max-w-[292px] rounded-[0.25rem] bg-[#F5F5F5] p-5 shadow-sm ring-1 ring-[#B8C0CC]">
                {/* Stat 1: Distance */}
                <StatRow
                  icon={<Route className="h-[18px] w-[18px] text-brand" />}
                  label={t('stats.distanceLabel')}
                  value={t('stats.distanceValue')}
                  unit={t('stats.distanceUnit')}
                  note={t('stats.distanceNote')}
                />

                <Divider />

                {/* Stat 2: Time */}
                <StatRow
                  icon={<Clock className="h-[18px] w-[18px] text-brand" />}
                  label={t('stats.timeLabel')}
                  value={t('stats.timeValue')}
                  unit={t('stats.timeUnit')}
                  note={t('stats.timeNote')}
                />

                <Divider />

                {/* Stat 3: Partners */}
                <StatRow
                  icon={<Users className="h-[18px] w-[18px] text-brand" />}
                  label={t('stats.partnersLabel')}
                  value={t('stats.partnersValue')}
                  note={t('stats.partnersNote')}
                />
              </div>
            </div>

            {/* === CENTER COLUMN: Map + Cluster List aligned === */}
            <div className="relative flex items-start gap-0">
              {/* Map */}
              <div className="relative hidden h-[540px] w-[354px] shrink-0 lg:block">
                <VietnamMap className="h-full w-full" clusters={mapClusters} />
              </div>

              {/* Cluster List — evenly spaced vertically */}
              <div className="flex h-[540px] flex-col justify-between py-8">
                {hubs.map((hub, index) => {
                  const localizedName = getHubName(hub, locale);
                  const isZonesStr = hub.industrial_zones && hub.industrial_zones.length > 0
                    ? hub.industrial_zones.map((z) => getIndustrialZoneName(z, locale)).join(', ')
                    : '';
                  return (
                    <Link
                      key={hub.id}
                      href={`/regional-hubs/${hub.slug}`}
                      className="group flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-muted"
                    >
                      {/* Number badge — white text on Dark Navy bg */}
                      <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-primary shadow-sm group-hover:bg-brand transition-colors">
                        <span className="text-[11px] font-bold text-white">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold leading-tight text-primary group-hover:text-brand transition-colors truncate">
                          {localizedName}
                        </p>
                        {isZonesStr && (
                          <p className="mt-0.5 max-w-[170px] text-[10px] leading-snug text-muted-foreground truncate">
                            {isZonesStr}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-brand transition-all" />
                    </Link>
                  );
                })}
                {hubs.length === 0 && (
                  <p className="text-[12px] text-muted-foreground text-center py-4">
                    No regional hubs available
                  </p>
                )}
              </div>
            </div>

            {/* === RIGHT COLUMN: Live Dashboard === */}
            <div className="flex flex-col">
              <div className="flex h-full w-full flex-col overflow-hidden rounded-[0.25rem] shadow-sm ring-1 ring-[#B8C0CC]">
                {/* Dark header */}
                <div className="bg-primary px-4 py-3.5">
                  <p className="text-[11px] font-semibold text-primary-foreground/80">
                    {t('dashboard.headerTitle')}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="h-[6px] w-[6px] rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-primary-foreground/50">{t('dashboard.headerTime')}</span>
                  </div>
                </div>

                {/* Metrics body */}
                <div className="flex flex-1 flex-col justify-between divide-y divide-[#B8C0CC] bg-[#F5F5F5] px-4 py-5">
                  {/* Orders */}
                  <div className="py-3 first:pt-0 last:pb-0">
                    <DashboardMetric
                      icon={<Package className="h-4 w-4 text-brand" />}
                      label={t('dashboard.ordersLabel')}
                      value={t('dashboard.ordersValue')}
                      unit={t('dashboard.ordersUnit')}
                      change={t('dashboard.ordersChange')}
                      note={t('dashboard.ordersNote')}
                    />
                  </div>

                  {/* Delivery rate */}
                  <div className="py-3 first:pt-0 last:pb-0">
                    <DashboardMetric
                      icon={<CheckCircle className="h-4 w-4 text-brand" />}
                      label={t('dashboard.deliveryLabel')}
                      value={t('dashboard.deliveryValue')}
                      change={t('dashboard.deliveryChange')}
                      note={t('dashboard.deliveryNote')}
                    />
                  </div>

                  {/* Vehicles */}
                  <div className="py-3 first:pt-0 last:pb-0">
                    <DashboardMetric
                      icon={<Truck className="h-4 w-4 text-brand" />}
                      label={t('dashboard.vehiclesLabel')}
                      value={t('dashboard.vehiclesValue')}
                      unit={t('dashboard.vehiclesUnit')}
                      note={t('dashboard.vehiclesNote')}
                    />
                  </div>

                  {/* Warehouse */}
                  <div className="py-3 first:pt-0 last:pb-0">
                    <DashboardMetric
                      icon={<Warehouse className="h-4 w-4 text-brand" />}
                      label={t('dashboard.warehouseLabel')}
                      value={t('dashboard.warehouseValue')}
                      unit={t('dashboard.warehouseUnit')}
                      note={t('dashboard.warehouseNote')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === Why Choose ULINK === */}
      <WhyChooseSection />

      {/* === CTA Banner === */}
      <CtaBanner />
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
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/8">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[23px] font-bold leading-none text-primary">{value}</span>
          {unit && <span className="text-[16px] font-bold text-primary/65">{unit}</span>}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground/80">{note}</p>
      </div>
    </div>
  );
}

function DashboardMetric({
  icon,
  label,
  value,
  unit,
  change,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  change?: string;
  note?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand/8">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="text-[21px] font-bold leading-none text-primary">{value}</span>
          {unit && <span className="text-[14px] font-bold text-primary/65">{unit}</span>}
        </div>
        {(change || note) && (
          <div className="mt-1 flex items-center gap-1.5">
            {change && (
              <span className="text-[10px] font-bold text-emerald-500">{change}</span>
            )}
            {note && (
              <span className="text-[10px] text-muted-foreground/70">{note}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-4 h-px w-full bg-[#B8C0CC]" />;
}

async function WhyChooseSection() {
  const t = await getTranslations('whyChoose');

  const items = [
    { key: 'network', icon: <Globe className="h-10 w-10 text-primary/70" strokeWidth={1.2} /> },
    { key: 'supplyChain', icon: <Truck className="h-10 w-10 text-primary/70" strokeWidth={1.2} /> },
    { key: 'quality', icon: <ShieldCheck className="h-10 w-10 text-primary/70" strokeWidth={1.2} /> },
    { key: 'cost', icon: <TrendingDown className="h-10 w-10 text-primary/70" strokeWidth={1.2} /> },
    { key: 'support', icon: <HeadsetMic className="h-10 w-10 text-primary/70" strokeWidth={1.2} /> },
  ];

  return (
    <section className="w-full bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 sm:px-8 lg:px-16">
        <div className="rounded-[0.25rem] border border-[#B8C0CC] bg-[#F5F5F5] px-6 py-6 sm:px-8 lg:px-10">
          {/* Section title */}
          <h2 className="mb-5 text-[14px] font-bold text-primary/80">
            {t('title')}
          </h2>

          {/* Items row */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {items.map((item) => (
              <div key={item.key} className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                  {item.icon}
                </div>
                {/* Text */}
                <div className="flex-1">
                  <p className="text-[12px] font-bold leading-tight text-primary/80">
                    {t(`items.${item.key}.title`)}
                  </p>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
                    {t(`items.${item.key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

async function CtaBanner() {
  const t = await getTranslations('ctaBanner');

  return (
    <section className="w-full bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 sm:px-8 lg:px-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[0.25rem] border border-[#1f3063] bg-[#1A2D49] px-6 py-6 sm:px-8 md:flex-row md:items-center md:gap-8 lg:px-10">
          {/* Left: icon + text */}
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center">
              <FileText className="h-9 w-9 text-[#F5F5F5]" strokeWidth={1.4} />
            </div>
            <div>
              <p className="text-[15px] font-bold leading-tight text-[#F5F5F5]">
                {t('title')}
              </p>
              <p className="mt-1.5 text-[11px] font-bold leading-relaxed text-[#B8C0CC]">
                {t('desc')}
              </p>
            </div>
          </div>

          {/* Right: CTA button */}
          <a
            href="/contact"
            className="group inline-flex shrink-0 items-center gap-2 rounded-[0.25rem] border border-[#4a5582] bg-[#1769E2] px-6 py-3 text-[13px] font-semibold text-[#F5F5F5] transition-colors hover:bg-[#1257bd]"
          >
            {t('button')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
