'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Loader2, CheckCircle2, Mail, User, Building2, Phone } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { register, AuthError } from '@/lib/auth';
import { REGISTER_DRAFT_KEY, type RegisterDraft } from '@/components/auth/register-form';

interface VerifiedTokenEntry {
  token: string;
  email: string;
}

type VerifiedTokens = Partial<Record<string, VerifiedTokenEntry>>;

function readVerifiedTokens(): VerifiedTokens {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(sessionStorage.getItem('verified_tokens') ?? '{}') as VerifiedTokens;
  } catch {
    return {};
  }
}

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
    const tokens = readVerifiedTokens();
    if (tokens.register) {
      delete tokens.register;
      sessionStorage.setItem('verified_tokens', JSON.stringify(tokens));
    }
  } catch {
    /* ignore */
  }
  // Legacy single-token key — clear it too.
  sessionStorage.removeItem('verified_token');
}

export function RegisterConfirmForm() {
  const t = useTranslations('auth');
  const router = useRouter();

  const [draft, setDraft] = useState<RegisterDraft | null>(null);
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Read draft + verified_token from sessionStorage on mount. If either is
  // missing the user navigated here without going through /register, so we
  // show a "go back to registration" prompt instead of silently doing nothing.
  useEffect(() => {
    const d = readDraft();
    const tokens = readVerifiedTokens();
    const entry = tokens.register;
    if (!d || !entry || !entry.token) return;
    if (entry.email.toLowerCase() !== d.email.toLowerCase()) return;
    setDraft(d);
    setVerifiedToken(entry.token);
  }, []);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!draft || !verifiedToken) {
      setFormError(t('registerConfirmMissingDraft'));
      return;
    }
    setLoading(true);
    setFormError(null);
    try {
      await register({
        company_name: draft.company_name,
        contact_name: draft.contact_name,
        email: draft.email,
        phone: draft.phone,
        password: draft.password,
        confirm_password: draft.confirm_password,
        // Forward the consent record captured at /register submit time. The
        // backend stamps consented_at on the customer row from these values.
        agree: true,
        agree_at: draft.agree_at,
        verified_token: verifiedToken
      });
      // Only wipe draft/token after the server confirmed the account was
      // created — if the call throws we want the user to be able to retry
      // without re-filling the form.
      clearDraftAndToken();
      setDone(true);
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.code === 'email_unverified' || /verif/i.test(err.message)) {
          setFormError(t('registerConfirmTokenExpired'));
        } else if (err.code === 'email_taken' || err.status === 409) {
          setFormError(t('emailAlreadyRegistered'));
        } else if (err.code === 'agree_required') {
          // The consent record was rejected or missing — send the user back
          // to /register to re-confirm. We can't recover in place because the
          // draft is the only source of the agree_at timestamp.
          setFormError(t('agreeRequired'));
        } else if (err.code === 'password_mismatch' || err.code === 'password_policy') {
          setFormError(t('passwordPolicy'));
        } else if (err.status === 422) {
          // Surface server-side validation details so the user knows which field
          // failed (instead of the generic "Input validation failed" message).
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

  function startOver() {
    clearDraftAndToken();
    router.push('/register');
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t('registerCompleteTitle')}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          {t('registerCompleteDesc', { email: draft?.email ?? '' })}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-brand bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong"
        >
          {t('loginNow')}
          <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  // Missing draft or token → user landed here directly. Tell them to redo the
  // email verification rather than silently submitting empty data.
  if (!draft || !verifiedToken) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t('registerConfirmTitle')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('registerConfirmMissingDraft')}</p>
        <button
          type="button"
          onClick={startOver}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-brand bg-brand py-3 text-sm font-medium text-brand-foreground transition-colors hover:border-brand-strong hover:bg-brand-strong"
        >
          <span>{t('backToRegister')}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {t('registerConfirmTitle')}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('registerConfirmDesc', { email: draft.email })}
      </p>

      <div className="mt-5 space-y-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <Row icon={Building2} label={t('companyLabel')} value={draft.company_name} />
        <Row icon={User} label={t('contactLabel')} value={draft.contact_name} />
        <Row icon={Mail} label={t('emailLabel')} value={draft.email} />
        <Row icon={Phone} label={t('phoneLabel')} value={draft.phone} />
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        )}

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
              <span>{t('registerConfirmButton')}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={startOver}
          disabled={loading}
          className="block w-full text-center text-xs text-muted-foreground hover:text-foreground disabled:opacity-60"
        >
          {t('backToRegister')}
        </button>
      </form>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}
