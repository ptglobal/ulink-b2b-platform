import { setRequestLocale } from 'next-intl/server';
import { PageStub } from '@/components/page-stub';

export default async function SolutionsPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <PageStub
      title="Solutions / Products"
      note="Cleanroom Solutions · Packaging Solutions — category tree, SKU search, product detail (stub)."
    />
  );
}
