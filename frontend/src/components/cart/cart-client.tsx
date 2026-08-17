'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  FileText,
  Phone,
  Mail,
  MapPin,
  Tag,
  Package,
  CheckCircle2,
  CalendarDays,
  Bookmark,
  Edit3,
  ChevronRight
} from '@/components/icons';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/lib/auth-helpers';
import { readCart, persistCart, type CartItem } from '@/components/rfq/cart-types';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';

/* ───────────────────── static data lookup ───────────────────── */

interface StaticProductInfo {
  name: string;
  spec: string;
  unit: string;
  basePrice: number;
  image?: string;
  moq: number;
}

const PRODUCT_DATABASE: Record<string, StaticProductInfo> = {
  'UL-PF-2002': {
    name: 'Màng quấn Pallet - Đóng kiện hàng (Stretch film)',
    spec: 'Khổ 50cm, Trọng lượng cuộn 3.0 kg, lõi giấy ø 76 mm',
    unit: 'kg',
    basePrice: 54861,
    moq: 500
  },
  'UL-PE-1008': {
    name: 'Túi PE trong suốt - Đựng thực phẩm',
    spec: 'Khổ 30x40cm, dày 0.03mm, PE dẻo dai',
    unit: 'kg',
    basePrice: 33333,
    moq: 200
  },
  'CR-GLV-001': {
    name: 'Găng tay Nitrile - Bảo hộ công nghiệp',
    spec: 'Size M, Phủ Nitrile lòng bàn tay',
    unit: 'đôi',
    basePrice: 3472, // 2500 / 0.72 = ~3472
    moq: 200
  },
  'polyester-cleanroom-wipers': {
    name: 'Khăn lau phòng sạch Polyester',
    spec: '9x9 inches, 150 cái/gói',
    unit: 'gói',
    basePrice: 347222, // 250000 / 0.72
    moq: 100
  },
  'tyvek-cleanroom-coverall': {
    name: 'Bộ quần áo phòng sạch Tyvek',
    spec: 'Chống tĩnh điện, size L',
    unit: 'bộ',
    basePrice: 250000,
    moq: 50
  },
  'cleanroom-face-mask-3ply': {
    name: 'Khẩu trang phòng sạch 3 lớp',
    spec: 'Chỉ số BFE > 99%',
    unit: 'hộp',
    basePrice: 104166,
    moq: 100
  },
  'esd-wrist-strap': {
    name: 'Vòng đeo tay chống tĩnh điện',
    spec: 'Dây co giãn tốt',
    unit: 'cái',
    basePrice: 62500,
    moq: 50
  },
  'esd-table-mat-2layer': {
    name: 'Thảm cao su chống tĩnh điện 2 lớp',
    spec: '10m x 1m x 2mm',
    unit: 'cuộn',
    basePrice: 1666666,
    moq: 10
  },
  'ipa-cleanroom-grade-999': {
    name: 'Cồn IPA phòng sạch 99.9%',
    spec: 'Chai xịt 500ml',
    unit: 'chai',
    basePrice: 131944,
    moq: 50
  },
  'sticky-mat-30-layers': {
    name: 'Thảm dính bụi Sticky Mat',
    spec: '60cm x 90cm, 30 lớp/tấm',
    unit: 'tấm',
    basePrice: 208333,
    moq: 30
  },
  'esd-shielding-bag': {
    name: 'Túi chống tĩnh điện ESD Shielding',
    spec: '15cm x 20cm',
    unit: 'túi',
    basePrice: 4861,
    moq: 500
  },
  'sterile-latex-cleanroom-gloves': {
    name: 'Găng tay Latex phòng sạch tiệt trùng',
    spec: 'Size 7.0, tiệt trùng từng đôi',
    unit: 'đôi',
    basePrice: 6250,
    moq: 200
  }
};

/* ───────────────────── pricing logic ───────────────────── */

