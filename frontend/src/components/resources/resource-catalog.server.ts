import { readItems } from '@directus/sdk';
import { publicDirectus } from '@/lib/directus';
import { eventAsset, loadEventsContent } from '@/lib/events-content';
import { ResourceItem } from './types';

type DirectusMedia = string | { id?: string | null } | null | undefined;

interface ResourceTranslationRecord {
  languages_code: string | { code?: string | null };
  title?: string | null;
  meta_description?: string | null;
}

interface DocumentResourceRecord {
  id: string | number;
  title?: string | null;
  cover?: DirectusMedia;
  file?: DirectusMedia;
  product?: number | { hero?: DirectusMedia } | null;
}

interface IsoResourceRecord {
  id: string | number;
  name?: string | null;
  number?: string | null;
  cover?: DirectusMedia;
  file?: DirectusMedia;
}

interface ArticleResourceRecord {
  id: string | number;
  slug?: string | null;
  title?: string | null;
  meta_description?: string | null;
  cover?: DirectusMedia;
  published_at?: string | null;
  translations?: ResourceTranslationRecord[];
}

interface CaseStudyResourceRecord {
  id: string | number;
  slug?: string | null;
  title?: string | null;
  summary?: string | null;
  cover?: DirectusMedia;
}

function currentDateLabel() {
  return new Date().toLocaleDateString('en-GB');
}

function articleCategory(slug = ''): ResourceItem['category'] {
  if (slug.startsWith('event-')) return 'event';
  if (slug.startsWith('guide-')) return 'guide';
  if (slug.startsWith('standard-')) return 'standard';
  if (slug.startsWith('case-')) return 'case-study';
  return 'news';
}

function articleBadge(category: ResourceItem['category']) {
  const badges = {
    event: { vi: 'Sự kiện', en: 'Event', ja: 'イベント' },
    guide: { vi: 'Cẩm nang kỹ thuật', en: 'Technical guide', ja: '技術ガイド' },
    standard: { vi: 'Tiêu chuẩn', en: 'Standard', ja: '規格' },
    'case-study': { vi: 'Nghiên cứu điển hình', en: 'Case study', ja: 'ケーススタディ' },
    news: { vi: 'Tin chuyên ngành', en: 'Industry news', ja: '業界ニュース' }
  } as const;
  return badges[category as keyof typeof badges] || badges.news;
}

function localizedArticleField(
  article: ArticleResourceRecord,
  field: 'title' | 'meta_description'
) {
  const fallback = article[field] || '';
  const value = (locale: 'vi' | 'en' | 'ja') =>
    article.translations?.find(
      (item) =>
        (typeof item.languages_code === 'string'
          ? item.languages_code
          : item.languages_code?.code) === locale
    )?.[field] || fallback;
  return { vi: value('vi'), en: value('en'), ja: value('ja') };
}

function directusFileId(file: unknown) {
  if (typeof file === 'string') return file;
  if (file && typeof file === 'object' && 'id' in file) {
    const id = (file as { id?: unknown }).id;
    return typeof id === 'string' ? id : '';
  }
  return '';
}

function directusAssetUrl(file: unknown) {
  const id = directusFileId(file);
  return id ? `/api/files/${id}` : '';
}

function mapDocumentToResource(doc: DocumentResourceRecord): ResourceItem {
  const productHero = typeof doc.product === 'object' ? doc.product?.hero : null;
  return {
    id: `doc-${doc.id}`,
    category: 'guide',
    badge: { vi: 'Cẩm nang kỹ thuật', en: 'Technical Guide', ja: '技術ガイド' },
    title: { vi: doc.title || '', en: doc.title || '', ja: doc.title || '' },
    description: { vi: '', en: '', ja: '' },
    date: currentDateLabel(),
    image: directusAssetUrl(doc.cover || productHero),
    contentType: 'tech-doc',
    author: {
      name: { vi: 'ULink', en: 'ULink', ja: 'ULink' },
      role: { vi: '', en: '', ja: '' },
      avatar: ''
    },
    readTime: { vi: '', en: '', ja: '' },
    sections: [],
    aiSummary: { intro: { vi: '', en: '', ja: '' }, bullets: [] },
    audioDuration: '0',
    audioSecs: 0,
    isDirectDownloadOnly: true,
    fileId: directusFileId(doc.file)
  };
}

function mapIsoToResource(iso: IsoResourceRecord): ResourceItem {
  return {
    id: `iso-${iso.id}`,
    category: 'standard',
    badge: { vi: 'Chứng chỉ chất lượng', en: 'Certificates', ja: '品質認証書' },
    title: { vi: iso.name || '', en: iso.name || '', ja: iso.name || '' },
    description: { vi: iso.number || '', en: iso.number || '', ja: iso.number || '' },
    date: currentDateLabel(),
    image: directusAssetUrl(iso.cover),
    contentType: 'certificate',
    author: {
      name: { vi: 'ULink', en: 'ULink', ja: 'ULink' },
      role: { vi: '', en: '', ja: '' },
      avatar: ''
    },
    readTime: { vi: '', en: '', ja: '' },
    sections: [],
    aiSummary: { intro: { vi: '', en: '', ja: '' }, bullets: [] },
    audioDuration: '0',
    audioSecs: 0,
    isDirectDownloadOnly: true,
    fileId: directusFileId(iso.file)
  };
}

