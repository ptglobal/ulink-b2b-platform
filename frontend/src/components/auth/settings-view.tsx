'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import {
  Mail,
  Phone,
  Building2,
  UserRound,
  Loader2,
  KeyRound,
  X,
  type LucideIcon
} from 'lucide-react';
import { changePassword } from '@/lib/auth';

/**
 * Shape returned from Directus `GET /items/customers?filter[user][_eq]=<id>`.
 * Only the fields we render are typed — anything else is ignored.
 */
export interface SettingsCustomer {
  id: string | number;
  company_name?: string | null;
  contact_name?: string | null;
  phone?: string | null;
}

interface SettingsUser {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
}

interface Props {
  user: SettingsUser;
  customer: SettingsCustomer | null;
}

export function SettingsView({ user, customer }: Props) {
  const t = useTranslations('auth');

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.email.split('@')[0];

  return (
    <section className="container py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('settingsTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('settingsSubtitle')}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile (read-only) */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">{t('profileSection')}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t('profileReadOnlyHint')}</p>

          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              icon={Building2}
              label={t('fieldCompany')}
              value={customer?.company_name ?? '—'}
            />
            <Field icon={UserRound} label={t('fieldContact')} value={fullName} />
            <Field icon={Mail} label={t('fieldEmail')} value={user.email} />
            <Field
              icon={Phone}
              label={t('fieldPhone')}
              value={customer?.phone ?? '—'}
            />
          </dl>
        </div>

        {/* Security card */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-base font-semibold text-foreground">{t('securitySection')}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('securityChangePasswordDesc')}
          </p>

          <ChangePasswordButton email={user.email} />
        </div>
      </div>

      {/* Dialog mounted into <body> so it escapes any stacking/overflow parent */}
      <ChangePasswordDialog email={user.email} />
    </section>
  );
}

// ─── Field ───────────────────────────────────────────────────────────────────

function Field({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background/40 px-3.5 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
        <Icon className="h-4 w-4" aria-hidden={true} />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}

// ─── Trigger + Dialog (lives in the same module to share the `open` state) ──

function ChangePasswordButton({ email }: { email: string }) {
  const t = useTranslations('auth');
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('settings:open-change-password'))}
      className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-brand bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-strong sm:w-auto"
    >
      <KeyRound className="h-4 w-4" aria-hidden={true} />
      {t('changePasswordCta')}
    </button>
  );
}

function ChangePasswordDialog({ email }: { email: string }) {
  const t = useTranslations('auth');
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Open/close event channel — the trigger button lives in a sibling card,
  // and we don't want to lift `open` up just to share one boolean.
  useEffect(() => {
    const onOpen = () => {
      setSent(false);
      setError(null);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('settings:open-change-password', onOpen);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('settings:open-change-password', onOpen);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // SSR guard — portal needs document
  if (!open || typeof document === 'undefined') return null;

  async function onSend() {
    setSending(true);
    setError(null);
    try {
      await changePassword(email);
      setSent(true);
    } catch {
      setError(t('errorNetwork'));
    } finally {
      setSending(false);
    }
  }

  function close() {
    if (sending) return;
    setOpen(false);
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-change-pw-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={close}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <KeyRound className="h-5 w-5" aria-hidden={true} />
            </span>
            <h3 id="settings-change-pw-title" className="text-base font-semibold text-foreground">
              {sent ? t('settingsChangePasswordDialogSentTitle') : t('settingsChangePasswordDialogTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t('settingsChangePasswordDialogClose')}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden={true} />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {sent
            ? t('settingsChangePasswordDialogSentDesc', { email })
            : t('settingsChangePasswordDialogDesc', { email })}
        </p>

        {error && (
          <p role="alert" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          {sent ? (
            <button
              type="button"
              onClick={close}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t('settingsChangePasswordDialogClose')}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={close}
                disabled={sending}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {t('settingsChangePasswordDialogCancel')}
              </button>
              <button
                type="button"
                onClick={onSend}
                disabled={sending}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-strong disabled:opacity-60"
              >
                {sending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden={true} />}
                {sending ? t('settingsChangePasswordDialogSending') : t('settingsChangePasswordDialogSend')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
