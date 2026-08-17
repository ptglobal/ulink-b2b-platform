'use server';

import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, createItem, updateItem, deleteItem } from '@directus/sdk';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { cookies } from 'next/headers';

function formatError(err: any): string {
  if (err && typeof err === 'object') {
    try {
      const errorObj = {
        message: err.message,
        errors: err.errors,
        status: err.status,
        code: err.code,
        extensions: err.extensions
      };
      return JSON.stringify(errorObj, null, 2);
    } catch {
      return String(err);
    }
  }
  return String(err);
}

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

async function checkAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized. You must log in first.');
  }
}

export async function saveSubscriber(data: {
  id?: number;
  email: string;
  status: 'active' | 'inactive';
}) {
  await checkAuth();

  try {
    const client = await getSessionClient();

    const payload: Record<string, any> = {
      email: data.email,
      status: data.status
    };

    if (data.id) {
      await client.request(updateItem('newsletter_subscribers' as any, data.id, payload));
    } else {
      await client.request(createItem('newsletter_subscribers' as any, payload));
    }

    revalidatePath('/[locale]/admin/subscribers', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to save newsletter subscriber:', err);
    return { success: false, error: formatError(err) };
  }
}

export async function deleteSubscriber(id: number) {
  await checkAuth();

  try {
    const client = await getSessionClient();

    await client.request(deleteItem('newsletter_subscribers' as any, id));

    revalidatePath('/[locale]/admin/subscribers', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to delete newsletter subscriber:', err);
    return { success: false, error: formatError(err) };
  }
}
