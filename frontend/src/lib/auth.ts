import { ApiError } from '@/lib/api-error';
import { api } from '@/lib/api';

/**
 * Auth client — gọi qua Next.js API routes (KHÔNG gọi Directus trực tiếp).
 *
 * Flow: Component → auth.login() → /api/auth/login → Directus
 * Khi swap backend: chỉ sửa route handler, không đụng component hay file này.
 */

export { ApiError as AuthError };

// ─── Session shape ───────────────────────────────────────────────────────────

export interface MeResponse {
  data: {
    id: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    role?: string | null;
    status?: string | null;
  } | null;
}

export async function me(): Promise<MeResponse> {
  return api.get<MeResponse>('/api/auth/me');
}

// ─── Login / logout ──────────────────────────────────────────────────────────

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

// ─── Registration (B2B customer) ─────────────────────────────────────────────

export interface RegisterInput {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  /**
   * Whether the user accepted the terms of service. The backend stamps a
   * `consented_at` field on the customer row from this + `agree_at` to keep
   * an auditable consent record (GDPR / ToS compliance).
   */
  agree: true;
  /** ISO-8601 timestamp of the moment the user consented. */
  agree_at: string;
  /**
   * Legacy field — kept optional for type compatibility with the still-deployed
   * /verify-otp and /register/confirm pages. OTP is disabled, so the backend
   * ignores this value when present.
   */
  verified_token?: string;
}

export async function register(input: RegisterInput): Promise<{ data: { user_id: string; customer_id: string; status: string } }> {
  return api.post('/api/auth/register', input);
}

// ─── Password recovery (forgot-password) ─────────────────────────────────────

export interface ForgotPasswordResponse {
  /** Always true on success — we never reveal whether the email is registered. */
  sent: boolean;
}

/**
 * Request a password reset link. The backend sends an email with a single-use
 * link to /reset-password?token=... Always resolves successfully to prevent
 * email enumeration.
 */
export async function requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
  return api.post('/api/auth/forgot-password', { email });
}

// ─── Password reset (consume reset token from email link) ───────────────────

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirm_password: string;
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  await api.post('/api/auth/reset-password', input);
}

// ─── Password change (sends link, same flow as forgot-password) ─────────────

/**
 * Request a password-change link. The backend sends an email with a link to
 * /reset-password?token=... with purpose='change'. Always resolves successfully
 * to prevent email enumeration.
 *
 * @deprecated The /change-password page now uses the in-session flow below.
 * Kept exported in case any legacy caller still hits the email-link path.
 */
export async function changePassword(email: string): Promise<ForgotPasswordResponse> {
  return api.post('/api/auth/change-password', { email });
}

// ─── Password change (in-session, for logged-in users) ───────────────────────

export interface ChangePasswordInSessionInput {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

/**
 * Change the password for the currently-authenticated user. The route
 * verifies `current_password` against Directus /auth/login first, so a
 * stolen session cookie alone is not enough to take over the account.
 *
 * Errors raised (as AuthError):
 *   - 'unauthenticated' (401) — no session
 *   - 'invalid_current_password' (401) — current_password didn't match
 *   - 'PASSWORD_SAME_AS_OLD' (422) — new === current (after hashing)
 *   - 'password_mismatch' (422) — confirm_new_password didn't match
 *   - 'password_policy' (422) — new_password failed complexity rule
 */
export async function changePasswordInSession(
  input: ChangePasswordInSessionInput
): Promise<void> {
  await api.post('/api/auth/change-password/apply', input);
}

// ─── Password change via email-link token ────────────────────────────────────

export interface ChangePasswordByTokenInput {
  token: string;
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

/**
 * Consume the change-password email link. The user lands on
 * /change-password?token=…, fills the 3-field form, and this function
 * forwards the submission to /api/auth/change-password/confirm-token.
 * The route delegates to Directus's /password-reset-request/reset which
 * validates the token, updates the password, and clears every other
 * session for the user. The caller's session is also dropped via
 * `logout()` on the form side after a successful response.
 *
 * Errors raised (as AuthError):
 *   - 'invalid_token' (400) — token expired, malformed, or already used
 *   - 'password_mismatch' (422) — confirm_new_password didn't match
 *   - 'password_policy' (422) — new_password failed complexity rule
 *   - 'rate_limited' (429) — too many attempts on this token
 *   - 'upstream_error' (502) — Directus unreachable
 */
export async function changePasswordByToken(
  input: ChangePasswordByTokenInput
): Promise<void> {
  await api.post('/api/auth/change-password/confirm-token', input);
}

// ─── OTP / email verification ────────────────────────────────────────────────
//
// NOTE: OTP verification is currently DISABLED for the registration flow.
// /api/auth/verify-otp returns 410 Gone, so the functions below will reject.
// They are kept exported (along with OtpPurpose, OtpIssueResponse, etc.) so
// the underlying logic can be re-enabled without rewiring the auth module,
// and so the still-deployed /verify-otp page keeps compiling.

export type OtpPurpose = 'register' | 'login-2fa';

export interface OtpIssueResponse {
  sent: boolean;
  expires_in_seconds: number;
  /** Returned only when the server is in debug mode (ALLOW_DEBUG_OTP). */
  debug_code?: string;
}

export interface OtpVerifyResponse {
  verified: boolean;
  /** A short-lived token the client can pass back to register to skip
   *  re-entering the same OTP. */
  verified_token?: string;
}

export async function requestOtp(email: string, purpose: OtpPurpose): Promise<OtpIssueResponse> {
  const body = (await api.post('/api/auth/verify-otp', { email, purpose, op: 'issue' })) as {
    data: OtpIssueResponse;
  };
  return body.data;
}

export async function verifyOtp(
  email: string,
  code: string,
  purpose: OtpPurpose
): Promise<OtpVerifyResponse> {
  const body = (await api.post('/api/auth/verify-otp', { email, code, purpose })) as {
    data: OtpVerifyResponse;
  };
  return body.data;
}
