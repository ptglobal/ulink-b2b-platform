import React from 'react';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, readItems } from '@directus/sdk';
import { cookies } from 'next/headers';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { HubsClient } from '@/components/admin/hubs-client';

async function getSessionClient() {
  const store = await cookies();
  const sessionToken = store.get('directus_session_token')?.value;
  const refreshToken = store.get('directus_refresh_token')?.value;

  if (sessionToken) {
    const cookieHeader = [
      `directus_session_token=${sessionToken}`,
      refreshToken ? `directus_refresh_token=${refreshToken}` : null,
    ].filter(Boolean).join('; ');

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

export default async function AdminHubsPage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Check Auth
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  let hubs: any[] = [];
  let provinces: any[] = [];
  let error: string | undefined;

  try {
    const client = await getSessionClient();

    // 2. Fetch Regional Hubs and Provinces in parallel
    const [hubsRes, provincesRes] = await Promise.all([
      client.request(
        readItems('regional_hubs' as any, {
          fields: [
            'id',
            'status',
            'hub_code',
            'name',
            'slug',
            'province.id',
            'province.name',
            'detail_address',
            'operating_status',
            'coordinates',
            'warehouse_total_area',
            'warehouse_utilized_area',
            'warehouse_available_area',
            'warehouse_storage_tons',
            'warehouse_pallets',
            'standard_delivery_time',
            'on_time_rate',
            'orders_today'
          ] as any,
          sort: ['id'],
          limit: -1
        } as any)
      ),
      client.request(
        readItems('vn_provinces' as any, {
          fields: ['id', 'name', 'abbr'],
          sort: ['name'],
          limit: -1
        } as any)
      )
    ]);

    hubs = hubsRes || [];
    provinces = provincesRes || [];
  } catch (err) {
    console.error('Failed to load regional hubs in admin panel:', err);
    try {
      error = JSON.stringify(err, null, 2);
    } catch {
      error = String(err);
    }
  }

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      <HubsClient
        initialHubs={hubs}
        provinces={provinces}
        error={error}
      />
    </div>
  );
}
