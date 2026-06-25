'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

interface FilterGroup {
  key: string;
  label: string;
  options: Array<{ slug: string; name: string; count?: number }>;
}

interface ProductFilterProps {
  groups: FilterGroup[];
  totalCount?: number;
  labels?: {
    smartTitle?: string;
    clearAll?: string;
    showMore?: string;
    resultCount?: string;
    resultUnit?: string;
    applyFilter?: string;
  };
}

const VISIBLE_LIMIT = 5;

export default function ProductFilter({ groups, totalCount = 0, labels }: ProductFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Parse comma-separated values for multi-select
  function getSelectedSlugs(key: string): string[] {
    const raw = searchParams.get(key);
    if (!raw) return [];
    return raw.split(',').filter(Boolean);
  }

  const hasAnyFilter = groups.some((g) => getSelectedSlugs(g.key).length > 0);

  function handleChange(key: string, slug: string, checked: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    const current = getSelectedSlugs(key);

    let next: string[];
    if (checked) {
      next = [...current, slug];
    } else {
      next = current.filter((s) => s !== slug);
    }

    if (next.length > 0) {
      params.set(key, next.join(','));
    } else {
      params.delete(key);
    }
    params.set('page', '1');

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleClearAll() {
    const params = new URLSearchParams(searchParams.toString());
    for (const g of groups) {
      params.delete(g.key);
    }
    params.set('page', '1');
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ${isPending ? 'opacity-70' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            {labels?.smartTitle ?? 'BỘ LỌC THÔNG MINH'}
          </h3>
        </div>
        {hasAnyFilter && (
          <button
            onClick={handleClearAll}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            {labels?.clearAll ?? 'Xóa tất cả'}
          </button>
        )}
      </div>

      {/* Filter groups */}
      <div className="px-5 py-4 space-y-5">
        {groups.map((group) => {
          const selected = getSelectedSlugs(group.key);
          const isExpanded = expanded[group.key] ?? false;
          const visibleOptions = isExpanded ? group.options : group.options.slice(0, VISIBLE_LIMIT);

          return (
            <div key={group.key}>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                {group.label}
              </h4>
              <div className="space-y-2">
                {visibleOptions.map((option) => {
                  const isChecked = selected.includes(option.slug);
                  return (
                    <label
                      key={option.slug}
                      className="flex items-center justify-between cursor-pointer group/item"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleChange(group.key, option.slug, e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700 group-hover/item:text-gray-900">
                          {option.name}
                        </span>
                      </div>
                      {option.count != null && (
                        <span className="text-xs text-gray-400 tabular-nums">
                          {option.count.toLocaleString()}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              {group.options.length > VISIBLE_LIMIT && (
                <button
                  onClick={() => setExpanded((prev) => ({ ...prev, [group.key]: !isExpanded }))}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
                >
                  {isExpanded ? 'Thu gọn' : (labels?.showMore ?? 'Xem thêm')}
                  <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mx-5" />

      {/* Result count */}
      <div className="px-5 py-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          {labels?.resultCount ?? 'SỐ KẾT QUẢ'}
        </p>
        <p className="text-2xl font-bold text-gray-900">
          {totalCount.toLocaleString()}
          <span className="text-sm font-normal text-gray-500 ml-2">
            {labels?.resultUnit ?? 'sản phẩm'}
          </span>
        </p>
      </div>

      {/* Apply button */}
      <div className="px-5 pb-5">
        <button
          onClick={() => {/* filters already applied on change */}}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Filter className="h-4 w-4" />
          {labels?.applyFilter ?? 'Áp dụng bộ lọc'}
        </button>
      </div>
    </div>
  );
}
