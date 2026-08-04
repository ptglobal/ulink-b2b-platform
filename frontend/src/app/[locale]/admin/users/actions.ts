'use server';

import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, createUser, updateUser, deleteUser } from '@directus/sdk';
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
 * Action: Lưu (Tạo mới hoặc Cập nhật) tài khoản User.
 */
export async function saveUserAction(data: {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  roleId: string;
  status: 'active' | 'suspended' | 'invited' | 'draft';
}) {
  await checkAuth();

  try {
    const client = await getSessionClient();

    const payload: Record<string, any> = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      role: data.roleId,
      status: data.status
    };

    // Chỉ gán password nếu tạo mới hoặc khi sửa có điền password mới
    if (data.password && data.password.trim()) {
      payload.password = data.password;
    }

    if (data.id) {
      await client.request(updateUser(data.id, payload));
    } else {
      // Khi tạo mới, bắt buộc phải có mật khẩu
      if (!data.password) {
        return { success: false, error: 'Mật khẩu là bắt buộc khi tạo tài khoản mới.' };
      }
      await client.request(createUser(payload));
    }

    revalidatePath('/[locale]/admin/users', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to save user account:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * Action: Xóa tài khoản User.
 */
export async function deleteUserAction(id: string) {
  await checkAuth();

  try {
    const client = await getSessionClient();

    await client.request(deleteUser(id));

    revalidatePath('/[locale]/admin/users', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to delete user account:', err);
    return { success: false, error: formatError(err) };
  }
}
