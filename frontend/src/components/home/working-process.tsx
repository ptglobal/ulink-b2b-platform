import { FileCheck, UserCheck, Settings, Truck } from '@/components/icons';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import { SectionHeader } from './section-header';

export async function WorkingProcess({
  variant = 'default'
}: {
  variant?: 'default' | 'industries';
} = {}) {
  const t = await getTranslations('home');
  const isIndustries = variant === 'industries';
  const steps = [
    {
      step: 1,
      icon: FileCheck,
      numberKey: 'workingProcess.step1Number',
      titleKey: 'workingProcess.step1Title',
      descKey: 'workingProcess.step1Desc',
      kpiLabelKey: 'workingProcess.step1KpiLabel',
      kpiValueKey: 'workingProcess.step1KpiValue'
    },
    {
      step: 2,
      icon: UserCheck,
      numberKey: 'workingProcess.step2Number',
      titleKey: 'workingProcess.step2Title',
      descKey: 'workingProcess.step2Desc',
      kpiLabelKey: 'workingProcess.step2KpiLabel',
      kpiValueKey: 'workingProcess.step2KpiValue'
    },
    {
      step: 3,
      icon: Settings,
      numberKey: 'workingProcess.step3Number',
      titleKey: 'workingProcess.step3Title',
      descKey: 'workingProcess.step3Desc',
      kpiLabelKey: 'workingProcess.step3KpiLabel',
      kpiValueKey: 'workingProcess.step3KpiValue'
    },
    {
      step: 4,
      icon: Truck,
      numberKey: 'workingProcess.step4Number',
      titleKey: 'workingProcess.step4Title',
      descKey: 'workingProcess.step4Desc',
      kpiLabelKey: 'workingProcess.step4KpiLabel',
      kpiValueKey: 'workingProcess.step4KpiValue'
    }
  ] as const;

  return (
    <section
      className={cn(
        'w-full',
        isIndustries ? 'bg-[#f5f7fb] py-12 sm:py-14' : 'mx-auto max-w-[1440px] px-4 py-12 lg:py-16'
      )}
    >
      <div
        className={cn(
          isIndustries && 'mx-auto w-[calc(100%_-_2rem)] max-w-[80rem] sm:w-[calc(100%_-_4rem)]'
        )}
      >
        {isIndustries ? (
          <header className="mx-auto max-w-2xl text-center">
            <h2 className="text-[24px] font-semibold tracking-[-0.025em] text-foreground sm:text-[28px]">
              {t('workingProcess.sectionTitle')}
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
              {t('workingProcess.sectionSubTitle')}
            </p>
          </header>
        ) : (
          <SectionHeader
            title={t('workingProcess.sectionTitle')}
            subtitle={t('workingProcess.sectionSubTitle')}
            viewAllHref="/about"
            viewAllLabel={t('workingProcess.viewDetail')}
          />
        )}

        <div
          className={cn(
            'mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
            isIndustries ? 'gap-4' : 'gap-6'
          )}
        >
          {steps.map(
            ({
              step,
              icon: IconComponent,
              numberKey,
              titleKey,
              descKey,
              kpiLabelKey,
              kpiValueKey
            }) => (
              <article
                key={step}
                className={cn(
                  'flex flex-col border border-border bg-white transition-[border-color,box-shadow,transform]',
                  isIndustries
                    ? 'min-h-[17rem] rounded-[3px] p-5 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-[0_10px_26px_rgba(20,42,92,.07)]'
                    : 'rounded-xl p-6 shadow-sm hover:shadow-md'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center text-brand">
                    <IconComponent
                      className={cn(isIndustries ? 'h-6 w-6' : 'h-8 w-8 sm:h-9 sm:w-9')}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-4 h-0 w-full border-b border-dashed border-slate-300" />
                </div>

                <div className={cn('border-t border-border pt-4', isIndustries ? 'mt-5' : 'mt-6')}>
                  <p
                    className={cn(
                      'font-bold text-muted-foreground',
                      isIndustries ? 'text-[11px]' : 'text-[14px] sm:text-[15px]'
                    )}
                  >
                    {t(numberKey)}
                  </p>
                  <h3
                    className={cn(
                      'mt-1 text-primary',
                      isIndustries
                        ? 'text-[16px] font-semibold'
                        : 'text-[18px] font-extrabold sm:text-[20px] lg:text-[22px]'
                    )}
                  >
                    {t(titleKey)}
                  </h3>
                  <p
                    className={cn(
                      'mt-3 leading-relaxed text-slate-600',
                      isIndustries ? 'text-[12px]' : 'text-[14px] sm:text-[15px]'
                    )}
                  >
                    {t(descKey)}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4 sm:mt-auto">
                  <span
                    className={cn(
                      'font-semibold text-muted-foreground',
                      isIndustries ? 'text-[10px]' : 'text-[13px] sm:text-[14px]'
                    )}
                  >
                    {t(kpiLabelKey)}
                  </span>
                  <span
                    className={cn(
                      'font-extrabold text-brand',
                      isIndustries ? 'text-[11px]' : 'text-[16px] sm:text-[18px]'
                    )}
                  >
                    {t(kpiValueKey)}
                  </span>
                </div>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}
