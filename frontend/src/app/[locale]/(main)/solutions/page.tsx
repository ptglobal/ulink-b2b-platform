import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import SearchSection from '@/components/solutions/search-section';
import CatalogShowcase from '@/components/solutions/catalog-showcase';
import FeaturedProduct from '@/components/solutions/featured-product';
import HubAndPartner from '@/components/solutions/hub-and-partner';
import TestimonialsCapabilities from '@/components/solutions/testimonials-capabilities';

export const dynamic = 'force-dynamic';

interface SolutionsPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: SolutionsPageProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });
  return { title: t('title') };
}

export default async function SolutionsPage({ params: { locale } }: SolutionsPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'solutions' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-slate-950 py-6 sm:py-10">
        {/* Background Image */}
        <Image
          src="/images/solutions/solution.png"
          alt="Cleanroom Solutions"
          fill
          priority
          className="object-cover object-center pointer-events-none"
        />
        {/* Dark overlay to ensure text contrast */}
        <div className="absolute inset-0 bg-slate-950/65 z-0" />
        
        <div className="relative container mx-auto px-4 z-10 py-10 lg:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-blue-200/80 mb-6">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              {t('breadcrumbHome')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-blue-200/40" />
            <span className="text-white font-medium">{t('breadcrumbSolutions')}</span>
          </nav>

          {/* Text and Button block */}
          <div className="max-w-2xl mt-4">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white leading-tight tracking-tight whitespace-pre-line">
              {t('heroTitle')}
            </h1>
            <p className="mt-5 text-blue-100/90 text-sm lg:text-base leading-relaxed max-w-xl">
              {t('heroSubtitle')}
            </p>
            
            {/* Button: Báo giá nhanh */}
            <div className="mt-8">
              <Link
                href="/quick-order"
                className="inline-flex items-center gap-2 rounded-md bg-white text-blue-600 px-6 py-3 text-[14px] font-bold shadow-md hover:bg-slate-50 transition-colors"
              >
                {t('heroCta')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <SearchSection
        locale={locale}
        labels={{
          eyebrow: t('searchSection.eyebrow'),
          title: t('searchSection.title'),
          subtitle: t('searchSection.subtitle'),
          placeholder: t('searchSection.placeholder'),
          buttonText: t('searchSection.buttonText'),
        }}
      />

      {/* === SECTION: Production SKU & Materials === */}
      <section className="w-full bg-white border-t border-gray-150 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
          {/* Section Header */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 bg-blue-600 rounded-full" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {t('skuSection.eyebrow')}
              </span>
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {t('skuSection.title')}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-3xl leading-relaxed">
              {t('skuSection.subtitle')}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Băng Keo Công Nghiệp */}
            <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-[240px] relative overflow-hidden bg-gray-50">
                <Image
                  src="/images/home/section2/product-hvac-tape.webp"
                  alt={t('skuSection.card1Title')}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-900">
                  {t('skuSection.card1Title')}
                </h3>
                
                {/* List items */}
                <ul className="mt-6 space-y-3 flex-1">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {t('skuSection.card1Item1')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {t('skuSection.card1Item2')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {t('skuSection.card1Item3')}
                  </li>
                </ul>

                {/* Blue Button */}
                <div className="mt-8">
                  <Link
                    href={`/${locale}/solutions?category=cleanroom-consumables`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  >
                    {t('skuSection.cta')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: Vật Tư Phòng Sạch */}
            <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-[240px] relative overflow-hidden bg-gray-50">
                <Image
                  src="/images/about/quality-lab.webp"
                  alt={t('skuSection.card2Title')}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-900">
                  {t('skuSection.card2Title')}
                </h3>
                
                {/* List items */}
                <ul className="mt-6 space-y-3 flex-1">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {t('skuSection.card2Item1')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {t('skuSection.card2Item2')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {t('skuSection.card2Item3')}
                  </li>
                </ul>

                {/* Gray Button */}
                <div className="mt-8">
                  <Link
                    href={`/${locale}/solutions?category=cleanroom-consumables`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    {t('skuSection.cta')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3: Bao Bì & Đóng Gói */}
            <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-[240px] relative overflow-hidden bg-gray-50">
                <Image
                  src="/images/home/section2/product-custom-pkg.webp"
                  alt={t('skuSection.card3Title')}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-900">
                  {t('skuSection.card3Title')}
                </h3>
                
                {/* List items */}
                <ul className="mt-6 space-y-3 flex-1">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {t('skuSection.card3Item1')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {t('skuSection.card3Item2')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {t('skuSection.card3Item3')}
                  </li>
                </ul>

                {/* Gray Button */}
                <div className="mt-8">
                  <Link
                    href={`/${locale}/solutions?category=industrial-packaging`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    {t('skuSection.cta')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === SECTION: Product Catalog Showcase === */}
      <CatalogShowcase locale={locale} />

      {/* === SECTION: Featured Stretch Wrap Product === */}
      <FeaturedProduct locale={locale} />

      {/* === SECTION: Hub & Partner === */}
      <HubAndPartner locale={locale} />

      {/* === SECTION: Testimonials & Core Capabilities === */}
      <TestimonialsCapabilities locale={locale} />
    </div>
  );
}
