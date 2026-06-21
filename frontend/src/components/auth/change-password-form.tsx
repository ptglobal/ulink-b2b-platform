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

// ─── SessionStorage keys for lockout persistence ────────────────────────────
// Both reset-password and change-password share the same Redis bucket, so we
// cross-write BOTH keys on lockout. That way navigating between forms (or to
// forgot-password) immediately shows the lockout banner without a server round-trip.
const STORAGE_KEY_ATTEMPTS = 'change_pwd_attempts_left';
const STORAGE_KEY_LOCKED = 'change_pwd_locked_until';
const CROSS_KEY_LOCKED = 'reset_pwd_locked_until';

function readStoredNumber(key: string): number | null {
  try {
    const v = sessionStorage.getItem(key);
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch { return null; }
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
  } catch { /* quota / SSR */ }
}

/** Write lockout to both keys so the sibling form sees it immediately. */
function writeLockedUntil(value: number | null) {
  writeStorage(STORAGE_KEY_LOCKED, value);
  writeStorage(CROSS_KEY_LOCKED, value);
}

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

  // current_password anti-brute-force state. `attemptsLeft` drives the
  // amber hint under the field; `lockedUntil` (epoch ms) drives the red
  // banner with the live MM:SS countdown. `now` ticks every second while
  // a lockout is active.
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

  // Persist lockout state changes to sessionStorage
  useEffect(() => { writeStorage(STORAGE_KEY_ATTEMPTS, attemptsLeft); }, [attemptsLeft]);
  useEffect(() => { writeLockedUntil(lockedUntil); }, [lockedUntil]);

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

  // On mount: query the server for the authoritative lockout state.
  // This catches the case where sessionStorage was cleared, or the user
  // opened a new tab / navigated back. Without this the form would
  // appear interactive until the first submit hits 429.
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/auth/change-password/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tokenFromUrl ? { token: tokenFromUrl } : {}),
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
          setFormError(t('currentPasswordLockedTitle'));
        } else if (typeof d.remaining === 'number' && d.remaining < 3) {
          setAttemptsLeft(d.remaining);
        }
      } catch { /* aborted or network error — non-fatal */ }
    })();
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl]);

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
  // soft "you can try again" message in the same banner slot. This
  // effect is the *client-side* end-of-lockout; the server is still the
  // authoritative gate — a stale `lockedUntil` here just means the form
  // is hidden behind a banner that wouldn't have done anything anyway.
  useEffect(() => {
    if (lockedUntil != null && now >= lockedUntil) {
      setLockedUntil(null);
      setAttemptsLeft(null);
      setFormError(t('currentPasswordLockoutEnded'));
    }
  }, [lockedUntil, now, t]);

  // Clear errors when user starts re-typing — prevents the "stuck" feeling
  // where the user thinks they must reload to try again.
  function handleFieldChange(field: Fields, value: string) {
    set(field, value);
    if (errors[field]) setErrors((cur) => { const next = { ...cur }; delete next[field]; return next; });
    if (formError && lockedUntil == null) setFormError(null);
  }

  function validate(): boolean {
    const e: Partial<Record<Fields, string>> = {};
    if (!values.current_password) e.current_password = t('currentPasswordRequired');
    if (!values.new_password) e.new_password = t('passwordRequired');
    else if (!PASSWORD_REGEX.test(values.new_password)) e.new_password = t('passwordPolicy');
    if (!values.confirm_new_password) e.confirm_new_password = t('passwordRequired');
    // NOTE: mismatch and password-reuse are intentionally NOT checked
    // client-side. Doing so would short-circuit the request before the
    // server can increment the shared anti-brute-force counter. Every
    // submit must hit the server so wrong attempts count toward the
    // 3-fail / 15-min lockout — including mismatch and reuse.
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;
    // Defence-in-depth: the server already 429s during a lockout, but we
    // also refuse to fire a request the user can't act on, so the
    // submit-button doesn't appear to flicker into the spinner state.
    if (lockedUntil != null && Date.now() < lockedUntil) return;
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
          case 'too_many_attempts':
            // The anti-brute-force guard fired (3 misses → 15-min lock).
            // Surface the red banner with the live MM:SS countdown and
            // zero out remaining-attempts so the amber hint disappears.
            setLockedUntil((err.payload?.lockedUntil as number | undefined) ?? null);
            setAttemptsLeft(0);
            setFormError(t('currentPasswordLockedTitle'));
            break;
          case 'invalid_current_password':
            setErrors((cur) => ({ ...cur, current_password: t('invalidCurrentPassword') }));
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
                setFormError(t('currentPasswordLockedTitle'));
              } else if (typeof rem === 'number') {
                setFormError(t('currentPasswordAttemptsLeft', { count: rem }));
              }
            }
            break;
          case 'invalid_token':
            setFormError(t('resetPasswordInvalidToken'));
            break;
          case 'token_email_mismatch':
            setFormError(t('changePasswordSessionMismatch'));
            break;
          case 'PASSWORD_SAME_AS_OLD':
          case 'passwordReuse':
            setErrors((cur) => ({ ...cur, new_password: t('passwordReuse') }));
            if (err.payload && typeof err.payload === 'object') {
              const rem = err.payload.remaining as number | undefined;
              const lu = err.payload.lockedUntil as number | undefined;
              const lk = err.payload.locked as boolean | undefined;
              if (typeof rem === 'number') setAttemptsLeft(rem);
              if (lk && typeof lu === 'number') {
                setLockedUntil(lu);
                setFormError(t('currentPasswordLockedTitle'));
              } else if (typeof rem === 'number') {
                setFormError(t('currentPasswordAttemptsLeft', { count: rem }));
              }
            }
            break;
          case 'password_mismatch':
            setErrors((cur) => ({ ...cur, confirm_new_password: t('passwordMismatch') }));
            if (err.payload && typeof err.payload === 'object') {
              const rem = err.payload.remaining as number | undefined;
              const lu = err.payload.lockedUntil as number | undefined;
              const lk = err.payload.locked as boolean | undefined;
              if (typeof rem === 'number') setAttemptsLeft(rem);
              if (lk && typeof lu === 'number') {
                setLockedUntil(lu);
                setFormError(t('currentPasswordLockedTitle'));
              } else if (typeof rem === 'number') {
                setFormError(t('currentPasswordAttemptsLeft', { count: rem }));
              }
            }
            break;
          case 'password_policy':
            setErrors((cur) => ({ ...cur, new_password: t('passwordPolicy') }));
            if (err.payload && typeof err.payload === 'object') {
              const rem = err.payload.remaining as number | undefined;
              const lu = err.payload.lockedUntil as number | undefined;
              const lk = err.payload.locked as boolean | undefined;
              if (typeof rem === 'number') setAttemptsLeft(rem);
              if (lk && typeof lu === 'number') {
                setLockedUntil(lu);
                setFormError(t('currentPasswordLockedTitle'));
              } else if (typeof rem === 'number') {
                setFormError(t('currentPasswordAttemptsLeft', { count: rem }));
              }
            }
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
          <p className="font-medium">{t('currentPasswordLockedTitle')}</p>
          <p className="mt-1 text-xs">
            {t('currentPasswordLockedWithCountdown', {
              mm: String(Math.max(0, Math.floor((lockedUntil - now) / 60000))).padStart(2, '0'),
              ss: String(Math.max(0, Math.floor(((lockedUntil - now) % 60000) / 1000))).padStart(2, '0')
            })}
          </p>
        </div>
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
              onChange={(e) => handleFieldChange('current_password', e.target.value)}
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
          {/* Amber "N attempt(s) remaining" hint. Hidden once a
              lockout is active — the red banner takes over. */}
          {attemptsLeft != null && attemptsLeft > 0 && lockedUntil == null && (
            <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400">
              {t('currentPasswordAttemptsLeft', { count: attemptsLeft })}
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
              onChange={(e) => handleFieldChange('new_password', e.target.value)}
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
              onChange={(e) => handleFieldChange('confirm_new_password', e.target.value)}
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
          disabled={loading || (lockedUntil != null && Date.now() < lockedUntil)}
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
