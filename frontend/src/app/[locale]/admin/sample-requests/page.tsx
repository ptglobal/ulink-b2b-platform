import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, readItems, readUsers } from '@directus/sdk';
import { cookies } from 'next/headers';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { SampleRequestsClient } from '@/components/admin/sample-requests-client';

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'sampleRequest.admin' });
  return { title: t('listTitle') };
}

export default async function SampleRequestsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  // 1. Check Auth
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  let requests: any[] = [];
  let salesTeam: any[] = [];
  let skus: any[] = [];
  let error: string | undefined;

  try {
    const client = await getSessionClient();

    // 2. Fetch Sample Requests, Sales, and SKUs in parallel
    const [requestsRes, salesRes, skusRes] = await Promise.all([
      client.request(
        readItems('sample_requests' as any, {
          fields: [
            'id',
            'contact_name',
            'email',
            'company',
            'phone',
            'province',
            'district',
            'address_detail',
            'product_slug',
            'skus',
            'message',
            'status',
            'approval_note',
            'reject_reason',
            'assigned_sales.id',
            'assigned_sales.first_name',
            'assigned_sales.last_name',
            'created_at'
          ],
          sort: ['-id'],
          limit: -1
        } as any)
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
        readItems('product_skus' as any, {
          filter: { status: { _in: ['published', 'draft'] } },
          fields: ['id', 'sku_code'],
          sort: ['sku_code'],
          limit: -1
        } as any)
      )
    ]);

    requests = requestsRes || [];
    salesTeam = salesRes || [];
    skus = skusRes || [];
  } catch (err) {
    console.error('Failed to load sample requests in admin panel:', err);
    try {
      error = JSON.stringify(err, null, 2);
    } catch {
      error = String(err);
    }
  }

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      <SampleRequestsClient
        initialRequests={requests}
        salesTeam={salesTeam}
        skus={skus}
        locale={locale}
        error={error}
      />
    </div>
  );
}
