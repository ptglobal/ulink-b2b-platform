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
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface SkuSelectorLabels {
  addToCart: string;
  inStock: string;
  lowStock: string;
  outOfStock: string;
  outOfStockTooltip: string;
  added: string;
  quantity: string;
  selectVariant: string;
}

interface SkuSelectorProps {
  skus: SkuItem[];
  labels: SkuSelectorLabels;
}

export default function SkuSelector({ skus, labels }: SkuSelectorProps) {
  // Auto-select first in-stock SKU
  const firstAvailable = skus.find((s) => s.stock_status !== 'out_of_stock');
  const [selectedId, setSelectedId] = useState<number | null>(firstAvailable?.id ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedSku = skus.find((s) => s.id === selectedId) ?? null;

  // Extract unique attribute keys across all SKUs for grouped display
  const attributeKeys: string[] = [];
  for (const sku of skus) {
    if (sku.attributes) {
      for (const key of Object.keys(sku.attributes)) {
        if (!attributeKeys.includes(key)) attributeKeys.push(key);
      }
    }
  }

  const handleSelect = useCallback((sku: SkuItem) => {
    if (sku.stock_status === 'out_of_stock') return;
    setSelectedId(sku.id);
    setAdded(false);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!selectedSku || selectedSku.stock_status === 'out_of_stock') return;

    try {
      const raw = localStorage.getItem('rfq-cart');
      const cart: Array<{ sku: string; qty: number }> = raw ? JSON.parse(raw) : [];

      const existing = cart.find((item) => item.sku === selectedSku.sku_code);
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({ sku: selectedSku.sku_code, qty });
      }

      localStorage.setItem('rfq-cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('rfq-cart-changed'));
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  }, [selectedSku, qty]);

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
          const isOutOfStock = sku.stock_status === 'out_of_stock';

          return (
            <div key={sku.id} className="relative group">
              <button
                type="button"
                onClick={() => handleSelect(sku)}
                disabled={isOutOfStock}
                className={cn(
                  'inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium border transition-all',
                  isOutOfStock && 'opacity-50 cursor-not-allowed line-through bg-muted text-muted-foreground border-muted',
                  !isOutOfStock && !isSelected && 'bg-background hover:border-primary hover:text-primary border-border',
                  isSelected && 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                )}
              >
                {getSkuLabel(sku)}
              </button>

              {/* Tooltip for out-of-stock */}
              {isOutOfStock && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {labels.outOfStockTooltip}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected SKU info */}
      {selectedSku && (
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground font-mono text-xs">{selectedSku.sku_code}</span>
          {selectedSku.unit && <span className="text-muted-foreground">· {selectedSku.unit}</span>}
          <span className={cn(
            'inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full',
            selectedSku.stock_status === 'in_stock' && 'bg-green-50 text-green-700',
            selectedSku.stock_status === 'low_stock' && 'bg-yellow-50 text-yellow-700',
            selectedSku.stock_status === 'out_of_stock' && 'bg-red-50 text-red-700'
          )}>
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              selectedSku.stock_status === 'in_stock' && 'bg-green-500',
              selectedSku.stock_status === 'low_stock' && 'bg-yellow-500',
              selectedSku.stock_status === 'out_of_stock' && 'bg-red-500'
            )} />
            {selectedSku.stock_status === 'in_stock' && labels.inStock}
            {selectedSku.stock_status === 'low_stock' && labels.lowStock}
            {selectedSku.stock_status === 'out_of_stock' && labels.outOfStock}
          </span>
        </div>
      )}

      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <label htmlFor="sku-qty" className="sr-only">{labels.quantity}</label>
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-10 w-10 rounded-l-lg border border-r-0 flex items-center justify-center text-lg font-medium hover:bg-muted transition-colors"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            id="sku-qty"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="h-10 w-14 border-y text-center text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="h-10 w-10 rounded-r-lg border border-l-0 flex items-center justify-center text-lg font-medium hover:bg-muted transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedSku || selectedSku.stock_status === 'out_of_stock'}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg font-semibold text-sm transition-all',
            added
              ? 'bg-green-600 text-white'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20',
            (!selectedSku || selectedSku.stock_status === 'out_of_stock') && 'opacity-50 cursor-not-allowed'
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
    </div>
  );
}
