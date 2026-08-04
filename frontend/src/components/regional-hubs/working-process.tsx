import React from 'react';
import { FileCheck, Users, Settings, Truck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function WorkingProcess() {
  const t = await getTranslations('regionalHubs.workingProcess');

  const steps = [
    { step: 1, icon: FileCheck },
    { step: 2, icon: Users },
    { step: 3, icon: Settings },
    { step: 4, icon: Truck }
  ];

  return (
    <section className="w-full bg-white py-16 sm:py-20 border-t border-slate-100">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
        
        {/* === Section Header === */}
        <div className="flex items-start gap-3 mb-10">
          {/* Vertical Dotted Line / Colons */}
          <div className="flex flex-col gap-1.5 mt-1 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1769E2]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#1769E2]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#1769E2]" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-slate-900 leading-tight">
              {t('title')}
            </h2>
            <p className="mt-2 text-[12px] text-slate-500 max-w-[600px]">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* === 4 Step Cards Grid === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ step, icon: IconComponent }) => (
            <div
              key={step}
              className="flex flex-col rounded-xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 min-h-[320px]"
            >
              {/* Top Row: Icon & Dashed Connector Line */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center text-[#1769E2]">
                  <IconComponent className="h-9 w-9 stroke-[1.5]" aria-hidden="true" />
                </div>
                {/* Dashed connector line */}
                <div className="ml-4 h-0 w-full border-b border-dashed border-slate-200" />
              </div>

              {/* Middle Row: Content */}
              <div className="flex-1 border-t border-slate-100 pt-4 flex flex-col justify-start">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {t(`step${step}Number`)}
                </span>
                <h3 className="mt-1 text-[16px] font-bold text-slate-800 leading-tight">
                  {t(`step${step}Title`)}
                </h3>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-500 flex-1">
                  {t(`step${step}Desc`)}
                </p>
              </div>

              {/* Bottom Row: Footer KPI */}
              <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-400">
                  {t(`step${step}KpiLabel`)}
                </span>
                <span className="text-[14px] font-extrabold text-[#1769E2] uppercase tracking-wide">
                  {t(`step${step}KpiValue`)}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
