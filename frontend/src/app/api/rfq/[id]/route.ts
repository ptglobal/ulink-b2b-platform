import { NextResponse } from 'next/server';
import { proxyToDirectus, getRequestCookieHeader, getCurrentUser } from '@/lib/auth-helpers';

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
        { error: 'bad_request', message: 'Missing RFQ ID.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const cookieHeader = getRequestCookieHeader(req);

    const response = await proxyToDirectus(`/items/rfq_requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cookieHeader
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Directus rfq patch failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'failed_to_update_rfq', message: 'Failed to update RFQ in Directus.' },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (err) {
    console.error('RFQ PATCH handler failed:', err);
    return NextResponse.json(
      { error: 'internal_server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
