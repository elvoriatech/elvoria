import { Pool, type PoolConfig } from 'pg';

declare global {
  var __pgPool: Pool | undefined;
}

function poolConfig(): PoolConfig | null {
  // Prefer a full connection string if provided.
  const url = process.env.DATABASE_URL?.trim();
  if (url) return { connectionString: url };

  // Otherwise assemble from individual POSTGRES_* vars.
  const host = process.env.POSTGRES_HOST?.trim();
  const user = process.env.POSTGRES_USER?.trim();
  const database = process.env.POSTGRES_DB?.trim();
  if (!host || !user || !database) return null;

  return {
    host,
    user,
    database,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT?.trim() || 5432),
  };
}

export function isDbConfigured(): boolean {
  return poolConfig() !== null;
}

/** Returns the shared pg Pool. Throws if no database config is present. */
export function getPool(): Pool {
  const config = poolConfig();
  if (!config) {
    throw new Error(
      'Database not configured. Set DATABASE_URL, or POSTGRES_HOST / POSTGRES_USER / POSTGRES_DB (+ POSTGRES_PASSWORD / POSTGRES_PORT).'
    );
  }
  if (!global.__pgPool) {
    global.__pgPool = new Pool(config);
  }
  return global.__pgPool;
}
