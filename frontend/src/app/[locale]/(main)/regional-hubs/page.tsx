import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { AboutContact } from '@/components/about/about-contact';
import { ResourcesNews } from '@/components/home';
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  Factory,
  FileText,
  Route,
  Truck,
  Users,
  Warehouse
} from '@/components/icons';
import { BrandedMedia } from '@/components/media/branded-media';
import ProductCard from '@/components/product/product-card';
import HubClusterList from '@/components/regional-hubs/hub-cluster-list';
import SolutionCarousel from '@/components/regional-hubs/solution-carousel';
import TestimonialCarousel from '@/components/regional-hubs/testimonial-carousel';
import WorkingProcess from '@/components/regional-hubs/working-process';
import { buttonVariants } from '@/components/ui/button';
import { VietnamMap, type ClusterMarker } from '@/components/vietnam-map';
import { Link } from '@/i18n/navigation';
import { fetchProducts } from '@/lib/product-data';
import { fetchRegionalHubs, getHubName } from '@/lib/regional-hub-data';
import {
  getRegionalHubMedia,
  getRegionalHubsPageContent,
  type RegionalHubMetricCopy
} from '@/lib/regional-hubs-content';
import { getSiteSettings } from '@/lib/site-settings';

const CAPABILITY_ICONS = {
  factory: Factory,
  clock: Clock,
  award: Award
} as const;

