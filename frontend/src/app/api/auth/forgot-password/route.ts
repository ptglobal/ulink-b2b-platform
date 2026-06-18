import { handleRoute, jsonOk } from '@/lib/route-helpers';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/forgot-password
 *
 * Body: { email }
 *
 * Forwards to the custom password-reset-request endpoint which generates a
 * single-use token, stores it in Redis, and sends a branded email with a
 * reset link. Always returns { sent: true } to prevent email enumeration.
 */
export async function POST(req: Request) {
  return handleRoute<ForgotPasswordInput>(req, { schema: forgotPasswordSchema }, async (data) => {
    try {
      await fetch(`${DIRECTUS_URL}/password-reset-request/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, purpose: 'forgot' }),
        cache: 'no-store'
      });
    } catch (err) {
      // Log but never surface — prevent email enumeration.
      console.warn('[forgot-password] request failed:', (err as Error).message);
    }

    return jsonOk({ sent: true }, 200);
  });
}
