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
 * On success the response is `{ ok: true, changed: true }`; the client then
 * calls /api/auth/logout to drop its own cookie before redirecting to
 * /login?reason=password-changed.
 *
 * Errors:
 *   400 invalid_token               — token missing/expired/consumed
 *   401 invalid_current_password    — current_password didn't match
 *   422 password_mismatch           — confirm !== new
 *   422 password_policy             — new failed complexity rule
 *   429 rate_limited                — too many failed attempts
 */
export async function POST(req: Request) {
  return handleRoute<ChangePasswordViaTokenInput>(
    req,
    { schema: changePasswordViaTokenSchema },
    async (data) => {
      // 1. Resolve the user id behind the token so we can probe-verify
      //    current_password against their account. We do this by calling
      //    /users/me with the request's session cookie — but the email
      //    link flow is for users who may already be logged in elsewhere.
      //    If there is no session, we look up by token via a dedicated
      //    peek endpoint… but we don't have one. Instead, we let
      //    Directus handle the probe in step 3 below using the email
      //    attached to the token. For that we need the email here, so we
      //    must first check the token exists in Directus and read its
      //    email payload.
      //
      //    We expose this via a small probe: hit a Directus endpoint that
      //    returns the token's user email without consuming it. Since we
      //    don't have such an endpoint, we fall back to a different
      //    design: verify current_password against the **currently
      //    authenticated user** if a session cookie is present. If the
      //    user opened the email link while signed in, we know who they
      //    are via /users/me and can probe their password directly.
      const cookieHeader = req.headers.get('cookie') ?? '';

      let probeEmail: string | null = null;
      try {
        const meRes = await fetch(`${DIRECTUS_URL}/users/me`, {
          headers: { cookie: cookieHeader },
          cache: 'no-store'
        });
        if (meRes.ok) {
          const meJson = (await meRes.json()) as { data?: { email?: string } };
          probeEmail = meJson?.data?.email ?? null;
        }
      } catch {
        /* fall through — handled below */
      }

      if (!probeEmail) {
        // No active session. We can't safely verify current_password
        // without an identity to probe against. Reject the request so
        // the user knows to sign in first and re-open the form. The
        // alternative — letting the change through without
        // current_password — would mean a stolen email link alone is
        // enough to take over the account.
        throw new ApiError(
          401,
          'unauthenticated',
          'Please sign in to your account, then re-open the change-password link.'
        );
      }

      // 2. Probe current_password against the authenticated user.
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
          throw new ApiError(
            401,
            'invalid_current_password',
            'Current password is incorrect.'
          );
        }
        probeSetCookie = probeRes.headers.get('set-cookie');
      } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(502, 'upstream_error', 'Could not reach Directus.');
      }

      // 3. Forward to Directus's reset endpoint with the token + new
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

      // 4. Kill the probe login session so we don't leak a fresh Directus
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

      return jsonOk({ ok: true, changed: true }, 200);
    }
  );
}
