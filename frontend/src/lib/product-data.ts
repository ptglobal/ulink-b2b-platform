import { getDirectusUrl } from './directus-runtime.mjs';
import type { Product, ProductCategory, Industry, Standard } from './directus';

export interface ProductListParams {
  search?: string;
  industry?: string; // comma-separated slugs for multi-select
  standard?: string; // comma-separated slugs for multi-select
  region?: string;   // comma-separated hub slugs
  category?: string; // comma-separated category slugs
  sort?: string;     // popular | newest | name_asc | name_desc
  page?: number;
  limit?: number;
}

interface ProductListResult {
  products: Product[];
  totalCount: number;
}

const PAGE_SIZE = 12;

/**
 * Build Directus REST API URL with query params.
 * We bypass the SDK here because Next.js App Router patches globalThis.fetch
 * in a way that breaks the SDK's internal fetch even with globals override.
 */
function buildProductsUrl(params: {
  filter: Record<string, unknown>;
  fields: string[];
  limit: number;
  offset: number;
  sort?: string;
}): string {
  const base = getDirectusUrl();
  const url = new URL('/items/products', base);

  // Deep filter
  url.searchParams.set('filter', JSON.stringify(params.filter));

  // Fields
  for (const f of params.fields) {
    url.searchParams.append('fields[]', f);
  }

  // Sort
  if (params.sort) {
    url.searchParams.set('sort', params.sort);
  }

  url.searchParams.set('limit', String(params.limit));
  if (params.limit >= 0) {
    url.searchParams.set('offset', String(params.offset));
  }
  url.searchParams.set('meta', 'filter_count');

  return url.toString();
}

const PRODUCT_LIST_FIELDS = [
  'id', 'name', 'slug', 'brand', 'short_description', 'hero', 'meta_title',
  'translations.languages_code', 'translations.name', 'translations.short_description', 'translations.meta_title', 'translations.meta_description',
  'category.id', 'category.name', 'category.slug',
  'category.translations.languages_code', 'category.translations.name',
  'skus.id', 'skus.sku_code', 'skus.stock_status', 'skus.unit', 'skus.pack_size', 'skus.status',
  'industries.industries_id.id', 'industries.industries_id.name', 'industries.industries_id.slug',
  'industries.industries_id.translations.languages_code', 'industries.industries_id.translations.name',
  'standards.standards_id.id', 'standards.standards_id.name', 'standards.standards_id.slug',
  'standards.standards_id.translations.languages_code', 'standards.standards_id.translations.name',
  'documents.id', 'documents.title', 'documents.doc_type', 'documents.status', 'documents.file.id'
];

