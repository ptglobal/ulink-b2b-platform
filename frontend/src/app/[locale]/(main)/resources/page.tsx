import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { publicDirectus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import { ResourceItem } from '@/components/resources/types';
import { ResourcesClient } from '@/components/resources/resources-client';

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
      ? 'Tra cứu tài liệu kỹ thuật, chứng chỉ ISO, nghiên cứu điển hình và tài liệu tải về của ULink Industries.'
      : isJa
      ? 'ULink Industriesの技術文書、ISO認証、ケーススタディ、ダウンロード資料を検索します。'
      : 'Browse technical documents, ISO certifications, case studies, and download materials from ULink Industries.'
  };
}

export default async function ResourcesPage({
  params: { locale }
}: Props) {
  setRequestLocale(locale);

  // Fetch real data from Directus
  let directusDocs: ResourceItem[] = [];
  let directusIsos: ResourceItem[] = [];

  try {
    const documentsRes = await publicDirectus.request(
      readItems('documents', {
        filter: { status: { _eq: 'published' } },
        fields: ['id', 'title', 'doc_type', 'file']
      })
    );

    directusDocs = documentsRes.map((doc: any) => ({
      id: `doc-${doc.id}`,
      category: 'guide',
      badge: { vi: 'Tài liệu', en: 'Document', ja: 'ドキュメント' },
      title: { vi: doc.title || '', en: doc.title || '', ja: doc.title || '' },
      description: { vi: '', en: '', ja: '' },
      date: new Date().toLocaleDateString('en-GB'),
      image: '/images/home/product-gloves-box.webp',
      contentType: 'tech-doc',
      author: { name: { vi: 'ULink', en: 'ULink', ja: 'ULink' }, role: { vi: '', en: '', ja: '' }, avatar: '' },
      readTime: { vi: '', en: '', ja: '' },
      sections: [],
      aiSummary: { intro: { vi: '', en: '', ja: '' }, bullets: [] },
      audioDuration: '0',
      audioSecs: 0,
      isDirectDownloadOnly: true,
      fileId: doc.file
    }));

    const isoRes = await publicDirectus.request(
      readItems('iso_certifications', {
        filter: { status: { _eq: 'published' } },
        fields: ['id', 'name', 'number', 'issuer', 'file']
      })
    );

    directusIsos = isoRes.map((iso: any) => ({
      id: `iso-${iso.id}`,
      category: 'standard',
      badge: { vi: 'Chứng chỉ ISO', en: 'ISO Certificate', ja: 'ISO 証明書' },
      title: { vi: iso.name || '', en: iso.name || '', ja: iso.name || '' },
      description: { vi: iso.number || '', en: iso.number || '', ja: iso.number || '' },
      date: new Date().toLocaleDateString('en-GB'),
      image: '/images/about/iso-9001.webp',
      contentType: 'certificate',
      author: { name: { vi: 'ULink', en: 'ULink', ja: 'ULink' }, role: { vi: '', en: '', ja: '' }, avatar: '' },
      readTime: { vi: '', en: '', ja: '' },
      sections: [],
      aiSummary: { intro: { vi: '', en: '', ja: '' }, bullets: [] },
      audioDuration: '0',
      audioSecs: 0,
      isDirectDownloadOnly: true,
      fileId: iso.file
    }));
  } catch (err) {
    console.error('Error fetching resources from Directus:', err);
  }

  const allResources = [...directusDocs, ...directusIsos];
  const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';

  return (
    <section className="relative min-h-screen">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-8 lg:px-16 lg:py-12">
        <ResourcesClient initialResources={allResources} directusUrl={directusUrl} />
      </div>
    </section>
  );
}
