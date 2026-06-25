'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ShoppingCart, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

export default function ProductCardCartButton({ skus, productName, locale }: ProductCardCartButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(skus[0]?.id ?? null);
  const [added, setAdded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const publishedSkus = skus.filter(s => s.sku_code);
  const hasSingleSku = publishedSkus.length <= 1;

  const getSkuLabel = (sku: SkuOption): string => {
    if (sku.attributes && Object.keys(sku.attributes).length > 0) {
      return Object.values(sku.attributes).join(' / ');
    }
    return sku.sku_code;
  };

  const addToCart = useCallback((skuCode: string, quantity: number) => {
    try {
      const raw = localStorage.getItem('rfq-cart');
      const cart: Array<{ sku: string; qty: number }> = raw ? JSON.parse(raw) : [];

      const existing = cart.find((item) => item.sku === skuCode);
      if (existing) {
        existing.qty += quantity;
      } else {
        cart.push({ sku: skuCode, qty: quantity });
      }

      localStorage.setItem('rfq-cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('rfq-cart-changed'));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasSingleSku) {
      const sku = publishedSkus[0];
      if (sku) addToCart(sku.sku_code, 1);
    } else {
      setShowModal(true);
      setSelectedId(publishedSkus[0]?.id ?? null);
    }
  }, [hasSingleSku, publishedSkus, addToCart]);

  const handleAddFromModal = useCallback(() => {
    const sku = publishedSkus.find(s => s.id === selectedId);
    if (sku) {
      addToCart(sku.sku_code, 1);
      setShowModal(false);
    }
  }, [selectedId, publishedSkus, addToCart]);

  // Close modal on click outside
  useEffect(() => {
    if (!showModal) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal]);

  // Close on ESC
  useEffect(() => {
    if (!showModal) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showModal]);

  if (publishedSkus.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
          added
            ? 'bg-green-600 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        )}
      >
        {added ? (
          <>
            <Check className="h-3.5 w-3.5" />
            {locale === 'vi' ? 'Đã thêm' : locale === 'ja' ? '追加済み' : 'Added'}
          </>
        ) : (
          <>
            <ShoppingCart className="h-3.5 w-3.5" />
            {locale === 'vi' ? 'Thêm vào giỏ' : locale === 'ja' ? 'カートに追加' : 'Add to Cart'}
          </>
        )}
      </button>

      {/* SKU Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-2xl w-[340px] max-w-[90vw] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 truncate pr-4">
                {productName}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Variant selector */}
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  {locale === 'vi' ? 'Chọn loại' : locale === 'ja' ? 'タイプを選択' : 'Select variant'}
                </p>
                <div className="flex flex-col gap-2">
                  {publishedSkus.map((sku) => {
                    const isSelected = sku.id === selectedId;
                    const label = getSkuLabel(sku);
                    return (
                      <button
                        key={sku.id}
                        type="button"
                        onClick={() => setSelectedId(sku.id)}
                        className={cn(
                          'px-3 py-2.5 rounded-lg text-xs font-medium text-left border transition-all',
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

            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={handleAddFromModal}
                disabled={!selectedId}
                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" />
                {locale === 'vi' ? 'Thêm vào giỏ hàng' : locale === 'ja' ? 'カートに追加' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
