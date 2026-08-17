import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Building2, Factory, Check, ArrowRight } from '@/components/icons';
import { Link } from '@/i18n/navigation';

interface CustomerSegmentsProps {
  locale: string;
}

export default async function CustomerSegments({ locale }: CustomerSegmentsProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });

  const bullets = [
    t('customerSegments.bullet1'),
    t('customerSegments.bullet2'),
    t('customerSegments.bullet3'),
    t('customerSegments.bullet4')
  ];

  return (
    <section className="w-full mt-16 lg:mt-24 border-t border-slate-100 pt-16">
      {/* Section Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 mb-10">
        <div className="flex items-start gap-3">
          {/* Blue decorative bar */}
          <div className="w-1.5 h-7 bg-blue-600 rounded-full shrink-0 mt-1" />
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {t('customerSegments.sectionTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              {t('customerSegments.sectionSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Two Segments - Full Width, No Border Radius, Split 50/50 */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-0">
        {/* FDI Enterprise Card */}
        <div className="bg-evidence text-white p-8 sm:p-12 lg:p-16 flex justify-end w-full">
          <div className="w-full max-w-[640px] flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-evidence shrink-0 shadow-sm">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                  {t('customerSegments.fdiTitle')}
                </h3>
              </div>

              {/* Bullets */}
              <ul className="space-y-4 mb-10">
                {bullets.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-xs sm:text-sm font-medium leading-relaxed"
                  >
                    <Check className="h-5 w-5 text-white/95 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-2">
              <Link
                href="/quick-order"
                className="inline-flex items-center justify-center gap-2 w-full max-w-[200px] bg-white text-evidence hover:bg-slate-50 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:scale-[1.01]"
              >
                {t('customerSegments.viewDetails')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* SME Enterprise Card */}
        <div className="bg-[#EAF1FC] text-slate-900 p-8 sm:p-12 lg:p-16 flex justify-start w-full">
          <div className="w-full max-w-[640px] flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-750 shrink-0">
                  <Factory className="h-6 w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                  {t('customerSegments.smeTitle')}
                </h3>
              </div>

              {/* Bullets */}
              <ul className="space-y-4 mb-10">
                {bullets.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-xs sm:text-sm text-slate-650 font-medium leading-relaxed"
                  >
                    <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-2">
              <Link
                href="/quick-order"
                className="inline-flex items-center justify-center gap-2 w-full max-w-[200px] bg-brand-strong hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:scale-[1.01]"
              >
                {t('customerSegments.viewDetails')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
