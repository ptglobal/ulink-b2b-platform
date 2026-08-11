'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Calendar, FileText, MapPin, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

import { ResourceItem } from './types';
import { MOST_VIEWED_ARTICLES, TABS, UPCOMING_EVENTS, MOCK_RESOURCES } from './mock-data';
import { getResourceHref } from './resource-utils';

export function ResourcesClient({
  initialResources = []
}: {
  initialResources?: ResourceItem[];
  directusUrl?: string;
} = {}) {
  const locale = useLocale() as 'vi' | 'en' | 'ja';

  const allAvailableResources = useMemo(() => {
    const combined = [...initialResources];

    MOCK_RESOURCES.forEach((mock) => {
      if (!combined.some((item) => item.id === mock.id)) {
        combined.push(mock);
      }
    });

    return combined;
  }, [initialResources]);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  const filteredResources = useMemo(() => {
    let result = [...allAvailableResources];

    if (activeTab !== 'all') {
      result = result.filter((item) => item.category === activeTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.title[locale].toLowerCase().includes(query) ||
        item.description[locale].toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    return result;
  }, [activeTab, searchQuery, allAvailableResources, locale]);

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResources.slice(start, start + itemsPerPage);
  }, [filteredResources, currentPage]);

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'guide':
        return 'bg-blue-500/10 text-blue-600 border border-blue-200';
      case 'standard':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-200';
      case 'case-study':
        return 'bg-purple-500/10 text-purple-600 border border-purple-200';
      case 'news':
        return 'bg-rose-500/10 text-rose-600 border border-rose-200';
      case 'event':
        return 'bg-slate-900/10 text-slate-800 border border-slate-300';
      default:
        return 'bg-slate-500/10 text-slate-600 border border-slate-200';
    }
  };

  const L = {
    resources: { vi: 'Tài nguyên', en: 'Resources', ja: 'リソース' },
    bannerDesc: {
      vi: 'Cẩm nang kỹ thuật, cẩm nang ngành, hướng dẫn sử dụng, chứng chỉ tiêu chuẩn chất lượng.',
      en: 'Technical manuals, industry guides, usage instructions, quality standards and certificates.',
      ja: '技術マニュアル、業界ガイド、使用ガイド、品質基準と証明書。'
    },
    searchPlaceholder: { vi: 'Tìm kiếm tài liệu...', en: 'Search documents...', ja: '資料を検索...' },
    readDetails: { vi: 'Đọc chi tiết →', en: 'Read details →', ja: '詳細を見る →' },
    popularTitle: { vi: 'Bài viết được quan tâm', en: 'Popular Articles', ja: '人気の記事' },
    noResults: { vi: 'Không tìm thấy tài liệu phù hợp', en: 'No matching articles found', ja: '該当する記事が見つかりません' },
    noResultsDesc: {
      vi: 'Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục tài liệu khác.',
      en: 'Try changing search keywords or selecting another category.',
      ja: '検索キーワードを変えるか、別のカテゴリを選んでください。'
    },
    mostViewed: { vi: 'Bài viết được xem nhiều', en: 'Most Viewed Articles', ja: 'よく読まれている記事' },
    upcomingEvents: { vi: 'Sự kiện sắp diễn ra', en: 'Upcoming Events', ja: '近日開催予定のイベント' },
    registerEvent: { vi: 'Đăng ký tham gia', en: 'Register', ja: '参加登録' },
    prev: { vi: 'Trước', en: 'Prev', ja: '前へ' },
    next: { vi: 'Sau', en: 'Next', ja: '次へ' },
    seeAll: { vi: 'Xem tất cả', en: 'See all', ja: 'すべて見る' }
  };

  return (
    <div className="w-full min-h-screen bg-white pb-20">
      <div className="relative w-full h-[280px] sm:h-[350px] md:h-[400px] mb-8 overflow-hidden">
        <Image
          src="/images/about/quality-hero-bg.webp"
          alt="ULink Factory Plant"
          fill
          priority
          className="object-cover brightness-[0.45]"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 lg:px-16 text-left text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              {L.resources[locale]}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-xl font-normal">
              {L.bannerDesc[locale]}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer',
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  )}
                >
                  {tab.label[locale]}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={L.searchPlaceholder[locale]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-10 border border-slate-200 bg-white text-xs sm:text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-lg placeholder:text-slate-400 text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredResources.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 p-6 bg-[#F8FAFC] rounded-xl"
            >
              <FileText className="h-12 w-12 text-slate-400 mb-4 animate-pulse" />
              <h3 className="text-base font-bold text-slate-800">{L.noResults[locale]}</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">
                {L.noResultsDesc[locale]}
              </p>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {paginatedResources.map((resource) => (
                <Link
                  key={resource.id}
                  href={getResourceHref(resource)}
                  className="flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="relative aspect-[16/10] w-full bg-slate-50 overflow-hidden">
                    <Image
                      src={resource.image}
                      alt={resource.title[locale]}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div className={cn(
                      'absolute top-3 left-3 z-10 text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-md shadow-sm',
                      getBadgeColor(resource.category)
                    )}>
                      {resource.badge[locale]}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">{resource.date}</span>
                      <h3 className="mt-2 text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {resource.title[locale]}
                      </h3>
                      <p className="mt-2.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {resource.description[locale]}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">{resource.readTime[locale]}</span>
                      <span className="bg-[#1769E2] text-white text-xs font-bold px-4.5 py-2 rounded-lg">
                        {L.readDetails[locale]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {L.prev[locale]}
            </button>
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={cn(
                  'h-9 w-9 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                  currentPage === index + 1
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                )}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {L.next[locale]}
            </button>
          </div>
        )}

        <div className="mt-20 pt-16 border-t border-slate-100">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{L.mostViewed[locale]}</h2>
            <button
              onClick={() => setActiveTab('all')}
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {L.seeAll[locale]}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOST_VIEWED_ARTICLES.map((art) => (
              <Link
                key={art.id}
                href={getResourceHref(art)}
                className="flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="relative aspect-[16/10] w-full bg-slate-50 overflow-hidden">
                  <Image
                    src={art.image}
                    alt={art.title[locale]}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className={cn(
                    'absolute top-2.5 left-2.5 z-10 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded shadow-sm',
                    getBadgeColor(art.category)
                  )}>
                    {art.badge[locale]}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400">{art.date}</span>
                    <h3 className="mt-1 text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {art.title[locale]}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-blue-600 font-semibold group-hover:underline">
                    <span>{L.readDetails[locale]}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-20 pt-16 border-t border-slate-100">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{L.upcomingEvents[locale]}</h2>
            <Link
              href="/contact"
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
            >
              {L.seeAll[locale]}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {UPCOMING_EVENTS.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full bg-slate-50 overflow-hidden">
                    <Image
                      src={event.image}
                      alt={event.title[locale]}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-101 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {event.title[locale]}
                    </h3>
                    <div className="mt-4 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="font-semibold">{event.time} | {event.date}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span className="leading-normal">{event.location[locale]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2">
                  <Link
                    href={event.link}
                    className="w-full inline-flex justify-center items-center gap-1.5 bg-[#1769E2] hover:bg-[#1257bd] text-white font-bold text-xs py-2.5 rounded-lg transition-colors shadow-sm"
                  >
                    {L.registerEvent[locale]}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
