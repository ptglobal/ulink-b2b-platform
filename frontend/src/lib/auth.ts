/**
 * Xác thực khách hàng Cổng B2B qua Directus (UC-14).
 *
 * Gọi thẳng endpoint auth của Directus — KHÔNG cần route handler tùy biến,
 * tôn trọng ADR-0007 (chỉ /api/sku và /api/rfq là endpoint tùy biến).
 *
 * Dùng `mode: 'session'` để Directus đặt cookie phiên httpOnly thay vì trả token
 * vào JS phía client (an toàn hơn — AD-07: không lộ token ra trình duyệt).
 * Lưu ý hạ tầng: production cần CORS cho phép credentials + cookie SameSite phù hợp
 * giữa origin frontend và Directus.
 */
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8055';

/** Mã lỗi xác thực — thông điệp chung, không tiết lộ tài khoản có tồn tại hay không. */
export type AuthErrorCode = 'invalid_credentials' | 'network_error' | 'register_failed';

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
    this.code = code;
  }
}

export async function login(email: string, password: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, mode: 'session' })
    });
  } catch {
    throw new AuthError('network_error');
  }

  if (!res.ok) {
    // 401/400 → đăng nhập thất bại; trả lỗi chung (AD-07 §3).
    throw new AuthError('invalid_credentials');
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${DIRECTUS_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ mode: 'session' })
    });
  } catch {
    /* bỏ qua lỗi mạng khi đăng xuất */
  }
}

export interface RegisterInput {
  contact: string;
  email: string;
  phone: string;
  password: string;
}

/**
 * Đăng ký tài khoản người mua (cá nhân) trên Cổng B2B.
 * Gọi Directus /users/register tạo người dùng (cần bật trong cấu hình Directus).
 * Bản ghi `customers` (gắn directus_users) được tạo/liên kết qua Directus Flow
 * hoặc bởi Sales sau khi duyệt.
 */
export async function register(input: RegisterInput): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${DIRECTUS_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        first_name: input.contact,
        phone: input.phone
      })
    });
  } catch {
    throw new AuthError('network_error');
  }

  if (!res.ok) {
    throw new AuthError('register_failed');
  }
}
