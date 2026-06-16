/**
 * Applies db/schema.sql to the configured PostgreSQL database.
 * Reads connection settings from .env.local via @next/env (DATABASE_URL or POSTGRES_*).
 *
 * Usage: npm run db:setup
 */
import nextEnv from '@next/env';
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

nextEnv.loadEnvConfig(process.cwd());

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '..', 'db', 'schema.sql');

function buildConfig() {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return { connectionString: url };
  return {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT || 5432),
  };
}

const pool = new pg.Pool({ ...buildConfig(), connectionTimeoutMillis: 10000 });

try {
  const sql = readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('Schema applied successfully.');
  const t = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log('Tables:', t.rows.map((x) => x.table_name).join(', '));
} catch (e) {
  console.error('Schema setup failed:', e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
