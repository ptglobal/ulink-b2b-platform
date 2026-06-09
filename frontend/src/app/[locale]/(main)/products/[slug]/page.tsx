import { setRequestLocale } from 'next-intl/server';
import { PageStub } from '@/components/page-stub';

export default async function ProductDetailPage({
  params: { locale, slug }
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  return (
    <PageStub
      title={`Product · ${slug}`}
      note="Technical Specifications · Download TDS/MSDS · Request Sample · RFQ / Add to Cart (stub)."
    />
  );
}
