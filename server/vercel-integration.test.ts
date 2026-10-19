import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from './db/schema.js';
import type { Database } from './db/client.js';
import api from '../api/index.js';

const bridge = vi.hoisted(() => ({ connect: vi.fn(), attach: vi.fn(), end: vi.fn().mockResolvedValue(undefined) }));
vi.mock('./db/client.js', () => ({ connectDatabase: bridge.connect }));
vi.mock('@vercel/functions', () => ({ attachDatabasePool: bridge.attach }));
const client = new PGlite(), db = drizzle(client, { schema });
const origin = 'https://kodearcade.example.com';
const mail: { from: string; to: string[]; text: string; attachments: { content: string }[] }[] = [];
const email = 'adult@example.com', password = 'Synthetic-password-1937!';
const request = (path: string, body?: unknown, cookie?: string, from = origin) => api.fetch(new Request(new URL(path, origin), {
  method: body === undefined ? 'GET' : 'POST',
  headers: { Origin: from, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
}));
let cookie = '';
beforeAll(async () => {
  await migrate(db, { migrationsFolder: './drizzle' });
  bridge.connect.mockReturnValue({ db: db as unknown as Database, pool: { end: bridge.end } });
  for (const [key, value] of Object.entries({
    NODE_ENV: 'production', APP_ORIGIN: origin, BETTER_AUTH_SECRET: 'synthetic-vercel-only-092a76b18fd3c4e5',
    DATABASE_URL: 'postgresql://test:test@localhost/test', EMAIL_DELIVERY_MODE: 'production',
    RESEND_API_KEY: 're_synthetic_vercel_only', EMAIL_FROM: 'KodeArcade <no-reply@mail.example.com>',
    BYTE_PILOT_ENABLED: 'false',
  })) vi.stubEnv(key, value);
  vi.stubEnv('EMAIL_TEST_RECIPIENT', undefined);
  vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
    if (url !== 'https://api.resend.com/emails') throw new Error('Unexpected network access');
    mail.push(JSON.parse(options.body as string));
    return Response.json({ id: `synthetic-${mail.length}` });
  }));
}, 30000);
afterAll(async () => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); await client.close(); });
it('serves JSON routes with a shared pool and keeps unknown API paths out of the SPA', async () => {
  expect(await (await request('/api/health')).json()).toEqual({ status: 'ok', phase: 'foundation' });
  expect(await (await request('/api/capabilities')).json()).toMatchObject({ adultAccounts: true, cloudProgress: true, pdfCards: true });
  const unknown = await request('/api/missing?query=preserved');
  expect(unknown.status).toBe(404);
  expect(unknown.headers.get('content-type')).toContain('application/json');
  expect(unknown.headers.get('cache-control')).toBe('no-store');
  expect(bridge.connect).toHaveBeenCalledOnce();
  expect(bridge.attach).toHaveBeenCalledOnce();
  expect(bridge.end).not.toHaveBeenCalled();
});
it('rejects foreign-origin writes and unauthenticated student data', async () => {
  expect((await request('/api/auth/sign-up/email', { name: 'Synthetic', email, password }, undefined, 'https://foreign.example.com')).status).toBe(403);
  expect((await request('/api/student/progress/grade-6')).status).toBe(401);
  expect(mail).toHaveLength(0);
});
it('signs up through the real auth/Resend composition and verifies an adult', async () => {
  const signup = await request('/api/auth/sign-up/email', { name: 'Synthetic Adult', email, password, callbackURL: `${origin}/` });
  expect(signup.status).toBe(200);
  expect(mail).toHaveLength(1);
  expect(mail[0].from).toBe('KodeArcade <no-reply@mail.example.com>');
  expect(mail[0].to).toEqual([email]);
  expect(mail[0].attachments[0].content).not.toBe('');
  expect((await request('/api/auth/sign-in/email', { email, password })).status).toBe(403);
  const link = mail[0].text.match(/https:\/\/\S+\/api\/auth\/verify-email\?\S+/)![0];
  expect(new URL(link).origin).toBe(origin);
  expect((await api.fetch(new Request(link))).status).toBe(302);
});
it('preserves secure session cookies and returns the authenticated account', async () => {
  const login = await request('/api/auth/sign-in/email', { email, password });
  expect(login.status).toBe(200);
  const cookies = login.headers.getSetCookie();
  const session = cookies.find(value => value.startsWith('__Secure-kodearcade.session_token='))!;
  expect(session).toContain('HttpOnly');
  expect(session).toContain('Secure');
  expect(session.toLowerCase()).toContain('samesite=lax');
  expect(session.toLowerCase()).not.toContain('domain=');
  cookie = cookies.map(value => value.split(';')[0]).join('; ');
  expect(await (await request('/api/session', undefined, cookie)).json()).toMatchObject({ user: { name: 'Synthetic Adult', principalKind: 'adult' } });
});
it('resets a password through the API, invalidates the old session, then signs out', async () => {
  expect((await request('/api/auth/request-password-reset', { email, redirectTo: `${origin}/` })).status).toBe(200);
  expect(mail).toHaveLength(2);
  const link = new URL(mail[1].text.match(/https:\/\/\S+\/api\/auth\/reset-password\/\S+/)![0]);
  const nextPassword = 'Synthetic-new-password-8192!';
  expect((await request('/api/auth/reset-password', { token: link.pathname.split('/').at(-1), newPassword: nextPassword })).status).toBe(200);
  expect(await (await request('/api/session', undefined, cookie)).json()).toBeNull();
  expect((await request('/api/auth/sign-in/email', { email, password })).status).toBe(401);
  // Preserve Better Auth's short sign-in burst limit; simulate the next window.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(Date.now() + 11_000));
  const login = await request('/api/auth/sign-in/email', { email, password: nextPassword });
  expect(login.status).toBe(200);
  cookie = login.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  expect((await request('/api/auth/sign-out', {}, cookie)).status).toBe(200);
  expect(await (await request('/api/session', undefined, cookie)).json()).toBeNull();
});
