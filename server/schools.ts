import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { and, count, eq, gt, isNull, sql } from 'drizzle-orm';
import { Hono, type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getCookie } from 'hono/cookie';
import { z } from 'zod';
import type { Auth } from './auth.js';
import type { Database } from './db/client.js';
import type { ServerConfig } from './config.js';
import * as s from './db/schema.js';
import { budget, stepCookie, validStepGrant } from './classroom-policy.js';
import type { StaffDatabase } from './staff-access.js';

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
const role = z.enum(['teacher', 'school_admin']);
const operationKey = z.string().uuid();
const fail = (status: 400 | 401 | 403 | 404 | 409 | 429, code: string): never => { throw new HTTPException(status, { res: Response.json({ code }, { status }) }); };
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
async function input<T>(c: Context, schema: z.ZodType<T>): Promise<T> {
  const result = schema.safeParse(await c.req.json().catch(() => null));
  return result.success ? result.data : fail(400, 'INVALID_INPUT');
}

export function createSchoolRoutes(auth: Auth, db: Database, config: Pick<ServerConfig, 'APP_ORIGIN' | 'BETTER_AUTH_SECRET'>) {
  const app = new Hono();
  async function adult(c: Context, step = false) {
    const actor = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!actor) return fail(401, 'UNAUTHORIZED');
    if (actor.user.principalKind !== 'adult' || !actor.user.emailVerified) return fail(403, 'FORBIDDEN');
    if (step && !validStepGrant(config.BETTER_AUTH_SECRET, actor.session.id, getCookie(c, stepCookie))) return fail(403, 'STEP_UP_REQUIRED');
    return actor;
  }
  async function school(store: StaffDatabase, id: string, actorId: string, admin = true) {
    const [member] = await store.select({ id: s.organization.id, name: s.organization.name, role: s.organizationMember.role }).from(s.organization)
      .innerJoin(s.organizationMember, and(eq(s.organizationMember.organizationId, s.organization.id), eq(s.organizationMember.userId, actorId)))
      .where(and(eq(s.organization.id, id), eq(s.organization.kind, 'school')));
    if (!member || (admin && member.role !== 'school_admin')) return fail(404, 'NOT_FOUND');
    return member;
  }
  async function lockSchool(tx: Transaction, id: string, actorId: string) {
    await tx.select().from(s.organization).where(eq(s.organization.id, id)).for('update');
    return school(tx, id, actorId);
  }
  async function operation(tx: Transaction, actorId: string, key: string, body: unknown, resourceId: string, replayCreation = false) {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${JSON.stringify([actorId, key])}))`);
    const fingerprint = digest(JSON.stringify(body));
    const [existing] = await tx.select().from(s.managementOperation).where(and(eq(s.managementOperation.actorId, actorId), eq(s.managementOperation.key, key)));
    if (existing) {
      if (existing.digest !== fingerprint) return fail(409, 'OPERATION_CONFLICT');
      if (replayCreation) {
        // A school ID is not a secret. Reconcile an ambiguous creation response,
        // but recheck current authority rather than reviving removed membership.
        await school(tx, existing.resourceId, actorId);
        return existing.resourceId;
      }
      return fail(409, 'ALREADY_PROCESSED');
    }
    await tx.insert(s.managementOperation).values({ actorId, key, digest: fingerprint, resourceId });
  }
  async function audit(tx: Transaction, actorId: string, organizationId: string, action: string, resourceId: string) {
    await tx.insert(s.auditEvent).values({ id: randomUUID(), actorId, organizationId, action, resourceId });
  }

  app.post('/', async c => {
    const actor = await adult(c, true);
    const body = await input(c, z.object({ name: z.string().trim().min(2).max(80), confirmAuthority: z.literal(true), operationKey }).strict());
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'school-create', actor.user.id, 5, 86400)) return fail(429, 'LIMIT');
    const id = randomUUID();
    const resolvedId = await db.transaction(async tx => {
      const existingId = await operation(tx, actor.user.id, body.operationKey, { ...body, action: 'school.create' }, id, true);
      if (existingId) return existingId;
      await tx.insert(s.organization).values({ id, name: body.name, kind: 'school' });
      await tx.insert(s.organizationMember).values({ organizationId: id, userId: actor.user.id, role: 'school_admin' });
      await audit(tx, actor.user.id, id, 'school.created', id);
      return id;
    });
    return c.json({ id: resolvedId }, 201);
  });

  app.get('/:id', async c => {
    const actor = await adult(c), id = c.req.param('id');
    const workspace = await school(db, id, actor.user.id);
    const members = await db.select({ userId: s.user.id, name: s.user.name, email: s.user.email, role: s.organizationMember.role }).from(s.organizationMember)
      .innerJoin(s.user, eq(s.user.id, s.organizationMember.userId)).where(eq(s.organizationMember.organizationId, id));
    const invitations = await db.select({ id: s.schoolInvitation.id, email: s.schoolInvitation.email, role: s.schoolInvitation.role, expiresAt: s.schoolInvitation.expiresAt }).from(s.schoolInvitation)
      .where(and(eq(s.schoolInvitation.organizationId, id), isNull(s.schoolInvitation.closedAt), gt(s.schoolInvitation.expiresAt, new Date())));
    const classes = await db.select({ id: s.classroom.id, name: s.classroom.name, archivedAt: s.classroom.archivedAt }).from(s.classroom).where(eq(s.classroom.organizationId, id));
    const staff = await db.select({ classId: s.classroomStaff.classroomId, userId: s.classroomStaff.userId }).from(s.classroomStaff).where(eq(s.classroomStaff.organizationId, id));
    return c.json({ workspace, members, invitations, classes: classes.map(room => ({ ...room, staffIds: staff.filter(member => member.classId === room.id).map(member => member.userId) })), actorId: actor.user.id });
  });

  app.post('/:id/invitations', async c => {
    const actor = await adult(c, true), id = c.req.param('id');
    await school(db, id, actor.user.id);
    const body = await input(c, z.object({ email: z.string().trim().email().max(254).transform(value => value.toLowerCase()), role, operationKey }).strict());
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'school-invite', actor.user.id, 30, 3600)) return fail(429, 'LIMIT');
    const invitationId = randomUUID(), token = randomBytes(32).toString('base64url'), expiresAt = new Date(Date.now() + 7 * 86400000);
    await db.transaction(async tx => {
      await lockSchool(tx, id, actor.user.id);
      await operation(tx, actor.user.id, body.operationKey, { ...body, schoolId: id, action: 'invite' }, invitationId);
      const [existing] = await tx.select().from(s.organizationMember).innerJoin(s.user, eq(s.user.id, s.organizationMember.userId)).where(and(eq(s.organizationMember.organizationId, id), eq(s.user.email, body.email)));
      if (existing) return fail(409, 'ALREADY_MEMBER');
      const [total] = await tx.select({ total: count() }).from(s.schoolInvitation).where(and(eq(s.schoolInvitation.organizationId, id), isNull(s.schoolInvitation.closedAt), gt(s.schoolInvitation.expiresAt, new Date())));
      if (total.total >= 100) return fail(409, 'INVITATION_LIMIT');
      // Reissuing an invitation explicitly invalidates the earlier link for this email.
      await tx.update(s.schoolInvitation).set({ closedAt: new Date() }).where(and(eq(s.schoolInvitation.organizationId, id), eq(s.schoolInvitation.email, body.email), isNull(s.schoolInvitation.closedAt)));
      await tx.insert(s.schoolInvitation).values({ id: invitationId, organizationId: id, email: body.email, role: body.role, tokenDigest: digest(token), createdBy: actor.user.id, expiresAt });
      await audit(tx, actor.user.id, id, 'school.invitation_created', invitationId);
    });
    return c.json({ url: `${config.APP_ORIGIN}/#/school-join?token=${token}`, expiresAt }, 201);
  });
  app.post('/:id/invitations/:invitationId/revoke', async c => {
    const actor = await adult(c, true), id = c.req.param('id');
    await input(c, z.object({ confirm: z.literal(true) }).strict());
    await db.transaction(async tx => {
      await lockSchool(tx, id, actor.user.id);
      const result = await tx.update(s.schoolInvitation).set({ closedAt: new Date() }).where(and(eq(s.schoolInvitation.id, c.req.param('invitationId')), eq(s.schoolInvitation.organizationId, id), isNull(s.schoolInvitation.closedAt))).returning();
      if (!result.length) return fail(409, 'INVITATION_UNAVAILABLE');
      await audit(tx, actor.user.id, id, 'school.invitation_revoked', result[0].id);
    });
    return c.json({ saved: true });
  });
  app.post('/invitation', async c => {
    const actor = await adult(c);
    const body = await input(c, z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) }).strict());
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'school-preview', actor.user.id, 30, 3600)) return fail(429, 'LIMIT');
    const [invitation] = await db.select().from(s.schoolInvitation).where(eq(s.schoolInvitation.tokenDigest, digest(body.token)));
    if (!invitation || invitation.closedAt || invitation.expiresAt <= new Date() || invitation.email !== actor.user.email.toLowerCase()) return fail(404, 'INVITATION_UNAVAILABLE');
    const workspace = await school(db, invitation.organizationId, invitation.createdBy);
    return c.json({ name: workspace.name, role: invitation.role, expiresAt: invitation.expiresAt });
  });
  app.post('/accept', async c => {
    const actor = await adult(c, true);
    const body = await input(c, z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/), confirm: z.literal(true) }).strict());
    if (!await budget(db, config.BETTER_AUTH_SECRET, 'school-accept', actor.user.id, 15, 3600)) return fail(429, 'LIMIT');
    const [candidate] = await db.select().from(s.schoolInvitation).where(eq(s.schoolInvitation.tokenDigest, digest(body.token)));
    if (!candidate) return fail(404, 'INVITATION_UNAVAILABLE');
    await db.transaction(async tx => {
      await tx.select().from(s.organization).where(and(eq(s.organization.id, candidate.organizationId), eq(s.organization.kind, 'school'))).for('update');
      const [invitation] = await tx.select().from(s.schoolInvitation).where(eq(s.schoolInvitation.id, candidate.id)).for('update');
      if (!invitation || invitation.closedAt || invitation.expiresAt <= new Date() || invitation.email !== actor.user.email.toLowerCase()) return fail(404, 'INVITATION_UNAVAILABLE');
      // Removing/demoting the inviter also invalidates any outstanding invitations.
      await school(tx, invitation.organizationId, invitation.createdBy);
      const [existing] = await tx.select().from(s.organizationMember).where(and(eq(s.organizationMember.organizationId, invitation.organizationId), eq(s.organizationMember.userId, actor.user.id)));
      if (existing) return fail(409, 'ALREADY_MEMBER');
      const [total] = await tx.select({ total: count() }).from(s.organizationMember).where(eq(s.organizationMember.organizationId, invitation.organizationId));
      if (total.total >= 250) return fail(409, 'STAFF_LIMIT');
      await tx.insert(s.organizationMember).values({ organizationId: invitation.organizationId, userId: actor.user.id, role: invitation.role });
      await tx.update(s.schoolInvitation).set({ closedAt: new Date() }).where(eq(s.schoolInvitation.id, invitation.id));
      await audit(tx, actor.user.id, invitation.organizationId, 'school.invitation_accepted', invitation.id);
    });
    return c.json({ id: candidate.organizationId });
  });

  app.post('/:id/members/:userId', async c => {
    const actor = await adult(c, true), id = c.req.param('id'), userId = c.req.param('userId');
    const body = await input(c, z.object({ role: z.enum(['teacher', 'school_admin', 'remove']), previousRole: role, confirm: z.literal(true) }).strict());
    await db.transaction(async tx => {
      await lockSchool(tx, id, actor.user.id);
      const [member] = await tx.select().from(s.organizationMember).where(and(eq(s.organizationMember.organizationId, id), eq(s.organizationMember.userId, userId)));
      if (!member || member.role !== body.previousRole || body.role === member.role) return fail(409, 'STAFF_CONFLICT');
      if (member.role === 'school_admin') {
        const [admins] = await tx.select({ total: count() }).from(s.organizationMember).where(and(eq(s.organizationMember.organizationId, id), eq(s.organizationMember.role, 'school_admin')));
        if (admins.total <= 1) return fail(409, 'LAST_ADMIN');
      }
      if (body.role === 'remove') {
        await tx.delete(s.classroomStaff).where(and(eq(s.classroomStaff.organizationId, id), eq(s.classroomStaff.userId, userId)));
        await tx.delete(s.organizationMember).where(and(eq(s.organizationMember.organizationId, id), eq(s.organizationMember.userId, userId)));
      } else await tx.update(s.organizationMember).set({ role: body.role }).where(and(eq(s.organizationMember.organizationId, id), eq(s.organizationMember.userId, userId)));
      await tx.update(s.schoolInvitation).set({ closedAt: new Date() }).where(and(eq(s.schoolInvitation.organizationId, id), eq(s.schoolInvitation.createdBy, userId), isNull(s.schoolInvitation.closedAt)));
      await audit(tx, actor.user.id, id, body.role === 'remove' ? 'school.member_removed' : 'school.member_role_changed', userId);
    });
    return c.json({ saved: true });
  });
  app.post('/:id/classes/:classId/staff', async c => {
    const actor = await adult(c, true), id = c.req.param('id'), classId = c.req.param('classId');
    const body = await input(c, z.object({ userIds: z.array(z.string().min(1).max(100)).max(25), previous: z.array(z.string().min(1).max(100)).max(250), confirm: z.literal(true) }).strict());
    if (new Set(body.userIds).size !== body.userIds.length) return fail(400, 'INVALID_INPUT');
    await db.transaction(async tx => {
      await lockSchool(tx, id, actor.user.id);
      const [room] = await tx.select().from(s.classroom).where(and(eq(s.classroom.id, classId), eq(s.classroom.organizationId, id))).for('update');
      if (!room) return fail(404, 'NOT_FOUND');
      const staff = await tx.select().from(s.classroomStaff).where(eq(s.classroomStaff.classroomId, classId));
      if (JSON.stringify(staff.map(member => member.userId).sort()) !== JSON.stringify([...body.previous].sort())) return fail(409, 'STAFF_CONFLICT');
      const members = await tx.select().from(s.organizationMember).where(eq(s.organizationMember.organizationId, id));
      if (body.userIds.some(userId => !members.some(member => member.userId === userId && ['teacher', 'school_admin'].includes(member.role)))) return fail(400, 'INVALID_STAFF');
      await tx.delete(s.classroomStaff).where(eq(s.classroomStaff.classroomId, classId));
      if (body.userIds.length) await tx.insert(s.classroomStaff).values(body.userIds.map(userId => ({ classroomId: classId, organizationId: id, userId })));
      await audit(tx, actor.user.id, id, 'school.class_staff_changed', classId);
    });
    return c.json({ saved: true });
  });
  return app;
}
