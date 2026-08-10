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
  Bookmark,
  Maximize2,
  RefreshCw,
  Plus,
  ArrowRight
} from 'lucide-react';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { getTranslatedName, getTranslatedField, getTranslatedDescription } from '@/lib/i18n-content';
import { fetchProductBySlug, fetchProducts, getProductPricing, ProductSku, Product } from '@/lib/product-data';
import ProductDetailClient from '@/components/product/product-detail-client';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import RequestSampleButton from '@/components/sample-request/request-sample-button';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return { title: 'Sản phẩm không tồn tại | ULink Industries' };
  }

  const name = getTranslatedName(product, locale) || product.name;
  const desc = getTranslatedField(product, 'short_description', locale) || product.short_description || '';

  return {
    title: `${name} | Giải pháp Phòng sạch & Đóng gói ULink`,
    description: desc
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [tSample, product] = await Promise.all([
    getTranslations({ locale, namespace: 'sampleRequest' }),
    fetchProductBySlug(slug)
  ]);

  if (!product) {
    notFound();
  }

  const directusUrl = getDirectusUrl();
  const productName = getTranslatedName(product, locale) || product.name;
  const productDescription = getTranslatedField(product, 'short_description', locale) || product.short_description;

  const category = typeof product.category === 'object' && product.category !== null ? product.category : null;
  const categoryName = category ? (getTranslatedName(category, locale) || category.name) : null;

  const pricing = getProductPricing(product.slug, locale);

  const skus: ProductSku[] = (product.skus as ProductSku[]) || [];
  const gallery = Array.isArray(product.gallery) ? product.gallery : [];
  const documents = Array.isArray(product.documents) ? product.documents : [];
  const standards = Array.isArray(product.standards)
    ? product.standards.map((s: any) => s.standards_id).filter(Boolean)
    : [];

  const skuCode = skus[0]?.sku_code ?? null;

  const formatPrice = (amount: number) => {
    if (locale === 'vi') {
      return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    }
    return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount / 25000);
  };

  const specs = product.specifications as Record<string, string> | null;

  const productGalleryImages: Array<{ src: string; alt: string; label?: string }> = [];

  const rawHero = product.hero;
  const heroId = typeof rawHero === 'object' && rawHero !== null ? (rawHero as any).id : rawHero;

  if (heroId) {
    const heroSrc = typeof heroId === 'string' && (heroId.startsWith('http') || heroId.startsWith('/'))
      ? heroId
      : `${directusUrl}/assets/${heroId}`;
    productGalleryImages.push({
      src: heroSrc,
      alt: `${productName} - Ảnh đại diện Database`,
      label: 'Ảnh chính DB'
    });
  }

  gallery.forEach((fileObj, idx) => {
    const rawFileRef = fileObj?.directus_files_id;
    const fileId = typeof rawFileRef === 'object' && rawFileRef !== null ? (rawFileRef as any).id : rawFileRef;
    if (fileId) {
      const fileSrc = `${directusUrl}/assets/${fileId}`;
      if (!productGalleryImages.some(img => img.src === fileSrc)) {
        productGalleryImages.push({
          src: fileSrc,
          alt: `${productName} - Bộ sưu tập DB ${idx + 1}`,
          label: `Bộ ảnh DB ${idx + 1}`
        });
      }
    }
  });

  skus.forEach((sku, idx) => {
    const rawSkuImage = sku?.image;
    const skuImageId = typeof rawSkuImage === 'object' && rawSkuImage !== null ? (rawSkuImage as any).id : rawSkuImage;

    if (skuImageId) {
      const skuSrc = typeof skuImageId === 'string' && (skuImageId.startsWith('http') || skuImageId.startsWith('/'))
        ? skuImageId
        : `${directusUrl}/assets/${skuImageId}`;
      if (!productGalleryImages.some(img => img.src === skuSrc)) {
        productGalleryImages.push({
          src: skuSrc,
          alt: `${productName} - Mã SKU ${sku.sku_code || idx + 1}`,
          label: `SKU ${sku.sku_code || idx + 1}`
        });
      }
    }
  });

  const { products: allDbProducts } = await fetchProducts({ limit: 10 });
  const featured = allDbProducts.filter(p => p.slug !== product.slug).slice(0, 4);

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
            <Link href={`/${locale}/products`} className="hover:text-blue-600 transition-colors">
              {locale === 'vi' ? 'Sản phẩm' : 'Products'}
            </Link>
            {category && (
              <>
                <span className="text-slate-300 font-bold">&gt;</span>
                <Link href={`/${locale}/products/categories/${category.slug}`} className="hover:text-blue-600 transition-colors">
                  {categoryName}
                </Link>
              </>
            )}
            <span className="text-slate-300 font-bold">&gt;</span>
            <span className="text-slate-900 font-bold truncate max-w-[280px]">
              {productName}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT: Image Gallery Slider */}
          <div className="lg:col-span-5">
            <ProductImageGallery images={productGalleryImages} productName={productName} />
          </div>

          {/* CENTER: Product Info */}
          <div className="lg:col-span-4 space-y-6">
            {categoryName && (
              <div>
                <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50/80 border border-blue-100/80 px-3.5 py-1 rounded-full shadow-2xs">
                  {categoryName}
                </span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {productName}
            </h1>

            {/* SKU and Rating row */}
            <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
              {skuCode && <span>SKU: {skuCode}</span>}
              {skuCode && <span className="text-slate-300">|</span>}
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900">4.8</span>
                <div className="flex text-amber-400">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <span className="text-slate-500 font-medium">(48 {locale === 'vi' ? 'đánh giá' : 'reviews'})</span>
              </div>
            </div>

            <hr className="border-slate-200/80" />

            {productDescription && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {productDescription}
              </p>
            )}

            {/* 4 Feature Icon Circles */}
            <div className="grid grid-cols-4 gap-3 py-2">
              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200/70 flex items-center justify-center text-blue-600 mb-2 shrink-0 group-hover:bg-blue-50 transition-colors shadow-2xs">
                  <Maximize2 className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 leading-tight">
                  {locale === 'vi' ? 'Co giãn 400%' : 'Stretch 400%'}
                </span>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200/70 flex items-center justify-center text-blue-600 mb-2 shrink-0 group-hover:bg-blue-50 transition-colors shadow-2xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 leading-tight">
                  {locale === 'vi' ? 'Dẻo & Khó rách' : 'Tear Resistant'}
                </span>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200/70 flex items-center justify-center text-blue-600 mb-2 shrink-0 group-hover:bg-blue-50 transition-colors shadow-2xs">
                  <Droplets className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 leading-tight">
                  {locale === 'vi' ? 'Chống ẩm ướt' : 'Moisture Proof'}
                </span>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200/70 flex items-center justify-center text-blue-600 mb-2 shrink-0 group-hover:bg-blue-50 transition-colors shadow-2xs">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 leading-tight">
                  {locale === 'vi' ? 'PE Tái chế' : 'Recyclable PE'}
                </span>
              </div>
            </div>

            <hr className="border-slate-200/80" />

            {/* 2x2 Key Specifications Grid */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-8 py-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500">{locale === 'vi' ? 'Độ dày màng' : 'Thickness'}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  {specs?.['Độ dày'] || specs?.['Thickness'] || '17 mic / 20 mic / 23 mic'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500">{locale === 'vi' ? 'Chất liệu chính' : 'Material'}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  {specs?.['Chất liệu'] || specs?.['Material'] || '100% LLDPE Nguyên Sinh'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500">{locale === 'vi' ? 'Quy cách cuộn' : 'Specification'}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  {specs?.['Đóng gói'] || specs?.['Specification'] || 'Khổ rộng 50cm, cân nặng theo yêu cầu'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500">{locale === 'vi' ? 'Màu sắc' : 'Color'}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  {specs?.['Màu sắc'] || specs?.['Color'] || 'Trắng trong'}
                </span>
              </div>
            </div>

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
              {/* Product interactive config */}
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
                  addToCart: locale === 'vi' ? 'Thêm vào RFQ' : 'Add to RFQ',
                  added: locale === 'vi' ? 'Đã thêm' : 'Added',
                  selectVariant: locale === 'vi' ? 'Chọn quy cách' : 'Select Variant',
                  requestQuote: locale === 'vi' ? 'Yêu cầu báo giá sản lượng lớn' : 'Request Bulk Quote'
                }}
              />

              {/* Request Sample Option */}
              <div className="pt-2 border-t border-slate-200/80">
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

        {/* Related Products ("Sản phẩm liên quan") */}
        {featured.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
                <h3 className="text-lg font-bold text-slate-800">
                  {locale === 'vi' ? 'Sản phẩm liên quan' : 'Related Products'}
                </h3>
              </div>
              <Link
                href={category?.slug ? `/${locale}/products/categories/${category.slug}` : `/${locale}/products`}
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
                      href={`/${locale}/products/${prod.slug}`}
                      className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center border-b border-slate-100"
                    >
                      {(() => {
                        const rawProdHero = prod.hero;
                        const prodHeroId = typeof rawProdHero === 'object' && rawProdHero !== null ? (rawProdHero as any).id : rawProdHero;
                        if (prodHeroId) {
                          const prodHeroSrc = typeof prodHeroId === 'string' && (prodHeroId.startsWith('http') || prodHeroId.startsWith('/'))
                            ? prodHeroId
                            : `${directusUrl}/assets/${prodHeroId}`;
                          return (
                            <Image
                              src={prodHeroSrc}
                              alt={prodName}
                              fill
                              className="object-contain p-6 transition-transform group-hover:scale-103 duration-300"
                              sizes="(max-width: 768px) 100vw, 250px"
                            />
                          );
                        }
                        return <Package className="h-16 w-16 text-slate-200" />;
                      })()}
                    </Link>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1 justify-between space-y-4">
                      <div className="space-y-2">
                        <Link href={`/${locale}/products/${prod.slug}`}>
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

                      {/* Actions matching reference screenshot */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
                        <Link
                          href={`/${locale}/products/${prod.slug}`}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 group/link"
                        >
                          <span>{locale === 'vi' ? 'Chi tiết' : 'Details'}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover/link:text-blue-600 group-hover/link:translate-x-0.5 transition-all" />
                        </Link>

                        <Link
                          href={`/${locale}/quick-order`}
                          className="bg-[#1868DF] hover:bg-[#1459C5] text-white font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>{locale === 'vi' ? 'Thêm vào RFQ' : 'Add to RFQ'}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
