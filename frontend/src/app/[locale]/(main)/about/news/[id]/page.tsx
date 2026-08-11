import Image from 'next/image';
import { ArrowLeft, ArrowRight, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Link, redirect } from '@/i18n/navigation';
import {
  ABOUT_NEWS_ARTICLES,
  getAboutNewsArticleById,
} from '@/components/about/about-news-data';

interface PageProps {
  params: {
    locale: string;
    id: string;
  };
}

export function generateStaticParams() {
  return ABOUT_NEWS_ARTICLES.map((article) => ({ id: article.id }));
}

export default async function AboutNewsDetailPage({ params }: PageProps) {
  const { locale, id } = params;
  setRequestLocale(locale);

  const article = getAboutNewsArticleById(id);

  if (!article) {
    redirect({ href: '/about/news', locale });
  }

  const currentArticle = article as NonNullable<typeof article>;

  const relatedArticles = currentArticle.relatedIds
    .map((relatedId) => getAboutNewsArticleById(relatedId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <article className="bg-slate-50/70 pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="transition-colors hover:text-brand">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/about" className="transition-colors hover:text-brand">
            Về chúng tôi
          </Link>
          <span>/</span>
          <Link href="/about/news" className="transition-colors hover:text-brand">
            Tin tức
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">{currentArticle.category}</span>
        </div>

        <Link
          href="/about/news"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách tin tức
        </Link>

        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mb-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {currentArticle.category}
              </div>
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {currentArticle.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                {currentArticle.summary}
              </p>

              <div className="mt-6 flex flex-wrap gap-5 border-t border-slate-100 pt-6 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4 text-brand" />
                  {currentArticle.author}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand" />
                  {currentArticle.date}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand" />
                  {currentArticle.readTime}
                </span>
              </div>
            </div>

            <div className="relative min-h-[260px] bg-slate-100 lg:min-h-full">
              <Image
                src={currentArticle.coverImage}
                alt={currentArticle.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </header>

        <main className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 rounded-2xl bg-blue-50/70 p-5 ring-1 ring-inset ring-blue-100">
              <h2 className="text-sm font-bold uppercase tracking-wide text-blue-800">
                Tóm tắt nhanh
              </h2>
              <ul className="mt-4 grid gap-3">
                {currentArticle.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              {currentArticle.sections.map((section) => (
                <section key={section.title}>
                  <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
                  <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-600">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Bài viết liên quan</h2>
              <div className="mt-5 space-y-4">
                {relatedArticles.map((item) => (
                  <Link
                    key={item.id}
                    href={`/about/news/${item.id}`}
                    className="group block rounded-2xl border border-slate-100 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="text-xs font-semibold text-blue-700">{item.category}</div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-brand">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{item.summary}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                      Đọc chi tiết <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                Cập nhật liên tục
              </p>
              <h2 className="mt-3 text-xl font-bold">Theo dõi thêm tin tức thị trường</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Chúng tôi sẽ tiếp tục cập nhật các bài viết phân tích, xu hướng và diễn biến mới
                nhất để hỗ trợ đội ngũ mua hàng, vận hành và chiến lược.
              </p>
              <Link
                href="/about/news"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
              >
                Xem toàn bộ tin tức
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </main>
      </div>
    </article>
  );
}
