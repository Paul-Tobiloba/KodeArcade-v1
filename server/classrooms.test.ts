import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { eq } from 'drizzle-orm';
import * as s from './db/schema.js';
import type { Database } from './db/client.js';
import type { Card } from './login-card.js';
import { createAuth } from './auth.js';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const cards = vi.hoisted(() => [] as Card[]);
const pdfFailure = vi.hoisted(() => ({ enabled: false }));
vi.mock('./login-card.js', () => ({ loginCard: async (card: Card) => { cards.push(card); return Buffer.from('%PDF-1.3 synthetic private card'); }, loginCards: async (batch: Card[]) => { if (pdfFailure.enabled) throw new Error('Synthetic PDF failure'); cards.push(...batch); return Buffer.from('%PDF-1.3 synthetic private booklet'); } }));
const client = new PGlite(), db = drizzle(client, { schema: s });
const config = loadConfig({ NODE_ENV: 'test', APP_ORIGIN: 'https://learn.example.com', BETTER_AUTH_SECRET: 'synthetic-classroom-only-397a18b6f83f-139abca', DATABASE_URL: 'postgresql://test:test@localhost/test' });
const send = vi.fn().mockResolvedValue(undefined);
const auth = createAuth(db, config, { send }, { adultAccounts: true });
const app = createApp(auth, config, { auth, db: db as unknown as Database });
const password = 'Synthetic-adult-only-passphrase-19';
const request = (path: string, body?: unknown, cookie = '') => app.request(`${config.APP_ORIGIN}/api/${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { Origin: config.APP_ORIGIN, Cookie: cookie, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
const cookies = (response: Response) => response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
let teacher: string, other: string, parent: string, organizationId: string, room: { id: string; code: string }, firstCard: Card, firstId: string;
async function adult(email: string, role: 'teacher' | 'parent' = 'teacher') {
  send.mockClear();
  expect((await request('auth/sign-up/email', { name: 'Synthetic Adult', email, password })).status).toBe(200);
  const link = send.mock.calls[0][0].text.split('\n').find((line: string) => line.startsWith('https://'));
  expect((await app.request(link)).status).toBe(302);
  const cookie = cookies(await request('auth/sign-in/email', { email, password, rememberMe: false }));
  expect((await request('account/onboarding', { role, name: 'Synthetic Workspace' }, cookie)).status).toBe(201);
  return cookie;
}
beforeAll(async () => {
  await migrate(db, { migrationsFolder: './drizzle' });
  teacher = await adult('class-teacher@example.com'); other = await adult('other-teacher@example.com'); parent = await adult('class-parent@example.com', 'parent');
  organizationId = (await (await request('account', undefined, teacher)).json()).workspaces[0].id;
  const unlock = await request('manage/management/unlock', { password }, teacher);
  expect(unlock.status).toBe(200); teacher += `; ${cookies(unlock)}`;
}, 30_000);
beforeEach(async () => { await db.delete(s.rateLimit); });
afterAll(async () => { await client.close(); });

it('requires adult authority and recent password proof for management', async () => {
  const body = { name: 'My class', grade: 2, organizationId, operationKey: randomUUID() };
  expect((await request('manage/classes', body)).status).toBe(401);
  expect((await request('manage/classes', body, other)).status).toBe(403);
  const bad = await request('manage/management/unlock', { password: 'not-correct' }, other);
  expect(bad.status).toBe(403);
  const unlock = await request('manage/management/unlock', { password }, parent);
  const parentCookie = `${parent}; ${cookies(unlock)}`;
  expect((await request('manage/classes', body, parentCookie)).status).toBe(403);
});
it('creates a class and grade assignment atomically, rejecting replay', async () => {
  const body = { name: 'Synthetic Grade 2', grade: 2, organizationId, operationKey: randomUUID() };
  const created = await request('manage/classes', body, teacher);
  expect(created.status).toBe(201); room = await created.json();
  expect(room.code).toMatch(/^[A-Z2-9]{8}$/);
  expect((await request('manage/classes', body, teacher)).status).toBe(409);
  expect((await request(`manage/classes/${room.id}`, undefined, other)).status).toBe(404);
  const result = await (await request(`manage/classes/${room.id}`, undefined, teacher)).json();
  expect(result.assignments).toMatchObject([{ courseKey: 'grade-2' }]); expect(result.learners).toEqual([]);
});
it('generates a picture credential in a private PDF without storing plaintext', async () => {
  const key = randomUUID();
  const body = { displayName: 'Synthetic Pupil', grade: 2, loginMethod: 'picture', operationKey: key };
  const response = await request(`manage/classes/${room.id}/students`, body, teacher);
  expect(response.status).toBe(200); expect(response.headers.get('content-type')).toBe('application/pdf'); expect(response.headers.get('cache-control')).toContain('no-store');
  expect(await response.text()).toContain('%PDF'); firstCard = cards.at(-1)!;
  expect(firstCard.credential).toHaveLength(4);
  const result = await (await request(`manage/classes/${room.id}`, undefined, teacher)).json();
  firstId = result.learners[0].id;
  expect(result.learners[0]).toMatchObject({ loginMethod: 'picture', username: firstCard.username, active: true });
  const [learner] = await db.select().from(s.learner).where(eq(s.learner.id, firstId));
  const [account] = await db.select().from(s.account).where(eq(s.account.userId, learner.authUserId));
  expect(account.password).not.toContain((firstCard.credential as string[]).join(','));
  expect(JSON.stringify(await db.select().from(s.auditEvent))).not.toContain(firstCard.username);
  expect((await request(`manage/classes/${room.id}/students`, body, teacher)).status).toBe(409);
});
it('reveals no public roster and validates class, individual and configured method', async () => {
  const lookup = await (await request('student/classroom', { classCode: room.code })).json();
  expect(lookup).toEqual({ found: true });
  expect((await request('auth/sign-in/username', { username: firstCard.username, password: 'anything' })).status).toBe(404);
  expect((await request('student/login', { classCode: room.code, username: firstCard.username, method: 'text', password: 'anything' })).status).toBe(401);
  expect((await request('student/login', { classCode: 'ZZZZZZZZ', username: firstCard.username, method: 'picture', pictures: firstCard.credential })).status).toBe(401);
  const signed = await request('student/login', { classCode: room.code, username: firstCard.username, method: 'picture', pictures: firstCard.credential });
  expect(signed.status).toBe(200); expect(await signed.json()).toEqual({ signedIn: true });
  const cookie = cookies(signed);
  const courses = await (await request('student/courses', undefined, cookie)).json();
  expect(courses).toMatchObject({ displayName: 'Synthetic Pupil', classroomId: room.id, assignments: [{ courseKey: 'grade-2' }], progressMode: 'cloud' });
  expect((await request('account', undefined, cookie)).status).toBe(403);
  expect((await request(`manage/classes/${room.id}`, undefined, cookie)).status).toBe(403);
  expect((await request('student/courses', undefined, teacher)).status).toBe(401);
  expect(JSON.stringify(await (await request('auth/get-session', undefined, cookie)).json())).not.toContain('@learners.invalid');
  expect((await request('student/login', { classCode: room.code, username: firstCard.username, method: 'picture', pictures: firstCard.credential }, teacher)).status).toBe(409);
  expect((await request('auth/sign-out', {}, cookie)).status).toBe(200);
  expect((await request('student/courses', undefined, cookie)).status).toBe(401);
});
it('assignment changes are teacher-owned and visible only to enrolled learners', async () => {
  const assignment = { courseKey: 'grade-5', assigned: true, operationKey: randomUUID() };
  expect((await request(`manage/classes/${room.id}/assignments`, assignment, other)).status).toBe(403);
  expect((await request(`manage/classes/${room.id}/assignments`, assignment, teacher)).status).toBe(200);
  expect((await request(`manage/classes/${room.id}/assignments`, { ...assignment, courseKey: 'arbitrary-code', operationKey: randomUUID() }, teacher)).status).toBe(400);
});
it('reset changes the login method and revokes old credentials and sessions', async () => {
  const signed = await request('student/login', { classCode: room.code, username: firstCard.username, method: 'picture', pictures: firstCard.credential });
  expect(signed.status).toBe(200); const cookie = cookies(signed);
  const body = { loginMethod: 'text', operationKey: randomUUID() };
  expect((await request(`manage/classes/${room.id}/students/${firstId}/reset`, body, teacher)).status).toBe(200);
  const resetCard = cards.at(-1)!;
  expect(resetCard.credential).toMatch(/^[a-z]+ [a-z]+ [a-z]+$/);
  expect((await request('student/courses', undefined, cookie)).status).toBe(401);
  expect((await request('student/login', { classCode: room.code, username: firstCard.username, method: 'picture', pictures: firstCard.credential })).status).toBe(401);
  const newLogin = await request('student/login', { classCode: room.code, username: resetCard.username, method: 'text', password: resetCard.credential });
  expect(newLogin.status).toBe(200);
  expect((await request(`manage/classes/${room.id}/students/${firstId}/reset`, body, teacher)).status).toBe(409);
  expect((await request(`manage/classes/${room.id}/students/${firstId}/update`, { displayName: 'Synthetic Pupil', grade: 2, active: false, operationKey: randomUUID() }, teacher)).status).toBe(200);
  expect((await request('student/courses', undefined, cookies(newLogin))).status).toBe(401);
  expect((await request('student/login', { classCode: room.code, username: resetCard.username, method: 'text', password: resetCard.credential })).status).toBe(401);
});
it('persists individual guessing limits across equivalent login calls', async () => {
  for (let i = 0; i < 5; i++) expect((await request('student/login', { classCode: room.code, username: 'sabcdefgh', method: 'picture', pictures: ['sun', 'sun', 'sun', 'sun'] })).status).toBe(401);
  expect((await request('student/login', { classCode: room.code, username: 'sabcdefgh', method: 'text', password: 'anything' })).status).toBe(429);
});
it('allocates lowercase first names, then surnames, then random digits on collisions', async () => {
  const usernames: string[] = [];
  for (let i = 0; i < 3; i++) {
    const response = await request(`manage/classes/${room.id}/students`, { displayName: 'Tobi Jnr', grade: 4, loginMethod: 'text', operationKey: randomUUID() }, teacher);
    expect(response.status).toBe(200);
    usernames.push(cards.at(-1)!.username);
  }
  expect(usernames[0]).toBe('tobi');
  expect(usernames[1]).toBe('tobijnr');
  expect(usernames[2]).toMatch(/^tobijnr[0-9]{4,6}$/);
  expect(new Set(usernames).size).toBe(3);
});
it('validates CSV before writes, scopes authority and imports a private mixed-method booklet atomically', async () => {
  const path = `manage/classes/${room.id}/students/import`;
  const body = { csv: 'name,grade,login_method\nBatch Alex,2,picture\nBatch Sam,5,text\n', operationKey: randomUUID() };
  expect((await request(path, body)).status).toBe(401);
  expect((await request(path, body, other)).status).toBe(403);
  expect((await request(path, { ...body, csv: 'email,password\nx,y' }, teacher)).status).toBe(400);
  const before = await db.select().from(s.enrollment).where(eq(s.enrollment.classroomId, room.id));
  const result = await request(path, body, teacher);
  expect(result.status).toBe(200); expect(result.headers.get('cache-control')).toContain('no-store'); expect(await result.text()).toContain('%PDF');
  const batch = cards.slice(-2); expect(batch[0].method).toBe('picture'); expect(batch[1].method).toBe('text'); expect(batch[1].username).toBe('batchsam');
  expect((await db.select().from(s.enrollment).where(eq(s.enrollment.classroomId, room.id))).length).toBe(before.length + 2);
  expect((await request(path, body, teacher)).status).toBe(409);
  expect((await request(path, { ...body, operationKey: randomUUID() }, teacher)).status).toBe(409);
  expect((await db.select().from(s.enrollment).where(eq(s.enrollment.classroomId, room.id))).length).toBe(before.length + 2);
  const signed = await request('student/login', { classCode: room.code, username: batch[1].username, method: 'text', password: batch[1].credential });
  expect(signed.status).toBe(200);
});
it('rolls back the entire import if private PDF rendering fails', async () => {
  const before = (await db.select().from(s.enrollment).where(eq(s.enrollment.classroomId, room.id))).length;
  pdfFailure.enabled = true;
  try { expect((await request(`manage/classes/${room.id}/students/import`, { csv: 'name,grade,login_method\nRollback One,2,picture\nRollback Two,4,text', operationKey: randomUUID() }, teacher)).status).toBe(500); }
  finally { pdfFailure.enabled = false; }
  expect((await db.select().from(s.enrollment).where(eq(s.enrollment.classroomId, room.id))).length).toBe(before);
  expect((await db.select().from(s.user).where(eq(s.user.name, 'Rollback One'))).length).toBe(0);
});
it('requires explicit reset confirmation, rejects foreign IDs and rotates all selected credentials and sessions', async () => {
  const roster = (await (await request(`manage/classes/${room.id}`, undefined, teacher)).json()).learners;
  const students = roster.filter((student: { displayName: string }) => student.displayName.startsWith('Batch '));
  const studentIds = students.map((student: { id: string }) => student.id);
  const path = `manage/classes/${room.id}/students/reset-cards`, body = { studentIds, operationKey: randomUUID(), confirmReset: true };
  expect((await request(path, { ...body, confirmReset: false }, teacher)).status).toBe(400);
  expect((await request(path, { ...body, studentIds: [studentIds[0], randomUUID()] }, teacher)).status).toBe(404);
  expect((await request(path, { ...body, studentIds: [studentIds[0], studentIds[0]] }, teacher)).status).toBe(400);
  const oldCard = cards.find(card => card.name === 'Batch Sam')!;
  const signed = await request('student/login', { classCode: room.code, username: oldCard.username, method: 'text', password: oldCard.credential });
  expect(signed.status).toBe(200); const cookie = cookies(signed);
  const response = await request(path, body, teacher); expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toContain('no-store');
  expect((await request('student/courses', undefined, cookie)).status).toBe(401);
  expect((await request('student/login', { classCode: room.code, username: oldCard.username, method: 'text', password: oldCard.credential })).status).toBe(401);
  const next = cards.slice(-2).find(card => card.name === oldCard.name)!;
  expect((await request('student/login', { classCode: room.code, username: next.username, method: 'text', password: next.credential })).status).toBe(200);
  expect((await request(path, body, teacher)).status).toBe(409);
});
it('saves all assignments atomically and refuses a stale teacher selection', async () => {
  const path = `manage/classes/${room.id}/assignments/save`;
  const previous = (await (await request(`manage/classes/${room.id}`, undefined, teacher)).json()).assignments.map((item: { courseKey: string }) => item.courseKey);
  const body = { courses: ['grade-3', 'grade-6'], previous, operationKey: randomUUID() };
  expect((await request(path, body, other)).status).toBe(403);
  expect((await request(path, body, teacher)).status).toBe(200);
  expect((await request(path, { ...body, courses: ['grade-1'], operationKey: randomUUID() }, teacher)).status).toBe(409);
  const result = await (await request(`manage/classes/${room.id}`, undefined, teacher)).json();
  expect(result.assignments.map((item: { courseKey: string }) => item.courseKey).sort()).toEqual(['grade-3', 'grade-6']);
  expect((await request(path, { courses: [], previous: ['grade-3', 'grade-6'], operationKey: randomUUID() }, teacher)).status).toBe(200);
  expect((await (await request(`manage/classes/${room.id}`, undefined, teacher)).json()).assignments).toEqual([]);
});
