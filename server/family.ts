import { createHash, randomInt, randomUUID } from 'node:crypto';
import { and, count, eq, inArray, sql } from 'drizzle-orm';
import { Hono, type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getCookie } from 'hono/cookie';
import { z } from 'zod';
import type { Auth } from './auth.js';
import type { Database } from './db/client.js';
import type { ServerConfig } from './config.js';
import * as s from './db/schema.js';
import { assignedCourseKeys, budget, credentialPassword, generateCredential, randomCode, stepCookie, usernameBases, validStepGrant } from './classroom-policy.js';
import { loginCard } from './login-card.js';
import { curriculumVersion, type GradeKey } from '../shared/progress.js';
import { reportSummary } from '../shared/reports.js';
import { progressCatalog } from '../shared/progress-catalog.js';

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
const name = z.string().trim().min(1).max(60), grade = z.number().int().min(1).max(6);
const method = z.enum(['picture', 'text']), operationKey = z.string().uuid();
const profile = z.object({ displayName: name, grade, active: z.boolean() }).strict();
const fail = (status: 400 | 401 | 403 | 404 | 409 | 429, code: string): never => { throw new HTTPException(status, { res: Response.json({ code }, { status }) }); };
async function input<T>(c: Context, schema: z.ZodType<T>) {
  const result = schema.safeParse(await c.req.json().catch(() => null));
  return result.success ? result.data : fail(400, 'INVALID_INPUT');
}

