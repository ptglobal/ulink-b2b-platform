import { handleRoute, jsonOk } from '@/lib/route-helpers';
import { ApiError } from '@/lib/api-error';
import { changePasswordViaTokenSchema, type ChangePasswordViaTokenInput } from '@/lib/validators';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/change-password/confirm-token
 *
 * Body: { token, current_password, new_password, confirm_new_password }
 *
 * Used when the user opens /change-password?token=… (link from the
 * change-password email). The 3-field form is mandatory; we verify
 * `current_password` by probing Directus /auth/login before forwarding
 * the change to /password-reset-request/reset. Without this probe an
 * attacker who intercepts the email link alone (e.g. compromised inbox)
 * could change the password knowing only the new value — which defeats
 * the whole point of requiring a current password.
 *
 * Identity model:
 *   - The **token's email is the source of truth** — the link was emailed
 *     only to that inbox, so whoever has the link proved email-inbox
 *     control. The current_password check adds the knowledge factor.
 *   - If the user also has a session, the session email must match the
 *     token email. Otherwise a logged-in User A could submit User B's
 *     token + A's own current_password → probe would succeed against A,
 *     /reset would then consume B's token and change B's password.
 *   - No session is fine — the token alone is sufficient identity.
 *
 * On success the response is `{ ok: true, changed: true }`; the client then
 * calls /api/auth/logout to drop its own cookie before redirecting to
 * /login?reason=password-changed.
 *
 * Errors:
 *   400 invalid_token               — token missing/expired/consumed
 *   401 invalid_current_password    — current_password didn't match
 *   403 token_email_mismatch        — session email ≠ token email
 *   422 password_mismatch           — confirm !== new
 *   422 password_policy             — new failed complexity rule
 *   429 rate_limited                — too many failed attempts
 *   502 upstream_error              — Directus unreachable
 */
