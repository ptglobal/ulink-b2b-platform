import { NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/reset-password/status
 *
 * Body: { token }
 *
 * Peeks the reset token to resolve the email, then checks the shared
 * lockout state. Returns { locked, lockedUntil, ttlSeconds, remaining }
 * so the form can show the lockout banner immediately on mount — without
 * the user having to submit a wrong password first.
 *
 * Always returns 200 (even on invalid token) to avoid leaking info.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { token?: string };
    const token = body?.token;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ data: { locked: false } });
    }

    // 1. Peek token to resolve email
    let email: string | null = null;
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

    if (!email) {
      return NextResponse.json({ data: { locked: false } });
    }

    // 2. Check shared lockout status
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
