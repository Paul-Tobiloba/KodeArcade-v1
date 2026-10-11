import { randomUUID, createHash } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { and, eq } from 'drizzle-orm';
import * as s from './db/schema.js';
import type { Database } from './db/client.js';
import { createAuth } from './auth.js';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const client = new PGlite(), db = drizzle(client, { schema: s });
const config = loadConfig({ NODE_ENV: 'test', APP_ORIGIN: 'https://learn.example.com', BETTER_AUTH_SECRET: 'synthetic-school-only-397a18b6f83f-139abca', DATABASE_URL: 'postgresql://test:test@localhost/test' });
const send = vi.fn().mockResolvedValue(undefined);
const auth = createAuth(db, config, { send }, { adultAccounts: true });
const app = createApp(auth, config, { auth, db: db as unknown as Database });
const password = 'Synthetic-school-only-passphrase-19';
const request = (path: string, body?: unknown, cookie = '') => app.request(`${config.APP_ORIGIN}/api/${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { Origin: config.APP_ORIGIN, Cookie: cookie, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
const cookies = (response: Response) => response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
type Actor = { cookie: string; locked: string; id: string; personal: string; personalClass: string; email: string };
let owner: Actor, teacher: Actor, stranger: Actor, deputy: Actor, schoolId: string, roomId: string;
async function adult(email: string): Promise<Actor> {
  await db.delete(s.rateLimit);
  send.mockClear();
  expect((await request('auth/sign-up/email', { name: `Synthetic ${email.split('@')[0]}`, email, password })).status).toBe(200);
  const link = send.mock.calls[0][0].text.split('\n').find((line: string) => line.startsWith('https://'));
  expect((await app.request(link)).status).toBe(302);
  const locked = cookies(await request('auth/sign-in/email', { email, password, rememberMe: false }));
  await request('account/onboarding', { role: 'teacher', name: 'Personal teaching' }, locked);
  const cookie = `${locked}; ${cookies(await request('manage/management/unlock', { password }, locked))}`;
  const [user] = await db.select().from(s.user).where(eq(s.user.email, email));
  const personal = (await (await request('account', undefined, cookie)).json()).workspaces[0].id;
  const created = await request('manage/classes', { organizationId: personal, name: 'Personal class', grade: 2, operationKey: randomUUID() }, cookie);
  return { cookie, locked, id: user.id, personal, personalClass: (await created.json()).id, email };
}
async function invite(actor: Actor, email: string, role: 'teacher' | 'school_admin' = 'teacher') {
  const response = await request(`schools/${schoolId}/invitations`, { email, role, operationKey: randomUUID() }, actor.cookie);
  expect(response.status).toBe(201);
  const result = await response.json();
  const token = new URLSearchParams(new URL(result.url).hash.split('?')[1]).get('token')!;
  return { token, result };
}
beforeAll(async () => {
  await migrate(db, { migrationsFolder: './drizzle' });
  owner = await adult('owner@example.com'); teacher = await adult('teacher@example.com'); stranger = await adult('stranger@example.com'); deputy = await adult('deputy@example.com');
}, 60000);
beforeEach(async () => { await db.delete(s.rateLimit); });
afterAll(async () => { await client.close(); });

it('requires verified adult, step-up and explicit authority; creates a separate school only once', async () => {
  const body = { name: 'Synthetic school', confirmAuthority: true, operationKey: randomUUID() };
  expect((await request('schools', body)).status).toBe(401);
  expect((await request('schools', body, owner.locked)).status).toBe(403);
  expect((await request('schools', { ...body, confirmAuthority: false }, owner.cookie)).status).toBe(400);
  const created = await request('schools', body, owner.cookie); expect(created.status).toBe(201); schoolId = (await created.json()).id;
  for (let attempt = 0; attempt < 2; attempt++) {
    const replay = await request('schools', body, owner.cookie);
    expect(replay.status).toBe(201); expect(await replay.json()).toEqual({ id: schoolId });
  }
  expect((await request('schools', { ...body, name: 'Changed name' }, owner.cookie)).status).toBe(409);
  const account = await (await request('account', undefined, owner.cookie)).json();
  expect(account.workspaces).toHaveLength(2);
  expect(account.classes).toMatchObject([{ id: owner.personalClass, organizationId: owner.personal }]);
  expect((await request(`schools/${schoolId}`, undefined, stranger.cookie)).status).toBe(404);
  const bodyClass = { organizationId: schoolId, name: 'School Grade 2', grade: 2, operationKey: randomUUID() };
  const room = await request('manage/classes', bodyClass, owner.cookie); expect(room.status).toBe(201); roomId = (await room.json()).id;
});
it('stores only invitation digests; binds acceptance to verified email and keeps personal classes separate', async () => {
  const { token, result } = await invite(owner, teacher.email.toUpperCase());
  expect(result.url).toContain('/#/school-join?token=');
  const rows = await db.select().from(s.schoolInvitation);
  expect(JSON.stringify(rows)).not.toContain(token);
  expect(rows[0].tokenDigest).toBe(createHash('sha256').update(token).digest('hex'));
  expect((await request('schools/invitation', { token }, stranger.cookie)).status).toBe(404);
  expect((await request('schools/accept', { token, confirm: true }, stranger.cookie)).status).toBe(404);
  expect((await request('schools/accept', { token, confirm: true }, teacher.locked)).status).toBe(403);
  expect(await (await request('schools/invitation', { token }, teacher.cookie)).json()).toMatchObject({ name: 'Synthetic school', role: 'teacher' });
  expect((await request('schools/accept', { token, confirm: true }, teacher.cookie)).status).toBe(200);
  expect((await request('schools/accept', { token, confirm: true }, teacher.cookie)).status).toBe(404);
  expect((await request(`schools/${schoolId}`, undefined, teacher.cookie)).status).toBe(404);
  expect((await request(`schools/${schoolId}/invitations`, { email: stranger.email, role: 'teacher', operationKey: randomUUID() }, teacher.cookie)).status).toBe(404);
  const account = await (await request('account', undefined, teacher.cookie)).json();
  expect(account.workspaces).toHaveLength(2);
  expect(account.classes.map((item: { id: string }) => item.id)).toEqual([teacher.personalClass]);
  expect((await request(`manage/classes/${roomId}`, undefined, teacher.cookie)).status).toBe(404);
  expect((await request(`manage/classes/${teacher.personalClass}`, undefined, owner.cookie)).status).toBe(404);
});
it('revokes, expires and replaces invitations without exposing links in school reads or audits', async () => {
  const first = await invite(owner, stranger.email);
  const second = await invite(owner, stranger.email);
  expect((await request('schools/accept', { token: first.token, confirm: true }, stranger.cookie)).status).toBe(404);
  const school = await (await request(`schools/${schoolId}`, undefined, owner.cookie)).json();
  expect(school.invitations).toHaveLength(1); expect(JSON.stringify(school)).not.toContain(second.token);
  expect((await request(`schools/${schoolId}/invitations/${school.invitations[0].id}/revoke`, { confirm: true }, owner.cookie)).status).toBe(200);
  expect((await request('schools/accept', { token: second.token, confirm: true }, stranger.cookie)).status).toBe(404);
  const third = await invite(owner, stranger.email);
  await db.update(s.schoolInvitation).set({ expiresAt: new Date(0) }).where(eq(s.schoolInvitation.tokenDigest, createHash('sha256').update(third.token).digest('hex')));
  expect((await request('schools/invitation', { token: third.token }, stranger.cookie)).status).toBe(404);
  expect((await request('schools/accept', { token: third.token, confirm: true }, stranger.cookie)).status).toBe(404);
  expect(JSON.stringify(await db.select().from(s.auditEvent))).not.toContain(third.token);
});
it('assigns only school members, blocks stale changes and immediately revokes reassigned teacher access', async () => {
  const path = `schools/${schoolId}/classes/${roomId}/staff`;
  expect((await request(path, { userIds: [stranger.id], previous: [owner.id], confirm: true }, owner.cookie)).status).toBe(400);
  expect((await request(path, { userIds: [teacher.id], previous: [], confirm: true }, owner.cookie)).status).toBe(409);
  expect((await request(path, { userIds: [teacher.id], previous: [owner.id], confirm: true }, owner.cookie)).status).toBe(200);
  expect((await request(`manage/classes/${roomId}`, undefined, teacher.cookie)).status).toBe(200);
  // Administrator access is organization-scoped, not dependent on class assignment.
  expect((await request(`manage/classes/${roomId}`, undefined, owner.cookie)).status).toBe(200);
  expect((await request(`manage/classes/${roomId}/progress?course=grade-2`, undefined, owner.cookie)).status).toBe(200);
  expect((await request(`manage/classes/${owner.personalClass}`, undefined, teacher.cookie)).status).toBe(404);
  expect((await request(path, { userIds: [], previous: [teacher.id], confirm: true }, owner.cookie)).status).toBe(200);
  expect((await request(`manage/classes/${roomId}`, undefined, teacher.cookie)).status).toBe(404);
  expect((await request(`manage/classes/${roomId}/update`, { name: 'Not allowed', grade: 2, operationKey: randomUUID() }, teacher.cookie)).status).toBe(404);
  expect((await request(`manage/classes/${roomId}`, undefined, owner.cookie)).status).toBe(200);
});
it('protects the last administrator and supports admin invitations and staff removal without data loss', async () => {
  const memberPath = `schools/${schoolId}/members/`;
  for (const role of ['teacher', 'remove']) expect((await request(memberPath + owner.id, { role, previousRole: 'school_admin', confirm: true }, owner.cookie)).status).toBe(409);
  const invited = await invite(owner, deputy.email, 'school_admin');
  expect((await request('schools/accept', { token: invited.token, confirm: true }, deputy.cookie)).status).toBe(200);
  expect((await request(`schools/${schoolId}`, undefined, deputy.cookie)).status).toBe(200);
  expect((await request(`manage/classes/${roomId}`, undefined, deputy.cookie)).status).toBe(200);
  const pending = await invite(deputy, stranger.email);
  expect((await request(memberPath + deputy.id, { role: 'teacher', previousRole: 'school_admin', confirm: true }, owner.cookie)).status).toBe(200);
  expect((await request('schools/accept', { token: pending.token, confirm: true }, stranger.cookie)).status).toBe(404);
  expect((await request(`schools/${schoolId}`, undefined, deputy.cookie)).status).toBe(404);
  expect((await request(memberPath + teacher.id, { role: 'remove', previousRole: 'school_admin', confirm: true }, owner.cookie)).status).toBe(409);
  expect((await request(memberPath + teacher.id, { role: 'remove', previousRole: 'teacher', confirm: true }, owner.cookie)).status).toBe(200);
  expect((await request('manage/classes', { organizationId: schoolId, name: 'No access', grade: 2, operationKey: randomUUID() }, teacher.cookie)).status).toBe(403);
  expect((await request(`manage/classes/${teacher.personalClass}`, undefined, teacher.cookie)).status).toBe(200);
  expect((await request(`manage/classes/${roomId}`, undefined, owner.cookie)).status).toBe(200);
  expect(await db.select().from(s.organizationMember).where(and(eq(s.organizationMember.organizationId, teacher.personal), eq(s.organizationMember.userId, teacher.id)))).toHaveLength(1);
  expect((await request(`schools/${schoolId}/classes/${teacher.personalClass}/staff`, { userIds: [], previous: [teacher.id], confirm: true }, owner.cookie)).status).toBe(404);
});
it('rejects consumed invitation keys and deliberately replaces lost links with a new key', async () => {
  const body = { email: 'recovery@example.com', role: 'teacher', operationKey: randomUUID() };
  const path = `schools/${schoolId}/invitations`;
  const first = await request(path, body, owner.cookie); expect(first.status).toBe(201);
  const firstToken = new URLSearchParams(new URL((await first.json()).url).hash.split('?')[1]).get('token')!;
  for (let attempt = 0; attempt < 2; attempt++) {
    const replay = await request(path, body, owner.cookie);
    expect(replay.status).toBe(409); expect(await replay.json()).toEqual({ code: 'ALREADY_PROCESSED' });
  }
  const replacement = await request(path, { ...body, operationKey: randomUUID() }, owner.cookie);
  expect(replacement.status).toBe(201);
  const rows = await db.select().from(s.schoolInvitation).where(and(eq(s.schoolInvitation.organizationId, schoolId), eq(s.schoolInvitation.email, body.email)));
  expect(rows).toHaveLength(2); expect(rows.filter(row => !row.closedAt)).toHaveLength(1);
  expect(rows.find(row => row.tokenDigest === createHash('sha256').update(firstToken).digest('hex'))?.closedAt).toBeTruthy();
});
it('does not let learner or unverified principals create a school', async () => {
  await db.update(s.user).set({ emailVerified: false }).where(eq(s.user.id, stranger.id));
  expect((await request('schools', { name: 'Denied', confirmAuthority: true, operationKey: randomUUID() }, stranger.cookie)).status).toBe(403);
  await db.update(s.user).set({ emailVerified: true, principalKind: 'learner' }).where(eq(s.user.id, stranger.id));
  expect((await request('schools', { name: 'Denied', confirmAuthority: true, operationKey: randomUUID() }, stranger.cookie)).status).toBe(403);
});
