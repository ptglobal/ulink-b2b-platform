import { setRequestLocale } from 'next-intl/server';
import { PageStub } from '@/components/page-stub';

export default async function QuickOrderPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <PageStub
      title="Quick Order"
      note="SKU Input · Bulk Quantity Upload · RFQ Cart · Submit Request. Cached SKU lookup via /api/sku (Redis, <50ms) (stub)."
    />
  );
}
