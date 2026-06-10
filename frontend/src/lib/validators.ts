import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().min(1, 'required').email('invalid_email'),
  password: z.string().min(1, 'required')
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  contact: z.string().min(1, 'required'),
  email: z.string().min(1, 'required').email('invalid_email'),
  phone: z.string().min(1, 'required'),
  password: z.string().min(8, 'too_short')
});

export type RegisterInput = z.infer<typeof registerSchema>;

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
