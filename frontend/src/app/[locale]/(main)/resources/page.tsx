import { setRequestLocale } from 'next-intl/server';
import { PageStub } from '@/components/page-stub';

export default async function ResourcesPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <PageStub
      title="Resource Center"
      note="Technical Documents · ISO Certifications · Case Studies · Blog & News · Download Center (stub)."
    />
  );
}
