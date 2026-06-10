import { setRequestLocale } from 'next-intl/server';
import { PageStub } from '@/components/page-stub';

export default async function RegionalHubsPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <PageStub
      title="Regional Hubs"
      note="Dong Van 4 · Bac Thang Long · Bac Ninh · Hung Yen · Hai Phong — SLA, Warehouse Capacity, Technical Team, Cluster Overview (stub)."
    />
  );
}
