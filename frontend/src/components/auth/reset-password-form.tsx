'use client';

import { Suspense, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from '@/components/icons';
import { Link, useRouter } from '@/i18n/navigation';
import { resetPassword, AuthError } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function ResetPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}

// ─── SessionStorage keys for lockout persistence ────────────────────────────
// Both reset-password and change-password share the same Redis bucket, so we
// cross-write BOTH keys on lockout. That way navigating between forms (or to
// forgot-password) immediately shows the lockout banner without a server round-trip.
const STORAGE_KEY_ATTEMPTS = 'reset_pwd_attempts_left';
const STORAGE_KEY_LOCKED = 'reset_pwd_locked_until';
const CROSS_KEY_LOCKED = 'change_pwd_locked_until';

function readStoredNumber(key: string): number | null {
  try {
    const v = sessionStorage.getItem(key);
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Read the highest (furthest-in-future) lockout from both form keys. */
function readSharedLockedUntil(): number | null {
  const a = readStoredNumber(STORAGE_KEY_LOCKED);
  const b = readStoredNumber(CROSS_KEY_LOCKED);
  if (a == null && b == null) return null;
  return Math.max(a ?? 0, b ?? 0) || null;
}

function writeStorage(key: string, value: number | null) {
  try {
    if (value == null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, String(value));
  } catch {
    /* quota / SSR */
  }
}

/** Write lockout to both keys so the sibling form sees it immediately. */
function writeLockedUntil(value: number | null) {
  writeStorage(STORAGE_KEY_LOCKED, value);
  writeStorage(CROSS_KEY_LOCKED, value);
}

function ResetPasswordFormInner() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useSearchParams();

  const tokenFromUrl = params.get('token') ?? '';
  // Pre-fill from ?token= — the user arrives here via the email link (?token=…)
  // or gets redirected to /forgot-password if no token is present.

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Shared 3-fail/15-min lockout (same bucket as the change-password
  // surface). `attemptsLeft` drives the amber hint under the password
  // field; `lockedUntil` (epoch ms) drives the red banner with the live
  // MM:SS countdown; `now` ticks once per second while a lockout is
  // active so the countdown re-renders.
  //
  // State is persisted to sessionStorage so it survives page reloads and
  // navigation — the user can't escape the lockout by pressing F5.
  //
  // IMPORTANT: initialize with null/Date.now() only after mount to avoid
  // SSR hydration mismatch (sessionStorage doesn't exist on the server).
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  // Hydrate lockout state from sessionStorage after mount (client-only).
  useEffect(() => {
    const storedAttempts = readStoredNumber(STORAGE_KEY_ATTEMPTS);
    const storedLocked = readSharedLockedUntil();
    if (storedLocked != null && storedLocked <= Date.now()) {
      // Expired — clear storage
      writeLockedUntil(null);
      writeStorage(STORAGE_KEY_ATTEMPTS, null);
    } else {
      if (storedAttempts != null) setAttemptsLeft(storedAttempts);
      if (storedLocked != null) setLockedUntil(storedLocked);
    }
    setNow(Date.now());
  }, []);

  // On mount: query the server for the authoritative lockout state.
  // This catches the case where sessionStorage was cleared, or the user
  // opened a new tab / navigated back from forgot-password. Without this
  // the form would appear interactive until the first submit hits 429.
  useEffect(() => {
    if (!tokenFromUrl) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/auth/reset-password/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenFromUrl }),
          signal: controller.signal
        });
        if (!res.ok) return;
        const json = (await res.json()) as {
          data?: {
            locked?: boolean;
            lockedUntil?: number;
            remaining?: number;
            attempts?: number;
          };
        };
        const d = json?.data;
        if (!d) return;
        if (d.locked && typeof d.lockedUntil === 'number') {
          setLockedUntil(d.lockedUntil);
          setAttemptsLeft(0);
          setFormError(t('resetPasswordLockedTitle'));
        } else if (typeof d.remaining === 'number' && d.remaining < 3) {
          // Not locked yet but has prior failures — show the amber hint
          setAttemptsLeft(d.remaining);
        }
      } catch {
        /* aborted or network error — non-fatal */
      }
    })();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl]);

  // Persist lockout state changes to sessionStorage
  useEffect(() => {
    writeStorage(STORAGE_KEY_ATTEMPTS, attemptsLeft);
  }, [attemptsLeft]);
  useEffect(() => {
    writeLockedUntil(lockedUntil);
  }, [lockedUntil]);

  // Tick `now` once per second while a lockout is active so the MM:SS
  // countdown re-renders. The interval is mounted only on demand and
  // torn down when `lockedUntil` clears — we don't tick the clock when
  // nobody is watching it.
  useEffect(() => {
    if (lockedUntil == null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  // When the lockout TTL elapses, drop the lock state and surface a
  // soft "you can try again" message in the same banner slot. The
  // server is still the authoritative gate — a stale `lockedUntil`
  // here just means the form is hidden behind a banner that wouldn't
  // have done anything anyway.
  useEffect(() => {
    if (lockedUntil != null && now >= lockedUntil) {
      setLockedUntil(null);
      setAttemptsLeft(null);
      setFormError(t('resetPasswordLockoutEnded'));
    }
  }, [lockedUntil, now, t]);

  // No token — redirect to /forgot-password which now handles the full
  // "enter email → get code → paste code" flow in-place.
  if (!tokenFromUrl && !done) {
    router.replace('/forgot-password');
    return null;
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

  // Clear errors when user starts re-typing — prevents the "stuck" feeling
  // where the user thinks they must reload to try again.
  function handlePasswordChange(v: string) {
    setPassword(v);
    if (fieldErrors.password)
      setFieldErrors((cur) => {
        const next = { ...cur };
        delete next.password;
        return next;
      });
    if (formError && lockedUntil == null) setFormError(null);
  }
  function handleConfirmChange(v: string) {
    setConfirm(v);
    if (fieldErrors.confirm_password)
      setFieldErrors((cur) => {
        const next = { ...cur };
        delete next.confirm_password;
        return next;
      });
    if (formError && lockedUntil == null) setFormError(null);
  }

  async function onSubmit(ev?: React.FormEvent<HTMLFormElement>) {
    ev?.preventDefault();
    setFormError(null);
    // Defence-in-depth: the server already 429s during a lockout, but we
    // also refuse to fire a request the user can't act on, so the
    // submit-button doesn't appear to flicker into the spinner state.
    if (lockedUntil != null && Date.now() < lockedUntil) return;

    // Intentionally NO client-side validation here — not even the
    // password policy regex. Every submission must reach the server so
    // Directus's /reset endpoint can call recordResetAttempt() and
    // increment the shared 3-fail / 15-min lockout counter. If we
    // blocked locally the counter would never fire, the user would
    // never see the "N attempts remaining" hint or the lockout banner,
    // and they could retry indefinitely.
    //
    // Exception: max-length (128 chars, OWASP) is a pure format guard —
    // no real user types 128+ chars accidentally, and blocking it
    // locally doesn't undermine the lockout model.
    const fe: Record<string, string> = {};
    if (password.length > 128) fe.password = t('passwordTooLong');
    if (confirm.length > 128) fe.confirm_password = t('passwordTooLong');
    if (Object.keys(fe).length) {
      setFieldErrors(fe);
      setLoading(false);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await resetPassword({ token: tokenFromUrl, password, confirm_password: confirm });
      setDone(true);
    } catch (err) {
      if (err instanceof AuthError) {
        // Map server-side error codes to localized messages so the user
        // sees *why* the change failed, not a generic "something went
        // wrong".
        switch (err.code) {
          case 'too_many_attempts':
            // The shared anti-brute-force guard fired (3 misses → 15-min
            // lock). Surface the red banner with the live MM:SS
            // countdown and zero out remaining-attempts so the amber
            // hint disappears.
            setLockedUntil((err.payload?.lockedUntil as number | undefined) ?? null);
            setAttemptsLeft(0);
            setFormError(t('resetPasswordLockedTitle'));
            break;
          case 'invalid_token':
            setFormError(t('resetPasswordInvalidToken'));
            break;
          case 'PASSWORD_SAME_AS_OLD':
          case 'password_reuse':
          case 'passwordReuse':
            setFormError(t('passwordSameAsOld'));
            if (err.payload && typeof err.payload === 'object') {
              const rem = err.payload.remaining as number | undefined;
              const lu = err.payload.lockedUntil as number | undefined;
              const lk = err.payload.locked as boolean | undefined;
              if (typeof rem === 'number') setAttemptsLeft(rem);
              if (lk && typeof lu === 'number') {
                setLockedUntil(lu);
                setFormError(t('resetPasswordLockedTitle'));
              } else if (typeof rem === 'number') {
                setFormError(t('resetPasswordAttemptsLeft', { count: rem }));
              }
            }
            break;
          case 'password_mismatch':
            setFieldErrors((cur) => ({ ...cur, confirm_password: t('passwordMismatch') }));
            // Backend may have just crossed the lock threshold on this
            // very request — if `payload.locked` is true the banner
            // takes over and the amber attempts-left hint is hidden by
            // the render condition (since `lockedUntil != null`).
            if (err.payload && typeof err.payload === 'object') {
              const rem = err.payload.remaining as number | undefined;
              const lu = err.payload.lockedUntil as number | undefined;
              const lk = err.payload.locked as boolean | undefined;
              if (typeof rem === 'number') setAttemptsLeft(rem);
              if (lk && typeof lu === 'number') {
                setLockedUntil(lu);
                setFormError(t('resetPasswordLockedTitle'));
              } else if (typeof rem === 'number') {
                setFormError(t('resetPasswordAttemptsLeft', { count: rem }));
              }
            }
            break;
          case 'password_policy':
            setFieldErrors((cur) => ({ ...cur, password: t('passwordPolicy') }));
            if (err.payload && typeof err.payload === 'object') {
              const rem = err.payload.remaining as number | undefined;
              const lu = err.payload.lockedUntil as number | undefined;
              const lk = err.payload.locked as boolean | undefined;
              if (typeof rem === 'number') setAttemptsLeft(rem);
              if (lk && typeof lu === 'number') {
                setLockedUntil(lu);
                setFormError(t('resetPasswordLockedTitle'));
              } else if (typeof rem === 'number') {
                setFormError(t('resetPasswordAttemptsLeft', { count: rem }));
              }
            }
            break;
          case 'rate_limited':
          case 'rateLimited':
            setFormError(t('rateLimited'));
            break;
          default:
            if (err.status === 429) {
              setFormError(t('rateLimited'));
            } else {
              setFormError(err.message);
            }
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
      <p className="mt-2 text-sm text-muted-foreground">{t('resetPasswordDesc')}</p>

      {/* Generic form error — hidden when the lockout banner is active
          (the lockout banner already shows the title + countdown). */}
      {formError && !(lockedUntil != null && lockedUntil > now) && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      )}

      {/* Red lockout banner with live MM:SS countdown. Rendered only
          while the lockout is still in the future; the lockout-end
          effect above clears `lockedUntil` once `now` catches up. */}
      {lockedUntil != null && lockedUntil > now && (
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

      <form className="mt-6 space-y-3.5" onSubmit={onSubmit} noValidate>
        <PasswordFields
          inputBase={inputBase}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          password={password}
          setPassword={handlePasswordChange}
          confirm={confirm}
          setConfirm={handleConfirmChange}
          fieldErrors={fieldErrors}
          attemptsLeft={attemptsLeft}
          lockedUntil={lockedUntil}
          t={t}
        />
        <button
          type="submit"
          disabled={loading || (lockedUntil != null && Date.now() < lockedUntil)}
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
  attemptsLeft: number | null;
  lockedUntil: number | null;
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
  attemptsLeft,
  lockedUntil,
  t
}: PasswordFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-foreground">
          {t('passwordLabel')}
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
            aria-invalid={!!fieldErrors.password}
            className={cn(
              inputBase,
              'pr-11',
              fieldErrors.password ? 'border-destructive' : 'border-border'
            )}
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
        {/* Amber "N attempt(s) remaining" hint. Hidden once a
            lockout is active — the red banner takes over. */}
        {attemptsLeft != null && attemptsLeft > 0 && lockedUntil == null && (
          <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400">
            {t('resetPasswordAttemptsLeft', { count: attemptsLeft })}
          </p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground">{t('passwordPolicyHint')}</p>
      </div>

      <div>
        <label htmlFor="confirm_password" className="mb-1 block text-sm text-foreground">
          {t('confirmPasswordLabel')}
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="confirm_password"
            name="confirm_password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={t('confirmPasswordPlaceholder')}
            aria-invalid={!!fieldErrors.confirm_password}
            className={cn(
              inputBase,
              fieldErrors.confirm_password ? 'border-destructive' : 'border-border'
            )}
          />
        </div>
        {fieldErrors.confirm_password && (
          <p className="mt-1.5 text-xs text-destructive">{fieldErrors.confirm_password}</p>
        )}
      </div>
    </>
  );
}
