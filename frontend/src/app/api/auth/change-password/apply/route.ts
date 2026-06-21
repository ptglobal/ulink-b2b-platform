import { handleRoute, jsonOk } from '@/lib/route-helpers';
import { ApiError } from '@/lib/api-error';
import {
  changePasswordInSessionSchema,
  type ChangePasswordInSessionInput
} from '@/lib/validators';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const SESSION_COOKIE = 'directus_session_token';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/change-password/apply
 *
 * Change the password for the currently-authenticated user. The session
 * cookie in the incoming request identifies the user — we additionally
 * verify `current_password` by probing Directus /auth/login so a stolen
 * session cookie alone cannot take over the account.
 *
 * On success, the password-policy-hook extension (Directus side) invalidates
 * all sessions for this user, including the one used to make the change.
 * The frontend should follow up with /api/auth/logout to clear its own
 * cookie and redirect the user back to /login.
 *
 * Body: { current_password, new_password, confirm_new_password }
 *
 * Errors:
 *   401 unauthenticated            — no session cookie
 *   401 invalid_current_password   — current_password didn't match
 *   422 password_mismatch          — confirm_new_password !== new_password
 *   422 password_policy            — new_password failed complexity rule
 *   422 PASSWORD_SAME_AS_OLD       — new_password === current_password
 */
export async function POST(req: Request) {
  return handleRoute<ChangePasswordInSessionInput>(
    req,
    { schema: changePasswordInSessionSchema },
    async (data) => {
      // 1. Read session cookie — must be present.
      const cookieHeader = req.headers.get('cookie') ?? '';
      const cookies = parseCookies(cookieHeader);
      const sessionToken = cookies[SESSION_COOKIE];
      if (!sessionToken) {
        throw new ApiError(401, 'unauthenticated', 'You must be signed in to change your password.');
      }

      // 2. Identify the user via /users/me. We need their id and email for
      //    the password-verification probe and the PATCH below.
      const meRes = await fetch(`${DIRECTUS_URL}/users/me`, {
        headers: { cookie: cookieHeader },
        cache: 'no-store'
      });
      if (!meRes.ok) {
        throw new ApiError(401, 'unauthenticated', 'Session is invalid or expired.');
      }
      const meJson = (await meRes.json()) as { data?: { id?: string; email?: string } };
      const userId = meJson?.data?.id;
      const userEmail = meJson?.data?.email;
      if (!userId || !userEmail) {
        throw new ApiError(401, 'unauthenticated', 'Session is invalid or expired.');
      }

      // 2b. Anti-brute-force gate. Block the probe if this email is
      //     currently locked out from prior wrong current_password
      //     guesses. Keyed on the session's own email.
      try {
        const statusRes = await fetch(
          `${DIRECTUS_URL}/password-reset-request/password-change/status`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail }),
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

      // 3. Verify current_password by attempting a probe login. We do NOT
      //    forward the resulting session cookies back to the client — they
      //    belong to a throwaway session that we kill in step 6.
      const probeRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          password: data.current_password,
          mode: 'session'
        }),
        cache: 'no-store'
      });
      if (!probeRes.ok) {
        // Increment the counter and pull fresh state so the form can
        // show the live countdown / remaining-attempts hint.
        let payload: Record<string, unknown> | undefined;
        try {
          const failRes = await fetch(
            `${DIRECTUS_URL}/password-reset-request/password-change/fail`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail }),
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
          /* best-effort */
        }
        throw new ApiError(
          401,
          'invalid_current_password',
          'Current password is incorrect.',
          undefined,
          payload
        );
      }

      // 4. PATCH the user with the new password. The password-policy-hook
      //    extension runs a `users.update` filter that throws
      //    PASSWORD_SAME_AS_OLD (422) if the new password hashes to the
      //    same value as the existing one.
      const patchRes = await fetch(`${DIRECTUS_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          cookie: cookieHeader,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ password: data.new_password }),
        cache: 'no-store'
      });

      if (!patchRes.ok) {
        let body: { errors?: Array<{ message?: string; extensions?: { code?: string } }> } = {};
        try {
          body = (await patchRes.json()) as typeof body;
        } catch {
          /* not JSON */
        }
        // Surface the password-policy-hook's distinct error code so the
        // frontend can branch on it.
        const hookCode = body.errors?.[0]?.extensions?.code;
        if (hookCode === 'PASSWORD_SAME_AS_OLD') {
          throw new ApiError(422, 'PASSWORD_SAME_AS_OLD', 'New password must be different from the current password.');
        }
        const message = body.errors?.[0]?.message ?? 'Password change failed.';
        throw new ApiError(patchRes.status, 'change_failed', message);
      }

      // 5. (Optional) PATCH succeeded. Directus invalidates this user's
      //    sessions in the action hook that fires after users.update, so
      //    the very cookie used here is now dead. We return success; the
      //    frontend will call /api/auth/logout to clear its own cookie and
      //    navigate the user back to /login.

      // 6. Kill the probe login session so we don't leak a fresh Directus
      //    session into the void. The probe response's Set-Cookie carries
      //    the new session token.
      const probeSetCookie = probeRes.headers.get('set-cookie');
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

      // 7. Best-effort: clear the current-password fail counter so a
      //    successful change wipes any earlier misses. Failure here is
      //    not surfaced — the user already changed their password.
      try {
        await fetch(`${DIRECTUS_URL}/password-reset-request/password-change/clear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
          cache: 'no-store'
        });
      } catch {
        /* non-fatal */
      }

      return jsonOk({ ok: true, changed: true }, 200);
    }
  );
}

/** Minimal cookie parser — we only need a handful of named cookies. */
function parseCookies(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}
