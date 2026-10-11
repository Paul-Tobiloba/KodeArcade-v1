import { expect, test } from '@playwright/test';
const classId = '00000000-0000-4000-8000-000000000001';
const pupils = [{ id: '00000000-0000-4000-8000-000000000002', displayName: 'Sample Alex', username: 'samplealex', grade: 2, active: true, loginMethod: 'picture' }, { id: '00000000-0000-4000-8000-000000000003', displayName: 'Sample Sam', username: 'samplesam', grade: 4, active: true, loginMethod: 'text' }];
test.beforeEach(async ({ page }) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: { classManagement: true } }));
  await page.route('**/api/auth/get-session', route => route.fulfill({ json: null }));
  await page.route('**/api/account', route => route.fulfill({ json: { profile: { name: 'Sample Teacher', email: 'synthetic@example.test' }, workspaces: [{ id: classId, name: 'Sample workspace', kind: 'school', role: 'teacher' }], classes: [{ id: classId, name: 'Sample class', grade: 2, code: 'SAMPLE24' }] } }));
  await page.route('**/api/manage/management/status', route => route.fulfill({ json: { unlockedForSeconds: 300 } }));
  await page.route(`**/api/manage/classes/${classId}`, route => route.fulfill({ json: { room: { id: classId, name: 'Sample class', code: 'SAMPLE24', grade: 2 }, learners: pupils, assignments: [{ id: 'assignment', courseKey: 'grade-2' }] } }));
  await page.route('**/api/manage/classes/*/progress?*', route => route.fulfill({ json: { course: 'grade-2', generatedAt: new Date().toISOString(), students: [] } }));
  await page.goto(`/#/classroom?id=${classId}`);
  await expect(page.getByRole('heading', { name: 'Sample class', exact: true })).toBeVisible();
});
test('CSV preview validates before a confirmed private booklet import', async ({ page }, info) => {
  let imports = 0;
  await page.route('**/students/import', route => { imports++; return route.fulfill({ contentType: 'application/pdf', body: '%PDF-1.3 synthetic booklet' }); });
  await page.getByText('Import students from CSV', { exact: true }).click();
  await page.getByLabel('Student CSV file').setInputFiles({ name: 'bad.csv', mimeType: 'text/csv', buffer: Buffer.from('name,grade,login_method\nAlex,9,secret') });
  await expect(page.getByText('Fix the CSV before importing.')).toBeVisible(); expect(imports).toBe(0);
  await page.getByLabel('Student CSV file').setInputFiles({ name: 'students.csv', mimeType: 'text/csv', buffer: Buffer.from('name,grade,login_method\nNew Alex,2,picture\nNew Sam,4,text') });
  await expect(page.getByRole('heading', { name: 'Review 2 students' })).toBeVisible(); expect(imports).toBe(0);
  await page.getByLabel('I reviewed these students.', { exact: false }).check();
  await expect(page.locator('.account-csv-import .account-table-wrap')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: `.impeccable/review/workflows-import-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Import 2 students & generate cards' }).click();
  await expect(page.getByRole('heading', { name: 'Login card ready' })).toBeVisible(); expect(imports).toBe(1);
});
test('bulk cards require an explicit destructive reset confirmation', async ({ page }) => {
  let resets = 0;
  await page.route('**/students/reset-cards', route => { resets++; expect(route.request().postDataJSON().studentIds).toHaveLength(2); return route.fulfill({ contentType: 'application/pdf', body: '%PDF-1.3 synthetic booklet' }); });
  await page.getByLabel('Select first 50 active students').check();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Reset selected & generate cards' }).click(); expect(resets).toBe(0);
  page.once('dialog', dialog => { expect(dialog.message()).toContain('old cards will stop working'); return dialog.accept(); });
  await page.getByRole('button', { name: 'Reset selected & generate cards' }).click();
  await expect(page.getByRole('heading', { name: 'Login card ready' })).toBeVisible(); expect(resets).toBe(1);
});
test('course choices remain drafts until Save assignments', async ({ page }, info) => {
  let saves = 0;
  await page.route('**/assignments/save', route => { saves++; expect(route.request().postDataJSON()).toMatchObject({ courses: ['grade-2', 'grade-3'], previous: ['grade-2'] }); return route.fulfill({ json: { saved: true } }); });
  const section = page.locator('.account-assignment-list');
  await section.getByRole('checkbox').nth(2).check(); expect(saves).toBe(0);
  await expect(page.getByText('Unsaved assignment changes')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await section.screenshot({ path: `.impeccable/review/workflows-assignments-${info.project.name}.png` });
  await page.getByRole('button', { name: 'Save assignments', exact: true }).click();
  await expect.poll(() => saves).toBe(1);
});

test('teacher can review quiz best and latest results separately from challenge stars', async ({ page }, info) => {
  await page.route('**/api/manage/classes/*/progress?*', route => route.fulfill({ json: {
    course: 'grade-2', generatedAt: '2026-10-11T12:00:00Z',
    students: [{ ...pupils[0], learnerId: pupils[0].id, completed: 3, total: 50, stars: 14, drawingCompleted: 0, drawingTotal: 2, quizCompleted: 1, quizTotal: 5, quizResults: [{ id: 'grade-2-loops', title: 'Loops', submitted: true, best: 5, latest: 4, total: 5, attempts: 2 }], lastActivity: 'Loops quiz', updatedAt: '2026-10-11T12:00:00Z', checkIns: 0, started: true }]
  } }));
  await page.route('**/api/manage/classes/*/progress/*?*', route => route.fulfill({ json: { challenges: [] } }));
  await page.reload();
  await page.getByRole('button', { name: 'View progress for Sample Alex' }).click();
  const quiz = page.getByRole('region', { name: 'Sample Alex quiz results' });
  await expect(quiz.getByRole('cell', { name: '5 / 5', exact: true })).toBeVisible();
  await expect(quiz.getByRole('cell', { name: '4 / 5', exact: true })).toBeVisible();
  await expect(quiz.getByRole('cell', { name: '2', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: `.impeccable/review/quiz-teacher-${info.project.name}.png`, fullPage: true });
});
