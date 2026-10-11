import { randomUUID } from 'node:crypto';
import { and, eq, or } from 'drizzle-orm';
import { z } from 'zod';
import { Hono } from 'hono';
import type { Auth } from './auth.js';
import type { Database } from './db/client.js';
import { classroom, classroomStaff, organization, organizationMember } from './db/schema.js';

export function createAccountRoutes(auth: Auth, db: Database) {
  const app = new Hono();
  const sessionFor = (headers: Headers) => auth.api.getSession({ headers });
  app.get('/', async c => {
    const session = await sessionFor(c.req.raw.headers);
    if (!session) return c.json({ error: 'Sign in to continue' }, 401);
    if (session.user.principalKind !== 'adult' || !session.user.emailVerified) return c.json({ error: 'Verified adult account required' }, 403);
    const workspaces = await db.select({ id: organization.id, name: organization.name, kind: organization.kind, role: organizationMember.role })
      .from(organizationMember).innerJoin(organization, eq(organization.id, organizationMember.organizationId))
      .where(eq(organizationMember.userId, session.user.id));
    const classes = await db.select({ id: classroom.id, organizationId: classroom.organizationId, name: classroom.name, code: classroom.code, grade: classroom.grade, archivedAt: classroom.archivedAt })
      .from(classroom).innerJoin(organization, eq(organization.id, classroom.organizationId))
      .innerJoin(organizationMember, and(eq(organizationMember.organizationId, classroom.organizationId), eq(organizationMember.userId, session.user.id)))
      .leftJoin(classroomStaff, and(eq(classroomStaff.classroomId, classroom.id), eq(classroomStaff.organizationId, classroom.organizationId), eq(classroomStaff.userId, session.user.id)))
      .where(or(and(eq(organization.kind, 'school'), eq(organizationMember.role, 'school_admin')), and(eq(organizationMember.role, 'teacher'), eq(classroomStaff.userId, session.user.id))));
    return c.json({ profile: { name: session.user.name, email: session.user.email, twoFactorEnabled: session.user.twoFactorEnabled }, workspaces, classes });
  });
  app.post('/onboarding', async c => {
    const session = await sessionFor(c.req.raw.headers);
    if (!session) return c.json({ error: 'Sign in to continue' }, 401);
    if (session.user.principalKind !== 'adult' || !session.user.emailVerified) return c.json({ error: 'Verified adult account required' }, 403);
    const input = z.object({ role: z.enum(['teacher', 'parent']), name: z.string().trim().min(2).max(80) }).safeParse(await c.req.json());
    if (!input.success) return c.json({ error: 'Choose your account type and a workspace name' }, 400);
    // Serialize first-workspace creation per user, including across API instances.
    const { sql } = await import('drizzle-orm');
    const created = await db.transaction(async tx => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${session.user.id}))`);
      const existing = await tx.select({ kind: organization.kind }).from(organizationMember).innerJoin(organization, eq(organization.id, organizationMember.organizationId)).where(eq(organizationMember.userId, session.user.id));
      if (existing.some(workspace => workspace.kind !== 'school')) return false;
      const id = randomUUID();
      await tx.insert(organization).values({ id, name: input.data.name, kind: input.data.role === 'teacher' ? 'teacher_workspace' : 'family' });
      await tx.insert(organizationMember).values({ organizationId: id, userId: session.user.id, role: input.data.role });
      return true;
    });
    return c.json({ created }, created ? 201 : 200);
  });
  return app;
}
