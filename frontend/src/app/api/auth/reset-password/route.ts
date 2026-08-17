import { ApiError } from '@/lib/api-error';
import { handleRoute, jsonOk } from '@/lib/route-helpers';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export const dynamic = 'force-dynamic';

interface EndpointErrorBody {
  error?: string;
  message?: string;
  /**
   * Optional structured context. The Directus /reset endpoint returns:
   *   - { lockedUntil, ttlSeconds }                   when the shared lock fires
   *   - { remaining, attempts, locked: false }        when a single attempt was counted
   * We forward this verbatim into ApiError.payload so the client can render
   * a live countdown + attempts-left hint without a second round-trip.
   */
  payload?: Record<string, unknown>;
}

/**
 * POST /api/auth/reset-password
 *
 * Body: { token, password, confirm_password }
 *
 * Forwards to the custom password-reset-request endpoint which validates
 * the token from Redis (single-use, 15-min TTL), updates the user's
 * password, and clears all sessions (AC04).
 *
 * Lockout sharing (3 fails / 15 min) with the change-password surface:
 * before forwarding, peek the token to resolve the email and check
 * /password-reset-request/password-change/status. If the shared lock is
 * active for that email, reject with the same payload shape the change-
 * password form uses so the UI can render a consistent countdown banner.
 * The Directus /reset endpoint also independently increments the shared
 * bucket on every failure (defence-in-depth), so even a bypassed frontend
 * pre-check still ends in a 429 once the counter crosses CURRENT_PWD_FAIL_MAX.
 */
export async function POST(req: Request) {
  return handleRoute<ResetPasswordInput>(req, { schema: resetPasswordSchema }, async (data) => {
    // 0. Peek the token to resolve the email — needed for counter ops.
    let resolvedEmail: string | null = null;
    try {
      const peekRes = await fetch(`${DIRECTUS_URL}/password-reset-request/peek`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token }),
        cache: 'no-store'
      });
      if (peekRes.ok) {
        const peekJson = (await peekRes.json().catch(() => ({}))) as {
          data?: { valid?: boolean; email?: string };
        };
        if (peekJson?.data?.valid) resolvedEmail = peekJson.data.email ?? null;
      }
    } catch {
      /* non-fatal */
    }

    // 1. Pre-check the shared lock keyed on the token's email. Mirrors
    //    the change-password form's behaviour so a user locked out of
    //    /change-password also sees the banner the moment they land on
    //    /reset-password?token=…, without needing to type anything wrong.
    if (resolvedEmail) {
      try {
        const statusRes = await fetch(
          `${DIRECTUS_URL}/password-reset-request/password-change/status`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: resolvedEmail }),
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
              'Too many attempts. Please try again later.',
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
        /* non-fatal: forward to /reset and let it 429 normally if the lock fires */
      }
    }

    // 2. Forward to the actual reset endpoint.
    const res = await fetch(`${DIRECTUS_URL}/password-reset-request/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: data.token,
        password: data.password,
        confirm_password: data.confirm_password
      }),
      cache: 'no-store'
    });

    if (!res.ok) {
      let body: EndpointErrorBody | null = null;
      try {
        body = (await res.json()) as EndpointErrorBody;
      } catch {
        /* not JSON */
      }
      const message = body?.message ?? body?.error ?? 'Password reset failed.';
      const code = body?.error ?? 'reset_failed';
      let payload = body?.payload ?? undefined;

      if (code === 'invalid_token' || res.status === 400) {
        throw new ApiError(400, 'invalid_token', message, undefined, payload);
      }
      if (code === 'too_many_attempts' || res.status === 429) {
        throw new ApiError(429, 'too_many_attempts', message, undefined, payload);
      }

      // 3. password_mismatch / password_policy: Directus /reset already
      //    called recordResetAttempt which incremented the shared counter
      //    AND returned payload { remaining, attempts, locked }. Just
      //    forward verbatim — do NOT call /fail again (double-increment).
      if (code === 'password_mismatch' || code === 'password_policy') {
        throw new ApiError(422, code, message, undefined, payload);
      }

      // 4. PASSWORD_SAME_AS_OLD: thrown by the password-policy-hook during
      //    updateOne — Directus's catch block uses deny() which does NOT
      //    increment the shared counter. We must do it explicitly here.
      if (resolvedEmail && code === 'PASSWORD_SAME_AS_OLD') {
        try {
          const failRes = await fetch(
            `${DIRECTUS_URL}/password-reset-request/password-change/fail`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: resolvedEmail }),
              cache: 'no-store'
            }
          );
          if (failRes.ok) {
            const failJson = (await failRes.json().catch(() => ({}))) as {
              data?: { remaining?: number; locked?: boolean; lockedUntil?: number };
            };
            if (failJson?.data) {
              payload = failJson.data as Record<string, unknown>;
            }
          }
        } catch {
          /* best-effort */
        }
        throw new ApiError(422, code, message, undefined, payload);
      }

      throw new ApiError(res.status, code, message, undefined, payload);
    }

    return jsonOk({ ok: true });
  });
}
