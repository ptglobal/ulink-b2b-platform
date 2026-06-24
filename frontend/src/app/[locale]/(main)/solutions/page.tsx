import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SearchX } from 'lucide-react';
import ProductCard from '@/components/product/product-card';
import ProductSearch from '@/components/product/product-search';
import ProductFilter from '@/components/product/product-filter';
import {
  fetchProducts,
  fetchIndustries,
  fetchStandards,
  fetchRegionalHubs,
  fetchIndustryProductCounts,
  fetchStandardProductCounts,
  fetchRegionProductCounts
} from '@/lib/product-data';
import type { Industry, Standard } from '@/lib/directus';

export const dynamic = 'force-dynamic';

interface SolutionsPageProps {
  params: { locale: string };
  searchParams: { search?: string; industry?: string; standard?: string; region?: string; page?: string };
}

export async function generateMetadata({ params: { locale } }: SolutionsPageProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });
  return { title: t('title') };
}

export default async function SolutionsPage({ params: { locale }, searchParams }: SolutionsPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'solutions' });

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);

  const [{ products, totalCount }, industries, standards, hubs, industryCounts, standardCounts, regionCounts] =
    await Promise.all([
      fetchProducts({
        search: searchParams.search,
        industry: searchParams.industry,
        standard: searchParams.standard,
        region: searchParams.region,
        page
      }),
      fetchIndustries(),
      fetchStandards(),
      fetchRegionalHubs(),
      fetchIndustryProductCounts(),
      fetchStandardProductCounts(),
      fetchRegionProductCounts()
    ]);

  const totalPages = Math.ceil(totalCount / 12);

  // Build filter groups
  const filterGroups = [
    {
      key: 'industry',
      label: t('filterByIndustry'),
      options: industries.map((ind: Industry) => ({
        slug: ind.slug,
        name: ind.name,
        count: industryCounts[String(ind.id)] ?? 0
      }))
    },
    {
      key: 'standard',
      label: t('filterByStandard'),
      options: standards.map((std: Standard) => ({
        slug: std.slug,
        name: std.name,
        count: standardCounts[String(std.id)] ?? 0
      }))
    },
    {
      key: 'region',
      label: t('filterByRegion'),
      options: hubs.map((hub) => ({
        slug: hub.slug,
        name: hub.name,
        count: regionCounts[String(hub.id)] ?? 0
      }))
    }
  ];

  // Active filters display
  const hasFilters = !!(searchParams.search || searchParams.industry || searchParams.standard || searchParams.region);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

      {/* Search bar */}
      <div className="mb-6">
        <ProductSearch
          defaultValue={searchParams.search ?? ''}
          placeholder={t('searchPlaceholder')}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <ProductFilter groups={filterGroups} />
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {t('showingResults', { count: totalCount })}
            </p>
            {hasFilters && (
              <a
                href={`/${locale}/solutions`}
                className="text-sm text-primary hover:underline"
              >
                {t('clearFilters')}
              </a>
            )}
          </div>

          {/* Product grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">{t('noResults')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('noResultsDesc')}</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <PaginationLink
                  locale={locale}
                  searchParams={searchParams}
                  page={page - 1}
                  label={t('previous')}
                />
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationLink
                  key={p}
                  locale={locale}
                  searchParams={searchParams}
                  page={p}
                  label={String(p)}
                  active={p === page}
                />
              ))}
              {page < totalPages && (
                <PaginationLink
                  locale={locale}
                  searchParams={searchParams}
                  page={page + 1}
                  label={t('next')}
                />
              )}
            </nav>
          )}
        </main>
      </div>
    </div>
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
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  const href = `/${locale}/solutions${qs ? `?${qs}` : ''}`;

  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'border border-input hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      {label}
    </a>
  );
}
