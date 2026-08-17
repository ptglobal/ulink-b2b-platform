import { readItems } from '@directus/sdk';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight, Package } from '@/components/icons';
import { BrandedMedia } from '@/components/media/branded-media';
import { Link } from '@/i18n/navigation';
import { publicDirectus, type BlogPost, type BlogPostTranslation } from '@/lib/directus';
import { SectionHeader } from './section-header';

export async function CaseStudies() {
  const [t, locale, posts] = await Promise.all([
    getTranslations('home'),
    getLocale(),
    publicDirectus
      .request(
        readItems('blog_posts', {
          filter: { status: { _eq: 'published' } },
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
      )
      .catch(() => [] as BlogPost[])
  ]);

  const items = posts
    .filter((post) => !post.slug.startsWith('event-'))
    .slice(0, 4)
    .map((post) => {
      const translations = Array.isArray(post.translations)
        ? post.translations.filter((item): item is BlogPostTranslation => typeof item === 'object')
        : [];
      const title =
        translations.find((item) => item.languages_code === locale)?.title || post.title || post.slug;
      return {
        href: `/resources/news-${post.slug}`,
        title,
        image: post.cover ? `/api/files/${post.cover}` : null,
        date: post.published_at
          ? new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(post.published_at))
          : ''
      };
    });

  if (!items.length) return null;

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-8 lg:py-16 xl:px-20">
      <SectionHeader
        title={t('caseStudy.sectionTitle')}
        subtitle={t('caseStudy.sectionSubTitle')}
        viewAllHref="/resources"
        viewAllLabel={t('caseStudy.viewAll')}
      />

      <div className="mt-8 grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="ulink-media-zoom group flex min-h-[430px] flex-col border-b border-r border-border bg-white transition-colors hover:bg-muted"
          >
            <BrandedMedia
              src={item.image}
              alt={item.title}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
              className="aspect-[4/3] bg-slate-100"
              compactBrand
            />
            <div className="flex flex-1 flex-col p-5">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">
                {item.date || `0${index + 1}`}
              </p>
              <h3 className="mt-3 text-[15px] font-bold leading-6 text-slate-800 group-hover:text-brand">
                {item.title}
              </h3>
              <div className="mt-auto flex items-center justify-between border-t border-border pt-5">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Package className="h-4 w-4 text-brand" aria-hidden="true" />
                  ULink Industries
                </span>
                <ArrowRight className="h-5 w-5 text-brand transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
