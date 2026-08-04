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
        extensions: err.extensions,
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

async function checkAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized. You must log in first.');
  }
}

export async function saveHub(data: {
  id?: number;
  status: 'published' | 'draft' | 'archived';
  hub_code: string;
  name: string;
  slug: string;
  provinceId: number;
  detail_address: string;
  operating_status: 'active' | 'stopped' | 'maintenance' | 'full' | 'temporarily_closed';
  coordinates?: string | null;
  // Warehouse
  warehouse_total_area?: number | null;
  warehouse_utilized_area?: number | null;
  warehouse_available_area?: number | null;
  warehouse_storage_tons?: number | null;
  warehouse_pallets?: number | null;
  // SLA
  standard_delivery_time?: string | null;
  on_time_rate?: number | null;
  orders_today?: number | null;
}) {
  await checkAuth();

  try {
    const client = await getSessionClient();

    const payload: Record<string, any> = {
      status: data.status,
      hub_code: data.hub_code,
      name: data.name,
      slug: data.slug,
      province: data.provinceId,
      detail_address: data.detail_address,
      operating_status: data.operating_status,
      coordinates: data.coordinates || null,
      warehouse_total_area: data.warehouse_total_area !== undefined ? data.warehouse_total_area : null,
      warehouse_utilized_area: data.warehouse_utilized_area !== undefined ? data.warehouse_utilized_area : null,
      warehouse_available_area: data.warehouse_available_area !== undefined ? data.warehouse_available_area : null,
      warehouse_storage_tons: data.warehouse_storage_tons !== undefined ? data.warehouse_storage_tons : null,
      warehouse_pallets: data.warehouse_pallets !== undefined ? data.warehouse_pallets : null,
      standard_delivery_time: data.standard_delivery_time || null,
      on_time_rate: data.on_time_rate !== undefined ? data.on_time_rate : null,
      orders_today: data.orders_today !== undefined ? data.orders_today : null
    };

    if (data.id) {
      await client.request(updateItem('regional_hubs' as any, data.id, payload));
    } else {
      await client.request(createItem('regional_hubs' as any, payload));
    }

    revalidatePath('/[locale]/admin/hubs', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to save regional hub:', err);
    return { success: false, error: formatError(err) };
  }
}

export async function deleteHub(id: number) {
  await checkAuth();

  try {
    const client = await getSessionClient();

    await client.request(deleteItem('regional_hubs' as any, id));

    revalidatePath('/[locale]/admin/hubs', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to delete regional hub:', err);
    return { success: false, error: formatError(err) };
  }
}
