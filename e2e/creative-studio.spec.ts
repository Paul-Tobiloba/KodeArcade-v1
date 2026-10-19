import { expect, test, type Page } from '@playwright/test';
import type { ProgressDocument } from '../shared/progress';
import { creativeSolutions } from '../src/creativeMissions';
import { parseConceptCode } from '../src/conceptText';
import { moduleQuiz } from '../shared/quizzes';
const identity = { learnerId: 'synthetic-creative-pupil', classroomId: 'synthetic-creative-class' };
async function fixture(page: Page, grade: number, id: string, program?: ReturnType<typeof parseConceptCode>) {
  let value: ProgressDocument = { version: 1, currentId: id, view: 'challenge', progress: {}, drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false } }, revision = 0;
  if (program) value.progress[id] = { blocks: [], complete: false, attempts: 0, hints: 0, codingMode: 'blocks', workspace: { blocks: { languageVersion: 0, blocks: [program] } } };
  await page.route('**/api/capabilities', route => route.fulfill({ json: {} }));
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  await page.route('**/api/student/courses', route => route.fulfill({ json: { ...identity, displayName: 'Sample Creative Learner', classroomName: 'Sample Class', assignments: [{ id: 'sample', courseKey: `grade-${grade}` }] } }));
  await page.route(`**/api/student/progress/grade-${grade}`, route => {
    if (route.request().method() === 'POST') { value = route.request().postDataJSON().document; return route.fulfill({ json: { revision: ++revision } }); }
    return route.fulfill({ json: { ...identity, document: value, revision, updatedAt: null } });
  });
  return () => value;
}
test('guided project combines calculation, condition, function and character-touch event', async ({ page }, info) => {
  const id = 'grade-3-creative-2', saved = await fixture(page, 3, id, creativeSolutions[id]);
  await page.goto('/#/student-play/grade-3');
  await expect(page.getByRole('region', { name: 'Creative coding stage', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await expect(page.locator('.sprite-bubble')).toHaveText('Byte: Hello!');
  await expect(page.locator('.sprite-stage')).toContainText('Triggered events: touch');
  await expect.poll(() => saved().progress[id]?.complete).toBe(true);
  await expect(page.getByLabel('Sprite state')).toContainText('x 50');
  await page.getByRole('region', { name: 'Creative coding stage', exact: true }).screenshot({ path: `.impeccable/review/creative-project-${info.project.name}.png` });
  await page.getByRole('button', { name: 'Module overview', exact: true }).click();
  await page.getByRole('button', { name: 'Start quiz', exact: true }).click();
  for (const [index, question] of moduleQuiz('grade-3-creative').entries()) await page.locator('.quiz-question').nth(index).getByRole('radio').nth(question.correct).check();
  await page.getByRole('button', { name: 'Submit quiz' }).click();
  await expect(page.getByRole('heading', { name: 'You answered 5 of 5 correctly' })).toBeVisible();
  await expect.poll(() => saved().quizzes?.['grade-3-creative']?.attempts).toBe(1);
});
test('student dashboard opens the separate free lab without changing a course achievement', async ({ page }) => {
  const saved = await fixture(page, 4, 'grade-4-sequences-1');
  await page.goto('/#/student-courses');
  await page.getByRole('link', { name: 'Open Byte Lab · Grade 4' }).click();
  await expect(page.getByRole('heading', { name: 'Byte Lab project editor', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Click Byte sprite', exact: true })).toBeEnabled({ timeout: 10000 });
  await expect.poll(() => saved().currentId).toBe('grade-4-creative-4');
  await expect.poll(() => saved().progress['grade-4-creative-4']?.workspace?.byteStudio).toBeTruthy();
  expect(saved().progress['grade-4-creative-4'].complete).toBe(false);
});
