import { and, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { isDeepStrictEqual } from 'node:util';
import type { Auth } from './auth.js';
import type { Database } from './db/client.js';
import type { ServerConfig } from './config.js';
import * as s from './db/schema.js';
import { studentContext } from './student-context.js';
import { recoveryAccess } from './recovery.js';
import { budget } from './classroom-policy.js';
import { curriculumVersion, gradeKey, preserveAchievements, progressDocument, validCourseDocument } from '../shared/progress.js';

export function createProgressRoutes(auth: Auth, db: Database, config: Pick<ServerConfig, 'BETTER_AUTH_SECRET'>) {
  const app = new Hono();
  const key = (context: { learnerId: string; classroomId: string }, courseKey: string) => and(eq(s.learnerProgress.learnerId, context.learnerId), eq(s.learnerProgress.classroomId, context.classroomId), eq(s.learnerProgress.courseKey, courseKey), eq(s.learnerProgress.curriculumVersion, curriculumVersion));
  async function assigned(query: Pick<Database, 'select'>, classroomId: string, courseKey: string) {
    const [assignment] = await query.select().from(s.courseAssignment).where(and(eq(s.courseAssignment.classroomId, classroomId), eq(s.courseAssignment.courseKey, courseKey), eq(s.courseAssignment.curriculumVersion, curriculumVersion)));
    return !!assignment;
  }
  app.get('/:course', async c => {
    const course = gradeKey.safeParse(c.req.param('course'));
    const context = await studentContext(auth, db, c.req.raw.headers);
    if (!context) return c.json({ code: 'UNAUTHORIZED' }, 401);
    if (!course.success || !await assigned(db, context.classroomId, course.data)) return c.json({ code: 'NOT_ASSIGNED' }, 403);
    const [saved] = await db.select().from(s.learnerProgress).where(key(context, course.data));
    return c.json({ learnerId: context.learnerId, classroomId: context.classroomId, recovery: recoveryAccess(config.BETTER_AUTH_SECRET, context.learnerId, context.classroomId, context.credentialVersion, course.data), ...(saved ? { revision: saved.revision, document: saved.document, updatedAt: saved.updatedAt.toISOString() } : { revision: 0, document: null, updatedAt: null }) });
  });
  app.post('/:course', async c => {
    const course = gradeKey.safeParse(c.req.param('course'));
    const input = z.object({ learnerId: z.string().max(100), classroomId: z.string().max(100), revision: z.number().int().min(0).max(2147483646), document: progressDocument }).strict().safeParse(await c.req.json().catch(() => null));
    if (!course.success || !input.success || !validCourseDocument(course.data, input.data.document) || Buffer.byteLength(JSON.stringify(input.data.document)) > 900000) return c.json({ code: 'INVALID_PROGRESS' }, 400);
    const actor = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!actor) return c.json({ code: 'UNAUTHORIZED' }, 401);
    const context = await studentContext(auth, db, c.req.raw.headers, actor);
    if (!context) return c.json({ code: 'UNAUTHORIZED' }, 401);
    if (context.learnerId !== input.data.learnerId || context.classroomId !== input.data.classroomId) return c.json({ code: 'UNAUTHORIZED' }, 401);
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'progress-save', context.learnerId, 180, 60)) return c.json({ code: 'LIMIT' }, 429);
    return db.transaction(async tx => {
      // Serializes first insert and revision checks, even before the row exists.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${JSON.stringify(['progress', context.learnerId, context.classroomId, course.data])}))`);
      await tx.select().from(s.learner).where(eq(s.learner.id, context.learnerId)).for('share');
      const live = await studentContext(auth, tx, c.req.raw.headers, actor);
      if (!live || live.learnerId !== context.learnerId || live.classroomId !== context.classroomId) return c.json({ code: 'UNAUTHORIZED' }, 401);
      // Locks serialize saves and prevent assignment/credential changes racing a write.
      const [assignment] = await tx.select().from(s.courseAssignment).where(and(eq(s.courseAssignment.classroomId, live.classroomId), eq(s.courseAssignment.courseKey, course.data), eq(s.courseAssignment.curriculumVersion, curriculumVersion))).for('share');
      if (!assignment) return c.json({ code: 'NOT_ASSIGNED' }, 403);
      const [old] = await tx.select().from(s.learnerProgress).where(key(live, course.data));
      // A response lost in transit can safely retry the same exact snapshot.
      if (old && isDeepStrictEqual(old.document, preserveAchievements(old.document, structuredClone(input.data.document)))) return c.json({ revision: old.revision, updatedAt: old.updatedAt.toISOString() });
      if ((old?.revision ?? 0) !== input.data.revision) return c.json({ code: 'PROGRESS_CONFLICT' }, 409);
      const document = preserveAchievements(old?.document ?? null, input.data.document);
      const updatedAt = new Date(), revision = (old?.revision ?? 0) + 1;
      await tx.insert(s.learnerProgress).values({ ...live, courseKey: course.data, curriculumVersion, revision, document, updatedAt }).onConflictDoUpdate({ target: [s.learnerProgress.classroomId, s.learnerProgress.learnerId, s.learnerProgress.courseKey, s.learnerProgress.curriculumVersion], set: { revision, document, updatedAt } });
      return c.json({ revision, updatedAt: updatedAt.toISOString() });
    });
  });
  return app;
}
