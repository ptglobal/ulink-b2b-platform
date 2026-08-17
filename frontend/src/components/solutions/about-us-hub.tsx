import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, Star, ThumbsUp } from '@/components/icons';

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
    <section className="bg-white py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-[calc(100%_-_2rem)] max-w-[80rem] sm:w-[calc(100%_-_4rem)]">
        <div className="mb-9 flex flex-col gap-4 border-b border-[#e5e9f0] pb-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex flex-col gap-1" aria-hidden="true">
              <i className="h-1.5 w-1.5 rounded-full bg-brand" />
              <i className="h-1.5 w-1.5 rounded-full bg-brand/55" />
              <i className="h-1.5 w-1.5 rounded-full bg-brand/25" />
            </span>
            <div>
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
                {t('aboutHub.sectionTitle')}
              </h2>
              <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
                {t('aboutHub.sectionSubtitle')}
              </p>
            </div>
          </div>

          <Link
            href="/about"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 text-[12px] font-semibold text-brand hover:text-brand-strong md:mb-0"
          >
            {t('aboutHub.viewDetails')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] min-h-[19rem] overflow-hidden rounded-[3px] bg-[#eef1f6]">
            <Image
              src="/images/industries/Ulink.png"
              alt={t('aboutHub.hubHeading')}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="flex min-w-0 flex-col py-1 lg:py-5">
            <h3 className="max-w-[22ch] text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[30px]">
              {t('aboutHub.hubHeading')}
            </h3>
            <p className="mt-4 max-w-[58ch] text-[13px] leading-6 text-muted-foreground">
              {t('aboutHub.hubDesc')}
            </p>

            <div className="mt-7 grid grid-cols-2 gap-x-8 gap-y-6">
              {metrics.map((metric, idx) => (
                <div key={idx}>
                  <span className="block text-[22px] font-semibold leading-tight text-[#263a68] sm:text-2xl">
                    {metric.value}
                  </span>
                  <span className="mt-1.5 block text-[11px] leading-4 text-muted-foreground">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto grid grid-cols-2 border border-[#e0e5ee] bg-white sm:grid-cols-4">
              {/* Highlight 1: Pie Chart circle */}
              <div className="flex min-h-16 items-center gap-2.5 border-b border-r border-[#e0e5ee] px-3 sm:border-b-0">
                <div className="w-5 h-5 rounded-full border-[3px] border-t-amber-500 border-r-emerald-500 border-b-blue-500 border-l-slate-200 shrink-0" />
                <span className="text-[10px] font-semibold leading-tight text-slate-600">
                  {t('aboutHub.highlight1')}
                </span>
              </div>

              {/* Highlight 2: Cost Optimization dollar */}
              <div className="flex min-h-16 items-center gap-2.5 border-b border-[#e0e5ee] px-3 sm:border-b-0 sm:border-r">
                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="text-blue-600 font-black text-xs">$</span>
                </div>
                <span className="text-[10px] font-semibold leading-tight text-slate-600">
                  {t('aboutHub.highlight2')}
                </span>
              </div>

              {/* Highlight 3: Quality Star Ratings */}
              <div className="flex min-h-16 items-center gap-2.5 border-r border-[#e0e5ee] px-3">
                <div className="flex shrink-0 items-center text-amber-400">
                  {[0, 1, 2, 3].map((star) => (
                    <Star key={star} className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                  ))}
                  <Star className="h-2.5 w-2.5 text-slate-300" aria-hidden="true" />
                </div>
                <span className="text-[10px] font-semibold leading-tight text-slate-600">
                  {t('aboutHub.highlight3')}
                </span>
              </div>

              {/* Highlight 4: Thumbs up count */}
              <div className="flex min-h-16 items-center gap-2.5 px-3">
                <ThumbsUp className="h-4 w-4 text-blue-500 fill-blue-50 shrink-0" />
                <span className="text-[10px] font-semibold leading-tight text-slate-600">
                  {t('aboutHub.highlight4')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
