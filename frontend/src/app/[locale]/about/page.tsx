import { setRequestLocale } from 'next-intl/server';
import { PageStub } from '@/components/page-stub';

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <PageStub
      title="About ULink"
      note="Company Overview · Core Competencies · Sustainability · Careers · Contact (stub)."
    />
  );
}
