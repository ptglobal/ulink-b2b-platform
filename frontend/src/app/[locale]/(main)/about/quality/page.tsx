import { setRequestLocale } from 'next-intl/server';
import { AboutQualityHero } from '@/components/layout/about-quality-hero';
import { AboutQualityStandards } from '@/components/layout/about-quality-standards';
import { AboutQualityProcess } from '@/components/layout/about-quality-process';
import { AboutQualityMetrics } from '@/components/layout/about-quality-metrics';

export default async function AboutQualityPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="flex flex-col gap-8">
      <AboutQualityHero />
      <AboutQualityStandards />
      {/* Process + Metrics row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <AboutQualityProcess />
        <AboutQualityMetrics />
      </div>
    </div>
  );
}
