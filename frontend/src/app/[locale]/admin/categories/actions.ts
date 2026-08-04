'use server';

import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, updateItem, createItem } from '@directus/sdk';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { cookies } from 'next/headers';

/**
 * Helper: Định dạng thông điệp lỗi trả về từ Directus SDK.
 */
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

/**
 * Helper: Khởi tạo Directus client với session cookie
 */
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

/**
 * Check if the user is authenticated
 */
async function checkAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized. You must log in first.');
  }
}

/**
 * Action: Save (Create or Update) a Product Category.
 */
export async function saveCategory(data: {
  id?: number;
  name: string;
  slug: string;
  parent?: number | null;
  description?: string;
  status?: 'published' | 'draft' | 'archived';
}) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    const payload = {
      name: data.name,
      slug: data.slug,
      parent: data.parent || null,
      description: data.description || null,
      status: data.status || 'draft'
    };

    if (data.id) {
      await client.request(updateItem('product_categories', data.id, payload));
    } else {
      await client.request(createItem('product_categories', payload));
    }

    revalidatePath('/[locale]/admin/categories', 'layout');
    revalidatePath('/[locale]/products', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to save category:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * Action: Archive (Soft Delete) a Category.
 */
export async function deleteCategory(id: number) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    
    // Check if any active products are still using this category
    const { readItems } = await import('@directus/sdk');
    const productsUsing = await client.request(
      readItems('products', {
        filter: {
          category: { _eq: id },
          status: { _in: ['published', 'draft'] }
        },
        fields: ['id'],
        limit: 1
      } as any)
    );

    if (productsUsing && productsUsing.length > 0) {
      return {
        success: false,
        error: 'Không thể lưu trữ danh mục này vì đang có sản phẩm thuộc danh mục. Hãy chuyển sản phẩm sang danh mục khác trước.'
      };
    }

    // Set category status to archived
    await client.request(
      updateItem('product_categories', id, {
        status: 'archived'
      })
    );

    revalidatePath('/[locale]/admin/categories', 'layout');
    revalidatePath('/[locale]/products', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to delete category:', err);
    return { success: false, error: formatError(err) };
  }
}
