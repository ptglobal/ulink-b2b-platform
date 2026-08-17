'use server';

import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, updateItem, createItem, deleteItem } from '@directus/sdk';
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
        extensions: err.extensions
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
 * Action: Save (Create or Update) a Product Attribute.
 */
export async function saveAttribute(data: {
  id?: number;
  name: string;
  slug: string;
  sort?: number;
}) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    const payload = {
      name: data.name,
      slug: data.slug,
      sort: data.sort !== undefined ? data.sort : 1
    };

    if (data.id) {
      await client.request(updateItem('product_attributes' as any, data.id, payload));
    } else {
      await client.request(createItem('product_attributes' as any, payload));
    }

    revalidatePath('/[locale]/admin/attributes', 'layout');
    revalidatePath('/[locale]/admin/products', 'layout');
    revalidatePath('/[locale]/admin/skus', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to save attribute:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * Action: Delete a Product Attribute.
 */
export async function deleteAttribute(id: number) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    const { readItems } = await import('@directus/sdk');

    // 1. Check if assigned to any products
    const assigned = await client.request(
      readItems(
        'products_product_attributes' as any,
        {
          filter: { product_attributes_id: { _eq: id } },
          fields: ['id'],
          limit: 1
        } as any
      )
    );

    if (assigned && assigned.length > 0) {
      return {
        success: false,
        error:
          'Không thể xóa thuộc tính này vì đang được gán cho một hoặc nhiều sản phẩm. Hãy bỏ gán khỏi sản phẩm trước.'
      };
    }

    // 2. Delete attribute
    await client.request(deleteItem('product_attributes' as any, id));

    revalidatePath('/[locale]/admin/attributes', 'layout');
    revalidatePath('/[locale]/admin/products', 'layout');
    revalidatePath('/[locale]/admin/skus', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to delete attribute:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * Action: Save (Create or Update) an Attribute Option.
 */
export async function saveAttributeOption(data: {
  id?: number;
  attributeId: number;
  value: string;
  sku_suffix: string;
  sort?: number;
}) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    const payload = {
      attribute: data.attributeId,
      value: data.value,
      sku_suffix: data.sku_suffix.toUpperCase().replace(/\s+/g, ''),
      sort: data.sort !== undefined ? data.sort : 1
    };

    if (data.id) {
      await client.request(updateItem('product_attribute_options' as any, data.id, payload));
    } else {
      await client.request(createItem('product_attribute_options' as any, payload));
    }

    revalidatePath('/[locale]/admin/attributes', 'layout');
    revalidatePath('/[locale]/admin/skus', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to save attribute option:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * Action: Delete an Attribute Option.
 */
export async function deleteAttributeOption(id: number) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    const { readItems } = await import('@directus/sdk');

    // 1. Fetch the option details to get value & attribute slug
    const option = (await client.request(
      readItems(
        'product_attribute_options' as any,
        {
          filter: { id: { _eq: id } },
          fields: ['id', 'value', 'attribute.slug'],
          limit: 1
        } as any
      )
    )) as any[];

    if (!option || option.length === 0) {
      return { success: false, error: 'Tùy chọn không tồn tại.' };
    }

    const optVal = option[0].value;
    const attrSlug = option[0].attribute?.slug;

    // 2. Check if any SKUs are currently using this option value
    if (attrSlug) {
      const skus = (await client.request(
        readItems(
          'product_skus' as any,
          {
            filter: { status: { _in: ['published', 'draft'] } },
            fields: ['id', 'sku_code', 'attributes'],
            limit: -1
          } as any
        )
      )) as any[];

      const inUse = skus.some((sku: any) => {
        if (!sku.attributes || typeof sku.attributes !== 'object') return false;
        return sku.attributes[attrSlug] === optVal;
      });

      if (inUse) {
        return {
          success: false,
          error: `Không thể xóa tùy chọn này vì giá trị "${optVal}" đang được sử dụng bởi các SKU. Hãy xóa hoặc cập nhật các SKU liên quan trước.`
        };
      }
    }

    // 3. Delete option
    await client.request(deleteItem('product_attribute_options' as any, id));

    revalidatePath('/[locale]/admin/attributes', 'layout');
    revalidatePath('/[locale]/admin/skus', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to delete attribute option:', err);
    return { success: false, error: formatError(err) };
  }
}
