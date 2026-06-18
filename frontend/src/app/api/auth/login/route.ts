import { ApiError } from '@/lib/api-error';
import { handleRoute, jsonOk, jsonErrorRaw } from '@/lib/route-helpers';
import { extractSetCookie } from '@/lib/auth-helpers';
import { loginSchema, type LoginInput } from '@/lib/validators';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

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
        throw new ApiError(429, 'too_many_attempts', 'Too many login attempts. Please wait and try again.');
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

    const response = jsonOk({ ok: true });
    const setCookie = extractSetCookie(res);
    if (setCookie) response.headers.set('set-cookie', setCookie);
    else {
      // Defensive: refuse to claim success without a session cookie.
      return jsonErrorRaw(500, 'login_failed', 'Upstream did not return a session cookie.');
    }
    return response;
  });
}