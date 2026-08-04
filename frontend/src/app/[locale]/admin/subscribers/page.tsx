import React from 'react';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, readItems } from '@directus/sdk';
import { cookies } from 'next/headers';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { SubscribersClient } from '@/components/admin/subscribers-client';

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

export default async function AdminSubscribersPage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Check Auth
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  let subscribers: any[] = [];
  let error: string | undefined;

  try {
    const client = await getSessionClient();

    // 2. Fetch Newsletter Subscribers
    const res = await client.request(
      readItems('newsletter_subscribers' as any, {
        fields: ['id', 'email', 'status', 'created_at'] as any,
        sort: ['-id'],
        limit: -1
      } as any)
    );

    subscribers = res || [];
  } catch (err) {
    console.error('Failed to load newsletter subscribers in admin panel:', err);
    try {
      error = JSON.stringify(err, null, 2);
    } catch {
      error = String(err);
    }
  }

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      <SubscribersClient
        initialSubscribers={subscribers}
        error={error}
      />
    </div>
  );
}
