import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '../db/schema.js';
import { createAuth } from '../auth.js';
import { loadConfig } from '../config.js';

const client = new PGlite();
const db = drizzle(client, { schema });
const config = loadConfig({ NODE_ENV: 'test', APP_ORIGIN: 'https://learn.example.com', BETTER_AUTH_SECRET: 'synthetic-test-only-81397cacf240b59ec069d1f2', DATABASE_URL: 'postgresql://test:test@localhost/test' });
const send = vi.fn().mockResolvedValue(undefined);
const auth = createAuth(db, config, { send });

beforeAll(async () => {
  await migrate(db, { migrationsFolder: './drizzle' });
  await db.insert(schema.user).values([
    { id: 'synthetic-adult', name: 'Synthetic Adult', email: 'adult@example.com', principalKind: 'adult' },
    { id: 'synthetic-learner', name: 'Synthetic Pupil', email: 'pupil@learners.example.invalid', principalKind: 'learner' },
  ]);
});
afterAll(async () => { await client.close(); });

describe('Better Auth email callbacks with the Drizzle adapter', () => {
  it('passes the server-controlled adult principal into verification delivery', async () => {
    send.mockClear();
    await auth.api.sendVerificationEmail({ body: { email: 'adult@example.com', callbackURL: `${config.APP_ORIGIN}/` } });
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][0].text).toContain('/api/auth/verify-email?token=');
    expect(send.mock.calls[0][0].to).toBe('adult@example.com');
  });
  it('passes the adult principal into password recovery with 15-minute expiry', async () => {
    send.mockClear();
    await auth.api.requestPasswordReset({ body: { email: 'adult@example.com', redirectTo: `${config.APP_ORIGIN}/` } });
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][0].text).toContain('/api/auth/reset-password/');
    expect(send.mock.calls[0][0].text).toContain('15 minutes');
    expect(auth.options.emailAndPassword?.revokeSessionsOnPasswordReset).toBe(true);
  });
  it('refuses learner delivery even through a direct server-side auth API call', async () => {
    send.mockClear();
    await expect(auth.api.sendVerificationEmail({ body: { email: 'pupil@learners.example.invalid' } })).rejects.toThrow();
    // The principal guard rejects learner recovery before mail callbacks run.

    await expect(auth.api.requestPasswordReset({ body: { email: 'pupil@learners.example.invalid' } })).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  });
});
