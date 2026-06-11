import { setRequestLocale } from 'next-intl/server';
import { AboutHubHero } from '@/components/layout/about-hub-hero';
import { AboutHubStats } from '@/components/layout/about-hub-stats';
import { AboutHubOperations } from '@/components/layout/about-hub-operations';
import { AboutHubSustainability } from '@/components/layout/about-hub-sustainability';

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  return (
    <div className="flex flex-col gap-8">
      <AboutHubHero />
      <AboutHubStats />
      <div className="h-px w-full bg-[#B8C0CC]" />
      <AboutHubOperations />
      <AboutHubSustainability />
    </div>
  );
}
