import React from 'react';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, readItems } from '@directus/sdk';
import { cookies } from 'next/headers';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { AttributesClient } from '@/components/admin/attributes-client';

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

export default async function AdminAttributesPage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Authenticate user
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  let attributes: any[] = [];
  let error: string | undefined;
  try {
    const client = await getSessionClient();
    // 2. Fetch attributes & options
    const res = await client.request(
      readItems('product_attributes' as any, {
        fields: [
          'id',
          'name',
          'slug',
          'sort',
          'options.id',
          'options.value',
          'options.sku_suffix',
          'options.sort'
        ],
        sort: ['sort', 'name'],
        limit: -1
      } as any)
    );
    attributes = res || [];
  } catch (err) {
    console.error('Failed to load attributes in admin dashboard:', err);
    try {
      error = JSON.stringify(err, null, 2);
    } catch {
      error = String(err);
    }
  }

  return <AttributesClient initialAttributes={attributes} error={error} />;
}
