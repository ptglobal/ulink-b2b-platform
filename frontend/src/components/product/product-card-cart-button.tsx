'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Check } from '@/components/icons';
import { cn } from '@/lib/utils';
import { readCart, persistCart } from '@/components/rfq/cart-types';

interface SkuOption {
  id: number;
  sku_code: string;
  unit: string | null;
  pack_size: string | null;
  attributes: Record<string, string> | null;
}

interface ProductCardCartButtonProps {
  skus: SkuOption[];
  productName: string;
  locale: string;
  fallbackSkuCode?: string;
}

export default function ProductCardCartButton({
  skus,
  productName,
  locale,
  fallbackSkuCode
}: ProductCardCartButtonProps) {
  const [added, setAdded] = useState(false);

  const publishedSkus = skus.filter((s) => s.sku_code);

  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [added]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const cart = readCart();
      const skuCode = publishedSkus[0]?.sku_code || fallbackSkuCode || productName;

      const existingIndex = cart.findIndex(
        (item) => item.sku === skuCode || item.product_name === productName
      );

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          sku: skuCode,
          product_name: productName,
          spec: publishedSkus[0]?.pack_size || '',
          unit: publishedSkus[0]?.unit || 'cái',
          quantity: 1,
          note: ''
        });
      }

      persistCart(cart);
      setAdded(true);
    },
    [publishedSkus, fallbackSkuCode, productName]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'ulink-pressable inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-[3px] px-4 text-xs font-bold',
        added
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      )}
    >
      {added ? (
        <>
          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
          {locale === 'vi' ? 'Đã thêm' : locale === 'ja' ? '追加済み' : 'Added'}
        </>
      ) : (
        <>
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          {locale === 'vi' ? 'Thêm vào RFQ' : locale === 'ja' ? 'RFQに追加' : 'Add to RFQ'}
        </>
      )}
    </button>
  );
}
