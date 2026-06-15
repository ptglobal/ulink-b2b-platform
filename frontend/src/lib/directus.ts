import { createDirectus, rest, staticToken } from '@directus/sdk';
import { getDirectusUrl, requireDirectusToken } from './directus-runtime.mjs';

// Minimal schema typing - extend as collections are added (see directus/SCHEMA.md).
export interface ProductSku {
  id: number;
  sku_code: string;
  product: number | null;
  unit: string | null;
  pack_size: string | null;
  attributes: Record<string, unknown> | null;
  status: 'published' | 'draft' | 'archived';
}

export interface Industry {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  status?: 'published' | 'draft' | 'archived';
}

export interface RegionalHub {
  id: number;
  name: string;
  slug: string;
  delivery_sla?: string | null;
  warehouse_capacity?: string | null;
  technical_team?: string | null;
  cluster_overview?: string | null;
  location?: string | null;
  coordinates?: string | null;
  status?: 'published' | 'draft' | 'archived';
}

export interface SiteSettings {
  logo?: string | null;
  contact_email: string | null;
  contact_phone?: string | null;
  address?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image?: string | null;
}

export interface HomePage {
  title?: string | null;
  hero_section?: unknown;
}

export interface RfqRequest {
  id?: number | string;
  company: string;
  contact_name: string;
  email: string;
  phone?: string;
  industry?: string | Industry | null;
  message?: string;
  line_items?: Array<{ sku: string; qty: number }>;
  status?: string;
  source?: 'web' | 'portal';
  user?: string | number | { id: string };
  hub?: string | number | RegionalHub | null;
  assigned_sales?: string | number | { id: string; email?: string } | null;
}

export interface RfqAssignmentRule {
  id: number;
  hub?: number | RegionalHub | null;
  industry?: number | Industry | null;
  assigned_sales?: string | number | { id: string; email?: string } | null;
  priority?: number | null;
  is_default?: boolean | null;
}

export interface DirectusNotification {
  id?: number | string;
  recipient: string | number | null;
  subject: string;
  message: string;
  collection?: string | null;
  item?: string | number | null;
  link?: string | null;
}

export interface IntegrationEvent {
  id?: number | string;
  entity: 'orders' | 'invoices' | 'deliveries';
  op: 'create' | 'update';
  record_id: string;
  erp_ref?: string | null;
  revision: string;
  idempotency_key: string;
  payload: Record<string, unknown>;
  status?: 'pending' | 'sent' | 'failed';
  attempts?: number;
  next_attempt_at?: string | null;
  last_attempt_at?: string | null;
  last_status_code?: number | null;
  last_error?: string | null;
  destination_url?: string | null;
}

export interface Schema {
  product_skus: ProductSku[];
  industries: Industry[];
  regional_hubs: RegionalHub[];
  site_settings: SiteSettings;
  homepage: HomePage;
  rfq_requests: RfqRequest[];
  rfq_assignment_rules: RfqAssignmentRule[];
  directus_notifications: DirectusNotification[];
  integration_events: IntegrationEvent[];
}

const url = getDirectusUrl();

// Public Directus client for published content reads.
export const publicDirectus = createDirectus<Schema>(url).with(rest());

// Server-side client for mutations that must not rely on anonymous Directus access.
export function createWriteDirectusClient(token = requireDirectusToken()) {
  return createDirectus<Schema>(url).with(staticToken(token)).with(rest());
}
