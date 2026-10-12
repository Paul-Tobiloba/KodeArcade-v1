import { expect, test } from '@playwright/test';
import { loadEnvFile } from 'node:process';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { hashPassword } from 'better-auth/crypto';
import { eq, inArray } from 'drizzle-orm';
import { connectDatabase } from '../server/db/client';
import * as s from '../server/db/schema';
import { missions } from '../src/learning';

// Opt-in development integration. Only exact synthetic fixture IDs are removed.
test.use({ trace: 'off', video: 'off', screenshot: 'off', actionTimeout: 15000 });
test('live parent → private home cards → child learning/save → parent progress', async ({ page }) => {
  test.skip(process.env.RUN_LIVE_FAMILY_E2E !== '1', 'Explicit development opt-in only');
  test.setTimeout(240000);
  loadEnvFile('.env');
  if (process.env.NODE_ENV === 'production' || process.env.APP_ORIGIN !== 'http://127.0.0.1:5173' || !process.env.PDF_TEST_PYTHON) throw new Error('Local development and PDF reader required');
  const { db, pool } = connectDatabase(process.env.DATABASE_URL!);
  const parentId = randomUUID(), email = `${parentId}@example.test`, password = `Synthetic-${randomUUID()}`;
  const post = (path: string, data: object) => page.request.post(`/api/${path}`, { data, headers: { Origin: 'http://127.0.0.1:5173' } });
  const signIn = async () => { await page.goto('/#/adult-login?role=parent'); await page.getByLabel('Email address').fill(email); await page.getByLabel('Password', { exact: true }).fill(password); await page.getByRole('button', { name: 'Sign in', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Family portal' })).toBeVisible(); };
  const getCard = async () => {
    const downloading = page.waitForEvent('download'); await page.getByRole('link', { name: 'Download PDF card' }).click();
    const path = await (await downloading).path();
    const text = execFileSync(process.env.PDF_TEST_PYTHON!, ['-c', 'import sys; from pypdf import PdfReader; print("\\n".join(p.extract_text() for p in PdfReader(sys.argv[1]).pages))', path!], { encoding: 'utf8' });
    expect(text).toContain('/#/home-login'); expect(text).toContain('Ask your parent');
    const username = text.match(/Username\s+([a-z0-9]{1,60})/)?.[1], code = text.match(/Home code\s+([A-Z2-9]{8})/)?.[1];
    const pictures = [...text.matchAll(/[1-4]\. (Sun|Moon|Star|Flower|Fish|Bird|Tree|Apple|Rocket|Heart|Cat|Dog|Ball|Leaf|Bug|Robot)/g)].map(match => match[1]);
    const credential = text.match(/Text password \(three words, with spaces\)\s+([a-z]+ [a-z]+ [a-z]+)/)?.[1];
    if (!username || !code || (!credential && pictures.length !== 4)) throw new Error('Home card fields incomplete');
    await page.getByRole('button', { name: 'I’ve saved the card' }).click(); return { username, code, credential, pictures };
  };
  const childLogin = async (card: Awaited<ReturnType<typeof getCard>>) => {
    await page.goto('/#/home-login'); await page.getByLabel('Home code', { exact: true }).fill(card.code); await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByLabel('Student username', { exact: true }).fill(card.username);
    if (card.credential) { await page.getByRole('button', { name: /Text password/ }).click(); await page.getByLabel('Password', { exact: true }).fill(card.credential); }
    else for (const picture of card.pictures) await page.getByRole('button', { name: picture, exact: true }).click();
    await page.getByRole('button', { name: 'Start learning', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Your home adventures' })).toBeVisible();
  };
  try {
    await db.insert(s.user).values({ id: parentId, name: 'Synthetic QA Parent', email, emailVerified: true, principalKind: 'adult' });
    await db.insert(s.account).values({ id: randomUUID(), userId: parentId, accountId: parentId, providerId: 'credential', password: await hashPassword(password) });
    await signIn(); await page.getByLabel('Confirm adult password', { exact: true }).fill(password); await page.getByRole('button', { name: 'Unlock management', exact: true }).click();
    await expect(page.getByText('Management unlocked for five minutes', { exact: true })).toBeVisible();
    await page.getByLabel('Family workspace name').fill('Synthetic QA Family'); await page.getByRole('checkbox').check(); await page.getByRole('button', { name: 'Create family workspace' }).click();
    await expect(page.getByRole('heading', { name: 'Your children (0)' })).toBeVisible({ timeout: 20_000 });
    const cards: Awaited<ReturnType<typeof getCard>>[] = [];
    for (const [name, grade] of [['Synthetic Home Picture', '2'], ['Synthetic Home Text', '4']]) {
      await page.getByRole('button', { name: 'Add child', exact: true }).click(); await page.getByLabel('Child’s name').fill(name);
      await page.getByRole('combobox', { name: 'Grade', exact: true }).selectOption(grade); await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: 'Add child & generate card' }).click(); await expect(page.getByRole('link', { name: 'Download PDF card' })).toBeVisible(); cards.push(await getCard());
    }
    expect(cards[0].username).toBe('synthetic'); expect(cards[1].credential).toBeTruthy();
    expect((await post('auth/sign-out', {})).ok()).toBe(true);
    await childLogin(cards[0]); await page.locator('.account-assigned-course').click();
    await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
    await page.getByText('Keyboard helpers', { exact: true }).click();
    for (const direction of missions.find(mission => mission.id === 'grade-2-sequences-1')!.solution ?? ['right']) { await page.getByLabel('Instruction', { exact: true }).selectOption(direction); await page.getByRole('button', { name: 'Add block', exact: true }).click(); }
    await page.getByRole('button', { name: 'Run code', exact: true }).click();
    await expect.poll(async () => (await (await page.request.get('/api/student/progress/grade-2')).json()).document?.progress['grade-2-sequences-1']?.complete).toBe(true);
    await page.reload(); await expect(page.getByRole('button', { name: /Challenge 1:.*completed/ })).toBeVisible();
    await page.getByRole('link', { name: 'My courses', exact: true }).first().click(); await expect(page.getByText('Continue learning', { exact: true })).toBeVisible();
    expect((await post('auth/sign-out', {})).ok()).toBe(true); await childLogin(cards[1]);
    expect((await (await page.request.get('/api/student/courses')).json()).assignments[0].progress.completed).toBe(0);
    expect((await post('auth/sign-out', {})).ok()).toBe(true); await signIn();
    await expect(page.getByRole('button', { name: /Synthetic Home Picture Grade 2/ })).toContainText('1 / 41');
    await page.getByRole('button', { name: /Synthetic Home Picture Grade 2/ }).click();
    await expect(page.locator('.family-progress')).toContainText('1 of 41 challenges complete');
    const own = (await db.select().from(s.organizationMember).where(eq(s.organizationMember.userId, parentId)))[0];
    const report = await (await page.request.get(`/api/family/${own.organizationId}`)).json();
    expect(report.children[0].courses[0].completed).toBe(1); expect(JSON.stringify(report)).not.toContain('workspace');
  } finally {
    const memberships = await db.select().from(s.organizationMember).where(eq(s.organizationMember.userId, parentId));
    const organizationIds = memberships.map(row => row.organizationId);
    const userIds = [parentId];
    if (organizationIds.length) {
      const children = await db.select().from(s.learner).where(inArray(s.learner.organizationId, organizationIds));
      userIds.push(...children.map(child => child.authUserId));
      const rooms = await db.select().from(s.classroom).where(inArray(s.classroom.organizationId, organizationIds));
      await db.transaction(async tx => {
        await tx.delete(s.session).where(inArray(s.session.userId, userIds));
        if (children.length) { const ids = children.map(child => child.id); await tx.delete(s.guardianLink).where(inArray(s.guardianLink.learnerId, ids)); }
        if (rooms.length) { const ids = rooms.map(room => room.id); await tx.delete(s.learnerProgress).where(inArray(s.learnerProgress.classroomId, ids)); await tx.delete(s.courseAssignment).where(inArray(s.courseAssignment.classroomId, ids)); await tx.delete(s.enrollment).where(inArray(s.enrollment.classroomId, ids)); }
        await tx.delete(s.auditEvent).where(inArray(s.auditEvent.organizationId, organizationIds)); await tx.delete(s.managementOperation).where(eq(s.managementOperation.actorId, parentId));
        await tx.delete(s.learner).where(inArray(s.learner.organizationId, organizationIds)); await tx.delete(s.classroom).where(inArray(s.classroom.organizationId, organizationIds));
        await tx.delete(s.organizationMember).where(inArray(s.organizationMember.organizationId, organizationIds)); await tx.delete(s.organization).where(inArray(s.organization.id, organizationIds)); await tx.delete(s.user).where(inArray(s.user.id, userIds));
      });
    } else await db.delete(s.user).where(eq(s.user.id, parentId));
    await pool.end();
  }
});
