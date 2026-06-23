import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Package, ShieldCheck, Factory } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { fetchProductBySlug } from '@/lib/product-data';
import ProductDocuments from '@/components/product/product-documents';
import type { Industry, Standard, ProductSku, DirectusFile } from '@/lib/directus';

export const revalidate = 60;

interface ProductDetailPageProps {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params: { slug } }: ProductDetailPageProps) {
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: 'Not Found' };
  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.short_description || undefined
  };
}

export default async function ProductDetailPage({ params: { locale, slug } }: ProductDetailPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'solutions' });
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  const directusUrl = getDirectusUrl();
  const category = typeof product.category === 'object' && product.category ? product.category : null;
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
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href={`/${locale}`} className="hover:text-foreground">{t('breadcrumbHome')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/${locale}/solutions`} className="hover:text-foreground">{t('breadcrumbSolutions')}</Link>
        {category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>{category.name}</span>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Hero section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image / Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden border bg-muted">
            {product.hero ? (
              <Image
                src={`${directusUrl}/assets/${product.hero}`}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
          </div>
          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {gallery.slice(0, 4).map((file) => (
                <div key={file.id} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={`${directusUrl}/assets/${file.id}`}
                    alt={file.filename_download}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          {category && (
            <span className="inline-block text-xs font-medium uppercase tracking-wide text-primary bg-primary/10 px-2.5 py-1 rounded">
              {category.name}
            </span>
          )}
          <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>
          {product.brand && (
            <p className="text-sm text-muted-foreground">
              {t('brand')}: <span className="font-medium text-foreground">{product.brand}</span>
            </p>
          )}
          {product.short_description && (
            <p className="text-muted-foreground leading-relaxed">{product.short_description}</p>
          )}

          {/* Stock status summary */}
          {skus.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skus.map((sku: ProductSku) => (
                <span
                  key={sku.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                    sku.stock_status === 'in_stock' && 'bg-green-100 text-green-700',
                    sku.stock_status === 'low_stock' && 'bg-yellow-100 text-yellow-700',
                    sku.stock_status === 'out_of_stock' && 'bg-red-100 text-red-700'
                  )}
                >
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    sku.stock_status === 'in_stock' && 'bg-green-500',
                    sku.stock_status === 'low_stock' && 'bg-yellow-500',
                    sku.stock_status === 'out_of_stock' && 'bg-red-500'
                  )} />
                  {sku.sku_code}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <Link
            href={`/${locale}/quick-order`}
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {t('requestQuote')}
          </Link>
        </div>
      </div>

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">{t('specifications')}</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([key, value], i) => (
                  <tr key={key} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
                    <td className="px-4 py-3 font-medium w-1/3">{key}</td>
                    <td className="px-4 py-3 text-muted-foreground">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SKU Variants */}
      {skus.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">{t('skuVariants')}</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">{t('skuCode')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('unit')}</th>
                  <th className="px-4 py-3 text-left font-medium">{t('packSize')}</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {skus.map((sku: ProductSku) => (
                  <tr key={sku.id}>
                    <td className="px-4 py-3 font-mono text-xs">{sku.sku_code}</td>
                    <td className="px-4 py-3">{sku.unit ?? '—'}</td>
                    <td className="px-4 py-3">{sku.pack_size ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full',
                        sku.stock_status === 'in_stock' && 'bg-green-100 text-green-700',
                        sku.stock_status === 'low_stock' && 'bg-yellow-100 text-yellow-700',
                        sku.stock_status === 'out_of_stock' && 'bg-red-100 text-red-700'
                      )}>
                        {sku.stock_status === 'in_stock' && t('inStock')}
                        {sku.stock_status === 'low_stock' && t('lowStock')}
                        {sku.stock_status === 'out_of_stock' && t('outOfStock')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Standards */}
      {standards.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">{t('standards')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {standards.map((std) => (
              <div key={std.id} className="flex items-start gap-3 p-4 border rounded-lg">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{std.name}</p>
                  {std.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{std.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Industries */}
      {industries.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">{t('industries')}</h2>
          <div className="flex flex-wrap gap-3">
            {industries.map((ind) => (
              <Link
                key={ind.id}
                href={`/${locale}/solutions?industry=${ind.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
              >
                <Factory className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{ind.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Documents */}
      {(product.documents ?? []).length > 0 && (
        <section className="mb-12">
          <ProductDocuments
            documents={product.documents!}
            labels={{
              title: t('documents'),
              download: t('download'),
              preview: t('preview'),
              noDocuments: t('noDocuments')
            }}
          />
        </section>
      )}
    </div>
  );
}
