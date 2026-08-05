'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Check,
  Building2,
  Truck,
  Package,
  ShoppingBag,
  CheckCircle2,
  FileText,
  Home
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import type { AuthUser } from '@/lib/auth-helpers';

interface OrderConfirmationClientProps {
  user: AuthUser | null;
  locale: string;
  dbProductMap?: Record<string, { hero: string | null; slug: string }>;
}

export default function OrderConfirmationClient({
  user,
  locale,
  dbProductMap = {}
}: OrderConfirmationClientProps) {
  const t = useTranslations('orderConfirmationPage');
  const DIRECTUS_URL = getDirectusUrlClient();

  const [orderCode, setOrderCode] = useState('ULK-2026-98745');
  const [orderDate, setOrderDate] = useState('14/03/2026');

  // Simple client-side directus url fallback
  function getDirectusUrlClient() {
    return process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
  }

  // Fallback realistic mockup items to match user design exactly
  const mockItems = [
    {
      name: 'Màng quấn Pallet - Stretch film',
      sku: 'UL-PF-2002',
      qty: 500,
      unit: 'kg',
      unitPrice: 39500,
      total: 19750000,
      slug: 'mang-quan-pallet-stretch-film',
      hero: 'b757fbd6-df8f-4ba9-826a-912a2df1ad12' // realistic layout
    },
    {
      name: 'Túi PE trong suốt - Đựng hàng',
      sku: 'UL-PE-1008',
      qty: 200,
      unit: 'kg',
      unitPrice: 28000,
      total: 5600000,
      slug: 'tui-pe-trong-suot-dung-thuc-pham',
      hero: 'a632fbd6-df8f-4ba9-826a-912a2df1ad11'
    }
  ];

  const subtotal = 25350000;
  const vat = 2028000;
  const grandTotal = 27378000;

  const formatPrice = (amount: number) => {
    if (locale === 'vi') {
      return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    }
    return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount / 25000);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 sm:px-8 lg:px-16 text-slate-800">
      
      {/* 1. Header Banner Box */}
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-[#F8FAFC] border border-slate-100 rounded-lg space-y-4">
        {/* Blue circle check icon */}
        <div className="h-10 w-10 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
          <Check className="h-5 w-5 stroke-[3]" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('successTitle')}
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            {t('successDesc')}
          </p>
        </div>

        {/* Metadata capsule */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center bg-white border border-slate-200/60 rounded px-6 py-2.5 text-xs text-slate-500 shadow-sm mt-2">
          <div className="flex items-center gap-1.5">
            <span className="opacity-75">{t('orderCodeLabel')}:</span>
            <strong className="font-bold text-slate-800 font-mono text-[13px]">{orderCode}</strong>
          </div>
          <span className="hidden sm:inline text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="opacity-75">{t('orderDateLabel')}:</span>
            <strong className="font-bold text-slate-800">{orderDate}</strong>
          </div>
        </div>
      </div>

      {/* 2. Order processing status bar */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-md shadow-sm space-y-6 text-left">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          {t('statusSectionTitle')}
        </h3>

        {/* Dynamic Horizontal Line steps */}
        <div className="relative flex justify-between items-center max-w-4xl mx-auto pt-2 pb-6">
          {/* Background Connecting line */}
          <div className="absolute top-7 left-8 right-8 h-1 bg-slate-100 -z-10" />
          
          {/* Active progress color connecting lines */}
          <div className="absolute top-7 left-8 w-1/2 h-1 bg-brand -z-10" />

          {/* Node 1: Đặt hàng */}
          <div className="flex flex-col items-center space-y-2.5">
            <div className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center shadow">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{t('statusStepOrder')}</span>
          </div>

          {/* Node 2: Xác nhận */}
          <div className="flex flex-col items-center space-y-2.5">
            <div className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center shadow">
              <Check className="h-4 w-4 stroke-[3]" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{t('statusStepConfirm')}</span>
          </div>

          {/* Node 3: Đang xử lý */}
          <div className="flex flex-col items-center space-y-2.5">
            <div className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center shadow ring-4 ring-blue-50">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded">
              {t('statusStepProcessing')}
            </span>
          </div>

          {/* Node 4: Đang giao */}
          <div className="flex flex-col items-center space-y-2.5">
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
              <Truck className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-slate-400">{t('statusStepShipping')}</span>
          </div>

          {/* Node 5: Hoàn thành */}
          <div className="flex flex-col items-center space-y-2.5">
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
              <Package className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-slate-400">{t('statusStepComplete')}</span>
          </div>
        </div>
      </div>

      {/* 3. Detail Columns */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: Recipient & Payment Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Buyer Info Panel */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-md shadow-sm space-y-5 text-left">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              {t('buyerInfoTitle')}
            </h4>
            <div className="text-sm space-y-3.5">
              <div className="grid grid-cols-3 gap-2 py-0.5">
                <span className="text-slate-500">{t('companyNameLabel')}</span>
                <span className="col-span-2 font-bold text-slate-800">CÔNG TY TNHH ULINK PARTNER VIỆT NAM</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5">
                <span className="text-slate-500">{t('vatCodeLabel')}</span>
                <span className="col-span-2 font-semibold text-slate-800">0110298365</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5">
                <span className="text-slate-500">{t('recipientLabel')}</span>
                <span className="col-span-2 font-semibold text-slate-800">Nguyễn Văn A - 0912345678</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5">
                <span className="text-slate-500">{t('shippingAddressLabel')}</span>
                <span className="col-span-2 font-semibold text-slate-700 leading-relaxed">
                  Lô CN05 KCN Đồng Văn IV, xã Đại Cương, Kim Bảng, Hà Nam
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 items-center">
                <span className="text-slate-500">{t('shippingMethodLabel')}</span>
                <span className="col-span-2 font-bold text-blue-700">
                  Giao hàng tiêu chuẩn ULink Fleet (Miễn phí)
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info Panel */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-md shadow-sm space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('paymentStatusTitle')}
              </h4>
              {/* Paid Badge */}
              <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#1D4ED8] text-[10.5px] font-bold px-2.5 py-1 rounded-full border border-blue-100">
                <Check className="h-3 w-3 stroke-[3]" />
                {t('paymentStatusPaid')}
              </span>
            </div>
            <div className="text-sm space-y-3.5">
              <div className="grid grid-cols-3 gap-2 py-0.5">
                <span className="text-slate-500">{t('paymentMethodLabel')}</span>
                <span className="col-span-2 font-semibold text-slate-800">
                  Chuyển khoản tài khoản ngân hàng Doanh nghiệp
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5">
                <span className="text-slate-500">{t('bankNameLabel')}</span>
                <span className="col-span-2 font-semibold text-slate-800">
                  Vietcombank (VCB) - Chi nhánh Hồ Chí Minh
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5">
                <span className="text-slate-500">{t('bankOwnerLabel')}</span>
                <span className="col-span-2 font-bold text-slate-800 uppercase">CÔNG TY TNHH ULINK VIỆT NAM</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 items-center">
                <span className="text-slate-500">{t('amountPaidLabel')}</span>
                <span className="col-span-2 font-extrabold text-[#006AA7] text-base">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Ordered products sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#F8FAFC] border border-slate-200/80 p-6 rounded-md shadow-sm space-y-5 text-left">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200/60 pb-3 uppercase tracking-wider">
              {t('orderItemsTitle')}
            </h4>

            {/* List of mock products */}
            <div className="space-y-4">
              {mockItems.map((item, idx) => {
                const dbInfo = dbProductMap[item.sku];
                const finalSlug = dbInfo?.slug || item.slug;
                const finalHero = dbInfo?.hero || item.hero;

                return (
                  <div key={idx} className="flex gap-3.5 items-start">
                    <Link
                      href={`/solutions/${finalSlug}`}
                      className="relative h-12 w-12 shrink-0 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity block"
                    >
                      {finalHero ? (
                        <Image
                          src={`${DIRECTUS_URL}/assets/${finalHero}`}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-slate-300" />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <Link
                        href={`/solutions/${finalSlug}`}
                        className="font-bold text-slate-800 text-xs hover:text-brand transition-all block truncate"
                      >
                        {item.name}
                      </Link>
                      <p className="text-[10px] text-slate-400">
                        SL: {item.qty} {item.unit} x {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-700 shrink-0">
                      {formatPrice(item.total)}
                    </span>
                  </div>
                );
              })}
            </div>

            <hr className="border-slate-200" />

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('subtotal')}</span>
                <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('vat')}</span>
                <span className="font-semibold text-slate-800">{formatPrice(vat)}</span>
              </div>
              <div className="flex justify-between text-sm items-baseline">
                <span className="text-slate-500">{t('shippingFee')}</span>
                <span className="font-bold text-emerald-600 text-right">{t('freeShipping')}</span>
              </div>

              <hr className="border-slate-200" />

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-sm font-bold text-slate-900">{t('total')}</span>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-[#006AA7] block leading-none">
                    {formatPrice(grandTotal)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium block mt-1.5">
                    {t('vatSubtext')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
        <Link
          href="/solutions"
          className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 py-3.5 px-8 text-sm font-bold transition-all text-center w-full sm:w-auto shadow-sm"
        >
          <Home className="h-4 w-4" />
          {t('btnContinue')}
        </Link>
        <button
          type="button"
          onClick={() => alert(locale === 'vi' ? 'Đang chuẩn bị tải hóa đơn tài chính VAT dạng PDF...' : 'Preparing financial VAT PDF invoice download...')}
          className="inline-flex items-center justify-center gap-2 rounded bg-brand text-white hover:bg-brand/95 py-3.5 px-8 text-sm font-bold transition-all text-center w-full sm:w-auto shadow-sm"
        >
          <FileText className="h-4 w-4" />
          {t('btnViewInvoice')}
        </button>
      </div>

    </div>
  );
}
