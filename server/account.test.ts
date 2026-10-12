import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { eq } from 'drizzle-orm';
import * as schema from './db/schema.js';
import type { Database } from './db/client.js';
import { createAuth } from './auth.js';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createOTP } from '@better-auth/utils/otp';
import { base32 } from '@better-auth/utils/base32';

const client = new PGlite(), db = drizzle(client, { schema });
const config = loadConfig({ NODE_ENV: 'test', APP_ORIGIN: 'https://learn.example.com', BETTER_AUTH_SECRET: 'synthetic-only-auth-test-f379e95023de43e0beef', DATABASE_URL: 'postgresql://test:test@localhost/test' });
const send = vi.fn().mockResolvedValue(undefined);
const auth = createAuth(db, config, { send }, { adultAccounts: true, emailAllowed: email => email.endsWith('@example.com') });
const app = createApp(auth, config, { auth, db: db as unknown as Database });
const password = 'Synthetic-test-passphrase-927';
const request = (path: string, body?: unknown, cookie?: string) => app.request(`${config.APP_ORIGIN}/api/${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { Origin: config.APP_ORIGIN, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
function cookies(response: Response) { return response.headers.getSetCookie().map(value => value.split(';')[0]).join('; '); }
async function verifiedAdult(email: string) {
  send.mockClear();
  const created = await request('auth/sign-up/email', { name: 'Synthetic Adult', email, password, principalKind: 'learner', callbackURL: `${config.APP_ORIGIN}/#/email-verified` });
  expect(created.status).toBe(200);
  const link = send.mock.calls[0][0].text.split('\n').find((line: string) => line.startsWith('https://'));
  const verified = await app.request(link);
  expect(verified.status).toBe(302);
  const signedIn = await request('auth/sign-in/email', { email, password, rememberMe: false });
  expect(signedIn.status).toBe(200);
  return cookies(signedIn);
}
beforeAll(async () => { await migrate(db, { migrationsFolder: './drizzle' }); });
// Isolate Better Auth's HTTP budget; application-level budgets remain persistent.
beforeEach(async () => { await db.delete(schema.rateLimit); });
afterAll(async () => { await client.close(); });

