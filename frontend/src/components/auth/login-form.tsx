'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { InlineNotification, PasswordInput, TextInput } from '@carbon/react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from '@/components/icons';
import { Link, useRouter } from '@/i18n/navigation';
import { AuthError } from '@/lib/auth';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}

function LoginFormInner() {
  const t = useTranslations('auth');
  const router = useRouter();
  const search = useSearchParams();
  const { login } = useAuth();

  const reason = search.get('reason');
  const reasonBanner =
    reason === 'password-changed'
      ? { kind: 'success' as const, key: 'loginAfterPasswordChange' }
      : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const nextRaw = search.get('next');
      const targetPath =
        typeof nextRaw === 'string' &&
        nextRaw.startsWith('/') &&
        !nextRaw.startsWith('//') &&
        !nextRaw.startsWith('/\\') &&
        !nextRaw.startsWith('/admin')
          ? nextRaw
          : '/';
      router.push(targetPath);
      router.refresh();
    } catch (err) {
      if (err instanceof AuthError && err.code === 'account_locked') {
        setFormError(t('accountLockedContactAdmin'));
      } else if (err instanceof AuthError && err.code === 'network_error') {
        setFormError(t('errorNetwork'));
      } else {
        setFormError(t('errorInvalidCredentials'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="mb-5 flex justify-end">
          <LocaleSwitcher />
        </div>

        <div className="relative mb-7 flex items-center border-b border-border">
          <Link
            href="/login"
            className="relative flex-1 border-b-2 border-brand py-3 text-center text-sm font-semibold text-brand"
          >
            {t('tabLogin')}
          </Link>
          <Link
            href="/register"
            className="flex-1 py-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t('tabRegister')}
          </Link>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">{t('welcomeBack')}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{t('welcomeSubtitle')}</p>
        </div>

        {reasonBanner ? (
          <InlineNotification
            className="mt-5"
            kind="success"
            lowContrast
            hideCloseButton
            title={t(reasonBanner.key)}
          />
        ) : null}

        <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
          {formError ? (
            <InlineNotification kind="error" lowContrast hideCloseButton title={formError} />
          ) : null}

          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            labelText={`${t('emailLabel')} *`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t('emailPlaceholder')}
            invalid={Boolean(fieldErrors.email)}
            invalidText={fieldErrors.email}
          />

          <div>
            <div className="mb-2 flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-brand hover:text-brand-strong hover:underline"
              >
                {t('forgotPassword')}?
              </Link>
            </div>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              labelText={`${t('passwordLabel')} *`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('passwordPlaceholder')}
              invalid={Boolean(fieldErrors.password)}
              invalidText={fieldErrors.password}
              hidePasswordLabel={t('hidePassword')}
              showPasswordLabel={t('showPassword')}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            loadingLabel={t('loggingIn')}
            className="group w-full"
          >
            {!loading ? (
              <>
                <span>{t('loginButton')}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            ) : null}
          </Button>
        </form>
      </div>

      <div className="mt-7 border-t border-border pt-6 text-center">
        <p className="text-xs leading-5 text-muted-foreground">
          {t('loginSupport')}{' '}
          <a href="tel:19006868" className="font-semibold text-brand hover:underline">
            1900 6868
          </a>
        </p>
      </div>
    </div>
  );
}
