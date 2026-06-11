/**
 * ULink - Directus bootstrap.
 *
 * Logs in as the admin and creates collections/roles/policies/permissions/seed-data idempotently.
 * Run AFTER `docker compose up -d` (Directus healthy):
 *
 *   cd directus && npm install && npm run bootstrap
 */
import { createItem, readItems, updateItem } from '@directus/sdk';
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from './config.mjs';
import { createEnsureHelpers } from './lib/ensure-helpers.mjs';
import { ensureFolderTree } from './lib/folder-db.mjs';
import { DEFAULT_LOCALE, LOCALES } from './lib/i18n.mjs';
import { MEDIA_POLICY } from './lib/media-policy.mjs';
import { COLLECTION_DEFS } from './schema/collections.mjs';
import { RELATION_DEFS } from './schema/relations.mjs';
import { ensureRoles } from './rbac/roles.mjs';
import { ensurePolicies } from './rbac/policies.mjs';
import { ensureAccessLinks } from './rbac/access.mjs';
import { ensurePermissions } from './rbac/permissions.mjs';
import { seedInitialContent } from './seed/initial_content.mjs';
import { seedDemoCommerce } from './seed/demo_commerce.mjs';
import { applyDbIndexes } from './lib/db-indexes.mjs';

const client = createDirectusClient();
const helpers = createEnsureHelpers(client);

async function ensureLanguages() {
  for (const locale of LOCALES) {
    const existing = await client.request(
      readItems('languages', {
        filter: {
          code: { _eq: locale.code }
        },
        limit: 1
      })
    );

    const payload = {
      code: locale.code,
      name: locale.name,
      direction: locale.direction,
      sort: locale.sort
    };

    if (existing.length > 0) {
      await client.request(updateItem('languages', locale.code, payload));
      console.log(`=  Language: ${locale.code} (updated)`);
    } else {
      await client.request(createItem('languages', payload));
      console.log(`+  Language: ${locale.code} (created)`);
    }
  }
  console.log(`Fallback locale locked to ${DEFAULT_LOCALE}`);
}

async function ensureFolders() {
  const { root } = await ensureFolderTree(MEDIA_POLICY.moduleFolders, 'media');
  return root?.id ?? null;
}

async function main() {
  await loginAdmin(client);
  console.log(`Authenticated as ${DIRECTUS_ADMIN_EMAIL} @ ${DIRECTUS_URL}`);

  for (const collection of COLLECTION_DEFS) {
    await helpers.ensureCollection(collection);
  }

  for (const relation of RELATION_DEFS) {
    await helpers.ensureRelation(relation);
  }

  await ensureRoles(helpers);
  await ensurePolicies(helpers);
  await ensureAccessLinks(helpers);
  const publicPolicyId = await helpers.getPublicPolicyId();
  await ensurePermissions(helpers, publicPolicyId);
  await ensureLanguages();
  await ensureFolders();

  const ids = await seedInitialContent(helpers);
  await seedDemoCommerce(helpers, ids);

  // Apply PostgreSQL indexes for B2B queries
  await applyDbIndexes();

  console.log('\nBootstrap & seed data setup completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Bootstrap failed with error:', err);
  process.exit(1);
});
