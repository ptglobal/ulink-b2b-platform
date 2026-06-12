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
  const res = await fetch(`${URL}/items/products`);
  console.log('Public fetch products status:', res.status);
  const text = await res.text();
  console.log('Public fetch products body:', text);
}

run().catch(console.error);
