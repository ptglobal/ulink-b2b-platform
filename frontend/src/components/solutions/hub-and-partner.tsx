import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface HubAndPartnerProps {
  locale: string;
  copy?: Record<string, string>;
}

export default async function HubAndPartner({ locale, copy }: HubAndPartnerProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });
  const label = (key: string) => copy?.[key] || t(`hubPartner.${key}`);

  return (
    <>
      {/* === SECTION: HUB HÀ NAM === */}
      <section className="w-full bg-white border-t border-gray-150 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 text-center">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-blue-600 tracking-tight uppercase">
              {label('hubHeading')}
            </h2>
            <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              {label('hubDesc')}
            </p>
          </div>

          {/* Central Showcase Image */}
          <div className="relative w-full max-w-4xl mx-auto aspect-[16/10] rounded-2xl overflow-hidden shadow-md bg-slate-50 border border-gray-100">
            <Image
              src="/images/brand/ulink-hub-hanam-overview-royal-v1.webp"
              alt={label('hubHeading')}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 80vw"
            />
          </div>
        </div>
      </section>

      {/* === SECTION: TRỞ THÀNH ĐỐI TÁC === */}
      <section className="w-full bg-background border-t border-gray-150 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Text Content and Buttons */}
            <div className="lg:col-span-6 flex flex-col items-start">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {label('partnerHeading')}
              </h2>
              <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                {label('partnerDesc')}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <Link
                  href={`/${locale}/about`}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
                >
                  {label('learnMore')}
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex items-center justify-center rounded-lg border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 px-6 py-3 text-sm font-semibold transition-colors w-full sm:w-auto text-center"
                >
                  {label('connectUs')}
                </Link>
              </div>
            </div>

            {/* Right: Partner Image */}
            <div className="lg:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm bg-slate-50 border border-gray-100">
              <Image
                src="/images/industries/case_supplier.webp"
                alt={label('partnerHeading')}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
