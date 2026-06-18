import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DIRECTUS_URL, DIRECTUS_ADMIN_EMAIL, DIRECTUS_ADMIN_PASSWORD } from '../lib/config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Login directly to get a token
const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: DIRECTUS_ADMIN_EMAIL, password: DIRECTUS_ADMIN_PASSWORD })
});

if (!loginRes.ok) {
  console.error(`Login failed: ${loginRes.status}`);
  process.exit(1);
}

const { data: { access_token } } = await loginRes.json();

const response = await fetch(`${DIRECTUS_URL}/server/specs/oas`, {
  headers: { Authorization: `Bearer ${access_token}` }
});

if (!response.ok) {
  console.error(`Failed to fetch OpenAPI spec: ${response.status}`);
  process.exit(1);
}

const spec = await response.json();

// Merge custom extension endpoints
const customPath = new URL('../extensions/docs-endpoint/openapi_custom_endpoints.json', import.meta.url);
const custom = JSON.parse(readFileSync(customPath, 'utf-8'));

for (const [path, methods] of Object.entries(custom.paths)) {
  spec.paths[path] = methods;
}

// Replace all security schemes with single BearerAuth
spec.components ??= {};
spec.components.securitySchemes = {
  BearerAuth: {
    type: 'http',
    scheme: 'bearer',
    description: 'Login: POST /auth/login {email, password} -> access_token'
  }
};

// Set global security to BearerAuth only
spec.security = [{ BearerAuth: [] }];

// Disable security for public authentication / server endpoints to avoid sending expired tokens in Swagger UI
const publicEndpoints = [
  { path: '/auth/login', method: 'post' },
  { path: '/auth/refresh', method: 'post' },
  { path: '/auth/logout', method: 'post' },
  { path: '/auth/password/request', method: 'post' },
  { path: '/auth/password/reset', method: 'post' },
  { path: '/auth/oauth', method: 'get' },
  { path: '/auth/oauth/{provider}', method: 'get' },
  { path: '/server/ping', method: 'get' }
];

for (const ep of publicEndpoints) {
  if (spec.paths[ep.path] && spec.paths[ep.path][ep.method]) {
    spec.paths[ep.path][ep.method].security = [];
  }
}

// Add custom tags
spec.tags ??= [];
const existingTags = new Set(spec.tags.map(t => t.name));
for (const tag of ['Customer Onboarding', 'Commercial Import', 'Media Policy', 'Documentation']) {
  if (!existingTags.has(tag)) {
    spec.tags.push({ name: tag });
  }
}

const outPath = path.resolve(__dirname, '../../openapi.json');
writeFileSync(outPath, JSON.stringify(spec, null, 2));
console.log(`Exported OpenAPI spec to ${outPath}`);
console.log(`  - Directus built-in endpoints: ${Object.keys(spec.paths).length - Object.keys(custom.paths).length}`);
console.log(`  - Custom extension endpoints: ${Object.keys(custom.paths).length}`);
console.log(`  - Total paths: ${Object.keys(spec.paths).length}`);