export async function loadResourceCatalog() {
  const [documentsRes, isoRes, blogRes, caseStudyRes, eventsContent] = await Promise.all([
    publicDirectus
      .request(
        readItems('documents', {
          filter: { status: { _eq: 'published' } },
          fields: ['id', 'title', 'doc_type', 'file', 'cover', { product: ['hero'] }]
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
          fields: ['id', 'name', 'number', 'issuer', 'file', 'cover']
        })
      )
      .catch((err) => {
        console.error('Error fetching Directus ISO certifications:', err);
        return [];
      }),
    publicDirectus
      .request(
        readItems('blog_posts', {
          filter: { status: { _eq: 'published' } },
          fields: [
            'id',
            'title',
            'slug',
            'cover',
            'published_at',
            'meta_description',
            { translations: ['languages_code', 'title', 'meta_description'] }
          ]
        })
      )
      .catch((err) => {
        console.error('Error fetching Directus articles:', err);
        return [];
      }),
    publicDirectus
      .request(
        readItems('case_studies', {
          filter: { status: { _eq: 'published' } },
          fields: ['id', 'title', 'slug', 'summary', 'cover']
        })
      )
      .catch((err) => {
        console.error('Error fetching Directus case studies:', err);
        return [];
      }),
    loadEventsContent()
  ]);

  const directusDocs = (documentsRes as unknown as DocumentResourceRecord[]).map(
    mapDocumentToResource
  );
  const directusIsos = (isoRes as unknown as IsoResourceRecord[]).map(mapIsoToResource);

  const directusArticles: ResourceItem[] = (blogRes as unknown as ArticleResourceRecord[])
    .filter((article) => articleCategory(article.slug || '') !== 'event')
    .map(
    (article) => {
    const category = articleCategory(article.slug || '');
      return {
        id: article.slug?.startsWith(`${category}-`)
          ? article.slug
          : `${category}-${article.slug || article.id}`,
        category,
        badge: articleBadge(category),
        title: localizedArticleField(article, 'title'),
        description: localizedArticleField(article, 'meta_description'),
        date: article.published_at
          ? new Date(article.published_at).toLocaleDateString('en-GB')
          : currentDateLabel(),
        image: directusAssetUrl(article.cover),
        contentType: 'article',
        author: {
          name: { vi: 'ULink', en: 'ULink', ja: 'ULink' },
          role: { vi: '', en: '', ja: '' },
          avatar: ''
        },
        readTime:
          category === 'event'
            ? { vi: 'Đăng ký tham gia', en: 'Register', ja: '参加登録' }
            : { vi: '6 phút đọc', en: '6 min read', ja: '6分で読める' },
        sections: [],
        aiSummary: { intro: { vi: '', en: '', ja: '' }, bullets: [] },
        audioDuration: '0',
        audioSecs: 0
      };
    }
    );

  const cmsEvents: ResourceItem[] =
    eventsContent?.eventList.items.map((event) => ({
      id: `event-${event.slug}`,
      category: 'event',
      badge: { vi: 'Sự kiện', en: 'Event', ja: 'イベント' },
      title: { vi: event.title, en: event.title, ja: event.title },
      description: { vi: event.location, en: event.location, ja: event.location },
      date: event.date,
      image: eventAsset(event.image),
      contentType: 'article',
      author: {
        name: { vi: 'ULink Industries', en: 'ULink Industries', ja: 'ULink Industries' },
        role: { vi: 'Ban tổ chức', en: 'Organizer', ja: '主催者' },
        avatar: ''
      },
      readTime: { vi: 'Đăng ký tham gia', en: 'Register', ja: '参加登録' },
      sections: [],
      aiSummary: { intro: { vi: '', en: '', ja: '' }, bullets: [] },
      audioDuration: '0',
      audioSecs: 0
    })) ?? [];

  const directusCases: ResourceItem[] = (caseStudyRes as unknown as CaseStudyResourceRecord[]).map(
    (study) => ({
      id: `case-${study.slug || study.id}`,
      category: 'case-study',
      badge: { vi: 'Nghiên cứu điển hình', en: 'Case study', ja: 'ケーススタディ' },
      title: { vi: study.title || '', en: study.title || '', ja: study.title || '' },
      description: { vi: study.summary || '', en: study.summary || '', ja: study.summary || '' },
      date: currentDateLabel(),
      image: directusAssetUrl(study.cover),
      contentType: 'article',
      author: {
        name: { vi: 'ULink', en: 'ULink', ja: 'ULink' },
        role: { vi: '', en: '', ja: '' },
        avatar: ''
      },
      readTime: { vi: '', en: '', ja: '' },
      sections: [],
      aiSummary: { intro: { vi: '', en: '', ja: '' }, bullets: [] },
      audioDuration: '0',
      audioSecs: 0
    })
  );

  return [...directusDocs, ...directusIsos, ...directusArticles, ...directusCases, ...cmsEvents];
}

export async function loadResourceBySlug(slug: string) {
  const catalog = await loadResourceCatalog();
  return catalog.find((item) => item.id.toLowerCase() === slug.toLowerCase());
}
