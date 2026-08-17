'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from '@/components/icons';

interface SearchSectionProps {
  locale: string;
  targetPath?: string;
  labels: {
    eyebrow: string;
    title: string;
    subtitle: string;
    placeholder: string;
    buttonText: string;
  };
}

export default function SearchSection({ locale, labels, targetPath }: SearchSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamValue = searchParams.get('search') ?? '';
  const [value, setValue] = useState(searchParamValue);
  const [isPending, startTransition] = useTransition();

  // Sync state with search param changes (e.g. clearing filters)
  useEffect(() => {
    setValue(searchParamValue);
  }, [searchParamValue]);

  const tags = [
    {
      label:
        locale === 'vi' ? 'Màng co PE' : locale === 'ja' ? 'PE熱収縮フィルム' : 'PE Shrink Film',
      value: 'Màng co PE'
    },
    {
      label:
        locale === 'vi' ? 'Găng tay Nitrile' : locale === 'ja' ? 'ニトリル手袋' : 'Nitrile Gloves',
      value: 'Găng tay Nitrile'
    },
    {
      label:
        locale === 'vi'
          ? 'Thảm phòng sạch'
          : locale === 'ja'
            ? 'クリーンルームマット'
            : 'Cleanroom Sticky Mat',
      value: 'Thảm phòng sạch'
    },
    {
      label: locale === 'vi' ? 'Khăn lau' : locale === 'ja' ? '工業用ワイパー' : 'Wipes',
      value: 'Khăn lau'
    },
    { label: locale === 'vi' ? 'Túi PE' : locale === 'ja' ? 'PEバッグ' : 'PE Bag', value: 'Túi PE' }
  ];

  function handleSearch(searchQuery: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`${targetPath || pathname}?${params.toString()}`);
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSearch(value);
  }

  const activeSearch = searchParams.get('search') ?? '';

  return (
    <section className="w-full bg-background py-12 lg:py-16 border-b border-gray-100">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 text-center">
        {/* Header */}
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-blue-600">
          {labels.eyebrow}
        </p>
        <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          {labels.title}
        </h2>
        <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {labels.subtitle}
        </p>

        {/* Search Input bar */}
        <div className="mt-8 max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center bg-white rounded-full border border-gray-200 p-1.5 pl-4 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-[color,background-color,border-color,box-shadow,opacity,transform]"
          >
            <Search className="h-5 w-5 text-gray-400 shrink-0 mr-3" />
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={labels.placeholder}
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-gray-400 focus:outline-none py-2"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors shrink-0"
            >
              {labels.buttonText}
            </button>
          </form>
        </div>

        {/* Filter chips (Popular tags) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {tags.map((tag) => {
            const isActive = activeSearch.toLowerCase() === tag.value.toLowerCase();
            return (
              <button
                key={tag.value}
                onClick={() => {
                  if (isActive) {
                    setValue('');
                    handleSearch('');
                  } else {
                    setValue(tag.label);
                    handleSearch(tag.value);
                  }
                }}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-[color,background-color,border-color,box-shadow,opacity,transform] border ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-slate-600 hover:bg-slate-50 hover:border-gray-300'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
