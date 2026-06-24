import Link from 'next/link';
import Image from 'next/image';
import { Package, ShieldCheck, Clock, BoxesIcon, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { getTranslatedName, getTranslatedField } from '@/lib/i18n-content';
import type { Product } from '@/lib/directus';

interface ProductCardProps {
  product: Product;
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const DIRECTUS_URL = getDirectusUrl();
  const productName = getTranslatedName(product, locale);

  // Derive stock status from SKUs — show worst-case to alert buyers
  const stockStatus = (() => {
    if (!product.skus || product.skus.length === 0) return null;
    const allOut = product.skus.every((sku) => sku.stock_status === 'out_of_stock');
    if (allOut) {
      return { label: 'Hết hàng', className: 'bg-red-100 text-red-800 border-red-200' };
    }
    if (product.skus.some((sku) => sku.stock_status === 'low_stock')) {
      return { label: 'Sắp hết hàng', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    }
    return { label: 'Sẵn sàng', className: 'bg-green-100 text-green-800 border-green-200' };
  })();

  const firstSku = product.skus?.[0];
  const firstSkuCode = firstSku?.sku_code;

  // Get first standard name (translated)
  const firstStandard = product.standards?.[0];
  const standardName = firstStandard && typeof firstStandard.standards_id === 'object'
    ? getTranslatedName(firstStandard.standards_id, locale)
    : null;

  // Get pack size from first SKU
  const packSize = firstSku?.pack_size;

  // Find TDS document
  const tdsDoc = product.documents?.find((doc) => doc.doc_type === 'tds');

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md">
      {/* Hero image */}
      <Link href={`/${locale}/solutions/${product.slug}`} className="relative aspect-[4/3] w-full bg-muted block">
        {product.hero ? (
          <Image
            src={`${DIRECTUS_URL}/assets/${product.hero}`}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Stock status badge — top LEFT */}
        {stockStatus && (
          <span
            className={cn(
              'absolute left-2 top-2 rounded-full border px-2 py-0.5 text-xs font-medium',
              stockStatus.className
            )}
          >
            {stockStatus.label}
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>
        )}

        <Link href={`/${locale}/solutions/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 font-semibold leading-tight hover:text-primary transition-colors">
            {productName}
          </h3>
        </Link>

        {firstSkuCode && (
          <p className="mt-1 text-xs font-mono text-muted-foreground">
            SKU: {firstSkuCode}
          </p>
        )}

        {/* 3 key attribute icons */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {standardName && (
            <span className="flex items-center gap-1" title="Tiêu chuẩn">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span className="truncate max-w-[80px]">{standardName}</span>
            </span>
          )}
          <span className="flex items-center gap-1" title="Giao hàng">
            <Clock className="h-3.5 w-3.5 text-orange-500" />
            <span>24-48h</span>
          </span>
          {packSize && (
            <span className="flex items-center gap-1" title="Quy cách">
              <BoxesIcon className="h-3.5 w-3.5 text-purple-600" />
              <span>{packSize}</span>
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex items-center gap-2 pt-4">
          <Link
            href={`/${locale}/solutions/${product.slug}?rfq=1`}
            className="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Báo giá nhanh
          </Link>
          {tdsDoc ? (
            <a
              href={`${DIRECTUS_URL}/assets/${typeof tdsDoc.file === 'object' && tdsDoc.file ? tdsDoc.file.id : tdsDoc.file}?download`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-input px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
              title="Tải TDS"
            >
              <FileDown className="h-3.5 w-3.5 mr-1" />
              TDS
            </a>
          ) : (
            <span className="inline-flex items-center justify-center rounded-md border border-input px-3 py-2 text-xs font-medium text-muted-foreground opacity-50 cursor-not-allowed">
              <FileDown className="h-3.5 w-3.5 mr-1" />
              TDS
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
