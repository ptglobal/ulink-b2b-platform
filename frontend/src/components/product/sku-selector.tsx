'use client';

import { useState, useMemo, useCallback } from 'react';
import { ShoppingCart, Check, Package } from '@/components/icons';
import { cn } from '@/lib/utils';

interface SkuItem {
  id: number;
  sku_code: string;
  unit: string | null;
  pack_size: string | null;
  attributes: Record<string, string> | null;
}

interface SkuSelectorLabels {
  addToCart: string;
  added: string;
  quantity: string;
  selectVariant: string;
}

interface SkuSelectorProps {
  skus: SkuItem[];
  labels: SkuSelectorLabels;
}

/**
 * Extract unique attribute names and their possible values from all SKUs.
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
function findMatchingSku(skus: SkuItem[], selections: Record<string, string>): SkuItem | null {
  const selKeys = Object.keys(selections);
  if (selKeys.length === 0) return skus[0] ?? null;

  return (
    skus.find((sku) => {
      if (!sku.attributes) return false;
      return selKeys.every((key) => sku.attributes![key] === selections[key]);
    }) ?? null
  );
}

export default function SkuSelector({ skus, labels }: SkuSelectorProps) {
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

  const selectedSku = useMemo(() => findMatchingSku(skus, selections), [skus, selections]);

  const handleSelect = useCallback((attrName: string, value: string) => {
    setSelections((prev) => ({ ...prev, [attrName]: value }));
    setAdded(false);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!selectedSku) return;

    try {
      const raw = localStorage.getItem('rfq-cart');
      const cart: Array<{ sku: string; product_name: string; note: string }> = raw
        ? JSON.parse(raw)
        : [];

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

  const hasAttributes = attributes.length > 0;

  return (
    <div className="space-y-4">
      {/* Dynamic Attribute Selectors */}
      {hasAttributes ? (
        attributes.map((attr) => (
          <div key={attr.name}>
            <p className="text-sm font-semibold text-foreground mb-2">{attr.name}</p>
            <div className="flex flex-wrap gap-2">
              {attr.values.map((val) => {
                const isSelected = selections[attr.name] === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelect(attr.name, val)}
                    className={cn(
                      'inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium border transition-[color,background-color,border-color,box-shadow,opacity,transform]',
                      !isSelected &&
                        'bg-background hover:border-primary hover:text-primary border-border',
                      isSelected &&
                        'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
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
        /* Fallback: no structured attributes */
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">{labels.selectVariant}</p>
          <div className="flex flex-wrap gap-2">
            {skus.map((sku) => {
              const isSelected = selectedSku?.id === sku.id;
              return (
                <button
                  key={sku.id}
                  type="button"
                  onClick={() => setSelections({})}
                  className={cn(
                    'inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium border transition-[color,background-color,border-color,box-shadow,opacity,transform]',
                    !isSelected &&
                      'bg-background hover:border-primary hover:text-primary border-border',
                    isSelected && 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
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
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground font-mono text-xs">{selectedSku.sku_code}</span>
          {selectedSku.unit && <span className="text-muted-foreground">· {selectedSku.unit}</span>}
        </div>
      )}

      {/* Add to Cart */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!selectedSku}
        className={cn(
          'w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg font-semibold text-sm transition-[color,background-color,border-color,box-shadow,opacity,transform]',
          added
            ? 'bg-green-600 text-white'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20',
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
    </div>
  );
}
