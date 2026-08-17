'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, PhoneCall, Mail, Send, Clock } from '@/components/icons';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function CtaBanner({
  containerClassName = 'max-w-[1440px] px-6'
}: {
  containerClassName?: string;
}) {
  const tCta = useTranslations('ctaBanner');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const timeout = window.setTimeout(() => setShowToast(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [showToast]);

  const handleCatalogueClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowToast(true);
  };

  return (
    <section className="w-full bg-[#1769e2] text-white">
      <div className={`mx-auto w-full py-12 sm:py-16 ${containerClassName}`}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* ── CỘT BÊN TRÁI: BÁO GIÁ NHANH 24H (7/12 COLS) ── */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-[14px] font-medium text-white/80 sm:text-[15px]">
              {tCta('eyebrow')}
            </p>
            <h2 className="mt-4 text-[32px] font-extrabold tracking-tight text-white sm:text-[44px] lg:text-[52px] leading-tight">
              {tCta('title')}
            </h2>
            <p className="mt-6 text-[14px] leading-relaxed text-white/90 sm:text-[16px] max-w-[720px]">
              {tCta('description')}
            </p>

            {/* Action Buttons Row */}
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
              <Link
                href="/quick-order"
                className="ulink-pressable inline-flex min-h-12 items-center justify-between gap-3 rounded-[3px] bg-white px-6 text-[15px] font-bold text-[#1769e2] hover:bg-[#f5f8fc] sm:w-fit sm:px-8"
              >
                {tCta('ctaRfq')}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/resources"
                onClick={handleCatalogueClick}
                className="ulink-pressable inline-flex min-h-12 items-center justify-between gap-3 border border-white px-6 text-[15px] font-bold text-white hover:bg-white/10 sm:w-fit sm:border-0 sm:px-3"
              >
                {tCta('ctaCatalogue')}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* ── CỘT BÊN PHẢI: LIÊN HỆ TRỰC TIẾP (5/12 COLS WITH VERTICAL BORDER) ── */}
          <div className="flex flex-col justify-center lg:col-span-5 lg:border-l lg:border-white/30 lg:pl-16">
            <h3 className="text-[18px] font-bold text-white sm:text-[20px]">
              {tCta('directContactTitle')}
            </h3>

            {/* 3 Contact Info Items */}
            <div className="mt-8 flex flex-col gap-6">
              {/* Item 1: Phone */}
              <div className="flex items-start gap-4 border-b border-white/20 pb-5">
                <PhoneCall className="h-6 w-6 shrink-0 text-white mt-1" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[18px] font-extrabold text-white sm:text-[20px]">
                    {tCta('phone')}
                  </p>
                  <p className="mt-1 text-[13px] text-white/75 sm:text-[14px]">
                    {tCta('phoneHours')}
                  </p>
                </div>
              </div>

              {/* Item 2: Email */}
              <div className="flex items-start gap-4 border-b border-white/20 pb-5">
                <Mail className="h-6 w-6 shrink-0 text-white mt-1" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="break-all text-[16px] font-extrabold text-white sm:break-normal sm:text-[20px]">
                    {tCta('email')}
                  </p>
                  <p className="mt-1 text-[13px] text-white/75 sm:text-[14px]">
                    {tCta('emailSla')}
                  </p>
                </div>
              </div>

              {/* Item 3: IZ Connection */}
              <div className="flex items-start gap-4">
                <Send className="h-6 w-6 shrink-0 text-white mt-1" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[18px] font-extrabold text-white sm:text-[20px]">
                    {tCta('izConnect')}
                  </p>
                  <p className="mt-1 text-[13px] text-white/75 sm:text-[14px]">{tCta('izList')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div
          className="fixed inset-x-4 z-50 flex min-h-12 items-center gap-2.5 border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-200 sm:inset-x-auto sm:right-5"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <Clock className="h-5 w-5 shrink-0 text-amber-600" />
          <span className="text-sm font-semibold">{tCta('cataloguePending')}</span>
        </div>
      )}
    </section>
  );
}
