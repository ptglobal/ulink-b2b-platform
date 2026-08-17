import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ChevronRight, ArrowRight } from '@/components/icons';
import Link from 'next/link';
import { BrandedMedia } from '@/components/media/branded-media';
import SearchSection from '@/components/solutions/search-section';
import CatalogShowcase from '@/components/solutions/catalog-showcase';
import FeaturedProduct from '@/components/solutions/featured-product';
import HubAndPartner from '@/components/solutions/hub-and-partner';
import TestimonialsCapabilities from '@/components/solutions/testimonials-capabilities';
import { ASSETS } from '@/lib/assets';
import { getPagePresentation } from '@/lib/page-presentation';

export const dynamic = 'force-dynamic';

interface SolutionsPageProps {
  params: { locale: string };
}

type CopySection = Record<string, string>;

function getCopySection(
  copy: Record<string, string | Record<string, string>> | undefined,
  key: string
): CopySection | undefined {
  const value = copy?.[key];
  return value && typeof value === 'object' ? value : undefined;
}

function copyValue(section: CopySection | undefined, key: string, fallback: string) {
  return section?.[key] || fallback;
}

export async function generateMetadata({ params: { locale } }: SolutionsPageProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });
  return { title: t('title') };
}

export default async function SolutionsPage({ params: { locale } }: SolutionsPageProps) {
  setRequestLocale(locale);
  const [t, presentation] = await Promise.all([
    getTranslations({ locale, namespace: 'solutions' }),
    getPagePresentation('solutions', locale)
  ]);
  const copy = presentation?.copy;
  const skuCopy = getCopySection(copy, 'skuSection');
  const searchCopy = getCopySection(copy, 'searchSection');
  const customCopy = getCopySection(copy, 'customSolution');
  const heroTitle = typeof copy?.heroTitle === 'string' ? copy.heroTitle : t('heroTitle');
  const heroSubtitle = typeof copy?.heroSubtitle === 'string' ? copy.heroSubtitle : t('heroSubtitle');
  const heroCta = typeof copy?.heroCta === 'string' ? copy.heroCta : t('heroCta');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-slate-950 py-6 sm:py-10">
        {/* Background Image */}
        <BrandedMedia
          src={presentation?.heroMedia?.path || ASSETS.brand.materialApplications}
          alt={presentation?.heroMedia?.alt || 'Hệ vật tư phòng sạch, ESD và bao bì công nghiệp được kiểm tra theo ứng dụng'}
          priority
          sizes="100vw"
          className="pointer-events-none absolute inset-0"
          imageClassName="object-center"
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
              {heroTitle}
            </h1>
            <p className="mt-5 text-blue-100/90 text-sm lg:text-base leading-relaxed max-w-xl">
              {heroSubtitle}
            </p>

            {/* Button: Báo giá nhanh */}
            <div className="mt-8">
              <Link
                href={`/${locale}/quick-order`}
                className="inline-flex items-center gap-2 rounded-md bg-white text-blue-600 px-6 py-3 text-[14px] font-bold shadow-md hover:bg-slate-50 transition-colors"
              >
                {heroCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === SECTION: Production SKU & Materials === */}
      <section className="w-full bg-white border-t border-gray-150 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
          {/* Section Header */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 bg-blue-600 rounded-full" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {copyValue(skuCopy, 'eyebrow', t('skuSection.eyebrow'))}
              </span>
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {copyValue(skuCopy, 'title', t('skuSection.title'))}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-3xl leading-relaxed">
              {copyValue(skuCopy, 'subtitle', t('skuSection.subtitle'))}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Băng Keo Công Nghiệp */}
            <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-[240px] relative overflow-hidden bg-gray-50">
                <BrandedMedia
                  src="/images/home/section2/product-hvac-tape.webp"
                  alt={copyValue(skuCopy, 'card1Title', t('skuSection.card1Title'))}
                  className="absolute inset-0"
                  sizes="(max-width: 767px) 100vw, 33vw"
                  compactBrand
                />
              </div>
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-900">{copyValue(skuCopy, 'card1Title', t('skuSection.card1Title'))}</h3>

                {/* List items */}
                <ul className="mt-6 space-y-3 flex-1">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {copyValue(skuCopy, 'card1Item1', t('skuSection.card1Item1'))}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {copyValue(skuCopy, 'card1Item2', t('skuSection.card1Item2'))}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {copyValue(skuCopy, 'card1Item3', t('skuSection.card1Item3'))}
                  </li>
                </ul>

                {/* Blue Button */}
                <div className="mt-8">
                  <Link
                    href={`/${locale}/products/categories/cleanroom-wipers`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  >
                    {copyValue(skuCopy, 'cta', t('skuSection.cta'))}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: Vật Tư Phòng Sạch */}
            <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-[240px] relative overflow-hidden bg-gray-50">
                <BrandedMedia
                  src="/images/about/quality-lab.webp"
                  alt={copyValue(skuCopy, 'card2Title', t('skuSection.card2Title'))}
                  className="absolute inset-0"
                  sizes="(max-width: 767px) 100vw, 33vw"
                  compactBrand
                />
              </div>
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-900">{copyValue(skuCopy, 'card2Title', t('skuSection.card2Title'))}</h3>

                {/* List items */}
                <ul className="mt-6 space-y-3 flex-1">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {copyValue(skuCopy, 'card2Item1', t('skuSection.card2Item1'))}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {copyValue(skuCopy, 'card2Item2', t('skuSection.card2Item2'))}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {copyValue(skuCopy, 'card2Item3', t('skuSection.card2Item3'))}
                  </li>
                </ul>

                {/* Gray Button */}
                <div className="mt-8">
                  <Link
                    href={`/${locale}/products/categories/cleanroom-consumables`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    {copyValue(skuCopy, 'cta', t('skuSection.cta'))}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3: Bao Bì & Đóng Gói */}
            <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-[240px] relative overflow-hidden bg-gray-50">
                <BrandedMedia
                  src="/images/home/section2/product-custom-pkg.webp"
                  alt={copyValue(skuCopy, 'card3Title', t('skuSection.card3Title'))}
                  className="absolute inset-0"
                  sizes="(max-width: 767px) 100vw, 33vw"
                  compactBrand
                />
              </div>
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-900">{copyValue(skuCopy, 'card3Title', t('skuSection.card3Title'))}</h3>

                {/* List items */}
                <ul className="mt-6 space-y-3 flex-1">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {copyValue(skuCopy, 'card3Item1', t('skuSection.card3Item1'))}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {copyValue(skuCopy, 'card3Item2', t('skuSection.card3Item2'))}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 shrink-0 rounded-[2px]" />
                    {copyValue(skuCopy, 'card3Item3', t('skuSection.card3Item3'))}
                  </li>
                </ul>

                {/* Gray Button */}
                <div className="mt-8">
                  <Link
                    href={`/${locale}/products/categories/industrial-packaging`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    {copyValue(skuCopy, 'cta', t('skuSection.cta'))}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SearchSection
        locale={locale}
        targetPath={`/${locale}/products/catalog`}
        labels={{
          eyebrow: copyValue(searchCopy, 'eyebrow', t('searchSection.eyebrow')),
          title: copyValue(searchCopy, 'title', t('searchSection.title')),
          subtitle: copyValue(searchCopy, 'subtitle', t('searchSection.subtitle')),
          placeholder: copyValue(searchCopy, 'placeholder', t('searchSection.placeholder')),
          buttonText: copyValue(searchCopy, 'buttonText', t('searchSection.buttonText'))
        }}
      />

      {/* === SECTION: Product Catalog Showcase === */}
      <CatalogShowcase locale={locale} copy={getCopySection(copy, 'catalogSection')} />

      {/* === SECTION: Featured Stretch Wrap Product === */}
      <FeaturedProduct locale={locale} copy={getCopySection(copy, 'featuredProduct')} />

      <section className="w-full border-t border-gray-150 bg-white py-16 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1440px] items-center gap-10 px-4 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
              {copyValue(customCopy, 'eyebrow', locale === 'vi' ? 'GIẢI PHÁP THEO YÊU CẦU' : 'CUSTOM SOLUTIONS')}
            </p>
            <h2 className="mt-4 max-w-[18ch] text-3xl font-extrabold leading-tight tracking-[-0.03em] text-slate-900 lg:text-4xl">
              {copyValue(customCopy, 'title', locale === 'vi' ? 'Giải pháp thiết kế riêng cho Doanh nghiệp' : 'Solutions engineered for your business')}
            </h2>
            <p className="mt-6 max-w-[62ch] text-sm font-medium leading-7 text-slate-600 sm:text-base">
              {copyValue(customCopy, 'description', locale === 'vi' ? 'Giải pháp đóng gói thông minh được thiết kế theo sản phẩm, điều kiện vận chuyển và mục tiêu tối ưu chi phí của từng doanh nghiệp.' : 'Packaging systems engineered around your products, transport conditions and operating targets.')}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="mt-8 inline-flex min-h-12 items-center gap-3 bg-blue-600 px-6 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              {copyValue(customCopy, 'cta', locale === 'vi' ? 'Kết nối với Chúng tôi' : 'Talk to our team')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <BrandedMedia
            src="/images/solutions/smart_factory.png"
            alt={copyValue(customCopy, 'imageAlt', locale === 'vi' ? 'Dây chuyền đóng gói tự động được thiết kế riêng bởi ULink Industries' : 'ULink custom automated packaging line')}
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="min-h-[340px] bg-slate-100 lg:min-h-[460px]"
          />
        </div>
      </section>

      {/* === SECTION: Hub & Partner === */}
      <HubAndPartner locale={locale} copy={getCopySection(copy, 'hubPartner')} />

      {/* === SECTION: Testimonials & Core Capabilities === */}
      <TestimonialsCapabilities locale={locale} copy={getCopySection(copy, 'testimonialsCapabilities')} />
    </div>
  );
}
