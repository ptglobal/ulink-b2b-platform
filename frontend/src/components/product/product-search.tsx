'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, ArrowDownUp, Download, LayoutGrid, List, ChevronDown, X } from 'lucide-react';

interface ProductSearchProps {
  defaultValue?: string;
  placeholder?: string;
  totalCount?: number;
  labels?: {
    sortLabel?: string;
    sortPopular?: string;
    sortNewest?: string;
    sortNameAZ?: string;
    sortNameZA?: string;
    exportList?: string;
  };
}

export default function ProductSearch({
  defaultValue = '',
  placeholder = 'Tìm sản phẩm, mã SKU hoặc từ khoá...',
  totalCount,
  labels,
}: ProductSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const [sortOpen, setSortOpen] = useState(false);

  const currentSort = searchParams.get('sort') ?? 'popular';
  const currentView = searchParams.get('view') ?? 'grid';

  const sortOptions = [
    { value: 'popular', label: labels?.sortPopular ?? 'Phổ biến nhất' },
    { value: 'newest', label: labels?.sortNewest ?? 'Mới nhất' },
    { value: 'name_asc', label: labels?.sortNameAZ ?? 'Tên A-Z' },
    { value: 'name_desc', label: labels?.sortNameZA ?? 'Tên Z-A' },
  ];

  const currentSortLabel = sortOptions.find((o) => o.value === currentSort)?.label ?? sortOptions[0].label;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set('search', value.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleSort(sortValue: string) {
    setSortOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    if (sortValue === 'popular') {
      params.delete('sort');
    } else {
      params.set('sort', sortValue);
    }
    params.set('page', '1');
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleClearSearch() {
    setValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleViewMode(mode: 'grid' | 'list') {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === 'grid') {
      params.delete('view');
    } else {
      params.set('view', mode);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${isPending ? 'opacity-70' : ''}`}>
      {/* Search input */}
      <form onSubmit={handleSubmit} className="flex-1 min-w-0">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label={placeholder}
          />
          {value && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Sort dropdown */}
      <div className="relative">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          <ArrowDownUp className="h-4 w-4 text-gray-500" />
          <span>{labels?.sortLabel ?? 'Sắp xếp'}: <span className="font-medium">{currentSortLabel}</span></span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>
        {sortOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
                    currentSort === opt.value ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* View mode toggle */}
      <div className="hidden sm:flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
        <button
          onClick={() => handleViewMode('grid')}
          className={`p-2.5 transition-colors ${currentView === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          aria-label="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleViewMode('list')}
          className={`p-2.5 transition-colors ${currentView === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          aria-label="List view"
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      {/* Export button */}
      <button className="hidden lg:flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap">
        <Download className="h-4 w-4" />
        {labels?.exportList ?? 'Xuất danh sách'}
        {totalCount != null && ` (${totalCount})`}
      </button>
    </div>
  );
}
