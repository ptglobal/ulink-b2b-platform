'use client';

import { useState, type FormEvent } from 'react';
import {
  Button,
  InlineNotification,
  Select,
  SelectItem,
  TextArea,
  TextInput,
  Tile
} from '@carbon/react';
import { useTranslations } from 'next-intl';
import { Mail, MapPin, Phone, Send } from '@/components/icons';
import { useRouter } from '@/i18n/navigation';
import { submitContactRequest } from '@/lib/contact-submit';
import type { SiteSettings } from '@/lib/directus';
import type { RegionalHubContactCopy } from '@/lib/regional-hubs-content';

interface AboutContactProps {
  settings: SiteSettings;
  copy?: RegionalHubContactCopy;
}

export function AboutContact({ settings, copy }: AboutContactProps) {
  const t = useTranslations('aboutContact');
  const text = (key: keyof RegionalHubContactCopy) => copy?.[key] || t(key);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = settings.contact_email || 'contact@ulinkindustries.com';
  const phone = settings.contact_phone || '0247 309 9899';
  const address = settings.address || text('addressFallback');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    setSubmitting(true);
    setError(null);

    const formData = new FormData(form);
    try {
      const result = await submitContactRequest({
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        phone: String(formData.get('phone') ?? ''),
        subject: String(formData.get('subject') ?? ''),
        message: String(formData.get('message') ?? '')
      });

      if (result.ok) {
        form.reset();
        router.push('/about/contact-success');
        return;
      }

      setError(result.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="about-contact-title" className="border-t border-border py-14 sm:py-16 lg:py-20">
      <header className="mb-8 grid gap-4 lg:grid-cols-16 lg:items-end">
        <div className="lg:col-span-10">
          <p className="font-mono text-xs font-medium text-brand">{text('label')}</p>
          <h2
            id="about-contact-title"
            className="mt-4 max-w-[24ch] text-3xl font-normal leading-tight tracking-[-0.025em] text-foreground sm:text-4xl"
          >
            {text('heading')}
          </h2>
        </div>
        <p className="max-w-[58ch] text-sm leading-6 text-muted-foreground lg:col-span-6 lg:justify-self-end">
          {text('description')}
        </p>
      </header>

      <div className="grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
        <Tile className="!min-h-0 !rounded-none !bg-card !p-6 sm:!p-8 lg:!p-10">
          <h3 className="mb-7 text-xl font-medium text-foreground">{text('formTitle')}</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <InlineNotification
                kind="error"
                lowContrast
                hideCloseButton
                title={text('submitErrorTitle')}
                subtitle={error}
              />
            ) : null}

            <div className="grid gap-6 sm:grid-cols-2">
              <TextInput
                id="about-contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                labelText={`${text('nameLabel')} *`}
                placeholder={text('namePlaceholder')}
              />
              <TextInput
                id="about-contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                labelText={`${text('phoneLabel')} *`}
                placeholder={text('phonePlaceholder')}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <TextInput
                id="about-contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                labelText={`${text('emailLabel')} *`}
                placeholder={text('emailPlaceholder')}
              />
              <Select
                id="about-contact-subject"
                name="subject"
                required
                defaultValue=""
                labelText={`${text('subjectLabel')} *`}
              >
                <SelectItem value="" text={text('subjectPlaceholder')} disabled hidden />
                <SelectItem value="rfq" text={text('subjectRfq')} />
                <SelectItem value="supply" text={text('subjectSupply')} />
                <SelectItem value="technical" text={text('subjectTechnical')} />
                <SelectItem value="other" text={text('subjectOther')} />
              </Select>
            </div>

            <TextArea
              id="about-contact-message"
              name="message"
              required
              rows={5}
              labelText={`${text('messageLabel')} *`}
              placeholder={text('messagePlaceholder')}
            />

            <Button type="submit" kind="primary" size="lg" renderIcon={Send} disabled={submitting}>
              {submitting ? text('submitting') : text('submit')}
            </Button>
          </form>
        </Tile>

        <aside aria-label={text('contactDetailsLabel')} className="min-w-0 bg-card">
          <div className="divide-y divide-border">
            <ContactItem icon={MapPin} label={text('officeLabel')} value={address} />
            <ContactItem icon={Phone} label={text('hotlineLabel')} value={phone} href={`tel:${phone.replace(/\s/g, '')}`} />
            <ContactItem icon={Mail} label={text('emailContactLabel')} value={email} href={`mailto:${email}`} />
          </div>

          <div className="relative aspect-[16/10] min-h-64 w-full overflow-hidden border-t border-border bg-muted">
            <iframe
              title={text('mapTitle')}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.473595677843!2d105.975765!3d20.650228!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135c345a5555555%3A0x1!2zS0NOIMSQ4buTbmcgVsSDbiwgRHV5IFRpw6puLCBIw6AgTmFt!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </aside>
      </div>
    </section>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
  href
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-muted text-brand">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted-foreground">{label}</span>
        <span className="mt-1 block break-words text-sm font-medium leading-6 text-foreground">{value}</span>
      </span>
    </>
  );

  return (
    <div className="p-6 sm:p-7">
      {href ? (
        <a href={href} className="group flex min-h-12 items-start gap-4 hover:text-brand">
          {content}
        </a>
      ) : (
        <div className="flex min-h-12 items-start gap-4">{content}</div>
      )}
    </div>
  );
}
