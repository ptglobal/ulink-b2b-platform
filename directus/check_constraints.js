import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  const pgClient = new pg.Client({
    host: 'localhost',
    port: 5432,
    database: process.env.POSTGRES_DB || 'ulink',
    user: process.env.POSTGRES_USER || 'ulink',
    password: process.env.POSTGRES_PASSWORD
  });

  try {
    await pgClient.connect();
    console.log('Connected to DB.');
    const res = await pgClient.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'rfq_requests'::regclass;
    `);
    console.log(JSON.stringify(res.rows, null, 2));

    const res2 = await pgClient.query(`
      SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'rfq_requests';
    `);
    console.log(JSON.stringify(res2.rows, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pgClient.end();
  }
}

run();
