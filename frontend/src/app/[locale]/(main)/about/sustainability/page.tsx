import { setRequestLocale } from 'next-intl/server';
import { AboutSustainability } from '@/components/about/about-sustainability';
import { getPagePresentation } from '@/lib/page-presentation';

export default async function AboutSustainabilityPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const presentation = await getPagePresentation('about-sustainability', locale);

  return (
    <div className="bg-background">
      <div className="ulink-container">
        <AboutSustainability locale={locale} media={presentation?.heroMedia} standalone />
      </div>
    </div>
  );
}
