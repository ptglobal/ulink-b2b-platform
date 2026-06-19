import { jsonOk } from '@/lib/route-helpers';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export async function POST(req: Request) {
  // Forward logout request to Directus — lấy cookie từ client request
  const cookie = req.headers.get('cookie') ?? '';

  // Directus returns Set-Cookie headers that clear both the session token
  // and the refresh token. Forward those so the browser actually drops the
  // refresh token too — without this, a logged-out user still holds a
  // (now-dead) refresh_token cookie, which is at best confusing and at worst
  // exploitable if Directus's session cleanup ever lags.
  let upstreamSetCookie: string | null = null;
  try {
    const upstream = await fetch(`${DIRECTUS_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie
      },
      body: JSON.stringify({ mode: 'session' })
    });
    upstreamSetCookie = upstream.headers.get('set-cookie');
  } catch {
    /* Bỏ qua lỗi mạng khi logout */
  }

  // Build a response that clears both Directus cookies. Directus's
  // Set-Cookie clears them already, but we layer our own Max-Age=0 entries
  // on top so the browser ALWAYS ends up with empty cookies regardless of
  // whether the upstream call succeeded or was silently swallowed.
  const response = jsonOk({ ok: true });
  const expires = 'Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
  const clearCookies = [
    `directus_session_token=; ${expires}`,
    `directus_refresh_token=; ${expires}`
  ];
  response.headers.set('set-cookie', upstreamSetCookie
    ? `${upstreamSetCookie}, ${clearCookies.join(', ')}`
    : clearCookies.join(', '));
  return response;
}
