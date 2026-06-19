'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Phone, Building2, UserRound, KeyRound, Loader2, CheckCircle2, X, type LucideIcon } from 'lucide-react';
import { changePassword, AuthError } from '@/lib/auth';
import { cn } from '@/lib/utils';

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

        {/* Security card — sends a change-password link to the user's email */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-base font-semibold text-foreground">{t('securitySection')}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('securityChangePasswordDesc')}
          </p>

          <ChangePasswordButton userEmail={user.email} />
        </div>
      </div>
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

// ─── Change-password dialog ──────────────────────────────────────────────────

/**
 * The "Change password" CTA in the Settings → Security card. Clicking it
 * opens a small dialog that:
 *   1. Shows the user's email (read-only) so they know where the link is
 *      going.
 *   2. On "Send" → calls /api/auth/change-password which triggers a
 *      branded email with a link to /change-password?token=…
 *   3. On success, swaps to a "Đã gửi email" success state with a single
 *      "Close" button.
 *
 * The actual password change happens on the /change-password page when
 * the user follows the link; this dialog only initiates the email.
 */
function ChangePasswordButton({ userEmail }: { userEmail: string }) {
  const t = useTranslations('auth');
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-brand bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-strong sm:w-auto"
      >
        <KeyRound className="h-4 w-4" aria-hidden={true} />
        {t('changePasswordCta')}
      </button>

      <ChangePasswordDialog open={open} onClose={() => setOpen(false)} userEmail={userEmail} />
    </>
  );
}

function ChangePasswordDialog({
  open,
  onClose,
  userEmail
}: {
  open: boolean;
  onClose: () => void;
  userEmail: string;
}) {
  const t = useTranslations('auth');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset transient state every time the dialog re-opens, so a stale
  // "Đã gửi" success view from a previous session doesn't leak into
  // the next time the user opens the dialog.
  if (!open) {
    if (loading || sent || error) {
      setLoading(false);
      setSent(false);
      setError(null);
    }
    return null;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await changePassword(userEmail);
      setSent(true);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message || t('errorNetwork'));
      } else {
        setError(t('errorNetwork'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        // Click on backdrop closes the dialog, but not on the inner panel.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('settingsChangePasswordDialogClose')}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {sent ? (
          <div className="text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2
              id="change-password-dialog-title"
              className="text-lg font-semibold text-foreground"
            >
              {t('settingsChangePasswordDialogSentTitle')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('settingsChangePasswordDialogSentDesc', { email: userEmail })}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex h-9 items-center justify-center rounded-lg border border-brand bg-brand px-5 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong"
            >
              {t('settingsChangePasswordDialogClose')}
            </button>
          </div>
        ) : (
          <>
            <h2
              id="change-password-dialog-title"
              className="text-lg font-semibold text-foreground"
            >
              {t('settingsChangePasswordDialogTitle')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('settingsChangePasswordDialogDesc', { email: userEmail })}
            </p>

            <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
              <div>
                <label htmlFor="change-password-email" className="mb-1 block text-sm text-foreground">
                  {t('settingsChangePasswordDialogEmailLabel')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="change-password-email"
                    type="email"
                    readOnly
                    value={userEmail}
                    className={cn(
                      'w-full rounded-lg border border-border bg-background/40 py-2.5 pl-10 pr-4 text-sm text-muted-foreground outline-none'
                    )}
                  />
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {t('settingsChangePasswordDialogCancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-brand bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>{t('settingsChangePasswordDialogSending')}</span>
                    </>
                  ) : (
                    <span>{t('settingsChangePasswordDialogSend')}</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
