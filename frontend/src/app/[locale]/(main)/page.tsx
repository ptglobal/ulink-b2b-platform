import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CarbonHomepage } from '@/components/home/carbon-homepage';
import { getHomePageContent } from '@/lib/brand-content';
import { getIndustriesPresentationCopy } from '@/lib/industries-content';
import { getPagePresentation } from '@/lib/page-presentation';
import { getSiteSettings } from '@/lib/site-settings';

/** ISR — revalidate every hour; on-demand revalidation via content webhooks */
// export const revalidate = 3600;

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const [content, settings, industriesPresentation] = await Promise.all([
    getHomePageContent(locale),
    getSiteSettings(),
    getPagePresentation('industries', locale)
  ]);
  const industries = getIndustriesPresentationCopy(industriesPresentation);
  if (!content || !industries) notFound();

  return <CarbonHomepage content={content} settings={settings} industries={industries} />;
}
