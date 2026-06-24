import { NextResponse } from 'next/server';
import { createItem, readItems } from '@directus/sdk';

import { createWriteDirectusClient } from '@/lib/directus';
import { getCurrentUser, proxyToDirectus, getRequestCookieHeader } from '@/lib/auth-helpers';
import { handleRoute, jsonCreated, jsonErrorRaw } from '@/lib/route-helpers';
import { sampleRequestSchema, type SampleRequestInput } from '@/lib/validators';

/**
 * POST /api/sample-request
 * Create a new sample request. Works for both visitors and authenticated users.
 */
export async function POST(req: Request) {
  return handleRoute<SampleRequestInput>(req, { schema: sampleRequestSchema }, async (data) => {
    const user = await getCurrentUser();

    try {
      const writeDirectus = createWriteDirectusClient();
      const created = await writeDirectus.request(
        createItem('sample_requests', {
          contact_name: data.contact_name,
          email: data.email,
          company: data.company,
          phone: data.phone,
          province: data.province,
          district: data.district,
          address_detail: data.address_detail,
          product_slug: data.product_slug,
          skus: data.skus,
          message: data.message ?? null,
          status: 'pending',
          user: user?.id ?? null
        })
      );

      return jsonCreated({ id: (created as { id: number | string }).id });
    } catch (err) {
      console.error('Sample request creation failed:', err);
      return jsonErrorRaw(502, 'bad_gateway', 'Failed to create sample request.');
    }
  });
}

/**
 * GET /api/sample-request
 * List all sample requests. Requires authentication (admin).
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
      '/items/sample_requests?fields=*&sort=-created_at,-id',
      { method: 'GET', cookieHeader }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Directus sample_requests fetch failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'failed_to_fetch', message: 'Failed to fetch sample requests.' },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (err) {
    console.error('Sample request GET handler failed:', err);
    return NextResponse.json(
      { error: 'internal_server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
