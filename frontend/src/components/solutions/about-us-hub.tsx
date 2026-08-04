import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, ThumbsUp } from 'lucide-react';

interface AboutUsHubProps {
  locale: string;
}

export default async function AboutUsHub({ locale }: AboutUsHubProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });

  const metrics = [
    {
      value: t('aboutHub.metric1Val'),
      label: t('aboutHub.metric1Label')
    },
    {
      value: t('aboutHub.metric2Val'),
      label: t('aboutHub.metric2Label')
    },
    {
      value: t('aboutHub.metric3Val'),
      label: t('aboutHub.metric3Label')
    },
    {
      value: t('aboutHub.metric4Val'),
      label: t('aboutHub.metric4Label')
    }
  ];

  return (
    <section className="w-full mt-16 lg:mt-24 border-t border-slate-100 pt-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div className="flex items-start gap-3">
          {/* Blue decorative bar */}
          <div className="w-1.5 h-7 bg-blue-600 rounded-full shrink-0 mt-1" />
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F1E36] tracking-tight">
              {t('aboutHub.sectionTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              {t('aboutHub.sectionSubtitle')}
            </p>
          </div>
        </div>

        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors shrink-0 md:mb-1"
        >
          {t('aboutHub.viewDetails')}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Modern Building Image */}
        <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto lg:min-h-[450px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
          <Image
            src="/images/industries/Ulink.png"
            alt={t('aboutHub.hubHeading')}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 40vw"
            priority
          />
        </div>

        {/* Right Side: Metrics & Highlights Panel */}
        <div className="lg:col-span-7 bg-[#F8FAFC]/65 rounded-2xl border border-slate-100 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F1E36] tracking-tight mb-4">
              {t('aboutHub.hubHeading')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium mb-8">
              {t('aboutHub.hubDesc')}
            </p>

            {/* Metrics 2x2 Grid */}
            <div className="grid grid-cols-2 gap-6 sm:gap-8 mb-8">
              {metrics.map((metric, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-xl sm:text-2.5xl font-extrabold text-blue-600 leading-tight">
                    {metric.value}
                  </span>
                  <span className="text-xs text-slate-500 font-medium mt-1.5 leading-snug">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lower Highlight Cards Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white rounded-2xl border border-slate-100/80 shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Highlight 1: Pie Chart circle */}
            <div className="flex items-center gap-2.5 sm:px-2 pt-2 first:pt-0 sm:pt-0">
              <div className="w-5 h-5 rounded-full border-[3px] border-t-amber-500 border-r-emerald-500 border-b-blue-500 border-l-slate-200 shrink-0" />
              <span className="text-[10px] sm:text-xs text-slate-600 font-bold leading-tight">
                {t('aboutHub.highlight1')}
              </span>
            </div>

            {/* Highlight 2: Cost Optimization dollar */}
            <div className="flex items-center gap-2.5 sm:pl-4 pt-2 sm:pt-0">
              <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-black text-xs">$</span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-600 font-bold leading-tight">
                {t('aboutHub.highlight2')}
              </span>
            </div>

            {/* Highlight 3: Quality Star Ratings */}
            <div className="flex items-center gap-2.5 sm:pl-4 pt-2 sm:pt-0">
              <div className="flex flex-col items-start gap-0.5 shrink-0">
                <div className="flex items-center text-[10px] text-amber-400">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-slate-300">★</span>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-600 font-bold leading-tight">
                {t('aboutHub.highlight3')}
              </span>
            </div>

            {/* Highlight 4: Thumbs up count */}
            <div className="flex items-center gap-2.5 sm:pl-4 pt-2 sm:pt-0">
              <ThumbsUp className="h-4 w-4 text-blue-500 fill-blue-50 shrink-0" />
              <span className="text-[10px] sm:text-xs text-slate-600 font-bold leading-tight">
                {t('aboutHub.highlight4')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
