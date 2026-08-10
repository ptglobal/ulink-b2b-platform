'use client';

import React, { useState } from 'react';
import { Plus, Check, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { readCart, persistCart } from '../rfq/cart-types';

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    slug: string;
    brand?: string | null;
    specs?: string[];
    unit?: string;
  };
  className?: string;
}

export function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const cart = readCart();
    const existingIndex = cart.findIndex(
      (item) => item.product_name === product.name || item.sku === product.slug
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        sku: product.slug,
        product_name: product.name,
        spec: product.specs?.join(', ') || '',
        unit: product.unit || 'cái',
        quantity: 1,
        note: ''
      });
    }

    persistCart(cart);

    setAdded(true);
    setToastOpen(true);
    setTimeout(() => {
      setToastOpen(false);
    }, 4000);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleAdd}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all shadow-2xs cursor-pointer ${
          added
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]'
        } ${className}`}
      >
        {added ? (
          <>
            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            Đã thêm
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            Thêm vào RFQ
          </>
        )}
      </button>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 animate-in slide-in-from-bottom duration-300">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="text-xs min-w-0 text-left">
            <p className="font-extrabold text-white">Đã thêm vào Yêu cầu Báo giá!</p>
            <p className="text-slate-300 truncate max-w-[220px] font-medium mt-0.5">{product.name}</p>
          </div>
          <Link
            href="/quick-order"
            className="ml-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-colors shrink-0 shadow-sm"
          >
            Xem RFQ &gt;
          </Link>
        </div>
      )}
    </>
  );
}
