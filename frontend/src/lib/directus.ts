import { createDirectus, rest, staticToken } from '@directus/sdk';
import { getDirectusUrl, requireDirectusToken } from './directus-runtime.mjs';

// Minimal schema typing - extend as collections are added (see directus/SCHEMA.md).
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
  contact_name: string;
  email: string;
  phone?: string;
  industry?: string;
  message?: string;
  line_items?: Array<{ sku: string; qty: number }>;
  status?: string;
  source?: 'web' | 'portal';
  user?: string | number;
  hub?: string | number;
}

export interface Schema {
  product_skus: ProductSku[];
  rfq_requests: RfqRequest[];
}

const url = getDirectusUrl();

// Public Directus client for published content reads.
export const publicDirectus = createDirectus<Schema>(url).with(rest());

// Server-side client for mutations that must not rely on anonymous Directus access.
export function createWriteDirectusClient(token = requireDirectusToken()) {
  return createDirectus<Schema>(url).with(staticToken(token)).with(rest());
}