describe('adult account HTTP integration', () => {
  it('advertises only implemented capabilities and protects private data', async () => {
    expect(await (await request('capabilities')).json()).toMatchObject({ adultAccounts: true, classroomLogin: true, pdfCards: true, cloudProgress: true });
    expect((await request('account')).status).toBe(401);
    expect((await request('account/onboarding', { role: 'teacher', name: 'My workspace' })).status).toBe(401);
    expect((await request('auth/two-factor/enable', { password })).status).toBe(401);
    expect((await request('auth/sign-in/username', { username: 'pupil', password })).status).toBe(404);
  });
  it('verifies email before login, ignores spoofed principal and creates only an owned workspace', async () => {
    send.mockClear();
    expect((await request('auth/sign-up/email', { name: 'Synthetic Adult', email: 'unverified@example.com', password })).status).toBe(200);
    expect((await request('auth/sign-in/email', { email: 'unverified@example.com', password })).status).toBe(403);
    const cookie = await verifiedAdult('teacher@example.com');
    const user = (await db.select().from(schema.user).where(eq(schema.user.email, 'teacher@example.com')))[0];
    expect(user.principalKind).toBe('adult');
    expect((await request('account/onboarding', { role: 'school_admin', name: 'Not allowed' }, cookie)).status).toBe(400);
    expect((await request('account/onboarding', { role: 'teacher', name: 'My teaching workspace', organizationId: 'other-school' }, cookie)).status).toBe(201);
    expect((await request('account/onboarding', { role: 'parent', name: 'Duplicate workspace' }, cookie)).status).toBe(200);
    const result = await (await request('account', undefined, cookie)).json();
    expect(result.workspaces).toHaveLength(1);
    expect(result.workspaces[0]).toMatchObject({ name: 'My teaching workspace', kind: 'teacher_workspace', role: 'teacher' });
    expect(result.workspaces[0].id).not.toBe('other-school');
    expect(result.classes).toEqual([]);
    const otherCookie = await verifiedAdult('parent@example.com');
    expect((await (await request('account', undefined, otherCookie)).json()).workspaces).toEqual([]);
    await request('auth/sign-out', {}, cookie);
    expect((await request('account', undefined, cookie)).status).toBe(401);
  });
  it('rejects non-test email before creating an account or sending mail', async () => {
    send.mockClear();
    expect((await request('auth/sign-up/email', { name: 'Not a test', email: 'not-allowed@other.test', password })).status).toBe(403);
    expect(await db.select().from(schema.user).where(eq(schema.user.email, 'not-allowed@other.test'))).toEqual([]);
    expect(send).not.toHaveBeenCalled();
  });
  it('blocks learner email login and recovery; persists mail-attempt limits', async () => {
    await db.insert(schema.user).values({ id: 'synthetic-pupil', name: 'Synthetic Pupil', email: 'student@example.com', principalKind: 'learner', emailVerified: true });
    expect((await request('auth/sign-in/email', { email: 'student@example.com', password })).status).toBe(400);
    expect((await request('auth/request-password-reset', { email: 'student@example.com' })).status).toBe(400);
    // Direct API calls bypass Better Auth's HTTP limiter, not our persistent budget.
    for (let i = 0; i < 3; i++) await expect(auth.api.requestPasswordReset({ body: { email: 'missing@example.com' } })).resolves.toMatchObject({ status: true });
    await expect(auth.api.requestPasswordReset({ body: { email: 'missing@example.com' } })).rejects.toMatchObject({ status: 'TOO_MANY_REQUESTS' });
  });
  it('keeps recovery callbacks on the application origin', async () => {
    expect((await request('auth/request-password-reset', { email: 'teacher@example.com', redirectTo: 'https://attacker.test/' })).status).toBeGreaterThanOrEqual(400);
  });
  it('keeps MFA optional, verifies enrollment, and preserves MFA checks for adults who opt in', async () => {
    const cookie = await verifiedAdult('optional-mfa@example.com');
    const unlocked = await request('manage/management/unlock', { password }, cookie);
    expect(unlocked.status).toBe(200);
    expect(await unlocked.json()).toEqual({ unlockedForSeconds: 1800 });
    expect(unlocked.headers.getSetCookie().join(';')).toContain('Max-Age=1800');
    const setupResponse = await request('auth/two-factor/enable', { password }, cookie);
    expect(setupResponse.status).toBe(200);
    const setup = await setupResponse.json();
    expect((await (await request('account', undefined, cookie)).json()).profile.twoFactorEnabled).toBe(false);
    const secret = new TextDecoder().decode(base32.decode(new URL(setup.totpURI).searchParams.get('secret')!));
    const code = await createOTP(secret).totp();
    const confirmed = await request('auth/two-factor/verify-totp', { code, trustDevice: false }, cookie);
    expect(confirmed.status).toBe(200);
    const enrolledCookie = cookies(confirmed);
    expect((await (await request('account', undefined, enrolledCookie)).json()).profile.twoFactorEnabled).toBe(true);
    expect((await request('manage/management/unlock', { password }, enrolledCookie)).status).toBe(403);
    expect((await request('manage/management/unlock', { password, code: 'invalid' }, enrolledCookie)).status).toBe(400);
    expect((await request('manage/management/unlock', { password, code }, enrolledCookie)).status).toBe(200);
    await request('auth/sign-out', {}, enrolledCookie);
    const signingIn = await request('auth/sign-in/email', { email: 'optional-mfa@example.com', password, rememberMe: false });
    expect(await signingIn.json()).toMatchObject({ twoFactorRedirect: true });
    expect((await request('account', undefined, cookies(signingIn))).status).toBe(401);
    expect((await request('auth/two-factor/verify-totp', { code, trustDevice: false }, cookies(signingIn))).status).toBe(200);
  });
  it('completes password recovery and revokes the previous session', async () => {
    const cookie = await verifiedAdult('recovery@example.com');
    send.mockClear();
    const requested = await request('auth/request-password-reset', { email: 'recovery@example.com', redirectTo: `${config.APP_ORIGIN}/#/reset-password` });
    expect(requested.status).toBe(200);
    const link = send.mock.calls[0][0].text.split('\n').find((line: string) => line.startsWith('https://'));
    const callback = await app.request(link);
    expect(callback.status).toBe(302);
    const redirected = new URL(callback.headers.get('location')!);
    const token = redirected.searchParams.get('token') ?? new URLSearchParams(redirected.hash.split('?')[1] ?? '').get('token');
    expect(token).toBeTruthy();
    expect((await request('auth/reset-password', { token, newPassword: 'New-synthetic-passphrase-295' })).status).toBe(200);
    expect((await request('account', undefined, cookie)).status).toBe(401);
    expect((await request('auth/sign-in/email', { email: 'recovery@example.com', password: 'New-synthetic-passphrase-295' })).status).toBe(200);
    expect((await request('auth/reset-password', { token, newPassword: password })).status).toBeGreaterThanOrEqual(400);
  });
});
