'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { changePasswordInSession, changePasswordByToken, logout, AuthError } from '@/lib/auth';
import { PASSWORD_REGEX } from '@/lib/validators';
import { cn } from '@/lib/utils';

type Fields = 'current_password' | 'new_password' | 'confirm_new_password';

export function ChangePasswordForm() {
  return <ChangePasswordFormInner />;
}

function ChangePasswordFormInner() {
  const t = useTranslations('auth');
  const router = useRouter();
  const search = useSearchParams();

  // Two entry points share this form:
  //   - In-session: user clicked "Change password" in Settings → Settings
  //     routed them to /change-password directly. There is no ?token= in
  //     the URL; we call /api/auth/change-password/apply which checks
  //     current_password against Directus.
  //   - Email-link: user clicked the link in the change-password email →
  //     URL is /change-password?token=…; we call
  //     /api/auth/change-password/confirm-token, which forwards to
  //     Directus's reset endpoint. The token identifies the user; the
  //     3-field form is still required to make a stolen inbox alone
  //     insufficient.
  const tokenFromUrl = search.get('token');
  const viaEmail = !!tokenFromUrl;

  // Optional ?reason=expired flag — show a soft banner explaining why the
  // user was sent here. We don't change form behaviour, just messaging.
  const reason = search.get('reason');

  const [values, setValues] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});

  function set(field: Fields, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  // BFCache guard: when the user navigates back to this page (browser
  // back button) AFTER the password has already been changed (so we land in
  // the `done` state), force-redirect to /login so the user can't
  // re-submit with a stale (consumed) token. Browsers can otherwise restore
  // the page from the back-forward cache even after `history.replaceState`,
  // which would put the user back on the success view *and* let them click
  // through to a re-rendered form. Watch `pageshow` with `persisted=true`
  // — that's the BFCache restore signal.
  useEffect(() => {
    function onPageShow(ev: PageTransitionEvent) {
      if (ev.persisted) {
        try {
          window.history.replaceState(null, '', '/login?reason=password-changed');
        } catch {
          /* ignore */
        }
        router.replace('/login?reason=password-changed');
      }
    }
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [router]);

  function validate(): boolean {
    const e: Partial<Record<Fields, string>> = {};
    if (!values.current_password) e.current_password = t('currentPasswordRequired');
    if (!values.new_password) e.new_password = t('passwordRequired');
    else if (!PASSWORD_REGEX.test(values.new_password)) e.new_password = t('passwordPolicy');
    if (values.new_password && values.new_password === values.current_password) {
      e.new_password = t('passwordReuse');
    }
    if (!values.confirm_new_password) e.confirm_new_password = t('passwordRequired');
    else if (values.confirm_new_password !== values.new_password) {
      e.confirm_new_password = t('passwordMismatch');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      if (viaEmail && tokenFromUrl) {
        await changePasswordByToken({
          token: tokenFromUrl,
          current_password: values.current_password,
          new_password: values.new_password,
          confirm_new_password: values.confirm_new_password
        });
      } else {
        await changePasswordInSession({
          current_password: values.current_password,
          new_password: values.new_password,
          confirm_new_password: values.confirm_new_password
        });
      }
      // Server's password-policy-hook killed every session for this user
      // (both flows go through the same /reset endpoint under the hood).
      // We still hold a now-dead cookie — clear it explicitly so the next
      // render of <UserMenu /> or any auth-guarded page doesn't see a
      // stale session and bounce the user back home.
      await logout();
      setDone(true);
    } catch (err) {
      if (err instanceof AuthError) {
        // Map server-side error codes to localized messages so the user
        // sees *why* the change failed, not a generic "something went
        // wrong".
        switch (err.code) {
          case 'invalid_current_password':
            setErrors((cur) => ({ ...cur, current_password: t('invalidCurrentPassword') }));
            break;
          case 'invalid_token':
            setFormError(t('resetPasswordInvalidToken'));
            break;
          case 'PASSWORD_SAME_AS_OLD':
          case 'passwordReuse':
            setErrors((cur) => ({ ...cur, new_password: t('passwordReuse') }));
            break;
          case 'password_mismatch':
            setErrors((cur) => ({ ...cur, confirm_new_password: t('passwordMismatch') }));
            break;
          case 'password_policy':
            setErrors((cur) => ({ ...cur, new_password: t('passwordPolicy') }));
            break;
          case 'unauthenticated':
            setFormError(t('sessionExpiredLoginAgain'));
            break;
          case 'rate_limited':
          case 'rateLimited':
            setFormError(t('rateLimited'));
            break;
          default:
            // Validation errors carry a field-level `details` map. Surface
            // them under the right field if we can match them; otherwise
            // show the message at the top.
            if (err.status === 422 && err.details) {
              const next: Partial<Record<Fields, string>> = {};
              for (const [field, msgs] of Object.entries(err.details)) {
                if (field === 'current_password' || field === 'new_password' || field === 'confirm_new_password') {
                  next[field] = (msgs as string[]).join(', ');
                }
              }
              if (Object.keys(next).length) {
                setErrors((cur) => ({ ...cur, ...next }));
                break;
              }
            }
            setFormError(err.message || t('changeFailed'));
        }
      } else {
        setFormError(t('errorNetwork'));
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    // After a successful change the server has wiped every Directus session
    // for this user, including the one we just used. The user must now sign
    // back in. We use `router.replace` (not push) so this done-view entry
    // does NOT sit in the browser history — otherwise Back from home after
    // re-login would walk back through login → change-password and let
    // someone on a shared device submit the form again with a stale
    // (already-consumed) token. Replacing it keeps the back-stack clean.
    function handleBackToLogin() {
      const nextUrl = '/login?reason=password-changed';
      // Replace the current entry (change-password) with the target URL so
      // back-navigation from /login (and any subsequent post-login home)
      // can't return here.
      try {
        window.history.replaceState(null, '', nextUrl);
      } catch {
        /* non-browser env — fall through, router.replace will still work */
      }
      router.replace(nextUrl);
    }

    return (
      <div className="text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t('changePasswordSuccess')}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          {t('changePasswordSuccessDesc')}
        </p>
        <button
          type="button"
          onClick={handleBackToLogin}
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-brand bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong"
        >
          {t('backToLogin')}
        </button>
      </div>
    );
  }

  const inputBase =
    'w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand focus:ring-1 focus:ring-brand';

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {t('changePassword')}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {viaEmail ? t('changePasswordEmailDesc') : t('changePasswordDesc')}
      </p>

      {viaEmail && (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 rounded-lg border border-brand/30 bg-brand/5 px-3 py-2 text-sm text-foreground"
        >
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          <span>{t('changePasswordEmailHint')}</span>
        </p>
      )}

      {reason === 'expired' && (
        <p
          role="status"
          className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-400"
        >
          {t('changePasswordExpiredPrompt')}
        </p>
      )}

      {formError && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      )}

      <form className="mt-6 space-y-3.5" onSubmit={onSubmit} noValidate>
        {/* Current password */}
        <div>
          <label htmlFor="current_password" className="mb-1 block text-sm text-foreground">
            {t('currentPasswordLabel')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="current_password"
              name="current_password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={values.current_password}
              onChange={(e) => set('current_password', e.target.value)}
              placeholder={t('currentPasswordPlaceholder')}
              aria-invalid={!!errors.current_password}
              aria-describedby={errors.current_password ? 'current_password-error' : undefined}
              className={cn(inputBase, 'pr-11', errors.current_password ? 'border-destructive' : 'border-border')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.current_password && (
            <p id="current_password-error" className="mt-1.5 text-xs text-destructive">
              {errors.current_password}
            </p>
          )}
        </div>

        {/* New password */}
        <div>
          <label htmlFor="new_password" className="mb-1 block text-sm text-foreground">
            {t('newPasswordLabel')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="new_password"
              name="new_password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={values.new_password}
              onChange={(e) => set('new_password', e.target.value)}
              placeholder={t('newPasswordPlaceholder')}
              aria-invalid={!!errors.new_password}
              aria-describedby={errors.new_password ? 'new_password-error' : undefined}
              className={cn(inputBase, 'pr-11', errors.new_password ? 'border-destructive' : 'border-border')}
            />
          </div>
          {errors.new_password && (
            <p id="new_password-error" className="mt-1.5 text-xs text-destructive">
              {errors.new_password}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">{t('passwordPolicyHint')}</p>
        </div>

        {/* Confirm new password */}
        <div>
          <label htmlFor="confirm_new_password" className="mb-1 block text-sm text-foreground">
            {t('confirmNewPasswordLabel')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="confirm_new_password"
              name="confirm_new_password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={values.confirm_new_password}
              onChange={(e) => set('confirm_new_password', e.target.value)}
              placeholder={t('confirmNewPasswordPlaceholder')}
              aria-invalid={!!errors.confirm_new_password}
              aria-describedby={errors.confirm_new_password ? 'confirm_new_password-error' : undefined}
              className={cn(inputBase, errors.confirm_new_password ? 'border-destructive' : 'border-border')}
            />
          </div>
          {errors.confirm_new_password && (
            <p id="confirm_new_password-error" className="mt-1.5 text-xs text-destructive">
              {errors.confirm_new_password}
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
              <span>{t('changePasswordSubmitting')}</span>
            </>
          ) : (
            <span>{t('changePasswordSubmit')}</span>
          )}
        </button>
      </form>
    </div>
  );
}
