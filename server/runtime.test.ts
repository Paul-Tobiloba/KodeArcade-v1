import { beforeEach, expect, it, vi } from 'vitest';
import { createRuntime } from './runtime.js';

const mocks = vi.hoisted(() => ({
  db: {}, pool: { end: vi.fn().mockResolvedValue(undefined) },
  connect: vi.fn(), auth: vi.fn(), app: vi.fn(), mailer: vi.fn(),
}));
vi.mock('./db/client.js', () => ({ connectDatabase: mocks.connect }));
vi.mock('./auth.js', () => ({ createAuth: mocks.auth }));
vi.mock('./app.js', () => ({ createApp: mocks.app }));
vi.mock('./email/mailer.js', () => ({ createResendMailer: mocks.mailer }));
const env = {
  NODE_ENV: 'production', APP_ORIGIN: 'https://learn.example.com',
  BETTER_AUTH_SECRET: 'synthetic-runtime-only-a28f37094cb5d198',
  DATABASE_URL: 'postgresql://test:test@localhost/test', EMAIL_DELIVERY_MODE: 'disabled',
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.connect.mockReturnValue({ db: mocks.db, pool: mocks.pool });
  mocks.auth.mockReturnValue({ handler: vi.fn() });
  mocks.app.mockReturnValue({ fetch: vi.fn() });
});
it('composes the same app without listening, and leaves disabled accounts disabled', () => {
  const attach = vi.fn();
  const result = createRuntime(env, attach);
  expect(result.pool).toBe(mocks.pool);
  expect(attach).toHaveBeenCalledExactlyOnceWith(mocks.pool);
  expect(mocks.app.mock.calls[0][2]).toBeUndefined();
  expect(mocks.auth.mock.calls[0][3].adultAccounts).toBe(false);
  expect(mocks.pool.end).not.toHaveBeenCalled();
});
it('wires production mail and account routes without weakening the delivery restriction', () => {
  createRuntime({ ...env, EMAIL_DELIVERY_MODE: 'production', RESEND_API_KEY: 're_synthetic_runtime_only', EMAIL_FROM: 'KodeArcade <no-reply@mail.example.com>' });
  expect(mocks.app.mock.calls[0][2]).toMatchObject({ db: mocks.db });
  expect(mocks.auth.mock.calls[0][3].emailAllowed('adult@example.com')).toBe(true);
  vi.clearAllMocks();
  createRuntime({ ...env, NODE_ENV: 'development', EMAIL_DELIVERY_MODE: 'development', RESEND_API_KEY: 're_synthetic_runtime_only', EMAIL_FROM: 'onboarding@resend.dev', EMAIL_TEST_RECIPIENT: 'tester@example.com' });
  const access = mocks.auth.mock.calls[0][3];
  expect(access.emailAllowed('tester@example.com')).toBe(true);
  expect(access.emailAllowed('another@example.com')).toBe(false);
});
it('validates all configuration before creating a pool', () => {
  expect(() => createRuntime({ ...env, APP_ORIGIN: 'https://*.example.com' })).toThrow();
  expect(() => createRuntime({ ...env, BYTE_PILOT_ENABLED: 'true' })).toThrow('development-only');
  expect(() => createRuntime({ ...env, EMAIL_DELIVERY_MODE: 'production', EMAIL_FROM: 'onboarding@resend.dev', RESEND_API_KEY: 're_synthetic_runtime_only' })).toThrow();
  expect(mocks.connect).not.toHaveBeenCalled();
});
it('releases a newly created pool if platform attachment fails', () => {
  expect(() => createRuntime(env, () => { throw new Error('attachment failed'); })).toThrow('attachment failed');
  expect(mocks.pool.end).toHaveBeenCalledOnce();
});
