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
import { newStudioProject, readStudioProject, saveStudioProject } from '../src/studioProject.js';
import { galleryEntry, saveStudioGallery } from '../shared/studioGallery.js';
import { studioStarterProject } from '../src/studioStarters.js';
import { studioTutorialProject, studioTutorials } from '../src/studioTutorials.js';
import { appStarter } from '../src/appLabStarters.js';
import { emptyTyping } from '../shared/typing.js';
import { emptyPractical } from '../shared/codingPractical.js';
import { completePractice } from '../shared/codingPractice.js';
import { emptyAppPractical } from '../shared/appPractical.js';

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
  expect(data.students[0]).toMatchObject({ quizCompleted: 1, quizTotal: 4, lastActivity: 'Loops quiz' });
  expect(data.students[0].quizResults.find((quiz: { id: string }) => quiz.id === id)).toMatchObject({ best: 5, latest: 0, attempts: 2 });
  expect(JSON.stringify(data)).not.toMatch(/submittedAnswers|bestAnswers/);
});
it('persists a tour dismissal for its learner/course without awarding a challenge', async () => {
  await db.update(s.learner).set({ active: true }).where(eq(s.learner.id, 'other'));
  other = await session('other', 'other', 'class-b');
  const own = await (await request()).json(), snapshot = await (await request(other)).json();
  const next = document();
  next.progress['grade-2-sequences-1'] = { blocks: [], attempts: 0, hints: 0, complete: false, workspaceTour: 'skipped' };
  const otherScope = { learnerId: 'other', classroomId: 'class-b' };
  expect((await request(other, { ...otherScope, revision: snapshot.revision, document: next })).status).toBe(200);
  expect((await (await request(other)).json()).document.progress['grade-2-sequences-1']).toMatchObject({ workspaceTour: 'skipped', complete: false, attempts: 0 });
  expect((await (await request()).json()).document).toEqual(own.document);
});
it('saves new data-module work and quizzes and reports the revised course without exposing code', async () => {
  await db.insert(s.courseAssignment).values({ id: 'data-course', classroomId: 'class-a', courseKey: 'grade-6', curriculumVersion });
  const next = document(), id = 'grade-6-objects-6';
  next.currentId = id; next.progress = { [id]: { blocks: [], attempts: 1, hints: 0, complete: true, stars: 5, textCode: 'synthetic private data draft', codingMode: 'text' } };
  const quiz = 'grade-6-objects@3', answers = moduleQuiz(quiz).map(question => question.correct);
  next.quizzes = { [quiz]: { version: 1, answers, submittedAnswers: answers, bestAnswers: answers, attempts: 1 } };
  expect((await request(pupil, { ...scope, revision: 0, document: next }, 'grade-6')).status).toBe(200);
  expect((await (await request(pupil, undefined, 'grade-6')).json()).document).toEqual(next);
  const response = await app.request('/api/manage/classes/class-a/progress?course=grade-6', { headers: { Cookie: adult } });
  expect(response.status).toBe(200);
  const report = await response.json();
  expect(report.students[0]).toMatchObject({ completed: 1, total: 90, quizCompleted: 1, quizTotal: 13 });
  expect(report.students[0].quizResults.find((item: { id: string }) => item.id === quiz)).toMatchObject({ best: 5 });
  expect(JSON.stringify(report)).not.toContain('synthetic private data draft');
});

