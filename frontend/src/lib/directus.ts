import { createDirectus, rest, staticToken } from '@directus/sdk';
import { getDirectusUrl, requireDirectusToken } from './directus-runtime.mjs';

// Minimal schema typing - extend as collections are added (see directus/SCHEMA.md).
export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  translations?: Array<{
    languages_code: string | { code: string };
    name?: string | null;
    description?: string | null;
  }>;
  parent?: number | ProductCategory | null;
  status: 'published' | 'draft' | 'archived';
}

export interface Standard {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  status: 'published' | 'draft' | 'archived';
}

export interface ProductDocument {
  id: number;
  title: string;
  doc_type: 'tds' | 'msds' | 'certificate' | 'brochure';
  product: number | Product;
  file: string | DirectusFile | null;
  cover?: string | DirectusFile | null;
  language?: string | null;
  status: 'published' | 'draft' | 'archived';
}

export interface DirectusFile {
  id: string;
  title?: string | null;
  filename_download: string;
  type?: string | null;
  filesize?: number | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand?: string | null;
  category?: number | ProductCategory | null;
  short_description?: string | null;
  specifications?: Record<string, string> | null;
  hero?: string | null;
  gallery?: Array<{ directus_files_id: string | DirectusFile }>;
  industries?: Array<{ industries_id: number | Industry }>;
  standards?: Array<{ standards_id: number | Standard }>;
  documents?: ProductDocument[];
  skus?: ProductSku[];
  assigned_attributes?: Array<{ product_attributes_id: number | ProductAttribute }>;
  meta_title?: string | null;
  meta_description?: string | null;
  status: 'published' | 'draft' | 'archived';
}

export interface ProductSku {
  id: number;
  sku_code: string;
  product: number | Product | null;
  unit: string | null;
  pack_size: string | null;
  attributes: Record<string, unknown> | null;
  image?: string | null;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  status: 'published' | 'draft' | 'archived';
}

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  sort: number;
  options?: ProductAttributeOption[];
}

export interface ProductAttributeOption {
  id: number;
  attribute: number | ProductAttribute;
  value: string;
  sku_suffix: string;
  sort: number;
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
  avg_delivery_distance?: number | null;
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
  content?: HomePageContent | null;
  translations?: Array<{
    id?: number;
    languages_code: string | { code: string };
    title?: string | null;
    content?: HomePageContent | null;
  }>;
}

export interface PagePresentation {
  version: number;
  heroMedia?: ContentMedia | null;
  supportingMedia?: ContentMedia[];
  /** Localized marketing copy managed from the Directus pages collection. */
  copy?: Record<string, string | Record<string, string>>;
}

export interface ContentPage {
  id: number;
  slug: string;
  status?: 'published' | 'draft' | 'archived';
  title?: string | null;
  content?: PagePresentation | null;
  translations?: Array<{
    id?: number;
    languages_code: string | { code: string };
    title?: string | null;
    content?: PagePresentation | null;
  }>;
}

export interface ContentAction {
  label: string;
  href: string;
}

export interface ContentMedia {
  path: string;
  role: string;
  alt: string;
}

export interface HomePageContent {
  version: number;
  hero: {
    kicker: string;
    title: string;
    description: string;
    primaryAction: ContentAction;
    secondaryAction: ContentAction;
    assurance: string;
    image: ContentMedia;
  };
  journey: {
    title: string;
    description: string;
    items: Array<{
      icon: 'document' | 'catalog' | 'quote' | 'delivery';
      label: string;
      title: string;
      description: string;
      href: string;
      action: string;
    }>;
  };
  about?: {
    title: string;
    description: string;
    bullets: string[];
    action: ContentAction;
    image: ContentMedia;
  };
  materials: {
    title: string;
    description: string;
    image: ContentMedia;
    groups: Array<{ title: string; description: string; href: string; image?: ContentMedia }>;
  };
  proof: {
    title: string;
    description: string;
    items: Array<{ value: string; label: string; detail: string }>;
  };
  audiences: {
    title: string;
    subtitle: string;
    items: Array<{
      icon: 'building' | 'factory';
      title: string;
      description: string;
      bullets: string[];
      action: ContentAction;
    }>;
  };
  governance: {
    title: string;
    description: string;
    items: Array<{ title: string; description: string; href: string }>;
  };
  cta: {
    title: string;
    description: string;
    primaryAction: ContentAction;
    secondaryAction: ContentAction;
  };
}

