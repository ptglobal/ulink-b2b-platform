'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, FileText, X, ChevronDown, FileDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';

import { ResourceItem } from './types';
import {
  TABS,
  INDUSTRIES,
  TOPICS,
  CONTENT_TYPES,
  POPULAR_ARTICLES,
  MOCK_RESOURCES
} from './mock-data';
import { ResourceCard } from './resource-card';
import { ResourceDetail } from './resource-detail';

export function ResourcesClient() {
  const locale = useLocale() as 'vi' | 'en' | 'ja';
  
  // States
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [emailInput, setEmailInput] = useState('');

  // Toast error message state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-dismiss error message toast after 4 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleDownload = async (resource: ResourceItem) => {
    if (!resource.downloadUrl) return;
    
    try {
      const response = await fetch(resource.downloadUrl);
      
      if (!response.ok) {
        throw new Error(
          locale === 'vi' 
            ? `Không tìm thấy tài liệu hoặc máy chủ trả về mã lỗi: ${response.status}`
            : locale === 'ja'
            ? `ファイルが見つからないか、サーバーがエラーを返しました: ${response.status}`
            : `File not found or server returned code: ${response.status}`
        );
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      const filename = resource.downloadUrl.split('/').pop() || `${resource.id}.pdf`;
      tempLink.setAttribute('download', filename);
      document.body.appendChild(tempLink);
      tempLink.click();
      
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      console.error('Download failed:', error);
      
      const errorPrefix = locale === 'vi' 
        ? 'Tải tài liệu thất bại: ' 
        : locale === 'ja'
        ? 'ダウンロードに失敗しました: ' 
        : 'Failed to download document: ';

      setErrorMessage(`${errorPrefix}${error.message || 'Network error'}`);
    }
  };

  // Auto-fill selectedResource if matching URL query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const articleId = searchParams.get('id');
      if (articleId) {
        const found = MOCK_RESOURCES.find((item) => item.id === articleId);
        if (found) {
          setSelectedResource(found);
        }
      }
    }
  }, []);

  // Handle newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    alert(
      locale === 'vi'
        ? `Đăng ký thành công với email: ${emailInput}`
        : locale === 'ja'
        ? `登録が完了しました: ${emailInput}`
        : `Successfully subscribed with: ${emailInput}`
    );
    setEmailInput('');
  };

  // Date parser utility (DD/MM/YYYY)
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  // Filter & Search & Sort Logic
  const filteredResources = useMemo(() => {
    let result = [...MOCK_RESOURCES];

    // Filter by Tab
    if (activeTab !== 'all') {
      result = result.filter((item) => item.category === activeTab);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title[locale].toLowerCase().includes(query) ||
          item.description[locale].toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query)
      );
    }

    // Filter by Industry dropdown
    if (selectedIndustry !== 'all') {
      result = result.filter((item) => item.industryId === selectedIndustry);
    }

    // Filter by Topic dropdown
    if (selectedTopic !== 'all') {
      result = result.filter((item) => item.topicId === selectedTopic);
    }

    // Filter by Content Type dropdown
    if (selectedContentType !== 'all') {
      result = result.filter((item) => item.contentType === selectedContentType);
    }

    // Sorting logic
    result.sort((a, b) => {
      const timeA = parseDate(a.date);
      const timeB = parseDate(b.date);
      return sortBy === 'latest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [activeTab, searchQuery, selectedIndustry, selectedTopic, selectedContentType, sortBy, locale]);

  // Related articles (filtered to same category, max 2)
  const relatedArticles = useMemo(() => {
    if (!selectedResource) return [];
    return MOCK_RESOURCES.filter(
      (item) => item.id !== selectedResource.id && item.category === selectedResource.category
    ).slice(0, 2);
  }, [selectedResource]);

  // Labels based on locale
  const L = {
    home: { vi: 'Trang chủ', en: 'Home', ja: 'ホーム' },
    resources: { vi: 'Tài nguyên', en: 'Resources', ja: 'リソース' },
    bannerDesc: {
      vi: 'Kiến thức chuyên sâu, xu hướng ngành và hướng dẫn kỹ thuật giúp bạn đưa ra quyết định chính xác và tối ưu hiệu suất',
      en: 'In-depth knowledge, industry trends, and technical guides to help you make accurate decisions and optimize performance',
      ja: '正確な意思決定とパフォーマンスの最適化を支援する、詳細な知識、業界のトレンド、および技術ガイド'
    },
    searchPlaceholder: { vi: 'Tìm kiếm bài viết', en: 'Search articles', ja: '記事を検索' },
    industryPlaceholder: { vi: 'Chuyên ngành', en: 'Industry', ja: '専門分野' },
    topicPlaceholder: { vi: 'Chủ đề', en: 'Topic', ja: 'トピック' },
    contentTypePlaceholder: { vi: 'Loại nội dung', en: 'Content Type', ja: 'コンテンツタイプ' },
    sortLatest: { vi: 'Mới nhất', en: 'Latest', ja: '最新' },
    sortOldest: { vi: 'Cũ nhất', en: 'Oldest', ja: '最古' },
    readDetails: { vi: 'Đọc chi tiết →', en: 'Read details →', ja: '詳細を見る →' },
    popularTitle: { vi: 'Bài viết được quan tâm', en: 'Popular Articles', ja: '人気の記事' },
    newsletterTitle: { vi: 'Đăng ký nhận bản tin', en: 'Newsletter Signup', ja: 'メルマガ登録' },
    newsletterDesc: {
      vi: 'Nhận các bài viết mới nhất và tài liệu chuyên sâu về phòng sạch & đóng gói.',
      en: 'Receive the latest articles and in-depth materials on cleanrooms & packaging.',
      ja: 'クリーンルームと包装に関する最新の記事や詳細な資料を受け取ります。'
    },
    emailPlaceholder: { vi: 'Nhập email của bạn', en: 'Enter your email', ja: 'メールアドレスを入力' },
    subscribe: { vi: 'Đăng ký', en: 'Subscribe', ja: '登録' },
    noResults: { vi: 'Không tìm thấy tài liệu phù hợp', en: 'No matching articles found', ja: '該当する記事が見つかりません' },
    noResultsDesc: {
      vi: 'Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục tài liệu khác.',
      en: 'Try changing search keywords or selecting another category.',
      ja: '検索キーワードを変更するか、別のカテゴリを選択してください。'
    },
    backToList: { vi: 'Quay lại danh sách', en: 'Back to list', ja: '一覧に戻る' },
    tocTitle: { vi: 'Mục lục', en: 'Table of Contents', ja: '目次' },
    downloadPdf: { vi: 'Tải tài liệu (PDF)', en: 'Download PDF', ja: 'PDFをダウンロード' },
    aiSummaryTitle: { vi: 'AI tóm tắt nội dung', en: 'AI Summary', ja: 'AI要約' },
    readToMe: { vi: 'Đọc cho tôi nghe', en: 'Read to me', ja: '読み上げ' },
    summaryBtn: { vi: 'Tóm tắt', en: 'Summary', ja: '要約' },
    readArticleAudio: { vi: 'Đọc bài viết', en: 'Listen to article', ja: '記事を聞く' },
    relatedTitle: { vi: 'Bài viết liên quan', en: 'Related Articles', ja: '関連記事' },
    seeAll: { vi: 'Xem tất cả', en: 'See all', ja: 'すべて見る' },
    shareArticle: { vi: 'Chia sẻ bài viết', en: 'Share article', ja: '記事を共有' },
    modalShare: { vi: 'Chia sẻ', en: 'Share', ja: '共有' },
    modalPrint: { vi: 'In trang', en: 'Print', ja: '印刷' },
    modalClose: { vi: 'Đóng lại', en: 'Close', ja: '閉じる' },
    modalDownload: { vi: 'Tải về máy', en: 'Tải về máy', ja: 'ダウンロード', default: 'Download' }
  };

  const handleShare = (resource: ResourceItem) => {
    if (navigator.share) {
      navigator
        .share({
          title: resource.title[locale],
          text: resource.description[locale],
          url: window.location.href
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.href}?id=${resource.id}`);
      alert(
        locale === 'vi'
          ? 'Đã sao chép liên kết tài liệu vào bộ nhớ tạm!'
          : locale === 'ja'
          ? 'ドキュメントリンクをクリップボードにコピーしました！'
          : 'Document link copied to clipboard!'
      );
    }
  };

  return (
    <div className="w-full min-h-screen bg-white pb-20">
      <AnimatePresence mode="wait">
        {!selectedResource ? (
          /* ========================================================
             1. LIST VIEW
             ======================================================== */
          <motion.div
            key="list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Banner Section */}
            <div className="w-full bg-[#F8FAFC] border-b border-slate-100 mb-10 relative overflow-hidden rounded-none">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                
                {/* Left Text Column */}
                <div className="space-y-4 max-w-xl">
                  {/* Breadcrumbs */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Link href="/" className="hover:text-blue-600 transition-colors">
                      {L.home[locale]}
                    </Link>
                    <span>/</span>
                    <span className="text-slate-500 font-medium">{L.resources[locale]}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                    {L.resources[locale]}
                  </h1>
                  
                  {/* Subtitle */}
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    {L.bannerDesc[locale]}
                  </p>
                </div>

                {/* Right Image Column (Fading effect) */}
                <div className="relative h-[250px] md:h-[300px] w-full hidden lg:block overflow-hidden rounded-none">
                  <Image
                    src="/images/about/quality-hero-bg.png"
                    alt="ULink Cleanroom Production"
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Smooth white gradient mask fading from left to transparent right */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/70 to-transparent z-10 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
              
              {/* Navigation Tabs */}
              <div className="border-b border-slate-100 mb-8 overflow-x-auto scrollbar-none">
                <div className="flex space-x-8 min-w-max px-2">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSelectedIndustry('all');
                          setSelectedTopic('all');
                          setSelectedContentType('all');
                        }}
                        className={cn(
                          "flex items-center gap-2 pb-4 pt-2 text-sm font-semibold transition-all relative rounded-none border-b-2 -mb-[2px]",
                          isActive
                            ? "border-blue-600 text-blue-600 font-bold"
                            : "border-transparent text-slate-400 hover:text-slate-900"
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" />
                        <span>{tab.label[locale]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search and Dropdown Filter Row */}
              <div className="flex flex-wrap gap-4 items-center justify-between bg-[#F8FAFC]/50 p-4 border border-slate-100 mb-8 rounded-none">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={L.searchPlaceholder[locale]}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-none placeholder:text-slate-400 text-slate-800"
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

                {/* Filters dropdowns */}
                <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
                  {/* Chuyên ngành select */}
                  <div className="relative flex-1 sm:flex-initial min-w-[130px]">
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="w-full h-11 border border-slate-200 bg-white pl-3 pr-8 text-xs sm:text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-none appearance-none cursor-pointer"
                    >
                      <option value="all">{L.industryPlaceholder[locale]}</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.name[locale]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Chủ đề select */}
                  <div className="relative flex-1 sm:flex-initial min-w-[130px]">
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full h-11 border border-slate-200 bg-white pl-3 pr-8 text-xs sm:text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-none appearance-none cursor-pointer"
                    >
                      <option value="all">{L.topicPlaceholder[locale]}</option>
                      {TOPICS.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name[locale]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Loại nội dung select */}
                  <div className="relative flex-1 sm:flex-initial min-w-[130px]">
                    <select
                      value={selectedContentType}
                      onChange={(e) => setSelectedContentType(e.target.value)}
                      className="w-full h-11 border border-slate-200 bg-white pl-3 pr-8 text-xs sm:text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-none appearance-none cursor-pointer"
                    >
                      <option value="all">{L.contentTypePlaceholder[locale]}</option>
                      {CONTENT_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name[locale]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Sort order select */}
                  <div className="relative flex-1 sm:flex-initial min-w-[130px]">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full h-11 border border-slate-200 bg-white pl-3 pr-8 text-xs sm:text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-none appearance-none cursor-pointer"
                    >
                      <option value="latest">{L.sortLatest[locale]}</option>
                      <option value="oldest">{L.sortOldest[locale]}</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Two-Column Layout (Left Grid / Right Sidebar) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Grid */}
                <div className="lg:col-span-9">
                  <AnimatePresence mode="popLayout">
                    {filteredResources.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 p-6 bg-[#F8FAFC] rounded-none"
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
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
                      >
                        {filteredResources.map((resource) => (
                          <ResourceCard
                            key={resource.id}
                            resource={resource}
                            locale={locale}
                            onClick={() => setSelectedResource(resource)}
                            readDetailsLabel={L.readDetails[locale]}
                            onDownload={handleDownload}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:col-span-3 space-y-8">
                  <div className="border border-slate-100 bg-white p-5 rounded-none">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4">
                      {L.popularTitle[locale]}
                    </h3>
                    <div className="space-y-4">
                      {POPULAR_ARTICLES.map((art) => (
                        <div key={art.id} className="flex gap-4 items-start pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                          <span className="text-xl font-bold text-blue-500/80 leading-none w-6 shrink-0 font-mono">
                            {art.number}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 hover:text-blue-600 line-clamp-2 transition-colors cursor-pointer leading-snug">
                            {art.title[locale]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-100 bg-white p-5 rounded-none">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 mb-3">
                      {L.newsletterTitle[locale]}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {L.newsletterDesc[locale]}
                    </p>
                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <input
                        type="email"
                        required
                        placeholder={L.emailPlaceholder[locale]}
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full h-10 border border-slate-200 px-3 py-2 text-xs rounded-none focus:border-blue-500 outline-none text-slate-800"
                      />
                      <button
                        type="submit"
                        className="w-full h-10 bg-[#0F1E36] hover:bg-[#1769E2] text-white text-xs font-bold uppercase tracking-wider transition-colors duration-300 rounded-none"
                      >
                        {L.subscribe[locale]}
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        ) : (
          /* ========================================================
             2. ARTICLE DETAIL VIEW
             ======================================================== */
          <ResourceDetail
            resource={selectedResource}
            locale={locale}
            onBack={() => setSelectedResource(null)}
            relatedArticles={relatedArticles}
            onSelectRelated={(item) => setSelectedResource(item)}
            labels={L}
            handleShare={handleShare}
            onDownload={handleDownload}
          />
        )}
      </AnimatePresence>

      {/* Toast Error Notification */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-red-600 text-white px-4 py-3 shadow-2xl border-l-4 border-red-800 rounded-none max-w-md"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 text-white" />
            <div className="flex-1 text-xs font-semibold">
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-red-700 transition-colors rounded-none"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
