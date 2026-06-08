import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import { createDirectus, rest, authentication, readItems } from '@directus/sdk';

const URL = process.env.DIRECTUS_PUBLIC_URL ?? 'http://localhost:8055';
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

const client = createDirectus(URL).with(authentication('json')).with(rest());

async function run() {
  await client.login(EMAIL, PASSWORD);
  console.log('Logged in successfully');

  // Test standard readItems
  const all = await client.request(readItems('industries'));
  console.log('All industries count:', all.length);
  console.log('All industries:', JSON.stringify(all, null, 2));

  // Test filtered readItems
  const filtered = await client.request(readItems('industries', {
    filter: {
      slug: {
        _eq: 'electronics'
      }
    }
  }));
  console.log('Filtered industries count:', filtered.length);
  console.log('Filtered industries:', JSON.stringify(filtered, null, 2));
}

run().catch(console.error);
