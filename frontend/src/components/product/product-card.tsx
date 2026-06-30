import Link from 'next/link';
import Image from 'next/image';
import { Package, ShieldCheck, Clock, BoxesIcon, FileDown, Bookmark } from 'lucide-react';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { getTranslatedName } from '@/lib/i18n-content';
import ProductCardCartButton from './product-card-cart-button';
import type { Product } from '@/lib/directus';

interface ProductCardProps {
  product: Product;
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const DIRECTUS_URL = getDirectusUrl();
  const productName = getTranslatedName(product, locale);

  const firstSku = product.skus?.[0];
  const firstSkuCode = firstSku?.sku_code;

  // Get first standard name (translated)
  const firstStandard = product.standards?.[0];
  const standardName = firstStandard && typeof firstStandard.standards_id === 'object'
    ? getTranslatedName(firstStandard.standards_id, locale)
    : null;

  // Get pack size from first SKU
  const packSize = firstSku?.pack_size;

  // Show TDS download only when published document exists.
  const tdsDoc = product.documents?.find((doc) => doc.doc_type === 'tds' && doc.status === 'published');
  const tdsFileId =
    typeof tdsDoc?.file === 'string'
      ? tdsDoc.file
      : typeof tdsDoc?.file === 'object'
        ? tdsDoc.file?.id ?? null
        : null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:border-blue-200">
      {/* Hero image */}
      <Link href={`/${locale}/solutions/${product.slug}`} className="relative aspect-[5/3] w-full bg-gray-50 block overflow-hidden">
        {product.hero ? (
          <Image
            src={`${DIRECTUS_URL}/assets/${product.hero}`}
            alt={productName}
            fill
            className="object-contain p-4 transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
        )}

        {/* Bookmark icon */}
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors">
          <Bookmark className="h-4 w-4 text-gray-500" />
        </button>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col px-4 pt-3 pb-4">
        <Link href={`/${locale}/solutions/${product.slug}`}>
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {productName}
          </h3>
        </Link>

        {firstSkuCode && (
          <p className="mt-1 text-xs font-mono text-gray-500">
            Mã SKU: {firstSkuCode}
          </p>
        )}

        {/* Divider */}
        <div className="mt-3 border-t border-gray-100" />

        {/* 3 key attributes row */}
        <div className="mt-3 grid grid-cols-3 divide-x divide-gray-200">
          {/* Standard */}
          <div className="flex flex-col items-center gap-1 px-1">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span className="text-[10px] font-medium text-gray-900 text-center leading-tight truncate w-full">
              {standardName || 'ESD'}
            </span>
            <span className="text-[9px] text-gray-500 text-center leading-tight">
              {locale === 'vi' ? 'Bảo vệ tĩnh điện' : 'ESD Protection'}
            </span>
          </div>

          {/* Delivery */}
          <div className="flex flex-col items-center gap-1 px-1">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-[10px] font-medium text-gray-900 text-center leading-tight">
              24h
            </span>
            <span className="text-[9px] text-gray-500 text-center leading-tight">
              {locale === 'vi' ? 'Giao hàng dự kiến' : 'Est. delivery'}
            </span>
          </div>

          {/* Pack size */}
          <div className="flex flex-col items-center gap-1 px-1">
            <BoxesIcon className="h-4 w-4 text-purple-600" />
            <span className="text-[10px] font-medium text-gray-900 text-center leading-tight truncate w-full">
              {packSize || '100 pcs'}
            </span>
            <span className="text-[9px] text-gray-500 text-center leading-tight">
              {locale === 'vi' ? 'Tối ưu đóng gói' : 'Min. order'}
            </span>
          </div>
        </div>

        {/* Action row */}
        <div className="mt-auto flex items-center gap-2 pt-3">
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
          />
          {tdsFileId ? (
            <a
              href={`/api/files/${tdsFileId}?download`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              title="Download TDS"
            >
              <FileDown className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
