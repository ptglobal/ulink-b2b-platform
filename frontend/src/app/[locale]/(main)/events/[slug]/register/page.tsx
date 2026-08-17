import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { EventRegistrationForm } from '@/components/events/event-registration-form';
import { eventAsset, loadEventsContent } from '@/lib/events-content';

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  const content = await loadEventsContent();
  if (!content || content.detail.slug !== slug) return { title: 'Sự kiện không tồn tại' };
  return { title: `${content.registration.title} | ${content.registration.subtitle}` };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-0 sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-medium leading-5 text-foreground">{value}</dd>
    </div>
  );
}

export default async function EventRegisterPage({ params }: Props) {
  setRequestLocale(params.locale);
  const content = await loadEventsContent();
  if (!content || content.detail.slug !== params.slug) notFound();
  const registration = content.registration;

  return (
    <div className="overflow-x-hidden bg-[#F5F8FC] py-10 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <nav aria-label="Breadcrumb" className="flex max-w-full flex-wrap items-center gap-2 text-xs leading-5 text-muted-foreground">
          {registration.breadcrumb.map((item, index) => (
            <span key={item} className="flex items-center gap-2">
              {index < registration.breadcrumb.length - 1 ? (
                <Link href={index === 0 ? '/' : index === 1 ? '/events' : `/events/${params.slug}`}>
                  {item}
                </Link>
              ) : (
                <span className="text-foreground">{item}</span>
              )}
              {index < registration.breadcrumb.length - 1 ? <span>/</span> : null}
            </span>
          ))}
        </nav>

        <header className="mt-7 border-l-4 border-brand pl-5">
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-tight tracking-[-0.035em] text-foreground">
            {registration.title}
          </h1>
          <p className="mt-3 text-sm font-medium text-brand sm:text-base">{registration.subtitle}</p>
        </header>

        <section className="mt-9 min-w-0 overflow-hidden bg-white p-6 shadow-[0_10px_30px_rgba(16,42,114,0.06)] sm:p-8 lg:p-10">
          <h2 className="text-2xl font-semibold tracking-[-0.025em]">{registration.paymentTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {registration.paymentDescription}
          </p>

          <div className="mt-7 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="grid min-w-0 gap-6 md:grid-cols-2">
              <dl className="border border-border bg-[#F8FAFD] p-5">
                <InfoRow label={registration.ticket.eventLabel} value={registration.ticket.event} />
                <InfoRow label={registration.ticket.dateLabel} value={registration.ticket.date} />
                <InfoRow
                  label={registration.ticket.locationLabel}
                  value={registration.ticket.location}
                />
                <InfoRow label={registration.ticket.typeLabel} value={registration.ticket.type} />
              </dl>

              <div>
                <h3 className="text-sm font-semibold">{registration.bankTitle}</h3>
                <dl className="mt-3 border border-border p-5">
                  <InfoRow label={registration.bank.bankLabel} value={registration.bank.bank} />
                  <InfoRow
                    label={registration.bank.accountLabel}
                    value={registration.bank.account}
                  />
                  <InfoRow label={registration.bank.ownerLabel} value={registration.bank.owner} />
                  <InfoRow label={registration.bank.branchLabel} value={registration.bank.branch} />
                  <InfoRow
                    label={registration.bank.transferLabel}
                    value={registration.bank.transfer}
                  />
                </dl>
              </div>
            </div>

            <figure className="flex flex-col items-center justify-center border border-border bg-[#F8FAFD] p-6 text-center">
              <figcaption className="text-xs font-medium text-muted-foreground">
                {registration.qrLabel}
              </figcaption>
              <Image
                src={eventAsset(registration.qr)}
                alt={registration.qrLabel}
                width={176}
                height={176}
                className="mt-5 h-44 w-44 object-contain"
              />
              <p className="mt-4 text-xs font-semibold text-brand">{registration.qrInstruction}</p>
            </figure>
          </div>
        </section>

        <section className="mt-8 min-w-0 overflow-hidden bg-white p-6 shadow-[0_10px_30px_rgba(16,42,114,0.06)] sm:p-8 lg:p-10">
          <h2 className="text-2xl font-semibold tracking-[-0.025em]">{registration.formTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{registration.formDescription}</p>
          <div className="mt-8">
            <EventRegistrationForm
              eventSlug={content.detail.slug}
              eventTitle={content.detail.title}
              labels={registration.fields}
              sourceOptions={registration.sourceOptions}
              consentLabel={registration.consent}
              submitLabel={registration.submitLabel}
              messages={registration.formMessages}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
