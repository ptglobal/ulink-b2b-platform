import React from 'react';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, readItems, readUsers } from '@directus/sdk';
import { cookies } from 'next/headers';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { RfqsClient } from '@/components/admin/rfqs-client';

async function getSessionClient() {
  const store = await cookies();
  const sessionToken = store.get('directus_session_token')?.value;
  const refreshToken = store.get('directus_refresh_token')?.value;

  if (sessionToken) {
    const cookieHeader = [
      `directus_session_token=${sessionToken}`,
      refreshToken ? `directus_refresh_token=${refreshToken}` : null
    ]
      .filter(Boolean)
      .join('; ');

    const cookieFetch: typeof globalThis.fetch = (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set('cookie', cookieHeader);
      return globalThis.fetch(input, { ...init, headers });
    };

    const url = getDirectusUrl();
    return createDirectus<Schema>(url, { globals: { fetch: cookieFetch } }).with(rest());
  }

  return createWriteDirectusClient();
}

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminRfqsPage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Authenticate user
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  let rfqs: any[] = [];
  let salesTeam: any[] = [];
  let hubs: any[] = [];
  let skus: any[] = [];
  let error: string | undefined;

  try {
    const client = await getSessionClient();

    // 2. Fetch RFQ Requests, Sales team, Hubs and SKUs in parallel
    const [rfqsRes, salesRes, hubsRes, skusRes] = await Promise.all([
      client.request(
        readItems(
          'rfq_requests' as any,
          {
            fields: [
              'id',
              'company',
              'contact_name',
              'email',
              'phone',
              'address',
              'industry',
              'message',
              'status',
              'approval_note',
              'reject_reason',
              'source',
              'scheduled_delivery',
              'requested_delivery_date',
              'created_at',
              'line_items',
              'hub.id',
              'hub.name',
              'assigned_sales.id',
              'assigned_sales.first_name',
              'assigned_sales.last_name'
            ],
            sort: ['-id'],
            limit: -1
          } as any
        )
      ),
      client.request(
        readUsers({
          filter: {
            role: { _eq: 'e11b0e50-2020-410c-9999-000000000002' } // SALES_ROLE_ID
          },
          fields: ['id', 'first_name', 'last_name', 'email'],
          limit: -1
        })
      ),
      client.request(
        readItems(
          'regional_hubs' as any,
          {
            fields: ['id', 'name'],
            sort: ['name'],
            limit: -1
          } as any
        )
      ),
      client.request(
        readItems(
          'product_skus' as any,
          {
            filter: { status: { _in: ['published', 'draft'] } },
            fields: ['id', 'sku_code'],
            sort: ['sku_code'],
            limit: -1
          } as any
        )
      )
    ]);

    rfqs = rfqsRes || [];
    salesTeam = salesRes || [];
    hubs = hubsRes || [];
    skus = skusRes || [];
  } catch (err) {
    console.error('Failed to load RFQs in admin dashboard:', err);
    try {
      error = JSON.stringify(err, null, 2);
    } catch {
      error = String(err);
    }
  }

  return (
    <RfqsClient initialRfqs={rfqs} salesTeam={salesTeam} hubs={hubs} skus={skus} error={error} />
  );
}