export default async function RegionalHubsPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  const [content, hubs, productResult, settings] = await Promise.all([
    getRegionalHubsPageContent(locale),
    fetchRegionalHubs(),
    fetchProducts({ limit: 12 }),
    getSiteSettings()
  ]);

  if (!content) notFound();

  const { copy, media } = content;
  const products = productResult.products
    .filter((product) => product.skus?.some((sku) => sku.status === 'published'))
    .slice(0, 3);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  const mapClusters: ClusterMarker[] = copy.network.hubs.map((hub) => ({
    id: hub.id,
    lat: hub.lat,
    lon: hub.lon
  }));

  const hubCards = copy.network.hubs.map((hub) => ({
    id: hub.id,
    number: hub.number,
    name: hub.name,
    zonesStr: hub.zones,
    href: hub.href
  }));

  const zoneCount = hubs.reduce((sum, hub) => sum + (hub.industrial_zones?.length ?? 0), 0);
  const averageDistance = average(hubs.map((hub) => hub.avg_delivery_distance));
  const averageDeliveryHours = average(
    hubs.map((hub) => parseLeadingNumber(hub.avg_delivery_time))
  );
  const dailyCapacity = sum(hubs.map((hub) => hub.order_capacity_per_day));
  const averageOnTime = average(hubs.map((hub) => hub.on_time_rate));
  const activeHubs = hubs.filter((hub) => hub.operating_status === 'active').length;
  const totalWarehouseArea = sum(hubs.map((hub) => hub.warehouse_total_area));

  const featuredHub = hubs.find((hub) => hub.slug === copy.featuredHub.slug) ?? null;
  const featuredHubName =
    copy.featuredHub.displayName ?? (featuredHub ? getHubName(featuredHub, locale) : '');
  const featuredHubDescription =
    copy.featuredHub.description ??
    interpolate(copy.featuredHub.descriptionTemplate, {
      hubName: featuredHubName,
      warehouseArea: number.format(featuredHub?.warehouse_total_area ?? 0),
      zoneCount: number.format(featuredHub?.industrial_zones?.length ?? 0),
      dailyCapacity: number.format(featuredHub?.order_capacity_per_day ?? 0),
      onTimeRate: number.format(featuredHub?.on_time_rate ?? 0)
    });
  const featuredHubMedia = getRegionalHubMedia(media, copy.featuredHub.imageRole);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-deep text-white">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background-size:48px_48px] [background-image:linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_58%_38%,rgba(41,114,255,.58),transparent_45%),linear-gradient(112deg,rgba(20,93,224,.82),rgba(10,37,103,.12))]" />

        <div className="ulink-container relative py-12 sm:py-16 lg:py-20">
          <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(18rem,5fr)_minmax(18rem,4fr)] lg:items-stretch lg:gap-6 xl:gap-9">
            <div className="flex min-w-0 flex-col">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
                {copy.eyebrow}
              </p>
              <h1 className="mt-5 max-w-[13ch] text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.35rem]">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-[48ch] text-sm leading-6 text-white/76 sm:text-base sm:leading-7">
                {copy.description}
              </p>

              <div className="mt-10 grid gap-2 sm:grid-cols-3 lg:mt-auto lg:grid-cols-1">
                <HeroMetric
                  icon={Route}
                  copy={copy.stats.distance}
                  value={copy.stats.distance.value ?? number.format(averageDistance)}
                />
                <HeroMetric
                  icon={Clock}
                  copy={copy.stats.delivery}
                  value={copy.stats.delivery.value ?? number.format(averageDeliveryHours)}
                />
                <HeroMetric
                  icon={Users}
                  copy={copy.stats.zones}
                  value={copy.stats.zones.value ?? number.format(zoneCount)}
                />
              </div>
            </div>

            <div className="relative min-h-[31rem] min-w-0 overflow-hidden border border-white/16 bg-brand-deep/28 p-5 sm:min-h-[38rem] lg:min-h-[42rem]">
              <div className="absolute left-5 top-5 z-10 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
                {copy.network.eyebrow}
              </div>
              <VietnamMap className="h-full w-full" clusters={mapClusters} />
              <p className="absolute inset-x-5 bottom-4 truncate text-right font-mono text-[9px] uppercase tracking-[0.12em] text-cyan-100/65">
                {copy.network.signature}
              </p>
            </div>

            <div className="flex min-w-0 flex-col border border-white/16 bg-brand-deep/34 p-4 sm:p-5">
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/14 pb-5">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">{copy.network.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-white/62">{copy.network.subtitle}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 motion-safe:animate-pulse" />
                  {copy.network.liveLabel}
                </span>
              </div>

              <HubClusterList hubs={hubCards} tone="dark" emptyLabel={copy.network.emptyLabel} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-8">
        <div className="ulink-container">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground">{copy.dashboard.title}</h2>
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success" />
              {copy.dashboard.sourceLabel}
            </p>
          </div>
          <div className="grid border border-border bg-border md:grid-cols-2 md:gap-px xl:grid-cols-4">
            <DashboardMetric
              icon={FileText}
              copy={copy.dashboard.capacity}
              value={copy.dashboard.capacity.value ?? number.format(dailyCapacity)}
            />
            <DashboardMetric
              icon={CheckCircle}
              copy={copy.dashboard.onTime}
              value={copy.dashboard.onTime.value ?? number.format(averageOnTime)}
            />
            <DashboardMetric
              icon={Truck}
              copy={copy.dashboard.hubs}
              value={copy.dashboard.hubs.value ?? number.format(activeHubs)}
            />
            <DashboardMetric
              icon={Warehouse}
              copy={copy.dashboard.warehouse}
              value={copy.dashboard.warehouse.value ?? number.format(totalWarehouseArea)}
            />
          </div>
        </div>
      </section>

      <section className="bg-card py-12 sm:py-16">
        <div className="ulink-container">
          <header className="mb-9 flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
                {copy.featuredProducts.title}
              </h2>
              <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted-foreground">
                {copy.featuredProducts.subtitle}
              </p>
            </div>
            <Link
              href="/products"
              className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand"
            >
              {copy.featuredProducts.viewAll}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </header>

          <div className="grid gap-7 md:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
            {products.length === 0 ? (
              <p className="col-span-full border border-border py-12 text-center text-sm text-muted-foreground">
                {copy.featuredProducts.emptyLabel}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <SolutionCarousel slides={copy.carousel.slides} labels={copy.carousel} />

      <section className="border-t border-border bg-card py-14 sm:py-16">
        <div className="ulink-container grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card p-6 sm:p-8">
            <h2 className="text-2xl font-semibold leading-tight tracking-[-0.025em] text-foreground">
              {copy.capabilities.title}
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {copy.capabilities.description}
            </p>
          </div>
          {copy.capabilities.items.map((item) => {
            const Icon = CAPABILITY_ICONS[item.icon] ?? Factory;
            return (
              <article
                key={item.title}
                className="cds--tile flex min-h-64 flex-col bg-card p-6 sm:p-8"
              >
                <span className="flex h-11 w-11 items-center justify-center bg-brand/10 text-brand">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
                <Link
                  href={item.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand"
                >
                  {copy.capabilities.learnMore}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-background py-14 sm:py-16 lg:py-20">
        <div className="ulink-container">
          <header className="mx-auto max-w-4xl text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              {copy.featuredHub.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">
              {copy.featuredHub.title}
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
              {featuredHubDescription}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={interpolate(copy.featuredHub.primaryAction.href, {
                  slug: copy.featuredHub.slug
                })}
                className={buttonVariants({ variant: 'primary', size: 'lg' })}
              >
                {copy.featuredHub.primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={interpolate(copy.featuredHub.secondaryAction.href, {
                  slug: copy.featuredHub.slug
                })}
                className={buttonVariants({ variant: 'quiet', size: 'lg' })}
              >
                {copy.featuredHub.secondaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          <BrandedMedia
            src={featuredHubMedia?.path}
            alt={featuredHubMedia?.alt || copy.featuredHub.imageAlt}
            sizes="(max-width: 1023px) 100vw, 960px"
            className="mx-auto mt-10 aspect-[16/8.5] max-w-5xl border border-border bg-muted"
            imageClassName="object-center"
          />
        </div>
      </section>

      <TestimonialCarousel content={copy.testimonials} />
      <WorkingProcess content={copy.workingProcess} />
      <ResourcesNews copy={copy.resources} />

      <section className="bg-background">
        <div className="ulink-container">
          <AboutContact settings={settings} copy={copy.contact} />
        </div>
      </section>
    </>
  );
}

function HeroMetric({
  icon: Icon,
  copy,
  value
}: {
  icon: typeof Route;
  copy: RegionalHubMetricCopy;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 border border-white/15 bg-white/[0.08] p-4 backdrop-blur-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-cyan-300/12 text-cyan-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-white/68">{copy.label}</span>
        <span className="mt-1 flex items-baseline gap-1">
          <strong className="font-mono text-2xl font-semibold text-white">{value}</strong>
          {copy.unit ? (
            <span className="text-sm font-semibold text-white/80">{copy.unit}</span>
          ) : null}
        </span>
        <span className="mt-1 block text-[11px] leading-4 text-white/55">{copy.note}</span>
      </span>
    </div>
  );
}

function DashboardMetric({
  icon: Icon,
  copy,
  value
}: {
  icon: typeof FileText;
  copy: RegionalHubMetricCopy;
  value: string;
}) {
  return (
    <article className="flex min-w-0 items-start gap-4 bg-card p-5 sm:p-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand/10 text-brand">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{copy.label}</p>
        <p className="mt-1 flex flex-wrap items-baseline gap-1">
          <strong className="font-mono text-xl font-semibold text-foreground">{value}</strong>
          {copy.unit ? (
            <span className="text-sm font-medium text-muted-foreground">{copy.unit}</span>
          ) : null}
        </p>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{copy.note}</p>
      </div>
    </article>
  );
}

function average(values: Array<number | null | undefined>): number {
  const valid = values.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );
  return valid.length ? valid.reduce((total, value) => total + value, 0) / valid.length : 0;
}

function sum(values: Array<number | null | undefined>): number {
  return values.reduce<number>(
    (total, value) => total + (typeof value === 'number' ? value : 0),
    0
  );
}

function parseLeadingNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function interpolate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template
  );
}
