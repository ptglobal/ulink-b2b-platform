import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ResourcesClient } from '@/components/resources/resources-client';
import { loadResourceCatalog } from '@/components/resources/resource-catalog.server';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isVi = locale === 'vi';
  const isJa = locale === 'ja';
  return {
    title: isVi
      ? 'Trung tâm Tài nguyên & Tài liệu | ULink B2B'
      : isJa
        ? 'リソースセンター | ULink B2B'
        : 'Resource Center | ULink B2B',
    description: isVi
      ? 'Tra cứu cẩm nang kỹ thuật, chứng chỉ ISO, nghiên cứu điển hình và tài liệu tải về của ULink Industries.'
      : isJa
        ? 'ULink Industriesの技術文書、ISO認証、ケーススタディ、ダウンロード資料を検索します。'
        : 'Browse technical documents, ISO certifications, case studies, and download materials from ULink Industries.'
  };
}

export default async function ResourcesPage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  const allResources = await loadResourceCatalog();

  return (
    <section className="relative min-h-screen">
      <ResourcesClient initialResources={allResources} />
    </section>
  );
}
