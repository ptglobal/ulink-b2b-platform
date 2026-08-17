import { getTranslations } from 'next-intl/server';

export async function AboutQualityMetrics() {
  const t = await getTranslations('aboutQuality.metrics');

  const metrics = [
    { label: t('onTime'), value: t('onTimeValue') },
    { label: t('qualityRate'), value: t('qualityRateValue') },
    { label: t('complaintRate'), value: t('complaintRateValue') },
    { label: t('satisfaction'), value: t('satisfactionValue') }
  ];

  return (
    <section className="rounded-[6px] border border-border/40 bg-white px-6 py-6">
      {/* Header */}
      <h2 className="text-[12px] font-bold text-foreground">{t('title')}</h2>

      {/* Metrics list */}
      <div className="mt-5 flex flex-col gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between border-b border-border/20 pb-3 last:border-b-0 last:pb-0"
          >
            <p className="text-[10px] font-normal text-foreground/60">{metric.label}</p>
            <p className="text-[14px] font-bold text-brand">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-4 text-[9px] font-normal text-foreground/40">{t('note')}</p>
    </section>
  );
}