it('keeps original and revised quiz submissions separate through authenticated saves and teacher reports', async () => {
  await db.insert(s.courseAssignment).values({ id: 'versioned-quizzes', classroomId: 'class-a', courseKey: 'grade-5', curriculumVersion });
  const oldId = 'grade-5-loops', newId = `${oldId}@3`, oldAnswers = moduleQuiz(oldId).map(q => q.correct), newAnswers = moduleQuiz(newId).map(q => q.correct);
  const next: ProgressDocument = { ...document(), currentId: 'grade-5-loops-1', progress: {}, view: 'quiz', quizModuleId: oldId, quizzes: { [oldId]: { version: 1, answers: oldAnswers, submittedAnswers: oldAnswers, bestAnswers: oldAnswers, attempts: 1 } } };
  expect((await request(pupil, { ...scope, revision: 0, document: next }, 'grade-5')).status).toBe(200);
  const report = async () => (await (await app.request('/api/manage/classes/class-a/progress?course=grade-5', { headers: { Cookie: adult } })).json()).students[0];
  let row = await report();
  expect(row).toMatchObject({ quizCompleted: 0, quizTotal: 13, lastActivity: 'Loops quiz (previous version)' });
  expect(row.previousQuizResults).toEqual([expect.objectContaining({ id: oldId, best: 5, latest: 5, attempts: 1 })]);
  const snapshot = await (await request(pupil, undefined, 'grade-5')).json();
  const invalid = structuredClone(next); invalid.quizModuleId = 'grade-5-loops@4';
  expect((await request(pupil, { ...scope, revision: snapshot.revision, document: invalid }, 'grade-5')).status).toBe(400);
  next.quizModuleId = newId;
  // Old answer indexes deliberately score zero in the new bank, not five.
  next.quizzes![newId] = { version: 1, answers: oldAnswers, submittedAnswers: oldAnswers, bestAnswers: oldAnswers, attempts: 1 };
  expect((await request(pupil, { ...scope, revision: snapshot.revision, document: next }, 'grade-5')).status).toBe(200);
  row = await report();
  expect(row).toMatchObject({ quizCompleted: 1, quizTotal: 13, lastActivity: 'Loops quiz' });
  expect(row.quizResults.find((q: { id: string }) => q.id === newId)).toMatchObject({ best: 0, latest: 0, attempts: 1 });
  expect(row.previousQuizResults[0]).toMatchObject({ best: 5, attempts: 1 });
  const current = await (await request(pupil, undefined, 'grade-5')).json();
  next.quizzes![newId] = { version: 1, answers: newAnswers, submittedAnswers: newAnswers, bestAnswers: newAnswers, attempts: 2 };
  expect((await request(pupil, { ...scope, revision: current.revision, document: next }, 'grade-5')).status).toBe(200);
  expect((await (await request(pupil, undefined, 'grade-5')).json()).document.quizzes[oldId]).toEqual(next.quizzes![oldId]);
  row = await report();
  expect(row.quizResults.find((q: { id: string }) => q.id === newId)).toMatchObject({ best: 5, attempts: 2 });
  expect(JSON.stringify(row)).not.toMatch(/submittedAnswers|bestAnswers/);
});

it('saves a concept-lab program and topic quiz and includes them in a private teacher report', async () => {
  const snapshot = await (await request(pupil, undefined, 'grade-6')).json();
  const next: ProgressDocument = snapshot.document, id = 'grade-6-functions-6', quizId = 'grade-6-functions';
  const answers = moduleQuiz(quizId).map(q => q.correct);
  next.currentId = id; next.view = 'quiz'; next.quizModuleId = quizId;
  next.progress[id] = { blocks: [], attempts: 1, hints: 0, complete: true, stars: 5, codingMode: 'text', textCode: 'synthetic private function definition' };
  next.quizzes![quizId] = { version: 1, answers, submittedAnswers: answers, bestAnswers: answers, attempts: 1 };
  expect((await request(pupil, { ...scope, revision: snapshot.revision, document: next }, 'grade-6')).status).toBe(200);
  const report = await (await app.request('/api/manage/classes/class-a/progress?course=grade-6', { headers: { Cookie: adult } })).json();
  expect(report.students[0]).toMatchObject({ completed: 2, total: 90, quizCompleted: 2, quizTotal: 13, lastActivity: 'Functions quiz' });
  expect(report.students[0].quizResults.find((q: { id: string }) => q.id === quizId)).toMatchObject({ best: 5 });
  expect(JSON.stringify(report)).not.toContain('synthetic private function definition');
});

