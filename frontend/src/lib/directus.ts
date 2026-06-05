import { createDirectus, rest, staticToken } from '@directus/sdk';

// Minimal schema typing — extend as collections are added (see directus/SCHEMA.md).
export interface ProductSku {
  id: number;
  sku_code: string;
  product: number | null;
  unit: string | null;
  pack_size: string | null;
  status: string;
}

export interface RfqRequest {
  id?: number | string;
  company: string;
  contact: string;
  email: string;
  phone?: string;
  industry?: string;
  message?: string;
  line_items?: Array<{ sku: string; qty: number }>;
  status?: string;
}

export interface Schema {
  product_skus: ProductSku[];
  rfq_requests: RfqRequest[];
}

const url = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const token = process.env.DIRECTUS_TOKEN;

// Server-side client. With a static token it can write to protected collections;
// without one it falls back to the public role's permissions.
export const directus = token
  ? createDirectus<Schema>(url).with(staticToken(token)).with(rest())
  : createDirectus<Schema>(url).with(rest());
