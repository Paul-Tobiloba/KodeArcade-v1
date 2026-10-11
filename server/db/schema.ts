import { sql } from 'drizzle-orm';
import { boolean, check, foreignKey, integer, jsonb, pgTable, primaryKey, text, timestamp, unique } from 'drizzle-orm/pg-core';
import type { ProgressDocument } from '../../shared/progress.js';
import { user, session } from './auth-schema.js';
export * from './auth-schema.js';

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const organization = pgTable('organization', {
  id: text('id').primaryKey(), name: text('name').notNull(),
  kind: text('kind', { enum: ['family', 'school', 'teacher_workspace'] }).notNull(), createdAt: createdAt(),
}, t => [check('organization_kind', sql`${t.kind} in ('family', 'school', 'teacher_workspace')`)]);

// Roles are scoped memberships, not a global role on an auth user.
export const organizationMember = pgTable('organization_member', {
  organizationId: text('organization_id').notNull().references(() => organization.id),
  userId: text('user_id').notNull().references(() => user.id),
  role: text('role', { enum: ['parent', 'teacher', 'school_admin'] }).notNull(), createdAt: createdAt(),
}, t => [primaryKey({ columns: [t.organizationId, t.userId] }), check('organization_member_role', sql`${t.role} in ('parent', 'teacher', 'school_admin')`)]);

export const classroom = pgTable('classroom', {
  id: text('id').primaryKey(), organizationId: text('organization_id').notNull().references(() => organization.id),
  name: text('name').notNull(), code: text('code').notNull().unique(),
  grade: integer('grade').notNull(), createdAt: createdAt(),
}, t => [unique('classroom_org_id').on(t.organizationId, t.id), check('classroom_grade', sql`${t.grade} between 1 and 6`)]);

export const classroomStaff = pgTable('classroom_staff', {
  organizationId: text('organization_id').notNull(), classroomId: text('classroom_id').notNull(), userId: text('user_id').notNull(),
}, t => [
  primaryKey({ columns: [t.classroomId, t.userId] }),
  foreignKey({ columns: [t.organizationId, t.classroomId], foreignColumns: [classroom.organizationId, classroom.id] }),
  foreignKey({ columns: [t.organizationId, t.userId], foreignColumns: [organizationMember.organizationId, organizationMember.userId] }),
]);

export const learner = pgTable('learner', {
  id: text('id').primaryKey(), organizationId: text('organization_id').notNull().references(() => organization.id),
  authUserId: text('auth_user_id').notNull().unique().references(() => user.id),
  displayName: text('display_name').notNull(), grade: integer('grade').notNull(),
  loginMethod: text('login_method', { enum: ['picture', 'text'] }).notNull(),
  credentialVersion: integer('credential_version').notNull().default(1), createdAt: createdAt(),
  active: boolean('active').notNull().default(true),
}, t => [
  unique('learner_org_id').on(t.organizationId, t.id),
  check('learner_grade', sql`${t.grade} between 1 and 6`),
  check('learner_login_method', sql`${t.loginMethod} in ('picture', 'text')`),
  check('learner_credential_version', sql`${t.credentialVersion} >= 1`),
]);

export const enrollment = pgTable('enrollment', {
  organizationId: text('organization_id').notNull(), classroomId: text('classroom_id').notNull(), learnerId: text('learner_id').notNull(), createdAt: createdAt(),
}, t => [
  primaryKey({ columns: [t.classroomId, t.learnerId] }),
  foreignKey({ columns: [t.organizationId, t.classroomId], foreignColumns: [classroom.organizationId, classroom.id] }),
  foreignKey({ columns: [t.organizationId, t.learnerId], foreignColumns: [learner.organizationId, learner.id] }),
]);

// A home context is separate from class enrollment; no name-based automatic linking.
export const guardianLink = pgTable('guardian_link', {
  learnerId: text('learner_id').notNull().references(() => learner.id),
  guardianUserId: text('guardian_user_id').notNull().references(() => user.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }).notNull(),
}, t => [primaryKey({ columns: [t.learnerId, t.guardianUserId] })]);

export const courseAssignment = pgTable('course_assignment', {
  id: text('id').primaryKey(), classroomId: text('classroom_id').notNull().references(() => classroom.id),
  courseKey: text('course_key').notNull(), curriculumVersion: text('curriculum_version').notNull(),
  createdAt: createdAt(),
}, t => [unique('course_assignment_version').on(t.classroomId, t.courseKey, t.curriculumVersion)]);

// HMAC-digested keys only; future classroom wrappers must consume this before auth.api.
export const loginThrottle = pgTable('login_throttle', {
  key: text('key').primaryKey(), count: integer('count').notNull(),
  windowEndsAt: timestamp('window_ends_at', { withTimezone: true }).notNull(),
}, t => [check('login_throttle_count', sql`${t.count} >= 1`)]);

// A learner session is valid in exactly one enrolled classroom and credential version.
export const learnerSession = pgTable('learner_session', {
  sessionId: text('session_id').primaryKey().references(() => session.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').notNull(), classroomId: text('classroom_id').notNull(),
  learnerId: text('learner_id').notNull(), credentialVersion: integer('credential_version').notNull(),
}, t => [
  foreignKey({ columns: [t.organizationId, t.classroomId], foreignColumns: [classroom.organizationId, classroom.id] }),
  foreignKey({ columns: [t.organizationId, t.learnerId], foreignColumns: [learner.organizationId, learner.id] }),
  foreignKey({ columns: [t.classroomId, t.learnerId], foreignColumns: [enrollment.classroomId, enrollment.learnerId] }),
]);

export const managementOperation = pgTable('management_operation', {
  actorId: text('actor_id').notNull().references(() => user.id), key: text('key').notNull(),
  digest: text('digest').notNull(), resourceId: text('resource_id').notNull(), createdAt: createdAt(),
}, t => [primaryKey({ columns: [t.actorId, t.key] })]);

// Deliberately excludes names, passwords, picture sequences and PDF contents.
export const auditEvent = pgTable('audit_event', {
  id: text('id').primaryKey(), actorId: text('actor_id').notNull().references(() => user.id),
  organizationId: text('organization_id').notNull().references(() => organization.id),
  action: text('action').notNull(), resourceId: text('resource_id').notNull(), createdAt: createdAt(),
});

export const learnerProgress = pgTable('learner_progress', {
  classroomId: text('classroom_id').notNull(), learnerId: text('learner_id').notNull(),
  courseKey: text('course_key').notNull(), curriculumVersion: text('curriculum_version').notNull(),
  revision: integer('revision').notNull(), document: jsonb('document').$type<ProgressDocument>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [primaryKey({ columns: [t.classroomId, t.learnerId, t.courseKey, t.curriculumVersion] }),
  foreignKey({ columns: [t.classroomId, t.learnerId], foreignColumns: [enrollment.classroomId, enrollment.learnerId], name: 'progress_enrollment_fk' }).onDelete('cascade'),
  check('progress_revision', sql`${t.revision} >= 1`),
  check('progress_document_size', sql`octet_length(${t.document}::text) <= 1048576`),
]);
