'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { InlineNotification, Modal, Tag, TextArea, TextInput } from '@carbon/react';
import { useAuth } from '@/lib/auth-context';

interface HubRfqModalProps {
  hubId: number;
  hubName: string;
  open: boolean;
  onClose: () => void;
  labels: {
    title: string;
    hubLabel: string;
    contactName: string;
    company: string;
    phone: string;
    email: string;
    note: string;
    notePlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    cancel: string;
    close: string;
  };
}

type FieldErrors = Record<string, string>;

export default function HubRfqModal({ hubId, hubName, open, onClose, labels }: HubRfqModalProps) {
  const { user, status: authStatus } = useAuth();
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !user) return;

    const fetchCustomer = async () => {
      try {
        const response = await fetch('/api/customer');
        if (!response.ok) throw new Error('fetch failed');
        const payload = await response.json();
        const customer = payload.customer;

        if (customer) {
          if (customer.company_name && !company) setCompany(customer.company_name);
          if (customer.email && !email) setEmail(customer.email);
          if (customer.phone && !phone) setPhone(customer.phone);
          if (customer.contact_name && !contactName) setContactName(customer.contact_name);
        } else {
          if (!email && user.email) setEmail(user.email);
          if (!contactName && user.first_name) {
            setContactName([user.first_name, user.last_name].filter(Boolean).join(' '));
          }
        }
      } catch {
        if (!email && user.email) setEmail(user.email);
        if (!contactName && user.first_name) {
          setContactName([user.first_name, user.last_name].filter(Boolean).join(' '));
        }
      }
    };

    fetchCustomer();
    // Keep user-entered values when authentication state refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, user]);

  const validate = useCallback((): FieldErrors => {
    const nextErrors: FieldErrors = {};
    if (!contactName.trim()) nextErrors.contactName = labels.required;
    if (!company.trim()) nextErrors.company = labels.required;
    if (!email.trim()) nextErrors.email = labels.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = labels.invalidEmail;
    if (!phone.trim()) nextErrors.phone = labels.required;
    else if (!/^\d{10,11}$/.test(phone)) nextErrors.phone = labels.invalidPhone;
    return nextErrors;
  }, [company, contactName, email, labels, phone]);

  const submitForm = async () => {
    if (submitting || submitted) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/hub-rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hub_id: hubId,
          contact_name: contactName.trim(),
          email: email.trim(),
          company: company.trim(),
          phone: phone.trim(),
          message: message.trim() || undefined
        })
      });

      if (!response.ok) throw new Error('Submit failed');
      setSubmitted(true);
    } catch {
      setErrors({ _form: labels.error });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitForm();
  };

  const handleClose = () => {
    if (submitted) {
      setContactName('');
      setEmail('');
      setCompany('');
      setPhone('');
      setMessage('');
      setErrors({});
      setSubmitted(false);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      size="sm"
      modalHeading={labels.title}
      primaryButtonText={submitted ? labels.close : submitting ? labels.submitting : labels.submit}
      secondaryButtonText={submitted ? undefined : labels.cancel}
      primaryButtonDisabled={submitting}
      onRequestClose={handleClose}
      onRequestSubmit={submitted ? handleClose : submitForm}
      selectorPrimaryFocus="#hub-rfq-contact-name"
    >
      <div className="mb-6">
        <Tag type="blue" size="sm">
          {labels.hubLabel}: {hubName}
        </Tag>
      </div>

      {submitted ? (
        <InlineNotification kind="success" lowContrast hideCloseButton title={labels.success} />
      ) : (
        <form id="hub-rfq-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
          {errors._form ? (
            <InlineNotification kind="error" lowContrast hideCloseButton title={errors._form} />
          ) : null}

          <TextInput
            id="hub-rfq-contact-name"
            labelText={`${labels.contactName} *`}
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            placeholder={labels.contactName}
            invalid={Boolean(errors.contactName)}
            invalidText={errors.contactName}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              id="hub-rfq-company"
              labelText={`${labels.company} *`}
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder={labels.company}
              invalid={Boolean(errors.company)}
              invalidText={errors.company}
            />
            <TextInput
              id="hub-rfq-phone"
              type="tel"
              inputMode="numeric"
              labelText={`${labels.phone} *`}
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
              placeholder="0901234567"
              invalid={Boolean(errors.phone)}
              invalidText={errors.phone}
            />
          </div>

          <TextInput
            id="hub-rfq-email"
            type="email"
            labelText={`${labels.email} *`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
            invalid={Boolean(errors.email)}
            invalidText={errors.email}
          />

          <TextArea
            id="hub-rfq-note"
            labelText={labels.note}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            placeholder={labels.notePlaceholder}
          />
        </form>
      )}
    </Modal>
  );
}
