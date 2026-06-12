import { ApiError } from '@/lib/api-error';
import { api } from '@/lib/api';

/**
 * Auth client — gọi qua Next.js API routes (KHÔNG gọi Directus trực tiếp).
 *
 * Flow: Component → auth.login() → /api/auth/login → Directus
 * Khi swap backend: chỉ sửa route handler, không đụng component hay file này.
 */

export { ApiError as AuthError };

export async function login(email: string, password: string): Promise<void> {
  await api.post('/api/auth/login', { email, password });
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout');
  } catch {
    /* Bỏ qua lỗi mạng khi logout — user vẫn được redirect */
  }
}

export interface RegisterInput {
  company: string;
  contact: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
}

export async function register(input: RegisterInput): Promise<void> {
  await api.post('/api/auth/register', input);
}
