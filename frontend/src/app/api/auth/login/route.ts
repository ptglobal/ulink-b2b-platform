import { ApiError } from '@/lib/api-error';
import { handleRoute, jsonOk, jsonErrorRaw } from '@/lib/route-helpers';
import { extractSetCookie } from '@/lib/auth-helpers';
import { loginSchema, type LoginInput } from '@/lib/validators';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const CUSTOMER_ROLE_ID =
  process.env.DIRECTUS_CUSTOMER_ROLE_ID ?? 'e11b0e50-3030-410c-9999-000000000003';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/login
 *
 * Body: { email, password }
 *
 * Calls Directus /auth/login in `mode: 'session'` so that the upstream
 * response carries a Set-Cookie header. We forward that header back to the
 * client so the browser stores an httpOnly session token.
 *
 * On success we also issue an immediate /users/me so the caller can
 * redirect intelligently (e.g. to /portal vs. back to /login).
 */
export async function POST(req: Request) {
  return handleRoute<LoginInput>(req, { schema: loginSchema }, async (data) => {
    // Pre-check whether the target account is locked before we even burn
    // a probe login. Directus blocks sign-in for `status !== 'active'`,
    // but its 401 message is generic and indistinguishable from
    // "wrong password" — so we surface our own, friendlier message here.
    //
    // We only return `account_locked` when we are *certain* the email
    // exists. If the lookup says "no user", fall through to the normal
    // 401 path so we don't leak which emails are registered.
    try {
      const statusRes = await fetch(`${DIRECTUS_URL}/password-reset-request/user-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
        cache: 'no-store'
      });
      if (statusRes.ok) {
        const statusJson = (await statusRes.json().catch(() => ({}))) as {
          data?: { exists?: boolean; status?: string };
        };
        const exists = statusJson?.data?.exists === true;
        const status = statusJson?.data?.status;
        if (exists && status && status !== 'active') {
          // 'suspended' / 'archived' / 'invited' / 'draft' all map to
          // the same locked-account message — the user needs to contact
          // the administrator regardless of *why* the account is gated.
          throw new ApiError(
            403,
            'account_locked',
            'Your account has been temporarily locked. Please contact the administrator.'
          );
        }
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      /* non-fatal: fall through to /auth/login and let it 401 normally */
    }

    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password, mode: 'session' }),
      cache: 'no-store'
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new ApiError(401, 'invalid_credentials', 'Email or password is incorrect');
      }
      if (res.status === 429) {
        throw new ApiError(
          429,
          'too_many_attempts',
          'Too many login attempts. Please wait and try again.'
        );
      }
      // Surface upstream error message for diagnostics, without echoing the body.
      let upstreamMessage: string | undefined;
      try {
        const body = (await res.json()) as { error?: string; errors?: Array<{ message: string }> };
        upstreamMessage = body.error ?? body.errors?.[0]?.message;
      } catch {
        /* not JSON */
      }
      throw new ApiError(res.status, 'login_failed', upstreamMessage ?? 'Login failed.');
    }

    const setCookie = extractSetCookie(res);
    if (!setCookie) {
      // Defensive: refuse to claim success without a session cookie.
      return jsonErrorRaw(500, 'login_failed', 'Upstream did not return a session cookie.');
    }

    // Customer portal and Directus CMS are separate authentication boundaries.
    // Verify the role before forwarding any upstream cookie to the browser.
    const sessionCookie = setCookie.split(';', 1)[0];
    const meRes = await fetch(`${DIRECTUS_URL}/users/me?fields=id,role`, {
      headers: { cookie: sessionCookie },
      cache: 'no-store'
    });
    const meJson = meRes.ok
      ? ((await meRes.json().catch(() => null)) as {
          data?: { role?: string | { id?: string } | null };
        } | null)
      : null;
    const role =
      typeof meJson?.data?.role === 'string' ? meJson.data.role : meJson?.data?.role?.id;

    if (role !== CUSTOMER_ROLE_ID) {
      await fetch(`${DIRECTUS_URL}/auth/logout`, {
        method: 'POST',
        headers: { cookie: sessionCookie },
        cache: 'no-store'
      }).catch(() => undefined);
      throw new ApiError(
        403,
        'customer_portal_only',
        'This sign-in is reserved for customer accounts. CMS users must use the CMS login.'
      );
    }

    const response = jsonOk({ ok: true });
    response.headers.set('set-cookie', setCookie);
    return response;
  });
}
