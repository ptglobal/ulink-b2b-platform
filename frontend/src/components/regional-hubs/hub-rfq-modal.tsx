'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
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
  };
}

type FieldErrors = Record<string, string>;

export default function HubRfqModal({
  hubId,
  hubName,
  open,
  onClose,
  labels
}: HubRfqModalProps) {
  const { user, status: authStatus } = useAuth();

  // Form fields
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  // UI state
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-fill from authenticated user's customer profile
  useEffect(() => {
    if (authStatus !== 'authenticated' || !user) return;

    const fetchCustomer = async () => {
      try {
        const res = await fetch('/api/customer');
        if (!res.ok) throw new Error('fetch failed');
        const payload = await res.json();
        const c = payload.customer;
        if (c) {
          if (c.company_name && !company) setCompany(c.company_name);
          if (c.email && !email) setEmail(c.email);
          if (c.phone && !phone) setPhone(c.phone);
          if (c.contact_name && !contactName) setContactName(c.contact_name);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, user]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const validate = useCallback((): FieldErrors => {
    const errs: FieldErrors = {};
    if (!contactName.trim()) errs.contactName = labels.required;
    if (!email.trim()) {
      errs.email = labels.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = labels.invalidEmail;
    }
    if (!company.trim()) errs.company = labels.required;
    if (!phone.trim()) {
      errs.phone = labels.required;
    } else if (!/^\d{10,11}$/.test(phone)) {
      errs.phone = labels.invalidPhone;
    }
    return errs;
  }, [contactName, email, company, phone, labels]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/hub-rfq', {
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

      if (!res.ok) throw new Error('Submit failed');
      setSubmitted(true);
    } catch {
      setErrors({ _form: labels.error });
    } finally {
      setSubmitting(false);
    }
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

  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-card shadow-2xl border">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white/95 dark:bg-card/95 backdrop-blur px-6 py-5 rounded-t-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">{labels.title}</h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-2 hover:bg-muted transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Hub pill */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/20 px-3 py-1.5 text-sm">
            <span className="text-xs text-muted-foreground">{labels.hubLabel}:</span>
            <span className="font-medium text-primary">{hubName}</span>
          </div>
        </div>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center gap-5 p-10 text-center">
            <div className="rounded-full bg-green-50 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <p className="text-xl font-semibold text-green-700">{labels.success}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Đóng
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Contact Name */}
            <Field label={labels.contactName} error={errors.contactName} required>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
              />
            </Field>

            {/* 2-col: Company + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={labels.company} error={errors.company} required>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Công ty TNHH ABC"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                />
              </Field>

              <Field label={labels.phone} error={errors.phone} required>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="0901234567"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                />
              </Field>
            </div>

            {/* Email */}
            <Field label={labels.email} error={errors.email} required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@congty.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
              />
            </Field>

            {/* Note */}
            <Field label={labels.note} error={errors.message}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder={labels.notePlaceholder}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors resize-y"
              />
            </Field>

            {/* Form-level error */}
            {errors._form && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{errors._form}</p>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {labels.submitting}
                  </>
                ) : (
                  labels.submit
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/** Reusable field wrapper */
function Field({
  label,
  error,
  required,
  children
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
