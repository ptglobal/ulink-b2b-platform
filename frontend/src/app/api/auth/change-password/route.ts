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
 * /change-password?token=... (the in-session 3-field form) so the same
 * page handles both "click from email" and "navigate from Settings"
 * flows. The actual change is performed when the user submits the
 * form on /change-password; this route only requests the email.
 *
 * Always returns { sent: true } to prevent email enumeration.
 */
export async function POST(req: Request) {
  return handleRoute<ChangePasswordInput>(req, { schema: changePasswordSchema }, async (data) => {
    try {
      await fetch(`${DIRECTUS_URL}/password-reset-request/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          purpose: 'change',
          // Override the default /reset-password redirect so the email
          // link lands on the /change-password form (3-field). The
          // Directus extension restricts redirect_path to a small
          // allowlist, so this value can't be hijacked.
          redirect_path: '/change-password'
        }),
        cache: 'no-store'
      });
    } catch (err) {
      // Log but never surface — prevent email enumeration.
      console.warn('[change-password] request failed:', (err as Error).message);
    }

    return jsonOk({ sent: true }, 200);
  });
}
