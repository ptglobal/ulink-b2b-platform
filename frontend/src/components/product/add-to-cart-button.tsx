'use client';

import { useState, useCallback } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  skuCode: string;
  label?: string;
  addedLabel?: string;
  className?: string;
}

export default function AddToCartButton({
  skuCode,
  label = 'Thêm vào giỏ hàng',
  addedLabel = 'Đã thêm',
  className
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  const handleClick = useCallback(() => {
    try {
      const raw = localStorage.getItem('rfq-cart');
      const cart: Array<{ sku: string; product_name: string; note: string }> = raw ? JSON.parse(raw) : [];

      const existing = cart.find((item) => item.sku === skuCode);
      if (!existing) {
        cart.push({ sku: skuCode, product_name: '', note: '' });
      }

      localStorage.setItem('rfq-cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('rfq-cart-changed'));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  }, [skuCode]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors',
        added
          ? 'bg-green-600 text-white'
          : 'bg-primary text-primary-foreground hover:bg-primary/90',
        className
      )}
    >
      {added ? (
        <>
          <Check className="h-3.5 w-3.5" />
          {addedLabel}
        </>
      ) : (
        <>
          <ShoppingCart className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}
