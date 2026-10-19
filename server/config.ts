import { z } from 'zod';

const loopback = new Set(['127.0.0.1', 'localhost', '[::1]']);

export function databaseUrl(value: string): string {
  const url = new URL(value);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.username || !url.password || url.pathname === '/') {
    throw new Error('A complete PostgreSQL connection URL is required');
  }
  if (!loopback.has(url.hostname) && !['require', 'verify-full'].includes(url.searchParams.get('sslmode') ?? '')) {
    throw new Error('Remote PostgreSQL requires TLS');
  }
  if (/ROLE|PASSWORD|ENDPOINT/.test(value)) throw new Error('Replace database placeholders');
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv) {
  // Do not include rejected values in configuration errors: URLs contain credentials.
  const result = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    APP_ORIGIN: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    DATABASE_URL: z.string().min(1),
  }).safeParse(env);
  if (!result.success) throw new Error('Missing or invalid server configuration');
  const config = result.data;
  const origin = new URL(config.APP_ORIGIN);
  if (origin.origin !== config.APP_ORIGIN || origin.username || origin.password || origin.hostname.includes('*') ||
      !['http:', 'https:'].includes(origin.protocol) ||
      (origin.protocol !== 'https:' && (config.NODE_ENV === 'production' || !loopback.has(origin.hostname)))) {
    throw new Error('APP_ORIGIN must be an exact origin, HTTPS except on local development');
  }
  if (/REPLACE|example|change.?me/i.test(config.BETTER_AUTH_SECRET) || new Set(config.BETTER_AUTH_SECRET).size < 12) {
    throw new Error('Generate a random BETTER_AUTH_SECRET');
  }
  databaseUrl(config.DATABASE_URL);
  return Object.freeze(config);
}

export type ServerConfig = ReturnType<typeof loadConfig>;
