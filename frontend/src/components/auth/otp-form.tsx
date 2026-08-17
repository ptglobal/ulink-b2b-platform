'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Loader2, CheckCircle2, Mail, ShieldCheck } from '@/components/icons';
import { Link, useRouter } from '@/i18n/navigation';
import { requestOtp, verifyOtp, register, AuthError } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { REGISTER_DRAFT_KEY, type RegisterDraft } from '@/components/auth/register-form';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_RE = /^\d{6}$/;

type OtpPurpose = 'register' | 'login-2fa';

export function OtpForm() {
  return (
    <Suspense fallback={null}>
      <OtpFormInner />
    </Suspense>
  );
}

function OtpFormInner() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useSearchParams();
  const emailParam = params.get('email') ?? '';
  const purposeParam = (params.get('purpose') ?? 'register') as OtpPurpose;
  const redirectParam = params.get('redirect') ?? '/login';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [autoSent, setAutoSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // Auto-send OTP on first mount ONLY when:
  // 1. No cooldown is active
  // 2. Purpose is NOT 'register' — the register form already sends OTP before
  //    redirecting here, so sending again triggers a 429 rate-limit.
  useEffect(() => {
    if (autoSent) return;
    if (!emailParam || !EMAIL_RE.test(emailParam)) return;
    if (cooldown > 0) return;
    if (purposeParam === 'register') return; // Already sent by register form
    setAutoSent(true);
    void sendOtp(emailParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendOtp(target: string) {
    if (!target || !EMAIL_RE.test(target)) return;
    setFormError(null);
    setLoading(true);
    try {
      await requestOtp(target, purposeParam);
      setCooldown(60);
    } catch (err) {
      if (err instanceof AuthError && err.status === 429) {
        setFormError(t('rateLimited'));
        setCooldown(60);
      } else {
        setFormError(t('errorNetwork'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function onSend(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!email) {
      setFieldErrors({ email: t('emailRequired') });
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setFieldErrors({ email: t('emailInvalid') });
      return;
    }
    setFieldErrors({});
    await sendOtp(email);
  }

  // Read the registration draft (only meaningful for purpose='register').
  // Lives in sessionStorage and was written by /register before the redirect
  // here. Returns null if the user landed on /verify-otp without first going
  // through /register.
  function readDraft(): RegisterDraft | null {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(REGISTER_DRAFT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RegisterDraft;
    } catch {
      return null;
    }
  }

  function clearDraftAndToken() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(REGISTER_DRAFT_KEY);
    try {
      const raw = sessionStorage.getItem('verified_tokens');
      if (!raw) return;
      const tokens = JSON.parse(raw) as Record<string, { token: string; email: string }>;
      if (tokens.register) {
        delete tokens.register;
        sessionStorage.setItem('verified_tokens', JSON.stringify(tokens));
      }
    } catch {
      /* ignore */
    }
    sessionStorage.removeItem('verified_token');
  }

  async function completeRegistration(verifiedToken: string) {
    const draft = readDraft();
    if (!draft) {
      // No draft — user landed here directly. Send them back to /register.
      router.push('/register');
      return;
    }
    setLoading(true);
    try {
      await register({
        company_name: draft.company_name,
        contact_name: draft.contact_name,
        email: draft.email,
        phone: draft.phone,
        password: draft.password,
        confirm_password: draft.confirm_password,
        agree: true,
        agree_at: draft.agree_at,
        verified_token: verifiedToken
      });
      // Account created and auto-logged in. Wipe the draft + token so the
      // user can never replay them, then redirect to homepage.
      clearDraftAndToken();
      router.push('/');
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.code === 'email_unverified' || /verif/i.test(err.message)) {
          setFormError(t('registerConfirmTokenExpired'));
        } else if (err.code === 'email_taken' || err.status === 409) {
          setFormError(t('emailAlreadyRegistered'));
        } else if (err.code === 'agree_required') {
          setFormError(t('agreeRequired'));
        } else if (err.code === 'password_mismatch' || err.code === 'password_policy') {
          setFormError(t('passwordPolicy'));
        } else if (err.status === 422) {
          const fieldErrors = err.details
            ? Object.entries(err.details)
                .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
                .join('; ')
            : null;
          setFormError(fieldErrors ?? err.message ?? t('registerFailed'));
        } else {
          setFormError(err.message || t('registerFailed'));
        }
      } else {
        setFormError(t('errorNetwork'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setFormError(null);
    const errs: Record<string, string> = {};
    if (!email) errs.email = t('emailRequired');
    else if (!EMAIL_RE.test(email)) errs.email = t('emailInvalid');
    if (!code) errs.code = t('otpInvalid');
    else if (!CODE_RE.test(code)) errs.code = t('otpInvalid');
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await verifyOtp(email, code, purposeParam);
      const verifiedToken = res.verified_token;
      // Persist verified_token (keyed by purpose) so subsequent calls can use
      // it without forcing the user to re-enter the code.
      if (typeof window !== 'undefined' && verifiedToken) {
        const existing = JSON.parse(sessionStorage.getItem('verified_tokens') ?? '{}');
        existing[purposeParam] = { token: verifiedToken, email };
        sessionStorage.setItem('verified_tokens', JSON.stringify(existing));
        // Legacy key — keep in sync so any older code paths still work.
        sessionStorage.setItem('verified_token', verifiedToken);
      }
      setLoading(false);

      // For the register flow, OTP verification is the final step — call
      // /api/auth/register immediately so the user lands on the success
      // state with a session cookie, no extra confirm page in between.
      if (purposeParam === 'register' && verifiedToken) {
        await completeRegistration(verifiedToken);
      } else {
        setDone(true);
      }
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.code === 'otp_expired') setFormError(t('otpExpired'));
        else if (err.code === 'cooldown') setFormError(t('otpCooldown'));
        else if (err.status === 429) {
          setFormError(t('rateLimited'));
          setCooldown(60);
        } else setFormError(t('otpInvalid'));
      } else {
        setFormError(t('otpInvalid'));
      }
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
          {purposeParam === 'register' ? t('verifyEmailTitle') : t('otpVerifySuccess')}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          {purposeParam === 'register' ? t('verifyEmailDesc') : t('otpVerifySuccessDesc')}
        </p>
        <Link
          href={redirectParam}
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-brand bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong"
        >
          {t('continue')}
          <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const inputBase =
    'w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand focus:ring-1 focus:ring-brand';

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {purposeParam === 'register' ? t('verifyEmailTitle') : t('otpTitle')}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {purposeParam === 'register' ? t('verifyEmailDesc') : t('otpDesc')}
      </p>

      {formError && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      )}

      {!emailParam && (
        <form className="mt-6 space-y-3" onSubmit={onSend} noValidate>
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
                aria-invalid={!!fieldErrors.email}
                className={cn(
                  inputBase,
                  fieldErrors.email ? 'border-destructive' : 'border-border'
                )}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1.5 text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand bg-brand py-3 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{t('otpSending')}</span>
              </>
            ) : cooldown > 0 ? (
              <span>{t('otpResendIn', { seconds: cooldown })}</span>
            ) : (
              <>
                <span>{t('otpSend')}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      )}

      <form className="mt-6 space-y-3" onSubmit={onVerify} noValidate>
        <div>
          <label htmlFor="code" className="mb-1 block text-sm text-foreground">
            {t('otpTitle')}
          </label>
          <div className="relative">
            <ShieldCheck
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="code"
              name="code"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder={t('otpPlaceholder')}
              aria-invalid={!!fieldErrors.code}
              className={cn(
                inputBase,
                'tracking-widest',
                fieldErrors.code ? 'border-destructive' : 'border-border'
              )}
            />
          </div>
          {fieldErrors.code && (
            <p className="mt-1.5 text-xs text-destructive">{fieldErrors.code}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !code}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand bg-brand py-3 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>{t('otpVerifying')}</span>
            </>
          ) : (
            <>
              <span>{t('otpVerify')}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => sendOtp(email)}
            disabled={loading || cooldown > 0 || !email || !EMAIL_RE.test(email)}
            className="font-medium text-brand hover:underline disabled:text-muted-foreground disabled:no-underline"
          >
            {cooldown > 0
              ? t('otpResendIn', { seconds: cooldown })
              : loading
                ? t('otpResending')
                : t('otpResend')}
          </button>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            {t('backToLogin')}
          </Link>
        </div>
      </form>
    </div>
  );
}
