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
  hub_code?: string | null;
  province?: number | null;
  detail_address?: string | null;
  operating_status?: string | null;
  coordinates?: string | null;
  // Warehouse Capacity
  warehouse_total_area?: number | null;
  warehouse_utilized_area?: number | null;
  warehouse_available_area?: number | null;
  warehouse_storage_tons?: number | null;
  warehouse_pallets?: number | null;
  // SLA Metrics
  standard_delivery_time?: string | null;
  on_time_rate?: number | null;
  on_time_rate_delta?: string | null;
  orders_today?: number | null;
  order_capacity_per_day?: number | null;
  avg_delivery_time?: string | null;
  // Technical Team
  person_in_charge_name?: string | null;
  person_in_charge_title?: string | null;
  person_in_charge_phone?: string | null;
  current_personnel_count?: number | null;
  // O2M relations
  industrial_zones?: HubIndustrialZone[];
  team_members?: HubTeamMember[];
  status?: 'published' | 'draft' | 'archived';
}

export interface HubIndustrialZone {
  id: number;
  name: string;
  hub: number | RegionalHub;
  image?: string | null;
  translations?: { id: number; languages_code: string; name: string }[];
}

export interface HubTeamMember {
  id: number;
  name: string;
  role?: string | null;
  years_experience?: number | null;
  photo?: string | null;
  hub: number | RegionalHub;
  sort?: number | null;
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
  created_at?: string;
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

export interface NewsletterSubscriber {
  id?: number | string;
  email: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Schema {
  product_skus: ProductSku[];
  industries: Industry[];
  regional_hubs: RegionalHub[];
  hub_industrial_zones: HubIndustrialZone[];
  hub_team_members: HubTeamMember[];
  site_settings: SiteSettings;
  homepage: HomePage;
  rfq_requests: RfqRequest[];
  rfq_assignment_rules: RfqAssignmentRule[];
  directus_notifications: DirectusNotification[];
  integration_events: IntegrationEvent[];
  newsletter_subscribers: NewsletterSubscriber[];
}

const url = getDirectusUrl();

// Public Directus client for published content reads.
export const publicDirectus = createDirectus<Schema>(url).with(rest());

// Server-side client for mutations that must not rely on anonymous Directus access.
export function createWriteDirectusClient(token = requireDirectusToken()) {
  return createDirectus<Schema>(url).with(staticToken(token)).with(rest());
}
