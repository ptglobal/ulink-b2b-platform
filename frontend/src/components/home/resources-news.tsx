import { readItems } from '@directus/sdk';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  CheckSquare,
  Download,
  FileCheck,
  FileText,
  Settings,
  Shield,
  TrendingUp
} from '@/components/icons';
import { BrandedMedia } from '@/components/media/branded-media';
import { Link } from '@/i18n/navigation';
import {
  publicDirectus,
  type BlogPost,
  type BlogPostTranslation,
  type DirectusFile,
  type ProductDocument
} from '@/lib/directus';
import type { RegionalHubResourcesCopy } from '@/lib/regional-hubs-content';

const DOCUMENT_ICONS = [Download, FileText, Settings, FileCheck] as const;

const SUPPORT = [
  { icon: CheckSquare, titleKey: 'supp1Title', descKey: 'supp1Desc' },
  { icon: Shield, titleKey: 'supp2Title', descKey: 'supp2Desc' },
  { icon: TrendingUp, titleKey: 'supp3Title', descKey: 'supp3Desc' },
  { icon: Settings, titleKey: 'supp4Title', descKey: 'supp4Desc' }
] as const;

export async function ResourcesNews({ copy }: { copy?: RegionalHubResourcesCopy } = {}) {
  const [t, locale] = await Promise.all([getTranslations('home.resourcesSection'), getLocale()]);
  const [cmsPosts, cmsDocuments] = await Promise.all([
    publicDirectus.request(
      readItems('blog_posts', {
        filter: {
          status: { _eq: 'published' }
        },
        fields: [
          'id',
          'slug',
          'title',
          'cover',
          'published_at',
          'status',
          { translations: ['languages_code', 'title'] }
        ],
        sort: ['-published_at'],
        limit: 12
      })
    ).catch(() => [] as BlogPost[]),
    publicDirectus.request(
      readItems('documents', {
        filter: { status: { _eq: 'published' } },
        fields: ['id', 'title', 'doc_type', 'status', { file: ['id', 'filename_download', 'filesize'] }],
        sort: ['id'],
        limit: 4
      })
    ).catch(() => [] as ProductDocument[])
  ]);

  const labels = {
    eyebrow: copy?.eyebrow || 'ULink intelligence',
    sectionTitle: copy?.sectionTitle || t('sectionTitle'),
    sectionSubTitle: copy?.sectionSubTitle || t('sectionSubTitle'),
    viewAllNews: copy?.viewAllNews || t('viewAllNews'),
    readMore: copy?.readMore || t('readMore'),
    docsEyebrow: copy?.docsEyebrow || 'Resource desk',
    docsTitle: copy?.docsTitle || t('docsTitle'),
    supportTitle: copy?.supportTitle || t('supportTitle')
  };

  const documents = (cmsDocuments as ProductDocument[]).map((document, index) => {
    const file = typeof document.file === 'object' && document.file ? (document.file as DirectusFile) : null;
    const size = file?.filesize ? `${Math.max(1, Math.round(Number(file.filesize) / 1024))} KB` : 'PDF';
    return {
      id: document.id,
      title: document.title,
      category: copy?.documentTypeLabels?.[document.doc_type] || document.doc_type.toUpperCase(),
      meta: `PDF · ${size}`,
      href: file?.id ? `/api/files/${file.id}` : '/resources',
      icon: DOCUMENT_ICONS[index % DOCUMENT_ICONS.length]
    };
  });

  const supportItems = copy?.supportItems?.length
    ? copy.supportItems
    : SUPPORT.map(({ titleKey, descKey }) => ({ title: t(titleKey), description: t(descKey) }));

  const newsItems = cmsPosts.filter((post) => !post.slug.startsWith('event-')).slice(0, 3).map((post) => {
    const translations = Array.isArray(post.translations)
      ? post.translations.filter((item): item is BlogPostTranslation => typeof item === 'object')
      : [];
    const translation = translations.find((item) => item.languages_code === locale);
    const title = translation?.title || post.title || post.slug;
    const date = post.published_at
      ? new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
          new Date(post.published_at)
        )
      : '';

    return {
      href: `/resources/news-${post.slug}`,
      title,
      date,
      image: post.cover ? `/api/files/${post.cover}` : null,
      alt: title
    };
  });

  return (
    <section className="w-full border-t border-border bg-muted/35">
      <div className="ulink-container py-14 sm:py-16 lg:py-20">
        <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-brand">
              {labels.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              {labels.sectionTitle}
            </h2>
            <p className="mt-3 max-w-[66ch] text-sm leading-6 text-muted-foreground sm:text-base">
              {labels.sectionSubTitle}
            </p>
          </div>
          <Link
            href="/resources"
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand hover:text-brand-strong"
          >
            {labels.viewAllNews}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-9 grid gap-7 md:grid-cols-3">
          {newsItems.map((item) => (
            <article key={item.href} className="group min-w-0">
              <Link href={item.href} className="block focus-visible:outline-offset-4">
                <BrandedMedia
                  src={item.image}
                  alt={item.alt}
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="aspect-[16/10] border border-border bg-card"
                  imageClassName="transition-transform duration-500 group-hover:scale-[1.025]"
                  brandPresentation="rail"
                />
                <p className="mt-4 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-brand">
                  {item.date}
                </p>
                <h3 className="mt-2 text-base font-semibold leading-6 text-foreground transition-colors group-hover:text-brand">
                  {item.title}
                </h3>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                  {labels.readMore}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-14 grid border-y border-border lg:grid-cols-[0.72fr_1.28fr]">
          <div className="py-8 lg:border-r lg:border-border lg:pr-10">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-brand">{labels.docsEyebrow}</p>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">{labels.docsTitle}</h3>
            <p className="mt-3 max-w-[42ch] text-sm leading-6 text-muted-foreground">{labels.sectionSubTitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:pl-10">
            {documents.map(({ id, icon: Icon, category, title, meta, href }, index) => (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={`group flex min-h-32 items-start gap-4 border-border py-6 sm:px-6 ${
                  index > 0 ? 'border-t sm:border-t-0' : ''
                } ${index % 2 === 1 ? 'sm:border-l' : ''} ${index > 1 ? 'sm:border-t' : ''}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    {category}
                  </span>
                  <span className="mt-1.5 block text-sm font-semibold leading-5 text-foreground group-hover:text-brand">
                    {title}
                  </span>
                  <span className="mt-2 block font-mono text-[10px] text-muted-foreground">{meta}</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-foreground">{labels.supportTitle}</h3>
          <div className="mt-6 grid gap-x-8 gap-y-8 border-t border-border pt-7 sm:grid-cols-2 lg:grid-cols-4">
            {supportItems.map((item, index) => {
              const Icon = SUPPORT[index % SUPPORT.length].icon;
              return (
              <div key={`${item.title}-${index}`} className="grid grid-cols-[2.5rem_1fr] gap-4">
                <span className="flex h-10 w-10 items-center justify-center bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold leading-5 text-foreground">{item.title}</h4>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
