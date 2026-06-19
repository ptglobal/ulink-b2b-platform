/**
 * Fix presentation-divider fields that were incorrectly registered
 * as real database columns by Directus createCollection.
 * 
 * These fields should be alias-only (no DB column). This script:
 * 1. Checks if the divider columns exist in the actual DB table
 * 2. Checks directus_fields metadata for the special marker
 * 3. Ensures divider fields have special = '["alias","no-data"]' so Directus
 *    knows not to query them as real columns.
 */
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pgClient = new pg.Client({
  host: process.env.DB_HOST_EXTERNAL || 'localhost',
  port: parseInt(process.env.DB_PORT_EXTERNAL || '5432', 10),
  database: process.env.POSTGRES_DB || 'ulink',
  user: process.env.POSTGRES_USER || 'ulink',
  password: process.env.POSTGRES_PASSWORD
});

const DIVIDER_FIELDS = ['divider_warehouse', 'divider_sla', 'divider_team'];
const COLLECTION = 'regional_hubs';

async function main() {
  await pgClient.connect();
  console.log('Connected to PostgreSQL.');

  // 1. Check if columns exist in the actual DB table
  const { rows: columns } = await pgClient.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = $1 AND column_name = ANY($2)
  `, [COLLECTION, DIVIDER_FIELDS]);

  if (columns.length > 0) {
    console.log('Found real DB columns that should not exist:', columns.map(c => c.column_name));
    for (const col of columns) {
      console.log(`  Dropping column: ${col.column_name}`);
      await pgClient.query(`ALTER TABLE ${COLLECTION} DROP COLUMN IF EXISTS "${col.column_name}"`);
    }
    console.log('Dropped spurious columns.');
  } else {
    console.log('No spurious DB columns found (good).');
  }

  // 2. Check directus_fields metadata
  const { rows: fields } = await pgClient.query(`
    SELECT id, field, special
    FROM directus_fields 
    WHERE collection = $1 AND field = ANY($2)
  `, [COLLECTION, DIVIDER_FIELDS]);

  console.log('\nDirectus field metadata:');
  for (const f of fields) {
    console.log(`  ${f.field}: special = ${JSON.stringify(f.special)}`);
    
    // Ensure special includes 'alias' and 'no-data'
    let special = f.special;
    if (typeof special === 'string') {
      try { special = JSON.parse(special); } catch { special = [special]; }
    }
    if (!Array.isArray(special)) special = [];
    
    const needsAlias = !special.includes('alias');
    const needsNoData = !special.includes('no-data');
    
    if (needsAlias || needsNoData) {
      if (needsAlias) special.push('alias');
      if (needsNoData) special.push('no-data');
      await pgClient.query(
        `UPDATE directus_fields SET special = $1 WHERE id = $2`,
        [JSON.stringify(special), f.id]
      );
      console.log(`    -> Updated special to ${JSON.stringify(special)}`);
    } else {
      console.log(`    -> Already correct.`);
    }
  }

  if (fields.length === 0) {
    console.log('  No divider fields found in directus_fields metadata.');
  }

  await pgClient.end();
  console.log('\nDone. Restart Directus to pick up metadata changes.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
