import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { createDirectus, readItems, rest } from '@directus/sdk';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { ContactRequestsClient } from '@/components/admin/contact-requests-client';

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

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Liên hệ gửi về | ULink Admin' };
}

export default async function AdminContactRequestsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  let requests: any[] = [];
  let error: string | undefined;

  try {
    const client = await getSessionClient();
    const res = await client.request(
      readItems('contact_requests' as any, {
        fields: ['id', 'full_name', 'email', 'phone', 'subject', 'message', 'status', 'created_at'],
        sort: ['-created_at', '-id'],
        limit: -1
      } as any)
    );

    requests = res || [];
  } catch (err) {
    console.error('Failed to load contact requests in admin panel:', err);
    try {
      error = JSON.stringify(err, null, 2);
    } catch {
      error = String(err);
    }
  }

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      <ContactRequestsClient initialRequests={requests} error={error} />
    </div>
  );
}
