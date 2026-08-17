'use client';

import { useState, type FormEvent } from 'react';
import {
  Button,
  Checkbox,
  InlineNotification,
  Select,
  SelectItem,
  TextArea,
  TextInput
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import { useRouter } from '@/i18n/navigation';

type Props = {
  eventSlug: string;
  eventTitle: string;
  labels: Record<string, string>;
  sourceOptions: string[];
  consentLabel: string;
  submitLabel: string;
  messages: {
    consentRequired: string;
    submitError: string;
    errorTitle: string;
    sourcePlaceholder: string;
    submittingLabel: string;
  };
};

export function EventRegistrationForm({
  eventSlug,
  eventTitle,
  labels,
  sourceOptions,
  consentLabel,
  submitLabel,
  messages
}: Props) {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setError(messages.consentRequired);
      return;
    }

    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug,
          eventTitle,
          fullName: form.get('fullName'),
          email: form.get('email'),
          phone: form.get('phone'),
          company: form.get('company'),
          jobTitle: form.get('jobTitle'),
          discoverySource: form.get('discoverySource'),
          note: form.get('note'),
          consent
        })
      });
      const payload = (await response.json()) as { referenceCode?: string; error?: string };
      if (!response.ok || !payload.referenceCode) {
        throw new Error(payload.error || messages.submitError);
      }

      router.push(`/events/${eventSlug}/register/pending?code=${encodeURIComponent(payload.referenceCode)}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : messages.submitError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="event-carbon-form">
      {error ? (
        <InlineNotification
          kind="error"
          lowContrast
          hideCloseButton
          title={messages.errorTitle}
          subtitle={error}
          className="mb-6 max-w-none"
        />
      ) : null}

      <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
        <TextInput id="event-full-name" name="fullName" labelText={labels.fullName} required />
        <TextInput id="event-email" name="email" type="email" labelText={labels.email} required />
        <TextInput id="event-phone" name="phone" type="tel" labelText={labels.phone} required />
        <TextInput id="event-company" name="company" labelText={labels.company} required />
        <TextInput id="event-job-title" name="jobTitle" labelText={labels.jobTitle} />
        <Select
          id="event-discovery-source"
          name="discoverySource"
          labelText={labels.source}
          defaultValue=""
        >
          <SelectItem value="" text={messages.sourcePlaceholder} disabled />
          {sourceOptions.map((option) => (
            <SelectItem key={option} value={option} text={option} />
          ))}
        </Select>
      </div>

      <div className="mt-7">
        <TextArea id="event-note" name="note" labelText={labels.note} rows={5} />
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <Checkbox
          id="event-consent"
          labelText={consentLabel}
          checked={consent}
          onChange={(_, data) => setConsent(data.checked)}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        renderIcon={ArrowRight}
        className="mt-7 w-full max-w-none justify-center"
      >
        {submitting ? messages.submittingLabel : submitLabel}
      </Button>
    </form>
  );
}
