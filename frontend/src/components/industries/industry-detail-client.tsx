'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, AlertCircle, FileDown, Download } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import ProductCard from '@/components/product/product-card';

import { IndustryDetailClientProps } from './types';
import { IndustryHero } from './industry-hero';
import { IndustryChallenges } from './industry-challenges';
import { IndustrySolutions } from './industry-solutions';
import { IndustryCases } from './industry-cases';
import { IndustrySidebar } from './industry-sidebar';

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      
      {/* 1. Hero Banner Section */}
      <IndustryHero
        industryData={industryData}
        locale={locale}
        translations={translations}
      />

      {/* 2. Sticky Navigation Tabs */}
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

      {/* 3. Layout Content & Sidebar Grid */}
      <div className="mx-auto w-full px-4 py-8 sm:px-8 lg:px-16 grid gap-8 lg:grid-cols-3">
        
        {/* Main Content Column (Left - 2/3) - Single White Container */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 shadow-sm p-6 sm:p-8 lg:p-10 space-y-12">
          
          {/* Section: Overview / Thách thức */}
          <IndustryChallenges
            industryData={industryData}
            locale={locale}
          />

          {/* Cleanroom & Packaging Grid side-by-side */}
          <IndustrySolutions
            industryData={industryData}
            translations={translations}
            currentSlug={currentSlug}
          />

          {/* Section: Case Studies */}
          <IndustryCases
            industryData={industryData}
            locale={locale}
          />

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
        <IndustrySidebar
          industryData={industryData}
          locale={locale}
        />

      </div>
    </div>
  );
}
