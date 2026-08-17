'use server';

import { updateItem } from '@directus/sdk';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createDirectus, rest } from '@directus/sdk';
import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { getCurrentUser } from '@/lib/auth-helpers';

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

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
}

export async function updateContactRequestStatus(id: number, status: 'unread' | 'read') {
  await requireAuth();

  try {
    const client = await getSessionClient();
    await client.request(updateItem('contact_requests' as any, id, { status }));

    revalidatePath('/[locale]/admin/contact-requests', 'layout');
    revalidatePath('/[locale]/admin/contact-requests/[id]', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update contact request status:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
