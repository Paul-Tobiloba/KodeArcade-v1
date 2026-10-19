import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { createHmac } from 'node:crypto';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { getTableColumns } from 'drizzle-orm';
import { getAuthTables } from 'better-auth/db';
import * as schema from './schema.js';
import { createAuth } from '../auth.js';
import { createApp } from '../app.js';
import { loadConfig } from '../config.js';
import { consumeLoginBudget, throttleKey } from '../security/login-throttle.js';

const client = new PGlite();
const db = drizzle(client, { schema });
const config = loadConfig({ NODE_ENV: 'test', APP_ORIGIN: 'https://learn.example.com', BETTER_AUTH_SECRET: 'synthetic-test-only-81397cacf240b59ec069d1f2', DATABASE_URL: 'postgresql://test:test@localhost/test' });
const auth = createAuth(db, config);

beforeAll(async () => {
  await migrate(db, { migrationsFolder: './drizzle' });
  await db.insert(schema.organization).values([{ id: 'school-a', name: 'Test A', kind: 'school' }, { id: 'school-b', name: 'Test B', kind: 'school' }]);
  await db.insert(schema.user).values([{ id: 'teacher-a', name: 'Test Teacher', email: 'teacher@example.invalid' }, { id: 'learner-b-user', name: 'Test Pupil', email: 'learner@example.invalid', principalKind: 'learner' }]);
  await db.insert(schema.organizationMember).values({ organizationId: 'school-a', userId: 'teacher-a', role: 'teacher' });
  await db.insert(schema.classroom).values({ id: 'class-a', organizationId: 'school-a', name: 'Class A', code: 'SYNTHETIC-A', grade: 2 });
  await db.insert(schema.learner).values({ id: 'learner-b', organizationId: 'school-b', authUserId: 'learner-b-user', displayName: 'Pupil B', grade: 2, loginMethod: 'picture' });
});
afterAll(async () => { await client.close(); });

describe('Drizzle migration and Better Auth adapter', () => {
  it('matches every required field of the installed auth plugins', () => {
    for (const [name, table] of Object.entries(getAuthTables(auth.options))) {
      const columns = getTableColumns(schema[name as keyof typeof schema]);
      expect(columns, name).toHaveProperty('id');
      for (const field of Object.keys(table.fields)) expect(columns, `${name}.${field}`).toHaveProperty(field);
    }
  });
  it('reapplies the migration runner without changing schema', async () => {
    await expect(migrate(db, { migrationsFolder: './drizzle' })).resolves.toBeUndefined();
  });
  it('prevents cross-school enrollment and staff assignments at the database boundary', async () => {
    await expect(db.insert(schema.enrollment).values({ organizationId: 'school-a', classroomId: 'class-a', learnerId: 'learner-b' })).rejects.toThrow();
    await expect(db.insert(schema.classroomStaff).values({ organizationId: 'school-b', classroomId: 'class-a', userId: 'teacher-a' })).rejects.toThrow();
    await expect(db.insert(schema.classroomStaff).values({ organizationId: 'school-a', classroomId: 'class-a', userId: 'learner-b-user' })).rejects.toThrow();
    await expect(db.insert(schema.classroomStaff).values({ organizationId: 'school-a', classroomId: 'class-a', userId: 'teacher-a' })).resolves.toBeDefined();
  });
  it('enforces grade range and classroom-code uniqueness', async () => {
    await expect(db.insert(schema.classroom).values({ id: 'bad-grade', organizationId: 'school-a', name: 'Bad', code: 'BAD', grade: 7 })).rejects.toThrow();
    await expect(db.insert(schema.classroom).values({ id: 'duplicate', organizationId: 'school-b', name: 'Duplicate', code: 'SYNTHETIC-A', grade: 1 })).rejects.toThrow();
  });
  it('keeps signup disabled inside Better Auth too', async () => {
    const response = await auth.handler(new Request('https://learn.example.com/api/auth/sign-up/email', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: config.APP_ORIGIN }, body: JSON.stringify({ email: 'new@example.invalid', name: 'New', password: 'SyntheticOnly123!' }) }));
    expect(response.status).toBe(404);
  });
  it('reads and revokes a database-backed session with the actual HTTP handler', async () => {
    const context = await auth.$context;
    const saved = await context.internalAdapter.createSession('teacher-a');
    expect(saved).toBeTruthy();
    const signature = createHmac('sha256', config.BETTER_AUTH_SECRET).update(saved!.token).digest('base64');
    const cookie = `__Secure-kodearcade.session_token=${encodeURIComponent(`${saved!.token}.${signature}`)}`;
    const app = createApp(auth, config);
    const response = await app.request('/api/auth/get-session', { headers: { Cookie: cookie } });
    expect(response.status).toBe(200);
    expect((await response.json()).user.id).toBe('teacher-a');
    const out = await app.request('/api/auth/sign-out', { method: 'POST', headers: { Cookie: cookie, Origin: config.APP_ORIGIN } });
    expect(out.status).toBe(200);
    const after = await app.request('/api/auth/get-session', { headers: { Cookie: cookie } });
    expect(await after.json()).toBeNull();
  });
});

describe('persistent application login budget', () => {
  it('obscures raw identifiers and separates scopes', () => {
    const key = throttleKey(config.BETTER_AUTH_SECRET, 'account', 'pupil-name');
    expect(key).toMatch(/^[a-f0-9]{64}$/);
    expect(key).not.toContain('pupil-name');
    expect(key).not.toBe(throttleKey(config.BETTER_AUTH_SECRET, 'class', 'pupil-name'));
  });
  it('allows exactly the budget across concurrent callers', async () => {
    const key = throttleKey(config.BETTER_AUTH_SECRET, 'account', 'concurrent');
    const results = await Promise.all(Array.from({ length: 12 }, () => consumeLoginBudget(db, key, 5, 60)));
    expect(results.filter(x => x.allowed)).toHaveLength(5);
    expect(results.every(x => x.retryAfterSeconds > 0)).toBe(true);
    const rows = await db.select().from(schema.loginThrottle);
    expect(rows[0].count).toBe(6);
  });
  it('rejects malformed budgets and fails closed on database failure', async () => {
    await expect(consumeLoginBudget(db, 'raw-pupil-name', 5, 60)).rejects.toThrow('Invalid');
    const broken = { execute: async () => { throw new Error('unavailable'); } };
    await expect(consumeLoginBudget(broken, 'a'.repeat(64), 5, 60)).rejects.toThrow('unavailable');
  });
});
