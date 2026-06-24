/**
 * ULink - Directus bootstrap.
 *
 * Logs in as the admin and creates collections/roles/policies/permissions/seed-data idempotently.
 * Run AFTER `docker compose up -d` (Directus healthy):
 *
 *   cd directus && npm install && npm run bootstrap
 */
// Import functions from Directus SDK
import { createItem, readItems, updateItem } from '@directus/sdk';
// Import connection configurations for Directus client and admin authentication
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from './lib/config.mjs';
// Import idempotent helper creation utility
import { createEnsureHelpers } from './lib/ensure-helpers.mjs';
// Import helper to set up the media folder tree structure
import { ensureFolderTree } from './lib/folder-db.mjs';
// Import system localization (i18n) settings
import { DEFAULT_LOCALE, LOCALES } from './lib/i18n.mjs';
// Import system media management policy rules
import { MEDIA_POLICY } from './lib/media-policy.mjs';
// Import schema definitions for custom collections and relationships
import { COLLECTION_DEFS } from './schema/collections.mjs';
import { RELATION_DEFS } from './schema/relations.mjs';
// Import setup functions for Role-Based Access Control (RBAC) permissions
import { ensureRoles } from './rbac/roles.mjs';
import { ensurePolicies } from './rbac/policies.mjs';
import { ensureAccessLinks } from './rbac/access.mjs';
import { ensurePermissions } from './rbac/permissions.mjs';
import { seedGeography } from './seed/geography.mjs';
// Import initialization seed content tasks
import { seedInitialContent } from './seed/initial_content.mjs';
import { seedDemoCommerce } from './seed/demo_commerce.mjs';
import { seedAdditionalContent } from './seed/additional_content.mjs';
import { seedExtendedProducts } from './seed/extended_products.mjs';
// Import helper to apply relational database index enhancements
import { applyDbIndexes } from './lib/db-indexes.mjs';
// Import constant identifier representing the visitor role
import { VISITOR_ROLE_ID, SALES_ROLE_ID, FRONTEND_SERVICE_ROLE_ID } from './lib/constants.mjs';

// Initialize the Directus SDK client and instantiate helper wrappers
const client = createDirectusClient();
const helpers = createEnsureHelpers(client);

// Configure system supported languages (i18n) in an idempotent manner
async function ensureLanguages() {
  for (const locale of LOCALES) {
    // Check if the locale configuration already exists in Directus
    const existing = await client.request(
      readItems('languages', {
        filter: {
          code: { _eq: locale.code }
        },
        fields: ['code'],
        limit: 1
      })
    );

    const payload = {
      code: locale.code,
      name: locale.name,
      direction: locale.direction,
      sort: locale.sort
    };

    // If it exists, update it to the latest schema definitions
    if (existing.length > 0) {
      await client.request(updateItem('languages', locale.code, payload));
      console.log(`=  Language: ${locale.code} (updated)`);
    } else {
      // If it doesn't exist, create a new language entry
      try {
        await client.request(createItem('languages', payload));
        console.log(`+  Language: ${locale.code} (created)`);
      } catch (err) {
        // Handle race condition / stale read — language may already exist
        const msg = err?.errors?.[0]?.message ?? err?.message ?? '';
        if (msg.includes('unique')) {
          await client.request(updateItem('languages', locale.code, payload));
          console.log(`=  Language: ${locale.code} (updated, was already present)`);
        } else {
          throw err;
        }
      }
    }
  }
  console.log(`Fallback locale locked to ${DEFAULT_LOCALE}`);
}

// Establish the default media file structure directory path mappings
async function ensureFolders() {
  const { root } = await ensureFolderTree(MEDIA_POLICY.moduleFolders, 'media');
  return root?.id ?? null;
}

// Main execution process orchestrating the Directus system bootstrap sequence
async function main() {
  // 1. Authenticate with admin privileges via the Directus REST API
  await loginAdmin(client);
  console.log(`Authenticated as ${DIRECTUS_ADMIN_EMAIL} @ ${DIRECTUS_URL}`);

  // 2. Provision and update data schema collections (database tables)
  for (const collection of COLLECTION_DEFS) {
    await helpers.ensureCollection(collection);
  }

  // 3. Define and map relation references between established collections
  for (const relation of RELATION_DEFS) {
    await helpers.ensureRelation(relation);
  }

  // 4. Configure system-managed access roles
  await ensureRoles(helpers);
  // 5. Build policy documents managing resource access boundaries
  await ensurePolicies(helpers);
  // 6. Map relationships linking roles to corresponding policies
  await ensureAccessLinks(helpers);
  // 7. Resolve the default public role policy ID and assign specific permissions
  const publicPolicyId = await helpers.getPublicPolicyId();
  await ensurePermissions(helpers, publicPolicyId);
  // 8. Provision configured localization locales
  await ensureLanguages();
  // 9. Enforce system directory structuring policies for file uploads
  await ensureFolders();

  // 10. Seed default content, transactional models, and catalog listings
  const geography = await seedGeography(helpers);
  const ids = await seedInitialContent(helpers, client, geography);
  await seedDemoCommerce(helpers, ids);
  await seedAdditionalContent(helpers, ids, geography);
  await seedExtendedProducts(helpers, client);

  // 11. Create a specialized API user mapping to serve the Next.js frontend
  const frontendToken = process.env.DIRECTUS_FRONTEND_TOKEN;
  if (frontendToken) {
    await helpers.ensureUser({
      email: 'frontend-api@ulink.vn',
      password: 'unused-frontend-api-user',
      role: FRONTEND_SERVICE_ROLE_ID,
      first_name: 'Frontend',
      last_name: 'API',
      status: 'active',
      token: frontendToken
    });
    console.log(`Frontend API token provisioned for frontend-api@ulink.vn`);
  }

  // 12. Run post-migration raw SQL statements setting up query optimizations
  await applyDbIndexes();

  console.log('\nBootstrap & seed data setup completed successfully!');
  process.exit(0);
}

// Execute the bootstrapping procedure and handle uncaught process errors
main().catch((err) => {
  console.error('Bootstrap failed with error:', err);
  process.exit(1);
});
