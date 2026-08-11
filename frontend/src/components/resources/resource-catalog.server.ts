import { readItems } from '@directus/sdk';
import { publicDirectus } from '@/lib/directus';
import { MOCK_RESOURCES } from './mock-data';
import { ResourceItem } from './types';

function currentDateLabel() {
  return new Date().toLocaleDateString('en-GB');
}

function mapDocumentToResource(doc: any): ResourceItem {
  return {
    id: `doc-${doc.id}`,
    category: 'guide',
    badge: { vi: 'Cẩm nang kỹ thuật', en: 'Technical Guide', ja: '技術ガイド' },
    title: { vi: doc.title || '', en: doc.title || '', ja: doc.title || '' },
    description: { vi: '', en: '', ja: '' },
    date: currentDateLabel(),
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
  };
}

function mapIsoToResource(iso: any): ResourceItem {
  return {
    id: `iso-${iso.id}`,
    category: 'standard',
    badge: { vi: 'Chứng chỉ chất lượng', en: 'Certificates', ja: '品質認証書' },
    title: { vi: iso.name || '', en: iso.name || '', ja: iso.name || '' },
    description: { vi: iso.number || '', en: iso.number || '', ja: iso.number || '' },
    date: currentDateLabel(),
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
  };
}

export async function loadResourceCatalog() {
  const [documentsRes, isoRes] = await Promise.all([
    publicDirectus
      .request(
        readItems('documents', {
          filter: { status: { _eq: 'published' } },
          fields: ['id', 'title', 'doc_type', 'file']
        })
      )
      .catch((err) => {
        console.error('Error fetching Directus documents:', err);
        return [];
      }),
    publicDirectus
      .request(
        readItems('iso_certifications', {
          filter: { status: { _eq: 'published' } },
          fields: ['id', 'name', 'number', 'issuer', 'file']
        })
      )
      .catch((err) => {
        console.error('Error fetching Directus ISO certifications:', err);
        return [];
      })
  ]);

  const directusDocs = documentsRes.map(mapDocumentToResource);
  const directusIsos = isoRes.map(mapIsoToResource);

  return [...directusDocs, ...directusIsos, ...MOCK_RESOURCES];
}

export async function loadResourceBySlug(slug: string) {
  const catalog = await loadResourceCatalog();
  return catalog.find((item) => item.id.toLowerCase() === slug.toLowerCase());
}
