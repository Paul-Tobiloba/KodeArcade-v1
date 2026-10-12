import { and, eq, isNull, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { Auth } from './auth.js';
import type { Database } from './db/client.js';
import type { ServerConfig } from './config.js';
import * as s from './db/schema.js';
import { budget, credentialPassword, CURRICULUM_VERSION } from './classroom-policy.js';
import { pictureIds } from '../shared/pictures.js';
import { studentContext } from './student-context.js';
import { recoveryOwner } from './recovery.js';
import { summarizeProgress, type GradeKey } from '../shared/progress.js';

export function createStudentRoutes(auth: Auth, db: Database, config: Pick<ServerConfig, 'BETTER_AUTH_SECRET'>) {
  const app = new Hono();
  const denied = () => Response.json({ code: 'INVALID_STUDENT_LOGIN' }, { status: 401 });
  app.post('/classroom', async c => {
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'class-lookup-global', 'all', 60, 900)) return c.json({ code: 'LIMIT' }, 429);
    const input = z.object({ classCode: z.string().trim().toUpperCase().regex(/^[A-Z2-9]{8}$/), scope: z.enum(['home', 'classroom']).default('classroom') }).strict().safeParse(await c.req.json().catch(() => null));
    if (!input.success) return c.json({ code: 'CLASS_NOT_FOUND' }, 404);
    const [room] = await db.select({ id: s.classroom.id }).from(s.classroom).innerJoin(s.organization, eq(s.organization.id, s.classroom.organizationId)).where(and(eq(s.classroom.code, input.data.classCode), isNull(s.classroom.archivedAt), input.data.scope === 'home' ? eq(s.organization.kind, 'family') : sql`${s.organization.kind} <> 'family'`));
    // No names, avatars, password methods or roster are disclosed before individual login.
    return room ? c.json({ found: true }) : c.json({ code: 'CLASS_NOT_FOUND' }, 404);
  });
  app.post('/login', async c => {
    const input = z.object({ classCode: z.string().trim().toUpperCase().regex(/^[A-Z2-9]{8}$/), scope: z.enum(['home', 'classroom']).default('classroom'), username: z.string().trim().toLowerCase().regex(/^[a-z0-9]{1,60}$/), method: z.enum(['picture', 'text']), password: z.string().min(1).max(128).optional(), pictures: z.array(z.string().refine(id => pictureIds.includes(id))).length(4).optional() }).strict().safeParse(await c.req.json().catch(() => null));
    if (!input.success) return denied();
    if (await auth.api.getSession({ headers: c.req.raw.headers })) return c.json({ code: 'SIGN_OUT_FIRST' }, 409);
    const body = input.data;
    const allowed = await Promise.all([
      budget(db, config.BETTER_AUTH_SECRET, 'student-global', 'all', 1000, 900),
      budget(db, config.BETTER_AUTH_SECRET, 'student-class', body.classCode, 500, 900),
    ]);
    if (allowed.includes(false)) return c.json({ code: 'LIMIT' }, 429);
    const [student] = await db.select({ learner: s.learner, classroomId: s.classroom.id }).from(s.user)
      .innerJoin(s.learner, eq(s.learner.authUserId, s.user.id))
      .innerJoin(s.enrollment, and(eq(s.enrollment.learnerId, s.learner.id), eq(s.enrollment.organizationId, s.learner.organizationId)))
      .innerJoin(s.classroom, and(eq(s.classroom.id, s.enrollment.classroomId), eq(s.classroom.organizationId, s.learner.organizationId)))
      .innerJoin(s.organization, eq(s.organization.id, s.classroom.organizationId))
      .where(and(eq(s.user.username, body.username), eq(s.user.principalKind, 'learner'), eq(s.classroom.code, body.classCode), isNull(s.classroom.archivedAt), body.scope === 'home' ? eq(s.organization.kind, 'family') : sql`${s.organization.kind} <> 'family'`));
    const identity = JSON.stringify([body.classCode, body.username, student?.learner.credentialVersion ?? 0]);
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'student-account-daily', identity, student?.learner.loginMethod === 'picture' ? 5 : 30, 86400)) return c.json({ code: 'LIMIT' }, 429);
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'student-account-short', identity, 5, 900)) return c.json({ code: 'LIMIT' }, 429);
    const credential = body.method === 'picture' ? body.pictures : body.password;
    if (!student || !student.learner.active || body.method !== student.learner.loginMethod || !credential) {
      await (await auth.$context).password.hash(credentialPassword(config.BETTER_AUTH_SECRET, body.method, credential ?? 'invalid'));
      return denied();
    }
    let token: string | undefined;
    try {
      // The raw username endpoint remains unmounted. Better Auth verifies the hash and
      // owns the opaque session/cookie; application policy binds it to this class.
      const response = await auth.api.signInUsername({ headers: c.req.raw.headers, body: { username: body.username, password: credentialPassword(config.BETTER_AUTH_SECRET, body.method, credential), rememberMe: false }, asResponse: true });
      if (!response.ok) return denied();
      const data = await response.json() as { token: string; user: { id: string } };
      token = data.token;
      if (data.user.id !== student.learner.authUserId) throw new Error('Identity mismatch');
      await db.transaction(async tx => {
        const [room] = await tx.select().from(s.classroom).where(eq(s.classroom.id, student.classroomId)).for('share');
        if (!room || room.archivedAt) throw new Error('Class unavailable');
        const [current] = await tx.select().from(s.learner).where(eq(s.learner.id, student.learner.id)).for('update');
        if (!current?.active || current.credentialVersion !== student.learner.credentialVersion) throw new Error('Credential changed');
        const [session] = await tx.select().from(s.session).where(and(eq(s.session.token, data.token), eq(s.session.userId, current.authUserId)));
        if (!session) throw new Error('Session unavailable');
        await tx.insert(s.learnerSession).values({ sessionId: session.id, organizationId: current.organizationId, classroomId: student.classroomId, learnerId: current.id, credentialVersion: current.credentialVersion });
      });
      for (const cookie of response.headers.getSetCookie()) c.header('Set-Cookie', cookie, { append: true });
      return c.json({ signedIn: true });
    } catch {
      if (token) await db.delete(s.session).where(eq(s.session.token, token));
      return denied();
    }
  });
  app.get('/courses', async c => {
    const context = await studentContext(auth, db, c.req.raw.headers);
    if (!context) return c.json({ code: 'UNAUTHORIZED' }, 401);
    const assignments = await db.select({ id: s.courseAssignment.id, courseKey: s.courseAssignment.courseKey }).from(s.courseAssignment).where(and(eq(s.courseAssignment.classroomId, context.classroomId), eq(s.courseAssignment.curriculumVersion, CURRICULUM_VERSION), sql`${s.courseAssignment.courseKey} in ('grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6')`));
    const saved = await db.select().from(s.learnerProgress).where(and(eq(s.learnerProgress.learnerId, context.learnerId), eq(s.learnerProgress.classroomId, context.classroomId), eq(s.learnerProgress.curriculumVersion, CURRICULUM_VERSION)));
    return c.json({ ...context, offlineOwner: recoveryOwner(config.BETTER_AUTH_SECRET, context.learnerId, context.classroomId, context.credentialVersion), assignments: assignments.map(assignment => { const state = saved.find(row => row.courseKey === assignment.courseKey); return { ...assignment, progress: summarizeProgress(assignment.courseKey as GradeKey, state ? { revision: state.revision, document: state.document, updatedAt: state.updatedAt.toISOString() } : undefined) }; }), progressMode: 'cloud' });
  });
  return app;
}
