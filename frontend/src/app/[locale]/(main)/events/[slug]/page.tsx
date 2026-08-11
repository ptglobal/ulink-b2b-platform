import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock3,
  MapPin,
  Sparkles,
  BadgeCheck,
  Users2,
  Building2,
  ChevronRight
} from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getEventDetailBySlug, getEventRegisterLink } from '@/components/events/event-detail-data';

type Props = {
  params: {
    locale: string;
    slug: string;
  };
};

export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  const event = getEventDetailBySlug(slug);

  if (!event) {
    return {
      title: 'Sự kiện không tồn tại'
    };
  }

  return {
    title: `${event.title} | Chi tiết sự kiện`,
    description: event.summary
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = params;
  setRequestLocale(params.locale);

  const event = getEventDetailBySlug(slug);

  if (!event) {
    notFound();
  }

  const registerLink = getEventRegisterLink(event.slug);

  return (
    <main className="min-h-screen bg-[#F6F8FC]">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <Image
            src={event.image}
            alt={event.title}
            fill
            priority
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/70 to-slate-950" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 py-8 sm:py-10">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/resources" className="hover:text-white transition-colors">
              Tài nguyên
            </Link>
            <span>/</span>
            <span>Sự kiện</span>
            <span>/</span>
            <span className="text-white font-semibold">Chi tiết</span>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                <Sparkles className="h-3.5 w-3.5" />
                Sự kiện sắp diễn ra
              </span>
              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance">
                {event.title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm sm:text-base text-slate-300 leading-relaxed">
                {event.summary}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trạng thái</p>
                  <p className="mt-2 text-lg font-bold text-white">{event.registrationStatus}</p>
                </div>
                <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {event.slug.toUpperCase()}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-sky-300" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock3 className="h-4 w-4 text-sky-300" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 text-sky-300" />
                  <span className="leading-relaxed">{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
          <div className="space-y-8">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700">
                  Chi tiết sự kiện
                </span>
                <span className="text-sm font-semibold text-slate-500">{event.date}</span>
              </div>

              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                {event.title}
              </h2>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                {event.overview}
              </p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                <Image
                  src={event.image}
                  alt={event.title}
                  width={1200}
                  height={675}
                  className="h-auto w-full object-cover"
                />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Thời gian</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{event.date}</p>
                  <p className="mt-1 text-sm text-slate-600">{event.time}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Địa điểm</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{event.location}</p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-sky-600" />
                <h3 className="text-xl font-extrabold text-slate-950">Quyền lợi người tham gia</h3>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {event.benefits.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-sky-600" />
                <h3 className="text-xl font-extrabold text-slate-950">Agenda chương trình</h3>
              </div>

              <div className="mt-6 space-y-4">
                {event.agenda.map((item, index) => (
                  <div key={`${item.time}-${index}`} className="flex gap-4 rounded-2xl border border-slate-200 p-4">
                    <div className="min-w-[92px] text-sm font-bold text-sky-700">{item.time}</div>
                    <div className="flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">{item.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-sky-600" />
                <h3 className="text-xl font-extrabold text-slate-950">Diễn giả</h3>
              </div>

              <div className="mt-5 space-y-4">
                {event.speakers.map((speaker) => (
                  <div key={speaker.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-950">{speaker.name}</p>
                        <p className="mt-1 text-sm font-semibold text-sky-700">{speaker.title}</p>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{speaker.company}</p>
                      </div>
                      <Building2 className="h-4 w-4 text-slate-300" />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{speaker.bio}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Ban tổ chức</p>
              <h3 className="mt-2 text-xl font-extrabold text-slate-950">{event.organizer.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{event.organizer.description}</p>
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Liên hệ</p>
                <p className="mt-1">{event.organizer.contact}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-sky-50 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                Đăng ký tham gia
              </p>
              <h3 className="mt-2 text-xl font-extrabold text-slate-950">Coming soon</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Phần đăng ký đang được chuẩn bị. Hiện tại bạn chỉ xem được thông tin sự kiện, agenda, diễn giả và quyền lợi tham gia.
              </p>
              <Link
                href={registerLink}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1769E2] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1257bd]"
              >
                Đến trang đăng ký
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-8">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Về danh sách tài nguyên
          </Link>
        </div>
      </section>
    </main>
  );
}
