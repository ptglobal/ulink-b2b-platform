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

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'required'),
    password: z
      .string()
      .min(8, 'too_short')
      .regex(PASSWORD_REGEX, 'password_policy'),
    confirm_password: z.string().min(1, 'required')
  })
  .refine((v) => v.password === v.confirm_password, {
    message: 'password_mismatch',
    path: ['confirm_password']
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  email: z.string().min(1, 'required').email('invalid_email')
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

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
  qty: z.number().int().positive()
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
