'use server';

import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, updateItem, createItem, deleteItem } from '@directus/sdk';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { cookies } from 'next/headers';

function formatError(err: any): string {
  if (err && typeof err === 'object') {
    // Trích xuất và stringify toàn bộ thông tin lỗi gốc để dễ debug trên giao diện
    try {
      const errorObj = {
        message: err.message,
        errors: err.errors,
        status: err.status,
        code: err.code,
        extensions: err.extensions,
        stack: err.stack
      };
      return JSON.stringify(errorObj, null, 2);
    } catch {
      return String(err);
    }
  }
  return String(err);
}

/**
 * Helper: Khởi tạo Directus client sử dụng trực tiếp session cookie của
 * người dùng đang đăng nhập. Directus sẽ xác thực và phân quyền theo đúng
 * vai trò thực tế của tài khoản đó (Admin, Editor, Sales...).
 * Fallback về static token Frontend Service nếu không có session.
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
 * Verifies that the current user is logged in before executing actions.
 */
async function checkAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized. You must log in first.');
  }
}

/**
 * Action: Update the stock status of a specific SKU.
 */
export async function updateSkuStock(skuId: number, stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock') {
  await checkAuth();

  try {
    const client = await getSessionClient();
    await client.request(
      updateItem('product_skus', skuId, {
        stock_status: stockStatus
      })
    );

    revalidatePath('/[locale]/products', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to update SKU stock status:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * Action: Delete/Archive a product.
 */
export async function deleteProduct(productId: number) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    // Instead of deleting from DB, we transition status to archived for safety.
    await client.request(
      updateItem('products', productId, {
        status: 'archived'
      })
    );

    revalidatePath('/[locale]/products', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to archive product:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * Action: Save (Create or Update) a Product.
 */
export async function saveProduct(data: {
  id?: number;
  name: string;
  slug: string;
  brand?: string;
  categoryId?: number;
  short_description?: string;
  specifications?: Record<string, string>;
  status?: 'published' | 'draft' | 'archived';
  assignedAttributeIds?: number[];
}) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    const payload = {
      name: data.name,
      slug: data.slug,
      brand: data.brand || null,
      category: data.categoryId || null,
      short_description: data.short_description || null,
      specifications: data.specifications || null,
      status: data.status || 'draft'
    };

    let productId: number;

    if (data.id) {
      await client.request(updateItem('products', data.id, payload));
      productId = data.id;
    } else {
      const created = await client.request(createItem('products', payload));
      productId = (created as any).id;
    }

    // Sync M2M attribute assignments if provided
    if (data.assignedAttributeIds !== undefined) {
      // 1. Fetch current assignments with attribute slug
      const { readItems } = await import('@directus/sdk');
      const existing = await client.request(
        readItems('products_product_attributes' as any, {
          filter: { products_id: { _eq: productId } },
          fields: ['id', 'product_attributes_id'],
          limit: -1
        } as any)
      ) as any[];

      const existingAttrIds = new Set(existing.map((e: any) => e.product_attributes_id));
      const desiredAttrIds = new Set(data.assignedAttributeIds);

      // 2. Check if any attributes being removed are in use by existing SKUs
      const toDelete = existing.filter((e: any) => !desiredAttrIds.has(e.product_attributes_id));

      if (toDelete.length > 0) {
        // Fetch attribute slugs for the ones being removed
        const removedAttrIds = toDelete.map((e: any) => e.product_attributes_id);
        const attrs = await client.request(
          readItems('product_attributes' as any, {
            filter: { id: { _in: removedAttrIds } },
            fields: ['id', 'name', 'slug'],
            limit: -1
          } as any)
        ) as any[];
        const attrSlugMap = new Map(attrs.map((a: any) => [a.id, { name: a.name, slug: a.slug }]));

        // Fetch SKUs of this product that have attributes JSON
        const skus = await client.request(
          readItems('product_skus' as any, {
            filter: {
              product: { _eq: productId },
              status: { _in: ['published', 'draft'] }
            },
            fields: ['id', 'sku_code', 'attributes'],
            limit: -1
          } as any)
        ) as any[];

        // Check which removed attributes are still referenced in SKU attributes JSON
        const conflicting: string[] = [];
        for (const delItem of toDelete) {
          const attrInfo = attrSlugMap.get(delItem.product_attributes_id);
          if (!attrInfo) continue;

          const inUse = skus.some((sku: any) => {
            if (!sku.attributes || typeof sku.attributes !== 'object') return false;
            return Object.prototype.hasOwnProperty.call(sku.attributes, attrInfo.slug);
          });

          if (inUse) {
            conflicting.push(attrInfo.name);
          }
        }

        if (conflicting.length > 0) {
          return {
            success: false,
            error: `Không thể bỏ thuộc tính "${conflicting.join('", "')}" vì đang được sử dụng bởi các SKU. Hãy xóa các SKU liên quan trước.`
          };
        }

        // Safe to delete — no SKUs reference these attributes
        for (const item of toDelete) {
          await client.request(deleteItem('products_product_attributes' as any, item.id));
        }
      }

      // 3. Create new assignments
      const toCreate = data.assignedAttributeIds.filter((id) => !existingAttrIds.has(id));
      for (const attrId of toCreate) {
        await client.request(createItem('products_product_attributes' as any, {
          products_id: productId,
          product_attributes_id: attrId
        }));
      }
    }

    revalidatePath('/[locale]/products', 'layout');
    revalidatePath('/[locale]/admin/skus', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to save product:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * Action: Save (Create or Update) a SKU.
 */
export async function saveSku(data: {
  id?: number;
  sku_code: string;
  productId: number;
  unit?: string;
  pack_size?: string;
  attributes?: Record<string, string>;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  status?: 'published' | 'draft' | 'archived';
}) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    const payload = {
      sku_code: data.sku_code,
      product: data.productId,
      unit: data.unit || null,
      pack_size: data.pack_size || null,
      attributes: data.attributes || null,
      stock_status: data.stock_status || 'in_stock',
      status: data.status || 'published'
    };

    if (data.id) {
      await client.request(updateItem('product_skus', data.id, payload));
    } else {
      await client.request(createItem('product_skus', payload));
    }

    revalidatePath('/[locale]/products', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to save SKU:', err);
    return { success: false, error: formatError(err) };
  }
}
