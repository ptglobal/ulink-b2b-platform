import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createDirectus, readItems, rest } from '@directus/sdk';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { ContactRequestDetail } from '@/components/admin/contact-request-detail';
import type { ContactRequest } from '@/lib/directus';

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

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Chi tiết liên hệ | ULink Admin' };
}

export default async function AdminContactRequestDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  const requestId = Number(id);
  if (Number.isNaN(requestId)) {
    notFound();
  }

  let request: ContactRequest | null = null;

  try {
    const client = await getSessionClient();
    const items = (await client.request(
      readItems('contact_requests' as any, {
        filter: { id: { _eq: requestId } },
        fields: ['id', 'full_name', 'email', 'phone', 'subject', 'message', 'status', 'created_at'],
        limit: 1
      } as any)
    )) as ContactRequest[];
    request = items?.[0] ?? null;
  } catch (error) {
    console.error('Failed to load contact request detail:', error);
    notFound();
  }

  if (!request) {
    notFound();
  }

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background to-muted/30 min-h-screen">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-8 sm:gap-8 lg:px-16 lg:py-12">
        <ContactRequestDetail request={request} locale={locale} />
      </div>
    </section>
  );
}
