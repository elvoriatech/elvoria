import nextEnv from '@next/env';
import pg from 'pg';
import { readFileSync } from 'node:fs';

nextEnv.loadEnvConfig(process.cwd());

const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT || 5432),
  connectionTimeoutMillis: 10000,
});

try {
  const sql = readFileSync('db/schema.sql', 'utf8');
  await pool.query(sql);
  console.log('SCHEMA APPLIED OK');
  const t = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('TABLES:', t.rows.map(x => x.table_name).join(', '));
} catch (e) {
  console.error('SETUP FAILED:', e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
