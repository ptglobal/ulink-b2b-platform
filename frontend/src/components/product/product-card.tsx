'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from '@/components/icons';
import { BrandedMedia } from '@/components/media/branded-media';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { getTranslatedName, getTranslatedField } from '@/lib/i18n-content';
import ProductCardCartButton from './product-card-cart-button';
import type { Product } from '@/lib/directus';

interface ProductCardProps {
  product: Product;
  locale: string;
  roundedClass?: string;
}

export default function ProductCard({ product, locale, roundedClass }: ProductCardProps) {
  const DIRECTUS_URL = getDirectusUrl();
  const productName = getTranslatedName(product, locale);

  const firstSku = product.skus?.[0];
  const stockStatus = firstSku?.stock_status || 'in_stock';

  const category =
    typeof product.category === 'object' && product.category !== null
      ? (product.category as any)
      : null;
  const categoryName = category ? getTranslatedName(category, locale) || category.name : null;

  const shortDescription =
    getTranslatedField(product, 'short_description', locale) || product.short_description || '';

  const imageSrc = product.hero ? `${DIRECTUS_URL}/assets/${product.hero}` : null;

  return (
    <div
      className={`ulink-media-zoom group flex flex-col overflow-hidden bg-white ${
        roundedClass || 'rounded-none'
      } border border-border transition-colors hover:border-brand`}
    >
      {/* Product Image Area */}
      <Link
        href={`/${locale}/products/${product.slug}`}
        className="relative block aspect-[16/10] w-full overflow-hidden border-b border-slate-100 bg-slate-50 sm:aspect-[4/3]"
      >
        <BrandedMedia
          src={imageSrc}
          alt={productName}
          className="absolute inset-0"
          imageClassName="object-contain p-4"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          compactBrand
        />

        {/* Brand Tag Top Left */}
        <span className="absolute left-3 top-3 bg-foreground px-2.5 py-1 text-[10px] font-semibold text-white">
          {product.brand || 'ULink'}
        </span>

        {/* Stock Status Badge Top Right */}
        <span
          className={`absolute right-3 top-3 border px-2 py-0.5 text-[10px] font-semibold ${
            stockStatus === 'in_stock'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : stockStatus === 'low_stock'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          {stockStatus === 'in_stock'
            ? locale === 'vi'
              ? 'Sẵn kho 2H'
              : 'In Stock'
            : stockStatus === 'low_stock'
              ? locale === 'vi'
                ? 'Sắp hết'
                : 'Low Stock'
              : locale === 'vi'
                ? 'Đơn MOQ'
                : 'On Order'}
        </span>
      </Link>

      {/* Product Content Body */}
      <div className="flex flex-1 flex-col justify-between space-y-4 p-4 sm:p-5">
        <div>
          {/* Category Label */}
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {categoryName || (locale === 'vi' ? 'Sản phẩm' : 'Product')}
          </span>

          {/* Title */}
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="mt-1 flex min-h-11 items-start py-1"
          >
            <h3 className="text-sm font-extrabold text-foreground line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
              {productName}
            </h3>
          </Link>

          {/* Short Description */}
          {shortDescription && (
            <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
              {shortDescription}
            </p>
          )}
        </div>

        {/* Action Buttons: Xem chi tiết & ADD TO RFQ */}
        <div className="flex flex-col items-stretch gap-2 border-t border-slate-100 pt-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="inline-flex min-h-11 items-center justify-center gap-1 px-3 text-xs font-bold text-slate-500 transition-colors hover:bg-muted hover:text-blue-600 min-[380px]:justify-start"
          >
            {locale === 'vi' ? 'Chi tiết' : 'Details'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <div className="flex items-center gap-1.5">
            <ProductCardCartButton
              skus={(product.skus ?? [])
                .filter((s) => s.status === 'published')
                .map((s) => ({
                  id: s.id,
                  sku_code: s.sku_code,
                  unit: s.unit ?? null,
                  pack_size: s.pack_size ?? null,
                  attributes: (s as any).attributes ?? null
                }))}
              productName={productName}
              locale={locale}
              fallbackSkuCode={product.slug}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
