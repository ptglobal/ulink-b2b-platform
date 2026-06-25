'use client';

import { useState, useCallback } from 'react';
import { ShoppingCart, Check, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkuItem {
  id: number;
  sku_code: string;
  unit: string | null;
  pack_size: string | null;
  attributes: Record<string, string> | null;
}

interface ProductDetailClientProps {
  skus: SkuItem[];
  labels: {
    addToCart: string;
    added: string;
    selectVariant: string;
    requestQuote: string;
    size: string;
  };
}

export default function ProductDetailClient({ skus, labels }: ProductDetailClientProps) {
  const [selectedId, setSelectedId] = useState<number | null>(skus[0]?.id ?? null);
  const [added, setAdded] = useState(false);

  const selectedSku = skus.find((s) => s.id === selectedId) ?? null;

  const handleSelect = useCallback((sku: SkuItem) => {
    setSelectedId(sku.id);
    setAdded(false);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!selectedSku) return;

    try {
      const raw = localStorage.getItem('rfq-cart');
      const cart: Array<{ sku: string; qty: number }> = raw ? JSON.parse(raw) : [];

      const existing = cart.find((item) => item.sku === selectedSku.sku_code);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ sku: selectedSku.sku_code, qty: 1 });
      }

      localStorage.setItem('rfq-cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('rfq-cart-changed'));
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  }, [selectedSku]);

  // Determine display label for each SKU pill
  const getSkuLabel = (sku: SkuItem): string => {
    if (sku.attributes && Object.keys(sku.attributes).length > 0) {
      return Object.values(sku.attributes).join(' / ');
    }
    return sku.sku_code;
  };

  if (skus.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Size / Variant Selector */}
      {skus.length > 1 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">{labels.size}</p>
          <div className="flex flex-col gap-2">
            {skus.map((sku) => {
              const isSelected = sku.id === selectedId;
              const label = getSkuLabel(sku);
              return (
                <button
                  key={sku.id}
                  type="button"
                  onClick={() => handleSelect(sku)}
                  className={cn(
                    'px-3.5 py-2.5 rounded-lg text-xs font-medium text-left border transition-all',
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!selectedSku}
        className={cn(
          'w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg font-semibold text-sm transition-all',
          added
            ? 'bg-green-600 text-white'
            : 'bg-gray-900 text-white hover:bg-gray-800',
          !selectedSku && 'opacity-50 cursor-not-allowed'
        )}
      >
        {added ? (
          <>
            <Check className="h-4 w-4" />
            {labels.added}
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            {labels.addToCart}
          </>
        )}
      </button>

      {/* Request Quote Button */}
      <button
        type="button"
        className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <FileText className="h-4 w-4" />
        {labels.requestQuote}
      </button>
    </div>
  );
}
