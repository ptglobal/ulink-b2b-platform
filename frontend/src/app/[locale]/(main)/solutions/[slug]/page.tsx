import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  Package,
  ShieldCheck,
  Factory,
  Star,
  MessageSquare,
  FileText,
  Layers,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { getTranslatedName, getTranslatedField, getTranslatedDescription } from '@/lib/i18n-content';
import { fetchProductBySlug } from '@/lib/product-data';
import ProductDocuments from '@/components/product/product-documents';
import SkuSelector from '@/components/product/sku-selector';
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
  return {
    title: metaTitle,
    description: metaDesc
  };
}

export default async function ProductDetailPage({ params: { locale, slug } }: ProductDetailPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'solutions' });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href={`/${locale}`} className="hover:text-foreground transition-colors">{t('breadcrumbHome')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/${locale}/solutions`} className="hover:text-foreground transition-colors">{t('breadcrumbSolutions')}</Link>
          {category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/${locale}/solutions?industry=`} className="hover:text-foreground transition-colors">{categoryName}</Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{productName}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-card rounded-2xl shadow-sm border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* Image Column */}
            <div className="lg:col-span-3 p-6 lg:p-8">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted/50">
                {product.hero ? (
                  <Image
                    src={`${directusUrl}/assets/${product.hero}`}
                    alt={productName}
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-32 w-32 text-muted-foreground/20" />
                  </div>
                )}
              </div>

              {/* Gallery thumbnails */}
              {gallery.length > 0 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {/* Hero as first thumbnail */}
                  {product.hero && (
                    <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 border-primary bg-muted/50">
                      <Image
                        src={`${directusUrl}/assets/${product.hero}`}
                        alt={productName}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    </div>
                  )}
                  {gallery.slice(0, 5).map((file) => (
                    <div key={file.id} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors bg-muted/50">
                      <Image
                        src={`${directusUrl}/assets/${file.id}`}
                        alt={file.filename_download}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="lg:col-span-2 p-6 lg:p-8 lg:border-l bg-muted/20">
              <div className="space-y-5">
                {/* Category + Brand */}
                <div className="flex items-center gap-2 flex-wrap">
                  {categoryName && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      <Tag className="h-3 w-3" />
                      {categoryName}
                    </span>
                  )}
                  {product.brand && (
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      {product.brand}
                    </span>
                  )}
                </div>

                {/* Product Name */}
                <h1 className="text-2xl lg:text-3xl font-bold leading-tight">{productName}</h1>

                {/* Description */}
                {productDescription && (
                  <p className="text-muted-foreground leading-relaxed text-sm">{productDescription}</p>
                )}

                {/* SKU Selector + Add to Cart */}
                {skus.length > 0 && (
                  <SkuSelector
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
                      quantity: t('quantity'),
                      selectVariant: t('selectVariant')
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Sections */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content — 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b bg-muted/30">
                  <Layers className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">{t('specifications')}</h2>
                </div>
                <div className="divide-y">
                  {Object.entries(product.specifications).map(([key, value], i) => (
                    <div key={key} className={cn('flex items-center px-6 py-3.5', i % 2 === 0 && 'bg-muted/20')}>
                      <span className="w-2/5 text-sm font-medium text-foreground">{key}</span>
                      <span className="w-3/5 text-sm text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SKU Variants */}
            {skus.length > 0 && (
              <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b bg-muted/30">
                  <Package className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">{t('skuVariants')}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/10">
                        <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">{t('skuCode')}</th>
                        <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">{t('unit')}</th>
                        <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">{t('packSize')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {skus.map((sku: ProductSku) => (
                        <tr key={sku.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-3.5 font-mono text-xs font-medium">{sku.sku_code}</td>
                          <td className="px-6 py-3.5">{sku.unit ?? '—'}</td>
                          <td className="px-6 py-3.5">{sku.pack_size ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Documents */}
            {(product.documents ?? []).length > 0 && (
              <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b bg-muted/30">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">{t('documents')}</h2>
                </div>
                <div className="p-6">
                  <ProductDocuments
                    documents={product.documents!}
                    labels={{
                      title: t('documents'),
                      download: t('download'),
                      preview: t('preview'),
                      noDocuments: t('noDocuments')
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — 1/3 width */}
          <div className="space-y-6">
            {/* Standards */}
            {standards.length > 0 && (
              <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b bg-muted/30">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-semibold">{t('standards')}</h2>
                </div>
                <div className="p-4 space-y-3">
                  {standards.map((std) => (
                    <div key={std.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm leading-tight">{getTranslatedName(std, locale)}</p>
                        {getTranslatedDescription(std, locale) && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{getTranslatedDescription(std, locale)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Industries / Applications */}
            {industries.length > 0 && (
              <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b bg-muted/30">
                  <Factory className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-semibold">{t('industries')}</h2>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {industries.map((ind) => (
                      <Link
                        key={ind.id}
                        href={`/${locale}/solutions?industry=${ind.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border bg-background hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
                      >
                        <Factory className="h-3.5 w-3.5" />
                        {getTranslatedName(ind, locale)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b bg-muted/30">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold">{t('reviews')}</h2>
              </div>
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Star className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">{t('reviewsComingSoon')}</p>
                <div className="flex items-center justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-muted-foreground/20 fill-muted-foreground/10" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
