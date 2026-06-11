'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { register, AuthError } from '@/lib/auth';
import { SocialAuth } from '@/components/auth/social-auth';
import { cn } from '@/lib/utils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Fields = 'company' | 'contact' | 'email' | 'phone' | 'password' | 'confirm';

export function RegisterForm() {
  const t = useTranslations('auth');

  const [values, setValues] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    password: '',
    confirm: ''
  });
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Fields | 'agree', string>>>({});

  function set(field: Fields, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  function validate() {
    const e: Partial<Record<Fields | 'agree', string>> = {};
    if (!values.company) e.company = t('companyRequired');
    if (!values.contact) e.contact = t('contactRequired');
    if (!values.email) e.email = t('emailRequired');
    else if (!EMAIL_RE.test(values.email)) e.email = t('emailInvalid');
    if (!values.phone) e.phone = t('phoneRequired');
    if (!values.password) e.password = t('passwordRequired');
    else if (values.password.length < 8) e.password = t('passwordTooShort');
    if (values.confirm !== values.password) e.confirm = t('passwordMismatch');
    if (!agree) e.agree = t('agreeRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        company: values.company,
        contact: values.contact,
        email: values.email,
        phone: values.phone,
        password: values.password,
        confirm: values.confirm
      });
      setDone(true);
    } catch (err) {
      setFormError(
        err instanceof AuthError && err.code === 'network_error' ? t('errorNetwork') : t('registerFailed')
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('registerSuccessTitle')}</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">{t('registerSuccessDesc')}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center rounded-md border border-brand bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-strong hover:border-brand-strong"
        >
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  const inputBase =
    'w-full rounded-md border bg-card py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand focus:ring-1 focus:ring-brand';

  const field = (
    name: Fields,
    opts: { label: string; placeholder: string; type?: string; icon: typeof Mail; autoComplete?: string }
  ) => {
    const Icon = opts.icon;
    const err = errors[name];
    return (
      <div>
        <label htmlFor={name} className="mb-1.5 block text-sm text-foreground">
          {opts.label}
        </label>
        <div className="relative">
          <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id={name}
            name={name}
            type={opts.type ?? 'text'}
            autoComplete={opts.autoComplete}
            value={values[name]}
            onChange={(e) => set(name, e.target.value)}
            placeholder={opts.placeholder}
            aria-invalid={!!err}
            aria-describedby={err ? `${name}-error` : undefined}
            className={cn(inputBase, err ? 'border-accent' : 'border-border')}
          />
        </div>
        {err && (
          <p id={`${name}-error`} className="mt-1.5 text-xs text-accent">
            {err}
          </p>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('tabRegister')}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('registerSubtitle')}</p>

      <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
        {formError && (
          <p role="alert" className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
            {formError}
          </p>
        )}

        {field('company', { label: t('companyLabel'), placeholder: t('companyPlaceholder'), icon: Building2, autoComplete: 'organization' })}
        {field('contact', { label: t('contactLabel'), placeholder: t('contactPlaceholder'), icon: User, autoComplete: 'name' })}
        {field('email', { label: t('emailLabel'), placeholder: t('emailPlaceholder'), icon: Mail, type: 'email', autoComplete: 'email' })}
        {field('phone', { label: t('phoneLabel'), placeholder: t('phonePlaceholder'), icon: Phone, type: 'tel', autoComplete: 'tel' })}

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-foreground">
            {t('passwordLabel')}
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder={t('passwordPlaceholder')}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={cn(inputBase, 'pr-11', errors.password ? 'border-accent' : 'border-border')}
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
          {errors.password && (
            <p id="password-error" className="mt-1.5 text-xs text-accent">
              {errors.password}
            </p>
          )}
        </div>

        {field('confirm', {
          label: t('confirmPasswordLabel'),
          placeholder: t('confirmPasswordPlaceholder'),
          icon: Lock,
          type: showPassword ? 'text' : 'password',
          autoComplete: 'new-password'
        })}

        {/* Terms */}
        <div>
          <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand"
              aria-invalid={!!errors.agree}
            />
            <span>{t('agreeTerms')}</span>
          </label>
          {errors.agree && <p className="mt-1.5 text-xs text-accent">{errors.agree}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-brand bg-brand py-3.5 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>{t('registering')}</span>
            </>
          ) : (
            <>
              <span>{t('registerButton')}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <SocialAuth mode="register" />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t('haveAccount')}{' '}
        <Link href="/login" className="font-medium text-brand hover:underline">
          {t('loginNow')}
        </Link>
      </p>
    </div>
  );
}
