'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FileText, Search, X } from '@/components/icons';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

import { ResourceItem } from './types';
import { TABS } from './mock-data';
import { getResourceHref } from './resource-utils';

export function ResourcesClient({
  initialResources = []
}: {
  initialResources?: ResourceItem[];
  directusUrl?: string;
} = {}) {
  const locale = useLocale() as 'vi' | 'en' | 'ja';

  const allAvailableResources = useMemo(() => [...initialResources], [initialResources]);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const parseDate = (dateStr: string) => {
    const numeric = dateStr.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
    if (numeric) return new Date(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1])).getTime();
    const year = dateStr.match(/20\d{2}/)?.[0];
    return year ? new Date(Number(year), 0, 1).getTime() : 0;
  };

  const filteredResources = useMemo(() => {
    let result = [...allAvailableResources];

    if (activeTab !== 'all') {
      result = result.filter((item) => item.category === activeTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
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
  const featuredNews = useMemo(
    () =>
      allAvailableResources
        .filter(
          (item): item is ResourceItem & { image: string } =>
            item.category === 'news' && typeof item.image === 'string' && item.image.length > 0
        )
        .sort((a, b) => parseDate(b.date) - parseDate(a.date))
        .slice(0, 3),
    [allAvailableResources]
  );
  const popularResources = useMemo(
    () =>
      allAvailableResources
        .filter((item) => item.category !== 'event' && Boolean(item.image))
        .slice(0, 4),
    [allAvailableResources]
  );
  const upcomingEvents = useMemo(
    () => allAvailableResources.filter((item) => item.category === 'event').slice(0, 3),
    [allAvailableResources]
  );

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
    resources: {
      vi: 'Tài nguyên & Thông tin',
      en: 'Resources & Insights',
      ja: 'リソース＆インサイト'
    },
    latestNews: { vi: 'Tin tức mới nhất', en: 'Latest news', ja: '最新ニュース' },
    bannerDesc: {
      vi: 'Cẩm nang kỹ thuật, cẩm nang ngành, hướng dẫn sử dụng, chứng chỉ tiêu chuẩn chất lượng.',
      en: 'Technical manuals, industry guides, usage instructions, quality standards and certificates.',
      ja: '技術マニュアル、業界ガイド、使用ガイド、品質基準と証明書。'
    },
    searchPlaceholder: {
      vi: 'Tìm kiếm tài liệu...',
      en: 'Search documents...',
      ja: '資料を検索...'
    },
    readDetails: { vi: 'Đọc chi tiết', en: 'Read details', ja: '詳細を見る' },
    popularTitle: { vi: 'Bài viết được quan tâm', en: 'Popular Articles', ja: '人気の記事' },
    noResults: {
      vi: 'Không tìm thấy tài liệu phù hợp',
      en: 'No matching articles found',
      ja: '該当する記事が見つかりません'
    },
    noResultsDesc: {
      vi: 'Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục tài liệu khác.',
      en: 'Try changing search keywords or selecting another category.',
      ja: '検索キーワードを変えるか、別のカテゴリを選んでください。'
    },
    mostViewed: {
      vi: 'Bài viết được xem nhiều',
      en: 'Most Viewed Articles',
      ja: 'よく読まれている記事'
    },
    upcomingEvents: {
      vi: 'Sự kiện sắp diễn ra',
      en: 'Upcoming Events',
      ja: '近日開催予定のイベント'
    },
    registerEvent: { vi: 'Đăng ký tham gia', en: 'Register', ja: '参加登録' },
    viewDetails: { vi: 'Xem chi tiết', en: 'View details', ja: '詳細を見る' },
    prev: { vi: 'Trước', en: 'Prev', ja: '前へ' },
    next: { vi: 'Sau', en: 'Next', ja: '次へ' },
    seeAll: { vi: 'Xem tất cả', en: 'See all', ja: 'すべて見る' }
  };

  return (
    <div className="min-h-screen w-full bg-background pb-20">
      <div className="border-b border-border bg-[#f5f8fc]">
        <div className="ulink-container grid min-h-[19rem] items-center py-12 md:grid-cols-8 lg:grid-cols-[repeat(16,minmax(0,1fr))] lg:gap-x-8 lg:py-16">
          <div className="col-span-5 flex gap-4 lg:col-span-10">
            <span className="mt-2 flex flex-col gap-1.5" aria-hidden="true">
              <i className="h-2 w-2 rounded-full bg-brand" />
              <i className="h-2 w-2 rounded-full bg-brand/55" />
              <i className="h-2 w-2 rounded-full bg-brand/25" />
            </span>
            <div>
              <p className="mb-5 text-sm font-semibold text-brand">ULink knowledge center</p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-[-0.03em] sm:text-5xl">
                {L.resources[locale]}
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                {L.bannerDesc[locale]}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="ulink-container pt-12 lg:pt-16">
        {false && featuredNews.length > 0 && (
          <section className="mb-14 lg:mb-16">
            <div className="mb-7 flex items-end justify-between gap-6 border-b border-border pb-5">
              <h2 className="text-2xl font-extrabold tracking-[-0.025em] text-foreground sm:text-3xl">
                {L.latestNews[locale]}
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('news')}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand hover:text-brand-strong"
              >
                {L.seeAll[locale]}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="grid border-l border-t border-border md:grid-cols-3">
              {featuredNews.map((resource) => (
                <Link
                  key={resource.id}
                  href={getResourceHref(resource)}
                  className="ulink-media-zoom group flex min-h-[390px] flex-col border-b border-r border-border bg-white sm:min-h-[410px]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <Image
                      src={resource.image}
                      alt={resource.title[locale]}
                      fill
                      sizes="(max-width: 767px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="font-mono text-[11px] text-brand">{resource.date}</span>
                    <h3 className="mt-3 text-lg font-bold leading-6 text-foreground group-hover:text-brand">
                      {resource.title[locale]}
                    </h3>
                    <span className="mt-auto flex items-center justify-between border-t border-border pt-5 text-sm font-semibold text-brand">
                      {L.readDetails[locale]}
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border lg:flex-row lg:items-end">
          <div className="flex w-full snap-x snap-mandatory items-center overflow-x-auto overscroll-x-contain scrollbar-none lg:w-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'h-12 snap-start whitespace-nowrap border-l-2 px-4 text-xs font-medium transition-colors sm:text-sm',
                    isActive
                      ? 'border-brand bg-muted text-foreground'
                      : 'border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {tab.label[locale]}
                </button>
              );
            })}
          </div>

          <div className="relative mb-3 w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={L.searchPlaceholder[locale]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full border border-border bg-white pl-10 pr-10 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Xóa tìm kiếm"
                onClick={() => setSearchQuery('')}
                className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-slate-400 hover:bg-muted hover:text-slate-600"
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
              className="flex flex-col items-center justify-center border border-dashed border-border bg-card p-12 py-20 text-center"
            >
              <FileText className="h-12 w-12 text-slate-400 mb-4 animate-pulse" />
              <h3 className="text-base font-bold text-slate-800">{L.noResults[locale]}</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">
                {L.noResultsDesc[locale]}
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {paginatedResources.map((resource) => (
                <Link
                  key={resource.id}
                  href={getResourceHref(resource)}
                  className="group flex flex-col overflow-hidden border-t border-border bg-card transition-colors hover:bg-muted"
                >
                  <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-brand/[0.06]">
                    {resource.image ? (
                      <Image
                        src={resource.image}
                        alt={resource.title[locale]}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-brand">
                        <FileText size={48} aria-hidden="true" />
                        <span className="font-mono text-xs">{resource.id}</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        'absolute left-3 top-3 z-10 px-2.5 py-1 text-[10px] font-medium',
                        getBadgeColor(resource.category)
                      )}
                    >
                      {resource.badge[locale]}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {resource.date}
                      </span>
                      <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-brand sm:text-base">
                        {resource.title[locale]}
                      </h3>
                      <p className="mt-2.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {resource.description[locale]}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {resource.readTime[locale]}
                      </span>
                      <span className="flex items-center gap-2 text-xs font-medium text-brand">
                        {L.readDetails[locale]}
                        <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {totalPages > 1 && (
          <nav
            aria-label="Phân trang tài nguyên"
            className="mt-10 flex items-center justify-center gap-1.5 sm:mt-12 sm:gap-2"
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="ulink-pressable h-11 border border-border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50 sm:px-4"
            >
              {L.prev[locale]}
            </button>
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={cn(
                  'ulink-pressable h-11 w-11 text-xs font-medium transition-colors',
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
              className="ulink-pressable h-11 border border-border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50 sm:px-4"
            >
              {L.next[locale]}
            </button>
          </nav>
        )}

        {popularResources.length > 0 && (
          <section className="mt-16 border-t border-border pt-12 lg:mt-20 lg:pt-16">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-brand">ULINK INSIGHTS</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.025em] text-foreground sm:text-3xl">{L.mostViewed[locale]}</h2>
              </div>
            </div>
            <div className="grid border-l border-t border-border md:grid-cols-2 lg:grid-cols-4">
              {popularResources.map((resource, index) => (
                <Link key={resource.id} href={getResourceHref(resource)} className="group flex min-h-52 flex-col border-b border-r border-border bg-white p-6 hover:bg-muted">
                  <span className="font-mono text-xs text-brand">0{index + 1}</span>
                  <h3 className="mt-7 text-base font-bold leading-6 text-foreground group-hover:text-brand">{resource.title[locale]}</h3>
                  <span className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold text-brand">{L.viewDetails[locale]}<ArrowRight className="h-4 w-4" /></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {upcomingEvents.length > 0 && (
          <section className="mt-16 border-t border-border pt-12 lg:mt-20 lg:pt-16">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-brand">ULINK EVENTS</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.025em] text-foreground sm:text-3xl">{L.upcomingEvents[locale]}</h2>
              </div>
              <Link href="/events" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand">
                {L.seeAll[locale]}<ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={getResourceHref(event)} className="ulink-media-zoom group flex flex-col bg-white">
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {event.image ? <Image src={event.image} alt={event.title[locale]} fill sizes="(max-width: 1023px) 100vw, 33vw" className="object-cover" /> : null}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="font-mono text-xs text-brand">{event.date}</span>
                    <h3 className="mt-4 text-lg font-bold leading-6 text-foreground group-hover:text-brand">{event.title[locale]}</h3>
                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand">{L.registerEvent[locale]}<ArrowRight className="h-4 w-4" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
