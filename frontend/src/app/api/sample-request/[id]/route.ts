import { NextResponse } from 'next/server';
import { proxyToDirectus, getRequestCookieHeader, getCurrentUser } from '@/lib/auth-helpers';

/**
 * GET /api/sample-request/[id]
 * Fetch a single sample request by ID. Requires authentication.
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

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'bad_request', message: 'Missing sample request ID.' },
        { status: 400 }
      );
    }

    const cookieHeader = getRequestCookieHeader(req);
    const response = await proxyToDirectus(`/items/sample_requests/${id}`, {
      method: 'GET',
      cookieHeader
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Directus sample request fetch failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'failed_to_fetch', message: 'Failed to fetch sample request.' },
        { status: response.status }
      );
    }

    const payload = await response.json();
    if (payload && payload.data) {
      payload.data.date_created = payload.data.created_at;
    }
    return NextResponse.json(payload);
  } catch (err) {
    console.error('Sample request GET [id] handler failed:', err);
    return NextResponse.json(
      { error: 'internal_server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sample-request/[id]
 * Update a sample request (approve/reject). Requires authentication.
 * Body: { status: 'approved'|'rejected', approval_note?: string, reject_reason?: string }
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'bad_request', message: 'Missing sample request ID.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const cookieHeader = getRequestCookieHeader(req);

    const response = await proxyToDirectus(`/items/sample_requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cookieHeader
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Directus sample request patch failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'failed_to_update', message: 'Failed to update sample request.' },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (err) {
    console.error('Sample request PATCH handler failed:', err);
    return NextResponse.json(
      { error: 'internal_server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
