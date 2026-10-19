import { and, eq, or } from 'drizzle-orm';
import type { Database } from './db/client.js';
import * as s from './db/schema.js';

export type StaffDatabase = Database | Parameters<Parameters<Database['transaction']>[0]>[0];
export async function classroomAccess(db: StaffDatabase, actorId: string, classId: string) {
  const [room] = await db.select({ id: s.classroom.id, organizationId: s.classroom.organizationId, name: s.classroom.name, code: s.classroom.code, grade: s.classroom.grade, archivedAt: s.classroom.archivedAt })
    .from(s.classroom).innerJoin(s.organization, eq(s.organization.id, s.classroom.organizationId))
    .innerJoin(s.organizationMember, and(eq(s.organizationMember.organizationId, s.classroom.organizationId), eq(s.organizationMember.userId, actorId)))
    .innerJoin(s.user, eq(s.user.id, s.organizationMember.userId))
    .leftJoin(s.classroomStaff, and(eq(s.classroomStaff.organizationId, s.classroom.organizationId), eq(s.classroomStaff.classroomId, s.classroom.id), eq(s.classroomStaff.userId, actorId)))
    .where(and(eq(s.classroom.id, classId), or(
      and(eq(s.organization.kind, 'school'), eq(s.organizationMember.role, 'school_admin'), eq(s.user.twoFactorEnabled, true)),
      and(eq(s.organizationMember.role, 'teacher'), eq(s.classroomStaff.userId, actorId)),
    )));
  return room;
}
