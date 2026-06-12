import { Fragment } from 'react';
import { getTranslations } from 'next-intl/server';
import { Search, PackageCheck, BoxSelect, Truck, Users, ArrowRight } from 'lucide-react';

export async function AboutQualityProcess() {
  const t = await getTranslations('aboutQuality.process');

  const steps = [
    { key: 'step1', icon: <Search className="h-5 w-5" strokeWidth={1.4} /> },
    { key: 'step2', icon: <PackageCheck className="h-5 w-5" strokeWidth={1.4} /> },
    { key: 'step3', icon: <BoxSelect className="h-5 w-5" strokeWidth={1.4} /> },
    { key: 'step4', icon: <Truck className="h-5 w-5" strokeWidth={1.4} /> },
    { key: 'step5', icon: <Users className="h-5 w-5" strokeWidth={1.4} /> }
  ];

  return (
    <section className="rounded-[6px] bg-[#F5F5F5] px-6 py-6">
      {/* Header */}
      <div>
        <h2 className="text-[12px] font-bold text-[#1A2D49]">
          {t('title')}
        </h2>
        <p className="mt-1.5 text-[9px] font-normal text-[#141414]/50">
          {t('subtitle')}
        </p>
      </div>

      {/* Steps flow */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
        {steps.map((step, index) => (
          <Fragment key={step.key}>
            {/* Step item */}
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[#1769E2]">
                {step.icon}
              </div>
              {/* Number */}
              <span className="mt-1.5 text-[11px] font-normal text-[#141414]/60">
                {t(`steps.${step.key}.number`)}
              </span>
              {/* Title */}
              <p className="mt-2 text-[10px] font-bold text-[#1A2D49]">
                {t(`steps.${step.key}.title`)}
              </p>
              {/* Description */}
              <p className="mt-1 text-[9px] leading-[1.7] text-[#141414]/40">
                {t(`steps.${step.key}.desc`)}
              </p>
            </div>

            {/* Arrow separator */}
            {index < steps.length - 1 && (
              <div className="hidden items-center justify-center sm:flex">
                <ArrowRight className="h-4 w-4 text-[#B8C0CC]" strokeWidth={1.5} />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
