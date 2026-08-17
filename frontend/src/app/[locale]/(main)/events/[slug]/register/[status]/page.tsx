import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { AlertCircle, CheckCircle, Clock } from '@/components/icons';
import { eventAsset, loadEventsContent } from '@/lib/events-content';

type Status = 'success' | 'pending' | 'failed';
type Props = {
  params: { locale: string; slug: string; status: string };
  searchParams: { code?: string };
};

export const metadata: Metadata = { title: 'Trạng thái đăng ký sự kiện | ULink Industries' };

function StatusIcon({ status }: { status: Status }) {
  if (status === 'success') {
    return <CheckCircle className="h-7 w-7 text-emerald-600" aria-hidden="true" />;
  }
  if (status === 'pending') {
    return <Clock className="h-7 w-7 text-amber-600" aria-hidden="true" />;
  }
  return <AlertCircle className="h-7 w-7 text-red-600" aria-hidden="true" />;
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-medium leading-5">{value}</dd>
    </div>
  );
}

export default async function EventRegistrationStatusPage({ params, searchParams }: Props) {
  setRequestLocale(params.locale);
  const status = params.status as Status;
  if (!['success', 'pending', 'failed'].includes(status)) notFound();

  const content = await loadEventsContent();
  if (!content || content.detail.slug !== params.slug) notFound();
  const copy = content.statuses[status];
  const registration = content.registration;
  const code = searchParams.code || 'REG-2026-00847';

  return (
    <div className="overflow-x-hidden bg-[#F5F8FC] px-5 py-12 sm:px-8 lg:py-20">
      <section className="mx-auto max-w-[760px] bg-white p-6 shadow-[0_16px_46px_rgba(16,42,114,0.1)] sm:p-10">
        <header className="text-center">
          <span
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
              status === 'success'
                ? 'bg-emerald-50'
                : status === 'pending'
                  ? 'bg-amber-50'
                  : 'bg-red-50'
            }`}
          >
            <StatusIcon status={status} />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">{copy.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>
        </header>

        {status === 'pending' ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_13rem]">
            <div>
              <dl className="border border-border bg-[#F8FAFD] p-5">
                <h2 className="mb-3 text-sm font-semibold">{copy.panelTitle}</h2>
                <Pair label={registration.bank.bankLabel} value={registration.bank.bank} />
                <Pair label={registration.bank.accountLabel} value={registration.bank.account} />
                <Pair label={registration.bank.ownerLabel} value={registration.bank.owner} />
                <Pair label={registration.bank.transferLabel} value={registration.bank.transfer} />
              </dl>
              <p className="mt-4 border border-border bg-[#F8FAFD] p-4 text-xs leading-5 text-muted-foreground">
                {copy.notice}
              </p>
            </div>
            <figure className="flex flex-col items-center border border-border p-5 text-center">
              <figcaption className="text-xs text-muted-foreground">{copy.qrTitle}</figcaption>
              <Image
                src={eventAsset(registration.qr)}
                alt={copy.qrTitle}
                width={144}
                height={144}
                className="mt-4 h-36 w-36 object-contain"
              />
              <p className="mt-4 text-xs font-semibold text-brand">
                {copy.referenceLabel}: {code}
              </p>
            </figure>
          </div>
        ) : null}

        {status === 'success' ? (
          <div className="mt-8 border border-border bg-[#F8FAFD] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
              <h2 className="text-sm font-semibold">{copy.panelTitle}</h2>
              <span className="bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {copy.paymentBadge}
              </span>
            </div>
            <dl className="mt-2">
              <Pair label={registration.ticket.eventLabel} value={registration.ticket.event} />
              <Pair label={copy.timeLabel} value={registration.ticket.date} />
              <Pair label={registration.ticket.locationLabel} value={registration.ticket.location} />
              <Pair label={registration.ticket.typeLabel} value={registration.ticket.type} />
              <Pair label={copy.referenceLabel} value={code} />
            </dl>
          </div>
        ) : null}

        {status === 'failed' ? (
          <dl className="mt-8 border border-red-100 bg-red-50/50 p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold text-red-900">{copy.panelTitle}</h2>
            <Pair label={copy.errorCodeLabel} value={copy.errorCode} />
            <Pair label={copy.timeLabel} value={copy.time} />
            <Pair label={copy.reasonLabel} value={copy.reason} />
          </dl>
        ) : null}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {status === 'success' ? (
            <Link
              href="/"
              className="ulink-pressable inline-flex min-h-11 items-center justify-center border border-brand px-5 text-sm font-semibold text-brand"
            >
              {copy.homeLabel}
            </Link>
          ) : status === 'pending' ? (
            <Link
              href="/contact"
              className="ulink-pressable inline-flex min-h-11 items-center justify-center border border-brand px-5 text-sm font-semibold text-brand"
            >
              {copy.supportLabel}
            </Link>
          ) : (
            <>
              <Link
                href={`/events/${params.slug}/register`}
                className="ulink-pressable inline-flex min-h-11 items-center justify-center border border-brand px-5 text-sm font-semibold text-brand"
              >
                {copy.retryLabel}
              </Link>
              <Link href="/contact" className="text-sm font-semibold text-brand underline-offset-4 hover:underline">
                {copy.supportLabel}
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
