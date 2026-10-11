import { expect, test } from '@playwright/test';

const id = '00000000-0000-4000-8000-000000000001';
test.beforeEach(async ({ page }) => {
  let archivedAt: string | null = null;
  const room = () => ({ id, name: 'Sample class', code: 'SAMPLE24', grade: 2, archivedAt });
  await page.route('**/api/capabilities', route => route.fulfill({ json: { classManagement: true } }));
  await page.route('**/api/account', route => route.fulfill({ json: { profile: { name: 'Sample Teacher', email: 'synthetic@example.test' }, workspaces: [{ id, name: 'Sample workspace', kind: 'teacher_workspace', role: 'teacher' }], classes: [room(), { id: 'archived-sample', name: 'Previous term', grade: 3, code: 'OLDSAMPLE', archivedAt: '2026-10-01T12:00:00Z' }] } }));
  await page.route('**/api/manage/management/status', route => route.fulfill({ json: { unlockedForSeconds: 300 } }));
  await page.route(`**/api/manage/classes/${id}`, route => route.fulfill({ json: { room: room(), learners: [{ id: 'sample-pupil', displayName: 'Sample Alex', username: 'samplealex', grade: 2, loginMethod: 'picture', active: true }], assignments: [{ id: 'assignment', courseKey: 'grade-2' }] } }));
  await page.route('**/api/manage/classes/*/progress?*', route => route.fulfill({ json: { course: 'grade-2', generatedAt: '2026-10-11T12:00:00Z', students: [{ learnerId: 'sample-pupil', displayName: 'Sample Alex', active: true, started: true, completed: 1, total: 50, stars: 5, drawingCompleted: 0, drawingTotal: 5, quizCompleted: 0, quizTotal: 5, quizResults: [], lastActivity: 'Sequences', updatedAt: '2026-10-11T12:00:00Z', checkIns: 0 }] } }));
  await page.route(`**/api/manage/classes/${id}/archive`, route => {
    const body = route.request().postDataJSON(); expect(body.confirm).toBe(true); expect(body.previousArchived).toBe(Boolean(archivedAt));
    archivedAt = body.archived ? new Date().toISOString() : null;
    return route.fulfill({ json: { saved: true } });
  });
});

test('active/archived filters keep records discoverable without page overflow', async ({ page }, info) => {
  await page.goto('/#/classes');
  await expect(page.getByRole('row', { name: /Sample class/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Previous term/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Archived (1)' }).click();
  await expect(page.getByRole('row', { name: /Previous term/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Sample class/ })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/class-archive-list-${info.project.name}.png`, fullPage: true });
});

test('archive requires confirmation and restore re-enables editing while reports stay readable', async ({ page }, info) => {
  await page.goto(`/#/classroom?id=${id}`);
  await page.getByText('Archive this class', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Archive class', exact: true })).toBeDisabled();
  await page.getByLabel('I understand this pauses student access.').check();
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/class-archive-confirm-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Archive class', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'This class is archived' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add student', exact: true })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Learning progress', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/class-archived-${info.project.name}.png`, fullPage: true });
  await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.screenshot({ path: `.impeccable/review/class-archived-top-${info.project.name}.png` });
  await page.getByRole('button', { name: 'Restore class', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'This class is archived' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Add student', exact: true })).toBeEnabled();
});
