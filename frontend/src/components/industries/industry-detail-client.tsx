'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ShieldCheck, Factory, Cpu, Activity, Sparkles, Utensils, ArrowRight, Car, Sun, Shield, Settings, Globe, CheckCircle2, Download, FileDown, Layers, Zap, Truck, AlertCircle, X, Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import ProductCard from '@/components/product/product-card';
import type { Product } from '@/lib/directus';

interface CategoryItem {
  name: string;
  image: string;
  slug?: string;
}

interface CaseStudyItem {
  title: string;
  description: string;
  image: string;
  badge: string;
}

interface ValueProp {
  title: string;
  desc: string;
  iconName: string;
}

interface ChallengeItem {
  title: string;
  desc?: string;
  iconName: string;
}

interface IndustryData {
  slug: string;
  name: string;
  title: string;
  description: string;
  iconName: string;
  gradient: string;
  bannerImage: string;
  valueProps: ValueProp[];
  challengesIntro: string;
  challenges: ChallengeItem[];
  cleanroomIntro: string;
  cleanroomCategories: CategoryItem[];
  cleanroomViewAll: string;
  packagingIntro: string;
  packagingCategories: CategoryItem[];
  packagingViewAll: string;
  casesTitle: string;
  cases: CaseStudyItem[];
  whyUsTitle: string;
  whyUsList: string[];
  standardsTitle: string;
  standards: Array<{ name: string; detail: string }>;
  resourcesTitle: string;
  catalogue: {
    title: string;
    info: string;
    url: string;
  };
}

interface IndustryDetailClientProps {
  industryData: IndustryData;
  products: Product[];
  locale: string;
  currentSlug: string;
  translations: {
    home: string;
    resources: string;
    overview: string;
    cleanroomSol: string;
    packagingSol: string;
    cases: string;
    recommendedProducts: string;
    resourceTab: string;
    seeAll: string;
    contactSupport: string;
    noProductDesc: string;
  };
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Cpu,
  Activity,
  Utensils,
  Car,
  Sun,
  Shield,
  Settings,
  Globe,
  Sparkles,
  Zap,
  Truck,
  ShieldCheck,
  Factory
};

