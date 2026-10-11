import { and, eq, gt } from 'drizzle-orm';
import type { Auth } from './auth.js';
import type { Database } from './db/client.js';
import * as s from './db/schema.js';

export async function studentContext(auth: Auth, db: Pick<Database, 'select'>, headers: Headers, verifiedActor?: NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>) {
  const actor = verifiedActor ?? await auth.api.getSession({ headers });
  if (!actor || actor.user.principalKind !== 'learner') return null;
  const [context] = await db.select({ learnerId: s.learner.id, displayName: s.learner.displayName, classroomId: s.classroom.id, classroomName: s.classroom.name, credentialVersion: s.learner.credentialVersion })
    .from(s.learnerSession).innerJoin(s.session, and(eq(s.session.id, s.learnerSession.sessionId), gt(s.session.expiresAt, new Date())))
    .innerJoin(s.learner, and(eq(s.learner.id, s.learnerSession.learnerId), eq(s.learner.authUserId, actor.user.id), eq(s.learner.active, true), eq(s.learner.credentialVersion, s.learnerSession.credentialVersion)))
    .innerJoin(s.enrollment, and(eq(s.enrollment.learnerId, s.learner.id), eq(s.enrollment.classroomId, s.learnerSession.classroomId), eq(s.enrollment.organizationId, s.learnerSession.organizationId)))
    .innerJoin(s.classroom, and(eq(s.classroom.id, s.enrollment.classroomId), eq(s.classroom.organizationId, s.enrollment.organizationId)))
    .where(eq(s.learnerSession.sessionId, actor.session.id));
  return context ?? null;
}
