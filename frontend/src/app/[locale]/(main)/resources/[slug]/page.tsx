import { redirect } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ResourceDetailClient } from '@/components/resources/resource-detail-client';
import { loadResourceBySlug } from '@/components/resources/resource-catalog.server';
import { resourceToDetailData } from '@/components/resources/resource-utils';

interface PageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { locale, slug } = params;
  setRequestLocale(locale);

  const resource = await loadResourceBySlug(slug);

  if (!resource) {
    redirect({ href: '/resources', locale });
  }

  const data = resourceToDetailData(resource!, locale as 'vi' | 'en' | 'ja');

  return <ResourceDetailClient data={data} locale={locale} />;
}
