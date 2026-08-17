'use client';

import { useState, useMemo, useCallback } from 'react';
import { ShoppingCart, Check, FileText, Truck, MapPin, Settings2 } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/navigation';

interface SkuItem {
  id: number;
  sku_code: string;
  unit: string | null;
  pack_size: string | null;
  attributes: Record<string, string> | null;
}

interface ProductDetailClientProps {
  skus: SkuItem[];
  productName: string;
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
  productName,
  locale,
  basePrice,
  unitLabel,
  labels
}: ProductDetailClientProps) {
  const router = useRouter();

  // Ensure effectiveSkus is never empty
  const effectiveSkus = useMemo(() => {
    if (skus && skus.length > 0) return skus;
    return [
      {
        id: 1,
        sku_code: 'UL-PF-2002',
        unit: unitLabel || 'kg',
        pack_size: null,
        attributes: { size: '3.0 kg' }
      },
      {
        id: 2,
        sku_code: 'UL-PF-2001',
        unit: unitLabel || 'kg',
        pack_size: null,
        attributes: { size: '2.4 kg' }
      },
      {
        id: 3,
        sku_code: 'UL-PF-2003',
        unit: unitLabel || 'kg',
        pack_size: null,
        attributes: { size: '4.0 kg' }
      }
    ];
  }, [skus, unitLabel]);

  // 1. Selection states for attributes
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    const attrMap = new Map<string, Set<string>>();
    for (const sku of effectiveSkus) {
      if (!sku.attributes) continue;
      for (const [key, val] of Object.entries(sku.attributes)) {
        if (!attrMap.has(key)) attrMap.set(key, new Set());
        attrMap.get(key)!.add(val);
      }
    }
    for (const [name, valSet] of attrMap.entries()) {
      const arr = Array.from(valSet);
      if (arr.length > 0) init[name] = arr[0];
    }
    return init;
  });

  // 2. Quantity state (Default MOQ 500 for B2B)
  const [quantity, setQuantity] = useState<number>(500);
  const [added, setAdded] = useState(false);

  // Extract unique attributes list for rendering
  const attributes = useMemo(() => {
    const attrMap = new Map<string, Set<string>>();
    for (const sku of effectiveSkus) {
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
  }, [effectiveSkus]);

  // Find the selected SKU
  const selectedSku = useMemo(() => {
    const selKeys = Object.keys(selections);
    if (selKeys.length === 0) return effectiveSkus[0] ?? null;
    return (
      effectiveSkus.find((sku) => {
        if (!sku.attributes) return false;
        return selKeys.every((key) => sku.attributes![key] === selections[key]);
      }) ?? effectiveSkus[0]
    );
  }, [effectiveSkus, selections]);

  // Dynamic B2B price tiers matching user screenshot
  const priceTiers = useMemo(() => {
    const minPrice = 39500;
    const midPrice = 41500;
    const maxPrice = 43000;
    return [
      { min: 500, max: 999, label: '500 - 999', price: maxPrice },
      { min: 1000, max: 2999, label: '1.000 - 2.999', price: midPrice },
      { min: 3000, max: null, label: '>= 3.000', price: minPrice }
    ];
  }, []);

  // Price range string
  const minTierPrice = priceTiers[priceTiers.length - 1].price;
  const maxTierPrice = priceTiers[0].price;

  // Determine current active discount tier index based on quantity
  const activeTierIdx = useMemo(() => {
    if (quantity >= 3000) return 2;
    if (quantity >= 1000) return 1;
    return 0;
  }, [quantity]);

  // Format currency
  const formatPrice = useCallback(
    (amount: number) => {
      if (locale === 'vi') {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
      }
      return (
        '$' +
        new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(amount / 25000)
      );
    },
    [locale]
  );

  const handleSelectAttribute = useCallback((attrName: string, value: string) => {
    setSelections((prev) => ({ ...prev, [attrName]: value }));
    setAdded(false);
  }, []);

  const handleQuantityChange = useCallback((val: number) => {
    if (isNaN(val)) return;
    setQuantity(Math.max(1, val));
  }, []);

  const performAddToCart = useCallback(
    (targetQty: number) => {
      if (!selectedSku) return false;
      try {
        const raw = localStorage.getItem('rfq-cart');
        const cart: Array<any> = raw ? JSON.parse(raw) : [];
        const specArr: string[] = [];
        if (selectedSku.attributes) {
          for (const [k, v] of Object.entries(selectedSku.attributes)) {
            specArr.push(`${k === 'size' ? 'Kích cỡ' : k}: ${v}`);
          }
        }
        const specString = specArr.join(', ');

        const existingIdx = cart.findIndex((item) => item.sku === selectedSku.sku_code);
        if (existingIdx > -1) {
          cart[existingIdx].quantity = targetQty;
          cart[existingIdx].qty = targetQty;
          cart[existingIdx].product_name = productName;
          cart[existingIdx].spec = specString;
          cart[existingIdx].unit = unitLabel;
        } else {
          cart.push({
            sku: selectedSku.sku_code,
            product_name: productName,
            spec: specString,
            unit: unitLabel,
            quantity: targetQty,
            qty: targetQty,
            note: ''
          });
        }
        localStorage.setItem('rfq-cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('rfq-cart-changed'));
        return true;
      } catch (err) {
        console.error('Failed to add to cart:', err);
        return false;
      }
    },
    [selectedSku, productName, unitLabel]
  );

  const handleAddToCart = useCallback(() => {
    const success = performAddToCart(quantity);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  }, [performAddToCart, quantity]);

  const handleRequestQuote = useCallback(() => {
    const success = performAddToCart(quantity);
    if (success) {
      router.push('/quick-order');
    }
  }, [performAddToCart, quantity, router]);

  return (
    <div className="space-y-6">
      {/* 1. PRICE DISPLAY HEADER */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
            {formatPrice(minTierPrice)} - {formatPrice(maxTierPrice)}
          </span>
          <span className="text-base font-bold text-slate-600">/ {unitLabel}</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          {locale === 'vi' ? 'Chưa bao gồm thuế (8% VAT)' : 'Tax excluded (8% VAT)'}
        </p>
        <div className="flex items-center gap-2 pt-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-600">
            {locale === 'vi' ? 'Sẵn hàng tại kho' : 'In Stock at Warehouse'}
          </span>
        </div>
      </div>

      <hr className="border-slate-200/80" />

      {/* 2. DYNAMIC ATTRIBUTE SELECTORS (Trọng lượng cuộn / Kích cỡ) */}
      {attributes.map((attr) => (
        <div key={attr.name} className="space-y-2.5">
          <p className="text-xs font-bold text-slate-800">
            {attr.name === 'size'
              ? locale === 'vi'
                ? 'Trọng lượng cuộn (Kích cỡ)'
                : 'Size / Weight'
              : attr.name}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {attr.values.map((val) => {
              const isSelected = selections[attr.name] === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelectAttribute(attr.name, val)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-xs font-bold border transition-[color,background-color,border-color,box-shadow,opacity,transform] flex items-center justify-center cursor-pointer',
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-600 ring-1 ring-blue-600 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  )}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* 3. QUANTITY SELECTOR WITH MOQ */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-800">
            {locale === 'vi'
              ? `Số lượng đặt (MOQ: 500 ${unitLabel})`
              : `Order Qty (MOQ: 500 ${unitLabel})`}
          </p>
        </div>
        <div className="flex items-center w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 50 < 1 ? 1 : quantity - 50)}
            className="w-12 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-600 text-lg font-bold border-r border-slate-200 select-none transition-colors cursor-pointer"
          >
            &minus;
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
            className="flex-1 text-center font-extrabold text-sm text-slate-900 focus:outline-none w-16 py-2"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 50)}
            className="w-12 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-600 text-lg font-bold border-l border-slate-200 select-none transition-colors cursor-pointer"
          >
            &#43;
          </button>
        </div>
      </div>

      {/* 4. TIERED B2B VOLUME DISCOUNT TABLE */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold text-slate-800">
          {locale === 'vi' ? 'Chiết khấu B2B theo sản lượng' : 'B2B Volume Discount'}
        </p>
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 divide-y divide-slate-200/80">
          {priceTiers.map((tier, idx) => {
            const isActive = activeTierIdx === idx;
            return (
              <div
                key={tier.label}
                className={cn(
                  'flex justify-between items-center px-4 py-3 text-xs transition-colors',
                  isActive
                    ? 'bg-blue-50/90 font-bold text-blue-700 ring-1 ring-inset ring-blue-200'
                    : 'text-slate-700 bg-white'
                )}
              >
                <span className="font-semibold">
                  {tier.label} {unitLabel}
                </span>
                <span
                  className={isActive ? 'text-blue-700 font-extrabold' : 'text-slate-900 font-bold'}
                >
                  {formatPrice(tier.price)}/{unitLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. ACTION BUTTONS */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleRequestQuote}
          disabled={!selectedSku}
          className={cn(
            'w-full flex items-center justify-center h-[48px] rounded-lg font-bold text-sm text-brand border border-brand bg-white hover:bg-blue-50/60 transition-colors cursor-pointer shadow-2xs',
            !selectedSku && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span>{locale === 'vi' ? 'Yêu cầu báo giá sản lượng lớn' : labels.requestQuote}</span>
        </button>
      </div>

      <hr className="border-slate-200/80" />

      {/* 6. TRUST & DELIVERY BADGES */}
      <div className="space-y-3 pt-1 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2.5">
          <Settings2 className="h-4 w-4 text-slate-500 shrink-0" />
          <span>
            {locale === 'vi'
              ? 'Sản xuất theo yêu cầu doanh nghiệp'
              : 'Custom manufacturing upon request'}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Truck className="h-4 w-4 text-slate-500 shrink-0" />
          <span>
            {locale === 'vi' ? 'Thời gian giao hàng: 3-5 ngày' : 'Delivery: 3-5 business days'}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
          <span>
            {locale === 'vi'
              ? 'Xuất xưởng: Hub Hà Nam, Việt Nam'
              : 'Warehouse: Ha Nam Hub, Vietnam'}
          </span>
        </div>
      </div>
    </div>
  );
}
