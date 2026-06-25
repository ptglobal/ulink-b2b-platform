import { NextResponse } from 'next/server';
import { getCurrentUser, proxyToDirectus, getRequestCookieHeader } from '@/lib/auth-helpers';

/**
 * GET /api/sample-request/mine/[id]
 * Get a single sample request belonging to the authenticated user.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
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
      `/items/sample_requests/${params.id}?fields=*`,
      { method: 'GET', cookieHeader }
    );

    if (!response.ok) {
      if (response.status === 403 || response.status === 404) {
        return NextResponse.json(
          { error: 'not_found', message: 'Sample request not found.' },
          { status: 404 }
        );
      }
      const errorText = await response.text();
      console.error('Directus sample_request fetch failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'failed_to_fetch', message: 'Failed to fetch sample request.' },
        { status: response.status }
      );
    }

    const payload = await response.json();
    const item = payload.data;

    // Verify ownership — user can only view their own requests
    const itemUserId = typeof item?.user === 'object' ? item.user?.id : item?.user;
    if (String(itemUserId) !== String(user.id)) {
      return NextResponse.json(
        { error: 'not_found', message: 'Sample request not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: item });
  } catch (err) {
    console.error('Sample request /mine/[id] GET handler failed:', err);
    return NextResponse.json(
      { error: 'internal_server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
