import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  Package,
  ShieldCheck,
  FileDown,
  FileText,
  Truck,
  MapPin,
  Search,
  Award,
  Droplets,
  Wind,
  Link2,
  CalendarRange,
  Globe2,
  Bookmark
} from 'lucide-react';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { getTranslatedName, getTranslatedField, getTranslatedDescription } from '@/lib/i18n-content';
import { fetchProductBySlug, fetchProducts } from '@/lib/product-data';
import ProductDetailClient from '@/components/product/product-detail-client';
import ProductTabs from '@/components/product/product-tabs';
import RequestSampleButton from '@/components/sample-request/request-sample-button';
import type { Product, Industry, Standard, ProductSku, DirectusFile } from '@/lib/directus';

export const revalidate = 60;

interface ProductDetailPageProps {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params: { locale, slug } }: ProductDetailPageProps) {
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: 'Not Found' };
  const metaTitle = getTranslatedField(product, 'meta_title', locale) || getTranslatedName(product, locale);
  const metaDesc = getTranslatedField(product, 'meta_description', locale) || getTranslatedField(product, 'short_description', locale) || undefined;
  return { title: metaTitle, description: metaDesc };
}

// B2B Pricing helper based on product category/slug
function getProductPricing(slug: string, locale: string) {
  const isVi = locale === 'vi';
  const pricingMap: Record<string, { price: number; unit: string }> = {
    'nitrile-cleanroom-gloves': { price: 2500, unit: isVi ? 'đôi' : 'pair' },
    'polyester-cleanroom-wipers': { price: 250000, unit: isVi ? 'gói' : 'pack' },
    'tyvek-cleanroom-coverall': { price: 180000, unit: isVi ? 'bộ' : 'pcs' },
    'cleanroom-face-mask-3ply': { price: 75000, unit: isVi ? 'hộp' : 'box' },
    'esd-wrist-strap': { price: 45000, unit: isVi ? 'cái' : 'pcs' },
    'esd-table-mat-2layer': { price: 1200000, unit: isVi ? 'cuộn' : 'roll' },
    'ipa-cleanroom-grade-999': { price: 95000, unit: isVi ? 'chai' : 'bottle' },
    'sticky-mat-30-layers': { price: 150000, unit: isVi ? 'tấm' : 'sheet' },
    'esd-shielding-bag': { price: 3500, unit: isVi ? 'túi' : 'bag' },
    'sterile-latex-cleanroom-gloves': { price: 4500, unit: isVi ? 'đôi' : 'pair' }
  };
  return pricingMap[slug] || { price: 100000, unit: isVi ? 'cái' : 'pcs' };
}

