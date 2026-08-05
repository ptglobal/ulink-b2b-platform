'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Tag,
  Package,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Copy,
  Check,
  CreditCard,
  Truck,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/lib/auth-helpers';
import { readCart, persistCart, type CartItem } from '@/components/rfq/cart-types';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';

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

export default function CheckoutClient({
  user,
  locale,
  dbProductMap = {}
}: {
  user: AuthUser | null;
  locale: string;
  dbProductMap?: Record<string, { hero: string | null; slug: string }>;
}) {
  const t = useTranslations('checkoutPage');
  const DIRECTUS_URL = getDirectusUrlClient();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Form states (prefilled realistic B2B data)
  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Văn A',
    phone: '0912345678',
    email: 'purchasing@ulink-partner.vn',
    province: 'Hà Nam',
    district: 'Kim Bảng',
    ward: 'Đại Cương',
    address: 'Lô CN05, KCN Đồng Văn IV, xã Đại Cương, Kim Bảng',
    note: 'Giao hàng vào giờ hành chính, liên hệ trước 30 phút để chuẩn bị xe nâng hạ hàng.'
  });

  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cod' | 'wallet'>('bank');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | '3pl'>('standard');
  const [carrierName, setCarrierName] = useState('Viettel Post');
  const [carrierAccount, setCarrierAccount] = useState('');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCart(readCart());
    // Generate mock order ID
    setOrderId('UL-' + Math.floor(100000 + Math.random() * 900000));
  }, []);

  // Simple client-side directus url fallback
  function getDirectusUrlClient() {
    return process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
  }

  // B2B Pricing calculations (aligned with tier multiplier)
  const getProductBasePrice = (sku: string) => {
    const prices: Record<string, number> = {
      'UL-PF-2002': 54861,
      'UL-PE-1008': 33333,
      'CR-GLV-001': 3472,
      'polyester-cleanroom-wipers': 347222,
      'tyvek-cleanroom-coverall': 250000,
      'cleanroom-face-mask-3ply': 104166,
      'esd-wrist-strap': 62500,
      'esd-table-mat-2layer': 1666666,
      'ipa-cleanroom-grade-999': 131944,
      'sticky-mat-30-layers': 208333,
      'esd-shielding-bag': 4861,
      'sterile-latex-cleanroom-gloves': 6250
    };
    return prices[sku] || 100000;
  };

  const getTierMultiplier = (qty: number): number => {
    if (qty < 100) return 1.2;
    if (qty < 300) return 1.0;
    if (qty < 500) return 0.84;
    return 0.72;
  };

  const resolvedItems = useMemo(() => {
    return cart.map((item) => {
      const basePrice = getProductBasePrice(item.sku);
      const multiplier = getTierMultiplier(item.quantity);
      const unitPrice = Math.round(basePrice * multiplier);
      const total = unitPrice * item.quantity;
      const dbInfo = dbProductMap[item.sku];

      return {
        ...item,
        unitPrice,
        total,
        hero: dbInfo?.hero || null,
        slug: dbInfo?.slug || null
      };
    });
  }, [cart, dbProductMap]);

  const subtotal = useMemo(() => {
    return resolvedItems.reduce((sum, item) => sum + item.total, 0);
  }, [resolvedItems]);

  const vat = useMemo(() => Math.round(subtotal * 0.08), [subtotal]);

  const shippingFee = useMemo(() => {
    if (shippingMethod === 'express') return 250000;
    return 0; // standard is free, 3PL is quote (we default to display text)
  }, [shippingMethod]);

  const grandTotal = useMemo(() => subtotal + vat + shippingFee, [subtotal, vat, shippingFee]);

  const formatPrice = (amount: number) => {
    if (locale === 'vi') {
      return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    }
    return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount / 25000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('007100123456789');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên người nhận';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email nhận hóa đơn';
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderCarrierIcon = (name: string) => {
    switch (name) {
      case 'Viettel Post':
        return (
          <div className="w-14 h-10 shrink-0 rounded bg-[#EE0000] text-white flex flex-col items-center justify-center font-extrabold text-[9px] shadow-sm select-none" title="Viettel Post">
            <span className="leading-none tracking-tighter">VIETTEL</span>
            <span className="text-[7px] opacity-90 leading-none mt-0.5">POST</span>
          </div>
        );
      case 'Nhất Tín Logistics':
        return (
          <div className="w-14 h-10 shrink-0 rounded bg-[#FFCC00] text-black flex flex-col items-center justify-center font-extrabold text-[8px] shadow-sm select-none font-bold" title="Nhất Tín Logistics">
            <span className="leading-none tracking-tight">NHẤT TÍN</span>
            <span className="text-[6px] opacity-80 leading-none mt-0.5 font-bold">LOGISTICS</span>
          </div>
        );
      case 'Giao Hàng Tiết Kiệm (GHTK)':
        return (
          <div className="w-14 h-10 shrink-0 rounded bg-[#069A57] text-white flex flex-col items-center justify-center font-extrabold text-[9px] shadow-sm select-none" title="GHTK">
            <span className="leading-none tracking-tighter font-black">GHTK</span>
            <span className="text-[6px] opacity-90 leading-none mt-0.5">TIẾT KIỆM</span>
          </div>
        );
      case 'Giao Hàng Nhanh (GHN)':
        return (
          <div className="w-14 h-10 shrink-0 rounded bg-[#F26522] text-white flex flex-col items-center justify-center font-extrabold text-[9px] shadow-sm select-none font-bold" title="GHN">
            <span className="leading-none tracking-tighter font-black">GHN</span>
            <span className="text-[6px] opacity-90 leading-none mt-0.5 font-bold">EXPRESS</span>
          </div>
        );
      case 'J&T Express':
        return (
          <div className="w-14 h-10 shrink-0 rounded bg-[#FF0000] text-white flex flex-col items-center justify-center font-extrabold text-[9px] shadow-sm select-none" title="J&T Express">
            <span className="leading-none italic font-black">J&T</span>
            <span className="text-[6px] opacity-95 tracking-widest leading-none mt-0.5">EXPRESS</span>
          </div>
        );
      default:
        return (
          <div className="w-14 h-10 shrink-0 rounded bg-slate-400 text-white flex items-center justify-center font-extrabold text-xs shadow-sm select-none" title="Other">
            <Truck className="h-5 w-5" />
          </div>
        );
    }
  };

  const handleSubmitOrder = () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstErr = Object.keys(errors)[0];
      const el = document.getElementById(firstErr);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Modal Simulation Sequence:
    // Click 1: Failure Modal (so user checks failed design)
    // Click 2: Pending Modal (so user checks pending design)
    // Click 3: Success Modal (so user checks success design & clears cart)
    const mode = clickCount % 3;
    if (mode === 0) {
      setShowFailureModal(true);
    } else if (mode === 1) {
      setShowPendingModal(true);
    } else {
      setShowSuccessModal(true);
    }
    setClickCount((prev) => prev + 1);
  };



  return (
    <div className="space-y-10 w-full">
      {/* SECTION 1: Breadcrumbs, Progress, Checkout Form */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 sm:px-8 lg:px-16">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12px] text-muted-foreground pb-2">
          <Link href="/" className="transition-colors hover:text-brand">
            {t('breadcrumbHome')}
          </Link>
          <ChevronRightIcon className="h-3 w-3 text-muted-foreground/60" />
          <Link href="/cart" className="transition-colors hover:text-brand">
            {t('breadcrumbCart')}
          </Link>
          <ChevronRightIcon className="h-3 w-3 text-muted-foreground/60" />
          <span className="font-medium text-foreground">{t('breadcrumbCheckout')}</span>
        </nav>

        {/* Step Progress bar */}
        <div className="flex w-full overflow-hidden text-xs sm:text-sm font-semibold">
          {/* Step 1: Giỏ hàng */}
          <div className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-blue-50 text-brand">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-extrabold text-white">
              ✓
            </span>
            <span className="font-bold tracking-wide">{t('stepCart')}</span>
          </div>

          {/* Step 2: Thanh toán */}
          <div className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-brand text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-brand">
              2
            </span>
            <span className="font-bold tracking-wide">{t('stepPayment')}</span>
          </div>

          {/* Step 3: Vận chuyển */}
          <div className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-slate-100 text-slate-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-slate-300">
              3
            </span>
            <span className="font-bold tracking-wide">{t('stepShipping')}</span>
          </div>

          {/* Step 4: Hoàn tất */}
          <div className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-slate-50 text-slate-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-border/40 text-[11px] font-extrabold text-slate-200">
              4
            </span>
            <span className="font-bold tracking-wide">{t('stepComplete')}</span>
          </div>
        </div>

        {/* Checkout Columns */}
        <div className="grid gap-8 lg:grid-cols-12 pt-2">
          {/* LEFT COLUMN: Checkout Form */}
          <div className="lg:col-span-8 space-y-8">
            {/* Delivery Info */}
            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-bold text-slate-800">{t('shippingInfoTitle')}</h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500" htmlFor="fullName">
                    {t('fullName')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={cn(
                      "w-full rounded border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                      errors.fullName && "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    )}
                  />
                  {errors.fullName && <span className="text-xs text-rose-500 block">{errors.fullName}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500" htmlFor="phone">
                    {t('phone')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={cn(
                      "w-full rounded border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                      errors.phone && "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    )}
                  />
                  {errors.phone && <span className="text-xs text-rose-500 block">{errors.phone}</span>}
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500" htmlFor="email">
                    {t('email')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={cn(
                      "w-full rounded border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                      errors.email && "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    )}
                  />
                  {errors.email && <span className="text-xs text-rose-500 block">{errors.email}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500" htmlFor="province">
                    {t('province')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand"
                  >
                    <option value="Hà Nam">Hà Nam</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Bắc Ninh">Bắc Ninh</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500" htmlFor="district">
                    {t('district')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand"
                  >
                    <option value="Kim Bảng">Kim Bảng</option>
                    <option value="Dĩ An">Dĩ An</option>
                    <option value="Từ Sơn">Từ Sơn</option>
                    <option value="Cầu Giấy">Cầu Giấy</option>
                    <option value="Quận 1">Quận 1</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500" htmlFor="ward">
                    {t('ward')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="ward"
                    value={formData.ward}
                    onChange={(e) => handleInputChange('ward', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand"
                  >
                    <option value="Đại Cương">Đại Cương</option>
                    <option value="Bến Nghé">Bến Nghé</option>
                    <option value="Dịch Vọng">Dịch Vọng</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500" htmlFor="address">
                    {t('address')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={cn(
                      "w-full rounded border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                      errors.address && "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    )}
                  />
                  {errors.address && <span className="text-xs text-rose-500 block">{errors.address}</span>}
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500" htmlFor="note">
                    {t('note')}
                  </label>
                  <textarea
                    id="note"
                    value={formData.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    placeholder={t('notePlaceholder')}
                    rows={3}
                    className="w-full rounded border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CreditCard className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-bold text-slate-800">{t('paymentMethodTitle')}</h2>
              </div>

              <div className="space-y-4">
                {/* Method 1: Bank Transfer */}
                <label
                  onClick={() => setPaymentMethod('bank')}
                  className={cn(
                    "flex gap-4 p-4 rounded-md border text-left cursor-pointer transition-all hover:bg-slate-50/50",
                    paymentMethod === 'bank' ? "border-[#3B82F6] bg-blue-50/20" : "border-slate-200"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                    className="mt-1 h-4 w-4 text-brand focus:ring-brand border-slate-300"
                  />
                  <div className="space-y-1 select-none">
                    <span className="text-sm font-bold text-slate-800 block">
                      {t('payBank')}
                    </span>
                    <span className="text-xs text-slate-400 block leading-relaxed">
                      {t('payBankDesc')}
                    </span>
                  </div>
                </label>

                {/* Method 2: COD */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={cn(
                    "flex gap-4 p-4 rounded-md border text-left cursor-pointer transition-all hover:bg-slate-50/50",
                    paymentMethod === 'cod' ? "border-[#3B82F6] bg-blue-50/20" : "border-slate-200"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 h-4 w-4 text-brand focus:ring-brand border-slate-300"
                  />
                  <div className="space-y-1 select-none">
                    <span className="text-sm font-bold text-slate-800 block">
                      {t('payCod')}
                    </span>
                    <span className="text-xs text-slate-400 block leading-relaxed">
                      {t('payCodDesc')}
                    </span>
                  </div>
                </label>

                {/* Method 3: Wallet */}
                <label
                  onClick={() => setPaymentMethod('wallet')}
                  className={cn(
                    "flex gap-4 p-4 rounded-md border text-left cursor-pointer transition-all hover:bg-slate-50/50",
                    paymentMethod === 'wallet' ? "border-[#3B82F6] bg-blue-50/20" : "border-slate-200"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                    className="mt-1 h-4 w-4 text-brand focus:ring-brand border-slate-300"
                  />
                  <div className="space-y-1 select-none">
                    <span className="text-sm font-bold text-slate-800 block">
                      {t('payWallet')}
                    </span>
                    <span className="text-xs text-slate-400 block leading-relaxed">
                      {t('payWalletDesc')}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Bank Transfer Details (if bank selected) */}
            {paymentMethod === 'bank' && (
              <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CreditCard className="h-5 w-5 text-brand" />
                  <h2 className="text-lg font-bold text-slate-800">{t('bankInfoTitle')}</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  {/* Styled QR Code SVG */}
                  <div className="border border-slate-200 p-3 bg-white rounded flex flex-col items-center justify-center shrink-0 w-[145px] h-[145px] shadow-sm">
                    <svg width="90" height="90" viewBox="0 0 100 100" className="text-slate-800">
                      <path d="M0 0h28v8H8v20H0V0zm72 0h28v28h-8V8H72V0zM0 72h8v20h20v8H0V72zm92 0h8v28H72v-8h20V72z" fill="currentColor" />
                      <rect x="12" y="12" width="16" height="16" fill="currentColor" />
                      <rect x="72" y="12" width="16" height="16" fill="currentColor" />
                      <rect x="12" y="72" width="16" height="16" fill="currentColor" />
                      <rect x="36" y="12" width="8" height="8" fill="currentColor" />
                      <rect x="48" y="20" width="16" height="8" fill="currentColor" />
                      <rect x="36" y="36" width="28" height="8" fill="currentColor" />
                      <rect x="12" y="44" width="8" height="16" fill="currentColor" />
                      <rect x="72" y="44" width="16" height="8" fill="currentColor" />
                      <rect x="44" y="60" width="12" height="12" fill="currentColor" />
                      <rect x="76" y="76" width="12" height="12" fill="currentColor" />
                    </svg>
                    <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                      {t('bankQrDesc')}
                    </span>
                  </div>

                  {/* Bank detail specifications */}
                  <div className="flex-1 w-full text-sm space-y-3">
                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                      <span className="text-slate-500">{t('bankNameLabel')}</span>
                      <span className="col-span-2 font-bold text-slate-800">Vietcombank (VCB)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                      <span className="text-slate-500">{t('bankBranchLabel')}</span>
                      <span className="col-span-2 font-semibold text-slate-800">Hồ Chí Minh</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100 items-center">
                      <span className="text-slate-500">{t('bankAccountLabel')}</span>
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-slate-800">0071 0012 3456 789</span>
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all"
                          title="Copy account number"
                        >
                          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        {copied && <span className="text-[10px] text-emerald-600 font-semibold">Đã sao chép!</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                      <span className="text-slate-500">{t('bankAccountOwnerLabel')}</span>
                      <span className="col-span-2 font-bold text-slate-800 uppercase">CÔNG TY TNHH ULINK VIỆT NAM</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                      <span className="text-slate-500">{t('bankMemoLabel')}</span>
                      <span className="col-span-2 font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded w-fit border border-blue-100">
                        {orderId} - {formData.fullName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100/80 p-3.5 rounded text-xs text-blue-700 leading-relaxed">
                  {t('bankWarning')}
                </div>
              </div>
            )}

            {/* Shipping Method */}
            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Truck className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-bold text-slate-800">{t('shippingMethodTitle')}</h2>
              </div>

              <div className="space-y-4">
                {/* Standard */}
                <label
                  onClick={() => setShippingMethod('standard')}
                  className={cn(
                    "flex gap-4 p-4 rounded-md border text-left cursor-pointer transition-all hover:bg-slate-50/50",
                    shippingMethod === 'standard' ? "border-[#3B82F6] bg-blue-50/20" : "border-slate-200"
                  )}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="mt-1 h-4 w-4 text-brand focus:ring-brand border-slate-300"
                  />
                  <div className="flex-1 space-y-1 select-none">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-slate-800">
                        {t('shipStandard')}
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        {t('shipStandardPrice')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block leading-relaxed max-w-2xl">
                      {t('shipStandardDesc')}
                    </span>
                  </div>
                </label>

                {/* Express */}
                <label
                  onClick={() => setShippingMethod('express')}
                  className={cn(
                    "flex gap-4 p-4 rounded-md border text-left cursor-pointer transition-all hover:bg-slate-50/50",
                    shippingMethod === 'express' ? "border-[#3B82F6] bg-blue-50/20" : "border-slate-200"
                  )}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="mt-1 h-4 w-4 text-brand focus:ring-brand border-slate-300"
                  />
                  <div className="flex-1 space-y-1 select-none">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-slate-800">
                        {t('shipExpress')}
                      </span>
                      <span className="text-sm font-bold text-[#006AA7]">
                        {formatPrice(250000)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block leading-relaxed max-w-2xl">
                      {t('shipExpressDesc')}
                    </span>
                  </div>
                </label>

                {/* 3PL */}
                <label
                  onClick={() => setShippingMethod('3pl')}
                  className={cn(
                    "flex gap-4 p-4 rounded-md border text-left cursor-pointer transition-all hover:bg-slate-50/50",
                    shippingMethod === '3pl' ? "border-[#3B82F6] bg-blue-50/20" : "border-slate-200"
                  )}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === '3pl'}
                    onChange={() => setShippingMethod('3pl')}
                    className="mt-1 h-4 w-4 text-brand focus:ring-brand border-slate-300"
                  />
                  <div className="flex-1 space-y-1 select-none">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-slate-800">
                        {t('ship3pl')}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {t('ship3plPrice')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block leading-relaxed max-w-2xl">
                      {t('ship3plDesc')}
                    </span>
                  </div>
                </label>

                {shippingMethod === '3pl' && (
                  <div className="mt-2 p-4 border border-dashed border-slate-200 bg-slate-50/50 rounded space-y-4 text-left animate-fadeIn">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {locale === 'vi' ? 'Thông tin đối tác vận chuyển 3PL' : '3PL Carrier Partner Information'}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500" htmlFor="carrierName">
                          {locale === 'vi' ? 'Đơn vị vận chuyển B2B/3PL đối tác' : 'Partner B2B/3PL Carrier'}
                        </label>
                        <div className="flex gap-3 items-center">
                          {renderCarrierIcon(carrierName)}
                          <select
                            id="carrierName"
                            value={carrierName}
                            onChange={(e) => setCarrierName(e.target.value)}
                            className="flex-1 rounded border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand font-medium cursor-pointer"
                          >
                            <option value="Viettel Post">Viettel Post</option>
                            <option value="Nhất Tín Logistics">Nhất Tín Logistics</option>
                            <option value="Giao Hàng Tiết Kiệm (GHTK)">Giao Hàng Tiết Kiệm (GHTK)</option>
                            <option value="Giao Hàng Nhanh (GHN)">Giao Hàng Nhanh (GHN)</option>
                            <option value="J&T Express">J&T Express</option>
                            <option value="Khác">Khác / Tự thỏa thuận</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500" htmlFor="carrierAccount">
                          {locale === 'vi' ? 'Mã khách hàng / Mã hợp đồng (nếu có)' : 'Carrier Account/Contract ID (if any)'}
                        </label>
                        <input
                          type="text"
                          id="carrierAccount"
                          placeholder="Ví dụ: Corporate-12345"
                          value={carrierAccount}
                          onChange={(e) => setCarrierAccount(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand font-medium"
                        />
                      </div>
                    </div>
                    <div className="bg-sky-50 border border-sky-100 p-3 rounded text-xs text-sky-700 leading-relaxed">
                      {locale === 'vi' 
                        ? 'Lưu ý: ULink sẽ chuẩn bị hàng hóa và bàn giao trực tiếp cho đơn vị vận chuyển đối tác của bạn. Chi phí vận chuyển thực tế do doanh nghiệp thanh toán trực tiếp cho bên thứ 3 (3PL) theo thỏa thuận riêng.'
                        : 'Note: ULink will pack and hand over the goods directly to your partner carrier. Actual shipping fees are paid directly to the 3PL carrier according to your contract.'
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-md border border-slate-200 bg-[#F8FAFC] p-6 shadow-sm space-y-5 text-left">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200/60 pb-3">
                {t('orderSummaryTitle')}
              </h3>

              {/* Cart items thumbnail list */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {resolvedItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start">
                    {item.slug ? (
                      <Link
                        href={`/solutions/${item.slug}`}
                        className="relative h-12 w-12 shrink-0 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity block"
                      >
                        {item.hero ? (
                          <Image
                            src={`${DIRECTUS_URL}/assets/${item.hero}`}
                            alt={item.product_name || item.sku}
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-slate-300" />
                        )}
                      </Link>
                    ) : (
                      <div className="relative h-12 w-12 shrink-0 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                        <Package className="h-5 w-5 text-slate-300" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      {item.slug ? (
                        <Link
                          href={`/solutions/${item.slug}`}
                          className="font-bold text-slate-800 text-xs hover:text-brand transition-all block truncate"
                        >
                          {item.product_name}
                        </Link>
                      ) : (
                        <span className="font-bold text-slate-800 text-xs block truncate">
                          {item.product_name}
                        </span>
                      )}
                      <p className="text-[10px] text-slate-400">
                        {item.quantity} {item.unit} x {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-700 shrink-0">
                      {formatPrice(item.total)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-slate-200" />

              <div className="space-y-4 text-sm pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('subtotal')}</span>
                  <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('vat')}</span>
                  <span className="font-semibold text-slate-800">{formatPrice(vat)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500">{t('shippingFee')}</span>
                  <span className="font-bold text-emerald-600 text-right">
                    {shippingMethod === 'express'
                      ? formatPrice(250000)
                      : shippingMethod === '3pl'
                        ? t('ship3plPrice')
                        : t('shipStandardPrice')
                    }
                  </span>
                </div>

                {/* Divider */}
                <hr className="border-slate-200" />

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-base font-bold text-slate-900">{t('total')}</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#006AA7] block leading-none">
                      {formatPrice(grandTotal)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1.5">
                      {t('vatIncluded')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-md bg-brand py-3.5 text-sm font-bold text-white shadow hover:bg-brand/95 transition-all text-center"
                >
                  {t('btnPayNow')}
                </button>
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-md border border-brand text-brand hover:bg-brand/5 py-3.5 text-sm font-bold transition-all text-center"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('btnBackToCart')}
                </Link>
              </div>
            </div>

            {/* Secure Checkout Card */}
            <div className="rounded-md border border-slate-200/80 bg-slate-50/50 p-4 flex gap-3 text-left">
              <ShieldCheck className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-[10.5px] text-slate-400 leading-relaxed">
                {t('secureCheckout')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Popup Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-100 max-w-[480px] w-full p-8 relative flex flex-col items-center text-center space-y-6 animate-scaleIn">
            <button
              onClick={() => {
                setShowSuccessModal(false);
                persistCart([]);
                setCart([]);
                window.location.href = `/${locale}/order-confirmation`;
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-16 w-16 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Thanh toán thành công!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed px-2">
                Đơn hàng #{orderId} của bạn đã được thanh toán thành công. Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất.
              </p>
            </div>
            <div className="bg-[#F8FAFC] rounded-md p-4 w-full flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-[#3B82F6] tracking-wider uppercase">
                TỔNG TIỀN THANH TOÁN
              </span>
              <span className="text-2xl font-extrabold text-[#1D4ED8] mt-1.5">
                {formatPrice(grandTotal)}
              </span>
            </div>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                persistCart([]);
                setCart([]);
                window.location.href = `/${locale}/order-confirmation`;
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors pt-2"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      )}

      {/* Pending Modal Popup Overlay */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-100 max-w-[480px] w-full p-8 relative flex flex-col items-center text-center space-y-6 animate-scaleIn">
            <button
              onClick={() => setShowPendingModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-16 w-16 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              {/* Golden dashed loader circle */}
              <svg className="animate-spin h-8 w-8 text-[#D97706]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Đang chờ xác nhận
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed px-2">
                Giao dịch của bạn đang được xử lý. Thời gian xác nhận có thể mất từ 5-15 phút. Bạn sẽ nhận được thông báo khi thanh toán hoàn tất.
              </p>
            </div>
            <div className="bg-[#FFFBEB] rounded-md p-4 w-full flex flex-col items-center justify-center border border-amber-100">
              <span className="text-[10px] font-bold text-[#D97706] tracking-wider uppercase">
                MÃ GIAO DỊCH TRA CỨU
              </span>
              <span className="text-lg font-extrabold text-[#B45309] mt-1.5 font-mono">
                TXN-{orderId.replace('UL-', '')}
              </span>
            </div>
            <button
              onClick={() => {
                setShowPendingModal(false);
                window.location.href = `/${locale}`;
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors pt-2"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      )}

      {/* Failure Modal Popup Overlay */}
      {showFailureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-100 max-w-[480px] w-full p-8 relative flex flex-col items-center text-center space-y-6 animate-scaleIn">
            <button
              onClick={() => setShowFailureModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-16 w-16 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
              <div className="border-4 border-[#DC2626] rounded-md p-1.5 flex items-center justify-center h-8 w-8 font-black text-lg leading-none">!</div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Thanh toán thất bại
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed px-2">
                Giao dịch không thể hoàn tất. Vui lòng kiểm tra lại số dư, thông tin tài khoản hoặc thử phương thức thanh toán khác.
              </p>
            </div>
            <div className="bg-[#FEF2F2] rounded-md p-4 w-full flex flex-col items-center justify-center border border-red-100">
              <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase">
                CHI TIẾT LỖI HỆ THỐNG
              </span>
              <span className="text-base font-extrabold text-[#991B1B] mt-1.5 font-mono">
                ERR_BANK_DECLINED
              </span>
            </div>
            <div className="flex gap-4 items-center justify-center text-xs font-bold text-[#1D4ED8] pt-2">
              <button
                onClick={() => setShowFailureModal(false)}
                className="hover:underline"
              >
                Đổi phương thức thanh toán
              </button>
              <span className="text-slate-300">|</span>
              <a
                href="mailto:support@ulinkindustries.com"
                className="hover:underline"
              >
                Liên hệ hỗ trợ
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small custom Chevron Icon to avoid missing import
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
