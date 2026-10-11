import { afterAll, beforeAll, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { createHmac } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { createAuth } from './auth.js';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import type { Database } from './db/client.js';
import * as s from './db/schema.js';
import { curriculumVersion, type ProgressDocument } from '../shared/progress.js';
import { emptyQuiz, moduleQuiz } from '../shared/quizzes.js';

const client = new PGlite(), db = drizzle(client, { schema: s });
const config = loadConfig({ NODE_ENV: 'test', APP_ORIGIN: 'https://learn.example.com', BETTER_AUTH_SECRET: 'synthetic-progress-secret-only-173982a50b72', DATABASE_URL: 'postgresql://test:test@localhost/test' });
const auth = createAuth(db, config), app = createApp(auth, config, { auth, db: db as unknown as Database });
let pupil = '', other = '', adult = '';
const scope = { learnerId: 'pupil', classroomId: 'class-a' };
const document = (): ProgressDocument => ({ version: 1, currentId: 'grade-2-sequences-1', view: 'challenge', progress: { 'grade-2-sequences-1': { blocks: [], attempts: 1, hints: 0, complete: true, stars: 5, textCode: 'move_right()' } }, drawings: {}, preferences: { reducedMotion: false, largeText: false, soundEnabled: true, musicEnabled: false }, basicsComplete: [], topicRecords: {} });
const request = (cookie = pupil, body?: unknown, course = 'grade-2') => app.request(`/api/student/progress/${course}`, { method: body === undefined ? 'GET' : 'POST', headers: { Cookie: cookie, Origin: config.APP_ORIGIN, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
async function session(id: string, learnerId?: string, classroomId?: string) {
  const saved = await (await auth.$context).internalAdapter.createSession(id);
  if (learnerId) await db.insert(s.learnerSession).values({ sessionId: saved!.id, organizationId: 'school', classroomId: classroomId!, learnerId, credentialVersion: 1 });
  const signature = createHmac('sha256', config.BETTER_AUTH_SECRET).update(saved!.token).digest('base64');
  return `__Secure-kodearcade.session_token=${encodeURIComponent(`${saved!.token}.${signature}`)}`;
}
beforeAll(async () => {
  await migrate(db, { migrationsFolder: './drizzle' });
  await db.insert(s.organization).values({ id: 'school', name: 'Synthetic school', kind: 'school' });
  await db.insert(s.user).values(['pupil', 'other', 'adult'].map(id => ({ id, name: 'Synthetic', email: `${id}@example.test`, emailVerified: true, principalKind: id === 'adult' ? 'adult' as const : 'learner' as const })));
  await db.insert(s.organizationMember).values({ organizationId: 'school', userId: 'adult', role: 'teacher' });
  await db.insert(s.classroom).values(['class-a', 'class-b'].map(id => ({ id, organizationId: 'school', name: id, code: id, grade: 2 })));
  await db.insert(s.classroomStaff).values({ organizationId: 'school', classroomId: 'class-a', userId: 'adult' });
  await db.insert(s.learner).values(['pupil', 'other'].map(id => ({ id, organizationId: 'school', authUserId: id, displayName: 'Synthetic Pupil', grade: 2, loginMethod: 'text' as const })));
  await db.insert(s.enrollment).values([{ organizationId: 'school', classroomId: 'class-a', learnerId: 'pupil' }, { organizationId: 'school', classroomId: 'class-b', learnerId: 'other' }]);
  await db.insert(s.courseAssignment).values(['class-a', 'class-b'].map(id => ({ id, classroomId: id, courseKey: 'grade-2', curriculumVersion })));
  pupil = await session('pupil', 'pupil', 'class-a'); other = await session('other', 'other', 'class-b'); adult = await session('adult');
}, 30000);
afterAll(() => client.close());
it('requires an enrolled learner session and an assigned course', async () => {
  expect((await request('')).status).toBe(401); expect((await request(adult)).status).toBe(401);
  expect((await request(pupil, undefined, 'grade-6')).status).toBe(403);
  expect(await (await request()).json()).toMatchObject({ ...scope, revision: 0, document: null, updatedAt: null });
});
it('checks archived class state even if a signed learner session still exists', async () => {
  await db.update(s.classroom).set({ archivedAt: new Date() }).where(eq(s.classroom.id, 'class-a'));
  try {
    expect((await request()).status).toBe(401);
    expect((await request(pupil, { ...scope, revision: 0, document: document() })).status).toBe(401);
    expect((await app.request('/api/student/courses', { headers: { Cookie: pupil } })).status).toBe(401);
  } finally { await db.update(s.classroom).set({ archivedAt: null }).where(eq(s.classroom.id, 'class-a')); }
  expect((await request()).status).toBe(200);
});
it('issues course/student/version-bound recovery keys only to the authenticated assigned student', async () => {
  const own = (await (await request()).json()).recovery;
  const second = (await (await request()).json()).recovery;
  const foreign = (await (await request(other)).json()).recovery;
  expect(own).toEqual(second); expect(own.key).toMatch(/^[A-Za-z0-9_-]{43}$/); expect(own.key).not.toBe(own.slot); expect(own.key).not.toBe(foreign.key);
  expect(JSON.stringify(await (await request(adult)).json())).not.toContain(own.key);
});
it('persists drafts, completion and best stars; retries are idempotent', async () => {
  const payload = { ...scope, revision: 0, document: document() };
  expect((await request(pupil, payload)).status).toBe(200);
  expect((await (await request(pupil, payload)).json()).revision).toBe(1);
  const saved = await (await request()).json(); expect(saved.document).toEqual(payload.document); expect(saved.revision).toBe(1);
  expect((await (await request(other)).json()).document).toBeNull();
  expect((await request(other, { ...payload, revision: 1 })).status).toBe(401);
});
it('rejects stale concurrent writes without overwriting newer code', async () => {
  const first = document(); first.progress['grade-2-sequences-1'].textCode = 'move_left()';
  const second = document(); second.progress['grade-2-sequences-1'].textCode = 'move_up()';
  const responses = await Promise.all([request(pupil, { ...scope, revision: 1, document: first }), request(pupil, { ...scope, revision: 1, document: second })]);
  expect(responses.map(r => r.status).sort()).toEqual([200, 409]);
});
it('never decreases earned completion/stars on a later draft edit', async () => {
  const next = document(); next.progress['grade-2-sequences-1'] = { blocks: [], hints: 0, attempts: 0, complete: false, textCode: 'new draft' };
  expect((await request(pupil, { ...scope, revision: 2, document: next })).status).toBe(200);
  expect((await (await request()).json()).document.progress['grade-2-sequences-1']).toMatchObject({ complete: true, stars: 5, attempts: 1, textCode: 'new draft' });
});
it('rejects cross-course IDs, oversized workspace, arbitrary fields and invalid scores', async () => {
  const invalid = [ { ...document(), currentId: 'grade-6-loops-1' }, { ...document(), drawings: { arbitrary: { attempts: 0, complete: false } } }, { ...document(), progress: { 'grade-2-sequences-1': { blocks: [], hints: 0, attempts: 1, complete: true, stars: 99 } } }, { ...document(), progress: { 'grade-2-sequences-1': { blocks: [], hints: 0, attempts: 1, complete: false, workspace: { text: 'a'.repeat(100001) } } } } ];
  for (const value of invalid) expect((await request(pupil, { ...scope, revision: 3, document: value })).status).toBe(400);
  expect((await request(pupil, { ...scope, revision: 3, document: document(), userId: 'other' })).status).toBe(400);
});
it('returns real summary and retains progress after sign-out/new login', async () => {
  const response = await app.request('/api/student/courses', { headers: { Cookie: pupil } });
  expect((await response.json()).assignments[0].progress).toMatchObject({ completed: 1, stars: 5, started: true });
  await app.request('/api/auth/sign-out', { method: 'POST', headers: { Cookie: pupil, Origin: config.APP_ORIGIN } });
  pupil = await session('pupil', 'pupil', 'class-a');
  expect((await (await request()).json()).revision).toBe(3);
});
it('fails closed after removal of assignment, credential reset or disable', async () => {
  await db.delete(s.courseAssignment).where(eq(s.courseAssignment.id, 'class-a'));
  expect((await request()).status).toBe(403);
  await db.insert(s.courseAssignment).values({ id: 'restored', classroomId: 'class-a', courseKey: 'grade-2', curriculumVersion });
  await db.update(s.learner).set({ credentialVersion: 2 }).where(eq(s.learner.id, 'pupil'));
  expect((await request()).status).toBe(401);
  expect((await request(pupil, { ...scope, revision: 3, document: document() })).status).toBe(401);
  await db.update(s.learner).set({ active: false }).where(eq(s.learner.id, 'other'));
  expect((await request(other)).status).toBe(401);
});
it('teacher reports require assigned staff, return real results and omit private drafts', async () => {
  await db.update(s.learner).set({ active: true, credentialVersion: 1 }).where(eq(s.learner.id, 'pupil'));
  const saved = (await db.select().from(s.learnerProgress).where(eq(s.learnerProgress.learnerId, 'pupil')))[0];
  saved.document.progress['grade-2-sequences-2'] = { blocks: [], attempts: 3, hints: 2, complete: false };
  await db.update(s.learnerProgress).set({ document: saved.document }).where(eq(s.learnerProgress.learnerId, 'pupil'));
  const report = (path: string, cookie: string) => app.request(path, { headers: { Cookie: cookie } });
  const path = '/api/manage/classes/class-a/progress?course=grade-2';
  expect((await report(path, '')).status).toBe(401);
  expect((await report(path, pupil)).status).toBe(403);
  expect((await report('/api/manage/classes/class-b/progress?course=grade-2', adult)).status).toBe(404);
  const response = await report(path, adult); expect(response.status).toBe(200);
  const data = await response.json(); expect(data.students).toHaveLength(1);
  expect(data.students[0]).toMatchObject({ completed: 1, stars: 5, checkIns: 1 });
  expect(JSON.stringify(data)).not.toMatch(/workspace|textCode|new draft/);
  const detail = await report('/api/manage/classes/class-a/progress/pupil?course=grade-2', adult);
  expect((await detail.json()).challenges[1]).toMatchObject({ attempts: 3, hints: 2, complete: false });
  expect((await report('/api/manage/classes/class-a/progress/other?course=grade-2', adult)).status).toBe(404);
});
it('persists quiz drafts and submissions, computes teacher scores and protects best results', async () => {
  pupil = await session('pupil', 'pupil', 'class-a');
  const snapshot = await (await request()).json(), id = 'grade-2-loops';
  const next: ProgressDocument = snapshot.document;
  const correct = moduleQuiz(id).map(question => question.correct);
  next.view = 'quiz'; next.quizModuleId = id;
  next.quizzes = { [id]: { ...emptyQuiz(), answers: [null, 1, null, null, null] } };
  expect((await request(pupil, { ...scope, revision: snapshot.revision, document: next })).status).toBe(200);
  let saved = await (await request()).json();
  expect(saved.document.quizzes[id].answers).toEqual([null, 1, null, null, null]);
  const invalid = structuredClone(next); invalid.quizzes = { 'grade-6-loops': emptyQuiz() };
  expect((await request(pupil, { ...scope, revision: saved.revision, document: invalid })).status).toBe(400);
  const invalidScore = structuredClone(next); (invalidScore.quizzes![id] as unknown as Record<string, unknown>).score = 5;
  expect((await request(pupil, { ...scope, revision: saved.revision, document: invalidScore })).status).toBe(400);
  next.quizzes[id] = { version: 1, answers: correct, submittedAnswers: correct, bestAnswers: correct, attempts: 1 };
  expect((await request(pupil, { ...scope, revision: saved.revision, document: next })).status).toBe(200);
  saved = await (await request()).json();
  const wrong = correct.map(answer => (answer + 1) % 3);
  next.quizzes[id] = { version: 1, answers: wrong, submittedAnswers: wrong, bestAnswers: wrong, attempts: 2 };
  expect((await request(pupil, { ...scope, revision: saved.revision, document: next })).status).toBe(200);
  const report = await app.request('/api/manage/classes/class-a/progress?course=grade-2', { headers: { Cookie: adult } });
  const data = await report.json();
  expect(data.students[0]).toMatchObject({ quizCompleted: 1, quizTotal: 5, lastActivity: 'Loops quiz' });
  expect(data.students[0].quizResults.find((quiz: { id: string }) => quiz.id === id)).toMatchObject({ best: 5, latest: 0, attempts: 2 });
  expect(JSON.stringify(data)).not.toMatch(/submittedAnswers|bestAnswers/);
});