export async function fetchProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  const { search, industry, standard, region, category, sort, page = 1, limit = PAGE_SIZE } = params;
  const offset = (page - 1) * limit;

  // Build filter
  const filter: Record<string, unknown> = { status: { _eq: 'published' } };

  // Category filter supporting direct matching and parent matching
  if (category) {
    const slugs = category.split(',').filter(Boolean);
    if (slugs.length === 1) {
      filter._and = filter._and || [];
      (filter._and as Array<any>).push({
        _or: [
          { category: { slug: { _eq: slugs[0] } } },
          { category: { parent: { slug: { _eq: slugs[0] } } } }
        ]
      });
    } else {
      filter._and = filter._and || [];
      (filter._and as Array<any>).push({
        _or: [
          { category: { slug: { _in: slugs } } },
          { category: { parent: { slug: { _in: slugs } } } }
        ]
      });
    }
  }

  // Multi-select: comma-separated slugs → _in filter
  if (industry) {
    const slugs = industry.split(',').filter(Boolean).flatMap((s) => {
      if (s === 'pharmaceutical-cosmetics') {
        return ['pharmaceutical', 'cosmetics'];
      }
      if (s === 'food-beverage') {
        return ['food'];
      }
      return [s];
    });
    if (slugs.length === 1) {
      filter.industries = { industries_id: { slug: { _eq: slugs[0] } } };
    } else {
      filter.industries = { industries_id: { slug: { _in: slugs } } };
    }
  }
  if (standard) {
    const slugs = standard.split(',').filter(Boolean);
    if (slugs.length === 1) {
      filter.standards = { standards_id: { slug: { _eq: slugs[0] } } };
    } else {
      filter.standards = { standards_id: { slug: { _in: slugs } } };
    }
  }
  if (region) {
    const slugs = region.split(',').filter(Boolean);
    if (slugs.length === 1) {
      filter.regions = { regional_hubs_id: { slug: { _eq: slugs[0] } } };
    } else {
      filter.regions = { regional_hubs_id: { slug: { _in: slugs } } };
    }
  }

  // Use _or filter for search to cover: product name, brand, AND sku_code (nested relation)
  // Directus `search` param only hits top-level fields — it misses product_skus.sku_code
  if (search) {
    filter._or = [
      { name: { _icontains: search } },
      { brand: { _icontains: search } },
      { skus: { sku_code: { _icontains: search } } }
    ];
  }

  try {
    // Map sort param to Directus sort field
    let sortField: string | undefined;
    switch (sort) {
      case 'newest': sortField = '-id'; break;
      case 'name_asc': sortField = 'name'; break;
      case 'name_desc': sortField = '-name'; break;
      default: sortField = '-id'; break; // popular = newest by default (id correlates with creation order)
    }

    const url = new URL(buildProductsUrl({ filter, fields: PRODUCT_LIST_FIELDS, limit, offset, sort: sortField }));
    url.searchParams.set(
      'deep',
      JSON.stringify({
        documents: { _filter: { status: { _eq: 'published' } } }
      })
    );
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('[product-data] fetchProducts HTTP error:', res.status);
      return { products: [], totalCount: 0 };
    }

    const json = await res.json() as { data: Product[]; meta?: { filter_count?: number } };
    const items = json.data ?? [];
    const totalCount = json.meta?.filter_count ?? items.length;

    return { products: items, totalCount };
  } catch (error) {
    console.error('[product-data] fetchProducts failed:', error);
    return { products: [], totalCount: 0 };
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const base = getDirectusUrl();
    const fields = [
      'id', 'name', 'slug', 'brand', 'short_description', 'specifications', 'hero',
      'meta_title', 'meta_description',
      'translations.languages_code', 'translations.name', 'translations.short_description', 'translations.meta_title', 'translations.meta_description',
      'category.id', 'category.name', 'category.slug',
      'category.translations.languages_code', 'category.translations.name', 'category.translations.description',
      'skus.id', 'skus.sku_code', 'skus.stock_status', 'skus.unit', 'skus.pack_size', 'skus.attributes', 'skus.status',
      'industries.industries_id.id', 'industries.industries_id.name', 'industries.industries_id.slug', 'industries.industries_id.description',
      'industries.industries_id.translations.languages_code', 'industries.industries_id.translations.name', 'industries.industries_id.translations.description',
      'standards.standards_id.id', 'standards.standards_id.name', 'standards.standards_id.slug', 'standards.standards_id.description',
      'standards.standards_id.translations.languages_code', 'standards.standards_id.translations.name', 'standards.standards_id.translations.description',
      'documents.id', 'documents.title', 'documents.doc_type', 'documents.language',
      'documents.file.id', 'documents.file.filename_download', 'documents.file.type', 'documents.file.filesize',
      'gallery.directus_files_id.id', 'gallery.directus_files_id.filename_download', 'gallery.directus_files_id.type'
    ];
    const url = new URL('/items/products', base);
    url.searchParams.set('filter', JSON.stringify({ slug: { _eq: slug }, status: { _eq: 'published' } }));
    url.searchParams.set(
      'deep',
      JSON.stringify({
        skus: { _filter: { status: { _neq: 'archived' } } },
        documents: { _filter: { status: { _eq: 'published' } } }
      })
    );
    for (const f of fields) url.searchParams.append('fields[]', f);
    url.searchParams.set('limit', '1');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json() as { data: Product[] };
    return json.data?.[0] ?? null;
  } catch (error) {
    console.error('Failed to fetch product by slug:', error);
    return null;
  }
}

