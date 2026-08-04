'use server';

import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, updateItem } from '@directus/sdk';
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
 * Action: Cập nhật trạng thái xử lý Yêu cầu hàng mẫu (Duyệt hoặc Từ chối) và gán Sales phụ trách.
 */
export async function updateSampleRequestStatus(data: {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  approval_note?: string;
  reject_reason?: string;
  assigned_sales_id?: string | null;
}) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    
    const payload: Record<string, any> = {
      status: data.status
    };

    if (data.status === 'approved') {
      payload.approval_note = data.approval_note || null;
      payload.reject_reason = null;
      if (data.assigned_sales_id !== undefined) {
        payload.assigned_sales = data.assigned_sales_id;
      }
    } else if (data.status === 'rejected') {
      payload.reject_reason = data.reject_reason || null;
      payload.approval_note = null;
    } else {
      payload.approval_note = null;
      payload.reject_reason = null;
    }

    await client.request(updateItem('sample_requests' as any, data.id, payload));

    revalidatePath('/[locale]/admin/sample-requests', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to update sample request:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * Action: Chỉ gán lại nhân viên Sales chăm sóc cho Yêu cầu hàng mẫu.
 */
export async function assignSampleRequestSales(requestId: number, salesId: string | null) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    
    await client.request(
      updateItem('sample_requests' as any, requestId, {
        assigned_sales: salesId
      })
    );

    revalidatePath('/[locale]/admin/sample-requests', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to assign sales to sample request:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * Action: Lưu (Tạo mới hoặc Cập nhật) một yêu cầu hàng mẫu.
 */
export async function saveSampleRequest(data: {
  id?: number;
  contact_name: string;
  email: string;
  company: string;
  phone: string;
  province: string;
  district: string;
  address_detail: string;
  product_slug?: string;
  skus?: string[];
  message?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
  assigned_sales_id?: string | null;
}) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    const { createItem } = await import('@directus/sdk');

    const payload: Record<string, any> = {
      contact_name: data.contact_name,
      email: data.email,
      company: data.company,
      phone: data.phone,
      province: data.province,
      district: data.district,
      address_detail: data.address_detail,
      product_slug: data.product_slug || 'sample-general',
      skus: data.skus || [],
      message: data.message || null,
      status: data.status || 'pending',
      assigned_sales: data.assigned_sales_id || null
    };

    if (data.id) {
      await client.request(updateItem('sample_requests' as any, data.id, payload));
    } else {
      await client.request(createItem('sample_requests' as any, payload));
    }

    revalidatePath('/[locale]/admin/sample-requests', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to save sample request:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * Action: Xóa một yêu cầu hàng mẫu (Xóa cứng).
 */
export async function deleteSampleRequest(id: number) {
  await checkAuth();

  try {
    const client = await getSessionClient();
    const { deleteItem } = await import('@directus/sdk');

    await client.request(deleteItem('sample_requests' as any, id));

    revalidatePath('/[locale]/admin/sample-requests', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to delete sample request:', err);
    return { success: false, error: formatError(err) };
  }
}
