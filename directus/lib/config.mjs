import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createDirectus, rest, authentication } from '@directus/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const DIRECTUS_URL = process.env.DIRECTUS_PUBLIC_URL ?? 'http://localhost:8055';
export const DIRECTUS_ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
export const DIRECTUS_ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

if (!DIRECTUS_ADMIN_EMAIL || !DIRECTUS_ADMIN_PASSWORD) {
  throw new Error('Missing Directus admin credentials in ../../.env');
}

export function createDirectusClient() {
  return createDirectus(DIRECTUS_URL).with(authentication('json')).with(rest());
}

export async function loginAdmin(client) {
  await client.login(DIRECTUS_ADMIN_EMAIL, DIRECTUS_ADMIN_PASSWORD);
  return client;
}
