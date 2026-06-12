import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function applyDbIndexes() {
  console.log('\n--- Automated DB Indexes Setup ---');
  
  const pgClient = new pg.Client({
    host: process.env.DB_HOST_EXTERNAL || 'localhost',
    port: parseInt(process.env.DB_PORT_EXTERNAL || '5432', 10),
    database: process.env.POSTGRES_DB || 'ulink',
    user: process.env.POSTGRES_USER || 'ulink',
    password: process.env.POSTGRES_PASSWORD,
  });

  try {
    await pgClient.connect();
    console.log('Connected to PostgreSQL database for index setup.');

    const sqlFilePath = path.resolve(__dirname, '../sql/migrations/2026-06-10-add-query-indexes.sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Migration SQL file not found at ${sqlFilePath}`);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL statements by semicolon and filter empty statements
    const statements = sqlContent
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`Found ${statements.length} index statements to execute.`);

    for (const statement of statements) {
      console.log(`Executing: ${statement}`);
      await pgClient.query(statement);
    }

    console.log('All DB indexes applied successfully!');
  } catch (error) {
    console.error('Failed to apply DB indexes:', error);
    throw error;
  } finally {
    await pgClient.end();
  }
}
