'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { register, AuthError } from '@/lib/auth';
import { SocialAuth } from '@/components/auth/social-auth';
import { cn } from '@/lib/utils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone numbers are digits-only (no spaces, dashes, parentheses or leading
// '+'). The minimum length of 6 mirrors the server-side rule in
// src/lib/validators.ts. Keep the two in sync.
const PHONE_RE = /^\d{6,}$/;
// Server enforces this — same regex in src/lib/validators.ts and Directus
// customer-onboarding-endpoint/service.js. Keep in sync.
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

type Fields = 'company_name' | 'contact_name' | 'email' | 'phone' | 'password' | 'confirm_password';

// OTP verification in the registration flow is currently disabled — accounts
// are created directly on submit. This key is kept around so any leftover
// state from a previous session does not leak into the new flow.
const REGISTER_DRAFT_KEY = 'register_draft_v1';

interface RegisterDraft {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  /**
   * Whether the user explicitly accepted the terms of service. The backend
   * stamps a consent record (consented_at) on the customer row at the moment
   * the account is created.
   */
  agree: true;
  /** ISO-8601 timestamp of the moment the user consented (submit time). */
  agree_at: string;
}

export function RegisterForm() {
  const t = useTranslations('auth');
  const router = useRouter();

  const [values, setValues] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Fields | 'agree', string>>>({});

  function set(field: Fields, value: string) {
    // Phone field is digits-only — strip everything else at input time so the
    // user can't even type a non-digit character (which would also fail the
    // PHONE_RE validation below with a phoneInvalid error).
    const sanitized = field === 'phone' ? value.replace(/\D/g, '') : value;
    setValues((v) => ({ ...v, [field]: sanitized }));
  }

  function validate() {
    const e: Partial<Record<Fields | 'agree', string>> = {};
    if (!values.company_name.trim()) e.company_name = t('companyRequired');
    if (!values.contact_name.trim()) e.contact_name = t('contactRequired');
    if (!values.email) e.email = t('emailRequired');
    else if (values.email.length > 254) e.email = t('emailTooLong');
    else if (!EMAIL_RE.test(values.email)) e.email = t('emailInvalid');
    if (!values.phone) e.phone = t('phoneRequired');
    else if (!PHONE_RE.test(values.phone)) e.phone = t('phoneInvalid');
    if (!values.password) e.password = t('passwordRequired');
    else if (!PASSWORD_RE.test(values.password)) e.password = t('passwordPolicy');
    if (values.confirm_password !== values.password) e.confirm_password = t('passwordMismatch');
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
      // OTP step is currently disabled — call /api/auth/register directly.
      // The legacy draft key is cleared so a stale draft from a previous
      // OTP-enabled session can't bleed into the new flow.
      try { sessionStorage.removeItem(REGISTER_DRAFT_KEY); } catch { /* ignore */ }
      try { sessionStorage.removeItem('verified_tokens'); } catch { /* ignore */ }
      try { sessionStorage.removeItem('verified_token'); } catch { /* ignore */ }

      await register({
        company_name: values.company_name.trim(),
        contact_name: values.contact_name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        confirm_password: values.confirm_password,
        // Stamp the consent at submit time so the timestamp is bound to the
        // moment the user actually agreed (which may differ from when the
        // checkbox was first ticked, if they paused to fill the form).
        agree: true,
        agree_at: new Date().toISOString()
      });
      // Account created — the /api/auth/register route does NOT set a session
      // cookie (no auto-login). Send the user to /login so they sign in
      // explicitly with the credentials they just chose.
      router.push('/login');
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.code === 'email_taken' || err.status === 409) {
          setFormError(t('emailAlreadyRegistered'));
        } else if (err.code === 'agree_required') {
          setFormError(t('agreeRequired'));
        } else if (err.code === 'password_mismatch' || err.code === 'password_policy') {
          setFormError(t('passwordPolicy'));
        } else if (err.status === 422) {
          // Map raw Directus validation messages to user-friendly translations.
          // The server returns messages like 'Validation failed for field "email"...'
          // which should never be shown verbatim.
          const rawMsg = err.message?.toLowerCase() ?? '';
          if (rawMsg.includes('email')) {
            setErrors((cur) => ({ ...cur, email: t('emailInvalid') }));
          } else if (rawMsg.includes('password')) {
            setErrors((cur) => ({ ...cur, password: t('passwordPolicy') }));
          } else if (rawMsg.includes('phone')) {
            setErrors((cur) => ({ ...cur, phone: t('phoneInvalid') }));
          } else {
            setFormError(t('registerFailed'));
          }
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

  const inputBase =
    'w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand focus:ring-1 focus:ring-brand';

  const field = (
    name: Fields,
    opts: { label: string; placeholder: string; type?: string; icon: typeof Mail; autoComplete?: string }
  ) => {
    const Icon = opts.icon;
    const err = errors[name];
    return (
      <div>
        <label htmlFor={name} className="mb-1 block text-sm text-foreground">
          {opts.label}
        </label>
        <div className="relative">
          <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
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
            className={cn(inputBase, err ? 'border-destructive' : 'border-border')}
          />
        </div>
        {err && (
          <p id={`${name}-error`} className="mt-1.5 text-xs text-destructive">
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

      <form className="mt-6 space-y-3.5" onSubmit={onSubmit} noValidate>
        {formError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        {field('company_name', { label: t('companyLabel'), placeholder: t('companyPlaceholder'), icon: Building2, autoComplete: 'organization' })}
        {field('contact_name', { label: t('contactLabel'), placeholder: t('contactPlaceholder'), icon: User, autoComplete: 'name' })}
        {field('email', { label: t('emailLabel'), placeholder: t('emailPlaceholder'), icon: Mail, type: 'email', autoComplete: 'email' })}
        {field('phone', { label: t('phoneLabel'), placeholder: t('phonePlaceholder'), icon: Phone, type: 'tel', autoComplete: 'tel' })}

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
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder={t('passwordPlaceholder')}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={cn(inputBase, 'pr-11', errors.password ? 'border-destructive' : 'border-border')}
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
            <p id="password-error" className="mt-1.5 text-xs text-destructive">
              {errors.password}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">{t('passwordPolicyHint')}</p>
        </div>

        {field('confirm_password', {
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
          {errors.agree && <p className="mt-1.5 text-xs text-destructive">{errors.agree}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand bg-brand py-3 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>{t('registerCreating')}</span>
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

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('haveAccount')}{' '}
        <Link href="/login" className="font-medium text-brand hover:underline">
          {t('loginNow')}
        </Link>
      </p>
    </div>
  );
}

export { REGISTER_DRAFT_KEY, type RegisterDraft };