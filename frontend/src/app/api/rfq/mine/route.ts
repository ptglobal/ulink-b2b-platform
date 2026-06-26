import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient } from '@/lib/directus';
import { readItems } from '@directus/sdk';

export const dynamic = 'force-dynamic';

/**
 * GET /api/rfq/mine
 * List RFQ requests belonging to the currently authenticated user.
 * Uses admin token to bypass role-based permission issues.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const directus = createWriteDirectusClient();
    const data = await directus.request(
      readItems('rfq_requests', {
        fields: [
          'id',
          'company',
          'contact_name',
          'email',
          'phone',
          { hub: ['id', 'name'] },
          'industry',
          'message',
          'line_items',
          'status',
          'source',
          'scheduled_delivery',
          'requested_delivery_date',
          'date_created' as never,
          'approval_note',
          'reject_reason'
        ],
        filter: {
          user: { _eq: user.id }
        },
        sort: ['-date_created', '-id'] as never
      })
    );

    return NextResponse.json({ data });
  } catch (err) {
    console.error('RFQ /mine GET handler failed:', err);
    return NextResponse.json(
      { error: 'internal_server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