it('roundtrips a private free-lab workspace without counting it as a completed challenge', async () => {
  const snapshot = await (await request(pupil, undefined, 'grade-6')).json();
  const next: ProgressDocument = snapshot.document, id = 'grade-6-creative-4';
  next.currentId = id; next.view = 'challenge'; delete next.quizModuleId;
  const workspace = { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', data: JSON.stringify({ character: 'Fix', buddy: 'Gigi', background: 'meadow', buddyX: 50, buddyY: 0 }), next: { block: { type: 'ka_sprite_say', fields: { TEXT: 'Synthetic private creative message' } } } }] } };
  next.progress[id] = { blocks: [], attempts: 0, hints: 0, complete: false, codingMode: 'blocks', workspace };
  expect((await request(pupil, { ...scope, revision: snapshot.revision, document: next }, 'grade-6')).status).toBe(200);
  const restored = await (await request(pupil, undefined, 'grade-6')).json();
  expect(restored.document.progress[id]).toMatchObject({ complete: false, attempts: 0, workspace });
  const report = await (await app.request('/api/manage/classes/class-a/progress?course=grade-6', { headers: { Cookie: adult } })).json();
  expect(report.students[0]).toMatchObject({ completed: 2, total: 90, quizCompleted: 2, quizTotal: 13, lastActivity: 'Byte Lab' });
  expect(JSON.stringify(report)).not.toContain('Synthetic private creative message');
  expect((await request(other, { ...scope, revision: restored.revision, document: next }, 'grade-6')).status).toBe(401);
});

it('roundtrips independent sprite scripts and painted art through the authenticated progress API', async () => {
  const snapshot = await (await request(pupil, undefined, 'grade-6')).json(), next: ProgressDocument = snapshot.document, id = 'grade-6-creative-4';
  const project = newStudioProject(); project.title = 'Synthetic private studio'; project.onboarding = 'completed'; project.starter = 'story';
  project.assets.push({ id: 'paint', name: 'My costume', kind: 'drawing', purpose: 'costume', base: { kind: 'character', ref: 'Byte' }, strokes: [{ tool: 'ellipse', filled: true, color: '#6733aa', width: 4, points: [[20, 20], [80, 80]] }] });
  project.sprites.push({ ...structuredClone(project.sprites[0]), id: 'second', name: 'Second sprite', costume: 'paint', costumes: ['paint'], x: 60, code: { blocks: { languageVersion: 0, blocks: [{ type: 'ka_event_click', next: { block: { type: 'ka_sprite_say', fields: { TEXT: 'Synthetic private second script' } } } }] } } });
  next.progress[id].workspace = saveStudioProject(project);
  expect((await request(pupil, { ...scope, revision: snapshot.revision, document: next }, 'grade-6')).status).toBe(200);
  const restored = await (await request(pupil, undefined, 'grade-6')).json();
  expect(readStudioProject(restored.document.progress[id].workspace)).toEqual(project);
  const report = await (await app.request('/api/manage/classes/class-a/progress?course=grade-6', { headers: { Cookie: adult } })).json();
  expect(report.students[0]).toMatchObject({ completed: 2, total: 90 });
  expect(JSON.stringify(report)).not.toMatch(/Synthetic private studio|Synthetic private second script|My costume/);
});

it('saves private galleries, deleted work and large collections without exposing them to reports or other pupils', async () => {
  const snapshot = await (await request(pupil, undefined, 'grade-6')).json(), next: ProgressDocument = snapshot.document, id = 'grade-6-creative-4';
  const project = newStudioProject(); project.title = 'Synthetic private gallery'; project.sprites[0].code.extra = 'x'.repeat(55000);
  const first = galleryEntry(project), deleted = galleryEntry(project); deleted.deletedAt = new Date().toISOString();
  const workspace = saveStudioGallery({ version: 1, activeId: null, projects: [first, deleted] });
  next.progress[id] = { blocks: [], attempts: 0, hints: 0, complete: false, workspace };
  const input = { ...scope, revision: snapshot.revision, document: next };
  expect((await request(pupil, input, 'grade-6')).status).toBe(200);
  const restored = await (await request(pupil, undefined, 'grade-6')).json(); expect(restored.document.progress[id].workspace).toEqual(workspace);
  expect((await request(other, input, 'grade-6')).status).toBe(401);
  expect((await request(adult, input, 'grade-6')).status).toBe(401);
  const wrong = structuredClone(next); wrong.progress['grade-6-sequences-1'] = wrong.progress[id];
  expect((await request(pupil, { ...input, revision: restored.revision, document: wrong }, 'grade-6')).status).toBe(400);
  const invalid = structuredClone(next); (invalid.progress[id].workspace!.byteStudioGallery as { version: number }).version = 999;
  expect((await request(pupil, { ...input, revision: restored.revision, document: invalid }, 'grade-6')).status).toBe(400);
  const report = await (await app.request('/api/manage/classes/class-a/progress?course=grade-6', { headers: { Cookie: adult } })).json();
  expect(JSON.stringify(report)).not.toMatch(/Synthetic private gallery|byteStudioGallery|deletedAt/);
  expect(report.students[0]).toMatchObject({ completed: 2, total: 90 });
});

it('persists lesson repeat counts above five and rejects invalid numeric counts', async () => {
  const snapshot = await (await request()).json(), next: ProgressDocument = snapshot.document, id = 'grade-2-loops-1';
  next.currentId = id; next.view = 'challenge'; delete next.quizModuleId;
  next.progress[id] = { blocks: [{ id: 'synthetic-repeat', kind: 'repeat', direction: 'right', count: 25 }], attempts: 0, hints: 0, complete: false };
  expect((await request(pupil, { ...scope, revision: snapshot.revision, document: next })).status).toBe(200);
  const saved = await (await request()).json(); expect(saved.document.progress[id].blocks[0].count).toBe(25);
  for (const count of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    const invalid = structuredClone(next); invalid.progress[id].blocks[0].count = count;
    expect((await request(pupil, { ...scope, revision: saved.revision, document: invalid })).status).toBe(400);
  }
  expect((await (await request()).json()).document.progress[id].blocks[0].count).toBe(25);
});

it('keeps imported background pixels private and validates image sources in account saves', async () => {
  const snapshot = await (await request(pupil, undefined, 'grade-6')).json(), next: ProgressDocument = snapshot.document, id = 'grade-6-creative-4';
  const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=';
  const project = newStudioProject(); project.assets[0].ref = 'Girl';
  project.assets.push({ id: 'imported-private', name: 'Synthetic private image', kind: 'image', purpose: 'background', imageData }); project.backdrop = 'imported-private';
  const entry = galleryEntry(project), workspace = saveStudioGallery({ version: 1, activeId: entry.id, projects: [entry] });
  next.progress[id].workspace = workspace;
  expect((await request(pupil, { ...scope, revision: snapshot.revision, document: next }, 'grade-6')).status).toBe(200);
  const saved = await (await request(pupil, undefined, 'grade-6')).json(); expect(saved.document.progress[id].workspace).toEqual(workspace);
  expect((await request(other, { ...scope, revision: saved.revision, document: next }, 'grade-6')).status).toBe(401);
  for (const source of ['https://external.test/picture.png', 'data:image/svg+xml;base64,PHN2Zy8+']) {
    const invalid = structuredClone(next); (invalid.progress[id].workspace!.byteStudioGallery as { projects: { project: { assets: { imageData?: string }[] } }[] }).projects[0].project.assets[2].imageData = source;
    expect((await request(pupil, { ...scope, revision: saved.revision, document: invalid }, 'grade-6')).status).toBe(400);
  }
  expect((await (await request(pupil, undefined, 'grade-6')).json()).document.progress[id].workspace).toEqual(workspace);
  const report = await (await app.request('/api/manage/classes/class-a/progress?course=grade-6', { headers: { Cookie: adult } })).json();
  expect(JSON.stringify(report)).not.toContain(imageData); expect(JSON.stringify(report)).not.toContain('Synthetic private image');
});

it('roundtrips family characters, props and new real-world scenes in private learner projects', async () => {
  const snapshot = await (await request(pupil, undefined, 'grade-6')).json(), next: ProgressDocument = snapshot.document, id = 'grade-6-creative-4';
  const project = newStudioProject(); project.title = 'Synthetic family adventure'; project.assets[0].ref = 'Grandma';
  project.assets[1].ref = 'countryHome'; project.assets[1].name = 'Country home';
  project.assets.push({ id: 'grandpa', kind: 'character', name: 'Grandpa', ref: 'Grandpa' }, { id: 'house', kind: 'character', name: 'House', ref: 'House' }, { id: 'city-street', kind: 'background', name: 'City street', ref: 'cityStreet' });
  project.sprites[0].costumes.push('grandpa', 'house');
  const entry = galleryEntry(project), workspace = saveStudioGallery({ version: 1, activeId: entry.id, projects: [entry] }); next.progress[id].workspace = workspace;
  expect((await request(pupil, { ...scope, revision: snapshot.revision, document: next }, 'grade-6')).status).toBe(200);
  const saved = await (await request(pupil, undefined, 'grade-6')).json(); expect(saved.document.progress[id].workspace).toEqual(workspace);
  const report = await (await app.request('/api/manage/classes/class-a/progress?course=grade-6', { headers: { Cookie: adult } })).json();
  expect(JSON.stringify(report)).not.toMatch(/Synthetic family adventure|countryHome|cityStreet|Grandma|Grandpa/);
});

it('roundtrips interactive games, tutorials and personal definitions privately without awarding course scores', async () => {
  const snapshot = await (await request(pupil, undefined, 'grade-6')).json(), next: ProgressDocument = snapshot.document, id = 'grade-6-creative-4';
  const entries = [...(['racing', 'basketball', 'garden', 'tennis'] as const).map(kind => galleryEntry(studioStarterProject(kind))), ...studioTutorials.map(tutorial => galleryEntry(studioTutorialProject(tutorial.id)))];
  const workspace = saveStudioGallery({ version: 1, activeId: entries[0].id, projects: entries });
  next.progress[id] = { blocks: [], attempts: 0, hints: 0, complete: false, workspace };
  expect((await request(pupil, { ...scope, revision: snapshot.revision, document: next }, 'grade-6')).status).toBe(200);
  const restored = await (await request(pupil, undefined, 'grade-6')).json(); expect(restored.document.progress[id]).toEqual(next.progress[id]);
  expect((await request(other, undefined, 'grade-6')).status).toBe(403); // Valid pupil session, but this class has no Grade 6 assignment.
  expect((await request(other, { ...scope, revision: restored.revision, document: next }, 'grade-6')).status).toBe(401);
  const report = await (await app.request('/api/manage/classes/class-a/progress?course=grade-6', { headers: { Cookie: adult } })).json();
  expect(JSON.stringify(report)).not.toMatch(/Three-lane racer|Basketball bounce|Garden greetings|Tennis rally|TennisBall|TennisRacket|ka_studio_define|RaceCarRed|tutorialQuestions|tutorialTimers|tutorialSprites|tutorialBehaviors|My space hero|Butterfly swarm/);
});

it('roundtrips App Lab privately, preserves legacy work and rejects unauthorized or malformed app data', async () => {
  const snapshot = await (await request(pupil, undefined, 'grade-6')).json(), next: ProgressDocument = snapshot.document;
  const project = appStarter('data'); project.title = 'Synthetic private App Lab'; project.tables[0].rows[0][1] = 'Synthetic private app fact'; project.codeDraft = 'onEvent('; // Incomplete text stays private and round-trips independently of applied code.
  project.code.blocks!.blocks.push({ type: 'al_start', inputs: { DO: { block: {
    type: 'al_set_property', fields: { ID: 'fact', PROPERTY: 'font-size' }, inputs: { VALUE: { block: {
      type: 'al_number_fn', fields: { FN: 'randomNumber' }, inputs: { A: { block: { type: 'al_number', fields: { NUM: 20 } } }, B: { block: { type: 'al_number', fields: { NUM: 24 } } } },
    } } }, next: { block: { type: 'al_add_row', fields: { TABLE: 'animals' } } },
  } } } });
  const before = structuredClone(next.progress);
  next.appLab = { version: 1, activeId: project.id, projects: [project] };
  expect((await request(pupil, { ...scope, revision: snapshot.revision, document: next }, 'grade-6')).status).toBe(200);
  const saved = await (await request(pupil, undefined, 'grade-6')).json();
  expect(saved.document.appLab).toEqual(next.appLab); expect(saved.document.progress).toEqual(before);
  expect((await request(other, { ...scope, revision: saved.revision, document: next }, 'grade-6')).status).toBe(401);
  expect((await request(adult, { ...scope, revision: saved.revision, document: next }, 'grade-6')).status).toBe(401);
  const malformed = structuredClone(next); malformed.appLab!.projects[0].elements[0].screen = 'missing';
  expect((await request(pupil, { ...scope, revision: saved.revision, document: malformed }, 'grade-6')).status).toBe(400);
  const report = await (await app.request('/api/manage/classes/class-a/progress?course=grade-6', { headers: { Cookie: adult } })).json();
  expect(JSON.stringify(report)).not.toMatch(/Synthetic private App Lab|Synthetic private app fact/);
  const oldClient = structuredClone(next); delete oldClient.appLab;
  expect((await request(pupil, { ...scope, revision: saved.revision, document: oldClient }, 'grade-6')).status).toBe(200);
  expect((await (await request(pupil, undefined, 'grade-6')).json()).document.appLab).toEqual(next.appLab);
});

it('saves bounded typing results privately and preserves them when an older coding client omits the field', async () => {
  const snapshot = await (await request()).json(), next = structuredClone(snapshot.document ?? document());
  next.typing = emptyTyping(2); const id = next.typing.currentId;
  next.typing.results[id] = { attempts:1, complete:true, bestStars:5, bestAccuracy:100, durationMs:4000, independent:false };
  expect((await request(pupil,{...scope,revision:snapshot.revision,document:next})).status).toBe(200);
  const saved = await (await request()).json(); expect(saved.document.typing.results[id].bestStars).toBe(5);
  expect((await (await request(other)).json()).document?.typing).toBeUndefined();
  const malformed=structuredClone(next); malformed.typing.currentId='typing-g6-u01-a01';
  expect((await request(pupil,{...scope,revision:saved.revision,document:malformed})).status).toBe(400);
  const oldClient=structuredClone(next);delete oldClient.typing;
  expect((await request(pupil,{...scope,revision:saved.revision,document:oldClient})).status).toBe(200);
  expect((await (await request()).json()).document.typing.results[id].bestStars).toBe(5);
});

it('keeps versioned practice and practical mastery private and compatible with older coding clients', async () => {
  const snapshot=await (await request()).json(),next=structuredClone(snapshot.document ?? document());
  next.practical=emptyPractical(2);next.practical.steps.fill(true);next.practical.mastery={demonstrated:true,transfer:true,attempts:1,last:'demonstrated'};
  next.progress['grade-2-sequences-1'].practice=completePractice(undefined,true);
  expect((await request(pupil,{...scope,revision:snapshot.revision,document:next})).status).toBe(200);
  const saved=await (await request()).json();expect(saved.document.practical.mastery.demonstrated).toBe(true);
  const crossGrade=structuredClone(next);crossGrade.practical=emptyPractical(4);
  expect((await request(pupil,{...scope,revision:saved.revision,document:crossGrade})).status).toBe(400);
  expect((await (await request(other)).json()).document?.practical).toBeUndefined();
  const oldClient=structuredClone(next);delete oldClient.practical;delete oldClient.progress['grade-2-sequences-1'].practice;
  expect((await request(pupil,{...scope,revision:saved.revision,document:oldClient})).status).toBe(200);
  const protectedCopy=await (await request()).json();expect(protectedCopy.document.practical.mastery.demonstrated).toBe(true);expect(protectedCopy.document.progress['grade-2-sequences-1'].practice.supportUsed).toBe(true);
});

it('stores Grade 3 App Lab lessons separately and preserves them through old-client omission',async()=>{
  await db.insert(s.courseAssignment).values({id:'g3-app-unit',classroomId:'class-a',courseKey:'grade-3',curriculumVersion});
  const snapshot=await(await request(pupil,undefined,'grade-3')).json(),next:ProgressDocument={...document(),currentId:'grade-3-sequences-1',progress:{},appPractical:emptyAppPractical()};next.appPractical!.steps.fill(true);next.appPractical!.mastery={demonstrated:true,transfer:true,attempts:1,last:'demonstrated'};
  expect((await request(pupil,{...scope,revision:snapshot.revision,document:next},'grade-3')).status).toBe(200);const saved=await(await request(pupil,undefined,'grade-3')).json();expect(saved.document.appPractical.mastery.demonstrated).toBe(true);expect(saved.document.appLab).toBeUndefined();
  const crossGrade={...document(),appPractical:emptyAppPractical()};const g2=await(await request()).json();expect((await request(pupil,{...scope,revision:g2.revision,document:crossGrade})).status).toBe(400);
  expect((await request(other,undefined,'grade-3')).status).toBe(403);const old={...next};delete old.appPractical;expect((await request(pupil,{...scope,revision:saved.revision,document:old},'grade-3')).status).toBe(200);expect((await(await request(pupil,undefined,'grade-3')).json()).document.appPractical.mastery.demonstrated).toBe(true);
});
