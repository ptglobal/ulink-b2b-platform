'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { requestPasswordReset, AuthError } from '@/lib/auth';
import { cn } from '@/lib/utils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setFormError(null);
    setEmailError(null);
    if (!email) {
      setEmailError(t('emailRequired'));
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setEmailError(t('emailInvalid'));
      return;
    }
    setLoading(true);
    try {
      // API always returns { sent: true } to avoid email enumeration. The actual
      // reset can come via the Directus email link or via the OTP code path on
      // the /reset-password page.
      await requestPasswordReset(email);
      setDone(true);
    } catch (err) {
      if (err instanceof AuthError && err.code === 'network_error') {
        setFormError(t('errorNetwork'));
      } else {
        setFormError(t('errorNetwork'));
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t('forgotPasswordSentTitle')}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          {t('forgotPasswordSentDesc')}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          {/* Reset link is in the email — we don't take the user to the reset
              page directly. They must open the link from their inbox so the
              server-issued single-use token reaches the form via the URL. */}
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-brand bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong"
          >
            <span>{t('backToLogin')}</span>
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setEmail('');
            }}
            className="text-xs font-medium text-brand hover:underline"
          >
            {t('resendEmail')}
          </button>
        </div>
      </div>
    );
  }

  const inputBase =
    'w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand focus:ring-1 focus:ring-brand';

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {t('forgotPasswordTitle')}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('forgotPasswordDesc')}</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        {formError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-foreground">
            {t('emailLabel')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
              className={cn(inputBase, emailError ? 'border-destructive' : 'border-border')}
            />
          </div>
          {emailError && (
            <p id="email-error" className="mt-1.5 text-xs text-destructive">
              {emailError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand bg-brand py-3 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>{t('forgotPasswordSending')}</span>
            </>
          ) : (
            <>
              <span>{t('forgotPasswordSubmit')}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-brand hover:underline">
          {t('backToLogin')}
        </Link>
      </p>
    </div>
  );
}
