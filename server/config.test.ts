import { describe, expect, it } from 'vitest';
import { databaseUrl, loadConfig } from './config.js';

const testEnv = {
  NODE_ENV: 'test', APP_ORIGIN: 'http://127.0.0.1:3001',
  BETTER_AUTH_SECRET: 'synthetic-test-only-81397cacf240b59ec069d1f2',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
};

describe('server configuration', () => {
  it('accepts loopback development', () => {
    expect(loadConfig(testEnv).PORT).toBe(3001);
    expect(Object.isFrozen(loadConfig(testEnv))).toBe(true);
  });
  it('rejects missing and placeholder secrets', () => {
    expect(() => loadConfig({})).toThrow('configuration');
    expect(() => loadConfig({ ...testEnv, BETTER_AUTH_SECRET: 'REPLACE_WITH_AT_LEAST_32_RANDOM_BYTES' })).toThrow('random');
    expect(() => loadConfig({ ...testEnv, BETTER_AUTH_SECRET: 'a'.repeat(40) })).toThrow('random');
  });
  it.each(['https://example.com/path', 'https://example.com/', 'https://*.example.com', 'http://example.com', 'https://name:secret@example.com'])('rejects unsafe origin %s', APP_ORIGIN => {
    expect(() => loadConfig({ ...testEnv, APP_ORIGIN })).toThrow();
  });
  it('requires production HTTPS even on loopback', () => {
    expect(() => loadConfig({ ...testEnv, NODE_ENV: 'production' })).toThrow('HTTPS');
    expect(loadConfig({ ...testEnv, NODE_ENV: 'production', APP_ORIGIN: 'https://learn.example.com' }).NODE_ENV).toBe('production');
  });
  it('requires TLS on remote databases without echoing rejected URLs', () => {
    const bad = 'postgresql://user:secret-do-not-echo@remote.example/db';
    expect(() => databaseUrl(bad)).toThrow('TLS');
    try { databaseUrl(bad); } catch (error) { expect(String(error)).not.toContain('secret-do-not-echo'); }
    expect(databaseUrl(`${bad}?sslmode=verify-full`)).toContain('verify-full');
    expect(() => databaseUrl('https://example.com')).toThrow('PostgreSQL');
  });
});
