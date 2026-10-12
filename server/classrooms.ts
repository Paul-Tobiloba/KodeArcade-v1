import { createHash, randomUUID, randomInt } from 'node:crypto';
import { and, eq, sql, count, inArray } from 'drizzle-orm';
import { Hono, type Context } from 'hono';
import { cardFilename } from '../shared/card-filename.js';
import { gradeKey, curriculumVersion } from '../shared/progress.js';
import { progressCatalog } from '../shared/progress-catalog.js';
import { reportSummary } from '../shared/reports.js';
import { HTTPException } from 'hono/http-exception';
import { getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import type { Auth } from './auth.js';
import type { Database } from './db/client.js';
import type { ServerConfig } from './config.js';
import * as s from './db/schema.js';
import { assignedCourseKeys, budget, credentialPassword, CURRICULUM_VERSION, generateCredential, randomCode, stepCookie, stepGrant, validStepGrant, usernameBases } from './classroom-policy.js';
import { loginCard, loginCards, type Card } from './login-card.js';
import { parseClassroomCsv, type ImportedStudent } from '../shared/classroom-import.js';
import { classroomAccess } from './staff-access.js';
import { managementUnlockSeconds } from '../shared/security-policy.js';

const name = z.string().trim().min(1).max(60);
const grade = z.number().int().min(1).max(6);
const operationKey = z.string().uuid();
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
const fail = (status: 400 | 401 | 403 | 404 | 409 | 429, code: string): never => { throw new HTTPException(status, { res: Response.json({ code }, { status }) }); };
async function input<T>(c: Context, schema: z.ZodType<T>): Promise<T> {
  const parsed = schema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return fail(400, 'INVALID_INPUT');
  return parsed.data;
}

export function createClassroomRoutes(auth: Auth, db: Database, config: Pick<ServerConfig, 'APP_ORIGIN' | 'BETTER_AUTH_SECRET'>) {
  const app = new Hono();
  async function adult(c: Context, step = false) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return fail(401, 'UNAUTHORIZED');
    if (session.user.principalKind !== 'adult' || !session.user.emailVerified) return fail(403, 'FORBIDDEN');
    if (step && !validStepGrant(config.BETTER_AUTH_SECRET, session.session.id, getCookie(c, stepCookie))) return fail(403, 'STEP_UP_REQUIRED');
    return session;
  }
  async function manages(c: Context, classId: string, step = false) {
    const actor = await adult(c, step);
    const room = await classroomAccess(db, actor.user.id, classId);
    if (!room) return fail(404, 'NOT_FOUND');
    return { actor, room };
  }
  async function activeClass(tx: Transaction, classId: string, actorId: string, allowArchived = false) {
    const [scope] = await tx.select({ organizationId: s.classroom.organizationId }).from(s.classroom).where(eq(s.classroom.id, classId));
    if (!scope) return fail(404, 'NOT_FOUND');
    // Serialize with school staff removal/reassignment and recheck authorization.
    await tx.select().from(s.organization).where(eq(s.organization.id, scope.organizationId)).for('update');
    if (!await classroomAccess(tx, actorId, classId)) return fail(404, 'NOT_FOUND');
    const [room] = await tx.select().from(s.classroom).where(eq(s.classroom.id, classId)).for('update');
    if (!room) return fail(404, 'NOT_FOUND');
    if (!allowArchived && room.archivedAt) return fail(409, 'CLASS_ARCHIVED');
    return room;
  }
  async function operation(tx: Transaction, actorId: string, key: string, payload: unknown, resourceId: string) {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${JSON.stringify([actorId, key])}))`);
    const digest = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const [existing] = await tx.select().from(s.managementOperation).where(and(eq(s.managementOperation.actorId, actorId), eq(s.managementOperation.key, key)));
    if (existing) return fail(409, existing.digest === digest ? 'ALREADY_PROCESSED' : 'OPERATION_CONFLICT');
    await tx.insert(s.managementOperation).values({ actorId, key, digest, resourceId });
  }
  async function audit(tx: Transaction, actorId: string, organizationId: string, action: string, resourceId: string) {
    await tx.insert(s.auditEvent).values({ id: randomUUID(), actorId, organizationId, action, resourceId });
  }
  async function allocateUsername(tx: Transaction, displayName: string) {
    const [first, full] = usernameBases(displayName);
    const taken = async (candidate: string) => (await tx.select({ id: s.user.id }).from(s.user).where(eq(s.user.username, candidate)).limit(1)).length > 0;
    if (!await taken(first)) return first;
    if (!await taken(full)) return full;
    for (let attempt = 0; attempt < 20; attempt++) { const candidate = `${full}${randomInt(1000, 1_000_000)}`; if (!await taken(candidate)) return candidate; }
    return fail(409, 'USERNAME_UNAVAILABLE');
  }
  function pdf(c: Context, buffer: Buffer, name: string, booklet = false) {
    c.header('Content-Type', 'application/pdf');
    c.header('Content-Disposition', `attachment; filename="${cardFilename(name, booklet ? 'booklet' : 'login')}"`);
    c.header('Cache-Control', 'private, no-store, max-age=0');
    c.header('Pragma', 'no-cache');
    return c.body(new Uint8Array(buffer));
  }

  app.get('/management/status', async c => {
    const actor = await adult(c);
    const grant = getCookie(c, stepCookie);
    const valid = validStepGrant(config.BETTER_AUTH_SECRET, actor.session.id, grant);
    return c.json({ unlockedForSeconds: valid ? Math.max(0, Math.floor((Number(grant!.split('.')[0]) - Date.now()) / 1000)) : 0 });
  });
  app.post('/management/unlock', async c => {
    const actor = await adult(c);
    const body = await input(c, z.object({ password: z.string().min(1).max(128), code: z.string().regex(/^\d{6}$/).optional() }));
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'management-unlock', actor.user.id, 5, 900)) return fail(429, 'LIMIT');
    try {
      await auth.api.verifyPassword({ headers: c.req.raw.headers, body: { password: body.password } });
      if (actor.user.twoFactorEnabled) {
        if (!body.code) return fail(403, 'MFA_REQUIRED');
        await auth.api.verifyTOTP({ headers: c.req.raw.headers, body: { code: body.code, trustDevice: false } });
      }
    } catch { return fail(403, actor.user.twoFactorEnabled ? 'PASSWORD_OR_MFA_INVALID' : 'PASSWORD_INVALID'); }
    setCookie(c, stepCookie, stepGrant(config.BETTER_AUTH_SECRET, actor.session.id), { httpOnly: true, secure: config.APP_ORIGIN.startsWith('https:'), sameSite: 'Strict', path: '/api', maxAge: managementUnlockSeconds });
    return c.json({ unlockedForSeconds: managementUnlockSeconds });
  });

  app.post('/classes', async c => {
    const actor = await adult(c, true);
    const body = await input(c, z.object({ organizationId: z.string().uuid(), name, grade, operationKey }));
    const [member] = await db.select().from(s.organizationMember).where(and(eq(s.organizationMember.organizationId, body.organizationId), eq(s.organizationMember.userId, actor.user.id)));
    if (!member || !['teacher', 'school_admin'].includes(member.role)) return fail(403, 'FORBIDDEN');
    const id = randomUUID(), code = randomCode(8);
    await db.transaction(async tx => {
      await tx.execute(sql`select id from organization where id = ${body.organizationId} for update`);
      await operation(tx, actor.user.id, body.operationKey, body, id);
      const [currentMember] = await tx.select().from(s.organizationMember).where(and(eq(s.organizationMember.organizationId, body.organizationId), eq(s.organizationMember.userId, actor.user.id)));
      if (!currentMember || !['teacher', 'school_admin'].includes(currentMember.role)) return fail(403, 'FORBIDDEN');
      if (currentMember.role === 'school_admin') {
        const [admin] = await tx.select({ enabled: s.user.twoFactorEnabled }).from(s.user).where(eq(s.user.id, actor.user.id));
        if (!admin?.enabled) return fail(403, 'SCHOOL_MFA_REQUIRED');
      }
      const [total] = await tx.select({ total: count() }).from(s.classroom).where(eq(s.classroom.organizationId, body.organizationId));
      if (total.total >= 100) return fail(409, 'CLASS_LIMIT');
      await tx.insert(s.classroom).values({ id, organizationId: body.organizationId, name: body.name, grade: body.grade, code });
      await tx.insert(s.classroomStaff).values({ classroomId: id, organizationId: body.organizationId, userId: actor.user.id });
      await tx.insert(s.courseAssignment).values({ id: randomUUID(), classroomId: id, courseKey: `grade-${body.grade}`, curriculumVersion: CURRICULUM_VERSION });
      await audit(tx, actor.user.id, body.organizationId, 'class.created', id);
    });
    return c.json({ id, code }, 201);
  });

  app.get('/classes/:id', async c => {
    const { room } = await manages(c, c.req.param('id'));
    const learners = await db.select({ id: s.learner.id, displayName: s.learner.displayName, grade: s.learner.grade, loginMethod: s.learner.loginMethod, active: s.learner.active, username: s.user.username })
      .from(s.enrollment).innerJoin(s.learner, and(eq(s.learner.id, s.enrollment.learnerId), eq(s.learner.organizationId, s.enrollment.organizationId)))
      .innerJoin(s.user, eq(s.user.id, s.learner.authUserId)).where(eq(s.enrollment.classroomId, room.id));
    const assignments = await db.select({ id: s.courseAssignment.id, courseKey: s.courseAssignment.courseKey }).from(s.courseAssignment).where(and(eq(s.courseAssignment.classroomId, room.id), eq(s.courseAssignment.curriculumVersion, CURRICULUM_VERSION)));
    return c.json({ room, learners, assignments });
  });

  app.get('/classes/:id/progress', async c => {
    const { room } = await manages(c, c.req.param('id'));
    const course = gradeKey.safeParse(c.req.query('course'));
    if (!course.success) return fail(400, 'INVALID_COURSE');
    const [assignment] = await db.select().from(s.courseAssignment).where(and(eq(s.courseAssignment.classroomId, room.id), eq(s.courseAssignment.courseKey, course.data), eq(s.courseAssignment.curriculumVersion, curriculumVersion)));
    if (!assignment) return fail(404, 'NOT_FOUND');
    const students = await db.select({ learnerId: s.learner.id, displayName: s.learner.displayName, active: s.learner.active }).from(s.enrollment)
      .innerJoin(s.learner, and(eq(s.learner.id, s.enrollment.learnerId), eq(s.learner.organizationId, s.enrollment.organizationId)))
      .where(and(eq(s.enrollment.classroomId, room.id), eq(s.enrollment.organizationId, room.organizationId)));
    const saved = await db.select().from(s.learnerProgress).where(and(eq(s.learnerProgress.classroomId, room.id), eq(s.learnerProgress.courseKey, course.data), eq(s.learnerProgress.curriculumVersion, curriculumVersion)));
    return c.json({ course: course.data, generatedAt: new Date().toISOString(), students: students.map(student => { const row = saved.find(row => row.learnerId === student.learnerId); return { ...student, ...reportSummary(course.data, row ? { revision: row.revision, document: row.document, updatedAt: row.updatedAt.toISOString() } : undefined) }; }) });
  });
  app.get('/classes/:id/progress/:learnerId', async c => {
    const { room } = await manages(c, c.req.param('id'));
    const student = await enrolled(room.id, c.req.param('learnerId'));
    const course = gradeKey.safeParse(c.req.query('course'));
    if (!course.success) return fail(400, 'INVALID_COURSE');
    const [assignment] = await db.select().from(s.courseAssignment).where(and(eq(s.courseAssignment.classroomId, room.id), eq(s.courseAssignment.courseKey, course.data), eq(s.courseAssignment.curriculumVersion, curriculumVersion)));
    if (!assignment) return fail(404, 'NOT_FOUND');
    const [saved] = await db.select().from(s.learnerProgress).where(and(eq(s.learnerProgress.classroomId, room.id), eq(s.learnerProgress.learnerId, student.learner.id), eq(s.learnerProgress.courseKey, course.data), eq(s.learnerProgress.curriculumVersion, curriculumVersion)));
    const catalog = progressCatalog[course.data];
    const challenges = catalog.challenges.map(id => { const result = saved?.document.progress[id]; return { id, title: catalog.missions.find(m => m.id === id)?.title ?? id, complete: result?.complete === true, stars: result?.complete ? result.stars ?? 1 : 0, attempts: result?.attempts ?? 0, hints: result?.hints ?? 0 }; });
    return c.json({ displayName: student.learner.displayName, challenges });
  });

  app.post('/classes/:id/update', async c => {
    const { actor, room } = await manages(c, c.req.param('id'), true);
    const body = await input(c, z.object({ name, grade, operationKey }));
    await db.transaction(async tx => {
      await activeClass(tx, room.id, actor.user.id);
      await operation(tx, actor.user.id, body.operationKey, body, room.id);
      await tx.update(s.classroom).set({ name: body.name, grade: body.grade }).where(eq(s.classroom.id, room.id));
      await audit(tx, actor.user.id, room.organizationId, 'class.updated', room.id);
    });
    return c.json({ saved: true });
  });

  app.post('/classes/:id/archive', async c => {
    const { actor, room } = await manages(c, c.req.param('id'), true);
    const body = await input(c, z.object({ archived: z.boolean(), previousArchived: z.boolean(), confirm: z.literal(true), operationKey }).strict());
    await db.transaction(async tx => {
      const current = await activeClass(tx, room.id, actor.user.id, true);
      await operation(tx, actor.user.id, body.operationKey, { ...body, classId: room.id }, room.id);
      if (Boolean(current.archivedAt) !== body.previousArchived || body.archived === body.previousArchived) return fail(409, 'CLASS_STATE_CONFLICT');
      await tx.update(s.classroom).set({ archivedAt: body.archived ? new Date() : null }).where(eq(s.classroom.id, room.id));
      if (body.archived) {
        // Revoke only sessions bound to this class, never another enrolled class.
        const sessions = await tx.select({ id: s.learnerSession.sessionId }).from(s.learnerSession).where(eq(s.learnerSession.classroomId, room.id));
        if (sessions.length) await tx.delete(s.session).where(inArray(s.session.id, sessions.map(item => item.id)));
      }
      await audit(tx, actor.user.id, room.organizationId, body.archived ? 'class.archived' : 'class.restored', room.id);
    });
    return c.json({ saved: true });
  });

  app.post('/classes/:id/students', async c => {
    const { actor, room } = await manages(c, c.req.param('id'), true);
    const body = await input(c, z.object({ displayName: name, grade, loginMethod: z.enum(['picture', 'text']), operationKey }));
    const id = randomUUID(), authUserId = randomUUID();
    const credential = generateCredential(body.loginMethod);
    const context = await auth.$context;
    const hash = await context.password.hash(credentialPassword(config.BETTER_AUTH_SECRET, body.loginMethod, credential));
    const buffer = await db.transaction(async tx => {
      await activeClass(tx, room.id, actor.user.id);
      await operation(tx, actor.user.id, body.operationKey, { ...body, classId: room.id }, id);
      await tx.execute(sql`select id from classroom where id = ${room.id} for update`);
      const [total] = await tx.select({ total: count() }).from(s.enrollment).where(eq(s.enrollment.classroomId, room.id));
      if (total.total >= 100) return fail(409, 'STUDENT_LIMIT');
      // Better Auth usernames are globally unique. Serialize allocation so two
      // simultaneous additions cannot receive the same first-name username.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext('kodearcade-learner-usernames'))`);
      const [first, full] = usernameBases(body.displayName);
      const taken = async (candidate: string) => (await tx.select({ id: s.user.id }).from(s.user).where(eq(s.user.username, candidate)).limit(1)).length > 0;
      let username = first;
      if (await taken(username)) username = full;
      if (await taken(username)) {
        for (let attempt = 0; attempt < 20; attempt++) {
          username = `${full}${randomInt(1000, 1_000_000)}`;
          if (!await taken(username)) break;
          if (attempt === 19) return fail(409, 'USERNAME_UNAVAILABLE');
        }
      }
      const card = await loginCard({ name: body.displayName, username, className: room.name, classCode: room.code, grade: body.grade, method: body.loginMethod, credential, origin: config.APP_ORIGIN });
      // No child email is collected. This non-deliverable internal ID never enters mail flows.
      await tx.insert(s.user).values({ id: authUserId, name: body.displayName, email: `${authUserId}@learners.invalid`, emailVerified: true, principalKind: 'learner', username, displayUsername: username });
      await tx.insert(s.account).values({ id: randomUUID(), accountId: authUserId, userId: authUserId, providerId: 'credential', password: hash });
      await tx.insert(s.learner).values({ id, organizationId: room.organizationId, authUserId, displayName: body.displayName, grade: body.grade, loginMethod: body.loginMethod });
      await tx.insert(s.enrollment).values({ learnerId: id, classroomId: room.id, organizationId: room.organizationId });
      await audit(tx, actor.user.id, room.organizationId, 'student.created', id);
      return card;
    });
    return pdf(c, buffer, body.displayName);
  });

  app.post('/classes/:id/students/import', async c => {
    const { actor, room } = await manages(c, c.req.param('id'), true);
    const body = await input(c, z.object({ csv: z.string().max(12000), operationKey }).strict());
    const parsed = parseClassroomCsv(body.csv);
    if (parsed.errors.length) return c.json({ code: 'CSV_INVALID', errors: parsed.errors }, 400);
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'student-bulk', actor.user.id, 10, 3600)) return fail(429, 'LIMIT');
    const password = (await auth.$context).password;
    const prepared: (ImportedStudent & { id: string; authUserId: string; credential: ReturnType<typeof generateCredential>; hash: string })[] = [];
    // Bound memory used by expensive password hashing; never parallelize 50 hashes.
    for (const student of parsed.students) {
      const credential = generateCredential(student.loginMethod);
      prepared.push({ ...student, id: randomUUID(), authUserId: randomUUID(), credential, hash: await password.hash(credentialPassword(config.BETTER_AUTH_SECRET, student.loginMethod, credential)) });
    }
    const buffer = await db.transaction(async tx => {
      await activeClass(tx, room.id, actor.user.id);
      await operation(tx, actor.user.id, body.operationKey, { ...body, classId: room.id }, room.id);
      await tx.execute(sql`select id from classroom where id = ${room.id} for update`);
      const [total] = await tx.select({ total: count() }).from(s.enrollment).where(eq(s.enrollment.classroomId, room.id));
      if (total.total + prepared.length > 100) return fail(409, 'STUDENT_LIMIT');
      const existing = await tx.select({ name: s.learner.displayName }).from(s.enrollment).innerJoin(s.learner, eq(s.learner.id, s.enrollment.learnerId)).where(eq(s.enrollment.classroomId, room.id));
      if (prepared.some(student => existing.some(row => row.name.normalize('NFKC').toLocaleLowerCase('en') === student.displayName.normalize('NFKC').toLocaleLowerCase('en')))) return fail(409, 'DUPLICATE_STUDENT');
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext('kodearcade-learner-usernames'))`);
      const cards: Card[] = [];
      for (const student of prepared) {
        const username = await allocateUsername(tx, student.displayName);
        await tx.insert(s.user).values({ id: student.authUserId, name: student.displayName, email: `${student.authUserId}@learners.invalid`, emailVerified: true, principalKind: 'learner', username, displayUsername: username });
        await tx.insert(s.account).values({ id: randomUUID(), accountId: student.authUserId, userId: student.authUserId, providerId: 'credential', password: student.hash });
        await tx.insert(s.learner).values({ id: student.id, organizationId: room.organizationId, authUserId: student.authUserId, displayName: student.displayName, grade: student.grade, loginMethod: student.loginMethod });
        await tx.insert(s.enrollment).values({ learnerId: student.id, classroomId: room.id, organizationId: room.organizationId });
        await audit(tx, actor.user.id, room.organizationId, 'student.created', student.id);
        cards.push({ name: student.displayName, username, className: room.name, classCode: room.code, grade: student.grade, method: student.loginMethod, credential: student.credential, origin: config.APP_ORIGIN });
      }
      // Render before commit: failure cannot leave a partially imported class.
      return loginCards(cards);
    });
    return pdf(c, buffer, room.name, true);
  });

  app.post('/classes/:id/students/reset-cards', async c => {
    const { actor, room } = await manages(c, c.req.param('id'), true);
    const body = await input(c, z.object({ studentIds: z.array(z.string().uuid()).min(1).max(50).refine(ids => new Set(ids).size === ids.length), confirmReset: z.literal(true), operationKey }).strict());
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'student-bulk', actor.user.id, 10, 3600)) return fail(429, 'LIMIT');
    const password = (await auth.$context).password;
    const buffer = await db.transaction(async tx => {
      await activeClass(tx, room.id, actor.user.id);
      await operation(tx, actor.user.id, body.operationKey, { ...body, classId: room.id }, room.id);
      const students = await tx.select({ learner: s.learner, username: s.user.username }).from(s.enrollment)
        .innerJoin(s.learner, and(eq(s.learner.id, s.enrollment.learnerId), eq(s.learner.organizationId, s.enrollment.organizationId)))
        .innerJoin(s.user, eq(s.user.id, s.learner.authUserId))
        .where(and(eq(s.enrollment.classroomId, room.id), inArray(s.learner.id, body.studentIds))).orderBy(s.learner.id).for('update', { of: s.learner });
      if (students.length !== body.studentIds.length) return fail(404, 'NOT_FOUND');
      if (students.some(student => !student.learner.active)) return fail(409, 'DISABLED_STUDENT');
      const cards: Card[] = [];
      for (const { learner, username } of students) {
        const method = learner.loginMethod as 'picture' | 'text', credential = generateCredential(method);
        const hash = await password.hash(credentialPassword(config.BETTER_AUTH_SECRET, method, credential));
        await tx.update(s.account).set({ password: hash }).where(and(eq(s.account.userId, learner.authUserId), eq(s.account.providerId, 'credential')));
        await tx.update(s.learner).set({ credentialVersion: sql`${s.learner.credentialVersion} + 1` }).where(eq(s.learner.id, learner.id));
        await tx.delete(s.session).where(eq(s.session.userId, learner.authUserId));
        await audit(tx, actor.user.id, room.organizationId, 'student.credential-reset', learner.id);
        cards.push({ name: learner.displayName, username: username!, className: room.name, classCode: room.code, grade: learner.grade, method, credential, origin: config.APP_ORIGIN });
      }
      return loginCards(cards);
    });
    return pdf(c, buffer, room.name, true);
  });

  async function enrolled(roomId: string, learnerId: string) {
    const [student] = await db.select({ learner: s.learner, username: s.user.username }).from(s.enrollment)
      .innerJoin(s.learner, and(eq(s.learner.id, s.enrollment.learnerId), eq(s.learner.organizationId, s.enrollment.organizationId)))
      .innerJoin(s.user, eq(s.user.id, s.learner.authUserId)).where(and(eq(s.enrollment.classroomId, roomId), eq(s.learner.id, learnerId)));
    if (!student) return fail(404, 'NOT_FOUND');
    return student;
  }
  app.post('/classes/:id/students/:studentId/reset', async c => {
    const { actor, room } = await manages(c, c.req.param('id'), true);
    const student = await enrolled(room.id, c.req.param('studentId'));
    const body = await input(c, z.object({ loginMethod: z.enum(['picture', 'text']), operationKey }));
    const credential = generateCredential(body.loginMethod);
    const hash = await (await auth.$context).password.hash(credentialPassword(config.BETTER_AUTH_SECRET, body.loginMethod, credential));
    const card: Card = { name: student.learner.displayName, username: student.username!, className: room.name, classCode: room.code, grade: student.learner.grade, method: body.loginMethod, credential, origin: config.APP_ORIGIN };
    const buffer = await loginCard(card);
    await db.transaction(async tx => {
      await activeClass(tx, room.id, actor.user.id);
      await operation(tx, actor.user.id, body.operationKey, { ...body, classId: room.id, studentId: student.learner.id }, student.learner.id);
      await tx.execute(sql`select id from learner where id = ${student.learner.id} for update`);
      await tx.update(s.account).set({ password: hash }).where(and(eq(s.account.userId, student.learner.authUserId), eq(s.account.providerId, 'credential')));
      await tx.update(s.learner).set({ loginMethod: body.loginMethod, credentialVersion: sql`${s.learner.credentialVersion} + 1` }).where(eq(s.learner.id, student.learner.id));
      await tx.delete(s.session).where(eq(s.session.userId, student.learner.authUserId));
      await audit(tx, actor.user.id, room.organizationId, 'student.credential-reset', student.learner.id);
    });
    return pdf(c, buffer, student.learner.displayName);
  });
  app.post('/classes/:id/students/:studentId/update', async c => {
    const { actor, room } = await manages(c, c.req.param('id'), true);
    const student = await enrolled(room.id, c.req.param('studentId'));
    const body = await input(c, z.object({ displayName: name, grade, active: z.boolean(), operationKey }));
    await db.transaction(async tx => {
      await activeClass(tx, room.id, actor.user.id);
      await operation(tx, actor.user.id, body.operationKey, { ...body, classId: room.id, studentId: student.learner.id }, student.learner.id);
      await tx.execute(sql`select id from learner where id = ${student.learner.id} for update`);
      await tx.update(s.learner).set({ displayName: body.displayName, grade: body.grade, active: body.active }).where(eq(s.learner.id, student.learner.id));
      await tx.update(s.user).set({ name: body.displayName }).where(eq(s.user.id, student.learner.authUserId));
      if (!body.active) await tx.delete(s.session).where(eq(s.session.userId, student.learner.authUserId));
      await audit(tx, actor.user.id, room.organizationId, body.active ? 'student.updated' : 'student.disabled', student.learner.id);
    });
    return c.json({ saved: true });
  });

  app.post('/classes/:id/assignments', async c => {
    const { actor, room } = await manages(c, c.req.param('id'), true);
    const body = await input(c, z.object({ courseKey: z.enum(assignedCourseKeys), assigned: z.boolean(), operationKey }));
    await db.transaction(async tx => {
      await activeClass(tx, room.id, actor.user.id);
      await operation(tx, actor.user.id, body.operationKey, { ...body, classId: room.id }, room.id);
      await tx.execute(sql`select id from classroom where id = ${room.id} for update`);
      if (body.assigned) await tx.insert(s.courseAssignment).values({ id: randomUUID(), classroomId: room.id, courseKey: body.courseKey, curriculumVersion: CURRICULUM_VERSION }).onConflictDoNothing();
      else await tx.delete(s.courseAssignment).where(and(eq(s.courseAssignment.classroomId, room.id), eq(s.courseAssignment.courseKey, body.courseKey), eq(s.courseAssignment.curriculumVersion, CURRICULUM_VERSION)));
      await audit(tx, actor.user.id, room.organizationId, body.assigned ? 'course.assigned' : 'course.unassigned', room.id);
    });
    return c.json({ saved: true });
  });
  app.post('/classes/:id/assignments/save', async c => {
    const { actor, room } = await manages(c, c.req.param('id'), true);
    const body = await input(c, z.object({ courses: z.array(z.enum(assignedCourseKeys)).max(6).refine(keys => new Set(keys).size === keys.length), previous: z.array(z.enum(assignedCourseKeys)).max(6), operationKey }).strict());
    await db.transaction(async tx => {
      await activeClass(tx, room.id, actor.user.id);
      await operation(tx, actor.user.id, body.operationKey, { ...body, classId: room.id }, room.id);
      await tx.execute(sql`select id from classroom where id = ${room.id} for update`);
      const previous = await tx.select().from(s.courseAssignment).where(and(eq(s.courseAssignment.classroomId, room.id), eq(s.courseAssignment.curriculumVersion, CURRICULUM_VERSION)));
      if (previous.map(item => item.courseKey).sort().join(',') !== [...body.previous].sort().join(',')) return fail(409, 'ASSIGNMENT_CONFLICT');
      for (const assignment of previous) if (!body.courses.includes(assignment.courseKey as typeof assignedCourseKeys[number])) await tx.delete(s.courseAssignment).where(eq(s.courseAssignment.id, assignment.id));
      for (const courseKey of body.courses) await tx.insert(s.courseAssignment).values({ id: randomUUID(), classroomId: room.id, courseKey, curriculumVersion: CURRICULUM_VERSION }).onConflictDoNothing();
      await audit(tx, actor.user.id, room.organizationId, 'courses.updated', room.id);
    });
    return c.json({ saved: true });
  });
  return app;
}
