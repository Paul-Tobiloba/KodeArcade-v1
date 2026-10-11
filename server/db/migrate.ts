import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { connectDatabase } from './client.js';

if (existsSync('.env')) process.loadEnvFile('.env');
const connectionString = process.env.DATABASE_MIGRATION_URL;
if (!connectionString) throw new Error('DATABASE_MIGRATION_URL is required; no runtime URL fallback');
const target = new URL(connectionString);
if (target.hostname !== process.env.DATABASE_MIGRATION_HOST || target.hostname.includes('-pooler.')) {
  throw new Error('Migration requires an explicitly confirmed direct database hostname');
}
if (process.env.NODE_ENV === 'production') throw new Error('Production migrations need a reviewed deployment workflow');
const { db, pool } = connectDatabase(connectionString);
try {
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)) });
  console.info('Database migrations applied');
} finally {
  await pool.end();
}
