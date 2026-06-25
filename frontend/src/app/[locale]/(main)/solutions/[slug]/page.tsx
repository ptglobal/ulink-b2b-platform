import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  Package,
  ShieldCheck,
  FileDown,
  Truck,
  MapPin
} from 'lucide-react';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { getTranslatedName, getTranslatedField, getTranslatedDescription } from '@/lib/i18n-content';
import { fetchProductBySlug } from '@/lib/product-data';
import ProductDetailClient from '@/components/product/product-detail-client';
import RequestSampleButton from '@/components/sample-request/request-sample-button';
import type { Industry, Standard, ProductSku, DirectusFile } from '@/lib/directus';

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

export default async function ProductDetailPage({ params: { locale, slug } }: ProductDetailPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'solutions' });
  const tSample = await getTranslations({ locale, namespace: 'sampleRequest' });
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

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

  // Quick specs from specifications
  const specs = product.specifications as Record<string, string> | null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href={`/${locale}`} className="hover:text-blue-600 transition-colors">
              {t('breadcrumbHome')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/${locale}/solutions`} className="hover:text-blue-600 transition-colors">
              {t('breadcrumbSolutions')}
            </Link>
            {category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href={`/${locale}/solutions?category=${category.slug}`} className="hover:text-blue-600 transition-colors">
                  {categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900 font-medium truncate max-w-[250px]">{productName}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-5">
            <div className="flex gap-3">
              {/* Vertical thumbnails */}
              {allImages.length > 1 && (
                <div className="hidden sm:flex flex-col gap-2 w-20 shrink-0">
                  {allImages.slice(0, 5).map((img, idx) => (
                    <div
                      key={img.id}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 bg-gray-50 cursor-pointer transition-colors ${idx === 0 ? 'border-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                      <Image
                        src={`${directusUrl}/assets/${img.id}`}
                        alt={img.alt}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-200">
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
                    <Package className="h-24 w-24 text-gray-200" />
                  </div>
                )}
                {product.brand && (
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-300 font-bold text-lg tracking-wider">
                    {product.brand}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CENTER: Product Info */}
          <div className="lg:col-span-4">
            {categoryName && (
              <div className="mb-3">
                <span className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded">
                  {categoryName}
                </span>
              </div>
            )}

            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-2">
              {productName}
            </h1>

            {skuCode && (
              <p className="text-sm font-bold text-gray-600 mb-3">{skuCode}</p>
            )}

            {productDescription && (
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {productDescription}
              </p>
            )}

            {/* Feature Icons Row */}
            {industries.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-5 pb-5 border-b border-gray-100">
                {industries.slice(0, 5).map((ind) => (
                  <div key={ind.id} className="flex flex-col items-center gap-1.5 w-16">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-[10px] text-gray-500 text-center leading-tight">
                      {getTranslatedName(ind, locale)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Specs */}
            {specs && Object.keys(specs).length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-100">
                {Object.entries(specs).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">{key}</p>
                    <p className="text-sm font-medium text-gray-700">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Standards Row */}
            {standards.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-400 font-medium mb-3">
                  {locale === 'vi' ? 'Tiêu chuẩn' : 'Standards'}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  {standards.map((std, idx) => (
                    <div key={std.id} className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-700">{getTranslatedName(std, locale)}</p>
                        {getTranslatedDescription(std, locale) && (
                          <p className="text-[10px] text-gray-400">{getTranslatedDescription(std, locale)}</p>
                        )}
                      </div>
                      {idx < standards.length - 1 && (
                        <div className="w-px h-10 bg-gray-200" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-6 space-y-4">
              {/* Size + Add to Cart */}
              <ProductDetailClient
                skus={skus.map((s: ProductSku) => ({
                  id: s.id,
                  sku_code: s.sku_code,
                  unit: s.unit,
                  pack_size: s.pack_size,
                  attributes: s.attributes as Record<string, string> | null
                }))}
                labels={{
                  addToCart: t('addToCart'),
                  added: t('added'),
                  selectVariant: t('selectVariant'),
                  requestQuote: locale === 'vi' ? 'Yêu cầu báo giá' : 'Request Quote',
                  size: locale === 'vi' ? 'Kích thước' : 'Size'
                }}
              />

              {/* Delivery Info */}
              <div className="pt-3 border-t border-gray-100 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Package className="h-3.5 w-3.5 text-gray-400" />
                  <span>{locale === 'vi' ? 'Đặt tối thiểu: 50 đôi' : 'Min. order: 50 pairs'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck className="h-3.5 w-3.5 text-gray-400" />
                  <span>{locale === 'vi' ? 'Thời gian giao hàng: 2-3 ngày làm việc' : 'Delivery: 2-3 business days'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span>{locale === 'vi' ? 'Giao hàng toàn quốc' : 'Nationwide delivery'}</span>
                </div>
              </div>

              {/* Request Sample */}
              <div className="pt-3 border-t border-gray-100">
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
      <div className="container mx-auto px-4 pb-10">
          {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex items-center gap-6 -mb-px">
                <span className="text-sm font-bold text-gray-700 border-b-2 border-blue-600 pb-3 px-1">
                  {locale === 'vi' ? 'Thông tin sản phẩm' : 'Product Info'}
                </span>
                <span className="text-sm text-gray-500 pb-3 px-1 cursor-pointer hover:text-gray-700">
                  {t('specifications')}
                </span>
                <span className="text-sm text-gray-500 pb-3 px-1 cursor-pointer hover:text-gray-700">
                  {t('standards')}
                </span>
                <span className="text-sm text-gray-500 pb-3 px-1 cursor-pointer hover:text-gray-700">
                  {locale === 'vi' ? 'Ứng dụng' : 'Applications'}
                </span>
                <span className="text-sm text-gray-500 pb-3 px-1 cursor-pointer hover:text-gray-700">
                  {locale === 'vi' ? 'Đánh giá' : 'Reviews'} (12)
                </span>
              </nav>
            </div>

            {/* Tab Content: Product Info + Applications */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    {locale === 'vi' ? 'Thông tin sản phẩm' : 'Product Info'}
                  </h3>
                  {productDescription && (
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      {productDescription}
                    </p>
                  )}
                  {specs && Object.keys(specs).length > 0 && (
                    <ul className="space-y-2.5">
                      {Object.entries(specs).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2 text-xs text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span><span className="font-medium">{key}:</span> {value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Applications */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    {locale === 'vi' ? 'Ứng dụng' : 'Applications'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {industries.map((ind) => (
                      <Link
                        key={ind.id}
                        href={`/${locale}/solutions?industry=${ind.slug}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50">
                          <ShieldCheck className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                        </div>
                        <span className="text-xs text-gray-600 group-hover:text-blue-600">
                          {getTranslatedName(ind, locale)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents section */}
            {(product.documents ?? []).length > 0 && (
              <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('documents')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.documents!.map((doc) => (
                    <a
                      key={doc.id}
                      href={`${directusUrl}/assets/${typeof doc.file === 'object' && doc.file ? doc.file.id : doc.file}?download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                    >
                      <FileDown className="h-4 w-4 text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{doc.title}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{doc.doc_type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
