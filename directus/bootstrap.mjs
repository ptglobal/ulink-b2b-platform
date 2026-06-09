/**
 * ULink - Directus bootstrap.
 *
 * Logs in as the admin and creates collections/roles/policies/permissions/seed-data idempotently.
 * Run AFTER `docker compose up -d` (Directus healthy):
 *
 *   cd directus && npm install && npm run bootstrap
 */
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from './config.mjs';
import { createEnsureHelpers } from './lib/ensure-helpers.mjs';
import { COLLECTION_DEFS } from './schema/collections.mjs';
import { RELATION_DEFS } from './schema/relations.mjs';
import { ensureRoles } from './rbac/roles.mjs';
import { ensurePolicies } from './rbac/policies.mjs';
import { ensureAccessLinks } from './rbac/access.mjs';
import { ensurePermissions } from './rbac/permissions.mjs';
import { seedInitialContent } from './seed/initial_content.mjs';
import { seedDemoCommerce } from './seed/demo_commerce.mjs';

const client = createDirectusClient();
const helpers = createEnsureHelpers(client);

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
  await ensurePermissions(helpers);

  const ids = await seedInitialContent(helpers);
  await seedDemoCommerce(helpers, ids);

  console.log('\nBootstrap & seed data setup completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Bootstrap failed with error:', err);
  process.exit(1);
});
