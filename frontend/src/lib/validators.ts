import { z } from 'zod';

// ─── Shared ──────────────────────────────────────────────────────────────────

// Mirrors the regex enforced server-side in:
//   - directus/extensions/customer-onboarding-endpoint/src/service.js
//   - directus/extensions/password-change-endpoint/src/index.js
// Keep the two in sync.
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
export const PASSWORD_HINT = 'auth.validation.passwordPolicy';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().min(1, 'required').email('invalid_email'),
  password: z.string().min(1, 'required')
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    company_name: z.string().min(1, 'required').max(200),
    contact_name: z.string().min(1, 'required').max(200),
    email: z.string().min(1, 'required').email('invalid_email'),
    // Digits-only phone number, 6–40 chars. Mirrors the rule in
    // src/components/auth/register-form.tsx (PHONE_RE) — keep in sync.
    phone: z
      .string()
      .min(1, 'required')
      .regex(/^\d{6,40}$/, 'invalid_phone'),
    password: z
      .string()
      .min(8, 'too_short')
      .regex(PASSWORD_REGEX, 'password_policy'),
    confirm_password: z.string().min(1, 'required'),
    // The user must explicitly accept the terms of service. The agree_at
    // timestamp travels with the registration so the backend can stamp a
    // consent record on the customer row (audit trail / GDPR / ToS compliance).
    agree: z.literal(true, { message: 'agree_required' }),
    agree_at: z.string().min(1, 'required')
  })
  .refine((v) => v.password === v.confirm_password, {
    message: 'password_mismatch',
    path: ['confirm_password']
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'required').email('invalid_email')
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'required'),
  password: z.string().min(1, 'required'),
  confirm_password: z.string().min(1, 'required')
  // Intentionally NO policy validation here. The Directus /reset endpoint
  // is the source of truth for the shared anti-brute-force counter —
  // if the Next.js route pre-validates and 422s locally, the counter never
  // increments, the 3-fail/15-min lockout never fires, and the user never
  // sees the attempts-left hint or the red countdown banner. The backend
  // already returns password_mismatch / password_policy 422 + payload
  // { remaining, attempts } we need to drive the UI.
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  email: z.string().min(1, 'required').email('invalid_email')
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Authenticated password change — used by the logged-in user's
 * /change-password form. The user must supply their current password plus
 * the new password twice. The route handler verifies `current_password` by
 * probing Directus /auth/login before issuing the update, so a stolen
 * session cookie alone is not enough.
 */
export const changePasswordInSessionSchema = z
  .object({
    current_password: z.string().min(1, 'required'),
    new_password: z
      .string()
      .min(8, 'too_short')
      .regex(PASSWORD_REGEX, 'password_policy'),
    confirm_new_password: z.string().min(1, 'required')
  })
  .refine((v) => v.new_password === v.confirm_new_password, {
    message: 'password_mismatch',
    path: ['confirm_new_password']
  });

export type ChangePasswordInSessionInput = z.infer<typeof changePasswordInSessionSchema>;

/**
 * Password change via the email-link token flow. The token is the single-use
 * reset link from the change-password email; `current_password` is still
 * required so a stolen inbox alone is not enough to take over the account.
 * The route handler probes Directus /auth/login to verify the current
 * password *before* consuming the token, so the worst case for a bad actor
 * is "you'll see a 'wrong current password' error" — they never get the
 * new-password stage to attempt.
 */
export const changePasswordViaTokenSchema = z
  .object({
    token: z.string().min(1, 'required'),
    current_password: z.string().min(1, 'required'),
    new_password: z
      .string()
      .min(8, 'too_short')
      .regex(PASSWORD_REGEX, 'password_policy'),
    confirm_new_password: z.string().min(1, 'required')
  })
  .refine((v) => v.new_password === v.confirm_new_password, {
    message: 'password_mismatch',
    path: ['confirm_new_password']
  });

export type ChangePasswordViaTokenInput = z.infer<typeof changePasswordViaTokenSchema>;

export const otpIssueSchema = z.object({
  email: z.string().min(1, 'required').email('invalid_email'),
  purpose: z.enum(['register', 'login-2fa'])
});

export type OtpIssueInput = z.infer<typeof otpIssueSchema>;

export const otpVerifySchema = z.object({
  email: z.string().min(1, 'required').email('invalid_email'),
  code: z.string().regex(/^\d{6}$/, 'invalid_code'),
  purpose: z.enum(['register', 'login-2fa'])
});

export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

// ─── RFQ ─────────────────────────────────────────────────────────────────────

export const rfqLineItemSchema = z.object({
  sku: z.string().min(1),
  note: z.string().optional()
});

export const rfqSchema = z.object({
  company: z.string().min(1, 'required'),
  contact: z.string().optional().default(''),
  email: z.string().min(1, 'required').email('invalid_email'),
  phone: z.string().optional(),
  industry: z.string().optional(),
  message: z.string().optional(),
  items: z.array(rfqLineItemSchema).optional().default([])
});

export type RfqInput = z.infer<typeof rfqSchema>;

// ─── Contact ─────────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  name: z.string().min(1, 'required'),
  email: z.string().min(1, 'required').email('invalid_email'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'required'),
  message: z.string().min(1, 'required')
});

export type ContactInput = z.infer<typeof contactSchema>;

// ─── Hub RFQ (Báo giá theo cụm KCN) ────────────────────────────────────────

export const hubRfqSchema = z.object({
  hub_id: z.number().int().positive(),
  contact_name: z.string().min(1, 'required'),
  company: z.string().min(1, 'required'),
  phone: z
    .string()
    .min(1, 'required')
    .regex(/^\d{10,11}$/, 'invalid_phone'),
  email: z.string().min(1, 'required').email('invalid_email'),
  message: z.string().optional()
});

export type HubRfqInput = z.infer<typeof hubRfqSchema>;

// ─── Sample Request ─────────────────────────────────────────────────────────

export const sampleRequestSchema = z.object({
  contact_name: z.string().min(1, 'required'),
  email: z.string().min(1, 'required').email('invalid_email'),
  company: z.string().min(1, 'required'),
  phone: z
    .string()
    .min(1, 'required')
    .regex(/^\d{10,11}$/, 'invalid_phone'),
  province: z.string().min(1, 'required'),
  district: z.string().min(1, 'required'),
  address_detail: z.string().min(1, 'required'),
  product_slug: z.string().min(1),
  skus: z.array(z.string()).optional().default([]),
  message: z.string().optional()
});

export type SampleRequestInput = z.infer<typeof sampleRequestSchema>;
