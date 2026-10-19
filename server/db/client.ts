import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { databaseUrl } from '../config.js';
import * as schema from './schema.js';

export function connectDatabase(connectionString: string) {
  const url = new URL(databaseUrl(connectionString));
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  // pg's sslmode=require can relax certificate checking. Force verification explicitly.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'uselibpqcompat']) url.searchParams.delete(key);
  const pool = new Pool({ connectionString: url.toString(), ssl: local ? false : { rejectUnauthorized: true }, max: 5, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 30_000 });
  pool.on('error', () => { console.error('Database pool unavailable'); });
  return { db: drizzle(pool, { schema }), pool };
}

export type Database = ReturnType<typeof connectDatabase>['db'];
