import { setRequestLocale } from 'next-intl/server';
import {
  HeroBanner,
  FeatureValueBar,
  ProductCategories,
  IndustrySolutions,
  AboutSection,
  TargetSegments,
  PartnersCertifications,
  CaseStudies,
  WorkingProcess,
  ResourcesNews,
  CtaBanner
} from '@/components/home';

/** ISR — revalidate every hour; on-demand revalidation via content webhooks */
export const revalidate = 3600;

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  return (
    <div className="w-full bg-white">
      <HeroBanner />
      <FeatureValueBar />
      <ProductCategories />
      <IndustrySolutions />
      <AboutSection />
      <TargetSegments />
      <PartnersCertifications />
      <CaseStudies />
      <WorkingProcess />
      <ResourcesNews />
      <CtaBanner />
    </div>
  );
}
