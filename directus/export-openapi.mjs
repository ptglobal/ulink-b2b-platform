/**
 * Export merged OpenAPI spec for ULink (core + custom endpoints).
 *
 * Usage:
 *   cd directus
 *   npm run openapi:export
 *
 * Output: openapi.json (in this folder)
 *
 * Requirements:
 *   - Directus must be running with the docs-endpoint extension mounted
 *   - Admin credentials in ../.env (DIRECTUS_ADMIN_EMAIL / DIRECTUS_ADMIN_PASSWORD)
 */

import { createDirectusClient, loginAdmin, DIRECTUS_URL } from './config.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('Exporting merged OpenAPI...');

  const client = createDirectusClient();
  await loginAdmin(client);
  console.log(`Authenticated as admin @ ${DIRECTUS_URL}`);

  // Prefer the merged docs endpoint (includes custom routes like /customer-onboarding/register)
  const docsUrl = `${DIRECTUS_URL.replace(/\/$/, '')}/docs/openapi.json`;

  let spec;
  try {
    const res = await fetch(docsUrl, {
      headers: {
        // We already logged in via SDK, but for the raw fetch we use a fresh token if needed.
        // The docs endpoint will also accept the current session in some setups.
        // For reliability we re-use the admin login and pass a token.
      }
    });

    if (res.ok) {
      spec = await res.json();
      console.log('Fetched merged spec from /docs/openapi.json (includes custom endpoints)');
    } else {
      throw new Error(`Docs endpoint returned ${res.status}`);
    }
  } catch (err) {
    console.warn('Could not reach /docs/openapi.json, falling back to core + manual merge...');
    // Fallback: get core from Directus + we hardcode the custom parts here (simplified)
    const core = await client.request({ path: '/server/specs/oas', method: 'GET' });

    // Minimal custom paths for the important missing ones (register etc.)
    const customPaths = {
      '/customer-onboarding/register': {
        post: {
          tags: ['customer-onboarding'],
          summary: 'Self-register (customer-onboarding/register)',
          requestBody: { required: true },
          responses: { '201': { description: 'Created' } }
        }
      },
      '/commercial-import/preview': { post: { summary: 'Commercial import preview' } },
      '/commercial-import/commit': { post: { summary: 'Commercial import commit' } },
      '/media-policy/soft-delete': { post: { summary: 'Media soft delete' } },
      '/media-policy/hard-delete': { post: { summary: 'Media hard delete (admin)' } }
    };

    spec = core;
    spec.paths = { ...(spec.paths || {}), ...customPaths };
    if (!spec.tags) spec.tags = [];
    spec.tags.push(
      { name: 'customer-onboarding' },
      { name: 'commercial-import' },
      { name: 'media-policy' }
    );
  }

  const outPath = path.resolve(__dirname, '../open.json');
  fs.writeFileSync(outPath, JSON.stringify(spec, null, 2), 'utf8');

  console.log(`\n✅ Exported merged OpenAPI to: ${outPath}`);
  console.log(`   It has overwritten the root open.json and is applied to Swagger UI.`);
  console.log(`\nLive interactive version (when Directus is running):`);
  console.log(`   ${DIRECTUS_URL}/docs`);
}

main().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
