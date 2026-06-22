import { NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/change-password/status
 *
 * Body: { token? }
 *
 * Checks the shared lockout state for the change-password surface.
 * Works in two modes:
 *   - Token mode (body has `token`): peeks the token to resolve email
 *   - Session mode (no token): uses the session cookie to identify user
 *
 * Returns { locked, lockedUntil, ttlSeconds, remaining } so the form can
 * show the lockout banner immediately on mount.
 *
 * Always returns 200 to avoid leaking info.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { token?: string };
    const token = body?.token;

    let email: string | null = null;

    if (token && typeof token === 'string') {
      // Token mode: peek the token to resolve email
      try {
        const peekRes = await fetch(`${DIRECTUS_URL}/password-reset-request/peek`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
          cache: 'no-store'
        });
        if (peekRes.ok) {
          const peekJson = (await peekRes.json().catch(() => ({}))) as {
            data?: { valid?: boolean; email?: string };
          };
          if (peekJson?.data?.valid && peekJson.data.email) {
            email = peekJson.data.email;
          }
        }
      } catch { /* non-fatal */ }
    } else {
      // Session mode: identify via cookie
      const cookieHeader = req.headers.get('cookie') ?? '';
      try {
        const meRes = await fetch(`${DIRECTUS_URL}/users/me`, {
          headers: { cookie: cookieHeader },
          cache: 'no-store'
        });
        if (meRes.ok) {
          const meJson = (await meRes.json().catch(() => ({}))) as {
            data?: { email?: string };
          };
          if (typeof meJson?.data?.email === 'string') {
            email = meJson.data.email;
          }
        }
      } catch { /* non-fatal */ }
    }

    if (!email) {
      return NextResponse.json({ data: { locked: false } });
    }

    // Check shared lockout status
    try {
      const statusRes = await fetch(
        `${DIRECTUS_URL}/password-reset-request/password-change/status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
          cache: 'no-store'
        }
      );
      if (statusRes.ok) {
        const statusJson = (await statusRes.json().catch(() => ({}))) as {
          data?: {
            locked?: boolean;
            lockedUntil?: number;
            ttlSeconds?: number;
            remaining?: number;
            attempts?: number;
          };
        };
        if (statusJson?.data) {
          return NextResponse.json({ data: statusJson.data });
        }
      }
    } catch { /* non-fatal */ }

    return NextResponse.json({ data: { locked: false } });
  } catch {
    return NextResponse.json({ data: { locked: false } });
  }
}