export async function fetchIndustries(): Promise<Industry[]> {
  try {
    const base = getDirectusUrl();
    const url = new URL('/items/industries', base);
    url.searchParams.set('filter', JSON.stringify({ status: { _eq: 'published' } }));
    url.searchParams.set('fields', 'id,name,slug,description,translations.languages_code,translations.name,translations.description');
    url.searchParams.set('sort', 'name');
    url.searchParams.set('limit', '-1');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json() as { data: Industry[] };
    return json.data ?? [];
  } catch (error) {
    console.error('Failed to fetch industries:', error);
    return [];
  }
}

export async function fetchStandards(): Promise<Standard[]> {
  try {
    const base = getDirectusUrl();
    const url = new URL('/items/standards', base);
    url.searchParams.set('filter', JSON.stringify({ status: { _eq: 'published' } }));
    url.searchParams.set('fields', 'id,name,slug,description,translations.languages_code,translations.name,translations.description');
    url.searchParams.set('sort', 'name');
    url.searchParams.set('limit', '-1');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json() as { data: Standard[] };
    return json.data ?? [];
  } catch (error) {
    console.error('Failed to fetch standards:', error);
    return [];
  }
}

export async function fetchProductCategories(): Promise<ProductCategory[]> {
  try {
    const base = getDirectusUrl();
    const url = new URL('/items/product_categories', base);
    url.searchParams.set('filter', JSON.stringify({ status: { _eq: 'published' } }));
    url.searchParams.set('fields', 'id,name,slug,parent,translations.languages_code,translations.name,translations.description');
    url.searchParams.set('sort', 'name');
    url.searchParams.set('limit', '-1');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json() as { data: ProductCategory[] };
    return json.data ?? [];
  } catch (error) {
    console.error('Failed to fetch product categories:', error);
    return [];
  }
}

export async function fetchIndustryProductCounts(): Promise<Record<string, number>> {
  try {
    const base = getDirectusUrl();
    const url = new URL('/items/products_industries', base);
    url.searchParams.set('aggregate[count]', 'id');
    url.searchParams.set('groupBy[]', 'industries_id');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return {};
    const json = await res.json() as { data: Array<{ industries_id: number; count: { id: number } }> };
    const counts: Record<string, number> = {};
    for (const row of json.data ?? []) {
      counts[String(row.industries_id)] = Number(row.count?.id ?? 0);
    }
    return counts;
  } catch {
    return {};
  }
}

export async function fetchStandardProductCounts(): Promise<Record<string, number>> {
  try {
    const base = getDirectusUrl();
    const url = new URL('/items/products_standards', base);
    url.searchParams.set('aggregate[count]', 'id');
    url.searchParams.set('groupBy[]', 'standards_id');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return {};
    const json = await res.json() as { data: Array<{ standards_id: number; count: { id: number } }> };
    const counts: Record<string, number> = {};
    for (const row of json.data ?? []) {
      counts[String(row.standards_id)] = Number(row.count?.id ?? 0);
    }
    return counts;
  } catch {
    return {};
  }
}

export async function fetchRegionProductCounts(): Promise<Record<string, number>> {
  try {
    const base = getDirectusUrl();
    const url = new URL('/items/products_regional_hubs', base);
    url.searchParams.set('aggregate[count]', 'id');
    url.searchParams.set('groupBy[]', 'regional_hubs_id');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return {};
    const json = await res.json() as { data: Array<{ regional_hubs_id: number; count: { id: number } }> };
    const counts: Record<string, number> = {};
    for (const row of json.data ?? []) {
      counts[String(row.regional_hubs_id)] = Number(row.count?.id ?? 0);
    }
    return counts;
  } catch {
    return {};
  }
}

export interface RegionalHub {
  id: number;
  name: string;
  slug: string;
}

export async function fetchRegionalHubs(): Promise<RegionalHub[]> {
  try {
    const base = getDirectusUrl();
    const url = new URL('/items/regional_hubs', base);
    url.searchParams.set('filter', JSON.stringify({ status: { _eq: 'published' } }));
    url.searchParams.set('fields', 'id,name,slug,translations.languages_code,translations.name');
    url.searchParams.set('sort', 'name');
    url.searchParams.set('limit', '-1');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json() as { data: RegionalHub[] };
    return json.data ?? [];
  } catch (error) {
    console.error('Failed to fetch regional hubs:', error);
    return [];
  }
}
