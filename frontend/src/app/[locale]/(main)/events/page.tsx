import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Calendar, Clock3, MapPin } from '@/components/icons';
import { eventAsset, loadEventsContent } from '@/lib/events-content';

type Props = { params: { locale: string } };

export const metadata: Metadata = {
  title: 'Sự kiện B2B & ULink Tech Summit | ULink Industries',
  description:
    'Chương trình B2B Business Networking, hội thảo chuỗi cung ứng và sự kiện công nghệ của ULink Industries.'
};

export default async function EventsPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const content = await loadEventsContent();
  if (!content) notFound();

  return (
    <div className="overflow-x-hidden bg-white text-foreground">
      <section className="relative isolate min-h-[34rem] overflow-hidden lg:min-h-[38.75rem]">
        <Image
          src={eventAsset(content.hero.image)}
          alt="ULink B2B Business Networking"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto flex min-h-[34rem] max-w-[1440px] items-center px-5 py-16 sm:px-8 lg:min-h-[38.75rem] lg:px-20 lg:py-20">
          <div className="w-full min-w-0 max-w-[36.5rem] rounded-xl bg-black/70 p-7 text-white shadow-[0_24px_64px_rgba(0,0,0,0.28)] backdrop-blur-[2px] sm:p-8">
            <h1 className="break-words whitespace-pre-line text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.035em]">
              {content.hero.title}
            </h1>
            <p className="mt-5 max-w-[32rem] text-sm leading-6 text-white/88 sm:text-base sm:leading-7">
              {content.hero.description}
            </p>
            <Link
              href={content.hero.ctaHref}
              className="ulink-pressable mt-8 inline-flex min-h-12 items-center gap-3 bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              {content.hero.ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Danh sách sự kiện" className="mx-auto max-w-[1440px]">
        {content.eventList.items.map((event) => (
          <article
            key={event.slug}
            className="grid gap-8 border-b border-border px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20 lg:px-20 lg:py-20"
          >
            <div className="ulink-media-zoom relative aspect-[1.16/1] overflow-hidden bg-muted lg:aspect-[1.17/1]">
              <Image
                src={eventAsset(event.image)}
                alt={event.title}
                fill
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-center py-1 lg:py-6">
              <p className="text-xl font-semibold text-[#162A72]">{content.eventList.eyebrow}</p>
              <h2 className="mt-3 max-w-xl text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.22] tracking-[-0.025em] text-foreground">
                {event.title}
              </h2>

              <dl className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-5">
                <div>
                  <dt className="sr-only">Ngày</dt>
                  <Calendar className="h-8 w-8 text-brand" aria-hidden="true" />
                  <dd className="mt-4 text-sm leading-6 text-muted-foreground">{event.date}</dd>
                </div>
                <div>
                  <dt className="sr-only">Thời gian</dt>
                  <Clock3 className="h-8 w-8 text-brand" aria-hidden="true" />
                  <dd className="mt-4 text-sm leading-6 text-muted-foreground">{event.time}</dd>
                </div>
                <div>
                  <dt className="sr-only">Địa điểm</dt>
                  <MapPin className="h-8 w-8 text-brand" aria-hidden="true" />
                  <dd className="mt-4 text-sm leading-6 text-muted-foreground">{event.location}</dd>
                </div>
              </dl>

              <Link
                href={event.registrationHref}
                className="ulink-pressable mt-10 inline-flex min-h-12 w-fit items-center gap-3 px-6 text-sm font-semibold text-brand ring-1 ring-inset ring-brand transition-colors hover:bg-brand hover:text-white"
              >
                {content.eventList.registerLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <nav aria-label="Phân trang sự kiện" className="flex items-center justify-center gap-2 py-12">
        {Array.from({ length: content.eventList.pagination.total }).map((_, index) => (
          <span
            key={index}
            aria-current={index + 1 === content.eventList.pagination.current ? 'page' : undefined}
            className={`flex h-10 w-10 items-center justify-center text-sm ${
              index + 1 === content.eventList.pagination.current
                ? 'bg-[#111827] text-white'
                : 'border border-border text-muted-foreground'
            }`}
          >
            {index + 1}
          </span>
        ))}
      </nav>

      <section className="border-t border-border bg-[#F5F8FC] py-14 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand">{content.marketNews.eyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                {content.marketNews.title}
              </h2>
            </div>
            <Link
              href={content.marketNews.actionHref}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand"
            >
              {content.marketNews.actionLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-9 grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
            {content.marketNews.items.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex min-h-[22rem] flex-col border-b border-r border-border bg-white"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <Image
                    src={eventAsset(item.image)}
                    alt={item.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold text-brand">{item.category}</p>
                  <h3 className="mt-3 text-base font-semibold leading-6 group-hover:text-brand">
                    {item.title}
                  </h3>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-semibold text-brand">
                    Đọc thêm <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
