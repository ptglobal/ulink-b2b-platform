/**
 * ULink — Directus bootstrap.
 *
 * Logs in as the admin and creates collections/roles/policies/permissions/seed-data idempotently.
 * Run AFTER `docker compose up -d` (Directus healthy):
 *
 *   cd directus && npm install && npm run bootstrap
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import fs from 'fs'; // To locate .env properly
import {
  createDirectus,
  rest,
  authentication,
  createCollection,
  readCollections,
  createField,
  createRelation,
  readRelations,
  createRoles,
  readRoles,
  createPermissions,
  readPermissions,
  createUser,
  readUsers,
  createItem,
  readItems,
  readPolicies,
  createPolicy,
  readSingleton,
  updateSingleton
} from '@directus/sdk';

// Let's resolve the path to .env file
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const URL = process.env.DIRECTUS_PUBLIC_URL ?? 'http://localhost:8055';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Set DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD (see ../.env).');
  process.exit(1);
}

const client = createDirectus(URL).with(authentication('json')).with(rest());

const STATUS_FIELD = {
  field: 'status',
  type: 'string',
  meta: {
    interface: 'select-dropdown',
    width: 'half',
    options: {
      choices: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' },
        { text: 'Archived', value: 'archived' }
      ]
    }
  },
  schema: { default_value: 'draft' }
};

const ID_FIELD = {
  field: 'id',
  type: 'integer',
  meta: { hidden: true, readonly: true, interface: 'input' },
  schema: { is_primary_key: true, has_auto_increment: true }
};

// Custom Role UUIDs
const EDITOR_ROLE_ID = 'e11b0e50-1010-410c-9999-000000000001';
const SALES_ROLE_ID = 'e11b0e50-2020-410c-9999-000000000002';
const CUSTOMER_ROLE_ID = 'e11b0e50-3030-410c-9999-000000000003';

// Custom Policy UUIDs (Directus 11)
const EDITOR_POLICY_ID = 'p11b0e50-1010-410c-9999-000000000001';
const SALES_POLICY_ID = 'p11b0e50-2020-410c-9999-000000000002';
const CUSTOMER_POLICY_ID = 'p11b0e50-3030-410c-9999-000000000003';

async function ensureCollection(def) {
  try {
    await client.request(createCollection(def));
    console.log(`+  Collection: ${def.collection} (created)`);
  } catch (err) {
    console.log(`=  Collection: ${def.collection} (already exists / skipped)`);
  }
}

async function ensureRelation(def) {
  try {
    await client.request(createRelation(def));
    console.log(`+  Relation: ${def.collection}.${def.field} (created)`);
  } catch (err) {
    console.log(`=  Relation: ${def.collection}.${def.field} (already exists / skipped)`);
  }
}

async function ensureRole(def) {
  try {
    const result = await client.request(createRoles([def]));
    console.log(`+  Role: ${def.name} (created)`);
    return result[0].id;
  } catch (err) {
    console.log(`=  Role: ${def.name} (already exists / skipped)`);
    return def.id;
  }
}

async function ensurePolicy(def) {
  try {
    const result = await client.request(createPolicy(def));
    console.log(`+  Policy: ${def.name} (created)`);
    return result.id;
  } catch (err) {
    console.log(`=  Policy: ${def.name} (already exists / skipped)`);
    return def.id;
  }
}

async function ensureAccess(def) {
  try {
    await client.request(createItem('directus_access', def));
    console.log(`+  Access Mapping: policy ${def.policy} to role ${def.role || 'none'} (created)`);
  } catch (err) {
    console.log(`=  Access Mapping: policy ${def.policy} to role ${def.role || 'none'} (already exists / skipped)`);
  }
}

async function ensurePermission(def) {
  try {
    await client.request(createPermissions([def]));
    console.log(`+  Permission: ${def.collection}:${def.action} for policy ID ${def.policy}`);
  } catch (err) {
    console.log(`=  Permission: ${def.collection}:${def.action} for policy ID ${def.policy} (already exists / skipped)`);
  }
}

async function ensureUser(data) {
  const existing = await client.request(readUsers({ filter: { email: { _eq: data.email } } }));
  if (existing.length > 0) {
    console.log(`=  User: ${data.email} (exists, skipped)`);
    return existing[0].id;
  }
  const res = await client.request(createUser(data));
  console.log(`+  User: ${data.email} (created)`);
  return res.id;
}

async function ensureItem(collection, uniqueField, data) {
  const filter = {};
  filter[uniqueField] = { _eq: data[uniqueField] };
  const existing = await client.request(readItems(collection, { filter }));
  if (existing.length > 0) {
    console.log(`=  Seed Item in ${collection} [${data[uniqueField]}] (exists, skipped)`);
    return existing[0].id;
  }
  const res = await client.request(createItem(collection, data));
  console.log(`+  Seed Item in ${collection} [${data[uniqueField]}] (created)`);
  return res.id;
}

async function ensureSingleton(collection, data) {
  try {
    const existing = await client.request(readSingleton(collection));
    if (existing && existing.id) {
      console.log(`=  Singleton in ${collection} (exists, skipped)`);
      return existing.id;
    }
  } catch (err) {
    // If it does not exist, let's upsert it
  }
  const res = await client.request(updateSingleton(collection, data));
  console.log(`+  Singleton in ${collection} (created/upserted)`);
  return res.id;
}

async function main() {
  await client.login(EMAIL, PASSWORD);
  console.log(`Authenticated as ${EMAIL} @ ${URL}`);

  // --- 1. Create content/business collections ---

  // Partners (CMS Module 2)
  await ensureCollection({
    collection: 'partners',
    meta: { icon: 'handshake', note: 'Strategic Partners', sort_field: 'sort' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', width: 'full', required: true } },
      { field: 'logo', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'url', type: 'string', meta: { interface: 'input' } }
    ]
  });

  // Industries (Module 4/13)
  await ensureCollection({
    collection: 'industries',
    meta: { icon: 'domain', note: 'Industries' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'description', type: 'text', meta: { interface: 'textarea' } },
      { field: 'icon', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } }
    ]
  });

  // Product Categories (CMS Module 3)
  await ensureCollection({
    collection: 'product_categories',
    meta: { icon: 'folder', note: 'Product Categories', sort_field: 'sort' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'parent', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'description', type: 'text', meta: { interface: 'textarea' } },
      { field: 'hero_image', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
      { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } }
    ]
  });

  // Products (CMS Module 5)
  await ensureCollection({
    collection: 'products',
    meta: { icon: 'box', note: 'Products' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'category', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'short_description', type: 'text', meta: { interface: 'textarea' } },
      { field: 'specifications', type: 'json', meta: { interface: 'json' } },
      { field: 'hero', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'gallery', type: 'alias', meta: { interface: 'files', special: ['m2m'] } },
      { field: 'industries', type: 'alias', meta: { interface: 'list-m2m', special: ['m2m'] } },
      { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
      { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } }
    ]
  });

  // Product SKUs (CMS Module 4)
  await ensureCollection({
    collection: 'product_skus',
    meta: { icon: 'qr_code', note: 'Product SKUs' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'sku_code', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'product', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'unit', type: 'string', meta: { interface: 'input' } },
      { field: 'pack_size', type: 'string', meta: { interface: 'input' } },
      { field: 'attributes', type: 'json', meta: { interface: 'json' } }
    ]
  });

  // Documents (CMS Module 6)
  await ensureCollection({
    collection: 'documents',
    meta: { icon: 'description', note: 'Documents' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
      {
        field: 'doc_type',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'TDS', value: 'tds' },
              { text: 'MSDS', value: 'msds' },
              { text: 'Certificate', value: 'certificate' },
              { text: 'Brochure', value: 'brochure' }
            ]
          }
        }
      },
      { field: 'product', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'file', type: 'uuid', meta: { interface: 'file', special: ['file'] } },
      { field: 'language', type: 'string', meta: { interface: 'input' } }
    ]
  });

  // Regional Hubs (CMS Module 7)
  await ensureCollection({
    collection: 'regional_hubs',
    meta: { icon: 'place', note: 'Regional Hubs' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'delivery_sla', type: 'text', meta: { interface: 'textarea' } },
      { field: 'warehouse_capacity', type: 'string', meta: { interface: 'input' } },
      { field: 'technical_team', type: 'text', meta: { interface: 'textarea' } },
      { field: 'cluster_overview', type: 'text', meta: { interface: 'textarea' } },
      { field: 'location', type: 'string', meta: { interface: 'input' } },
      { field: 'coordinates', type: 'string', meta: { interface: 'input' } }
    ]
  });

  // Blog Posts (CMS Module 8)
  await ensureCollection({
    collection: 'blog_posts',
    meta: { icon: 'article', note: 'Blog Posts' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'body', type: 'text', meta: { interface: 'wysiwyg' } },
      { field: 'cover', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'author', type: 'string', meta: { interface: 'input' } },
      { field: 'published_at', type: 'timestamp', meta: { interface: 'datetime' } },
      { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
      { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } }
    ]
  });

  // Case Studies
  await ensureCollection({
    collection: 'case_studies',
    meta: { icon: 'quickreply', note: 'Case Studies' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'summary', type: 'text', meta: { interface: 'textarea' } },
      { field: 'body', type: 'text', meta: { interface: 'wysiwyg' } },
      { field: 'industry', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'cover', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } }
    ]
  });

  // ISO Certifications (CMS Module 9)
  await ensureCollection({
    collection: 'iso_certifications',
    meta: { icon: 'verified', note: 'ISO Certifications' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'number', type: 'string', meta: { interface: 'input' } },
      { field: 'issuer', type: 'string', meta: { interface: 'input' } },
      { field: 'valid_until', type: 'date', meta: { interface: 'datetime' } },
      { field: 'file', type: 'uuid', meta: { interface: 'file', special: ['file'] } }
    ]
  });

  // Hero Banners (CMS Module 1)
  await ensureCollection({
    collection: 'hero_banners',
    meta: { icon: 'view_carousel', note: 'Hero Banners', sort_field: 'sort' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'title', type: 'string', meta: { interface: 'input' } },
      { field: 'subtitle', type: 'text', meta: { interface: 'textarea' } },
      { field: 'image', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'cta_label', type: 'string', meta: { interface: 'input' } },
      { field: 'cta_url', type: 'string', meta: { interface: 'input' } }
    ]
  });

  // Pages
  await ensureCollection({
    collection: 'pages',
    meta: { icon: 'pages', note: 'Pages' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'body', type: 'text', meta: { interface: 'wysiwyg' } },
      { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
      { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } }
    ]
  });

  // Site Settings (Singleton)
  await ensureCollection({
    collection: 'site_settings',
    meta: { icon: 'settings', note: 'Site Settings', singleton: true },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'logo', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'contact_email', type: 'string', meta: { interface: 'input' } },
      { field: 'contact_phone', type: 'string', meta: { interface: 'input' } },
      { field: 'address', type: 'text', meta: { interface: 'textarea' } },
      { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
      { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } },
      { field: 'og_image', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } }
    ]
  });

  // Homepage (Singleton)
  await ensureCollection({
    collection: 'homepage',
    meta: { icon: 'home', note: 'Homepage Layout', singleton: true },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'title', type: 'string', meta: { interface: 'input' } },
      { field: 'hero_section', type: 'json', meta: { interface: 'json' } }
    ]
  });

  // Customers (Commercial / Portal)
  await ensureCollection({
    collection: 'customers',
    meta: { icon: 'people', note: 'Customers' },
    schema: {},
    fields: [
      ID_FIELD,
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Active', value: 'active' },
              { text: 'Inactive', value: 'inactive' }
            ]
          }
        },
        schema: { default_value: 'active' }
      },
      { field: 'user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'company_name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'tax_code', type: 'string', meta: { interface: 'input' } },
      { field: 'contact_name', type: 'string', meta: { interface: 'input' } },
      { field: 'email', type: 'string', meta: { interface: 'input' } },
      { field: 'phone', type: 'string', meta: { interface: 'input' } },
      { field: 'address', type: 'text', meta: { interface: 'textarea' } },
      { field: 'sales_owner', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }
    ]
  });

  // Orders (Commercial / Portal)
  await ensureCollection({
    collection: 'orders',
    meta: { icon: 'shopping_cart', note: 'Orders' },
    schema: {},
    fields: [
      ID_FIELD,
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Pending', value: 'pending' },
              { text: 'Confirmed', value: 'confirmed' },
              { text: 'Processing', value: 'processing' },
              { text: 'Shipped', value: 'shipped' },
              { text: 'Completed', value: 'completed' },
              { text: 'Cancelled', value: 'cancelled' }
            ]
          }
        },
        schema: { default_value: 'pending' }
      },
      { field: 'code', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'customer', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'order_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'subtotal', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      { field: 'tax', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      { field: 'total', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      { field: 'notes', type: 'text', meta: { interface: 'textarea' } },
      { field: 'erp_ref', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } }
    ]
  });

  // Order Items
  await ensureCollection({
    collection: 'order_items',
    meta: { icon: 'list', note: 'Order Items' },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'order', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'sku', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'description', type: 'string', meta: { interface: 'input' } },
      { field: 'qty', type: 'integer', meta: { interface: 'input' } },
      { field: 'unit_price', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      { field: 'line_total', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } }
    ]
  });

  // Invoices (Commercial / Portal)
  await ensureCollection({
    collection: 'invoices',
    meta: { icon: 'receipt', note: 'Invoices' },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'code', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'customer', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'order', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'issue_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'due_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'amount', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      { field: 'paid_amount', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      { field: 'balance', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      {
        field: 'paid_status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Unpaid', value: 'unpaid' },
              { text: 'Partial', value: 'partial' },
              { text: 'Paid', value: 'paid' },
              { text: 'Overdue', value: 'overdue' }
            ]
          }
        },
        schema: { default_value: 'unpaid' }
      },
      { field: 'erp_ref', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } }
    ]
  });

  // Deliveries (Commercial / Portal)
  await ensureCollection({
    collection: 'deliveries',
    meta: { icon: 'local_shipping', note: 'Deliveries' },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'order', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'scheduled_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'delivered_date', type: 'date', meta: { interface: 'datetime' } },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Scheduled', value: 'scheduled' },
              { text: 'In Transit', value: 'in_transit' },
              { text: 'Delivered', value: 'delivered' },
              { text: 'Late', value: 'late' },
              { text: 'Cancelled', value: 'cancelled' }
            ]
          }
        },
        schema: { default_value: 'scheduled' }
      },
      { field: 'tracking_ref', type: 'string', meta: { interface: 'input' } },
      { field: 'erp_ref', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } }
    ]
  });

  // RFQ Requests (Commercial / Portal)
  await ensureCollection({
    collection: 'rfq_requests',
    meta: { icon: 'request_quote', note: 'RFQ Requests' },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'company', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'contact_name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'email', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'phone', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'industry', type: 'string', meta: { interface: 'input' } },
      { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'line_items', type: 'json', meta: { interface: 'json', required: true } },
      { field: 'message', type: 'text', meta: { interface: 'textarea' } },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'New', value: 'new' },
              { text: 'Quoted', value: 'quoted' },
              { text: 'Won', value: 'won' },
              { text: 'Lost', value: 'lost' }
            ]
          }
        },
        schema: { default_value: 'new' }
      },
      { field: 'assigned_sales', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      {
        field: 'source',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Web Site', value: 'web' },
              { text: 'Portal', value: 'portal' }
            ]
          }
        },
        schema: { default_value: 'web' }
      },
      { field: 'user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }
    ]
  });

  // --- Junction Tables for Many-to-Many Relationships ---
  await ensureCollection({
    collection: 'products_industries',
    meta: { hidden: true },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'products_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'industries_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }
    ]
  });

  await ensureCollection({
    collection: 'products_files',
    meta: { hidden: true },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'products_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'directus_files_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }
    ]
  });

  // --- 2. Setup Relationships ---
  const relations = [
    { collection: 'product_categories', field: 'parent', related_collection: 'product_categories' },
    { collection: 'products', field: 'category', related_collection: 'product_categories' },
    { collection: 'product_skus', field: 'product', related_collection: 'products', meta: { one_field: 'skus' } },
    { collection: 'documents', field: 'product', related_collection: 'products' },
    { collection: 'documents', field: 'file', related_collection: 'directus_files' },
    { collection: 'case_studies', field: 'industry', related_collection: 'industries' },
    { collection: 'customers', field: 'user', related_collection: 'directus_users' },
    { collection: 'customers', field: 'sales_owner', related_collection: 'directus_users' },
    { collection: 'orders', field: 'customer', related_collection: 'customers', meta: { one_field: 'orders' } },
    { collection: 'orders', field: 'hub', related_collection: 'regional_hubs' },
    { collection: 'order_items', field: 'order', related_collection: 'orders', meta: { one_field: 'items' } },
    { collection: 'order_items', field: 'sku', related_collection: 'product_skus' },
    { collection: 'invoices', field: 'customer', related_collection: 'customers', meta: { one_field: 'invoices' } },
    { collection: 'invoices', field: 'order', related_collection: 'orders' },
    { collection: 'deliveries', field: 'order', related_collection: 'orders', meta: { one_field: 'deliveries' } },
    { collection: 'deliveries', field: 'hub', related_collection: 'regional_hubs' },
    { collection: 'rfq_requests', field: 'hub', related_collection: 'regional_hubs' },
    { collection: 'rfq_requests', field: 'assigned_sales', related_collection: 'directus_users' },
    { collection: 'rfq_requests', field: 'user', related_collection: 'directus_users' },
    { collection: 'products_industries', field: 'products_id', related_collection: 'products', meta: { one_field: 'industries' } },
    { collection: 'products_industries', field: 'industries_id', related_collection: 'industries' },
    { collection: 'products_files', field: 'products_id', related_collection: 'products', meta: { one_field: 'gallery' } },
    { collection: 'products_files', field: 'directus_files_id', related_collection: 'directus_files' }
  ];

  for (const rel of relations) {
    await ensureRelation(rel);
  }

  // --- 3. Setup Custom Roles ---
  await ensureRole({
    id: EDITOR_ROLE_ID,
    name: 'Editor',
    icon: 'edit',
    description: 'Can CRUD content collections'
  });
  await ensureRole({
    id: SALES_ROLE_ID,
    name: 'Sales',
    icon: 'business_center',
    description: 'Can CRUD commerce data and read content'
  });
  await ensureRole({
    id: CUSTOMER_ROLE_ID,
    name: 'Customer',
    icon: 'person',
    description: 'Authenticated B2B Customer Portal user'
  });

  // --- 4. Setup Access Policies & Map to Roles (Directus 11) ---
  await ensurePolicy({
    id: EDITOR_POLICY_ID,
    name: 'Editor Access Policy',
    description: 'Full write access to content collections',
    app_access: true,
    admin_access: false
  });
  await ensurePolicy({
    id: SALES_POLICY_ID,
    name: 'Sales Access Policy',
    description: 'Full write access to commerce data and read access to content',
    app_access: true,
    admin_access: false
  });
  await ensurePolicy({
    id: CUSTOMER_POLICY_ID,
    name: 'Customer Portal Access Policy',
    description: 'Read access to content and row-level access to own commerce data',
    app_access: true,
    admin_access: false
  });

  // Link policies to roles via directus_access
  await ensureAccess({ role: EDITOR_ROLE_ID, policy: EDITOR_POLICY_ID });
  await ensureAccess({ role: SALES_ROLE_ID, policy: SALES_POLICY_ID });
  await ensureAccess({ role: CUSTOMER_ROLE_ID, policy: CUSTOMER_POLICY_ID });

  // --- 5. Setup Custom Permissions (Bound to Policies in Directus 11) ---
  const contentCollections = [
    'hero_banners',
    'partners',
    'product_categories',
    'products',
    'product_skus',
    'documents',
    'regional_hubs',
    'industries',
    'blog_posts',
    'case_studies',
    'iso_certifications',
    'pages'
  ];

  const permissions = [];

  // --- A. CUSTOMER POLICY Permissions ---
  // Read access to published content collections
  for (const col of contentCollections) {
    permissions.push({
      policy: CUSTOMER_POLICY_ID,
      collection: col,
      action: 'read',
      permissions: { status: { _eq: 'published' } },
      fields: ['*']
    });
  }
  // Read access to Singletons
  for (const col of ['site_settings', 'homepage']) {
    permissions.push({
      policy: CUSTOMER_POLICY_ID,
      collection: col,
      action: 'read',
      permissions: {},
      fields: ['*']
    });
  }
  // Read and Update own customer profile
  permissions.push(
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'customers',
      action: 'read',
      permissions: { user: { _eq: '$CURRENT_USER' } },
      fields: ['*']
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'customers',
      action: 'update',
      permissions: { user: { _eq: '$CURRENT_USER' } },
      fields: ['*']
    }
  );
  // Read own orders & order items
  permissions.push(
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'orders',
      action: 'read',
      permissions: { customer: { user: { _eq: '$CURRENT_USER' } } },
      fields: ['*']
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'order_items',
      action: 'read',
      permissions: { order: { customer: { user: { _eq: '$CURRENT_USER' } } } },
      fields: ['*']
    }
  );
  // Read own invoices
  permissions.push({
    policy: CUSTOMER_POLICY_ID,
    collection: 'invoices',
    action: 'read',
    permissions: { customer: { user: { _eq: '$CURRENT_USER' } } },
    fields: ['*']
  });
  // Read own deliveries
  permissions.push({
    policy: CUSTOMER_POLICY_ID,
    collection: 'deliveries',
    action: 'read',
    permissions: { order: { customer: { user: { _eq: '$CURRENT_USER' } } } },
    fields: ['*']
  });
  // Create RFQ requests & Read own RFQ requests
  permissions.push(
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'rfq_requests',
      action: 'create',
      permissions: {},
      fields: ['*']
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'rfq_requests',
      action: 'read',
      permissions: { user: { _eq: '$CURRENT_USER' } },
      fields: ['*']
    }
  );

  // --- B. SALES POLICY Permissions ---
  // Read access to all content/singletons
  for (const col of [...contentCollections, 'site_settings', 'homepage']) {
    permissions.push({
      policy: SALES_POLICY_ID,
      collection: col,
      action: 'read',
      permissions: {},
      fields: ['*']
    });
  }
  // Full CRUD access to commercial portal tables
  const portalCollections = ['customers', 'orders', 'order_items', 'invoices', 'deliveries', 'rfq_requests'];
  for (const col of portalCollections) {
    for (const action of ['create', 'read', 'update', 'delete']) {
      permissions.push({
        policy: SALES_POLICY_ID,
        collection: col,
        action: action,
        permissions: {},
        fields: ['*']
      });
    }
  }

  // --- C. EDITOR POLICY Permissions ---
  // Full CRUD access to all content collections & singletons
  for (const col of [...contentCollections, 'site_settings', 'homepage']) {
    for (const action of ['create', 'read', 'update', 'delete']) {
      permissions.push({
        policy: EDITOR_POLICY_ID,
        collection: col,
        action: action,
        permissions: {},
        fields: ['*']
      });
    }
  }

  // Apply all defined permissions
  for (const perm of permissions) {
    await ensurePermission(perm);
  }

  // --- 6. Seed Sample/Mock Data ---

  // Industries
  const electronicsId = await ensureItem('industries', 'slug', {
    name: 'Electronics',
    slug: 'electronics',
    status: 'published',
    description: 'Advanced cleanroom and packaging solutions for semiconductor, PCB, and display fabrication.'
  });

  const pharmaceuticalId = await ensureItem('industries', 'slug', {
    name: 'Pharmaceutical & Cosmetics',
    slug: 'pharmaceutical-cosmetics',
    status: 'published',
    description: 'Sterile packaging and contamination control consumables certified for cleanroom Grade A/B.'
  });

  // Product Categories
  const cleanroomId = await ensureItem('product_categories', 'slug', {
    name: 'Cleanroom Consumables',
    slug: 'cleanroom-consumables',
    status: 'published',
    description: 'Contamination control products for industrial cleanrooms.'
  });

  const glovesCategoryId = await ensureItem('product_categories', 'slug', {
    name: 'Cleanroom Gloves',
    slug: 'cleanroom-gloves',
    parent: cleanroomId,
    status: 'published',
    description: 'Nitrile and latex gloves certified for cleanroom environments.'
  });

  const wipersCategoryId = await ensureItem('product_categories', 'slug', {
    name: 'Cleanroom Wipers',
    slug: 'cleanroom-wipers',
    parent: cleanroomId,
    status: 'published',
    description: 'Ultra-low linting wipes for cleanroom surfaces.'
  });

  // Products
  const glovesProductId = await ensureItem('products', 'slug', {
    name: 'Nitrile Cleanroom Gloves',
    slug: 'nitrile-cleanroom-gloves',
    category: glovesCategoryId,
    short_description: 'Class 100 / ISO 5 powder-free nitrile gloves with textured fingertips.',
    specifications: {
      "Material": "Nitrile",
      "Class": "Class 100 / ISO 5",
      "Sterility": "Non-sterile",
      "Color": "White",
      "Length": "12 inches (300mm)"
    },
    status: 'published',
    meta_title: 'Nitrile Cleanroom Gloves | ULink B2B',
    meta_description: 'High-quality powder-free nitrile gloves certified for ISO 5 cleanroom environments.'
  });

  const wipersProductId = await ensureItem('products', 'slug', {
    name: 'Polyester Cleanroom Wipers',
    slug: 'polyester-cleanroom-wipers',
    category: wipersCategoryId,
    short_description: '100% continuous filament polyester wipers with laser-sealed borders.',
    specifications: {
      "Material": "100% Polyester",
      "Size": "9 x 9 inches",
      "Border": "Laser-sealed",
      "Packaging": "Double-bagged"
    },
    status: 'published',
    meta_title: 'Polyester Cleanroom Wipers | ULink B2B',
    meta_description: 'Ultra-low lint polyester wipes designed for cleaning sensitive surfaces in cleanrooms.'
  });

  // Connect Products to Industries (M2M seeding)
  await ensureItem('products_industries', 'id', {
    id: 1,
    products_id: glovesProductId,
    industries_id: electronicsId
  });
  await ensureItem('products_industries', 'id', {
    id: 2,
    products_id: glovesProductId,
    industries_id: pharmaceuticalId
  });
  await ensureItem('products_industries', 'id', {
    id: 3,
    products_id: wipersProductId,
    industries_id: electronicsId
  });

  // Product SKUs
  const sku1Id = await ensureItem('product_skus', 'sku_code', {
    sku_code: 'sku-gloves-nitrile-s',
    product: glovesProductId,
    unit: 'box',
    pack_size: '100 pcs/box',
    attributes: { "size": "S", "color": "white" },
    status: 'published'
  });

  const sku2Id = await ensureItem('product_skus', 'sku_code', {
    sku_code: 'sku-gloves-nitrile-m',
    product: glovesProductId,
    unit: 'box',
    pack_size: '100 pcs/box',
    attributes: { "size": "M", "color": "white" },
    status: 'published'
  });

  const sku3Id = await ensureItem('product_skus', 'sku_code', {
    sku_code: 'sku-wipers-poly-9',
    product: wipersProductId,
    unit: 'pack',
    pack_size: '150 sheets/pack',
    attributes: { "size": "9x9", "sterile": false },
    status: 'published'
  });

  // Regional Hubs
  const hubId = await ensureItem('regional_hubs', 'slug', {
    name: 'Đông Văn 4',
    slug: 'dong-van-4',
    delivery_sla: 'Within 24 hours to Ha Nam and Hanoi clusters; 48 hours regional.',
    warehouse_capacity: '5,000 square meters climate-controlled',
    technical_team: 'On-site technical engineers available 24/7 for cleanroom consulting.',
    cluster_overview: 'Serving the Dong Van industrial clusters specializing in electronics and precision engineering.',
    location: 'Dong Van IV Industrial Park, Kim Bang, Ha Nam',
    coordinates: '20.6139,105.9084',
    status: 'published'
  });

  await ensureItem('regional_hubs', 'slug', {
    name: 'Bắc Thăng Long',
    slug: 'bac-thang-long',
    delivery_sla: 'Within 12 hours local delivery.',
    warehouse_capacity: '3,000 square meters',
    technical_team: 'Consulting engineers for packaging optimization.',
    cluster_overview: 'Supporting the high-tech electronics export hub in Hanoi.',
    location: 'Dong Anh, Hanoi',
    coordinates: '21.1235,105.7891',
    status: 'published'
  });

  // Blog Posts
  await ensureItem('blog_posts', 'slug', {
    title: 'Optimizing ESD Control in Electronics Cleanrooms',
    slug: 'optimizing-esd-control',
    body: '<p>Electrostatic discharge (ESD) can ruin entire wafer batches. Controlling ESD in cleanrooms requires dedicated materials, ESD-safe garments, and certified cleanroom packaging...</p>',
    author: 'Tech Advisor Team',
    published_at: new Date().toISOString(),
    status: 'published'
  });

  // Case Studies
  await ensureItem('case_studies', 'slug', {
    title: 'Cleanroom Wiper Cost Optimization for Samsung Supplier',
    slug: 'samsung-wiper-cost-optimization',
    summary: 'How ULink optimized wiper grade and logistics to reduce annual spend by 18% while keeping particle count below specifications.',
    body: '<p>Our client, a tier-1 supplier of mobile components, struggled with rising costs of high-grade polyester wipes. ULink conducted a particle contamination audit and shifted them to a tailored laser-sealed wiper, yielding massive savings...</p>',
    industry: electronicsId,
    status: 'published'
  });

  // ISO Certifications
  await ensureItem('iso_certifications', 'number', {
    name: 'ISO 9001:2015 Quality Management',
    number: 'QMS-SG-2026-991',
    issuer: 'SGS international',
    valid_until: '2029-06-01',
    status: 'published'
  });

  // Hero Banners
  await ensureItem('hero_banners', 'id', {
    id: 1,
    title: 'Nền tảng cung ứng B2B ULink',
    subtitle: 'Vật tư phòng sạch & Bao bì công nghiệp chuyên sâu cho doanh nghiệp FDI.',
    cta_label: 'Yêu cầu báo giá',
    cta_url: '/quick-order',
    sort: 1,
    status: 'published'
  });

  // Singletons
  await ensureSingleton('site_settings', {
    contact_email: 'contact@ulink.com',
    contact_phone: '+84 24 1234 5678',
    address: 'Tầng 12, Tòa nhà TechPark, KĐT Cầu Giấy, Hà Nội, Việt Nam',
    meta_title: 'ULink B2B Platform — Vật tư phòng sạch & Bao bì',
    meta_description: 'Nền tảng phân phối vật tư phòng sạch và giải pháp bao bì công nghiệp hàng đầu cho FDI tại Việt Nam.'
  });

  await ensureSingleton('homepage', {
    title: 'Trang chủ ULink B2B',
    hero_section: {
      headline: "Đối tác cung ứng vật tư công nghiệp tin cậy",
      cta: "Xem sản phẩm"
    }
  });

  // --- Seed Demo Customer User & Transactions ---
  const customerUserId = await ensureUser({
    email: 'customer@ulink.com',
    password: 'customer-password-123',
    role: CUSTOMER_ROLE_ID,
    first_name: 'Minh',
    last_name: 'Nguyễn B2B',
    status: 'active'
  });

  const customerId = await ensureItem('customers', 'email', {
    user: customerUserId,
    company_name: 'Công ty Samsung Electronics Việt Nam',
    tax_code: '0102030405-001',
    contact_name: 'Nguyễn Văn A',
    email: 'customer@ulink.com',
    phone: '0987654321',
    address: 'Lô CN1-1, KCN Yên Phong, Yên Trung, Yên Phong, Bắc Ninh',
    status: 'active'
  });

  // Sample Order
  const orderId = await ensureItem('orders', 'code', {
    code: 'ORD-2026-0001',
    customer: customerId,
    order_date: '2026-06-01',
    status: 'completed',
    hub: hubId,
    subtotal: 15000000.00,
    tax: 1500000.00,
    total: 16500000.00,
    notes: 'Giao trực tiếp kho kiểm phẩm bộ phận QC.',
    erp_ref: 'ERP-ORD-2026-99901'
  });

  // Sample Order Items
  await ensureItem('order_items', 'description', {
    order: orderId,
    sku: sku1Id,
    description: 'Găng tay phòng sạch Nitrile size S (100 pcs/box)',
    qty: 50,
    unit_price: 200000.00,
    line_total: 10000000.00
  });

  await ensureItem('order_items', 'description', {
    order: orderId,
    sku: sku2Id,
    description: 'Găng tay phòng sạch Nitrile size M (100 pcs/box)',
    qty: 25,
    unit_price: 200000.00,
    line_total: 5000000.00
  });

  // Sample Invoice (Công nợ)
  await ensureItem('invoices', 'code', {
    code: 'INV-2026-0001',
    customer: customerId,
    order: orderId,
    issue_date: '2026-06-01',
    due_date: '2026-07-01',
    amount: 16500000.00,
    paid_amount: 10000000.00,
    balance: 6500000.00, // Remaining debt
    paid_status: 'partial',
    erp_ref: 'ERP-INV-2026-88001'
  });

  // Sample Delivery
  await ensureItem('deliveries', 'erp_ref', {
    order: orderId,
    hub: hubId,
    scheduled_date: '2026-06-02',
    delivered_date: '2026-06-02',
    status: 'delivered',
    tracking_ref: 'TRK-ULINK-20260602',
    erp_ref: 'ERP-DLV-2026-77001'
  });

  console.log('\nBootstrap & seed data setup completed successfully!');
}

main().catch((err) => {
  console.error('Bootstrap failed with error:', err);
  process.exit(1);
});
