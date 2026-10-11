import { expect, test, type APIRequestContext } from '@playwright/test';
import { loadEnvFile } from 'node:process';
import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { inArray } from 'drizzle-orm';
import { connectDatabase } from '../server/db/client';
import * as s from '../server/db/schema';

// Explicit opt-in. Private cookies and invitation tokens must never enter traces.
test.use({ trace: 'off', video: 'off', screenshot: 'off' });
test('live school invitation, assignment, removal and archive boundaries', async ({ playwright }) => {
  test.skip(process.env.RUN_LIVE_SCHOOL_E2E !== '1', 'Requires localhost development database opt-in');
  test.setTimeout(180_000);
  loadEnvFile('.env');
  if (process.env.NODE_ENV === 'production' || process.env.APP_ORIGIN !== 'http://127.0.0.1:5173') throw new Error('Development localhost only');
  const { db, pool } = connectDatabase(process.env.DATABASE_URL!);
  const users = [randomUUID(), randomUUID()], organizations: string[] = [], clients: APIRequestContext[] = [];
  const password = `Synthetic-${randomUUID()}`;
  const post = (client: APIRequestContext, path: string, data: object) => client.post(`/api/${path}`, { data, headers: { Origin: 'http://127.0.0.1:5173' } });
  try {
    for (const [index, id] of users.entries()) {
      await db.insert(s.user).values({ id, name: `Synthetic School ${index ? 'Teacher' : 'Admin'}`, email: `${id}@example.test`, emailVerified: true, principalKind: 'adult' });
      await db.insert(s.account).values({ id: randomUUID(), userId: id, accountId: id, providerId: 'credential', password: await hashPassword(password) });
      const client = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:5173' }); clients.push(client);
      expect((await post(client, 'auth/sign-in/email', { email: `${id}@example.test`, password })).status()).toBe(200);
      expect((await post(client, 'manage/management/unlock', { password })).status()).toBe(200);
    }
    const [admin, teacher] = clients;
    const personal = randomUUID(); organizations.push(personal);
    await db.insert(s.organization).values({ id: personal, name: 'Synthetic Personal Club', kind: 'teacher_workspace' });
    await db.insert(s.organizationMember).values({ organizationId: personal, userId: users[1], role: 'teacher' });
    const personalResponse = await post(teacher, 'manage/classes', { organizationId: personal, name: 'Private club', grade: 2, operationKey: randomUUID() });
    expect(personalResponse.status()).toBe(201);
    const personalClass = (await personalResponse.json()).id as string;
    const createBody = { name: 'Synthetic QA Academy', confirmAuthority: true, operationKey: randomUUID() };
    const create = await post(admin, 'schools', createBody);
    expect(create.status()).toBe(201);
    const schoolId = (await create.json()).id as string; organizations.push(schoolId);
    for (let attempt = 0; attempt < 2; attempt++) {
      const replay = await post(admin, 'schools', createBody);
      expect(replay.status()).toBe(201); expect(await replay.json()).toEqual({ id: schoolId });
    }
    const invite = await post(admin, `schools/${schoolId}/invitations`, { email: `${users[1]}@example.test`, role: 'teacher', operationKey: randomUUID() });
    expect(invite.status()).toBe(201);
    const token = new URLSearchParams(new URL((await invite.json()).url).hash.split('?')[1]).get('token');
    expect((await post(teacher, 'schools/invitation', { token })).status()).toBe(200);
    expect((await post(teacher, 'schools/accept', { token, confirm: true })).status()).toBe(200);
    expect((await post(teacher, 'schools/accept', { token, confirm: true })).status()).toBe(404);
    const schoolClassResponse = await post(admin, 'manage/classes', { organizationId: schoolId, name: 'School class', grade: 2, operationKey: randomUUID() });
    expect(schoolClassResponse.status()).toBe(201);
    const classId = (await schoolClassResponse.json()).id as string;
    expect((await teacher.get(`/api/manage/classes/${classId}`)).status()).toBe(404);
    expect((await post(admin, `schools/${schoolId}/classes/${classId}/staff`, { userIds: [users[1]], previous: [users[0]], confirm: true })).status()).toBe(200);
    expect((await teacher.get(`/api/manage/classes/${classId}`)).status()).toBe(200);
    expect((await admin.get(`/api/manage/classes/${personalClass}`)).status()).toBe(404);
    const account = await (await teacher.get('/api/account')).json();
    expect(account.workspaces.map((item: { id: string }) => item.id).sort()).toEqual([...organizations].sort());
    expect((await post(admin, `schools/${schoolId}/members/${users[1]}`, { role: 'remove', previousRole: 'teacher', confirm: true })).status()).toBe(200);
    expect((await teacher.get(`/api/manage/classes/${classId}`)).status()).toBe(404);
    expect((await teacher.get(`/api/manage/classes/${personalClass}`)).status()).toBe(200);
    expect((await admin.get(`/api/manage/classes/${classId}`)).status()).toBe(200);
    expect((await post(admin, `manage/classes/${classId}/archive`, { archived: true, previousArchived: false, confirm: true, operationKey: randomUUID() })).status()).toBe(200);
    expect((await (await admin.get(`/api/manage/classes/${classId}`)).json()).room.archivedAt).toBeTruthy();
    expect((await post(admin, `manage/classes/${classId}/archive`, { archived: false, previousArchived: true, confirm: true, operationKey: randomUUID() })).status()).toBe(200);
  } finally {
    // Exact fixture IDs only; never enumerate or remove other accounts/workspaces.
    await db.delete(s.managementOperation).where(inArray(s.managementOperation.actorId, users));
    if (organizations.length) {
      const rooms = await db.select({ id: s.classroom.id }).from(s.classroom).where(inArray(s.classroom.organizationId, organizations));
      await db.delete(s.auditEvent).where(inArray(s.auditEvent.organizationId, organizations));
      await db.delete(s.schoolInvitation).where(inArray(s.schoolInvitation.organizationId, organizations));
      if (rooms.length) await db.delete(s.courseAssignment).where(inArray(s.courseAssignment.classroomId, rooms.map(room => room.id)));
      await db.delete(s.classroomStaff).where(inArray(s.classroomStaff.organizationId, organizations));
      await db.delete(s.classroom).where(inArray(s.classroom.organizationId, organizations));
      await db.delete(s.organizationMember).where(inArray(s.organizationMember.organizationId, organizations));
      await db.delete(s.organization).where(inArray(s.organization.id, organizations));
    }
    await db.delete(s.user).where(inArray(s.user.id, users));
    for (const client of clients) await client.dispose();
    await pool.end();
  }
});