export default function IndustryDetailClient({
  industryData,
  products,
  locale,
  currentSlug,
  translations
}: IndustryDetailClientProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Tabs definitions
  const tabs = [
    { id: 'overview', label: translations.overview },
    { id: 'cleanroom', label: translations.cleanroomSol },
    { id: 'packaging', label: translations.packagingSol },
    { id: 'cases', label: translations.cases },
    { id: 'products', label: translations.recommendedProducts },
    { id: 'resources', label: translations.resourceTab }
  ];

  // Set up Scrollspy using Intersection Observer
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);

    // Observer options
    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px -60% 0px', // Trigger when section occupies the upper-middle of viewport
      threshold: 0
    };

    // Callback to update active tab
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, observerOptions);

    // Observe each section
    tabs.forEach((tab) => {
      const el = document.getElementById(tab.id);
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [translations]);

  // Smooth scroll handler
  const handleTabClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 140; // accommodate sticky headers
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveTab(id);
    }
  };

  const certifications = [
    { name: 'ISO 9001', detail: locale === 'vi' ? 'Quản lý chất lượng' : locale === 'ja' ? '品質管理' : 'Quality Management', type: 'icon', iconName: 'X' },
    { name: 'ISO 14001', detail: locale === 'vi' ? 'Quản lý môi trường' : locale === 'ja' ? '環境管理' : 'Environmental Mgmt', type: 'icon', iconName: 'Activity' },
    { name: 'RoHS', detail: locale === 'vi' ? 'Hạn chế chất nguy hại' : locale === 'ja' ? '有害物質制限' : 'Restricted Substances', type: 'text' },
    { name: 'REACH', detail: locale === 'vi' ? 'Đánh giá hóa chất & an toàn' : locale === 'ja' ? '化学物質安全' : 'Chemical Safety', type: 'icon', iconName: 'Check' }
  ];

  const HeroIcon = iconMap[industryData.iconName] || Cpu;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      {/* Hero Banner Section */}
      <section className="w-full bg-white border-b border-slate-200/50 relative overflow-hidden min-h-[380px] md:min-h-[400px]">
        {/* Right Image Side (Absolute position relative to the outer full-width banner) */}
        <div className="hidden md:block absolute left-[50%] right-0 top-0 bottom-0 z-0">
          <Image
            src={industryData.bannerImage}
            alt={industryData.title}
            fill
            className="object-cover"
            priority
          />
          {/* White overlay gradient from left to right on top of the image to fade it into the white background */}
          <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        </div>

        {/* Inner Grid Alignment Wrapper */}
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-16 h-full flex flex-col md:flex-row items-stretch relative">
          {/* Left Content Side */}
          <div className="w-full md:w-[50%] lg:w-[45%] py-8 sm:py-10 lg:py-12 z-20 flex flex-col justify-between relative bg-white md:bg-transparent">
            {/* Breadcrumb Inside Hero Banner */}
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-6">
              <Link href="/" className="hover:text-slate-600 transition-colors">
                {translations.home}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/resources" className="hover:text-slate-600 transition-colors">
                {translations.resources}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#0F1E36] font-bold">{industryData.name}</span>
            </nav>

            {/* Title & Icon Header */}
            <div className="flex items-start gap-4 sm:gap-6 mb-8">
              {/* Icon Container */}
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center bg-white border border-slate-100 shadow-md">
                <HeroIcon className="h-8 w-8 sm:h-10 sm:w-10 text-[#1769E2]" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-[#0F1E36]">
                  {industryData.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed font-semibold">
                  {industryData.description}
                </p>
              </div>
            </div>

            {/* Value Propositions inside Hero Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {industryData.valueProps.map((prop, idx) => {
                const PropIcon = iconMap[prop.iconName] || ShieldCheck;
                return (
                  <div key={idx} className={`flex gap-3 items-start ${idx > 0 ? 'md:pl-6' : ''} ${idx > 0 ? 'pt-4 md:pt-0' : ''}`}>
                    <PropIcon className="h-6 w-6 text-[#1769E2] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-[#0F1E36] leading-snug">
                        {prop.title}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed font-semibold">
                        {prop.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Navigation Tabs */}
      <div className="sticky top-[72px] z-30 bg-white border-b border-slate-200/80 shadow-sm transition-all duration-300">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-16">
          <div className="flex overflow-x-auto no-scrollbar py-0.5 gap-8 scroll-smooth">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={(e) => handleTabClick(e, tab.id)}
                className={`py-4 text-xs sm:text-sm font-bold transition-all relative border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#1769E2] text-[#1769E2]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Content & Sidebar Grid */}
      <div className="mx-auto w-full px-4 py-8 sm:px-8 lg:px-16 grid gap-8 lg:grid-cols-3">
        {/* Main Content Column (Left - 2/3) - Single White Container */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 shadow-sm p-6 sm:p-8 lg:p-10 space-y-12">
          
          {/* Section: Overview / Thách thức */}
          <section id="overview" className="scroll-mt-36 space-y-6">
            <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
              {/* Left Content */}
              <div className="lg:w-[45%] space-y-3">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0F1E36]">
                  {industryData.challengesIntro ? industryData.challengesIntro : `Thách thức trong ngành ${industryData.name}`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
                  {industryData.challengesIntro ? (
                    locale === 'vi' 
                      ? 'Các linh kiện điện tử có kích thước nhỏ, độ nhạy cao với tĩnh điện, hạt bụi và độ ẩm. Bất kỳ sai sót nhỏ nào trong sản xuất hoặc đóng gói cũng có thể dẫn đến lỗi sản phẩm hoặc giảm độ tin cậy.'
                      : locale === 'ja'
                      ? '電子部品はサイズが小さく、静電気、塵埃、湿度に対して非常に敏感です。製造や包装プロセスにおけるわずかなミスでも、製品不良や信頼性の低下につながる可能性があります。'
                      : 'Electronic components are small in size and highly sensitive to static electricity, dust particles, and humidity. Any minor flaw in production or packaging can lead to product defects or reduced reliability.'
                  ) : industryData.description}
                </p>
              </div>

              {/* Right Challenges List */}
              <div className="lg:w-[50%] grid grid-cols-1 sm:grid-cols-3 gap-4">
                {industryData.challenges.map((ch, idx) => {
                  const ChIcon = iconMap[ch.iconName] || Zap;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-4 border border-slate-100 bg-[#F8FAFC]/55 hover:border-slate-200 hover:shadow-sm transition-all">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-blue-50 text-[#1769E2]">
                        <ChIcon className="h-5 w-5" />
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#0F1E36] leading-tight">
                        {ch.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Cleanroom & Packaging Grid side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
            {/* Section: Cleanroom Solutions */}
            <section id="cleanroom" className="scroll-mt-36 space-y-4">
              <div className="space-y-1">
                <span className="inline-block bg-[#E8F1FF] text-[#1769E2] text-[11px] font-extrabold px-3 py-1">
                  {translations.cleanroomSol}
                </span>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  {industryData.cleanroomIntro}
                </p>
              </div>

              {/* Category Cards Grid */}
              <div className="grid grid-cols-5 gap-2">
                {industryData.cleanroomCategories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={`/solutions?industry=${currentSlug}&category=${cat.slug || 'cleanroom-consumables'}`}
                    className="group flex flex-col items-center text-center"
                  >
                    <div className="relative aspect-square w-full bg-[#F8FAFC] overflow-hidden border border-slate-100 flex items-center justify-center p-1 group-hover:shadow-md transition-shadow">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold mt-2 text-center line-clamp-2 leading-tight min-h-[26px] flex items-center justify-center px-0.5">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href={`/solutions?industry=${currentSlug}&category=cleanroom-consumables`}
                  className="w-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-[11px] font-extrabold inline-flex items-center gap-1.5 text-slate-700 transition-colors justify-center"
                >
                  {industryData.cleanroomViewAll}
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              </div>
            </section>

            {/* Section: Packaging Solutions */}
            <section id="packaging" className="scroll-mt-36 space-y-4">
              <div className="space-y-1">
                <span className="inline-block bg-[#E8F1FF] text-[#1769E2] text-[11px] font-extrabold px-3 py-1">
                  {translations.packagingSol}
                </span>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  {industryData.packagingIntro}
                </p>
              </div>

              {/* Category Cards Grid */}
              <div className="grid grid-cols-4 gap-2">
                {industryData.packagingCategories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={`/solutions?industry=${currentSlug}&category=${cat.slug || 'industrial-packaging'}`}
                    className="group flex flex-col items-center text-center"
                  >
                    <div className="relative aspect-square w-full bg-[#F8FAFC] overflow-hidden border border-slate-100 flex items-center justify-center p-1 group-hover:shadow-md transition-shadow">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold mt-2 text-center line-clamp-2 leading-tight min-h-[26px] flex items-center justify-center px-0.5">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href={`/solutions?industry=${currentSlug}&category=industrial-packaging`}
                  className="w-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-[11px] font-extrabold inline-flex items-center gap-1.5 text-slate-700 transition-colors justify-center"
                >
                  {industryData.packagingViewAll}
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              </div>
            </section>
          </div>

          {/* Section: Case Studies */}
          <section id="cases" className="scroll-mt-36 pt-6 border-t border-slate-100 space-y-6">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#0F1E36]">
              {industryData.casesTitle}
            </h3>

            <div className="grid gap-6 sm:grid-cols-3">
              {industryData.cases.map((cs, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-transparent">
                  <div className="relative w-24 h-18 sm:w-28 sm:h-20 shrink-0 overflow-hidden bg-slate-50 border border-slate-100">
                    <Image
                      src={cs.image}
                      alt={cs.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#0F1E36] leading-snug">
                      {cs.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-semibold leading-relaxed">
                      {cs.description}
                    </p>
                    <div className="pt-1">
                      <Link
                        href="/about"
                        className="text-[10px] sm:text-xs font-bold text-[#1769E2] inline-flex items-center gap-1 hover:underline"
                      >
                        {locale === 'vi' ? 'Xem chi tiết' : locale === 'ja' ? '詳細を見る' : 'View details'}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Recommended Products */}
          <section id="products" className="scroll-mt-36 pt-6 border-t border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#0F1E36]">
                {translations.recommendedProducts}
              </h3>
              <Link
                href={`/solutions?industry=${currentSlug}`}
                className="text-xs font-bold text-[#1769E2] flex items-center gap-1 hover:underline"
              >
                {translations.seeAll}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} roundedClass="rounded-none" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-300 text-center bg-[#F8FAFC]/40 p-6">
                <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-500">{translations.noProductDesc}</p>
                <Link
                  href="/about"
                  className="mt-4 inline-flex h-9 items-center justify-center bg-[#0F1E36] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#1A2D49] transition-all"
                >
                  {translations.contactSupport}
                </Link>
              </div>
            )}
          </section>

          {/* Section: Related Resources (Tài nguyên tab target) */}
          <section id="resources" className="scroll-mt-36 pt-6 border-t border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-blue-50 text-[#1769E2]">
                <FileDown className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0F1E36]">
                  {translations.resourceTab}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {locale === 'vi'
                    ? 'Tài liệu hướng dẫn và tài nguyên chuyên ngành tải xuống.'
                    : locale === 'ja'
                    ? 'ダウンロード可能なガイドライン và 専門リソース。'
                    : 'Downloadable guidelines and professional resources.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between p-4 bg-[#F8FAFC]/65 border border-slate-200/50">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-rose-50 text-rose-600">
                  <FileDown className="h-5.5 w-5.5" />
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-[#0F1E36] leading-snug">
                    {industryData.catalogue.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold uppercase">
                    {industryData.catalogue.info}
                  </p>
                </div>
              </div>

              <Link
                href={industryData.catalogue.url}
                className="inline-flex h-9 items-center justify-center gap-1.5 bg-[#1769E2] hover:bg-[#1769E2]/90 px-4 text-xs font-extrabold text-white transition-all w-full sm:w-auto"
              >
                <Download className="h-3.5 w-3.5" />
                {locale === 'vi' ? 'Tải Catalogue' : locale === 'ja' ? 'カタログをダウンロード' : 'Download Catalogue'}
              </Link>
            </div>
          </section>

        </div>

        {/* Sidebar Column (Right - 1/3) */}
        <div className="space-y-6">
          <div className="sticky top-[152px] space-y-6">
            
            {/* Sidebar Card: Vì sao chọn ULINK */}
            <div className="bg-[#F8FAFC]/60 border border-slate-100 p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="text-base sm:text-lg font-extrabold text-[#0F1E36] border-b pb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#1769E2]" />
                {industryData.whyUsTitle}
              </h3>
              <ul className="space-y-3.5">
                {industryData.whyUsList.map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs sm:text-sm text-slate-600 font-medium">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sidebar Card: Chứng nhận & tiêu chuẩn */}
            <div className="bg-[#F8FAFC]/60 border border-slate-100 p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="text-base sm:text-lg font-extrabold text-[#0F1E36] border-b pb-3 flex items-center gap-2">
                <Factory className="h-5 w-5 text-emerald-600" />
                {industryData.standardsTitle}
              </h3>

              <div className="grid grid-cols-4 gap-1">
                {certifications.map((cert: any, idx: number) => {
                  const CertIcon = cert.type === 'icon' && cert.iconName ? iconMap[cert.iconName] : null;
                  return (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-[#1769E2] flex flex-col items-center justify-center text-[#1769E2] font-extrabold bg-white shadow-sm mb-2 select-none">
                        {cert.type === 'text' ? (
                          <span className="text-[9px] uppercase tracking-tighter">{cert.name}</span>
                        ) : CertIcon ? (
                          <CertIcon className="h-5 w-5 text-[#1769E2]" />
                        ) : null}
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-[#0F1E36] leading-tight block">
                        {cert.name}
                      </span>
                      <span className="text-[8px] text-slate-400 font-semibold leading-tight mt-0.5 block max-w-[64px] mx-auto">
                        {cert.detail}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Card: Tài liệu liên quan (Duplicate for high vis) */}
            <div className="bg-[#F8FAFC]/60 border border-slate-100 p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="text-base sm:text-lg font-extrabold text-[#0F1E36] border-b pb-3 flex items-center gap-2">
                <FileDown className="h-5 w-5 text-[#1769E2]" />
                {locale === 'vi' ? 'Tài liệu liên quan' : locale === 'ja' ? '関連資料' : 'Related Resources'}
              </h3>
              <a
                href={industryData.catalogue.url}
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 shadow-sm hover:border-[#1769E2] transition-colors"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-blue-50 text-[#1769E2]">
                  <Download className="h-5.5 w-5.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-[#0F1E36] leading-snug">
                    {industryData.catalogue.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {industryData.catalogue.info}
                  </p>
                </div>
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
