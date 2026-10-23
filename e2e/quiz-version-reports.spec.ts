import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { moduleQuiz } from '../shared/quizzes';
import { reportSummary } from '../shared/reports';
import type { ProgressDocument } from '../shared/progress';
import type { Family } from '../shared/family';

const classId = '00000000-0000-4000-8000-000000000001';
const learnerId = '00000000-0000-4000-8000-000000000002';
test.beforeEach(async ({ page }) => {
  await page.route('**/api/session', route => route.fulfill({ json: null }));
});
function summary() {
  const result = (id: string) => { const answers = moduleQuiz(id).map(q => q.correct); return { version: 1 as const, answers, submittedAnswers: answers, bestAnswers: answers, attempts: 1 }; };
  const document: ProgressDocument = { version: 1, currentId: 'grade-5-loops-1', view: 'quiz', quizModuleId: 'grade-5-loops@3', quizzes: { 'grade-5-loops': result('grade-5-loops'), 'grade-5-loops@3': result('grade-5-loops@3') }, progress: {}, drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false } };
  return reportSummary('grade-5', { revision: 1, document, updatedAt: '2026-10-15T10:00:00Z' });
}
async function checkHistory(page: import('@playwright/test').Page, scope: import('@playwright/test').Locator, name: string) {
  await scope.getByText('Previous quiz results (1)', { exact: true }).click();
  const previous = scope.getByRole('table', { name: 'Previous versions · original questions and scores' });
  await expect(previous.getByRole('rowheader', { name: 'Loops · version 1', exact: true })).toBeVisible();
  await expect(previous.getByRole('cell', { name: '5 / 5', exact: true })).toHaveCount(2);
  await expect(scope.getByText('These earlier quizzes keep their original scores.', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include('.account-table-wrap').analyze()).violations).toEqual([]);
  await page.screenshot({ path: `.impeccable/review/quiz-history-${name}.png`, fullPage: true });
  await previous.locator('..').locator('..').screenshot({ path: `.impeccable/review/quiz-history-detail-${name}.png` });
}
test('teacher reports show current and previous quiz scores separately', async ({ page }, info) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: { classManagement: true } }));
  await page.route('**/api/auth/get-session', route => route.fulfill({ json: null }));
  await page.route('**/api/account', route => route.fulfill({ json: { profile: { name: 'Sample Teacher', email: 'synthetic@example.test' }, workspaces: [{ id: classId, name: 'Sample workspace', kind: 'teacher_workspace', role: 'teacher' }], classes: [{ id: classId, name: 'Sample class', grade: 5, code: 'SAMPLE24' }] } }));
  await page.route('**/api/manage/management/status', route => route.fulfill({ json: { unlockedForSeconds: 1800 } }));
  await page.route(`**/api/manage/classes/${classId}`, route => route.fulfill({ json: { room: { id: classId, name: 'Sample class', code: 'SAMPLE24', grade: 5 }, learners: [{ id: learnerId, displayName: 'Sample Alex', username: 'alex', grade: 5, active: true, loginMethod: 'text' }], assignments: [{ id: 'assignment', courseKey: 'grade-5' }] } }));
  await page.route('**/api/manage/classes/*/progress?*', route => route.fulfill({ json: { course: 'grade-5', generatedAt: '2026-10-15T10:00:00Z', students: [{ ...summary(), learnerId, displayName: 'Sample Alex', active: true }] } }));
  await page.route('**/api/manage/classes/*/progress/*?*', route => route.fulfill({ json: { challenges: [] } }));
  await page.goto(`/#/classroom?id=${classId}`);
  await page.getByRole('button', { name: 'View progress for Sample Alex' }).click();
  const scope = page.getByRole('region', { name: 'Sample Alex quiz results' });
  await expect(scope).toContainText('1 of 13 submitted');
  await checkHistory(page, scope, `teacher-${info.project.name}`);
});
test('parent reports retain previous results without inflating current quiz completion', async ({ page }, info) => {
  const family: Family = { id: classId, name: 'Sample family', generatedAt: '2026-10-15T10:00:00Z', children: [{ id: learnerId, displayName: 'Sample Alex', grade: 5, active: true, username: 'alex', homeCode: 'ABCDEFGH', loginMethod: 'text', contextId: 'synthetic-home', courses: [{ ...summary(), course: 'grade-5', challenges: [] }] }] };
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: true, homeLearning: true } }));
  await page.route('**/api/account', route => route.fulfill({ json: { profile: { name: 'Sample Parent', email: 'synthetic@example.test' }, workspaces: [{ id: classId, name: 'Sample family', kind: 'family', role: 'parent' }], classes: [] } }));
  await page.route('**/api/manage/management/status', route => route.fulfill({ json: { unlockedForSeconds: 1800 } }));
  await page.route(`**/api/family/${classId}`, route => route.fulfill({ json: family }));
  await page.goto('/#/family');
  await expect(page.getByText('1 / 13 quizzes', { exact: true })).toBeVisible();
  await page.getByText('View challenge & quiz results', { exact: true }).click();
  await checkHistory(page, page.locator('.family-course'), `parent-${info.project.name}`);
});
