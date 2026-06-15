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
    password: process.env.POSTGRES_PASSWORD
  });

  try {
    await pgClient.connect();
    console.log('Connected to PostgreSQL database for index setup.');

    const migrationDir = path.resolve(__dirname, '../sql/migrations');
    if (!fs.existsSync(migrationDir)) {
      throw new Error(`Migration directory not found at ${migrationDir}`);
    }

    const sqlFiles = fs
      .readdirSync(migrationDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    if (sqlFiles.length === 0) {
      throw new Error(`No SQL migrations found in ${migrationDir}`);
    }

    for (const fileName of sqlFiles) {
      const sqlFilePath = path.join(migrationDir, fileName);
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      const statements = sqlContent
        .split(';')
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      console.log(`Applying ${fileName}: ${statements.length} statement(s).`);
      for (const statement of statements) {
        console.log(`Executing: ${statement}`);
        await pgClient.query(statement);
      }
    }

    console.log('All DB indexes applied successfully!');
  } catch (error) {
    console.error('Failed to apply DB indexes:', error);
    throw error;
  } finally {
    await pgClient.end();
  }
}
