import { jsonOk, jsonErrorRaw } from '@/lib/route-helpers';
import { getCurrentUser } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me — return the currently authenticated user, or 401.
 *
 * Server components and client code use this to detect whether the user is
 * signed in. The session cookie is forwarded directly to Directus /users/me
 * so we don't need any local session storage.
 */
export async function GET(_req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonErrorRaw(401, 'unauthenticated', 'No active session.');
  }
  return jsonOk({ data: user });
}
