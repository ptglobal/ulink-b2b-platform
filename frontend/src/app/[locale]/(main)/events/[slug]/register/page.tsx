import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock3, MapPin, Sparkles, Users2 } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { UPCOMING_EVENTS } from '@/components/resources/mock-data';

type Props = {
  params: {
    locale: string;
    slug: string;
  };
};

function getEventBySlug(slug: string) {
  const normalized = slug.toLowerCase();
  return UPCOMING_EVENTS.find((event) => event.id.toLowerCase() === normalized);
}

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const event = getEventBySlug(slug);
  const isVi = locale === 'vi';
  const isJa = locale === 'ja';

  if (!event) {
    return {
      title: isVi ? 'Sự kiện không tồn tại' : isJa ? 'イベントが見つかりません' : 'Event not found'
    };
  }

  return {
    title: `${event.title[locale as 'vi' | 'en' | 'ja']} | ${isVi ? 'Đăng ký sự kiện' : isJa ? 'イベント登録' : 'Event Registration'}`
  };
}

export default async function EventRegisterPage({ params }: Props) {
  const { locale, slug } = params;
  setRequestLocale(locale);

  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const L = {
    home: { vi: 'Trang chủ', en: 'Home', ja: 'ホーム' },
    resources: { vi: 'Tài nguyên', en: 'Resources', ja: 'リソース' },
    event: { vi: 'Sự kiện', en: 'Events', ja: 'イベント' },
    register: { vi: 'Đăng ký', en: 'Register', ja: '登録' },
    comingSoon: { vi: 'Sắp mở đăng ký', en: 'Coming soon', ja: '近日公開' },
    comingSoonDesc: {
      vi: 'Trang đăng ký đang được hoàn thiện. Bạn vẫn có thể xem đầy đủ thông tin sự kiện bên dưới.',
      en: 'The registration flow is being prepared. You can still view the full event details below.',
      ja: '登録フローは準備中です。下のイベント詳細は引き続きご覧いただけます。'
    },
    eventInfo: { vi: 'Thông tin sự kiện', en: 'Event details', ja: 'イベント情報' },
    when: { vi: 'Thời gian', en: 'When', ja: '日時' },
    where: { vi: 'Địa điểm', en: 'Where', ja: '会場' },
    status: { vi: 'Trạng thái', en: 'Status', ja: '状態' }
  };

  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <Image
            src={event.image}
            alt={event.title[locale as 'vi' | 'en' | 'ja']}
            fill
            priority
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/75 to-slate-950" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 py-8 sm:py-10">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              {L.home[locale as 'vi' | 'en' | 'ja']}
            </Link>
            <span>/</span>
            <Link href="/resources" className="hover:text-white transition-colors">
              {L.resources[locale as 'vi' | 'en' | 'ja']}
            </Link>
            <span>/</span>
            <span>{L.event[locale as 'vi' | 'en' | 'ja']}</span>
            <span>/</span>
            <span className="text-white font-semibold">{L.register[locale as 'vi' | 'en' | 'ja']}</span>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-8 items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                <Sparkles className="h-3.5 w-3.5" />
                {L.comingSoon[locale as 'vi' | 'en' | 'ja']}
              </span>
              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance">
                {event.title[locale as 'vi' | 'en' | 'ja']}
              </h1>
              <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                {L.comingSoonDesc[locale as 'vi' | 'en' | 'ja']}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{L.status[locale as 'vi' | 'en' | 'ja']}</p>
                  <p className="mt-2 text-lg font-bold text-white">{L.comingSoon[locale as 'vi' | 'en' | 'ja']}</p>
                </div>
                <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {event.id}
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
                  <span className="leading-relaxed">{event.location[locale as 'vi' | 'en' | 'ja']}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700">
                {L.event[locale as 'vi' | 'en' | 'ja']}
              </span>
              <span className="text-sm font-semibold text-slate-500">{event.date}</span>
            </div>

            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              {event.title[locale as 'vi' | 'en' | 'ja']}
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{L.when[locale as 'vi' | 'en' | 'ja']}</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{event.date}</p>
                <p className="mt-1 text-sm text-slate-600">{event.time}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{L.where[locale as 'vi' | 'en' | 'ja']}</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{event.location[locale as 'vi' | 'en' | 'ja']}</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <Image
                src={event.image}
                alt={event.title[locale as 'vi' | 'en' | 'ja']}
                width={1200}
                height={675}
                className="h-auto w-full object-cover"
              />
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {L.register[locale as 'vi' | 'en' | 'ja']}
                  </p>
                  <h3 className="mt-2 text-xl font-extrabold text-slate-950">
                    {L.comingSoon[locale as 'vi' | 'en' | 'ja']}
                  </h3>
                </div>
                <Users2 className="h-6 w-6 text-slate-300" />
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  <Sparkles className="h-7 w-7" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-800">
                  {L.comingSoon[locale as 'vi' | 'en' | 'ja']}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {L.comingSoonDesc[locale as 'vi' | 'en' | 'ja']}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="h-12 rounded-xl bg-slate-100" />
                <div className="h-12 rounded-xl bg-slate-100" />
                <div className="h-12 rounded-xl bg-slate-100" />
                <div className="h-28 rounded-xl bg-slate-100" />
              </div>

              <button
                type="button"
                disabled
                className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-500"
              >
                {L.comingSoon[locale as 'vi' | 'en' | 'ja']}
              </button>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-sky-50 p-6 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">
                {L.eventInfo[locale as 'vi' | 'en' | 'ja']}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Khi phần đăng ký mở, trang này sẽ nhận dữ liệu đăng ký trực tiếp. Hiện tại chỉ hiển thị thông tin để khách có thể xem nội dung sự kiện trước.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-8">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {L.resources[locale as 'vi' | 'en' | 'ja']}
          </Link>
        </div>
      </section>
    </main>
  );
}
