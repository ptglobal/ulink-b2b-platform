import { jsonOk, jsonErrorRaw } from '@/lib/route-helpers';
import { getRequestCookieHeader, extractSetCookie } from '@/lib/auth-helpers';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/refresh — refresh the Directus session cookie.
 *
 * Calls Directus /auth/refresh with the current cookie and forwards the new
 * Set-Cookie header back to the client. Useful for SPA pages that need a
 * fresh TTL after a long idle period.
 */
export async function POST(req: Request) {
  const cookieHeader = getRequestCookieHeader(req);
  if (!cookieHeader) {
    return jsonErrorRaw(401, 'unauthenticated', 'No active session.');
  }

  const res = await fetch(`${DIRECTUS_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      cookie: cookieHeader,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ mode: 'session' }),
    cache: 'no-store'
  });

  if (!res.ok) {
    return jsonErrorRaw(res.status, 'refresh_failed', 'Session refresh failed.');
  }

  const response = jsonOk({ ok: true });
  const setCookie = extractSetCookie(res);
  if (setCookie) response.headers.set('set-cookie', setCookie);
  return response;
}