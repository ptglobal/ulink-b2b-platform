'use client';

import React from 'react';
import { ArrowRight } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { IndustryData } from './types';

interface IndustrySolutionsProps {
  industryData: IndustryData;
  translations: any;
  currentSlug: string;
}

export function IndustrySolutions({
  industryData,
  translations,
  currentSlug
}: IndustrySolutionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
      {/* Section: Cleanroom Solutions */}
      <section id="cleanroom" className="scroll-mt-36 space-y-4">
        <div className="space-y-1">
          <span className="inline-block bg-brand/[0.08] text-brand text-[11px] font-extrabold px-3 py-1">
            {translations.cleanroomSol}
          </span>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            {industryData.cleanroomIntro}
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-5">
          {industryData.cleanroomCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/solutions?industry=${currentSlug}&category=${cat.slug || 'cleanroom-consumables'}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative aspect-square w-full bg-background overflow-hidden border border-slate-100 flex items-center justify-center p-1 group-hover:shadow-md transition-shadow">
                <Image src={cat.image} alt={cat.name} fill className="object-contain p-1" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold mt-2 text-center line-clamp-2 leading-tight min-h-[26px] flex items-center justify-center px-0.5">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="pt-2">
          <Link
            href={`/solutions?industry=${currentSlug}&category=cleanroom-consumables`}
            className="w-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-[11px] font-extrabold inline-flex items-center gap-1.5 text-slate-700 transition-colors justify-center"
          >
            {industryData.cleanroomViewAll}
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>
      </section>

      {/* Section: Packaging Solutions */}
      <section id="packaging" className="scroll-mt-36 space-y-4">
        <div className="space-y-1">
          <span className="inline-block bg-brand/[0.08] text-brand text-[11px] font-extrabold px-3 py-1">
            {translations.packagingSol}
          </span>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            {industryData.packagingIntro}
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {industryData.packagingCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/solutions?industry=${currentSlug}&category=${cat.slug || 'industrial-packaging'}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative aspect-square w-full bg-background overflow-hidden border border-slate-100 flex items-center justify-center p-1 group-hover:shadow-md transition-shadow">
                <Image src={cat.image} alt={cat.name} fill className="object-contain p-1" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold mt-2 text-center line-clamp-2 leading-tight min-h-[26px] flex items-center justify-center px-0.5">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="pt-2">
          <Link
            href={`/solutions?industry=${currentSlug}&category=industrial-packaging`}
            className="w-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-[11px] font-extrabold inline-flex items-center gap-1.5 text-slate-700 transition-colors justify-center"
          >
            {industryData.packagingViewAll}
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>
      </section>
    </div>
  );
}
