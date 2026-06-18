import { handleRoute, jsonOk } from '@/lib/route-helpers';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validators';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/change-password
 *
 * Body: { email }
 *
 * Sends a password-change link to the user's email. The link points to
 * /reset-password?token=... where they can set a new password. Uses the
 * same custom endpoint as forgot-password but with purpose='change' so
 * the email copy reflects "change" rather than "forgot".
 *
 * Always returns { sent: true } to prevent email enumeration.
 */
export async function POST(req: Request) {
  return handleRoute<ChangePasswordInput>(req, { schema: changePasswordSchema }, async (data) => {
    try {
      await fetch(`${DIRECTUS_URL}/password-reset-request/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, purpose: 'change' }),
        cache: 'no-store'
      });
    } catch (err) {
      // Log but never surface — prevent email enumeration.
      console.warn('[change-password] request failed:', (err as Error).message);
    }

    return jsonOk({ sent: true }, 200);
  });
}