export default async function ProductDetailPage({ params: { locale, slug } }: ProductDetailPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'solutions' });
  const tSample = await getTranslations({ locale, namespace: 'sampleRequest' });
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  // Fetch 4 featured products for the "Sản phẩm đã lưu" section
  const { products: featured } = await fetchProducts({ limit: 4 });

  const directusUrl = getDirectusUrl();
  const productName = getTranslatedName(product, locale);
  const productDescription = getTranslatedField(product, 'short_description', locale);
  const category = typeof product.category === 'object' && product.category ? product.category : null;
  const categoryName = category ? getTranslatedName(category, locale) : null;
  const industries = (product.industries ?? [])
    .map((r) => (typeof r.industries_id === 'object' ? r.industries_id : null))
    .filter(Boolean) as Industry[];
  const standards = (product.standards ?? [])
    .map((r) => (typeof r.standards_id === 'object' ? r.standards_id : null))
    .filter(Boolean) as Standard[];
  const skus = (product.skus ?? []).filter((s: ProductSku) => s.status === 'published');
  const gallery = (product.gallery ?? [])
    .map((g) => (typeof g.directus_files_id === 'object' ? g.directus_files_id : null))
    .filter(Boolean) as DirectusFile[];

  // Build gallery images list (hero first, then gallery items)
  const allImages: Array<{ id: string; alt: string }> = [];
  if (product.hero) allImages.push({ id: product.hero, alt: productName });
  gallery.forEach((file) => allImages.push({ id: file.id, alt: file.filename_download }));

  // Get first SKU code for display
  const firstSku = skus[0];
  const skuCode = firstSku?.sku_code ?? '';

  // Get price and unit
  const pricing = getProductPricing(slug, locale);

  // Price formatter for featured products section
  const formatPrice = (amount: number) => {
    if (locale === 'vi') {
      return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    }
    return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount / 25000);
  };

  // Quick specs from specifications
  const specs = product.specifications as Record<string, string> | null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-150">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 py-3">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href={`/${locale}`} className="hover:text-blue-600 transition-colors">
              {locale === 'vi' ? 'Trang chủ' : 'Home'}
            </Link>
            <span className="text-slate-300 font-bold">&gt;</span>
            <Link href={`/${locale}/solutions`} className="hover:text-blue-600 transition-colors">
              {locale === 'vi' ? 'Sản phẩm' : 'Products'}
            </Link>
            {category && (
              <>
                <span className="text-slate-300 font-bold">&gt;</span>
                <Link href={`/${locale}/solutions?category=${category.slug}`} className="hover:text-blue-600 transition-colors">
                  {categoryName}
                </Link>
              </>
            )}
            <span className="text-slate-300 font-bold">&gt;</span>
            <span className="text-slate-800 truncate max-w-[250px] font-bold">{productName}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-5">
            <div className="flex flex-col gap-4">
              {/* Main image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-sm flex items-center justify-center group">
                {product.hero ? (
                  <Image
                    src={`${directusUrl}/assets/${product.hero}`}
                    alt={productName}
                    fill
                    className="object-contain p-8"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-24 w-24 text-slate-200" />
                  </div>
                )}
                {/* Zoom icon in bottom-right corner */}
                <div className="absolute bottom-3 right-3 p-1.5 bg-white rounded-full border border-slate-200 shadow-sm text-slate-500">
                  <Search className="h-4 w-4" />
                </div>
              </div>

              {/* Horizontal thumbnails below main image */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto py-1">
                  {allImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 bg-white cursor-pointer transition-all shrink-0 ${
                        idx === 0 ? 'border-blue-600' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Image
                        src={`${directusUrl}/assets/${img.id}`}
                        alt={img.alt}
                        fill
                        className="object-contain p-1.5"
                        sizes="80px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CENTER: Product Info */}
          <div className="lg:col-span-4 space-y-6">
            {categoryName && (
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100/60 px-3 py-1 rounded-md">
                  {categoryName}
                </span>
              </div>
            )}

            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
              {productName}
            </h1>

            {/* SKU and Rating row */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {skuCode && <span className="font-semibold text-slate-500">SKU: {skuCode}</span>}
              {skuCode && <span className="text-slate-300">|</span>}
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-800">4.0</span>
                <div className="flex text-amber-400">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-slate-200">★</span>
                </div>
                <span className="text-slate-500 font-medium">(12 {locale === 'vi' ? 'đánh giá' : 'reviews'})</span>
              </div>
            </div>

            <hr className="border-gray-150" />

            {productDescription && (
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {productDescription}
              </p>
            )}

            {/* Key feature icons row */}
            <div className="grid grid-cols-4 gap-4 py-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 mb-2 shrink-0">
                  <Link2 className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  {locale === 'vi' ? 'Bám vượt trội' : 'Superior Grip'}
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 mb-2 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  {locale === 'vi' ? 'Chống mài mòn' : 'Abrasion'}
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 mb-2 shrink-0">
                  <Droplets className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  {locale === 'vi' ? 'Kháng dầu' : 'Oil Resistant'}
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 mb-2 shrink-0">
                  <Wind className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 leading-tight">
                  {locale === 'vi' ? 'Thoáng khí' : 'Breathable'}
                </span>
              </div>
            </div>

            <hr className="border-gray-150" />

            {/* Specifications table */}
            {specs && Object.keys(specs).length > 0 && (
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-2">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{key}</span>
                    <span className="text-sm font-bold text-slate-800 mt-1">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <hr className="border-gray-150" />

            {/* Quality Standards Achieved */}
            {standards.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {locale === 'vi' ? 'Tiêu chuẩn chất lượng đạt được:' : 'Quality Standards Achieved:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {standards.map((std) => (
                    <div
                      key={std.id}
                      className="flex items-center gap-3 p-4 bg-blue-50/40 border border-blue-100/80 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-tight">
                          {getTranslatedName(std, locale)}
                        </p>
                        {getTranslatedDescription(std, locale) && (
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                            {getTranslatedDescription(std, locale)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar Card */}
          <div className="lg:col-span-3">
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-6 sticky top-6 space-y-6">
              {/* Product interactive config (variant, qty, price table, buttons) */}
              <ProductDetailClient
                skus={skus.map((s: ProductSku) => ({
                  id: s.id,
                  sku_code: s.sku_code,
                  unit: s.unit,
                  pack_size: s.pack_size,
                  attributes: s.attributes as Record<string, string> | null
                }))}
                productName={productName}
                locale={locale}
                basePrice={pricing.price}
                unitLabel={pricing.unit}
                labels={{
                  addToCart: t('addToCart'),
                  added: t('added'),
                  selectVariant: t('selectVariant'),
                  requestQuote: locale === 'vi' ? 'Yêu cầu báo giá' : 'Request Quote'
                }}
              />

              <hr className="border-slate-200" />

              {/* Delivery Info with icons */}
              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold">
                  <Package className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {locale === 'vi' ? `MOQ tối thiểu: 50 ${pricing.unit}` : `Min. MOQ: 50 ${pricing.unit}`}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold">
                  <CalendarRange className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {locale === 'vi' ? 'Thời gian giao hàng: 2-3 ngày' : 'Delivery: 2-3 business days'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold">
                  <Globe2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {locale === 'vi' ? 'Giao hàng toàn quốc' : 'Nationwide delivery'}
                  </span>
                </div>
              </div>

              {/* Request Sample Option */}
              <div className="pt-3 border-t border-slate-200/80">
                <RequestSampleButton
                  productSlug={product.slug}
                  productName={productName}
                  skuCodes={skus.map((s: ProductSku) => s.sku_code)}
                  labels={{
                    requestSampleBtn: tSample('requestSampleBtn'),
                    modalTitle: tSample('modalTitle'),
                    modalDesc: tSample('modalDesc'),
                    contactName: tSample('contactName'),
                    email: tSample('email'),
                    company: tSample('company'),
                    phone: tSample('phone'),
                    province: tSample('province'),
                    district: tSample('district'),
                    addressDetail: tSample('addressDetail'),
                    message: tSample('message'),
                    messagePlaceholder: tSample('messagePlaceholder'),
                    selectProvince: tSample('selectProvince'),
                    selectDistrict: tSample('selectDistrict'),
                    submit: tSample('submit'),
                    submitting: tSample('submitting'),
                    success: tSample('success'),
                    error: tSample('error'),
                    required: tSample('required'),
                    invalidEmail: tSample('invalidEmail'),
                    invalidPhone: tSample('invalidPhone'),
                    product: tSample('product'),
                    skus: tSample('skus')
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content Section */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 pb-16">
        <ProductTabs
          locale={locale}
          productName={productName}
          skuCode={skuCode}
          brand={product.brand ?? ''}
          categoryName={categoryName ?? ''}
          specifications={specs}
          industries={industries}
          standards={standards}
          skus={skus}
        />

        {/* Standards & Commitments (Tiêu chuẩn & Cam kết) */}
        <div className="mt-16 space-y-8">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-extrabold text-blue-600">
              {locale === 'vi' ? 'Tiêu chuẩn & Cam kết' : 'Standards & Commitments'}
            </h3>
            <p className="text-base font-bold text-slate-800">
              {locale === 'vi' ? 'Chứng nhận chất lượng' : 'Quality Certifications'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: ISO 9001:2015 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-slate-800">ISO 9001:2015</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {locale === 'vi' 
                      ? 'Hệ thống quản lý chất lượng tiêu chuẩn quốc tế cho quy trình vận hành và kiểm soát sản xuất hàng đầu.'
                      : 'International standard quality management system for operational processes and leading production control.'}
                  </p>
                </div>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-md text-[10px] font-bold text-blue-600">
                  ✓ {locale === 'vi' ? 'Đã chứng nhận' : 'Certified'}
                </span>
              </div>
            </div>

            {/* Card 2: ISO 13485:2016 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-slate-800">ISO 13485:2016</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {locale === 'vi' 
                      ? 'Hệ thống quản lý chất lượng chuyên biệt cho trang thiết bị và dụng cụ y tế đảm bảo an toàn tuyệt đối.'
                      : 'Specialized quality management system for medical devices and equipment ensuring absolute safety.'}
                  </p>
                </div>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-md text-[10px] font-bold text-blue-600">
                  ✓ {locale === 'vi' ? 'Đã chứng nhận' : 'Certified'}
                </span>
              </div>
            </div>

            {/* Card 3: CE Marking */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-slate-800">CE Marking</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {locale === 'vi' 
                      ? 'Chứng nhận đạt tiêu chuẩn an toàn, sức khỏe và bảo vệ môi trường để lưu hành tự do tại thị trường Châu Âu.'
                      : 'Certification of safety, health, and environmental protection standards for free circulation in Europe.'}
                  </p>
                </div>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-md text-[10px] font-bold text-blue-600">
                  ✓ {locale === 'vi' ? 'Đã kiểm định' : 'Audited'}
                </span>
              </div>
            </div>

            {/* Card 4: FDA Registered */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Globe2 className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-slate-800">FDA Registered</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {locale === 'vi' 
                      ? 'Đăng ký cơ sở và chứng nhận sản phẩm an toàn theo quy định khắt khe từ Cục quản lý Thực phẩm & Dược phẩm Hoa Kỳ.'
                      : 'Facility registration and product safety certification according to strict rules from the US FDA.'}
                  </p>
                </div>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-md text-[10px] font-bold text-blue-600">
                  ✓ {locale === 'vi' ? 'FDA đăng ký' : 'FDA Registered'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Manufacturer quality statement banner */}
          <div className="flex items-start gap-4 p-5 bg-[#F8FAFC] border border-slate-200/40 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              <Award className="h-5 w-5" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bold">
              {locale === 'vi'
                ? 'Nhà sản xuất đạt chứng nhận hệ thống quản lý chất lượng ISO 9001:2015, đảm bảo quy trình sản xuất được kiểm soát chặt chẽ và liên tục cải tiến để mang lại giải pháp tối ưu cho quý khách hàng.'
                : 'The manufacturer holds ISO 9001:2015 quality management system certification, ensuring strict process control and continuous improvement to deliver optimal solutions to our customers.'}
            </p>
          </div>
        </div>

        {/* Documents section */}
        {(product.documents ?? []).length > 0 && (
          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">{t('documents')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.documents!.map((doc) => (
                <a
                  key={doc.id}
                  href={`${directusUrl}/assets/${typeof doc.file === 'object' && doc.file ? doc.file.id : doc.file}?download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-150 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                >
                  <FileDown className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{doc.title}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{doc.doc_type}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Saved Products ("Sản phẩm đã lưu") */}
        {featured.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
                <h3 className="text-lg font-bold text-slate-800">
                  {locale === 'vi' ? 'Sản phẩm đã lưu' : 'Saved Products'}
                </h3>
              </div>
              <Link
                href={`/${locale}/solutions`}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                {locale === 'vi' ? 'Xem tất cả' : 'View All'} &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((prod: Product) => {
                const prodName = getTranslatedName(prod, locale);
                const prodPricing = getProductPricing(prod.slug, locale);
                const prodFirstSku = prod.skus?.[0];
                const stockStatus = prodFirstSku?.stock_status ?? 'in_stock';

                return (
                  <div
                    key={prod.id}
                    className="group flex flex-col bg-white rounded-xl border border-slate-200/85 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Image Box */}
                    <Link
                      href={`/${locale}/solutions/${prod.slug}`}
                      className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center border-b border-slate-100"
                    >
                      {prod.hero ? (
                        <Image
                          src={`${directusUrl}/assets/${prod.hero}`}
                          alt={prodName}
                          fill
                          className="object-contain p-6 transition-transform group-hover:scale-103 duration-300"
                          sizes="(max-width: 768px) 100vw, 250px"
                        />
                      ) : (
                        <Package className="h-16 w-16 text-slate-200" />
                      )}
                    </Link>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1 justify-between space-y-4">
                      <div className="space-y-2">
                        <Link href={`/${locale}/solutions/${prod.slug}`}>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 hover:text-blue-600 transition-colors">
                            {prodName}
                          </h4>
                        </Link>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {formatPrice(Math.round(prodPricing.price * 0.9))} - {formatPrice(Math.round(prodPricing.price * 1.1))}
                          <span className="text-[10px] sm:text-xs font-normal text-slate-400"> /per {prodPricing.unit}</span>
                        </p>

                        {/* MOQ Info */}
                        <div className="text-[10px] text-slate-500 font-semibold space-x-1">
                          <span>MOQ: 100 {prodPricing.unit}</span>
                          <span className="text-slate-300">|</span>
                          <span>
                            {stockStatus === 'in_stock'
                              ? (locale === 'vi' ? 'Có sẵn tại kho' : 'In Stock')
                              : (locale === 'vi' ? 'Sản xuất theo yêu cầu' : 'On Demand')}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>Hub Hà Nam, Việt Nam</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <Link
                          href={`/${locale}/rfq`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition-colors text-center shadow-sm"
                        >
                          {locale === 'vi' ? 'Đặt hàng' : 'Order'}
                        </Link>
                        <button
                          type="button"
                          className="bg-blue-50 border border-blue-100 p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center shrink-0"
                        >
                          <Bookmark className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Contact Call-To-Action Banner (Liên hệ - Full Width) */}
      <div className="w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12 lg:py-16 relative overflow-hidden border-t border-blue-950">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
              {locale === 'vi' ? 'LIÊN HỆ' : 'CONTACT'}
            </span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
              {locale === 'vi' ? 'Kết nối với ULink Industries' : 'Connect with ULink Industries'}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/70 max-w-2xl leading-relaxed font-semibold">
              {locale === 'vi'
                ? 'Hãy để chúng tôi đồng hành cùng bạn trên hành trình tối ưu hóa chuỗi cung ứng và vận tải. Đội ngũ chuyên gia ULink luôn sẵn sàng hỗ trợ.'
                : 'Let us accompany you on the journey to optimize your supply chain and transport. ULink experts are always ready to help.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <Link
              href={`/${locale}/contact`}
              className="border border-white hover:bg-white/10 text-white px-6 py-2.5 rounded-md text-xs sm:text-sm font-bold transition-all"
            >
              {locale === 'vi' ? 'Kết nối với Chúng tôi' : 'Connect with Us'}
            </Link>
            <Link
              href={`/${locale}/schedule`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-xs sm:text-sm font-bold transition-all shadow-sm"
            >
              {locale === 'vi' ? 'Đặt lịch ngay' : 'Book a Schedule'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
