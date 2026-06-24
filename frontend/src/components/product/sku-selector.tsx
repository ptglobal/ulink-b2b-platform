'use client';

import { useState, useCallback } from 'react';
import { ShoppingCart, Check, Package } from 'lucide-react';
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

export default function SkuSelector({ skus, labels }: SkuSelectorProps) {
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
      if (!existing) {
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
    return sku.pack_size || sku.sku_code;
  };

  if (skus.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Variant label */}
      <p className="text-sm font-semibold text-foreground">{labels.selectVariant}</p>

      {/* SKU pills */}
      <div className="flex flex-wrap gap-2">
        {skus.map((sku) => {
          const isSelected = sku.id === selectedId;

          return (
            <button
              key={sku.id}
              type="button"
              onClick={() => handleSelect(sku)}
              className={cn(
                'inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium border transition-all',
                !isSelected && 'bg-background hover:border-primary hover:text-primary border-border',
                isSelected && 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
              )}
            >
              {getSkuLabel(sku)}
            </button>
          );
        })}
      </div>

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
          'w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg font-semibold text-sm transition-all',
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