function getTierMultiplier(qty: number): number {
  if (qty < 100) return 1.2;
  if (qty < 300) return 1.0;
  if (qty < 500) return 0.84;
  return 0.72;
}

export interface SuggestedProduct {
  sku: string;
  slug: string;
  name: string;
  priceText: string;
  moq: number;
  moqText: string;
  desc: string;
  hub: string;
  hero: string | null;
}

export default function CartClient({
  user,
  locale,
  suggestedProducts = [],
  dbProductMap = {}
}: {
  user: AuthUser | null;
  locale: string;
  suggestedProducts?: SuggestedProduct[];
  dbProductMap?: Record<string, { hero: string | null; slug: string }>;
}) {
  const t = useTranslations('cartPage');
  const DIRECTUS_URL = getDirectusUrl();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Load cart on mount
  useEffect(() => {
    setCart(readCart());
  }, []);

  const saveCart = useCallback((newCart: CartItem[]) => {
    setCart(newCart);
    persistCart(newCart);
  }, []);

  const handleQtyChange = useCallback(
    (index: number, newQty: number) => {
      const updated = cart.map((item, idx) => {
        if (idx === index) {
          const info = PRODUCT_DATABASE[item.sku];
          const minQty = info ? info.moq : 1;
          return { ...item, quantity: Math.max(minQty, newQty) };
        }
        return item;
      });
      saveCart(updated);
    },
    [cart, saveCart]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const updated = cart.filter((_, idx) => idx !== index);
      saveCart(updated);
    },
    [cart, saveCart]
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);

    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'ULINKB2B') {
      setDiscountPercent(10);
      setPromoSuccess(
        locale === 'vi'
          ? 'Áp dụng mã giảm giá 10% thành công!'
          : 'Applied 10% discount successfully!'
      );
    } else {
      setPromoError(locale === 'vi' ? 'Mã giảm giá không hợp lệ.' : 'Invalid discount code.');
      setDiscountPercent(0);
    }
  };

  /* ── calculations ── */
  const resolvedItems = useMemo(() => {
    return cart.map((item) => {
      const info = PRODUCT_DATABASE[item.sku] || {
        name: item.product_name || item.sku,
        spec: item.spec || 'Sản phẩm doanh nghiệp',
        unit: item.unit || 'cái',
        basePrice: 100000,
        moq: 1
      };

      const dbInfo = dbProductMap[item.sku];
      const hero = dbInfo?.hero || null;
      const slug = dbInfo?.slug || null;

      const multiplier = getTierMultiplier(item.quantity);
      const unitPrice = Math.round(info.basePrice * multiplier);
      const total = unitPrice * item.quantity;

      return {
        ...item,
        product_name: info.name,
        spec: info.spec,
        unit: info.unit,
        unitPrice,
        total,
        hero,
        slug
      };
    });
  }, [cart, dbProductMap]);

  const subtotal = useMemo(() => {
    return resolvedItems.reduce((sum, item) => sum + item.total, 0);
  }, [resolvedItems]);

  const vat = useMemo(() => Math.round(subtotal * 0.08), [subtotal]);
  const discountAmount = useMemo(
    () => Math.round((subtotal + vat) * (discountPercent / 100)),
    [subtotal, vat, discountPercent]
  );
  const grandTotal = useMemo(
    () => subtotal + vat - discountAmount,
    [subtotal, vat, discountAmount]
  );

  const formatPrice = (amount: number) => {
    if (locale === 'vi') {
      return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    }
    return (
      '$' +
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        amount / 25000
      )
    );
  };

  /* ── suggested products click ── */
  const handleAddSuggested = (prod: SuggestedProduct) => {
    const existingIdx = cart.findIndex((item) => item.sku === prod.sku);
    if (existingIdx > -1) {
      handleQtyChange(existingIdx, cart[existingIdx].quantity + prod.moq);
    } else {
      const newItem: CartItem = {
        sku: prod.sku,
        product_name: prod.name,
        spec: prod.desc || 'Sản phẩm phòng sạch công nghiệp',
        unit: prod.sku.includes('PF-2002') || prod.sku.includes('PE-1008') ? 'kg' : 'cái',
        quantity: prod.moq,
        note: ''
      };
      saveCart([...cart, newItem]);
    }
  };

  return (
    <div className="space-y-10 w-full">
      {/* SECTION 1: Breadcrumbs, Progress, Grid */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 sm:px-8 lg:px-16">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[12px] text-muted-foreground pb-2"
        >
          <Link href="/" className="transition-colors hover:text-brand">
            {t('breadcrumbHome')}
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          <span className="font-medium text-foreground">{t('breadcrumbCart')}</span>
        </nav>

        {/* Step Progress bar */}
        <div className="flex w-full overflow-hidden text-xs sm:text-sm font-semibold">
          {/* Step 1: Giỏ hàng */}
          <div className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-brand text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-brand">
              1
            </span>
            <span className="font-bold tracking-wide">{t('stepCart')}</span>
          </div>

          {/* Step 2: Thanh toán */}
          <div className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-brand/90 text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-extrabold text-white">
              2
            </span>
            <span className="font-bold tracking-wide">{t('stepPayment')}</span>
          </div>

          {/* Step 3: Vận chuyển */}
          <div className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-slate-200 text-slate-600">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-slate-500">
              3
            </span>
            <span className="font-bold tracking-wide">{t('stepShipping')}</span>
          </div>

          {/* Step 4: Hoàn tất */}
          <div className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-slate-50 text-slate-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-border/40 text-[11px] font-extrabold text-slate-300">
              4
            </span>
            <span className="font-bold tracking-wide">{t('stepComplete')}</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-12 pt-2">
          {/* LEFT COLUMN: Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-bold text-foreground">{t('title')}</h2>
              <span className="text-xs text-muted-foreground">
                {t('totalItems', { count: cart.length })}
              </span>
            </div>

            {resolvedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border/80 rounded-md space-y-4">
                <Package className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">{t('emptyCart')}</p>
                <Link
                  href="/solutions"
                  className="inline-flex items-center gap-1.5 rounded-md border border-brand px-4 py-2 text-xs font-semibold text-brand hover:bg-brand/5 transition-[color,background-color,border-color,box-shadow,opacity,transform]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t('btnBack')}
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-slate-200/80">
                <table className="w-full border-collapse text-left text-sm min-w-[700px]">
                  <thead className="bg-background text-slate-600 text-xs uppercase font-bold border-b border-slate-200/80">
                    <tr>
                      <th className="px-4 py-3.5 font-semibold text-slate-700">
                        {t('colProduct')}
                      </th>
                      <th className="px-3 py-3.5 w-[110px] text-right font-semibold text-slate-700">
                        {t('colPrice')}
                      </th>
                      <th className="px-3 py-3.5 w-[80px] text-center font-semibold text-slate-700">
                        {t('colUnit')}
                      </th>
                      <th className="px-3 py-3.5 w-[140px] text-center font-semibold text-slate-700">
                        {t('colQuantity')}
                      </th>
                      <th className="px-4 py-3.5 w-[190px] text-right font-semibold text-slate-700">
                        {t('colTotal')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 bg-white">
                    {resolvedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        {/* Product Name & Specs */}
                        <td className="px-4 py-4 flex gap-3.5 items-start">
                          {item.slug ? (
                            <Link
                              href={`/solutions/${item.slug}`}
                              className="relative h-14 w-14 shrink-0 rounded border border-slate-200/60 bg-white flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity block"
                            >
                              {item.hero ? (
                                <Image
                                  src={`${DIRECTUS_URL}/assets/${item.hero}`}
                                  alt={item.product_name || item.sku}
                                  fill
                                  className="object-contain p-1"
                                  sizes="56px"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-slate-300" />
                              )}
                            </Link>
                          ) : (
                            <div className="relative h-14 w-14 shrink-0 rounded border border-slate-200/60 bg-white flex items-center justify-center overflow-hidden">
                              <Package className="h-6 w-6 text-slate-300" />
                            </div>
                          )}
                          <div className="space-y-0.5 min-w-0">
                            {item.slug ? (
                              <Link
                                href={`/solutions/${item.slug}`}
                                className="font-semibold text-slate-900 text-sm block leading-snug hover:text-brand transition-colors"
                              >
                                {item.product_name}
                              </Link>
                            ) : (
                              <span className="font-semibold text-slate-900 text-sm block leading-snug">
                                {item.product_name}
                              </span>
                            )}
                            <span className="text-[11px] font-mono text-slate-400 block pt-0.5">
                              SKU: {item.sku}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate max-w-sm">
                              {locale === 'vi' ? 'Quy cách: ' : 'Spec: '}
                              {item.spec}
                            </span>
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td className="px-3 py-4 text-right font-medium text-slate-700">
                          {formatPrice(item.unitPrice)}
                        </td>

                        {/* Unit */}
                        <td className="px-3 py-4 text-center text-slate-600 font-medium">
                          {item.unit}
                        </td>

                        {/* Quantity Input */}
                        <td className="px-3 py-4 text-center">
                          <div className="flex items-center justify-center gap-3.5 mx-auto w-fit">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(idx, item.quantity - 10)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-sm font-semibold text-slate-800 min-w-[32px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(idx, item.quantity + 10)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Total Price & Remove Button */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="font-bold text-brand text-base">
                              {formatPrice(item.total)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemove(idx)}
                              className="p-2 border border-slate-200 hover:border-slate-300 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-[color,background-color,border-color,box-shadow,opacity,transform] flex items-center justify-center shrink-0"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="lg:col-span-4 space-y-6">
            {/* Order Summary Panel */}
            <div className="rounded-lg border border-slate-200 bg-background p-6 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-900">{t('summaryTitle')}</h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('subtotal')}</span>
                  <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('vat')}</span>
                  <span className="font-semibold text-slate-800">{formatPrice(vat)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('shipping')}</span>
                  <span className="font-medium text-brand text-right">{t('shippingContact')}</span>
                </div>

                {/* Divider */}
                <hr className="border-slate-200" />

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 block">
                    {t('promoLabel')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder={t('promoPlaceholder')}
                      className="flex-1 rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-[color,background-color,border-color,box-shadow,opacity,transform] focus:border-brand focus:ring-1 focus:ring-brand font-mono uppercase"
                    />
                    <button
                      type="submit"
                      className="rounded bg-[#E0F2FE] hover:bg-[#BAE6FD] text-sky-700 text-xs font-bold px-4 py-2.5 transition-[color,background-color,border-color,box-shadow,opacity,transform] border border-sky-200"
                    >
                      {t('promoApply')}
                    </button>
                  </div>
                  {promoError && (
                    <span className="text-xs text-rose-500 font-medium block mt-1">
                      {promoError}
                    </span>
                  )}
                  {promoSuccess && (
                    <span className="text-xs text-emerald-600 font-medium block mt-1">
                      {promoSuccess}
                    </span>
                  )}
                </form>

                {/* Divider */}
                <hr className="border-slate-200" />

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-base font-bold text-slate-900">{t('total')}</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-brand block leading-none">
                      {formatPrice(grandTotal)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1.5">
                      {t('vatIncluded')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3.5 pt-2">
                <Link
                  href="/checkout"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-md bg-brand py-3.5 text-sm font-bold text-white shadow hover:bg-brand/95 transition-[color,background-color,border-color,box-shadow,opacity,transform] text-center"
                >
                  {t('btnCheckout')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/solutions"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-md border border-brand text-brand hover:bg-brand/5 py-3.5 text-sm font-bold transition-[color,background-color,border-color,box-shadow,opacity,transform] text-center"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('btnBack')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Quick Quote Promo Banner - Full Width of Viewport */}
      <div className="w-full bg-background border-y border-slate-200/80 py-10 my-4">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-3xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('rfqSectionSubtitle')}
            </span>
            <h4 className="text-lg font-bold text-slate-800 leading-tight">{t('rfqTitle')}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{t('rfqDesc')}</p>
          </div>
          <Link
            href="/quick-order"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-brand hover:bg-brand-strong px-6 py-3 text-sm font-bold text-white shadow transition-[color,background-color,border-color,box-shadow,opacity,transform] shrink-0 w-full md:w-auto"
          >
            {t('rfqCta')}
            <Edit3 className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>

      {/* SECTION 3: Suggested Products & Engineer Support Banners */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 sm:px-8 lg:px-16 pb-8">
        {/* Suggested Products Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">{t('suggestTitle')}</h3>
            <Link href="/solutions" className="text-xs font-semibold text-brand hover:underline">
              {t('viewAll')}
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {suggestedProducts.map((prod, idx) => (
              <div
                key={idx}
                className="rounded-md border border-slate-200/80 p-4 shadow-sm flex flex-col justify-between bg-white hover:border-brand/40 transition-[color,background-color,border-color,box-shadow,opacity,transform] space-y-4"
              >
                <div className="space-y-3">
                  {/* Fallback/Directus Image */}
                  <Link
                    href={`/solutions/${prod.slug}`}
                    className="aspect-square w-full rounded bg-slate-50 border border-slate-200/40 flex items-center justify-center overflow-hidden relative block hover:opacity-90 transition-opacity"
                  >
                    {prod.hero ? (
                      <Image
                        src={`${DIRECTUS_URL}/assets/${prod.hero}`}
                        alt={prod.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-slate-200" />
                    )}
                  </Link>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[40px] hover:text-brand transition-colors">
                      <Link href={`/solutions/${prod.slug}`}>{prod.name}</Link>
                    </h4>
                    <div className="flex items-baseline gap-1 text-xs">
                      <span className="font-extrabold text-brand">{prod.priceText}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 space-y-0.5 pt-1">
                      <p>
                        {t('moqLabel')}: {prod.moqText}
                      </p>
                      <div className="flex items-center gap-1 text-[9px] text-slate-500 font-semibold pt-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{prod.hub}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddSuggested(prod)}
                    className="flex-1 rounded bg-brand py-2 text-xs font-semibold text-white hover:bg-brand/95 transition-[color,background-color,border-color,box-shadow,opacity,transform]"
                  >
                    {t('orderNow')}
                  </button>
                  <button
                    type="button"
                    className="p-2 border border-slate-200 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-50 transition-[color,background-color,border-color,box-shadow,opacity,transform] flex items-center justify-center shrink-0"
                    aria-label="Bookmark"
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Engineer Support Banner - Full Width of Viewport */}
      <div className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-950 text-white py-12 mt-4">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">
              {t('bannerTitle')}
            </span>
            <h3 className="text-lg sm:text-xl font-bold leading-tight">{t('bannerSubtitle')}</h3>
            <p className="text-xs text-blue-100 opacity-90 leading-relaxed">{t('bannerDesc')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 pt-2">
            <a
              href={`tel:${t('btnHotline').replace(/\s/g, '')}`}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/60 hover:border-white text-white hover:bg-white/10 px-5 py-3 text-xs font-bold transition-[color,background-color,border-color,box-shadow,opacity,transform] text-center"
            >
              <Phone className="h-4 w-4" />
              {t('btnHotline')}
            </a>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand hover:bg-blue-600 text-white px-5 py-3 text-xs font-bold transition-[color,background-color,border-color,box-shadow,opacity,transform] text-center shadow-md"
            >
              <CalendarDays className="h-4 w-4" />
              {t('btnSchedule')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
