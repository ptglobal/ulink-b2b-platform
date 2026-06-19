import { ApiError } from '@/lib/api-error';
import { handleRoute, jsonOk } from '@/lib/route-helpers';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export const dynamic = 'force-dynamic';

interface EndpointErrorBody {
  error?: string;
  message?: string;
}

/**
 * POST /api/auth/reset-password
 *
 * Body: { token, password, confirm_password }
 *
 * Forwards to the custom password-reset-request endpoint which validates
 * the token from Redis (single-use, 15-min TTL), updates the user's
 * password, and clears all sessions (AC04).
 */
export async function POST(req: Request) {
  return handleRoute<ResetPasswordInput>(req, { schema: resetPasswordSchema }, async (data) => {
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
      try { body = (await res.json()) as EndpointErrorBody; } catch { /* not JSON */ }
      const message = body?.message ?? body?.error ?? 'Password reset failed.';
      const code = body?.error ?? 'reset_failed';

      if (code === 'invalid_token' || res.status === 400) {
        throw new ApiError(400, 'invalid_token', message);
      }
      if (
        code === 'password_mismatch' ||
        code === 'password_policy' ||
        code === 'PASSWORD_SAME_AS_OLD'
      ) {
        throw new ApiError(422, code, message);
      }
      if (res.status === 429) {
        throw new ApiError(429, 'rate_limited', message);
      }
      throw new ApiError(res.status, code, message);
    }

    return jsonOk({ ok: true });
  });
}
