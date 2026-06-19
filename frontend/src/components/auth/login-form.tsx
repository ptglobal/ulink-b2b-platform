'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { login, AuthError } from '@/lib/auth';
import { SocialAuth } from '@/components/auth/social-auth';
import { cn } from '@/lib/utils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const next: { email?: string; password?: string } = {};
    if (!email) next.email = t('emailRequired');
    else if (!EMAIL_RE.test(email)) next.email = t('emailInvalid');
    if (!password) next.password = t('passwordRequired');
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      // Navigate to home then ask Next.js to re-fetch server-rendered data
      // (header, session-bound UI) so the "logged in" state shows up without a
      // full page reload and the resulting flash.
      router.push('/');
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof AuthError && err.code === 'network_error'
          ? t('errorNetwork')
          : t('errorInvalidCredentials')
      );
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    'w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand focus:ring-1 focus:ring-brand';

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('welcomeBack')}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('welcomeSubtitle')}</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        {formError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        {/* Email */}
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
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              className={cn(inputBase, fieldErrors.email ? 'border-destructive' : 'border-border')}
            />
          </div>
          {fieldErrors.email && (
            <p id="email-error" className="mt-1.5 text-xs text-destructive">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-foreground">
            {t('passwordLabel')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              className={cn(inputBase, 'pr-11', fieldErrors.password ? 'border-destructive' : 'border-border')}
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
          {fieldErrors.password && (
            <p id="password-error" className="mt-1.5 text-xs text-destructive">
              {fieldErrors.password}
            </p>
          )}
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-xs font-medium text-brand hover:underline">
              {t('forgotPassword')}
            </Link>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand bg-brand py-3 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>{t('loggingIn')}</span>
            </>
          ) : (
            <>
              <span>{t('loginButton')}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {/* Divider + Social / SSO */}
      <SocialAuth mode="login" />

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link href="/register" className="font-medium text-brand hover:underline">
          {t('registerNow')}
        </Link>
      </p>
    </div>
  );
}
