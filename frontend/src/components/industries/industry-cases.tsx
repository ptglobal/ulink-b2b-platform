'use client';

import React from 'react';
import { ArrowRight } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { IndustryData } from './types';

interface IndustryCasesProps {
  industryData: IndustryData;
  locale: string;
}

export function IndustryCases({ industryData, locale }: IndustryCasesProps) {
  return (
    <section id="cases" className="scroll-mt-36 pt-6 border-t border-slate-100 space-y-6">
      <h3 className="text-lg sm:text-xl font-extrabold text-foreground">
        {industryData.casesTitle}
      </h3>

      <div className="grid gap-6 sm:grid-cols-3">
        {industryData.cases.map((cs, idx) => (
          <div key={idx} className="flex gap-4 items-start bg-transparent">
            <div className="relative w-24 h-18 sm:w-28 sm:h-20 shrink-0 overflow-hidden bg-slate-50 border border-slate-100">
              <Image src={cs.image} alt={cs.title} fill className="object-cover" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-extrabold text-foreground leading-snug">
                {cs.title}
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-400 font-semibold leading-relaxed">
                {cs.description}
              </p>
              <div className="pt-1">
                <Link
                  href="/about"
                  className="text-[10px] sm:text-xs font-bold text-brand inline-flex items-center gap-1 hover:underline"
                >
                  {locale === 'vi'
                    ? 'Xem chi tiết'
                    : locale === 'ja'
                      ? '詳細を見る'
                      : 'View details'}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
