'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, ArrowRight, Loader2, CheckCircle2, RotateCw } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { requestPasswordReset, AuthError } from '@/lib/auth';
import { cn } from '@/lib/utils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Same keys used by reset-password-form and change-password-form — shared
// lockout bucket means if one surface locked you, the other shows it too.
const LOCKOUT_KEYS = ['reset_pwd_locked_until', 'change_pwd_locked_until'];

function readLockedUntil(): number | null {
  try {
    for (const key of LOCKOUT_KEYS) {
      const v = sessionStorage.getItem(key);
      if (v != null) {
        const n = Number(v);
        if (Number.isFinite(n) && n > Date.now()) return n;
      }
    }
  } catch {
    /* SSR / quota */
  }
  return null;
}

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // After successful submission, switch to "sent" view in-place
  const [sent, setSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Shared lockout awareness
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const stored = readLockedUntil();
    if (stored) {
      setLockedUntil(stored);
      setFormError(t('resetPasswordLockedTitle'));
    }
    setNow(Date.now());
  }, [t]);

  // Tick clock while locked or resend cooldown active
  useEffect(() => {
    if (lockedUntil == null && resendCooldown <= 0) return;
    const id = setInterval(() => {
      setNow(Date.now());
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil, resendCooldown]);

  // Clear lockout when TTL expires
  useEffect(() => {
    if (lockedUntil != null && now >= lockedUntil) {
      setLockedUntil(null);
      setFormError(null);
    }
  }, [lockedUntil, now]);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setFormError(null);
    setEmailError(null);

    if (lockedUntil != null && Date.now() < lockedUntil) return;

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
      await requestPasswordReset(email);
      setSent(true);
      setResendCooldown(60);
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

  async function handleResend() {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    try {
      await requestPasswordReset(email);
      setResendCooldown(60);
    } catch {
      // Silently fail — avoid email enumeration
    } finally {
      setResending(false);
    }
  }

  const inputBase =
    'w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand focus:ring-1 focus:ring-brand';

  const isLocked = lockedUntil != null && lockedUntil > now;

  // ─── "Sent" view: centered success ──────────────────────────────────────────
  if (sent) {
    return (
      <div className="text-center">
        {/* Red lockout banner — takes priority */}
        {isLocked && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-left text-sm text-destructive"
          >
            <p className="font-medium">{t('resetPasswordLockedTitle')}</p>
            <p className="mt-1 text-xs">
              {t('resetPasswordLockedWithCountdown', {
                mm: String(Math.max(0, Math.floor((lockedUntil! - now) / 60000))).padStart(2, '0'),
                ss: String(Math.max(0, Math.floor(((lockedUntil! - now) % 60000) / 1000))).padStart(
                  2,
                  '0'
                )
              })}
            </p>
          </div>
        )}

        {/* Large success icon */}
        {!isLocked && (
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </span>
        )}

        {/* Title */}
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t('forgotPasswordSentTitle')}
        </h2>

        {/* Description + email */}
        {!isLocked && (
          <div className="mt-3 text-sm text-muted-foreground">
            <p>{t('forgotPasswordSentDesc')}</p>
            <p className="mt-1 font-medium text-foreground">{email}</p>
            <p className="mt-3 text-sm text-foreground">{t('forgotPasswordSentAction')}</p>
          </div>
        )}

        {/* Resend + check spam inline */}
        {!isLocked && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>{t('forgotPasswordNoEmail')}</span>
            <span className="text-border">·</span>
            <span>{t('forgotPasswordCheckSpam')}</span>
            <span className="text-border">·</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
              className="inline-flex items-center gap-1 font-medium text-brand hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
            >
              <RotateCw className={cn('h-3 w-3', resending && 'animate-spin')} aria-hidden="true" />
              {resendCooldown > 0
                ? t('forgotPasswordResendCooldown', { seconds: resendCooldown })
                : t('forgotPasswordResend')}
            </button>
          </div>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
          >
            ← {t('backToLogin')}
          </Link>
        </p>
      </div>
    );
  }

  // ─── Default view: email input ─────────────────────────────────────────────
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {t('forgotPasswordTitle')}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('forgotPasswordDesc')}</p>

      {/* Red lockout banner with live MM:SS countdown */}
      {isLocked && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <p className="font-medium">{t('resetPasswordLockedTitle')}</p>
          <p className="mt-1 text-xs">
            {t('resetPasswordLockedWithCountdown', {
              mm: String(Math.max(0, Math.floor((lockedUntil - now) / 60000))).padStart(2, '0'),
              ss: String(Math.max(0, Math.floor(((lockedUntil - now) % 60000) / 1000))).padStart(
                2,
                '0'
              )
            })}
          </p>
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        {formError && !isLocked && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-foreground">
            {t('emailLabel')}
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              disabled={isLocked}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
              className={cn(
                inputBase,
                emailError ? 'border-destructive' : 'border-border',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
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
          disabled={loading || isLocked}
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
