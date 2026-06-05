/**
 * ULink — Directus bootstrap.
 *
 * Logs in as the admin and creates collections/roles idempotently.
 * Run AFTER `docker compose up -d` (Directus healthy):
 *
 *   cd directus && npm install && npm run bootstrap
 *
 * This is a SCAFFOLD: it wires auth + one example collection (`partners`) and
 * leaves the rest as TODOs. Fill in every collection per ./SCHEMA.md using the
 * same `ensureCollection(...)` pattern.
 */
import 'dotenv/config';
import {
  createDirectus,
  rest,
  authentication,
  createCollection,
  readCollections
} from '@directus/sdk';

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

async function ensureCollection(def) {
  const existing = await client.request(readCollections());
  if (existing.some((c) => c.collection === def.collection)) {
    console.log(`=  ${def.collection} (exists, skipped)`);
    return;
  }
  await client.request(createCollection(def));
  console.log(`+  ${def.collection}`);
}

async function main() {
  await client.login(EMAIL, PASSWORD);
  console.log(`Authenticated as ${EMAIL} @ ${URL}`);

  // --- Example collection: Strategic Partners (CMS module 2) ---
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

  // TODO — replicate ensureCollection(...) for every collection in SCHEMA.md:
  //   Content : hero_banners, product_categories, products, product_skus, documents,
  //             regional_hubs, industries, blog_posts, case_studies, iso_certifications, pages
  //   Portal  : customers, orders, order_items, invoices, deliveries, rfq_requests
  //
  // TODO — Roles (Admin exists by default): create Editor, Sales, Customer with
  //   createRole(...) and per-collection permissions. For Customer, add a
  //   row-level read filter on orders/invoices/deliveries:
  //       { customer: { user: { _eq: '$CURRENT_USER' } } }
  //
  // TODO — Enable translations (i18n) on text-bearing collections for vi/en/ja.

  console.log('\nBootstrap complete. Remaining collections/roles: see ./SCHEMA.md');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