export interface RfqRequest {
  id?: number | string;
  company: string;
  contact_name: string;
  email: string;
  phone?: string;
  address?: string;
  industry?: string | Industry | null;
  message?: string;
  scheduled_delivery?: boolean;
  requested_delivery_date?: string;
  line_items?: Array<{ sku: string; note?: string }>;
  status?: string;
  source?: 'web' | 'portal';
  user?: string | number | { id: string };
  hub?: string | number | RegionalHub | null;
  assigned_sales?:
    | string
    | number
    | { id: string; first_name?: string; last_name?: string; email?: string; avatar?: string }
    | null;
  created_at?: string;
  approval_note?: string | null;
  reject_reason?: string | null;
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

export interface ContactRequest {
  id?: number | string;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status?: 'unread' | 'read';
  created_at?: string;
}

export interface EventRegistration {
  id?: number | string;
  reference_code: string;
  event_slug: string;
  event_title: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title?: string | null;
  discovery_source?: string | null;
  note?: string | null;
  consent: boolean;
  registration_status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'not_required';
  created_at?: string;
}

export interface SampleRequest {
  id?: number | string;
  contact_name: string;
  email: string;
  company: string;
  phone: string;
  province: string;
  district: string;
  address_detail: string;
  product_slug: string;
  skus?: string[];
  message?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
  user?: string | number | { id: string } | null;
  approval_note?: string | null;
  reject_reason?: string | null;
  date_created?: string;
}

export interface IsoCertification {
  id: number;
  name: string;
  number: string;
  issuer?: string | null;
  file?: string | null;
  cover?: string | DirectusFile | null;
  status?: 'published' | 'draft' | 'archived';
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  cover?: string | null;
  published_at?: string | null;
  meta_description?: string | null;
  status: 'published' | 'draft' | 'archived';
  translations?: number[] | BlogPostTranslation[];
}

export interface BlogPostTranslation {
  id: number;
  blog_posts_id: number | BlogPost;
  languages_code: string;
  title: string;
  body?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface CaseStudy {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  cover?: string | null;
  status: 'published' | 'draft' | 'archived';
}

export interface Schema {
  products: Product[];
  product_categories: ProductCategory[];
  product_skus: ProductSku[];
  industries: Industry[];
  standards: Standard[];
  documents: ProductDocument[];
  products_industries: Array<{ id: number; products_id: number; industries_id: number }>;
  products_standards: Array<{ id: number; products_id: number; standards_id: number }>;
  products_files: Array<{ id: number; products_id: number; directus_files_id: string }>;
  regional_hubs: RegionalHub[];
  hub_industrial_zones: HubIndustrialZone[];
  hub_team_members: HubTeamMember[];
  site_settings: SiteSettings;
  homepage: HomePage;
  pages: ContentPage[];
  rfq_requests: RfqRequest[];
  rfq_assignment_rules: RfqAssignmentRule[];
  directus_notifications: DirectusNotification[];
  integration_events: IntegrationEvent[];
  newsletter_subscribers: NewsletterSubscriber[];
  contact_requests: ContactRequest[];
  event_registrations: EventRegistration[];
  sample_requests: SampleRequest[];
  iso_certifications: IsoCertification[];
  blog_posts: BlogPost[];
  blog_posts_translations: BlogPostTranslation[];
  case_studies: CaseStudy[];
}

const url = getDirectusUrl();

/**
 * ISR-aware fetch for published content reads.
 * Next.js App Router caches GET responses according to `next.revalidate`,
 * so Directus reads are served from cache and refreshed every hour.
 */
// Keep CMS reads fresh during local development, while allowing production
// builds to prerender and ship the current Directus snapshot to the CDN.
const isrFetch: typeof globalThis.fetch = (input, init) =>
  globalThis.fetch(input, {
    ...init,
    ...(process.env.NODE_ENV === 'production'
      ? { next: { revalidate: 3600 } }
      : { cache: 'no-store' })
  });

/**
 * Uncached fetch for auth, mutations, and data that must always be fresh.
 */
const noStoreFetch: typeof globalThis.fetch = (input, init) =>
  globalThis.fetch(input, { ...init, cache: 'no-store' });

// Public Directus client for published content reads (ISR-cached).
export const publicDirectus = createDirectus<Schema>(url, { globals: { fetch: isrFetch } }).with(
  rest()
);

// Uncached Directus client for data that must always be fresh (e.g. auth checks, real-time counts).
export const freshDirectus = createDirectus<Schema>(url, { globals: { fetch: noStoreFetch } }).with(
  rest()
);

// Server-side client for mutations that must not rely on anonymous Directus access.
export function createWriteDirectusClient(token = requireDirectusToken()) {
  return createDirectus<Schema>(url).with(staticToken(token)).with(rest());
}
