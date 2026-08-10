import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bookmark, ArrowRight, Package } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { fetchTopCategoriesWithProducts } from '@/lib/product-data';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { getTranslatedName } from '@/lib/i18n-content';
import { ASSETS } from '@/lib/assets';
import { AddToCartButton } from './add-to-cart-button';
import type { Product } from '@/lib/directus';

interface CatalogShowcaseProps {
  locale: string;
}

export default async function CatalogShowcase({ locale }: CatalogShowcaseProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });
  const directusUrl = getDirectusUrl();
  const categoriesWithProducts = await fetchTopCategoriesWithProducts(4, 3);

  if (categoriesWithProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#FAFAFA] border-t border-gray-150 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col items-start border-b border-gray-100 pb-8 mb-12">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1.5 bg-blue-600 rounded-full shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('catalogSection.eyebrow')}
            </span>
          </div>
          <p className="mt-4 text-lg font-bold text-slate-700 leading-snug">
            {t('catalogSection.subtitle')}
          </p>
        </div>

        {/* Rows of categories */}
        <div className="space-y-16">
          {categoriesWithProducts.map((catData) => {
            const categoryName = getTranslatedName(catData.category, locale);
            return (
              <div key={catData.category.id} className="flex flex-col">
                {/* Category Title bar */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-1 bg-blue-600 rounded-full shrink-0" />
                    <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                      {categoryName}
                    </h3>
                  </div>
                  <Link
                    href={`/${locale}/solutions/categories/${catData.category.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {t('catalogSection.viewAll')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {catData.products.map((product: Product) => {
                    const productName = getTranslatedName(product, locale);
                    const firstSku = product.skus?.find((s) => s.status === 'published');
                    const stockStatus = firstSku?.stock_status ?? 'in_stock';
                    const packSize = firstSku?.pack_size ?? '';
                    const unit = firstSku?.unit ?? '';

                    const catSlug = catData.category.slug || '';
                    const productImage = product.hero
                      ? `${directusUrl}/assets/${product.hero}`
                      : catSlug.includes('glove')
                      ? ASSETS.home.productCutGloves
                      : catSlug.includes('packaging') || catSlug.includes('pkg')
                      ? ASSETS.home.productCustomPkg
                      : catSlug.includes('cleanroom') || catSlug.includes('wiper') || catSlug.includes('apparel')
                      ? ASSETS.home.solutionCleanroom
                      : ASSETS.home.productHvacTape;

                    return (
                      <div
                        key={product.id}
                        className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Product Image block */}
                        <Link
                          href={`/${locale}/solutions/${product.slug}`}
                          className="relative aspect-[4/3] w-full bg-slate-50 overflow-hidden"
                        >
                          <Image
                            src={productImage}
                            alt={productName}
                            fill
                            className="object-contain p-4 transition-transform group-hover:scale-105 duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                          {/* Stock status badge */}
                          {stockStatus !== 'in_stock' && (
                            <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              stockStatus === 'low_stock'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                              {stockStatus === 'low_stock'
                                ? (locale === 'vi' ? 'Sắp hết' : locale === 'ja' ? '在庫わずか' : 'Low Stock')
                                : (locale === 'vi' ? 'Hết hàng' : locale === 'ja' ? '在庫切れ' : 'Out of Stock')
                              }
                            </span>
                          )}
                        </Link>

                        {/* Product Content body */}
                        <div className="p-4 flex flex-col flex-1">
                          <Link href={`/${locale}/solutions/${product.slug}`}>
                            <h4 className="text-sm font-bold text-slate-800 line-clamp-1 hover:text-blue-600 transition-colors">
                              {productName}
                            </h4>
                          </Link>

                          {/* Brand & Pack size */}
                          <p className="mt-2 text-sm font-extrabold text-slate-900">
                            {product.brand ?? ''}
                            {unit && (
                              <span className="text-xs font-normal text-slate-500"> / {unit}</span>
                            )}
                          </p>

                          {/* MOQ / Pack info */}
                          <p className="mt-2 text-[11px] text-slate-500 flex flex-wrap items-center gap-1">
                            {packSize && (
                              <span className="font-semibold text-slate-800">{packSize}</span>
                            )}
                            {packSize && <span className="text-slate-300">|</span>}
                            <span>
                              {stockStatus === 'in_stock'
                                ? t('catalogSection.availableInStock')
                                : stockStatus === 'low_stock'
                                  ? t('catalogSection.availableInStock')
                                  : t('catalogSection.manufactureOnDemand')
                              }
                            </span>
                          </p>

                          {/* Location metadata */}
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{t('catalogSection.hanam')}, {t('catalogSection.vietnam')}</span>
                          </div>

                          {/* Action Buttons: Xem chi tiết & Add to RFQ */}
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                            <Link
                              href={`/${locale}/solutions/${product.slug}`}
                              className="text-xs font-bold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
                            >
                              Chi tiết
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>

                            <AddToCartButton
                              product={{
                                id: product.id,
                                name: productName,
                                slug: product.slug,
                                brand: product.brand,
                                unit: unit || 'cái'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
