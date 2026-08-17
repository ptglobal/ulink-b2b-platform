import React from 'react';

export function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
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

export function FilterChip({
  label,
  filterKey,
  slug,
  locale,
  searchParams
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
      const remaining = v
        .split(',')
        .filter((s) => s !== slug)
        .join(',');
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

export function PaginationLink({
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
      className={`inline-flex h-11 min-w-11 items-center justify-center px-2.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'border border-gray-200 text-gray-700 hover:bg-brand/10 hover:text-brand'
      }`}
    >
      {label}
    </a>
  );
}

export function PerPageLink({
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

export function getPageNumbers(current: number, total: number): (number | string)[] {
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
