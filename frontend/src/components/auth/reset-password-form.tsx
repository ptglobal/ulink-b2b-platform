'use client';

import { Suspense, useState, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { resetPassword, AuthError } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { PASSWORD_REGEX } from '@/lib/validators';

export function ResetPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}

function ResetPasswordFormInner() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useSearchParams();

  const tokenFromUrl = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // No token in URL → invalid/expired link
  if (!tokenFromUrl && !done) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t('resetPasswordInvalidToken')}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          {t('resetPasswordExpiredDesc')}
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-brand bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong"
        >
          {t('forgotPasswordTitle')}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t('resetPasswordSuccess')}
        </h2>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-brand bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong"
        >
          {t('backToLogin')}
        </button>
      </div>
    );
  }

  async function onSubmit() {
    setFormError(null);
    const errs: Record<string, string> = {};
    if (!PASSWORD_REGEX.test(password)) errs.password = t('passwordPolicy');
    if (password !== confirm) errs.confirm_password = t('passwordMismatch');
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await resetPassword({ token: tokenFromUrl, password, confirm_password: confirm });
      setDone(true);
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.code === 'invalid_token') {
          setFormError(t('resetPasswordInvalidToken'));
        } else if (err.status === 429) {
          setFormError(t('rateLimited'));
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError(t('errorNetwork'));
      }
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    'w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand focus:ring-1 focus:ring-brand';

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {t('resetPasswordTitle')}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('resetPasswordDesc')}
      </p>

      {formError && (
        <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <form
        className="mt-6 space-y-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        noValidate
      >
        <PasswordFields
          inputBase={inputBase}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          password={password}
          setPassword={setPassword}
          confirm={confirm}
          setConfirm={setConfirm}
          fieldErrors={fieldErrors}
          t={t}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand bg-brand py-3 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>{t('resetPasswordSubmitting')}</span>
            </>
          ) : (
            <>
              <span>{t('resetPasswordSubmit')}</span>
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

interface PasswordFieldsProps {
  inputBase: string;
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  password: string;
  setPassword: (v: string) => void;
  confirm: string;
  setConfirm: (v: string) => void;
  fieldErrors: Record<string, string>;
  t: ReturnType<typeof useTranslations<'auth'>>;
}

function PasswordFields({
  inputBase,
  showPassword,
  setShowPassword,
  password,
  setPassword,
  confirm,
  setConfirm,
  fieldErrors,
  t
}: PasswordFieldsProps) {
  return (
    <>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
            aria-invalid={!!fieldErrors.password}
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
          <p className="mt-1.5 text-xs text-destructive">{fieldErrors.password}</p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground">{t('passwordPolicyHint')}</p>
      </div>

      <div>
        <label htmlFor="confirm_password" className="mb-1 block text-sm text-foreground">
          {t('confirmPasswordLabel')}
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="confirm_password"
            name="confirm_password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={t('confirmPasswordPlaceholder')}
            aria-invalid={!!fieldErrors.confirm_password}
            className={cn(inputBase, fieldErrors.confirm_password ? 'border-destructive' : 'border-border')}
          />
        </div>
        {fieldErrors.confirm_password && (
          <p className="mt-1.5 text-xs text-destructive">{fieldErrors.confirm_password}</p>
        )}
      </div>
    </>
  );
}
