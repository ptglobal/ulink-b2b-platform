/**
 * Server-side auth helpers — read the Directus session cookie from the
 * incoming request, call Directus /users/me, and return a normalized
 * user shape (or null when unauthenticated).
 *
 * These helpers are used by:
 *   - Server components that need to render different UI for logged-in users.
 *   - Server actions and route handlers that need the current user id.
 *
 * They NEVER throw on missing/invalid session — callers should treat `null`
 * as "anonymous" and respond accordingly.
 */
import { cookies } from 'next/headers';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const SESSION_COOKIE = 'directus_session_token';
const REFRESH_COOKIE = 'directus_refresh_token';
const CUSTOMER_ROLE_ID =
  process.env.DIRECTUS_CUSTOMER_ROLE_ID ?? 'e11b0e50-3030-410c-9999-000000000003';

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  status?: string | null;
  customer_id?: string | number | null;
}

interface DirectusMe {
  data?: {
    id: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    role?: string | { id: string } | null;
    status?: string;
  };
}

/**
 * Read the current user from the session cookie, calling Directus /users/me
 * with the same cookie. Returns null for any unauthenticated / invalid case.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  let cookieHeader = '';
  try {
    // `cookies()` is the Next.js App Router API for reading request cookies
    // on the server. It throws outside of a request scope, so we guard.
    const store = await cookies();
    const session = store.get(SESSION_COOKIE)?.value;
    const refresh = store.get(REFRESH_COOKIE)?.value;
    if (!session && !refresh) return null;
    cookieHeader = [
      session ? `${SESSION_COOKIE}=${session}` : null,
      refresh ? `${REFRESH_COOKIE}=${refresh}` : null
    ]
      .filter(Boolean)
      .join('; ');
  } catch {
    return null;
  }

  try {
    const res = await fetch(`${DIRECTUS_URL}/users/me?fields=id,email,first_name,last_name,role,status`, {
      headers: { cookie: cookieHeader },
      // We do NOT cache this — the user shape can change at any time.
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = (await res.json()) as DirectusMe;
    if (!json?.data?.id) return null;
    const u = json.data;
    const role = typeof u.role === 'string' ? u.role : (u.role?.id ?? null);
    if (role !== CUSTOMER_ROLE_ID) return null;
    return {
      id: u.id,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      role,
      status: u.status
    };
  } catch {
    return null;
  }
}

/**
 * Forward a Request's cookies to Directus and return the upstream Response.
 * Used by route handlers that need to call Directus on behalf of the user
 * (e.g. /auth/refresh, /users/me, /password-change/change). Cookies flow
 * upstream; Set-Cookie headers from Directus are returned to the caller via
 * the `extractSetCookie` helper.
 */
export async function proxyToDirectus(
  path: string,
  init: RequestInit & { cookieHeader?: string } = {}
): Promise<Response> {
  const cookieHeader = init.cookieHeader ?? '';
  const headers = new Headers(init.headers);
  if (cookieHeader) headers.set('cookie', cookieHeader);
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  return fetch(`${DIRECTUS_URL}${path}`, {
    ...init,
    headers,
    body: typeof init.body === 'string' || init.body instanceof Uint8Array ? init.body : undefined
  });
}

/** Read all relevant session cookies off a Request into a `Cookie` header. */
export function getRequestCookieHeader(req: Request): string {
  return req.headers.get('cookie') ?? '';
}

/** Pull the Set-Cookie header(s) off a Directus Response. */
export function extractSetCookie(res: Response): string | null {
  return res.headers.get('set-cookie');
}
