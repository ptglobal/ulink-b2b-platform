'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
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
  locale: string;
  basePrice: number;
  unitLabel: string;
  labels: {
    addToCart: string;
    added: string;
    selectVariant: string;
    requestQuote: string;
  };
}

export default function ProductDetailClient({
  skus,
  locale,
  basePrice,
  unitLabel,
  labels
}: ProductDetailClientProps) {
  // 1. Selection states for attributes
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    // Extract unique attributes
    const attrMap = new Map<string, Set<string>>();
    for (const sku of skus) {
      if (!sku.attributes) continue;
      for (const [key, val] of Object.entries(sku.attributes)) {
        if (!attrMap.has(key)) attrMap.set(key, new Set());
        attrMap.get(key)!.add(val);
      }
    }
    // Set first attribute value as default selection
    for (const [name, valSet] of attrMap.entries()) {
      const arr = Array.from(valSet);
      if (arr.length > 0) init[name] = arr[0];
    }
    return init;
  });

  // 2. Quantity state
  const [quantity, setQuantity] = useState<number>(100);
  const [added, setAdded] = useState(false);

  // Extract unique attributes list for rendering
  const attributes = useMemo(() => {
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
  }, [skus]);

  // Find the selected SKU
  const selectedSku = useMemo(() => {
    const selKeys = Object.keys(selections);
    if (selKeys.length === 0) return skus[0] ?? null;
    return (
      skus.find((sku) => {
        if (!sku.attributes) return false;
        return selKeys.every((key) => sku.attributes![key] === selections[key]);
      }) ?? null
    );
  }, [skus, selections]);

  // Determine current active discount tier index based on quantity
  const activeTierIdx = useMemo(() => {
    if (quantity < 100) return 0;
    if (quantity < 300) return 1;
    if (quantity < 500) return 2;
    return 3;
  }, [quantity]);

  // Dynamic pricing tiers multiplier
  const priceTiers = useMemo(() => {
    return [
      { min: 50, max: 99, multiplier: 1.2, label: '50–99' },
      { min: 100, max: 299, multiplier: 1.0, label: '100–299' },
      { min: 300, max: 499, multiplier: 0.84, label: '300–499' },
      { min: 500, max: null, multiplier: 0.72, label: '500+' }
    ];
  }, []);

  // Format currency dynamically based on locale
  const formatPrice = useCallback((amount: number) => {
    if (locale === 'vi') {
      return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    }
    return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount / 25000);
  }, [locale]);

  // Calculate current unit price
  const currentUnitPrice = useMemo(() => {
    const tier = priceTiers[activeTierIdx];
    return Math.round(basePrice * tier.multiplier);
  }, [basePrice, activeTierIdx, priceTiers]);

  const handleSelectAttribute = useCallback((attrName: string, value: string) => {
    setSelections((prev) => ({ ...prev, [attrName]: value }));
    setAdded(false);
  }, []);

  const handleQuantityChange = useCallback((val: number) => {
    if (isNaN(val)) return;
    setQuantity(Math.max(1, val));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!selectedSku) return;

    try {
      const raw = localStorage.getItem('rfq-cart');
      const cart: Array<{ sku: string; qty: number; note: string }> = raw ? JSON.parse(raw) : [];

      const existingIdx = cart.findIndex((item) => item.sku === selectedSku.sku_code);
      if (existingIdx > -1) {
        cart[existingIdx].qty = quantity;
      } else {
        cart.push({ sku: selectedSku.sku_code, qty: quantity, note: '' });
      }

      localStorage.setItem('rfq-cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('rfq-cart-changed'));
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  }, [selectedSku, quantity]);

  if (skus.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* 1. Price block */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-blue-600">
            {formatPrice(currentUnitPrice)}
          </span>
          <span className="text-sm font-semibold text-slate-500">
            / {unitLabel}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          {locale === 'vi' ? 'Đã bao gồm thuế (8% VAT)' : 'Tax included (8% VAT)'}
        </p>
        <div className="flex items-center gap-1.5 pt-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-emerald-600">
            {locale === 'vi' ? 'Còn hàng' : 'In Stock'}
          </span>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 2. Dynamic Attribute Selectors */}
      {attributes.map((attr) => (
        <div key={attr.name} className="space-y-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {attr.name === 'size' ? (locale === 'vi' ? 'Kích cỡ' : 'Size') : attr.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {attr.values.map((val) => {
              const isSelected = selections[attr.name] === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelectAttribute(attr.name, val)}
                  className={cn(
                    'w-10 h-8 rounded-md text-xs font-bold border transition-all flex items-center justify-center',
                    isSelected
                      ? 'border-blue-600 text-blue-600 bg-white ring-1 ring-blue-600'
                      : 'border-gray-200 text-slate-700 hover:border-gray-300 bg-white'
                  )}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* 3. Quantity input */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {locale === 'vi' ? 'Số lượng' : 'Quantity'}
        </p>
        <div className="flex items-center w-full max-w-[200px] bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            className="w-10 h-9 flex items-center justify-center hover:bg-slate-50 text-slate-600 text-lg font-medium border-r border-gray-200 select-none transition-colors"
          >
            &minus;
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
            className="flex-1 text-center font-bold text-sm text-slate-800 focus:outline-none w-12"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            className="w-10 h-9 flex items-center justify-center hover:bg-slate-50 text-slate-600 text-lg font-medium border-l border-gray-200 select-none transition-colors"
          >
            &#43;
          </button>
        </div>
      </div>

      {/* 4. Quantity Discount Table */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {locale === 'vi' ? 'Chiết khấu theo số lượng' : 'Volume Discount'}
        </p>
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white divide-y divide-gray-150">
          {priceTiers.map((tier, idx) => {
            const isActive = activeTierIdx === idx;
            const tierPrice = Math.round(basePrice * tier.multiplier);
            return (
              <div
                key={tier.label}
                className={cn(
                  'flex justify-between items-center px-4 py-2.5 text-xs transition-colors',
                  isActive ? 'bg-blue-50/60 font-bold text-blue-600' : 'text-slate-600'
                )}
              >
                <span>
                  {tier.label} {unitLabel}
                </span>
                <span className={isActive ? 'text-blue-600' : 'text-slate-900 font-semibold'}>
                  {formatPrice(tierPrice)}/{unitLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedSku}
          className={cn(
            'w-full flex items-center justify-center gap-2 h-11 rounded-lg font-bold text-sm transition-all shadow-sm',
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
            !selectedSku && 'opacity-50 cursor-not-allowed'
          )}
        >
          {added ? (
            <>
              <Check className="h-4.5 w-4.5" />
              {labels.added}
            </>
          ) : (
            <>
              <ShoppingCart className="h-4.5 w-4.5" />
              {locale === 'vi' ? 'Thêm vào giỏ hàng' : labels.addToCart}
            </>
          )}
        </button>

        <Link
          href={`/${locale}/rfq`}
          className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg font-bold text-sm border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors bg-white"
        >
          <FileText className="h-4.5 w-4.5" />
          {locale === 'vi' ? 'Yêu cầu báo giá sản lượng lớn' : labels.requestQuote}
        </Link>
      </div>
    </div>
  );
}
