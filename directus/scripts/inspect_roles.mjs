import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { createDirectus, rest, authentication, customEndpoint } from '@directus/sdk';

const URL = process.env.DIRECTUS_PUBLIC_URL ?? 'http://localhost:8055';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

const client = createDirectus(URL).with(authentication('json')).with(rest());

async function run() {
  await client.login(EMAIL, PASSWORD);
  console.log('Logged in successfully');

  const roles = await client.request(customEndpoint({ path: '/roles', method: 'GET' }));
  console.log('Roles:', JSON.stringify(roles, null, 2));

  const policies = await client.request(customEndpoint({ path: '/policies', method: 'GET' }));
  console.log('Policies:', JSON.stringify(policies, null, 2));

  const access = await client.request(customEndpoint({ path: '/access', method: 'GET' }));
  console.log('Access mappings:', JSON.stringify(access, null, 2));
}

run().catch(console.error);