export async function POST(req: Request) {
  return handleRoute<ChangePasswordViaTokenInput>(
    req,
    { schema: changePasswordViaTokenSchema },
    async (data) => {
      // 1. Peek the token. Token email is the source of truth.
      let tokenEmail: string | null = null;
      try {
        const peekRes = await fetch(
          `${DIRECTUS_URL}/password-reset-request/peek`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: data.token }),
            cache: 'no-store'
          }
        );
        if (peekRes.ok) {
          const peekJson = (await peekRes.json()) as {
            data?: { valid?: boolean; email?: string };
          };
          if (peekJson?.data?.valid && typeof peekJson.data.email === 'string') {
            tokenEmail = peekJson.data.email.toLowerCase();
          }
        }
      } catch {
        /* fall through — handled below */
      }

      if (!tokenEmail) {
        // Missing / expired / consumed / peek-network-error. Don't
        // distinguish the reason to the caller.
        throw new ApiError(
          400,
          'invalid_token',
          'This reset link has expired or already been used. Please request a new one.'
        );
      }

      // 2. Cross-user defence. If a session also exists, the two emails
      //    must match — otherwise a logged-in attacker could use their
      //    own password to consume someone else's token.
      const cookieHeader = req.headers.get('cookie') ?? '';
      let sessionEmail: string | null = null;
      try {
        const meRes = await fetch(`${DIRECTUS_URL}/users/me`, {
          headers: { cookie: cookieHeader },
          cache: 'no-store'
        });
        if (meRes.ok) {
          const meJson = (await meRes.json()) as { data?: { email?: string } };
          if (typeof meJson?.data?.email === 'string') {
            sessionEmail = meJson.data.email.toLowerCase();
          }
        }
      } catch {
        /* fall through */
      }

      if (sessionEmail && sessionEmail !== tokenEmail) {
        console.warn(
          `[change-password/confirm-token] token/session email mismatch: ` +
            `session=${sessionEmail} token=${tokenEmail}`
        );
        throw new ApiError(
          403,
          'token_email_mismatch',
          'This reset link does not belong to the signed-in account.'
        );
      }

      // 2b. Anti-brute-force gate. Before we burn a probe login, check
      //     whether this email is already locked out from a prior wave of
      //     wrong guesses. Keyed on `tokenEmail` so a token-mismatch
      //     attacker cannot spam-lock someone else's surface.
      try {
        const statusRes = await fetch(
          `${DIRECTUS_URL}/password-reset-request/password-change/status`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: tokenEmail }),
            cache: 'no-store'
          }
        );
        if (statusRes.ok) {
          const statusJson = (await statusRes.json().catch(() => ({}))) as {
            data?: { locked?: boolean; lockedUntil?: number; ttlSeconds?: number };
          };
          if (statusJson?.data?.locked) {
            throw new ApiError(
              429,
              'too_many_attempts',
              'Too many wrong attempts. Please try again later.',
              undefined,
              {
                lockedUntil: statusJson.data.lockedUntil ?? null,
                ttlSeconds: statusJson.data.ttlSeconds ?? 0,
                locked: true
              }
            );
          }
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
        /* non-fatal: probe path below will still surface a 401 on bad input */
      }

      // 3. Probe current_password against the token's email.
      const probeEmail = tokenEmail;
      let probeSetCookie: string | null = null;
      try {
        const probeRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            email: probeEmail,
            password: data.current_password,
            mode: 'session'
          }),
          cache: 'no-store'
        });
        if (!probeRes.ok) {
          // Increment the counter and pull fresh state. The 401 is mapped
          // to `invalid_current_password` so the existing client switch
          // case continues to work; the new payload field carries the
          // remaining-count / lockout info that the form needs to render
          // the live countdown.
          let payload: Record<string, unknown> | undefined;
          try {
            const failRes = await fetch(
              `${DIRECTUS_URL}/password-reset-request/password-change/fail`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: tokenEmail }),
                cache: 'no-store'
              }
            );
            if (failRes.ok) {
              const failJson = (await failRes.json().catch(() => ({}))) as {
                data?: { remaining?: number; locked?: boolean; lockedUntil?: number };
              };
              if (failJson?.data) payload = failJson.data as Record<string, unknown>;
            }
          } catch {
            /* best-effort — surface a plain 401 if Redis is unreachable */
          }
          throw new ApiError(
            401,
            'invalid_current_password',
            'Current password is incorrect.',
            undefined,
            payload
          );
        }
        probeSetCookie = probeRes.headers.get('set-cookie');
      } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(502, 'upstream_error', 'Could not reach Directus.');
      }

      // 3b. Reuse guard — new password must differ from the current one.
      //     We check here (not in Zod) so the error uses the same ApiError
      //     code that the client switch-case expects. This does NOT count
      //     toward the lockout counter — only wrong current_password does.
      if (data.new_password === data.current_password) {
        throw new ApiError(
          422,
          'PASSWORD_SAME_AS_OLD',
          'New password must be different from the current password.'
        );
      }

      // 4. Forward to Directus's reset endpoint with the token + new
      //    password.
      let res: Response;
      try {
        res = await fetch(`${DIRECTUS_URL}/password-reset-request/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: data.token,
            password: data.new_password,
            confirm_password: data.confirm_new_password
          }),
          cache: 'no-store'
        });
      } catch {
        throw new ApiError(502, 'upstream_error', 'Could not reach Directus.');
      }

      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        errors?: Array<{ extensions?: { code?: string }; message?: string }>;
      };

      // 5. Kill the probe login session so we don't leak a fresh Directus
      //    session into the void.
      if (probeSetCookie) {
        try {
          await fetch(`${DIRECTUS_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              cookie: probeSetCookie
            },
            body: JSON.stringify({ mode: 'session' }),
            cache: 'no-store'
          });
        } catch {
          /* best-effort cleanup */
        }
      }

      if (!res.ok) {
        const code =
          body.error ?? body.errors?.[0]?.extensions?.code ?? 'reset_failed';
        const message =
          body.message ?? body.errors?.[0]?.message ?? 'Password change failed.';
        const status =
          code === 'invalid_token' || code === 'missing_fields'
            ? 400
            : code === 'rate_limited'
              ? 429
              : code === 'password_mismatch' || code === 'password_policy'
                ? 422
                : res.status;
        throw new ApiError(status, code, message);
      }

      // 6. Best-effort: clear the current-password fail counter so a
      //    successful change wipes any earlier misses. Failure here is
      //    not surfaced — the user already changed their password.
      try {
        await fetch(`${DIRECTUS_URL}/password-reset-request/password-change/clear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: tokenEmail }),
          cache: 'no-store'
        });
      } catch {
        /* non-fatal */
      }

      return jsonOk({ ok: true, changed: true }, 200);
    }
  );
}
