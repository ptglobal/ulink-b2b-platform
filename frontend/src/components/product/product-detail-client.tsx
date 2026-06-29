'use client';

import { useState, useMemo, useCallback } from 'react';
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
  };
}

/**
 * Extract unique attribute names and their possible values from all SKUs.
 * Returns array of { name, values } maintaining insertion order.
 */
function extractAttributes(skus: SkuItem[]): { name: string; values: string[] }[] {
  const attrMap = new Map<string, Set<string>>();

  for (const sku of skus) {
    if (!sku.attributes) continue;
    for (const [key, val] of Object.entries(sku.attributes)) {
      if (!attrMap.has(key)) attrMap.set(key, new Set());
      attrMap.get(key)!.add(val);
    }
  }

  return Array.from(attrMap.entries()).map(([name, valSet]) => ({
    name,
    values: Array.from(valSet)
  }));
}

/**
 * Find the SKU that matches all selected attribute values.
 */
function findMatchingSku(
  skus: SkuItem[],
  selections: Record<string, string>
): SkuItem | null {
  const selKeys = Object.keys(selections);
  if (selKeys.length === 0) return skus[0] ?? null;

  return (
    skus.find((sku) => {
      if (!sku.attributes) return false;
      return selKeys.every((key) => sku.attributes![key] === selections[key]);
    }) ?? null
  );
}

export default function ProductDetailClient({ skus, labels }: ProductDetailClientProps) {
  const attributes = useMemo(() => extractAttributes(skus), [skus]);

  // Initialize selections with first value of each attribute
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const attr of extractAttributes(skus)) {
      if (attr.values.length > 0) init[attr.name] = attr.values[0];
    }
    return init;
  });

  const [added, setAdded] = useState(false);

  const selectedSku = useMemo(
    () => findMatchingSku(skus, selections),
    [skus, selections]
  );

  const handleSelect = useCallback((attrName: string, value: string) => {
    setSelections((prev) => ({ ...prev, [attrName]: value }));
    setAdded(false);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!selectedSku) return;

    try {
      const raw = localStorage.getItem('rfq-cart');
      const cart: Array<{ sku: string; product_name: string; note: string }> = raw ? JSON.parse(raw) : [];

      const existing = cart.find((item) => item.sku === selectedSku.sku_code);
      if (!existing) {
        cart.push({ sku: selectedSku.sku_code, product_name: '', note: '' });
      }

      localStorage.setItem('rfq-cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('rfq-cart-changed'));
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  }, [selectedSku]);

  if (skus.length === 0) return null;

  // Fallback: if no attributes, show flat list by sku_code
  const hasAttributes = attributes.length > 0;

  return (
    <div className="space-y-4">
      {/* Dynamic Attribute Selectors */}
      {hasAttributes ? (
        attributes.map((attr) => (
          <div key={attr.name}>
            <p className="text-xs font-medium text-gray-500 mb-2">{attr.name}</p>
            <div className="flex flex-wrap gap-2">
              {attr.values.map((val) => {
                const isSelected = selections[attr.name] === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelect(attr.name, val)}
                    className={cn(
                      'px-3.5 py-2 rounded-lg text-xs font-medium border transition-all',
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    )}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      ) : skus.length > 1 ? (
        /* Fallback: no structured attributes — show sku_code list */
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">{labels.selectVariant}</p>
          <div className="flex flex-wrap gap-2">
            {skus.map((sku) => {
              const isSelected = selectedSku?.id === sku.id;
              return (
                <button
                  key={sku.id}
                  type="button"
                  onClick={() => setSelections({})}
                  className={cn(
                    'px-3.5 py-2 rounded-lg text-xs font-medium border transition-all',
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  )}
                >
                  {sku.pack_size || sku.sku_code}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Selected SKU info */}
      {selectedSku && (
        <p className="text-xs text-gray-400">SKU: {selectedSku.sku_code}</p>
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
