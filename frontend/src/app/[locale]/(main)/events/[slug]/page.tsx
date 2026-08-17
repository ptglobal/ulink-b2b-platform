import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Calendar, Clock3, MapPin, Share2 } from '@/components/icons';
import { eventAsset, loadEventsContent, type EventPerson } from '@/lib/events-content';

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  const content = await loadEventsContent();
  if (!content || content.detail.slug !== slug) return { title: 'Sự kiện không tồn tại' };
  return { title: content.detail.title, description: content.detail.overview };
}

function PeopleGrid({ people }: { people: EventPerson[] }) {
  return (
    <div className="mt-6 grid gap-px bg-border sm:grid-cols-3">
      {people.map((person) => (
        <article key={person.name} className="bg-white p-5">
          <Image
            src={eventAsset(person.photo)}
            alt={person.name}
            width={72}
            height={72}
            className="h-16 w-16 rounded-full object-cover"
          />
          <h3 className="mt-4 text-base font-semibold text-foreground">{person.name}</h3>
          <p className="mt-1 text-xs font-medium leading-5 text-brand">{person.role}</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{person.bio}</p>
        </article>
      ))}
    </div>
  );
}

export default async function EventDetailPage({ params }: Props) {
  setRequestLocale(params.locale);
  const content = await loadEventsContent();
  if (!content || content.detail.slug !== params.slug) notFound();
  const event = content.detail;

  return (
    <div className="overflow-x-hidden bg-white">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-20 lg:py-20">
        <nav aria-label="Breadcrumb" className="mb-7 max-w-full break-words text-xs leading-5 text-muted-foreground">
          <Link href="/">{event.breadcrumb[0]}</Link>
          <span className="mx-2">/</span>
          <Link href="/events">{event.breadcrumb[1]}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{event.breadcrumb[2]}</span>
        </nav>

        <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,10fr)_minmax(20rem,5fr)]">
          <main className="min-w-0">
            <div className="relative aspect-[1.55/1] overflow-hidden bg-muted">
              <Image
                src={eventAsset(event.image)}
                alt={event.title}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 65vw"
                className="object-cover"
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-px border-y border-border bg-border sm:grid-cols-4">
              {event.sponsors.map((sponsor) => (
                <div
                  key={sponsor}
                  className="flex min-h-14 min-w-0 items-center justify-center break-words bg-white px-2 text-center text-[10px] font-semibold tracking-[-0.01em] text-muted-foreground sm:px-3 sm:text-xs"
                >
                  {sponsor}
                </div>
              ))}
            </div>

            <section className="py-9">
              <h1 className="sr-only">{event.title}</h1>
              <h2 className="text-2xl font-semibold tracking-[-0.025em]">{event.overviewLabel}</h2>
              <p className="mt-5 max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                {event.overview}
              </p>
            </section>

            <section className="border-t border-border py-8">
              <h2 className="text-2xl font-semibold tracking-[-0.025em]">{event.timeLabel}</h2>
              <div className="mt-5 space-y-2 text-sm leading-6 text-muted-foreground sm:text-base">
                <p>{event.dateLine}</p>
                <p>{event.timeLine}</p>
              </div>
            </section>

            <section className="border-t border-border py-8">
              <h2 className="text-2xl font-semibold tracking-[-0.025em]">{event.locationLabel}</h2>
              <p className="mt-5 text-base font-semibold">{event.locationName}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{event.address}</p>
            </section>

            <section className="border-t border-border py-8">
              <h2 className="text-2xl font-semibold tracking-[-0.025em]">{event.speakersLabel}</h2>
              <PeopleGrid people={event.speakers} />
            </section>

            <section className="border-t border-border py-8">
              <h2 className="text-2xl font-semibold tracking-[-0.025em]">{event.hostsLabel}</h2>
              <PeopleGrid people={event.hosts} />
            </section>

            <section className="border-t border-border py-8">
              <h2 className="text-2xl font-semibold tracking-[-0.025em]">{event.organizerLabel}</h2>
              <div className="mt-6 grid gap-5 border-l-4 border-brand bg-[#F5F8FC] p-6 sm:grid-cols-[auto_1fr] sm:items-start">
                <Image
                  src="/images/logo/ulink-mark.svg"
                  alt="ULink Industries"
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
                <div>
                  <h3 className="text-base font-semibold">{event.organizer.name}</h3>
                  <p className="mt-1 text-xs font-medium text-brand">{event.organizer.role}</p>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                    {event.organizer.description}
                  </p>
                </div>
              </div>
            </section>
          </main>

          <aside className="min-w-0 bg-[#0F1224] text-white lg:sticky lg:top-24">
            <div className="border-b border-white/10 p-6">
              <div className="flex items-start justify-between gap-5">
                <p className="max-w-[15rem] text-lg font-semibold leading-6">{event.title}</p>
                <div className="min-w-12 border-l border-white/15 pl-4 text-right">
                  <span className="block text-2xl font-semibold">{event.dateDay}</span>
                  <span className="text-[10px] text-white/55">{event.dateYear}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-white/55">{event.organizerShort}</p>
            </div>

            <dl className="grid grid-cols-2 border-b border-white/10">
              <div className="border-r border-white/10 p-5">
                <dt className="text-[10px] uppercase tracking-[0.12em] text-white/45">
                  {event.startTimeLabel}
                </dt>
                <dd className="mt-2 text-sm font-semibold">{event.startTime}</dd>
              </div>
              <div className="p-5">
                <dt className="text-[10px] uppercase tracking-[0.12em] text-white/45">
                  {event.endTimeLabel}
                </dt>
                <dd className="mt-2 text-sm font-semibold">{event.endTime}</dd>
              </div>
            </dl>

            <div className="border-b border-white/10 p-5">
              <span className="text-[10px] uppercase tracking-[0.12em] text-white/45">
                {event.statusLabel}
              </span>
              <p className="mt-2 text-sm font-semibold text-emerald-400">{event.status}</p>
            </div>

            <div className="p-5">
              <p className="text-lg font-semibold">{event.ticketPrice}</p>
              <Link
                href={event.registerHref}
                className="ulink-pressable mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 bg-[#50B678] px-5 text-sm font-semibold text-[#07120B] transition-colors hover:bg-[#65C78A]"
              >
                {event.registerLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="flex items-center gap-4 border-t border-white/10 px-5 py-4 text-white/60">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
