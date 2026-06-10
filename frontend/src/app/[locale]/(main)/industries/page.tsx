import { setRequestLocale } from 'next-intl/server';
import { PageStub } from '@/components/page-stub';

export default async function IndustriesPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <PageStub
      title="Industry Solutions"
      note="Electronics · Pharmaceutical · Cosmetics · Food & Beverage (stub)."
    />
  );
}
