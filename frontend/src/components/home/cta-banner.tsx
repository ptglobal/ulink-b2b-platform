import { ArrowRight, PhoneCall, Mail, Send } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function CtaBanner() {
  const tCta = await getTranslations('ctaBanner');

  return (
    <section className="w-full bg-[#3B82F6] text-white">
      <div className="mx-auto w-full max-w-[1800px] px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
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
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/rfq"
                className="inline-flex items-center gap-3 rounded-lg bg-white px-8 py-3.5 text-[15px] font-bold text-brand shadow-lg transition-transform hover:scale-102 hover:bg-slate-50"
              >
                {tCta('ctaRfq')}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center gap-3 text-[15px] font-bold text-white transition-opacity hover:opacity-80"
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
                <div>
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
                <div>
                  <p className="text-[18px] font-extrabold text-white sm:text-[20px]">
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
                <div>
                  <p className="text-[18px] font-extrabold text-white sm:text-[20px]">
                    {tCta('izConnect')}
                  </p>
                  <p className="mt-1 text-[13px] text-white/75 sm:text-[14px]">
                    {tCta('izList')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
