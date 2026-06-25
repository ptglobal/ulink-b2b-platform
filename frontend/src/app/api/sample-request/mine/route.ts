import { NextResponse } from 'next/server';
import { getCurrentUser, proxyToDirectus, getRequestCookieHeader } from '@/lib/auth-helpers';

/**
 * GET /api/sample-request/mine
 * List sample requests belonging to the currently authenticated user.
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const cookieHeader = getRequestCookieHeader(req);
    const response = await proxyToDirectus(
      `/items/sample_requests?fields=*&sort=-created_at,-id&filter[user][_eq]=${user.id}`,
      { method: 'GET', cookieHeader }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Directus sample_requests (mine) fetch failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'failed_to_fetch', message: 'Failed to fetch sample requests.' },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (err) {
    console.error('Sample request /mine GET handler failed:', err);
    return NextResponse.json(
      { error: 'internal_server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
