import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SearchX, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/product/product-card';
import ProductSearch from '@/components/product/product-search';
import ProductFilter from '@/components/product/product-filter';
import { getTranslatedName } from '@/lib/i18n-content';
import {
  fetchProducts,
  fetchIndustries,
  fetchStandards,
  fetchRegionalHubs,
  fetchIndustryProductCounts,
  fetchStandardProductCounts,
  fetchRegionProductCounts,
  fetchProductCategories
} from '@/lib/product-data';
import type { Industry, Standard, ProductCategory } from '@/lib/directus';

export const dynamic = 'force-dynamic';

interface SolutionsPageProps {
  params: { locale: string };
  searchParams: { search?: string; industry?: string; standard?: string; region?: string; category?: string; page?: string; sort?: string; limit?: string; view?: string };
}

export async function generateMetadata({ params: { locale } }: SolutionsPageProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });
  return { title: t('title') };
}

export default async function SolutionsPage({ params: { locale }, searchParams }: SolutionsPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'solutions' });

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);
  const limit = Math.min(48, Math.max(8, parseInt(searchParams.limit ?? '12', 10) || 12));

  const [{ products, totalCount }, industries, standards, hubs, industryCounts, standardCounts, regionCounts, categories] =
    await Promise.all([
      fetchProducts({
        search: searchParams.search,
        industry: searchParams.industry,
        standard: searchParams.standard,
        region: searchParams.region,
        category: searchParams.category,
        sort: searchParams.sort,
        page,
        limit
      }),
      fetchIndustries(),
      fetchStandards(),
      fetchRegionalHubs(),
      fetchIndustryProductCounts(),
      fetchStandardProductCounts(),
      fetchRegionProductCounts(),
      fetchProductCategories()
    ]);

  const totalPages = Math.ceil(totalCount / limit);
  const from = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalCount);

  // Build filter groups
  const filterGroups = [
    {
      key: 'industry',
      label: t('filterByIndustry'),
      options: (() => {
        const industryOptions = [];
        const electronicsDb = industries.find(ind => ind.slug === 'electronics');
        const pharmaceuticalDb = industries.find(ind => ind.slug === 'pharmaceutical');
        const cosmeticsDb = industries.find(ind => ind.slug === 'cosmetics');
        const foodDb = industries.find(ind => ind.slug === 'food');

        if (electronicsDb) {
          industryOptions.push({
            slug: 'electronics',
            name: locale === 'vi' ? 'Điện tử' : locale === 'ja' ? '電子' : 'Electronics',
            count: industryCounts[String(electronicsDb.id)] ?? 0
          });
        }
        if (pharmaceuticalDb) {
          industryOptions.push({
            slug: 'pharmaceutical',
            name: locale === 'vi' ? 'Dược phẩm' : locale === 'ja' ? '製薬' : 'Pharmaceuticals',
            count: industryCounts[String(pharmaceuticalDb.id)] ?? 0
          });
        }
        if (cosmeticsDb) {
          industryOptions.push({
            slug: 'cosmetics',
            name: locale === 'vi' ? 'Mỹ phẩm' : locale === 'ja' ? '化粧品' : 'Cosmetics',
            count: industryCounts[String(cosmeticsDb.id)] ?? 0
          });
        }
        if (foodDb) {
          industryOptions.push({
            slug: 'food',
            name: locale === 'vi' ? 'Thực phẩm' : locale === 'ja' ? '食品' : 'Food Processing',
            count: industryCounts[String(foodDb.id)] ?? 0
          });
        }
        return industryOptions;
      })()
    },
    {
      key: 'standard',
      label: t('filterByStandard'),
      options: standards.map((std: Standard) => ({
        slug: std.slug,
        name: getTranslatedName(std, locale),
        count: standardCounts[String(std.id)] ?? 0
      }))
    },
    {
      key: 'region',
      label: t('filterByRegion'),
      options: hubs.map((hub) => ({
        slug: hub.slug,
        name: getTranslatedName(hub, locale),
        count: regionCounts[String(hub.id)] ?? 0
      }))
    },
    {
      key: 'category',
      label: locale === 'vi' ? 'Danh mục' : locale === 'ja' ? 'カテゴリー' : 'Category',
      options: (() => {
        const categoryOptions = [];
        const cleanroomDb = categories.find(cat => cat.slug === 'cleanroom-consumables');
        const packagingDb = categories.find(cat => cat.slug === 'industrial-packaging');

        categoryOptions.push({
          slug: 'cleanroom-consumables',
          name: cleanroomDb ? getTranslatedName(cleanroomDb, locale) : (locale === 'vi' ? 'Giải pháp phòng sạch' : locale === 'ja' ? 'クリーンルーム' : 'Cleanroom Solutions')
        });

        categoryOptions.push({
          slug: 'industrial-packaging',
          name: packagingDb ? getTranslatedName(packagingDb, locale) : (locale === 'vi' ? 'Giải pháp đóng gói' : locale === 'ja' ? '包装' : 'Packaging Solutions')
        });

        return categoryOptions;
      })()
    }
  ];

  // Active filters for chips
  const activeFilters: Array<{ key: string; slug: string; label: string }> = [];
  if (searchParams.industry) {
    for (const slug of searchParams.industry.split(',')) {
      const ind = industries.find((i: Industry) => i.slug === slug);
      if (ind) activeFilters.push({ key: 'industry', slug, label: `Ngành: ${getTranslatedName(ind, locale)}` });
    }
  }
  if (searchParams.standard) {
    for (const slug of searchParams.standard.split(',')) {
      const std = standards.find((s: Standard) => s.slug === slug);
      if (std) activeFilters.push({ key: 'standard', slug, label: `Tiêu chuẩn: ${getTranslatedName(std, locale)}` });
    }
  }
  if (searchParams.region) {
    for (const slug of searchParams.region.split(',')) {
      const hub = hubs.find((h) => h.slug === slug);
      if (hub) activeFilters.push({ key: 'region', slug, label: `Khu vực: ${getTranslatedName(hub, locale)}` });
    }
  }

  const hasFilters = activeFilters.length > 0 || !!searchParams.search;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat" />
        </div>

        <div className="relative container mx-auto px-4 py-10 lg:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-blue-200 mb-6">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              {t('breadcrumbHome')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-medium">{t('breadcrumbSolutions')}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left: Title + subtitle */}
            <div className="max-w-xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight whitespace-pre-line">
                {t('heroTitle')}
              </h1>
              <p className="mt-4 text-blue-100 text-sm lg:text-base leading-relaxed">
                {t('heroSubtitle')}
              </p>
            </div>

            {/* Right: Stats grid */}
            <div className="grid grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <StatCard value={totalCount.toLocaleString()} label={t('statProducts')} icon="📦" />
              <StatCard value="24-48h" label={t('statDelivery')} icon="🚚" />
              <StatCard value="98.7%" label={t('statSatisfaction')} icon="⭐" />
              <StatCard value={`${industries.length + standards.length}+`} label={t('statCustomers')} icon="🤝" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="w-full lg:w-72 shrink-0">
            <ProductFilter
              groups={filterGroups}
              totalCount={totalCount}
              labels={{
                smartTitle: t('filterSmartTitle'),
                clearAll: t('clearAll'),
                showMore: t('showMore'),
                resultCount: t('resultCount'),
                resultUnit: t('resultUnit'),
                applyFilter: t('applyFilter'),
              }}
            />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="mb-4">
              <ProductSearch
                defaultValue={searchParams.search ?? ''}
                placeholder={t('searchPlaceholder')}
                totalCount={totalCount}
                labels={{
                  sortLabel: t('sortLabel'),
                  sortPopular: t('sortPopular'),
                  sortNewest: t('sortNewest'),
                  sortNameAZ: t('sortNameAZ'),
                  sortNameZA: t('sortNameZA'),
                  exportList: t('exportList'),
                }}
              />
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeFilters.map((f) => (
                  <FilterChip
                    key={`${f.key}-${f.slug}`}
                    label={f.label}
                    filterKey={f.key}
                    slug={f.slug}
                    locale={locale}
                    searchParams={searchParams}
                  />
                ))}
                {activeFilters.length > 1 && (
                  <a
                    href={`/${locale}/solutions`}
                    className="text-xs text-red-500 hover:text-red-700 font-medium ml-2"
                  >
                    {t('clearFilters')}
                  </a>
                )}
              </div>
            )}

            {/* Product grid */}
            {products.length > 0 ? (
              <div className={
                searchParams.view === 'list'
                  ? 'grid grid-cols-1 gap-4'
                  : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'
              }>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-200">
                <SearchX className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-700">{t('noResults')}</p>
                <p className="text-sm text-gray-500 mt-1">{t('noResultsDesc')}</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 px-5 py-3">
                {/* Results info */}
                <p className="text-sm text-gray-600">
                  {t('showingResults', { from: String(from), to: String(to), total: String(totalCount) })}
                </p>

                {/* Page numbers */}
                <nav className="flex items-center gap-1.5">
                  {page > 1 && (
                    <PaginationLink locale={locale} searchParams={searchParams} page={page - 1} label="‹" />
                  )}
                  {getPageNumbers(page, totalPages).map((p, i) =>
                    p === '...' ? (
                      <span key={`dot-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                      <PaginationLink
                        key={p}
                        locale={locale}
                        searchParams={searchParams}
                        page={Number(p)}
                        label={String(p)}
                        active={Number(p) === page}
                      />
                    )
                  )}
                  {page < totalPages && (
                    <PaginationLink locale={locale} searchParams={searchParams} page={page + 1} label="›" />
                  )}
                </nav>

                {/* Per page selector */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{t('displayLabel')}:</span>
                  <PerPageLink locale={locale} searchParams={searchParams} value={12} current={limit} />
                  <PerPageLink locale={locale} searchParams={searchParams} value={24} current={limit} />
                  <PerPageLink locale={locale} searchParams={searchParams} value={48} current={limit} />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-lg font-bold text-white">{value}</p>
        <p className="text-xs text-blue-200">{label}</p>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  filterKey,
  slug,
  locale,
  searchParams,
}: {
  label: string;
  filterKey: string;
  slug: string;
  locale: string;
  searchParams: Record<string, string | undefined>;
}) {
  // Build URL removing this specific filter value
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (!v) continue;
    if (k === filterKey) {
      const remaining = v.split(',').filter((s) => s !== slug).join(',');
      if (remaining) params.set(k, remaining);
    } else {
      params.set(k, v);
    }
  }
  params.set('page', '1');
  const href = `/${locale}/solutions?${params.toString()}`;

  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
    >
      {label}
      <span className="text-blue-400 hover:text-blue-600">✕</span>
    </a>
  );
}

function PaginationLink({
  locale,
  searchParams,
  page,
  label,
  active
}: {
  locale: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  label: string;
  active?: boolean;
}) {
  const params = new URLSearchParams();
  if (searchParams.search) params.set('search', searchParams.search);
  if (searchParams.industry) params.set('industry', searchParams.industry);
  if (searchParams.standard) params.set('standard', searchParams.standard);
  if (searchParams.region) params.set('region', searchParams.region);
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.sort) params.set('sort', searchParams.sort);
  if (searchParams.limit) params.set('limit', searchParams.limit);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  const href = `/${locale}/solutions${qs ? `?${qs}` : ''}`;

  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      {label}
    </a>
  );
}

function PerPageLink({
  locale,
  searchParams,
  value,
  current
}: {
  locale: string;
  searchParams: Record<string, string | undefined>;
  value: number;
  current: number;
}) {
  const params = new URLSearchParams();
  if (searchParams.search) params.set('search', searchParams.search);
  if (searchParams.industry) params.set('industry', searchParams.industry);
  if (searchParams.standard) params.set('standard', searchParams.standard);
  if (searchParams.region) params.set('region', searchParams.region);
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.sort) params.set('sort', searchParams.sort);
  if (value !== 12) params.set('limit', String(value));
  params.set('page', '1');
  const qs = params.toString();
  const href = `/${locale}/solutions${qs ? `?${qs}` : ''}`;

  return (
    <a
      href={href}
      className={`px-2 py-0.5 rounded text-sm ${
        current === value ? 'font-bold text-blue-600' : 'text-gray-500 hover:text-blue-600'
      }`}
    >
      {value}
    </a>
  );
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | string)[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}
