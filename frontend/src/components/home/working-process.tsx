import { FileCheck, UserCheck, Settings, Truck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SectionHeader } from './section-header';

export async function WorkingProcess() {
  const t = await getTranslations('home');

  const steps = [
    { step: 1, icon: FileCheck },
    { step: 2, icon: UserCheck },
    { step: 3, icon: Settings },
    { step: 4, icon: Truck }
  ];

  return (
    <section className="mx-auto w-full max-w-[1800px] px-4 py-12 lg:py-16">
      {/* ── SECTION HEADER BAR ── */}
      <SectionHeader
        title={t('workingProcess.sectionTitle')}
        subtitle={t('workingProcess.sectionSubTitle')}
        viewAllHref="/about"
        viewAllLabel={t('workingProcess.viewDetail')}
      />

      {/* ── 4 STEP CARDS GRID ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ step, icon: IconComponent }) => (
          <div
            key={step}
            className="flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            {/* Tầng 1: Icon & Dashed Line Connector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center text-brand">
                <IconComponent className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true" />
              </div>
              {/* Dashed connector line */}
              <div className="ml-4 h-0 w-full border-b border-dashed border-slate-300" />
            </div>

            {/* Tầng 2: Nội dung chính */}
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-[14px] font-bold text-muted-foreground sm:text-[15px]">
                {t(`workingProcess.step${step}Number` as any)}
              </p>
              <h3 className="mt-1 text-[18px] font-extrabold text-primary sm:text-[20px] lg:text-[22px]">
                {t(`workingProcess.step${step}Title` as any)}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-600 sm:text-[15px]">
                {t(`workingProcess.step${step}Desc` as any)}
              </p>
            </div>

            {/* Tầng 3: Footer KPI */}
            <div className="mt-6 mt-auto flex items-center justify-between border-t border-border pt-4">
              <span className="text-[13px] font-semibold text-muted-foreground sm:text-[14px]">
                {t(`workingProcess.step${step}KpiLabel` as any)}
              </span>
              <span className="text-[16px] font-extrabold text-brand sm:text-[18px]">
                {t(`workingProcess.step${step}KpiValue` as any)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