export function createFamilyRoutes(auth: Auth, db: Database, config: Pick<ServerConfig, 'APP_ORIGIN' | 'BETTER_AUTH_SECRET'>) {
  const app = new Hono();
  async function adult(c: Context, step = false) {
    const actor = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!actor) return fail(401, 'UNAUTHORIZED');
    if (actor.user.principalKind !== 'adult' || !actor.user.emailVerified) return fail(403, 'FORBIDDEN');
    if (step && !validStepGrant(config.BETTER_AUTH_SECRET, actor.session.id, getCookie(c, stepCookie))) return fail(403, 'STEP_UP_REQUIRED');
    return actor;
  }
  async function family(store: Pick<Database, 'select'>, actorId: string, id: string) {
    const [row] = await store.select({ id: s.organization.id, name: s.organization.name }).from(s.organization)
      .innerJoin(s.organizationMember, and(eq(s.organizationMember.organizationId, s.organization.id), eq(s.organizationMember.userId, actorId), eq(s.organizationMember.role, 'parent')))
      .where(and(eq(s.organization.id, id), eq(s.organization.kind, 'family')));
    return row ?? fail(404, 'NOT_FOUND');
  }
  async function children(store: Pick<Database, 'select'>, actorId: string, familyId: string) {
    return store.select({ id: s.learner.id, displayName: s.learner.displayName, grade: s.learner.grade, loginMethod: s.learner.loginMethod, active: s.learner.active, username: s.user.username, contextId: s.classroom.id, homeCode: s.classroom.code })
      .from(s.learner).innerJoin(s.guardianLink, and(eq(s.guardianLink.learnerId, s.learner.id), eq(s.guardianLink.guardianUserId, actorId)))
      .innerJoin(s.user, eq(s.user.id, s.learner.authUserId))
      .innerJoin(s.enrollment, and(eq(s.enrollment.learnerId, s.learner.id), eq(s.enrollment.organizationId, familyId)))
      .innerJoin(s.classroom, and(eq(s.classroom.id, s.enrollment.classroomId), eq(s.classroom.organizationId, familyId)))
      .where(eq(s.learner.organizationId, familyId));
  }
  async function lockedChild(tx: Transaction, actorId: string, familyId: string, childId: string) {
    await tx.select().from(s.organization).where(eq(s.organization.id, familyId)).for('update');
    const home = await family(tx, actorId, familyId);
    const child = (await children(tx, actorId, familyId)).find(row => row.id === childId) ?? fail(404, 'NOT_FOUND');
    // Same lock order as login and cloud saves: learning context, then learner.
    await tx.select().from(s.classroom).where(eq(s.classroom.id, child.contextId)).for('update');
    const [learner] = await tx.select().from(s.learner).where(eq(s.learner.id, childId)).for('update');
    return { home, child, learner };
  }
  async function operation(tx: Transaction, actorId: string, body: { operationKey: string }, resourceId: string) {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${JSON.stringify([actorId, body.operationKey])}))`);
    const digest = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    const [existing] = await tx.select().from(s.managementOperation).where(and(eq(s.managementOperation.actorId, actorId), eq(s.managementOperation.key, body.operationKey)));
    if (existing) return fail(409, existing.digest === digest ? 'ALREADY_PROCESSED' : 'OPERATION_CONFLICT');
    await tx.insert(s.managementOperation).values({ actorId, key: body.operationKey, digest, resourceId });
  }
  const audit = (tx: Transaction, actorId: string, organizationId: string, action: string, resourceId: string) => tx.insert(s.auditEvent).values({ id: randomUUID(), actorId, organizationId, action, resourceId });
  function pdf(c: Context, buffer: Buffer) {
    c.header('Content-Type', 'application/pdf'); c.header('Content-Disposition', 'attachment; filename="kodearcade-private-home-card.pdf"');
    c.header('Cache-Control', 'private, no-store, max-age=0'); c.header('Pragma', 'no-cache'); return c.body(new Uint8Array(buffer));
  }
  app.post('/setup', async c => {
    const actor = await adult(c, true), body = await input(c, z.object({ name, authority: z.literal(true) }).strict());
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'family-setup', actor.user.id, 10, 900)) return fail(429, 'LIMIT');
    const id = await db.transaction(async tx => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${actor.user.id}))`);
      const [existing] = await tx.select({ id: s.organization.id }).from(s.organization).innerJoin(s.organizationMember, eq(s.organizationMember.organizationId, s.organization.id)).where(and(eq(s.organizationMember.userId, actor.user.id), eq(s.organizationMember.role, 'parent'), eq(s.organization.kind, 'family')));
      if (existing) return existing.id;
      const id = randomUUID();
      await tx.insert(s.organization).values({ id, name: body.name, kind: 'family' });
      await tx.insert(s.organizationMember).values({ organizationId: id, userId: actor.user.id, role: 'parent' });
      await audit(tx, actor.user.id, id, 'family.created', id); return id;
    });
    return c.json({ id });
  });
  app.get('/:familyId', async c => {
    const actor = await adult(c), familyId = c.req.param('familyId');
    const home = await family(db, actor.user.id, familyId), rows = await children(db, actor.user.id, familyId);
    const result = await Promise.all(rows.map(async child => {
      const assignments = await db.select().from(s.courseAssignment).where(and(eq(s.courseAssignment.classroomId, child.contextId), eq(s.courseAssignment.curriculumVersion, curriculumVersion)));
      const saved = await db.select().from(s.learnerProgress).where(and(eq(s.learnerProgress.learnerId, child.id), eq(s.learnerProgress.classroomId, child.contextId), eq(s.learnerProgress.curriculumVersion, curriculumVersion)));
      return { ...child, courses: assignments.filter(row => assignedCourseKeys.includes(row.courseKey as GradeKey)).map(row => {
        const course = row.courseKey as GradeKey, state = saved.find(state => state.courseKey === course);
        return { course, ...reportSummary(course, state ? { revision: state.revision, document: state.document, updatedAt: state.updatedAt.toISOString() } : undefined), challenges: progressCatalog[course].challenges.map(id => { const progress = state?.document.progress[id]; return { id, title: progressCatalog[course].missions.find(m => m.id === id)?.title ?? id, complete: !!progress?.complete, stars: progress?.stars ?? 0, attempts: progress?.attempts ?? 0, hints: progress?.hints ?? 0 }; }) };
      }) };
    }));
    // Deliberately no raw code, workspace XML, recovery keys, hashes or credentials.
    return c.json({ ...home, children: result, generatedAt: new Date().toISOString() });
  });
  app.post('/:familyId/children', async c => {
    const actor = await adult(c, true), familyId = c.req.param('familyId');
    const body = await input(c, z.object({ displayName: name, grade, loginMethod: method, authority: z.literal(true), operationKey }).strict());
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'home-child-create', actor.user.id, 20, 900)) return fail(429, 'LIMIT');
    const credential = generateCredential(body.loginMethod), hash = await (await auth.$context).password.hash(credentialPassword(config.BETTER_AUTH_SECRET, body.loginMethod, credential));
    const buffer = await db.transaction(async tx => {
      await tx.select().from(s.organization).where(eq(s.organization.id, familyId)).for('update');
      const home = await family(tx, actor.user.id, familyId);
      const id = randomUUID(), contextId = randomUUID(), userId = randomUUID(), homeCode = randomCode(8);
      await operation(tx, actor.user.id, body, id);
      const [total] = await tx.select({ total: count() }).from(s.learner).where(eq(s.learner.organizationId, familyId));
      if (total.total >= 10) return fail(409, 'FAMILY_LIMIT');
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext('kodearcade-learner-usernames'))`);
      const [first, full] = usernameBases(body.displayName);
      let username = '';
      for (let attempt = 0; attempt < 22; attempt++) {
        const candidate = attempt === 0 ? first : attempt === 1 ? full : `${full}${randomInt(1000, 1_000_000)}`;
        if (!(await tx.select({ id: s.user.id }).from(s.user).where(eq(s.user.username, candidate))).length) { username = candidate; break; }
      }
      if (!username) return fail(409, 'USERNAME_UNAVAILABLE');
      const card = await loginCard({ name: body.displayName, username, className: home.name, classCode: homeCode, grade: body.grade, method: body.loginMethod, credential, origin: config.APP_ORIGIN, context: 'home' });
      await tx.insert(s.user).values({ id: userId, name: body.displayName, email: `${userId}@learners.invalid`, emailVerified: true, principalKind: 'learner', username, displayUsername: username });
      await tx.insert(s.account).values({ id: randomUUID(), userId, accountId: userId, providerId: 'credential', password: hash });
      await tx.insert(s.classroom).values({ id: contextId, organizationId: familyId, name: home.name, code: homeCode, grade: body.grade });
      await tx.insert(s.learner).values({ id, organizationId: familyId, authUserId: userId, displayName: body.displayName, grade: body.grade, loginMethod: body.loginMethod });
      await tx.insert(s.enrollment).values({ organizationId: familyId, classroomId: contextId, learnerId: id });
      await tx.insert(s.guardianLink).values({ learnerId: id, guardianUserId: actor.user.id, approvedAt: new Date() });
      await tx.insert(s.courseAssignment).values({ id: randomUUID(), classroomId: contextId, courseKey: `grade-${body.grade}`, curriculumVersion });
      await audit(tx, actor.user.id, familyId, 'home-child.created', id); return card;
    });
    return pdf(c, buffer);
  });
  app.post('/:familyId/children/:childId/reset', async c => {
    const actor = await adult(c, true), familyId = c.req.param('familyId'), childId = c.req.param('childId');
    const body = await input(c, z.object({ loginMethod: method, operationKey }).strict());
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'home-child-reset', actor.user.id, 20, 900)) return fail(429, 'LIMIT');
    const credential = generateCredential(body.loginMethod), hash = await (await auth.$context).password.hash(credentialPassword(config.BETTER_AUTH_SECRET, body.loginMethod, credential));
    const buffer = await db.transaction(async tx => {
      const { child, home, learner } = await lockedChild(tx, actor.user.id, familyId, childId);
      if (!child.active) return fail(409, 'DISABLED_STUDENT');
      await operation(tx, actor.user.id, body, childId);
      const card = await loginCard({ name: child.displayName, username: child.username!, className: home.name, classCode: child.homeCode, grade: child.grade, method: body.loginMethod, credential, origin: config.APP_ORIGIN, context: 'home' });
      await tx.update(s.account).set({ password: hash }).where(and(eq(s.account.userId, learner.authUserId), eq(s.account.providerId, 'credential')));
      await tx.update(s.learner).set({ loginMethod: body.loginMethod, credentialVersion: sql`${s.learner.credentialVersion} + 1` }).where(eq(s.learner.id, childId));
      await tx.delete(s.session).where(eq(s.session.userId, learner.authUserId));
      await audit(tx, actor.user.id, familyId, 'home-child.credential-reset', childId); return card;
    }); return pdf(c, buffer);
  });
  app.post('/:familyId/children/:childId/profile', async c => {
    const actor = await adult(c, true), familyId = c.req.param('familyId'), childId = c.req.param('childId');
    const body = await input(c, z.object({ profile, previous: profile, operationKey }).strict());
    await db.transaction(async tx => {
      const { child, learner } = await lockedChild(tx, actor.user.id, familyId, childId);
      await operation(tx, actor.user.id, body, childId);
      if (Object.entries(body.previous).some(([key, value]) => child[key as keyof typeof body.previous] !== value)) return fail(409, 'PROFILE_CONFLICT');
      await tx.update(s.learner).set({ ...body.profile, ...(!body.profile.active && child.active ? { credentialVersion: sql`${s.learner.credentialVersion} + 1` } : {}) }).where(eq(s.learner.id, childId));
      await tx.update(s.user).set({ name: body.profile.displayName }).where(eq(s.user.id, learner.authUserId));
      await tx.update(s.classroom).set({ grade: body.profile.grade }).where(eq(s.classroom.id, child.contextId));
      if (!body.profile.active) await tx.delete(s.session).where(eq(s.session.userId, learner.authUserId));
      await audit(tx, actor.user.id, familyId, 'home-child.profile-updated', childId);
    }); return c.json({ updated: true });
  });
  app.post('/:familyId/children/:childId/courses', async c => {
    const actor = await adult(c, true), familyId = c.req.param('familyId'), childId = c.req.param('childId');
    const courses = z.array(z.enum(assignedCourseKeys)).max(6).refine(value => new Set(value).size === value.length);
    const body = await input(c, z.object({ courses, previous: courses, operationKey }).strict());
    await db.transaction(async tx => {
      const { child } = await lockedChild(tx, actor.user.id, familyId, childId);
      await operation(tx, actor.user.id, body, childId);
      const rows = await tx.select().from(s.courseAssignment).where(and(eq(s.courseAssignment.classroomId, child.contextId), eq(s.courseAssignment.curriculumVersion, curriculumVersion)));
      if (JSON.stringify(rows.map(row => row.courseKey).sort()) !== JSON.stringify([...body.previous].sort())) return fail(409, 'ASSIGNMENT_CONFLICT');
      const removed = rows.filter(row => !body.courses.includes(row.courseKey as GradeKey)).map(row => row.id);
      if (removed.length) await tx.delete(s.courseAssignment).where(inArray(s.courseAssignment.id, removed));
      for (const course of body.courses.filter(course => !rows.some(row => row.courseKey === course))) await tx.insert(s.courseAssignment).values({ id: randomUUID(), classroomId: child.contextId, courseKey: course, curriculumVersion });
      // Retain saved work when a course is removed, so re-adding it resumes safely.
      await audit(tx, actor.user.id, familyId, 'home-child.courses-updated', childId);
    }); return c.json({ updated: true });
  });
  return app;
}
